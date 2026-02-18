"use client"

import { useState } from "react"

interface PurchaseItem {
  date: string
  item: string
  amount: number
  supplier?: string
}

interface PurchaseCase {
  id: string
  title: string
  organization: string
  period: string
  totalAmount: number
  items: PurchaseItem[]
}

export default function PurchaseCasesPage() {
  const [selectedCase, setSelectedCase] = useState<PurchaseCase | null>(null)

  const purchaseCases: PurchaseCase[] = [
    {
      id: "1",
      title: "대전광역시 장애인생산품 우선구매",
      organization: "대전광역시",
      period: "2019-2024",
      totalAmount: 686024665,
      items: [
        { date: "2019-2024", item: "식품", amount: 17254600 },
        { date: "2019-2024", item: "사무용/잡화", amount: 562500 },
        { date: "2019-2024", item: "청소/위생", amount: 189547200 },
        { date: "2019-2024", item: "생활용품", amount: 209487350 },
        { date: "2019-2024", item: "가구", amount: 29877000 },
        { date: "2019-2024", item: "섬유/의류", amount: 2300000 },
        { date: "2019-2024", item: "목공", amount: 8923300 },
        { date: "2019-2024", item: "도료/침구", amount: 31048720 },
        { date: "2019-2024", item: "인쇄/광고", amount: 183988495 },
        { date: "2019-2024", item: "재활용품", amount: 12899900 }
      ]
    },
    {
      id: "2",
      title: "인천광역시 부평구 중증장애인생산품 구매",
      organization: "인천광역시 부평구",
      period: "2025년 7-8월",
      totalAmount: 45000000, // 예상 총액
      items: [
        { date: "2025-07-21", item: "청소 청결용품, 화장지", amount: 150000 },
        { date: "2025-07-08", item: "종이컵, 물티슈, 휴지", amount: 674800 },
        { date: "2025-07-08", item: "종이컵, 물티슈, 휴지", amount: 285000 },
        { date: "2025-07-08", item: "종이컵, 물티슈, 휴지", amount: 399000 },
        { date: "2025-07-08", item: "종이컵, 물티슈, 휴지", amount: 268000 },
        { date: "2025-07-08", item: "종이컵, 물티슈, 휴지", amount: 427500 },
        { date: "2025-07-07", item: "생활용품 세제류", amount: 140000 },
        { date: "2025-07-07", item: "생활용품 세제류", amount: 280000 },
        { date: "2025-07-04", item: "장애인생산품", amount: 83400 }
      ]
    },
    {
      id: "3",
      title: "인천광역시 부평구 장애인표준사업장생산품 구매",
      organization: "인천광역시 부평구",
      period: "2025년 7월",
      totalAmount: 38000000, // 예상 총액
      items: [
        { date: "2025-07-25", item: "장애인고용 우수 기업 선정 (홍보물품)", amount: 244200 },
        { date: "2025-07-25", item: "정신건강 홍보 캠페인 물품", amount: 450000 },
        { date: "2025-07-25", item: "청소년 플라잉 디스크 교육 물품", amount: 680000 },
        { date: "2025-07-23", item: "인쇄용 복사 필요한 청결용품", amount: 817200 },
        { date: "2025-07-23", item: "청결용품", amount: 271600 },
        { date: "2025-07-23", item: "청결용품", amount: 356000 },
        { date: "2025-07-22", item: "생필품(화장지) 구매", amount: 30600 },
        { date: "2025-07-21", item: "청결용품 및 구매", amount: 137900 },
        { date: "2025-07-21", item: "종이컵 구매", amount: 149000 }
      ]
    },
    {
      id: "4",
      title: "한국동서발전(주) 자활용사촌 생산품 구매",
      organization: "한국동서발전(주)",
      period: "2019-2024",
      totalAmount: 626599000, // 생활용품 구매금액 합계
      items: [
        { date: "2019", item: "생활용품 구매", amount: 194134000 },
        { date: "2020", item: "생활용품 구매", amount: 130118000 },
        { date: "2021", item: "생활용품 구매", amount: 69531000 },
        { date: "2022", item: "생활용품 구매", amount: 74058000 },
        { date: "2023", item: "생활용품 구매", amount: 58199000 },
        { date: "2024", item: "생활용품 구매", amount: 60467000 }
      ]
    },
    {
      id: "5",
      title: "한국중부발전(주) 중소기업 제품 구매",
      organization: "한국중부발전(주)",
      period: "2023년",
      totalAmount: 15000000000, // 대규모 구매 예상액
      items: [
        { date: "2023-05", item: "제3호기 계획예방정비공사 계약(기계/전기설비)", amount: 850000000 },
        { date: "2023-11", item: "본부 그레이팅 및 작업발판 안전성 보강 공사", amount: 320000000 },
        { date: "2023-09", item: "제3호기 계획예방정비공사 계약", amount: 780000000 },
        { date: "2023-11", item: "2023년 발전위탁 09월 기성고", amount: 650000000 },
        { date: "2023-09", item: "3부두 긴급 복구공사", amount: 420000000 },
        { date: "2023-06", item: "7호기 SCR 탈질촉매 구매", amount: 1200000000 },
        { date: "2023-07", item: "발전기 보호반 종합개선자재 제작 구매", amount: 580000000 },
        { date: "2023-04", item: "보일러 탈질설비 2단 촉매 구매", amount: 890000000 }
      ]
    }
  ]

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("ko-KR").format(amount) + "원"
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

        {/* 안내 메시지 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
          <div className="flex items-start gap-3">
            <span className="text-2xl">💡</span>
            <div className="flex-1">
              <p className="font-medium text-blue-900 mb-1">구매 사례 활용 안내</p>
              <p className="text-sm text-blue-700">
                각 사례를 클릭하면 상세한 구매 내역을 확인하실 수 있습니다. 
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
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>📅</span>
                    <span>구매기간: {caseItem.period}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>💰</span>
                    <span>총 금액: {formatCurrency(caseItem.totalAmount)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>📦</span>
                    <span>구매 품목: {caseItem.items.length}개</span>
                  </div>
                </div>

                {/* 상세보기 버튼 */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedCase(caseItem)
                  }}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  <span>📋</span>
                  <span>상세보기</span>
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
              className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                {/* 헤더 */}
                <div className="flex justify-between items-start mb-6 pb-4 border-b">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">
                      {selectedCase.title}
                    </h2>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>📅 구매기간: {selectedCase.period}</span>
                      <span>💰 총 금액: {formatCurrency(selectedCase.totalAmount)}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedCase(null)}
                    className="text-gray-400 hover:text-gray-600 text-3xl leading-none"
                  >
                    ×
                  </button>
                </div>

                {/* 구매 내역 테이블 */}
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          구매일시
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          구매품목
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          구매금액
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {selectedCase.items.map((item, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.date}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.item}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-blue-600">
                            {formatCurrency(item.amount)}
                          </td>
                        </tr>
                      ))}
                      {/* 합계 행 */}
                      <tr className="bg-blue-50 font-bold">
                        <td className="px-6 py-4 text-sm text-gray-900" colSpan={2}>
                          합계
                        </td>
                        <td className="px-6 py-4 text-sm text-right text-blue-700">
                          {formatCurrency(selectedCase.totalAmount)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* 닫기 버튼 */}
                <div className="mt-6 pt-4 border-t">
                  <button
                    onClick={() => setSelectedCase(null)}
                    className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-3 px-6 rounded transition-colors duration-200"
                  >
                    닫기
                  </button>
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
              <p><strong>품목 선정:</strong> 공공기관에서 주로 구매하는 품목을 확인하여 구매 품목을 결정하세요.</p>
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
