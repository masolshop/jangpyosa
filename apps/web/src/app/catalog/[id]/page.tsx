"use client"

import { useRouter, useParams } from "next/navigation"
import Image from "next/image"

export default function ConsultingServiceDetailPage() {
  const router = useRouter()
  const params = useParams()
  const serviceId = params?.id as string

  // 렌탈 서비스인 경우 PDF 이미지 표시
  if (serviceId === "rental") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4 md:p-8">
        <div className="max-w-5xl mx-auto">
          {/* 헤더 */}
          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-5xl">📦</div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                    기업 물품 렌탈
                  </h1>
                  <p className="text-base md:text-lg text-gray-600 mt-1">
                    기업용 2만가지 상품 렌탈
                  </p>
                </div>
              </div>
              <button
                onClick={() => router.push('/catalog')}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-semibold transition-colors"
              >
                ← 목록
              </button>
            </div>
          </div>

          {/* PDF 이미지들 */}
          <div className="space-y-6">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((pageNum) => (
              <div 
                key={pageNum}
                className="bg-white rounded-xl shadow-lg overflow-hidden"
              >
                <Image
                  src={`/images/rental/page-${pageNum}.jpg`}
                  alt={`렌탈 서비스 안내 ${pageNum}페이지`}
                  width={1240}
                  height={1754}
                  className="w-full h-auto"
                  priority={pageNum <= 3}
                />
              </div>
            ))}
          </div>

          {/* 하단 버튼 */}
          <div className="mt-8 bg-white rounded-2xl shadow-xl p-6 md:p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
              관련 정보 더 알아보기
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => router.push('/employment-levy-obligation')}
                className="bg-blue-600 text-white px-6 py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                📋 장애인의무고용부담금
              </button>
              <button
                onClick={() => router.push('/linkage-levy-exemption-system')}
                className="bg-purple-600 text-white px-6 py-4 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
              >
                📉 연계고용부담금감면제도
              </button>
              <button
                onClick={() => router.push('/public-purchase-system')}
                className="bg-green-600 text-white px-6 py-4 rounded-lg font-semibold hover:bg-green-700 transition-colors"
              >
                🏛️ 공공기관우선구매제도
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // 기타 서비스는 준비중 페이지 표시
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
