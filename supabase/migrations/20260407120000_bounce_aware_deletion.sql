ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS email_bounce_status TEXT NOT NULL DEFAULT 'none',
ADD COLUMN IF NOT EXISTS last_email_sent_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS last_email_bounce_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS deletion_scheduled_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS permanently_delete_after TIMESTAMP WITH TIME ZONE;

ALTER TABLE public.profiles
DROP CONSTRAINT IF EXISTS profiles_email_bounce_status_check;

ALTER TABLE public.profiles
ADD CONSTRAINT profiles_email_bounce_status_check
CHECK (email_bounce_status IN ('none', 'soft', 'hard'));

ALTER TABLE public.profiles
DROP CONSTRAINT IF EXISTS profiles_lifecycle_status_check;

ALTER TABLE public.profiles
ADD CONSTRAINT profiles_lifecycle_status_check
CHECK (lifecycle_status IN ('active', 'revalidation_required', 'restricted', 'scheduled_for_deletion'));

UPDATE public.profiles
SET lifecycle_status = 'scheduled_for_deletion'
WHERE lifecycle_status = 'deletion_review';

CREATE TABLE IF NOT EXISTS public.lifecycle_email_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  job_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  sent_at TIMESTAMP WITH TIME ZONE,
  failed_at TIMESTAMP WITH TIME ZONE,
  provider_message_id TEXT,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.lifecycle_email_jobs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own lifecycle email jobs" ON public.lifecycle_email_jobs;
CREATE POLICY "Users can view own lifecycle email jobs"
ON public.lifecycle_email_jobs
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_lifecycle_email_jobs_status_scheduled
ON public.lifecycle_email_jobs(status, scheduled_for);

CREATE UNIQUE INDEX IF NOT EXISTS idx_lifecycle_email_jobs_pending_unique
ON public.lifecycle_email_jobs(user_id, job_type, status)
WHERE status = 'pending';

CREATE TABLE IF NOT EXISTS public.email_delivery_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  event_type TEXT NOT NULL,
  bounce_status TEXT NOT NULL DEFAULT 'none',
  provider TEXT NOT NULL DEFAULT 'resend',
  provider_event_id TEXT,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.email_delivery_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "No direct access to email delivery events" ON public.email_delivery_events;
CREATE POLICY "No direct access to email delivery events"
ON public.email_delivery_events
FOR ALL
TO authenticated
USING (false)
WITH CHECK (false);

CREATE OR REPLACE FUNCTION public.queue_lifecycle_email(
  target_user_id UUID,
  target_email TEXT,
  target_job_type TEXT,
  send_after TIMESTAMP WITH TIME ZONE DEFAULT now()
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.lifecycle_email_jobs (user_id, email, job_type, scheduled_for)
  VALUES (target_user_id, target_email, target_job_type, send_after)
  ON CONFLICT (user_id, job_type, status)
  WHERE status = 'pending'
  DO NOTHING;
END;
$$;

CREATE OR REPLACE FUNCTION public.record_email_delivery_event(
  target_email TEXT,
  event_type TEXT,
  bounce_status TEXT DEFAULT 'none',
  provider TEXT DEFAULT 'resend',
  provider_event_id TEXT DEFAULT NULL,
  payload JSONB DEFAULT '{}'::jsonb
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  normalized_bounce TEXT := COALESCE(lower(bounce_status), 'none');
BEGIN
  INSERT INTO public.email_delivery_events (
    email,
    event_type,
    bounce_status,
    provider,
    provider_event_id,
    payload
  )
  VALUES (
    lower(trim(target_email)),
    event_type,
    normalized_bounce,
    provider,
    provider_event_id,
    COALESCE(payload, '{}'::jsonb)
  );

  UPDATE public.profiles
  SET
    email_bounce_status = CASE
      WHEN normalized_bounce = 'hard' THEN 'hard'
      WHEN normalized_bounce = 'soft' AND email_bounce_status <> 'hard' THEN 'soft'
      WHEN normalized_bounce = 'none' THEN 'none'
      ELSE email_bounce_status
    END,
    last_email_bounce_at = CASE
      WHEN normalized_bounce IN ('hard', 'soft') THEN now()
      ELSE last_email_bounce_at
    END,
    updated_at = now()
  WHERE lower(trim(email)) = lower(trim(target_email));
END;
$$;

CREATE OR REPLACE FUNCTION public.process_profile_lifecycle()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles
  SET
    lifecycle_status = 'revalidation_required',
    revalidation_grace_until = COALESCE(revalidation_grace_until, now() + interval '30 days'),
    updated_at = now()
  WHERE lifecycle_status = 'active'
    AND account_expires_at IS NOT NULL
    AND account_expires_at <= now()
    AND last_revalidated_at < account_expires_at;

  INSERT INTO public.lifecycle_email_jobs (user_id, email, job_type, scheduled_for)
  SELECT p.user_id, p.email, 'revalidation_notice', now()
  FROM public.profiles p
  WHERE p.lifecycle_status = 'revalidation_required'
    AND p.last_email_sent_at IS NULL
  ON CONFLICT (user_id, job_type, status)
  WHERE status = 'pending'
  DO NOTHING;

  UPDATE public.profiles
  SET
    lifecycle_status = 'restricted',
    restricted_at = COALESCE(restricted_at, now()),
    updated_at = now()
  WHERE lifecycle_status = 'revalidation_required'
    AND revalidation_grace_until IS NOT NULL
    AND revalidation_grace_until <= now();

  INSERT INTO public.lifecycle_email_jobs (user_id, email, job_type, scheduled_for)
  SELECT p.user_id, p.email, 'restriction_notice', now()
  FROM public.profiles p
  WHERE p.lifecycle_status = 'restricted'
    AND p.restricted_at IS NOT NULL
  ON CONFLICT (user_id, job_type, status)
  WHERE status = 'pending'
  DO NOTHING;

  UPDATE public.profiles
  SET
    lifecycle_status = 'scheduled_for_deletion',
    deletion_scheduled_at = COALESCE(deletion_scheduled_at, now()),
    permanently_delete_after = COALESCE(permanently_delete_after, now() + interval '1 day'),
    updated_at = now()
  WHERE lifecycle_status = 'restricted'
    AND email_bounce_status = 'hard';

  UPDATE public.profiles
  SET
    lifecycle_status = 'scheduled_for_deletion',
    deletion_scheduled_at = COALESCE(deletion_scheduled_at, now()),
    permanently_delete_after = COALESCE(permanently_delete_after, now() + interval '3 days'),
    updated_at = now()
  WHERE lifecycle_status = 'restricted'
    AND email_bounce_status <> 'hard'
    AND restricted_at IS NOT NULL
    AND restricted_at <= now() - interval '7 days';

  INSERT INTO public.lifecycle_email_jobs (user_id, email, job_type, scheduled_for)
  SELECT p.user_id, p.email, 'deletion_warning', now()
  FROM public.profiles p
  WHERE p.lifecycle_status = 'scheduled_for_deletion'
    AND p.email_bounce_status <> 'hard'
  ON CONFLICT (user_id, job_type, status)
  WHERE status = 'pending'
  DO NOTHING;

  DELETE FROM auth.users
  WHERE id IN (
    SELECT user_id
    FROM public.profiles
    WHERE lifecycle_status = 'scheduled_for_deletion'
      AND permanently_delete_after IS NOT NULL
      AND permanently_delete_after <= now()
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.mark_profile_revalidated(target_user_id UUID, method TEXT DEFAULT 'google')
RETURNS public.profiles
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  updated_profile public.profiles;
BEGIN
  IF auth.uid() IS NULL OR auth.uid() <> target_user_id THEN
    RAISE EXCEPTION 'Not authorized to revalidate this profile';
  END IF;

  UPDATE public.profiles
  SET
    lifecycle_status = 'active',
    last_revalidated_at = now(),
    revalidation_grace_until = NULL,
    restricted_at = NULL,
    deletion_scheduled_at = NULL,
    permanently_delete_after = NULL,
    email_bounce_status = 'none',
    last_email_bounce_at = NULL,
    revalidation_method = COALESCE(method, 'google'),
    updated_at = now()
  WHERE user_id = target_user_id
  RETURNING * INTO updated_profile;

  RETURN updated_profile;
END;
$$;
