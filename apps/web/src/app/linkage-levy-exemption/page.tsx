"use client"

export default function LinkageLevyExemptionPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8" style={{ marginLeft: '350px' }}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
            연계고용 부담금 감면제도
          </h1>
          <p className="text-sm md:text-base text-gray-600">
            장애인표준사업장과의 도급계약을 통한 고용부담금 감면 안내
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-3xl">📉</span>
            연계고용 감면제도란?
          </h2>
          <div className="space-y-4 text-gray-700">
            <p className="leading-relaxed">
              <strong>연계고용 부담금 감면제도</strong>는 장애인 의무고용률을 달성하지 못한 기업이 
              장애인표준사업장과 도급계약을 체결하여 <strong className="text-blue-600">고용부담금을 감면</strong>받을 수 있는 제도입니다.
            </p>
            <p className="leading-relaxed">
              장애인표준사업장에 도급을 주고 해당 사업장에서 근무하는 장애인 근로자 수만큼 
              의무고용인원으로 인정받아 부담금을 절감할 수 있습니다.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">💡 감면 혜택</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
              <h3 className="text-xl font-semibold text-green-900 mb-3">최대 감면율</h3>
              <p className="text-4xl font-bold text-green-600 mb-2">75%</p>
              <p className="text-sm text-green-800">
                장애인 근로자 1인당 고용부담금의 75%까지 감면 가능
              </p>
            </div>
            <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
              <h3 className="text-xl font-semibold text-blue-900 mb-3">감면 한도</h3>
              <p className="text-4xl font-bold text-blue-600 mb-2">50%</p>
              <p className="text-sm text-blue-800">
                전체 의무고용인원의 50%까지 연계고용으로 인정
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">📋 신청 절차</h2>
          <div className="space-y-4">
            {[
              { step: 1, title: "장애인표준사업장 선정", desc: "인증된 표준사업장과 상담" },
              { step: 2, title: "도급계약 체결", desc: "생산품 또는 서비스 도급계약 체결" },
              { step: 3, title: "이행 실적 보고", desc: "분기별 도급계약 이행실적 보고" },
              { step: 4, title: "감면 신청", desc: "연간 고용부담금 신고 시 감면 신청" },
            ].map((item) => (
              <div key={item.step} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                  {item.step}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                  <p className="text-sm text-gray-600">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-lg p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-4">연계고용으로 부담금을 절감하세요!</h2>
          <p className="mb-6 text-blue-100">
            장표사닷컴에서 인증된 장애인표준사업장과 연결해드립니다
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/catalog"
              className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
            >
              🛒 연계고용 상품 보기
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
