'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { get, post, put, del, patch } from '@/lib/api-client';
import { getCurrentUserCompany } from '@/lib/unified-api';

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

interface AnnualLeaveBalance {
  id: string;
  employeeId: string;
  employeeName: string;
  phone: string | null;
  year: number;
  totalGenerated: number;
  baseLeave: number;
  bonusLeave: number;
  used: number;
  remaining: number;
  isUnderOneYear: boolean;
  expiryDate: string;
  workYears: number;
  workMonths: number;
}

export default function LeaveManagementPage() {
  const router = useRouter();
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [annualLeaveBalances, setAnnualLeaveBalances] = useState<AnnualLeaveBalance[]>([]);
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'types' | 'requests' | 'balances'>('types');
  
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
      // 회사 정보 조회
      const companyData = await getCurrentUserCompany();
      if (!companyData) {
        router.push('/login');
        return;
      }

      // 병렬로 모든 데이터 조회 (최적화)
      const [companyInfo, balancesData, typesData, requestsData] = await Promise.all([
        get<{ company: Company }>('/companies/my'),
        get<{ balances: AnnualLeaveBalance[] }>(`/annual-leave/company/${companyData.companyId}`),
        get<{ leaveTypes: LeaveType[] }>('/leave/types'),
        get<{ leaveRequests?: LeaveRequest[]; requests?: LeaveRequest[] }>('/leave/requests')
      ]);

      setCompany(companyInfo.company);
      setAnnualLeaveBalances(balancesData.balances || []);
      setLeaveTypes(typesData.leaveTypes);
      setLeaveRequests(requestsData.leaveRequests || requestsData.requests || []);
    } catch (error: any) {
      console.error('데이터 로딩 실패:', error);
      setMessage('❌ ' + error.message);
      if (error.statusCode === 401) {
        router.push('/login');
      }
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
      const data = {
        name: typeName,
        description: typeDescription || null,
        requiresDocument,
        maxDaysPerYear: maxDays ? parseInt(maxDays) : null,
        isPaid
      };

      if (editingType) {
        await put(`/leave/types/${editingType.id}`, data);
      } else {
        await post('/leave/types', data);
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
      await del(`/leave/types/${id}`);
      setMessage('✅ 삭제되었습니다');
      fetchData();
    } catch (error: any) {
      setMessage('❌ ' + error.message);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await patch(`/leave/requests/${id}/approve`, { reviewNote: '승인' });
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
      await patch(`/leave/requests/${id}/reject`, { reviewNote: reason });
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
        <button
          onClick={() => setActiveTab('balances')}
          style={{
            padding: '12px 24px',
            fontSize: '16px',
            fontWeight: 'bold',
            border: 'none',
            borderBottom: activeTab === 'balances' ? '3px solid #4CAF50' : 'none',
            background: 'none',
            cursor: 'pointer',
            color: activeTab === 'balances' ? '#4CAF50' : '#666'
          }}
        >
          연차 현황
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

      {activeTab === 'balances' && (
        <div>
          <div style={{
            background: '#f0f8ff',
            border: '1px solid #2196F3',
            borderRadius: '8px',
            padding: '15px',
            marginBottom: '20px'
          }}>
            <h3 style={{ marginBottom: '10px', fontWeight: 'bold', color: '#1976D2' }}>
              📋 연차(휴가) 관리 안내
            </h3>
            <ul style={{ marginLeft: '20px', lineHeight: '1.8' }}>
              <li><strong>1년 미만 근무자:</strong> 매월 개근 시 1일 발생 (최대 11일)</li>
              <li><strong>1년 이상 근무자:</strong> 기본 15일 + 3년 이상부터 2년마다 1일 추가 (최대 25일)</li>
              <li><strong>연차 소멸:</strong> 발생일로부터 1년 경과 시 소멸</li>
              <li><strong>연차 촉진:</strong> 소멸 6개월 전, 2개월 전 각각 알림 발송 필요</li>
              <li><strong>퇴사 시:</strong> 미사용 연차에 대해 수당 지급 필요</li>
            </ul>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '15px',
            marginBottom: '20px'
          }}>
            <div style={{
              background: 'white',
              padding: '20px',
              borderRadius: '8px',
              border: '1px solid #e0e0e0'
            }}>
              <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>전체 직원</div>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#333' }}>
                {annualLeaveBalances.length}명
              </div>
            </div>
            <div style={{
              background: 'white',
              padding: '20px',
              borderRadius: '8px',
              border: '1px solid #e0e0e0'
            }}>
              <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>평균 발생 연차</div>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#4CAF50' }}>
                {annualLeaveBalances.length > 0
                  ? (annualLeaveBalances.reduce((sum, b) => sum + b.totalGenerated, 0) / annualLeaveBalances.length).toFixed(1)
                  : '0'}일
              </div>
            </div>
            <div style={{
              background: 'white',
              padding: '20px',
              borderRadius: '8px',
              border: '1px solid #e0e0e0'
            }}>
              <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>평균 사용 연차</div>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#FF9800' }}>
                {annualLeaveBalances.length > 0
                  ? (annualLeaveBalances.reduce((sum, b) => sum + b.used, 0) / annualLeaveBalances.length).toFixed(1)
                  : '0'}일
              </div>
            </div>
            <div style={{
              background: 'white',
              padding: '20px',
              borderRadius: '8px',
              border: '1px solid #e0e0e0'
            }}>
              <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>평균 잔여 연차</div>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#2196F3' }}>
                {annualLeaveBalances.length > 0
                  ? (annualLeaveBalances.reduce((sum, b) => sum + b.remaining, 0) / annualLeaveBalances.length).toFixed(1)
                  : '0'}일
              </div>
            </div>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white' }}>
            <thead>
              <tr style={{ background: '#f5f5f5' }}>
                <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>직원명</th>
                <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'center' }}>근속연수</th>
                <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'center' }}>발생 연차</th>
                <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'center' }}>사용 연차</th>
                <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'center' }}>잔여 연차</th>
                <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'center' }}>사용률</th>
                <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>소멸일</th>
              </tr>
            </thead>
            <tbody>
              {annualLeaveBalances.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
                    연차 데이터가 없습니다
                  </td>
                </tr>
              ) : (
                annualLeaveBalances.map((balance) => {
                  const usageRate = balance.totalGenerated > 0
                    ? ((balance.used / balance.totalGenerated) * 100).toFixed(1)
                    : '0.0';
                  
                  const expiryDate = new Date(balance.expiryDate);
                  const now = new Date();
                  const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                  const isNearExpiry = daysUntilExpiry <= 60 && daysUntilExpiry > 0;
                  const isExpired = daysUntilExpiry <= 0;

                  return (
                    <tr key={balance.id}>
                      <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                        {balance.employeeName}
                        {balance.isUnderOneYear && (
                          <span style={{
                            marginLeft: '8px',
                            padding: '2px 8px',
                            borderRadius: '8px',
                            fontSize: '12px',
                            background: '#e3f2fd',
                            color: '#1976d2'
                          }}>
                            신입
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'center' }}>
                        {balance.isUnderOneYear
                          ? `${balance.workMonths}개월`
                          : `${balance.workYears}년`
                        }
                      </td>
                      <td style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'center', fontWeight: 'bold' }}>
                        {balance.totalGenerated}일
                        {!balance.isUnderOneYear && balance.bonusLeave > 0 && (
                          <span style={{ fontSize: '12px', color: '#4CAF50', marginLeft: '4px' }}>
                            (+{balance.bonusLeave})
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'center', color: '#FF9800' }}>
                        {balance.used}일
                      </td>
                      <td style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'center', fontWeight: 'bold', color: '#2196F3' }}>
                        {balance.remaining}일
                      </td>
                      <td style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'center' }}>
                        {usageRate}%
                      </td>
                      <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                        {expiryDate.toLocaleDateString()}
                        {isExpired && (
                          <span style={{
                            marginLeft: '8px',
                            padding: '2px 8px',
                            borderRadius: '8px',
                            fontSize: '12px',
                            background: '#ffebee',
                            color: '#c62828'
                          }}>
                            소멸
                          </span>
                        )}
                        {isNearExpiry && (
                          <span style={{
                            marginLeft: '8px',
                            padding: '2px 8px',
                            borderRadius: '8px',
                            fontSize: '12px',
                            background: '#fff3e0',
                            color: '#ef6c00'
                          }}>
                            {daysUntilExpiry}일 남음
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
