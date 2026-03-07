"use client"

export default function StandardWorkplaceEstablishmentPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="text-center mb-12">
          <div className="text-6xl mb-4">🏭</div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            장애인표준사업장 및 자회사형 설립컨설팅
          </h1>
          <p className="text-lg md:text-xl text-gray-700 max-w-4xl mx-auto">
            장애인 고용 확대와 기업의 사회적 가치를 실현하는 표준사업장 및 자회사형 표준사업장 설립을 지원합니다
          </p>
        </div>

        {/* 두 가지 유형 비교 */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* 일반 표준사업장 */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-blue-100">
            <div className="text-center mb-6">
              <div className="text-5xl mb-3">🏢</div>
              <h2 className="text-2xl font-bold text-gray-900">일반 표준사업장</h2>
              <p className="text-sm text-gray-600 mt-2">독립적인 장애인 고용 사업장</p>
            </div>
            <div className="space-y-3 text-gray-700">
              <div className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span>장애인 근로자 <strong className="text-blue-600">10명 이상</strong> 고용</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span>전체 근로자의 <strong className="text-blue-600">30% 이상</strong>이 장애인</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span>중증장애인 비율 차등 적용</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span>장애인 편의시설 구비 필수</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span>최저임금 이상 지급</span>
              </div>
            </div>
          </div>

          {/* 자회사형 표준사업장 */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-purple-100">
            <div className="text-center mb-6">
              <div className="text-5xl mb-3">🏭</div>
              <h2 className="text-2xl font-bold text-gray-900">자회사형 표준사업장</h2>
              <p className="text-sm text-gray-600 mt-2">모회사의 고용률에 산입되는 자회사</p>
            </div>
            <div className="space-y-3 text-gray-700">
              <div className="flex items-start gap-2">
                <span className="text-purple-600 font-bold">•</span>
                <span>모회사가 <strong className="text-purple-600">50% 초과 출자</strong></span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-purple-600 font-bold">•</span>
                <span>일반 표준사업장 요건 동일 적용</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-purple-600 font-bold">•</span>
                <span>자회사 장애인을 <strong className="text-purple-600">모회사 고용으로 인정</strong></span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-purple-600 font-bold">•</span>
                <span>고용부담금 대폭 감면</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-purple-600 font-bold">•</span>
                <span>기업 이미지 상승 효과</span>
              </div>
            </div>
          </div>
        </div>

        {/* 자회사형 표준사업장 상세 설명 */}
        <div className="bg-gradient-to-br from-purple-100 to-indigo-100 rounded-2xl shadow-xl p-8 mb-8 border-2 border-purple-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="text-4xl">🌟</div>
            <h2 className="text-2xl font-bold text-gray-900">자회사형 표준사업장이란?</h2>
          </div>
          <div className="space-y-4 text-gray-800 leading-relaxed text-base md:text-lg">
            <p>
              <strong className="text-purple-700">자회사형 표준사업장제도</strong>는 고용의무사업주(모회사)가 
              장애인 고용을 목적으로 일정 요건을 갖춘 자회사를 설립할 경우, 
              자회사에서 고용한 장애인을 <strong className="text-indigo-700">모회사에서 고용한 것으로 간주</strong>하여 
              고용률에 산입하는 제도입니다.
            </p>
            <p className="bg-white/80 p-4 rounded-lg border-l-4 border-purple-600">
              자회사를 설립하여 장애인을 <strong className="text-purple-700">간접 고용</strong>함으로써 
              사회적 책임(CSR)을 다하고, <strong className="text-indigo-700">기업의 이미지 상승</strong> 효과까지 
              누릴 수 있는 새로운 장애인고용 모델입니다.
            </p>
          </div>
        </div>

        {/* 자회사형 설립 요건 */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border-2 border-indigo-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="text-4xl">✅</div>
            <h2 className="text-2xl font-bold text-gray-900">자회사형 설립 요건</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-200">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-3xl">👥</span>
                <h3 className="text-xl font-bold text-gray-900">인원 요건</h3>
              </div>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 font-bold">•</span>
                  <span>장애인 근로자 <strong className="text-purple-600">10명 이상</strong> 고용</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 font-bold">•</span>
                  <span>전체 근로자 대비 <strong className="text-purple-600">30% 이상</strong>이 장애인</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 font-bold">•</span>
                  <span>중증장애인 비율 업체 규모별 차등:</span>
                </li>
                <li className="pl-4 text-sm">
                  <div className="bg-purple-50 p-2 rounded">
                    <div>- 100명 미만: 상시의 15%</div>
                    <div>- 100~300명: 상시의 10% + 5명</div>
                    <div>- 300명 이상: 상시의 5% + 20명</div>
                  </div>
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-6 rounded-xl border border-indigo-200">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-3xl">🏢</span>
                <h3 className="text-xl font-bold text-gray-900">지배구조 요건</h3>
              </div>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-indigo-600 font-bold">•</span>
                  <span>모회사가 발행주식/출자총액의 <strong className="text-indigo-600">50% 초과</strong> 실질 지배</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-600 font-bold">•</span>
                  <span>또는 <strong className="text-indigo-600">2개 이상</strong> 고용의무사업주 공동출자</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-600 font-bold">•</span>
                  <span>2025년부터 <strong className="text-indigo-600">지주회사 공동투자</strong> 허용</span>
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-teal-50 p-6 rounded-xl border border-green-200">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-3xl">💰</span>
                <h3 className="text-xl font-bold text-gray-900">임금 요건</h3>
              </div>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">•</span>
                  <span>장애인 근로자에게 <strong className="text-green-600">최저임금 이상</strong> 지급</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">•</span>
                  <span><strong className="text-green-600">정규직 고용</strong> 원칙</span>
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-red-50 p-6 rounded-xl border border-orange-200">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-3xl">🏗️</span>
                <h3 className="text-xl font-bold text-gray-900">시설 요건</h3>
              </div>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-orange-600 font-bold">•</span>
                  <span><strong className="text-orange-600">장애인 편의시설</strong> 구비 필수</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-600 font-bold">•</span>
                  <span>「장애인·노인·임산부 등의 편의증진보장에 관한 법률」 준수</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* 자회사형 설립 효과 실제 사례 */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-2xl p-8 mb-8 text-white">
          <div className="text-center mb-6">
            <div className="text-5xl mb-3">📊</div>
            <h2 className="text-2xl md:text-3xl font-bold">자회사형 설립 효과 (실제 사례)</h2>
            <p className="text-sm opacity-90 mt-2">의무고용률 3.1% 기준, 상시근로자 1,000명 대기업</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* 설립 전 */}
            <div className="bg-white/10 backdrop-blur p-6 rounded-xl border border-white/20">
              <h3 className="text-xl font-bold mb-4 text-yellow-300">⚠️ 설립 전 (모회사)</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-white/5 rounded">
                  <span>상시근로자</span>
                  <strong className="text-2xl">1,000명</strong>
                </div>
                <div className="flex justify-between items-center p-3 bg-white/5 rounded">
                  <span>의무고용인원</span>
                  <strong className="text-2xl text-orange-300">31명</strong>
                </div>
                <div className="flex justify-between items-center p-3 bg-white/5 rounded">
                  <span>장애인근로자</span>
                  <strong className="text-2xl text-red-300">1명</strong>
                </div>
                <div className="flex justify-between items-center p-3 bg-red-500/30 rounded border-2 border-red-400">
                  <span>미고용인원</span>
                  <strong className="text-2xl text-red-200">30명</strong>
                </div>
                <div className="flex justify-between items-center p-3 bg-red-500/30 rounded">
                  <span>장애인고용률</span>
                  <strong className="text-2xl text-red-200">0.1%</strong>
                </div>
                <div className="flex justify-between items-center p-3 bg-red-500/40 rounded border-2 border-red-400">
                  <span className="text-sm">고용부담금</span>
                  <strong className="text-xl text-yellow-200">약 7억 5천만원/년</strong>
                </div>
              </div>
            </div>

            {/* 설립 후 */}
            <div className="bg-white/10 backdrop-blur p-6 rounded-xl border border-white/20">
              <h3 className="text-xl font-bold mb-4 text-green-300">✅ 설립 후 (모회사 + 자회사)</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-white/5 rounded">
                  <span>상시근로자</span>
                  <strong className="text-2xl">1,040명</strong>
                </div>
                <div className="flex justify-between items-center p-3 bg-white/5 rounded">
                  <span>의무고용인원</span>
                  <strong className="text-2xl text-orange-300">32명</strong>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-500/30 rounded border-2 border-green-400">
                  <span>장애인근로자</span>
                  <strong className="text-2xl text-green-200">33명</strong>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-500/30 rounded border-2 border-green-400">
                  <span>미고용인원</span>
                  <strong className="text-2xl text-green-200">0명</strong>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-500/30 rounded">
                  <span>장애인고용률</span>
                  <strong className="text-2xl text-green-200">3.17%</strong>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-500/40 rounded border-2 border-green-400">
                  <span className="text-sm">고용부담금</span>
                  <strong className="text-xl text-yellow-200">0원/년</strong>
                </div>
              </div>
            </div>
          </div>

          {/* 자회사 구성 */}
          <div className="mt-6 bg-white/10 backdrop-blur p-6 rounded-xl border border-white/20">
            <h3 className="text-xl font-bold mb-4 text-purple-300">🏭 자회사 구성 (상시근로자 40명)</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-purple-500/30 rounded-lg">
                <div className="text-3xl mb-2">💪</div>
                <div className="text-sm opacity-90">중증장애인</div>
                <div className="text-2xl font-bold">10명</div>
                <div className="text-xs opacity-75">(2배수 인정)</div>
              </div>
              <div className="text-center p-4 bg-pink-500/30 rounded-lg">
                <div className="text-3xl mb-2">👩</div>
                <div className="text-sm opacity-90">경증여성장애인</div>
                <div className="text-2xl font-bold">8명</div>
                <div className="text-xs opacity-75">(1배수 인정)</div>
              </div>
              <div className="text-center p-4 bg-blue-500/30 rounded-lg">
                <div className="text-3xl mb-2">👨</div>
                <div className="text-sm opacity-90">경증남성장애인</div>
                <div className="text-2xl font-bold">8명</div>
                <div className="text-xs opacity-75">(1/2배수 인정)</div>
              </div>
              <div className="text-center p-4 bg-green-500/30 rounded-lg">
                <div className="text-3xl mb-2">📈</div>
                <div className="text-sm opacity-90">인정인원</div>
                <div className="text-2xl font-bold">32명</div>
                <div className="text-xs opacity-75">(산정 후)</div>
              </div>
            </div>
          </div>

          <div className="mt-6 text-center">
            <div className="text-3xl mb-2">💰</div>
            <p className="text-xl font-bold text-yellow-200">연간 약 7억 5천만원 부담금 절감!</p>
            <p className="text-sm opacity-90 mt-2">+ 고용장려금 추가 지급 + 세제 혜택</p>
          </div>
        </div>

        {/* 혜택 비교 */}
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
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">✓</span>
                  <span>등록세 <strong>면제</strong></span>
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
                  <span>공공기관 <strong>우선구매</strong> 대상</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span><strong>수의계약</strong> 가능</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span><strong>금액 제한 없음</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span>나라장터 <strong>등록지원</strong></span>
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
                  <span>시설·장비 <strong>무상지원금 최대 10억원</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600">✓</span>
                  <span>인건비 <strong>보조금</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600">✓</span>
                  <span>고용장려금 <strong>월 30~80만원</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600">✓</span>
                  <span>운영비 <strong>지원</strong></span>
                </li>
              </ul>
            </div>
          </div>

          {/* 자회사형 추가 혜택 */}
          <div className="mt-6 bg-gradient-to-r from-purple-100 to-indigo-100 p-6 rounded-xl border-2 border-purple-300">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-3xl">⭐</span>
              자회사형 표준사업장 특별 혜택
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-start gap-2 text-gray-700">
                <span className="text-purple-600">✓</span>
                <span>자회사 고용 장애인을 <strong className="text-purple-700">모회사 고용률에 산입</strong></span>
              </div>
              <div className="flex items-start gap-2 text-gray-700">
                <span className="text-purple-600">✓</span>
                <span>모회사 <strong className="text-purple-700">고용부담금 대폭 감면</strong></span>
              </div>
              <div className="flex items-start gap-2 text-gray-700">
                <span className="text-purple-600">✓</span>
                <span>자회사 고용장려금 <strong className="text-purple-700">별도 지급</strong></span>
              </div>
              <div className="flex items-start gap-2 text-gray-700">
                <span className="text-purple-600">✓</span>
                <span>기업 <strong className="text-purple-700">ESG 평가 상승</strong> 효과</span>
              </div>
              <div className="flex items-start gap-2 text-gray-700">
                <span className="text-purple-600">✓</span>
                <span>공단 <strong className="text-purple-700">컨설팅 지원</strong></span>
              </div>
              <div className="flex items-start gap-2 text-gray-700">
                <span className="text-purple-600">✓</span>
                <span>사회적 기업 <strong className="text-purple-700">이미지 제고</strong></span>
              </div>
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
              { 
                step: 1, 
                title: "사전 컨설팅 및 계획 수립", 
                desc: "한국장애인고용공단 컨설팅 신청, 설립 유형 결정 (일반/자회사형), 사업계획서 작성",
                color: "blue"
              },
              { 
                step: 2, 
                title: "자회사 설립 (자회사형의 경우)", 
                desc: "법인 설립, 모회사 50% 초과 출자 또는 공동출자 구조 완성, 사업자등록",
                color: "green"
              },
              { 
                step: 3, 
                title: "시설 확보 및 준비", 
                desc: "장애인 편의시설 구비, 작업 공간 확보, 필요 장비 구입, 무상지원금 신청",
                color: "purple"
              },
              { 
                step: 4, 
                title: "장애인 근로자 채용", 
                desc: "10명 이상 장애인 근로자 채용 (전체의 30% 이상), 중증장애인 비율 준수, 최저임금 이상 보장",
                color: "orange"
              },
              { 
                step: 5, 
                title: "표준사업장 인증 신청", 
                desc: "고용노동부 인증 신청, 필요 서류 제출, 현장 실사 준비",
                color: "red"
              },
              { 
                step: 6, 
                title: "현장 심사 및 인증", 
                desc: "고용노동부 현장 실사, 요건 적합성 심사, 표준사업장 인증서 발급",
                color: "indigo"
              },
              { 
                step: 7, 
                title: "혜택 적용 및 운영", 
                desc: "세제 혜택·우선구매·지원금 신청, 고용장려금 신청, 지속적인 고용 유지 및 관리",
                color: "pink"
              }
            ].map((item) => (
              <div key={item.step} className={`bg-gradient-to-r from-${item.color}-50 to-${item.color}-100 p-6 rounded-xl border-2 border-${item.color}-200 hover:shadow-lg transition-shadow`}>
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

        {/* 추가 안내사항 */}
        <div className="bg-yellow-50 border-2 border-yellow-300 rounded-2xl p-6 mb-8">
          <div className="flex items-start gap-3">
            <div className="text-4xl">💡</div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">설립 시 유의사항</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-yellow-600 font-bold">•</span>
                  <span>자회사형은 <strong>대기업에 특히 유리</strong>한 구조입니다 (의무고용인원 많은 경우)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-600 font-bold">•</span>
                  <span>무상지원금은 <strong>2026년 기준 최대 10억원</strong>, 공동투자시 최대 20억원까지 가능</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-600 font-bold">•</span>
                  <span>인증 후 <strong>지속적인 요건 유지</strong>가 필수이며, 미준수시 인증 취소 가능</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-600 font-bold">•</span>
                  <span>전문 컨설팅을 통해 설립 시 <strong>실수를 최소화</strong>하고 혜택을 극대화할 수 있습니다</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl shadow-2xl p-8 md:p-12 text-center text-white">
          <div className="text-6xl mb-4">🚀</div>
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            장애인표준사업장 설립을 준비하시나요?
          </h2>
          <p className="text-lg mb-8 opacity-90">
            일반형과 자회사형 중 귀사에 맞는 최적의 방안을 제안하고,<br />
            설립부터 인증까지 전 과정을 전문 컨설턴트가 지원합니다
          </p>
          <div className="flex justify-center">
            <a
              href="/catalog"
              className="bg-white text-indigo-600 px-8 py-4 rounded-lg text-lg font-bold hover:bg-gray-100 transition-colors shadow-lg"
            >
              💡 맞춤 컨설팅 신청
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
