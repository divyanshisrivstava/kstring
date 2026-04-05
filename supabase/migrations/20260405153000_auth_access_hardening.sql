ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS privacy_accepted BOOLEAN NOT NULL DEFAULT false;

UPDATE public.profiles
SET privacy_accepted = COALESCE(terms_accepted, false)
WHERE privacy_accepted = false
  AND COALESCE(terms_accepted, false) = true;

CREATE OR REPLACE FUNCTION public.is_kiit_email(email_address TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN email_address IS NOT NULL
    AND lower(trim(email_address)) LIKE '%@kiit.ac.in';
END;
$$ LANGUAGE plpgsql IMMUTABLE SET search_path = public;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT public.is_kiit_email(NEW.email) THEN
    RAISE EXCEPTION 'Only @kiit.ac.in email addresses are allowed';
  END IF;

  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (
    NEW.id,
    lower(trim(NEW.email)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', '')
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
