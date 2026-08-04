import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Printer, FileText, Users } from 'lucide-react';
import { supabase, type IncidentWithStudents } from '@/lib/supabase';
import { isTodayKST } from '@/lib/datetime';
import { IncidentCard } from '@/components/IncidentCard';

const BRAND = '지도로그';
const SLOGAN = '학생 생활지도를 기록하고, 돌아보다.';

function isToday(iso: string): boolean {
  return isTodayKST(iso);
}

export function Dashboard() {
  const navigate = useNavigate();
  const [todayIncidents, setTodayIncidents] = useState<IncidentWithStudents[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadData() {
    setLoading(true);
    const { data } = await supabase
      .from('incidents')
      .select('*, incident_students(*, student:students(*))')
      .order('occurred_at', { ascending: false })
      .limit(30);
    const all = (data ?? []) as IncidentWithStudents[];
    setTodayIncidents(all.filter((i) => isToday(i.occurred_at)));
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="mx-auto max-w-2xl px-4 pb-20 pt-6">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-navy-800">{BRAND}</h1>
        <p className="mt-0.5 text-xs text-gray-400">{SLOGAN}</p>
      </div>

      <button
        onClick={() => navigate('/incidents/new')}
        className="flex w-full items-center justify-center gap-1.5 rounded-xl py-3.5 text-sm font-semibold text-white transition"
        style={{ backgroundColor: '#1e3a5f' }}
      >
        <Plus size={18} />
        새 사건 기록
      </button>

      <section className="mt-6">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-700">
            오늘 기록한 사건
            <span className="ml-1.5 text-gray-400">({todayIncidents.length})</span>
          </h2>
          {todayIncidents.length > 0 && (
            <button
              onClick={() => navigate('/print/today')}
              className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-xs font-medium text-gray-600 transition hover:border-gray-300 hover:bg-gray-50"
            >
              <Printer size={14} />
              일괄 인쇄
            </button>
          )}
        </div>
        {loading ? (
          <p className="py-8 text-center text-sm text-gray-400">불러오는 중...</p>
        ) : todayIncidents.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-400">오늘 기록한 사건이 없습니다.</p>
        ) : (
          <div className="space-y-2.5">
            {todayIncidents.map((inc) => (
              <IncidentCard
                key={inc.id}
                incident={inc}
                onClick={() => navigate(`/incidents/${inc.id}`)}
              />
            ))}
          </div>
        )}
      </section>

      <section className="mt-6">
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => navigate('/incidents/all')}
            className="flex flex-col items-center justify-center gap-1.5 rounded-xl border border-gray-200 bg-white px-4 py-4 text-sm font-medium text-gray-700 transition hover:border-gray-300 hover:bg-gray-50"
          >
            <FileText size={20} className="text-navy-600" />
            전체 사건
          </button>
          <button
            onClick={() => navigate('/students')}
            className="flex flex-col items-center justify-center gap-1.5 rounded-xl border border-gray-200 bg-white px-4 py-4 text-sm font-medium text-gray-700 transition hover:border-gray-300 hover:bg-gray-50"
          >
            <Users size={20} className="text-navy-600" />
            학생 조회
          </button>
        </div>
      </section>
    </div>
  );
}
