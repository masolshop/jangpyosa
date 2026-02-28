// 슈퍼어드민 공통 컴포넌트

export interface StatCardProps {
  title: string;
  value: string | number;
  unit: string;
  color: string;
}

export function StatCard({ title, value, unit, color }: StatCardProps) {
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

export interface InfoCardProps {
  icon: string;
  title: string;
  description: string;
}

export function InfoCard({ icon, title, description }: InfoCardProps) {
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

export interface CategoryCardProps {
  title: string;
  count: number;
  color: string;
}

export function CategoryCard({ title, count, color }: CategoryCardProps) {
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

export interface TabButtonProps {
  label: string;
  active: boolean;
  onClick: () => void;
}

export function TabButton({ label, active, onClick }: TabButtonProps) {
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

export interface SubTabButtonProps {
  label: string;
  active: boolean;
  onClick: () => void;
}

export function SubTabButton({ label, active, onClick }: SubTabButtonProps) {
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

export interface PageHeaderProps {
  title: string;
  description: string;
  icon?: string;
}

export function PageHeader({ title, description, icon }: PageHeaderProps) {
  return (
    <div style={{ marginBottom: 30 }}>
      <h1 style={{
        fontSize: 32,
        fontWeight: 700,
        color: '#1a237e',
        marginBottom: 8,
      }}>
        {icon && `${icon} `}{title}
      </h1>
      <p style={{ fontSize: 16, color: '#666' }}>
        {description}
      </p>
    </div>
  );
}

export interface ContentCardProps {
  title?: string;
  children: React.ReactNode;
}

export function ContentCard({ title, children }: ContentCardProps) {
  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: 8,
      padding: 30,
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    }}>
      {title && (
        <h2 style={{
          fontSize: 20,
          fontWeight: 600,
          marginBottom: 20,
          color: '#333',
        }}>
          {title}
        </h2>
      )}
      {children}
    </div>
  );
}

export interface PlaceholderProps {
  message: string;
}

export function Placeholder({ message }: PlaceholderProps) {
  return (
    <div style={{
      padding: 20,
      backgroundColor: '#f5f5f5',
      borderRadius: 6,
      textAlign: 'center',
    }}>
      <p style={{ color: '#666', margin: 0 }}>
        {message}
      </p>
    </div>
  );
}
