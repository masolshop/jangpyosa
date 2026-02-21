'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Product {
  id: number
  name: string
  contractType: string
  shortIntro: string | null
  description: string
  status: string
  createdAt: string
}

export default function ProductManagePage() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      // TODO: 실제 API 호출로 변경
      // const response = await fetch('/api/products/my', {
      //   headers: {
      //     'Authorization': `Bearer ${localStorage.getItem('token')}`
      //   }
      // })
      // const data = await response.json()
      
      // 임시 데이터
      const mockData: Product[] = [
        {
          id: 1,
          name: 'A4 인쇄 서비스',
          contractType: 'MANUFACTURING',
          shortIntro: '고품질 A4 인쇄 및 제본',
          description: '장애인 직원이 직접 제작하는 고품질 인쇄 서비스입니다.',
          status: 'ACTIVE',
          createdAt: '2026-02-21'
        }
      ]
      
      setProducts(mockData)
    } catch (err) {
      setError('상품 목록을 불러오는데 실패했습니다.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const getContractTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      'MANUFACTURING': '제조 도급',
      'SERVICE': '용역 도급',
      'CONSTRUCTION': '공사 도급',
      'RENTAL': '렌탈'
    }
    return types[type] || type
  }

  const getStatusLabel = (status: string) => {
    const statuses: Record<string, { label: string; color: string }> = {
      'ACTIVE': { label: '판매중', color: '#28a745' },
      'INACTIVE': { label: '판매중지', color: '#dc3545' },
      'DRAFT': { label: '임시저장', color: '#6c757d' }
    }
    return statuses[status] || { label: status, color: '#6c757d' }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-8">
        <div className="text-center py-20">
          <div className="text-xl text-gray-600">로딩중...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-8">
      {/* Header */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            📦 내 상품 관리
          </h1>
          <p className="text-gray-600">등록한 상품을 관리하고 수정할 수 있습니다</p>
        </div>
        <button
          onClick={() => router.push('/products/register')}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          + 새 상품 등록
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
          {error}
        </div>
      )}

      {/* Products List */}
      {products.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <div className="text-6xl mb-4">📦</div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            등록된 상품이 없습니다
          </h3>
          <p className="text-gray-600 mb-6">
            첫 번째 상품을 등록하고 연계고용 감면을 받아보세요!
          </p>
          <button
            onClick={() => router.push('/products/register')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            상품 등록하기
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  상품명
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  계약 유형
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  상태
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  등록일
                </th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">
                  관리
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {products.map((product) => {
                const status = getStatusLabel(product.status)
                return (
                  <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">
                          {product.name}
                        </div>
                        {product.shortIntro && (
                          <div className="text-sm text-gray-600 mt-1">
                            {product.shortIntro}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                        {getContractTypeLabel(product.contractType)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className="px-3 py-1 rounded-full text-sm font-medium"
                        style={{
                          backgroundColor: `${status.color}20`,
                          color: status.color
                        }}
                      >
                        {status.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {product.createdAt}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => router.push(`/products/${product.id}`)}
                          className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors text-sm font-medium"
                        >
                          상세보기
                        </button>
                        <button
                          onClick={() => router.push(`/products/${product.id}/edit`)}
                          className="px-4 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors text-sm font-medium"
                        >
                          수정
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('정말 삭제하시겠습니까?')) {
                              // TODO: 삭제 API 호출
                              alert('삭제 기능은 곧 구현됩니다.')
                            }
                          }}
                          className="px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors text-sm font-medium"
                        >
                          삭제
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Stats Summary */}
      {products.length > 0 && (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">전체 상품</div>
            <div className="text-3xl font-bold text-gray-800">{products.length}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">판매중</div>
            <div className="text-3xl font-bold text-green-600">
              {products.filter(p => p.status === 'ACTIVE').length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">판매중지</div>
            <div className="text-3xl font-bold text-red-600">
              {products.filter(p => p.status === 'INACTIVE').length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">임시저장</div>
            <div className="text-3xl font-bold text-gray-600">
              {products.filter(p => p.status === 'DRAFT').length}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
