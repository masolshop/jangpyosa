"use client"

export default function PurchaseBestCasesPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-2 md:p-4">
      <div className="max-w-7xl">
        {/* 헤더 */}
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
            공공기관 우수구매사례
          </h1>
          <p className="text-sm md:text-base text-gray-600">
            장애인 표준사업장 생산품 구매실적 및 계획 (2024~2025년)
          </p>
        </div>

        {/* 고용노동부 공고 */}
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
        </div>

        {/* 제도 개요 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-3xl">📋</span>
            장애인 표준사업장 생산품 우선구매제도 개요
          </h2>
          <div className="space-y-4">
            <div className="p-5 bg-blue-50 rounded-lg border-l-4 border-blue-500">
              <h3 className="font-bold text-blue-900 mb-2">제도 목적</h3>
              <p className="text-sm text-blue-800 leading-relaxed">
                장애인에게 안정된 일자리를 제공하는 장애인 표준사업장의 판로 확대를 위해, 
                공공기관은 물품 또는 용역 구매 시 <strong className="text-blue-900">총 구매액의 0.8% 이상('24년 기준)</strong>을 
                장애인 표준사업장 생산품으로 구매하여야 함
              </p>
            </div>
            <div className="p-5 bg-green-50 rounded-lg border-l-4 border-green-500">
              <h3 className="font-bold text-green-900 mb-2">공고 취지</h3>
              <p className="text-sm text-green-800 leading-relaxed">
                공공기관의 장애인 표준사업장 생산품에 대한 전년도 구매실적과 해당연도 구매계획을 
                공고함으로써, 장애인 표준사업장 생산품 우선구매제도의 실효성 제고
              </p>
            </div>
          </div>
        </div>

        {/* 법적 근거 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-3xl">⚖️</span>
            법적 근거
          </h2>
          <div className="space-y-3">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-700">
                <strong>• 「장애인고용촉진 및 직업재활법」</strong> 제22조의3
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-700">
                <strong>• 같은 법 시행령</strong> 제21조의5
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-700">
                <strong>• 같은 법 시행규칙</strong> 제7조의3
              </p>
            </div>
          </div>
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800 leading-relaxed">
              <strong>📌 공공기관의 의무:</strong> 공공기관의 장은 장애인 표준사업장 생산품 구매계획과 
              전년도 구매실적을 고용노동부 장관에게 통보하여야 하고, 고용노동부 장관은 이를 종합하여 
              매년 4월 30일까지 고용노동부 홈페이지에 게시하여야 함
            </p>
          </div>
        </div>

        {/* 대상 공공기관 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-3xl">🏢</span>
            대상 공공기관 (총 851개)
          </h2>
          <div className="grid md:grid-cols-4 gap-4">
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
                className={`p-4 bg-${item.color}-50 rounded-lg border-l-4 border-${item.color}-500 text-center cursor-pointer hover:bg-${item.color}-100 transition-all hover:shadow-md transform hover:scale-105`}
                onClick={() => {
                  // 카테고리별 필터링 기능 (향후 구현 가능)
                  console.log(`${item.category} 클릭됨`);
                }}
              >
                <div className="text-3xl mb-2">{item.icon}</div>
                <p className={`text-sm font-semibold text-${item.color}-900`}>{item.category}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-700 text-center">
              <strong>대상:</strong> 「중소기업제품 구매촉진 및 판로지원에 관한 법률」 제2조제2호에 따른 공공기관
            </p>
          </div>
        </div>

        {/* PDF 다운로드 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-3xl">📄</span>
            상세 자료 다운로드
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

        {/* CTA */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-lg p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-4">공공기관 구매 실적을 확인하세요</h2>
          <p className="mb-6 text-blue-100">
            851개 공공기관의 2024년 구매실적과 2025년 구매계획을 상세히 확인할 수 있습니다
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/priority-purchase"
              className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
            >
              🏛️ 우선구매제도 알아보기
            </a>
            <a
              href="/catalog"
              className="bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-800 transition-colors"
            >
              🛒 표준사업장 생산품 보기
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
