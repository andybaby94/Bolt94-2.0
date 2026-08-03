/*
  목적:
  - public.students 테이블의 공개 RLS 정책을 제거하고
  - authenticated 사용자만 자신의 user_id 소유 학생 데이터에 접근하도록 전환
  - 기존 데이터는 그대로 유지하고, legacy NULL user_id row는 이번 단계에서 임의로 채우지 않음
*/

ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

-- 기존 공개 students 정책 제거
DROP POLICY IF EXISTS "anon_select_students" ON public.students;
DROP POLICY IF EXISTS "anon_insert_students" ON public.students;
DROP POLICY IF EXISTS "anon_update_students" ON public.students;
DROP POLICY IF EXISTS "anon_delete_students" ON public.students;

-- authenticated 전용 SELECT
CREATE POLICY "students_auth_select_own"
  ON public.students
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- authenticated 전용 INSERT
CREATE POLICY "students_auth_insert_own"
  ON public.students
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- authenticated 전용 UPDATE
CREATE POLICY "students_auth_update_own"
  ON public.students
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- authenticated 전용 DELETE
CREATE POLICY "students_auth_delete_own"
  ON public.students
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
