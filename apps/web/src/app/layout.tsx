'use client';

import './globals.css'
import Sidebar from '@/components/Sidebar'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function LayoutContent({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams()
  const isEmbedded = searchParams.get('embed') === 'true'

  if (isEmbedded) {
    return (
      <main style={{ minHeight: '100vh', padding: 0 }}>
        {children}
      </main>
    )
  }

  return (
    <>
      <Sidebar />
      <main style={{ marginLeft: 350, minHeight: '100vh' }}>
        {children}
      </main>
    </>
  )
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body>
        <Suspense fallback={
          <main style={{ minHeight: '100vh' }}>
            {children}
          </main>
        }>
          <LayoutContent>{children}</LayoutContent>
        </Suspense>
      </body>
    </html>
  )
}
