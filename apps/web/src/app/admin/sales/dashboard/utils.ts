// ==================== Dashboard Utilities ====================

// 구매자 타입 레이블 변환
export const getBuyerTypeLabel = (type?: string): string => {
  if (!type) return '-';
  switch (type) {
    case 'PRIVATE_COMPANY': return '민간기업';
    case 'PUBLIC_INSTITUTION': return '공공기관';
    case 'GOVERNMENT': return '정부기관';
    case 'STANDARD_WORKPLACE': return '표준사업장';
    default: return type;
  }
};

// 구매자 타입 색상 클래스 반환
export const getBuyerTypeColorClass = (type?: string): string => {
  switch (type) {
    case 'PRIVATE_COMPANY':
      return 'bg-green-100 text-green-700';
    case 'PUBLIC_INSTITUTION':
      return 'bg-purple-100 text-purple-700';
    case 'GOVERNMENT':
      return 'bg-orange-100 text-orange-700';
    case 'STANDARD_WORKPLACE':
      return 'bg-red-100 text-red-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
};

// 통계 데이터 정규화
export const normalizeStats = (stats: any) => {
  return {
    privateCompanies: stats.민간기업 ?? stats.privateCompanies ?? 0,
    publicCompanies: stats.공공기관 ?? stats.publicCompanies ?? 0,
    governmentCompanies: stats.정부교육기관 ?? stats.governmentCompanies ?? 0,
    standardWorkplaces: stats.표준사업장 ?? stats.standardWorkplaces ?? 0,
    total: stats.합계 ?? (
      (stats.민간기업 ?? stats.privateCompanies ?? 0) +
      (stats.공공기관 ?? stats.publicCompanies ?? 0) +
      (stats.정부교육기관 ?? stats.governmentCompanies ?? 0) +
      (stats.표준사업장 ?? stats.standardWorkplaces ?? 0)
    ),
  };
};

// API 기본 URL
export const getApiBase = (): string => {
  if (typeof window === 'undefined') return '';
  return process.env.NEXT_PUBLIC_API_URL || 
    (window.location.hostname === 'jangpyosa.com' 
      ? 'https://jangpyosa.com/api' 
      : 'http://localhost:4000');
};

// 매니저 인증 토큰 관리
const MANAGER_TOKEN_KEY = 'manager_auth_token';
const MANAGER_INFO_KEY = 'manager_info';

export const getManagerToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(MANAGER_TOKEN_KEY);
};

export const setManagerToken = (token: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(MANAGER_TOKEN_KEY, token);
};

export const clearManagerAuth = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(MANAGER_TOKEN_KEY);
  localStorage.removeItem(MANAGER_INFO_KEY);
};
