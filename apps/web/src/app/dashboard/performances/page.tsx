"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { API_BASE } from "@/lib/api"
import { getToken, getUserRole } from "@/lib/auth"

interface PerformanceItem {
  id: string
  year: number
  month: number
  plannedAmount: number
  actualAmount: number
  performanceRate: number
  inspectionStatus: "PENDING" | "PASSED" | "FAILED" | "WAIVED"
  paymentStatus: "UNPAID" | "PARTIAL" | "PAID"
  paidAmount: number
  contract: {
    id: string
    contractNo: string
    contractName: string
    supplier: {
      name: string
      bizNo: string
    }
  }
}

export default function PerformancesPage() {
  const router = useRouter()
  const [performances, setPerformances] = useState<PerformanceItem[]>([])
  const [filteredPerformances, setFilteredPerformances] = useState<PerformanceItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [userRole, setUserRole] = useState<string>("")

  // 필터
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [selectedMonth, setSelectedMonth] = useState<number | "">("")
  const [selectedSupplier, setSelectedSupplier] = useState("")
  const [selectedInspectionStatus, setSelectedInspectionStatus] = useState("")
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState("")
  const [searchQuery, setSearchQuery] = useState("")

  // 선택된 실적
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    const role = getUserRole()
    setUserRole(role || "")
    
    if (role !== "BUYER" && role !== "SUPER_ADMIN") {
      router.push("/")
      return
    }

    fetchPerformances()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [performances, selectedYear, selectedMonth, selectedSupplier, selectedInspectionStatus, selectedPaymentStatus, searchQuery])

  const fetchPerformances = async () => {
    try {
      setLoading(true)
      const token = getToken()

      // 모든 계약 가져오기
      const contractsRes = await fetch(`${API_BASE}/contracts`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!contractsRes.ok) throw new Error("계약 목록을 불러올 수 없습니다")
      const contracts = await contractsRes.json()

      // 각 계약의 실적 가져오기
      const allPerformances: PerformanceItem[] = []
      for (const contract of contracts) {
        const perfRes = await fetch(`${API_BASE}/contracts/${contract.id}/performances`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (perfRes.ok) {
          const perfs = await perfRes.json()
          perfs.forEach((perf: any) => {
            allPerformances.push({
              ...perf,
              contract: {
                id: contract.id,
                contractNo: contract.contractNo,
                contractName: contract.contractName,
                supplier: contract.supplier
              }
            })
          })
        }
      }

      setPerformances(allPerformances)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...performances]

    // 년도 필터
    filtered = filtered.filter(p => p.year === selectedYear)

    // 월 필터
    if (selectedMonth !== "") {
      filtered = filtered.filter(p => p.month === selectedMonth)
    }

    // 공급업체 필터
    if (selectedSupplier) {
      filtered = filtered.filter(p => p.contract.supplier.name.includes(selectedSupplier))
    }

    // 검수상태 필터
    if (selectedInspectionStatus) {
      filtered = filtered.filter(p => p.inspectionStatus === selectedInspectionStatus)
    }

    // 결제상태 필터
    if (selectedPaymentStatus) {
      filtered = filtered.filter(p => p.paymentStatus === selectedPaymentStatus)
    }

    // 검색 필터
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(p =>
        p.contract.contractNo.toLowerCase().includes(query) ||
        p.contract.contractName.toLowerCase().includes(query) ||
        p.contract.supplier.name.toLowerCase().includes(query)
      )
    }

    setFilteredPerformances(filtered)
  }

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds)
    if (newSet.has(id)) {
      newSet.delete(id)
    } else {
      newSet.add(id)
    }
    setSelectedIds(newSet)
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredPerformances.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filteredPerformances.map(p => p.id)))
    }
  }

  const handleBatchApprove = async () => {
    if (selectedIds.size === 0) {
      alert("선택된 실적이 없습니다")
      return
    }

    if (!confirm(`선택한 ${selectedIds.size}건의 실적을 일괄 승인하시겠습니까?`)) {
      return
    }

    try {
      const token = getToken()
      let successCount = 0

      for (const id of Array.from(selectedIds)) {
        const res = await fetch(`${API_BASE}/performances/${id}/inspection`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            inspectionStatus: "PASSED",
            inspectionNotes: "일괄 승인"
          })
        })
        if (res.ok) successCount++
      }

      alert(`${successCount}건의 실적이 승인되었습니다`)
      setSelectedIds(new Set())
      fetchPerformances()
    } catch (err: any) {
      alert("일괄 승인 중 오류가 발생했습니다: " + err.message)
    }
  }

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: "bg-yellow-100 text-yellow-800",
      PASSED: "bg-green-100 text-green-800",
      FAILED: "bg-red-100 text-red-800",
      WAIVED: "bg-gray-100 text-gray-800",
      UNPAID: "bg-red-100 text-red-800",
      PARTIAL: "bg-orange-100 text-orange-800",
      PAID: "bg-green-100 text-green-800"
    }
    const labels: Record<string, string> = {
      PENDING: "대기",
      PASSED: "승인",
      FAILED: "반려",
      WAIVED: "면제",
      UNPAID: "미지급",
      PARTIAL: "부분지급",
      PAID: "지급완료"
    }
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status] || "bg-gray-100 text-gray-800"}`}>
        {labels[status] || status}
      </span>
    )
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("ko-KR").format(amount) + "원"
  }

  // 선택된 실적의 통계
  const selectedStats = {
    count: selectedIds.size,
    planned: filteredPerformances.filter(p => selectedIds.has(p.id)).reduce((sum, p) => sum + p.plannedAmount, 0),
    actual: filteredPerformances.filter(p => selectedIds.has(p.id)).reduce((sum, p) => sum + p.actualAmount, 0),
    paid: filteredPerformances.filter(p => selectedIds.has(p.id)).reduce((sum, p) => sum + p.paidAmount, 0),
  }

  // 전체 통계
  const totalStats = {
    count: filteredPerformances.length,
    planned: filteredPerformances.reduce((sum, p) => sum + p.plannedAmount, 0),
    actual: filteredPerformances.reduce((sum, p) => sum + p.actualAmount, 0),
    paid: filteredPerformances.reduce((sum, p) => sum + p.paidAmount, 0),
    unpaid: filteredPerformances.reduce((sum, p) => sum + (p.actualAmount - p.paidAmount), 0),
  }

  const suppliers = Array.from(new Set(performances.map(p => p.contract.supplier.name)))

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">로딩 중...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* 헤더 */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">📊 월별 실적 관리</h1>
        <p className="text-gray-600 mt-2">모든 계약의 월별 이행실적을 한눈에 확인하고 관리하세요</p>
      </div>

      {/* 통계 요약 */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <p className="text-sm text-blue-600">전체 실적</p>
          <p className="text-2xl font-bold text-blue-800">{totalStats.count}건</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <p className="text-sm text-gray-600">계획금액</p>
          <p className="text-xl font-bold text-gray-800">{formatCurrency(totalStats.planned)}</p>
        </div>
        <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
          <p className="text-sm text-purple-600">실제금액</p>
          <p className="text-xl font-bold text-purple-800">{formatCurrency(totalStats.actual)}</p>
        </div>
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <p className="text-sm text-green-600">지급액</p>
          <p className="text-xl font-bold text-green-800">{formatCurrency(totalStats.paid)}</p>
        </div>
        <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
          <p className="text-sm text-orange-600">미지급</p>
          <p className="text-xl font-bold text-orange-800">{formatCurrency(totalStats.unpaid)}</p>
        </div>
      </div>

      {/* 필터 및 검색 */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">🔍 필터 & 검색</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">년도</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
            >
              <option value={2024}>2024년</option>
              <option value={2025}>2025년</option>
              <option value={2026}>2026년</option>
              <option value={2027}>2027년</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">월</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value === "" ? "" : parseInt(e.target.value))}
              className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
            >
              <option value="">전체</option>
              {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                <option key={month} value={month}>{month}월</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">공급업체</label>
            <select
              value={selectedSupplier}
              onChange={(e) => setSelectedSupplier(e.target.value)}
              className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
            >
              <option value="">전체</option>
              {suppliers.map((supplier) => (
                <option key={supplier} value={supplier}>{supplier}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">검수상태</label>
            <select
              value={selectedInspectionStatus}
              onChange={(e) => setSelectedInspectionStatus(e.target.value)}
              className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
            >
              <option value="">전체</option>
              <option value="PENDING">대기</option>
              <option value="PASSED">승인</option>
              <option value="FAILED">반려</option>
              <option value="WAIVED">면제</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">결제상태</label>
            <select
              value={selectedPaymentStatus}
              onChange={(e) => setSelectedPaymentStatus(e.target.value)}
              className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
            >
              <option value="">전체</option>
              <option value="UNPAID">미지급</option>
              <option value="PARTIAL">부분지급</option>
              <option value="PAID">지급완료</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">검색</label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="계약번호/계약명/업체명"
              className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* 필터 초기화 */}
        <div className="mt-4 flex justify-end">
          <button
            onClick={() => {
              setSelectedMonth("")
              setSelectedSupplier("")
              setSelectedInspectionStatus("")
              setSelectedPaymentStatus("")
              setSearchQuery("")
            }}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
          >
            필터 초기화
          </button>
        </div>
      </div>

      {/* 일괄 작업 */}
      {selectedIds.size > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-blue-800">{selectedIds.size}건 선택됨</p>
              <p className="text-sm text-blue-600 mt-1">
                계획: {formatCurrency(selectedStats.planned)} / 실제: {formatCurrency(selectedStats.actual)} / 지급: {formatCurrency(selectedStats.paid)}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleBatchApprove}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                ✅ 일괄 승인
              </button>
              <button
                onClick={() => setSelectedIds(new Set())}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
              >
                선택 해제
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 실적 테이블 */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedIds.size === filteredPerformances.length && filteredPerformances.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">기간</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">계약번호</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">계약명</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">공급업체</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">계획금액</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">실제금액</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">이행률</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">검수</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">결제</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">지급액</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">관리</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPerformances.length === 0 ? (
                <tr>
                  <td colSpan={12} className="px-4 py-8 text-center text-gray-500">
                    조회된 실적이 없습니다
                  </td>
                </tr>
              ) : (
                filteredPerformances.map((perf) => (
                  <tr key={perf.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(perf.id)}
                        onChange={() => toggleSelect(perf.id)}
                        className="rounded"
                      />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                      {perf.year}년 {perf.month}월
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-blue-600">
                      <a href={`/dashboard/contracts/${perf.contract.id}`} className="hover:underline">
                        {perf.contract.contractNo}
                      </a>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">{perf.contract.contractName}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{perf.contract.supplier.name}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-900">
                      {formatCurrency(perf.plannedAmount)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-medium text-purple-600">
                      {formatCurrency(perf.actualAmount)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-center">
                      <span className={`font-medium ${perf.performanceRate >= 100 ? "text-green-600" : perf.performanceRate >= 80 ? "text-yellow-600" : "text-red-600"}`}>
                        {perf.performanceRate.toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-center">
                      {getStatusBadge(perf.inspectionStatus)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-center">
                      {getStatusBadge(perf.paymentStatus)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-medium text-green-600">
                      {formatCurrency(perf.paidAmount)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-center">
                      <a href={`/dashboard/contracts/${perf.contract.id}`}>
                        <button className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700">
                          상세
                        </button>
                      </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 안내 메시지 */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          💡 <strong>Tip:</strong> "상세" 버튼을 클릭하면 해당 계약의 상세 페이지로 이동하여 실적 입력, 검수, 결제를 처리할 수 있습니다.
        </p>
      </div>
    </div>
  )
}
