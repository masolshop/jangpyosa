'use client';

export default function StandardWorkplaceDashboard() {
  return (
    <div style={{ padding: 40 }}>
      <div style={{ marginBottom: 30 }}>
        <h1 style={{
          fontSize: 32,
          fontWeight: 700,
          color: '#1a237e',
          marginBottom: 8,
        }}>
          🏭 표준사업장 대시보드
        </h1>
        <p style={{ fontSize: 16, color: '#666' }}>
          표준사업장 통합 관리
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: 24,
        marginBottom: 40,
      }}>
        <StatCard
          title="총 표준사업장"
          value="0"
          unit="개"
          color="#1976d2"
        />
        <StatCard
          title="활성 사업장"
          value="0"
          unit="개"
          color="#388e3c"
        />
        <StatCard
          title="총 근로자"
          value="0"
          unit="명"
          color="#f57c00"
        />
        <StatCard
          title="이번 달 신규"
          value="0"
          unit="개"
          color="#7b1fa2"
        />
      </div>

      <div style={{
        backgroundColor: 'white',
        borderRadius: 8,
        padding: 30,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        marginBottom: 24,
      }}>
        <h2 style={{
          fontSize: 20,
          fontWeight: 600,
          marginBottom: 20,
          color: '#333',
        }}>
          표준사업장 현황
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: 20,
        }}>
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
      </div>

      <div style={{
        backgroundColor: 'white',
        borderRadius: 8,
        padding: 30,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      }}>
        <h2 style={{
          fontSize: 20,
          fontWeight: 600,
          marginBottom: 20,
          color: '#333',
        }}>
          표준사업장 목록
        </h2>
        <div style={{
          padding: 20,
          backgroundColor: '#f5f5f5',
          borderRadius: 6,
          textAlign: 'center',
        }}>
          <p style={{ color: '#666', margin: 0 }}>
            표준사업장 목록 및 관리 기능이 여기에 추가될 예정입니다.
          </p>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, unit, color }: {
  title: string;
  value: string;
  unit: string;
  color: string;
}) {
  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: 8,
      padding: 24,
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      borderLeft: `4px solid ${color}`,
    }}>
      <div style={{
        fontSize: 14,
        color: '#666',
        marginBottom: 12,
      }}>
        {title}
      </div>
      <div style={{
        fontSize: 32,
        fontWeight: 700,
        color: color,
      }}>
        {value}
        <span style={{
          fontSize: 18,
          fontWeight: 400,
          marginLeft: 4,
        }}>
          {unit}
        </span>
      </div>
    </div>
  );
}

function InfoCard({ icon, title, description }: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div style={{
      padding: 20,
      backgroundColor: '#f8f9fa',
      borderRadius: 8,
      border: '1px solid #e0e0e0',
    }}>
      <div style={{
        fontSize: 32,
        marginBottom: 12,
      }}>
        {icon}
      </div>
      <h3 style={{
        fontSize: 16,
        fontWeight: 600,
        marginBottom: 8,
        color: '#333',
      }}>
        {title}
      </h3>
      <p style={{
        fontSize: 14,
        color: '#666',
        margin: 0,
      }}>
        {description}
      </p>
    </div>
  );
}
