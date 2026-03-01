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

const getManagerInfo = () => {
  if (typeof window === 'undefined') return null;
  const info = localStorage.getItem(MANAGER_INFO_KEY);
  return info ? JSON.parse(info) : null;
};

const clearManagerAuth = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(MANAGER_TOKEN_KEY);
  localStorage.removeItem(MANAGER_INFO_KEY);
};

export default function ManagerDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [managerInfo, setManagerInfo] = useState<any>(null);
  const [stats, setStats] = useState({
    totalReferrals: 0,
    activeReferrals: 0,
    totalRevenue: 0,
    commission: 0,
  });
  const [subordinates, setSubordinates] = useState<any[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createType, setCreateType] = useState<'BRANCH_MANAGER' | 'MANAGER'>('BRANCH_MANAGER');
  const [newPersonData, setNewPersonData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
  });
  const [editingPerson, setEditingPerson] = useState<any>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    const token = getManagerToken();
    const info = getManagerInfo();

    if (!token || !info) {
      // 로그인 안 되어 있으면 로그인 페이지로
      router.push('/admin/sales');
      return;
    }

    setManagerInfo(info);
    loadStats(info);
    
    // 본부장이면 하위 조직 로드
    if (info.role === 'HEAD_MANAGER') {
      loadSubordinates(info.id);
    }
  }, [router]);

  const loadStats = (info: any) => {
    setStats({
      totalReferrals: info.totalReferrals || 0,
      activeReferrals: info.activeReferrals || 0,
      totalRevenue: info.totalRevenue || 0,
      commission: info.commission || 0,
    });
    setLoading(false);
  };

  const loadSubordinates = async (managerId: string) => {
    try {
      const token = getManagerToken();
      const response = await fetch(`${API_BASE}/sales/people?managerId=${managerId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setSubordinates(data);
      }
    } catch (error) {
      console.error('하위 조직 조회 실패:', error);
    }
  };

  const handleCreatePerson = async () => {
    try {
      const { name, phone, email, password } = newPersonData;
      
      if (!name || !phone || !password) {
        alert('필수 정보를 입력해주세요');
        return;
      }

      const token = getManagerToken();
      const response = await fetch(`${API_BASE}/sales/people/create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          phone,
          email,
          password,
          role: createType,
          managerId: managerInfo.id,
        }),
      });

      if (response.ok) {
        alert('✅ 생성이 완료되었습니다');
        setShowCreateModal(false);
        setNewPersonData({ name: '', phone: '', email: '', password: '' });
        loadSubordinates(managerInfo.id);
      } else {
        const error = await response.json();
        alert(`❌ 생성 실패: ${error.error}`);
      }
    } catch (error) {
      console.error('생성 오류:', error);
      alert('❌ 생성 중 오류가 발생했습니다');
    }
  };

  const handleEditPerson = async () => {
    try {
      const { name, phone, email } = editingPerson;
      
      if (!name || !phone) {
        alert('필수 정보를 입력해주세요');
        return;
      }

      const token = getManagerToken();
      const response = await fetch(`${API_BASE}/sales/people/${editingPerson.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, phone, email }),
      });

      if (response.ok) {
        alert('✅ 수정이 완료되었습니다');
        setShowEditModal(false);
        setEditingPerson(null);
        loadSubordinates(managerInfo.id);
      } else {
        const error = await response.json();
        alert(`❌ 수정 실패: ${error.error}`);
      }
    } catch (error) {
      console.error('수정 오류:', error);
      alert('❌ 수정 중 오류가 발생했습니다');
    }
  };

  const handleDeletePerson = async (person: any) => {
    if (!confirm(`정말 ${person.name}을(를) 삭제하시겠습니까?`)) {
      return;
    }

    try {
      const token = getManagerToken();
      const response = await fetch(`${API_BASE}/sales/people/${person.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        alert('✅ 삭제되었습니다');
        loadSubordinates(managerInfo.id);
      } else {
        const error = await response.json();
        alert(`❌ 삭제 실패: ${error.error}`);
      }
    } catch (error) {
      console.error('삭제 오류:', error);
      alert('❌ 삭제 중 오류가 발생했습니다');
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const token = getManagerToken();
      const response = await fetch(`${API_BASE}/sales/people/${id}/toggle-active`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        alert(`✅ ${currentStatus ? '비활성화' : '활성화'}되었습니다`);
        loadSubordinates(managerInfo.id);
      } else {
        const error = await response.json();
        alert(`❌ 실패: ${error.error}`);
      }
    } catch (error) {
      console.error('상태 변경 오류:', error);
      alert('❌ 상태 변경 중 오류가 발생했습니다');
    }
  };

  const handleLogout = () => {
    clearManagerAuth();
    router.push('/admin/sales');
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

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f9fafb',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⏳</div>
          <p style={{ fontSize: 16, color: '#6b7280' }}>로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!managerInfo) {
    return null;
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f9fafb',
    }}>
      {/* 헤더 */}
      <header style={{
        background: 'white',
        borderBottom: '1px solid #e5e7eb',
        padding: '16px 24px',
      }}>
        <div style={{
          maxWidth: 1200,
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 'bold', margin: 0 }}>
              📊 영업 사원 대시보드
            </h1>
            <p style={{ fontSize: 14, color: '#6b7280', margin: '4px 0 0 0' }}>
              {managerInfo.name} ({getRoleName(managerInfo.role)})
            </p>
          </div>
          <button
            onClick={handleLogout}
            style={{
              padding: '8px 16px',
              background: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            로그아웃
          </button>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main style={{
        maxWidth: 1200,
        margin: '0 auto',
        padding: '32px 24px',
      }}>
        {/* 환영 메시지 */}
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: 12,
          padding: 32,
          marginBottom: 32,
          color: 'white',
        }}>
          <h2 style={{ fontSize: 28, fontWeight: 'bold', margin: 0, marginBottom: 8 }}>
            환영합니다, {managerInfo.name}님! 👋
          </h2>
          <p style={{ fontSize: 16, margin: 0, opacity: 0.9 }}>
            오늘도 좋은 하루 되세요!
          </p>
        </div>

        {/* 통계 카드 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 24,
          marginBottom: 32,
        }}>
          <StatCard
            icon="👥"
            title="총 추천 고객"
            value={stats.totalReferrals}
            unit="명"
            color="#3b82f6"
          />
          <StatCard
            icon="✅"
            title="활성 고객"
            value={stats.activeReferrals}
            unit="명"
            color="#10b981"
          />
          <StatCard
            icon="💰"
            title="총 매출"
            value={stats.totalRevenue.toLocaleString()}
            unit="원"
            color="#f59e0b"
          />
          <StatCard
            icon="🎁"
            title="수수료"
            value={stats.commission.toLocaleString()}
            unit="원"
            color="#8b5cf6"
          />
        </div>

        {/* 추천인 링크 */}
        <div style={{
          background: 'white',
          borderRadius: 12,
          padding: 24,
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          marginBottom: 32,
        }}>
          <h3 style={{ fontSize: 18, fontWeight: 'bold', margin: 0, marginBottom: 16 }}>
            🔗 나의 추천인 링크
          </h3>
          <div style={{
            background: '#f9fafb',
            border: '1px solid #e5e7eb',
            borderRadius: 8,
            padding: 16,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <code style={{
              fontSize: 14,
              color: '#667eea',
              fontWeight: 600,
            }}>
              {managerInfo.referralLink}
            </code>
            <button
              onClick={() => {
                navigator.clipboard.writeText(managerInfo.referralLink);
                alert('📋 링크가 복사되었습니다!');
              }}
              style={{
                padding: '8px 16px',
                background: '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: 6,
                cursor: 'pointer',
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              복사
            </button>
          </div>
        </div>

        {/* 계정 정보 */}
        <div style={{
          background: 'white',
          borderRadius: 12,
          padding: 24,
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        }}>
          <h3 style={{ fontSize: 18, fontWeight: 'bold', margin: 0, marginBottom: 16 }}>
            👤 계정 정보
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <InfoRow label="이름" value={managerInfo.name} />
            <InfoRow label="역할" value={getRoleName(managerInfo.role)} />
            <InfoRow label="핸드폰" value={managerInfo.phone} />
            <InfoRow label="이메일" value={managerInfo.email || '-'} />
            <InfoRow label="추천인 코드" value={managerInfo.referralCode} />
            <InfoRow 
              label="상태" 
              value={managerInfo.isActive ? '✅ 활성' : '❌ 비활성'}
            />
          </div>
        </div>

        {/* 안내 메시지 */}
        <div style={{
          marginTop: 32,
          padding: 16,
          background: '#fef3c7',
          borderRadius: 8,
          fontSize: 14,
          color: '#92400e',
        }}>
          💡 <strong>안내:</strong> 등업 및 지사 배정은 슈퍼어드민이 수행합니다. 
          문의사항이 있으시면 본사로 연락해주세요.
        </div>

        {/* 본부장 전용: 지사 및 매니저 관리 */}
        {managerInfo.role === 'HEAD_MANAGER' && (
          <div style={{ marginTop: 32 }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 16,
            }}>
              <h3 style={{ fontSize: 20, fontWeight: 'bold', margin: 0 }}>
                🏢 하위 조직 관리
              </h3>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => {
                    setCreateType('BRANCH_MANAGER');
                    setShowCreateModal(true);
                  }}
                  style={{
                    padding: '10px 16px',
                    background: '#f97316',
                    color: 'white',
                    border: 'none',
                    borderRadius: 6,
                    cursor: 'pointer',
                    fontSize: 14,
                    fontWeight: 600,
                  }}
                >
                  ➕ 지사 생성
                </button>
                <button
                  onClick={() => {
                    setCreateType('MANAGER');
                    setShowCreateModal(true);
                  }}
                  style={{
                    padding: '10px 16px',
                    background: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: 6,
                    cursor: 'pointer',
                    fontSize: 14,
                    fontWeight: 600,
                  }}
                >
                  ➕ 매니저 생성
                </button>
              </div>
            </div>

            {/* 하위 조직 리스트 */}
            <div style={{
              background: 'white',
              borderRadius: 12,
              padding: 24,
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            }}>
              {subordinates.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}>
                  <div style={{ fontSize: 48, marginBottom: 16 }}>📭</div>
                  <p style={{ fontSize: 16 }}>하위 조직이 없습니다</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {subordinates.map((person) => (
                    <div
                      key={person.id}
                      style={{
                        padding: 16,
                        border: '1px solid #e5e7eb',
                        borderRadius: 8,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                          <span style={{ fontSize: 16, fontWeight: 'bold' }}>
                            {person.name}
                          </span>
                          <span style={{
                            padding: '2px 8px',
                            background: person.role === 'BRANCH_MANAGER' ? '#f97316' : '#3b82f6',
                            color: 'white',
                            borderRadius: 4,
                            fontSize: 12,
                          }}>
                            {person.role === 'BRANCH_MANAGER' ? '지사장' : '매니저'}
                          </span>
                          <span style={{
                            padding: '2px 8px',
                            background: person.isActive ? '#10b981' : '#ef4444',
                            color: 'white',
                            borderRadius: 4,
                            fontSize: 12,
                          }}>
                            {person.isActive ? '활성' : '비활성'}
                          </span>
                        </div>
                        <div style={{ fontSize: 14, color: '#6b7280' }}>
                          {person.phone} {person.email && `• ${person.email}`}
                        </div>
                        <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>
                          추천: {person.totalReferrals}명 | 활성: {person.activeReferrals}명 | 
                          매출: ₩{person.totalRevenue?.toLocaleString() || 0}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          onClick={() => {
                            setEditingPerson(person);
                            setShowEditModal(true);
                          }}
                          style={{
                            padding: '6px 12px',
                            background: '#3b82f6',
                            color: 'white',
                            border: 'none',
                            borderRadius: 4,
                            cursor: 'pointer',
                            fontSize: 12,
                          }}
                        >
                          ✏️ 수정
                        </button>
                        <button
                          onClick={() => handleToggleActive(person.id, person.isActive)}
                          style={{
                            padding: '6px 12px',
                            background: person.isActive ? '#f59e0b' : '#10b981',
                            color: 'white',
                            border: 'none',
                            borderRadius: 4,
                            cursor: 'pointer',
                            fontSize: 12,
                          }}
                        >
                          {person.isActive ? '🔒 비활성화' : '🔓 활성화'}
                        </button>
                        <button
                          onClick={() => handleDeletePerson(person)}
                          style={{
                            padding: '6px 12px',
                            background: '#ef4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: 4,
                            cursor: 'pointer',
                            fontSize: 12,
                          }}
                        >
                          🗑️ 삭제
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}>
            <div style={{
              background: 'white',
              borderRadius: 12,
              padding: 32,
              width: '90%',
              maxWidth: 500,
            }}>
              <h3 style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 24 }}>
                {createType === 'BRANCH_MANAGER' ? '🏪 지사 생성' : '👤 매니저 생성'}
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <input
                  type="text"
                  placeholder="이름"
                  value={newPersonData.name}
                  onChange={(e) => setNewPersonData({ ...newPersonData, name: e.target.value })}
                  style={{
                    padding: 12,
                    border: '1px solid #e5e7eb',
                    borderRadius: 6,
                    fontSize: 14,
                  }}
                />
                <input
                  type="tel"
                  placeholder="전화번호 (예: 01012345678)"
                  value={newPersonData.phone}
                  onChange={(e) => setNewPersonData({ ...newPersonData, phone: e.target.value })}
                  style={{
                    padding: 12,
                    border: '1px solid #e5e7eb',
                    borderRadius: 6,
                    fontSize: 14,
                  }}
                />
                <input
                  type="email"
                  placeholder="이메일 (선택)"
                  value={newPersonData.email}
                  onChange={(e) => setNewPersonData({ ...newPersonData, email: e.target.value })}
                  style={{
                    padding: 12,
                    border: '1px solid #e5e7eb',
                    borderRadius: 6,
                    fontSize: 14,
                  }}
                />
                <input
                  type="password"
                  placeholder="비밀번호 (최소 6자)"
                  value={newPersonData.password}
                  onChange={(e) => setNewPersonData({ ...newPersonData, password: e.target.value })}
                  style={{
                    padding: 12,
                    border: '1px solid #e5e7eb',
                    borderRadius: 6,
                    fontSize: 14,
                  }}
                />
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 24 }}>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewPersonData({ name: '', phone: '', email: '', password: '' });
                  }}
                  style={{
                    flex: 1,
                    padding: 12,
                    background: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: 6,
                    cursor: 'pointer',
                    fontSize: 14,
                    fontWeight: 600,
                  }}
                >
                  취소
                </button>
                <button
                  onClick={handleCreatePerson}
                  style={{
                    flex: 1,
                    padding: 12,
                    background: createType === 'BRANCH_MANAGER' ? '#f97316' : '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: 6,
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

        {/* 수정 모달 */}
        {showEditModal && editingPerson && (
          <div style={{
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
          }}>
            <div style={{
              background: 'white',
              borderRadius: 12,
              padding: 32,
              width: '90%',
              maxWidth: 500,
            }}>
              <h3 style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 24 }}>
                ✏️ 정보 수정
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <input
                  type="text"
                  placeholder="이름"
                  value={editingPerson.name}
                  onChange={(e) => setEditingPerson({ ...editingPerson, name: e.target.value })}
                  style={{
                    padding: 12,
                    border: '1px solid #e5e7eb',
                    borderRadius: 6,
                    fontSize: 14,
                  }}
                />
                <input
                  type="tel"
                  placeholder="전화번호"
                  value={editingPerson.phone}
                  onChange={(e) => setEditingPerson({ ...editingPerson, phone: e.target.value })}
                  style={{
                    padding: 12,
                    border: '1px solid #e5e7eb',
                    borderRadius: 6,
                    fontSize: 14,
                  }}
                />
                <input
                  type="email"
                  placeholder="이메일"
                  value={editingPerson.email || ''}
                  onChange={(e) => setEditingPerson({ ...editingPerson, email: e.target.value })}
                  style={{
                    padding: 12,
                    border: '1px solid #e5e7eb',
                    borderRadius: 6,
                    fontSize: 14,
                  }}
                />
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 24 }}>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingPerson(null);
                  }}
                  style={{
                    flex: 1,
                    padding: 12,
                    background: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: 6,
                    cursor: 'pointer',
                    fontSize: 14,
                    fontWeight: 600,
                  }}
                >
                  취소
                </button>
                <button
                  onClick={handleEditPerson}
                  style={{
                    flex: 1,
                    padding: 12,
                    background: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: 6,
                    cursor: 'pointer',
                    fontSize: 14,
                    fontWeight: 600,
                  }}
                >
                  저장
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function StatCard({ icon, title, value, unit, color }: {
  icon: string;
  title: string;
  value: number | string;
  unit: string;
  color: string;
}) {
  return (
    <div style={{
      background: 'white',
      borderRadius: 12,
      padding: 24,
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    }}>
      <div style={{
        fontSize: 32,
        marginBottom: 12,
      }}>
        {icon}
      </div>
      <p style={{
        fontSize: 14,
        color: '#6b7280',
        margin: 0,
        marginBottom: 8,
      }}>
        {title}
      </p>
      <p style={{
        fontSize: 28,
        fontWeight: 'bold',
        color,
        margin: 0,
      }}>
        {value} <span style={{ fontSize: 16, fontWeight: 'normal' }}>{unit}</span>
      </p>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      padding: '12px 0',
      borderBottom: '1px solid #f3f4f6',
    }}>
      <span style={{ fontSize: 14, color: '#6b7280', fontWeight: 500 }}>
        {label}
      </span>
      <span style={{ fontSize: 14, color: '#111', fontWeight: 600 }}>
        {value}
      </span>
    </div>
  );
}
