"use client";

import { useState } from "react";

type MonthData = {
  employees: number; // 상시근로자 수
  disabled: number; // 장애인 근로자 수 (합계)
  mildDisabled: number; // 경증
  severeOver60: number; // 중증 60시간 이상
  severeUnder60: number; // 중증 60시간 미만
};

type MonthResult = {
  month: number;
  employees: number;
  obligated: number; // 의무고용인원
  disabledCount: number; // 인정 장애인 수 (중증 2배수)
  shortfall: number; // 미달인원
  level: string; // 이행수준
  levelEn: "3/4+" | "1/2~3/4" | "1/4~1/2" | "1/4-" | "NONE";
  baseAmount: number; // 부담기초액
  monthlyLevy: number; // 월별 부담금
};

const LEVY_BASE_2026 = {
  "3/4+": 1258000,
  "1/2~3/4": 1333480,
  "1/4~1/2": 1509600,
  "1/4-": 1761200,
  NONE: 2096270,
};

const LEVEL_LABELS: Record<string, string> = {
  "3/4+": "3/4 이상",
  "1/2~3/4": "1/2~3/4 미달",
  "1/4~1/2": "1/4~1/2 미달",
  "1/4-": "1/4 미달",
  NONE: "미고용",
};

const LEVEL_COLORS: Record<string, string> = {
  "3/4+": "#10b981",
  "1/2~3/4": "#3b82f6",
  "1/4~1/2": "#f59e0b",
  "1/4-": "#ef4444",
  NONE: "#991b1b",
};

export default function LevyAnnualPage() {
  const [companyType, setCompanyType] = useState<"PRIVATE" | "GOVERNMENT">("PRIVATE");
  const [months, setMonths] = useState<MonthData[]>(
    Array.from({ length: 12 }, () => ({
      employees: 100,
      disabled: 0,
      mildDisabled: 0,
      severeOver60: 0,
      severeUnder60: 0,
    }))
  );

  const [results, setResults] = useState<MonthResult[] | null>(null);

  const quotaRate = companyType === "PRIVATE" ? 0.031 : 0.038;

  function updateMonth(index: number, field: keyof MonthData, value: number) {
    const newMonths = [...months];
    newMonths[index] = { ...newMonths[index], [field]: value };
    
    // 자동 합계 계산
    const m = newMonths[index];
    m.disabled = m.mildDisabled + m.severeOver60 + m.severeUnder60;
    
    setMonths(newMonths);
  }

  function fillAllMonths() {
    const first = months[0];
    setMonths(Array.from({ length: 12 }, () => ({ ...first })));
  }

  function calculate() {
    const monthResults: MonthResult[] = [];

    for (let i = 0; i < 12; i++) {
      const m = months[i];
      const obligated = Math.floor(m.employees * quotaRate);
      
      // 중증 2배수 인정 (60시간 이상만)
      const disabledCount = m.mildDisabled + m.severeOver60 * 2 + m.severeUnder60;
      
      const shortfall = Math.max(0, obligated - disabledCount);

      // 이행수준 판정
      let level: MonthResult["levelEn"];
      if (disabledCount >= obligated) {
        level = "3/4+"; // 의무이행
      } else if (disabledCount >= Math.floor(obligated * 0.75)) {
        level = "3/4+";
      } else if (disabledCount >= Math.floor(obligated * 0.5)) {
        level = "1/2~3/4";
      } else if (disabledCount >= Math.floor(obligated * 0.25)) {
        level = "1/4~1/2";
      } else if (disabledCount > 0) {
        level = "1/4-";
      } else {
        level = "NONE";
      }

      const baseAmount = LEVY_BASE_2026[level];
      const monthlyLevy = baseAmount * shortfall;

      monthResults.push({
        month: i + 1,
        employees: m.employees,
        obligated,
        disabledCount,
        shortfall,
        level: LEVEL_LABELS[level],
        levelEn: level,
        baseAmount,
        monthlyLevy,
      });
    }

    setResults(monthResults);
  }

  // 집계
  const totalEmployees = months.reduce((sum, m) => sum + m.employees, 0);
  const avgEmployees = Math.floor(totalEmployees / 12);
  const isSubjectTo = avgEmployees >= 100;

  const totalLevy = results?.reduce((sum, r) => sum + r.monthlyLevy, 0) || 0;
  const totalObligated = results?.reduce((sum, r) => sum + r.obligated, 0) || 0;
  const totalShortfall = results?.reduce((sum, r) => sum + r.shortfall, 0) || 0;

  // 구간별 집계
  const levelGroups = results?.reduce(
    (acc, r) => {
      if (!acc[r.levelEn]) acc[r.levelEn] = { count: 0, shortfall: 0, levy: 0 };
      acc[r.levelEn].count += 1;
      acc[r.levelEn].shortfall += r.shortfall;
      acc[r.levelEn].levy += r.monthlyLevy;
      return acc;
    },
    {} as Record<string, { count: number; shortfall: number; levy: number }>
  );

  return (
    <div style={{ padding: 20, maxWidth: 1400, margin: "0 auto" }}>
      <h1>📅 연간 월별 부담금 계산기</h1>
      <p style={{ color: "#666", marginTop: 8 }}>
        매월 상시근로자 수와 장애인 고용 현황을 입력하여 정확한 연간 부담금을 계산하세요
      </p>

      {/* 기본 설정 */}
      <div
        style={{
          marginTop: 24,
          padding: 20,
          background: "white",
          borderRadius: 8,
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        }}
      >
        <h2>기본 설정</h2>
        <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div>
            <label style={{ fontWeight: 600 }}>기업 유형</label>
            <select
              value={companyType}
              onChange={(e) => setCompanyType(e.target.value as any)}
              style={{ width: "100%", marginTop: 8 }}
            >
              <option value="PRIVATE">민간/공공기업 (3.1%)</option>
              <option value="GOVERNMENT">국가/지자체/교육청 (3.8%)</option>
            </select>
          </div>
          <div>
            <label style={{ fontWeight: 600 }}>월평균 상시근로자 수</label>
            <input
              type="text"
              value={`${avgEmployees}명`}
              readOnly
              style={{ width: "100%", marginTop: 8, background: "#f5f5f5" }}
            />
          </div>
        </div>

        {isSubjectTo ? (
          <div
            style={{
              marginTop: 16,
              padding: 12,
              background: "#e7f3ff",
              borderRadius: 6,
              color: "#0070f3",
            }}
          >
            ✅ 월평균 {avgEmployees}명으로 <strong>부담금 신고대상</strong>입니다.
          </div>
        ) : (
          <div
            style={{
              marginTop: 16,
              padding: 12,
              background: "#fff3cd",
              borderRadius: 6,
              color: "#856404",
            }}
          >
            ℹ️ 월평균 {avgEmployees}명으로 <strong>부담금 신고대상 제외</strong>입니다. (100명 미만)
          </div>
        )}
      </div>

      {/* 월별 입력 테이블 */}
      <div
        style={{
          marginTop: 24,
          padding: 20,
          background: "white",
          borderRadius: 8,
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2>월별 고용 현황 입력</h2>
          <button
            onClick={fillAllMonths}
            style={{
              padding: "8px 16px",
              background: "#6366f1",
              color: "white",
              border: "none",
              borderRadius: 6,
              cursor: "pointer",
            }}
          >
            1월 데이터를 전체 월에 복사
          </button>
        </div>

        <div style={{ marginTop: 16, overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead>
              <tr style={{ background: "#f5f5f5" }}>
                <th style={{ padding: 12, border: "1px solid #ddd" }}>월</th>
                <th style={{ padding: 12, border: "1px solid #ddd" }}>상시근로자 수</th>
                <th style={{ padding: 12, border: "1px solid #ddd" }}>경증 장애인</th>
                <th style={{ padding: 12, border: "1px solid #ddd" }}>중증 (60h+)</th>
                <th style={{ padding: 12, border: "1px solid #ddd" }}>중증 (60h-)</th>
                <th style={{ padding: 12, border: "1px solid #ddd" }}>합계</th>
              </tr>
            </thead>
            <tbody>
              {months.map((m, i) => (
                <tr key={i}>
                  <td style={{ padding: 8, border: "1px solid #ddd", textAlign: "center" }}>
                    {i + 1}월
                  </td>
                  <td style={{ padding: 8, border: "1px solid #ddd" }}>
                    <input
                      type="number"
                      value={m.employees}
                      onChange={(e) => updateMonth(i, "employees", Number(e.target.value))}
                      style={{ width: "100%", textAlign: "center" }}
                    />
                  </td>
                  <td style={{ padding: 8, border: "1px solid #ddd" }}>
                    <input
                      type="number"
                      value={m.mildDisabled}
                      onChange={(e) => updateMonth(i, "mildDisabled", Number(e.target.value))}
                      style={{ width: "100%", textAlign: "center" }}
                    />
                  </td>
                  <td style={{ padding: 8, border: "1px solid #ddd" }}>
                    <input
                      type="number"
                      value={m.severeOver60}
                      onChange={(e) => updateMonth(i, "severeOver60", Number(e.target.value))}
                      style={{ width: "100%", textAlign: "center" }}
                    />
                  </td>
                  <td style={{ padding: 8, border: "1px solid #ddd" }}>
                    <input
                      type="number"
                      value={m.severeUnder60}
                      onChange={(e) => updateMonth(i, "severeUnder60", Number(e.target.value))}
                      style={{ width: "100%", textAlign: "center" }}
                    />
                  </td>
                  <td
                    style={{
                      padding: 8,
                      border: "1px solid #ddd",
                      textAlign: "center",
                      background: "#f9f9f9",
                      fontWeight: 600,
                    }}
                  >
                    {m.disabled}명
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ marginTop: 16, padding: 12, background: "#f0f9ff", borderRadius: 6, fontSize: 13 }}>
          <p style={{ marginBottom: 4 }}>
            💡 <strong>중증 장애인 2배수 인정:</strong> 월 임금지급기초일수 16일 이상, 소정근로시간 60시간 이상인 중증 장애인은 2명으로 계산됩니다.
          </p>
          <p>
            💡 <strong>중증 60h-:</strong> 60시간 미만 중증 장애인은 1명으로 계산됩니다.
          </p>
        </div>

        <button
          onClick={calculate}
          style={{
            width: "100%",
            marginTop: 16,
            padding: 16,
            background: "#0070f3",
            color: "white",
            border: "none",
            borderRadius: 8,
            fontSize: 16,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          📊 연간 부담금 계산하기
        </button>
      </div>

      {/* 계산 결과 */}
      {results && (
        <>
          {/* 연간 요약 */}
          <div
            style={{
              marginTop: 24,
              padding: 24,
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              borderRadius: 8,
              color: "white",
            }}
          >
            <h2 style={{ color: "white", marginBottom: 16 }}>📈 연간 부담금 합계</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
              <div>
                <p style={{ opacity: 0.9, fontSize: 14 }}>연간 의무고용인원</p>
                <p style={{ fontSize: 28, fontWeight: "bold", marginTop: 4 }}>{totalObligated}명</p>
              </div>
              <div>
                <p style={{ opacity: 0.9, fontSize: 14 }}>연간 미달인원</p>
                <p style={{ fontSize: 28, fontWeight: "bold", marginTop: 4 }}>{totalShortfall}명</p>
              </div>
              <div style={{ gridColumn: "span 2" }}>
                <p style={{ opacity: 0.9, fontSize: 14 }}>연간 부담금 총액</p>
                <p style={{ fontSize: 36, fontWeight: "bold", marginTop: 4 }}>
                  {totalLevy.toLocaleString()}원
                </p>
              </div>
            </div>
          </div>

          {/* 구간별 집계 */}
          <div
            style={{
              marginTop: 24,
              padding: 20,
              background: "white",
              borderRadius: 8,
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            }}
          >
            <h2>📊 이행수준별 집계</h2>
            <div style={{ marginTop: 16, overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#f5f5f5" }}>
                    <th style={{ padding: 12, border: "1px solid #ddd" }}>이행수준</th>
                    <th style={{ padding: 12, border: "1px solid #ddd" }}>해당 월 수</th>
                    <th style={{ padding: 12, border: "1px solid #ddd" }}>부담기초액</th>
                    <th style={{ padding: 12, border: "1px solid #ddd" }}>미달인원</th>
                    <th style={{ padding: 12, border: "1px solid #ddd" }}>부담금 소계</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(levelGroups || {}).map(([levelEn, data]) => (
                    <tr key={levelEn}>
                      <td
                        style={{
                          padding: 12,
                          border: "1px solid #ddd",
                          color: LEVEL_COLORS[levelEn],
                          fontWeight: 600,
                        }}
                      >
                        {LEVEL_LABELS[levelEn]}
                      </td>
                      <td style={{ padding: 12, border: "1px solid #ddd", textAlign: "center" }}>
                        {data.count}개월
                      </td>
                      <td style={{ padding: 12, border: "1px solid #ddd", textAlign: "right" }}>
                        {LEVY_BASE_2026[levelEn as keyof typeof LEVY_BASE_2026].toLocaleString()}원
                      </td>
                      <td style={{ padding: 12, border: "1px solid #ddd", textAlign: "center" }}>
                        {data.shortfall}명
                      </td>
                      <td
                        style={{
                          padding: 12,
                          border: "1px solid #ddd",
                          textAlign: "right",
                          fontWeight: 600,
                        }}
                      >
                        {data.levy.toLocaleString()}원
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 월별 상세 */}
          <div
            style={{
              marginTop: 24,
              padding: 20,
              background: "white",
              borderRadius: 8,
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            }}
          >
            <h2>📋 월별 상세 내역</h2>
            <div style={{ marginTop: 16, overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                <thead>
                  <tr style={{ background: "#f5f5f5" }}>
                    <th style={{ padding: 12, border: "1px solid #ddd" }}>월</th>
                    <th style={{ padding: 12, border: "1px solid #ddd" }}>상시근로자</th>
                    <th style={{ padding: 12, border: "1px solid #ddd" }}>의무고용</th>
                    <th style={{ padding: 12, border: "1px solid #ddd" }}>장애인 수<br/>(인정)</th>
                    <th style={{ padding: 12, border: "1px solid #ddd" }}>미달인원</th>
                    <th style={{ padding: 12, border: "1px solid #ddd" }}>이행수준</th>
                    <th style={{ padding: 12, border: "1px solid #ddd" }}>부담기초액</th>
                    <th style={{ padding: 12, border: "1px solid #ddd" }}>월별 부담금</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((r) => (
                    <tr key={r.month}>
                      <td style={{ padding: 8, border: "1px solid #ddd", textAlign: "center" }}>
                        {r.month}월
                      </td>
                      <td style={{ padding: 8, border: "1px solid #ddd", textAlign: "center" }}>
                        {r.employees}명
                      </td>
                      <td style={{ padding: 8, border: "1px solid #ddd", textAlign: "center" }}>
                        {r.obligated}명
                      </td>
                      <td style={{ padding: 8, border: "1px solid #ddd", textAlign: "center" }}>
                        {r.disabledCount}명
                      </td>
                      <td style={{ padding: 8, border: "1px solid #ddd", textAlign: "center", color: "#ef4444", fontWeight: 600 }}>
                        {r.shortfall}명
                      </td>
                      <td
                        style={{
                          padding: 8,
                          border: "1px solid #ddd",
                          textAlign: "center",
                          color: LEVEL_COLORS[r.levelEn],
                          fontWeight: 600,
                        }}
                      >
                        {r.level}
                      </td>
                      <td style={{ padding: 8, border: "1px solid #ddd", textAlign: "right" }}>
                        {r.baseAmount.toLocaleString()}원
                      </td>
                      <td
                        style={{
                          padding: 8,
                          border: "1px solid #ddd",
                          textAlign: "right",
                          fontWeight: 600,
                        }}
                      >
                        {r.monthlyLevy.toLocaleString()}원
                      </td>
                    </tr>
                  ))}
                  <tr style={{ background: "#f5f5f5", fontWeight: "bold" }}>
                    <td colSpan={4} style={{ padding: 12, border: "1px solid #ddd", textAlign: "right" }}>
                      연간 합계
                    </td>
                    <td style={{ padding: 12, border: "1px solid #ddd", textAlign: "center" }}>
                      {totalShortfall}명
                    </td>
                    <td colSpan={2} style={{ padding: 12, border: "1px solid #ddd" }}></td>
                    <td
                      style={{
                        padding: 12,
                        border: "1px solid #ddd",
                        textAlign: "right",
                        color: "#e00",
                        fontSize: 16,
                      }}
                    >
                      {totalLevy.toLocaleString()}원
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* 안내사항 */}
          <div
            style={{
              marginTop: 24,
              padding: 20,
              background: "#fff3cd",
              borderRadius: 8,
            }}
          >
            <h3 style={{ marginBottom: 12 }}>⚠️ 주의사항</h3>
            <ul style={{ lineHeight: 2, paddingLeft: 20 }}>
              <li>본 계산은 <strong>추정치</strong>이며, 실제 부담금은 장려금, 연계고용 감면액 등에 따라 달라질 수 있습니다.</li>
              <li>사업 개시일, 폐업일이 속하는 월과 조업이 없는 월은 제외해야 합니다.</li>
              <li>중증 장애인 2배수 인정은 <strong>월 소정근로시간 60시간 이상</strong>인 경우에만 적용됩니다.</li>
              <li>정확한 부담금 산정은 한국장애인고용공단(1588-1519)에 문의하시기 바랍니다.</li>
            </ul>
          </div>

          {/* 연계고용 안내 */}
          <div
            style={{
              marginTop: 24,
              padding: 20,
              background: "white",
              borderRadius: 8,
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            }}
          >
            <h3 style={{ marginBottom: 12 }}>💡 부담금 절감 방법: 연계고용</h3>
            <p style={{ lineHeight: 1.8, color: "#666" }}>
              장애인표준사업장과 도급계약을 체결하면 부담금을 <strong>최대 90%</strong>까지 감면받을 수 있습니다.
              <br />
              연간 도급계약 금액의 50% 한도 내에서 감면 가능합니다.
            </p>
            <div style={{ marginTop: 16, display: "flex", gap: 12 }}>
              <a href="/catalog" style={{ flex: 1 }}>
                <button style={{ width: "100%" }}>표준사업장 둘러보기</button>
              </a>
              <a href="/calculators/linkage" style={{ flex: 1 }}>
                <button style={{ width: "100%" }}>연계고용 감면 계산하기</button>
              </a>
            </div>
          </div>
        </>
      )}

      <style jsx>{`
        label {
          display: block;
          font-weight: 500;
          margin-bottom: 4px;
          color: #333;
        }
        input,
        select {
          padding: 10px 12px;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 14px;
        }
        input:focus,
        select:focus {
          outline: none;
          border-color: #0070f3;
        }
        button {
          padding: 12px 24px;
          background: #0070f3;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
          transition: all 0.2s;
        }
        button:hover {
          background: #0051cc;
        }
      `}</style>
    </div>
  );
}
