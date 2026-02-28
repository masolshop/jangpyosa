'use client';

import { 
  StatCard, 
  PageHeader, 
  ContentCard, 
  Placeholder 
} from '@/components/admin/AdminComponents';
import { COLORS, GRID_LAYOUTS, PAGE_STYLES } from '@/components/admin/adminStyles';

export default function SalesDashboard() {
  return (
    <div style={PAGE_STYLES.container}>
      <PageHeader
        icon="📊"
        title="영업관리 대시보드"
        description="영업 현황 및 실적 관리"
      />

      <div style={{ ...GRID_LAYOUTS.stats, marginBottom: 40 }}>
        <StatCard
          title="총 영업 건수"
          value="0"
          unit="건"
          color={COLORS.secondary}
        />
        <StatCard
          title="이번 달 실적"
          value="0"
          unit="건"
          color={COLORS.success}
        />
        <StatCard
          title="진행 중"
          value="0"
          unit="건"
          color={COLORS.warning}
        />
      </div>

      <ContentCard title="영업 관리 기능">
        <Placeholder message="영업 관리 기능이 여기에 추가될 예정입니다." />
      </ContentCard>
    </div>
  );
}
