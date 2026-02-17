'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import styles from './SupplierProfile.module.css'

interface Registry {
  certNo?: string
  name: string
  bizNo: string
  region?: string
  representative?: string
  industry?: string
  address?: string
  certDate?: string
  companyType?: string
}

interface SupplierProfile {
  id: string
  approved: boolean
  region?: string
  industry?: string
  contactTel?: string
  registry?: Registry
  company: {
    name: string
    bizNo: string
    representative?: string
    isVerified: boolean
  }
}

export default function SupplierProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<SupplierProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('accessToken')
      if (!token) {
        router.push('/login')
        return
      }

      const res = await fetch('/api/proxy/supplier/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!res.ok) {
        throw new Error('프로필 조회 실패')
      }

      const data = await res.json()
      setProfile(data.profile)
    } catch (err: any) {
      setError(err.message || '프로필 조회 중 오류가 발생했습니다')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>로딩 중...</div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>{error || '프로필을 찾을 수 없습니다'}</div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>🏢 공급사 프로필 관리</h1>
        {!profile.approved && (
          <div className={styles.warning}>
            ⚠️ 프로필 승인 대기 중입니다
          </div>
        )}
      </div>

      {/* 기본 정보 (전화번호 제외) */}
      <section className={styles.section}>
        <h2>기본 정보</h2>
        
        <div className={styles.infoGrid}>
          <div className={styles.infoItem}>
            <label>지역</label>
            <div className={styles.infoValue}>
              {profile.registry?.region || profile.region || '-'}
            </div>
          </div>

          <div className={styles.infoItem}>
            <label>업종</label>
            <div className={styles.infoValue}>
              {profile.registry?.industry || profile.industry || '-'}
            </div>
          </div>

          <div className={styles.infoItem}>
            <label>담당자명</label>
            <div className={styles.infoValue}>
              {profile.company?.representative || profile.registry?.representative || '-'}
            </div>
          </div>
        </div>
      </section>

      {/* 레지스트리 정보 (엑셀 데이터) */}
      {profile.registry && (
        <section className={styles.section}>
          <h2>📋 표준사업장 인증 정보</h2>
          
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <label>인증번호</label>
              <div className={styles.infoValue}>
                {profile.registry.certNo || '-'}
              </div>
            </div>

            <div className={styles.infoItem}>
              <label>사업체명</label>
              <div className={styles.infoValue}>
                {profile.registry.name}
              </div>
            </div>

            <div className={styles.infoItem}>
              <label>사업자등록번호</label>
              <div className={styles.infoValue}>
                {profile.registry.bizNo}
              </div>
            </div>

            <div className={styles.infoItem}>
              <label>인증일자</label>
              <div className={styles.infoValue}>
                {profile.registry.certDate || '-'}
              </div>
            </div>

            <div className={styles.infoItem}>
              <label>관할지사/소재지</label>
              <div className={styles.infoValue}>
                {profile.registry.region || '-'}
              </div>
            </div>

            <div className={styles.infoItem}>
              <label>대표자</label>
              <div className={styles.infoValue}>
                {profile.registry.representative || '-'}
              </div>
            </div>

            <div className={styles.infoItem}>
              <label>업종 및 주요생산품</label>
              <div className={styles.infoValue}>
                {profile.registry.industry || '-'}
              </div>
            </div>

            <div className={styles.infoItem}>
              <label>구분</label>
              <div className={styles.infoValue}>
                {profile.registry.companyType || '-'}
              </div>
            </div>

            <div className={`${styles.infoItem} ${styles.fullWidth}`}>
              <label>소재지</label>
              <div className={styles.infoValue}>
                {profile.registry.address || '-'}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 회사 정보 */}
      <section className={styles.section}>
        <h2>🏭 회사 정보</h2>
        
        <div className={styles.infoGrid}>
          <div className={styles.infoItem}>
            <label>회사명</label>
            <div className={styles.infoValue}>
              {profile.company.name}
            </div>
          </div>

          <div className={styles.infoItem}>
            <label>사업자번호</label>
            <div className={styles.infoValue}>
              {profile.company.bizNo}
            </div>
          </div>

          <div className={styles.infoItem}>
            <label>대표자</label>
            <div className={styles.infoValue}>
              {profile.company.representative || '-'}
            </div>
          </div>

          <div className={styles.infoItem}>
            <label>인증상태</label>
            <div className={styles.infoValue}>
              {profile.company.isVerified ? (
                <span className={styles.badge}>✅ 인증완료</span>
              ) : (
                <span className={styles.badgeWarning}>⏳ 미인증</span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 액션 버튼 */}
      <div className={styles.actions}>
        <button
          onClick={() => router.push('/products/register')}
          className={styles.primaryBtn}
          disabled={!profile.approved}
        >
          상품 등록
        </button>
        <button
          onClick={() => router.push('/products/my/list')}
          className={styles.secondaryBtn}
        >
          내 상품 관리
        </button>
      </div>
    </div>
  )
}
