// 🔥 동적 렌더링 강제 - Next.js 정적 페이지 캐싱 방지
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
