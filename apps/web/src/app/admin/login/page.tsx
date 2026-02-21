'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 전화번호에서 하이픈 제거
      const cleanPhone = phone.replace(/[-\s]/g, '');
      
      const response = await fetch('/api/proxy/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: cleanPhone, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '로그인에 실패했습니다');
      }

      // 슈퍼어드민 권한 확인
      if (data.user.role !== 'SUPER_ADMIN') {
        throw new Error('슈퍼어드민 권한이 없습니다');
      }

      // 로그인 정보 저장
      localStorage.setItem('token', data.accessToken);
      localStorage.setItem('role', data.user.role);
      localStorage.setItem('name', data.user.name);

      // 대시보드로 이동
      router.push('/admin/dashboard');
    } catch (err: any) {
      setError(err.message);
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
            🛡️ 슈퍼어드민 로그인
          </h1>
          <p style={{ color: '#666', fontSize: 14 }}>
            장표사닷컴 관리자 시스템
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
              전화번호
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="010-6352-9091 또는 01063529091"
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
            <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
              하이픈(-) 있어도 됩니다
            </div>
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
          <p style={{ fontSize: 14, color: '#666' }}>
            슈퍼어드민 계정으로만 접속 가능합니다
          </p>
        </div>
      </div>
    </div>
  );
}
