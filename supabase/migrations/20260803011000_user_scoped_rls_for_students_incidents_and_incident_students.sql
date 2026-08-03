/*
  목적:
  - public.students / public.incidents / public.incident_students 를
    authenticated 사용자 전용, auth.uid() 기준의 사용자별 데이터 격리 구조로 전환
  - incident_students 는 별도 user_id 컬럼을 추가하지 않고,
    부모 테이블 students / incidents 의 user_id를 기준으로 접근을 검증
  - 현재 데이터는 0건이므로 기존 데이터 보정은 수행하지 않음
*/

BEGIN;

-- 1) students / incidents 의 owner FK를 auth.users(id)로 고정
ALTER TABLE public.students
  ALTER COLUMN user_id SET NOT NULL;

ALTER TABLE public.incidents
  ALTER COLUMN user_id SET NOT NULL;

ALTER TABLE public.students
  ADD CONSTRAINT students_user_id_fk
  FOREIGN KEY (user_id)
  REFERENCES auth.users(id)
  ON DELETE RESTRICT;

ALTER TABLE public.incidents
  ADD CONSTRAINT incidents_user_id_fk
  FOREIGN KEY (user_id)
  REFERENCES auth.users(id)
  ON DELETE RESTRICT;

-- 2) 기존 공개 students/incidents/incident_students 정책 제거
DROP POLICY IF EXISTS "anon_select_students" ON public.students;
DROP POLICY IF EXISTS "anon_insert_students" ON public.students;
DROP POLICY IF EXISTS "anon_update_students" ON public.students;
DROP POLICY IF EXISTS "anon_delete_students" ON public.students;

DROP POLICY IF EXISTS "anon_select_incidents" ON public.incidents;
DROP POLICY IF EXISTS "anon_insert_incidents" ON public.incidents;
DROP POLICY IF EXISTS "anon_update_incidents" ON public.incidents;
DROP POLICY IF EXISTS "anon_delete_incidents" ON public.incidents;

DROP POLICY IF EXISTS "anon_select_incident_students" ON public.incident_students;
DROP POLICY IF EXISTS "anon_insert_incident_students" ON public.incident_students;
DROP POLICY IF EXISTS "anon_update_incident_students" ON public.incident_students;
DROP POLICY IF EXISTS "anon_delete_incident_students" ON public.incident_students;

-- 3) students: authenticated 전용 사용자별 접근 정책
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

-- 4) incidents: authenticated 전용 사용자별 접근 정책
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

-- 5) incident_students: 부모 테이블의 user_id 기준으로 연결된 행만 허용
CREATE POLICY "user_select_incident_students"
  ON public.incident_students
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.incidents i
      WHERE i.id = incident_students.incident_id
        AND i.user_id = auth.uid()
    )
    AND EXISTS (
      SELECT 1
      FROM public.students s
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
      SELECT 1
      FROM public.incidents i
      WHERE i.id = incident_id
        AND i.user_id = auth.uid()
    )
    AND EXISTS (
      SELECT 1
      FROM public.students s
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
      SELECT 1
      FROM public.incidents i
      WHERE i.id = incident_students.incident_id
        AND i.user_id = auth.uid()
    )
    AND EXISTS (
      SELECT 1
      FROM public.students s
      WHERE s.id = incident_students.student_id
        AND s.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.incidents i
      WHERE i.id = incident_id
        AND i.user_id = auth.uid()
    )
    AND EXISTS (
      SELECT 1
      FROM public.students s
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
      SELECT 1
      FROM public.incidents i
      WHERE i.id = incident_students.incident_id
        AND i.user_id = auth.uid()
    )
    AND EXISTS (
      SELECT 1
      FROM public.students s
      WHERE s.id = incident_students.student_id
        AND s.user_id = auth.uid()
    )
  );

COMMIT;
