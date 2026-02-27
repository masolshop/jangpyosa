/**
 * 🎯 통합 API 유틸리티
 * 
 * 모든 Company → BuyerProfile → DisabledEmployee 데이터를
 * 일관된 방식으로 가져오는 유틸리티 함수들
 */

import { API_BASE } from './api';
import { getToken } from './auth';

// ============================================
// 타입 정의
// ============================================

export interface Company {
  id: string;
  name: string;
  bizNo: string;
  type: 'BUYER' | 'SUPPLIER';
  buyerType?: 'PRIVATE_COMPANY' | 'PUBLIC_INSTITUTION' | 'EDUCATION' | 'LOCAL_GOVERNMENT';
}

export interface BuyerProfile {
  id: string;
  companyId: string;
  employeeCount: number;
  disabledCount: number;
}

export interface DisabledEmployee {
  id: string;
  buyerId: string;
  name: string;
  phone?: string;
  registrationNumber?: string;
  disabilityType: string;
  disabilityGrade?: string;
  severity: 'MILD' | 'SEVERE';
  gender: 'M' | 'F';
  birthDate?: string | null;
  hireDate: string;
  resignDate?: string | null;
  monthlySalary: number;
  hasEmploymentInsurance: boolean;
  meetsMinimumWage: boolean;
  monthlyWorkHours?: number | null;
  workType?: 'OFFICE' | 'REMOTE' | 'HYBRID';
  memo?: string;
}

export interface CompanyWithEmployees {
  company: Company;
  profile: BuyerProfile;
  employees: DisabledEmployee[];
  summary: {
    totalEmployees: number;
    severeCount: number;
    mildCount: number;
    recognizedCount: number;
  };
}

// ============================================
// API 함수들
// ============================================

/**
 * 현재 로그인한 사용자의 회사 정보 가져오기
 */
export async function getCurrentUserCompany(): Promise<{ companyId: string; companyName: string; buyerId: string }> {
  const token = getToken();
  if (!token) {
    throw new Error('로그인이 필요합니다');
  }

  // localStorage에서 사용자 정보 가져오기
  const userStr = localStorage.getItem('user');
  if (!userStr) {
    throw new Error('사용자 정보를 찾을 수 없습니다');
  }

  const user = JSON.parse(userStr);
  
  // companyId가 있는지 확인
  if (!user.companyId) {
    throw new Error('회사 정보가 없습니다');
  }

  // 회사 상세 정보 가져오기 (buyerId 포함)
  const res = await fetch(`${API_BASE}/calculators/company/${user.companyId}/employees`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    throw new Error('회사 정보 조회 실패');
  }

  const data = await res.json();
  
  return {
    companyId: data.company.id,
    companyName: data.company.name,
    buyerId: data.profile.id,
  };
}

/**
 * 회사의 모든 장애인 직원 가져오기
 */
export async function getCompanyEmployees(companyId?: string): Promise<CompanyWithEmployees> {
  const token = getToken();
  if (!token) {
    throw new Error('로그인이 필요합니다');
  }

  // companyId가 없으면 현재 사용자의 회사 ID 사용
  if (!companyId) {
    const { companyId: currentCompanyId } = await getCurrentUserCompany();
    companyId = currentCompanyId;
  }

  const res = await fetch(`${API_BASE}/calculators/company/${companyId}/employees`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    throw new Error('직원 목록 조회 실패');
  }

  const data = await res.json();
  return data;
}

/**
 * 재직 중인 직원만 가져오기
 */
export async function getActiveEmployees(companyId?: string): Promise<DisabledEmployee[]> {
  const data = await getCompanyEmployees(companyId);
  return data.employees.filter(emp => !emp.resignDate);
}

/**
 * 퇴사한 직원 가져오기
 */
export async function getResignedEmployees(companyId?: string): Promise<DisabledEmployee[]> {
  const data = await getCompanyEmployees(companyId);
  return data.employees.filter(emp => emp.resignDate);
}

/**
 * 특정 직원 생성
 */
export async function createEmployee(employeeData: Partial<DisabledEmployee>): Promise<DisabledEmployee> {
  const token = getToken();
  if (!token) {
    throw new Error('로그인이 필요합니다');
  }

  const res = await fetch(`${API_BASE}/employees`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(employeeData),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || '직원 등록 실패');
  }

  return res.json();
}

/**
 * 특정 직원 수정
 */
export async function updateEmployee(employeeId: string, employeeData: Partial<DisabledEmployee>): Promise<DisabledEmployee> {
  const token = getToken();
  if (!token) {
    throw new Error('로그인이 필요합니다');
  }

  const res = await fetch(`${API_BASE}/employees/${employeeId}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(employeeData),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || '직원 수정 실패');
  }

  return res.json();
}

/**
 * 특정 직원 삭제
 */
export async function deleteEmployee(employeeId: string): Promise<void> {
  const token = getToken();
  if (!token) {
    throw new Error('로그인이 필요합니다');
  }

  const res = await fetch(`${API_BASE}/employees/${employeeId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || '직원 삭제 실패');
  }
}

/**
 * 월별 데이터 가져오기 (고용장려금부담금관리용)
 */
export async function getMonthlyData(year: number, companyId?: string) {
  const token = getToken();
  if (!token) {
    throw new Error('로그인이 필요합니다');
  }

  // companyId가 없으면 현재 사용자의 회사 ID 사용
  if (!companyId) {
    const { companyId: currentCompanyId } = await getCurrentUserCompany();
    companyId = currentCompanyId;
  }

  const res = await fetch(`${API_BASE}/employees/monthly?year=${year}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    throw new Error('월별 데이터 조회 실패');
  }

  return res.json();
}

/**
 * 월별 데이터 저장
 */
export async function saveMonthlyData(monthlyData: any[]) {
  const token = getToken();
  if (!token) {
    throw new Error('로그인이 필요합니다');
  }

  const res = await fetch(`${API_BASE}/employees/monthly`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ monthlyData }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || '월별 데이터 저장 실패');
  }

  return res.json();
}

// ============================================
// 유틸리티 함수
// ============================================

/**
 * 인정 인원 계산
 */
export function calculateRecognizedCount(employee: DisabledEmployee): number {
  // 중증 + 60시간 이상 = 2명
  if (employee.severity === 'SEVERE' && (employee.monthlyWorkHours || 0) >= 60) {
    return 2.0;
  }
  // 기타 = 1명
  return 1.0;
}

/**
 * 직원 통계 계산
 */
export function calculateEmployeeStats(employees: DisabledEmployee[]) {
  const activeEmployees = employees.filter(emp => !emp.resignDate);
  
  return {
    total: activeEmployees.length,
    severe: activeEmployees.filter(emp => emp.severity === 'SEVERE').length,
    mild: activeEmployees.filter(emp => emp.severity === 'MILD').length,
    female: activeEmployees.filter(emp => emp.gender === 'F').length,
    male: activeEmployees.filter(emp => emp.gender === 'M').length,
    recognized: activeEmployees.reduce((sum, emp) => sum + calculateRecognizedCount(emp), 0),
  };
}
