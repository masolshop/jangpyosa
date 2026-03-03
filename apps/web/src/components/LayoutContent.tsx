'use client';

import { useSearchParams, usePathname } from 'next/navigation'
import { Suspense } from 'react'
import Sidebar from '@/components/Sidebar'

function LayoutContentInner({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const isEmbedded = searchParams.get('embed') === 'true'
  
  // 장애인직원 페이지에서는 기업용 사이드바 숨김
  const isEmployeePage = pathname?.startsWith('/employee')

  // 공개 정보 페이지들은 사이드바 바로 옆에 붙임 (marginLeft 제거)
  const isPublicInfoPage = [
    '/employment-obligation',
    '/employment-levy',
    '/linkage-levy-exemption',
    '/purchase-cases',
    '/priority-purchase',
    '/purchase-best-cases'
  ].some(path => pathname?.startsWith(path))

  if (isEmbedded || isEmployeePage) {
    return (
      <main style={{ minHeight: '100vh', padding: 0 }}>
        {children}
      </main>
    )
  }

  return (
    <>
      <Sidebar />
      {isPublicInfoPage ? (
        <main style={{ minHeight: '100vh', marginLeft: 0 }}>
          {children}
        </main>
      ) : (
        <main className="lg:ml-[330px] ml-0 min-h-screen">
          {children}
        </main>
      )}
    </>
  )
}

export default function LayoutContent({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={
      <main style={{ minHeight: '100vh' }}>
        {children}
      </main>
    }>
      <LayoutContentInner>{children}</LayoutContentInner>
    </Suspense>
  )
}
