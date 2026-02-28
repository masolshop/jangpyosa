'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, [pathname]);

  const checkAuth = () => {
    // /admin/login 페이지는 인증 체크 스킵
    if (pathname === '/admin/login') {
      setLoading(false);
      return;
    }

    // 토큰과 역할 확인
    const token = localStorage.getItem('accessToken');
    const role = localStorage.getItem('role');

    // 인증되지 않았거나 슈퍼어드민이 아닌 경우
    if (!token || role !== 'SUPER_ADMIN') {
      router.push('/admin/login');
      return;
    }

    setLoading(false);
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

  return <>{children}</>;
}
