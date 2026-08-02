/*
# reset_school_year 보안 강화 및 search_path 경고 해결

1. 변경 사항 요약
- `public.reset_school_year()`: 실행 권한을 `anon`/`authenticated`에서 회수하고 서비스 역할(service role)만 실행할 수 있도록 제한.
- `public.reset_school_year()` 및 `public.update_updated_at()`에 명시적 `search_path` 설정을 추가하여 mutable search_path 보안 경고 해결.
- 함수의 실제 동작(삭제 순서, 대상 테이블, 반환값)은 변경하지 않음.
- 기존 테이블 RLS 정책, 스키마, 데이터는 전혀 변경하지 않음.

2. 보안
- 일반 `anon`/`authenticated` 역할이 REST/RPC로 임의 실행할 수 있던 문제를 제거.
- 이후 학년도 초기화는 서비스 역열 키를 사용하는 경로(Edge Function)를 통해서만 실행 가능.
- `SECURITY DEFINER` 유지하되 `search_path = public` 명시로 스키마 공격 표면 축소.

3. 중요 사항
- 함수 본문(DELETE 순서, GET DIAGNOSTICS, 반환 JSON 형태)은 기존과 동일.
- `update_updated_at()` 트리거 함수도 `search_path = public`만 추가하고 본문 변경 없음.
*/

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
