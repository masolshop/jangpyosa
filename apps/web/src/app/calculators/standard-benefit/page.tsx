"use client";

import { useMemo, useState } from "react";
import { API_BASE } from "@/lib/api";
import { formatCurrencyWithKorean } from "@/lib/currency";

export default function StandardBenefitCalculatorV2() {
  const [disabledEmployees, setDisabledEmployees] = useState("");
  const [newDisabledHires, setNewDisabledHires] = useState("");
  const [keadAssessedAmount, setKeadAssessedAmount] = useState("");

  // 무상지원 항목(적격 체크 포함)
  const [grantItems, setGrantItems] = useState({
    facilityAmount: 200_000_000, facilityEligible: true,
    equipmentAmount: 200_000_000, equipmentEligible: true,
    convenienceAmount: 50_000_000, convenienceEligible: true,
    commuteVehicleAmount: 50_000_000, commuteVehicleEligible: false,
    certConsultingAmount: 10_000_000, certConsultingEligible: false
  });

  // 전문가(선택)
  const [expert, setExpert] = useState({ monthlyWage: 3_000_000, months: 24 });

  // 세액 입력 모드
  const [taxMode, setTaxMode] = useState<"array" | "growth">("growth");
  const [annualTaxBase, setAnnualTaxBase] = useState(200_000_000);
  const [growthRatePct, setGrowthRatePct] = useState(5);
  const [annualTaxArray, setAnnualTaxArray] = useState<number[]>(
    Array.from({ length: 10 }, () => 200_000_000)
  );

  const [result, setResult] = useState<any>(null);
  const [msg, setMsg] = useState("");

  const taxesPreview = useMemo(() => {
    if (taxMode === "array") return annualTaxArray;
    const g = growthRatePct / 100;
    return Array.from({ length: 10 }, (_, i) => Math.floor(annualTaxBase * Math.pow(1 + g, i)));
  }, [taxMode, annualTaxArray, annualTaxBase, growthRatePct]);

  async function calc() {
    setMsg("");
    const payload = {
      disabledEmployees: Number(disabledEmployees || 0),
      newDisabledHires: Number(newDisabledHires || 0),
      keadAssessedAmount: Number(keadAssessedAmount || 0),
      grantItems,
      expert,
      tax: taxMode === "array"
        ? { mode: "array", annualTaxArray }
        : { mode: "growth", annualTaxBase, growthRatePct }
    };

    const res = await fetch(`${API_BASE}/calculators/standard-workplace-benefit-v2`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) { setMsg(data?.error || "CALC_FAILED"); return; }
    setResult(data);
  }

  async function downloadPdf() {
    setMsg("");
    const payload = {
      disabledEmployees: Number(disabledEmployees || 0),
      newDisabledHires: Number(newDisabledHires || 0),
      keadAssessedAmount: Number(keadAssessedAmount || 0),
      grantItems,
      expert,
      tax: taxMode === "array"
        ? { mode: "array", annualTaxArray }
        : { mode: "growth", annualTaxBase, growthRatePct }
    };

    const res = await fetch(`${API_BASE}/calculators/standard-workplace-benefit-v2/report.pdf`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!res.ok) { setMsg("PDF 생성 실패"); return; }

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "standard_workplace_benefit_report.pdf";
    a.click();
    URL.revokeObjectURL(url);
  }

  const n = (x: number) => Number(x || 0).toLocaleString();

  return (
    <div style={{ padding: 24, maxWidth: 1100, margin: "0 auto" }}>
      <h1>🏢 표준사업장 혜택 계산기</h1>
      <p style={{ color: "#666", marginTop: 8 }}>
        표준사업장 설립/운영 시 받을 수 있는 무상지원금(공단) + 세제혜택(조특법 85-6) 추정
      </p>
      <div
        style={{
          marginTop: 12,
          padding: 16,
          background: "#fff3cd",
          borderRadius: 8,
          fontSize: 14,
        }}
      >
        <p style={{ margin: 0, fontWeight: 600 }}>⚠️ 민원 방지 안내</p>
        <ul style={{ margin: "8px 0 0 0", paddingLeft: 20, lineHeight: 1.8 }}>
          <li>항목별 지원은 심사/승인 결과에 따라 일부 불인정될 수 있습니다.</li>
          <li>세액감면은 연도별 한도 및 요건 충족에 따라 제한될 수 있습니다.</li>
          <li>부정수급/용도외 사용/인증취소 등 사유 발생 시 지원·감면이 제한될 수 있습니다.</li>
        </ul>
      </div>

      <div
        style={{
          marginTop: 24,
          padding: 20,
          background: "white",
          borderRadius: 8,
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        }}
      >
        <h2>기본 입력</h2>
        <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: 12, marginTop: 16 }}>
          <label style={{ fontWeight: 600 }}>장애인 상시근로자 수</label>
          <input type="number" value={disabledEmployees} onChange={(e) => setDisabledEmployees(e.target.value)} placeholder="10" />

          <label style={{ fontWeight: 600 }}>신규 장애인 고용 인원</label>
          <input type="number" value={newDisabledHires} onChange={(e) => setNewDisabledHires(e.target.value)} placeholder="10" />

          <label style={{ fontWeight: 600 }}>공단 산정금액(원)</label>
          <input type="number" value={keadAssessedAmount} onChange={(e) => setKeadAssessedAmount(e.target.value)} placeholder="500000000" />
        </div>
      </div>

      <div
        style={{
          marginTop: 24,
          padding: 20,
          background: "white",
          borderRadius: 8,
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        }}
      >
        <h2>① 무상지원금 항목별 입력(적격 체크)</h2>
        <div style={{ display: "grid", gridTemplateColumns: "240px 1fr 120px", gap: 12, alignItems: "center", marginTop: 16 }}>
          {[
            ["facilityAmount", "시설"],
            ["equipmentAmount", "장비"],
            ["convenienceAmount", "편의시설"],
            ["commuteVehicleAmount", "통근차량"],
            ["certConsultingAmount", "인증/컨설팅"],
          ].map(([key, label]) => {
            const eligibleKey = (key.replace("Amount", "Eligible")) as keyof typeof grantItems;
            const amountKey = key as keyof typeof grantItems;

            return (
              <div key={key} style={{ display: "contents" }}>
                <label style={{ fontWeight: 600 }}>{label}(원)</label>
                <input
                  type="number"
                  value={grantItems[amountKey] as any}
                  onChange={(e) => setGrantItems({ ...grantItems, [amountKey]: Number(e.target.value) })}
                />
                <label style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <input
                    type="checkbox"
                    checked={grantItems[eligibleKey] as any}
                    onChange={(e) => setGrantItems({ ...grantItems, [eligibleKey]: e.target.checked })}
                  />
                  적격
                </label>
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: 16, padding: 12, background: "#f0f9ff", borderRadius: 6, fontSize: 14 }}>
          <b>고용관리 전문가(선택)</b> - 월{" "}
          <input
            type="number"
            value={expert.monthlyWage}
            onChange={(e) => setExpert({ ...expert, monthlyWage: Number(e.target.value) })}
            style={{ width: 140 }}
          />
          원 /{" "}
          <input
            type="number"
            value={expert.months}
            onChange={(e) => setExpert({ ...expert, months: Number(e.target.value) })}
            style={{ width: 80 }}
          />
          개월 (최대 24개월, 월 최대 300만원)
        </div>
      </div>

      <div
        style={{
          marginTop: 24,
          padding: 20,
          background: "white",
          borderRadius: 8,
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        }}
      >
        <h2>② 세액감면(10년)</h2>
        <div style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 16 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <input type="radio" checked={taxMode === "growth"} onChange={() => setTaxMode("growth")} />
            성장률로 자동생성
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <input type="radio" checked={taxMode === "array"} onChange={() => setTaxMode("array")} />
            10년치 직접입력
          </label>
        </div>

        {taxMode === "growth" ? (
          <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: 12, marginTop: 16 }}>
            <label style={{ fontWeight: 600 }}>1년차 산출세액(원)</label>
            <input type="number" value={annualTaxBase} onChange={(e) => setAnnualTaxBase(Number(e.target.value))} />
            <label style={{ fontWeight: 600 }}>연 성장률(%)</label>
            <input type="number" value={growthRatePct} onChange={(e) => setGrowthRatePct(Number(e.target.value))} />
          </div>
        ) : (
          <div style={{ marginTop: 16 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8 }}>
              {annualTaxArray.map((v, i) => (
                <div key={i}>
                  <div style={{ fontSize: 12, color: "#666", marginBottom: 4 }}>{i + 1}년차</div>
                  <input
                    type="number"
                    value={v}
                    onChange={(e) => {
                      const next = [...annualTaxArray];
                      next[i] = Number(e.target.value);
                      setAnnualTaxArray(next);
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ marginTop: 12, padding: 12, background: "#f9f9f9", borderRadius: 6, fontSize: 13, color: "#666" }}>
          <b>미리보기(10년 산출세액):</b> {taxesPreview.map((t) => n(t)).join(" / ")}
        </div>
      </div>

      <div style={{ marginTop: 24, display: "flex", gap: 12 }}>
        <button
          onClick={calc}
          style={{
            flex: 1,
            padding: "16px 24px",
            background: "#0070f3",
            color: "white",
            border: "none",
            borderRadius: 8,
            fontSize: 16,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          📊 계산하기
        </button>
        <button
          onClick={downloadPdf}
          style={{
            flex: 1,
            padding: "16px 24px",
            background: "#10b981",
            color: "white",
            border: "none",
            borderRadius: 8,
            fontSize: 16,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          📥 PDF 리포트 다운로드
        </button>
      </div>

      {msg && <p style={{ marginTop: 12, color: "#e00" }}>{msg}</p>}

      {result && (
        <div style={{ marginTop: 24 }}>
          <h2>결과 요약</h2>

          <div
            style={{
              padding: 20,
              background: "white",
              borderRadius: 8,
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            }}
          >
            <h3>💰 무상지원금(추정)</h3>
            <div style={{ lineHeight: 2 }}>
              <div>적격 합계: <b>{formatCurrencyWithKorean(result.grant.eligibleSum)}</b></div>
              <div>지원 산정기준(min(적격합계, 공단산정)): <b>{formatCurrencyWithKorean(result.grant.baseForSupport)}</b></div>
              <div>시설/장비 등 지원: <b>{formatCurrencyWithKorean(result.grant.facilityGrant)}</b></div>
              <div>전문가 지원: <b>{formatCurrencyWithKorean(result.grant.expertSupport)}</b></div>
              <div style={{ marginTop: 8, fontSize: 18, color: "#10b981" }}>
                무상지원 합계: <b>{formatCurrencyWithKorean(result.grant.grantTotal)}</b>
              </div>
            </div>
            <p style={{ marginTop: 8, fontSize: 13, color: "#666" }}>{result.grant.rule}</p>
          </div>

          <div
            style={{
              marginTop: 16,
              padding: 20,
              background: "white",
              borderRadius: 8,
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            }}
          >
            <h3>💸 세액감면(추정, 10년)</h3>
            <div style={{ lineHeight: 2 }}>
              <div>연도별 감면 한도: <b>{formatCurrencyWithKorean(result.tax.annualCap)}</b></div>
              <div style={{ marginTop: 8, fontSize: 18, color: "#3b82f6" }}>
                10년 세액감면 합계: <b>{formatCurrencyWithKorean(result.tax.taxReductionTotal)}</b>
              </div>
            </div>
            <details style={{ marginTop: 12 }}>
              <summary style={{ cursor: "pointer", fontWeight: 600 }}>연차별 보기</summary>
              <ul style={{ marginTop: 8, paddingLeft: 20 }}>
                {result.tax.yearly.map((y: any) => (
                  <li key={y.yearIndex}>
                    {y.yearIndex}년차: 산출세액 {n(y.tax)}원 × {Math.round(y.rate * 100)}% → 감면(캡) {n(y.cappedReduction)}원
                  </li>
                ))}
              </ul>
            </details>
            <p style={{ marginTop: 8, fontSize: 13, color: "#666" }}>{result.tax.rule}</p>
          </div>

          <div
            style={{
              marginTop: 16,
              padding: 24,
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              borderRadius: 8,
              color: "white",
            }}
          >
            <h3 style={{ color: "white" }}>🎯 총 혜택(추정)</h3>
            <div style={{ fontSize: 32, fontWeight: "bold", marginTop: 8 }}>
              {formatCurrencyWithKorean(result.totalBenefit)}
            </div>
            <p style={{ marginTop: 12, fontSize: 14, opacity: 0.9 }}>{result.disclaimer}</p>
          </div>
        </div>
      )}

      <style jsx>{`
        input[type="number"],
        input[type="text"] {
          padding: 10px 12px;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 14px;
          width: 100%;
        }
        input:focus {
          outline: none;
          border-color: #0070f3;
        }
        label {
          display: block;
          font-weight: 500;
          color: #333;
        }
        button {
          transition: all 0.2s;
        }
        button:hover {
          opacity: 0.9;
        }
      `}</style>
    </div>
  );
}
