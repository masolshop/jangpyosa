'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import styles from './ProductRegister.module.css'

// 상품 카테고리 목록
const CATEGORIES = [
  '인쇄/출판',
  '전자/조립',
  '포장/배송',
  '세차/세탁',
  '사무/행정',
  '제조/가공',
  '서비스',
  '기타'
]

export default function ProductRegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  // 폼 데이터
  const [formData, setFormData] = useState({
    // 기본 정보
    title: '',
    category: '',
    summary: '',
    description: '',
    
    // 가격 및 수량
    price: '',
    unit: '개',
    minOrderQty: '1',
    
    // 납품 및 리드타임
    leadTimeDays: '7',
    deliveryCycle: '',
    
    // 계약 조건 (법적 근거 항목)
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
    
    // 🆕 민원 방지 필수 항목
    noSubcontractConfirm: false, // 직접이행 확인
    monthlyDeliverySchedule: '매월 1회', // 납품주기
    monthlyBillingBasis: '월별 정액', // 월별 산출 기준
    monthlyBillingDay: '31', // 청구일
    monthlyPaymentDay: '10', // 지급일
    monthlyFixedAmount: '', // 월 확정금액
    monthlyAmountNote: '', // 금액 설명
    costBreakdownLabor: '60', // 노무비 (%)
    costBreakdownMaterial: '30', // 재료비 (%)
    costBreakdownOther: '10', // 기타 (%)
    evidenceDeliveryConfirm: true, // 납품확인서
    evidenceInspection: false, // 검수서명
    evidenceElectronic: false, // 전자검수
    evidencePhoto: false, // 사진
    evidenceTaxInvoice: true, // 세금계산서
    invoiceIssueConfirmed: true, // 세금계산서 발행 가능 확인
    receiptNote: '', // 영수증 안내
  })
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    
    // 🆕 민원 방지 필수 항목 유효성 검사
    if (!formData.noSubcontractConfirm) {
      setError('❌ 직접이행 확인은 필수입니다. 하도급/재하도급을 하지 않는다는 것을 확인해주세요.')
      return
    }
    
    if (!formData.monthlyFixedAmount) {
      setError('❌ 월 확정금액은 필수입니다. 월별 도급액을 입력해주세요.')
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
      // 이미지 URL 배열 구성 (빈 값 제외)
      const imageUrls = [
        formData.imageUrl1,
        formData.imageUrl2,
        formData.imageUrl3,
        formData.imageUrl4
      ].filter(url => url.trim() !== '')
      
      // API 요청 데이터 구성
      const requestData = {
        title: formData.title,
        category: formData.category,
        summary: formData.summary || undefined,
        description: formData.description || undefined,
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
        
        // 🆕 민원 방지 필수 항목
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
      
      alert('상품이 등록되었습니다')
      router.push('/supplier/products')
    } catch (err: any) {
      console.error('상품 등록 에러:', err)
      setError(err.message || '상품 등록 중 오류가 발생했습니다')
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>🛍️ 도급계약 상품 등록</h1>
        <p>표준사업장 상품을 등록하고 고용부담금 기업과 연계하세요</p>
      </div>
      
      {error && <div className={styles.error}>{error}</div>}
      
      <form onSubmit={handleSubmit} className={styles.form}>
        {/* 기본 정보 */}
        <section className={styles.section}>
          <h2>📝 기본 정보</h2>
          
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
            <label>카테고리 *</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
              required
            >
              <option value="">카테고리 선택</option>
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
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
        
        {/* 가격 및 수량 */}
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
              placeholder="예: 인건비 70%, 자재비 30%"
            />
          </div>
        </section>
        
        {/* 계약 조건 (법적 근거 항목) */}
        <section className={styles.section}>
          <h2>📋 계약 조건 (필수)</h2>
          <p className={styles.sectionNote}>
            ⚖️ 장애인고용촉진법 시행령에 따른 필수 입력 항목입니다
          </p>
          
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
        
        {/* 품질 기준 */}
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
        
        {/* 이미지 */}
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
        
        {/* 키워드 */}
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
        
        {/* 제출 버튼 */}
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
            {loading ? '등록 중...' : '상품 등록'}
          </button>
        </div>
      </form>
    </div>
  )
}
