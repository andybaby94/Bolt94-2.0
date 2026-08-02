/*
# 학년도 초기화 함수

1. 새 함수
- `reset_school_year()`: 현재 학년도의 모든 학생·사건 데이터를 안전한 순서로 삭제.
- 반환값: 삭제된 행 수 요약 JSON.

2. 설명
- 이 함수는 단일 PL/pgSQL 블록 내에서 실행되어 원자적 처리를 보장합니다.
- 삭제 순서: incident_students → incidents → students.
- FK는 모두 ON DELETE CASCADE 이지만, 조인 테이블을 먼저 비워 명시적으로 안전을 보장합니다.
- 기존 스키마(테이블, 컬럼, RLS 정책)는 변경하지 않습니다.

3. 보안
- 함수는 `SECURITY DEFINER` 로 실행되어 RLS 우회 없이(정책이 이미 anon/authenticated 에게 DELETE 를 허용하므로) 안전하게 삭제합니다.
- 실행 권한을 anon, authenticated 역할에 부여하여 기존 no-auth 정책과 일치시킵니다.
- 함수는 데이터를 삭제만 하며 새로운 데이터를 만들지 않습니다.
*/

CREATE OR REPLACE FUNCTION reset_school_year()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
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

GRANT EXECUTE ON FUNCTION reset_school_year() TO anon, authenticated;
