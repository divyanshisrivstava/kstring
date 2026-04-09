ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS admission_year INTEGER,
ADD COLUMN IF NOT EXISTS course_duration_years INTEGER,
ADD COLUMN IF NOT EXISTS expected_completion_year INTEGER,
ADD COLUMN IF NOT EXISTS extended_until TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS revalidation_count INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS alumni_opt_in BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS github_url TEXT,
ADD COLUMN IF NOT EXISTS linkedin_url TEXT,
ADD COLUMN IF NOT EXISTS instagram_url TEXT,
ADD COLUMN IF NOT EXISTS whatsapp_url TEXT;

CREATE TABLE IF NOT EXISTS public.alumni_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  original_user_id UUID UNIQUE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  avatar_url TEXT,
  course TEXT,
  branch TEXT,
  admission_year INTEGER,
  batch_start INTEGER,
  batch_end INTEGER,
  github_url TEXT,
  linkedin_url TEXT,
  instagram_url TEXT,
  whatsapp_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.alumni_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Alumni visible to authenticated users" ON public.alumni_profiles;
CREATE POLICY "Alumni visible to authenticated users"
ON public.alumni_profiles
FOR SELECT
TO authenticated
USING (true);

CREATE OR REPLACE FUNCTION public.derive_admission_year_from_email(target_email TEXT)
RETURNS INTEGER
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public
AS $$
DECLARE
  year_prefix TEXT;
BEGIN
  year_prefix := substring(regexp_replace(lower(trim(target_email)), '[^0-9].*$', '') from 1 for 2);

  IF year_prefix IS NULL OR length(year_prefix) <> 2 THEN
    RETURN NULL;
  END IF;

  RETURN 2000 + year_prefix::INTEGER;
END;
$$;

CREATE OR REPLACE FUNCTION public.compute_expected_completion_year(
  admission_year INTEGER,
  duration_years INTEGER
)
RETURNS INTEGER
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public
AS $$
BEGIN
  IF admission_year IS NULL OR duration_years IS NULL THEN
    RETURN NULL;
  END IF;

  RETURN admission_year + duration_years;
END;
$$;

UPDATE public.profiles
SET admission_year = COALESCE(admission_year, public.derive_admission_year_from_email(email))
WHERE admission_year IS NULL;

UPDATE public.profiles
SET expected_completion_year = COALESCE(expected_completion_year, batch_end)
WHERE expected_completion_year IS NULL AND batch_end IS NOT NULL;

CREATE OR REPLACE FUNCTION public.archive_profile_to_alumni(target_profile public.profiles)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT COALESCE(target_profile.alumni_opt_in, false) THEN
    RETURN;
  END IF;

  INSERT INTO public.alumni_profiles (
    original_user_id,
    full_name,
    email,
    avatar_url,
    course,
    branch,
    admission_year,
    batch_start,
    batch_end,
    github_url,
    linkedin_url,
    instagram_url,
    whatsapp_url
  )
  VALUES (
    target_profile.user_id,
    target_profile.full_name,
    target_profile.email,
    target_profile.avatar_url,
    target_profile.course,
    target_profile.branch,
    target_profile.admission_year,
    target_profile.batch_start,
    target_profile.batch_end,
    target_profile.github_url,
    target_profile.linkedin_url,
    target_profile.instagram_url,
    target_profile.whatsapp_url
  )
  ON CONFLICT (original_user_id) DO UPDATE
  SET
    full_name = EXCLUDED.full_name,
    email = EXCLUDED.email,
    avatar_url = EXCLUDED.avatar_url,
    course = EXCLUDED.course,
    branch = EXCLUDED.branch,
    admission_year = EXCLUDED.admission_year,
    batch_start = EXCLUDED.batch_start,
    batch_end = EXCLUDED.batch_end,
    github_url = EXCLUDED.github_url,
    linkedin_url = EXCLUDED.linkedin_url,
    instagram_url = EXCLUDED.instagram_url,
    whatsapp_url = EXCLUDED.whatsapp_url;
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
  base_year INTEGER;
BEGIN
  IF auth.uid() IS NULL OR auth.uid() <> target_user_id THEN
    RAISE EXCEPTION 'Not authorized to revalidate this profile';
  END IF;

  SELECT GREATEST(
    COALESCE(expected_completion_year, EXTRACT(YEAR FROM now())::INTEGER),
    COALESCE(EXTRACT(YEAR FROM extended_until)::INTEGER, 0),
    EXTRACT(YEAR FROM now())::INTEGER
  )
  INTO base_year
  FROM public.profiles
  WHERE user_id = target_user_id;

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
    extended_until = make_timestamptz(base_year + 1, 12, 31, 23, 59, 59, 'UTC'),
    revalidation_count = COALESCE(revalidation_count, 0) + 1,
    revalidation_method = COALESCE(method, 'google'),
    updated_at = now()
  WHERE user_id = target_user_id
  RETURNING * INTO updated_profile;

  RETURN updated_profile;
END;
$$;

CREATE OR REPLACE FUNCTION public.process_profile_lifecycle()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  profile_to_delete public.profiles;
BEGIN
  UPDATE public.profiles
  SET
    lifecycle_status = 'revalidation_required',
    revalidation_grace_until = COALESCE(revalidation_grace_until, now() + interval '28 days'),
    updated_at = now()
  WHERE lifecycle_status = 'active'
    AND (
      (extended_until IS NOT NULL AND extended_until <= now())
      OR (
        extended_until IS NULL
        AND expected_completion_year IS NOT NULL
        AND make_timestamptz(expected_completion_year, 12, 31, 23, 59, 59, 'UTC') <= now()
      )
    );

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
    permanently_delete_after = COALESCE(permanently_delete_after, now() + interval '28 days'),
    updated_at = now()
  WHERE lifecycle_status = 'restricted'
    AND email_bounce_status <> 'hard'
    AND restricted_at IS NOT NULL
    AND restricted_at <= now() - interval '28 days';

  INSERT INTO public.lifecycle_email_jobs (user_id, email, job_type, scheduled_for)
  SELECT p.user_id, p.email, 'deletion_warning', now()
  FROM public.profiles p
  WHERE p.lifecycle_status = 'scheduled_for_deletion'
    AND p.email_bounce_status <> 'hard'
  ON CONFLICT (user_id, job_type, status)
  WHERE status = 'pending'
  DO NOTHING;

  FOR profile_to_delete IN
    SELECT *
    FROM public.profiles
    WHERE lifecycle_status = 'scheduled_for_deletion'
      AND permanently_delete_after IS NOT NULL
      AND permanently_delete_after <= now()
  LOOP
    PERFORM public.archive_profile_to_alumni(profile_to_delete);
    DELETE FROM auth.users WHERE id = profile_to_delete.user_id;
  END LOOP;
END;
$$;
