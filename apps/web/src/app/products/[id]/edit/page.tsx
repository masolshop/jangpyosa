'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'

// Build: 2026-02-21-v1 - Product edit page

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
  },
  {
    value: 'RENTAL',
    label: '렌탈',
    items: ['음식물처리기', '플라스틱처리기']
  }
]

export default function ProductEditPage() {
  const router = useRouter()
  const params = useParams()
  const productId = params.id as string

  const [loading, setLoading] = useState(true)
  const [step, setStep] = useState(1)
  
  // Step 1: 기본 정보
  const [contractType, setContractType] = useState('')
  const [category, setCategory] = useState('')
  const [productName, setProductName] = useState('')
  const [shortIntro, setShortIntro] = useState('')
  const [description, setDescription] = useState('')
  
  // Step 2: 이미지
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null)
  const [imagesPreviews, setImagesPreviews] = useState<string[]>([])
  
  // Step 3: 상세 정보
  const [brand, setBrand] = useState('')
  const [manufacturer, setManufacturer] = useState('')
  const [model, setModel] = useState('')
  const [specifications, setSpecifications] = useState('')
  const [price, setPrice] = useState('')
  const [stock, setStock] = useState('1')
  const [minOrderQty, setMinOrderQty] = useState('1')
  const [deliveryInfo, setDeliveryInfo] = useState('')
  const [keywords, setKeywords] = useState('')

  useEffect(() => {
    // 기존 상품 데이터 로드
    loadProductData()
  }, [productId])

  const loadProductData = async () => {
    try {
      setLoading(true)
      
      const token = localStorage.getItem('token')
      if (!token) {
        alert('로그인이 필요합니다.')
        router.push('/login')
        return
      }

      const response = await fetch(`http://localhost:4000/api/products/${productId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('상품 정보를 불러오는데 실패했습니다.')
      }

      const product = await response.json()

      // 데이터 설정
      setContractType(product.category || 'MANUFACTURING')
      setCategory(product.category || '')
      setProductName(product.title || '')
      setShortIntro(product.summary || '')
      setDescription(product.description || '')
      setBrand(product.brand || '')
      setManufacturer(product.manufacturer || '')
      setModel(product.model || '')
      setSpecifications(product.spec || '')
      setPrice(product.price?.toString() || '')
      setStock(product.minOrderQty?.toString() || '1')
      setMinOrderQty(product.minOrderQty?.toString() || '1')
      setDeliveryInfo(product.deliveryCycle || '')
      setKeywords(product.keywords || '')
      
      if (product.thumbnailUrl) {
        setThumbnailPreview(product.thumbnailUrl)
      }
      if (product.imageUrls && product.imageUrls.length > 0) {
        setImagesPreviews(product.imageUrls)
      }

    } catch (error) {
      console.error('상품 데이터 로드 실패:', error)
      alert('상품 정보를 불러오는데 실패했습니다.')
      router.push('/products/manage')
    } finally {
      setLoading(false)
    }
  }

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('파일 크기는 5MB를 초과할 수 없습니다.')
        return
      }
      const reader = new FileReader()
      reader.onloadend = () => {
        setThumbnailPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length + imagesPreviews.length > 5) {
      alert('최대 5개의 이미지만 업로드할 수 있습니다.')
      return
    }
    
    const validFiles = files.filter(file => {
      if (file.size > 5 * 1024 * 1024) {
        alert(`${file.name}은(는) 5MB를 초과합니다.`)
        return false
      }
      return true
    })

    const previews: string[] = []
    validFiles.forEach(file => {
      const reader = new FileReader()
      reader.onloadend = () => {
        previews.push(reader.result as string)
        if (previews.length === validFiles.length) {
          setImagesPreviews(prev => [...prev, ...previews])
        }
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (index: number) => {
    setImagesPreviews(prev => prev.filter((_, i) => i !== index))
  }

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!contractType) {
      alert('계약 유형을 선택해주세요')
      return
    }
    if (!productName.trim()) {
      alert('상품명을 입력해주세요')
      return
    }
    if (!description.trim()) {
      alert('상세 설명을 입력해주세요')
      return
    }

    setStep(2)
  }

  const handleStep2Submit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!thumbnailPreview) {
      alert('대표 이미지를 업로드해주세요')
      return
    }

    setStep(3)
  }

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        alert('로그인이 필요합니다.')
        router.push('/login')
        return
      }

      const productData = {
        title: productName,
        category,
        summary: shortIntro,
        description,
        spec: specifications,
        price: price ? parseFloat(price) : 0,
        unit: '개',
        minOrderQty: parseInt(minOrderQty),
        leadTimeDays: 7,
        contractMinMonths: 12,
        vatIncluded: true,
        shippingIncluded: false,
        invoiceAvailable: true,
        quoteLeadTimeDays: 3,
        thumbnailUrl: thumbnailPreview || undefined,
        imageUrls: imagesPreviews,
        keywords,
        isActive: true,
        // 필수 항목
        noSubcontractConfirm: true,
        monthlyDeliverySchedule: deliveryInfo || '매월',
        monthlyBillingBasis: '실사용량 기준',
        monthlyBillingDay: 31,
        monthlyPaymentDay: 10,
        costBreakdownJson: JSON.stringify({ labor: 0, material: 0, other: 0 }),
        evidenceMethods: '납품확인서',
        invoiceIssueConfirmed: true
      }

      const response = await fetch(`http://localhost:4000/api/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(productData)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || '상품 수정에 실패했습니다.')
      }

      alert('✅ 상품이 성공적으로 수정되었습니다!')
      router.push('/products/manage')
    } catch (error: any) {
      console.error('상품 수정 에러:', error)
      alert(error.message || '상품 수정 중 오류가 발생했습니다.')
    }
  }

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto p-8">
        <div className="text-center py-20">
          <div className="text-xl text-gray-600">로딩중...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          ✏️ 상품 수정
        </h1>
        <p className="text-gray-600">상품 정보를 수정합니다</p>
        
        {/* Progress Steps */}
        <div className="mt-6 flex items-center justify-center gap-4">
          <div className="flex items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
              step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
            }`}>
              1
            </div>
            <span className="ml-2 text-sm font-medium">기본 정보</span>
          </div>
          <div className="w-16 h-1 bg-gray-300" />
          <div className="flex items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
              step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
            }`}>
              2
            </div>
            <span className="ml-2 text-sm font-medium">이미지</span>
          </div>
          <div className="w-16 h-1 bg-gray-300" />
          <div className="flex items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
              step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
            }`}>
              3
            </div>
            <span className="ml-2 text-sm font-medium">상세 정보</span>
          </div>
        </div>
      </div>

      {/* Step 1: Basic Info */}
      {step === 1 && (
        <form className="bg-white rounded-lg shadow-md p-8" onSubmit={handleStep1Submit}>
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            1️⃣ 기본 정보
          </h2>

          {/* Contract Type Selection */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              계약 유형 *
            </label>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '1rem'
            }}>
              {CONTRACT_TYPES.map(type => (
                <label
                  key={type.value}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    padding: '1rem',
                    border: contractType === type.value ? '2px solid #3b82f6' : '2px solid #d1d5db',
                    borderRadius: '0.5rem',
                    cursor: 'pointer',
                    backgroundColor: contractType === type.value ? '#eff6ff' : 'white',
                    transition: 'all 0.2s'
                  }}
                >
                  <div className="flex items-center mb-2">
                    <input
                      type="radio"
                      name="contractType"
                      value={type.value}
                      checked={contractType === type.value}
                      onChange={(e) => {
                        setContractType(e.target.value)
                        setCategory('')
                      }}
                      required
                      className="mr-2"
                    />
                    <strong className="text-base">{type.label}</strong>
                  </div>
                  <div className="text-xs text-gray-600 space-y-1 ml-6">
                    {type.items.slice(0, 3).map((item, idx) => (
                      <div key={idx}>{item}</div>
                    ))}
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Category Selection */}
          {contractType && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                상세 카테고리 *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">선택하세요</option>
                {CONTRACT_TYPES.find(t => t.value === contractType)?.items.map((item, idx) => (
                  <option key={idx} value={item}>{item}</option>
                ))}
              </select>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                상품명 *
              </label>
              <input
                type="text"
                required
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="예: 블루투스 이어폰"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                한줄 소개
              </label>
              <input
                type="text"
                maxLength={100}
                value={shortIntro}
                onChange={(e) => setShortIntro(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="예: 고품질 블루투스 무선 이어폰"
              />
              <p className="text-xs text-gray-500 mt-1">{shortIntro.length}/100</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                상세 설명 *
              </label>
              <textarea
                required
                rows={8}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="상품에 대한 상세한 설명을 입력하세요"
              />
            </div>
          </div>

          <div className="flex justify-between gap-3 mt-8">
            <button
              type="button"
              onClick={() => router.push('/products/manage')}
              className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              다음 단계
            </button>
          </div>
        </form>
      )}

      {/* Step 2: Images */}
      {step === 2 && (
        <form className="bg-white rounded-lg shadow-md p-8" onSubmit={handleStep2Submit}>
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            2️⃣ 상품 이미지
          </h2>

          {/* Thumbnail Upload */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              대표 이미지 * (썸네일)
            </label>
            <p className="text-xs text-gray-500 mb-3">
              권장 크기: 800x800px, 최대 5MB, JPG/PNG
            </p>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              {thumbnailPreview ? (
                <div className="relative inline-block">
                  <img
                    src={thumbnailPreview}
                    alt="Thumbnail"
                    className="w-64 h-64 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => setThumbnailPreview(null)}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer">
                  <div className="text-gray-400 mb-2">
                    <svg className="mx-auto h-12 w-12" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-600">클릭하여 이미지 업로드</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleThumbnailChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          {/* Additional Images Upload */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              추가 이미지 (최대 5개)
            </label>
            <p className="text-xs text-gray-500 mb-3">
              상품의 다양한 각도 및 세부 사항을 보여주는 이미지
            </p>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              {imagesPreviews.length > 0 ? (
                <div className="grid grid-cols-5 gap-4">
                  {imagesPreviews.map((preview, index) => (
                    <div key={index} className="relative">
                      <img
                        src={preview}
                        alt={`Product ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  {imagesPreviews.length < 5 && (
                    <label className="cursor-pointer border-2 border-dashed border-gray-300 rounded-lg h-32 flex items-center justify-center hover:border-blue-500">
                      <span className="text-gray-400 text-2xl">+</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImagesChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              ) : (
                <label className="cursor-pointer text-center block">
                  <div className="text-gray-400 mb-2">
                    <svg className="mx-auto h-12 w-12" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-600">클릭하여 이미지 업로드 (최대 5개)</p>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImagesChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          <div className="flex justify-between gap-3 mt-8">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
            >
              이전
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              다음 단계
            </button>
          </div>
        </form>
      )}

      {/* Step 3: Detailed Info */}
      {step === 3 && (
        <form className="bg-white rounded-lg shadow-md p-8" onSubmit={handleFinalSubmit}>
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            3️⃣ 상세 정보
          </h2>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  브랜드
                </label>
                <input
                  type="text"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="예: 몬스타기어"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  제조사
                </label>
                <input
                  type="text"
                  value={manufacturer}
                  onChange={(e) => setManufacturer(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="예: 몬스타 주식회사"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                모델명
              </label>
              <input
                type="text"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="예: TWS-2000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                제품 사양
              </label>
              <textarea
                rows={4}
                value={specifications}
                onChange={(e) => setSpecifications(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="예:&#10;- 색상: 전체&#10;- 판매단위: 개&#10;- 최소주문수량: 1&#10;- 중량/용량: 50g"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  가격 (원)
                </label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  재고수량
                </label>
                <input
                  type="number"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="1"
                  min="1"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  최소주문수량
                </label>
                <input
                  type="number"
                  value={minOrderQty}
                  onChange={(e) => setMinOrderQty(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="1"
                  min="1"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                배송/설치 정보
              </label>
              <textarea
                rows={3}
                value={deliveryInfo}
                onChange={(e) => setDeliveryInfo(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="배송 기간, 설치 여부, 특이사항 등을 입력하세요"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                검색 키워드 (쉼표로 구분)
              </label>
              <input
                type="text"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="예: 블루투스, 이어폰, 무선, TWS"
              />
            </div>
          </div>

          <div className="flex justify-between gap-3 mt-8">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
            >
              이전
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              ✅ 수정 완료
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
