"use client"

export default function EmploymentLevyPage() {
  return (
    <div className="min-h-screen bg-gray-50 pl-0 pr-4 md:pr-8 py-2 md:py-4">
      <div className="max-w-7xl ml-0">
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
            장애인 고용부담금 제도
          </h1>
          <p className="text-sm md:text-base text-gray-600">
            장애인 의무고용률 미달 시 납부하는 고용부담금 안내
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-3xl">💰</span>
            고용부담금이란?
          </h2>
          <div className="space-y-4 text-gray-700">
            <p className="leading-relaxed">
              <strong>장애인 고용부담금</strong>은 상시 <strong className="text-blue-600">100명 이상</strong>의 근로자를 고용하는 사업주가 
              의무고용률(민간기업 3.1%)을 달성하지 못했을 때 납부해야 하는 부담금입니다.
            </p>
            <p className="leading-relaxed">
              부담금은 미달 인원 1명당 월 단위로 부과되며, 매년 최저임금 인상에 따라 조정됩니다.
            </p>
            <div className="mt-4 p-4 bg-yellow-50 border-l-4 border-yellow-500">
              <p className="text-sm text-yellow-800">
                <strong>⚠️ 중요:</strong> 2026년부터는 <strong>상시근로자 100명 이상</strong> 사업장만 
                장애인 고용의무 대상이며, 부담금 납부 의무가 있습니다.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">📊 2026년 기준 부담금</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-red-500 to-pink-600">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-bold text-white">사업주 규모</th>
                  <th className="px-6 py-3 text-left text-sm font-bold text-white">월 부담금 (1인당)</th>
                  <th className="px-6 py-3 text-left text-sm font-bold text-white">연간 부담금 (1인당)</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr className="hover:bg-red-50">
                  <td className="px-6 py-4 text-sm text-gray-900">상시근로자 100명 이상</td>
                  <td className="px-6 py-4 text-sm text-red-600 font-bold">1,404,900원</td>
                  <td className="px-6 py-4 text-sm text-red-700 font-bold">16,858,800원</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              💡 <strong>참고:</strong> 2026년 최저임금(10,030원) 기준으로 산정된 부담금입니다. 
              매년 최저임금 변동에 따라 조정됩니다.
            </p>
          </div>
        </div>

        {/* 세무 처리 안내 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-3xl">🧾</span>
            세무 처리 안내
          </h2>
          <div className="space-y-4">
            <div className="p-5 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
              <h3 className="text-lg font-bold text-red-900 mb-2 flex items-center gap-2">
                <span>⚠️</span>
                법인세/종합소득세 손금불산입
              </h3>
              <div className="space-y-2 text-sm text-red-800">
                <p className="leading-relaxed">
                  장애인 고용부담금은 <strong className="text-red-900">법인세법 및 소득세법상 손금(비용)으로 인정되지 않습니다.</strong>
                </p>
                <ul className="space-y-1 ml-4">
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 font-bold mt-0.5">•</span>
                    <span><strong>법인세 신고 시:</strong> 부담금은 손금불산입 항목으로 세무조정 필요</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 font-bold mt-0.5">•</span>
                    <span><strong>종합소득세 신고 시:</strong> 사업소득 계산 시 필요경비로 인정 불가</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 font-bold mt-0.5">•</span>
                    <span><strong>회계 처리:</strong> 비용으로 회계처리하되, 세무조정 시 가산 조정</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="p-5 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">💡 절세 포인트</h3>
              <p className="text-sm text-blue-800 leading-relaxed">
                고용부담금은 손금불산입되어 실질적인 세부담이 증가합니다. 
                <strong className="text-blue-900">연계고용 감면제도</strong>를 활용하면 부담금 자체를 감면받아 
                실질적인 절세 효과를 얻을 수 있습니다.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-lg p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-4">고용부담금 계산이 필요하신가요?</h2>
          <p className="mb-6 text-blue-100">
            우리 회사의 고용부담금을 정확하게 계산해보세요
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/calculators/levy-annual"
              className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
            >
              📊 고용부담금 계산하기
            </a>
            <a
              href="/linkage-levy-exemption"
              className="bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-800 transition-colors"
            >
              📉 부담금 감면 방법 보기
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
