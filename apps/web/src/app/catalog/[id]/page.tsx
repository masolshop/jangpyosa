"use client"

import { useRouter } from "next/navigation"

export default function ConsultingServiceDetailPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8 md:p-12 text-center">
        {/* 아이콘 */}
        <div className="text-8xl mb-6">🚧</div>

        {/* 제목 */}
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          서비스 준비 중입니다
        </h1>

        {/* 설명 */}
        <p className="text-lg text-gray-600 mb-8 leading-relaxed">
          현재 맞춤형 컨설팅 서비스를 준비하고 있습니다.
          <br />
          보다 나은 서비스로 찾아뵙겠습니다.
        </p>

        {/* 버튼 그룹 */}
        <div className="space-y-4">
          <button
            onClick={() => router.push('/catalog')}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg"
          >
            🏠 컨설팅 메인으로 돌아가기
          </button>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <button
              onClick={() => router.push('/employment-levy-obligation')}
              className="bg-blue-100 text-blue-700 px-4 py-3 rounded-lg font-semibold hover:bg-blue-200 transition-colors text-sm"
            >
              📋 고용부담금
            </button>
            <button
              onClick={() => router.push('/linkage-levy-exemption-system')}
              className="bg-purple-100 text-purple-700 px-4 py-3 rounded-lg font-semibold hover:bg-purple-200 transition-colors text-sm"
            >
              📉 연계고용감면
            </button>
            <button
              onClick={() => router.push('/public-purchase-system')}
              className="bg-green-100 text-green-700 px-4 py-3 rounded-lg font-semibold hover:bg-green-200 transition-colors text-sm"
            >
              🏛️ 우선구매
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
