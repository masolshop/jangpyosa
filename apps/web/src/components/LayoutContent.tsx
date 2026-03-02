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
      <main style={{ marginLeft: 294, minHeight: '100vh' }}>
        {children}
      </main>
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
