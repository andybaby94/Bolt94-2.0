import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { PageHeader } from '@/components/PageHeader';

export function Signup() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit() {
    if (!email.trim() || !password.trim()) {
      setError('이메일과 비밀번호를 입력해 주세요.');
      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);

    const { error: signUpError } = await supabase.auth.signUp({
      email: email.trim(),
      password: password.trim(),
    });

    setLoading(false);

    if (signUpError) {
      setError(signUpError.message);
      return;
    }

    setMessage('회원가입 요청이 완료되었습니다. 이메일 인증이 활성화된 경우 확인 메일을 확인해 주세요.');
    setTimeout(() => navigate('/login', { replace: true }), 1200);
  }

  return (
    <div className="mx-auto max-w-2xl px-4 pb-20 pt-4">
      <PageHeader title="회원가입" />

      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-500">이메일</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="school@example.com"
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-navy-400 focus:ring-1 focus:ring-navy-400"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-500">비밀번호</label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              placeholder="비밀번호 입력"
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-navy-400 focus:ring-1 focus:ring-navy-400"
            />
          </div>

          {error && (
            <p className="text-xs text-red-600">{error}</p>
          )}

          {message && (
            <p className="text-xs text-green-600">{message}</p>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex w-full items-center justify-center gap-1.5 rounded-xl py-3.5 text-sm font-semibold text-white transition disabled:opacity-50"
            style={{ backgroundColor: '#1e3a5f' }}
          >
            {loading ? '가입 처리 중...' : '회원가입'}
          </button>

          <div className="text-center text-sm text-gray-500">
            이미 계정이 있으신가요?{' '}
            <Link to="/login" className="font-medium text-gray-700 underline">
              로그인
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
