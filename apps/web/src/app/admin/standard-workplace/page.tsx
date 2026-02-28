'use client';

import {
  StatCard,
  PageHeader,
  ContentCard,
  InfoCard,
  Placeholder,
} from '@/components/admin/AdminComponents';
import { COLORS, GRID_LAYOUTS, PAGE_STYLES } from '@/components/admin/adminStyles';

export default function StandardWorkplaceDashboard() {
  return (
    <div style={PAGE_STYLES.container}>
      <PageHeader
        icon="🏭"
        title="표준사업장 대시보드"
        description="표준사업장 통합 관리"
      />

      <div style={{ ...GRID_LAYOUTS.stats, marginBottom: 40 }}>
        <StatCard
          title="총 표준사업장"
          value="0"
          unit="개"
          color={COLORS.secondary}
        />
        <StatCard
          title="활성 사업장"
          value="0"
          unit="개"
          color={COLORS.success}
        />
        <StatCard
          title="총 근로자"
          value="0"
          unit="명"
          color={COLORS.warning}
        />
        <StatCard
          title="이번 달 신규"
          value="0"
          unit="개"
          color={COLORS.purple}
        />
      </div>

      <ContentCard title="표준사업장 현황">
        <div style={GRID_LAYOUTS.info}>
          <InfoCard
            icon="📍"
            title="지역별 분포"
            description="지역별 표준사업장 현황"
          />
          <InfoCard
            icon="👥"
            title="근로자 현황"
            description="장애인 근로자 고용 현황"
          />
          <InfoCard
            icon="📊"
            title="실적 통계"
            description="월별/연도별 실적 분석"
          />
          <InfoCard
            icon="⚙️"
            title="운영 관리"
            description="사업장 운영 상태 관리"
          />
        </div>
      </ContentCard>

      <div style={{ marginTop: 24 }}>
        <ContentCard title="표준사업장 목록">
          <Placeholder message="표준사업장 목록 및 관리 기능이 여기에 추가될 예정입니다." />
        </ContentCard>
      </div>
    </div>
  );
}
