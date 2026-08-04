import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

const BRAND = '클래스로그';
const SLOGAN = '학생 생활지도 기록을 간편하게';
const PASSWORD_POLICY = '비밀번호는 8자 이상이며 영문, 숫자, 특수문자를 포함해야 합니다.';

function isValidPassword(pw: string): boolean {
  return /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()\-_=+{}[\]|;:'",.<>/?`~])[A-Za-z\d!@#$%^&*()\-_=+{}[\]|;:'",.<>/?`~]{8,}$/.test(pw);
}

export function Signup() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit() {
    if (!email.trim()) {
      setError('이메일을 입력해 주세요.');
      return;
    }
    if (!password.trim()) {
      setError('비밀번호를 입력해 주세요.');
      return;
    }
    if (!isValidPassword(password)) {
      setError(PASSWORD_POLICY);
      return;
    }
    if (password !== passwordConfirm) {
      setError('비밀번호가 일치하지 않습니다.');
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
      setError('회원가입 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
      return;
    }

    setMessage('회원가입이 완료되었습니다. 입력하신 이메일로 인증 메일을 보냈습니다. 이메일을 확인하여 인증을 완료한 후 로그인해 주세요.');
    setTimeout(() => navigate('/login', { replace: true }), 2500);
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center px-4 py-10">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-navy-800">{BRAND}</h1>
        <p className="mt-1.5 text-sm text-gray-400">{SLOGAN}</p>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-navy-800">클래스로그 시작하기</h2>
          <p className="mt-1 text-xs text-gray-400">새 계정을 만들어 학생 생활지도를 기록해 보세요.</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-500">이메일</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="jidolog@example.com"
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
            <p className="mt-1.5 text-xs text-gray-400">{PASSWORD_POLICY}</p>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-500">비밀번호 확인</label>
            <input
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              type="password"
              placeholder="비밀번호 다시 입력"
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
        </div>
      </div>

      <div className="mt-6 text-center text-sm text-gray-500">
        이미 계정이 있으신가요?{' '}
        <Link to="/login" className="font-medium text-navy-700 underline">
          로그인
        </Link>
      </div>
    </div>
  );
}
