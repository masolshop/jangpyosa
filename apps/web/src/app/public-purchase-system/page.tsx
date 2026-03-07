"use client"

export default function PublicPurchaseSystemPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
            공공기관 우선구매제도
          </h1>
          <p className="text-sm md:text-base text-gray-600">
            장애인 표준사업장 생산품에 대한 공공기관 우선구매 제도 안내 및 실적 공개
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

        {/* 2026년 법정 의무비율 안내 */}
        <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-lg shadow-md p-6 mb-6 border-2 border-red-200">
          <h2 className="text-2xl font-bold text-red-800 mb-4 flex items-center gap-2">
            <span className="text-3xl">⚠️</span>
            2026년 법정 의무비율 (2025년과 동일)
          </h2>
          <div className="bg-white rounded-lg p-4 mb-4">
            <p className="text-center text-gray-700 mb-2">
              <strong className="text-lg">2026년 우선구매 비율은 2025년과 100% 동일합니다.</strong>
            </p>
            <p className="text-center text-sm text-gray-600">
              의무비율은 법령에 근거하기 때문에 개정 없이는 변하지 않습니다. 
              현재까지 확인된 개정사항이 없으므로 기존 비율을 그대로 적용하시면 됩니다.
            </p>
          </div>
          <div className="p-4 bg-yellow-50 border-l-4 border-yellow-500">
            <p className="text-sm text-yellow-900 mb-2">
              <strong>⚡ 중요:</strong> 비율이 같다고 해서 작년처럼 하면 되는 것은 아닙니다!
            </p>
            <ul className="text-sm text-yellow-800 space-y-1 ml-4">
              <li>• 매년 계획 수립·실적 보고 절차는 새롭게 진행해야 합니다</li>
              <li>• 분기별 달성률 관리는 필수입니다</li>
              <li>• 2월 말까지 당해연도 구매계획 수립·제출 필수</li>
            </ul>
          </div>
        </div>

        {/* 2026년 우선구매 의무비율 한눈에 보기 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-3xl">📊</span>
            2026년 우선구매 의무비율 한눈에 보기
          </h2>
          
          {/* 중소기업 제품 */}
          <div className="mb-6">
            <h3 className="text-xl font-bold text-blue-800 mb-3 flex items-center gap-2">
              <span className="text-2xl">🏢</span>
              중소기업 제품
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse border border-gray-300">
                <thead className="bg-blue-100">
                  <tr>
                    <th className="border border-gray-300 px-4 py-3 text-left font-bold text-gray-800">항목</th>
                    <th className="border border-gray-300 px-4 py-3 text-left font-bold text-gray-800">비율</th>
                    <th className="border border-gray-300 px-4 py-3 text-left font-bold text-gray-800">적용 범위</th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  <tr className="hover:bg-blue-50">
                    <td className="border border-gray-300 px-4 py-3">중소기업제품 전체</td>
                    <td className="border border-gray-300 px-4 py-3"><strong className="text-blue-600">50% 이상</strong></td>
                    <td className="border border-gray-300 px-4 py-3">공공기관 구매 총액</td>
                  </tr>
                  <tr className="hover:bg-blue-50">
                    <td className="border border-gray-300 px-4 py-3">기술개발제품</td>
                    <td className="border border-gray-300 px-4 py-3"><strong className="text-blue-600">15% 이상</strong></td>
                    <td className="border border-gray-300 px-4 py-3">중소기업 제품 구매액 중</td>
                  </tr>
                  <tr className="hover:bg-blue-50">
                    <td className="border border-gray-300 px-4 py-3">창업기업 제품</td>
                    <td className="border border-gray-300 px-4 py-3"><strong className="text-blue-600">8%</strong></td>
                    <td className="border border-gray-300 px-4 py-3">중소기업 제품 구매목표 비율 중</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* 사회적 기업 제품 */}
          <div className="mb-6">
            <h3 className="text-xl font-bold text-green-800 mb-3 flex items-center gap-2">
              <span className="text-2xl">🤝</span>
              사회적 기업 제품
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse border border-gray-300">
                <thead className="bg-green-100">
                  <tr>
                    <th className="border border-gray-300 px-4 py-3 text-left font-bold text-gray-800">항목</th>
                    <th className="border border-gray-300 px-4 py-3 text-left font-bold text-gray-800">비율</th>
                    <th className="border border-gray-300 px-4 py-3 text-left font-bold text-gray-800">적용 기준</th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  <tr className="hover:bg-green-50">
                    <td className="border border-gray-300 px-4 py-3">여성기업 제품</td>
                    <td className="border border-gray-300 px-4 py-3"><strong className="text-green-600">물품·용역 5% 이상 / 공사 3% 이상</strong></td>
                    <td className="border border-gray-300 px-4 py-3">각 구매 총액</td>
                  </tr>
                  <tr className="hover:bg-green-50">
                    <td className="border border-gray-300 px-4 py-3">장애인기업 제품</td>
                    <td className="border border-gray-300 px-4 py-3"><strong className="text-green-600">1% 이상</strong></td>
                    <td className="border border-gray-300 px-4 py-3">구매 총액</td>
                  </tr>
                  <tr className="hover:bg-green-50 bg-yellow-50">
                    <td className="border border-gray-300 px-4 py-3 font-bold">중증장애인생산품</td>
                    <td className="border border-gray-300 px-4 py-3"><strong className="text-orange-600 text-lg">1.1% 이상</strong></td>
                    <td className="border border-gray-300 px-4 py-3">총구매액</td>
                  </tr>
                  <tr className="hover:bg-green-50 bg-green-50">
                    <td className="border border-gray-300 px-4 py-3 font-bold">장애인표준사업장 제품</td>
                    <td className="border border-gray-300 px-4 py-3"><strong className="text-green-700 text-lg">0.8% 이상</strong></td>
                    <td className="border border-gray-300 px-4 py-3">총구매액</td>
                  </tr>
                  <tr className="hover:bg-green-50">
                    <td className="border border-gray-300 px-4 py-3">사회적기업 제품</td>
                    <td className="border border-gray-300 px-4 py-3"><strong className="text-gray-600">3% (권장)</strong></td>
                    <td className="border border-gray-300 px-4 py-3">총구매액</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* 실무자 핵심 포인트 */}
          <div className="mt-6 p-4 bg-purple-50 border-l-4 border-purple-500 rounded">
            <h4 className="font-bold text-purple-900 mb-3">💡 실무자가 헷갈리는 핵심 포인트 5가지</h4>
            <ul className="text-sm text-purple-800 space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-purple-600 font-bold mt-0.5">•</span>
                <span><strong>중소기업 제품 50%는 전체 구매액 기준</strong>입니다.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600 font-bold mt-0.5">•</span>
                <span><strong>여성기업 제품 5%는 별도 항목</strong>이에요. 중소기업 50% 안에 포함되지 않습니다.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600 font-bold mt-0.5">•</span>
                <span><strong>장애인기업 1% ≠ 중증장애인생산품 1.1%</strong> → 서로 다른 항목이므로 따로 관리해야 합니다.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600 font-bold mt-0.5">•</span>
                <span><strong>창업기업 제품 8%는 중소기업 50% 내에서 관리</strong>하는 항목입니다. 추가 비율이 아니에요.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600 font-bold mt-0.5">•</span>
                <span><strong>사회적기업 제품 3%는 기획재정부 권장사항</strong>으로, 법정 의무는 아닙니다.</span>
              </li>
            </ul>
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
                content: "공공기관의 장은 장애인 표준사업장 생산품을 수의계약으로 구매할 수 있습니다."
              },
              {
                num: 4,
                title: "평가 지표 포함",
                content: "공공기관의 장은 소속 기관 등에 대한 평가를 실시하는 경우 장애인 표준사업장 생산품의 구매실적을 포함하여야 합니다."
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

        {/* 구매계획 및 실적 제출 절차 */}
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
                time: "매년 초 (2월 말까지)",
                content: "연간 장애인 표준사업장 생산품 구매계획 수립 (총구매액의 최소 0.8% 이상)",
                action: "고용노동부(공단)에 제출",
                color: "blue"
              },
              {
                step: "STEP 2",
                title: "구매 이행",
                time: "연중",
                content: "장애인 표준사업장 생산품 우선 구매 집행 (수의계약 가능)",
                action: "계획에 따른 구매 실행 및 분기별 달성률 관리",
                color: "green"
              },
              {
                step: "STEP 3",
                title: "구매실적 제출",
                time: "매년 초 (다음연도)",
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
                    <p className="text-sm text-gray-700 mb-2">{item.content}</p>
                    <p className={`text-xs font-semibold text-${item.color}-700`}>→ {item.action}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 p-4 bg-yellow-50 border-l-4 border-yellow-500">
            <p className="text-sm text-yellow-800">
              <strong>💡 제출 시스템:</strong> 대상 공공기관은 gachiilteo.or.kr을 통해 
              구매계획과 전년도 구매실적을 제출할 수 있습니다.
            </p>
          </div>
        </div>

        {/* 공공기관 구매실적 공개 */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-lg shadow-lg p-8 mb-6 text-white">
          <div className="text-center mb-6">
            <div className="inline-block bg-white bg-opacity-20 px-6 py-2 rounded-full mb-4">
              <p className="text-sm font-semibold">고용노동부 공고 제2025-206호</p>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              공공기관의 장애인 표준사업장 생산품
            </h2>
            <p className="text-xl font-semibold mb-2">2024년도 구매실적 및 2025년도 구매계획</p>
            <p className="text-sm text-blue-100 mt-4">
              2025년 4월 30일 | 고용노동부장관
            </p>
          </div>
          <div className="bg-white bg-opacity-10 rounded-lg p-6">
            <h3 className="font-bold text-white mb-3 text-lg">📋 공고 취지</h3>
            <p className="text-sm text-blue-100 leading-relaxed">
              공공기관의 장애인 표준사업장 생산품에 대한 전년도 구매실적과 해당연도 구매계획을 
              공고함으로써, 장애인 표준사업장 생산품 우선구매제도의 실효성을 제고하고 투명성을 확보합니다.
            </p>
          </div>
        </div>

        {/* 대상 공공기관 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-3xl">🏢</span>
            대상 공공기관 (총 851개)
          </h2>
          <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
            {[
              { category: "국가기관", icon: "🏛️", color: "blue" },
              { category: "자치단체", icon: "🏙️", color: "green" },
              { category: "교육청", icon: "🎓", color: "purple" },
              { category: "공기업", icon: "🏭", color: "indigo" },
              { category: "준정부기관", icon: "🏢", color: "cyan" },
              { category: "기타 공공기관", icon: "🏛️", color: "teal" },
              { category: "지방공기업", icon: "🏗️", color: "orange" },
              { category: "지방의료원", icon: "🏥", color: "red" },
              { category: "특별법인", icon: "📜", color: "pink" }
            ].map((item) => (
              <div 
                key={item.category} 
                className={`p-3 bg-${item.color}-50 rounded-lg border-l-4 border-${item.color}-500 text-center`}
              >
                <div className="text-2xl mb-1">{item.icon}</div>
                <p className={`text-xs font-semibold text-${item.color}-900`}>{item.category}</p>
              </div>
            ))}
          </div>
        </div>

        {/* PDF 다운로드 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-3xl">📄</span>
            2024년 구매실적 및 2025년 구매계획 상세 자료
          </h2>
          <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-200">
            <div className="flex items-center gap-4 mb-4">
              <div className="text-6xl">📊</div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  표준사업장 생산품 24년 구매실적 및 25년 구매계획 공고문
                </h3>
                <p className="text-sm text-gray-600 mb-2">
                  고용노동부 공고 제2025-206호 (2025년 4월 30일 발표)
                </p>
                <div className="flex gap-2 text-xs text-gray-500">
                  <span>• PDF 문서</span>
                  <span>• 파일 크기: 약 400KB</span>
                  <span>• 851개 공공기관 포함</span>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <a
                href="https://www.genspark.ai/api/files/s/GSxQkFmZ"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <span>📥</span>
                <span>PDF 다운로드</span>
              </a>
              <a
                href="https://www.genspark.ai/api/files/s/GSxQkFmZ"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors flex items-center gap-2"
              >
                <span>👁️</span>
                <span>새 탭에서 보기</span>
              </a>
            </div>
          </div>
        </div>

        {/* 제도의 효과 */}
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
            <a
              href="/linkage-levy-exemption-system"
              className="bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-800 transition-colors"
            >
              📉 부담금 감면 알아보기
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
