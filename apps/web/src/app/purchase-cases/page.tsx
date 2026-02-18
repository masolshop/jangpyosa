"use client"

import { useState } from "react"

interface PurchaseCase {
  id: string
  title: string
  organization: string
  date: string
  description: string
  csvFile: string
  imageUrl: string
  stats?: {
    totalAmount?: string
    itemCount?: string
    year?: string
  }
}

export default function PurchaseCasesPage() {
  const [selectedCase, setSelectedCase] = useState<PurchaseCase | null>(null)

  const purchaseCases: PurchaseCase[] = [
    {
      id: "1",
      title: "대전광역시 장애인생산품 우선구매",
      organization: "대전광역시",
      date: "2021년 12월 31일",
      description: "대전광역시의 장애인생산품 우선구매 현황입니다. 품목별 구매 금액과 실적을 확인하실 수 있습니다.",
      csvFile: "/purchase-cases/대전광역시_장애인생산품 우선구매 현황_20211231.csv",
      imageUrl: "https://www.genspark.ai/api/files/s/CmCTEemu",
      stats: {
        totalAmount: "686,024,665원",
        itemCount: "10개 품목",
        year: "2019-2024"
      }
    },
    {
      id: "2",
      title: "인천광역시 부평구 중증장애인생산품 구매",
      organization: "인천광역시 부평구",
      date: "2025년 8월 22일",
      description: "인천광역시 부평구의 중증장애인생산품 구매 세부내역입니다. 구매일자, 판매업체, 구매금액 등을 확인할 수 있습니다.",
      csvFile: "/purchase-cases/인천광역시 부평구_중증장애인생산품 구매 세부내역_20250822.csv",
      imageUrl: "https://www.genspark.ai/api/files/s/J7zCiZUi",
      stats: {
        totalAmount: "상세내역 참조",
        itemCount: "다수 구매건",
        year: "2025"
      }
    },
    {
      id: "3",
      title: "인천광역시 부평구 장애인표준사업장생산품 구매",
      organization: "인천광역시 부평구",
      date: "2025년 7월 31일",
      description: "인천광역시 부평구의 장애인표준사업장생산품 구매 세부내역입니다. 세부 구매 내역과 공급업체 정보를 제공합니다.",
      csvFile: "/purchase-cases/인천광역시 부평구_장애인표준사업장생산품 구매 세부내역_20250731.csv",
      imageUrl: "https://www.genspark.ai/api/files/s/IHuYdzP2",
      stats: {
        totalAmount: "상세내역 참조",
        itemCount: "다수 구매건",
        year: "2025"
      }
    },
    {
      id: "4",
      title: "한국동서발전(주) 자활용사촌 생산품 구매",
      organization: "한국동서발전(주)",
      date: "2024년 12월 31일",
      description: "한국동서발전(주)의 자활용사촌 생산품 구매 현황 정보입니다.",
      csvFile: "/purchase-cases/한국동서발전(주)_자활용사촌 생산품 구매 현황 정보_20241231.csv",
      imageUrl: "https://www.genspark.ai/api/files/s/RT0fJ2V7",
      stats: {
        totalAmount: "상세내역 참조",
        itemCount: "자활용사촌 생산품",
        year: "2024"
      }
    },
    {
      id: "5",
      title: "한국중부발전(주) 중소기업 제품 구매",
      organization: "한국중부발전(주)",
      date: "2023년 12월 31일",
      description: "한국중부발전(주)의 중소기업 제품 구매 실적입니다. 중소기업 지원을 위한 구매 내역을 확인할 수 있습니다.",
      csvFile: "/purchase-cases/한국중부발전(주)_중소기업 제품 구매 실적_20231231.csv",
      imageUrl: "https://www.genspark.ai/api/files/s/JnjbVK8I",
      stats: {
        totalAmount: "대규모 구매",
        itemCount: "1,000+ 건",
        year: "2023"
      }
    }
  ]

  const handleDownload = (csvFile: string, title: string) => {
    const link = document.createElement("a")
    link.href = csvFile
    link.download = title + ".csv"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-3">
            📦 장애인표준사업장생산품 구매 사례
          </h1>
          <p className="text-lg text-gray-600">
            공공기관 및 지자체의 장애인표준사업장생산품 구매 사례를 확인하세요
          </p>
        </div>

        {/* 통계 요약 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
            <p className="text-sm text-gray-600 mb-1">전체 사례</p>
            <p className="text-3xl font-bold text-blue-600">{purchaseCases.length}건</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
            <p className="text-sm text-gray-600 mb-1">공공기관</p>
            <p className="text-3xl font-bold text-green-600">5개</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
            <p className="text-sm text-gray-600 mb-1">데이터 기간</p>
            <p className="text-3xl font-bold text-purple-600">2021-2025</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-orange-500">
            <p className="text-sm text-gray-600 mb-1">Excel 다운로드</p>
            <p className="text-3xl font-bold text-orange-600">가능</p>
          </div>
        </div>

        {/* 안내 메시지 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
          <div className="flex items-start gap-3">
            <span className="text-2xl">💡</span>
            <div className="flex-1">
              <p className="font-medium text-blue-900 mb-1">구매 사례 활용 안내</p>
              <p className="text-sm text-blue-700">
                각 사례의 Excel 파일을 다운로드하여 상세한 구매 내역을 확인하실 수 있습니다. 
                공공기관 및 지자체의 실제 구매 사례를 참고하여 귀사의 장애인표준사업장생산품 구매 계획 수립에 활용하세요.
              </p>
            </div>
          </div>
        </div>

        {/* 구매 사례 카드 그리드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {purchaseCases.map((caseItem) => (
            <div
              key={caseItem.id}
              className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer"
              onClick={() => setSelectedCase(caseItem)}
            >
              {/* 이미지 영역 */}
              <div className="relative h-48 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <div className="text-white text-center p-4">
                  <div className="text-5xl mb-2">📊</div>
                  <p className="text-lg font-bold">{caseItem.organization}</p>
                </div>
              </div>

              {/* 내용 영역 */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2">
                  {caseItem.title}
                </h3>
                
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                  <span>📅</span>
                  <span>{caseItem.date}</span>
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {caseItem.description}
                </p>

                {/* 통계 */}
                {caseItem.stats && (
                  <div className="grid grid-cols-3 gap-2 mb-4 p-3 bg-gray-50 rounded">
                    <div className="text-center">
                      <p className="text-xs text-gray-500">기간</p>
                      <p className="text-sm font-bold text-gray-800">{caseItem.stats.year}</p>
                    </div>
                    <div className="text-center border-l border-r border-gray-200">
                      <p className="text-xs text-gray-500">구매건수</p>
                      <p className="text-sm font-bold text-gray-800">{caseItem.stats.itemCount}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500">금액</p>
                      <p className="text-sm font-bold text-green-600">{caseItem.stats.totalAmount}</p>
                    </div>
                  </div>
                )}

                {/* 다운로드 버튼 */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDownload(caseItem.csvFile, caseItem.title)
                  }}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  <span>📥</span>
                  <span>Excel 다운로드</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* 상세 모달 */}
        {selectedCase && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedCase(null)}
          >
            <div
              className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-2xl font-bold text-gray-800 flex-1 pr-4">
                    {selectedCase.title}
                  </h2>
                  <button
                    onClick={() => setSelectedCase(null)}
                    className="text-gray-400 hover:text-gray-600 text-2xl"
                  >
                    ×
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">기관명</p>
                    <p className="text-lg font-medium text-gray-800">{selectedCase.organization}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500 mb-1">기준일</p>
                    <p className="text-lg font-medium text-gray-800">{selectedCase.date}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500 mb-1">설명</p>
                    <p className="text-gray-700">{selectedCase.description}</p>
                  </div>

                  {selectedCase.stats && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm font-medium text-gray-700 mb-3">통계 정보</p>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <p className="text-xs text-gray-500">기간</p>
                          <p className="text-lg font-bold text-gray-800">{selectedCase.stats.year}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">구매건수</p>
                          <p className="text-lg font-bold text-gray-800">{selectedCase.stats.itemCount}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">총 금액</p>
                          <p className="text-lg font-bold text-green-600">{selectedCase.stats.totalAmount}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => handleDownload(selectedCase.csvFile, selectedCase.title)}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded transition-colors duration-200 flex items-center justify-center gap-2"
                    >
                      <span>📥</span>
                      <span>Excel 다운로드</span>
                    </button>
                    <button
                      onClick={() => setSelectedCase(null)}
                      className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-3 px-6 rounded transition-colors duration-200"
                    >
                      닫기
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 추가 정보 */}
        <div className="mt-12 bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">📌 구매 사례 데이터 활용 방법</h2>
          <div className="space-y-3 text-gray-700">
            <div className="flex gap-3">
              <span className="text-blue-600 font-bold">1.</span>
              <p><strong>구매 계획 수립:</strong> 다른 기관의 구매 품목과 금액을 참고하여 귀사의 구매 계획을 수립하세요.</p>
            </div>
            <div className="flex gap-3">
              <span className="text-blue-600 font-bold">2.</span>
              <p><strong>예산 책정:</strong> 실제 구매 사례의 금액 정보를 활용하여 예산을 합리적으로 책정할 수 있습니다.</p>
            </div>
            <div className="flex gap-3">
              <span className="text-blue-600 font-bold">3.</span>
              <p><strong>공급업체 발굴:</strong> Excel 파일에 포함된 공급업체 정보를 통해 신뢰할 수 있는 업체를 찾으세요.</p>
            </div>
            <div className="flex gap-3">
              <span className="text-blue-600 font-bold">4.</span>
              <p><strong>실적 보고:</strong> 공공기관의 우선구매 실적 작성 시 참고 자료로 활용하세요.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
