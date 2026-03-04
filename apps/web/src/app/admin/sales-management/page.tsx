'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';

interface SalesPerson {
  id: string;
  userId: string;
  name: string;
  organizationName?: string;
  organizationId?: string;
  organization?: {
    id: string;
    name: string;
    type: 'HEADQUARTERS' | 'BRANCH';
    leaderName: string;
  };
  phone: string;
  email?: string;
  role: 'MANAGER' | 'BRANCH_MANAGER' | 'HEAD_MANAGER';
  managerId?: string;
  manager?: {
    id: string;
    name: string;
    phone: string;
    role: string;
  };
  referredById?: string;
  referredBy?: {
    id: string;
    name: string;
    phone: string;
    role: string;
  };
  subordinates?: SalesPerson[];
  referralCode: string;
  totalReferrals: number;
  activeReferrals: number;
  totalRevenue: number;
  commission: number;
  isActive: boolean;
  createdAt: string;
  promotedAt?: string;
  promotedBy?: string;
  referredCompanies?: Array<{
    id: string;
    companyName: string;
    companyBizNo: string;
    companyType: string;
    totalPayments: number;
    createdAt: string;
  }>;
}

type ViewMode = 'stats' | 'headquarters' | 'branches' | 'managers';

export default function SalesManagementPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [salesPeople, setSalesPeople] = useState<SalesPerson[]>([]);
  const [pendingPeople, setPendingPeople] = useState<SalesPerson[]>([]); // 승인 대기 중인 매니저
  const [filteredPeople, setFilteredPeople] = useState<SalesPerson[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('stats');
  const [expandedBranches, setExpandedBranches] = useState<Set<string>>(new Set());
  const [expandedHeadquartersInList, setExpandedHeadquartersInList] = useState<Set<string>>(new Set());
  const [expandedBranchesInList, setExpandedBranchesInList] = useState<Set<string>>(new Set());
  
  // 모달 상태
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createType, setCreateType] = useState<'HEAD_MANAGER' | 'BRANCH_MANAGER'>('HEAD_MANAGER');
  const [selectedHeadManagerId, setSelectedHeadManagerId] = useState<string>('');
  const [searchPhone, setSearchPhone] = useState('');
  const [searchedManager, setSearchedManager] = useState<SalesPerson | null>(null);
  const [organizationName, setOrganizationName] = useState('');
  
  // 🆕 추천 매니저 검색 상태
  const [referrerSearchPhone, setReferrerSearchPhone] = useState('');
  const [searchedReferrer, setSearchedReferrer] = useState<SalesPerson | null>(null);
  
  const [newPersonData, setNewPersonData] = useState({
    organizationName: '', // 본부명 또는 지사명
    managerName: '', // 본부장명 또는 지사장명
    phone: '',
    email: '',
    password: '',
    passwordConfirm: '',
  });
  
  // 수정 모달 상태
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPerson, setEditingPerson] = useState<SalesPerson | null>(null);
  const [editData, setEditData] = useState({
    name: '',
    phone: '',
    email: '',
  });
  
  // 이동 모달 상태
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferPerson, setTransferPerson] = useState<SalesPerson | null>(null);
  const [transferTargetId, setTransferTargetId] = useState<string>('');
  
  // 삭제 확인 모달 상태
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingPerson, setDeletingPerson] = useState<SalesPerson | null>(null);

  // 계층별 통계 데이터 상태
  const [hierarchyStats, setHierarchyStats] = useState<any>(null);
  const [loadingStats, setLoadingStats] = useState(false);

  // 영업 인원 목록 로드
  useEffect(() => {
    loadSalesPeople();
    loadPendingPeople();
    loadHierarchyStats(); // 통계 데이터 로드
  }, []);

  // viewMode가 변경될 때 통계 데이터 로드
  useEffect(() => {
    if (viewMode === 'headquarters' || viewMode === 'branches' || viewMode === 'managers') {
      if (!hierarchyStats) {
        loadHierarchyStats();
      }
    }
  }, [viewMode]);

  // 필터링
  useEffect(() => {
    console.log('🔍 필터링 시작:', {
      전체매니저수: salesPeople.length,
      선택된역할: selectedRole,
      검색어: searchTerm,
    });
    
    let filtered = salesPeople;

    if (selectedRole !== 'ALL') {
      filtered = filtered.filter(p => p.role === selectedRole);
      console.log(`📊 역할 필터 후: ${filtered.length}명 (${selectedRole})`);
    }

    if (searchTerm) {
      filtered = filtered.filter(p =>
        p.name.includes(searchTerm) ||
        p.phone.includes(searchTerm) ||
        p.email?.includes(searchTerm)
      );
      console.log(`🔍 검색 필터 후: ${filtered.length}명 (검색어: ${searchTerm})`);
    }

    console.log(`✅ 최종 필터 결과: ${filtered.length}명`);
    setFilteredPeople(filtered);
  }, [salesPeople, selectedRole, searchTerm]);

  const loadSalesPeople = async () => {
    try {
      setLoading(true);
      console.log('🔍 활성 매니저 로드 시작...');
      const data = await apiFetch('/sales/people?isActive=true');
      console.log('✅ API 응답:', data);
      console.log('📊 매니저 수:', data.salesPeople?.length || 0);
      setSalesPeople(data.salesPeople || []);
      console.log('✅ State 업데이트 완료:', data.salesPeople?.length || 0, '명');
    } catch (err: any) {
      console.error('❌ 데이터 로드 실패:', err);
      setError(err.message || '데이터 로드 실패');
    } finally {
      setLoading(false);
    }
  };

  const loadPendingPeople = async () => {
    try {
      const data = await apiFetch('/sales/people?isActive=false');
      setPendingPeople(data.salesPeople || []);
    } catch (err: any) {
      console.error('승인 대기 목록 로드 실패:', err);
    }
  };

  // 계층별 통계 로드
  const loadHierarchyStats = async () => {
    try {
      setLoadingStats(true);
      console.log('📊 계층별 통계 로드 시작...');
      const data = await apiFetch('/sales/stats/hierarchy');
      console.log('✅ 통계 데이터:', data);
      setHierarchyStats(data);
    } catch (err: any) {
      console.error('❌ 통계 로드 실패:', err);
    } finally {
      setLoadingStats(false);
    }
  };

  const handlePromote = async (salesPersonId: string, newRole: string) => {
    if (!confirm(`정말 ${getRoleName(newRole)}으로 등업하시겠습니까?`)) {
      return;
    }

    try {
      await apiFetch(`/sales/people/${salesPersonId}/promote`, {
        method: 'POST',
        body: JSON.stringify({
          newRole,
          reason: '슈퍼어드민 등업',
        }),
      });

      setSuccessMessage('등업이 완료되었습니다.');
      setTimeout(() => setSuccessMessage(''), 3000);
      loadSalesPeople();
    } catch (err: any) {
      setError(err.message || '등업 실패');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleToggleActive = async (salesPersonId: string, currentActive: boolean) => {
    const action = currentActive ? '비활성화' : '활성화';
    if (!confirm(`정말 ${action}하시겠습니까?`)) {
      return;
    }

    try {
      await apiFetch(`/sales/people/${salesPersonId}/toggle-active`, {
        method: 'POST',
        body: JSON.stringify({
          isActive: !currentActive,
          inactiveReason: currentActive ? '슈퍼어드민 비활성화' : undefined,
        }),
      });

      setSuccessMessage(`${action}가 완료되었습니다.`);
      setTimeout(() => setSuccessMessage(''), 3000);
      loadSalesPeople();
      loadPendingPeople(); // 승인 대기 목록도 새로고침
    } catch (err: any) {
      setError(err.message || `${action} 실패`);
      setTimeout(() => setError(''), 3000);
    }
  };

  const searchManagerByPhone = async () => {
    if (!searchPhone) {
      setError('전화번호를 입력해주세요.');
      setTimeout(() => setError(''), 3000);
      return;
    }

    try {
      // 전화번호로 매니저 찾기
      const cleanPhone = searchPhone.replace(/[-\s]/g, '');
      const manager = salesPeople.find(p => p.phone.replace(/[-\s]/g, '') === cleanPhone);
      
      if (!manager) {
        setError('해당 전화번호로 등록된 매니저를 찾을 수 없습니다.');
        setTimeout(() => setError(''), 3000);
        return;
      }

      setSearchedManager(manager);
      setSuccessMessage(`${manager.name} 매니저를 찾았습니다.`);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      setError(err.message || '검색 실패');
      setTimeout(() => setError(''), 3000);
    }
  };

  // 🆕 추천 매니저 검색 함수
  const searchReferrerByPhone = async () => {
    if (!referrerSearchPhone) {
      setError('추천 매니저 전화번호를 입력해주세요.');
      setTimeout(() => setError(''), 3000);
      return;
    }

    try {
      // 전화번호로 매니저 찾기
      const cleanPhone = referrerSearchPhone.replace(/[-\s]/g, '');
      const manager = salesPeople.find(p => p.phone.replace(/[-\s]/g, '') === cleanPhone);
      
      if (!manager) {
        setError('해당 전화번호로 등록된 추천 매니저를 찾을 수 없습니다.');
        setTimeout(() => setError(''), 3000);
        return;
      }

      setSearchedReferrer(manager);
      setSuccessMessage(`${manager.name} 추천 매니저를 찾았습니다.`);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      setError(err.message || '추천 매니저 검색 실패');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleCreatePerson = async () => {
    // 검색된 매니저가 있어야 함
    if (!searchedManager) {
      setError('먼저 전화번호로 매니저를 검색해주세요.');
      setTimeout(() => setError(''), 3000);
      return;
    }

    // 조직명 필수
    if (!organizationName) {
      setError(createType === 'HEAD_MANAGER' ? '본부명을 입력해주세요.' : '지사명을 입력해주세요.');
      setTimeout(() => setError(''), 3000);
      return;
    }

    if (createType === 'BRANCH_MANAGER' && !selectedHeadManagerId) {
      setError('본부를 선택해주세요.');
      setTimeout(() => setError(''), 3000);
      return;
    }

    try {
      // 기존 매니저를 승격 (본부장/지사장으로 임명)
      await apiFetch(`/sales/people/${searchedManager.id}/promote-to-leader`, {
        method: 'POST',
        body: JSON.stringify({
          role: createType,
          organizationName,
          managerId: createType === 'BRANCH_MANAGER' ? selectedHeadManagerId : undefined,
          referredById: searchedReferrer?.id || null, // 🆕 추천 매니저 ID 전송
        }),
      });

      setSuccessMessage(`${searchedManager.name}님을 ${getRoleName(createType)}로 임명했습니다.`);
      setTimeout(() => setSuccessMessage(''), 3000);
      
      // 모달 닫고 초기화
      setShowCreateModal(false);
      setSearchPhone('');
      setSearchedManager(null);
      setOrganizationName('');
      setSelectedHeadManagerId('');
      setReferrerSearchPhone(''); // 🆕 추천 매니저 검색 초기화
      setSearchedReferrer(null); // 🆕 추천 매니저 초기화
      
      loadSalesPeople();
    } catch (err: any) {
      setError(err.message || '임명 실패');
      setTimeout(() => setError(''), 3000);
    }
  };

  const openCreateModal = (type: 'HEAD_MANAGER' | 'BRANCH_MANAGER', headManagerId?: string) => {
    setCreateType(type);
    setSearchPhone('');
    setSearchedManager(null);
    setOrganizationName('');
    if (headManagerId) {
      setSelectedHeadManagerId(headManagerId);
    } else {
      setSelectedHeadManagerId('');
    }
    setShowCreateModal(true);
  };

  const openEditModal = (person: SalesPerson) => {
    setEditingPerson(person);
    setEditData({
      name: person.name,
      phone: person.phone,
      email: person.email || '',
    });
    setShowEditModal(true);
  };

  const handleEdit = async () => {
    if (!editingPerson) return;
    
    if (!editData.name || !editData.phone) {
      setError('이름과 전화번호는 필수입니다.');
      setTimeout(() => setError(''), 3000);
      return;
    }

    try {
      await apiFetch(`/sales/people/${editingPerson.id}`, {
        method: 'PUT',
        body: JSON.stringify(editData),
      });

      setSuccessMessage('정보가 수정되었습니다.');
      setTimeout(() => setSuccessMessage(''), 3000);
      
      setShowEditModal(false);
      setEditingPerson(null);
      setEditData({ name: '', phone: '', email: '' });
      
      loadSalesPeople();
    } catch (err: any) {
      setError(err.message || '수정 실패');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleDelete = async (person: SalesPerson) => {
    setDeletingPerson(person);
    setShowDeleteModal(true);
  };
  
  const confirmDelete = async () => {
    if (!deletingPerson) return;

    try {
      console.log('[DELETE] Sending delete request for:', deletingPerson.id, deletingPerson.name);
      
      const response = await apiFetch(`/sales/people/${deletingPerson.id}`, {
        method: 'DELETE',
      });
      
      console.log('[DELETE] Response:', response);

      setSuccessMessage('삭제되었습니다.');
      setTimeout(() => setSuccessMessage(''), 3000);
      setShowDeleteModal(false);
      setDeletingPerson(null);
      loadSalesPeople();
    } catch (err: any) {
      console.error('[DELETE] Error:', err);
      setError(err.message || err.data?.error || '삭제 실패');
      setTimeout(() => setError(''), 5000);
      // 에러 발생 시에도 모달은 닫기
      setShowDeleteModal(false);
      setDeletingPerson(null);
    }
  };

  const openTransferModal = (person: SalesPerson) => {
    setTransferPerson(person);
    setTransferTargetId(person.managerId || '');
    setShowTransferModal(true);
  };

  const handleTransfer = async () => {
    if (!transferPerson || !transferTargetId) {
      setError('이동할 본부/지사를 선택해주세요.');
      setTimeout(() => setError(''), 3000);
      return;
    }

    if (transferTargetId === transferPerson.managerId) {
      setError('현재와 동일한 본부/지사입니다.');
      setTimeout(() => setError(''), 3000);
      return;
    }

    try {
      await apiFetch(`/sales/people/${transferPerson.id}/transfer`, {
        method: 'POST',
        body: JSON.stringify({
          newManagerId: transferTargetId,
          reason: '슈퍼어드민 조직 이동',
        }),
      });

      setSuccessMessage('조직 이동이 완료되었습니다.');
      setTimeout(() => setSuccessMessage(''), 3000);
      
      setShowTransferModal(false);
      setTransferPerson(null);
      setTransferTargetId('');
      
      loadSalesPeople();
    } catch (err: any) {
      setError(err.message || '조직 이동 실패');
      setTimeout(() => setError(''), 3000);
    }
  };

  const getRoleName = (role: string) => {
    switch (role) {
      case 'MANAGER':
        return '매니저';
      case 'BRANCH_MANAGER':
        return '지사장';
      case 'HEAD_MANAGER':
        return '본부장';
      default:
        return role;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'HEAD_MANAGER':
        return '#d32f2f';
      case 'BRANCH_MANAGER':
        return '#f57c00';
      case 'MANAGER':
        return '#1976d2';
      default:
        return '#666';
    }
  };

  const getNextRole = (currentRole: string) => {
    switch (currentRole) {
      case 'MANAGER':
        return 'BRANCH_MANAGER';
      case 'BRANCH_MANAGER':
        return 'HEAD_MANAGER';
      default:
        return null;
    }
  };

  // 조직도를 위한 계층 구조 생성
  const getOrganizationTree = () => {
    const headManagers = salesPeople.filter(p => p.role === 'HEAD_MANAGER');
    
    return headManagers.map(head => {
      const branches = salesPeople.filter(p => p.managerId === head.id && p.role === 'BRANCH_MANAGER');
      const branchesWithManagers = branches.map(branch => ({
        ...branch,
        subordinates: salesPeople.filter(p => p.managerId === branch.id && p.role === 'MANAGER'),
      }));
      
      return {
        ...head,
        subordinates: branchesWithManagers,
      };
    });
  };

  const toggleBranchExpansion = (headManagerId: string) => {
    setExpandedBranches(prev => {
      const newSet = new Set(prev);
      if (newSet.has(headManagerId)) {
        newSet.delete(headManagerId);
      } else {
        newSet.add(headManagerId);
      }
      return newSet;
    });
  };

  const toggleHeadquarterInList = (headId: string) => {
    setExpandedHeadquartersInList(prev => {
      const newSet = new Set(prev);
      if (newSet.has(headId)) {
        newSet.delete(headId);
      } else {
        newSet.add(headId);
      }
      return newSet;
    });
  };

  const toggleBranchInList = (branchId: string) => {
    setExpandedBranchesInList(prev => {
      const newSet = new Set(prev);
      if (newSet.has(branchId)) {
        newSet.delete(branchId);
      } else {
        newSet.add(branchId);
      }
      return newSet;
    });
  };

  // 계층형 목록을 위한 정렬 함수 (확장/축소 고려)
  const getHierarchicalList = (people: SalesPerson[]) => {
    const result: SalesPerson[] = [];
    const heads = people.filter(p => p.role === 'HEAD_MANAGER');
    
    heads.forEach(head => {
      result.push(head);
      
      // 본부가 확장된 경우에만 지사 표시
      if (expandedHeadquartersInList.has(head.id)) {
        const branches = people.filter(p => p.managerId === head.id && p.role === 'BRANCH_MANAGER');
        branches.forEach(branch => {
          result.push(branch);
          
          // 지사가 확장된 경우에만 매니저 표시
          if (expandedBranchesInList.has(branch.id)) {
            const managers = people.filter(p => p.managerId === branch.id && p.role === 'MANAGER');
            result.push(...managers);
          }
        });
      }
    });
    
    return result;
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⏳</div>
          <p>로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f5f5f5',
      padding: 20,
    }}>
      <div style={{
        maxWidth: 1400,
        margin: '0 auto',
      }}>
        {/* 헤더 */}
        <div style={{
          background: 'white',
          borderRadius: 8,
          padding: 24,
          marginBottom: 24,
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h1 style={{ fontSize: 28, fontWeight: 'bold', margin: 0, marginBottom: 8 }}>
                👥 영업 관리
              </h1>
              <p style={{ fontSize: 14, color: '#666', margin: 0 }}>
                매니저, 지사장, 본부장 관리 및 등업
              </p>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={() => openCreateModal('HEAD_MANAGER')}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#d32f2f',
                  color: 'white',
                  border: 'none',
                  borderRadius: 4,
                  cursor: 'pointer',
                  fontSize: 14,
                  fontWeight: 600,
                }}
              >
                + 본부 생성
              </button>
              <button
                onClick={() => router.push('/admin')}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#f5f5f5',
                  border: '1px solid #ddd',
                  borderRadius: 4,
                  cursor: 'pointer',
                  fontSize: 14,
                }}
              >
                ← 돌아가기
              </button>
            </div>
          </div>
        </div>

        {/* 알림 메시지 */}
        {error && (
          <div style={{
            padding: 16,
            backgroundColor: '#ffebee',
            color: '#c62828',
            borderRadius: 8,
            marginBottom: 20,
          }}>
            ⚠️ {error}
          </div>
        )}

        {successMessage && (
          <div style={{
            padding: 16,
            backgroundColor: '#e8f5e9',
            color: '#2e7d32',
            borderRadius: 8,
            marginBottom: 20,
          }}>
            ✅ {successMessage}
          </div>
        )}

        {/* 영업 통계 카드 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 16,
          marginBottom: 24,
        }}>
          {/* 소속 지사 */}
          <div style={{
            background: 'white',
            borderRadius: 12,
            padding: 20,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 13, color: '#666', marginBottom: 12, fontWeight: 500 }}>
              소속 지사
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: 32, marginRight: 8 }}>🏪</span>
            </div>
            <div style={{ fontSize: 32, fontWeight: 'bold', color: '#1976d2' }}>
              {salesPeople.filter(p => p.role === 'BRANCH_MANAGER').length}
            </div>
            <div style={{ fontSize: 13, color: '#999', marginTop: 4 }}>개</div>
          </div>

          {/* 소속 매니저 */}
          <div style={{
            background: 'white',
            borderRadius: 12,
            padding: 20,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 13, color: '#666', marginBottom: 12, fontWeight: 500 }}>
              소속 매니저
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: 32, marginRight: 8 }}>👥</span>
            </div>
            <div style={{ fontSize: 32, fontWeight: 'bold', color: '#1976d2' }}>
              {salesPeople.filter(p => p.role === 'MANAGER').length}
            </div>
            <div style={{ fontSize: 13, color: '#999', marginTop: 4 }}>명</div>
          </div>

          {/* 중소 창업 */}
          <div style={{
            background: 'white',
            borderRadius: 12,
            padding: 20,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 13, color: '#666', marginBottom: 12, fontWeight: 500 }}>
              중소 창업
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: 32, marginRight: 8 }}>🏢</span>
            </div>
            <div style={{ fontSize: 32, fontWeight: 'bold', color: '#1976d2' }}>
              {salesPeople.reduce((sum, p) => sum + (p.referredCompanies?.filter(c => c.companyType === 'PRIVATE_COMPANY').length || 0), 0)}
            </div>
            <div style={{ fontSize: 13, color: '#999', marginTop: 4 }}>개</div>
          </div>

          {/* 민간 기업 */}
          <div style={{
            background: 'white',
            borderRadius: 12,
            padding: 20,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 13, color: '#666', marginBottom: 12, fontWeight: 500 }}>
              민간 기업
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: 32, marginRight: 8 }}>🏭</span>
            </div>
            <div style={{ fontSize: 32, fontWeight: 'bold', color: '#1976d2' }}>
              0
            </div>
            <div style={{ fontSize: 13, color: '#999', marginTop: 4 }}>개</div>
          </div>

          {/* 공공 기관 */}
          <div style={{
            background: 'white',
            borderRadius: 12,
            padding: 20,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 13, color: '#666', marginBottom: 12, fontWeight: 500 }}>
              공공 기관
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: 32, marginRight: 8 }}>🏛️</span>
            </div>
            <div style={{ fontSize: 32, fontWeight: 'bold', color: '#1976d2' }}>
              0
            </div>
            <div style={{ fontSize: 13, color: '#999', marginTop: 4 }}>개</div>
          </div>

          {/* 정부 교육 기관 */}
          <div style={{
            background: 'white',
            borderRadius: 12,
            padding: 20,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 13, color: '#666', marginBottom: 12, fontWeight: 500 }}>
              정부 교육 기관
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: 32, marginRight: 8 }}>🎓</span>
            </div>
            <div style={{ fontSize: 32, fontWeight: 'bold', color: '#1976d2' }}>
              0
            </div>
            <div style={{ fontSize: 13, color: '#999', marginTop: 4 }}>개</div>
          </div>

          {/* 표준 사업장 */}
          <div style={{
            background: 'white',
            borderRadius: 12,
            padding: 20,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 13, color: '#666', marginBottom: 12, fontWeight: 500 }}>
              표준 사업장
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: 32, marginRight: 8 }}>✅</span>
            </div>
            <div style={{ fontSize: 32, fontWeight: 'bold', color: '#4caf50' }}>
              활성
            </div>
            <div style={{ fontSize: 13, color: '#999', marginTop: 4 }}></div>
          </div>
        </div>

        {/* 뷰 모드 전환 */}
        <div style={{
          background: 'white',
          borderRadius: 8,
          padding: 16,
          marginBottom: 20,
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        }}>
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              onClick={() => setViewMode('stats')}
              style={{
                padding: '8px 16px',
                backgroundColor: viewMode === 'stats' ? '#1976d2' : 'white',
                color: viewMode === 'stats' ? 'white' : '#666',
                border: '1px solid #ddd',
                borderRadius: 4,
                cursor: 'pointer',
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              📊 영업관리
            </button>
            <button
              onClick={() => setViewMode('headquarters')}
              style={{
                padding: '8px 16px',
                backgroundColor: viewMode === 'headquarters' ? '#1976d2' : 'white',
                color: viewMode === 'headquarters' ? 'white' : '#666',
                border: '1px solid #ddd',
                borderRadius: 4,
                cursor: 'pointer',
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              🏢 본부 통계
            </button>
            <button
              onClick={() => setViewMode('branches')}
              style={{
                padding: '8px 16px',
                backgroundColor: viewMode === 'branches' ? '#1976d2' : 'white',
                color: viewMode === 'branches' ? 'white' : '#666',
                border: '1px solid #ddd',
                borderRadius: 4,
                cursor: 'pointer',
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              🏪 지사별 통계
            </button>
            <button
              onClick={() => setViewMode('managers')}
              style={{
                padding: '8px 16px',
                backgroundColor: viewMode === 'managers' ? '#1976d2' : 'white',
                color: viewMode === 'managers' ? 'white' : '#666',
                border: '1px solid #ddd',
                borderRadius: 4,
                cursor: 'pointer',
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              👥 매니저별 통계
            </button>
          </div>
        </div>

        {/* 영업관리 보기 */}
        {viewMode === 'stats' && (
          <>
            {/* 승인 대기 중인 매니저 */}
            {pendingPeople.length > 0 && (
              <div style={{
                background: 'white',
                borderRadius: 8,
                padding: 20,
                marginBottom: 20,
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                border: '2px solid #ff9800',
              }}>
                <h2 style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 16, color: '#ff6f00' }}>
                  ⏳ 승인 대기 중인 매니저 ({pendingPeople.length}명)
                </h2>
                <div style={{ display: 'grid', gap: 12 }}>
                  {pendingPeople.map((person) => (
                    <div
                      key={person.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: 16,
                        backgroundColor: '#fff3e0',
                        borderRadius: 8,
                        border: '1px solid #ffb74d',
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 4 }}>
                          {person.name}
                        </div>
                        <div style={{ fontSize: 13, color: '#666', marginBottom: 4 }}>
                          {person.phone} | {person.email || '이메일 없음'}
                        </div>
                        <div style={{ fontSize: 13, color: '#666' }}>
                          소속: {person.organization?.name || '조직 정보 없음'} ({person.organization?.type === 'HEADQUARTERS' ? '본부' : '지사'})
                        </div>
                        <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
                          가입일: {new Date(person.createdAt).toLocaleDateString('ko-KR')}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          onClick={() => handleToggleActive(person.id, false)}
                          style={{
                            padding: '8px 16px',
                            backgroundColor: '#4caf50',
                            color: 'white',
                            border: 'none',
                            borderRadius: 4,
                            cursor: 'pointer',
                            fontSize: 14,
                            fontWeight: 600,
                          }}
                        >
                          ✅ 승인
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`${person.name} 매니저를 정말 거절하시겠습니까?`)) {
                              // 거절은 삭제와 동일하게 처리
                              setDeletingPerson(person);
                            }
                          }}
                          style={{
                            padding: '8px 16px',
                            backgroundColor: '#f44336',
                            color: 'white',
                            border: 'none',
                            borderRadius: 4,
                            cursor: 'pointer',
                            fontSize: 14,
                            fontWeight: 600,
                          }}
                        >
                          ❌ 거절
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 필터 및 검색 */}
            <div style={{
              background: 'white',
              borderRadius: 8,
              padding: 20,
              marginBottom: 20,
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: 16,
              }}>
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, fontSize: 14 }}>
                    역할 필터
                  </label>
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    style={{
                      width: '100%',
                      padding: 10,
                      border: '1px solid #ddd',
                      borderRadius: 4,
                      fontSize: 14,
                    }}
                  >
                    <option value="ALL">전체</option>
                    <option value="HEAD_MANAGER">본부장</option>
                    <option value="BRANCH_MANAGER">지사장</option>
                    <option value="MANAGER">매니저</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, fontSize: 14 }}>
                    검색
                  </label>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="이름, 전화번호, 이메일"
                    style={{
                      width: '100%',
                      padding: 10,
                      border: '1px solid #ddd',
                      borderRadius: 4,
                      fontSize: 14,
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>

              <div style={{ marginTop: 16, fontSize: 14, color: '#666' }}>
                총 <strong>{filteredPeople.length}</strong>명
              </div>
            </div>

            {/* 테이블 */}
            <div style={{
              background: 'white',
              borderRadius: 8,
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              overflowX: 'auto',
            }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: 14,
              }}>
                <thead>
                  <tr style={{ backgroundColor: '#f9fafb', borderBottom: '2px solid #e0e0e0' }}>
                    <th style={{ padding: 16, textAlign: 'left', fontWeight: 600 }}>이름</th>
                    <th style={{ padding: 16, textAlign: 'left', fontWeight: 600 }}>역할</th>
                    <th style={{ padding: 16, textAlign: 'left', fontWeight: 600 }}>전화번호</th>
                    <th style={{ padding: 16, textAlign: 'left', fontWeight: 600 }}>이메일</th>
                    <th style={{ padding: 16, textAlign: 'center', fontWeight: 600 }}>소속 본부</th>
                    <th style={{ padding: 16, textAlign: 'center', fontWeight: 600 }}>소속 지사</th>
                    <th style={{ padding: 16, textAlign: 'center', fontWeight: 600 }}>추천 매니저</th>
                    <th style={{ padding: 16, textAlign: 'center', fontWeight: 600 }}>추천 합계</th>
                    <th style={{ padding: 16, textAlign: 'center', fontWeight: 600 }}>상태</th>
                    <th style={{ padding: 16, textAlign: 'center', fontWeight: 600 }}>관리</th>
                  </tr>
                </thead>
                <tbody>
                  {getHierarchicalList(filteredPeople).map((person) => {
                    // 역할에 따른 인덴트 및 배경색
                    const indent = person.role === 'HEAD_MANAGER' ? 0 : person.role === 'BRANCH_MANAGER' ? 20 : 40;
                    const bgColor = person.role === 'HEAD_MANAGER' ? '#ffebee' : person.role === 'BRANCH_MANAGER' ? '#fff3e0' : '#f5f5f5';
                    const icon = person.role === 'HEAD_MANAGER' ? '🏢' : person.role === 'BRANCH_MANAGER' ? '🏪' : '👤';
                    
                    // 확장/축소 상태 확인
                    const isHeadExpanded = person.role === 'HEAD_MANAGER' && expandedHeadquartersInList.has(person.id);
                    const isBranchExpanded = person.role === 'BRANCH_MANAGER' && expandedBranchesInList.has(person.id);
                    
                    // 클릭 가능 여부 및 화살표
                    const isClickable = person.role === 'HEAD_MANAGER' || person.role === 'BRANCH_MANAGER';
                    const arrow = person.role === 'HEAD_MANAGER' 
                      ? (isHeadExpanded ? '▼' : '▶')
                      : person.role === 'BRANCH_MANAGER'
                      ? (isBranchExpanded ? '▼' : '▶')
                      : '';
                    
                    const handleRowClick = () => {
                      if (person.role === 'HEAD_MANAGER') {
                        toggleHeadquarterInList(person.id);
                      } else if (person.role === 'BRANCH_MANAGER') {
                        toggleBranchInList(person.id);
                      }
                    };
                    
                    return (
                    <tr 
                      key={person.id} 
                      style={{ 
                        borderBottom: '1px solid #e0e0e0', 
                        backgroundColor: bgColor,
                        cursor: isClickable ? 'pointer' : 'default'
                      }}
                      onClick={isClickable ? handleRowClick : undefined}
                    >
                      <td style={{ padding: 16, paddingLeft: 16 + indent }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          {arrow && <span style={{ fontSize: 14, width: 16 }}>{arrow}</span>}
                          <span>{icon}</span>
                          <div>
                            <div style={{ fontWeight: 600 }}>{person.name}</div>
                            {person.organizationName && (
                              <div style={{ fontSize: 11, color: '#999', marginTop: 2 }}>
                                {person.organizationName}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: 16 }}>
                        <span style={{
                          padding: '4px 12px',
                          backgroundColor: getRoleColor(person.role) + '20',
                          color: getRoleColor(person.role),
                          borderRadius: 12,
                          fontSize: 12,
                          fontWeight: 600,
                        }}>
                          {getRoleName(person.role)}
                        </span>
                      </td>
                      <td style={{ padding: 16 }}>{person.phone}</td>
                      <td style={{ padding: 16, color: '#666' }}>{person.email || '-'}</td>
                      <td style={{ padding: 16, textAlign: 'center' }}>
                        {(() => {
                          // 본부 찾기
                          if (person.role === 'HEAD_MANAGER') {
                            // 본부장: 본인의 조직명 표시
                            return <span style={{ fontWeight: 600, color: '#d32f2f' }}>{person.organizationName || '-'}</span>;
                          } else if (person.manager) {
                            if (person.manager.role === 'HEAD_MANAGER') {
                              // 상위가 본부장: 상위의 조직명 찾기
                              const headManager = salesPeople.find(p => p.id === person.manager?.id);
                              return headManager?.organizationName || '-';
                            } else if (person.manager.role === 'BRANCH_MANAGER') {
                              // 상위가 지사장: 지사장의 상위(본부장) 조직명 찾기
                              const branchManager = salesPeople.find(p => p.id === person.manager?.id);
                              if (branchManager?.manager) {
                                const headManager = salesPeople.find(p => p.id === branchManager.manager?.id);
                                return headManager?.organizationName || '-';
                              }
                            }
                          }
                          return '-';
                        })()}
                      </td>
                      <td style={{ padding: 16, textAlign: 'center' }}>
                        {(() => {
                          // 지사 찾기
                          if (person.role === 'HEAD_MANAGER') {
                            return '-'; // 본부장은 지사 없음
                          } else if (person.role === 'BRANCH_MANAGER') {
                            // 지사장: 본인의 조직명 표시
                            return <span style={{ fontWeight: 600, color: '#f57c00' }}>{person.organizationName || '-'}</span>;
                          } else if (person.manager) {
                            if (person.manager.role === 'BRANCH_MANAGER') {
                              // 상위가 지사장: 상위의 조직명 찾기
                              const branchManager = salesPeople.find(p => p.id === person.manager?.id);
                              return branchManager?.organizationName || '-';
                            } else if (person.manager.role === 'HEAD_MANAGER') {
                              return '-'; // 본부 직속 매니저는 지사 없음
                            }
                          }
                          return '-';
                        })()}
                      </td>
                      <td style={{ padding: 16, textAlign: 'center' }}>
                        {person.referredBy ? (
                          <div>
                            <div style={{ fontWeight: 600, color: '#9c27b0' }}>
                              {person.referredBy.name}
                            </div>
                            <div style={{ fontSize: 11, color: '#999', marginTop: 2 }}>
                              {person.referredBy.phone}
                            </div>
                          </div>
                        ) : (
                          <span style={{ color: '#999' }}>-</span>
                        )}
                      </td>
                      <td style={{ padding: 16, textAlign: 'center' }}>
                        <div style={{ fontWeight: 600 }}>{person.totalReferrals || 0}</div>
                        {person.activeReferrals > 0 && (
                          <div style={{ fontSize: 11, color: '#666', marginTop: 2 }}>
                            (활성: {person.activeReferrals})
                          </div>
                        )}
                      </td>
                      <td style={{ padding: 16, textAlign: 'center' }}>
                        <span style={{
                          padding: '4px 8px',
                          backgroundColor: person.isActive ? '#e8f5e9' : '#ffebee',
                          color: person.isActive ? '#2e7d32' : '#c62828',
                          borderRadius: 4,
                          fontSize: 12,
                        }}>
                          {person.isActive ? '활성' : '비활성'}
                        </span>
                      </td>
                      <td style={{ padding: 16, textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
                        <div style={{ display: 'flex', gap: 4, justifyContent: 'center', flexWrap: 'wrap' }}>
                          <button
                            onClick={() => openEditModal(person)}
                            style={{
                              padding: '6px 10px',
                              backgroundColor: '#1976d2',
                              color: 'white',
                              border: 'none',
                              borderRadius: 4,
                              cursor: 'pointer',
                              fontSize: 11,
                              fontWeight: 600,
                            }}
                          >
                            ✏️ 수정
                          </button>
                          {person.role !== 'HEAD_MANAGER' && (
                            <button
                              onClick={() => openTransferModal(person)}
                              style={{
                                padding: '6px 10px',
                                backgroundColor: '#9c27b0',
                                color: 'white',
                                border: 'none',
                                borderRadius: 4,
                                cursor: 'pointer',
                                fontSize: 11,
                                fontWeight: 600,
                              }}
                            >
                              🔄 이동
                            </button>
                          )}
                          {getNextRole(person.role) && (
                            <button
                              onClick={() => handlePromote(person.id, getNextRole(person.role)!)}
                              style={{
                                padding: '6px 10px',
                                backgroundColor: '#4caf50',
                                color: 'white',
                                border: 'none',
                                borderRadius: 4,
                                cursor: 'pointer',
                                fontSize: 11,
                                fontWeight: 600,
                              }}
                            >
                              ↑ 등업
                            </button>
                          )}
                          <button
                            onClick={() => handleToggleActive(person.id, person.isActive)}
                            style={{
                              padding: '6px 10px',
                              backgroundColor: person.isActive ? '#f57c00' : '#4caf50',
                              color: 'white',
                              border: 'none',
                              borderRadius: 4,
                              cursor: 'pointer',
                              fontSize: 11,
                            }}
                          >
                            {person.isActive ? '비활성' : '활성'}
                          </button>
                          <button
                            onClick={() => handleDelete(person)}
                            style={{
                              padding: '6px 10px',
                              backgroundColor: '#d32f2f',
                              color: 'white',
                              border: 'none',
                              borderRadius: 4,
                              cursor: 'pointer',
                              fontSize: 11,
                              fontWeight: 600,
                            }}
                          >
                            🗑️ 삭제
                          </button>
                        </div>
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>

              {filteredPeople.length === 0 && (
                <div style={{
                  padding: 40,
                  textAlign: 'center',
                  color: '#666',
                }}>
                  검색 결과가 없습니다.
                </div>
              )}
            </div>
          </>
        )}

        {/* 본부 통계 */}
        {viewMode === 'headquarters' && (
          <div style={{
            background: 'white',
            borderRadius: 8,
            padding: 24,
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          }}>
            <h2 style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 24, color: '#d32f2f' }}>
              🏢 본부별 통계 (총 {hierarchyStats?.summary?.totalHeadquarters || 0}개)
            </h2>
            
            {loadingStats ? (
              <div style={{ textAlign: 'center', padding: 40, color: '#666' }}>
                통계 데이터를 불러오는 중...
              </div>
            ) : hierarchyStats?.headquarters?.length > 0 ? (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead style={{ backgroundColor: '#f5f5f5' }}>
                    <tr>
                      <th style={{ padding: 12, textAlign: 'left', borderBottom: '2px solid #ddd' }}>본부명</th>
                      <th style={{ padding: 12, textAlign: 'left', borderBottom: '2px solid #ddd' }}>본부장</th>
                      <th style={{ padding: 12, textAlign: 'center', borderBottom: '2px solid #ddd' }}>지사</th>
                      <th style={{ padding: 12, textAlign: 'center', borderBottom: '2px solid #ddd' }}>매니저</th>
                      <th style={{ padding: 12, textAlign: 'center', borderBottom: '2px solid #ddd' }}>총 기업</th>
                      <th style={{ padding: 12, textAlign: 'center', borderBottom: '2px solid #ddd' }}>민간기업</th>
                      <th style={{ padding: 12, textAlign: 'center', borderBottom: '2px solid #ddd' }}>공공기관</th>
                      <th style={{ padding: 12, textAlign: 'center', borderBottom: '2px solid #ddd' }}>정부교육</th>
                      <th style={{ padding: 12, textAlign: 'center', borderBottom: '2px solid #ddd' }}>표준사업장</th>
                    </tr>
                  </thead>
                  <tbody>
                    {hierarchyStats.headquarters.map((hq: any) => (
                      <tr key={hq.id} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: 12, fontWeight: 600, color: '#d32f2f' }}>
                          {hq.organizationName || hq.name}
                        </td>
                        <td style={{ padding: 12 }}>
                          <div>{hq.name}</div>
                          <div style={{ fontSize: 12, color: '#999' }}>{hq.phone}</div>
                        </td>
                        <td style={{ padding: 12, textAlign: 'center' }}>
                          <span style={{ 
                            padding: '4px 12px',
                            backgroundColor: '#fff3e0',
                            color: '#f57c00',
                            borderRadius: 12,
                            fontWeight: 600,
                          }}>
                            {hq.branches}개
                          </span>
                        </td>
                        <td style={{ padding: 12, textAlign: 'center' }}>
                          <span style={{ 
                            padding: '4px 12px',
                            backgroundColor: '#e3f2fd',
                            color: '#1976d2',
                            borderRadius: 12,
                            fontWeight: 600,
                          }}>
                            {hq.managers}명
                          </span>
                        </td>
                        <td style={{ padding: 12, textAlign: 'center', fontWeight: 600 }}>
                          {hq.stats.totalCompanies}
                        </td>
                        <td style={{ padding: 12, textAlign: 'center' }}>
                          <span style={{ color: '#4caf50', fontWeight: 600 }}>
                            {hq.stats.privateCompanies}
                          </span>
                        </td>
                        <td style={{ padding: 12, textAlign: 'center' }}>
                          <span style={{ color: '#9c27b0', fontWeight: 600 }}>
                            {hq.stats.publicCompanies}
                          </span>
                        </td>
                        <td style={{ padding: 12, textAlign: 'center' }}>
                          <span style={{ color: '#ff9800', fontWeight: 600 }}>
                            {hq.stats.governmentCompanies}
                          </span>
                        </td>
                        <td style={{ padding: 12, textAlign: 'center' }}>
                          <span style={{ color: '#2196f3', fontWeight: 600 }}>
                            {hq.stats.standardWorkplaces}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: 40, color: '#666' }}>
                등록된 본부가 없습니다.
              </div>
            )}
          </div>
        )}

        {/* 지사별 통계 */}
        {viewMode === 'branches' && (
          <div style={{
            background: 'white',
            borderRadius: 8,
            padding: 24,
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          }}>
            <h2 style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 24, color: '#f57c00' }}>
              🏪 지사별 통계 (총 {hierarchyStats?.summary?.totalBranches || 0}개)
            </h2>
            
            {loadingStats ? (
              <div style={{ textAlign: 'center', padding: 40, color: '#666' }}>
                통계 데이터를 불러오는 중...
              </div>
            ) : hierarchyStats?.branches?.length > 0 ? (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead style={{ backgroundColor: '#f5f5f5' }}>
                    <tr>
                      <th style={{ padding: 12, textAlign: 'left', borderBottom: '2px solid #ddd' }}>지사명</th>
                      <th style={{ padding: 12, textAlign: 'left', borderBottom: '2px solid #ddd' }}>지사장</th>
                      <th style={{ padding: 12, textAlign: 'left', borderBottom: '2px solid #ddd' }}>소속 본부</th>
                      <th style={{ padding: 12, textAlign: 'center', borderBottom: '2px solid #ddd' }}>매니저</th>
                      <th style={{ padding: 12, textAlign: 'center', borderBottom: '2px solid #ddd' }}>총 기업</th>
                      <th style={{ padding: 12, textAlign: 'center', borderBottom: '2px solid #ddd' }}>민간기업</th>
                      <th style={{ padding: 12, textAlign: 'center', borderBottom: '2px solid #ddd' }}>공공기관</th>
                      <th style={{ padding: 12, textAlign: 'center', borderBottom: '2px solid #ddd' }}>정부교육</th>
                      <th style={{ padding: 12, textAlign: 'center', borderBottom: '2px solid #ddd' }}>표준사업장</th>
                    </tr>
                  </thead>
                  <tbody>
                    {hierarchyStats.branches.map((branch: any) => (
                      <tr key={branch.id} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: 12, fontWeight: 600, color: '#f57c00' }}>
                          {branch.organizationName || branch.name}
                        </td>
                        <td style={{ padding: 12 }}>
                          <div>{branch.name}</div>
                          <div style={{ fontSize: 12, color: '#999' }}>{branch.phone}</div>
                        </td>
                        <td style={{ padding: 12, color: '#d32f2f', fontWeight: 500 }}>
                          {branch.headquartersName}
                        </td>
                        <td style={{ padding: 12, textAlign: 'center' }}>
                          <span style={{ 
                            padding: '4px 12px',
                            backgroundColor: '#e3f2fd',
                            color: '#1976d2',
                            borderRadius: 12,
                            fontWeight: 600,
                          }}>
                            {branch.managers}명
                          </span>
                        </td>
                        <td style={{ padding: 12, textAlign: 'center', fontWeight: 600 }}>
                          {branch.stats.totalCompanies}
                        </td>
                        <td style={{ padding: 12, textAlign: 'center' }}>
                          <span style={{ color: '#4caf50', fontWeight: 600 }}>
                            {branch.stats.privateCompanies}
                          </span>
                        </td>
                        <td style={{ padding: 12, textAlign: 'center' }}>
                          <span style={{ color: '#9c27b0', fontWeight: 600 }}>
                            {branch.stats.publicCompanies}
                          </span>
                        </td>
                        <td style={{ padding: 12, textAlign: 'center' }}>
                          <span style={{ color: '#ff9800', fontWeight: 600 }}>
                            {branch.stats.governmentCompanies}
                          </span>
                        </td>
                        <td style={{ padding: 12, textAlign: 'center' }}>
                          <span style={{ color: '#2196f3', fontWeight: 600 }}>
                            {branch.stats.standardWorkplaces}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: 40, color: '#666' }}>
                등록된 지사가 없습니다.
              </div>
            )}
          </div>
        )}

        {/* 매니저별 통계 */}
        {viewMode === 'managers' && (
          <div style={{
            background: 'white',
            borderRadius: 8,
            padding: 24,
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          }}>
            <h2 style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 24, color: '#1976d2' }}>
              👥 매니저별 통계 (총 {hierarchyStats?.summary?.totalManagers || 0}명)
            </h2>
            
            {loadingStats ? (
              <div style={{ textAlign: 'center', padding: 40, color: '#666' }}>
                통계 데이터를 불러오는 중...
              </div>
            ) : hierarchyStats?.managers?.length > 0 ? (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead style={{ backgroundColor: '#f5f5f5' }}>
                    <tr>
                      <th style={{ padding: 12, textAlign: 'left', borderBottom: '2px solid #ddd' }}>매니저명</th>
                      <th style={{ padding: 12, textAlign: 'left', borderBottom: '2px solid #ddd' }}>연락처</th>
                      <th style={{ padding: 12, textAlign: 'left', borderBottom: '2px solid #ddd' }}>소속 본부</th>
                      <th style={{ padding: 12, textAlign: 'left', borderBottom: '2px solid #ddd' }}>소속 지사</th>
                      <th style={{ padding: 12, textAlign: 'center', borderBottom: '2px solid #ddd' }}>총 기업</th>
                      <th style={{ padding: 12, textAlign: 'center', borderBottom: '2px solid #ddd' }}>민간기업</th>
                      <th style={{ padding: 12, textAlign: 'center', borderBottom: '2px solid #ddd' }}>공공기관</th>
                      <th style={{ padding: 12, textAlign: 'center', borderBottom: '2px solid #ddd' }}>정부교육</th>
                      <th style={{ padding: 12, textAlign: 'center', borderBottom: '2px solid #ddd' }}>표준사업장</th>
                    </tr>
                  </thead>
                  <tbody>
                    {hierarchyStats.managers.map((manager: any) => (
                      <tr key={manager.id} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: 12, fontWeight: 600, color: '#1976d2' }}>
                          {manager.name}
                        </td>
                        <td style={{ padding: 12 }}>
                          <div style={{ fontSize: 13 }}>{manager.phone}</div>
                          {manager.email && (
                            <div style={{ fontSize: 12, color: '#999' }}>{manager.email}</div>
                          )}
                        </td>
                        <td style={{ padding: 12, color: '#d32f2f', fontWeight: 500 }}>
                          {manager.headquartersName}
                        </td>
                        <td style={{ padding: 12, color: '#f57c00', fontWeight: 500 }}>
                          {manager.branchName}
                        </td>
                        <td style={{ padding: 12, textAlign: 'center', fontWeight: 600 }}>
                          {manager.stats.totalCompanies}
                        </td>
                        <td style={{ padding: 12, textAlign: 'center' }}>
                          <span style={{ color: '#4caf50', fontWeight: 600 }}>
                            {manager.stats.privateCompanies}
                          </span>
                        </td>
                        <td style={{ padding: 12, textAlign: 'center' }}>
                          <span style={{ color: '#9c27b0', fontWeight: 600 }}>
                            {manager.stats.publicCompanies}
                          </span>
                        </td>
                        <td style={{ padding: 12, textAlign: 'center' }}>
                          <span style={{ color: '#ff9800', fontWeight: 600 }}>
                            {manager.stats.governmentCompanies}
                          </span>
                        </td>
                        <td style={{ padding: 12, textAlign: 'center' }}>
                          <span style={{ color: '#2196f3', fontWeight: 600 }}>
                            {manager.stats.standardWorkplaces}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: 40, color: '#666' }}>
                등록된 매니저가 없습니다.
              </div>
            )}
          </div>
        )}

        {/* 이동 모달 */}
        {showTransferModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}>
            <div style={{
              backgroundColor: 'white',
              borderRadius: 8,
              padding: 32,
              width: '100%',
              maxWidth: 500,
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
              position: 'relative',
            }}>
              <button
                onClick={() => {
                  setShowTransferModal(false);
                  setTransferPerson(null);
                  setTransferTargetId('');
                }}
                style={{
                  position: 'absolute',
                  top: 16,
                  right: 16,
                  width: 32,
                  height: 32,
                  border: 'none',
                  backgroundColor: 'transparent',
                  fontSize: 24,
                  color: '#999',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 4,
                }}
              >
                ✕
              </button>

              <h2 style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 8 }}>
                🔄 조직 이동
              </h2>
              <p style={{ fontSize: 14, color: '#666', marginBottom: 24 }}>
                {transferPerson?.name}을(를) 다른 본부/지사로 이동합니다.
              </p>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, fontSize: 14 }}>
                  현재 소속
                </label>
                <div style={{
                  padding: 12,
                  backgroundColor: '#f5f5f5',
                  borderRadius: 4,
                  fontSize: 14,
                }}>
                  {transferPerson?.manager ? transferPerson.manager.name : '없음'}
                </div>
              </div>

              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, fontSize: 14 }}>
                  이동할 본부/지사 선택 *
                </label>
                <select
                  value={transferTargetId}
                  onChange={(e) => setTransferTargetId(e.target.value)}
                  style={{
                    width: '100%',
                    padding: 12,
                    border: '1px solid #ddd',
                    borderRadius: 4,
                    fontSize: 14,
                    boxSizing: 'border-box',
                  }}
                >
                  <option value="">선택하세요</option>
                  {transferPerson?.role === 'MANAGER' && (
                    <>
                      <optgroup label="본부">
                        {salesPeople
                          .filter(p => p.role === 'HEAD_MANAGER' && p.id !== transferPerson.id)
                          .map(head => (
                            <option key={head.id} value={head.id}>
                              {head.organizationName || head.name} (대표: {head.name})
                            </option>
                          ))}
                      </optgroup>
                      <optgroup label="지사">
                        {salesPeople
                          .filter(p => p.role === 'BRANCH_MANAGER' && p.id !== transferPerson.id)
                          .map(branch => (
                            <option key={branch.id} value={branch.id}>
                              {branch.organizationName || branch.name} (대표: {branch.name})
                            </option>
                          ))}
                      </optgroup>
                    </>
                  )}
                  {transferPerson?.role === 'BRANCH_MANAGER' && (
                    <optgroup label="본부">
                      {salesPeople
                        .filter(p => p.role === 'HEAD_MANAGER' && p.id !== transferPerson.id)
                        .map(head => (
                          <option key={head.id} value={head.id}>
                            {head.name} 본부
                          </option>
                        ))}
                    </optgroup>
                  )}
                </select>
              </div>

              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button
                  onClick={() => {
                    setShowTransferModal(false);
                    setTransferPerson(null);
                    setTransferTargetId('');
                  }}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#2196F3',
                    color: 'white',
                    border: 'none',
                    borderRadius: 4,
                    cursor: 'pointer',
                    fontSize: 14,
                    fontWeight: 500,
                  }}
                >
                  취소
                </button>
                <button
                  onClick={handleTransfer}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#9c27b0',
                    color: 'white',
                    border: 'none',
                    borderRadius: 4,
                    cursor: 'pointer',
                    fontSize: 14,
                    fontWeight: 600,
                  }}
                >
                  이동
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 수정 모달 */}
        {showEditModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}>
            <div style={{
              backgroundColor: 'white',
              borderRadius: 8,
              padding: 32,
              width: '100%',
              maxWidth: 500,
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
              position: 'relative',
            }}>
              {/* X 닫기 버튼 */}
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingPerson(null);
                  setEditData({ name: '', phone: '', email: '' });
                }}
                style={{
                  position: 'absolute',
                  top: 16,
                  right: 16,
                  width: 32,
                  height: 32,
                  border: 'none',
                  backgroundColor: 'transparent',
                  fontSize: 24,
                  color: '#999',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 4,
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f5f5f5';
                  e.currentTarget.style.color = '#333';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#999';
                }}
              >
                ✕
              </button>

              <h2 style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 8 }}>
                ✏️ 정보 수정
              </h2>
              <p style={{ fontSize: 14, color: '#666', marginBottom: 24 }}>
                {editingPerson?.name}의 정보를 수정합니다.
              </p>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, fontSize: 14 }}>
                  이름 *
                </label>
                <input
                  type="text"
                  value={editData.name}
                  onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                  placeholder="예: 홍길동"
                  style={{
                    width: '100%',
                    padding: 12,
                    border: '1px solid #ddd',
                    borderRadius: 4,
                    fontSize: 14,
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, fontSize: 14 }}>
                  전화번호 *
                </label>
                <input
                  type="tel"
                  value={editData.phone}
                  onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                  placeholder="예: 01012345678 또는 010-1234-5678"
                  style={{
                    width: '100%',
                    padding: 12,
                    border: '1px solid #ddd',
                    borderRadius: 4,
                    fontSize: 14,
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, fontSize: 14 }}>
                  이메일
                </label>
                <input
                  type="email"
                  value={editData.email}
                  onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                  placeholder="예: hong@example.com"
                  style={{
                    width: '100%',
                    padding: 12,
                    border: '1px solid #ddd',
                    borderRadius: 4,
                    fontSize: 14,
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingPerson(null);
                    setEditData({ name: '', phone: '', email: '' });
                  }}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#2196F3',
                    color: 'white',
                    border: 'none',
                    borderRadius: 4,
                    cursor: 'pointer',
                    fontSize: 14,
                    fontWeight: 500,
                  }}
                >
                  취소
                </button>
                <button
                  onClick={handleEdit}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#1976d2',
                    color: 'white',
                    border: 'none',
                    borderRadius: 4,
                    cursor: 'pointer',
                    fontSize: 14,
                    fontWeight: 600,
                  }}
                >
                  수정
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 생성 모달 */}
        {showCreateModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}>
            <div style={{
              backgroundColor: 'white',
              borderRadius: 8,
              padding: 32,
              width: '100%',
              maxWidth: 500,
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
              position: 'relative',
            }}>
              {/* X 닫기 버튼 */}
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setNewPersonData({ 
                    organizationName: '', 
                    managerName: '', 
                    phone: '', 
                    email: '', 
                    password: '', 
                    passwordConfirm: '' 
                  });
                  setSelectedHeadManagerId('');
                }}
                style={{
                  position: 'absolute',
                  top: 16,
                  right: 16,
                  width: 32,
                  height: 32,
                  border: 'none',
                  backgroundColor: 'transparent',
                  fontSize: 24,
                  color: '#999',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 4,
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f5f5f5';
                  e.currentTarget.style.color = '#333';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#999';
                }}
              >
                ✕
              </button>

              <h2 style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 8 }}>
                {createType === 'HEAD_MANAGER' ? '🏢 본부 생성' : '🏪 지사 생성'}
              </h2>
              <p style={{ fontSize: 14, color: '#666', marginBottom: 24 }}>
                {createType === 'HEAD_MANAGER' 
                  ? '새로운 본부를 생성합니다.'
                  : '선택한 본부 하위에 지사를 생성합니다.'}
              </p>

              {createType === 'BRANCH_MANAGER' && (
                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, fontSize: 14 }}>
                    소속 본부 *
                  </label>
                  <select
                    value={selectedHeadManagerId}
                    onChange={(e) => setSelectedHeadManagerId(e.target.value)}
                    style={{
                      width: '100%',
                      padding: 12,
                      border: '1px solid #ddd',
                      borderRadius: 4,
                      fontSize: 14,
                      boxSizing: 'border-box',
                    }}
                  >
                    <option value="">본부를 선택하세요</option>
                    {salesPeople.filter(p => p.role === 'HEAD_MANAGER').map(head => (
                      <option key={head.id} value={head.id}>
                        {head.name} 본부
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* 전화번호로 매니저 검색 */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, fontSize: 14 }}>
                  매니저 전화번호로 검색 *
                </label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    type="tel"
                    value={searchPhone}
                    onChange={(e) => setSearchPhone(e.target.value)}
                    placeholder="예: 01012345678"
                    style={{
                      flex: 1,
                      padding: 12,
                      border: '1px solid #ddd',
                      borderRadius: 4,
                      fontSize: 14,
                      boxSizing: 'border-box',
                    }}
                  />
                  <button
                    onClick={searchManagerByPhone}
                    style={{
                      padding: '12px 20px',
                      backgroundColor: '#1976d2',
                      color: 'white',
                      border: 'none',
                      borderRadius: 4,
                      cursor: 'pointer',
                      fontSize: 14,
                      fontWeight: 600,
                    }}
                  >
                    🔍 검색
                  </button>
                </div>
                {searchedManager && (
                  <div style={{
                    marginTop: 12,
                    padding: 12,
                    backgroundColor: '#e8f5e9',
                    borderRadius: 4,
                    border: '1px solid #4caf50',
                  }}>
                    <div style={{ fontWeight: 600, color: '#2e7d32', marginBottom: 4 }}>
                      ✓ 매니저를 찾았습니다
                    </div>
                    <div style={{ fontSize: 14, color: '#666' }}>
                      이름: {searchedManager.name} | 역할: {getRoleName(searchedManager.role)} | 전화번호: {searchedManager.phone}
                    </div>
                  </div>
                )}
              </div>

              {/* 조직명 입력 */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, fontSize: 14 }}>
                  {createType === 'HEAD_MANAGER' ? '본부명' : '지사명'} *
                </label>
                <input
                  type="text"
                  value={organizationName}
                  onChange={(e) => setOrganizationName(e.target.value)}
                  placeholder={createType === 'HEAD_MANAGER' ? '예: 서울본부' : '예: 강남지사'}
                  style={{
                    width: '100%',
                    padding: 12,
                    border: '1px solid #ddd',
                    borderRadius: 4,
                    fontSize: 14,
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* 🆕 추천 매니저 검색 (선택사항) */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, fontSize: 14 }}>
                  추천 매니저 검색 (선택사항)
                </label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    type="tel"
                    value={referrerSearchPhone}
                    onChange={(e) => setReferrerSearchPhone(e.target.value)}
                    placeholder="예: 01012345678"
                    style={{
                      flex: 1,
                      padding: 12,
                      border: '1px solid #ddd',
                      borderRadius: 4,
                      fontSize: 14,
                      boxSizing: 'border-box',
                    }}
                  />
                  <button
                    onClick={searchReferrerByPhone}
                    style={{
                      padding: '12px 20px',
                      backgroundColor: '#9c27b0',
                      color: 'white',
                      border: 'none',
                      borderRadius: 4,
                      cursor: 'pointer',
                      fontSize: 14,
                      fontWeight: 600,
                    }}
                  >
                    🔍 검색
                  </button>
                </div>
                {searchedReferrer && (
                  <div style={{
                    marginTop: 12,
                    padding: 12,
                    backgroundColor: '#f3e5f5',
                    borderRadius: 4,
                    border: '1px solid #9c27b0',
                  }}>
                    <div style={{ fontWeight: 600, color: '#6a1b9a', marginBottom: 4 }}>
                      ✓ 추천 매니저를 찾았습니다
                    </div>
                    <div style={{ fontSize: 14, color: '#666' }}>
                      이름: {searchedReferrer.name} | 역할: {getRoleName(searchedReferrer.role)} | 전화번호: {searchedReferrer.phone}
                    </div>
                  </div>
                )}
                <div style={{ marginTop: 8, fontSize: 13, color: '#999' }}>
                  💡 이 본부/지사를 소개한 매니저가 있다면 검색해서 연결할 수 있습니다.
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setSearchPhone('');
                    setSearchedManager(null);
                    setOrganizationName('');
                    setSelectedHeadManagerId('');
                    setReferrerSearchPhone(''); // 🆕 추천 매니저 검색 초기화
                    setSearchedReferrer(null); // 🆕 추천 매니저 초기화
                  }}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#2196F3',
                    color: 'white',
                    border: 'none',
                    borderRadius: 4,
                    cursor: 'pointer',
                    fontSize: 14,
                    fontWeight: 500,
                  }}
                >
                  취소
                </button>
                <button
                  onClick={handleCreatePerson}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: createType === 'HEAD_MANAGER' ? '#d32f2f' : '#f57c00',
                    color: 'white',
                    border: 'none',
                    borderRadius: 4,
                    cursor: 'pointer',
                    fontSize: 14,
                    fontWeight: 600,
                  }}
                >
                  생성
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* 삭제 확인 모달 */}
        {showDeleteModal && deletingPerson && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}>
            <div style={{
              background: 'white',
              borderRadius: 8,
              padding: 24,
              maxWidth: 400,
              width: '90%',
            }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: 18, fontWeight: 600 }}>
                🗑️ 삭제 확인
              </h3>
              <p style={{ margin: '0 0 8px 0', fontSize: 14 }}>
                정말 <strong>{deletingPerson.name}</strong>을(를) 삭제하시겠습니까?
              </p>
              <div style={{
                padding: 12,
                backgroundColor: '#fff3cd',
                borderRadius: 4,
                marginBottom: 16,
                fontSize: 13,
                color: '#856404',
              }}>
                ⚠️ <strong>주의:</strong> 이 작업은 되돌릴 수 없습니다.
              </div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeletingPerson(null);
                  }}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#2196F3',
                    color: 'white',
                    border: 'none',
                    borderRadius: 4,
                    cursor: 'pointer',
                    fontSize: 14,
                    fontWeight: 500,
                  }}
                >
                  취소
                </button>
                <button
                  onClick={confirmDelete}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#d32f2f',
                    color: 'white',
                    border: 'none',
                    borderRadius: 4,
                    cursor: 'pointer',
                    fontSize: 14,
                    fontWeight: 600,
                  }}
                >
                  삭제
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
