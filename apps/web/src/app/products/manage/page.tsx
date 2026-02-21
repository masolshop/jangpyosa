'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Product {
  id: string
  title: string
  category: string
  summary: string | null
  description: string | null
  isActive: boolean
  createdAt: string
  price: number
  unit: string
  thumbnailUrl: string | null
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
      
      const token = localStorage.getItem('token')
      if (!token) {
        setError('로그인이 필요합니다.')
        router.push('/login')
        return
      }

      const response = await fetch('http://localhost:4000/api/products/my/list', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        if (response.status === 401) {
          setError('로그인이 필요합니다.')
          router.push('/login')
          return
        }
        throw new Error('상품 목록을 불러오는데 실패했습니다.')
      }

      const data = await response.json()
      setProducts(data.products || [])
    } catch (err: any) {
      setError(err.message || '상품 목록을 불러오는데 실패했습니다.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const getStatusLabel = (isActive: boolean) => {
    if (isActive) {
      return { label: '판매중', color: '#28a745' }
    }
    return { label: '판매중지', color: '#dc3545' }
  }

  const handleDelete = async (productId: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) {
      return
    }

    try {
      const token = localStorage.getItem('token')
      if (!token) {
        alert('로그인이 필요합니다.')
        router.push('/login')
        return
      }

      const response = await fetch(`http://localhost:4000/api/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('상품 삭제에 실패했습니다.')
      }

      alert('상품이 삭제되었습니다.')
      fetchProducts() // 목록 새로고침
    } catch (error: any) {
      alert(error.message || '삭제 중 오류가 발생했습니다.')
      console.error(error)
    }
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
                const status = getStatusLabel(product.isActive)
                return (
                  <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">
                          {product.title}
                        </div>
                        {product.summary && (
                          <div className="text-sm text-gray-600 mt-1">
                            {product.summary}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                        {product.category}
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
                      {new Date(product.createdAt).toLocaleDateString('ko-KR')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => router.push(`/products/${product.id}`)}
                          className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors text-sm font-medium"
                        >
                          상세보���
                        </button>
                        <button
                          onClick={() => router.push(`/products/${product.id}/edit`)}
                          className="px-4 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors text-sm font-medium"
                        >
                          수정
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
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
              {products.filter(p => p.isActive).length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">판매중지</div>
            <div className="text-3xl font-bold text-red-600">
              {products.filter(p => !p.isActive).length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">평균 가격</div>
            <div className="text-3xl font-bold text-blue-600">
              {products.length > 0 
                ? Math.round(products.reduce((sum, p) => sum + p.price, 0) / products.length).toLocaleString() 
                : 0}원
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
