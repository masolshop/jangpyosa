"use client";

import { useState, useEffect } from "react";
import { getToken } from "@/lib/auth";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 
  (typeof window !== 'undefined' && window.location.hostname === 'jangpyosa.com' 
    ? 'https://jangpyosa.com/api' 
    : 'http://localhost:4000');

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
    role: string;
  };
  subordinates: Array<{
    id: string;
    name: string;
    role: string;
    totalReferrals: number;
    activeReferrals: number;
  }>;
  referralCode: string;
  referralLink: string;
  totalReferrals: number;
  activeReferrals: number;
  totalRevenue: number;
  commission: number;
  isActive: boolean;
  createdAt: string;
}

interface Stats {
  totalSalesPeople: number;
  activeSalesPeople: number;
  countByRole: Array<{ role: string; _count: number }>;
  totalReferrals: number;
  activeReferrals: number;
  totalRevenue: number;
  totalCommission: number;
}

export default function SalesManagementPage() {
  const [salesPeople, setSalesPeople] = useState<SalesPerson[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'list' | 'organization'>('dashboard');
  const [filter, setFilter] = useState<{
    role?: string;
    isActive?: boolean;
    search?: string;
  }>({});
  
  // 모달 상태
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState<SalesPerson | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  
  // 폼 상태
  const [formData, setFormData] = useState({
    userId: '',
    name: '',
    phone: '',
    email: '',
    role: 'MANAGER',
    managerId: '',
  });

  useEffect(() => {
    fetchData();
  }, [filter, activeTab]);

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([
      fetchSalesPeople(),
      fetchStats(),
    ]);
    setLoading(false);
  };

  const fetchSalesPeople = async () => {
    try {
      const token = getToken();
      if (!token) return;

      const params = new URLSearchParams();
      if (filter.role) params.append('role', filter.role);
      if (filter.isActive !== undefined) params.append('isActive', String(filter.isActive));
      if (filter.search) params.append('search', filter.search);

      const response = await fetch(`${API_BASE}/sales/people?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSalesPeople(data.salesPeople || []);
      }
    } catch (error) {
      console.error('영업 사원 조회 실패:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const token = getToken();
      if (!token) return;

      const response = await fetch(`${API_BASE}/sales/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (error) {
      console.error('통계 조회 실패:', error);
    }
  };

  const handleAddSalesPerson = async () => {
    try {
      const token = getToken();
      if (!token) return;

      // userId는 임시로 phone을 사용 (나중에 실제 User 생성 후 연결)
      const submitData = {
        ...formData,
        userId: formData.phone, // 임시
      };

      const response = await fetch(`${API_BASE}/sales/people`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      if (response.ok) {
        alert('영업 사원이 등록되었습니다');
        setShowAddModal(false);
        fetchData();
        setFormData({
          userId: '',
          name: '',
          phone: '',
          email: '',
          role: 'MANAGER',
          managerId: '',
        });
      } else {
        const error = await response.json();
        alert(error.error || '등록 실패');
      }
    } catch (error) {
      console.error('영업 사원 등록 실패:', error);
      alert('등록 중 오류가 발생했습니다');
    }
  };

  const handlePromote = async (person: SalesPerson) => {
    const roleMap: Record<string, string> = {
      'MANAGER': 'BRANCH_MANAGER',
      'BRANCH_MANAGER': 'HEAD_MANAGER',
    };

    const newRole = roleMap[person.role];
    if (!newRole) {
      alert('더 이상 등업할 수 없습니다');
      return;
    }

    const reason = prompt(`${person.name}님을 ${getRoleLabel(newRole)}(으)로 등업하시겠습니까?\n등업 사유를 입력하세요:`);
    if (!reason) return;

    try {
      const token = getToken();
      if (!token) return;

      const response = await fetch(`${API_BASE}/sales/people/${person.id}/promote`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ newRole, reason }),
      });

      if (response.ok) {
        alert('등업이 완료되었습니다');
        fetchData();
      } else {
        const error = await response.json();
        alert(error.error || '등업 실패');
      }
    } catch (error) {
      console.error('등업 실패:', error);
      alert('등업 중 오류가 발생했습니다');
    }
  };

  const handleViewDetail = (person: SalesPerson) => {
    setSelectedPerson(person);
    setShowDetailModal(true);
  };

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      'MANAGER': '매니저',
      'BRANCH_MANAGER': '지사장',
      'HEAD_MANAGER': '본부장',
    };
    return labels[role] || role;
  };

  const getRoleBadgeColor = (role: string) => {
    const colors: Record<string, string> = {
      'MANAGER': '#10b981',
      'BRANCH_MANAGER': '#3b82f6',
      'HEAD_MANAGER': '#8b5cf6',
    };
    return colors[role] || '#6b7280';
  };

  const getRoleCount = (role: string) => {
    if (!stats) return 0;
    const roleData = stats.countByRole.find(r => r.role === role);
    return roleData?._count || 0;
  };

  // 대시보드 렌더링
  const renderDashboard = () => {
    if (!stats) return <div style={{ padding: 40, textAlign: 'center' }}>통계를 불러오는 중...</div>;

    return (
      <div>
        {/* 통계 카드 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: 20,
          marginBottom: 32,
        }}>
          <StatCard
            title="총 영업 사원"
            value={stats.totalSalesPeople}
            icon="👥"
            color="#3b82f6"
            suffix="명"
          />
          <StatCard
            title="활성 사원"
            value={stats.activeSalesPeople}
            icon="✅"
            color="#10b981"
            suffix="명"
          />
          <StatCard
            title="총 추천 고객"
            value={stats.totalReferrals}
            icon="🤝"
            color="#f59e0b"
            suffix="개"
          />
          <StatCard
            title="활성 고객"
            value={stats.activeReferrals}
            icon="💼"
            color="#8b5cf6"
            suffix="개"
          />
        </div>

        {/* 역할별 통계 */}
        <div style={{
          background: 'white',
          borderRadius: 12,
          padding: 24,
          border: '1px solid #e5e7eb',
          marginBottom: 32,
        }}>
          <h2 style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 20 }}>
            📊 역할별 현황
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
            <RoleCard
              role="HEAD_MANAGER"
              label="본부장"
              count={getRoleCount('HEAD_MANAGER')}
              color="#8b5cf6"
              icon="👑"
            />
            <RoleCard
              role="BRANCH_MANAGER"
              label="지사장"
              count={getRoleCount('BRANCH_MANAGER')}
              color="#3b82f6"
              icon="🏢"
            />
            <RoleCard
              role="MANAGER"
              label="매니저"
              count={getRoleCount('MANAGER')}
              color="#10b981"
              icon="💪"
            />
          </div>
        </div>

        {/* 실적 요약 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 20,
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: 12,
            padding: 24,
            color: 'white',
          }}>
            <div style={{ fontSize: 14, opacity: 0.9, marginBottom: 8 }}>총 매출</div>
            <div style={{ fontSize: 32, fontWeight: 'bold' }}>
              {stats.totalRevenue.toLocaleString()}원
            </div>
            <div style={{ fontSize: 14, opacity: 0.8, marginTop: 8 }}>
              전체 추천 고객 결제 금액
            </div>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            borderRadius: 12,
            padding: 24,
            color: 'white',
          }}>
            <div style={{ fontSize: 14, opacity: 0.9, marginBottom: 8 }}>총 수수료</div>
            <div style={{ fontSize: 32, fontWeight: 'bold' }}>
              {stats.totalCommission.toLocaleString()}원
            </div>
            <div style={{ fontSize: 14, opacity: 0.8, marginTop: 8 }}>
              전체 영업 사원 수수료 합계
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 리스트 렌더링
  const renderList = () => {
    return (
      <div>
        {/* 필터 */}
        <div style={{
          marginBottom: 24,
          padding: 20,
          background: '#f9fafb',
          borderRadius: 8,
          display: 'flex',
          gap: 16,
          flexWrap: 'wrap',
        }}>
          <div>
            <label style={{ display: 'block', marginBottom: 4, fontSize: 14, fontWeight: 500 }}>
              역할
            </label>
            <select
              value={filter.role || ''}
              onChange={(e) => setFilter({ ...filter, role: e.target.value || undefined })}
              style={{
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: 6,
                background: 'white',
              }}
            >
              <option value="">전체</option>
              <option value="MANAGER">매니저</option>
              <option value="BRANCH_MANAGER">지사장</option>
              <option value="HEAD_MANAGER">본부장</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: 4, fontSize: 14, fontWeight: 500 }}>
              상태
            </label>
            <select
              value={filter.isActive === undefined ? '' : String(filter.isActive)}
              onChange={(e) => setFilter({ 
                ...filter, 
                isActive: e.target.value === '' ? undefined : e.target.value === 'true' 
              })}
              style={{
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: 6,
                background: 'white',
              }}
            >
              <option value="">전체</option>
              <option value="true">활성</option>
              <option value="false">비활성</option>
            </select>
          </div>

          <div style={{ flex: 1, minWidth: 200 }}>
            <label style={{ display: 'block', marginBottom: 4, fontSize: 14, fontWeight: 500 }}>
              검색
            </label>
            <input
              type="text"
              placeholder="이름, 핸드폰, 이메일"
              value={filter.search || ''}
              onChange={(e) => setFilter({ ...filter, search: e.target.value || undefined })}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: 6,
              }}
            />
          </div>
        </div>

        {/* 영업 사원 카드 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
          gap: 20,
        }}>
          {salesPeople.map((person) => (
            <div
              key={person.id}
              style={{
                background: 'white',
                borderRadius: 12,
                padding: 20,
                border: '2px solid #e5e7eb',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = getRoleBadgeColor(person.role);
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#e5e7eb';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
              onClick={() => handleViewDetail(person)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 4 }}>
                    {person.name}
                  </div>
                  <div style={{ fontSize: 14, color: '#6b7280' }}>
                    {person.phone}
                  </div>
                </div>
                <span style={{
                  padding: '6px 12px',
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: 600,
                  background: getRoleBadgeColor(person.role) + '20',
                  color: getRoleBadgeColor(person.role),
                }}>
                  {getRoleLabel(person.role)}
                </span>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: 12,
                padding: 16,
                background: '#f9fafb',
                borderRadius: 8,
                marginBottom: 16,
              }}>
                <div>
                  <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>추천 고객</div>
                  <div style={{ fontSize: 18, fontWeight: 'bold', color: '#0070f3' }}>
                    {person.activeReferrals} / {person.totalReferrals}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>하위 직원</div>
                  <div style={{ fontSize: 18, fontWeight: 'bold', color: '#8b5cf6' }}>
                    {person.subordinates.length}명
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>매출</div>
                  <div style={{ fontSize: 16, fontWeight: 'bold' }}>
                    {person.totalRevenue.toLocaleString()}원
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>수수료</div>
                  <div style={{ fontSize: 16, fontWeight: 'bold', color: '#10b981' }}>
                    {person.commission.toLocaleString()}원
                  </div>
                </div>
              </div>

              {person.role !== 'HEAD_MANAGER' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePromote(person);
                  }}
                  style={{
                    width: '100%',
                    padding: '10px',
                    background: '#0070f3',
                    color: 'white',
                    border: 'none',
                    borderRadius: 6,
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: 14,
                  }}
                >
                  ⬆️ {getRoleLabel(person.role === 'MANAGER' ? 'BRANCH_MANAGER' : 'HEAD_MANAGER')}(으)로 등업
                </button>
              )}
            </div>
          ))}
        </div>

        {salesPeople.length === 0 && (
          <div style={{
            padding: 60,
            textAlign: 'center',
            background: 'white',
            borderRadius: 12,
            border: '2px dashed #d1d5db',
          }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📭</div>
            <div style={{ fontSize: 18, fontWeight: 600, color: '#6b7280', marginBottom: 8 }}>
              등록된 영업 사원이 없습니다
            </div>
            <div style={{ fontSize: 14, color: '#9ca3af' }}>
              상단의 "영업 사원 등록" 버튼을 클릭하여 새로운 영업 사원을 추가하세요
            </div>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div style={{ 
        padding: 32, 
        textAlign: 'center',
        minHeight: '60vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>⏳</div>
        <div style={{ fontSize: 18, fontWeight: 600, color: '#6b7280' }}>
          데이터를 불러오는 중...
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: 32, maxWidth: 1400, margin: '0 auto' }}>
      {/* 헤더 */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <h1 style={{ fontSize: 32, fontWeight: 'bold', margin: 0, marginBottom: 8 }}>
              📊 영업 조직 관리
            </h1>
            <p style={{ fontSize: 14, color: '#6b7280', margin: 0 }}>
              영업 사원 관리 및 실적 추적
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            style={{
              padding: '12px 24px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: 14,
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            }}
          >
            + 영업 사원 등록
          </button>
        </div>

        {/* 탭 */}
        <div style={{
          display: 'flex',
          gap: 8,
          borderBottom: '2px solid #e5e7eb',
        }}>
          {[
            { id: 'dashboard', label: '📊 대시보드', icon: '📊' },
            { id: 'list', label: '👥 사원 목록', icon: '👥' },
            { id: 'organization', label: '🏢 조직도', icon: '🏢' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                padding: '12px 24px',
                background: 'none',
                border: 'none',
                borderBottom: activeTab === tab.id ? '3px solid #0070f3' : '3px solid transparent',
                cursor: 'pointer',
                fontWeight: activeTab === tab.id ? 600 : 400,
                color: activeTab === tab.id ? '#0070f3' : '#6b7280',
                fontSize: 14,
                transition: 'all 0.2s',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 탭 컨텐츠 */}
      <div>
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'list' && renderList()}
        {activeTab === 'organization' && (
          <div style={{
            padding: 60,
            textAlign: 'center',
            background: 'white',
            borderRadius: 12,
            border: '2px dashed #d1d5db',
          }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🏗️</div>
            <div style={{ fontSize: 18, fontWeight: 600, color: '#6b7280' }}>
              조직도 기능 개발 중
            </div>
          </div>
        )}
      </div>

      {/* 추가 모달 */}
      {showAddModal && (
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
          backdropFilter: 'blur(4px)',
        }}>
          <div style={{
            background: 'white',
            padding: 32,
            borderRadius: 16,
            width: '90%',
            maxWidth: 500,
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
          }}>
            <h2 style={{ marginTop: 0, marginBottom: 24, fontSize: 24, fontWeight: 'bold' }}>
              영업 사원 등록
            </h2>
            
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: 500, fontSize: 14 }}>
                이름 *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: 6,
                  fontSize: 14,
                }}
                placeholder="홍길동"
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: 500, fontSize: 14 }}>
                핸드폰번호 *
              </label>
              <input
                type="text"
                placeholder="01012345678"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: 6,
                  fontSize: 14,
                }}
              />
              <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>
                추천인 링크: https://jangpyosa.com/{formData.phone || '핸드폰번호'}
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: 500, fontSize: 14 }}>
                이메일
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: 6,
                  fontSize: 14,
                }}
                placeholder="example@jangpyosa.com"
              />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: 500, fontSize: 14 }}>
                역할 *
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: 6,
                  fontSize: 14,
                }}
              >
                <option value="MANAGER">매니저</option>
                <option value="BRANCH_MANAGER">지사장</option>
                <option value="HEAD_MANAGER">본부장</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowAddModal(false)}
                style={{
                  padding: '10px 20px',
                  background: '#f3f4f6',
                  border: 'none',
                  borderRadius: 6,
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: 14,
                }}
              >
                취소
              </button>
              <button
                onClick={handleAddSalesPerson}
                style={{
                  padding: '10px 20px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: 6,
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: 14,
                }}
              >
                등록
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 상세 모달 */}
      {showDetailModal && selectedPerson && (
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
          backdropFilter: 'blur(4px)',
        }}>
          <div style={{
            background: 'white',
            padding: 32,
            borderRadius: 16,
            width: '90%',
            maxWidth: 700,
            maxHeight: '80vh',
            overflow: 'auto',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 24, fontWeight: 'bold' }}>
                  {selectedPerson.name}
                </h2>
                <span style={{
                  display: 'inline-block',
                  marginTop: 8,
                  padding: '6px 12px',
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: 600,
                  background: getRoleBadgeColor(selectedPerson.role) + '20',
                  color: getRoleBadgeColor(selectedPerson.role),
                }}>
                  {getRoleLabel(selectedPerson.role)}
                </span>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: 24,
                  cursor: 'pointer',
                  color: '#6b7280',
                }}
              >
                ×
              </button>
            </div>

            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>연락처</div>
              <div style={{ fontSize: 16, fontWeight: 500 }}>{selectedPerson.phone}</div>
            </div>

            {selectedPerson.email && (
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>이메일</div>
                <div style={{ fontSize: 16, fontWeight: 500 }}>{selectedPerson.email}</div>
              </div>
            )}

            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>추천인 링크</div>
              <div style={{
                padding: '10px 12px',
                background: '#f3f4f6',
                borderRadius: 6,
                fontSize: 14,
                fontFamily: 'monospace',
                wordBreak: 'break-all',
              }}>
                {selectedPerson.referralLink}
              </div>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: 16,
              marginBottom: 24,
            }}>
              <div style={{
                padding: 16,
                background: '#eff6ff',
                borderRadius: 8,
              }}>
                <div style={{ fontSize: 12, color: '#3b82f6', marginBottom: 4 }}>추천 고객</div>
                <div style={{ fontSize: 24, fontWeight: 'bold', color: '#3b82f6' }}>
                  {selectedPerson.activeReferrals} / {selectedPerson.totalReferrals}
                </div>
              </div>
              <div style={{
                padding: 16,
                background: '#f0fdf4',
                borderRadius: 8,
              }}>
                <div style={{ fontSize: 12, color: '#10b981', marginBottom: 4 }}>하위 직원</div>
                <div style={{ fontSize: 24, fontWeight: 'bold', color: '#10b981' }}>
                  {selectedPerson.subordinates.length}명
                </div>
              </div>
              <div style={{
                padding: 16,
                background: '#fef3c7',
                borderRadius: 8,
              }}>
                <div style={{ fontSize: 12, color: '#f59e0b', marginBottom: 4 }}>총 매출</div>
                <div style={{ fontSize: 20, fontWeight: 'bold', color: '#f59e0b' }}>
                  {selectedPerson.totalRevenue.toLocaleString()}원
                </div>
              </div>
              <div style={{
                padding: 16,
                background: '#fae8ff',
                borderRadius: 8,
              }}>
                <div style={{ fontSize: 12, color: '#8b5cf6', marginBottom: 4 }}>수수료</div>
                <div style={{ fontSize: 20, fontWeight: 'bold', color: '#8b5cf6' }}>
                  {selectedPerson.commission.toLocaleString()}원
                </div>
              </div>
            </div>

            {selectedPerson.subordinates.length > 0 && (
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 12 }}>
                  하위 직원 ({selectedPerson.subordinates.length}명)
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {selectedPerson.subordinates.map((sub) => (
                    <div
                      key={sub.id}
                      style={{
                        padding: 12,
                        background: '#f9fafb',
                        borderRadius: 8,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 600 }}>{sub.name}</div>
                        <div style={{ fontSize: 12, color: '#6b7280' }}>
                          {getRoleLabel(sub.role)}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 14, fontWeight: 600, color: '#0070f3' }}>
                          {sub.activeReferrals} / {sub.totalReferrals}
                        </div>
                        <div style={{ fontSize: 12, color: '#6b7280' }}>추천 고객</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// 통계 카드 컴포넌트
function StatCard({ title, value, icon, color, suffix }: {
  title: string;
  value: number;
  icon: string;
  color: string;
  suffix?: string;
}) {
  return (
    <div style={{
      background: 'white',
      borderRadius: 12,
      padding: 20,
      border: '1px solid #e5e7eb',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute',
        top: -10,
        right: -10,
        fontSize: 80,
        opacity: 0.1,
      }}>
        {icon}
      </div>
      <div style={{ fontSize: 14, color: '#6b7280', marginBottom: 8 }}>
        {title}
      </div>
      <div style={{ fontSize: 32, fontWeight: 'bold', color }}>
        {value.toLocaleString()}{suffix}
      </div>
    </div>
  );
}

// 역할 카드 컴포넌트
function RoleCard({ role, label, count, color, icon }: {
  role: string;
  label: string;
  count: number;
  color: string;
  icon: string;
}) {
  return (
    <div style={{
      padding: 20,
      background: `${color}10`,
      borderRadius: 12,
      border: `2px solid ${color}30`,
      textAlign: 'center',
    }}>
      <div style={{ fontSize: 40, marginBottom: 8 }}>{icon}</div>
      <div style={{ fontSize: 16, fontWeight: 600, color, marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ fontSize: 28, fontWeight: 'bold', color }}>
        {count}명
      </div>
    </div>
  );
}
