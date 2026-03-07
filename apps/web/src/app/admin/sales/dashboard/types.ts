// ==================== Sales Dashboard Types ====================

export type SalesRole = 'MANAGER' | 'BRANCH_MANAGER' | 'HEAD_MANAGER';

export interface SalesPersonInfo {
  id: string;
  role: SalesRole;
  organizationName?: string;
  name: string;
  phone: string;
  email?: string;
}

// 매니저 대시보드 타입
export interface ManagerStats {
  totalCompanies: number;
  privateCompanies: number;
  publicCompanies: number;
  governmentCompanies: number;
  standardWorkplaces: number;
  totalReferrals?: number;
  activeReferrals?: number;
  thisMonthReferrals?: number;
  thisWeekReferrals?: number;
}

// 월별/분기별 리포트 타입
export type ReportPeriod = 'monthly' | 'quarterly';

export interface ReportData {
  month?: string;
  quarter?: string;
  totalReferrals: number;
  activeReferrals: number;
  privateCompanies: number;
  publicCompanies: number;
  governmentCompanies: number;
  standardWorkplaces: number;
}

export interface ManagerCompany {
  id: string;
  companyId: string;
  companyName: string;
  companyBizNo: string;
  company?: {
    id: string;
    name: string;
    bizNo: string;
    buyerType: string;
    representative?: string;
    createdAt: string;
    buyerProfile?: {
      employeeCount?: number;
      disabledCount?: number;
    };
  };
}

// 지사 대시보드 타입
export interface BranchStats {
  totalManagers: number;
  totalCompanies: number;
  privateCompanies: number;
  publicCompanies: number;
  governmentCompanies: number;
  standardWorkplaces: number;
  totalReferrals?: number;
  activeReferrals?: number;
}

export interface ManagerStatsData {
  민간기업?: number;
  공공기관?: number;
  정부교육기관?: number;
  표준사업장?: number;
  합계?: number;
  privateCompanies?: number;
  publicCompanies?: number;
  governmentCompanies?: number;
  standardWorkplaces?: number;
}

export interface BranchManager {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role: string;
  createdAt?: string;
  totalReferrals?: number;
  activeReferrals?: number;
  totalRevenue?: number;
  commission?: number;
  stats: ManagerStatsData;
}

// 본부 대시보드 타입
export interface HeadquartersStats {
  totalBranches: number;
  totalManagers: number;
  totalCompanies: number;
  privateCompanies: number;
  publicCompanies: number;
  governmentCompanies: number;
  standardWorkplaces: number;
  totalReferrals?: number;
  activeReferrals?: number;
}

export interface HeadquartersBranch {
  id: string;
  organizationName?: string;
  name: string;
  phone: string;
  email?: string;
  createdAt: string;
  managerCount: number;
  stats: {
    privateCompanies: number;
    publicCompanies: number;
    governmentCompanies: number;
    standardWorkplaces: number;
  };
}

// 지사 관리 폼 데이터
export interface BranchFormData {
  name: string;
  managerId: string;
  email: string;
  notes: string;
}

export interface AvailableManager {
  id: string;
  name: string;
  phone: string;
  email?: string;
}

// 메시지 타입
export interface Message {
  type: 'success' | 'error' | '';
  text: string;
}
