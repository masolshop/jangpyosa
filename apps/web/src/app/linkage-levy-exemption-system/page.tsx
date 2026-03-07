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

export default function LinkageLevyExemptionSystemPage() {
  const [expandedId, setExpandedId] = useState<string | null>(null)

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
      totalAmount: 45000000,
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
      totalAmount: 38000000,
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
      totalAmount: 626599000,
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
      totalAmount: 15000000000,
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

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
            연계고용 부담금 감면제도
          </h1>
          <p className="text-sm md:text-base text-gray-600">
            장애인표준사업장과의 도급계약을 통한 고용부담금 감면 안내 및 구매 사례
          </p>
        </div>

        {/* 제도 개요 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-3xl">📉</span>
            연계고용 부담금 감면제도란?
          </h2>
          <div className="space-y-4 text-gray-700">
            <p className="leading-relaxed text-base">
              <strong className="text-blue-600">연계고용 부담금 감면제도</strong>는 부담금 납부 의무가 있는 
              사업주(기관의 장)가 <strong>연계고용 대상 사업장</strong>(장애인 직업재활시설 또는 장애인표준사업장)에 
              도급을 주어 그 생산품을 납품받는 경우, 연계고용 대상 사업장에서 종사한 장애인근로자를 
              부담금 납부 의무 사업주가 고용한 것으로 간주하여 <strong className="text-green-600">부담금을 감면</strong>하는 제도입니다.
            </p>
            <div className="p-4 bg-blue-50 border-l-4 border-blue-500">
              <p className="text-sm text-blue-800">
                <strong>📋 법적 근거:</strong> 「장애인고용촉진 및 직업재활법」 제33조 제4항 및 제11항
              </p>
            </div>
          </div>
        </div>

        {/* 감면 혜택 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-3xl">💰</span>
            감면 혜택
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border-2 border-green-200">
              <h3 className="text-xl font-semibold text-green-900 mb-3">최대 감면율</h3>
              <p className="text-5xl font-bold text-green-600 mb-3">50~90%</p>
              <p className="text-sm text-green-800 leading-relaxed">
                장애인 근로자 1인당 고용부담금의 <strong>50%에서 최대 90%</strong>까지 감면 가능
              </p>
            </div>
            <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border-2 border-blue-200">
              <h3 className="text-xl font-semibold text-blue-900 mb-3">실질 절감 효과</h3>
              <div className="space-y-2 text-sm text-blue-800">
                <p className="flex items-center gap-2">
                  <span className="text-blue-600 font-bold">✓</span>
                  <span>월 부담금 1,404,900원 → 약 140,490원~702,450원</span>
                </p>
                <p className="flex items-center gap-2">
                  <span className="text-blue-600 font-bold">✓</span>
                  <span>연간 최대 약 843만원~1,518만원 절감 (1인당)</span>
                </p>
                <p className="flex items-center gap-2">
                  <span className="text-blue-600 font-bold">✓</span>
                  <span className="font-semibold text-blue-900">부담금 자체 감면으로 실질 절세</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 신청 주체 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-3xl">👥</span>
            연계고용 부담금 감면 신청 주체
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-5 bg-purple-50 border-l-4 border-purple-500 rounded-r-lg">
              <h3 className="text-lg font-bold text-purple-900 mb-3">
                부담금 납부의무 기관의 장
              </h3>
              <div className="space-y-2 text-sm text-purple-800">
                <p className="font-semibold">국가·지자체·교육청</p>
                <p className="text-xs leading-relaxed">
                  「장애인고용촉진 및 직업재활법」제32조의2제1항 및 제79조에 해당하는 기관의 장
                </p>
              </div>
            </div>
            <div className="p-5 bg-indigo-50 border-l-4 border-indigo-500 rounded-r-lg">
              <h3 className="text-lg font-bold text-indigo-900 mb-3">
                부담금 납부의무 사업주
              </h3>
              <div className="space-y-2 text-sm text-indigo-800">
                <p className="font-semibold">민간기업·공공기관</p>
                <p className="text-xs leading-relaxed">
                  「장애인고용촉진 및 직업재활법」제33조제1항에 해당하는 사업주
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 신청 절차 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-3xl">📋</span>
            신청 절차
          </h2>
          <div className="space-y-5">
            {/* Step 1 */}
            <div className="flex items-start gap-4 p-5 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border-l-4 border-blue-500">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                1
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 mb-2 text-lg">연계고용 계약 체결</h3>
                <div className="space-y-2 text-sm text-gray-700">
                  <p className="font-semibold text-blue-900">✓ 연계고용 도급계약서 작성</p>
                  <ul className="ml-4 space-y-1 text-xs">
                    <li>• 도급내용(규격, 수량, 공정 등) 및 일의 완성시기 포함</li>
                    <li>• 계약이행에 따른 금액과 재료비·노무비 등이 포함된 산출내역 포함</li>
                    <li>• <strong className="text-red-600">계약기간 1년 이상</strong> (국가·지자체·교육청의 경우 3개월 이상)</li>
                    <li className="text-red-600">• ⚠️ 연계고용 대상 사업장이 다른 사업장과 하도급 계약을 하여 이행한 경우 감면 대상 제외</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex items-start gap-4 p-5 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border-l-4 border-green-500">
              <div className="flex-shrink-0 w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                2
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 mb-2 text-lg">발주 및 납품 (용역 포함)</h3>
                <div className="space-y-2 text-sm text-gray-700">
                  <ul className="ml-4 space-y-1 text-xs">
                    <li>• 계약된 품목을 발주·납품</li>
                    <li>• 계약서에 명시된 정산 일정에 따라 납품 내역 정산</li>
                    <li>• 세부거래 내역, 거래명세서·세금계산서 등 발행</li>
                    <li>• 계약서에 명시된 지급 일정에 따라 지급</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex items-start gap-4 p-5 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg border-l-4 border-purple-500">
              <div className="flex-shrink-0 w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                3
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 mb-2 text-lg">고용부담금 감면 신청</h3>
                <div className="space-y-3 text-sm text-gray-700">
                  <div className="p-3 bg-white rounded border border-purple-200">
                    <p className="font-semibold text-purple-900 mb-1">📌 민간기업·공공기관</p>
                    <p className="text-xs">
                      해당 연도 계약 시작일부터 <strong>12월 31일까지의 거래실적</strong>을 바탕으로 
                      <strong className="text-red-600"> 다음연도 1월 10일까지</strong> 사업체 본점 소재지를 관할하는 
                      공단 지역본부 및 지사에 신청 (전자·우편·방문)
                    </p>
                  </div>
                  <div className="p-3 bg-white rounded border border-purple-200">
                    <p className="font-semibold text-purple-900 mb-1">📌 국가·지자체·교육청 (감면액 반환 신청)</p>
                    <p className="text-xs">
                      해당 연도 계약 시작일부터 <strong>12월 31일까지의 거래실적</strong>을 바탕으로 
                      <strong className="text-red-600"> 다음연도 4월 30일까지</strong> 사업체 본점 소재지를 관할하는 
                      공단 지역본부 및 지사에 신청 (전자·우편·방문)
                    </p>
                    <p className="text-xs text-red-600 mt-1">
                      ⚠️ 공무원 부문과 비공무원 부문 중 한 부문에 대해서만 감면액 반환 신청 가능
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 구비서류 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-3xl">📄</span>
            구비서류 목록
          </h2>
          <div className="space-y-3">
            {[
              { num: 1, title: "부담금 감면신청서", desc: "공단 양식에 따라 작성" },
              { num: 2, title: "연계고용 계약서", desc: "도급계약서 원본 또는 사본" },
              { num: 3, title: "연계고용 도급계약에 따른 보수 지급 영수증 사본", desc: "세금계산서, 거래명세서 등" },
              { num: 4, title: "연계고용 대상 사업체 총매출액을 확인할 수 있는 서류 사본", desc: "결산서, 손익계산서, 부가가치세 과세표준증명, 매출처별 세금계산서 합계표 등" },
              { num: 5, title: "연계고용 대상 사업장 소속 장애인 근로자 여부를 입증할 수 있는 서류", desc: "월별 임금대장, 장애인등록증 등" },
            ].map((doc) => (
              <div key={doc.num} className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex-shrink-0 w-8 h-8 bg-gray-600 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                  {doc.num}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 text-sm mb-1">{doc.title}</h3>
                  <p className="text-xs text-gray-600">{doc.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 p-4 bg-blue-50 border-l-4 border-blue-500">
            <p className="text-sm text-blue-800">
              <strong>📋 관련 고시:</strong> 연계고용에 따른 부담금 감면기준 (고용노동부 고시 제2024-100호)
            </p>
          </div>
        </div>

        {/* 구매 사례 섹션 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-3xl">📊</span>
            연계고용 부담금 감면 구매 사례
          </h2>
          <p className="text-sm text-gray-600 mb-6">
            공공기관 및 지자체의 장애인표준사업장생산품 구매 사례를 참고하세요
          </p>

          {/* 안내 메시지 */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-2">
              <span className="text-xl">💡</span>
              <div className="flex-1">
                <p className="font-medium text-blue-900 mb-1 text-sm">구매 사례 활용 안내</p>
                <p className="text-xs text-blue-700">
                  각 기관명을 클릭하면 상세한 구매 내역을 확인하실 수 있습니다. 다른 기관의 구매 품목과 금액을 참고하여 
                  귀사의 연계고용 계약을 계획하세요.
                </p>
              </div>
            </div>
          </div>

          {/* 구매 사례 아코디언 리스트 */}
          <div className="space-y-3">
            {purchaseCases.map((caseItem) => (
              <div
                key={caseItem.id}
                className="bg-gray-50 rounded-lg shadow-sm overflow-hidden transition-all duration-300"
              >
                {/* 기관 헤더 (클릭 가능) */}
                <div
                  onClick={() => toggleExpand(caseItem.id)}
                  className="cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                >
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-2xl flex-shrink-0">📦</span>
                          <div className="min-w-0">
                            <h3 className="text-base font-bold text-gray-800 truncate">
                              {caseItem.organization}
                            </h3>
                            <p className="text-xs text-gray-500 truncate">{caseItem.title}</p>
                          </div>
                        </div>
                        
                        {/* 요약 정보 */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-1 md:gap-3 text-xs">
                          <div className="flex items-center gap-1.5 text-gray-600">
                            <span>📅</span>
                            <span className="font-medium">구매기간:</span>
                            <span>{caseItem.period}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-gray-600">
                            <span>💰</span>
                            <span className="font-medium">총 금액:</span>
                            <span className="text-blue-600 font-bold">{formatCurrency(caseItem.totalAmount)}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-gray-600">
                            <span>📦</span>
                            <span className="font-medium">구매 항목:</span>
                            <span>{caseItem.items.length}개</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* 확장/축소 아이콘 */}
                      <div className="ml-3 flex-shrink-0 self-center">
                        <div className="text-xs font-bold text-blue-600 select-none">
                          {expandedId === caseItem.id ? '[ 닫기 ]' : '[ 상세보기 ]'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 확장된 상세 내역 */}
                {expandedId === caseItem.id && (
                  <div className="border-t border-gray-200 bg-white">
                    <div className="p-4">
                      <div className="bg-gray-50 rounded-lg overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gradient-to-r from-blue-500 to-purple-600">
                              <tr>
                                <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">
                                  구매일시
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">
                                  구매품목
                                </th>
                                <th className="px-4 py-3 text-right text-xs font-bold text-white uppercase tracking-wider">
                                  구매금액
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {caseItem.items.map((item, index) => (
                                <tr key={index} className="hover:bg-blue-50 transition-colors duration-150">
                                  <td className="px-4 py-3 text-xs text-gray-700">
                                    {item.date}
                                  </td>
                                  <td className="px-4 py-3 text-xs text-gray-900">
                                    {item.item}
                                  </td>
                                  <td className="px-4 py-3 text-xs text-right font-semibold text-blue-600">
                                    {formatCurrency(item.amount)}
                                  </td>
                                </tr>
                              ))}
                              {/* 합계 행 */}
                              <tr className="bg-gradient-to-r from-blue-100 to-purple-100 font-bold">
                                <td className="px-4 py-3 text-sm text-gray-900" colSpan={2}>
                                  💎 합계
                                </td>
                                <td className="px-4 py-3 text-sm text-right text-blue-700">
                                  {formatCurrency(caseItem.totalAmount)}
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 구매 사례 활용 방법 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">📌</span>
            <h2 className="text-2xl font-bold text-gray-800">구매 사례 데이터 활용 방법</h2>
          </div>
          <div className="space-y-4 text-gray-700">
            <div className="flex gap-3">
              <span className="text-blue-600 font-bold flex-shrink-0">1단계</span>
              <div className="flex-1">
                <p className="text-sm"><strong>구매 계획 수립:</strong> 다른 기관의 구매 품목과 금액을 참고하여 귀사의 연계고용 계약을 계획하세요.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-blue-600 font-bold flex-shrink-0">2단계</span>
              <div className="flex-1">
                <p className="text-sm"><strong>예산 책정:</strong> 실제 구매 사례의 금액 정보를 활용하여 부담금 감면을 위한 예산을 합리적으로 책정할 수 있습니다.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-blue-600 font-bold flex-shrink-0">3단계</span>
              <div className="flex-1">
                <p className="text-sm"><strong>품목 선정:</strong> 공공기관에서 주로 구매하는 품목을 확인하여 연계고용 도급계약 품목을 결정하세요.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-blue-600 font-bold flex-shrink-0">4단계</span>
              <div className="flex-1">
                <p className="text-sm"><strong>감면 신청:</strong> 구매 사례를 바탕으로 계약을 체결하고 부담금 감면을 신청하세요.</p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-lg p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-4">연계고용으로 부담금을 최대 90% 절감하세요!</h2>
          <p className="mb-6 text-blue-100">
            장표사닷컴에서 인증된 장애인표준사업장과 연결해드립니다
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/catalog"
              className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
            >
              🛒 표준사업장감면상품 보기
            </a>
            <a
              href="/calculators/linkage"
              className="bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-800 transition-colors"
            >
              📊 감면액 계산하기
            </a>
            <a
              href="/employment-levy-obligation"
              className="bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-800 transition-colors"
            >
              📋 고용부담금 알아보기
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
