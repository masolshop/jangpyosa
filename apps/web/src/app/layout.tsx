import type { Metadata } from 'next'
import './globals.css'
import LayoutContent from '@/components/LayoutContent'

export const metadata: Metadata = {
  title: '장표사닷컴 - 국내유일 장애인고용관리솔루션',
  description: '연계고용감면플랫폼 및 장애인고용관리솔루션. 장애인표준사업장 연계 고용으로 고용부담금 50~90% 감면! 장애인고용 관리 담당자를 위한 장애인 고용관리 솔루션 무료 제공! 장애인고용관리 담당자님 체험용 계정으로 체험후 사용하세요.',
  keywords: [
    '장애인고용',
    '고용부담금',
    '장애인표준사업장',
    '연계고용',
    '고용부담금감면',
    '장애인고용관리',
    '장애인고용솔루션',
    '고용의무',
    '장애인채용',
    '표준사업장',
  ],
  authors: [{ name: '장표사닷컴' }],
  creator: '장표사닷컴',
  publisher: '장표사닷컴',
  metadataBase: new URL('https://jangpyosa.com'),
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: 'https://jangpyosa.com',
    title: '장표사닷컴 - 국내유일 장애인고용관리솔루션',
    description: '장애인표준사업장 연계 고용으로 고용부담금 50~90% 감면! 장애인고용 관리 담당자를 위한 무료 체험 제공',
    siteName: '장표사닷컴',
    images: [
      {
        url: '/og-image.png',
        width: 800,
        height: 450,
        alt: '장표사닷컴 - 연계고용감면플랫폼 및 장애인고용관리솔루션',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '장표사닷컴 - 국내유일 장애인고용관리솔루션',
    description: '장애인표준사업장 연계 고용으로 고용부담금 50~90% 감면!',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'google-site-verification-code', // 구글 서치 콘솔에서 받은 코드로 교체
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/logo.png" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="theme-color" content="#3b82f6" />
      </head>
      <body>
        <LayoutContent>{children}</LayoutContent>
      </body>
    </html>
  )
}
