"use client";

import { useState } from "react";
import { API_BASE } from "@/lib/api";

// 숫자를 한글 금액으로 변환하는 함수
function toKoreanCurrency(num: number): string {
  const units = ['', '만', '억', '조'];
  const smallUnits = ['', '천', '백', '십'];
  
  if (num === 0) return '';
  
  let result = '';
  let unitIndex = 0;
  
  while (num > 0) {
    const part = num % 10000;
    if (part > 0) {
      let partStr = '';
      let tempPart = part;
      let smallUnitIndex = 0;
      
      while (tempPart > 0) {
        const digit = tempPart % 10;
        if (digit > 0) {
          if (digit === 1 && smallUnitIndex > 0) {
            partStr = smallUnits[smallUnitIndex] + partStr;
          } else {
            partStr = digit + smallUnits[smallUnitIndex] + partStr;
          }
        }
        tempPart = Math.floor(tempPart / 10);
        smallUnitIndex++;
      }
      
      result = partStr + units[unitIndex] + result;
    }
    num = Math.floor(num / 10000);
    unitIndex++;
  }
  
  return result;
}

// 금액 포맷팅 함수 (천단위 구분 + 한글)
function formatCurrency(amount: number): { formatted: string; korean: string } {
  const roundedAmount = Math.round(amount);
  const formatted = roundedAmount.toLocaleString();
  const korean = toKoreanCurrency(roundedAmount);
  
  return {
    formatted,
    korean: korean ? `(${korean}원)` : ''
  };
}

export default function LevyCalcPage() {
  const [year, setYear] = useState(2026);
  const [employeeCount, setEmployeeCount] = useState("");
  const [disabledCount, setDisabledCount] = useState("");
  const [companyType, setCompanyType] = useState("PRIVATE");
  const [taxRate, setTaxRate] = useState(""); // 법인세율 (%)
  const [includeLocalTax, setIncludeLocalTax] = useState(true); // 지방소득세 포함 여부
  const [out, setOut] = useState<any>(null);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // 법인세 대상 여부 판별
  const isTaxable = companyType === "PRIVATE" || companyType === "PUBLIC_CORP";
  
  // 의무고용률 계산
  const quotaRate = companyType === "PRIVATE" ? 0.031 : 0.038;

  async function run() {
    setMsg("");
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/calculators/levy`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          year, 
          employeeCount: Number(employeeCount) || 0, 
          disabledCount: Number(disabledCount) || 0, 
          companyType 
        }),
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
        <div
          style={{
            marginTop: 12,
            padding: 12,
            background: "#fff3cd",
            borderRadius: 4,
            fontSize: 14,
            color: "#856404",
            border: "1px solid #ffeeba",
          }}
        >
          <p style={{ margin: 0, fontWeight: 600 }}>
            ⚠️ 본 모의계산 프로그램은 실제 고용부담(장려)금 신고프로그램이 아닌 참고용 프로그램입니다.
          </p>
        </div>
        <p style={{ color: "#666", marginTop: 12 }}>
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
            <option value="PUBLIC_CORP">공기업·준정부기관·지방공기업(법인) (3.8%)</option>
            <option value="GOVERNMENT">국가·지자체·직접 집행기관 (3.8%)</option>
            <option value="OTHER_PUBLIC">기타 공공기관 (제외/사단 등 비영리) (3.8%)</option>
          </select>
          <p style={{ fontSize: 13, color: "#666", marginTop: 4 }}>
            💡 {isTaxable ? "법인세 대상 기관" : "비과세 기관"}
          </p>

          <label>상시근로자 수 (명)</label>
          <input
            type="number"
            value={employeeCount}
            onChange={(e) => setEmployeeCount(e.target.value)}
            placeholder="100"
          />

          <label>장애인 고용인원 (명)</label>
          <input
            type="number"
            value={disabledCount}
            onChange={(e) => setDisabledCount(e.target.value)}
            placeholder="0"
          />

          {isTaxable && (
            <>
              <label>법인세율 (%)</label>
              <input
                type="number"
                value={taxRate}
                onChange={(e) => setTaxRate(e.target.value)}
                min="0"
                max="100"
                step="0.1"
                placeholder="22"
              />
              <p style={{ fontSize: 13, color: "#666", marginTop: 4 }}>
                💡 법인세율 (영리법인: 9~24%, 비영리법인: 10%) - 부담금은 손금불산입되어 법인세가 추가 발생합니다
              </p>

              <label style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12 }}>
                <input
                  type="checkbox"
                  checked={includeLocalTax}
                  onChange={(e) => setIncludeLocalTax(e.target.checked)}
                />
                <span>지방소득세 10% 포함</span>
              </label>
              <p style={{ fontSize: 13, color: "#666", marginTop: 4 }}>
                💡 법인세에 지방소득세(법인세의 10%)가 추가로 부과됩니다
              </p>
            </>
          )}

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
                <strong>부담금:</strong>{" "}
                {(() => {
                  const { formatted, korean } = formatCurrency(out.estimated);
                  return `${formatted}원 ${korean}`;
                })()}
              </p>
              {isTaxable && Number(taxRate) > 0 && (
                <>
                  <p style={{ fontSize: 16, color: "#d97706" }}>
                    <strong>법인세 ({taxRate}%):</strong>{" "}
                    {(() => {
                      const { formatted, korean } = formatCurrency(out.estimated * (Number(taxRate) / 100));
                      return `${formatted}원 ${korean}`;
                    })()}
                  </p>
                  {includeLocalTax && (
                    <p style={{ fontSize: 15, color: "#f59e0b" }}>
                      <strong>+ 지방소득세 (법인세의 10%):</strong>{" "}
                      {(() => {
                        const { formatted, korean } = formatCurrency(out.estimated * (Number(taxRate) / 100) * 0.1);
                        return `${formatted}원 ${korean}`;
                      })()}
                    </p>
                  )}
                  <p style={{ fontSize: 20, color: "#dc2626", fontWeight: "bold" }}>
                    <strong>실질 부담액:</strong>{" "}
                    {(() => {
                      const { formatted, korean } = formatCurrency(
                        out.estimated * (1 + (Number(taxRate) / 100) * (includeLocalTax ? 1.1 : 1))
                      );
                      return `${formatted}원 ${korean}`;
                    })()}
                  </p>
                </>
              )}
            </div>

            {isTaxable && Number(taxRate) > 0 && (
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
                  {includeLocalTax && " 법인세에 지방소득세(법인세의 10%)가 추가로 부과됩니다."}
                </p>
              </div>
            )}

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
