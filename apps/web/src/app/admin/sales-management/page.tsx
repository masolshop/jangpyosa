'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';

interface SalesPerson {
  id: string;
  userId: string;
  name: string;
  organizationName?: string;
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
}

type ViewMode = 'list' | 'organization';

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
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [expandedBranches, setExpandedBranches] = useState<Set<string>>(new Set());
  
  // 모달 상태
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createType, setCreateType] = useState<'HEAD_MANAGER' | 'BRANCH_MANAGER'>('HEAD_MANAGER');
  const [selectedHeadManagerId, setSelectedHeadManagerId] = useState<string>('');
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

  // 영업 인원 목록 로드
  useEffect(() => {
    loadSalesPeople();
    loadPendingPeople();
  }, []);

  // 필터링
  useEffect(() => {
    let filtered = salesPeople;

    if (selectedRole !== 'ALL') {
      filtered = filtered.filter(p => p.role === selectedRole);
    }

    if (searchTerm) {
      filtered = filtered.filter(p =>
        p.name.includes(searchTerm) ||
        p.phone.includes(searchTerm) ||
        p.email?.includes(searchTerm)
      );
    }

    setFilteredPeople(filtered);
  }, [salesPeople, selectedRole, searchTerm]);

  const loadSalesPeople = async () => {
    try {
      setLoading(true);
      const data = await apiFetch('/sales/people?isActive=true');
      setSalesPeople(data.salesPeople || []);
    } catch (err: any) {
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
    } catch (err: any) {
      setError(err.message || `${action} 실패`);
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleCreatePerson = async () => {
    const { organizationName, managerName, phone, password, passwordConfirm, email } = newPersonData;

    // 필수 항목 검증
    if (!organizationName || !managerName || !phone || !password) {
      setError('조직명, 대표자명, 전화번호, 비밀번호는 필수입니다.');
      setTimeout(() => setError(''), 3000);
      return;
    }

    // 비밀번호 확인
    if (password !== passwordConfirm) {
      setError('비밀번호가 일치하지 않습니다.');
      setTimeout(() => setError(''), 3000);
      return;
    }

    // 비밀번호 길이 검증
    if (password.length < 6) {
      setError('비밀번호는 최소 6자 이상이어야 합니다.');
      setTimeout(() => setError(''), 3000);
      return;
    }

    if (createType === 'BRANCH_MANAGER' && !selectedHeadManagerId) {
      setError('본부를 선택해주세요.');
      setTimeout(() => setError(''), 3000);
      return;
    }

    try {
      await apiFetch('/sales/people/create', {
        method: 'POST',
        body: JSON.stringify({
          organizationName, // 본부명 또는 지사명
          name: managerName, // 본부장명 또는 지사장명
          phone: phone.replace(/[-\s]/g, ''),
          email: email || undefined,
          password,
          role: createType,
          managerId: createType === 'BRANCH_MANAGER' ? selectedHeadManagerId : undefined,
        }),
      });

      setSuccessMessage(`${getRoleName(createType)} 생성이 완료되었습니다.`);
      setTimeout(() => setSuccessMessage(''), 3000);
      
      // 모달 닫고 초기화
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
      
      loadSalesPeople();
    } catch (err: any) {
      setError(err.message || '생성 실패');
      setTimeout(() => setError(''), 3000);
    }
  };

  const openCreateModal = (type: 'HEAD_MANAGER' | 'BRANCH_MANAGER', headManagerId?: string) => {
    setCreateType(type);
    if (headManagerId) {
      setSelectedHeadManagerId(headManagerId);
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

  // 계층형 목록을 위한 정렬 함수
  const getHierarchicalList = (people: SalesPerson[]) => {
    const result: SalesPerson[] = [];
    const heads = people.filter(p => p.role === 'HEAD_MANAGER');
    
    heads.forEach(head => {
      result.push(head);
      const branches = people.filter(p => p.managerId === head.id && p.role === 'BRANCH_MANAGER');
      branches.forEach(branch => {
        result.push(branch);
        const managers = people.filter(p => p.managerId === branch.id && p.role === 'MANAGER');
        result.push(...managers);
      });
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
              onClick={() => setViewMode('list')}
              style={{
                padding: '8px 16px',
                backgroundColor: viewMode === 'list' ? '#1976d2' : 'white',
                color: viewMode === 'list' ? 'white' : '#666',
                border: '1px solid #ddd',
                borderRadius: 4,
                cursor: 'pointer',
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              📋 목록 보기
            </button>
            <button
              onClick={() => setViewMode('organization')}
              style={{
                padding: '8px 16px',
                backgroundColor: viewMode === 'organization' ? '#1976d2' : 'white',
                color: viewMode === 'organization' ? 'white' : '#666',
                border: '1px solid #ddd',
                borderRadius: 4,
                cursor: 'pointer',
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              🏢 조직도 보기
            </button>
          </div>
        </div>

        {/* 목록 보기 */}
        {viewMode === 'list' && (
          <>
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
                    
                    return (
                    <tr key={person.id} style={{ borderBottom: '1px solid #e0e0e0', backgroundColor: bgColor }}>
                      <td style={{ padding: 16, paddingLeft: 16 + indent }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
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
                          // 본부 찾기 (본인이 본부장이거나, 상위가 본부장이거나, 상위의 상위가 본부장인 경우)
                          if (person.role === 'HEAD_MANAGER') {
                            return <span style={{ fontWeight: 600, color: '#d32f2f' }}>{person.name} 본부</span>;
                          } else if (person.manager) {
                            if (person.manager.role === 'HEAD_MANAGER') {
                              return person.manager.name + ' 본부';
                            } else if (person.manager.role === 'BRANCH_MANAGER') {
                              // 지사장의 상위를 찾아야 함
                              const branchManager = salesPeople.find(p => p.id === person.manager?.id);
                              if (branchManager?.manager) {
                                return branchManager.manager.name + ' 본부';
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
                            return <span style={{ fontWeight: 600, color: '#f57c00' }}>{person.name} 지사</span>;
                          } else if (person.manager) {
                            if (person.manager.role === 'BRANCH_MANAGER') {
                              return person.manager.name + ' 지사';
                            } else if (person.manager.role === 'HEAD_MANAGER') {
                              return '-'; // 본부 직속 매니저는 지사 없음
                            }
                          }
                          return '-';
                        })()}
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
                      <td style={{ padding: 16, textAlign: 'center' }}>
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

        {/* 조직도 보기 */}
        {viewMode === 'organization' && (
          <div style={{
            background: 'white',
            borderRadius: 8,
            padding: 24,
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          }}>
            <h2 style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 24 }}>조직도</h2>
            
            {getOrganizationTree().map((headManager) => {
              const isExpanded = expandedBranches.has(headManager.id);
              const branchCount = headManager.subordinates?.length || 0;
              const managerCount = headManager.subordinates?.reduce((sum, branch) => sum + (branch.subordinates?.length || 0), 0) || 0;
              
              return (
              <div key={headManager.id} style={{ marginBottom: 32 }}>
                {/* 본부장 */}
                <div 
                  onClick={() => toggleBranchExpansion(headManager.id)}
                  style={{
                  padding: 20,
                  backgroundColor: '#ffebee',
                  borderRadius: 8,
                  marginBottom: 16,
                  cursor: 'pointer',
                  border: isExpanded ? '2px solid #d32f2f' : '2px solid transparent',
                  transition: 'all 0.3s ease',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: 18, fontWeight: 'bold', color: '#d32f2f', marginBottom: 8 }}>
                        {isExpanded ? '▼' : '▶'} 🏢 {headManager.name} 본부
                      </div>
                      <div style={{ fontSize: 14, color: '#666' }}>
                        📞 {headManager.phone} | ✉️ {headManager.email || '-'}
                      </div>
                      <div style={{ fontSize: 14, color: '#666', marginTop: 4 }}>
                        지사 {branchCount}개 | 소속매니저 {managerCount}명
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }} onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => openEditModal(headManager)}
                        style={{
                          padding: '8px 16px',
                          backgroundColor: '#1976d2',
                          color: 'white',
                          border: 'none',
                          borderRadius: 4,
                          cursor: 'pointer',
                          fontSize: 14,
                          fontWeight: 600,
                        }}
                      >
                        ✏️ 수정
                      </button>
                      <button
                        onClick={() => openCreateModal('BRANCH_MANAGER', headManager.id)}
                        style={{
                          padding: '8px 16px',
                          backgroundColor: '#f57c00',
                          color: 'white',
                          border: 'none',
                          borderRadius: 4,
                          cursor: 'pointer',
                          fontSize: 14,
                          fontWeight: 600,
                        }}
                      >
                        + 지사 생성
                      </button>
                      <button
                        onClick={() => handleDelete(headManager)}
                        style={{
                          padding: '8px 16px',
                          backgroundColor: '#d32f2f',
                          color: 'white',
                          border: 'none',
                          borderRadius: 4,
                          cursor: 'pointer',
                          fontSize: 14,
                          fontWeight: 600,
                        }}
                      >
                        🗑️ 삭제
                      </button>
                    </div>
                  </div>
                </div>

                {/* 지사장들 */}
                {isExpanded && (
                <div style={{ paddingLeft: 40 }}>
                  {headManager.subordinates && headManager.subordinates.length > 0 ? (
                    headManager.subordinates.map((branch) => (
                      <div key={branch.id} style={{
                        padding: 16,
                        backgroundColor: '#fff3e0',
                        borderRadius: 8,
                        marginBottom: 12,
                        borderLeft: '4px solid #f57c00',
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <div style={{ fontSize: 16, fontWeight: 'bold', color: '#f57c00', marginBottom: 4 }}>
                              🏪 {branch.organizationName || branch.name} (지사장: {branch.name})
                            </div>
                            <div style={{ fontSize: 13, color: '#666' }}>
                              📞 {branch.phone} | ✉️ {branch.email || '-'}
                            </div>
                            <div style={{ fontSize: 13, color: '#666', marginTop: 4 }}>
                              <span style={{ fontWeight: 600, color: '#f57c00' }}>
                                소속매니저 {branch.subordinates?.length || 0}명
                              </span>
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button
                              onClick={() => openEditModal(branch)}
                              style={{
                                padding: '6px 12px',
                                backgroundColor: '#1976d2',
                                color: 'white',
                                border: 'none',
                                borderRadius: 4,
                                cursor: 'pointer',
                                fontSize: 12,
                                fontWeight: 600,
                              }}
                            >
                              ✏️ 수정
                            </button>
                            <button
                              onClick={() => handleToggleActive(branch.id, branch.isActive)}
                              style={{
                                padding: '6px 12px',
                                backgroundColor: branch.isActive ? '#f57c00' : '#4caf50',
                                color: 'white',
                                border: 'none',
                                borderRadius: 4,
                                cursor: 'pointer',
                                fontSize: 12,
                              }}
                            >
                              {branch.isActive ? '비활성화' : '활성화'}
                            </button>
                            <button
                              onClick={() => handleDelete(branch)}
                              style={{
                                padding: '6px 12px',
                                backgroundColor: '#d32f2f',
                                color: 'white',
                                border: 'none',
                                borderRadius: 4,
                                cursor: 'pointer',
                                fontSize: 12,
                                fontWeight: 600,
                              }}
                            >
                              🗑️ 삭제
                            </button>
                          </div>
                        </div>
                        
                        {/* 소속 매니저 목록 */}
                        {branch.subordinates && branch.subordinates.length > 0 && (
                          <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #f0f0f0' }}>
                            <div style={{ fontSize: 13, fontWeight: 600, color: '#666', marginBottom: 8 }}>
                              소속 매니저 목록
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                              {branch.subordinates.map((manager) => (
                                <div key={manager.id} style={{
                                  padding: 10,
                                  backgroundColor: '#f5f5f5',
                                  borderRadius: 4,
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                }}>
                                  <div>
                                    <span style={{ fontWeight: 600, fontSize: 13 }}>👤 {manager.name}</span>
                                    <span style={{ color: '#666', fontSize: 12, marginLeft: 8 }}>
                                      📞 {manager.phone}
                                    </span>
                                  </div>
                                  <button
                                    onClick={() => openEditModal(manager)}
                                    style={{
                                      padding: '4px 8px',
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
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div style={{
                      padding: 20,
                      backgroundColor: '#f5f5f5',
                      borderRadius: 8,
                      textAlign: 'center',
                      color: '#999',
                      fontSize: 14,
                    }}>
                      아직 지사가 없습니다. "+ 지사 생성" 버튼을 눌러 지사를 추가하세요.
                    </div>
                  )}
                </div>
                )}
              </div>
            );
            })}

            {getOrganizationTree().length === 0 && (
              <div style={{
                padding: 40,
                textAlign: 'center',
                color: '#666',
              }}>
                아직 본부가 없습니다. "+ 본부 생성" 버튼을 눌러 본부를 추가하세요.
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

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, fontSize: 14 }}>
                  {createType === 'HEAD_MANAGER' ? '본부명' : '지사명'} *
                </label>
                <input
                  type="text"
                  value={newPersonData.organizationName}
                  onChange={(e) => setNewPersonData({ ...newPersonData, organizationName: e.target.value })}
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

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, fontSize: 14 }}>
                  {createType === 'HEAD_MANAGER' ? '본부장명' : '지사장명'} *
                </label>
                <input
                  type="text"
                  value={newPersonData.managerName}
                  onChange={(e) => setNewPersonData({ ...newPersonData, managerName: e.target.value })}
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
                  전화번호 (ID) *
                </label>
                <input
                  type="tel"
                  value={newPersonData.phone}
                  onChange={(e) => setNewPersonData({ ...newPersonData, phone: e.target.value })}
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

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, fontSize: 14 }}>
                  비밀번호 *
                </label>
                <input
                  type="password"
                  value={newPersonData.password}
                  onChange={(e) => setNewPersonData({ ...newPersonData, password: e.target.value })}
                  placeholder="최소 6자 이상"
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
                  비밀번호 확인 *
                </label>
                <input
                  type="password"
                  value={newPersonData.passwordConfirm}
                  onChange={(e) => setNewPersonData({ ...newPersonData, passwordConfirm: e.target.value })}
                  placeholder="비밀번호 재입력"
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
                  value={newPersonData.email}
                  onChange={(e) => setNewPersonData({ ...newPersonData, email: e.target.value })}
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
