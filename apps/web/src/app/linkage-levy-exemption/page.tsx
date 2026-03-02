"use client"

export default function LinkageLevyExemptionPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8" style={{ marginLeft: '350px' }}>
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
            연계고용 부담금 감면제도
          </h1>
          <p className="text-sm md:text-base text-gray-600">
            장애인표준사업장과의 도급계약을 통한 고용부담금 감면 안내
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
              <p className="text-5xl font-bold text-green-600 mb-3">90%</p>
              <p className="text-sm text-green-800 leading-relaxed">
                장애인 근로자 1인당 고용부담금의 <strong>최대 90%</strong>까지 감면 가능
              </p>
            </div>
            <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border-2 border-blue-200">
              <h3 className="text-xl font-semibold text-blue-900 mb-3">실질 절감 효과</h3>
              <div className="space-y-2 text-sm text-blue-800">
                <p className="flex items-center gap-2">
                  <span className="text-blue-600 font-bold">✓</span>
                  <span>월 부담금 1,404,900원 → 약 140,490원</span>
                </p>
                <p className="flex items-center gap-2">
                  <span className="text-blue-600 font-bold">✓</span>
                  <span>연간 최대 약 1,518만원 절감 (1인당)</span>
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
          </div>
        </div>
      </div>
    </div>
  )
}
