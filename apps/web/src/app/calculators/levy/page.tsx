"use client";

import { useState } from "react";
import { API_BASE } from "@/lib/api";

export default function LevyCalcPage() {
  const [year, setYear] = useState(2026);
  const [employeeCount, setEmployeeCount] = useState(100);
  const [disabledCount, setDisabledCount] = useState(0);
  const [companyType, setCompanyType] = useState("PRIVATE");
  const [taxRate, setTaxRate] = useState(22); // 법인세율 (%)
  const [out, setOut] = useState<any>(null);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  async function run() {
    setMsg("");
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/calculators/levy`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ year, employeeCount, disabledCount, companyType }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMsg(data?.error || "계산 실패");
        return;
      }
      setOut(data);
    } catch (e: any) {
      setMsg("오류: " + e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container">
      <div className="card" style={{ maxWidth: 600, margin: "40px auto" }}>
        <h1>💰 간단부담금계산</h1>
        <p style={{ color: "#666", marginTop: 8 }}>
          상시근로자 수와 장애인 고용인원을 입력하여 부담금을 빠르게 추정하세요
        </p>
        <p style={{ color: "#0070f3", fontSize: 14, marginTop: 8 }}>
          💡 <strong>실무 팁:</strong> 연간 상세 계산이 필요하시면 <a href="/calculators/levy-annual" style={{ color: "#0070f3", textDecoration: "underline" }}>월별부담금계산</a>을 이용하세요
        </p>

        <div style={{ marginTop: 24 }}>
          <label>연도</label>
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
          />

          <label>기업 구분</label>
          <select value={companyType} onChange={(e) => setCompanyType(e.target.value)}>
            <option value="PRIVATE">민간기업 (3.1%)</option>
            <option value="PUBLIC">공공기관 (3.8%)</option>
          </select>

          <label>상시근로자 수 (명)</label>
          <input
            type="number"
            value={employeeCount}
            onChange={(e) => setEmployeeCount(Number(e.target.value))}
          />

          <label>장애인 고용인원 (명)</label>
          <input
            type="number"
            value={disabledCount}
            onChange={(e) => setDisabledCount(Number(e.target.value))}
          />

          <label>법인세율 (%)</label>
          <input
            type="number"
            value={taxRate}
            onChange={(e) => setTaxRate(Number(e.target.value))}
            min="0"
            max="100"
            step="0.1"
          />
          <p style={{ fontSize: 13, color: "#666", marginTop: 4 }}>
            💡 법인세율 (영리법인: 9~24%, 비영리법인: 10%) - 부담금은 손금불산입되어 법인세가 추가 발생합니다
          </p>

          <button onClick={run} disabled={loading} style={{ width: "100%", marginTop: 16 }}>
            {loading ? "계산 중..." : "계산하기"}
          </button>

          {msg && <p className="error">{msg}</p>}
        </div>

        {out && (
          <div
            style={{
              marginTop: 24,
              padding: 16,
              background: "#f8f9fa",
              borderRadius: 4,
            }}
          >
            <h2>계산 결과</h2>
            <div style={{ marginTop: 16, lineHeight: 2 }}>
              <p>
                <strong>의무고용인원:</strong> {out.obligated}명
              </p>
              <p>
                <strong>미달인원:</strong> {out.shortfall}명
              </p>
              <p style={{ fontSize: 18, color: "#e00", fontWeight: "bold" }}>
                <strong>부담금:</strong> {Math.round(out.estimated).toLocaleString()}원
              </p>
              {taxRate > 0 && (
                <>
                  <p style={{ fontSize: 16, color: "#d97706" }}>
                    <strong>법인세 추가 ({taxRate}%):</strong>{" "}
                    {Math.round(out.estimated * (taxRate / 100)).toLocaleString()}원
                  </p>
                  <p style={{ fontSize: 20, color: "#dc2626", fontWeight: "bold" }}>
                    <strong>실질 부담액:</strong>{" "}
                    {Math.round(out.estimated * (1 + taxRate / 100)).toLocaleString()}원
                  </p>
                </>
              )}
            </div>

            <div
              style={{
                marginTop: 16,
                padding: 12,
                background: "#fef3c7",
                borderRadius: 4,
                fontSize: 14,
              }}
            >
              <p style={{ margin: 0, fontWeight: 600 }}>
                💡 법인세 손금불산입 안내
              </p>
              <p style={{ margin: "8px 0 0 0" }}>
                부담금은 법인세 계산 시 비용으로 인정되지 않아, 부담금만큼 과세표준이 증가하여 법인세가 추가로 발생합니다.
              </p>
            </div>

            <div
              style={{
                marginTop: 16,
                padding: 12,
                background: "#fff3cd",
                borderRadius: 4,
                fontSize: 14,
              }}
            >
              <p>⚠️ {out.note}</p>
            </div>

            <div style={{ marginTop: 16 }}>
              <a href="/calculators/linkage">
                <button style={{ width: "100%" }}>연계고용 감면 계산하기</button>
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
