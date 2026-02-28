// 슈퍼어드민 공통 스타일 및 상수

export const COLORS = {
  primary: '#1a237e',
  secondary: '#1976d2',
  success: '#388e3c',
  warning: '#f57c00',
  error: '#d32f2f',
  info: '#0288d1',
  purple: '#7b1fa2',
  gray: {
    50: '#f5f5f5',
    100: '#e0e0e0',
    300: '#999',
    600: '#666',
    900: '#333',
  },
  white: '#fff',
  background: '#f5f5f5',
} as const;

export const GRID_LAYOUTS = {
  stats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: 24,
  } as React.CSSProperties,
  
  info: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: 20,
  } as React.CSSProperties,
  
  categories: {
    display: 'flex',
    gap: 16,
    flexWrap: 'wrap' as const,
  } as React.CSSProperties,
} as const;

export const PAGE_STYLES = {
  container: {
    padding: 40,
  } as React.CSSProperties,
  
  tabContainer: {
    display: 'flex',
    gap: 16,
    marginBottom: 30,
    borderBottom: '2px solid #e0e0e0',
  } as React.CSSProperties,
  
  subTabContainer: {
    display: 'flex',
    gap: 12,
    marginBottom: 30,
  } as React.CSSProperties,
} as const;
