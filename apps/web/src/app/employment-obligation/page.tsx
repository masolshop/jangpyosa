"use client"

export default function EmploymentObligationPage() {
  return (
    <div className="min-h-screen bg-gray-50 pl-0 pr-4 md:pr-8 py-2 md:py-4" style={{ paddingLeft: 0 }}>
      <div className="max-w-7xl ml-0">
        {/* 헤더 */}
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
            장애인 고용의무제도
          </h1>
          <p className="text-sm md:text-base text-gray-600">
            장애인 고용촉진 및 직업재활법에 따른 장애인 의무고용제도 안내
          </p>
        </div>

        {/* 제도 개요 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-3xl">📋</span>
            제도 개요
          </h2>
          <div className="space-y-4 text-gray-700">
            <p className="leading-relaxed">
              장애인 고용의무제도는 <strong>「장애인고용촉진 및 직업재활법」</strong>에 따라 
              일정 규모 이상의 사업주에게 장애인을 의무적으로 고용하도록 하는 제도입니다.
            </p>
            <p className="leading-relaxed">
              이 제도는 장애인의 고용을 촉진하고 직업재활을 도모하여 장애인의 자립과 
              사회참여를 지원하기 위한 목적으로 운영됩니다.
            </p>
          </div>
        </div>

        {/* 의무고용률 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-3xl">📊</span>
            2026년 의무고용률
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-blue-500 to-purple-600">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-bold text-white uppercase tracking-wider">
                    사업주 구분
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-bold text-white uppercase tracking-wider">
                    상시근로자 수
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-bold text-white uppercase tracking-wider">
                    의무고용률
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr className="hover:bg-blue-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-900 font-semibold">국가 및 지방자치단체</td>
                  <td className="px-6 py-4 text-sm text-gray-700">100명 이상</td>
                  <td className="px-6 py-4 text-sm text-blue-600 font-bold">3.8%</td>
                </tr>
                <tr className="hover:bg-blue-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-900 font-semibold">공공기관</td>
                  <td className="px-6 py-4 text-sm text-gray-700">100명 이상</td>
                  <td className="px-6 py-4 text-sm text-blue-600 font-bold">3.8%</td>
                </tr>
                <tr className="hover:bg-blue-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-900 font-semibold">민간기업 (100명 이상)</td>
                  <td className="px-6 py-4 text-sm text-gray-700">100명 이상</td>
                  <td className="px-6 py-4 text-sm text-blue-600 font-bold">3.1%</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              💡 <strong>참고:</strong> 2026년 기준 의무고용률입니다. 상시근로자 100명 이상 사업장이 대상입니다.
            </p>
          </div>
        </div>

        {/* 고용의무 대상 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-3xl">🎯</span>
            고용의무 대상
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">의무 대상 사업주</h3>
              <ul className="space-y-2 text-sm text-blue-800">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">✓</span>
                  <span><strong>상시 100명 이상</strong>의 근로자를 고용하는 사업주</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">✓</span>
                  <span>국가, 지방자치단체, 공공기관 (100명 이상)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">✓</span>
                  <span>민간기업 (상시근로자 100명 이상)</span>
                </li>
              </ul>
            </div>
            <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
              <h3 className="text-lg font-semibold text-purple-900 mb-3">고용의무 대상 장애인</h3>
              <ul className="space-y-2 text-sm text-purple-800">
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 font-bold">✓</span>
                  <span>「장애인복지법」에 따른 장애인</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 font-bold">✓</span>
                  <span>「국가유공자 등 예우 및 지원에 관한 법률」에 따른 상이자</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 font-bold">✓</span>
                  <span>장애인 고용으로 인정받을 수 있는 근로자</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* 미이행 시 부담금 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-3xl">⚠️</span>
            미이행 시 고용부담금 (2026년 기준)
          </h2>
          <div className="space-y-4">
            <p className="text-gray-700 leading-relaxed">
              장애인 의무고용률을 달성하지 못한 사업주(상시근로자 100명 이상)는 <strong className="text-red-600">고용부담금</strong>을 
              납부해야 합니다. 부담금은 미달 인원 1명당 월 단위로 부과됩니다.
            </p>
            <div className="p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-500 mb-4">
              <p className="text-sm text-yellow-800">
                💡 <strong>참고:</strong> 상시근로자 100명 미만 사업장은 고용부담금 납부 의무가 없습니다.
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-red-500 to-pink-600">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-bold text-white uppercase tracking-wider">
                      사업주 규모
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-bold text-white uppercase tracking-wider">
                      월 부담금 (미달 인원 1명당)
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-bold text-white uppercase tracking-wider">
                      연간 부담금 (1명당)
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr className="hover:bg-red-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-900">상시근로자 100명 이상</td>
                    <td className="px-6 py-4 text-sm text-red-600 font-bold">1,404,900원</td>
                    <td className="px-6 py-4 text-sm text-red-700 font-bold">16,858,800원</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="p-4 bg-red-50 rounded-lg">
              <p className="text-sm text-red-800">
                ⚠️ <strong>주의:</strong> 2026년 기준 부담금입니다. 최저임금 인상에 따라 매년 조정됩니다.
              </p>
            </div>
          </div>
        </div>

        {/* 지원 제도 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-3xl">🎁</span>
            장애인 고용 지원제도
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
              <h3 className="text-lg font-semibold text-green-900 mb-2">고용장려금</h3>
              <p className="text-sm text-green-800">
                장애인을 고용한 사업주에게 지급되는 장려금으로, 장애 정도와 성별에 따라 차등 지급
              </p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">시설·장비 지원</h3>
              <p className="text-sm text-blue-800">
                장애인 작업시설, 편의시설 설치 및 장비 구입 비용 지원
              </p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg border-l-4 border-purple-500">
              <h3 className="text-lg font-semibold text-purple-900 mb-2">연계고용 감면</h3>
              <p className="text-sm text-purple-800">
                장애인표준사업장과 도급계약을 체결하여 고용부담금 감면 혜택
              </p>
            </div>
          </div>
        </div>

        {/* CTA 섹션 */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-lg p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-4">장애인 고용의무, 어떻게 이행하시겠습니까?</h2>
          <p className="mb-6 text-blue-100">
            장표사닷컴에서 제공하는 다양한 솔루션으로 고용의무를 효율적으로 이행하세요
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/calculators/levy-annual"
              className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
            >
              📊 고용부담금 계산하기
            </a>
            <a
              href="/catalog"
              className="bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-800 transition-colors"
            >
              🛒 연계고용 상품 둘러보기
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
