'use client';

export default function SalesDashboard() {
  return (
    <div style={{ padding: 40 }}>
      <div style={{
        marginBottom: 30,
      }}>
        <h1 style={{
          fontSize: 32,
          fontWeight: 700,
          color: '#1a237e',
          marginBottom: 8,
        }}>
          📊 영업관리 대시보드
        </h1>
        <p style={{
          fontSize: 16,
          color: '#666',
        }}>
          영업 현황 및 실적 관리
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: 24,
        marginBottom: 40,
      }}>
        <StatCard
          title="총 영업 건수"
          value="0"
          unit="건"
          color="#1976d2"
        />
        <StatCard
          title="이번 달 실적"
          value="0"
          unit="건"
          color="#388e3c"
        />
        <StatCard
          title="진행 중"
          value="0"
          unit="건"
          color="#f57c00"
        />
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
          영업 관리 기능
        </h2>
        <p style={{ color: '#666' }}>
          영업 관리 기능이 여기에 추가될 예정입니다.
        </p>
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
