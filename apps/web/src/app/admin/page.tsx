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
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    checkAuthAndRedirect();
  }, []);

  useEffect(() => {
    if (!loading) {
      loadPendingPeople();
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

  const handleApprove = async (personId: string) => {
    if (!confirm('이 매니저를 승인하시겠습니까?')) {
      return;
    }

    try {
      await apiFetch(`/sales/people/${personId}/toggle-active`, {
        method: 'POST',
        body: JSON.stringify({
          isActive: true,
        }),
      });

      setSuccessMessage('승인이 완료되었습니다.');
      setTimeout(() => setSuccessMessage(''), 3000);
      loadPendingPeople();
    } catch (err: any) {
      setError(err.message || '승인 실패');
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
                      onClick={() => handleApprove(person.id)}
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
                      onClick={() => router.push(`/admin/sales-management?edit=${person.id}`)}
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
