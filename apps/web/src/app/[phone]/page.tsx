"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 
  (typeof window !== 'undefined' && window.location.hostname === 'jangpyosa.com' 
    ? 'https://jangpyosa.com/api' 
    : 'http://localhost:4000');

interface ReferralInfo {
  name: string;
  phone: string;
  role: string;
  referralCode: string;
  isActive: boolean;
}

export default function ReferralPage({ params }: { params: { phone: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [referralInfo, setReferralInfo] = useState<ReferralInfo | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    loadReferralInfo();
  }, [params.phone]);

  const loadReferralInfo = async () => {
    try {
      setLoading(true);
      setError('');

      // 핸드폰 번호 정규화 (하이픈, 공백 제거)
      const normalizedPhone = params.phone.replace(/[-\s]/g, '');

      // 추천인 정보 조회 API 호출
      const response = await fetch(`${API_BASE}/sales/referral/${normalizedPhone}`);
      
      if (!response.ok) {
        throw new Error('추천인 정보를 찾을 수 없습니다');
      }

      const data = await response.json();
      setReferralInfo(data);
    } catch (err: any) {
      console.error('추천인 정보 로드 에러:', err);
      setError(err.message || '추천인 정보를 불러올 수 없습니다');
    } finally {
      setLoading(false);
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

  const handleSignup = (type: 'buyer' | 'supplier') => {
    // 핸드폰 번호 정규화 (하이픈, 공백 제거)
    const normalizedPhone = params.phone.replace(/[-\s]/g, '');
    // 추천인 정보를 쿼리 파라미터로 전달
    router.push(`/signup?referrer=${normalizedPhone}&type=${type}`);
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}>
        <div style={{ textAlign: 'center', color: 'white' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⏳</div>
          <p style={{ fontSize: 18 }}>추천인 정보를 확인하는 중...</p>
        </div>
      </div>
    );
  }

  if (error || !referralInfo) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: 20,
      }}>
        <div style={{
          background: 'white',
          borderRadius: 16,
          boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
          padding: 40,
          maxWidth: 500,
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>❌</div>
          <h1 style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 16, color: '#dc2626' }}>
            추천인을 찾을 수 없습니다
          </h1>
          <p style={{ fontSize: 16, color: '#6b7280', marginBottom: 32 }}>
            {error || '유효하지 않은 추천인 링크입니다'}
          </p>
          <button
            onClick={() => router.push('/signup')}
            style={{
              padding: '12px 24px',
              background: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: 8,
              fontSize: 16,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            일반 회원가입하기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
    }}>
      <div style={{
        background: 'white',
        borderRadius: 16,
        boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
        padding: 40,
        maxWidth: 600,
        width: '100%',
      }}>
        {/* 헤더 */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
          <h1 style={{ fontSize: 28, fontWeight: 'bold', marginBottom: 8, color: '#111' }}>
            장표사닷컴에 오신 것을 환영합니다!
          </h1>
          <p style={{ fontSize: 16, color: '#6b7280' }}>
            추천인을 통해 회원가입하시면 다양한 혜택을 받으실 수 있습니다
          </p>
        </div>

        {/* 추천인 정보 */}
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: 12,
          padding: 24,
          marginBottom: 32,
          color: 'white',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ fontSize: 32, marginRight: 12 }}>👤</div>
            <div>
              <p style={{ fontSize: 14, opacity: 0.9, margin: 0, marginBottom: 4 }}>
                추천인
              </p>
              <p style={{ fontSize: 22, fontWeight: 'bold', margin: 0 }}>
                {referralInfo.name} {getRoleName(referralInfo.role)}
              </p>
            </div>
          </div>
          <div style={{
            background: 'rgba(255,255,255,0.2)',
            borderRadius: 8,
            padding: 12,
            fontSize: 14,
          }}>
            <p style={{ margin: 0 }}>
              📱 연락처: {referralInfo.phone}
            </p>
            <p style={{ margin: '8px 0 0 0' }}>
              🔑 추천코드: {referralInfo.referralCode}
            </p>
          </div>
        </div>

        {/* 회원가입 유형 선택 */}
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 16, color: '#111' }}>
            회원 유형을 선택해주세요
          </h2>
          <div style={{ display: 'grid', gap: 16 }}>
            <button
              onClick={() => handleSignup('buyer')}
              style={{
                padding: 20,
                background: 'white',
                border: '2px solid #e5e7eb',
                borderRadius: 12,
                cursor: 'pointer',
                transition: 'all 0.2s',
                textAlign: 'left',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#667eea';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#e5e7eb';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: 32, marginRight: 12 }}>🏢</span>
                <span style={{ fontSize: 18, fontWeight: 'bold', color: '#111' }}>
                  고용의무기업
                </span>
              </div>
              <p style={{ fontSize: 14, color: '#6b7280', margin: 0, paddingLeft: 44 }}>
                장애인 고용의무가 있는 기업
              </p>
            </button>

            <button
              onClick={() => handleSignup('supplier')}
              style={{
                padding: 20,
                background: 'white',
                border: '2px solid #e5e7eb',
                borderRadius: 12,
                cursor: 'pointer',
                transition: 'all 0.2s',
                textAlign: 'left',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#667eea';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#e5e7eb';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: 32, marginRight: 12 }}>🏭</span>
                <span style={{ fontSize: 18, fontWeight: 'bold', color: '#111' }}>
                  표준사업장
                </span>
              </div>
              <p style={{ fontSize: 14, color: '#6b7280', margin: 0, paddingLeft: 44 }}>
                장애인 표준사업장 운영 기업
              </p>
            </button>
          </div>
        </div>

        {/* 안내 메시지 */}
        <div style={{
          background: '#fef3c7',
          borderRadius: 8,
          padding: 16,
          fontSize: 14,
          color: '#92400e',
        }}>
          💡 <strong>안내:</strong> 추천인을 통해 가입하시면 가입 프로세스에서 
          추천인 정보가 자동으로 입력됩니다.
        </div>
      </div>
    </div>
  );
}
