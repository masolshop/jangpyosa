'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';

// 상수
const AUTH_CACHE_DURATION = 5000; // 5초
const LOGIN_PATH = '/admin/login';
const SALES_PATH = '/admin/sales'; // 매니저 전용 페이지 (인증 불필요)
const SUPER_ADMIN_ROLE = 'SUPER_ADMIN';

// 전역 인증 상태 캐시
interface AuthState {
  isAuthenticated: boolean;
  lastCheck: number;
}

let globalAuthState: AuthState | null = null;

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const checkAuth = useCallback(() => {
    // 로그인 페이지와 매니저 페이지(/admin/sales로 시작하는 모든 경로)는 인증 체크 스킵
    if (pathname === LOGIN_PATH || pathname?.startsWith(SALES_PATH)) {
      setLoading(false);
      setIsAuthenticated(true);
      return;
    }

    const now = Date.now();

    // 캐시된 인증 상태 확인 (최근 5초 이내)
    if (globalAuthState && (now - globalAuthState.lastCheck) < AUTH_CACHE_DURATION) {
      setIsAuthenticated(globalAuthState.isAuthenticated);
      setLoading(false);
      if (!globalAuthState.isAuthenticated) {
        router.push(LOGIN_PATH);
      }
      return;
    }

    // 브라우저 환경에서만 localStorage 접근
    if (typeof window === 'undefined') {
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      const role = localStorage.getItem('userRole');

      const isValid = Boolean(token && role === SUPER_ADMIN_ROLE);

      // 전역 상태 업데이트
      globalAuthState = { isAuthenticated: isValid, lastCheck: now };
      setIsAuthenticated(isValid);
      setLoading(false);

      // 인증 실패 시 로그인 페이지로 리다이렉트
      if (!isValid) {
        router.push(LOGIN_PATH);
      }
    } catch (error) {
      console.error('[Admin Layout] Auth check error:', error);
      globalAuthState = { isAuthenticated: false, lastCheck: now };
      setIsAuthenticated(false);
      setLoading(false);
      router.push(LOGIN_PATH);
    }
  }, [pathname, router]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // 로그인 페이지와 매니저 페이지(/admin/sales로 시작)는 사이드바 없이 표시
  if (pathname === LOGIN_PATH || pathname?.startsWith(SALES_PATH)) {
    return <>{children}</>;
  }

  // 로딩 중
  if (loading) {
    return <LoadingSpinner />;
  }

  // 인증되지 않은 경우 (리다이렉트 중)
  if (!isAuthenticated) {
    return null;
  }

  // 인증된 페이지는 메인 레이아웃의 사이드바를 사용
  return <>{children}</>;
}

// 로딩 스피너 컴포넌트
function LoadingSpinner() {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      backgroundColor: '#f5f5f5',
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: 48,
          height: 48,
          border: '4px solid #1a237e',
          borderTopColor: 'transparent',
          borderRadius: '50%',
          margin: '0 auto 16px',
          animation: 'spin 1s linear infinite',
        }} />
        <p style={{ color: '#666', fontSize: 14 }}>인증 확인 중...</p>
      </div>
      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
