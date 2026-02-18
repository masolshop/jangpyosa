"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { API_BASE } from "@/lib/api"
import { getToken } from "@/lib/auth"

interface Contract {
  id: string
  contractNo: string
  contractName: string
  startDate: string
  endDate: string
  totalAmount: number
  monthlyAmount: number
  status: string
  createdAt: string
  buyer: {
    name: string
    bizNo: string
  }
  supplier: {
    name: string
    bizNo: string
  }
}

interface Performance {
  id: string
  year: number
  month: number
  plannedAmount: number
  actualAmount: number
  performanceRate: number
  submittedAt: string | null
  description: string | null
  evidenceFileUrls: string | null
  inspectionStatus: "PENDING" | "PASSED" | "FAILED" | "WAIVED"
  inspectedAt: string | null
  inspectionNotes: string | null
  paymentStatus: "UNPAID" | "PARTIAL" | "PAID"
  paidAmount: number
  paymentHistory: string | null
}

export default function ContractDetailPage() {
  const params = useParams()
  const router = useRouter()
  const contractId = params.id as string

  const [contract, setContract] = useState<Contract | null>(null)
  const [performances, setPerformances] = useState<Performance[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [userRole, setUserRole] = useState<string>("")

  // 실적 입력 모달
  const [showPerformanceModal, setShowPerformanceModal] = useState(false)
  const [selectedPerformance, setSelectedPerformance] = useState<Performance | null>(null)
  const [actualAmount, setActualAmount] = useState("")
  const [description, setDescription] = useState("")
  const [evidenceUrls, setEvidenceUrls] = useState("")

  // 검수 모달
  const [showInspectionModal, setShowInspectionModal] = useState(false)
  const [inspectionStatus, setInspectionStatus] = useState<"PASSED" | "FAILED" | "WAIVED">("PASSED")
  const [inspectionNotes, setInspectionNotes] = useState("")

  // 결제 모달
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [paymentAmount, setPaymentAmount] = useState("")
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split("T")[0])
  const [paymentMethod, setPaymentMethod] = useState("BANK_TRANSFER")
  const [invoiceNo, setInvoiceNo] = useState("")

  useEffect(() => {
    const role = localStorage.getItem("userRole")
    setUserRole(role || "")
    fetchData()
  }, [contractId])

  const fetchData = async () => {
    try {
      setLoading(true)
      const token = getToken()

      // 계약 정보
      const contractRes = await fetch(`${API_BASE}/contracts/${contractId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!contractRes.ok) throw new Error("계약 정보를 불러올 수 없습니다")
      const contractData = await contractRes.json()
      setContract(contractData)

      // 월별 이행실적
      const perfRes = await fetch(`${API_BASE}/contracts/${contractId}/performances`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!perfRes.ok) throw new Error("이행실적을 불러올 수 없습니다")
      const perfData = await perfRes.json()
      setPerformances(perfData)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // 실적 입력 제출
  const handleSubmitPerformance = async () => {
    if (!selectedPerformance) return
    try {
      const token = getToken()
      const evidenceArray = evidenceUrls.split(",").map((url) => url.trim()).filter(Boolean)

      const res = await fetch(`${API_BASE}/performances/${selectedPerformance.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          actualAmount: parseInt(actualAmount),
          description,
          evidenceFileUrls: evidenceArray
        })
      })

      if (!res.ok) throw new Error("실적 입력에 실패했습니다")
      alert("실적이 성공적으로 입력되었습니다")
      setShowPerformanceModal(false)
      resetPerformanceForm()
      fetchData()
    } catch (err: any) {
      alert(err.message)
    }
  }

  // 검수 제출
  const handleSubmitInspection = async () => {
    if (!selectedPerformance) return
    try {
      const token = getToken()
      const res = await fetch(`${API_BASE}/performances/${selectedPerformance.id}/inspection`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          inspectionStatus,
          inspectionNotes
        })
      })

      if (!res.ok) throw new Error("검수 처리에 실패했습니다")
      alert("검수가 완료되었습니다")
      setShowInspectionModal(false)
      resetInspectionForm()
      fetchData()
    } catch (err: any) {
      alert(err.message)
    }
  }

  // 결제 제출
  const handleSubmitPayment = async () => {
    if (!selectedPerformance) return
    try {
      const token = getToken()
      const res = await fetch(`${API_BASE}/performances/${selectedPerformance.id}/payment`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          paymentAmount: parseInt(paymentAmount),
          paymentDate,
          paymentMethod,
          invoiceNo
        })
      })

      if (!res.ok) throw new Error("결제 처리에 실패했습니다")
      alert("결제가 완료되었습니다")
      setShowPaymentModal(false)
      resetPaymentForm()
      fetchData()
    } catch (err: any) {
      alert(err.message)
    }
  }

  const resetPerformanceForm = () => {
    setSelectedPerformance(null)
    setActualAmount("")
    setDescription("")
    setEvidenceUrls("")
  }

  const resetInspectionForm = () => {
    setSelectedPerformance(null)
    setInspectionStatus("PASSED")
    setInspectionNotes("")
  }

  const resetPaymentForm = () => {
    setSelectedPerformance(null)
    setPaymentAmount("")
    setPaymentDate(new Date().toISOString().split("T")[0])
    setPaymentMethod("BANK_TRANSFER")
    setInvoiceNo("")
  }

  const openPerformanceModal = (perf: Performance) => {
    setSelectedPerformance(perf)
    setActualAmount(perf.actualAmount.toString())
    setDescription(perf.description || "")
    setEvidenceUrls(perf.evidenceFileUrls ? JSON.parse(perf.evidenceFileUrls).join(", ") : "")
    setShowPerformanceModal(true)
  }

  const openInspectionModal = (perf: Performance) => {
    setSelectedPerformance(perf)
    setInspectionNotes(perf.inspectionNotes || "")
    setShowInspectionModal(true)
  }

  const openPaymentModal = (perf: Performance) => {
    setSelectedPerformance(perf)
    setPaymentAmount(perf.plannedAmount.toString())
    setShowPaymentModal(true)
  }

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      ACTIVE: "bg-green-100 text-green-800",
      COMPLETED: "bg-blue-100 text-blue-800",
      TERMINATED: "bg-red-100 text-red-800",
      PENDING: "bg-yellow-100 text-yellow-800",
      PASSED: "bg-green-100 text-green-800",
      FAILED: "bg-red-100 text-red-800",
      WAIVED: "bg-gray-100 text-gray-800",
      UNPAID: "bg-red-100 text-red-800",
      PARTIAL: "bg-orange-100 text-orange-800",
      PAID: "bg-green-100 text-green-800"
    }
    const labels: Record<string, string> = {
      ACTIVE: "진행중",
      COMPLETED: "완료",
      TERMINATED: "해지",
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

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("ko-KR")
  }

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

  if (error || !contract) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error || "계약을 찾을 수 없습니다"}</p>
          <button
            onClick={() => router.push("/dashboard/contracts")}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            계약 목록으로 돌아가기
          </button>
        </div>
      </div>
    )
  }

  const totalPaid = performances.reduce((sum, p) => sum + p.paidAmount, 0)
  const totalActual = performances.reduce((sum, p) => sum + p.actualAmount, 0)
  const totalPlanned = performances.reduce((sum, p) => sum + p.plannedAmount, 0)
  const averageRate = totalPlanned > 0 ? (totalActual / totalPlanned * 100).toFixed(1) : "0.0"

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* 헤더 */}
      <div className="mb-6">
        <button
          onClick={() => router.push("/dashboard/contracts")}
          className="text-blue-600 hover:text-blue-800 mb-4 flex items-center gap-2"
        >
          ← 계약 목록으로
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">{contract.contractName}</h1>
            <p className="text-gray-600 mt-1">계약번호: {contract.contractNo}</p>
          </div>
          {getStatusBadge(contract.status)}
        </div>
      </div>

      {/* 계약 정보 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">📋 계약 정보</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">계약 기간:</span>
              <span className="font-medium">{formatDate(contract.startDate)} ~ {formatDate(contract.endDate)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">총 계약금액:</span>
              <span className="font-bold text-blue-600">{formatCurrency(contract.totalAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">월 계약금액:</span>
              <span className="font-medium">{formatCurrency(contract.monthlyAmount)}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">🏢 업체 정보</h2>
          <div className="space-y-3">
            <div>
              <p className="text-gray-600 text-sm">구매기업</p>
              <p className="font-medium">{contract.buyer.name} ({contract.buyer.bizNo})</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">공급업체</p>
              <p className="font-medium">{contract.supplier.name} ({contract.supplier.bizNo})</p>
            </div>
          </div>
        </div>
      </div>

      {/* 실적 요약 */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-6 mb-8">
        <h2 className="text-lg font-bold text-gray-800 mb-4">📊 실적 요약</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-gray-600 text-sm">계획금액</p>
            <p className="text-xl font-bold text-gray-800">{formatCurrency(totalPlanned)}</p>
          </div>
          <div>
            <p className="text-gray-600 text-sm">실제금액</p>
            <p className="text-xl font-bold text-blue-600">{formatCurrency(totalActual)}</p>
          </div>
          <div>
            <p className="text-gray-600 text-sm">지급액</p>
            <p className="text-xl font-bold text-green-600">{formatCurrency(totalPaid)}</p>
          </div>
          <div>
            <p className="text-gray-600 text-sm">평균 이행률</p>
            <p className="text-xl font-bold text-purple-600">{averageRate}%</p>
          </div>
        </div>
      </div>

      {/* 월별 이행실적 타임라인 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-6">📅 월별 이행실적</h2>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">기간</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">계획금액</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">실제금액</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">이행률</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">검수상태</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">결제상태</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">지급액</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">관리</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {performances.map((perf) => (
                <tr key={perf.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                    {perf.year}년 {perf.month}월
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-900">
                    {formatCurrency(perf.plannedAmount)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-medium text-blue-600">
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
                    <div className="flex justify-center gap-2">
                      {userRole === "SUPPLIER" && (
                        <button
                          onClick={() => openPerformanceModal(perf)}
                          className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                        >
                          실적입력
                        </button>
                      )}
                      {(userRole === "BUYER" || userRole === "SUPER_ADMIN") && (
                        <>
                          <button
                            onClick={() => openInspectionModal(perf)}
                            disabled={perf.actualAmount === 0}
                            className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                          >
                            검수
                          </button>
                          <button
                            onClick={() => openPaymentModal(perf)}
                            disabled={perf.inspectionStatus !== "PASSED"}
                            className="px-3 py-1 bg-purple-600 text-white text-xs rounded hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                          >
                            결제
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 실적 입력 모달 */}
      {showPerformanceModal && selectedPerformance && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              💼 실적 입력 ({selectedPerformance.year}년 {selectedPerformance.month}월)
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  계획금액
                </label>
                <input
                  type="text"
                  value={formatCurrency(selectedPerformance.plannedAmount)}
                  disabled
                  className="w-full px-3 py-2 border rounded bg-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  실제금액 *
                </label>
                <input
                  type="number"
                  value={actualAmount}
                  onChange={(e) => setActualAmount(e.target.value)}
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                  placeholder="실제 이행금액 입력"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  실적 설명
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                  placeholder="실적 내용 설명"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  증빙자료 URL (쉼표로 구분)
                </label>
                <textarea
                  value={evidenceUrls}
                  onChange={(e) => setEvidenceUrls(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                  placeholder="https://example.com/file1.pdf, https://example.com/file2.pdf"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSubmitPerformance}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                제출
              </button>
              <button
                onClick={() => {
                  setShowPerformanceModal(false)
                  resetPerformanceForm()
                }}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 검수 모달 */}
      {showInspectionModal && selectedPerformance && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              ✅ 실적 검수 ({selectedPerformance.year}년 {selectedPerformance.month}월)
            </h3>
            
            <div className="space-y-4">
              <div className="bg-gray-50 p-3 rounded">
                <p className="text-sm text-gray-600">계획금액: {formatCurrency(selectedPerformance.plannedAmount)}</p>
                <p className="text-sm text-gray-600">실제금액: {formatCurrency(selectedPerformance.actualAmount)}</p>
                <p className="text-sm text-gray-600">이행률: {selectedPerformance.performanceRate.toFixed(1)}%</p>
                {selectedPerformance.description && (
                  <p className="text-sm text-gray-600 mt-2">실적 설명: {selectedPerformance.description}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  검수 결과 *
                </label>
                <select
                  value={inspectionStatus}
                  onChange={(e) => setInspectionStatus(e.target.value as "PASSED" | "FAILED" | "WAIVED")}
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-green-500"
                >
                  <option value="PASSED">승인</option>
                  <option value="FAILED">반려</option>
                  <option value="WAIVED">면제</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  검수 의견
                </label>
                <textarea
                  value={inspectionNotes}
                  onChange={(e) => setInspectionNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-green-500"
                  placeholder="검수 의견 입력"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSubmitInspection}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                검수 완료
              </button>
              <button
                onClick={() => {
                  setShowInspectionModal(false)
                  resetInspectionForm()
                }}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 결제 모달 */}
      {showPaymentModal && selectedPerformance && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              💰 결제 처리 ({selectedPerformance.year}년 {selectedPerformance.month}월)
            </h3>
            
            <div className="space-y-4">
              <div className="bg-gray-50 p-3 rounded">
                <p className="text-sm text-gray-600">계획금액: {formatCurrency(selectedPerformance.plannedAmount)}</p>
                <p className="text-sm text-gray-600">실제금액: {formatCurrency(selectedPerformance.actualAmount)}</p>
                <p className="text-sm text-gray-600">기지급액: {formatCurrency(selectedPerformance.paidAmount)}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  결제금액 *
                </label>
                <input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-purple-500"
                  placeholder="결제할 금액 입력"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  결제일자 *
                </label>
                <input
                  type="date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  결제방법 *
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-purple-500"
                >
                  <option value="BANK_TRANSFER">계좌이체</option>
                  <option value="CARD">카드결제</option>
                  <option value="CHECK">수표</option>
                  <option value="CASH">현금</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  송금번호/영수증번호
                </label>
                <input
                  type="text"
                  value={invoiceNo}
                  onChange={(e) => setInvoiceNo(e.target.value)}
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-purple-500"
                  placeholder="송금번호 또는 영수증번호"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSubmitPayment}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
              >
                결제 완료
              </button>
              <button
                onClick={() => {
                  setShowPaymentModal(false)
                  resetPaymentForm()
                }}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
