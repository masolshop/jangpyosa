"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { API_BASE } from "@/lib/api";
import { getToken, getUserRole } from "@/lib/auth";

type MonthlyData = {
  [key: string]: number;
};

export default function EmployeeCountPage() {
  const router = useRouter();
  const [year, setYear] = useState(2026);
  const [monthlyData, setMonthlyData] = useState<MonthlyData>({});
  const [companyName, setCompanyName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const role = getUserRole();
    if (role !== "BUYER" && role !== "SUPER_ADMIN") {
      router.push("/");
      return;
    }

    fetchEmployeeCount();
  }, [year]);

  async function fetchEmployeeCount() {
    const token = getToken();
    if (!token) {
      router.push("/login");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_BASE}/dashboard/employee-count?year=${year}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("데이터 조회 실패");
      }

      const data = await res.json();
      setMonthlyData(data.monthlyData);
      setCompanyName(data.companyName);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function saveEmployeeCount() {
    const token = getToken();
    if (!token) {
      router.push("/login");
      return;
    }

    setSaving(true);
    setMessage("");
    setError("");

    try {
      const res = await fetch(`${API_BASE}/dashboard/employee-count`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          year,
          monthlyData,
        }),
      });

      if (!res.ok) {
        throw new Error("저장 실패");
      }

      const data = await res.json();
      setMessage("✅ " + data.message);
      
      // 3초 후 메시지 자동 삭제
      setTimeout(() => setMessage(""), 3000);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  function updateMonth(month: string, value: string) {
    const numValue = parseInt(value) || 0;
    setMonthlyData({
      ...monthlyData,
      [month]: numValue,
    });
  }

  function copyPreviousMonth() {
    const months = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];
    const newData = { ...monthlyData };
    
    for (let i = 1; i < months.length; i++) {
      if (!newData[months[i]] || newData[months[i]] === 0) {
        newData[months[i]] = newData[months[i - 1]] || 0;
      }
    }
    
    setMonthlyData(newData);
  }

  function fillAllMonths() {
    const firstValue = monthlyData["1"] || 0;
    const newData: MonthlyData = {};
    
    for (let i = 1; i <= 12; i++) {
      newData[i.toString()] = firstValue;
    }
    
    setMonthlyData(newData);
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

  return (
    <div className="container">
      <div className="card" style={{ maxWidth: 900, margin: "40px auto" }}>
        <h1>👥 상시근로자 수 관리</h1>
        <p style={{ color: "#666", marginTop: 8 }}>
          {companyName} - 월별 상시근로자 수를 입력하세요
        </p>
        <p style={{ color: "#0070f3", fontSize: 14, marginTop: 8 }}>
          💡 <strong>중요:</strong> 상시근로자 수는 부담금·장려금 계산의 기준이 됩니다. 정확한 인원수를 입력해주세요.
        </p>

        {/* 연도 선택 */}
        <div style={{ marginTop: 24 }}>
          <label>연도</label>
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            style={{ maxWidth: 200 }}
          >
            <option value={2024}>2024년</option>
            <option value={2025}>2025년</option>
            <option value={2026}>2026년</option>
            <option value={2027}>2027년</option>
          </select>
        </div>

        {/* 빠른 입력 버튼 */}
        <div style={{ marginTop: 16, display: "flex", gap: 12 }}>
          <button
            onClick={fillAllMonths}
            style={{
              padding: "8px 16px",
              fontSize: 14,
              background: "#10b981",
              color: "white",
              border: "none",
              borderRadius: 4,
              cursor: "pointer",
            }}
          >
            📋 1월 값을 전체 복사
          </button>
          <button
            onClick={copyPreviousMonth}
            style={{
              padding: "8px 16px",
              fontSize: 14,
              background: "#3b82f6",
              color: "white",
              border: "none",
              borderRadius: 4,
              cursor: "pointer",
            }}
          >
            ➡️ 이전 달 값 자동 채우기
          </button>
        </div>

        {/* 월별 입력 그리드 */}
        <div
          style={{
            marginTop: 24,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 16,
          }}
        >
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((month) => (
            <div key={month} style={{ padding: 16, background: "#f8f9fa", borderRadius: 8 }}>
              <label style={{ fontWeight: "bold", color: "#333" }}>{month}월</label>
              <input
                type="number"
                value={monthlyData[month.toString()] || 0}
                onChange={(e) => updateMonth(month.toString(), e.target.value)}
                style={{
                  width: "100%",
                  marginTop: 8,
                  padding: 12,
                  fontSize: 18,
                  fontWeight: "bold",
                  textAlign: "center",
                  border: "2px solid #e5e7eb",
                  borderRadius: 6,
                }}
                placeholder="0"
                min="0"
              />
              <p style={{ marginTop: 4, fontSize: 12, color: "#666", textAlign: "center" }}>명</p>
            </div>
          ))}
        </div>

        {/* 총합 표시 */}
        <div
          style={{
            marginTop: 24,
            padding: 20,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            borderRadius: 8,
            color: "white",
            textAlign: "center",
          }}
        >
          <p style={{ margin: 0, fontSize: 16, opacity: 0.9 }}>연평균 상시근로자 수</p>
          <p style={{ margin: "8px 0 0 0", fontSize: 32, fontWeight: "bold" }}>
            {Object.values(monthlyData).length > 0
              ? Math.round(
                  Object.values(monthlyData).reduce((sum, val) => sum + val, 0) / 12
                ).toLocaleString()
              : 0}
            명
          </p>
        </div>

        {/* 저장 버튼 */}
        <button
          onClick={saveEmployeeCount}
          disabled={saving}
          style={{
            width: "100%",
            marginTop: 24,
            padding: 16,
            fontSize: 16,
            fontWeight: "bold",
            background: "#0070f3",
            color: "white",
            border: "none",
            borderRadius: 8,
            cursor: saving ? "not-allowed" : "pointer",
            opacity: saving ? 0.7 : 1,
          }}
        >
          {saving ? "저장 중..." : "💾 저장하기"}
        </button>

        {/* 메시지 */}
        {message && (
          <div
            style={{
              marginTop: 16,
              padding: 16,
              background: "#d1fae5",
              color: "#065f46",
              borderRadius: 8,
              fontWeight: "bold",
            }}
          >
            {message}
          </div>
        )}

        {error && (
          <div
            style={{
              marginTop: 16,
              padding: 16,
              background: "#fee2e2",
              color: "#991b1b",
              borderRadius: 8,
              fontWeight: "bold",
            }}
          >
            ❌ {error}
          </div>
        )}

        {/* 안내 */}
        <div
          style={{
            marginTop: 24,
            padding: 16,
            background: "#fef3c7",
            borderRadius: 8,
            fontSize: 14,
            lineHeight: 1.6,
          }}
        >
          <p style={{ margin: 0, fontWeight: "bold", color: "#92400e" }}>
            📌 상시근로자 수란?
          </p>
          <ul style={{ marginTop: 8, paddingLeft: 20, color: "#78350f" }}>
            <li>해당 월의 마지막 날 기준 상시근로자 수</li>
            <li>정규직, 계약직, 파견직 등 모든 근로자 포함</li>
            <li>단기 아르바이트는 제외</li>
            <li>
              의무고용인원 = 상시근로자 수 × 의무고용률(민간기업 3.1%, 공공기관 3.8%)
            </li>
          </ul>
        </div>

        {/* 대시보드로 돌아가기 */}
        <button
          onClick={() => router.push("/dashboard")}
          style={{
            width: "100%",
            marginTop: 16,
            padding: 12,
            fontSize: 14,
            background: "#6b7280",
            color: "white",
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
          }}
        >
          ← 대시보드로 돌아가기
        </button>
      </div>
    </div>
  );
}
