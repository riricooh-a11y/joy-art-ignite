-- 1. Remove the overly permissive public SELECT policy on certificates
DROP POLICY IF EXISTS "Anyone can verify certificates" ON public.certificates;

-- 2. Create a SECURITY DEFINER function for public certificate verification by code
CREATE OR REPLACE FUNCTION public.verify_certificate(_code text)
RETURNS TABLE (
  recipient_name text,
  document_number text,
  course_name text,
  institution text,
  duration text,
  start_date text,
  end_date text,
  issue_date text,
  certificate_number text,
  verification_code text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    recipient_name,
    document_number,
    course_name,
    institution,
    duration,
    start_date,
    end_date,
    issue_date,
    certificate_number,
    verification_code
  FROM public.certificates
  WHERE verification_code = _code
  LIMIT 1;
$$;

-- Allow anonymous + authenticated users to call verify_certificate
REVOKE ALL ON FUNCTION public.verify_certificate(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.verify_certificate(text) TO anon, authenticated;

-- 3. Lock down internal helper functions so they cannot be called via PostgREST
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
