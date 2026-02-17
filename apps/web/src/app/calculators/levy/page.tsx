"use client";

import { useState } from "react";
import { API_BASE } from "@/lib/api";

export default function LevyCalcPage() {
  const [year, setYear] = useState(2026);
  const [employeeCount, setEmployeeCount] = useState(100);
  const [disabledCount, setDisabledCount] = useState(0);
  const [companyType, setCompanyType] = useState("PRIVATE");
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
        <h1>💰 장애인고용부담금 계산기</h1>
        <p style={{ color: "#666", marginTop: 8 }}>
          상시근로자 수와 장애인 고용인원을 입력하여 부담금을 추정하세요
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
                <strong>예상 부담금:</strong> {Math.round(out.estimated).toLocaleString()}원
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

        <div style={{ marginTop: 24, textAlign: "center" }}>
          <a href="/">홈으로 돌아가기</a> | <a href="/catalog">상품 둘러보기</a>
        </div>
      </div>
    </div>
  );
}
