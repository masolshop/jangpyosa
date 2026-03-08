'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { login } from '@/lib/auth';

export default function EmployeeLoginPage() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await login(phone, password);
      
      if (result.success) {
        // 직원 권한 체크
        if (result.user?.role === 'EMPLOYEE' || result.user?.role === 'MANAGER') {
          router.push('/employee');
        } else {
          setError('직원 계정으로만 로그인할 수 있습니다.');
        }
      } else {
        setError(result.error || '로그인에 실패했습니다.');
      }
    } catch (err) {
      setError('로그인 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/[^\d]/g, '');
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 7) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhone(formatted);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      paddingBottom: '100px', // 하단 메뉴 공간 확보
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* 배경 장식 요소 */}
      <div style={{
        position: 'absolute',
        width: '300px',
        height: '300px',
        borderRadius: '50%',
        background: 'rgba(255, 255, 255, 0.1)',
        filter: 'blur(60px)',
        top: '-100px',
        left: '-100px',
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute',
        width: '400px',
        height: '400px',
        borderRadius: '50%',
        background: 'rgba(255, 255, 255, 0.08)',
        filter: 'blur(80px)',
        bottom: '-150px',
        right: '-150px',
        pointerEvents: 'none'
      }} />

      {/* 로그인 폼 */}
      <div style={{
        width: '100%',
        maxWidth: '480px',
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        borderRadius: '30px',
        padding: '48px 36px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        position: 'relative',
        zIndex: 1
      }}>
        {/* 아이콘 */}
        <div style={{
          textAlign: 'center',
          marginBottom: '32px'
        }}>
          <div style={{
            fontSize: '140px',
            marginBottom: '16px'
          }}>👤</div>
          <h1 style={{
            fontSize: '42px',
            fontWeight: '800',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '12px',
            letterSpacing: '-1px'
          }}>
            직원 로그인
          </h1>
          <p style={{
            fontSize: '18px',
            color: '#64748b',
            fontWeight: '500'
          }}>
            계정에 로그인하세요
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          {error && (
            <div style={{
              padding: '18px',
              backgroundColor: '#fef2f2',
              border: '2px solid #fecaca',
              borderRadius: '16px',
              marginBottom: '28px',
              color: '#dc2626',
              fontSize: '16px',
              fontWeight: '600',
              textAlign: 'center'
            }}>
              {error}
            </div>
          )}

          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              marginBottom: '12px',
              color: '#1e293b',
              fontSize: '17px',
              fontWeight: '700'
            }}>
              전화번호
            </label>
            <input
              type="tel"
              value={phone}
              onChange={handlePhoneChange}
              placeholder="010-0000-0000"
              required
              style={{
                width: '100%',
                padding: '26px 22px',
                fontSize: '18px',
                border: '2px solid #e2e8f0',
                borderRadius: '20px',
                outline: 'none',
                backgroundColor: '#f7fafc',
                color: '#1e293b',
                fontWeight: '600',
                transition: 'all 0.3s ease',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                transform: 'translateY(0)'
              }}
              onFocus={(e) => {
                e.target.style.backgroundColor = '#ffffff';
                e.target.style.borderColor = '#667eea';
                e.target.style.boxShadow = '0 8px 20px rgba(102, 126, 234, 0.15)';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onBlur={(e) => {
                e.target.style.backgroundColor = '#f7fafc';
                e.target.style.borderColor = '#e2e8f0';
                e.target.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.04)';
                e.target.style.transform = 'translateY(0)';
              }}
            />
          </div>

          <div style={{ marginBottom: '32px' }}>
            <label style={{
              display: 'block',
              marginBottom: '12px',
              color: '#1e293b',
              fontSize: '17px',
              fontWeight: '700'
            }}>
              비밀번호
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호를 입력하세요"
              required
              style={{
                width: '100%',
                padding: '26px 22px',
                fontSize: '18px',
                border: '2px solid #e2e8f0',
                borderRadius: '20px',
                outline: 'none',
                backgroundColor: '#f7fafc',
                color: '#1e293b',
                fontWeight: '600',
                transition: 'all 0.3s ease',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                transform: 'translateY(0)'
              }}
              onFocus={(e) => {
                e.target.style.backgroundColor = '#ffffff';
                e.target.style.borderColor = '#667eea';
                e.target.style.boxShadow = '0 8px 20px rgba(102, 126, 234, 0.15)';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onBlur={(e) => {
                e.target.style.backgroundColor = '#f7fafc';
                e.target.style.borderColor = '#e2e8f0';
                e.target.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.04)';
                e.target.style.transform = 'translateY(0)';
              }}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '30px',
              fontSize: '20px',
              fontWeight: '800',
              color: 'white',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
              borderRadius: '20px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 10px 30px rgba(102, 126, 234, 0.4)',
              transform: 'translateY(0)',
              letterSpacing: '0.5px'
            }}
            onMouseEnter={(e) => {
              if (!isLoading) {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = '0 15px 40px rgba(102, 126, 234, 0.5)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 10px 30px rgba(102, 126, 234, 0.4)';
            }}
          >
            {isLoading ? '로그인 중...' : '로그인'}
          </button>

          <div style={{
            marginTop: '28px',
            textAlign: 'center'
          }}>
            <a
              href="/employee/signup"
              style={{
                color: '#667eea',
                textDecoration: 'none',
                fontSize: '17px',
                fontWeight: '700',
                transition: 'color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#764ba2'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#667eea'}
            >
              계정이 없으신가요? 회원가입
            </a>
          </div>
        </form>
      </div>

      {/* 모바일 하단 네비게이션 - PC에서는 중앙 정렬 */}
      <nav style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderTop: '1px solid rgba(0, 0, 0, 0.08)',
        boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.05)',
        zIndex: 1000,
        display: 'flex',
        justifyContent: 'center', // PC에서 중앙 정렬
        padding: '8px 0'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          width: '100%',
          maxWidth: '600px', // PC에서 최대 너비 제한
          padding: '0 16px'
        }}>
          <a
            href="/employee/attendance"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textDecoration: 'none',
              color: '#64748b',
              fontSize: '12px',
              fontWeight: '600',
              minWidth: '60px',
              padding: '8px',
              transition: 'all 0.2s ease',
              borderRadius: '12px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f1f5f9';
              e.currentTarget.style.color = '#667eea';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#64748b';
            }}
          >
            <span style={{ fontSize: '24px', marginBottom: '4px' }}>📅</span>
            <span>출퇴근</span>
          </a>

          <a
            href="/employee/work-orders"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textDecoration: 'none',
              color: '#64748b',
              fontSize: '12px',
              fontWeight: '600',
              minWidth: '60px',
              padding: '8px',
              transition: 'all 0.2s ease',
              borderRadius: '12px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f1f5f9';
              e.currentTarget.style.color = '#667eea';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#64748b';
            }}
          >
            <span style={{ fontSize: '24px', marginBottom: '4px' }}>📋</span>
            <span>업무지시</span>
          </a>

          <a
            href="/employee/leave"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textDecoration: 'none',
              color: '#64748b',
              fontSize: '12px',
              fontWeight: '600',
              minWidth: '60px',
              padding: '8px',
              transition: 'all 0.2s ease',
              borderRadius: '12px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f1f5f9';
              e.currentTarget.style.color = '#667eea';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#64748b';
            }}
          >
            <span style={{ fontSize: '24px', marginBottom: '4px' }}>✈️</span>
            <span>휴가</span>
          </a>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#3b82f6',
              fontSize: '12px',
              fontWeight: '700',
              minWidth: '60px',
              padding: '8px',
              backgroundColor: '#eff6ff',
              borderRadius: '12px',
              cursor: 'default'
            }}
          >
            <span style={{ fontSize: '24px', marginBottom: '4px' }}>🔒</span>
            <span>로그인</span>
          </div>
        </div>
      </nav>
    </div>
  );
}
