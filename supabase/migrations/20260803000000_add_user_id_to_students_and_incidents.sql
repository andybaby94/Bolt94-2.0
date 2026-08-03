/*
  목적:
  - Supabase Auth의 사용자 식별자와 연결할 수 있도록
    students.user_id, incidents.user_id 컬럼을 NULL 허용 형태로 추가
  - 기존 1.0 데이터와 CRUD 로직을 유지
  - 기존 RLS 정책을 변경하지 않음
  - 기존 데이터 삭제/수정/재작성 없음

  주의:
  - 이 단계에서는 RLS 조건을 auth.uid() = user_id 형태로 변경하지 않음
  - 실제 기존 데이터는 그대로 보존
  - existing row가 있어도 migration이 실패하지 않도록 IF NOT EXISTS 사용
*/

ALTER TABLE public.students
  ADD COLUMN IF NOT EXISTS user_id uuid;

ALTER TABLE public.incidents
  ADD COLUMN IF NOT EXISTS user_id uuid;
