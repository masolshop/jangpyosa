'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

// 전역 인증 상태 캐시 (layout이 재마운트되어도 유지)
let globalAuthState: { isAuthenticated: boolean; lastCheck: number } | null = null;

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState('슈퍼관리자');

  useEffect(() => {
    // 컴포넌트 마운트 시 인증 체크
    checkAuth();
  }, [pathname]); // pathname이 변경될 때마다 체크 (하지만 캐시 사용)

  const checkAuth = () => {
    // /admin/login 페이지는 인증 체크 스킵
    if (pathname === '/admin/login') {
      setLoading(false);
      setIsAuthenticated(true);
      return;
    }

    // 전역 캐시 확인 (최근 5초 이내에 체크했다면 재사용)
    const now = Date.now();
    if (globalAuthState && (now - globalAuthState.lastCheck) < 5000) {
      console.log('[Admin Layout] Using cached auth state');
      setIsAuthenticated(globalAuthState.isAuthenticated);
      setLoading(false);
      if (!globalAuthState.isAuthenticated) {
        router.push('/admin/login');
      } else {
        loadUserInfo();
      }
      return;
    }

    // localStorage가 준비될 때까지 짧은 지연
    setTimeout(() => {
      // 토큰과 역할 확인
      const token = localStorage.getItem('accessToken');
      const role = localStorage.getItem('userRole'); // 'role'이 아니라 'userRole'로 수정

      console.log('[Admin Layout] Auth check:', { 
        pathname, 
        hasToken: !!token, 
        role,
        timestamp: new Date().toISOString()
      });

      // 인증되지 않았거나 슈퍼어드민이 아닌 경우
      if (!token || role !== 'SUPER_ADMIN') {
        console.log('[Admin Layout] Redirecting to login');
        globalAuthState = { isAuthenticated: false, lastCheck: now };
        setIsAuthenticated(false);
        setLoading(false);
        router.push('/admin/login');
        return;
      }

      console.log('[Admin Layout] Authentication successful');
      globalAuthState = { isAuthenticated: true, lastCheck: now };
      setIsAuthenticated(true);
      setLoading(false);
      loadUserInfo();
    }, 50); // 50ms 지연으로 localStorage 안정화
  };

  const loadUserInfo = () => {
    const user = localStorage.getItem('user');
    if (user) {
      try {
        const userData = JSON.parse(user);
        setUserName(userData.name || '슈퍼관리자');
      } catch (e) {
        setUserName('슈퍼관리자');
      }
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    globalAuthState = null;
    router.push('/admin/login');
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

  // 로그인 페이지는 사이드바 없이 표시
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  // 인증된 페이지는 사이드바와 함께 표시
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* 사이드바 */}
      <aside style={{
        width: 280,
        backgroundColor: '#1a237e',
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        height: '100vh',
        overflowY: 'auto',
      }}>
        {/* 로고 영역 */}
        <div style={{
          padding: '24px 20px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        }}>
          <h1 style={{ 
            margin: 0, 
            fontSize: 20, 
            fontWeight: 700,
            color: 'white',
          }}>
            🛡️ 슈퍼어드민
          </h1>
          <p style={{ 
            margin: '8px 0 0 0', 
            fontSize: 13, 
            color: 'rgba(255, 255, 255, 0.7)',
          }}>
            {userName}
          </p>
        </div>

        {/* 메뉴 영역 */}
        <nav style={{ flex: 1, padding: '20px 0' }}>
          <NavItem 
            href="/admin/sales" 
            icon="📊" 
            label="영업관리 대시보드" 
            active={pathname === '/admin/sales'}
          />
          <NavItem 
            href="/admin/company" 
            icon="🏢" 
            label="기업관리 대시보드" 
            active={pathname === '/admin/company'}
          />
          <NavItem 
            href="/admin/standard-workplace" 
            icon="🏭" 
            label="표준사업장 대시보드" 
            active={pathname === '/admin/standard-workplace'}
          />
        </nav>

        {/* 로그아웃 버튼 */}
        <div style={{
          padding: '20px',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        }}>
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#d32f2f',
              color: 'white',
              border: 'none',
              borderRadius: 6,
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#b71c1c';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#d32f2f';
            }}
          >
            🚪 로그아웃
          </button>
        </div>
      </aside>

      {/* 메인 컨텐츠 영역 */}
      <main style={{
        marginLeft: 280,
        flex: 1,
        backgroundColor: '#f5f5f5',
        minHeight: '100vh',
      }}>
        {children}
      </main>
    </div>
  );
}

// 네비게이션 아이템 컴포넌트
function NavItem({ 
  href, 
  icon, 
  label, 
  active 
}: { 
  href: string; 
  icon: string; 
  label: string; 
  active: boolean;
}) {
  return (
    <Link
      href={href}
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '14px 20px',
        margin: '4px 12px',
        color: 'white',
        textDecoration: 'none',
        borderRadius: 8,
        fontSize: 15,
        fontWeight: active ? 600 : 400,
        backgroundColor: active ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
        transition: 'all 0.2s',
      }}
      onMouseEnter={(e) => {
        if (!active) {
          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          e.currentTarget.style.backgroundColor = 'transparent';
        }
      }}
    >
      <span style={{ fontSize: 20, marginRight: 12 }}>{icon}</span>
      <span>{label}</span>
    </Link>
  );
}
