import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Printer, Check } from 'lucide-react';
import {
  supabase,
  type IncidentWithStudents,
} from '@/lib/supabase';
import { PageHeader } from '@/components/PageHeader';
import { GuardianNoticeSheet } from '@/components/GuardianNoticeSheet';
import {
  getKstDateBoundaries,
  type ActorCounts,
} from '@/lib/guardianNotice';

export function GuardianNotice() {
  const { id } = useParams<{ id: string }>();
  const [incident, setIncident] = useState<IncidentWithStudents | null>(null);
  const [loading, setLoading] = useState(true);
  const [actorCounts, setActorCounts] = useState<ActorCounts>({});
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const { data } = await supabase
        .from('incidents')
        .select('*, incident_students(*, student:students(*))')
        .eq('id', id)
        .maybeSingle();
      const incidentData = data as IncidentWithStudents | null;
      setIncident(incidentData);
      setLoading(false);

      if (incidentData) {
        const actorStudents = (incidentData.incident_students ?? []).filter(
          (is) => is.role === 'actor',
        );
        if (actorStudents.length === 1) {
          setSelectedStudentIds([actorStudents[0].student_id]);
        }
        if (actorStudents.length > 0) {
          const { weekStartEpoch, monthStartEpoch } = getKstDateBoundaries();
          const counts: ActorCounts = {};
          await Promise.all(
            actorStudents.map(async (is) => {
              const { data: actorIncidents } = await supabase
                .from('incident_students')
                .select('incident:incidents(occurred_at)')
                .eq('student_id', is.student_id)
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
              counts[is.student_id] = { weekly, monthly };
            }),
          );
          setActorCounts(counts);
        }
      }
    })();
  }, [id]);

  function handlePrint() {
    window.print();
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-4 pt-10 text-center text-sm text-gray-400">
        불러오는 중...
      </div>
    );
  }

  if (!incident) {
    return (
      <div className="mx-auto max-w-2xl px-4 pt-10 text-center text-sm text-gray-400">
        사건을 찾을 수 없습니다.
      </div>
    );
  }

  const students = incident.incident_students ?? [];
  const actorStudents = students.filter((is) => is.role === 'actor');
  const needsSelection = actorStudents.length >= 2;
  const selectedActors = actorStudents.filter((is) =>
    selectedStudentIds.includes(is.student_id),
  );
  const canPrint = selectedActors.length > 0;

  function toggleStudent(studentId: string) {
    setSelectedStudentIds((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId],
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 pb-20 pt-4">
      <div className="no-print">
        <PageHeader
          title="보호자 통지서"
          rightSlot={
            <button
              onClick={canPrint ? handlePrint : undefined}
              disabled={!canPrint}
              className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-50"
              style={{ backgroundColor: '#1e3a5f' }}
            >
              <Printer size={16} />
              인쇄
            </button>
          }
        />

        {needsSelection && (
          <div className="mb-4 rounded-xl border border-gray-200 bg-white p-4">
            <p className="mb-2 text-sm font-medium text-gray-700">
              통지 대상 학생을 선택해 주세요.
            </p>
            <div className="flex flex-wrap gap-2">
              {actorStudents.map((is) => {
                const selected = selectedStudentIds.includes(is.student_id);
                return (
                  <button
                    key={is.id}
                    onClick={() => toggleStudent(is.student_id)}
                    className={`inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-sm font-medium transition ${
                      selected
                        ? 'bg-red-50 text-red-700 border-red-300'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {selected && <Check size={14} />}
                    {is.student?.name ?? '?'}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="print-area">
        {selectedActors.map((targetStudent) => {
          const targetCounts = actorCounts[targetStudent.student_id];
          return (
            <GuardianNoticeSheet
              key={targetStudent.id}
              incident={incident}
              targetStudentId={targetStudent.student_id}
              weeklyCount={targetCounts?.weekly ?? 0}
              monthlyCount={targetCounts?.monthly ?? 0}
            />
          );
        })}
      </div>
    </div>
  );
}
