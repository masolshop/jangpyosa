import { get, post, put, del, APIError } from './api-client';

// ==================== 타입 정의 ====================

export interface Company {
  id: string;
  name: string;
  bizNo: string;
  representative?: string;
  type: string;
  buyerType?: string;
  isVerified: boolean;
  attachmentEmail?: string;
}

export interface BuyerProfile {
  id: string;
  companyId: string;
  employeeCount: number;
  disabledCount: number;
  hasLevyExemption: boolean;
}

export interface DisabledEmployee {
  id: string;
  buyerId: string;
  name: string;
  phone?: string;
  registrationNumber?: string;
  disabilityType: string;
  disabilityGrade?: string;
  severity: string;
  gender: string;
  birthDate?: string;
  hireDate: Date | string;
  resignDate?: Date | string | null;
  monthlySalary: number;
  hasEmploymentInsurance: boolean;
  meetsMinimumWage: boolean;
  workHoursPerWeek?: number;
  monthlyWorkHours?: number;
  workType: string;
  memo?: string;
}

export interface UserCompanyInfo {
  companyId: string;
  companyName: string;
  buyerId: string;
}

export interface AnnualLeaveBalance {
  id: string;
  employeeId: string;
  employeeName?: string;
  phone?: string;
  year: number;
  totalGenerated: number;
  baseLeave: number;
  bonusLeave: number;
  used: number;
  remaining: number;
  isUnderOneYear: boolean;
  expiryDate: string;
  workYears: number;
  workMonths: number;
}

// ==================== 캐시 관리 ====================

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

class APICache {
  private cache = new Map<string, CacheEntry<any>>();
  private ttl = 5 * 60 * 1000; // 5분

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  set<T>(key: string, data: T): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  invalidate(pattern?: string): void {
    if (!pattern) {
      this.cache.clear();
      return;
    }

    // Convert MapIterator to array to avoid TypeScript iterator error
    const keys = Array.from(this.cache.keys());
    for (const key of keys) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }
}

const cache = new APICache();

// ==================== 회사 관련 API ====================

/**
 * 현재 사용자의 회사 정보 조회 (캐싱)
 */
export async function getCurrentUserCompany(): Promise<UserCompanyInfo> {
  const cacheKey = 'current-user-company';
  const cached = cache.get<UserCompanyInfo>(cacheKey);
  if (cached) return cached;

  try {
    const response = await get<{
      company: Company;
      buyerProfile: BuyerProfile;
    }>('/companies/my');

    const result: UserCompanyInfo = {
      companyId: response.company.id,
      companyName: response.company.name,
      buyerId: response.buyerProfile.id
    };

    cache.set(cacheKey, result);
    return result;
  } catch (error) {
    if (error instanceof APIError && error.statusCode === 404) {
      throw new Error('회사 정보를 찾을 수 없습니다. 회사에 소속되어 있는지 확인해주세요.');
    }
    throw error;
  }
}

/**
 * 회사 목록 조회
 */
export async function getCompaniesList() {
  return get<{ companies: Company[] }>('/calculators/companies/list');
}

// ==================== 직원 관련 API ====================

/**
 * 회사의 직원 목록 조회 (캐싱)
 */
export async function getCompanyEmployees(companyId: string) {
  // ⚠️ 캐시 비활성화 (디버깅용)
  // const cacheKey = `company-employees-${companyId}`;
  // const cached = cache.get<DisabledEmployee[]>(cacheKey);
  // if (cached) return cached;

  const response = await get<{
    employees: DisabledEmployee[];
  }>(`/calculators/company/${companyId}/employees`);

  // cache.set(cacheKey, response.employees);
  return response.employees;
}

/**
 * 재직 중인 직원만 필터링
 */
export async function getActiveEmployees(companyId: string) {
  const employees = await getCompanyEmployees(companyId);
  return employees.filter(emp => !emp.resignDate);
}

/**
 * 직원 생성
 */
export async function createEmployee(data: Partial<DisabledEmployee>) {
  const result = await post<{ employee: DisabledEmployee }>('/employees', data);
  cache.invalidate('company-employees');
  cache.invalidate('annual-leave');
  return result.employee;
}

/**
 * 직원 수정
 */
export async function updateEmployee(id: string, data: Partial<DisabledEmployee>) {
  const result = await put<{ employee: DisabledEmployee }>(`/employees/${id}`, data);
  cache.invalidate('company-employees');
  cache.invalidate('annual-leave');
  return result.employee;
}

/**
 * 직원 삭제
 */
export async function deleteEmployee(id: string) {
  const result = await del(`/employees/${id}`);
  cache.invalidate('company-employees');
  cache.invalidate('annual-leave');
  return result;
}

// ==================== 연차 관련 API ====================

/**
 * 회사 전체 직원 연차 현황 조회 (캐싱)
 */
export async function getCompanyAnnualLeaves(companyId: string, year?: number) {
  const cacheKey = `annual-leave-company-${companyId}-${year || 'current'}`;
  const cached = cache.get<AnnualLeaveBalance[]>(cacheKey);
  if (cached) return cached;

  const response = await get<{
    company: Company;
    year: number;
    totalEmployees: number;
    balances: AnnualLeaveBalance[];
  }>(`/annual-leave/company/${companyId}`, { year });

  cache.set(cacheKey, response.balances);
  return response.balances;
}

/**
 * 개별 직원 연차 현황 조회
 */
export async function getEmployeeAnnualLeave(employeeId: string, year?: number) {
  return get<{
    balance: AnnualLeaveBalance;
    employee: {
      id: string;
      name: string;
      phone?: string;
      hireDate: Date;
    };
    usedLeaves: any[];
    promotion: {
      needsFirstNotice: boolean;
      needsSecondNotice: boolean;
      daysUntilExpiry: number;
    };
  }>(`/annual-leave/employee/${employeeId}`, { year });
}

/**
 * 연차 재계산 (배치)
 */
export async function recalculateAnnualLeaves(year?: number) {
  const result = await post('/annual-leave/recalculate', { year });
  cache.invalidate('annual-leave');
  return result;
}

// ==================== 월별 데이터 관련 API ====================

/**
 * 월별 직원 데이터 조회
 */
export async function getMonthlyData(year: number) {
  const companyInfo = await getCurrentUserCompany();
  
  return get<{
    year: number;
    companyName: string;
    companyType: string;
    monthlyData: Array<{
      year: number;
      month: number;
      totalEmployeeCount: number;
      disabledCount: number;
      recognizedCount: number;
      obligatedCount: number;
      incentiveBaselineCount: number;
      incentiveExcludedCount: number;
      incentiveEligibleCount: number;
      shortfallCount: number;
      levy: number;
      incentive: number;
      netAmount: number;
      details: any[];
    }>;
  }>(`/employees/monthly`, {
    year,
    buyerId: companyInfo.buyerId
  });
}

/**
 * 월별 데이터 저장
 */
export async function saveMonthlyData(year: number, monthlyData: Record<number, number>) {
  const result = await put('/employees/monthly', { year, monthlyData });
  cache.invalidate('monthly-data');
  return result;
}

// ==================== 캐시 제어 ====================

/**
 * 특정 패턴의 캐시 무효화
 */
export function invalidateCache(pattern?: string) {
  cache.invalidate(pattern);
}

/**
 * 모든 캐시 초기화
 */
export function clearCache() {
  cache.invalidate();
}
