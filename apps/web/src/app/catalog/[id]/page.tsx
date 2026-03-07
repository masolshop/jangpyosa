"use client"

import { useRouter, useParams } from "next/navigation"
import Image from "next/image"

export default function ConsultingServiceDetailPage() {
  const router = useRouter()
  const params = useParams()
  const serviceId = params?.id as string

  // 헬스키퍼 서비스인 경우
  if (serviceId === "health-keeper") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          {/* 헤더 */}
          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mb-8 border-2 border-blue-100">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="text-5xl">💪</div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                    헬스키퍼 기업 파견 사업
                  </h1>
                  <p className="text-base md:text-lg text-gray-600 mt-1">
                    국가공인 시각장애인 안마사 전문 건강관리 서비스
                  </p>
                </div>
              </div>
              <button
                onClick={() => router.push('/catalog')}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-semibold transition-colors"
              >
                ← 목록
              </button>
            </div>
          </div>

          {/* 헬스키퍼란? */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border-2 border-indigo-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="text-4xl">🎯</div>
              <h2 className="text-2xl font-bold text-gray-900">헬스키퍼란?</h2>
            </div>
            <div className="space-y-4 text-gray-700 leading-relaxed text-lg">
              <p>
                <strong className="text-indigo-600">헬스키퍼</strong>는 기업 임직원들의 
                <strong className="text-blue-600"> 업무능력 향상</strong>과 
                <strong className="text-green-600"> 건강관리</strong>, 
                <strong className="text-purple-600"> 피로회복</strong>과 
                <strong className="text-orange-600"> 질병예방</strong> 등을 위해 노력하는 
                <strong className="text-indigo-700"> 국가공인자격의 시각장애인 안마사</strong>입니다.
              </p>
              <p className="bg-indigo-50 p-4 rounded-lg border-l-4 border-indigo-600">
                기업에 설치된 안마시설에서 기업 임직원들을 대상으로 안마를 하여 
                건강관리를 도와주는 전문 건강관리 서비스입니다.
              </p>
            </div>
          </div>

          {/* 서비스 효과 */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border-2 border-green-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="text-4xl">✨</div>
              <h2 className="text-2xl font-bold text-gray-900">국가공인 전문 안마사 서비스 효과</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-3xl">🛡️</span>
                  <h3 className="text-xl font-bold text-gray-900">안전 및 건강 관리</h3>
                </div>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">✓</span>
                    <span><strong className="text-blue-600">안전사고 예방</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">✓</span>
                    <span><strong className="text-blue-600">근골격계 질환 예방</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">✓</span>
                    <span><strong className="text-blue-600">근육통 해소</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">✓</span>
                    <span>각종 <strong className="text-blue-600">스트레스 증후군 해소</strong></span>
                  </li>
                </ul>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-teal-50 p-6 rounded-xl border border-green-200">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-3xl">📈</span>
                  <h3 className="text-xl font-bold text-gray-900">업무 효율 향상</h3>
                </div>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">✓</span>
                    <span><strong className="text-green-600">업무능력 향상</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">✓</span>
                    <span><strong className="text-green-600">집중력 증가</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">✓</span>
                    <span><strong className="text-green-600">피로 회복</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">✓</span>
                    <span><strong className="text-green-600">근무 만족도 상승</strong></span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* 기업 지원 효과 */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border-2 border-purple-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="text-4xl">🎁</div>
              <h2 className="text-2xl font-bold text-gray-900">기업 지원 효과</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-blue-50 p-6 rounded-xl border-2 border-blue-200 hover:shadow-lg transition-shadow">
                <div className="text-center mb-4">
                  <div className="text-5xl mb-2">💰</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">고용부담금 감소</h3>
                </div>
                <ul className="space-y-2 text-gray-700 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600">✓</span>
                    <span>장애인 채용으로 <strong>고용부담금 감소</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600">✓</span>
                    <span>의무고용률 초과시 <strong>장려금 지급</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600">✓</span>
                    <span><strong>근로지원인 서비스</strong> 이용 가능</span>
                  </li>
                </ul>
              </div>

              <div className="bg-green-50 p-6 rounded-xl border-2 border-green-200 hover:shadow-lg transition-shadow">
                <div className="text-center mb-4">
                  <div className="text-5xl mb-2">🏛️</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">우선구매 혜택</h3>
                </div>
                <ul className="space-y-2 text-gray-700 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600">✓</span>
                    <span>안마는 <strong>장애인생산품 용역</strong>으로 인정</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600">✓</span>
                    <span>표준사업장 계약시 계약금액의 <strong>50-60% 부담금 차감</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600">✓</span>
                    <span><strong>공공기관 우선구매</strong> 대상</span>
                  </li>
                </ul>
              </div>

              <div className="bg-purple-50 p-6 rounded-xl border-2 border-purple-200 hover:shadow-lg transition-shadow">
                <div className="text-center mb-4">
                  <div className="text-5xl mb-2">🌟</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">사회공헌 실현</h3>
                </div>
                <ul className="space-y-2 text-gray-700 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600">✓</span>
                    <span><strong>장애인 일자리 제공</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600">✓</span>
                    <span><strong>기업 이미지 제고</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600">✓</span>
                    <span><strong>ESG 경영</strong> 실천</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* 추가 혜택 */}
          <div className="bg-gradient-to-r from-indigo-100 to-purple-100 rounded-2xl shadow-xl p-8 mb-8 border-2 border-indigo-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="text-4xl">🎓</div>
              <h2 className="text-2xl font-bold text-gray-900">추가 지원 혜택</h2>
            </div>
            <div className="space-y-4">
              <div className="bg-white/80 p-5 rounded-xl border-l-4 border-indigo-600">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">📚</span>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">장애인 인식개선교육 무료 진행</h3>
                    <p className="text-gray-700">장애인 채용 시 직장 내 장애인 인식개선교육을 무료로 제공받을 수 있습니다.</p>
                  </div>
                </div>
              </div>
              <div className="bg-white/80 p-5 rounded-xl border-l-4 border-purple-600">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">🤝</span>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">연계고용 지원</h3>
                    <p className="text-gray-700">100인 이상 기업과 연계고용(장애인공단 승인)을 통해 고용의무부담금을 효과적으로 해소할 수 있습니다.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 서비스 이용 방법 */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border-2 border-orange-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="text-4xl">📋</div>
              <h2 className="text-2xl font-bold text-gray-900">서비스 이용 방법</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-orange-50 to-red-50 p-6 rounded-xl border-2 border-orange-200">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-3xl">🏢</span>
                  <h3 className="text-xl font-bold text-gray-900">① 사업장 내 상시 운영</h3>
                </div>
                <p className="text-gray-700 mb-4">
                  사업장 내에 헬스키퍼(안마사)를 파견받아 상시 운영하는 방식
                </p>
                <div className="bg-white/70 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-orange-600 font-bold">✓</span>
                    <span className="font-semibold text-gray-800">장점</span>
                  </div>
                  <ul className="space-y-1 text-sm text-gray-700 ml-6">
                    <li>• 근무 중 편리한 이용</li>
                    <li>• 이동 시간 절약</li>
                    <li>• 정기적인 건강관리</li>
                    <li>• 복지시설 확충</li>
                  </ul>
                </div>
              </div>

              <div className="bg-gradient-to-br from-teal-50 to-cyan-50 p-6 rounded-xl border-2 border-teal-200">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-3xl">🎫</span>
                  <h3 className="text-xl font-bold text-gray-900">② 안마이용권 제공</h3>
                </div>
                <p className="text-gray-700 mb-4">
                  사업장 인근 안마원에 직접 방문해 안마이용권을 사용하는 방식
                </p>
                <div className="bg-white/70 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-teal-600 font-bold">✓</span>
                    <span className="font-semibold text-gray-800">장점</span>
                  </div>
                  <ul className="space-y-1 text-sm text-gray-700 ml-6">
                    <li>• 시설 투자 불필요</li>
                    <li>• 유연한 이용 시간</li>
                    <li>• 다양한 안마원 선택</li>
                    <li>• 직원 복지 증진</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* 대상 기업 */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-2xl p-8 mb-8 text-white">
            <div className="text-center mb-6">
              <div className="text-5xl mb-3">🎯</div>
              <h2 className="text-2xl md:text-3xl font-bold">이런 기업에 추천합니다</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-white/10 backdrop-blur p-5 rounded-xl">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">✓</span>
                  <div>
                    <h3 className="font-bold text-lg mb-1">100인 이상 기업</h3>
                    <p className="text-sm opacity-90">장애인 고용의무부담금 해소가 필요한 기업</p>
                  </div>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur p-5 rounded-xl">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">✓</span>
                  <div>
                    <h3 className="font-bold text-lg mb-1">직원 복지 향상</h3>
                    <p className="text-sm opacity-90">임직원 건강관리와 복지를 중시하는 기업</p>
                  </div>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur p-5 rounded-xl">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">✓</span>
                  <div>
                    <h3 className="font-bold text-lg mb-1">사회적 책임</h3>
                    <p className="text-sm opacity-90">ESG 경영과 사회공헌을 실천하는 기업</p>
                  </div>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur p-5 rounded-xl">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">✓</span>
                  <div>
                    <h3 className="font-bold text-lg mb-1">업무 효율 개선</h3>
                    <p className="text-sm opacity-90">직원 건강관리로 생산성 향상을 원하는 기업</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 도표: 헬스키퍼 도입 전후 비교 */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border-2 border-indigo-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="text-4xl">📊</div>
              <h2 className="text-2xl font-bold text-gray-900">헬스키퍼 도입 전후 비교</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {/* 도입 전 */}
              <div className="bg-gradient-to-br from-red-50 to-orange-50 p-6 rounded-xl border-2 border-red-200">
                <h3 className="text-xl font-bold mb-4 text-red-700 flex items-center gap-2">
                  <span>⚠️</span>
                  도입 전
                </h3>
                <div className="space-y-3">
                  <div className="bg-white p-3 rounded">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">고용부담금</span>
                      <strong className="text-xl text-red-600">연 5천만원+</strong>
                    </div>
                  </div>
                  <div className="bg-white p-3 rounded">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">직원 만족도</span>
                      <strong className="text-xl text-red-600">보통</strong>
                    </div>
                  </div>
                  <div className="bg-white p-3 rounded">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">근골격계 질환</span>
                      <strong className="text-xl text-red-600">높음</strong>
                    </div>
                  </div>
                  <div className="bg-white p-3 rounded">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">업무 효율</span>
                      <strong className="text-xl text-red-600">기본</strong>
                    </div>
                  </div>
                  <div className="bg-white p-3 rounded">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">사회공헌</span>
                      <strong className="text-xl text-red-600">미흡</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* 도입 후 */}
              <div className="bg-gradient-to-br from-green-50 to-teal-50 p-6 rounded-xl border-2 border-green-200">
                <h3 className="text-xl font-bold mb-4 text-green-700 flex items-center gap-2">
                  <span>✅</span>
                  도입 후
                </h3>
                <div className="space-y-3">
                  <div className="bg-white p-3 rounded border-l-4 border-green-500">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">고용부담금</span>
                      <strong className="text-xl text-green-600">대폭 감소 ↓</strong>
                    </div>
                  </div>
                  <div className="bg-white p-3 rounded border-l-4 border-green-500">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">직원 만족도</span>
                      <strong className="text-xl text-green-600">매우 높음 ↑</strong>
                    </div>
                  </div>
                  <div className="bg-white p-3 rounded border-l-4 border-green-500">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">근골격계 질환</span>
                      <strong className="text-xl text-green-600">예방 ↓</strong>
                    </div>
                  </div>
                  <div className="bg-white p-3 rounded border-l-4 border-green-500">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">업무 효율</span>
                      <strong className="text-xl text-green-600">향상 ↑</strong>
                    </div>
                  </div>
                  <div className="bg-white p-3 rounded border-l-4 border-green-500">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">사회공헌</span>
                      <strong className="text-xl text-green-600">실현 ↑</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 추가 수치 정보 */}
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-3xl font-bold text-blue-600 mb-1">50-60%</div>
                <div className="text-sm text-gray-600">부담금 차감률</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-3xl font-bold text-green-600 mb-1">30-80만원</div>
                <div className="text-sm text-gray-600">월 고용장려금</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-3xl font-bold text-purple-600 mb-1">100%</div>
                <div className="text-sm text-gray-600">국가공인자격</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-3xl font-bold text-orange-600 mb-1">무료</div>
                <div className="text-sm text-gray-600">인식개선교육</div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl shadow-2xl p-8 md:p-12 text-center text-white mb-8">
            <div className="text-6xl mb-4">🚀</div>
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              헬스키퍼 서비스를 도입하시겠습니까?
            </h2>
            <p className="text-lg mb-8 opacity-90">
              사내복지와 의무고용부담금을 동시에 해소하세요
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
          <div className="grid md:grid-cols-3 gap-4">
            <button
              onClick={() => router.push('/employment-levy-obligation')}
              className="bg-blue-600 text-white p-6 rounded-xl text-center hover:bg-blue-700 transition-colors shadow-lg"
            >
              <div className="text-4xl mb-2">📋</div>
              <div className="font-bold">장애인의무고용부담금</div>
            </button>
            <button
              onClick={() => router.push('/linkage-levy-exemption-system')}
              className="bg-purple-600 text-white p-6 rounded-xl text-center hover:bg-purple-700 transition-colors shadow-lg"
            >
              <div className="text-4xl mb-2">📉</div>
              <div className="font-bold">연계고용부담금감면제도</div>
            </button>
            <button
              onClick={() => router.push('/public-purchase-system')}
              className="bg-green-600 text-white p-6 rounded-xl text-center hover:bg-green-700 transition-colors shadow-lg"
            >
              <div className="text-4xl mb-2">🏛️</div>
              <div className="font-bold">공공기관우선구매제도</div>
            </button>
          </div>
        </div>
      </div>
    )
  }

  // 렌탈 서비스인 경우 PDF 이미지 표시
  if (serviceId === "rental") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4 md:p-8">
        <div className="max-w-5xl mx-auto">
          {/* 헤더 */}
          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-5xl">📦</div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                    기업 물품 렌탈
                  </h1>
                  <p className="text-base md:text-lg text-gray-600 mt-1">
                    기업용 2만가지 상품 렌탈
                  </p>
                </div>
              </div>
              <button
                onClick={() => router.push('/catalog')}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-semibold transition-colors"
              >
                ← 목록
              </button>
            </div>
          </div>

          {/* PDF 이미지들 */}
          <div className="space-y-6">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((pageNum) => (
              <div 
                key={pageNum}
                className="bg-white rounded-xl shadow-lg overflow-hidden"
              >
                <Image
                  src={`/images/rental/page-${pageNum}.jpg`}
                  alt={`렌탈 서비스 안내 ${pageNum}페이지`}
                  width={1240}
                  height={1754}
                  className="w-full h-auto"
                  priority={pageNum <= 3}
                />
              </div>
            ))}
          </div>

          {/* 하단 버튼 */}
          <div className="mt-8 bg-white rounded-2xl shadow-xl p-6 md:p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
              관련 정보 더 알아보기
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => router.push('/employment-levy-obligation')}
                className="bg-blue-600 text-white px-6 py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                📋 장애인의무고용부담금
              </button>
              <button
                onClick={() => router.push('/linkage-levy-exemption-system')}
                className="bg-purple-600 text-white px-6 py-4 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
              >
                📉 연계고용부담금감면제도
              </button>
              <button
                onClick={() => router.push('/public-purchase-system')}
                className="bg-green-600 text-white px-6 py-4 rounded-lg font-semibold hover:bg-green-700 transition-colors"
              >
                🏛️ 공공기관우선구매제도
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // 기타 서비스는 준비중 페이지 표시
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8 md:p-12 text-center">
        {/* 아이콘 */}
        <div className="text-8xl mb-6">🚧</div>

        {/* 제목 */}
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          서비스 준비 중입니다
        </h1>

        {/* 설명 */}
        <p className="text-lg text-gray-600 mb-8 leading-relaxed">
          현재 맞춤형 컨설팅 서비스를 준비하고 있습니다.
          <br />
          보다 나은 서비스로 찾아뵙겠습니다.
        </p>

        {/* 버튼 그룹 */}
        <div className="space-y-4">
          <button
            onClick={() => router.push('/catalog')}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg"
          >
            🏠 컨설팅 메인으로 돌아가기
          </button>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <button
              onClick={() => router.push('/employment-levy-obligation')}
              className="bg-blue-100 text-blue-700 px-4 py-3 rounded-lg font-semibold hover:bg-blue-200 transition-colors text-sm"
            >
              📋 고용부담금
            </button>
            <button
              onClick={() => router.push('/linkage-levy-exemption-system')}
              className="bg-purple-100 text-purple-700 px-4 py-3 rounded-lg font-semibold hover:bg-purple-200 transition-colors text-sm"
            >
              📉 연계고용감면
            </button>
            <button
              onClick={() => router.push('/public-purchase-system')}
              className="bg-green-100 text-green-700 px-4 py-3 rounded-lg font-semibold hover:bg-green-200 transition-colors text-sm"
            >
              🏛️ 우선구매
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
