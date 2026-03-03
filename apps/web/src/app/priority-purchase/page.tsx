"use client"

export default function PriorityPurchasePage() {
  return (
    <div className="min-h-screen bg-gray-50 pl-0 pr-4 md:pr-8 py-2 md:py-4">
      <div className="max-w-7xl">
        {/* 헤더 */}
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
            공공기관 우선구매제도
          </h1>
          <p className="text-sm md:text-base text-gray-600">
            장애인 표준사업장 생산품에 대한 공공기관 우선구매 제도 안내
          </p>
        </div>

        {/* 제도 개요 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-3xl">🏛️</span>
            제도 정의
          </h2>
          <div className="space-y-4 text-gray-700">
            <p className="leading-relaxed text-base">
              <strong className="text-blue-600">장애인 표준사업장 생산품 공공기관 우선구매제도</strong>는 
              장애인을 다수 고용하고 있는 장애인 표준사업장의 생산품에 대해 <strong>우선구매를 통해 지원</strong>함으로써 
              장애인 표준사업장의 경제적 안정화를 지원하고, 이를 통해 <strong className="text-green-600">장애인의 
              일자리 창출과 안정화를 도모</strong>하고자 하는 제도입니다.
            </p>
            <div className="p-4 bg-blue-50 border-l-4 border-blue-500">
              <p className="text-sm text-blue-800">
                <strong>📋 법적 근거:</strong> 「장애인고용촉진 및 직업재활법」 제22조의4 (장애인 표준사업장 생산품의 우선구매 등)
              </p>
            </div>
          </div>
        </div>

        {/* 구매 의무 - 최소 0.8% 강조 */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg shadow-lg p-8 mb-6 text-white">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">⚠️ 공공기관 구매 의무</h2>
            <div className="bg-white bg-opacity-20 rounded-lg p-6 mb-4">
              <p className="text-sm mb-2 text-green-100">공공기관별 총구매액 대비</p>
              <p className="text-3xl font-bold mb-2">최소 0.8%</p>
              <p className="text-lg font-semibold">장애인 표준사업장 생산품 구매 목표</p>
            </div>
            <div className="text-sm text-green-100 space-y-2">
              <p>✓ 공공기관은 총구매액(물품·용역, 공사비 제외)의 <strong>1%</strong> 범위 내에서</p>
              <p>고용노동부장관이 정하는 비율 <strong>(현행 최소 0.8%)</strong> 이상 구매 의무</p>
              <p className="text-xs mt-3">※ 고용노동부 고시 「공공기관의 장애인 표준사업장 생산품의 구매목표 비율」</p>
            </div>
          </div>
        </div>

        {/* 법적 의무 사항 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-3xl">⚖️</span>
            법적 의무 사항
          </h2>
          <div className="space-y-4">
            {[
              {
                num: 1,
                title: "우선구매 의무",
                content: "공공기관의 장은 물품·용역에 관한 계약을 체결하는 경우 장애인 표준사업장에서 생산한 물품과 제공하는 용역을 우선구매하여야 합니다."
              },
              {
                num: 2,
                title: "구매계획 및 실적 제출",
                content: "공공기관의 장은 장애인 표준사업장 생산품의 구매계획과 전년도 구매실적을 고용노동부장관에게 제출해야 합니다. 구매계획에는 총구매액의 1% 범위에서 고용노동부장관이 정하는 비율(최소 0.8%) 이상의 구매목표를 제시해야 합니다."
              },
              {
                num: 3,
                title: "수의계약 허용",
                content: "공공기관의 장은 장애인 표준사업장 생산품을 수의계약으로 구매할 수 있습니다. 수의계약의 절차 및 방법은 「국가를 당사자로 하는 계약에 관한 법률」 등 관계 법령을 따릅니다."
              },
              {
                num: 4,
                title: "평가 지표 포함",
                content: "공공기관의 장은 소속 기관 등에 대한 평가를 실시하는 경우 장애인 표준사업장 생산품의 구매실적을 포함하여야 합니다."
              },
              {
                num: 5,
                title: "실적 제출 요구 이행",
                content: "고용노동부장관은 구매계획의 이행 점검 등을 위하여 공공기관의 장에게 구매실적 제출을 요구할 수 있으며, 공공기관의 장은 특별한 사유가 없는 한 이에 따라야 합니다."
              }
            ].map((item) => (
              <div key={item.num} className="flex items-start gap-4 p-5 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                  {item.num}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-700 leading-relaxed">{item.content}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 우선구매 대상 공공기관 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-3xl">🏢</span>
            우선구매 대상 공공기관 범위
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              {
                category: "국가기관",
                icon: "🏛️",
                items: ["중앙행정기관", "국가기관"]
              },
              {
                category: "지방자치단체",
                icon: "🏙️",
                items: [
                  "특별시장·광역시장·특별자치시장·도지사·특별자치도지사",
                  "특별시·광역시·특별자치시·도·특별자치도의 교육감",
                  "시장·군수·구청장(자치구)"
                ]
              },
              {
                category: "특별법 설립 법인",
                icon: "🏦",
                items: [
                  "농업협동조합중앙회",
                  "중소기업중앙회",
                  "산림조합중앙회",
                  "한국은행",
                  "대한상공회의소"
                ]
              },
              {
                category: "공공기관 및 공기업",
                icon: "🏭",
                items: [
                  "공공기관운영법상 공공기관",
                  "지방공기업법상 지방공사·지방공단",
                  "지방의료원"
                ]
              }
            ].map((group, idx) => (
              <div key={idx} className="p-5 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                <h3 className="text-lg font-bold text-blue-900 mb-3 flex items-center gap-2">
                  <span className="text-2xl">{group.icon}</span>
                  {group.category}
                </h3>
                <ul className="space-y-2">
                  {group.items.map((item, itemIdx) => (
                    <li key={itemIdx} className="text-sm text-blue-800 flex items-start gap-2">
                      <span className="text-blue-600 font-bold mt-0.5">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* 구매 절차 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-3xl">📋</span>
            구매계획 및 실적 제출 절차
          </h2>
          <div className="space-y-5">
            {[
              {
                step: "STEP 1",
                title: "구매계획 수립",
                time: "매년 초",
                actor: "공공기관",
                content: "연간 장애인 표준사업장 생산품 구매계획 수립 (총구매액의 최소 0.8% 이상)",
                action: "고용노동부(공단)에 제출",
                color: "blue"
              },
              {
                step: "STEP 2",
                title: "구매 이행",
                time: "연중",
                actor: "공공기관 구매 담당자",
                content: "장애인 표준사업장 생산품 우선 구매 집행 (수의계약 가능)",
                action: "계획에 따른 구매 실행",
                color: "green"
              },
              {
                step: "STEP 3",
                title: "구매실적 제출",
                time: "매년 초 (다음연도)",
                actor: "공공기관",
                content: "전년도 장애인 표준사업장 생산품 구매실적 정리",
                action: "고용노동부(공단)에 제출 (gachiilteo.or.kr)",
                color: "purple"
              }
            ].map((item, idx) => (
              <div key={idx} className={`p-5 bg-gradient-to-r from-${item.color}-50 to-${item.color}-100 rounded-lg border-l-4 border-${item.color}-500`}>
                <div className="flex items-start gap-4">
                  <div className={`flex-shrink-0 px-3 py-1 bg-${item.color}-600 text-white rounded-full text-sm font-bold`}>
                    {item.step}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-bold text-gray-900">{item.title}</h3>
                      <span className={`text-xs font-semibold px-3 py-1 bg-${item.color}-200 text-${item.color}-800 rounded-full`}>
                        {item.time}
                      </span>
                    </div>
                    <p className={`text-sm font-semibold text-${item.color}-900 mb-2`}>담당: {item.actor}</p>
                    <p className="text-sm text-gray-700 mb-2">{item.content}</p>
                    <p className={`text-xs font-semibold text-${item.color}-700`}>→ {item.action}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 p-4 bg-yellow-50 border-l-4 border-yellow-500">
            <p className="text-sm text-yellow-800">
              <strong>💡 제출 시스템:</strong> 2013년도부터 대상 공공기관은 gachiilteo.or.kr을 통해 
              구매계획과 전년도 구매실적을 제출할 수 있습니다.
            </p>
          </div>
        </div>

        {/* 혜택 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-3xl">✨</span>
            제도의 효과
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-5 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border-l-4 border-green-500">
              <h3 className="text-lg font-bold text-green-900 mb-2">장애인 일자리 창출</h3>
              <p className="text-sm text-green-800 leading-relaxed">
                장애인 표준사업장의 안정적인 수요 확보를 통한 장애인 일자리 창출 및 유지
              </p>
            </div>
            <div className="p-5 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border-l-4 border-blue-500">
              <h3 className="text-lg font-bold text-blue-900 mb-2">경제적 자립 지원</h3>
              <p className="text-sm text-blue-800 leading-relaxed">
                표준사업장의 경제적 안정화를 통한 장애인의 지속가능한 경제적 자립 도모
              </p>
            </div>
            <div className="p-5 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border-l-4 border-purple-500">
              <h3 className="text-lg font-bold text-purple-900 mb-2">사회통합 실현</h3>
              <p className="text-sm text-purple-800 leading-relaxed">
                장애인의 사회참여 확대 및 더불어 사는 사회 구현
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-lg p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-4">공공기관 우선구매 의무를 준수하세요</h2>
          <p className="mb-6 text-blue-100">
            장표사닷컴은 인증된 장애인 표준사업장 생산품을 제공합니다
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/catalog"
              className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
            >
              🛒 표준사업장 생산품 보기
            </a>
            <a
              href="https://www.gachiilteo.or.kr"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-800 transition-colors"
            >
              🔗 가치일터 바로가기
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
