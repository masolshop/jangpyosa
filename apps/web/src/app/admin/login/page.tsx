'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { setToken, setUserRole } from '@/lib/auth';

export default function AdminLogin() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState(''); // username 또는 전화번호
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    console.log('[Admin Login] 시작:', { identifier, passwordLength: password.length });

    try {
      // 전화번호/아이디에서 하이픈 제거
      const cleanIdentifier = identifier.replace(/[-\s]/g, '');
      console.log('[Admin Login] Clean identifier:', cleanIdentifier);
      
      const data = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ identifier: cleanIdentifier, password }),
      });

      console.log('[Admin Login] 응답 받음:', { role: data.user?.role, name: data.user?.name });

      // 슈퍼어드민 권한 확인
      if (data.user.role !== 'SUPER_ADMIN') {
        throw new Error('슈퍼어드민 권한이 없습니다');
      }

      // 로그인 정보 저장
      console.log('[Admin Login] 토큰 저장 중...');
      setToken(data.accessToken);
      setUserRole(data.user.role);
      localStorage.setItem('user', JSON.stringify(data.user));

      console.log('[Admin Login] 리다이렉션 시작...');
      setError('✅ 로그인 성공! 리다이렉션 중...');
      
      // window.location으로 강제 리다이렉션
      setTimeout(() => {
        console.log('[Admin Login] 리다이렉션 실행!');
        window.location.href = '/admin/sales';
      }, 1000);
    } catch (err: any) {
      console.error('[Admin Login] 에러:', err);
      setError(err.message || err.toString() || '로그인에 실패했습니다');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f5f5f5',
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: 40,
        borderRadius: 8,
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: 400,
      }}>
        <div style={{ textAlign: 'center', marginBottom: 30 }}>
          <h1 style={{ fontSize: 28, color: '#1a237e', marginBottom: 8 }}>
            🛡️ 로그인
          </h1>
          <p style={{ color: '#666', fontSize: 14 }}>
            장표사닷컴 관리 시스템
          </p>
        </div>

        {error && (
          <div style={{
            padding: 15,
            backgroundColor: '#ffebee',
            color: '#c62828',
            borderRadius: 4,
            marginBottom: 20,
            fontSize: 14,
          }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 20 }}>
            <label style={{
              display: 'block',
              marginBottom: 8,
              fontWeight: 'bold',
              color: '#333',
            }}>
              아이디
            </label>
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="아이디 입력"
              required
              style={{
                width: '100%',
                padding: 12,
                border: '1px solid #ddd',
                borderRadius: 4,
                fontSize: 16,
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ marginBottom: 30 }}>
            <label style={{
              display: 'block',
              marginBottom: 8,
              fontWeight: 'bold',
              color: '#333',
            }}>
              비밀번호
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호 입력"
              required
              style={{
                width: '100%',
                padding: 12,
                border: '1px solid #ddd',
                borderRadius: 4,
                fontSize: 16,
                boxSizing: 'border-box',
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: 15,
              backgroundColor: loading ? '#ccc' : '#1a237e',
              color: 'white',
              border: 'none',
              borderRadius: 4,
              fontSize: 16,
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </form>

        <div style={{
          marginTop: 30,
          paddingTop: 20,
          borderTop: '1px solid #e0e0e0',
          textAlign: 'center',
        }}>
          <p style={{ fontSize: 14, color: '#666', marginBottom: 12 }}>
            매니저 계정이 필요하신가요?{' '}
            <a href="/admin/sales" style={{ color: '#1a237e', fontWeight: 600, textDecoration: 'underline' }}>
              매니저 가입하기
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
