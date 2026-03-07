"use client"

import { useState } from "react"

interface ConsultingService {
  id: string
  title: string
  icon: string
  description: string
  color: string
}

export default function ConsultingCatalogPage() {
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  const services: ConsultingService[] = [
    {
      id: "health-keeper",
      title: "헬스키퍼 기업 파견",
      icon: "💪",
      description: "직원 건강관리 전문가 파견",
      color: "blue"
    },
    {
      id: "health-voucher",
      title: "헬스바우처 상품권",
      icon: "🎫",
      description: "직원 복지 건강관리 상품권",
      color: "green"
    },
    {
      id: "rental",
      title: "기업 물품 렌탈",
      icon: "📦",
      description: "사무용품 및 장비 렌탈",
      color: "purple"
    },
    {
      id: "book-publishing",
      title: "CEO 단체장 도서 발간",
      icon: "📚",
      description: "CEO 브랜딩 도서 출판",
      color: "indigo"
    },
    {
      id: "marketing-consulting",
      title: "기업 마케팅 컨설팅",
      icon: "💡",
      description: "통합 마케팅 전략 수립",
      color: "orange"
    },
    {
      id: "marketing-operation",
      title: "기업 마케팅 운영 대행",
      icon: "🎯",
      description: "마케팅 실행 및 운영 대행",
      color: "red"
    },
    {
      id: "ad-channel",
      title: "광고 채널 운영 대행",
      icon: "📢",
      description: "온라인 광고 채널 관리",
      color: "pink"
    },
    {
      id: "youtube",
      title: "유튜브 영상 운영 대행",
      icon: "▶️",
      description: "유튜브 콘텐츠 제작 및 관리",
      color: "red"
    },
    {
      id: "website",
      title: "홈페이지 · 블로그 제작",
      icon: "💻",
      description: "웹사이트 및 블로그 제작",
      color: "cyan"
    },
    {
      id: "print",
      title: "인쇄물 및 전단지 제작",
      icon: "📄",
      description: "오프라인 마케팅 인쇄물",
      color: "teal"
    },
    {
      id: "hospital",
      title: "병원 마케팅",
      icon: "🏥",
      description: "의료기관 전문 마케팅",
      color: "emerald"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="text-center mb-10">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
            연계고용부담금감면 및 공공 우선구매
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              기업맞춤 컨설팅
            </span>
          </h1>
          <div className="mt-4 max-w-3xl mx-auto">
            <p className="text-base md:text-lg font-semibold text-gray-700 mb-2">
              부담금 감면과 우선구매를 넘어 기업 브랜드 및 마케팅 성장
            </p>
            <p className="text-sm md:text-base text-gray-600">
              장애인 고용 확대와 ESG 경영까지 실현하는 기업 맞춤형 연계고용 컨설팅 플랫폼
            </p>
          </div>
        </div>

        {/* 설명 섹션 */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-10 border border-blue-100">
          <div className="flex items-center gap-2 mb-4">
            <div className="text-3xl">🎯</div>
            <h2 className="text-xl font-bold text-gray-800">서비스 개요</h2>
          </div>
          <p className="text-gray-700 leading-relaxed text-base md:text-lg">
            매몰자금인 <strong className="text-blue-600">장애인 고용 부담금</strong> 및 
            <strong className="text-purple-600"> 공공기관 우선구매 의무자금</strong>으로 
            기업 직원 복지를 실현하고, 기업 성장에 필요한 마케팅 전문서비스로 
            기업의 <strong className="text-green-600">ESG 지수</strong>와 
            <strong className="text-orange-600"> 장애인 고용창출</strong>로 
            사회적 가치를 높이는 기업 맞춤형 통합 컨설팅 서비스를 제공합니다.
          </p>
        </div>

        {/* 컨설팅 서비스 카드 그리드 */}
        <div className="mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-800 mb-8">
            맞춤형 컨설팅 서비스
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <div
                key={service.id}
                onMouseEnter={() => setHoveredId(service.id)}
                onMouseLeave={() => setHoveredId(null)}
                className={`
                  relative bg-white rounded-xl shadow-lg p-6 
                  transform transition-all duration-300 cursor-pointer
                  hover:scale-105 hover:shadow-2xl
                  border-2 ${hoveredId === service.id ? `border-${service.color}-400` : 'border-gray-100'}
                `}
              >
                {/* 준비중 배지 */}
                <div className="absolute top-4 right-4">
                  <span className="bg-yellow-100 text-yellow-800 text-sm font-semibold px-3 py-1 rounded-full border border-yellow-300">
                    준비중
                  </span>
                </div>

                {/* 아이콘 */}
                <div className="text-5xl mb-4 text-center">
                  {service.icon}
                </div>

                {/* 제목 */}
                <h3 className="text-lg md:text-xl font-bold text-gray-900 text-center mb-3">
                  {service.title}
                </h3>

                {/* 설명 */}
                <p className="text-base text-gray-600 text-center mb-4">
                  {service.description}
                </p>

                {/* 버튼 */}
                <button
                  className={`
                    w-full py-3 rounded-lg font-semibold
                    transition-all duration-300
                    bg-gradient-to-r from-${service.color}-500 to-${service.color}-600
                    text-white
                    hover:from-${service.color}-600 hover:to-${service.color}-700
                    transform hover:translate-y-[-2px]
                    shadow-md hover:shadow-lg
                    disabled:opacity-50 disabled:cursor-not-allowed
                  `}
                  disabled
                >
                  상세보기
                </button>

                {/* 호버 효과 */}
                {hoveredId === service.id && (
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent to-blue-50 opacity-20 rounded-xl pointer-events-none"></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 준비중 안내 */}
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl shadow-lg p-8 border-2 border-yellow-200">
          <div className="text-center">
            <div className="text-4xl mb-4">🚧</div>
            <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-4">
              맞춤형 컨설팅 서비스 준비 중
            </h3>
            <p className="text-base text-gray-700 leading-relaxed mb-6">
              현재 각 분야별 전문 컨설팅 서비스를 준비하고 있습니다.
              <br />
              보다 나은 서비스로 찾아뵙겠습니다.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/employment-levy-obligation"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg text-base font-semibold hover:bg-blue-700 transition-colors"
              >
                📋 장애인의무고용부담금 알아보기
              </a>
              <a
                href="/linkage-levy-exemption-system"
                className="bg-purple-600 text-white px-6 py-3 rounded-lg text-base font-semibold hover:bg-purple-700 transition-colors"
              >
                📉 연계고용부담금감면제도 알아보기
              </a>
              <a
                href="/public-purchase-system"
                className="bg-green-600 text-white px-6 py-3 rounded-lg text-base font-semibold hover:bg-green-700 transition-colors"
              >
                🏛️ 공공기관우선구매제도 알아보기
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
