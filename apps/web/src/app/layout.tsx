import './globals.css'
import Sidebar from '@/components/Sidebar'

export const metadata = {
  title: '장표사닷컴 - 장애인표준사업장 연계고용 플랫폼',
  description: '장애인 미고용 부담금 절감을 위한 연계고용 도급계약 플랫폼',
}

// 🔥 Build ID 강제 변경용 더미 변수 (2026-02-18 11:48)
const BUILD_TIMESTAMP = '2026-02-18T11:48:00Z';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body>
        <Sidebar />
        <main style={{ marginLeft: 350, minHeight: '100vh' }}>
          {children}
        </main>
      </body>
    </html>
  )
}
