"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 
  (typeof window !== 'undefined' && window.location.hostname === 'jangpyosa.com' 
    ? 'https://jangpyosa.com/api' 
    : 'http://localhost:4000');

// 매니저 전용 인증 토큰 관리
const MANAGER_TOKEN_KEY = 'manager_auth_token';
const MANAGER_INFO_KEY = 'manager_info';

const getManagerToken = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(MANAGER_TOKEN_KEY);
};

const clearManagerAuth = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(MANAGER_TOKEN_KEY);
  localStorage.removeItem(MANAGER_INFO_KEY);
};

// ==================== 타입 정의 ====================

interface SalesPersonInfo {
  id: string;
  role: 'MANAGER' | 'BRANCH_MANAGER' | 'HEAD_MANAGER';
  organizationName?: string;
  name: string;
  phone: string;
  email?: string;
}

// 매니저 대시보드 타입
interface ManagerStats {
  totalCompanies: number;
  privateCompanies: number;
  publicCompanies: number;
  governmentCompanies: number;
}

interface ManagerCompany {
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
interface BranchStats {
  totalManagers: number;
  totalCompanies: number;
  privateCompanies: number;
  publicCompanies: number;
  governmentCompanies: number;
}

interface BranchManager {
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
  stats: {
    민간기업: number;
    공공기관: number;
    정부교육기관: number;
    합계: number;
  } | {
    privateCompanies: number;
    publicCompanies: number;
    governmentCompanies: number;
  };
}

// 본부 대시보드 타입
interface HeadquartersStats {
  totalBranches: number;
  totalManagers: number;
  totalCompanies: number;
  privateCompanies: number;
  publicCompanies: number;
  governmentCompanies: number;
}

interface HeadquartersBranch {
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
  };
}

// ==================== 공통 컴포넌트 ====================

const StatCard = ({ 
  icon, 
  title, 
  value, 
  unit = "개",
  color = "blue" 
}: { 
  icon: string;
  title: string;
  value: number;
  unit?: string;
  color?: string;
}) => {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    purple: "bg-purple-50 text-purple-600",
    orange: "bg-orange-50 text-orange-600",
    red: "bg-red-50 text-red-600",
  };
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">
            {value.toLocaleString()}
            <span className="text-sm font-normal ml-1">{unit}</span>
          </p>
        </div>
        <div className={`p-3 rounded-full ${colorClasses[color as keyof typeof colorClasses]}`}>
          <span className="text-2xl">{icon}</span>
        </div>
      </div>
    </div>
  );
};

const InfoRow = ({ label, value }: { label: string; value?: string }) => (
  <div className="flex justify-between py-2 border-b border-gray-100 last:border-0">
    <span className="text-gray-600 font-medium">{label}</span>
    <span className="text-gray-900">{value || '-'}</span>
  </div>
);

// ==================== 매니저 대시보드 ====================

const ManagerDashboard = ({ 
  accountInfo, 
  stats, 
  companies 
}: { 
  accountInfo: SalesPersonInfo;
  stats: ManagerStats;
  companies: ManagerCompany[];
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  const filteredCompanies = companies.filter(c => {
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'private') return c.company?.buyerType === 'PRIVATE_COMPANY';
    if (selectedCategory === 'public') return c.company?.buyerType === 'PUBLIC_INSTITUTION';
    if (selectedCategory === 'government') return c.company?.buyerType === 'GOVERNMENT';
    return true;
  });
  
  const getBuyerTypeLabel = (type?: string) => {
    if (!type) return '-';
    switch (type) {
      case 'PRIVATE_COMPANY': return '민간기업';
      case 'PUBLIC_INSTITUTION': return '공공기관';
      case 'GOVERNMENT': return '정부기관';
      default: return type;
    }
  };
  
  return (
    <div className="space-y-6">
      {/* 계정 정보 */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-xl font-bold mb-4 flex items-center">
          <span className="mr-2">👤</span>
          계정 정보
        </h2>
        <InfoRow label="이름" value={accountInfo.name} />
        <InfoRow label="전화번호" value={accountInfo.phone} />
        <InfoRow label="이메일" value={accountInfo.email} />
        <InfoRow label="역할" value="매니저" />
      </div>

      {/* 통계 요약 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon="🏢"
          title="총 추천 의무고용기업"
          value={stats.totalCompanies}
          color="blue"
        />
        <StatCard
          icon="🏭"
          title="민간기업"
          value={stats.privateCompanies}
          color="green"
        />
        <StatCard
          icon="🏛️"
          title="공공기관"
          value={stats.publicCompanies}
          color="purple"
        />
        <StatCard
          icon="🏫"
          title="정부교육기관"
          value={stats.governmentCompanies}
          color="orange"
        />
      </div>

      {/* 추천 기업 리스트 */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold flex items-center">
            <span className="mr-2">📋</span>
            추천 기업 리스트
          </h2>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">전체 ({stats.totalCompanies})</option>
            <option value="private">민간기업 ({stats.privateCompanies})</option>
            <option value="public">공공기관 ({stats.publicCompanies})</option>
            <option value="government">정부교육기관 ({stats.governmentCompanies})</option>
          </select>
        </div>
        
        {filteredCompanies.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            추천한 기업이 없습니다
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">기업명</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">사업자번호</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">대표자</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">구분</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">직원수</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">장애인수</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredCompanies.map((company) => (
                  <tr key={company.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {company.companyName || company.company?.name}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {company.companyBizNo || company.company?.bizNo}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {company.company?.representative || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        company.company?.buyerType === 'PRIVATE_COMPANY' ? 'bg-green-100 text-green-700' :
                        company.company?.buyerType === 'PUBLIC_INSTITUTION' ? 'bg-purple-100 text-purple-700' :
                        company.company?.buyerType === 'GOVERNMENT' ? 'bg-orange-100 text-orange-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {getBuyerTypeLabel(company.company?.buyerType)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {company.company?.buyerProfile?.employeeCount?.toLocaleString() || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {company.company?.buyerProfile?.disabledCount?.toLocaleString() || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

// ==================== 지사 대시보드 ====================

const BranchDashboard = ({ 
  accountInfo, 
  stats, 
  managers 
}: { 
  accountInfo: SalesPersonInfo;
  stats: BranchStats;
  managers: BranchManager[];
}) => {
  return (
    <div className="space-y-6">
      {/* 계정 정보 */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-xl font-bold mb-4 flex items-center">
          <span className="mr-2">🏪</span>
          지사 정보
        </h2>
        <InfoRow label="지사명" value={accountInfo.organizationName} />
        <InfoRow label="지사장명" value={accountInfo.name} />
        <InfoRow label="전화번호" value={accountInfo.phone} />
        <InfoRow label="이메일" value={accountInfo.email} />
      </div>

      {/* 통계 요약 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          icon="👥"
          title="소속 매니저"
          value={stats.totalManagers}
          unit="명"
          color="blue"
        />
        <StatCard
          icon="🏢"
          title="총 추천기업"
          value={stats.totalCompanies}
          color="blue"
        />
        <StatCard
          icon="🏭"
          title="민간기업"
          value={stats.privateCompanies}
          color="green"
        />
        <StatCard
          icon="🏛️"
          title="공공기관"
          value={stats.publicCompanies}
          color="purple"
        />
        <StatCard
          icon="🏫"
          title="정부교육기관"
          value={stats.governmentCompanies}
          color="orange"
        />
      </div>

      {/* 매니저 리스트 */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-xl font-bold mb-4 flex items-center">
          <span className="mr-2">👥</span>
          소속 매니저 리스트
        </h2>
        
        {managers.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            소속 매니저가 없습니다
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">이름</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">전화번호</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">이메일</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">민간기업</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">공공기관</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">정부교육기관</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">합계</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {managers.map((manager) => {
                  const stats = manager.stats as any;
                  const privateCount = stats.privateCompanies ?? 0;
                  const publicCount = stats.publicCompanies ?? 0;
                  const governmentCount = stats.governmentCompanies ?? 0;
                  const total = privateCount + publicCount + governmentCount;
                  
                  return (
                    <tr key={manager.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{manager.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{manager.phone}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{manager.email || '-'}</td>
                      <td className="px-4 py-3 text-sm text-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {privateCount}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          {publicCount}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                          {governmentCount}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {total}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

// ==================== 본부 대시보드 ====================

const HeadquartersDashboard = ({ 
  accountInfo, 
  stats, 
  branches 
}: { 
  accountInfo: SalesPersonInfo;
  stats: HeadquartersStats;
  branches: HeadquartersBranch[];
}) => {
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null);
  const [branchManagers, setBranchManagers] = useState<BranchManager[]>([]);
  const [loadingManagers, setLoadingManagers] = useState(false);
  
  // 지사 관리 모달
  const [showBranchModal, setShowBranchModal] = useState(false);
  const [editingBranch, setEditingBranch] = useState<any>(null);
  const [branchFormData, setBranchFormData] = useState({
    name: '',
    leaderName: '',
    phone: '',
    email: '',
    notes: ''
  });
  
  // 매니저 이동 모달
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferManager, setTransferManager] = useState<any>(null);
  const [targetBranchId, setTargetBranchId] = useState('');
  
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const loadBranchManagers = async (branchId: string) => {
    setLoadingManagers(true);
    try {
      const token = getManagerToken();
      const response = await fetch(`${API_BASE}/sales/branches/${branchId}/managers`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to load branch managers');
      }
      
      const data = await response.json();
      setBranchManagers(data.managers || []);
    } catch (error) {
      console.error('Failed to load branch managers:', error);
      setBranchManagers([]);
    } finally {
      setLoadingManagers(false);
    }
  };
  
  const handleBranchClick = (branchId: string) => {
    if (selectedBranchId === branchId) {
      setSelectedBranchId(null);
      setBranchManagers([]);
    } else {
      setSelectedBranchId(branchId);
      loadBranchManagers(branchId);
    }
  };
  
  // 지사 생성 모달 열기
  const handleCreateBranch = () => {
    setEditingBranch(null);
    setBranchFormData({
      name: '',
      leaderName: '',
      phone: '',
      email: '',
      notes: ''
    });
    setShowBranchModal(true);
  };
  
  // 지사 수정 모달 열기
  const handleEditBranch = (branch: any) => {
    setEditingBranch(branch);
    setBranchFormData({
      name: branch.organizationName || branch.name || '',
      leaderName: branch.name || '',
      phone: branch.phone || '',
      email: branch.email || '',
      notes: ''
    });
    setShowBranchModal(true);
  };
  
  // 지사 저장
  const handleSaveBranch = async () => {
    try {
      const token = getManagerToken();
      const url = editingBranch 
        ? `${API_BASE}/sales/branches/${editingBranch.id}`
        : `${API_BASE}/sales/branches`;
      const method = editingBranch ? 'PATCH' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(branchFormData),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save branch');
      }
      
      setMessage({ type: 'success', text: editingBranch ? '지사가 수정되었습니다' : '지사가 생성되었습니다' });
      setShowBranchModal(false);
      window.location.reload(); // 새로고침하여 목록 업데이트
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    }
  };
  
  // 지사 삭제
  const handleDeleteBranch = async (branchId: string) => {
    if (!confirm('정말 이 지사를 삭제하시겠습니까?')) return;
    
    try {
      const token = getManagerToken();
      const response = await fetch(`${API_BASE}/sales/branches/${branchId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete branch');
      }
      
      setMessage({ type: 'success', text: '지사가 삭제되었습니다' });
      window.location.reload();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    }
  };
  
  // 매니저 이동 모달 열기
  const handleTransferManager = (manager: any) => {
    setTransferManager(manager);
    setTargetBranchId('');
    setShowTransferModal(true);
  };
  
  // 매니저 이동 실행
  const handleConfirmTransfer = async () => {
    if (!targetBranchId) {
      setMessage({ type: 'error', text: '이동할 지사를 선택해주세요' });
      return;
    }
    
    try {
      const token = getManagerToken();
      const response = await fetch(`${API_BASE}/sales/managers/${transferManager.id}/transfer`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ targetBranchId }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to transfer manager');
      }
      
      const result = await response.json();
      setMessage({ type: 'success', text: result.message });
      setShowTransferModal(false);
      
      // 현재 지사의 매니저 목록 새로고침
      if (selectedBranchId) {
        loadBranchManagers(selectedBranchId);
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    }
  };
  
  return (
    <div className="space-y-6">
      {/* 계정 정보 */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-xl font-bold mb-4 flex items-center">
          <span className="mr-2">🏢</span>
          본부 정보
        </h2>
        <InfoRow label="본부명" value={accountInfo.organizationName} />
        <InfoRow label="본부장명" value={accountInfo.name} />
        <InfoRow label="전화번호" value={accountInfo.phone} />
        <InfoRow label="이메일" value={accountInfo.email} />
      </div>

      {/* 지사 관리 버튼 */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-xl font-bold mb-4 flex items-center">
          <span className="mr-2">⚙️</span>
          본부장 지사 관리 권한
        </h2>
        <div className="flex gap-4">
          <button
            onClick={handleCreateBranch}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 font-semibold"
          >
            <span>🏢</span>
            지사 생성
          </button>
          <button
            onClick={() => {
              if (branches.length === 0) {
                setMessage({ type: 'error', text: '수정할 지사가 없습니다' });
                return;
              }
              setMessage({ type: 'success', text: '아래 지사 목록에서 각 지사의 "수정" 버튼을 클릭하세요' });
              // 지사 목록으로 스크롤
              document.querySelector('[class*="소속 지사 리스트"]')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2 font-semibold"
          >
            <span>✏️</span>
            지사 수정
          </button>
          <button
            onClick={() => {
              if (branches.length === 0) {
                setMessage({ type: 'error', text: '삭제할 지사가 없습니다' });
                return;
              }
              setMessage({ type: 'success', text: '아래 지사 목록에서 각 지사의 "삭제" 버튼을 클릭하세요' });
              // 지사 목록으로 스크롤
              document.querySelector('[class*="소속 지사 리스트"]')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center justify-center gap-2 font-semibold"
          >
            <span>🗑️</span>
            지사 삭제
          </button>
        </div>
        <p className="mt-4 text-sm text-gray-600">
          💡 본부장은 소속 지사를 생성, 수정, 삭제할 수 있으며, 매니저를 다른 지사로 이동시킬 수 있습니다.
        </p>
      </div>

      {/* 통계 요약 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <StatCard
          icon="🏪"
          title="소속 지사"
          value={stats.totalBranches}
          unit="개"
          color="blue"
        />
        <StatCard
          icon="👥"
          title="소속 매니저"
          value={stats.totalManagers}
          unit="명"
          color="blue"
        />
        <StatCard
          icon="🏢"
          title="총 추천기업"
          value={stats.totalCompanies}
          color="blue"
        />
        <StatCard
          icon="🏭"
          title="민간기업"
          value={stats.privateCompanies}
          color="green"
        />
        <StatCard
          icon="🏛️"
          title="공공기관"
          value={stats.publicCompanies}
          color="purple"
        />
        <StatCard
          icon="🏫"
          title="정부교육기관"
          value={stats.governmentCompanies}
          color="orange"
        />
      </div>

      {/* 메시지 표시 */}
      {message.text && (
        <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
          {message.text}
        </div>
      )}

      {/* 지사 리스트 */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold flex items-center">
            <span className="mr-2">🏪</span>
            소속 지사 리스트
          </h2>
          <button
            onClick={handleCreateBranch}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <span>➕</span>
            지사 생성
          </button>
        </div>
        
        {branches.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            소속 지사가 없습니다
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">지사명</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">지사장</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">전화번호</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">매니저</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">민간기업</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">공공기관</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">정부교육기관</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">합계</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">관리</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {branches.map((branch) => {
                  const total = branch.stats.privateCompanies + branch.stats.publicCompanies + branch.stats.governmentCompanies;
                  const isExpanded = selectedBranchId === branch.id;
                  
                  return (
                    <>
                      <tr 
                        key={branch.id} 
                        className="hover:bg-gray-50"
                      >
                        <td 
                          className="px-4 py-3 text-sm font-medium text-gray-900 cursor-pointer"
                          onClick={() => handleBranchClick(branch.id)}
                        >
                          <div className="flex items-center">
                            <span className="mr-2">{isExpanded ? '▼' : '▶'}</span>
                            {branch.organizationName || '-'}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">{branch.name}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{branch.phone}</td>
                        <td className="px-4 py-3 text-sm text-center">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {branch.managerCount}명
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-center">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {branch.stats.privateCompanies}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-center">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            {branch.stats.publicCompanies}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-center">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                            {branch.stats.governmentCompanies}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-center">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {total}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditBranch(branch);
                              }}
                              className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                            >
                              수정
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteBranch(branch.id);
                              }}
                              className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                            >
                              삭제
                            </button>
                          </div>
                        </td>
                      </tr>
                      
                      {/* 매니저 리스트 (확장 시) */}
                      {isExpanded && (
                        <tr key={`${branch.id}-managers`}>
                          <td colSpan={9} className="px-4 py-4 bg-gray-50">
                            {loadingManagers ? (
                              <div className="text-center py-4 text-gray-500">
                                매니저 정보를 불러오는 중...
                              </div>
                            ) : branchManagers.length === 0 ? (
                              <div className="text-center py-4 text-gray-500">
                                소속 매니저가 없습니다
                              </div>
                            ) : (
                              <div className="ml-8">
                                <h4 className="font-semibold text-gray-700 mb-3">
                                  📋 소속 매니저 리스트
                                </h4>
                                <table className="w-full bg-white rounded-lg shadow-sm">
                                  <thead className="bg-gray-100">
                                    <tr>
                                      <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">지사명</th>
                                      <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">지사장</th>
                                      <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">전화번호</th>
                                      <th className="px-4 py-2 text-center text-sm font-semibold text-gray-700">매니저</th>
                                      <th className="px-4 py-2 text-center text-sm font-semibold text-gray-700">민간기업</th>
                                      <th className="px-4 py-2 text-center text-sm font-semibold text-gray-700">공공기관</th>
                                      <th className="px-4 py-2 text-center text-sm font-semibold text-gray-700">정부교육기관</th>
                                      <th className="px-4 py-2 text-center text-sm font-semibold text-gray-700">합계</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-gray-200">
                                    {branchManagers.map((manager) => {
                                      const stats = manager.stats as any;
                                      const 민간 = stats.민간기업 ?? stats.privateCompanies ?? 0;
                                      const 공공 = stats.공공기관 ?? stats.publicCompanies ?? 0;
                                      const 정부 = stats.정부교육기관 ?? stats.governmentCompanies ?? 0;
                                      const 합계 = stats.합계 ?? (민간 + 공공 + 정부);
                                      
                                      return (
                                        <tr key={manager.id} className="hover:bg-gray-50">
                                          <td className="px-4 py-2 text-sm text-gray-900">{manager.name}</td>
                                          <td className="px-4 py-2 text-sm text-gray-600">{manager.phone}</td>
                                          <td className="px-4 py-2 text-sm text-gray-600">{manager.email || '-'}</td>
                                          <td className="px-4 py-2 text-sm text-center">
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                              {manager.role === 'BRANCH_MANAGER' ? '지사장' : '매니저'}
                                            </span>
                                          </td>
                                          <td className="px-4 py-2 text-sm text-center">
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                              {민간}
                                            </span>
                                          </td>
                                          <td className="px-4 py-2 text-sm text-center">
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                                              {공공}
                                            </span>
                                          </td>
                                          <td className="px-4 py-2 text-sm text-center">
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800">
                                              {정부}
                                            </span>
                                          </td>
                                          <td className="px-4 py-2 text-sm text-center">
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                              {합계}
                                            </span>
                                          </td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              </div>
                            )}
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

// ==================== 메인 대시보드 페이지 ====================

export default function SalesDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  
  // 계정 정보
  const [accountInfo, setAccountInfo] = useState<SalesPersonInfo | null>(null);
  
  // 매니저 데이터
  const [managerStats, setManagerStats] = useState<ManagerStats | null>(null);
  const [managerCompanies, setManagerCompanies] = useState<ManagerCompany[]>([]);
  
  // 지사 데이터
  const [branchStats, setBranchStats] = useState<BranchStats | null>(null);
  const [branchManagers, setBranchManagers] = useState<BranchManager[]>([]);
  
  // 본부 데이터
  const [headquartersStats, setHeadquartersStats] = useState<HeadquartersStats | null>(null);
  const [headquartersBranches, setHeadquartersBranches] = useState<HeadquartersBranch[]>([]);

  useEffect(() => {
    console.log('[Dashboard] Component mounted');
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    console.log('[Dashboard] loadDashboard called');
    const token = getManagerToken();
    console.log('[Dashboard] Token:', token ? 'exists' : 'not found');
    
    if (!token) {
      console.log('[Dashboard] No token, redirecting to login');
      router.push('/admin/sales');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // 1. 계정 정보 가져오기
      console.log('[Dashboard] Fetching account info...');
      const meResponse = await fetch(`${API_BASE}/sales/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('[Dashboard] /sales/auth/me response status:', meResponse.status);

      if (!meResponse.ok) {
        const errorText = await meResponse.text();
        console.error('[Dashboard] Auth failed:', errorText);
        throw new Error('인증이 만료되었습니다');
      }

      const meData = await meResponse.json();
      console.log('[Dashboard] Raw API response:', meData);
      
      // API returns { salesPerson: {...} }
      const salesPerson = meData.salesPerson || meData;
      console.log('[Dashboard] SalesPerson data:', salesPerson);
      
      const role = salesPerson.role;
      console.log('[Dashboard] User role:', role);
      
      if (!role) {
        console.error('[Dashboard] Role is undefined! SalesPerson:', salesPerson);
        throw new Error('역할 정보를 찾을 수 없습니다');
      }
      
      setAccountInfo({
        id: salesPerson.id,
        role: role,
        organizationName: salesPerson.organizationName,
        name: salesPerson.name,
        phone: salesPerson.phone,
        email: salesPerson.email,
      });

      // 2. 역할별 데이터 로드
      console.log('[Dashboard] Loading role-specific data...');
      if (role === 'MANAGER') {
        await loadManagerDashboard(token);
      } else if (role === 'BRANCH_MANAGER') {
        await loadBranchDashboard(token);
      } else if (role === 'HEAD_MANAGER') {
        await loadHeadquartersDashboard(token);
      }

      console.log('[Dashboard] Dashboard loaded successfully');

    } catch (error: any) {
      console.error('[Dashboard] Dashboard load error:', error);
      console.error('[Dashboard] Error message:', error.message);
      console.error('[Dashboard] Error stack:', error.stack);
      setError(error.message || '대시보드를 불러오는데 실패했습니다');
      if (error.message.includes('인증')) {
        console.log('[Dashboard] Auth error, clearing and redirecting');
        clearManagerAuth();
        setTimeout(() => {
          router.push('/admin/sales');
        }, 100);
      }
    } finally {
      console.log('[Dashboard] Setting loading to false');
      setLoading(false);
    }
  };

  const loadManagerDashboard = async (token: string) => {
    try {
      // 통계
      console.log('[Dashboard] Fetching manager stats...');
      const statsResponse = await fetch(`${API_BASE}/sales/dashboard/stats`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      console.log('[Dashboard] Stats response status:', statsResponse.status);
      
      if (statsResponse.ok) {
        const data = await statsResponse.json();
        console.log('[Dashboard] Stats data:', data);
        // API returns { role, name, phone, email, stats: {...} }
        const stats = data.stats || data;
        setManagerStats({
          totalCompanies: stats.totalCompanies || 0,
          privateCompanies: stats.privateCompanies || 0,
          publicCompanies: stats.publicCompanies || 0,
          governmentCompanies: stats.governmentCompanies || 0,
        });
      } else {
        const errorText = await statsResponse.text();
        console.error('[Dashboard] Stats error:', errorText);
        // 기본값 설정
        setManagerStats({
          totalCompanies: 0,
          privateCompanies: 0,
          publicCompanies: 0,
          governmentCompanies: 0,
        });
      }

      // 추천 기업 리스트
      console.log('[Dashboard] Fetching companies...');
      const companiesResponse = await fetch(`${API_BASE}/sales/dashboard/companies`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      console.log('[Dashboard] Companies response status:', companiesResponse.status);
      
      if (companiesResponse.ok) {
        const companies = await companiesResponse.json();
        console.log('[Dashboard] Companies count:', companies.length);
        setManagerCompanies(companies);
      } else {
        const errorText = await companiesResponse.text();
        console.error('[Dashboard] Companies error:', errorText);
        setManagerCompanies([]);
      }
    } catch (error) {
      console.error('[Dashboard] Manager dashboard load error:', error);
      // 기본값 설정
      setManagerStats({
        totalCompanies: 0,
        privateCompanies: 0,
        publicCompanies: 0,
        governmentCompanies: 0,
      });
      setManagerCompanies([]);
    }
  };

  const loadBranchDashboard = async (token: string) => {
    try {
      // 통계
      console.log('[Dashboard] Fetching branch stats...');
      const statsResponse = await fetch(`${API_BASE}/sales/dashboard/stats`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      console.log('[Dashboard] Branch stats response status:', statsResponse.status);
      
      if (statsResponse.ok) {
        const data = await statsResponse.json();
        console.log('[Dashboard] Branch stats data:', data);
        // API returns { role, name, phone, email, stats: {...} }
        const stats = data.stats || data;
        setBranchStats({
          totalManagers: stats.managers || 0,
          totalCompanies: stats.totalCompanies || 0,
          privateCompanies: stats.privateCompanies || 0,
          publicCompanies: stats.publicCompanies || 0,
          governmentCompanies: stats.governmentCompanies || 0,
        });
      } else {
        const errorText = await statsResponse.text();
        console.error('[Dashboard] Branch stats error:', errorText);
        // 기본값 설정
        setBranchStats({
          totalManagers: 0,
          totalCompanies: 0,
          privateCompanies: 0,
          publicCompanies: 0,
          governmentCompanies: 0,
        });
      }

      // 매니저 리스트
      console.log('[Dashboard] Fetching managers...');
      const managersResponse = await fetch(`${API_BASE}/sales/dashboard/managers`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      console.log('[Dashboard] Managers response status:', managersResponse.status);
      
      if (managersResponse.ok) {
        const managers = await managersResponse.json();
        console.log('[Dashboard] Managers count:', managers.length);
        setBranchManagers(managers);
      } else {
        const errorText = await managersResponse.text();
        console.error('[Dashboard] Managers error:', errorText);
        setBranchManagers([]);
      }
    } catch (error) {
      console.error('[Dashboard] Branch dashboard load error:', error);
      // 기본값 설정
      setBranchStats({
        totalManagers: 0,
        totalCompanies: 0,
        privateCompanies: 0,
        publicCompanies: 0,
        governmentCompanies: 0,
      });
      setBranchManagers([]);
    }
  };

  const loadHeadquartersDashboard = async (token: string) => {
    try {
      // 통계
      console.log('[Dashboard] Fetching headquarters stats...');
      const statsResponse = await fetch(`${API_BASE}/sales/dashboard/stats`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      console.log('[Dashboard] HQ stats response status:', statsResponse.status);
      
      if (statsResponse.ok) {
        const data = await statsResponse.json();
        console.log('[Dashboard] HQ stats data:', data);
        // API returns { role, name, phone, email, stats: {...} }
        const stats = data.stats || data;
        setHeadquartersStats({
          totalBranches: stats.branches || 0,
          totalManagers: stats.managers || 0,
          totalCompanies: stats.totalCompanies || 0,
          privateCompanies: stats.privateCompanies || 0,
          publicCompanies: stats.publicCompanies || 0,
          governmentCompanies: stats.governmentCompanies || 0,
        });
      } else {
        const errorText = await statsResponse.text();
        console.error('[Dashboard] HQ stats error:', errorText);
        // 기본값 설정
        setHeadquartersStats({
          totalBranches: 0,
          totalManagers: 0,
          totalCompanies: 0,
          privateCompanies: 0,
          publicCompanies: 0,
          governmentCompanies: 0,
        });
      }

      // 지사 리스트
      console.log('[Dashboard] Fetching branches...');
      const branchesResponse = await fetch(`${API_BASE}/sales/dashboard/branches`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      console.log('[Dashboard] Branches response status:', branchesResponse.status);
      
      if (branchesResponse.ok) {
        const branches = await branchesResponse.json();
        console.log('[Dashboard] Branches count:', branches.length);
        setHeadquartersBranches(branches);
      } else {
        const errorText = await branchesResponse.text();
        console.error('[Dashboard] Branches error:', errorText);
        setHeadquartersBranches([]);
      }
    } catch (error) {
      console.error('[Dashboard] Headquarters dashboard load error:', error);
      // 기본값 설정
      setHeadquartersStats({
        totalBranches: 0,
        totalManagers: 0,
        totalCompanies: 0,
        privateCompanies: 0,
        publicCompanies: 0,
        governmentCompanies: 0,
      });
      setHeadquartersBranches([]);
    }
  };

  const handleLogout = () => {
    clearManagerAuth();
    router.push('/admin/sales');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <div className="text-red-600 text-center mb-4">
            <span className="text-4xl">⚠️</span>
          </div>
          <p className="text-center text-gray-800 mb-4">{error}</p>
          <button
            onClick={() => router.push('/admin/sales')}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
          >
            로그인 페이지로
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-gray-900">
              {accountInfo?.role === 'MANAGER' && '매니저 대시보드'}
              {accountInfo?.role === 'BRANCH_MANAGER' && '지사 대시보드'}
              {accountInfo?.role === 'HEAD_MANAGER' && '본부 대시보드'}
            </h1>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              로그아웃
            </button>
          </div>
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {accountInfo?.role === 'MANAGER' && (
          <>
            {!managerStats ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">데이터를 불러오는 중...</p>
              </div>
            ) : (
              <ManagerDashboard
                accountInfo={accountInfo}
                stats={managerStats}
                companies={managerCompanies}
              />
            )}
          </>
        )}
        
        {accountInfo?.role === 'BRANCH_MANAGER' && (
          <>
            {!branchStats ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">데이터를 불러오는 중...</p>
              </div>
            ) : (
              <BranchDashboard
                accountInfo={accountInfo}
                stats={branchStats}
                managers={branchManagers}
              />
            )}
          </>
        )}
        
        {accountInfo?.role === 'HEAD_MANAGER' && (
          <>
            {!headquartersStats ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">데이터를 불러오는 중...</p>
              </div>
            ) : (
              <HeadquartersDashboard
                accountInfo={accountInfo}
                stats={headquartersStats}
                branches={headquartersBranches}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
