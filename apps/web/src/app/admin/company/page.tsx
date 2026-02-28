'use client';

import { useState } from 'react';

type TabType = 'corporate' | 'buyer';
type SubTabType = 'obligation' | 'standard';

export default function CompanyDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('corporate');
  const [activeSubTab, setActiveSubTab] = useState<SubTabType>('obligation');

  return (
    <div style={{ padding: 40 }}>
      <div style={{ marginBottom: 30 }}>
        <h1 style={{
          fontSize: 32,
          fontWeight: 700,
          color: '#1a237e',
          marginBottom: 8,
        }}>
          🏢 기업관리 대시보드
        </h1>
        <p style={{ fontSize: 16, color: '#666' }}>
          기업회원 및 바이어 회원 통합 관리
        </p>
      </div>

      {/* 메인 탭 */}
      <div style={{
        display: 'flex',
        gap: 16,
        marginBottom: 30,
        borderBottom: '2px solid #e0e0e0',
      }}>
        <TabButton
          label="기업회원 대시보드"
          active={activeTab === 'corporate'}
          onClick={() => setActiveTab('corporate')}
        />
        <TabButton
          label="고객전용 바이어회원 대시보드"
          active={activeTab === 'buyer'}
          onClick={() => setActiveTab('buyer')}
        />
      </div>

      {/* 서브 탭 */}
      <div style={{
        display: 'flex',
        gap: 12,
        marginBottom: 30,
      }}>
        <SubTabButton
          label="고용의무기업"
          active={activeSubTab === 'obligation'}
          onClick={() => setActiveSubTab('obligation')}
        />
        <SubTabButton
          label={activeTab === 'buyer' ? '표준사업장-바이어' : '표준사업장'}
          active={activeSubTab === 'standard'}
          onClick={() => setActiveSubTab('standard')}
        />
      </div>

      {/* 컨텐츠 영역 */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: 8,
        padding: 30,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      }}>
        {activeTab === 'corporate' && activeSubTab === 'obligation' && (
          <ObligationCompanyContent />
        )}
        {activeTab === 'corporate' && activeSubTab === 'standard' && (
          <StandardWorkplaceContent />
        )}
        {activeTab === 'buyer' && activeSubTab === 'obligation' && (
          <BuyerObligationContent />
        )}
        {activeTab === 'buyer' && activeSubTab === 'standard' && (
          <BuyerStandardContent />
        )}
      </div>
    </div>
  );
}

function TabButton({ label, active, onClick }: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '12px 24px',
        fontSize: 16,
        fontWeight: active ? 600 : 400,
        color: active ? '#1a237e' : '#666',
        backgroundColor: 'transparent',
        border: 'none',
        borderBottom: active ? '3px solid #1a237e' : '3px solid transparent',
        cursor: 'pointer',
        transition: 'all 0.2s',
      }}
    >
      {label}
    </button>
  );
}

function SubTabButton({ label, active, onClick }: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '10px 20px',
        fontSize: 14,
        fontWeight: 500,
        color: active ? 'white' : '#666',
        backgroundColor: active ? '#1a237e' : '#f5f5f5',
        border: 'none',
        borderRadius: 6,
        cursor: 'pointer',
        transition: 'all 0.2s',
      }}
    >
      {label}
    </button>
  );
}

function ObligationCompanyContent() {
  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 20, color: '#333' }}>
        고용의무기업 관리
      </h2>

      <div style={{ marginBottom: 30 }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12, color: '#555' }}>
          📋 기업 분류
        </h3>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <CategoryCard title="민간기업" count={0} color="#1976d2" />
          <CategoryCard title="공공기관" count={0} color="#388e3c" />
          <CategoryCard title="국가지자체교육청" count={0} color="#f57c00" />
        </div>
      </div>

      <div style={{
        padding: 20,
        backgroundColor: '#f5f5f5',
        borderRadius: 6,
      }}>
        <p style={{ color: '#666', margin: 0 }}>
          고용의무기업 관리 기능이 여기에 추가될 예정입니다.
        </p>
      </div>
    </div>
  );
}

function StandardWorkplaceContent() {
  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 20, color: '#333' }}>
        표준사업장 관리
      </h2>
      <div style={{
        padding: 20,
        backgroundColor: '#f5f5f5',
        borderRadius: 6,
      }}>
        <p style={{ color: '#666', margin: 0 }}>
          표준사업장 관리 기능이 여기에 추가될 예정입니다.
        </p>
      </div>
    </div>
  );
}

function BuyerObligationContent() {
  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 20, color: '#333' }}>
        바이어 - 고용의무기업 관리
      </h2>

      <div style={{ marginBottom: 30 }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12, color: '#555' }}>
          📋 기업 분류
        </h3>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <CategoryCard title="민간기업" count={0} color="#1976d2" />
          <CategoryCard title="공공기관" count={0} color="#388e3c" />
          <CategoryCard title="국가지자체교육청" count={0} color="#f57c00" />
        </div>
      </div>

      <div style={{
        padding: 20,
        backgroundColor: '#f5f5f5',
        borderRadius: 6,
      }}>
        <p style={{ color: '#666', margin: 0 }}>
          바이어 고용의무기업 관리 기능이 여기에 추가될 예정입니다.
        </p>
      </div>
    </div>
  );
}

function BuyerStandardContent() {
  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 20, color: '#333' }}>
        표준사업장-바이어 관리
      </h2>
      <div style={{
        padding: 20,
        backgroundColor: '#f5f5f5',
        borderRadius: 6,
      }}>
        <p style={{ color: '#666', margin: 0 }}>
          표준사업장 바이어 관리 기능이 여기에 추가될 예정입니다.
        </p>
      </div>
    </div>
  );
}

function CategoryCard({ title, count, color }: {
  title: string;
  count: number;
  color: string;
}) {
  return (
    <div style={{
      flex: '1 1 200px',
      padding: 20,
      backgroundColor: 'white',
      border: `2px solid ${color}`,
      borderRadius: 8,
      textAlign: 'center',
    }}>
      <div style={{
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
      }}>
        {title}
      </div>
      <div style={{
        fontSize: 28,
        fontWeight: 700,
        color: color,
      }}>
        {count}
      </div>
    </div>
  );
}
