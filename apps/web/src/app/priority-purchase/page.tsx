"use client"

export default function PriorityPurchasePage() {
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
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

        {/* 담당자들이 가장 많이 오해하는 3가지 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-3xl">❌</span>
            담당자들이 가장 많이 오해하는 3가지
          </h2>
          <div className="space-y-6">
            {[
              {
                num: "오해 ①",
                title: '"작년 자료 그대로 복붙하면 되지 않나요?"',
                content: "비율은 동일해도 **절차는 매년 반복**됩니다. 2월 말까지 당해연도 구매계획을 수립·제출해야 하며, 전년도 실적도 보고해야 합니다. 이를 이행하지 않으면 중소벤처기업부나 기획재정부로부터 시정 권고를 받을 수 있고, 공공기관 경영평가에서 감점 대상이 됩니다.",
                tip: "1월에 전년도 실적을 마무리하고, 2월에는 올해 계획을 확정해 제출하세요. 분기마다 진행률을 체크하는 습관을 들이면 연말에 허겁지겁 몰아서 구매하는 일을 막을 수 있습니다.",
                color: "red"
              },
              {
                num: "오해 ②",
                title: '"대강 맞추면 되는 거 아닌가요?"',
                content: "우선구매 비율은 **법정 의무**입니다. 권장사항이 아닙니다. 미달 시 ① 공공기관 경영평가 감점 ② 중소벤처기업부의 시정 권고 (강제성 있음) ③ 구매실적 공개로 인한 기관 이미지 타격 등의 불이익이 있습니다.",
                tip: "품목별 우선구매 대상 리스트를 미리 확보하고, 분기마다 달성률을 모니터링하는 시스템을 만드세요. 미달이 보이면 즉시 보완 조치를 취해야 합니다.",
                color: "orange"
              },
              {
                num: "오해 ③",
                title: '"12월에 몰아서 사면 되죠"',
                content: "연말 집중 구매는 리스크가 큽니다. ① 우선구매 대상 제품이 품절될 가능성 ② 급하게 구매하면 품질 검증 부족 ③ 이미 타 항목에 예산 배정 완료 ④ 계약·납품 절차 진행 시간 부족 등의 문제가 발생합니다.",
                tip: "1분기 25% → 2분기 50% → 3분기 75% → 4분기 100%를 기본으로 하되, 5~10% 버퍼를 두고 관리하세요.",
                color: "yellow"
              }
            ].map((item, idx) => (
              <div key={idx} className={`p-5 bg-gradient-to-r from-${item.color}-50 to-${item.color}-100 rounded-lg border-l-4 border-${item.color}-500`}>
                <div className="mb-3">
                  <span className={`inline-block px-3 py-1 bg-${item.color}-600 text-white rounded-full text-sm font-bold mb-2`}>
                    {item.num}
                  </span>
                  <h3 className="text-lg font-bold text-gray-900 mt-2">{item.title}</h3>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed mb-3">{item.content}</p>
                <div className={`p-3 bg-${item.color}-100 border-l-2 border-${item.color}-600 rounded`}>
                  <p className="text-xs text-gray-800">
                    <strong>💡 해결책:</strong> {item.tip}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 p-4 bg-red-50 border-l-4 border-red-500">
            <p className="text-sm text-red-800">
              <strong>📊 2024년 통계:</strong> 전체 1,024개 기관 중 <strong>42.3%(434개 기관)</strong>가 
              중증장애인생산품 우선구매 목표를 달성하지 못했습니다. 평균 구매 비율은 1.09%로 
              목표치인 1%를 근소하게 넘겼지만, 기관별 편차가 심각했습니다.
            </p>
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
                    <th className="border border-gray-300 px-4 py-3 text-left font-bold text-gray-800">법적 근거</th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  <tr className="hover:bg-blue-50">
                    <td className="border border-gray-300 px-4 py-3">중소기업제품 전체</td>
                    <td className="border border-gray-300 px-4 py-3"><strong className="text-blue-600">50% 이상</strong></td>
                    <td className="border border-gray-300 px-4 py-3">공공기관 구매 총액</td>
                    <td className="border border-gray-300 px-4 py-3 text-sm">중소기업제품 구매촉진 및 판로지원에 관한 법률 제5조</td>
                  </tr>
                  <tr className="hover:bg-blue-50">
                    <td className="border border-gray-300 px-4 py-3">기술개발제품</td>
                    <td className="border border-gray-300 px-4 py-3"><strong className="text-blue-600">15% 이상</strong></td>
                    <td className="border border-gray-300 px-4 py-3">중소기업 제품 구매액 중</td>
                    <td className="border border-gray-300 px-4 py-3 text-sm">동법 시행령</td>
                  </tr>
                  <tr className="hover:bg-blue-50">
                    <td className="border border-gray-300 px-4 py-3">창업기업 제품</td>
                    <td className="border border-gray-300 px-4 py-3"><strong className="text-blue-600">8%</strong></td>
                    <td className="border border-gray-300 px-4 py-3">중소기업 제품 구매목표 비율 중</td>
                    <td className="border border-gray-300 px-4 py-3 text-sm">중소기업창업 지원법</td>
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
                    <th className="border border-gray-300 px-4 py-3 text-left font-bold text-gray-800">법적 근거</th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  <tr className="hover:bg-green-50">
                    <td className="border border-gray-300 px-4 py-3">여성기업 제품</td>
                    <td className="border border-gray-300 px-4 py-3"><strong className="text-green-600">물품·용역 5% 이상 / 공사 3% 이상</strong></td>
                    <td className="border border-gray-300 px-4 py-3">각 구매 총액</td>
                    <td className="border border-gray-300 px-4 py-3 text-sm">여성기업지원에 관한 법률 제9조, 동법 시행령 제7조</td>
                  </tr>
                  <tr className="hover:bg-green-50">
                    <td className="border border-gray-300 px-4 py-3">장애인기업 제품</td>
                    <td className="border border-gray-300 px-4 py-3"><strong className="text-green-600">1% 이상</strong></td>
                    <td className="border border-gray-300 px-4 py-3">구매 총액</td>
                    <td className="border border-gray-300 px-4 py-3 text-sm">장애인기업활동 촉진법 제9조의2</td>
                  </tr>
                  <tr className="hover:bg-green-50 bg-yellow-50">
                    <td className="border border-gray-300 px-4 py-3 font-bold">중증장애인생산품</td>
                    <td className="border border-gray-300 px-4 py-3"><strong className="text-orange-600 text-lg">1.1% 이상</strong></td>
                    <td className="border border-gray-300 px-4 py-3">총구매액</td>
                    <td className="border border-gray-300 px-4 py-3 text-sm">중증장애인생산품 우선구매 특별법</td>
                  </tr>
                  <tr className="hover:bg-green-50 bg-green-50">
                    <td className="border border-gray-300 px-4 py-3 font-bold">장애인표준사업장 제품</td>
                    <td className="border border-gray-300 px-4 py-3"><strong className="text-green-700 text-lg">0.8% 이상</strong></td>
                    <td className="border border-gray-300 px-4 py-3">총구매액</td>
                    <td className="border border-gray-300 px-4 py-3 text-sm">장애인고용촉진 및 직업재활법 제22조의3, 고용노동부 고시 제2022-136호</td>
                  </tr>
                  <tr className="hover:bg-green-50">
                    <td className="border border-gray-300 px-4 py-3">사회적기업 제품</td>
                    <td className="border border-gray-300 px-4 py-3"><strong className="text-gray-600">3% (권장)</strong></td>
                    <td className="border border-gray-300 px-4 py-3">총구매액</td>
                    <td className="border border-gray-300 px-4 py-3 text-sm">사회적기업 육성법 제12조</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* 환경 관련 제품 */}
          <div className="mb-4">
            <h3 className="text-xl font-bold text-emerald-800 mb-3 flex items-center gap-2">
              <span className="text-2xl">♻️</span>
              환경 관련 제품
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse border border-gray-300">
                <thead className="bg-emerald-100">
                  <tr>
                    <th className="border border-gray-300 px-4 py-3 text-left font-bold text-gray-800">항목</th>
                    <th className="border border-gray-300 px-4 py-3 text-left font-bold text-gray-800">비율</th>
                    <th className="border border-gray-300 px-4 py-3 text-left font-bold text-gray-800">적용 기준</th>
                    <th className="border border-gray-300 px-4 py-3 text-left font-bold text-gray-800">법적 근거</th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  <tr className="hover:bg-emerald-50">
                    <td className="border border-gray-300 px-4 py-3">녹색제품</td>
                    <td className="border border-gray-300 px-4 py-3"><strong className="text-emerald-600">의무구매</strong> (비율 미명시)</td>
                    <td className="border border-gray-300 px-4 py-3">녹색제품 존재 시 우선 구매</td>
                    <td className="border border-gray-300 px-4 py-3 text-sm">녹색제품 구매촉진에 관한 법률 제6조 및 제9조</td>
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

        {/* 분기별 관리 가이드 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-3xl">📅</span>
            분기별 관리 가이드
          </h2>
          <div className="space-y-5">
            {[
              {
                quarter: "1분기 (1~3월)",
                title: "계획 수립 단계",
                target: "목표 달성률: 25%",
                tasks: [
                  "전년도 구매실적 집계 완료",
                  "당해연도 구매계획 수립 (기관별 목표 비율 설정)",
                  "중소벤처기업부 / 기획재정부 / 고용노동부 제출",
                  "우선구매 대상 품목 리스트 업데이트",
                  "담당 부서별 목표 배분"
                ],
                system: "중소기업제품 공공구매 종합정보망(SMPP), 녹색장터, 중증장애인생산품 우선구매정보시스템",
                color: "blue"
              },
              {
                quarter: "2분기 (4~6월)",
                title: "중간 점검 단계",
                target: "목표 달성률: 50%",
                tasks: [
                  "1분기 실적 분석 (미달 항목 파악)",
                  "미달 항목 집중 구매 계획 수립",
                  "하반기 계약 건 우선구매 대상 사전 매칭",
                  "기술개발제품 우선구매 신청 검토"
                ],
                checkpoints: [
                  "중소기업 제품: 25% 이상",
                  "여성기업 제품: 2.5% 이상",
                  "장애인기업 제품: 0.5% 이상",
                  "중증장애인생산품: 0.55% 이상"
                ],
                risk: "미달 시 즉시 보완 조치로 추가 구매 계획을 수립하고, 담당 부서별 실적을 공유해 협조를 요청하세요.",
                color: "green"
              },
              {
                quarter: "3분기 (7~9월)",
                title: "가속 페달 단계",
                target: "목표 달성률: 75%",
                tasks: [
                  "상반기 실적 종합 분석",
                  "연말 목표 달성 시나리오 수립",
                  "우선구매 대상 신규 품목 발굴",
                  "계약 진행 중인 건 우선구매 전환 검토"
                ],
                strategy: "연말 물량 부족에 대비해 사전 계약을 진행하고, 다년도 계약 건은 우선구매 적용을 협의하세요.",
                color: "yellow"
              },
              {
                quarter: "4분기 (10~12월)",
                title: "최종 마무리 단계",
                target: "목표 달성률: 100% + 여유분 5~10%",
                tasks: [
                  "최종 실적 집계",
                  "미달 항목 긴급 보완",
                  "차년도 구매계획 준비",
                  "실적 보고서 작성"
                ],
                emergency: "미달 시 수의계약을 활용할 수 있습니다 (여성기업의 경우 1억 원 이하 가능). 추가 예산 확보를 협의하고, 필요 시 차년도 이월 계획을 검토하세요.",
                color: "red"
              }
            ].map((item, idx) => (
              <div key={idx} className={`p-6 bg-gradient-to-br from-${item.color}-50 to-${item.color}-100 rounded-lg border-2 border-${item.color}-300`}>
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-bold text-gray-900">{item.quarter}</h3>
                    <span className={`px-4 py-2 bg-${item.color}-600 text-white rounded-full text-sm font-bold`}>
                      {item.title}
                    </span>
                  </div>
                  <p className={`text-lg font-semibold text-${item.color}-700`}>{item.target}</p>
                </div>
                
                <div className="mb-4">
                  <h4 className="font-bold text-gray-800 mb-2">✓ 해야 할 일</h4>
                  <ul className="space-y-1">
                    {item.tasks.map((task, taskIdx) => (
                      <li key={taskIdx} className="text-sm text-gray-700 flex items-start gap-2">
                        <span className={`text-${item.color}-600 font-bold mt-0.5`}>•</span>
                        <span>{task}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {item.system && (
                  <div className={`p-3 bg-${item.color}-100 rounded mb-3`}>
                    <p className="text-xs text-gray-800">
                      <strong>🔧 활용 시스템:</strong> {item.system}
                    </p>
                  </div>
                )}

                {item.checkpoints && (
                  <div className={`p-3 bg-${item.color}-100 rounded mb-3`}>
                    <p className="text-xs font-bold text-gray-800 mb-1">📊 점검 기준</p>
                    <ul className="space-y-0.5">
                      {item.checkpoints.map((cp, cpIdx) => (
                        <li key={cpIdx} className="text-xs text-gray-700 flex items-center gap-1">
                          <span className={`text-${item.color}-600`}>▸</span>
                          <span>{cp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {item.risk && (
                  <div className={`p-3 bg-${item.color}-200 border-l-2 border-${item.color}-600 rounded`}>
                    <p className="text-xs text-gray-800">
                      <strong>⚠️ 리스크 관리:</strong> {item.risk}
                    </p>
                  </div>
                )}

                {item.strategy && (
                  <div className={`p-3 bg-${item.color}-200 border-l-2 border-${item.color}-600 rounded`}>
                    <p className="text-xs text-gray-800">
                      <strong>💡 구매 전략:</strong> {item.strategy}
                    </p>
                  </div>
                )}

                {item.emergency && (
                  <div className={`p-3 bg-${item.color}-200 border-l-2 border-${item.color}-600 rounded`}>
                    <p className="text-xs text-gray-800">
                      <strong>🚨 긴급 대응:</strong> {item.emergency}
                    </p>
                  </div>
                )}
              </div>
            ))}
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
