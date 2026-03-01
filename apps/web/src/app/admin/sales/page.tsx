"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 
  (typeof window !== 'undefined' && window.location.hostname === 'jangpyosa.com' 
    ? 'https://jangpyosa.com/api' 
    : 'http://localhost:4000');

// 매니저 전용 인증 토큰 관리
const MANAGER_TOKEN_KEY = 'manager_auth_token';
const MANAGER_INFO_KEY = 'manager_info';

const getManagerToken = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(MANAGER_TOKEN_KEY);
};

const setManagerToken = (token: string) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(MANAGER_TOKEN_KEY, token);
};

const getManagerInfo = () => {
  if (typeof window === 'undefined') return null;
  const info = localStorage.getItem(MANAGER_INFO_KEY);
  return info ? JSON.parse(info) : null;
};

const setManagerInfo = (info: any) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(MANAGER_INFO_KEY, JSON.stringify(info));
};

const clearManagerAuth = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(MANAGER_TOKEN_KEY);
  localStorage.removeItem(MANAGER_INFO_KEY);
};

export default function SalesLoginPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true); // true: 로그인, false: 회원가입
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 로그인 폼
  const [loginForm, setLoginForm] = useState({
    phone: '',
    password: '',
  });

  // 회원가입 폼
  const [signupForm, setSignupForm] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  // 이미 로그인되어 있는지 확인
  useEffect(() => {
    const token = getManagerToken();
    const info = getManagerInfo();
    if (token && info) {
      // 이미 로그인되어 있으면 대시보드로 리다이렉트
      router.push('/admin/sales/dashboard');
    }
  }, [router]);

  // 로그인 처리
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/sales/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: loginForm.phone,
          password: loginForm.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // 토큰과 사용자 정보 저장
        setManagerToken(data.token);
        setManagerInfo(data.salesPerson);
        
        // 대시보드로 이동
        router.push('/admin/sales/dashboard');
      } else {
        setError(data.error || '로그인에 실패했습니다');
      }
    } catch (err) {
      setError('서버 연결에 실패했습니다');
    } finally {
      setLoading(false);
    }
  };

  // 회원가입 처리
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // 비밀번호 확인
    if (signupForm.password !== signupForm.confirmPassword) {
      setError('비밀번호가 일치하지 않습니다');
      return;
    }

    // 비밀번호 길이 확인
    if (signupForm.password.length < 6) {
      setError('비밀번호는 최소 6자 이상이어야 합니다');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/sales/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: signupForm.name,
          phone: signupForm.phone,
          email: signupForm.email,
          password: signupForm.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // 자동 로그인
        setManagerToken(data.token);
        setManagerInfo(data.salesPerson);
        
        // 대시보드로 이동
        router.push('/admin/sales/dashboard');
      } else {
        setError(data.error || '회원가입에 실패했습니다');
      }
    } catch (err) {
      setError('서버 연결에 실패했습니다');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
    }}>
      <div style={{
        background: 'white',
        borderRadius: 16,
        boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
        width: '100%',
        maxWidth: 450,
        padding: 40,
      }}>
        {/* 로고 및 제목 */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📊</div>
          <h1 style={{ fontSize: 28, fontWeight: 'bold', margin: 0, marginBottom: 8 }}>
            영업 사원 전용
          </h1>
          <p style={{ fontSize: 14, color: '#6b7280', margin: 0 }}>
            장표사닷컴 영업 관리 시스템
          </p>
        </div>

        {/* 탭 전환 */}
        <div style={{
          display: 'flex',
          gap: 8,
          marginBottom: 24,
          background: '#f3f4f6',
          borderRadius: 8,
          padding: 4,
        }}>
          <button
            onClick={() => setIsLogin(true)}
            style={{
              flex: 1,
              padding: '12px',
              background: isLogin ? 'white' : 'transparent',
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer',
              fontWeight: isLogin ? 600 : 400,
              color: isLogin ? '#111' : '#6b7280',
              boxShadow: isLogin ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.2s',
            }}
          >
            로그인
          </button>
          <button
            onClick={() => setIsLogin(false)}
            style={{
              flex: 1,
              padding: '12px',
              background: !isLogin ? 'white' : 'transparent',
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer',
              fontWeight: !isLogin ? 600 : 400,
              color: !isLogin ? '#111' : '#6b7280',
              boxShadow: !isLogin ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.2s',
            }}
          >
            회원가입
          </button>
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div style={{
            padding: '12px 16px',
            background: '#fee',
            border: '1px solid #fcc',
            borderRadius: 6,
            color: '#c00',
            fontSize: 14,
            marginBottom: 16,
          }}>
            {error}
          </div>
        )}

        {/* 로그인 폼 */}
        {isLogin ? (
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, fontSize: 14 }}>
                아이디 (핸드폰번호)
              </label>
              <input
                type="tel"
                value={loginForm.phone}
                onChange={(e) => setLoginForm({ ...loginForm, phone: e.target.value })}
                placeholder="01012345678"
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: 8,
                  fontSize: 14,
                }}
              />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, fontSize: 14 }}>
                비밀번호
              </label>
              <input
                type="password"
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                placeholder="비밀번호 입력"
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: 8,
                  fontSize: 14,
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '14px',
                background: loading ? '#9ca3af' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: 8,
                cursor: loading ? 'not-allowed' : 'pointer',
                fontWeight: 600,
                fontSize: 16,
              }}
            >
              {loading ? '로그인 중...' : '로그인'}
            </button>
          </form>
        ) : (
          /* 회원가입 폼 */
          <form onSubmit={handleSignup}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, fontSize: 14 }}>
                아이디 (핸드폰번호) *
              </label>
              <input
                type="tel"
                value={signupForm.phone}
                onChange={(e) => setSignupForm({ ...signupForm, phone: e.target.value })}
                placeholder="01012345678"
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: 8,
                  fontSize: 14,
                }}
              />
              <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>
                추천인 링크: https://jangpyosa.com/{signupForm.phone || '핸드폰번호'}
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, fontSize: 14 }}>
                이름 *
              </label>
              <input
                type="text"
                value={signupForm.name}
                onChange={(e) => setSignupForm({ ...signupForm, name: e.target.value })}
                placeholder="홍길동"
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: 8,
                  fontSize: 14,
                }}
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, fontSize: 14 }}>
                이메일
              </label>
              <input
                type="email"
                value={signupForm.email}
                onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                placeholder="example@jangpyosa.com"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: 8,
                  fontSize: 14,
                }}
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, fontSize: 14 }}>
                비밀번호 *
              </label>
              <input
                type="password"
                value={signupForm.password}
                onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                placeholder="최소 6자 이상"
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: 8,
                  fontSize: 14,
                }}
              />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, fontSize: 14 }}>
                비밀번호 확인 *
              </label>
              <input
                type="password"
                value={signupForm.confirmPassword}
                onChange={(e) => setSignupForm({ ...signupForm, confirmPassword: e.target.value })}
                placeholder="비밀번호 재입력"
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: 8,
                  fontSize: 14,
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '14px',
                background: loading ? '#9ca3af' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: 8,
                cursor: loading ? 'not-allowed' : 'pointer',
                fontWeight: 600,
                fontSize: 16,
              }}
            >
              {loading ? '가입 중...' : '회원가입'}
            </button>

            {/* 지사/본부 배정 안내 */}
            <div style={{
              marginTop: 16,
              padding: 12,
              background: '#fef3c7',
              borderRadius: 8,
              fontSize: 12,
              color: '#92400e',
            }}>
              ℹ️ 가입 후 지사/본부는 슈퍼어드민이 배정합니다
            </div>
          </form>
        )}

        {/* 아이디/비밀번호 찾기 */}
        {isLogin && (
          <div style={{
            marginTop: 16,
            textAlign: 'center',
            fontSize: 14,
          }}>
            <a href="/forgot-password" style={{ color: '#6b7280', textDecoration: 'underline' }}>
              아이디/비밀번호 찾기
            </a>
          </div>
        )}

        {/* 안내 메시지 */}
        <div style={{
          marginTop: 24,
          padding: 16,
          background: '#f9fafb',
          borderRadius: 8,
          fontSize: 13,
          color: '#6b7280',
        }}>
          <p style={{ margin: 0, marginBottom: 8 }}>
            💡 <strong>영업 사원 전용 계정입니다</strong>
          </p>
          <p style={{ margin: 0 }}>
            기업 고용의무/표준사업장 회원은 메인 페이지에서 가입해주세요.
          </p>
        </div>
      </div>
    </div>
  );
}
