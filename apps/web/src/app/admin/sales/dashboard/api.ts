// ==================== Dashboard API Service ====================

import { getApiBase, getManagerToken } from './utils';
import type {
  SalesPersonInfo,
  ManagerStats,
  ManagerCompany,
  BranchStats,
  BranchManager,
  HeadquartersStats,
  HeadquartersBranch,
  ReportData,
  ReportPeriod,
  BranchFormData,
  AvailableManager,
} from './types';

// API 요청 헬퍼
const fetchWithAuth = async (endpoint: string, options?: RequestInit) => {
  const token = getManagerToken();
  const API_BASE = getApiBase();
  
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `HTTP ${response.status}`);
  }
  
  return response.json();
};

// ==================== 인증 ====================

export const getAccountInfo = async (): Promise<SalesPersonInfo> => {
  const data = await fetchWithAuth('/sales/auth/me');
  const salesPerson = data.salesPerson || data;
  
  return {
    id: salesPerson.id,
    role: salesPerson.role,
    organizationName: salesPerson.organizationName,
    name: salesPerson.name,
    phone: salesPerson.phone,
    email: salesPerson.email,
  };
};

// ==================== 매니저 대시보드 ====================

export const getManagerStats = async (): Promise<ManagerStats> => {
  const data = await fetchWithAuth('/sales/dashboard/stats');
  const stats = data.stats || data;
  
  return {
    totalCompanies: stats.totalCompanies || 0,
    privateCompanies: stats.privateCompanies || 0,
    publicCompanies: stats.publicCompanies || 0,
    governmentCompanies: stats.governmentCompanies || 0,
    standardWorkplaces: stats.standardWorkplaces || 0,
    totalReferrals: stats.totalReferrals,
    activeReferrals: stats.activeReferrals,
    thisMonthReferrals: stats.thisMonthReferrals,
    thisWeekReferrals: stats.thisWeekReferrals,
  };
};

export const getManagerCompanies = async (): Promise<ManagerCompany[]> => {
  return await fetchWithAuth('/sales/dashboard/companies');
};

export const getManagerReports = async (
  period: ReportPeriod
): Promise<ReportData[]> => {
  const data = await fetchWithAuth(`/agent/reports/${period}`);
  return data.reports || [];
};

// ==================== 지사 대시보드 ====================

export const getBranchStats = async (): Promise<BranchStats> => {
  const data = await fetchWithAuth('/sales/dashboard/stats');
  const stats = data.stats || data;
  
  return {
    totalManagers: stats.managers || 0,
    totalCompanies: stats.totalCompanies || 0,
    privateCompanies: stats.privateCompanies || 0,
    publicCompanies: stats.publicCompanies || 0,
    governmentCompanies: stats.governmentCompanies || 0,
    standardWorkplaces: stats.standardWorkplaces || 0,
    totalReferrals: stats.totalReferrals,
    activeReferrals: stats.activeReferrals,
  };
};

export const getBranchManagers = async (): Promise<BranchManager[]> => {
  return await fetchWithAuth('/sales/dashboard/managers');
};

export const getBranchReports = async (
  branchId: string,
  period: ReportPeriod
): Promise<ReportData[]> => {
  const data = await fetchWithAuth(`/branch/${branchId}/reports/${period}`);
  return data.reports || [];
};

export const getBranchManagersList = async (
  branchId: string
): Promise<BranchManager[]> => {
  const data = await fetchWithAuth(`/sales/branches/${branchId}/managers`);
  return data.managers || [];
};

// ==================== 본부 대시보드 ====================

export const getHeadquartersStats = async (): Promise<HeadquartersStats> => {
  const data = await fetchWithAuth('/sales/dashboard/stats');
  const stats = data.stats || data;
  
  return {
    totalBranches: stats.branches || 0,
    totalManagers: stats.managers || 0,
    totalCompanies: stats.totalCompanies || 0,
    privateCompanies: stats.privateCompanies || 0,
    publicCompanies: stats.publicCompanies || 0,
    governmentCompanies: stats.governmentCompanies || 0,
    standardWorkplaces: stats.standardWorkplaces || 0,
    totalReferrals: stats.totalReferrals,
    activeReferrals: stats.activeReferrals,
  };
};

export const getHeadquartersBranches = async (): Promise<HeadquartersBranch[]> => {
  return await fetchWithAuth('/sales/dashboard/branches');
};

export const getHeadquartersReports = async (
  period: ReportPeriod
): Promise<ReportData[]> => {
  const data = await fetchWithAuth(`/headquarters/reports/${period}`);
  return data.reports || [];
};

// ==================== 지사 관리 ====================

export const searchAvailableManagers = async (
  query?: string
): Promise<AvailableManager[]> => {
  const url = query 
    ? `/sales/available-managers?search=${encodeURIComponent(query)}`
    : '/sales/available-managers';
  const data = await fetchWithAuth(url);
  return data.managers || [];
};

export const createBranch = async (
  formData: BranchFormData
): Promise<{ message: string }> => {
  return await fetchWithAuth('/sales/branches', {
    method: 'POST',
    body: JSON.stringify(formData),
  });
};

export const updateBranch = async (
  branchId: string,
  formData: BranchFormData
): Promise<{ message: string }> => {
  return await fetchWithAuth(`/sales/branches/${branchId}`, {
    method: 'PATCH',
    body: JSON.stringify(formData),
  });
};

export const deleteBranch = async (branchId: string): Promise<void> => {
  await fetchWithAuth(`/sales/branches/${branchId}`, {
    method: 'DELETE',
  });
};

export const transferManager = async (
  managerId: string,
  targetBranchId: string
): Promise<{ message: string }> => {
  return await fetchWithAuth(`/sales/managers/${managerId}/transfer`, {
    method: 'PATCH',
    body: JSON.stringify({ targetBranchId }),
  });
};
