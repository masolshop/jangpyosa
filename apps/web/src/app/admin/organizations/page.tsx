"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 
  (typeof window !== 'undefined' && window.location.hostname === 'jangpyosa.com' 
    ? 'https://jangpyosa.com/api' 
    : 'http://localhost:4000');

interface Organization {
  id: string;
  name: string;
  type: 'HEADQUARTERS' | 'BRANCH';
  leaderName: string;
  phone: string;
  email?: string;
  parentId?: string;
  branches?: Organization[];
  salesPeople?: any[];
  createdAt: string;
}

interface Manager {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  role: string;
  organizationName: string | null;
}

interface OrganizationData {
  headquarters: Organization[];
  branches: Organization[];
}

export default function OrganizationsManagementPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [organizations, setOrganizations] = useState<OrganizationData>({
    headquarters: [],
    branches: [],
  });
  
  // 등록/수정 모달
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'HEADQUARTERS' as 'HEADQUARTERS' | 'BRANCH',
    managerId: '',
    email: '',
    parentId: '',
    notes: '',
  });
  
  // 매니저 검색
  const [managerSearch, setManagerSearch] = useState('');
  const [managerResults, setManagerResults] = useState<Manager[]>([]);
  const [selectedManager, setSelectedManager] = useState<Manager | null>(null);
  const [loadingManagers, setLoadingManagers] = useState(false);
  
  // 🆕 추천 매니저 검색
  const [referrerSearch, setReferrerSearch] = useState('');
  const [referrerResults, setReferrerResults] = useState<Manager[]>([]);
  const [selectedReferrer, setSelectedReferrer] = useState<Manager | null>(null);
  const [loadingReferrers, setLoadingReferrers] = useState(false);
  
  // 상태 메시지
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // 인증 확인 및 리다이렉트
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('accessToken');
      const userRole = localStorage.getItem('userRole');
      
      if (!token || userRole !== 'SUPER_ADMIN') {
        router.push('/admin/login');
        return false;
      }
      return true;
    };
    
    if (checkAuth()) {
      loadOrganizations();
    }
  }, [router]);

  // 조직 목록 로드
  const loadOrganizations = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${API_BASE}/sales/organizations`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setOrganizations(data);
      } else {
        showMessage('error', '조직 목록을 불러오는데 실패했습니다');
      }
    } catch (error) {
      console.error('조직 목록 로드 에러:', error);
      showMessage('error', '서버 연결에 실패했습니다');
    } finally {
      setLoading(false);
    }
  };

  // 메시지 표시
  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  // 등록 모달 열기
  const handleOpenCreateModal = (type: 'HEADQUARTERS' | 'BRANCH') => {
    setModalMode('create');
    setSelectedOrg(null);
    setFormData({
      name: '',
      type,
      managerId: '',
      email: '',
      parentId: '',
      notes: '',
    });
    setManagerSearch('');
    setManagerResults([]);
    setSelectedManager(null);
    // 🆕 추천 매니저 상태 초기화
    setReferrerSearch('');
    setReferrerResults([]);
    setSelectedReferrer(null);
    setShowModal(true);
  };

  // 수정 모달 열기
  const handleOpenEditModal = (org: Organization) => {
    setModalMode('edit');
    setSelectedOrg(org);
    setFormData({
      name: org.name,
      type: org.type,
      managerId: '',
      email: org.email || '',
      parentId: org.parentId || '',
      notes: '',
    });
    setShowModal(true);
  };

  // 매니저 검색
  const searchManagers = async () => {
    if (!managerSearch.trim()) {
      setManagerResults([]);
      return;
    }
    
    setLoadingManagers(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(
        `${API_BASE}/sales/available-managers?search=${encodeURIComponent(managerSearch)}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        setManagerResults(data.managers || []);
      } else {
        showMessage('error', '매니저 검색에 실패했습니다');
      }
    } catch (error) {
      console.error('매니저 검색 에러:', error);
      showMessage('error', '서버 연결에 실패했습니다');
    } finally {
      setLoadingManagers(false);
    }
  };
  
  // 매니저 선택
  const handleSelectManager = (manager: Manager) => {
    setSelectedManager(manager);
    setFormData({ ...formData, managerId: manager.id });
    setManagerResults([]);
    setManagerSearch('');
  };
  
  // 🆕 추천 매니저 검색
  const searchReferrers = async () => {
    if (!referrerSearch.trim()) {
      setReferrerResults([]);
      return;
    }
    
    setLoadingReferrers(true);
    try {
      const token = localStorage.getItem('accessToken');
      
      if (!token) {
        showMessage('error', '로그인이 필요합니다');
        setLoadingReferrers(false);
        return;
      }
      
      const response = await fetch(
        `${API_BASE}/sales/available-managers?search=${encodeURIComponent(referrerSearch)}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        const managers = data.managers || [];
        setReferrerResults(managers);
        
        if (managers.length === 0) {
          showMessage('info', `"${referrerSearch}" 검색 결과가 없습니다`);
        }
      } else {
        const errorData = await response.json().catch(() => ({ error: '알 수 없는 오류' }));
        showMessage('error', errorData.error || '추천 매니저 검색에 실패했습니다');
      }
    } catch (error: any) {
      console.error('추천 매니저 검색 에러:', error);
      showMessage('error', error.message || '서버 연결에 실패했습니다');
    } finally {
      setLoadingReferrers(false);
    }
  };
  
  // 🆕 추천 매니저 선택
  const handleSelectReferrer = (manager: Manager) => {
    setSelectedReferrer(manager);
    setReferrerResults([]);
    setReferrerSearch('');
  };
  
  // 조직 등록/수정
  const handleSubmit = async () => {
    if (modalMode === 'create') {
      if (!formData.name || !formData.managerId) {
        showMessage('error', '조직명과 매니저는 필수입니다');
        return;
      }
      
      if (formData.type === 'BRANCH' && !formData.parentId) {
        showMessage('error', '지사는 소속 본부를 선택해야 합니다');
        return;
      }
    } else {
      if (!formData.name) {
        showMessage('error', '조직명은 필수입니다');
        return;
      }
    }

    try {
      const token = localStorage.getItem('accessToken');
      const url = modalMode === 'create' 
        ? `${API_BASE}/sales/organizations`
        : `${API_BASE}/sales/organizations/${selectedOrg?.id}`;
      
      const response = await fetch(url, {
        method: modalMode === 'create' ? 'POST' : 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          referredById: selectedReferrer?.id || null, // 🆕 추천 매니저 ID 추가
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        showMessage('success', data.message);
        setShowModal(false);
        loadOrganizations();
      } else {
        showMessage('error', data.error || '작업에 실패했습니다');
      }
    } catch (error) {
      console.error('조직 등록/수정 에러:', error);
      showMessage('error', '서버 연결에 실패했습니다');
    }
  };

  // 조직 삭제
  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`정말 "${name}" 조직을 삭제하시겠습니까?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${API_BASE}/sales/organizations/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      const data = await response.json();
      
      if (response.ok) {
        showMessage('success', data.message);
        loadOrganizations();
      } else {
        showMessage('error', data.error || '삭제에 실패했습니다');
      }
    } catch (error) {
      console.error('조직 삭제 에러:', error);
      showMessage('error', '서버 연결에 실패했습니다');
    }
  };

  // 전체 초기화 (모든 본부/지사 및 승인 대기 매니저 삭제)
  const handleResetAll = async () => {
    if (!confirm('⚠️ 경고: 모든 본부/지사 및 승인 대기 매니저가 삭제됩니다.\n\n정말 전체 초기화를 진행하시겠습니까?')) {
      return;
    }

    if (!confirm('정말로 진행하시겠습니까? 이 작업은 되돌릴 수 없습니다!')) {
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${API_BASE}/sales/organizations/reset-all`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      // 응답 타입 확인
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('서버에서 잘못된 응답을 반환했습니다');
      }
      
      const data = await response.json();
      
      if (response.ok) {
        showMessage('success', `전체 초기화 완료: 본부 ${data.deleted.headquarters}개, 지사 ${data.deleted.branches}개, 승인 대기 매니저 ${data.deleted.managers}명 삭제`);
        loadOrganizations();
      } else {
        showMessage('error', data.error || '초기화에 실패했습니다');
      }
    } catch (error: any) {
      console.error('전체 초기화 에러:', error);
      showMessage('error', error.message || '서버 연결에 실패했습니다');
    }
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{ textAlign: 'center', color: 'white' }}>
          <div style={{
            border: '4px solid rgba(255,255,255,0.3)',
            borderTop: '4px solid white',
            borderRadius: '50%',
            width: 50,
            height: 50,
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px',
          }} />
          <p style={{ fontSize: 18 }}>로딩 중...</p>
          <style jsx>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f5f5f5',
      padding: '40px 20px',
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* 헤더 */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 32,
        }}>
          <div>
            <h1 style={{ fontSize: 32, fontWeight: 'bold', margin: 0, marginBottom: 8 }}>
              🏢 본부/지사 관리
            </h1>
            <p style={{ fontSize: 14, color: '#666', margin: 0 }}>
              본부 및 지사 기본 정보를 등록합니다 (계정 생성 없음)
            </p>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              onClick={handleResetAll}
              style={{
                padding: '12px 24px',
                background: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: 8,
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              🗑️ 전체 초기화
            </button>
            <button
              onClick={() => router.push('/admin')}
              style={{
                padding: '12px 24px',
                background: '#6b7280',
                color: 'white',
                border: 'none',
                borderRadius: 8,
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              ← 대시보드로
            </button>
          </div>
        </div>

        {/* 메시지 */}
        {message && (
          <div style={{
            padding: '12px 16px',
            background: message.type === 'success' ? '#d1fae5' : '#fee',
            border: `1px solid ${message.type === 'success' ? '#a7f3d0' : '#fcc'}`,
            borderRadius: 8,
            color: message.type === 'success' ? '#065f46' : '#c00',
            marginBottom: 24,
          }}>
            {message.text}
          </div>
        )}

        {/* 본부 섹션 */}
        <div style={{
          background: 'white',
          borderRadius: 16,
          padding: 32,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          marginBottom: 32,
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 24,
          }}>
            <h2 style={{ fontSize: 24, fontWeight: 'bold', margin: 0 }}>
              📍 본부 목록
            </h2>
            <button
              onClick={() => handleOpenCreateModal('HEADQUARTERS')}
              style={{
                padding: '10px 20px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: 8,
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: 14,
              }}
            >
              + 본부 등록
            </button>
          </div>

          {organizations.headquarters.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: 40,
              color: '#999',
            }}>
              등록된 본부가 없습니다
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {organizations.headquarters.map((hq) => (
                <div
                  key={hq.id}
                  style={{
                    border: '1px solid #e5e5e5',
                    borderRadius: 12,
                    padding: 20,
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                  }}>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontSize: 18, fontWeight: 'bold', margin: 0, marginBottom: 8 }}>
                        {hq.name}
                      </h3>
                      <div style={{ fontSize: 14, color: '#666' }}>
                        <p style={{ margin: '4px 0' }}>
                          👤 본부장: <strong>{hq.leaderName}</strong>
                        </p>
                        <p style={{ margin: '4px 0' }}>
                          📞 연락처: {hq.phone}
                        </p>
                        {hq.email && (
                          <p style={{ margin: '4px 0' }}>
                            📧 이메일: {hq.email}
                          </p>
                        )}
                        <p style={{ margin: '4px 0' }}>
                          🏢 소속 지사: {hq.branches?.length || 0}개
                        </p>
                        <p style={{ margin: '4px 0' }}>
                          👥 소속 영업사원: {hq.salesPeople?.length || 0}명
                        </p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        onClick={() => handleOpenEditModal(hq)}
                        style={{
                          padding: '8px 16px',
                          background: '#3b82f6',
                          color: 'white',
                          border: 'none',
                          borderRadius: 6,
                          cursor: 'pointer',
                          fontSize: 14,
                        }}
                      >
                        수정
                      </button>
                      <button
                        onClick={() => handleDelete(hq.id, hq.name)}
                        style={{
                          padding: '8px 16px',
                          background: '#ef4444',
                          color: 'white',
                          border: 'none',
                          borderRadius: 6,
                          cursor: 'pointer',
                          fontSize: 14,
                        }}
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 지사 섹션 */}
        <div style={{
          background: 'white',
          borderRadius: 16,
          padding: 32,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 24,
          }}>
            <h2 style={{ fontSize: 24, fontWeight: 'bold', margin: 0 }}>
              🏪 지사 목록
            </h2>
            <button
              onClick={() => handleOpenCreateModal('BRANCH')}
              disabled={organizations.headquarters.length === 0}
              style={{
                padding: '10px 20px',
                background: organizations.headquarters.length === 0 
                  ? '#ccc' 
                  : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: 8,
                cursor: organizations.headquarters.length === 0 ? 'not-allowed' : 'pointer',
                fontWeight: 600,
                fontSize: 14,
              }}
            >
              + 지사 등록
            </button>
          </div>

          {organizations.headquarters.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: 40,
              color: '#999',
            }}>
              먼저 본부를 등록해주세요
            </div>
          ) : organizations.branches.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: 40,
              color: '#999',
            }}>
              등록된 지사가 없습니다
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {organizations.branches.map((branch) => {
                const parentHQ = organizations.headquarters.find(hq => hq.id === branch.parentId);
                return (
                  <div
                    key={branch.id}
                    style={{
                      border: '1px solid #e5e5e5',
                      borderRadius: 12,
                      padding: 20,
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                    }}>
                      <div style={{ flex: 1 }}>
                        <h3 style={{ fontSize: 18, fontWeight: 'bold', margin: 0, marginBottom: 8 }}>
                          {branch.name}
                        </h3>
                        <div style={{ fontSize: 14, color: '#666' }}>
                          <p style={{ margin: '4px 0' }}>
                            🏢 소속 본부: <strong>{parentHQ?.name || '알 수 없음'}</strong>
                          </p>
                          <p style={{ margin: '4px 0' }}>
                            👤 지사장: <strong>{branch.leaderName}</strong>
                          </p>
                          <p style={{ margin: '4px 0' }}>
                            📞 연락처: {branch.phone}
                          </p>
                          {branch.email && (
                            <p style={{ margin: '4px 0' }}>
                              📧 이메일: {branch.email}
                            </p>
                          )}
                          <p style={{ margin: '4px 0' }}>
                            👥 소속 영업사원: {branch.salesPeople?.length || 0}명
                          </p>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          onClick={() => handleOpenEditModal(branch)}
                          style={{
                            padding: '8px 16px',
                            background: '#3b82f6',
                            color: 'white',
                            border: 'none',
                            borderRadius: 6,
                            cursor: 'pointer',
                            fontSize: 14,
                          }}
                        >
                          수정
                        </button>
                        <button
                          onClick={() => handleDelete(branch.id, branch.name)}
                          style={{
                            padding: '8px 16px',
                            background: '#ef4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: 6,
                            cursor: 'pointer',
                            fontSize: 14,
                          }}
                        >
                          삭제
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 등록/수정 모달 */}
      {showModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 20,
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowModal(false);
          }}
        >
          <div
            style={{
              background: 'white',
              borderRadius: 16,
              padding: 32,
              maxWidth: modalMode === 'create' ? 600 : 500,
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto',
            }}
          >
            <h2 style={{ fontSize: 24, fontWeight: 'bold', margin: 0, marginBottom: 24 }}>
              {modalMode === 'create' ? '조직 등록' : '조직 정보 수정'}
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* 유형 */}
              <div>
                <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 14 }}>
                  유형 *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  disabled={modalMode === 'edit'}
                  style={{
                    width: '100%',
                    padding: 12,
                    border: '1px solid #d1d5db',
                    borderRadius: 8,
                    fontSize: 14,
                    background: modalMode === 'edit' ? '#f3f4f6' : 'white',
                  }}
                >
                  <option value="HEADQUARTERS">본부</option>
                  <option value="BRANCH">지사</option>
                </select>
              </div>

              {/* 소속 본부 (지사인 경우) */}
              {formData.type === 'BRANCH' && (
                <div>
                  <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 14 }}>
                    소속 본부 *
                  </label>
                  <select
                    value={formData.parentId}
                    onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
                    style={{
                      width: '100%',
                      padding: 12,
                      border: '1px solid #d1d5db',
                      borderRadius: 8,
                      fontSize: 14,
                    }}
                  >
                    <option value="">본부를 선택하세요</option>
                    {organizations.headquarters.map((hq) => (
                      <option key={hq.id} value={hq.id}>
                        {hq.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* 조직명 */}
              <div>
                <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 14 }}>
                  {formData.type === 'HEADQUARTERS' ? '본부명' : '지사명'} *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={formData.type === 'HEADQUARTERS' ? '예: 서울본부' : '예: 강남지사'}
                  style={{
                    width: '100%',
                    padding: 12,
                    border: '1px solid #d1d5db',
                    borderRadius: 8,
                    fontSize: 14,
                  }}
                />
              </div>

              {/* 매니저 검색 및 선택 (등록 모드만) */}
              {modalMode === 'create' && (
                <div>
                  <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 14 }}>
                    {formData.type === 'HEADQUARTERS' ? '본부장 선택' : '지사장 선택'} *
                  </label>
                  
                  {/* 선택된 매니저 표시 */}
                  {selectedManager ? (
                    <div style={{
                      padding: 12,
                      border: '2px solid #10b981',
                      borderRadius: 8,
                      background: '#f0fdf4',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}>
                      <div>
                        <p style={{ margin: 0, fontWeight: 600, fontSize: 14 }}>
                          ✓ {selectedManager.name}
                        </p>
                        <p style={{ margin: 0, fontSize: 12, color: '#666' }}>
                          📞 {selectedManager.phone}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedManager(null);
                          setFormData({ ...formData, managerId: '' });
                        }}
                        style={{
                          padding: '6px 12px',
                          background: '#ef4444',
                          color: 'white',
                          border: 'none',
                          borderRadius: 6,
                          cursor: 'pointer',
                          fontSize: 12,
                        }}
                      >
                        선택 해제
                      </button>
                    </div>
                  ) : (
                    <>
                      {/* 매니저 검색 입력 */}
                      <div style={{ display: 'flex', gap: 8 }}>
                        <input
                          type="text"
                          value={managerSearch}
                          onChange={(e) => setManagerSearch(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              searchManagers();
                            }
                          }}
                          placeholder="매니저 이름 또는 전화번호로 검색"
                          style={{
                            flex: 1,
                            padding: 12,
                            border: '1px solid #d1d5db',
                            borderRadius: 8,
                            fontSize: 14,
                          }}
                        />
                        <button
                          onClick={searchManagers}
                          disabled={loadingManagers}
                          style={{
                            padding: '12px 20px',
                            background: loadingManagers ? '#ccc' : '#3b82f6',
                            color: 'white',
                            border: 'none',
                            borderRadius: 8,
                            cursor: loadingManagers ? 'not-allowed' : 'pointer',
                            fontWeight: 600,
                            fontSize: 14,
                          }}
                        >
                          {loadingManagers ? '검색 중...' : '검색'}
                        </button>
                      </div>
                      
                      {/* 검색 결과 */}
                      {managerResults.length > 0 && (
                        <div style={{
                          marginTop: 8,
                          border: '1px solid #d1d5db',
                          borderRadius: 8,
                          maxHeight: 200,
                          overflow: 'auto',
                        }}>
                          {managerResults.map((manager) => (
                            <div
                              key={manager.id}
                              onClick={() => handleSelectManager(manager)}
                              style={{
                                padding: 12,
                                borderBottom: '1px solid #f3f4f6',
                                cursor: 'pointer',
                                background: 'white',
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = '#f9fafb';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'white';
                              }}
                            >
                              <p style={{ margin: 0, fontWeight: 600, fontSize: 14 }}>
                                {manager.name}
                              </p>
                              <p style={{ margin: 0, fontSize: 12, color: '#666' }}>
                                📞 {manager.phone} 
                                {manager.organizationName && ` | ${manager.organizationName}`}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                  
                  <p style={{ margin: '8px 0 0', fontSize: 12, color: '#666' }}>
                    💡 {formData.type === 'HEADQUARTERS' ? '본부장' : '지사장'}으로 임명할 매니저를 검색하여 선택하세요
                  </p>
                </div>
              )}

              {/* 이메일 */}
              <div>
                <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 14 }}>
                  이메일
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="example@jangpyosa.com"
                  style={{
                    width: '100%',
                    padding: 12,
                    border: '1px solid #d1d5db',
                    borderRadius: 8,
                    fontSize: 14,
                  }}
                />
              </div>

              {/* 🆕 추천 매니저 검색 (선택사항) */}
              {modalMode === 'create' && (
                <div>
                  <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 14 }}>
                    추천 매니저 검색 (선택사항)
                  </label>
                  
                  {/* 선택된 추천 매니저 표시 */}
                  {selectedReferrer ? (
                    <div style={{
                      padding: 12,
                      border: '2px solid #9c27b0',
                      borderRadius: 8,
                      background: '#f3e5f5',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}>
                      <div>
                        <p style={{ margin: 0, fontWeight: 600, fontSize: 14, color: '#6a1b9a' }}>
                          ✓ {selectedReferrer.name}
                        </p>
                        <p style={{ margin: 0, fontSize: 12, color: '#666' }}>
                          📞 {selectedReferrer.phone}
                        </p>
                      </div>
                      <button
                        onClick={() => setSelectedReferrer(null)}
                        style={{
                          padding: '6px 12px',
                          background: '#ef4444',
                          color: 'white',
                          border: 'none',
                          borderRadius: 6,
                          cursor: 'pointer',
                          fontSize: 12,
                        }}
                      >
                        선택 해제
                      </button>
                    </div>
                  ) : (
                    <>
                      {/* 추천 매니저 검색 입력 */}
                      <div style={{ display: 'flex', gap: 8 }}>
                        <input
                          type="text"
                          value={referrerSearch}
                          onChange={(e) => setReferrerSearch(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              searchReferrers();
                            }
                          }}
                          placeholder="추천 매니저 이름 또는 전화번호로 검색"
                          style={{
                            flex: 1,
                            padding: 12,
                            border: '1px solid #d1d5db',
                            borderRadius: 8,
                            fontSize: 14,
                          }}
                        />
                        <button
                          onClick={searchReferrers}
                          disabled={loadingReferrers}
                          style={{
                            padding: '12px 20px',
                            background: loadingReferrers ? '#ccc' : '#9c27b0',
                            color: 'white',
                            border: 'none',
                            borderRadius: 8,
                            cursor: loadingReferrers ? 'not-allowed' : 'pointer',
                            fontWeight: 600,
                            fontSize: 14,
                          }}
                        >
                          {loadingReferrers ? '검색 중...' : '검색'}
                        </button>
                      </div>
                      
                      {/* 검색 결과 */}
                      {referrerResults.length > 0 && (
                        <div style={{
                          marginTop: 8,
                          border: '1px solid #d1d5db',
                          borderRadius: 8,
                          maxHeight: 200,
                          overflow: 'auto',
                        }}>
                          {referrerResults.map((manager) => (
                            <div
                              key={manager.id}
                              onClick={() => handleSelectReferrer(manager)}
                              style={{
                                padding: 12,
                                borderBottom: '1px solid #f3f4f6',
                                cursor: 'pointer',
                                background: 'white',
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = '#f3e5f5';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'white';
                              }}
                            >
                              <p style={{ margin: 0, fontWeight: 600, fontSize: 14 }}>
                                {manager.name}
                              </p>
                              <p style={{ margin: 0, fontSize: 12, color: '#666' }}>
                                📞 {manager.phone} 
                                {manager.organizationName && ` | ${manager.organizationName}`}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                  
                  <p style={{ margin: '8px 0 0', fontSize: 12, color: '#666' }}>
                    💡 이 {formData.type === 'HEADQUARTERS' ? '본부' : '지사'}를 소개한 매니저가 있다면 검색해서 연결할 수 있습니다
                  </p>
                </div>
              )}

              {/* 메모 */}
              {modalMode === 'create' && (
                <div>
                  <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 14 }}>
                    메모
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="추가 정보나 메모를 입력하세요"
                    rows={3}
                    style={{
                      width: '100%',
                      padding: 12,
                      border: '1px solid #d1d5db',
                      borderRadius: 8,
                      fontSize: 14,
                      resize: 'vertical',
                    }}
                  />
                </div>
              )}
            </div>

            {/* 버튼 */}
            <div style={{ display: 'flex', gap: 8, marginTop: 24 }}>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  flex: 1,
                  padding: 12,
                  background: '#e5e5e5',
                  color: '#333',
                  border: 'none',
                  borderRadius: 8,
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                취소
              </button>
              <button
                onClick={handleSubmit}
                disabled={modalMode === 'create' && !formData.managerId}
                style={{
                  flex: 1,
                  padding: 12,
                  background: (modalMode === 'create' && !formData.managerId) 
                    ? '#ccc' 
                    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: 8,
                  cursor: (modalMode === 'create' && !formData.managerId) ? 'not-allowed' : 'pointer',
                  fontWeight: 600,
                }}
              >
                {modalMode === 'create' 
                  ? `생성 및 ${formData.type === 'HEADQUARTERS' ? '본부장' : '지사장'} 임명`
                  : '수정'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
