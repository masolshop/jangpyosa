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
    name: string;
    phone: string;
  };
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

export default function SalesManagementPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [salesPeople, setSalesPeople] = useState<SalesPerson[]>([]);
  const [filteredPeople, setFilteredPeople] = useState<SalesPerson[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

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
                <option value="MANAGER">매니저</option>
                <option value="BRANCH_MANAGER">지사장</option>
                <option value="HEAD_MANAGER">본부장</option>
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
      </div>
    </div>
  );
}
