/*
# Final user-scoped RLS consolidation

## Purpose
- Consolidate the three prior user-scoping migrations (20260803000000,
  20260803010000, 20260803011000) into a single idempotent final state.
- Remove ALL legacy anon_* and students_auth_* policies from students,
  incidents, and incident_students so no duplicate policies remain.
- Set students.user_id and incidents.user_id to NOT NULL with a DEFAULT
  of auth.uid() so authenticated inserts that omit user_id still satisfy
  the WITH CHECK (auth.uid() = user_id) RLS predicate.
- Add FK constraints from students.user_id / incidents.user_id to
  auth.users(id) with ON DELETE NO ACTION (auth user deletion will not
  cascade-delete student/incident rows).

## Tables modified
- public.students
  - user_id: SET NOT NULL, DEFAULT auth.uid()
  - FK students_user_id_fk -> auth.users(id) ON DELETE NO ACTION
- public.incidents
  - user_id: SET NOT NULL, DEFAULT auth.uid()
  - FK incidents_user_id_fk -> auth.users(id) ON DELETE NO ACTION
- public.incident_students
  - No column changes; access scoped through parent tables.

## Security (RLS)
- RLS stays enabled on all three tables.
- All anon_* policies dropped from all three tables.
- Any students_auth_* policies dropped from students.
- Final policies (TO authenticated only):
  students:        user_select_students, user_insert_students,
                   user_update_students, user_delete_students
  incidents:       user_select_incidents, user_insert_incidents,
                   user_update_incidents, user_delete_incidents
  incident_students: user_select_incident_students,
                     user_insert_incident_students,
                     user_update_incident_students,
                     user_delete_incident_students
- incident_students policies verify BOTH parent rows (incident + student)
  belong to auth.uid().

## Data safety
- No UPDATE or DELETE of existing rows.
- No data creation.
- Tables are currently empty (verified 0 rows each).
*/

-- 1) Ensure user_id columns exist (idempotent)
ALTER TABLE public.students
  ADD COLUMN IF NOT EXISTS user_id uuid;

ALTER TABLE public.incidents
  ADD COLUMN IF NOT EXISTS user_id uuid;

-- 2) Set NOT NULL with DEFAULT auth.uid() so inserts omitting user_id succeed
ALTER TABLE public.students
  ALTER COLUMN user_id SET DEFAULT auth.uid();

ALTER TABLE public.incidents
  ALTER COLUMN user_id SET DEFAULT auth.uid();

ALTER TABLE public.students
  ALTER COLUMN user_id SET NOT NULL;

ALTER TABLE public.incidents
  ALTER COLUMN user_id SET NOT NULL;

-- 3) Add FK to auth.users(id) if not already present (idempotent via DO block)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'students_user_id_fk'
      AND conrelid = 'public.students'::regclass
  ) THEN
    ALTER TABLE public.students
      ADD CONSTRAINT students_user_id_fk
      FOREIGN KEY (user_id)
      REFERENCES auth.users(id)
      ON DELETE NO ACTION;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'incidents_user_id_fk'
      AND conrelid = 'public.incidents'::regclass
  ) THEN
    ALTER TABLE public.incidents
      ADD CONSTRAINT incidents_user_id_fk
      FOREIGN KEY (user_id)
      REFERENCES auth.users(id)
      ON DELETE NO ACTION;
  END IF;
END $$;

-- 4) Ensure RLS enabled
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incident_students ENABLE ROW LEVEL SECURITY;

-- 5) Drop ALL legacy policies (anon_* and students_auth_*) from all tables

-- students: anon_*
DROP POLICY IF EXISTS "anon_select_students" ON public.students;
DROP POLICY IF EXISTS "anon_insert_students" ON public.students;
DROP POLICY IF EXISTS "anon_update_students" ON public.students;
DROP POLICY IF EXISTS "anon_delete_students" ON public.students;

-- students: students_auth_* (from migration 20260803010000)
DROP POLICY IF EXISTS "students_auth_select_own" ON public.students;
DROP POLICY IF EXISTS "students_auth_insert_own" ON public.students;
DROP POLICY IF EXISTS "students_auth_update_own" ON public.students;
DROP POLICY IF EXISTS "students_auth_delete_own" ON public.students;

-- students: user_* (from migration 20260803011000, if applied)
DROP POLICY IF EXISTS "user_select_students" ON public.students;
DROP POLICY IF EXISTS "user_insert_students" ON public.students;
DROP POLICY IF EXISTS "user_update_students" ON public.students;
DROP POLICY IF EXISTS "user_delete_students" ON public.students;

-- incidents: anon_*
DROP POLICY IF EXISTS "anon_select_incidents" ON public.incidents;
DROP POLICY IF EXISTS "anon_insert_incidents" ON public.incidents;
DROP POLICY IF EXISTS "anon_update_incidents" ON public.incidents;
DROP POLICY IF EXISTS "anon_delete_incidents" ON public.incidents;

-- incidents: user_* (from migration 20260803011000, if applied)
DROP POLICY IF EXISTS "user_select_incidents" ON public.incidents;
DROP POLICY IF EXISTS "user_insert_incidents" ON public.incidents;
DROP POLICY IF EXISTS "user_update_incidents" ON public.incidents;
DROP POLICY IF EXISTS "user_delete_incidents" ON public.incidents;

-- incident_students: anon_*
DROP POLICY IF EXISTS "anon_select_incident_students" ON public.incident_students;
DROP POLICY IF EXISTS "anon_insert_incident_students" ON public.incident_students;
DROP POLICY IF EXISTS "anon_update_incident_students" ON public.incident_students;
DROP POLICY IF EXISTS "anon_delete_incident_students" ON public.incident_students;

-- incident_students: user_* (from migration 20260803011000, if applied)
DROP POLICY IF EXISTS "user_select_incident_students" ON public.incident_students;
DROP POLICY IF EXISTS "user_insert_incident_students" ON public.incident_students;
DROP POLICY IF EXISTS "user_update_incident_students" ON public.incident_students;
DROP POLICY IF EXISTS "user_delete_incident_students" ON public.incident_students;

-- 6) Create final policies: students (TO authenticated, auth.uid() = user_id)

CREATE POLICY "user_select_students"
  ON public.students
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "user_insert_students"
  ON public.students
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_update_students"
  ON public.students
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_delete_students"
  ON public.students
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- 7) Create final policies: incidents (TO authenticated, auth.uid() = user_id)

CREATE POLICY "user_select_incidents"
  ON public.incidents
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "user_insert_incidents"
  ON public.incidents
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_update_incidents"
  ON public.incidents
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_delete_incidents"
  ON public.incidents
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- 8) Create final policies: incident_students
--    Both parent incident and parent student must belong to auth.uid()

CREATE POLICY "user_select_incident_students"
  ON public.incident_students
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.incidents i
      WHERE i.id = incident_students.incident_id
        AND i.user_id = auth.uid()
    )
    AND EXISTS (
      SELECT 1 FROM public.students s
      WHERE s.id = incident_students.student_id
        AND s.user_id = auth.uid()
    )
  );

CREATE POLICY "user_insert_incident_students"
  ON public.incident_students
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.incidents i
      WHERE i.id = incident_id
        AND i.user_id = auth.uid()
    )
    AND EXISTS (
      SELECT 1 FROM public.students s
      WHERE s.id = student_id
        AND s.user_id = auth.uid()
    )
  );

CREATE POLICY "user_update_incident_students"
  ON public.incident_students
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.incidents i
      WHERE i.id = incident_students.incident_id
        AND i.user_id = auth.uid()
    )
    AND EXISTS (
      SELECT 1 FROM public.students s
      WHERE s.id = incident_students.student_id
        AND s.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.incidents i
      WHERE i.id = incident_id
        AND i.user_id = auth.uid()
    )
    AND EXISTS (
      SELECT 1 FROM public.students s
      WHERE s.id = student_id
        AND s.user_id = auth.uid()
    )
  );

CREATE POLICY "user_delete_incident_students"
  ON public.incident_students
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.incidents i
      WHERE i.id = incident_students.incident_id
        AND i.user_id = auth.uid()
    )
    AND EXISTS (
      SELECT 1 FROM public.students s
      WHERE s.id = incident_students.student_id
        AND s.user_id = auth.uid()
    )
  );
