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

export default function SalesManagementPage() {
  const [salesPeople, setSalesPeople] = useState<SalesPerson[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<{
    role?: string;
    isActive?: boolean;
    search?: string;
  }>({});
  
  // 모달 상태
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPromoteModal, setShowPromoteModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState<SalesPerson | null>(null);
  
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
    fetchSalesPeople();
  }, [filter]);

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
        setSalesPeople(data.salesPeople);
      }
    } catch (error) {
      console.error('영업 사원 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSalesPerson = async () => {
    try {
      const token = getToken();
      if (!token) return;

      const response = await fetch(`${API_BASE}/sales/people`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert('영업 사원이 등록되었습니다');
        setShowAddModal(false);
        fetchSalesPeople();
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

  const handlePromote = async (id: string, currentRole: string) => {
    const roleMap: Record<string, string> = {
      'MANAGER': 'BRANCH_MANAGER',
      'BRANCH_MANAGER': 'HEAD_MANAGER',
    };

    const newRole = roleMap[currentRole];
    if (!newRole) {
      alert('더 이상 등업할 수 없습니다');
      return;
    }

    const reason = prompt('등업 사유를 입력하세요:');
    if (!reason) return;

    try {
      const token = getToken();
      if (!token) return;

      const response = await fetch(`${API_BASE}/sales/people/${id}/promote`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ newRole, reason }),
      });

      if (response.ok) {
        alert('등업이 완료되었습니다');
        fetchSalesPeople();
      } else {
        const error = await response.json();
        alert(error.error || '등업 실패');
      }
    } catch (error) {
      console.error('등업 실패:', error);
      alert('등업 중 오류가 발생했습니다');
    }
  };

  const handleTransfer = async (id: string) => {
    const newManagerId = prompt('새로운 상위 관리자 ID를 입력하세요:');
    if (!newManagerId) return;

    const reason = prompt('이동 사유를 입력하세요:');
    if (!reason) return;

    try {
      const token = getToken();
      if (!token) return;

      const response = await fetch(`${API_BASE}/sales/people/${id}/transfer`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ newManagerId, reason }),
      });

      if (response.ok) {
        alert('조직 이동이 완료되었습니다');
        fetchSalesPeople();
      } else {
        const error = await response.json();
        alert(error.error || '이동 실패');
      }
    } catch (error) {
      console.error('조직 이동 실패:', error);
      alert('이동 중 오류가 발생했습니다');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    try {
      const token = getToken();
      if (!token) return;

      const response = await fetch(`${API_BASE}/sales/people/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        alert('삭제되었습니다');
        fetchSalesPeople();
      } else {
        const error = await response.json();
        alert(error.error || '삭제 실패');
      }
    } catch (error) {
      console.error('삭제 실패:', error);
      alert('삭제 중 오류가 발생했습니다');
    }
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

  if (loading) {
    return <div style={{ padding: 32, textAlign: 'center' }}>로딩 중...</div>;
  }

  return (
    <div style={{ padding: 32 }}>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: 28, fontWeight: 'bold', margin: 0 }}>
          🏢 영업 조직 관리
        </h1>
        <button
          onClick={() => setShowAddModal(true)}
          style={{
            padding: '10px 20px',
            background: '#0070f3',
            color: 'white',
            border: 'none',
            borderRadius: 6,
            cursor: 'pointer',
            fontWeight: 600,
          }}
        >
          + 영업 사원 등록
        </button>
      </div>

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

      {/* 영업 사원 목록 */}
      <div style={{
        background: 'white',
        borderRadius: 8,
        border: '1px solid #e5e7eb',
        overflow: 'hidden',
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
            <tr>
              <th style={{ padding: 12, textAlign: 'left', fontWeight: 600 }}>이름</th>
              <th style={{ padding: 12, textAlign: 'left', fontWeight: 600 }}>역할</th>
              <th style={{ padding: 12, textAlign: 'left', fontWeight: 600 }}>상위 관리자</th>
              <th style={{ padding: 12, textAlign: 'center', fontWeight: 600 }}>하위 직원</th>
              <th style={{ padding: 12, textAlign: 'center', fontWeight: 600 }}>추천 고객</th>
              <th style={{ padding: 12, textAlign: 'right', fontWeight: 600 }}>실적</th>
              <th style={{ padding: 12, textAlign: 'center', fontWeight: 600 }}>상태</th>
              <th style={{ padding: 12, textAlign: 'center', fontWeight: 600 }}>관리</th>
            </tr>
          </thead>
          <tbody>
            {salesPeople.map((person) => (
              <tr key={person.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                <td style={{ padding: 12 }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>{person.name}</div>
                    <div style={{ fontSize: 13, color: '#6b7280' }}>{person.phone}</div>
                  </div>
                </td>
                <td style={{ padding: 12 }}>
                  <span style={{
                    padding: '4px 10px',
                    borderRadius: 12,
                    fontSize: 12,
                    fontWeight: 600,
                    background: getRoleBadgeColor(person.role) + '20',
                    color: getRoleBadgeColor(person.role),
                  }}>
                    {getRoleLabel(person.role)}
                  </span>
                </td>
                <td style={{ padding: 12 }}>
                  {person.manager ? (
                    <div style={{ fontSize: 14 }}>
                      {person.manager.name}
                      <span style={{ 
                        marginLeft: 4, 
                        fontSize: 12, 
                        color: '#6b7280' 
                      }}>
                        ({getRoleLabel(person.manager.role)})
                      </span>
                    </div>
                  ) : (
                    <span style={{ color: '#9ca3af' }}>-</span>
                  )}
                </td>
                <td style={{ padding: 12, textAlign: 'center' }}>
                  <span style={{ fontWeight: 600 }}>{person.subordinates.length}</span>명
                </td>
                <td style={{ padding: 12, textAlign: 'center' }}>
                  <div>
                    <span style={{ fontWeight: 600, color: '#0070f3' }}>
                      {person.activeReferrals}
                    </span>
                    <span style={{ color: '#6b7280' }}> / {person.totalReferrals}</span>
                  </div>
                </td>
                <td style={{ padding: 12, textAlign: 'right' }}>
                  <div style={{ fontSize: 14 }}>
                    <div style={{ fontWeight: 600 }}>
                      {person.totalRevenue.toLocaleString()}원
                    </div>
                    <div style={{ fontSize: 12, color: '#6b7280' }}>
                      수수료: {person.commission.toLocaleString()}원
                    </div>
                  </div>
                </td>
                <td style={{ padding: 12, textAlign: 'center' }}>
                  <span style={{
                    padding: '4px 10px',
                    borderRadius: 12,
                    fontSize: 12,
                    fontWeight: 600,
                    background: person.isActive ? '#10b98120' : '#ef444420',
                    color: person.isActive ? '#10b981' : '#ef4444',
                  }}>
                    {person.isActive ? '활성' : '비활성'}
                  </span>
                </td>
                <td style={{ padding: 12, textAlign: 'center' }}>
                  <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
                    {person.role !== 'HEAD_MANAGER' && (
                      <button
                        onClick={() => handlePromote(person.id, person.role)}
                        style={{
                          padding: '6px 12px',
                          background: '#0070f3',
                          color: 'white',
                          border: 'none',
                          borderRadius: 4,
                          cursor: 'pointer',
                          fontSize: 12,
                        }}
                        title="등업"
                      >
                        ⬆️ 등업
                      </button>
                    )}
                    <button
                      onClick={() => handleTransfer(person.id)}
                      style={{
                        padding: '6px 12px',
                        background: '#8b5cf6',
                        color: 'white',
                        border: 'none',
                        borderRadius: 4,
                        cursor: 'pointer',
                        fontSize: 12,
                      }}
                      title="조직 이동"
                    >
                      🔄 이동
                    </button>
                    <button
                      onClick={() => handleDelete(person.id)}
                      style={{
                        padding: '6px 12px',
                        background: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: 4,
                        cursor: 'pointer',
                        fontSize: 12,
                      }}
                      title="삭제"
                    >
                      🗑️ 삭제
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {salesPeople.length === 0 && (
          <div style={{ padding: 40, textAlign: 'center', color: '#6b7280' }}>
            등록된 영업 사원이 없습니다
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
        }}>
          <div style={{
            background: 'white',
            padding: 32,
            borderRadius: 12,
            width: '90%',
            maxWidth: 500,
          }}>
            <h2 style={{ marginTop: 0, marginBottom: 24 }}>영업 사원 등록</h2>
            
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
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
                }}
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
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
                }}
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
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
                }}
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
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
                }}
              >
                <option value="MANAGER">매니저</option>
                <option value="BRANCH_MANAGER">지사장</option>
                <option value="HEAD_MANAGER">본부장</option>
              </select>
            </div>

            <div style={{ marginTop: 24, display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowAddModal(false)}
                style={{
                  padding: '10px 20px',
                  background: '#f3f4f6',
                  border: 'none',
                  borderRadius: 6,
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                취소
              </button>
              <button
                onClick={handleAddSalesPerson}
                style={{
                  padding: '10px 20px',
                  background: '#0070f3',
                  color: 'white',
                  border: 'none',
                  borderRadius: 6,
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                등록
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
