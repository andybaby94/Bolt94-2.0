import { supabase, parseIncidentTypes, type IncidentWithStudents } from '@/lib/supabase';

const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

export const FAMILY_GUIDANCE_BASE =
  '학교에서는 학생이 자신의 행동을 돌아보고 바람직한 학교생활을 할 수 있도록 지도하였습니다. 가정에서도 이번 일을 계기로 자녀와 함께 상황을 돌아보고, 비슷한 상황에서 적절하게 행동할 수 있는 방법에 대해 이야기해 주시기 바랍니다.';

export const FAMILY_GUIDANCE_BY_TYPE: Record<string, string> = {
  '수업·학습 방해':
    '특히 수업 시간의 올바른 참여 태도와 다른 친구의 학습을 존중하는 태도에 대해 가정에서도 함께 이야기해 주시기 바랍니다.',
  '신체적 행동':
    '신체적 행동 대신 자신의 감정을 말로 표현하고, 갈등 상황에서 적절한 방법으로 해결하거나 필요할 경우 교사에게 도움을 요청하도록 지도해 주시기 바랍니다.',
  '언어적 행동':
    '상대방의 마음을 생각하고 존중하는 언어를 사용하도록 가정에서도 함께 지도해 주시기 바랍니다.',
  '규칙·질서 위반':
    '학교생활에서 지켜야 할 기본적인 규칙과 공동체의 질서를 준수하는 태도를 가정에서도 함께 이야기해 주시기 바랍니다.',
  '기타': '',
};

export type ActorCounts = Record<string, { weekly: number; monthly: number }>;

export const TEACHER_NAME_KEY = 'teacherName';

export function getKstDateBoundaries() {
  const nowKst = new Date(Date.now() + KST_OFFSET_MS);
  const dayOfWeek = nowKst.getUTCDay();
  const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const mondayKst = new Date(nowKst);
  mondayKst.setUTCDate(nowKst.getUTCDate() - mondayOffset);
  mondayKst.setUTCHours(0, 0, 0, 0);
  const weekStartEpoch = mondayKst.getTime() - KST_OFFSET_MS;
  const monthStartKst = new Date(Date.UTC(nowKst.getUTCFullYear(), nowKst.getUTCMonth(), 1));
  const monthStartEpoch = monthStartKst.getTime() - KST_OFFSET_MS;
  return { weekStartEpoch, monthStartEpoch };
}

export function formatKoreanDateKST(): string {
  const kst = new Date(Date.now() + KST_OFFSET_MS);
  return `${kst.getUTCFullYear()}년 ${kst.getUTCMonth() + 1}월 ${kst.getUTCDate()}일`;
}

export function getTypeAdditions(incident: IncidentWithStudents): string[] {
  return parseIncidentTypes(incident.incident_type)
    .map((t) => FAMILY_GUIDANCE_BY_TYPE[t])
    .filter(Boolean);
}

export async function fetchActorCountsForStudent(
  studentId: string,
): Promise<{ weekly: number; monthly: number }> {
  const { weekStartEpoch, monthStartEpoch } = getKstDateBoundaries();
  const { data: actorIncidents } = await supabase
    .from('incident_students')
    .select('incident:incidents(occurred_at)')
    .eq('student_id', studentId)
    .eq('role', 'actor');
  const items = (actorIncidents ?? []) as unknown as {
    incident: { occurred_at: string };
  }[];
  let weekly = 0;
  let monthly = 0;
  for (const item of items) {
    if (!item.incident) continue;
    const epoch = new Date(item.incident.occurred_at).getTime();
    if (epoch >= weekStartEpoch) weekly++;
    if (epoch >= monthStartEpoch) monthly++;
  }
  return { weekly, monthly };
}

export function getTeacherName(): string {
  return localStorage.getItem(TEACHER_NAME_KEY) ?? '';
}
