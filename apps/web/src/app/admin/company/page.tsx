'use client';

import { useState } from 'react';
import {
  PageHeader,
  TabButton,
  SubTabButton,
  ContentCard,
  CategoryCard,
  Placeholder,
} from '@/components/admin/AdminComponents';
import { COLORS, PAGE_STYLES } from '@/components/admin/adminStyles';

type TabType = 'corporate' | 'buyer';
type SubTabType = 'obligation' | 'standard';

export default function CompanyDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('corporate');
  const [activeSubTab, setActiveSubTab] = useState<SubTabType>('obligation');

  return (
    <div style={PAGE_STYLES.container}>
      <PageHeader
        icon="🏢"
        title="기업관리 대시보드"
        description="기업회원 및 바이어 회원 통합 관리"
      />

      {/* 메인 탭 */}
      <div style={PAGE_STYLES.tabContainer}>
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
      <div style={PAGE_STYLES.subTabContainer}>
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
      <ContentCard>
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
      </ContentCard>
    </div>
  );
}

function ObligationCompanyContent() {
  return (
    <>
      <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 20, color: COLORS.gray[900] }}>
        고용의무기업 관리
      </h2>

      <div style={{ marginBottom: 30 }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12, color: COLORS.gray[600] }}>
          📋 기업 분류
        </h3>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <CategoryCard title="민간기업" count={0} color={COLORS.secondary} />
          <CategoryCard title="공공기관" count={0} color={COLORS.success} />
          <CategoryCard title="국가지자체교육청" count={0} color={COLORS.warning} />
        </div>
      </div>

      <Placeholder message="고용의무기업 관리 기능이 여기에 추가될 예정입니다." />
    </>
  );
}

function StandardWorkplaceContent() {
  return (
    <>
      <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 20, color: COLORS.gray[900] }}>
        표준사업장 관리
      </h2>
      <Placeholder message="표준사업장 관리 기능이 여기에 추가될 예정입니다." />
    </>
  );
}

function BuyerObligationContent() {
  return (
    <>
      <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 20, color: COLORS.gray[900] }}>
        바이어 - 고용의무기업 관리
      </h2>

      <div style={{ marginBottom: 30 }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12, color: COLORS.gray[600] }}>
          📋 기업 분류
        </h3>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <CategoryCard title="민간기업" count={0} color={COLORS.secondary} />
          <CategoryCard title="공공기관" count={0} color={COLORS.success} />
          <CategoryCard title="국가지자체교육청" count={0} color={COLORS.warning} />
        </div>
      </div>

      <Placeholder message="바이어 고용의무기업 관리 기능이 여기에 추가될 예정입니다." />
    </>
  );
}

function BuyerStandardContent() {
  return (
    <>
      <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 20, color: COLORS.gray[900] }}>
        표준사업장-바이어 관리
      </h2>
      <Placeholder message="표준사업장 바이어 관리 기능이 여기에 추가될 예정입니다." />
    </>
  );
}
