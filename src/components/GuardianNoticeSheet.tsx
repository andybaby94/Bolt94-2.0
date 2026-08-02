import { ROLE_LABELS, type IncidentWithStudents } from '@/lib/supabase';
import { formatDateKST } from '@/lib/datetime';
import {
  FAMILY_GUIDANCE_BASE,
  getTypeAdditions,
  formatKoreanDateKST,
  getTeacherName,
} from '@/lib/guardianNotice';

type Props = {
  incident: IncidentWithStudents;
  targetStudentId: string;
  weeklyCount: number;
  monthlyCount: number;
};

export function GuardianNoticeSheet({
  incident,
  targetStudentId,
  weeklyCount,
  monthlyCount,
}: Props) {
  const students = incident.incident_students ?? [];
  const guardianStudents = students.filter(
    (is) => is.role === 'actor' || is.role === 'victim',
  );
  const targetStudent = students.find((is) => is.student_id === targetStudentId);
  const studentName = targetStudent?.student?.name ?? '?';
  const typeAdditions = getTypeAdditions(incident);
  const teacherName = getTeacherName();

  return (
    <div className="notice-page break-after-page rounded-xl border border-gray-200 bg-white p-8">
      <div className="mb-8 text-center">
        <h2 className="text-xl font-bold text-gray-900">학교생활 안내 통지서</h2>
        <p className="mt-1 text-sm text-gray-500">
          {studentName} 보호자님께 안내드립니다
        </p>
      </div>

      <div className="space-y-2 text-sm text-gray-800">
        <div className="flex">
          <span className="w-24 shrink-0 font-medium text-gray-500">발생 일시</span>
          <span>{formatDateKST(incident.occurred_at)}</span>
          {incident.time_period && (
            <span className="ml-2 inline-flex items-center rounded border border-gray-400 px-1.5 py-0.5 text-xs font-semibold text-gray-700">
              {incident.time_period}
            </span>
          )}
        </div>
        <div className="flex">
          <span className="w-24 shrink-0 font-medium text-gray-500">발생 장소</span>
          <span>{incident.location}</span>
        </div>
        <div className="flex">
          <span className="w-24 shrink-0 font-medium text-gray-500">사건 유형</span>
          <span>{incident.incident_type}</span>
        </div>
        {incident.action_type && (
          <div className="flex">
            <span className="w-24 shrink-0 font-medium text-gray-500">지도·조치 유형</span>
            <span>{incident.action_type}</span>
          </div>
        )}
      </div>

      <hr className="my-4 border-t border-gray-200" />

      <div className="space-y-3">
        <div>
          <p className="mb-1 text-sm font-medium text-gray-500">사건 내용</p>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-800">
            {incident.description}
          </p>
        </div>

        {incident.action_note && (
          <div>
            <p className="mb-1 text-sm font-medium text-gray-500">지도·조치 내용</p>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-800">
              {incident.action_note}
            </p>
          </div>
        )}

        {guardianStudents.length > 0 && (
          <div>
            <p className="mb-1 text-sm font-medium text-gray-500">관련 학생</p>
            <div className="flex flex-wrap gap-1.5">
              {guardianStudents.map((is) => (
                <span
                  key={is.id}
                  className="inline-flex items-center rounded-md border border-gray-200 bg-gray-50 px-2 py-0.5 text-xs text-gray-700"
                >
                  {is.student?.name ?? '?'} · {ROLE_LABELS[is.role] ?? is.role}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <hr className="my-4 border-t border-gray-200" />

      <div className="space-y-3">
        <div>
          <p className="mb-1 text-sm font-medium text-gray-500">가정 협조 안내</p>
          <div className="space-y-2 text-sm leading-relaxed text-gray-800">
            <p className="whitespace-pre-wrap">{FAMILY_GUIDANCE_BASE}</p>
            {typeAdditions.length > 0 && (
              <p className="whitespace-pre-wrap">{typeAdditions.join(' ')}</p>
            )}
          </div>
        </div>

        <div>
          <p className="mb-1 text-sm font-medium text-gray-500">
            최근 행동 기록 (참고사항)
          </p>
          <p className="mb-1 text-xs leading-relaxed text-gray-500">
            최근 학교생활 중 학생의 행동과 관련하여 기록된 횟수를 참고로 안내드립니다.
          </p>
          <div className="text-sm text-gray-800">
            <div>
              이번 주: {weeklyCount}회 · 이번 달: {monthlyCount}회
            </div>
          </div>
        </div>
      </div>

      <hr className="my-4 border-t border-gray-200" />

      <div>
        <p className="mb-1 text-sm font-medium text-gray-500">보호자 확인 및 가정 지도</p>
        <p className="text-sm leading-relaxed text-gray-800">
          □ 위 내용을 확인하였으며, 가정에서도 자녀와 함께 이번 일을 이야기하고 지도하였습니다.
        </p>

        <div className="mt-6 flex items-end justify-between">
          <div className="text-sm text-gray-800">
            보호자 성명: __________________ (서명)
          </div>
          <div className="text-right text-sm text-gray-700">
            <p>{formatKoreanDateKST()}</p>
            <p className="mt-1">
              담임교사: {teacherName || '______________'} (인)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
