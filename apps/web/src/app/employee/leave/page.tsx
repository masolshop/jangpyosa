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
}

interface LeaveRequest {
  id: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  days: number;
  reason: string | null;
  status: string;
  documentSent: boolean;
  documentNote: string | null;
  reviewNote: string | null;
  createdAt: string;
}

interface Company {
  name: string;
  attachmentEmail: string | null;
}

export default function EmployeeLeavePage() {
  const router = useRouter();
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [myRequests, setMyRequests] = useState<LeaveRequest[]>([]);
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [showRequestForm, setShowRequestForm] = useState(false);
  
  // 신청 폼
  const [selectedTypeId, setSelectedTypeId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [days, setDays] = useState('');
  const [reason, setReason] = useState('');
  
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/employee/login');
        return;
      }

      // 소속 회사 정보 (이메일 확인용)
      const userRes = await fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (userRes.ok) {
        const userData = await userRes.json();
        if (userData.user.companyId) {
          const companyRes = await fetch('/api/companies/my', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (companyRes.ok) {
            const companyData = await companyRes.json();
            setCompany(companyData.company);
          }
        }
      }

      // 휴가 유형 목록
      const typesRes = await fetch('/api/leave/types', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (typesRes.ok) {
        const data = await typesRes.json();
        setLeaveTypes(data.leaveTypes.filter((t: LeaveType) => t.isActive));
      }

      // 내 휴가 신청 목록
      const requestsRes = await fetch('/api/leave/requests/my', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (requestsRes.ok) {
        const data = await requestsRes.json();
        setMyRequests(data.requests);
      }
    } catch (error: any) {
      console.error('데이터 로딩 실패:', error);
      setMessage('❌ ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const calculateDays = () => {
    if (!startDate || !endDate) return;
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // 시작일 포함
    
    if (diffDays > 0) {
      setDays(diffDays.toString());
    }
  };

  useEffect(() => {
    calculateDays();
  }, [startDate, endDate]);

  const handleSubmit = async () => {
    if (!selectedTypeId || !startDate || !endDate || !days) {
      setMessage('❌ 모든 필수 항목을 입력하세요');
      return;
    }

    if (parseFloat(days) <= 0) {
      setMessage('❌ 올바른 일수를 입력하세요');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/leave/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          leaveTypeId: selectedTypeId,
          startDate,
          endDate,
          days: parseFloat(days),
          reason
        })
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error);
      }

      setMessage('✅ 휴가 신청이 완료되었습니다');
      resetForm();
      fetchData();
    } catch (error: any) {
      setMessage('❌ ' + error.message);
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm('휴가 신청을 취소하시겠습니까?')) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/leave/requests/${id}/cancel`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) throw new Error('취소 실패');

      setMessage('✅ 신청이 취소되었습니다');
      fetchData();
    } catch (error: any) {
      setMessage('❌ ' + error.message);
    }
  };

  const handleMarkDocumentSent = async (id: string) => {
    if (!confirm('증빙서류를 이메일로 전송하셨습니까?')) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/leave/requests/${id}/document-sent`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ documentNote: '이메일 전송 완료' })
      });

      if (!res.ok) throw new Error('업데이트 실패');

      setMessage('✅ 서류 전송 완료로 표시되었습니다');
      fetchData();
    } catch (error: any) {
      setMessage('❌ ' + error.message);
    }
  };

  const resetForm = () => {
    setShowRequestForm(false);
    setSelectedTypeId('');
    setStartDate('');
    setEndDate('');
    setDays('');
    setReason('');
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

  const selectedType = leaveTypes.find(t => t.id === selectedTypeId);

  return (
    <div style={{ padding: '20px', maxWidth: '1000px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>
        🏖️ 휴가 신청
      </h1>

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

      <button
        onClick={() => setShowRequestForm(!showRequestForm)}
        style={{
          padding: '12px 24px',
          marginBottom: '20px',
          backgroundColor: '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontWeight: 'bold',
          fontSize: '16px'
        }}
      >
        ➕ 휴가 신청하기
      </button>

      {showRequestForm && (
        <div style={{
          background: 'white',
          border: '1px solid #ddd',
          borderRadius: '8px',
          padding: '30px',
          marginBottom: '30px'
        }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px' }}>
            새 휴가 신청
          </h2>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>
              휴가 유형 *
            </label>
            <select
              value={selectedTypeId}
              onChange={(e) => setSelectedTypeId(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '16px'
              }}
            >
              <option value="">선택하세요</option>
              {leaveTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name} {type.isPaid ? '(유급)' : '(무급)'}
                  {type.requiresDocument && ' 📄'}
                </option>
              ))}
            </select>
          </div>

          {selectedType?.requiresDocument && company?.attachmentEmail && (
            <div style={{
              padding: '15px',
              marginBottom: '20px',
              background: '#e3f2fd',
              border: '1px solid #2196F3',
              borderRadius: '8px'
            }}>
              <p style={{ fontWeight: 'bold', marginBottom: '8px', color: '#1976d2' }}>
                📧 증빙서류 제출 안내
              </p>
              <p style={{ fontSize: '14px', lineHeight: '1.6' }}>
                이 휴가 유형은 증빙서류가 필요합니다.<br />
                승인 후 다음 이메일로 서류를 전송해주세요:
              </p>
              <p style={{
                marginTop: '10px',
                padding: '10px',
                background: 'white',
                borderRadius: '4px',
                fontWeight: 'bold',
                fontSize: '16px',
                color: '#1976d2'
              }}>
                📨 {company.attachmentEmail}
              </p>
              <p style={{ fontSize: '13px', marginTop: '8px', color: '#666' }}>
                💡 이메일 제목: [휴가증빙] 성함 - 휴가유형 - 날짜
              </p>
            </div>
          )}

          <div style={{ marginBottom: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>
                시작일 *
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '16px'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>
                종료일 *
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '16px'
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>
              일수 *
            </label>
            <input
              type="number"
              value={days}
              onChange={(e) => setDays(e.target.value)}
              step="0.5"
              placeholder="자동 계산됨"
              style={{
                width: '200px',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '16px'
              }}
            />
            <span style={{ marginLeft: '10px', color: '#666' }}>일</span>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>
              사유
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="휴가 사유를 간략히 입력하세요"
              rows={4}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '16px'
              }}
            />
          </div>

          <div>
            <button
              onClick={handleSubmit}
              style={{
                padding: '12px 30px',
                marginRight: '10px',
                backgroundColor: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '16px'
              }}
            >
              ✅ 신청하기
            </button>
            <button
              onClick={resetForm}
              style={{
                padding: '12px 30px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              취소
            </button>
          </div>
        </div>
      )}

      <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '15px' }}>
        내 휴가 신청 내역
      </h2>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white' }}>
          <thead>
            <tr style={{ background: '#f5f5f5' }}>
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
            {myRequests.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
                  신청 내역이 없습니다
                </td>
              </tr>
            ) : (
              myRequests.map((request) => (
                <tr key={request.id}>
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
                      ) : company?.attachmentEmail ? (
                        <div>
                          <button
                            onClick={() => handleMarkDocumentSent(request.id)}
                            style={{
                              padding: '6px 12px',
                              backgroundColor: '#007bff',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '12px',
                              marginBottom: '5px'
                            }}
                          >
                            📨 전송완료 표시
                          </button>
                          <p style={{ fontSize: '11px', color: '#666', margin: 0 }}>
                            {company.attachmentEmail}
                          </p>
                        </div>
                      ) : (
                        <span style={{ color: '#dc3545', fontSize: '12px' }}>이메일 미설정</span>
                      )
                    ) : (
                      <span style={{ color: '#999' }}>-</span>
                    )}
                  </td>
                  <td style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'center' }}>
                    {getStatusBadge(request.status)}
                    {request.reviewNote && request.status === 'REJECTED' && (
                      <p style={{ fontSize: '12px', color: '#dc3545', marginTop: '5px', margin: 0 }}>
                        {request.reviewNote}
                      </p>
                    )}
                  </td>
                  <td style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'center' }}>
                    {request.status === 'PENDING' && (
                      <button
                        onClick={() => handleCancel(request.id)}
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
                        ❌ 취소
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
