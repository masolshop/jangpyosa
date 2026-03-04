'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';

interface PendingSalesPerson {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role: 'MANAGER' | 'BRANCH_MANAGER' | 'HEAD_MANAGER';
  organizationName?: string;
  createdAt: string;
}

export default function AdminRootPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [pendingPeople, setPendingPeople] = useState<PendingSalesPerson[]>([]);
  const [approvedPeople, setApprovedPeople] = useState<PendingSalesPerson[]>([]); // 🆕 승인 완료 매니저
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState<PendingSalesPerson | null>(null);
  const [editData, setEditData] = useState({
    name: '',
    organizationName: '',
    phone: '',
    email: '',
    role: 'MANAGER' as 'MANAGER' | 'BRANCH_MANAGER' | 'HEAD_MANAGER',
  });

  useEffect(() => {
    checkAuthAndRedirect();
  }, []);

  useEffect(() => {
    if (!loading) {
      loadPendingPeople();
      loadApprovedPeople(); // 🆕 승인 완료 매니저 로드
    }
  }, [loading]);

  const checkAuthAndRedirect = () => {
    if (typeof window === 'undefined') return;

    const userRole = localStorage.getItem('userRole');
    const token = localStorage.getItem('accessToken');

    // 슈퍼어드민 인증 확인
    if (token && userRole === 'SUPER_ADMIN') {
      // 슈퍼어드민은 이 페이지를 표시 (대시보드)
      setLoading(false);
    } else {
      // 인증 안 되어 있으면 로그인 페이지로
      router.replace('/admin/login');
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

  // 🆕 승인 완료 매니저 로드
  const loadApprovedPeople = async () => {
    try {
      console.log('✅ 승인 완료 매니저 로드 시작...');
      const data = await apiFetch('/sales/people?isActive=true');
      console.log('📊 승인 완료 매니저 수:', data.salesPeople?.length || 0);
      setApprovedPeople(data.salesPeople || []);
    } catch (err: any) {
      console.error('❌ 승인 완료 목록 로드 실패:', err);
    }
  };

  const handleApprove = async (personId: string) => {
    try {
      await apiFetch(`/sales/people/${personId}/toggle-active`, {
        method: 'POST',
        body: JSON.stringify({
          isActive: true,
        }),
      });

      setSuccessMessage('승인이 완료되었습니다.');
      setTimeout(() => setSuccessMessage(''), 3000);
      setShowApprovalModal(false);
      setSelectedPerson(null);
      loadPendingPeople();
      loadApprovedPeople(); // 🆕 승인 완료 목록도 새로고침
    } catch (err: any) {
      setError(err.message || '승인 실패');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleShowApprovalModal = (person: PendingSalesPerson) => {
    setSelectedPerson(person);
    setShowApprovalModal(true);
  };

  const handleShowEditModal = (person: PendingSalesPerson) => {
    setSelectedPerson(person);
    setEditData({
      name: person.name,
      organizationName: person.organizationName || '',
      phone: person.phone,
      email: person.email || '',
      role: person.role,
    });
    setShowEditModal(true);
  };

  const handleUpdateAndApprove = async () => {
    if (!selectedPerson) return;

    // 유효성 검사
    if (!editData.name || !editData.phone) {
      setError('이름과 전화번호는 필수입니다.');
      setTimeout(() => setError(''), 3000);
      return;
    }

    try {
      // 정보 업데이트
      await apiFetch(`/sales/people/${selectedPerson.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          name: editData.name,
          organizationName: editData.organizationName,
          phone: editData.phone,
          email: editData.email,
          role: editData.role,
        }),
      });

      // 승인 처리
      await apiFetch(`/sales/people/${selectedPerson.id}/toggle-active`, {
        method: 'POST',
        body: JSON.stringify({
          isActive: true,
        }),
      });

      setSuccessMessage('정보가 수정되고 승인이 완료되었습니다.');
      setTimeout(() => setSuccessMessage(''), 3000);
      setShowEditModal(false);
      setSelectedPerson(null);
      loadPendingPeople();
    } catch (err: any) {
      setError(err.message || '수정 및 승인 실패');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleReject = async (personId: string) => {
    if (!confirm('이 매니저를 거절하시겠습니까? (계정이 삭제됩니다)')) {
      return;
    }

    try {
      await apiFetch(`/sales/people/${personId}`, {
        method: 'DELETE',
      });

      setSuccessMessage('거절 처리되었습니다.');
      setTimeout(() => setSuccessMessage(''), 3000);
      loadPendingPeople();
    } catch (err: any) {
      setError(err.message || '거절 처리 실패');
      setTimeout(() => setError(''), 3000);
    }
  };

  const getRoleName = (role: string) => {
    switch (role) {
      case 'MANAGER': return '매니저';
      case 'BRANCH_MANAGER': return '지사장';
      case 'HEAD_MANAGER': return '본부장';
      default: return role;
    }
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#f5f5f5',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⏳</div>
          <p style={{ color: '#666', fontSize: 16 }}>로딩 중...</p>
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
        maxWidth: 1200,
        margin: '0 auto',
      }}>
        {/* 헤더 */}
        <div style={{
          background: 'white',
          borderRadius: 8,
          padding: 32,
          marginBottom: 24,
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        }}>
          <h1 style={{ fontSize: 32, fontWeight: 'bold', margin: 0, marginBottom: 8 }}>
            🛡️ 슈퍼어드민 대시보드
          </h1>
          <p style={{ fontSize: 16, color: '#666', margin: 0 }}>
            장표사닷컴 관리 시스템
          </p>
        </div>

        {/* 알림 메시지 */}
        {error && (
          <div style={{
            background: '#fee',
            border: '1px solid #fcc',
            borderRadius: 8,
            padding: 16,
            marginBottom: 24,
            color: '#c33',
          }}>
            {error}
          </div>
        )}

        {successMessage && (
          <div style={{
            background: '#efe',
            border: '1px solid #cfc',
            borderRadius: 8,
            padding: 16,
            marginBottom: 24,
            color: '#3c3',
          }}>
            {successMessage}
          </div>
        )}

        {/* 메뉴 그리드 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 20,
          marginBottom: 32,
        }}>
          <MenuCard
            icon="📍"
            title="본부/지사 관리"
            description="본부 및 지사 기본 정보 등록"
            link="/admin/organizations"
          />
          <MenuCard
            icon="👥"
            title="영업 관리"
            description="매니저, 지사, 본부 관리"
            link="/admin/sales-management"
          />
          <MenuCard
            icon="🏢"
            title="기업 관리"
            description="고용의무기업 관리"
            link="/admin/company"
          />
          <MenuCard
            icon="🏭"
            title="표준사업장 관리"
            description="표준사업장 관리"
            link="/admin/standard-workplace"
          />
          <MenuCard
            icon="⚙️"
            title="시스템 설정"
            description="전체 시스템 설정"
            link="/admin/settings"
          />
        </div>

        {/* 매니저 승인 대기 리스트 */}
        {pendingPeople.length > 0 && (
          <div style={{
            background: 'white',
            borderRadius: 8,
            padding: 24,
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 20,
            }}>
              <h2 style={{ fontSize: 24, fontWeight: 'bold', margin: 0 }}>
                📋 매니저 승인 대기 리스트
              </h2>
              <span style={{
                background: '#ff6b6b',
                color: 'white',
                padding: '4px 12px',
                borderRadius: 16,
                fontSize: 14,
                fontWeight: 'bold',
              }}>
                {pendingPeople.length}명 대기 중
              </span>
            </div>

            <div style={{
              display: 'grid',
              gap: 16,
            }}>
              {pendingPeople.map((person) => (
                <div
                  key={person.id}
                  style={{
                    border: '1px solid #e0e0e0',
                    borderRadius: 8,
                    padding: 20,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    backgroundColor: '#fafafa',
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                      <span style={{
                        background: '#4CAF50',
                        color: 'white',
                        padding: '4px 10px',
                        borderRadius: 4,
                        fontSize: 13,
                        fontWeight: 'bold',
                      }}>
                        {getRoleName(person.role)}
                      </span>
                      <h3 style={{ fontSize: 18, fontWeight: 'bold', margin: 0 }}>
                        {person.name}
                      </h3>
                      {person.organizationName && (
                        <span style={{ color: '#666', fontSize: 14 }}>
                          ({person.organizationName})
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: 20, fontSize: 14, color: '#666' }}>
                      <span>📱 {person.phone}</span>
                      {person.email && <span>📧 {person.email}</span>}
                      <span>🗓️ {new Date(person.createdAt).toLocaleDateString('ko-KR')}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      onClick={() => handleShowApprovalModal(person)}
                      style={{
                        padding: '10px 20px',
                        background: '#4CAF50',
                        color: 'white',
                        border: 'none',
                        borderRadius: 6,
                        fontSize: 14,
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#45a049';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#4CAF50';
                      }}
                    >
                      ✓ 승인
                    </button>
                    <button
                      onClick={() => handleShowEditModal(person)}
                      style={{
                        padding: '10px 20px',
                        background: '#2196F3',
                        color: 'white',
                        border: 'none',
                        borderRadius: 6,
                        fontSize: 14,
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#0b7dda';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#2196F3';
                      }}
                    >
                      ✏️ 수정
                    </button>
                    <button
                      onClick={() => handleReject(person.id)}
                      style={{
                        padding: '10px 20px',
                        background: '#f44336',
                        color: 'white',
                        border: 'none',
                        borderRadius: 6,
                        fontSize: 14,
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#da190b';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#f44336';
                      }}
                    >
                      ✗ 거절
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 🆕 승인 완료 매니저 리스트 */}
        {approvedPeople.length > 0 && (
          <div style={{
            background: 'white',
            borderRadius: 8,
            padding: 24,
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            marginTop: 24,
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 20,
            }}>
              <h2 style={{ fontSize: 24, fontWeight: 'bold', margin: 0 }}>
                ✅ 승인 완료 매니저 리스트
              </h2>
              <span style={{
                background: '#4CAF50',
                color: 'white',
                padding: '4px 12px',
                borderRadius: 16,
                fontSize: 14,
                fontWeight: 'bold',
              }}>
                총 {approvedPeople.length}명
              </span>
            </div>

            <div style={{
              display: 'grid',
              gap: 12,
            }}>
              {approvedPeople.map((person) => (
                <div
                  key={person.id}
                  style={{
                    border: '1px solid #e8f5e9',
                    borderRadius: 8,
                    padding: 16,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    backgroundColor: '#f1f8f4',
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
                      <span style={{
                        background: '#4CAF50',
                        color: 'white',
                        padding: '4px 10px',
                        borderRadius: 4,
                        fontSize: 13,
                        fontWeight: 'bold',
                      }}>
                        {getRoleName(person.role)}
                      </span>
                      <h3 style={{ fontSize: 16, fontWeight: 'bold', margin: 0 }}>
                        {person.name}
                      </h3>
                      {person.organizationName && (
                        <span style={{ color: '#666', fontSize: 13 }}>
                          ({person.organizationName})
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: 16, fontSize: 13, color: '#666' }}>
                      <span>📱 {person.phone}</span>
                      {person.email && <span>📧 {person.email}</span>}
                      <span>🗓️ {new Date(person.createdAt).toLocaleDateString('ko-KR')}</span>
                    </div>
                  </div>
                  <div style={{
                    padding: '6px 16px',
                    background: '#4CAF50',
                    color: 'white',
                    borderRadius: 20,
                    fontSize: 13,
                    fontWeight: 'bold',
                  }}>
                    ✓ 활성
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 승인 대기가 없을 때 */}
        {pendingPeople.length === 0 && (
          <div style={{
            background: 'white',
            borderRadius: 8,
            padding: 48,
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
            <p style={{ fontSize: 18, color: '#666', margin: 0 }}>
              승인 대기 중인 매니저가 없습니다.
            </p>
          </div>
        )}

        {/* 승인 확인 모달 */}
        {showApprovalModal && selectedPerson && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
          }}>
            <div style={{
              background: 'white',
              borderRadius: 12,
              padding: 32,
              maxWidth: 600,
              width: '90%',
              maxHeight: '80vh',
              overflow: 'auto',
              boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
            }}>
              <h2 style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 24, color: '#333' }}>
                📋 가입 정보 확인
              </h2>

              <div style={{
                background: '#f9f9f9',
                borderRadius: 8,
                padding: 24,
                marginBottom: 24,
              }}>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontSize: 14, color: '#666', display: 'block', marginBottom: 4 }}>
                    역할
                  </label>
                  <div style={{
                    fontSize: 16,
                    fontWeight: 'bold',
                    display: 'inline-block',
                    background: '#4CAF50',
                    color: 'white',
                    padding: '6px 12px',
                    borderRadius: 6,
                  }}>
                    {getRoleName(selectedPerson.role)}
                  </div>
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontSize: 14, color: '#666', display: 'block', marginBottom: 4 }}>
                    이름
                  </label>
                  <div style={{ fontSize: 18, fontWeight: 'bold', color: '#333' }}>
                    {selectedPerson.name}
                  </div>
                </div>

                {selectedPerson.organizationName && (
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ fontSize: 14, color: '#666', display: 'block', marginBottom: 4 }}>
                      조직명
                    </label>
                    <div style={{ fontSize: 16, color: '#333' }}>
                      {selectedPerson.organizationName}
                    </div>
                  </div>
                )}

                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontSize: 14, color: '#666', display: 'block', marginBottom: 4 }}>
                    전화번호
                  </label>
                  <div style={{ fontSize: 16, color: '#333' }}>
                    📱 {selectedPerson.phone}
                  </div>
                </div>

                {selectedPerson.email && (
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ fontSize: 14, color: '#666', display: 'block', marginBottom: 4 }}>
                      이메일
                    </label>
                    <div style={{ fontSize: 16, color: '#333' }}>
                      📧 {selectedPerson.email}
                    </div>
                  </div>
                )}

                <div style={{ marginBottom: 0 }}>
                  <label style={{ fontSize: 14, color: '#666', display: 'block', marginBottom: 4 }}>
                    가입일
                  </label>
                  <div style={{ fontSize: 16, color: '#333' }}>
                    🗓️ {new Date(selectedPerson.createdAt).toLocaleString('ko-KR')}
                  </div>
                </div>
              </div>

              <div style={{
                background: '#fff3cd',
                border: '1px solid #ffc107',
                borderRadius: 8,
                padding: 16,
                marginBottom: 24,
              }}>
                <p style={{ margin: 0, color: '#856404', fontSize: 14 }}>
                  ⚠️ 승인하시겠습니까? 승인 후 해당 매니저는 로그인하여 시스템을 사용할 수 있습니다.
                </p>
              </div>

              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button
                  onClick={() => {
                    setShowApprovalModal(false);
                    setSelectedPerson(null);
                  }}
                  style={{
                    padding: '12px 24px',
                    background: '#666',
                    color: 'white',
                    border: 'none',
                    borderRadius: 8,
                    fontSize: 16,
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#555';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#666';
                  }}
                >
                  취소
                </button>
                <button
                  onClick={() => handleApprove(selectedPerson.id)}
                  style={{
                    padding: '12px 24px',
                    background: '#4CAF50',
                    color: 'white',
                    border: 'none',
                    borderRadius: 8,
                    fontSize: 16,
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#45a049';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#4CAF50';
                  }}
                >
                  ✓ 승인하기
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 수정 및 승인 모달 */}
        {showEditModal && selectedPerson && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
          }}>
            <div style={{
              background: 'white',
              borderRadius: 12,
              padding: 32,
              maxWidth: 600,
              width: '90%',
              maxHeight: '80vh',
              overflow: 'auto',
              boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
            }}>
              <h2 style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 24, color: '#333' }}>
                ✏️ 가입 정보 수정 및 승인
              </h2>

              <div style={{
                background: '#f9f9f9',
                borderRadius: 8,
                padding: 24,
                marginBottom: 24,
              }}>
                {/* 역할 선택 */}
                <div style={{ marginBottom: 20 }}>
                  <label style={{ fontSize: 14, color: '#666', display: 'block', marginBottom: 8, fontWeight: 'bold' }}>
                    역할 *
                  </label>
                  <select
                    value={editData.role}
                    onChange={(e) => setEditData({ ...editData, role: e.target.value as any })}
                    style={{
                      width: '100%',
                      padding: '12px',
                      fontSize: 16,
                      border: '1px solid #ddd',
                      borderRadius: 6,
                      background: 'white',
                      cursor: 'pointer',
                    }}
                  >
                    <option value="MANAGER">매니저</option>
                    <option value="BRANCH_MANAGER">지사장</option>
                    <option value="HEAD_MANAGER">본부장</option>
                  </select>
                </div>

                {/* 이름 */}
                <div style={{ marginBottom: 20 }}>
                  <label style={{ fontSize: 14, color: '#666', display: 'block', marginBottom: 8, fontWeight: 'bold' }}>
                    이름 *
                  </label>
                  <input
                    type="text"
                    value={editData.name}
                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                    placeholder="이름을 입력하세요"
                    style={{
                      width: '100%',
                      padding: '12px',
                      fontSize: 16,
                      border: '1px solid #ddd',
                      borderRadius: 6,
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                {/* 조직명 */}
                <div style={{ marginBottom: 20 }}>
                  <label style={{ fontSize: 14, color: '#666', display: 'block', marginBottom: 8, fontWeight: 'bold' }}>
                    조직명 {editData.role === 'HEAD_MANAGER' ? '(본부명)' : editData.role === 'BRANCH_MANAGER' ? '(지사명)' : ''}
                  </label>
                  <input
                    type="text"
                    value={editData.organizationName}
                    onChange={(e) => setEditData({ ...editData, organizationName: e.target.value })}
                    placeholder={
                      editData.role === 'HEAD_MANAGER' ? '본부명을 입력하세요' :
                      editData.role === 'BRANCH_MANAGER' ? '지사명을 입력하세요' :
                      '조직명을 입력하세요'
                    }
                    style={{
                      width: '100%',
                      padding: '12px',
                      fontSize: 16,
                      border: '1px solid #ddd',
                      borderRadius: 6,
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                {/* 전화번호 */}
                <div style={{ marginBottom: 20 }}>
                  <label style={{ fontSize: 14, color: '#666', display: 'block', marginBottom: 8, fontWeight: 'bold' }}>
                    전화번호 *
                  </label>
                  <input
                    type="tel"
                    value={editData.phone}
                    onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                    placeholder="01012345678"
                    style={{
                      width: '100%',
                      padding: '12px',
                      fontSize: 16,
                      border: '1px solid #ddd',
                      borderRadius: 6,
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                {/* 이메일 */}
                <div style={{ marginBottom: 0 }}>
                  <label style={{ fontSize: 14, color: '#666', display: 'block', marginBottom: 8, fontWeight: 'bold' }}>
                    이메일
                  </label>
                  <input
                    type="email"
                    value={editData.email}
                    onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                    placeholder="example@email.com"
                    style={{
                      width: '100%',
                      padding: '12px',
                      fontSize: 16,
                      border: '1px solid #ddd',
                      borderRadius: 6,
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>

              <div style={{
                background: '#e3f2fd',
                border: '1px solid #2196F3',
                borderRadius: 8,
                padding: 16,
                marginBottom: 24,
              }}>
                <p style={{ margin: 0, color: '#1565c0', fontSize: 14 }}>
                  💡 정보를 수정한 후 바로 승인됩니다. 수정된 정보로 매니저가 시스템을 사용할 수 있습니다.
                </p>
              </div>

              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedPerson(null);
                  }}
                  style={{
                    padding: '12px 24px',
                    background: '#666',
                    color: 'white',
                    border: 'none',
                    borderRadius: 8,
                    fontSize: 16,
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#555';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#666';
                  }}
                >
                  취소
                </button>
                <button
                  onClick={handleUpdateAndApprove}
                  style={{
                    padding: '12px 24px',
                    background: '#2196F3',
                    color: 'white',
                    border: 'none',
                    borderRadius: 8,
                    fontSize: 16,
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#0b7dda';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#2196F3';
                  }}
                >
                  ✓ 수정하고 승인하기
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function MenuCard({ icon, title, description, link }: {
  icon: string;
  title: string;
  description: string;
  link: string;
}) {
  return (
    <a
      href={link}
      style={{
        display: 'block',
        background: 'white',
        borderRadius: 8,
        padding: 24,
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        textDecoration: 'none',
        color: 'inherit',
        transition: 'all 0.2s',
        cursor: 'pointer',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
      }}
    >
      <div style={{ fontSize: 48, marginBottom: 16 }}>{icon}</div>
      <h3 style={{ fontSize: 20, fontWeight: 'bold', margin: 0, marginBottom: 8 }}>
        {title}
      </h3>
      <p style={{ fontSize: 14, color: '#666', margin: 0 }}>
        {description}
      </p>
    </a>
  );
}
