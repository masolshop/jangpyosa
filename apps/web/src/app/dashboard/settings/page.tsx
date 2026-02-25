'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Company {
  id: string;
  name: string;
  bizNo: string;
  representative: string | null;
  attachmentEmail: string | null;
}

export default function SettingsPage() {
  const router = useRouter();
  const [company, setCompany] = useState<Company | null>(null);
  const [attachmentEmail, setAttachmentEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchCompanyInfo();
  }, []);

  const fetchCompanyInfo = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const res = await fetch('/api/companies/my', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!res.ok) {
        throw new Error('회사 정보를 불러오지 못했습니다');
      }

      const data = await res.json();
      setCompany(data.company);
      setAttachmentEmail(data.company.attachmentEmail || '');
    } catch (error: any) {
      console.error('회사 정보 조회 실패:', error);
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!attachmentEmail) {
      setMessage('이메일을 입력해주세요');
      return;
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(attachmentEmail)) {
      setMessage('올바른 이메일 형식이 아닙니다');
      return;
    }

    setSaving(true);
    setMessage('');

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/companies/my', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          attachmentEmail
        })
      });

      if (!res.ok) {
        throw new Error('저장에 실패했습니다');
      }

      setMessage('✅ 저장되었습니다');
      fetchCompanyInfo();
    } catch (error: any) {
      console.error('저장 실패:', error);
      setMessage('❌ ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <p>로딩 중...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '800px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>
        ⚙️ 회사 설정
      </h1>

      {company && (
        <div style={{ 
          background: '#f9f9f9', 
          padding: '20px', 
          borderRadius: '8px', 
          marginBottom: '30px' 
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '10px' }}>
            회사 정보
          </h3>
          <p><strong>회사명:</strong> {company.name}</p>
          <p><strong>사업자번호:</strong> {company.bizNo}</p>
          {company.representative && (
            <p><strong>대표자:</strong> {company.representative}</p>
          )}
        </div>
      )}

      <div style={{
        background: 'white',
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
        padding: '30px',
        marginBottom: '20px'
      }}>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '10px' }}>
          📧 첨부파일 전송용 이메일
        </h2>
        <p style={{ color: '#666', marginBottom: '20px', lineHeight: '1.6' }}>
          직원이 휴가 신청 시 증빙서류나 업무지시 관련 파일을 전송할 이메일 주소를 설정하세요.<br />
          설정하신 이메일로 직원들이 필요한 서류를 보낼 수 있습니다.
        </p>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>
            이메일 주소 *
          </label>
          <input
            type="email"
            value={attachmentEmail}
            onChange={(e) => setAttachmentEmail(e.target.value)}
            placeholder="예: files@company.com"
            style={{
              width: '100%',
              padding: '12px',
              fontSize: '16px',
              border: '1px solid #ddd',
              borderRadius: '4px'
            }}
          />
          <p style={{ fontSize: '14px', color: '#888', marginTop: '8px' }}>
            💡 회사 대표 이메일 또는 담당자 이메일을 입력하세요
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            padding: '12px 30px',
            fontSize: '16px',
            fontWeight: 'bold',
            backgroundColor: saving ? '#ccc' : '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: saving ? 'not-allowed' : 'pointer',
            marginRight: '10px'
          }}
        >
          {saving ? '저장 중...' : '💾 저장'}
        </button>

        {message && (
          <p style={{
            marginTop: '15px',
            padding: '10px',
            backgroundColor: message.startsWith('✅') ? '#d4edda' : '#f8d7da',
            color: message.startsWith('✅') ? '#155724' : '#721c24',
            borderRadius: '4px'
          }}>
            {message}
          </p>
        )}
      </div>

      <div style={{
        background: '#fff8e1',
        border: '1px solid #ffd54f',
        borderRadius: '8px',
        padding: '20px'
      }}>
        <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '10px', color: '#f57c00' }}>
          📌 사용 예시
        </h3>
        <ul style={{ paddingLeft: '20px', lineHeight: '1.8' }}>
          <li>직원이 병가 신청 시 → 진단서를 설정하신 이메일로 전송</li>
          <li>업무지시 첨부파일 → 직원이 결과물을 이메일로 제출</li>
          <li>경조사 휴가 → 청첩장/부고장 등을 이메일로 전송</li>
        </ul>
      </div>
    </div>
  );
}
