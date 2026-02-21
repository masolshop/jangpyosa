'use client'

import { useState } from 'react'

const CONTRACT_TYPES = [
  {
    value: 'MANUFACTURING',
    label: '제조 도급',
    items: ['인쇄', '판촉물', '식품', '조립', '제과·제빵', '가구']
  },
  {
    value: 'SERVICE',
    label: '용역 도급',
    items: ['청소', '세탁', '시설관리', '문서작업', '콜센터']
  },
  {
    value: 'CONSTRUCTION',
    label: '공사 도급',
    items: ['단순 시공', '내부 환경개선', '편의시설 설치']
  }
]

export default function ProductRegisterPage() {
  const [contractType, setContractType] = useState('')

  return (
    <div className="max-w-5xl mx-auto p-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          🛍️ 도급계약 상품 등록
        </h1>
        <p className="text-gray-600">연계고용 감면 가능한 상품을 등록하세요</p>
      </div>

      {/* Warning Box */}
      <div className="mb-8 p-6 bg-gradient-to-r from-orange-50 to-yellow-50 border-l-4 border-orange-400 rounded-lg">
        <h3 className="text-lg font-bold text-orange-800 mb-3">
          ⚠️ 연계고용 감면 인정 요건
        </h3>
        <p className="font-semibold text-gray-800 mb-3">
          "장애인 근로자가 직접 생산·제공한 물품 또는 용역"
        </p>
        <ul className="space-y-2 text-sm text-gray-700">
          <li>
            ✅ <strong>인정 가능</strong>: 제조(인쇄, 판촉물, 식품, 조립, 제과·제빵, 가구),
            용역(청소, 세탁, 시설관리, 문서작업, 콜센터), 공사(단순 시공, 내부 환경개선, 편의시설 설치)
          </li>
          <li>
            ❌ <strong>인정 어려움</strong>: 유통 대행, 단순 중개, 외주 전량 위탁, 하도급 공사
          </li>
        </ul>
        <div className="mt-4 p-3 bg-red-50 border border-red-300 rounded">
          <p className="text-sm text-red-800">
            <strong>※ 연계고용 감면은 장애인 직접 참여 공정이 확인되어야 하며, 하도급·재위탁 시 감면이 불인정될 수 있습니다.</strong>
          </p>
          <p className="text-sm text-red-800 mt-1">
            <strong>※ 공공기관 계약은 국가계약법·지방계약법에 따른 절차를 따릅니다.</strong>
          </p>
        </div>
      </div>

      {/* Form */}
      <form className="bg-white rounded-lg shadow-md p-8">
        {/* Step 1: Contract Type Selection */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            1️⃣ 계약 유형 선택 (필수)
          </h2>
          <p className="text-sm text-gray-600 mb-6">
            연계고용 감면이 인정되는 계약 유형을 선택하세요
          </p>

          {/* Grid Container - 강제로 가로 3열 */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '1rem',
            marginBottom: '1rem'
          }}>
            {CONTRACT_TYPES.map(type => (
              <label
                key={type.value}
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'flex-start',
                  gap: '1rem',
                  padding: '1.25rem',
                  border: contractType === type.value ? '2px solid #3b82f6' : '2px solid #d1d5db',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  backgroundColor: contractType === type.value ? '#eff6ff' : 'white',
                  transition: 'all 0.2s'
                }}
              >
                <input
                  type="radio"
                  name="contractType"
                  value={type.value}
                  checked={contractType === type.value}
                  onChange={(e) => setContractType(e.target.value)}
                  required
                  style={{
                    marginTop: '0.25rem',
                    flexShrink: 0
                  }}
                />
                <div style={{ flex: 1 }}>
                  <strong style={{
                    display: 'block',
                    fontSize: '1.125rem',
                    fontWeight: '600',
                    color: '#1f2937',
                    marginBottom: '0.5rem'
                  }}>
                    {type.label}
                  </strong>
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.25rem',
                    fontSize: '0.875rem',
                    color: '#4b5563'
                  }}>
                    {type.items.map((item, idx) => (
                      <div key={idx}>{item}</div>
                    ))}
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Basic Info - Show only when contract type is selected */}
        {contractType && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              2️⃣ 기본 정보
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  상품명 *
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="예: A4 인쇄 서비스"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  한줄 소개
                </label>
                <input
                  type="text"
                  maxLength={100}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="예: 고품질 A4 인쇄 및 제본 서비스"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  상세 설명 *
                </label>
                <textarea
                  required
                  rows={6}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="상품에 대한 상세한 설명을 입력하세요"
                />
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 mt-8">
          <button
            type="button"
            className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
          >
            취소
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            disabled={!contractType}
          >
            다음 단계
          </button>
        </div>
      </form>
    </div>
  )
}
