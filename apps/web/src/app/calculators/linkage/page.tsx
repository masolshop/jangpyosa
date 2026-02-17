"use client";

import { useState } from "react";
import { API_BASE } from "@/lib/api";

export default function LinkageCalcPage() {
  const [year, setYear] = useState(2026);
  const [levy, setLevy] = useState(0);
  const [contract, setContract] = useState(0);
  const [out, setOut] = useState<any>(null);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  async function run() {
    setMsg("");
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/calculators/linkage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ year, levyAmount: levy, contractAmount: contract }),
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
        <h1>📉 장애인 연계고용 감면 계산기</h1>
        <p style={{ color: "#666", marginTop: 8 }}>
          도급금액을 입력하여 부담금 감면액을 확인하세요
        </p>

        <div style={{ marginTop: 24 }}>
          <label>연도</label>
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
          />

          <label>예상 부담금 (원)</label>
          <input
            type="number"
            value={levy}
            onChange={(e) => setLevy(Number(e.target.value))}
            placeholder="부담금 계산기에서 계산된 금액"
          />

          <label>도급(예정)금액 (원)</label>
          <input
            type="number"
            value={contract}
            onChange={(e) => setContract(Number(e.target.value))}
            placeholder="장바구니 총액 또는 계약 예정액"
          />

          <button onClick={run} disabled={loading} style={{ width: "100%", marginTop: 16 }}>
            {loading ? "계산 중..." : "감면액 계산하기"}
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
            <h2>감면 계산 결과</h2>
            <div style={{ marginTop: 16, lineHeight: 2 }}>
              <p>
                <strong>부담금 90% 상한:</strong> {Math.round(out.maxByLevy).toLocaleString()}원
              </p>
              <p>
                <strong>도급액 50% 상한:</strong> {Math.round(out.maxByContract).toLocaleString()}원
              </p>
              <p style={{ fontSize: 16, color: "#0070f3", fontWeight: "bold" }}>
                <strong>감면 가능 최대치:</strong> {Math.round(out.cap).toLocaleString()}원
              </p>
              <hr style={{ margin: "12px 0", border: "none", borderTop: "1px solid #ddd" }} />
              <p style={{ fontSize: 18, color: "#28a745", fontWeight: "bold" }}>
                <strong>✓ 적용 감면액:</strong> {Math.round(out.reduction).toLocaleString()}원
              </p>
              <p style={{ fontSize: 18, fontWeight: "bold" }}>
                <strong>감면 후 부담금:</strong> {Math.round(out.after).toLocaleString()}원
              </p>
            </div>

            <div
              style={{
                marginTop: 16,
                padding: 12,
                background: "#d1ecf1",
                borderRadius: 4,
                fontSize: 14,
              }}
            >
              <p>ℹ️ {out.rule}</p>
              <p style={{ marginTop: 8 }}>{out.note}</p>
            </div>

            <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
              <a href="/catalog" style={{ flex: 1 }}>
                <button style={{ width: "100%" }}>상품 둘러보기</button>
              </a>
              <a href="/cart" style={{ flex: 1 }}>
                <button style={{ width: "100%", background: "#28a745" }}>
                  장바구니
                </button>
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
