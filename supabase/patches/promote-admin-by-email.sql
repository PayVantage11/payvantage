-- Promote a user to platform admin (Supabase SQL Editor). Safe to re-run.
-- Change the email literal if you need a different account.

UPDATE public.profiles
SET
  role = 'admin',
  approved = true,
  onboarded = true
WHERE lower(trim(email)) = lower(trim('hwayner@vantagecapitalinsights.com'));

-- Optional: confirm the row
-- SELECT id, email, role, approved, onboarded
-- FROM public.profiles
-- WHERE lower(trim(email)) = lower(trim('hwayner@vantagecapitalinsights.com'));
