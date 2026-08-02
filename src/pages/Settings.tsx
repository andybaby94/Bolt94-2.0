import { useState, useMemo } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';

const TEACHER_NAME_KEY = 'teacherName';

export function Settings() {
  const [name, setName] = useState(() => localStorage.getItem(TEACHER_NAME_KEY) ?? '');
  const [saved, setSaved] = useState(false);

  function handleSave() {
    localStorage.setItem(TEACHER_NAME_KEY, name.trim());
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const [resetOpen, setResetOpen] = useState(false);
  const [confirmToken, setConfirmToken] = useState('');
  const [resetInput, setResetInput] = useState('');
  const [finalOpen, setFinalOpen] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);
  const [resetDone, setResetDone] = useState(false);

  const inputMatches = useMemo(
    () => resetInput.trim() === confirmToken,
    [resetInput, confirmToken],
  );

  function openReset() {
    setConfirmToken(String(Math.floor(1000 + Math.random() * 9000)));
    setResetInput('');
    setResetError(null);
    setResetDone(false);
    setFinalOpen(false);
    setResetOpen(true);
  }

  function closeReset() {
    setResetOpen(false);
    setFinalOpen(false);
  }

  async function executeReset() {
    setResetting(true);
    setResetError(null);
    try {
      const baseUrl = import.meta.env.VITE_SUPABASE_URL;
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${anonKey}`,
        apikey: anonKey,
      };

      const challengeRes = await fetch(
        `${baseUrl}/functions/v1/reset-school-year`,
        { method: 'POST', headers, body: JSON.stringify({ action: 'challenge' }) },
      );
      if (!challengeRes.ok) {
        throw new Error(`Challenge failed (${challengeRes.status})`);
      }
      const challenge = await challengeRes.json();
      const token: string | undefined = challenge?.token;
      if (!token) {
        throw new Error('Missing challenge token');
      }

      const response = await fetch(
        `${baseUrl}/functions/v1/reset-school-year`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify({ action: 'execute', token }),
        },
      );
      if (!response.ok) {
        throw new Error(`Request failed (${response.status})`);
      }
      const payload = await response.json();
      if (payload?.error) {
        throw new Error(payload.error);
      }
      setResetDone(true);
      setFinalOpen(false);
      setResetOpen(false);
    } catch {
      setResetError('초기화 중 오류가 발생했습니다. 다시 시도해 주세요.');
    } finally {
      setResetting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 pb-20 pt-4">
      <PageHeader title="설정" />

      <section className="rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="mb-3 text-sm font-semibold text-gray-700">
          담임교사의 성함을 적어주세요
        </h2>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="예: 홍길동"
          className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-gray-400"
        />
        <button
          onClick={handleSave}
          className="mt-3 w-full rounded-xl py-3 text-sm font-semibold text-white transition"
          style={{ backgroundColor: '#1e3a5f' }}
        >
          저장
        </button>
        {saved && (
          <p className="mt-2 text-center text-xs text-green-600">저장되었습니다.</p>
        )}
      </section>

      <section className="mt-6 rounded-xl border border-red-200 bg-red-50/40 p-5">
        <div className="flex items-start gap-2">
          <AlertTriangle size={18} className="mt-0.5 shrink-0 text-red-500" />
          <div className="flex-1">
            <h2 className="text-sm font-semibold text-red-700">학년도 초기화</h2>
            <p className="mt-1 text-xs leading-relaxed text-red-600">
              현재 등록된 학생 및 모든 사건 기록을 삭제합니다. 삭제된 데이터는 복구할 수 없습니다.
            </p>
            <button
              onClick={openReset}
              className="mt-3 w-full rounded-xl border border-red-300 bg-white py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50"
            >
              학년도 초기화
            </button>
            {resetDone && (
              <p className="mt-2 text-center text-xs text-green-600">
                초기화가 완료되었습니다.
              </p>
            )}
          </div>
        </div>
      </section>

      {resetOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-base font-bold text-gray-800">학년도 초기화</h3>
              <button
                onClick={closeReset}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100"
              >
                <X size={18} />
              </button>
            </div>
            <p className="text-sm text-gray-600">
              현재 등록된 학생 및 모든 사건 기록을 삭제합니다.
            </p>
            <p className="mt-1 text-sm font-medium text-red-600">
              삭제된 데이터는 복구할 수 없습니다.
            </p>
            <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-3">
              <p className="text-xs text-gray-500">
                초기화를 진행하려면 아래 숫자를 입력하세요.
              </p>
              <p className="mt-1 text-center text-2xl font-bold tracking-[0.3em] text-gray-800">
                {confirmToken}
              </p>
            </div>
            <input
              value={resetInput}
              onChange={(e) => setResetInput(e.target.value)}
              inputMode="numeric"
              placeholder="숫자 4자리"
              className="mt-3 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-center text-sm text-gray-800 outline-none focus:border-gray-400"
            />
            <button
              onClick={() => setFinalOpen(true)}
              disabled={!inputMatches}
              className="mt-3 w-full rounded-xl py-3 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-50"
              style={{ backgroundColor: '#b91c1c' }}
            >
              초기화 실행
            </button>
            {resetError && (
              <p className="mt-2 text-center text-xs text-red-600">{resetError}</p>
            )}
          </div>
        </div>
      )}

      {finalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl">
            <div className="mb-2 flex items-center gap-2">
              <AlertTriangle size={18} className="text-red-500" />
              <h3 className="text-base font-bold text-gray-800">정말 초기화하시겠습니까?</h3>
            </div>
            <p className="text-sm text-gray-600">
              현재 학년도의 학생 및 모든 사건 기록이 삭제됩니다. 이 작업은 되돌릴 수 없습니다.
            </p>
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setFinalOpen(false)}
                disabled={resetting}
                className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
              >
                취소
              </button>
              <button
                onClick={executeReset}
                disabled={resetting}
                className="flex-1 rounded-xl py-2.5 text-sm font-semibold text-white transition disabled:opacity-50"
                style={{ backgroundColor: '#b91c1c' }}
              >
                {resetting ? '초기화 중...' : '초기화'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
