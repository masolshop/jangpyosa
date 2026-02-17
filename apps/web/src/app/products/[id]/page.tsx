'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import styles from './ProductDetail.module.css'

interface Product {
  id: string
  title: string
  category: string
  summary?: string
  description?: string
  price: number
  unit: string
  minOrderQty: number
  leadTimeDays: number
  deliveryCycle?: string
  spec?: string
  processDescription?: string
  contractMinMonths: number
  vatIncluded: boolean
  shippingIncluded: boolean
  extraCostNote?: string
  inspectionCriteria?: string
  defectPolicy?: string
  invoiceAvailable: boolean
  quoteLeadTimeDays: number
  thumbnailUrl?: string
  imageUrls: string[]
  keywords?: string
  isActive: boolean
  createdAt: string
  supplier: {
    id: string
    company: {
      name: string
      bizNo: string
      representative?: string
    }
    registry?: {
      certNo?: string
      region?: string
      industry?: string
      contactTel?: string
    }
    contactTel?: string
    region?: string
    industry?: string
  }
}

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [qty, setQty] = useState(1)
  
  // 감면 계산기 상태
  const [calcYear, setCalcYear] = useState('2026')
  const [levyAmount, setLevyAmount] = useState('')
  const [contractAmount, setContractAmount] = useState('')
  const [reductionResult, setReductionResult] = useState<any>(null)
  
  useEffect(() => {
    fetchProduct()
  }, [params.id])
  
  const fetchProduct = async () => {
    try {
      const res = await fetch(`http://localhost:4000/products/${params.id}`)
      
      if (!res.ok) {
        throw new Error('상품을 찾을 수 없습니다')
      }
      
      const data = await res.json()
      setProduct(data)
    } catch (err: any) {
      setError(err.message || '상품 정보를 불러오는 중 오류가 발생했습니다')
    } finally {
      setLoading(false)
    }
  }
  
  const calculateReduction = async () => {
    if (!levyAmount || !contractAmount) {
      alert('부담금과 도급액을 입력하세요')
      return
    }
    
    try {
      const res = await fetch('http://localhost:4000/calculators/linkage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          year: parseInt(calcYear),
          levy: parseFloat(levyAmount),
          contract: parseFloat(contractAmount)
        })
      })
      
      const data = await res.json()
      setReductionResult(data)
    } catch (err) {
      console.error('감면 계산 에러:', err)
      alert('감면 금액 계산 중 오류가 발생했습니다')
    }
  }
  
  const addToCart = async () => {
    const token = localStorage.getItem('accessToken')
    if (!token) {
      router.push('/login')
      return
    }
    
    try {
      const res = await fetch('http://localhost:4000/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          productId: product!.id,
          qty
        })
      })
      
      if (!res.ok) {
        throw new Error('장바구니 추가에 실패했습니다')
      }
      
      alert('장바구니에 추가되었습니다')
    } catch (err: any) {
      console.error('장바구니 추가 에러:', err)
      alert(err.message || '장바구니 추가 중 오류가 발생했습니다')
    }
  }
  
  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>로딩 중...</div>
      </div>
    )
  }
  
  if (error || !product) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>{error || '상품을 찾을 수 없습니다'}</div>
      </div>
    )
  }
  
  return (
    <div className={styles.container}>
      {/* 상품 정보 */}
      <div className={styles.productSection}>
        {/* 이미지 갤러리 */}
        <div className={styles.imageGallery}>
          {product.thumbnailUrl && (
            <img src={product.thumbnailUrl} alt={product.title} />
          )}
          {!product.thumbnailUrl && (
            <div className={styles.noImage}>이미지 없음</div>
          )}
          
          {product.imageUrls.length > 0 && (
            <div className={styles.thumbnails}>
              {product.imageUrls.map((url, idx) => (
                <img key={idx} src={url} alt={`상품 이미지 ${idx + 1}`} />
              ))}
            </div>
          )}
        </div>
        
        {/* 상품 상세 */}
        <div className={styles.productInfo}>
          <div className={styles.category}>{product.category}</div>
          <h1>{product.title}</h1>
          {product.summary && <p className={styles.summary}>{product.summary}</p>}
          
          <div className={styles.price}>
            <span className={styles.priceValue}>
              {product.price.toLocaleString()}원
            </span>
            <span className={styles.priceUnit}>/ {product.unit}</span>
          </div>
          
          <div className={styles.badges}>
            {product.vatIncluded && <span className={styles.badge}>VAT 포함</span>}
            {product.shippingIncluded && <span className={styles.badge}>배송비 포함</span>}
            {product.invoiceAvailable && <span className={styles.badge}>세금계산서 발행</span>}
          </div>
          
          {/* 공급사 정보 */}
          <div className={styles.supplierInfo}>
            <h3>🏢 공급사 정보</h3>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>업체명:</span>
              <span>{product.supplier.company.name}</span>
            </div>
            {product.supplier.company.representative && (
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>대표자:</span>
                <span>{product.supplier.company.representative}</span>
              </div>
            )}
            {product.supplier.registry?.region && (
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>지역:</span>
                <span>{product.supplier.registry.region}</span>
              </div>
            )}
            {product.supplier.registry?.industry && (
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>업종:</span>
                <span>{product.supplier.registry.industry}</span>
              </div>
            )}
            {product.supplier.registry?.contactTel && (
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>전화:</span>
                <span>{product.supplier.registry.contactTel}</span>
              </div>
            )}
          </div>
          
          {/* 주문 수량 */}
          <div className={styles.orderSection}>
            <label>주문 수량</label>
            <div className={styles.qtyControl}>
              <button onClick={() => setQty(Math.max(product.minOrderQty, qty - 1))}>-</button>
              <input
                type="number"
                value={qty}
                onChange={(e) => setQty(Math.max(product.minOrderQty, parseInt(e.target.value) || 1))}
                min={product.minOrderQty}
              />
              <button onClick={() => setQty(qty + 1)}>+</button>
            </div>
            <small>최소 주문: {product.minOrderQty}{product.unit}</small>
          </div>
          
          {/* 주문 버튼 */}
          <div className={styles.actions}>
            <button onClick={addToCart} className={styles.cartBtn}>
              🛒 장바구니 담기
            </button>
            <button onClick={() => alert('견적 요청 기능은 준비 중입니다')} className={styles.quoteBtn}>
              📋 견적 요청
            </button>
          </div>
        </div>
      </div>
      
      {/* 계약 조건 상세 */}
      <div className={styles.detailSection}>
        <h2>📋 계약 조건</h2>
        
        {product.spec && (
          <div className={styles.detailItem}>
            <h3>규격/재질/사양</h3>
            <p>{product.spec}</p>
          </div>
        )}
        
        {product.processDescription && (
          <div className={styles.detailItem}>
            <h3>공정 설명</h3>
            <p>{product.processDescription}</p>
          </div>
        )}
        
        <div className={styles.detailItem}>
          <h3>납품 조건</h3>
          <ul>
            <li>평균 납품 소요일: {product.leadTimeDays}일</li>
            {product.deliveryCycle && <li>납품 주기: {product.deliveryCycle}</li>}
            <li>최소 계약기간: {product.contractMinMonths}개월</li>
            <li>견적서 제공: {product.quoteLeadTimeDays}일 소요</li>
          </ul>
        </div>
        
        {product.extraCostNote && (
          <div className={styles.detailItem}>
            <h3>비용 안내</h3>
            <p>{product.extraCostNote}</p>
          </div>
        )}
        
        {product.inspectionCriteria && (
          <div className={styles.detailItem}>
            <h3>검사 기준</h3>
            <p>{product.inspectionCriteria}</p>
          </div>
        )}
        
        {product.defectPolicy && (
          <div className={styles.detailItem}>
            <h3>하자 처리</h3>
            <p>{product.defectPolicy}</p>
          </div>
        )}
        
        {product.description && (
          <div className={styles.detailItem}>
            <h3>상세 설명</h3>
            <p>{product.description}</p>
          </div>
        )}
      </div>
      
      {/* 감면 계산기 위젯 */}
      <div className={styles.calculatorSection}>
        <h2>💰 예상 감면액 계산</h2>
        <p className={styles.calculatorNote}>
          이 상품과의 도급계약 시 예상되는 부담금 감면액을 확인하세요
        </p>
        
        <div className={styles.calculatorForm}>
          <div className={styles.calcField}>
            <label>기준 연도</label>
            <select value={calcYear} onChange={(e) => setCalcYear(e.target.value)}>
              <option value="2026">2026년</option>
              <option value="2027">2027년</option>
            </select>
          </div>
          
          <div className={styles.calcField}>
            <label>연간 부담금 (원)</label>
            <input
              type="number"
              value={levyAmount}
              onChange={(e) => setLevyAmount(e.target.value)}
              placeholder="예: 10000000"
            />
          </div>
          
          <div className={styles.calcField}>
            <label>도급계약 금액 (원)</label>
            <input
              type="number"
              value={contractAmount}
              onChange={(e) => setContractAmount(e.target.value)}
              placeholder={`예: ${(product.price * qty * 12).toLocaleString()}`}
            />
            <small>참고: 현재 수량 기준 연간 도급액 약 {(product.price * qty * 12).toLocaleString()}원</small>
          </div>
          
          <button onClick={calculateReduction} className={styles.calcBtn}>
            계산하기
          </button>
        </div>
        
        {reductionResult && (
          <div className={styles.calculatorResult}>
            <h3>✅ 계산 결과</h3>
            <div className={styles.resultGrid}>
              <div className={styles.resultItem}>
                <span className={styles.resultLabel}>연간 부담금</span>
                <span className={styles.resultValue}>
                  {reductionResult.levy?.toLocaleString()}원
                </span>
              </div>
              <div className={styles.resultItem}>
                <span className={styles.resultLabel}>도급계약 금액</span>
                <span className={styles.resultValue}>
                  {reductionResult.contract?.toLocaleString()}원
                </span>
              </div>
              <div className={styles.resultItem}>
                <span className={styles.resultLabel}>감면 한도 (부담금의 90%)</span>
                <span className={styles.resultValue}>
                  {reductionResult.maxByLevy?.toLocaleString()}원
                </span>
              </div>
              <div className={styles.resultItem}>
                <span className={styles.resultLabel}>감면 한도 (도급액의 50%)</span>
                <span className={styles.resultValue}>
                  {reductionResult.maxByContract?.toLocaleString()}원
                </span>
              </div>
              <div className={`${styles.resultItem} ${styles.resultHighlight}`}>
                <span className={styles.resultLabel}>💚 실제 감면액</span>
                <span className={styles.resultValue}>
                  {reductionResult.actualReduction?.toLocaleString()}원
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
