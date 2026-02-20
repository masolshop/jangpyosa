'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import styles from './ProductRegister.module.css'

// 계약 유형
const CONTRACT_TYPES = [
  { value: 'MANUFACTURING', label: '제조 도급', desc: '인쇄, 판촉물, 식품, 조립, 제과·제빵, 가구 등' },
  { value: 'SERVICE', label: '용역 도급', desc: '청소, 세탁, 시설관리, 문서작업, 콜센터 등' },
  { value: 'CONSTRUCTION', label: '공사 도급', desc: '단순 시공, 내부 환경개선, 편의시설 설치 등' }
]

// 상품 카테고리 (계약 유형별)
const CATEGORIES_BY_TYPE: Record<string, string[]> = {
  'MANUFACTURING': [
    '인쇄/출판',
    '판촉물 제작',
    '식품 제조',
    '전자/조립',
    '제과/제빵',
    '가구 제작',
    '포장/배송',
    '기타 제조'
  ],
  'SERVICE': [
    '청소/미화',
    '세차/세탁',
    '시설관리',
    '사무/행정',
    '문서작업',
    '콜센터',
    '기타 용역'
  ],
  'CONSTRUCTION': [
    '단순 시공',
    '내부 환경개선',
    '편의시설 설치',
    '기타 공사'
  ]
}

// 계약 형태
const CONTRACT_PERIODS = [
  { value: 'MONTHLY', label: '월 정기 도급 (권장)', recommended: true },
  { value: 'ANNUAL', label: '연간 도급' },
  { value: 'ONE_TIME', label: '1회성 (감면 불안정)', warning: true }
]

export default function ProductRegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  // 폼 데이터
  const [formData, setFormData] = useState({
    // ===== 1️⃣ 계약 유형 (필수) =====
    contractType: '', // MANUFACTURING, SERVICE, CONSTRUCTION
    
    // 기본 정보
    title: '',
    category: '',
    summary: '',
    description: '',
    
    // ===== 2️⃣ 장애인 직접 참여 여부 (필수) =====
    disabledWorkerParticipation: '', // 장애인 근로자 직접 참여 공정 설명
    disabledWorkerCount: '', // 장애인 참여 인원 수
    monthlyParticipationHours: '', // 월 참여 시간
    
    // ===== 3️⃣ 계약 형태 (필수) =====
    contractPeriodType: '', // MONTHLY, ANNUAL, ONE_TIME
    
    // ===== 4️⃣ 공공계약 가능 여부 =====
    naraMarketRegistered: false, // 나라장터 등록 가능
    biddingAvailable: false, // 입찰 가능
    privateContractAvailable: false, // 수의계약 가능
    privateContractScope: '', // 수의계약 가능 범위
    
    // 가격 및 수량
    price: '',
    unit: '개',
    minOrderQty: '1',
    
    // 납품 및 리드타임
    leadTimeDays: '7',
    deliveryCycle: '',
    
    // 계약 조건
    spec: '',
    processDescription: '',
    contractMinMonths: '12',
    
    // 가격 상세
    vatIncluded: true,
    shippingIncluded: false,
    extraCostNote: '',
    
    // 품질 기준
    inspectionCriteria: '',
    defectPolicy: '',
    
    // 거래 조건
    invoiceAvailable: true,
    quoteLeadTimeDays: '3',
    
    // 이미지
    thumbnailUrl: '',
    imageUrl1: '',
    imageUrl2: '',
    imageUrl3: '',
    imageUrl4: '',
    
    // 키워드
    keywords: '',
    
    // 민원 방지 필수 항목
    noSubcontractConfirm: false, // 직접이행 확인
    monthlyDeliverySchedule: '매월 1회',
    monthlyBillingBasis: '월별 정액',
    monthlyBillingDay: '31',
    monthlyPaymentDay: '10',
    monthlyFixedAmount: '',
    monthlyAmountNote: '',
    costBreakdownLabor: '60',
    costBreakdownMaterial: '30',
    costBreakdownOther: '10',
    evidenceDeliveryConfirm: true,
    evidenceInspection: false,
    evidenceElectronic: false,
    evidencePhoto: false,
    evidenceTaxInvoice: true,
    invoiceIssueConfirmed: true,
    receiptNote: '',
  })
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    
    // 계약 유형 필수 체크
    if (!formData.contractType) {
      setError('❌ 계약 유형을 선택해주세요.')
      return
    }
    
    // 장애인 직접 참여 필수 체크
    if (!formData.disabledWorkerParticipation) {
      setError('❌ 장애인 근로자 직접 참여 공정 설명은 필수입니다.')
      return
    }
    
    if (!formData.disabledWorkerCount) {
      setError('❌ 장애인 참여 인원 수는 필수입니다.')
      return
    }
    
    // 계약 형태 필수 체크
    if (!formData.contractPeriodType) {
      setError('❌ 계약 형태를 선택해주세요.')
      return
    }
    
    // 직접이행 확인 필수
    if (!formData.noSubcontractConfirm) {
      setError('❌ 직접이행 확인은 필수입니다. 하도급/재하도급을 하지 않는다는 것을 확인해주세요.')
      return
    }
    
    if (!formData.monthlyFixedAmount) {
      setError('❌ 월 확정금액은 필수입니다.')
      return
    }
    
    const laborPct = parseInt(formData.costBreakdownLabor || '0')
    const materialPct = parseInt(formData.costBreakdownMaterial || '0')
    const otherPct = parseInt(formData.costBreakdownOther || '0')
    const totalPct = laborPct + materialPct + otherPct
    
    if (totalPct !== 100) {
      setError(`❌ 보수 산출내역의 합계는 100%여야 합니다. (현재: ${totalPct}%)`)
      return
    }
    
    if (!formData.invoiceIssueConfirmed) {
      setError('❌ 세금계산서 발행 가능 여부 확인은 필수입니다.')
      return
    }
    
    const contractMonths = parseInt(formData.contractMinMonths)
    if (contractMonths < 12) {
      setError('❌ 연계고용 감면을 위해서는 계약기간이 최소 12개월 이상이어야 합니다.')
      return
    }
    
    setLoading(true)
    
    try {
      const imageUrls = [
        formData.imageUrl1,
        formData.imageUrl2,
        formData.imageUrl3,
        formData.imageUrl4
      ].filter(url => url.trim() !== '')
      
      const requestData = {
        // 계약 유형
        contractType: formData.contractType,
        
        // 기본 정보
        title: formData.title,
        category: formData.category,
        summary: formData.summary || undefined,
        description: formData.description || undefined,
        
        // 장애인 직접 참여
        disabledWorkerParticipation: formData.disabledWorkerParticipation,
        disabledWorkerCount: parseInt(formData.disabledWorkerCount),
        monthlyParticipationHours: formData.monthlyParticipationHours ? parseInt(formData.monthlyParticipationHours) : undefined,
        
        // 계약 형태
        contractPeriodType: formData.contractPeriodType,
        
        // 공공계약 가능 여부
        naraMarketRegistered: formData.naraMarketRegistered,
        biddingAvailable: formData.biddingAvailable,
        privateContractAvailable: formData.privateContractAvailable,
        privateContractScope: formData.privateContractScope || undefined,
        
        // 가격 및 수량
        price: parseInt(formData.price),
        unit: formData.unit,
        minOrderQty: parseInt(formData.minOrderQty),
        leadTimeDays: parseInt(formData.leadTimeDays),
        deliveryCycle: formData.deliveryCycle || undefined,
        spec: formData.spec,
        processDescription: formData.processDescription || undefined,
        contractMinMonths: parseInt(formData.contractMinMonths),
        vatIncluded: formData.vatIncluded,
        shippingIncluded: formData.shippingIncluded,
        extraCostNote: formData.extraCostNote || undefined,
        inspectionCriteria: formData.inspectionCriteria || undefined,
        defectPolicy: formData.defectPolicy || undefined,
        invoiceAvailable: formData.invoiceAvailable,
        quoteLeadTimeDays: parseInt(formData.quoteLeadTimeDays),
        thumbnailUrl: formData.thumbnailUrl || undefined,
        imageUrls: imageUrls.length > 0 ? imageUrls : undefined,
        keywords: formData.keywords || undefined,
        
        // 민원 방지 필수 항목
        noSubcontractConfirm: formData.noSubcontractConfirm,
        monthlyDeliverySchedule: formData.monthlyDeliverySchedule,
        monthlyBillingBasis: formData.monthlyBillingBasis,
        monthlyBillingDay: parseInt(formData.monthlyBillingDay),
        monthlyPaymentDay: parseInt(formData.monthlyPaymentDay),
        monthlyFixedAmount: formData.monthlyFixedAmount ? parseInt(formData.monthlyFixedAmount) : undefined,
        monthlyAmountNote: formData.monthlyAmountNote || undefined,
        costBreakdownJson: JSON.stringify({
          labor: parseInt(formData.costBreakdownLabor),
          material: parseInt(formData.costBreakdownMaterial),
          other: parseInt(formData.costBreakdownOther)
        }),
        evidenceMethods: JSON.stringify([
          formData.evidenceDeliveryConfirm && '납품확인서',
          formData.evidenceInspection && '검수서명',
          formData.evidenceElectronic && '전자검수',
          formData.evidencePhoto && '사진',
          formData.evidenceTaxInvoice && '세금계산서',
        ].filter(Boolean)),
        invoiceIssueConfirmed: formData.invoiceIssueConfirmed,
        receiptNote: formData.receiptNote || undefined,
      }
      
      const token = localStorage.getItem('accessToken')
      if (!token) {
        router.push('/login')
        return
      }
      
      const res = await fetch('http://localhost:4000/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestData)
      })
      
      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.message || '상품 등록에 실패했습니다')
      }
      
      alert('✅ 상품이 등록되었습니다')
      router.push('/supplier/profile')
    } catch (err: any) {
      console.error('상품 등록 에러:', err)
      setError(err.message || '상품 등록 중 오류가 발생했습니다')
    } finally {
      setLoading(false)
    }
  }
  
  // 계약 유형에 따른 카테고리 목록
  const availableCategories = formData.contractType 
    ? CATEGORIES_BY_TYPE[formData.contractType] || []
    : []
  
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>🛍️ 도급계약 상품 등록</h1>
        <p>연계고용 감면 가능한 상품을 등록하세요</p>
      </div>
      
      {/* ⚠️ 중요 안내 */}
      <div className={styles.warningBox}>
        <h3>⚠️ 연계고용 감면 인정 요건</h3>
        <p><strong>"장애인 근로자가 직접 생산·제공한 물품 또는 용역"</strong></p>
        <ul>
          <li>✅ <strong>인정 가능</strong>: 제조(인쇄, 판촉물, 식품, 조립, 제과·제빵, 가구), 용역(청소, 세탁, 시설관리, 문서작업, 콜센터), 공사(단순 시공, 내부 환경개선, 편의시설 설치)</li>
          <li>❌ <strong>인정 어려움</strong>: 유통 대행, 단순 중개, 외주 전량 위탁, 하도급 공사</li>
        </ul>
        <div className={styles.riskNotice}>
          <p><strong>※ 연계고용 감면은 장애인 직접 참여 공정이 확인되어야 하며, 하도급·재위탁 시 감면이 불인정될 수 있습니다.</strong></p>
          <p><strong>※ 공공기관 계약은 국가계약법·지방계약법에 따른 절차를 따릅니다.</strong></p>
        </div>
      </div>
      
      {error && <div className={styles.error}>{error}</div>}
      
      <form onSubmit={handleSubmit} className={styles.form}>
        
        {/* ===== 1️⃣ 계약 유형 (필수) ===== */}
        <section className={styles.section}>
          <h2>1️⃣ 계약 유형 선택 (필수)</h2>
          <p className={styles.sectionNote}>
            연계고용 감면이 인정되는 계약 유형을 선택하세요
          </p>
          
          <div className={styles.radioGroup}>
            {CONTRACT_TYPES.map(type => (
              <label key={type.value} className={styles.radioCard}>
                <input
                  type="radio"
                  name="contractType"
                  value={type.value}
                  checked={formData.contractType === type.value}
                  onChange={(e) => setFormData({
                    ...formData, 
                    contractType: e.target.value,
                    category: '' // 카테고리 초기화
                  })}
                  required
                />
                <div className={styles.radioContent}>
                  <strong>{type.label}</strong>
                  <small style={{ 
                    display: 'block',
                    whiteSpace: 'normal',
                    wordBreak: 'keep-all',
                    overflowWrap: 'break-word',
                    writingMode: 'horizontal-tb'
                  }}>{type.desc}</small>
                </div>
              </label>
            ))}
          </div>
        </section>
        
        {/* 기본 정보 */}
        {formData.contractType && (
          <section className={styles.section}>
            <h2>📝 기본 정보</h2>
            
            <div className={styles.field}>
              <label>카테고리 *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                required
              >
                <option value="">카테고리 선택</option>
                {availableCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            
            <div className={styles.field}>
              <label>상품명 *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="예: A4 인쇄 서비스"
                required
              />
            </div>
            
            <div className={styles.field}>
              <label>한줄 요약</label>
              <input
                type="text"
                value={formData.summary}
                onChange={(e) => setFormData({...formData, summary: e.target.value})}
                placeholder="예: 고품질 A4 인쇄 및 제본 서비스"
                maxLength={100}
              />
            </div>
            
            <div className={styles.field}>
              <label>상세 설명</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="상품의 상세 정보를 입력하세요"
                rows={5}
              />
            </div>
          </section>
        )}
        
        {/* ===== 2️⃣ 장애인 직접 참여 여부 (필수) ===== */}
        {formData.contractType && (
          <section className={styles.section}>
            <h2>2️⃣ 장애인 직접 참여 여부 (필수)</h2>
            <p className={styles.sectionNote}>
              ⚖️ 연계고용 감면 인정을 위한 필수 항목입니다
            </p>
            
            <div className={styles.field}>
              <label>장애인 근로자 직접 참여 공정 설명 *</label>
              <textarea
                value={formData.disabledWorkerParticipation}
                onChange={(e) => setFormData({...formData, disabledWorkerParticipation: e.target.value})}
                placeholder="예: 인쇄 → 제본 → 포장 전 과정에 장애인 근로자 5명이 직접 참여하여 작업합니다."
                rows={3}
                required
              />
              <small className={styles.fieldNote}>
                ✅ 장애인이 직접 참여하는 공정을 구체적으로 작성해주세요
              </small>
            </div>
            
            <div className={styles.row}>
              <div className={styles.field}>
                <label>장애인 참여 인원 수 *</label>
                <input
                  type="number"
                  value={formData.disabledWorkerCount}
                  onChange={(e) => setFormData({...formData, disabledWorkerCount: e.target.value})}
                  placeholder="5"
                  min="1"
                  required
                />
                <small>명</small>
              </div>
              
              <div className={styles.field}>
                <label>월 참여 시간</label>
                <input
                  type="number"
                  value={formData.monthlyParticipationHours}
                  onChange={(e) => setFormData({...formData, monthlyParticipationHours: e.target.value})}
                  placeholder="160"
                  min="0"
                />
                <small>시간 (선택)</small>
              </div>
            </div>
          </section>
        )}
        
        {/* ===== 3️⃣ 계약 형태 (필수) ===== */}
        {formData.contractType && (
          <section className={styles.section}>
            <h2>3️⃣ 계약 형태 (필수)</h2>
            <p className={styles.sectionNote}>
              계약 기간 형태를 선택하세요
            </p>
            
            <div className={styles.radioGroup}>
              {CONTRACT_PERIODS.map(period => (
                <label 
                  key={period.value} 
                  className={`${styles.radioCard} ${period.recommended ? styles.recommended : ''} ${period.warning ? styles.warning : ''}`}
                >
                  <input
                    type="radio"
                    name="contractPeriodType"
                    value={period.value}
                    checked={formData.contractPeriodType === period.value}
                    onChange={(e) => setFormData({...formData, contractPeriodType: e.target.value})}
                    required
                  />
                  <div className={styles.radioContent}>
                    <strong>{period.label}</strong>
                    {period.recommended && <span className={styles.badge}>권장</span>}
                    {period.warning && <span className={styles.badgeWarning}>주의</span>}
                  </div>
                </label>
              ))}
            </div>
          </section>
        )}
        
        {/* ===== 4️⃣ 공공계약 가능 여부 ===== */}
        {formData.contractType && (
          <section className={styles.section}>
            <h2>4️⃣ 공공계약 가능 여부</h2>
            <p className={styles.sectionNote}>
              공공기관과의 계약 가능 여부를 선택하세요
            </p>
            
            <div className={styles.checkboxGroup}>
              <label>
                <input
                  type="checkbox"
                  checked={formData.naraMarketRegistered}
                  onChange={(e) => setFormData({...formData, naraMarketRegistered: e.target.checked})}
                />
                <span>나라장터 등록 가능</span>
              </label>
              
              <label>
                <input
                  type="checkbox"
                  checked={formData.biddingAvailable}
                  onChange={(e) => setFormData({...formData, biddingAvailable: e.target.checked})}
                />
                <span>입찰 가능</span>
              </label>
              
              <label>
                <input
                  type="checkbox"
                  checked={formData.privateContractAvailable}
                  onChange={(e) => setFormData({...formData, privateContractAvailable: e.target.checked})}
                />
                <span>수의계약 가능</span>
              </label>
            </div>
            
            {formData.privateContractAvailable && (
              <div className={styles.field}>
                <label>수의계약 가능 범위</label>
                <input
                  type="text"
                  value={formData.privateContractScope}
                  onChange={(e) => setFormData({...formData, privateContractScope: e.target.value})}
                  placeholder="예: 3,000만원 이하"
                />
              </div>
            )}
          </section>
        )}
        
        {/* 가격 및 수량 */}
        {formData.contractType && (
          <section className={styles.section}>
            <h2>💰 가격 및 수량</h2>
            
            <div className={styles.row}>
              <div className={styles.field}>
                <label>단가 (원) *</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                  placeholder="10000"
                  min="0"
                  required
                />
              </div>
              
              <div className={styles.field}>
                <label>단위 *</label>
                <input
                  type="text"
                  value={formData.unit}
                  onChange={(e) => setFormData({...formData, unit: e.target.value})}
                  placeholder="개, 건, 월 등"
                  required
                />
              </div>
              
              <div className={styles.field}>
                <label>최소 주문 수량 *</label>
                <input
                  type="number"
                  value={formData.minOrderQty}
                  onChange={(e) => setFormData({...formData, minOrderQty: e.target.value})}
                  min="1"
                  required
                />
              </div>
            </div>
            
            <div className={styles.field}>
              <label>월 확정금액 (원) *</label>
              <input
                type="number"
                value={formData.monthlyFixedAmount}
                onChange={(e) => setFormData({...formData, monthlyFixedAmount: e.target.value})}
                placeholder="1000000"
                min="0"
                required
              />
              <small className={styles.fieldNote}>
                월별 도급액을 입력하세요 (연계고용 감면 계산에 사용됩니다)
              </small>
            </div>
            
            <div className={styles.checkboxGroup}>
              <label>
                <input
                  type="checkbox"
                  checked={formData.vatIncluded}
                  onChange={(e) => setFormData({...formData, vatIncluded: e.target.checked})}
                />
                <span>VAT 포함</span>
              </label>
              
              <label>
                <input
                  type="checkbox"
                  checked={formData.shippingIncluded}
                  onChange={(e) => setFormData({...formData, shippingIncluded: e.target.checked})}
                />
                <span>배송비 포함</span>
              </label>
              
              <label>
                <input
                  type="checkbox"
                  checked={formData.invoiceAvailable}
                  onChange={(e) => setFormData({...formData, invoiceAvailable: e.target.checked})}
                />
                <span>세금계산서 발행 가능</span>
              </label>
            </div>
            
            <div className={styles.field}>
              <label>추가 비용 안내</label>
              <input
                type="text"
                value={formData.extraCostNote}
                onChange={(e) => setFormData({...formData, extraCostNote: e.target.value})}
                placeholder="예: 원거리 배송 시 추가 배송비 발생"
              />
            </div>
            
            <div className={styles.field}>
              <label>보수 산출내역 (합계 100%)</label>
              <div className={styles.row}>
                <div className={styles.field}>
                  <label>노무비 (%)</label>
                  <input
                    type="number"
                    value={formData.costBreakdownLabor}
                    onChange={(e) => setFormData({...formData, costBreakdownLabor: e.target.value})}
                    min="0"
                    max="100"
                  />
                </div>
                <div className={styles.field}>
                  <label>재료비 (%)</label>
                  <input
                    type="number"
                    value={formData.costBreakdownMaterial}
                    onChange={(e) => setFormData({...formData, costBreakdownMaterial: e.target.value})}
                    min="0"
                    max="100"
                  />
                </div>
                <div className={styles.field}>
                  <label>기타 (%)</label>
                  <input
                    type="number"
                    value={formData.costBreakdownOther}
                    onChange={(e) => setFormData({...formData, costBreakdownOther: e.target.value})}
                    min="0"
                    max="100"
                  />
                </div>
              </div>
              <small className={styles.fieldNote}>
                현재 합계: {parseInt(formData.costBreakdownLabor || '0') + parseInt(formData.costBreakdownMaterial || '0') + parseInt(formData.costBreakdownOther || '0')}%
              </small>
            </div>
          </section>
        )}
        
        {/* 계약 조건 */}
        {formData.contractType && (
          <section className={styles.section}>
            <h2>📋 계약 조건</h2>
            
            <div className={styles.field}>
              <label>규격/재질/사양/명세 *</label>
              <textarea
                value={formData.spec}
                onChange={(e) => setFormData({...formData, spec: e.target.value})}
                placeholder="예: A4 용지 (210mm x 297mm), 백색 80g/m², 양면 인쇄"
                rows={3}
                required
              />
            </div>
            
            <div className={styles.field}>
              <label>공정 설명</label>
              <textarea
                value={formData.processDescription}
                onChange={(e) => setFormData({...formData, processDescription: e.target.value})}
                placeholder="예: 1) 원고 접수 → 2) 교정 작업 → 3) 인쇄 → 4) 제본 → 5) 포장 및 배송"
                rows={3}
              />
            </div>
            
            <div className={styles.row}>
              <div className={styles.field}>
                <label>평균 납품 소요일 *</label>
                <input
                  type="number"
                  value={formData.leadTimeDays}
                  onChange={(e) => setFormData({...formData, leadTimeDays: e.target.value})}
                  min="1"
                  required
                />
                <small>영업일 기준</small>
              </div>
              
              <div className={styles.field}>
                <label>최소 계약기간 (개월) *</label>
                <input
                  type="number"
                  value={formData.contractMinMonths}
                  onChange={(e) => setFormData({...formData, contractMinMonths: e.target.value})}
                  min="12"
                  required
                />
                <small>최소 12개월 이상</small>
              </div>
              
              <div className={styles.field}>
                <label>견적서 제공 소요일 *</label>
                <input
                  type="number"
                  value={formData.quoteLeadTimeDays}
                  onChange={(e) => setFormData({...formData, quoteLeadTimeDays: e.target.value})}
                  min="1"
                  required
                />
              </div>
            </div>
            
            <div className={styles.field}>
              <label>납품 주기 설명</label>
              <input
                type="text"
                value={formData.deliveryCycle}
                onChange={(e) => setFormData({...formData, deliveryCycle: e.target.value})}
                placeholder="예: 월 2회, 매주 금요일, 수시 발주 등"
              />
            </div>
          </section>
        )}
        
        {/* 직접이행 확인 */}
        {formData.contractType && (
          <section className={styles.section}>
            <h2>⚖️ 직접이행 확인 (필수)</h2>
            <div className={styles.confirmBox}>
              <label className={styles.confirmLabel}>
                <input
                  type="checkbox"
                  checked={formData.noSubcontractConfirm}
                  onChange={(e) => setFormData({...formData, noSubcontractConfirm: e.target.checked})}
                  required
                />
                <span>
                  <strong>본 사업장은 하도급·재하도급 없이 장애인 근로자가 직접 생산·제공하는 물품 또는 용역임을 확인합니다.</strong>
                </span>
              </label>
              <p className={styles.confirmNote}>
                ※ 하도급·재위탁 시 연계고용 감면이 불인정될 수 있습니다.
              </p>
            </div>
          </section>
        )}
        
        {/* 품질 기준 */}
        {formData.contractType && (
          <section className={styles.section}>
            <h2>✅ 품질 기준</h2>
            
            <div className={styles.field}>
              <label>검사 기준</label>
              <textarea
                value={formData.inspectionCriteria}
                onChange={(e) => setFormData({...formData, inspectionCriteria: e.target.value})}
                placeholder="예: 인쇄 품질 육안 검사, 색상 일치도 95% 이상"
                rows={2}
              />
            </div>
            
            <div className={styles.field}>
              <label>하자 처리 방침</label>
              <textarea
                value={formData.defectPolicy}
                onChange={(e) => setFormData({...formData, defectPolicy: e.target.value})}
                placeholder="예: 하자 발견 시 3일 내 무상 재작업, 배송비 당사 부담"
                rows={2}
              />
            </div>
          </section>
        )}
        
        {/* 이미지 */}
        {formData.contractType && (
          <section className={styles.section}>
            <h2>📷 상품 이미지</h2>
            <p className={styles.sectionNote}>
              이미지 URL을 입력하세요 (최대 5개)
            </p>
            
            <div className={styles.field}>
              <label>대표 이미지 URL</label>
              <input
                type="url"
                value={formData.thumbnailUrl}
                onChange={(e) => setFormData({...formData, thumbnailUrl: e.target.value})}
                placeholder="https://example.com/image.jpg"
              />
            </div>
            
            <div className={styles.field}>
              <label>추가 이미지 1</label>
              <input
                type="url"
                value={formData.imageUrl1}
                onChange={(e) => setFormData({...formData, imageUrl1: e.target.value})}
                placeholder="https://example.com/image1.jpg"
              />
            </div>
            
            <div className={styles.field}>
              <label>추가 이미지 2</label>
              <input
                type="url"
                value={formData.imageUrl2}
                onChange={(e) => setFormData({...formData, imageUrl2: e.target.value})}
                placeholder="https://example.com/image2.jpg"
              />
            </div>
            
            <div className={styles.field}>
              <label>추가 이미지 3</label>
              <input
                type="url"
                value={formData.imageUrl3}
                onChange={(e) => setFormData({...formData, imageUrl3: e.target.value})}
                placeholder="https://example.com/image3.jpg"
              />
            </div>
            
            <div className={styles.field}>
              <label>추가 이미지 4</label>
              <input
                type="url"
                value={formData.imageUrl4}
                onChange={(e) => setFormData({...formData, imageUrl4: e.target.value})}
                placeholder="https://example.com/image4.jpg"
              />
            </div>
          </section>
        )}
        
        {/* 키워드 */}
        {formData.contractType && (
          <section className={styles.section}>
            <h2>🔍 검색 키워드</h2>
            
            <div className={styles.field}>
              <label>키워드 (콤마로 구분)</label>
              <input
                type="text"
                value={formData.keywords}
                onChange={(e) => setFormData({...formData, keywords: e.target.value})}
                placeholder="예: 인쇄, A4, 제본, 명함"
              />
            </div>
          </section>
        )}
        
        {/* 제출 버튼 */}
        {formData.contractType && (
          <div className={styles.actions}>
            <button
              type="button"
              onClick={() => router.back()}
              className={styles.cancelBtn}
              disabled={loading}
            >
              취소
            </button>
            <button
              type="submit"
              className={styles.submitBtn}
              disabled={loading}
            >
              {loading ? '등록 중...' : '✅ 상품 등록'}
            </button>
          </div>
        )}
      </form>
    </div>
  )
}
