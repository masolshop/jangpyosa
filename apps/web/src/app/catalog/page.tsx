'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Product {
  id: string;
  title: string;
  category: string;
  summary?: string;
  price: number;
  unit: string;
  thumbnailUrl?: string;
  supplier: {
    company: {
      name: string;
    };
  };
}

export default function ProductCatalogPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('');

  useEffect(() => {
    fetchProducts();
  }, [category]);

  const fetchProducts = async () => {
    try {
      const url = category 
        ? `http://localhost:4000/products?category=${category}` 
        : 'http://localhost:4000/products';
      
      const response = await fetch(url);
      const data = await response.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error('상품 로드 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ padding: 40 }}>로딩 중...</div>;
  }

  return (
    <div style={{ padding: 40, maxWidth: 1400, margin: '0 auto', marginLeft: 360 }}>
      <div style={{ marginBottom: 40 }}>
        <h1 style={{ fontSize: 32, marginBottom: 16 }}>🛒 상품 카탈로그</h1>
        <p style={{ color: '#666', fontSize: 16 }}>
          장애인표준사업장의 우수한 상품과 서비스를 만나보세요
        </p>
      </div>

      {/* 카테고리 필터 */}
      <div style={{
        marginBottom: 30,
        display: 'flex',
        gap: 10,
        flexWrap: 'wrap',
      }}>
        <button
          onClick={() => setCategory('')}
          style={{
            padding: '10px 20px',
            backgroundColor: category === '' ? '#1a237e' : 'white',
            color: category === '' ? 'white' : '#333',
            border: '1px solid #ddd',
            borderRadius: 20,
            cursor: 'pointer',
            fontSize: 14,
          }}
        >
          전체
        </button>
        {['제조', '용역', '공사', '렌탈'].map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            style={{
              padding: '10px 20px',
              backgroundColor: category === cat ? '#1a237e' : 'white',
              color: category === cat ? 'white' : '#333',
              border: '1px solid #ddd',
              borderRadius: 20,
              cursor: 'pointer',
              fontSize: 14,
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 상품 그리드 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: 24,
      }}>
        {products.map((product) => (
          <Link
            key={product.id}
            href={`/catalog/${product.id}`}
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <div style={{
              backgroundColor: 'white',
              borderRadius: 8,
              overflow: 'hidden',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              transition: 'transform 0.2s, box-shadow 0.2s',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
            }}
            >
              {/* 상품 이미지 */}
              <div style={{
                height: 200,
                backgroundColor: '#f5f5f5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
              }}>
                {product.thumbnailUrl ? (
                  <img
                    src={product.thumbnailUrl}
                    alt={product.title}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                ) : (
                  <span style={{ fontSize: 48, opacity: 0.3 }}>📦</span>
                )}
              </div>

              {/* 상품 정보 */}
              <div style={{ padding: 20 }}>
                <div style={{
                  fontSize: 12,
                  color: '#1a237e',
                  marginBottom: 8,
                  fontWeight: 'bold',
                }}>
                  {product.category}
                </div>
                <h3 style={{
                  fontSize: 18,
                  marginBottom: 8,
                  fontWeight: 'bold',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>
                  {product.title}
                </h3>
                <p style={{
                  fontSize: 14,
                  color: '#666',
                  marginBottom: 12,
                  height: 40,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                }}>
                  {product.summary || '상세 설명을 확인해보세요'}
                </p>
                <div style={{
                  fontSize: 20,
                  fontWeight: 'bold',
                  color: '#1a237e',
                  marginBottom: 8,
                }}>
                  {product.price.toLocaleString()}원 / {product.unit}
                </div>
                <div style={{
                  fontSize: 13,
                  color: '#999',
                }}>
                  공급: {product.supplier?.company?.name || '표준사업장'}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {products.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: 60,
          color: '#999',
        }}>
          <p style={{ fontSize: 18 }}>등록된 상품이 없습니다</p>
        </div>
      )}
    </div>
  );
}
