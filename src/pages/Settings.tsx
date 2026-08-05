import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Settings as SettingsIcon,
  User,
  LogOut,
  UserMinus,
  HelpCircle,
  MessageSquare,
  Shield,
  FileText,
  ChevronRight,
} from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { supabase } from '@/lib/supabase';

type Toast = { id: number; message: string };

export function Settings() {
  const navigate = useNavigate();
  const [toasts, setToasts] = useState<Toast[]>([]);

  function showToast(message: string) {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2500);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate('/login', { replace: true });
  }

  return (
    <div className="mx-auto max-w-2xl px-4 pb-20 pt-4">
      <PageHeader title="설정" />

      <div className="mb-6 flex items-center gap-2">
        <SettingsIcon size={20} className="text-navy-700" />
        <h1 className="text-lg font-bold text-gray-800">설정</h1>
      </div>

      {/* 계정 */}
      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">계정</h2>
        <div className="divide-y divide-gray-100">
          <SettingRow icon={<User size={18} />} label="내 계정" onClick={() => showToast('준비 중입니다')} />
          <SettingRow icon={<LogOut size={18} />} label="로그아웃" onClick={handleLogout} />
          <SettingRow icon={<UserMinus size={18} />} label="회원 탈퇴" onClick={() => showToast('준비 중입니다')} danger />
        </div>
      </section>

      {/* 고객지원 */}
      <section className="mt-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">고객지원</h2>
        <div className="divide-y divide-gray-100">
          <SettingRow icon={<HelpCircle size={18} />} label="Q&A" onClick={() => showToast('준비 중입니다')} />
          <SettingRow icon={<MessageSquare size={18} />} label="문의 및 개선 제안" onClick={() => showToast('준비 중입니다')} />
        </div>
      </section>

      {/* 약관 */}
      <section className="mt-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">약관</h2>
        <div className="divide-y divide-gray-100">
          <SettingRow icon={<Shield size={18} />} label="개인정보 처리방침" onClick={() => showToast('준비 중입니다')} />
          <SettingRow icon={<FileText size={18} />} label="이용약관" onClick={() => showToast('준비 중입니다')} />
        </div>
      </section>

      {/* 토스트 */}
      {toasts.length > 0 && (
        <div className="pointer-events-none fixed inset-x-0 bottom-8 z-50 flex flex-col items-center gap-2">
          {toasts.map((t) => (
            <div
              key={t.id}
              className="pointer-events-auto rounded-xl bg-gray-800 px-4 py-2.5 text-sm font-medium text-white shadow-lg"
            >
              {t.message}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SettingRow({
  icon,
  label,
  onClick,
  danger,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center justify-between py-3.5 text-left transition"
    >
      <div className="flex items-center gap-3">
        <span className={danger ? 'text-red-500' : 'text-gray-500'}>{icon}</span>
        <span className={`text-sm font-medium ${danger ? 'text-red-600' : 'text-gray-700'}`}>{label}</span>
      </div>
      <ChevronRight size={18} className="text-gray-300" />
    </button>
  );
}
