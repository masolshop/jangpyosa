"use client"

export default function StandardWorkplaceEstablishmentPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* 헤더 */}
        <div className="text-center mb-12">
          <div className="text-6xl mb-4">🏭</div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            장애인표준사업장 설립
          </h1>
          <p className="text-lg md:text-xl text-gray-700 max-w-3xl mx-auto">
            장애인 고용 확대와 기업의 사회적 가치를 실현하는 표준사업장 설립을 지원합니다
          </p>
        </div>

        {/* 표준사업장이란 */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border-2 border-indigo-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="text-4xl">📋</div>
            <h2 className="text-2xl font-bold text-gray-900">장애인표준사업장이란?</h2>
          </div>
          <div className="space-y-4 text-gray-700 leading-relaxed text-base md:text-lg">
            <p>
              <strong className="text-indigo-600">장애인표준사업장</strong>은 장애인 고용촉진 및 직업재활법에 따라 
              <strong className="text-blue-600"> 장애인 근로자 10명 이상</strong>을 고용하고, 
              <strong className="text-purple-600"> 전체 근로자의 30% 이상</strong>이 장애인이며, 
              장애인의 <strong className="text-green-600">고용안정과 직업생활 향상</strong>을 도모하기 위한 
              각종 편의시설 및 부대시설을 갖춘 사업장을 말합니다.
            </p>
          </div>
        </div>

        {/* 인증 요건 */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border-2 border-blue-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="text-4xl">✅</div>
            <h2 className="text-2xl font-bold text-gray-900">인증 요건</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-6 rounded-xl border border-indigo-200">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-3xl">👥</span>
                <h3 className="text-xl font-bold text-gray-900">인원 요건</h3>
              </div>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-indigo-600 font-bold">•</span>
                  <span>장애인 근로자 <strong className="text-indigo-600">10명 이상</strong> 고용</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-600 font-bold">•</span>
                  <span>전체 근로자 대비 <strong className="text-indigo-600">30% 이상</strong>이 장애인</span>
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-200">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-3xl">🏢</span>
                <h3 className="text-xl font-bold text-gray-900">시설 요건</h3>
              </div>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 font-bold">•</span>
                  <span>장애인 <strong className="text-purple-600">편의시설</strong> 구비</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 font-bold">•</span>
                  <span>직업재활 관련 <strong className="text-purple-600">부대시설</strong> 갖춤</span>
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-teal-50 p-6 rounded-xl border border-green-200">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-3xl">📊</span>
                <h3 className="text-xl font-bold text-gray-900">운영 요건</h3>
              </div>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">•</span>
                  <span><strong className="text-green-600">장애인 고용안정</strong> 도모</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">•</span>
                  <span><strong className="text-green-600">직업생활 향상</strong> 프로그램 운영</span>
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-red-50 p-6 rounded-xl border border-orange-200">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-3xl">⚖️</span>
                <h3 className="text-xl font-bold text-gray-900">법적 요건</h3>
              </div>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-orange-600 font-bold">•</span>
                  <span>고용노동부 장관 <strong className="text-orange-600">인증</strong> 필수</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-600 font-bold">•</span>
                  <span>관련 법규 <strong className="text-orange-600">준수</strong></span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* 혜택 */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border-2 border-green-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="text-4xl">🎁</div>
            <h2 className="text-2xl font-bold text-gray-900">표준사업장 혜택</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-blue-50 p-6 rounded-xl border-2 border-blue-200 hover:shadow-lg transition-shadow">
              <div className="text-center mb-4">
                <div className="text-5xl mb-2">💰</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">세제 혜택</h3>
              </div>
              <ul className="space-y-2 text-gray-700 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">✓</span>
                  <span>법인세·소득세 <strong>감면</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">✓</span>
                  <span>재산세 <strong>50% 감면</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">✓</span>
                  <span>취득세 <strong>면제</strong></span>
                </li>
              </ul>
            </div>

            <div className="bg-green-50 p-6 rounded-xl border-2 border-green-200 hover:shadow-lg transition-shadow">
              <div className="text-center mb-4">
                <div className="text-5xl mb-2">🏛️</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">우선 구매</h3>
              </div>
              <ul className="space-y-2 text-gray-700 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span>공공기관 <strong>우선구매</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span><strong>수의계약</strong> 가능</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span><strong>금액 제한 없음</strong></span>
                </li>
              </ul>
            </div>

            <div className="bg-purple-50 p-6 rounded-xl border-2 border-purple-200 hover:shadow-lg transition-shadow">
              <div className="text-center mb-4">
                <div className="text-5xl mb-2">💸</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">지원금</h3>
              </div>
              <ul className="space-y-2 text-gray-700 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-purple-600">✓</span>
                  <span>시설·장비 <strong>지원금</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600">✓</span>
                  <span>인건비 <strong>보조금</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600">✓</span>
                  <span>운영비 <strong>지원</strong></span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* 설립 절차 */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border-2 border-purple-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="text-4xl">📝</div>
            <h2 className="text-2xl font-bold text-gray-900">설립 절차</h2>
          </div>
          <div className="space-y-4">
            {[
              { step: 1, title: "사업 계획 수립", desc: "사업 목적, 규모, 고용 계획 등을 포함한 사업계획서 작성", color: "blue" },
              { step: 2, title: "시설 확보 및 준비", desc: "장애인 편의시설 및 작업 공간 확보, 필요 장비 구입", color: "green" },
              { step: 3, title: "장애인 근로자 채용", desc: "10명 이상의 장애인 근로자 채용 (전체의 30% 이상)", color: "purple" },
              { step: 4, title: "인증 신청", desc: "고용노동부에 표준사업장 인증 신청 및 서류 제출", color: "orange" },
              { step: 5, title: "현장 심사", desc: "고용노동부의 현장 실사 및 요건 적합성 심사", color: "red" },
              { step: 6, title: "인증 취득", desc: "표준사업장 인증서 발급 및 각종 혜택 적용", color: "indigo" }
            ].map((item) => (
              <div key={item.step} className={`bg-gradient-to-r from-${item.color}-50 to-${item.color}-100 p-6 rounded-xl border-2 border-${item.color}-200`}>
                <div className="flex items-start gap-4">
                  <div className={`flex-shrink-0 w-12 h-12 bg-${item.color}-600 text-white rounded-full flex items-center justify-center text-xl font-bold`}>
                    {item.step}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                    <p className="text-gray-700">{item.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl shadow-2xl p-8 md:p-12 text-center text-white">
          <div className="text-6xl mb-4">🚀</div>
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            장애인표준사업장 설립을 준비하시나요?
          </h2>
          <p className="text-lg mb-8 opacity-90">
            전문 컨설턴트가 설립부터 인증까지 전 과정을 지원합니다
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/catalog"
              className="bg-white text-indigo-600 px-8 py-4 rounded-lg text-lg font-bold hover:bg-gray-100 transition-colors shadow-lg"
            >
              💡 맞춤 컨설팅 신청
            </a>
            <a
              href="/contact"
              className="bg-indigo-800 text-white px-8 py-4 rounded-lg text-lg font-bold hover:bg-indigo-900 transition-colors"
            >
              📞 상담 문의
            </a>
          </div>
        </div>

        {/* 관련 링크 */}
        <div className="mt-8 grid md:grid-cols-3 gap-4">
          <a
            href="/employment-levy-obligation"
            className="bg-blue-600 text-white p-6 rounded-xl text-center hover:bg-blue-700 transition-colors shadow-lg"
          >
            <div className="text-4xl mb-2">📋</div>
            <div className="font-bold">장애인의무고용부담금</div>
          </a>
          <a
            href="/linkage-levy-exemption-system"
            className="bg-purple-600 text-white p-6 rounded-xl text-center hover:bg-purple-700 transition-colors shadow-lg"
          >
            <div className="text-4xl mb-2">📉</div>
            <div className="font-bold">연계고용부담금감면제도</div>
          </a>
          <a
            href="/public-purchase-system"
            className="bg-green-600 text-white p-6 rounded-xl text-center hover:bg-green-700 transition-colors shadow-lg"
          >
            <div className="text-4xl mb-2">🏛️</div>
            <div className="font-bold">공공기관우선구매제도</div>
          </a>
        </div>
      </div>
    </div>
  )
}
