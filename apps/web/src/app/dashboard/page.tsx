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

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const role = getUserRole();
    if (role !== "BUYER") {
      router.push("/");
      return;
    }

    fetchDashboard();
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
          <div style={{ marginTop: 16 }}>
            <a href="/dashboard/employees">
              <button style={{ width: "100%" }}>👥 직원 관리</button>
            </a>
          </div>
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
