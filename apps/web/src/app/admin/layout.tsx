'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // 컴포넌트 마운트 시 한 번만 인증 체크
    checkAuth();
  }, []);

  const checkAuth = () => {
    // /admin/login 페이지는 인증 체크 스킵
    if (pathname === '/admin/login') {
      setLoading(false);
      setIsAuthenticated(true);
      return;
    }

    // localStorage가 준비될 때까지 짧은 지연
    setTimeout(() => {
      // 토큰과 역할 확인
      const token = localStorage.getItem('accessToken');
      const role = localStorage.getItem('role');

      console.log('[Admin Layout] Auth check:', { 
        pathname, 
        hasToken: !!token, 
        role,
        timestamp: new Date().toISOString()
      });

      // 인증되지 않았거나 슈퍼어드민이 아닌 경우
      if (!token || role !== 'SUPER_ADMIN') {
        console.log('[Admin Layout] Redirecting to login');
        setIsAuthenticated(false);
        setLoading(false);
        router.push('/admin/login');
        return;
      }

      console.log('[Admin Layout] Authentication successful');
      setIsAuthenticated(true);
      setLoading(false);
    }, 50); // 50ms 지연으로 localStorage 안정화
  };

  // 로그인 페이지가 아닌 경우 로딩 표시
  if (loading && pathname !== '/admin/login') {
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
          }}></div>
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

  // 인증되지 않은 경우 null 반환 (리다이렉트 중)
  if (!isAuthenticated && pathname !== '/admin/login') {
    return null;
  }

  return <>{children}</>;
}
