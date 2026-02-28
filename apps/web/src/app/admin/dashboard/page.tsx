'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    const token = localStorage.getItem('accessToken');
    const role = localStorage.getItem('role');
    const user = localStorage.getItem('user');

    if (!token || role !== 'SUPER_ADMIN') {
      router.push('/admin/login');
      return;
    }

    if (user) {
      try {
        const userData = JSON.parse(user);
        setUserName(userData.name || '슈퍼관리자');
      } catch (e) {
        setUserName('슈퍼관리자');
      }
    }
    
    setLoading(false);
  };

  const handleLogout = () => {
    localStorage.clear();
    router.push('/admin/login');
  };

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <p>로딩 중...</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      {/* 헤더 */}
      <div style={{
        backgroundColor: '#1a237e',
        color: 'white',
        padding: '20px 40px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <h1 style={{ margin: 0, fontSize: 24 }}>🛡️ 슈퍼어드민 통합 대시보드</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <span>{userName}</span>
          <button
            onClick={handleLogout}
            style={{
              padding: '10px 20px',
              backgroundColor: '#d32f2f',
              color: 'white',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
            }}
          >
            로그아웃
          </button>
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <div style={{ padding: 40 }}>
        <h2 style={{ marginBottom: 30, color: '#333' }}>📋 관리 메뉴</h2>

        {/* 메뉴 그리드 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 24,
          maxWidth: 1200,
        }}>
          
          {/* 1. 매니저 전용 대시보드 (추후 작업) */}
          <MenuCard
            title="👔 매니저 전용 대시보드"
            description="본사/본부/지사/매니저 관리"
            badge="추후 작업"
            badgeColor="#999"
            items={[
              { label: '지사 관리', href: '/admin/branches' },
              { label: '매니저 관리', href: '/admin/agents' },
              { label: '실적 관리', href: '/admin/performance' },
            ]}
            disabled={false}
          />

          {/* 2. 기업회원 대시보드 */}
          <MenuCard
            title="🏢 기업회원 대시보드"
            description="고용의무기업 및 표준사업장 관리"
            badge="운영중"
            badgeColor="#2e7d32"
            items={[
              { label: '전체 기업 목록', href: '/admin/companies' },
              { label: '고용의무기업 - 민간', href: '/admin/companies?type=BUYER&subtype=PRIVATE_COMPANY' },
              { label: '고용의무기업 - 공공', href: '/admin/companies?type=BUYER&subtype=PUBLIC_INSTITUTION' },
              { label: '고용의무기업 - 국가/지자체', href: '/admin/companies?type=BUYER&subtype=GOVERNMENT' },
              { label: '표준사업장', href: '/admin/companies?type=SUPPLIER' },
            ]}
          />

          {/* 3. 고객관리자(바이어회원) 대시보드 */}
          <MenuCard
            title="🛍️ 고객관리자 대시보드"
            description="바이어 회원 전용 관리"
            badge="개발예정"
            badgeColor="#f57c00"
            items={[
              { label: '바이어 고용의무기업 - 민간', href: '#' },
              { label: '바이어 고용의무기업 - 공공', href: '#' },
              { label: '바이어 고용의무기업 - 국가', href: '#' },
              { label: '바이어 표준사업장', href: '#' },
            ]}
            disabled={true}
          />

          {/* 4. 장애인회원 대시보드 */}
          <MenuCard
            title="♿ 장애인회원 대시보드"
            description="장애인 직원 관리"
            badge="개발예정"
            badgeColor="#f57c00"
            items={[
              { label: '고용의무기업 소속 직원', href: '#' },
              { label: '표준사업장 소속 직원', href: '#' },
              { label: '근태 관리', href: '#' },
              { label: '휴가 관리', href: '#' },
            ]}
            disabled={true}
          />

        </div>

        {/* 빠른 통계 */}
        <div style={{ marginTop: 60 }}>
          <h2 style={{ marginBottom: 20, color: '#333' }}>📊 빠른 통계</h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 20,
            maxWidth: 1200,
          }}>
            <QuickStat title="전체 기업" value="?" color="#1976d2" />
            <QuickStat title="고용의무기업" value="?" color="#388e3c" />
            <QuickStat title="표준사업장" value="?" color="#f57c00" />
            <QuickStat title="매니저" value="?" color="#7b1fa2" />
            <QuickStat title="장애인 직원" value="?" color="#d32f2f" />
          </div>
        </div>
      </div>
    </div>
  );
}

// 메뉴 카드 컴포넌트
function MenuCard({ 
  title, 
  description, 
  badge, 
  badgeColor, 
  items, 
  disabled = false 
}: { 
  title: string; 
  description: string; 
  badge: string; 
  badgeColor: string; 
  items: { label: string; href: string }[]; 
  disabled?: boolean;
}) {
  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: 12,
      padding: 24,
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      opacity: disabled ? 0.6 : 1,
      border: disabled ? '2px dashed #ddd' : 'none',
    }}>
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <h3 style={{ margin: 0, fontSize: 18, color: '#333' }}>{title}</h3>
          <span style={{
            padding: '4px 12px',
            backgroundColor: badgeColor,
            color: 'white',
            borderRadius: 12,
            fontSize: 12,
            fontWeight: 'bold',
          }}>
            {badge}
          </span>
        </div>
        <p style={{ margin: 0, fontSize: 14, color: '#666' }}>{description}</p>
      </div>
      
      <div style={{ borderTop: '1px solid #e0e0e0', paddingTop: 16 }}>
        {items.map((item, index) => (
          disabled ? (
            <div
              key={index}
              style={{
                padding: '10px 0',
                fontSize: 14,
                color: '#999',
                cursor: 'not-allowed',
              }}
            >
              • {item.label}
            </div>
          ) : (
            <Link
              key={index}
              href={item.href}
              style={{
                display: 'block',
                padding: '10px 0',
                color: '#1976d2',
                textDecoration: 'none',
                fontSize: 14,
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.paddingLeft = '8px';
                e.currentTarget.style.color = '#0d47a1';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.paddingLeft = '0';
                e.currentTarget.style.color = '#1976d2';
              }}
            >
              • {item.label}
            </Link>
          )
        ))}
      </div>
    </div>
  );
}

// 빠른 통계 카드
function QuickStat({ title, value, color }: { title: string; value: string; color: string }) {
  return (
    <div style={{
      backgroundColor: 'white',
      padding: 20,
      borderRadius: 8,
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      borderLeft: `4px solid ${color}`,
    }}>
      <div style={{ fontSize: 13, color: '#666', marginBottom: 8 }}>{title}</div>
      <div style={{ fontSize: 28, fontWeight: 'bold', color }}>{value}</div>
    </div>
  );
}
