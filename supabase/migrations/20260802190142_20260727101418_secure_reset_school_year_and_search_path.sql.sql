REVOKE EXECUTE ON FUNCTION public.reset_school_year() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.reset_school_year() FROM anon;
REVOKE EXECUTE ON FUNCTION public.reset_school_year() FROM authenticated;

CREATE OR REPLACE FUNCTION public.reset_school_year()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deleted_incident_students int := 0;
  deleted_incidents int := 0;
  deleted_students int := 0;
BEGIN
  DELETE FROM incident_students;
  GET DIAGNOSTICS deleted_incident_students = ROW_COUNT;

  DELETE FROM incidents;
  GET DIAGNOSTICS deleted_incidents = ROW_COUNT;

  DELETE FROM students;
  GET DIAGNOSTICS deleted_students = ROW_COUNT;

  RETURN jsonb_build_object(
    'incident_students', deleted_incident_students,
    'incidents', deleted_incidents,
    'students', deleted_students
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;