"use client"

export default function PurchaseBestCasesPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8" style={{ marginLeft: '350px' }}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
            공공기관 우수구매사례
          </h1>
          <p className="text-sm md:text-base text-gray-600">
            공공기관의 장애인생산품 우수구매사례 자료집
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-3xl">⭐</span>
            우수구매사례 안내
          </h2>
          <div className="space-y-4 text-gray-700">
            <p className="leading-relaxed">
              공공기관의 장애인생산품 우선구매 우수사례를 PDF 자료로 제공합니다.
              각 기관의 구매 전략, 실적, 성과 등을 참고하여 귀사의 구매 계획 수립에 활용하세요.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">📄 자료 다운로드</h2>
          <div className="space-y-4">
            <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border-2 border-blue-200">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 text-5xl">📊</div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    2024년 공공기관 우수구매사례집
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    주요 공공기관의 장애인생산품 구매 우수사례, 구매 프로세스, 실적 분석 등을 담은 종합 자료집입니다.
                  </p>
                  <div className="flex gap-3">
                    <button
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
                      onClick={() => alert('PDF 다운로드 기능은 준비 중입니다.')}
                    >
                      <span>📥</span>
                      <span>다운로드</span>
                    </button>
                    <button
                      className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg font-semibold hover:bg-gray-300 transition-colors flex items-center gap-2"
                      onClick={() => alert('미리보기 기능은 준비 중입니다.')}
                    >
                      <span>👁️</span>
                      <span>미리보기</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <p className="text-sm text-yellow-800 flex items-start gap-2">
                <span className="text-lg">💡</span>
                <span>
                  <strong>참고:</strong> 자료는 매년 업데이트됩니다. 최신 자료는 공공기관별 구매 실적 보고서를 참고하시기 바랍니다.
                </span>
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">🏛️ 주요 우수사례 기관</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { name: "대전광역시", amount: "6.8억원", year: "2019-2024" },
              { name: "인천광역시 부평구", amount: "8.3억원", year: "2025" },
              { name: "한국동서발전", amount: "6.2억원", year: "2019-2024" },
            ].map((item) => (
              <div key={item.name} className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">{item.name}</h3>
                <p className="text-sm text-gray-600">구매액: <span className="font-bold text-blue-600">{item.amount}</span></p>
                <p className="text-sm text-gray-600">기간: {item.year}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-lg p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-4">실제 구매사례를 참고하세요</h2>
          <p className="mb-6 text-blue-100">
            다른 기관들은 어떻게 구매했을까요? 상세 사례를 확인해보세요.
          </p>
          <a
            href="/purchase-cases"
            className="inline-block bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
          >
            📦 구매사례 데이터 보기
          </a>
        </div>
      </div>
    </div>
  )
}
