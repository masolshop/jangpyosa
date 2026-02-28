'use client';

import { useState, useEffect } from 'react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalBranches: 0,
    totalCompanies: 0,
    totalManagers: 0,
  });

  useEffect(() => {
    // TODO: API에서 통계 데이터 가져오기
    // 임시 데이터
    setStats({
      totalBranches: 0,
      totalCompanies: 0,
      totalManagers: 0,
    });
  }, []);

  return (
    <div style={{ padding: 40 }}>
      {/* 헤더 */}
      <div style={{ marginBottom: 40 }}>
        <h1 style={{ 
          margin: 0, 
          fontSize: 32, 
          fontWeight: 700,
          color: '#1a237e',
        }}>
          📊 대시보드
        </h1>
        <p style={{ 
          margin: '8px 0 0 0', 
          fontSize: 16, 
          color: '#666',
        }}>
          전체 현황을 한눈에 확인하세요
        </p>
      </div>

      {/* 통계 카드 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: 24,
        marginBottom: 40,
      }}>
        <StatCard
          title="본부/지사"
          value={stats.totalBranches}
          icon="🏢"
          color="#1976d2"
        />
        <StatCard
          title="등록 기업"
          value={stats.totalCompanies}
          icon="🏭"
          color="#388e3c"
        />
        <StatCard
          title="매니저"
          value={stats.totalManagers}
          icon="👔"
          color="#f57c00"
        />
      </div>

      {/* 빠른 링크 */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 32,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      }}>
        <h2 style={{ 
          margin: '0 0 24px 0', 
          fontSize: 20, 
          fontWeight: 600,
          color: '#333',
        }}>
          ⚡ 빠른 링크
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 16,
        }}>
          <QuickLink href="/admin/branches" icon="🏢" label="본부 관리" />
          <QuickLink href="/admin/companies" icon="🏭" label="기업 관리" />
        </div>
      </div>
    </div>
  );
}

// 통계 카드 컴포넌트
function StatCard({ 
  title, 
  value, 
  icon, 
  color 
}: { 
  title: string; 
  value: number; 
  icon: string; 
  color: string;
}) {
  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: 12,
      padding: 24,
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      borderLeft: `4px solid ${color}`,
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div>
          <p style={{ 
            margin: 0, 
            fontSize: 14, 
            color: '#666',
            fontWeight: 500,
          }}>
            {title}
          </p>
          <p style={{ 
            margin: '8px 0 0 0', 
            fontSize: 36, 
            fontWeight: 700,
            color,
          }}>
            {value}
          </p>
        </div>
        <div style={{ fontSize: 48, opacity: 0.2 }}>
          {icon}
        </div>
      </div>
    </div>
  );
}

// 빠른 링크 컴포넌트
function QuickLink({ 
  href, 
  icon, 
  label 
}: { 
  href: string; 
  icon: string; 
  label: string;
}) {
  return (
    <a
      href={href}
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '16px 20px',
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
        textDecoration: 'none',
        color: '#333',
        fontSize: 15,
        fontWeight: 500,
        transition: 'all 0.2s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = '#e3f2fd';
        e.currentTarget.style.transform = 'translateX(4px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = '#f5f5f5';
        e.currentTarget.style.transform = 'translateX(0)';
      }}
    >
      <span style={{ fontSize: 24, marginRight: 12 }}>{icon}</span>
      <span>{label}</span>
    </a>
  );
}
