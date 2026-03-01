'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';

interface SalesPerson {
  id: string;
  userId: string;
  name: string;
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
  const [filteredPeople, setFilteredPeople] = useState<SalesPerson[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  
  // 모달 상태
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createType, setCreateType] = useState<'HEAD_MANAGER' | 'BRANCH_MANAGER'>('HEAD_MANAGER');
  const [selectedHeadManagerId, setSelectedHeadManagerId] = useState<string>('');
  const [newPersonData, setNewPersonData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
  });

  // 영업 인원 목록 로드
  useEffect(() => {
    loadSalesPeople();
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
      const data = await apiFetch('/sales/people');
      setSalesPeople(data.salesPeople || []);
    } catch (err: any) {
      setError(err.message || '데이터 로드 실패');
    } finally {
      setLoading(false);
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
    if (!newPersonData.name || !newPersonData.phone || !newPersonData.password) {
      setError('이름, 전화번호, 비밀번호는 필수입니다.');
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
          name: newPersonData.name,
          phone: newPersonData.phone.replace(/[-\s]/g, ''),
          email: newPersonData.email || undefined,
          password: newPersonData.password,
          role: createType,
          managerId: createType === 'BRANCH_MANAGER' ? selectedHeadManagerId : undefined,
        }),
      });

      setSuccessMessage(`${getRoleName(createType)} 생성이 완료되었습니다.`);
      setTimeout(() => setSuccessMessage(''), 3000);
      
      // 모달 닫고 초기화
      setShowCreateModal(false);
      setNewPersonData({ name: '', phone: '', email: '', password: '' });
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
    
    return headManagers.map(head => ({
      ...head,
      subordinates: salesPeople.filter(p => p.managerId === head.id),
    }));
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
                    <th style={{ padding: 16, textAlign: 'center', fontWeight: 600 }}>추천 고객</th>
                    <th style={{ padding: 16, textAlign: 'right', fontWeight: 600 }}>총 매출</th>
                    <th style={{ padding: 16, textAlign: 'right', fontWeight: 600 }}>커미션</th>
                    <th style={{ padding: 16, textAlign: 'center', fontWeight: 600 }}>상태</th>
                    <th style={{ padding: 16, textAlign: 'center', fontWeight: 600 }}>관리</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPeople.map((person) => (
                    <tr key={person.id} style={{ borderBottom: '1px solid #e0e0e0' }}>
                      <td style={{ padding: 16 }}>
                        <div style={{ fontWeight: 600 }}>{person.name}</div>
                        {person.manager && (
                          <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
                            상위: {person.manager.name}
                          </div>
                        )}
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
                        <div>{person.totalReferrals}명</div>
                        <div style={{ fontSize: 12, color: '#666' }}>
                          활성: {person.activeReferrals}명
                        </div>
                      </td>
                      <td style={{ padding: 16, textAlign: 'right', fontWeight: 600 }}>
                        ₩{person.totalRevenue.toLocaleString()}
                      </td>
                      <td style={{ padding: 16, textAlign: 'right', fontWeight: 600, color: '#2e7d32' }}>
                        ₩{person.commission.toLocaleString()}
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
                        <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                          {getNextRole(person.role) && (
                            <button
                              onClick={() => handlePromote(person.id, getNextRole(person.role)!)}
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
                              ↑ {getRoleName(getNextRole(person.role)!)}
                            </button>
                          )}
                          <button
                            onClick={() => handleToggleActive(person.id, person.isActive)}
                            style={{
                              padding: '6px 12px',
                              backgroundColor: person.isActive ? '#f57c00' : '#4caf50',
                              color: 'white',
                              border: 'none',
                              borderRadius: 4,
                              cursor: 'pointer',
                              fontSize: 12,
                            }}
                          >
                            {person.isActive ? '비활성화' : '활성화'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
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
            
            {getOrganizationTree().map((headManager) => (
              <div key={headManager.id} style={{ marginBottom: 32 }}>
                {/* 본부장 */}
                <div style={{
                  padding: 20,
                  backgroundColor: '#ffebee',
                  borderRadius: 8,
                  marginBottom: 16,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: 18, fontWeight: 'bold', color: '#d32f2f', marginBottom: 8 }}>
                        🏢 {headManager.name} 본부
                      </div>
                      <div style={{ fontSize: 14, color: '#666' }}>
                        📞 {headManager.phone} | ✉️ {headManager.email || '-'}
                      </div>
                      <div style={{ fontSize: 14, color: '#666', marginTop: 4 }}>
                        추천: {headManager.totalReferrals}명 | 매출: ₩{headManager.totalRevenue.toLocaleString()}
                      </div>
                    </div>
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
                  </div>
                </div>

                {/* 지사장들 */}
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
                              🏪 {branch.name} 지사
                            </div>
                            <div style={{ fontSize: 13, color: '#666' }}>
                              📞 {branch.phone} | ✉️ {branch.email || '-'}
                            </div>
                            <div style={{ fontSize: 13, color: '#666', marginTop: 4 }}>
                              추천: {branch.totalReferrals}명 | 매출: ₩{branch.totalRevenue.toLocaleString()} | 커미션: ₩{branch.commission.toLocaleString()}
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: 8 }}>
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
                          </div>
                        </div>
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
              </div>
            ))}

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
            }}>
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
                  이름 *
                </label>
                <input
                  type="text"
                  value={newPersonData.name}
                  onChange={(e) => setNewPersonData({ ...newPersonData, name: e.target.value })}
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

              <div style={{ marginBottom: 24 }}>
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

              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewPersonData({ name: '', phone: '', email: '', password: '' });
                    setSelectedHeadManagerId('');
                  }}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#f5f5f5',
                    border: '1px solid #ddd',
                    borderRadius: 4,
                    cursor: 'pointer',
                    fontSize: 14,
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
      </div>
    </div>
  );
}
