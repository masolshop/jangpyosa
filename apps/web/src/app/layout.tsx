import type { Metadata } from 'next'
import './globals.css'
import LayoutContent from '@/components/LayoutContent'

export const metadata: Metadata = {
  title: '장표사닷컴 - 고용부담금감면 | 장애인표준사업장 연계고용 플랫폼',
  description: '장표사닷컴은 장애인표준사업장 연계고용으로 고용부담금을 50~90% 감면하는 국내 최대 도급계약 플랫폼입니다. 고용부담금계산기, 고용장려금계산기, 연계감면계산기 무료 제공. 873개 장애인표준사업장과 도급계약으로 장애인 의무고용률 충족!',
  keywords: [
    '장표사닷컴',
    '고용부담금',
    '고용부담금감면',
    '장애인고용',
    '장애인표준사업장',
    '연계고용',
    '연계고용감면',
    '도급계약',
    '장애인의무고용',
    '고용장려금',
    '고용부담금계산기',
    '고용장려금계산기',
    '장애인고용관리',
    '장애인고용솔루션',
    '고용의무',
    '장애인채용',
    '표준사업장',
    '고용부담금절감',
    '연계고용부담금감면',
    '장애인고용률',
  ],
  authors: [{ name: '장표사닷컴' }],
  creator: '장표사닷컴',
  publisher: '장표사닷컴',
  metadataBase: new URL('https://jangpyosa.com'),
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: 'https://jangpyosa.com',
    title: '장표사닷컴 - 고용부담금감면 | 장애인표준사업장 연계고용',
    description: '장애인표준사업장 연계고용으로 고용부담금 50~90% 감면! 873개 표준사업장과 도급계약. 고용부담금계산기, 고용장려금계산기 무료 제공!',
    siteName: '장표사닷컴',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: '장표사닷컴 - 고용부담금감면 연계고용 플랫폼',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '장표사닷컴 - 고용부담금감면 플랫폼',
    description: '장애인표준사업장 연계고용으로 고용부담금 50~90% 감면!',
    images: ['/og-image.png'],
  },
  alternates: {
    canonical: "https://jangpyosa.com",
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
    google: 'r2LODMYtWCLqf4eRa7C5z244fwwPMwOw8g6_tFR9YxQ',
    other: {
      'naver-site-verification': '9a37d96c9da11a3a1734254efce3995399926375',
    },
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
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
        {/* 네이버 SEO 최적화 */}
        <meta name="NaverBot" content="All" />
        <meta name="NaverBot" content="index,follow" />
        <meta name="Yeti" content="All" />
        <meta name="Yeti" content="index,follow" />
      </head>
      <body>
        <LayoutContent>{children}</LayoutContent>
      </body>
    </html>
  )
}
