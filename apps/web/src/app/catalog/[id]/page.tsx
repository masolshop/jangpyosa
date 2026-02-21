'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

interface Product {
  id: string;
  title: string;
  category: string;
  summary?: string;
  description?: string;
  price: number;
  unit: string;
  minOrderQty: number;
  leadTimeDays: number;
  thumbnailUrl?: string;
  imageUrls?: string;
  spec?: string;
  processDescription?: string;
  supplier: {
    company: {
      name: string;
      bizNo: string;
    };
    contactName?: string;
    contactTel?: string;
  };
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [showQuoteForm, setShowQuoteForm] = useState(false);

  // 견적문의 폼 상태
  const [companyName, setCompanyName] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [bizNo, setBizNo] = useState('');
  const [quantity, setQuantity] = useState('');
  const [budget, setBudget] = useState('');
  const [timeline, setTimeline] = useState('');
  const [requirements, setRequirements] = useState('');

  useEffect(() => {
    if (params.id) {
      fetchProduct();
    }
  }, [params.id]);

  const fetchProduct = async () => {
    try {
      const response = await fetch(`http://localhost:4000/products/${params.id}`);
      const data = await response.json();
      setProduct(data);
    } catch (error) {
      console.error('상품 로드 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!companyName || !contactName || !contactPhone) {
      alert('필수 정보를 입력해주세요');
      return;
    }

    try {
      const response = await fetch('http://localhost:4000/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product?.id,
          companyName,
          contactName,
          contactPhone,
          contactEmail,
          bizNo,
          category: product?.category,
          productName: product?.title,
          quantity: quantity ? parseInt(quantity) : undefined,
          budget,
          timeline,
          requirements,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '견적문의 접수 실패');
      }

      alert('견적문의가 접수되었습니다!\n장표사닷컴에서 빠른 시일 내에 연락드리겠습니다.');
      setShowQuoteForm(false);
      
      // 폼 초기화
      setCompanyName('');
      setContactName('');
      setContactPhone('');
      setContactEmail('');
      setBizNo('');
      setQuantity('');
      setBudget('');
      setTimeline('');
      setRequirements('');
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) {
    return <div style={{ padding: 40 }}>로딩 중...</div>;
  }

  if (!product) {
    return <div style={{ padding: 40 }}>상품을 찾을 수 없습니다</div>;
  }

  const images = product.imageUrls ? JSON.parse(product.imageUrls) : [];

  return (
    <div style={{ padding: 40, maxWidth: 1200, margin: '0 auto' }}>
      {/* 상단 헤더 */}
      <div style={{ marginBottom: 30 }}>
        <button
          onClick={() => router.push('/catalog')}
          style={{
            padding: '10px 20px',
            backgroundColor: '#f5f5f5',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
            marginBottom: 20,
          }}
        >
          ← 목록으로
        </button>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 40,
        marginBottom: 40,
      }}>
        {/* 왼쪽: 이미지 */}
        <div>
          <div style={{
            backgroundColor: '#f5f5f5',
            borderRadius: 8,
            overflow: 'hidden',
            marginBottom: 20,
          }}>
            <img
              src={product.thumbnailUrl || '/placeholder-product.png'}
              alt={product.title}
              style={{
                width: '100%',
                height: 400,
                objectFit: 'contain',
              }}
            />
          </div>
          {images.length > 0 && (
            <div style={{ display: 'flex', gap: 10 }}>
              {images.map((img: string, idx: number) => (
                <div
                  key={idx}
                  style={{
                    width: 80,
                    height: 80,
                    backgroundColor: '#f5f5f5',
                    borderRadius: 4,
                    overflow: 'hidden',
                  }}
                >
                  <img
                    src={img}
                    alt={`상품 이미지 ${idx + 1}`}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 오른쪽: 정보 */}
        <div>
          <div style={{
            fontSize: 14,
            color: '#1a237e',
            fontWeight: 'bold',
            marginBottom: 8,
          }}>
            {product.category}
          </div>
          <h1 style={{ fontSize: 32, marginBottom: 16 }}>{product.title}</h1>
          <p style={{ fontSize: 16, color: '#666', marginBottom: 24 }}>
            {product.summary}
          </p>

          <div style={{
            backgroundColor: '#f5f5f5',
            padding: 24,
            borderRadius: 8,
            marginBottom: 24,
          }}>
            <div style={{ fontSize: 28, fontWeight: 'bold', color: '#1a237e', marginBottom: 8 }}>
              {product.price.toLocaleString()}원
            </div>
            <div style={{ fontSize: 14, color: '#666' }}>단위: {product.unit}</div>
            <div style={{ fontSize: 14, color: '#666' }}>최소 주문: {product.minOrderQty}개</div>
            <div style={{ fontSize: 14, color: '#666' }}>납기: {product.leadTimeDays}일</div>
          </div>

          {/* 견적문의 버튼 */}
          <button
            onClick={() => setShowQuoteForm(true)}
            style={{
              width: '100%',
              padding: 16,
              backgroundColor: '#1a237e',
              color: 'white',
              border: 'none',
              borderRadius: 8,
              fontSize: 18,
              fontWeight: 'bold',
              cursor: 'pointer',
              marginBottom: 16,
            }}
          >
            💬 견적문의 (장표사닷컴으로 전달)
          </button>

          {/* 공급사 정보 */}
          <div style={{
            padding: 20,
            backgroundColor: '#f9f9f9',
            borderRadius: 8,
            border: '1px solid #e0e0e0',
          }}>
            <div style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 8 }}>
              공급: {product.supplier.company.name}
            </div>
            {product.supplier.contactName && (
              <div style={{ fontSize: 13, color: '#666' }}>
                담당자: {product.supplier.contactName}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 상세 설명 */}
      <div style={{
        backgroundColor: 'white',
        padding: 40,
        borderRadius: 8,
        border: '1px solid #e0e0e0',
      }}>
        <h2 style={{ fontSize: 24, marginBottom: 20 }}>상품 상세 정보</h2>
        {product.description && (
          <div style={{ marginBottom: 30, lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
            {product.description}
          </div>
        )}
        {product.spec && (
          <div>
            <h3 style={{ fontSize: 18, marginBottom: 12 }}>제품 사양</h3>
            <div style={{ lineHeight: 1.8, whiteSpace: 'pre-wrap', color: '#666' }}>
              {product.spec}
            </div>
          </div>
        )}
      </div>

      {/* 견적문의 모달 */}
      {showQuoteForm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: 8,
            padding: 40,
            maxWidth: 600,
            width: '90%',
            maxHeight: '90vh',
            overflow: 'auto',
          }}>
            <h2 style={{ fontSize: 24, marginBottom: 20 }}>💬 견적문의</h2>
            <p style={{ color: '#666', marginBottom: 30, fontSize: 14 }}>
              견적문의는 장표사닷컴으로 전달되며, 빠른 시일 내에 연락드립니다.
            </p>

            <form onSubmit={handleQuoteSubmit}>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold' }}>
                  회사명 *
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: 12,
                    border: '1px solid #ddd',
                    borderRadius: 4,
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold' }}>
                  담당자명 *
                </label>
                <input
                  type="text"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: 12,
                    border: '1px solid #ddd',
                    borderRadius: 4,
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold' }}>
                  연락처 *
                </label>
                <input
                  type="tel"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="01012345678"
                  required
                  style={{
                    width: '100%',
                    padding: 12,
                    border: '1px solid #ddd',
                    borderRadius: 4,
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold' }}>
                  이메일
                </label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  style={{
                    width: '100%',
                    padding: 12,
                    border: '1px solid #ddd',
                    borderRadius: 4,
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold' }}>
                  사업자등록번호
                </label>
                <input
                  type="text"
                  value={bizNo}
                  onChange={(e) => setBizNo(e.target.value)}
                  placeholder="123-45-67890"
                  style={{
                    width: '100%',
                    padding: 12,
                    border: '1px solid #ddd',
                    borderRadius: 4,
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold' }}>
                  수량
                </label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  min="1"
                  style={{
                    width: '100%',
                    padding: 12,
                    border: '1px solid #ddd',
                    borderRadius: 4,
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold' }}>
                  예산 범위
                </label>
                <input
                  type="text"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  placeholder="예: 500만원 ~ 1000만원"
                  style={{
                    width: '100%',
                    padding: 12,
                    border: '1px solid #ddd',
                    borderRadius: 4,
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold' }}>
                  납기 희망일
                </label>
                <input
                  type="text"
                  value={timeline}
                  onChange={(e) => setTimeline(e.target.value)}
                  placeholder="예: 2026년 3월 말"
                  style={{
                    width: '100%',
                    padding: 12,
                    border: '1px solid #ddd',
                    borderRadius: 4,
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ marginBottom: 30 }}>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold' }}>
                  상세 요구사항
                </label>
                <textarea
                  value={requirements}
                  onChange={(e) => setRequirements(e.target.value)}
                  rows={5}
                  placeholder="추가 요구사항이나 문의사항을 입력해주세요"
                  style={{
                    width: '100%',
                    padding: 12,
                    border: '1px solid #ddd',
                    borderRadius: 4,
                    boxSizing: 'border-box',
                    resize: 'vertical',
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setShowQuoteForm(false)}
                  style={{
                    flex: 1,
                    padding: 14,
                    backgroundColor: '#f5f5f5',
                    color: '#333',
                    border: 'none',
                    borderRadius: 4,
                    cursor: 'pointer',
                  }}
                >
                  취소
                </button>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: 14,
                    backgroundColor: '#1a237e',
                    color: 'white',
                    border: 'none',
                    borderRadius: 4,
                    cursor: 'pointer',
                    fontWeight: 'bold',
                  }}
                >
                  견적문의 접수
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
