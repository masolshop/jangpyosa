"use client"

export default function EmploymentLevyPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8" style={{ marginLeft: '350px' }}>
      <div className="max-w-7xl mx-auto">
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
              <strong>장애인 고용부담금</strong>은 상시 50명 이상의 근로자를 고용하는 사업주가 
              의무고용률(민간기업 3.1%)을 달성하지 못했을 때 납부해야 하는 부담금입니다.
            </p>
            <p className="leading-relaxed">
              부담금은 미달 인원 1명당 월 단위로 부과되며, 매년 최저임금 인상에 따라 조정됩니다.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">📊 2024년 기준 부담금</h2>
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
                  <td className="px-6 py-4 text-sm text-gray-900">상시근로자 100명 미만</td>
                  <td className="px-6 py-4 text-sm text-red-600 font-bold">1,168,000원</td>
                  <td className="px-6 py-4 text-sm text-red-700 font-bold">14,016,000원</td>
                </tr>
                <tr className="hover:bg-red-50">
                  <td className="px-6 py-4 text-sm text-gray-900">상시근로자 100명 이상</td>
                  <td className="px-6 py-4 text-sm text-red-600 font-bold">1,340,000원</td>
                  <td className="px-6 py-4 text-sm text-red-700 font-bold">16,080,000원</td>
                </tr>
              </tbody>
            </table>
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
