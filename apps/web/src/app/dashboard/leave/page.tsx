'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface LeaveType {
  id: string;
  name: string;
  description: string | null;
  requiresDocument: boolean;
  maxDaysPerYear: number | null;
  isPaid: boolean;
  isActive: boolean;
  displayOrder: number;
}

interface LeaveRequest {
  id: string;
  employeeName: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  days: number;
  reason: string | null;
  status: string;
  documentSent: boolean;
  documentNote: string | null;
  createdAt: string;
}

interface Company {
  attachmentEmail: string | null;
}

export default function LeaveManagementPage() {
  const router = useRouter();
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'types' | 'requests'>('types');
  
  // 휴가 유형 등록 폼
  const [showTypeForm, setShowTypeForm] = useState(false);
  const [editingType, setEditingType] = useState<LeaveType | null>(null);
  const [typeName, setTypeName] = useState('');
  const [typeDescription, setTypeDescription] = useState('');
  const [requiresDocument, setRequiresDocument] = useState(false);
  const [maxDays, setMaxDays] = useState('');
  const [isPaid, setIsPaid] = useState(true);
  
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      // 회사 정보
      const companyRes = await fetch('/api/companies/my', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (companyRes.ok) {
        const data = await companyRes.json();
        setCompany(data.company);
      }

      // 휴가 유형
      const typesRes = await fetch('/api/leave/types', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (typesRes.ok) {
        const data = await typesRes.json();
        setLeaveTypes(data.leaveTypes);
      }

      // 휴가 신청 목록
      const requestsRes = await fetch('/api/leave/requests', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (requestsRes.ok) {
        const data = await requestsRes.json();
        setLeaveRequests(data.leaveRequests || data.requests || []);
      }
    } catch (error: any) {
      console.error('데이터 로딩 실패:', error);
      setMessage('❌ ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveType = async () => {
    if (!typeName.trim()) {
      setMessage('휴가 유형명을 입력하세요');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const url = editingType ? `/api/leave/types/${editingType.id}` : '/api/leave/types';
      const method = editingType ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: typeName,
          description: typeDescription || null,
          requiresDocument,
          maxDaysPerYear: maxDays ? parseInt(maxDays) : null,
          isPaid
        })
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error);
      }

      setMessage('✅ 저장되었습니다');
      resetTypeForm();
      fetchData();
    } catch (error: any) {
      setMessage('❌ ' + error.message);
    }
  };

  const handleEditType = (type: LeaveType) => {
    setEditingType(type);
    setTypeName(type.name);
    setTypeDescription(type.description || '');
    setRequiresDocument(type.requiresDocument);
    setMaxDays(type.maxDaysPerYear?.toString() || '');
    setIsPaid(type.isPaid);
    setShowTypeForm(true);
  };

  const handleDeleteType = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까? 사용 중인 유형은 삭제할 수 없습니다.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/leave/types/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error);
      }

      setMessage('✅ 삭제되었습니다');
      fetchData();
    } catch (error: any) {
      setMessage('❌ ' + error.message);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/leave/requests/${id}/approve`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ reviewNote: '승인' })
      });

      if (!res.ok) throw new Error('승인 실패');

      setMessage('✅ 승인되었습니다');
      fetchData();
    } catch (error: any) {
      setMessage('❌ ' + error.message);
    }
  };

  const handleReject = async (id: string) => {
    const reason = prompt('거부 사유를 입력하세요:');
    if (!reason) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/leave/requests/${id}/reject`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ reviewNote: reason })
      });

      if (!res.ok) throw new Error('거부 실패');

      setMessage('✅ 거부되었습니다');
      fetchData();
    } catch (error: any) {
      setMessage('❌ ' + error.message);
    }
  };

  const resetTypeForm = () => {
    setShowTypeForm(false);
    setEditingType(null);
    setTypeName('');
    setTypeDescription('');
    setRequiresDocument(false);
    setMaxDays('');
    setIsPaid(true);
  };

  const getStatusBadge = (status: string) => {
    const styles: any = {
      PENDING: { bg: '#fff4e6', color: '#e67e22', text: '대기중' },
      APPROVED: { bg: '#d4edda', color: '#28a745', text: '승인' },
      REJECTED: { bg: '#f8d7da', color: '#dc3545', text: '거부' },
      CANCELLED: { bg: '#e2e3e5', color: '#6c757d', text: '취소' }
    };
    const style = styles[status] || styles.PENDING;
    return (
      <span style={{
        padding: '4px 12px',
        borderRadius: '12px',
        fontSize: '13px',
        fontWeight: 'bold',
        backgroundColor: style.bg,
        color: style.color
      }}>
        {style.text}
      </span>
    );
  };

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>로딩 중...</div>;
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>
        🏖️ 휴가 관리
      </h1>

      {!company?.attachmentEmail && (
        <div style={{
          background: '#fff3cd',
          border: '1px solid #ffc107',
          borderRadius: '8px',
          padding: '15px',
          marginBottom: '20px'
        }}>
          <strong>⚠️ 첨부파일 이메일이 설정되지 않았습니다</strong>
          <p style={{ marginTop: '8px', marginBottom: '8px' }}>
            직원이 증빙서류를 전송할 이메일을 설정하세요.
          </p>
          <button
            onClick={() => router.push('/dashboard/settings')}
            style={{
              padding: '8px 16px',
              backgroundColor: '#ffc107',
              color: 'black',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            📧 이메일 설정하기
          </button>
        </div>
      )}

      {message && (
        <div style={{
          padding: '12px',
          marginBottom: '20px',
          borderRadius: '8px',
          backgroundColor: message.startsWith('✅') ? '#d4edda' : '#f8d7da',
          color: message.startsWith('✅') ? '#155724' : '#721c24'
        }}>
          {message}
        </div>
      )}

      <div style={{ marginBottom: '20px', borderBottom: '2px solid #e0e0e0' }}>
        <button
          onClick={() => setActiveTab('types')}
          style={{
            padding: '12px 24px',
            fontSize: '16px',
            fontWeight: 'bold',
            border: 'none',
            borderBottom: activeTab === 'types' ? '3px solid #4CAF50' : 'none',
            background: 'none',
            cursor: 'pointer',
            color: activeTab === 'types' ? '#4CAF50' : '#666'
          }}
        >
          휴가 유형 관리
        </button>
        <button
          onClick={() => setActiveTab('requests')}
          style={{
            padding: '12px 24px',
            fontSize: '16px',
            fontWeight: 'bold',
            border: 'none',
            borderBottom: activeTab === 'requests' ? '3px solid #4CAF50' : 'none',
            background: 'none',
            cursor: 'pointer',
            color: activeTab === 'requests' ? '#4CAF50' : '#666'
          }}
        >
          휴가 신청 목록
        </button>
      </div>

      {activeTab === 'types' && (
        <div>
          <button
            onClick={() => setShowTypeForm(!showTypeForm)}
            style={{
              padding: '12px 24px',
              marginBottom: '20px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            ➕ 휴가 유형 추가
          </button>

          {showTypeForm && (
            <div style={{
              background: 'white',
              border: '1px solid #ddd',
              borderRadius: '8px',
              padding: '20px',
              marginBottom: '20px'
            }}>
              <h3 style={{ marginBottom: '15px', fontWeight: 'bold' }}>
                {editingType ? '휴가 유형 수정' : '새 휴가 유형'}
              </h3>
              
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  휴가 유형명 *
                </label>
                <input
                  value={typeName}
                  onChange={(e) => setTypeName(e.target.value)}
                  placeholder="예: 연차, 병가, 경조사"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px'
                  }}
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  설명
                </label>
                <textarea
                  value={typeDescription}
                  onChange={(e) => setTypeDescription(e.target.value)}
                  placeholder="휴가 유형에 대한 설명"
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px'
                  }}
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={requiresDocument}
                    onChange={(e) => setRequiresDocument(e.target.checked)}
                    style={{ marginRight: '8px' }}
                  />
                  <span style={{ fontWeight: 'bold' }}>증빙서류 필요</span>
                </label>
                {requiresDocument && company?.attachmentEmail && (
                  <p style={{ marginTop: '8px', fontSize: '14px', color: '#666' }}>
                    📧 직원에게 {company.attachmentEmail} 이메일로 서류를 전송하도록 안내됩니다.
                  </p>
                )}
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  연간 최대 사용일수
                </label>
                <input
                  type="number"
                  value={maxDays}
                  onChange={(e) => setMaxDays(e.target.value)}
                  placeholder="제한 없음"
                  style={{
                    width: '200px',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px'
                  }}
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={isPaid}
                    onChange={(e) => setIsPaid(e.target.checked)}
                    style={{ marginRight: '8px' }}
                  />
                  <span style={{ fontWeight: 'bold' }}>유급 휴가</span>
                </label>
              </div>

              <div>
                <button
                  onClick={handleSaveType}
                  style={{
                    padding: '10px 20px',
                    marginRight: '10px',
                    backgroundColor: '#4CAF50',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  💾 저장
                </button>
                <button
                  onClick={resetTypeForm}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  취소
                </button>
              </div>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {leaveTypes.map((type) => (
              <div
                key={type.id}
                style={{
                  background: 'white',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  padding: '20px'
                }}
              >
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '10px' }}>
                  {type.name}
                </h3>
                {type.description && (
                  <p style={{ fontSize: '14px', color: '#666', marginBottom: '10px' }}>
                    {type.description}
                  </p>
                )}
                <div style={{ fontSize: '14px', marginBottom: '15px' }}>
                  <p>🔹 {type.isPaid ? '유급' : '무급'}</p>
                  <p>🔹 {type.requiresDocument ? '증빙서류 필요' : '증빙서류 불필요'}</p>
                  {type.maxDaysPerYear && <p>🔹 연간 최대 {type.maxDaysPerYear}일</p>}
                  <p>🔹 {type.isActive ? '활성화' : '비활성화'}</p>
                </div>
                <button
                  onClick={() => handleEditType(type)}
                  style={{
                    padding: '8px 16px',
                    marginRight: '8px',
                    backgroundColor: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  ✏️ 수정
                </button>
                <button
                  onClick={() => handleDeleteType(type.id)}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  🗑️ 삭제
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'requests' && (
        <div>
          <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white' }}>
            <thead>
              <tr style={{ background: '#f5f5f5' }}>
                <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>직원명</th>
                <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>휴가 유형</th>
                <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>기간</th>
                <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'center' }}>일수</th>
                <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>사유</th>
                <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'center' }}>서류전송</th>
                <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'center' }}>상태</th>
                <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'center' }}>관리</th>
              </tr>
            </thead>
            <tbody>
              {leaveRequests.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
                    신청 내역이 없습니다
                  </td>
                </tr>
              ) : (
                leaveRequests.map((request) => (
                  <tr key={request.id}>
                    <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                      {request.employeeName}
                    </td>
                    <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                      {request.leaveType.name}
                      {request.leaveType.requiresDocument && (
                        <span style={{ marginLeft: '8px', fontSize: '12px', color: '#f57c00' }}>
                          📄
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                      {new Date(request.startDate).toLocaleDateString()} ~ {new Date(request.endDate).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'center' }}>
                      {request.days}일
                    </td>
                    <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                      {request.reason || '-'}
                    </td>
                    <td style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'center' }}>
                      {request.leaveType.requiresDocument ? (
                        request.documentSent ? (
                          <span style={{ color: '#28a745', fontWeight: 'bold' }}>✅ 전송완료</span>
                        ) : (
                          <span style={{ color: '#dc3545' }}>❌ 미전송</span>
                        )
                      ) : (
                        <span style={{ color: '#999' }}>-</span>
                      )}
                    </td>
                    <td style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'center' }}>
                      {getStatusBadge(request.status)}
                    </td>
                    <td style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'center' }}>
                      {request.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => handleApprove(request.id)}
                            style={{
                              padding: '6px 12px',
                              marginRight: '5px',
                              backgroundColor: '#28a745',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '13px'
                            }}
                          >
                            ✅ 승인
                          </button>
                          <button
                            onClick={() => handleReject(request.id)}
                            style={{
                              padding: '6px 12px',
                              backgroundColor: '#dc3545',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '13px'
                            }}
                          >
                            ❌ 거부
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
