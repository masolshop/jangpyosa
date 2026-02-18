"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { API_BASE } from "@/lib/api";
import { getToken, getUserRole } from "@/lib/auth";

type DashboardData = {
  year: number;
  company: {
    name: string;
    type: string;
    quotaRate: number;
  };
  summary: {
    totalLevy: number;
    totalIncentive: number;
    estimatedReduction: number;
    netAmount: number;
    employeeCount: number;
    activeEmployeeCount: number;
  };
};

type CartItem = {
  id: string;
  quantity: number;
  supplierName: string;
  supplierBizNo: string;
  price: number;
  createdAt: string;
};

type ContractStats = {
  totalContracts: number;
  activeContracts: number;
  completedContracts: number;
  currentMonth: {
    planned: number;
    actual: number;
    paid: number;
    performanceRate: number;
  };
  unpaidAmount: number;
};

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [contractStats, setContractStats] = useState<ContractStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const role = getUserRole();
    if (role !== "BUYER" && role !== "SUPER_ADMIN") {
      router.push("/");
      return;
    }

    fetchDashboard();
    fetchCart();
    fetchContractStats();
  }, []);

  async function fetchDashboard() {
    const token = getToken();
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/dashboard?year=2026`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("대시보드 조회 실패");
      }

      const json = await res.json();
      setData(json);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function fetchCart() {
    const token = getToken();
    if (!token) return;

    try {
      const res = await fetch(`${API_BASE}/cart`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const json = await res.json();
        setCartItems(json.items || []);
      }
    } catch (e: any) {
      console.error("장바구니 조회 실패:", e);
    }
  }

  async function fetchContractStats() {
    const token = getToken();
    if (!token) return;

    try {
      const currentYear = new Date().getFullYear();
      const res = await fetch(`${API_BASE}/contracts/stats?year=${currentYear}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const json = await res.json();
        setContractStats(json);
      }
    } catch (e: any) {
      console.error("계약 통계 조회 실패:", e);
    }
  }

  if (loading) {
    return (
      <div className="container">
        <div className="card">
          <p>로딩 중...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="container">
        <div className="card">
          <p className="error">{error || "데이터를 불러올 수 없습니다."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="card">
        <h1>📊 기업 대시보드</h1>
        <p style={{ color: "#666", marginTop: 8 }}>
          {data.company.name} - {data.year}년 장애인고용 현황
        </p>

        {/* 종합 현황 */}
        <div
          style={{
            marginTop: 24,
            padding: 20,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            borderRadius: 8,
            color: "white",
          }}
        >
          <h2 style={{ margin: 0, fontSize: 20 }}>💼 {data.year}년 종합 현황</h2>
          <div
            style={{
              marginTop: 16,
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: 16,
            }}
          >
            <div style={{ padding: 16, background: "rgba(255,255,255,0.15)", borderRadius: 6 }}>
              <p style={{ margin: 0, fontSize: 14, opacity: 0.9 }}>예상 부담금</p>
              <p style={{ margin: "8px 0 0 0", fontSize: 24, fontWeight: "bold" }}>
                {data.summary.totalLevy.toLocaleString()}원
              </p>
            </div>
            <div style={{ padding: 16, background: "rgba(255,255,255,0.15)", borderRadius: 6 }}>
              <p style={{ margin: 0, fontSize: 14, opacity: 0.9 }}>예상 장려금</p>
              <p style={{ margin: "8px 0 0 0", fontSize: 24, fontWeight: "bold", color: "#10b981" }}>
                +{data.summary.totalIncentive.toLocaleString()}원
              </p>
            </div>
            <div style={{ padding: 16, background: "rgba(255,255,255,0.15)", borderRadius: 6 }}>
              <p style={{ margin: 0, fontSize: 14, opacity: 0.9 }}>감면 가능액</p>
              <p style={{ margin: "8px 0 0 0", fontSize: 24, fontWeight: "bold", color: "#fbbf24" }}>
                -{data.summary.estimatedReduction.toLocaleString()}원
              </p>
            </div>
            <div style={{ padding: 16, background: "rgba(255,255,255,0.2)", borderRadius: 6 }}>
              <p style={{ margin: 0, fontSize: 14, opacity: 0.9 }}>순 부담액</p>
              <p style={{ margin: "8px 0 0 0", fontSize: 24, fontWeight: "bold" }}>
                {data.summary.netAmount.toLocaleString()}원
              </p>
            </div>
          </div>
        </div>

        {/* 상시근로자 수 관리 - 가장 중요! */}
        <div style={{ marginTop: 24, padding: 20, background: "linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)", borderRadius: 8, boxShadow: "0 4px 6px rgba(0,0,0,0.1)", color: "white" }}>
          <h2 style={{ margin: 0, fontSize: 20 }}>⚠️ 상시근로자 수 관리 (필수)</h2>
          <p style={{ marginTop: 8, fontSize: 14, opacity: 0.95 }}>
            부담금 계산의 핵심! 월별 상시근로자 수를 정확히 입력해야 정확한 의무고용인원과 부담금이 계산됩니다.
          </p>
          <div style={{ marginTop: 16, display: "flex", gap: 12 }}>
            <a href="/dashboard/employee-count" style={{ flex: 1 }}>
              <button style={{ width: "100%", padding: 16, background: "white", color: "#ef4444", fontWeight: "bold", fontSize: 16, border: "none", borderRadius: 6, cursor: "pointer" }}>
                📊 상시근로자 수 입력/수정
              </button>
            </a>
          </div>
          <div
            style={{
              marginTop: 16,
              padding: 12,
              background: "rgba(255,255,255,0.2)",
              borderRadius: 6,
              fontSize: 13,
            }}
          >
            💡 <strong>의무고용인원</strong> = 상시근로자 수 × 의무고용률(민간 3.1%, 공공 3.8%)
            <br />
            💡 부담금은 의무고용인원에서 실제 장애인 고용인원을 뺀 차이로 계산됩니다
          </div>
        </div>

        {/* 직원 현황 */}
        <div style={{ marginTop: 24, padding: 20, background: "white", borderRadius: 8, boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
          <h2>👥 장애인 직원 현황</h2>
          <div style={{ marginTop: 16, display: "flex", gap: 16 }}>
            <div>
              <p style={{ margin: 0, fontSize: 14, color: "#666" }}>전체 직원</p>
              <p style={{ margin: "8px 0 0 0", fontSize: 20, fontWeight: "bold" }}>
                {data.summary.employeeCount}명
              </p>
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 14, color: "#666" }}>재직 중</p>
              <p style={{ margin: "8px 0 0 0", fontSize: 20, fontWeight: "bold", color: "#10b981" }}>
                {data.summary.activeEmployeeCount}명
              </p>
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 14, color: "#666" }}>퇴사</p>
              <p style={{ margin: "8px 0 0 0", fontSize: 20, fontWeight: "bold", color: "#6b7280" }}>
                {data.summary.employeeCount - data.summary.activeEmployeeCount}명
              </p>
            </div>
          </div>
          <div
            style={{
              marginTop: 16,
              padding: 12,
              background: "#dbeafe",
              borderRadius: 6,
              fontSize: 14,
            }}
          >
            💡 <strong>직원을 한 번만 등록하세요!</strong> 부담금/장려금/감면 계산기에서 자동으로 활용됩니다.
          </div>
          <div style={{ marginTop: 16 }}>
            <a href="/dashboard/employees">
              <button style={{ width: "100%", background: "#10b981" }}>👥 직원 관리 (등록/수정/삭제)</button>
            </a>
          </div>
        </div>

        {/* 신고서 다운로드 */}
        <div
          style={{
            marginTop: 24,
            padding: 20,
            background: "white",
            borderRadius: 8,
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          }}
        >
          <h2>📋 신고서 / 신청서 관리</h2>
          <p style={{ marginTop: 8, fontSize: 14, color: "#666" }}>
            계산기에서 자동 생성된 Excel 파일을 다운로드하여 고용공단에 제출하세요
          </p>
          
          <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {/* 부담금 신고서 */}
            <div
              style={{
                padding: 16,
                background: "#f9fafb",
                borderRadius: 8,
                border: "1px solid #e5e7eb",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    background: "#dbeafe",
                    borderRadius: 8,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 24,
                  }}
                >
                  💰
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: 0, fontSize: 16 }}>부담금 신고서</h3>
                  <p style={{ margin: "4px 0 0 0", fontSize: 13, color: "#666" }}>
                    월별 상세 · 이행수준별 · 분기별 집계
                  </p>
                </div>
              </div>
              <div
                style={{
                  marginTop: 12,
                  padding: 12,
                  background: "#e0f2fe",
                  borderRadius: 6,
                  fontSize: 13,
                }}
              >
                <p style={{ margin: 0, fontWeight: 600, color: "#0369a1" }}>
                  📊 예상 부담금: {data.summary.totalLevy.toLocaleString()}원
                </p>
              </div>
              <a href="/calculators/levy-annual" style={{ textDecoration: "none" }}>
                <button
                  style={{
                    marginTop: 12,
                    width: "100%",
                    background: "#0070f3",
                    padding: "10px",
                    fontSize: 14,
                  }}
                >
                  📥 부담금 계산 & 다운로드
                </button>
              </a>
            </div>

            {/* 장려금 신청서 */}
            <div
              style={{
                padding: 16,
                background: "#f9fafb",
                borderRadius: 8,
                border: "1px solid #e5e7eb",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    background: "#d1fae5",
                    borderRadius: 8,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 24,
                  }}
                >
                  💸
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: 0, fontSize: 16 }}>장려금 신청서</h3>
                  <p style={{ margin: "4px 0 0 0", fontSize: 13, color: "#666" }}>
                    월별 요약 · 지급대상자 · 분기별 집계
                  </p>
                </div>
              </div>
              <div
                style={{
                  marginTop: 12,
                  padding: 12,
                  background: "#d1fae5",
                  borderRadius: 6,
                  fontSize: 13,
                }}
              >
                <p style={{ margin: 0, fontWeight: 600, color: "#047857" }}>
                  💰 예상 장려금: +{data.summary.totalIncentive.toLocaleString()}원
                </p>
              </div>
              <a href="/calculators/incentive-annual" style={{ textDecoration: "none" }}>
                <button
                  style={{
                    marginTop: 12,
                    width: "100%",
                    background: "#10b981",
                    padding: "10px",
                    fontSize: 14,
                  }}
                >
                  📥 장려금 계산 & 다운로드
                </button>
              </a>
            </div>
          </div>

          <div
            style={{
              marginTop: 16,
              padding: 12,
              background: "#fef3c7",
              borderRadius: 6,
              fontSize: 14,
            }}
          >
            💡 <strong>Tip:</strong> 계산기에서 [📥 불러오기] → [계산하기] → [📊 Excel 다운로드] 순서로 진행하세요
          </div>
        </div>

        {/* 도급계약 관리 현황 */}
        {contractStats && (
          <div
            style={{
              marginTop: 24,
              padding: 20,
              background: "white",
              borderRadius: 8,
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h2 style={{ margin: 0 }}>📊 도급계약 관리 현황</h2>
              <a href="/dashboard/contracts" style={{ textDecoration: "none" }}>
                <button
                  style={{
                    background: "#0070f3",
                    color: "white",
                    border: "none",
                    padding: "8px 16px",
                    borderRadius: 6,
                    fontSize: 14,
                    cursor: "pointer",
                  }}
                >
                  📋 계약 목록 보기
                </button>
              </a>
            </div>

            {/* 계약 통계 그리드 */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: 16,
                marginBottom: 20,
              }}
            >
              <div
                style={{
                  padding: 16,
                  background: "#f0f9ff",
                  borderRadius: 8,
                  border: "1px solid #bae6fd",
                }}
              >
                <p style={{ margin: 0, fontSize: 13, color: "#0369a1" }}>총 계약 수</p>
                <p style={{ margin: "8px 0 0 0", fontSize: 24, fontWeight: "bold", color: "#0369a1" }}>
                  {contractStats.totalContracts}건
                </p>
              </div>

              <div
                style={{
                  padding: 16,
                  background: "#ecfdf5",
                  borderRadius: 8,
                  border: "1px solid #6ee7b7",
                }}
              >
                <p style={{ margin: 0, fontSize: 13, color: "#047857" }}>진행중</p>
                <p style={{ margin: "8px 0 0 0", fontSize: 24, fontWeight: "bold", color: "#047857" }}>
                  {contractStats.activeContracts}건
                </p>
              </div>

              <div
                style={{
                  padding: 16,
                  background: "#f3f4f6",
                  borderRadius: 8,
                  border: "1px solid #d1d5db",
                }}
              >
                <p style={{ margin: 0, fontSize: 13, color: "#6b7280" }}>완료</p>
                <p style={{ margin: "8px 0 0 0", fontSize: 24, fontWeight: "bold", color: "#6b7280" }}>
                  {contractStats.completedContracts}건
                </p>
              </div>

              <div
                style={{
                  padding: 16,
                  background: "#fef3c7",
                  borderRadius: 8,
                  border: "1px solid #fde68a",
                }}
              >
                <p style={{ margin: 0, fontSize: 13, color: "#d97706" }}>미지급액</p>
                <p style={{ margin: "8px 0 0 0", fontSize: 24, fontWeight: "bold", color: "#d97706" }}>
                  {contractStats.unpaidAmount.toLocaleString()}원
                </p>
              </div>
            </div>

            {/* 당월 이행 현황 */}
            <div
              style={{
                padding: 16,
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                borderRadius: 8,
                color: "white",
              }}
            >
              <h3 style={{ margin: 0, fontSize: 16, marginBottom: 12 }}>
                💼 당월 이행 현황 ({new Date().getMonth() + 1}월)
              </h3>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                  gap: 12,
                }}
              >
                <div style={{ padding: 12, background: "rgba(255,255,255,0.15)", borderRadius: 6 }}>
                  <p style={{ margin: 0, fontSize: 12, opacity: 0.9 }}>계획금액</p>
                  <p style={{ margin: "6px 0 0 0", fontSize: 18, fontWeight: "bold" }}>
                    {contractStats.currentMonth.planned.toLocaleString()}원
                  </p>
                </div>
                <div style={{ padding: 12, background: "rgba(255,255,255,0.15)", borderRadius: 6 }}>
                  <p style={{ margin: 0, fontSize: 12, opacity: 0.9 }}>실제금액</p>
                  <p style={{ margin: "6px 0 0 0", fontSize: 18, fontWeight: "bold", color: "#60a5fa" }}>
                    {contractStats.currentMonth.actual.toLocaleString()}원
                  </p>
                </div>
                <div style={{ padding: 12, background: "rgba(255,255,255,0.15)", borderRadius: 6 }}>
                  <p style={{ margin: 0, fontSize: 12, opacity: 0.9 }}>지급액</p>
                  <p style={{ margin: "6px 0 0 0", fontSize: 18, fontWeight: "bold", color: "#34d399" }}>
                    {contractStats.currentMonth.paid.toLocaleString()}원
                  </p>
                </div>
                <div style={{ padding: 12, background: "rgba(255,255,255,0.2)", borderRadius: 6 }}>
                  <p style={{ margin: 0, fontSize: 12, opacity: 0.9 }}>이행률</p>
                  <p style={{ margin: "6px 0 0 0", fontSize: 18, fontWeight: "bold" }}>
                    {contractStats.currentMonth.performanceRate.toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>

            <div
              style={{
                marginTop: 12,
                padding: 12,
                background: "#dbeafe",
                borderRadius: 6,
                fontSize: 14,
              }}
            >
              💡 <strong>Tip:</strong> 계약 목록에서 각 계약의 월별 실적을 입력하고 검수·결제 처리를 할 수 있습니다
            </div>
          </div>
        )}

        {/* 장바구니 / 도급계약 */}
        <div
          style={{
            marginTop: 24,
            padding: 20,
            background: "white",
            borderRadius: 8,
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          }}
        >
          <h2>🛒 연계고용 도급계약 장바구니</h2>
          <p style={{ marginTop: 8, fontSize: 14, color: "#666" }}>
            표준사업장과 도급계약을 체결하여 부담금을 최대 90%까지 감면받으세요
          </p>

          {cartItems.length === 0 ? (
            <div
              style={{
                marginTop: 16,
                padding: 40,
                background: "#f9fafb",
                borderRadius: 8,
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: 48, marginBottom: 16 }}>🛒</div>
              <p style={{ margin: 0, fontSize: 16, color: "#666" }}>
                장바구니가 비어있습니다
              </p>
              <p style={{ margin: "8px 0 0 0", fontSize: 14, color: "#999" }}>
                표준사업장 카탈로그에서 원하는 사업장을 선택하세요
              </p>
              <a href="/catalog" style={{ textDecoration: "none" }}>
                <button
                  style={{
                    marginTop: 16,
                    background: "#0070f3",
                    color: "white",
                    border: "none",
                    padding: "12px 24px",
                    borderRadius: 6,
                    fontSize: 14,
                    cursor: "pointer",
                  }}
                >
                  🛒 표준사업장 카탈로그 보기
                </button>
              </a>
            </div>
          ) : (
            <>
              <div style={{ marginTop: 16 }}>
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      padding: 16,
                      marginBottom: 12,
                      background: "#f9fafb",
                      borderRadius: 8,
                      border: "1px solid #e5e7eb",
                      display: "flex",
                      alignItems: "center",
                      gap: 16,
                    }}
                  >
                    <div
                      style={{
                        width: 48,
                        height: 48,
                        background: "#dbeafe",
                        borderRadius: 8,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 24,
                      }}
                    >
                      🏭
                    </div>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ margin: 0, fontSize: 16 }}>{item.supplierName}</h3>
                      <p style={{ margin: "4px 0 0 0", fontSize: 13, color: "#666" }}>
                        사업자번호: {item.supplierBizNo} · 수량: {item.quantity}
                      </p>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <p style={{ margin: 0, fontSize: 18, fontWeight: "bold", color: "#0070f3" }}>
                        {(item.price * item.quantity).toLocaleString()}원
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div
                style={{
                  marginTop: 16,
                  padding: 16,
                  background: "#ecfdf5",
                  borderRadius: 8,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <p style={{ margin: 0, fontSize: 14, color: "#047857" }}>
                    총 {cartItems.length}개 사업장
                  </p>
                  <p style={{ margin: "4px 0 0 0", fontSize: 20, fontWeight: "bold", color: "#047857" }}>
                    총 도급계약 금액: {cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0).toLocaleString()}원
                  </p>
                </div>
                <a href="/cart" style={{ textDecoration: "none" }}>
                  <button
                    style={{
                      background: "#10b981",
                      color: "white",
                      border: "none",
                      padding: "12px 24px",
                      borderRadius: 6,
                      fontSize: 14,
                      cursor: "pointer",
                      fontWeight: "bold",
                    }}
                  >
                    📋 장바구니 상세보기 & 계약진행
                  </button>
                </a>
              </div>

              <div
                style={{
                  marginTop: 12,
                  padding: 12,
                  background: "#fef3c7",
                  borderRadius: 6,
                  fontSize: 14,
                }}
              >
                💡 <strong>Tip:</strong> 도급계약 체결 후 부담금 감면 신청을 하면 최대 90%까지 감면받을 수 있습니다
              </div>
            </>
          )}
        </div>

        {/* 빠른 링크 */}
        <div style={{ marginTop: 24, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 16 }}>
          <a href="/calculators/levy-annual" style={{ textDecoration: "none" }}>
            <div
              style={{
                padding: 20,
                background: "white",
                borderRadius: 8,
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                transition: "all 0.2s",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.1)";
              }}
            >
              <div style={{ fontSize: 32 }}>💰</div>
              <h3 style={{ margin: "8px 0 0 0", fontSize: 16 }}>고용부담금계산기</h3>
              <p style={{ margin: "4px 0 0 0", fontSize: 13, color: "#666" }}>
                월별 부담금 상세 계산
              </p>
            </div>
          </a>

          <a href="/calculators/incentive-annual" style={{ textDecoration: "none" }}>
            <div
              style={{
                padding: 20,
                background: "white",
                borderRadius: 8,
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                transition: "all 0.2s",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.1)";
              }}
            >
              <div style={{ fontSize: 32 }}>💸</div>
              <h3 style={{ margin: "8px 0 0 0", fontSize: 16 }}>고용장려금계산기</h3>
              <p style={{ margin: "4px 0 0 0", fontSize: 13, color: "#666" }}>
                월별 장려금 상세 계산
              </p>
            </div>
          </a>

          <a href="/catalog" style={{ textDecoration: "none" }}>
            <div
              style={{
                padding: 20,
                background: "white",
                borderRadius: 8,
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                transition: "all 0.2s",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.1)";
              }}
            >
              <div style={{ fontSize: 32 }}>🛒</div>
              <h3 style={{ margin: "8px 0 0 0", fontSize: 16 }}>표준사업장 카탈로그</h3>
              <p style={{ margin: "4px 0 0 0", fontSize: 13, color: "#666" }}>
                도급계약으로 부담금 감면
              </p>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}
