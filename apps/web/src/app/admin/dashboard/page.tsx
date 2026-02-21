'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  phone: string;
  name: string;
  role: string;
  email?: string;
  createdAt: string;
}

interface QuoteInquiry {
  id: string;
  companyName: string;
  contactName: string;
  contactPhone: string;
  category: string;
  productName: string;
  status: string;
  createdAt: string;
}

interface Stats {
  totalUsers: number;
  buyers: number;
  suppliers: number;
  employees: number;
  pendingQuotes: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'quotes'>('overview');
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [quotes, setQuotes] = useState<QuoteInquiry[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    checkAuth();
    fetchDashboardData();
  }, []);

  const checkAuth = () => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    if (!token || role !== 'SUPER_ADMIN') {
      router.push('/admin/login');
      return;
    }
  };

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');

      // 통계 데이터 가져오기
      const [usersRes, quotesRes] = await Promise.all([
        fetch('http://localhost:4000/admin/users', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch('http://localhost:4000/quotes', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (!usersRes.ok || !quotesRes.ok) {
        throw new Error('데이터 로드 실패');
      }

      const usersData = await usersRes.json();
      const quotesData = await quotesRes.json();

      setUsers(usersData.users || []);
      setQuotes(quotesData.inquiries || []);

      // 통계 계산
      const buyers = usersData.users.filter((u: User) => u.role === 'BUYER').length;
      const suppliers = usersData.users.filter((u: User) => u.role === 'SUPPLIER').length;
      const employees = usersData.users.filter((u: User) => u.role === 'EMPLOYEE').length;
      const pendingQuotes = quotesData.inquiries.filter((q: QuoteInquiry) => q.status === 'PENDING').length;

      setStats({
        totalUsers: usersData.users.length,
        buyers,
        suppliers,
        employees,
        pendingQuotes,
      });
    } catch (err) {
      console.error('데이터 로드 오류:', err);
      setError('데이터를 불러올 수 없습니다');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    router.push('/admin/login');
  };

  const handleUpdateQuote = async (id: string, status: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:4000/quotes/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) throw new Error('업데이트 실패');

      alert('견적문의 상태가 업데이트되었습니다');
      fetchDashboardData();
    } catch (err) {
      alert('업데이트 중 오류가 발생했습니다');
    }
  };

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <p>로딩 중...</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      {/* 헤더 */}
      <div style={{
        backgroundColor: '#1a237e',
        color: 'white',
        padding: '20px 40px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <h1 style={{ margin: 0, fontSize: 24 }}>🛡️ 슈퍼어드민 대시보드</h1>
        <button
          onClick={handleLogout}
          style={{
            padding: '10px 20px',
            backgroundColor: '#d32f2f',
            color: 'white',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
          }}
        >
          로그아웃
        </button>
      </div>

      {/* 탭 메뉴 */}
      <div style={{
        backgroundColor: 'white',
        borderBottom: '1px solid #e0e0e0',
        padding: '0 40px',
      }}>
        <div style={{ display: 'flex', gap: 20 }}>
          {(['overview', 'users', 'quotes'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '15px 20px',
                border: 'none',
                backgroundColor: 'transparent',
                borderBottom: activeTab === tab ? '3px solid #1a237e' : 'none',
                color: activeTab === tab ? '#1a237e' : '#666',
                fontWeight: activeTab === tab ? 'bold' : 'normal',
                cursor: 'pointer',
              }}
            >
              {tab === 'overview' ? '📊 대시보드' : tab === 'users' ? '👥 회원 관리' : '💬 견적 문의'}
            </button>
          ))}
        </div>
      </div>

      {/* 컨텐츠 */}
      <div style={{ padding: 40 }}>
        {error && (
          <div style={{
            padding: 15,
            backgroundColor: '#ffebee',
            color: '#c62828',
            borderRadius: 4,
            marginBottom: 20,
          }}>
            {error}
          </div>
        )}

        {/* 대시보드 탭 */}
        {activeTab === 'overview' && stats && (
          <div>
            <h2 style={{ marginBottom: 30 }}>📊 시스템 현황</h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 20,
              marginBottom: 40,
            }}>
              <StatCard title="전체 회원" value={stats.totalUsers} color="#1976d2" />
              <StatCard title="구매기업" value={stats.buyers} color="#388e3c" />
              <StatCard title="표준사업장" value={stats.suppliers} color="#f57c00" />
              <StatCard title="직원" value={stats.employees} color="#7b1fa2" />
              <StatCard title="대기 중 견적" value={stats.pendingQuotes} color="#d32f2f" />
            </div>
          </div>
        )}

        {/* 회원 관리 탭 */}
        {activeTab === 'users' && (
          <div>
            <h2 style={{ marginBottom: 20 }}>👥 회원 목록</h2>
            <div style={{ backgroundColor: 'white', borderRadius: 8, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ backgroundColor: '#f5f5f5' }}>
                  <tr>
                    <th style={tableHeaderStyle}>이름</th>
                    <th style={tableHeaderStyle}>전화번호</th>
                    <th style={tableHeaderStyle}>이메일</th>
                    <th style={tableHeaderStyle}>역할</th>
                    <th style={tableHeaderStyle}>가입일</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} style={{ borderBottom: '1px solid #e0e0e0' }}>
                      <td style={tableCellStyle}>{user.name}</td>
                      <td style={tableCellStyle}>{user.phone}</td>
                      <td style={tableCellStyle}>{user.email || '-'}</td>
                      <td style={tableCellStyle}>
                        <span style={getRoleBadgeStyle(user.role)}>
                          {getRoleLabel(user.role)}
                        </span>
                      </td>
                      <td style={tableCellStyle}>
                        {new Date(user.createdAt).toLocaleDateString('ko-KR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 견적 문의 탭 */}
        {activeTab === 'quotes' && (
          <div>
            <h2 style={{ marginBottom: 20 }}>💬 견적 문의 목록</h2>
            <div style={{ backgroundColor: 'white', borderRadius: 8, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ backgroundColor: '#f5f5f5' }}>
                  <tr>
                    <th style={tableHeaderStyle}>회사명</th>
                    <th style={tableHeaderStyle}>담당자</th>
                    <th style={tableHeaderStyle}>연락처</th>
                    <th style={tableHeaderStyle}>카테고리</th>
                    <th style={tableHeaderStyle}>상품명</th>
                    <th style={tableHeaderStyle}>상태</th>
                    <th style={tableHeaderStyle}>문의일</th>
                    <th style={tableHeaderStyle}>작업</th>
                  </tr>
                </thead>
                <tbody>
                  {quotes.map((quote) => (
                    <tr key={quote.id} style={{ borderBottom: '1px solid #e0e0e0' }}>
                      <td style={tableCellStyle}>{quote.companyName}</td>
                      <td style={tableCellStyle}>{quote.contactName}</td>
                      <td style={tableCellStyle}>{quote.contactPhone}</td>
                      <td style={tableCellStyle}>{quote.category}</td>
                      <td style={tableCellStyle}>{quote.productName}</td>
                      <td style={tableCellStyle}>
                        <span style={getStatusBadgeStyle(quote.status)}>
                          {getStatusLabel(quote.status)}
                        </span>
                      </td>
                      <td style={tableCellStyle}>
                        {new Date(quote.createdAt).toLocaleDateString('ko-KR')}
                      </td>
                      <td style={tableCellStyle}>
                        <select
                          value={quote.status}
                          onChange={(e) => handleUpdateQuote(quote.id, e.target.value)}
                          style={{
                            padding: '5px 10px',
                            border: '1px solid #ddd',
                            borderRadius: 4,
                            fontSize: 14,
                          }}
                        >
                          <option value="PENDING">대기중</option>
                          <option value="IN_PROGRESS">처리중</option>
                          <option value="QUOTED">견적완료</option>
                          <option value="COMPLETED">완료</option>
                          <option value="CANCELLED">취소</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// 통계 카드 컴포넌트
function StatCard({ title, value, color }: { title: string; value: number; color: string }) {
  return (
    <div style={{
      backgroundColor: 'white',
      padding: 30,
      borderRadius: 8,
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      borderLeft: `4px solid ${color}`,
    }}>
      <div style={{ fontSize: 14, color: '#666', marginBottom: 10 }}>{title}</div>
      <div style={{ fontSize: 36, fontWeight: 'bold', color }}>{value}</div>
    </div>
  );
}

// 스타일
const tableHeaderStyle = {
  padding: '15px',
  textAlign: 'left' as const,
  fontWeight: 'bold',
  color: '#666',
};

const tableCellStyle = {
  padding: '15px',
};

// 역할 라벨
function getRoleLabel(role: string) {
  const labels: Record<string, string> = {
    BUYER: '구매기업',
    SUPPLIER: '표준사업장',
    EMPLOYEE: '직원',
    AGENT: '지점',
    SUPER_ADMIN: '슈퍼어드민',
  };
  return labels[role] || role;
}

// 역할 배지 스타일
function getRoleBadgeStyle(role: string) {
  const colors: Record<string, { bg: string; text: string }> = {
    BUYER: { bg: '#e8f5e9', text: '#2e7d32' },
    SUPPLIER: { bg: '#fff3e0', text: '#e65100' },
    EMPLOYEE: { bg: '#f3e5f5', text: '#6a1b9a' },
    SUPER_ADMIN: { bg: '#e3f2fd', text: '#0d47a1' },
  };
  const color = colors[role] || { bg: '#f5f5f5', text: '#666' };

  return {
    padding: '4px 12px',
    backgroundColor: color.bg,
    color: color.text,
    borderRadius: 12,
    fontSize: 13,
    fontWeight: 'bold' as const,
  };
}

// 상태 라벨
function getStatusLabel(status: string) {
  const labels: Record<string, string> = {
    PENDING: '대기중',
    IN_PROGRESS: '처리중',
    QUOTED: '견적완료',
    COMPLETED: '완료',
    CANCELLED: '취소',
  };
  return labels[status] || status;
}

// 상태 배지 스타일
function getStatusBadgeStyle(status: string) {
  const colors: Record<string, { bg: string; text: string }> = {
    PENDING: { bg: '#fff3e0', text: '#e65100' },
    IN_PROGRESS: { bg: '#e3f2fd', text: '#0d47a1' },
    QUOTED: { bg: '#f3e5f5', text: '#6a1b9a' },
    COMPLETED: { bg: '#e8f5e9', text: '#2e7d32' },
    CANCELLED: { bg: '#ffebee', text: '#c62828' },
  };
  const color = colors[status] || { bg: '#f5f5f5', text: '#666' };

  return {
    padding: '4px 12px',
    backgroundColor: color.bg,
    color: color.text,
    borderRadius: 12,
    fontSize: 13,
    fontWeight: 'bold' as const,
  };
}
