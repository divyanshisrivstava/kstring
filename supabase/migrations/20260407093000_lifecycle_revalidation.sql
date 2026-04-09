ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS lifecycle_status TEXT NOT NULL DEFAULT 'active',
ADD COLUMN IF NOT EXISTS last_revalidated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
ADD COLUMN IF NOT EXISTS revalidation_grace_until TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS restricted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS deletion_review_after TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS revalidation_method TEXT;

ALTER TABLE public.profiles
DROP CONSTRAINT IF EXISTS profiles_lifecycle_status_check;

ALTER TABLE public.profiles
ADD CONSTRAINT profiles_lifecycle_status_check
CHECK (lifecycle_status IN ('active', 'revalidation_required', 'restricted', 'deletion_review'));

UPDATE public.profiles
SET lifecycle_status = 'active'
WHERE lifecycle_status IS NULL OR lifecycle_status = '';

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
    deletion_review_after = NULL,
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
BEGIN
  UPDATE public.profiles
  SET
    lifecycle_status = 'revalidation_required',
    revalidation_grace_until = COALESCE(revalidation_grace_until, now() + interval '30 days'),
    deletion_review_after = COALESCE(deletion_review_after, now() + interval '60 days'),
    updated_at = now()
  WHERE lifecycle_status = 'active'
    AND account_expires_at IS NOT NULL
    AND account_expires_at <= now()
    AND last_revalidated_at < account_expires_at;

  UPDATE public.profiles
  SET
    lifecycle_status = 'restricted',
    restricted_at = COALESCE(restricted_at, now()),
    updated_at = now()
  WHERE lifecycle_status = 'revalidation_required'
    AND revalidation_grace_until IS NOT NULL
    AND revalidation_grace_until <= now();

  UPDATE public.profiles
  SET
    lifecycle_status = 'deletion_review',
    updated_at = now()
  WHERE lifecycle_status = 'restricted'
    AND deletion_review_after IS NOT NULL
    AND deletion_review_after <= now();
END;
$$;
