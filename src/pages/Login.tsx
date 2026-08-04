import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

const BRAND = '비하인드노트';
const SLOGAN = '생기부에 다 못 적는 진짜 지도·상담 기록을 적는 노트';

export function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function checkSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!mounted) return;
      if (session) {
        navigate('/', { replace: true });
      }
    }

    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      if (session) {
        navigate('/', { replace: true });
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [navigate]);

  async function handleSubmit() {
    if (!email.trim()) {
      setError('이메일을 입력해 주세요.');
      return;
    }
    if (!password.trim()) {
      setError('비밀번호를 입력해 주세요.');
      return;
    }

    setLoading(true);
    setError(null);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password.trim(),
    });

    setLoading(false);

    if (signInError) {
      setError('이메일 또는 비밀번호가 올바르지 않습니다.');
      return;
    }

    navigate('/', { replace: true });
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center px-4 py-10">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-navy-800">{BRAND}</h1>
        <p className="mt-1.5 text-sm text-gray-400">{SLOGAN}</p>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
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
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              type="password"
              placeholder="비밀번호 입력"
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-navy-400 focus:ring-1 focus:ring-navy-400"
            />
          </div>

          {error && (
            <p className="text-xs text-red-600">{error}</p>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex w-full items-center justify-center gap-1.5 rounded-xl py-3.5 text-sm font-semibold text-white transition disabled:opacity-50"
            style={{ backgroundColor: '#1e3a5f' }}
          >
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </div>
      </div>

      <div className="mt-6 text-center text-sm text-gray-500">
        계정이 없으신가요?{' '}
        <Link to="/signup" className="font-medium text-navy-700 underline">
          회원가입
        </Link>
      </div>
    </div>
  );
}
