import './globals.css'

export const metadata = {
  title: '장표사닷컴 - 장애인표준사업장 연계고용 플랫폼',
  description: '장애인 미고용 부담금 절감을 위한 연계고용 도급계약 플랫폼',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  )
}
