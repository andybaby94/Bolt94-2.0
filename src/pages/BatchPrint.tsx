import { useState, useEffect } from 'react';
import { Printer } from 'lucide-react';
import { supabase, type IncidentWithStudents } from '@/lib/supabase';
import { isTodayKST } from '@/lib/datetime';
import { PageHeader } from '@/components/PageHeader';
import { GuardianNoticeSheet } from '@/components/GuardianNoticeSheet';
import { fetchActorCountsForStudent } from '@/lib/guardianNotice';

type PrintTarget = {
  key: string;
  incident: IncidentWithStudents;
  studentId: string;
  weekly: number;
  monthly: number;
};

export function BatchPrint() {
  const [targets, setTargets] = useState<PrintTarget[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('incidents')
        .select('*, incident_students(*, student:students(*))')
        .order('occurred_at', { ascending: false })
        .limit(30);
      const all = (data ?? []) as IncidentWithStudents[];
      const today = all.filter((i) => isTodayKST(i.occurred_at));

      const built: PrintTarget[] = [];
      for (const inc of today) {
        const actors = (inc.incident_students ?? []).filter(
          (is) => is.role === 'actor',
        );
        for (const actor of actors) {
          const counts = await fetchActorCountsForStudent(actor.student_id);
          built.push({
            key: `${inc.id}-${actor.student_id}`,
            incident: inc,
            studentId: actor.student_id,
            weekly: counts.weekly,
            monthly: counts.monthly,
          });
        }
      }
      setTargets(built);
      setLoading(false);
    })();
  }, []);

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

  return (
    <div className="mx-auto max-w-2xl px-4 pb-20 pt-4">
      <div className="no-print">
        <PageHeader
          title="일괄 인쇄"
          rightSlot={
            <button
              onClick={handlePrint}
              disabled={targets.length === 0}
              className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-50"
              style={{ backgroundColor: '#1e3a5f' }}
            >
              <Printer size={16} />
              인쇄 ({targets.length})
            </button>
          }
        />
        <p className="mb-4 text-sm text-gray-500">
          오늘 기록한 사건의 행동학생 보호자 통지서 {targets.length}장
        </p>
      </div>

      <div className="print-area">
        {targets.map((t) => (
          <GuardianNoticeSheet
            key={t.key}
            incident={t.incident}
            targetStudentId={t.studentId}
            weeklyCount={t.weekly}
            monthlyCount={t.monthly}
          />
        ))}
      </div>
    </div>
  );
}
