'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminRootPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthAndRedirect();
  }, []);

  const checkAuthAndRedirect = () => {
    if (typeof window === 'undefined') return;

    const userRole = localStorage.getItem('userRole');
    const token = localStorage.getItem('accessToken');

    // 슈퍼어드민 인증 확인
    if (token && userRole === 'SUPER_ADMIN') {
      // 슈퍼어드민은 이 페이지를 표시 (대시보드)
      setLoading(false);
    } else {
      // 인증 안 되어 있으면 로그인 페이지로
      router.replace('/admin/login');
    }
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#f5f5f5',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⏳</div>
          <p style={{ color: '#666', fontSize: 16 }}>로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f5f5f5',
      padding: 20,
    }}>
      <div style={{
        maxWidth: 1200,
        margin: '0 auto',
      }}>
        {/* 헤더 */}
        <div style={{
          background: 'white',
          borderRadius: 8,
          padding: 32,
          marginBottom: 24,
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        }}>
          <h1 style={{ fontSize: 32, fontWeight: 'bold', margin: 0, marginBottom: 8 }}>
            🛡️ 슈퍼어드민 대시보드
          </h1>
          <p style={{ fontSize: 16, color: '#666', margin: 0 }}>
            장표사닷컴 관리 시스템
          </p>
        </div>

        {/* 메뉴 그리드 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 20,
        }}>
          <MenuCard
            icon="👥"
            title="영업 관리"
            description="매니저, 지사, 본부 관리"
            link="/admin/sales-management"
          />
          <MenuCard
            icon="🏢"
            title="기업 관리"
            description="고용의무기업 관리"
            link="/admin/company"
          />
          <MenuCard
            icon="🏭"
            title="표준사업장 관리"
            description="표준사업장 관리"
            link="/admin/standard-workplace"
          />
          <MenuCard
            icon="⚙️"
            title="시스템 설정"
            description="전체 시스템 설정"
            link="/admin/settings"
          />
        </div>
      </div>
    </div>
  );
}

function MenuCard({ icon, title, description, link }: {
  icon: string;
  title: string;
  description: string;
  link: string;
}) {
  return (
    <a
      href={link}
      style={{
        display: 'block',
        background: 'white',
        borderRadius: 8,
        padding: 24,
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        textDecoration: 'none',
        color: 'inherit',
        transition: 'all 0.2s',
        cursor: 'pointer',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
      }}
    >
      <div style={{ fontSize: 48, marginBottom: 16 }}>{icon}</div>
      <h3 style={{ fontSize: 20, fontWeight: 'bold', margin: 0, marginBottom: 8 }}>
        {title}
      </h3>
      <p style={{ fontSize: 14, color: '#666', margin: 0 }}>
        {description}
      </p>
    </a>
  );
}

