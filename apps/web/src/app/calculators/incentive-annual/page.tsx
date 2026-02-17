"use client";

import { useState } from "react";

type Worker = {
  id: string;
  name: string;
  disabilityType: string;
  severity: "MILD" | "SEVERE";
  gender: "M" | "F";
  hireDate: string; // YYYY-MM-DD
  monthlySalary: number;
  hasEmploymentInsurance: boolean;
  meetsMinimumWage: boolean;
};

type MonthData = {
  employees: number; // 상시근로자 수
  workers: Worker[]; // 해당 월 근무 중인 장애인 근로자
};

type MonthResult = {
  month: number;
  employees: number;
  obligated: number; // 고용의무인원
  baseCount: number; // 장려금 기준인원
  excludedCount: number; // 제외인원
  eligibleCount: number; // 지급인원
  incentiveAmount: number; // 장려금
  baseWorkers: Worker[]; // 기준인원에 포함된 근로자
  excludedWorkers: Worker[]; // 제외된 근로자
  eligibleWorkers: { worker: Worker; amount: number }[]; // 지급대상 근로자
};

const INCENTIVE_RATES_2026 = {
  MILD_M: 350000,
  MILD_F: 500000,
  SEVERE_M: 700000,
  SEVERE_F: 900000,
};

export default function IncentiveAnnualPage() {
  const [companyType, setCompanyType] = useState<"PRIVATE" | "GOVERNMENT">("PRIVATE");
  const [minimumWage, setMinimumWage] = useState(2060740); // 2026년 최저임금 (예상)
  
  const [months, setMonths] = useState<MonthData[]>(
    Array.from({ length: 12 }, () => ({
      employees: 100,
      workers: [],
    }))
  );

  const [allWorkers, setAllWorkers] = useState<Worker[]>([]);
  const [editingWorker, setEditingWorker] = useState<Partial<Worker>>({
    severity: "MILD",
    gender: "M",
    hasEmploymentInsurance: true,
    meetsMinimumWage: true,
  });

  const [results, setResults] = useState<MonthResult[] | null>(null);

  const quotaRate = companyType === "PRIVATE" ? 0.031 : 0.038;

  function updateEmployees(index: number, value: number) {
    const newMonths = [...months];
    newMonths[index].employees = value;
    setMonths(newMonths);
  }

  function addWorker() {
    if (!editingWorker.name || !editingWorker.hireDate || !editingWorker.monthlySalary) {
      alert("성명, 입사일, 월 임금은 필수 입력입니다.");
      return;
    }

    const worker: Worker = {
      id: Date.now().toString(),
      name: editingWorker.name!,
      disabilityType: editingWorker.disabilityType || "지체",
      severity: editingWorker.severity!,
      gender: editingWorker.gender!,
      hireDate: editingWorker.hireDate!,
      monthlySalary: editingWorker.monthlySalary!,
      hasEmploymentInsurance: editingWorker.hasEmploymentInsurance!,
      meetsMinimumWage: editingWorker.meetsMinimumWage!,
    };

    setAllWorkers([...allWorkers, worker]);
    setEditingWorker({
      severity: "MILD",
      gender: "M",
      hasEmploymentInsurance: true,
      meetsMinimumWage: true,
    });
  }

  function removeWorker(id: string) {
    setAllWorkers(allWorkers.filter((w) => w.id !== id));
  }

  function calculate() {
    const monthResults: MonthResult[] = [];

    for (let i = 0; i < 12; i++) {
      const m = months[i];
      const monthDate = new Date(2026, i, 1);

      // 해당 월에 근무 중인 근로자 필터링
      const activeWorkers = allWorkers.filter((w) => {
        const hireDate = new Date(w.hireDate);
        return hireDate <= monthDate;
      });

      const obligated = Math.floor(m.employees * quotaRate);
      const baseCount = Math.ceil(m.employees * quotaRate); // 소수점 올림

      // 기준인원 산정 (입사일 순 → 경증/남성 순)
      const sortedWorkers = [...activeWorkers].sort((a, b) => {
        const dateCompare = new Date(a.hireDate).getTime() - new Date(b.hireDate).getTime();
        if (dateCompare !== 0) return dateCompare;

        // 입사일이 같으면 경증 → 남성 순
        if (a.severity !== b.severity) {
          return a.severity === "MILD" ? -1 : 1;
        }
        if (a.gender !== b.gender) {
          return a.gender === "M" ? -1 : 1;
        }

        // 임금이 낮은 순
        return a.monthlySalary - b.monthlySalary;
      });

      const baseWorkers = sortedWorkers.slice(0, baseCount);
      const eligibleWorkersCandidates = sortedWorkers.slice(baseCount);

      // 제외인원 판정
      const excludedWorkers = eligibleWorkersCandidates.filter(
        (w) => !w.hasEmploymentInsurance || !w.meetsMinimumWage
      );

      // 지급대상 근로자
      const eligibleWorkersFiltered = eligibleWorkersCandidates.filter(
        (w) => w.hasEmploymentInsurance && w.meetsMinimumWage
      );

      const eligibleWorkers: { worker: Worker; amount: number }[] =
        eligibleWorkersFiltered.map((w) => {
          let rate = 0;
          if (w.severity === "MILD" && w.gender === "M") rate = INCENTIVE_RATES_2026.MILD_M;
          if (w.severity === "MILD" && w.gender === "F") rate = INCENTIVE_RATES_2026.MILD_F;
          if (w.severity === "SEVERE" && w.gender === "M") rate = INCENTIVE_RATES_2026.SEVERE_M;
          if (w.severity === "SEVERE" && w.gender === "F") rate = INCENTIVE_RATES_2026.SEVERE_F;

          // 중증 장애인: min(단가, 임금 × 60%)
          let amount = rate;
          if (w.severity === "SEVERE") {
            amount = Math.min(rate, w.monthlySalary * 0.6);
          }

          return { worker: w, amount };
        });

      const incentiveAmount = eligibleWorkers.reduce((sum, e) => sum + e.amount, 0);

      monthResults.push({
        month: i + 1,
        employees: m.employees,
        obligated,
        baseCount,
        excludedCount: excludedWorkers.length,
        eligibleCount: eligibleWorkers.length,
        incentiveAmount,
        baseWorkers,
        excludedWorkers,
        eligibleWorkers,
      });
    }

    setResults(monthResults);
  }

  const totalIncentive = results?.reduce((sum, r) => sum + r.incentiveAmount, 0) || 0;
  const totalEligible = results?.reduce((sum, r) => sum + r.eligibleCount, 0) || 0;

  // 분기별 집계
  const quarters = [
    { name: "1분기 (1~3월)", months: results?.slice(0, 3) || [] },
    { name: "2분기 (4~6월)", months: results?.slice(3, 6) || [] },
    { name: "3분기 (7~9월)", months: results?.slice(6, 9) || [] },
    { name: "4분기 (10~12월)", months: results?.slice(9, 12) || [] },
  ];

  return (
    <div style={{ padding: 20, maxWidth: 1600, margin: "0 auto" }}>
      <h1>💸 연간 월별 장애인고용장려금 계산기</h1>
      <p style={{ color: "#666", marginTop: 8 }}>
        의무고용률을 초과하여 장애인을 고용한 사업주에게 지급되는 장려금을 계산하세요
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
            <label style={{ fontWeight: 600 }}>2026년 최저임금 (월 기준)</label>
            <input
              type="number"
              value={minimumWage}
              onChange={(e) => setMinimumWage(Number(e.target.value))}
              style={{ width: "100%", marginTop: 8 }}
            />
          </div>
        </div>

        <div
          style={{
            marginTop: 16,
            padding: 12,
            background: "#e7f3ff",
            borderRadius: 6,
            fontSize: 14,
          }}
        >
          💡 <strong>지급단가 (2026년)</strong>: 경증 남성 35만원, 경증 여성 50만원, 중증 남성 70만원,
          중증 여성 90만원 (중증은 임금의 60%와 비교하여 낮은 금액 적용)
        </div>
      </div>

      {/* 장애인 근로자 등록 */}
      <div
        style={{
          marginTop: 24,
          padding: 20,
          background: "white",
          borderRadius: 8,
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        }}
      >
        <h2>장애인 근로자 등록</h2>
        <div
          style={{
            marginTop: 16,
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 12,
            alignItems: "end",
          }}
        >
          <div>
            <label>성명</label>
            <input
              type="text"
              value={editingWorker.name || ""}
              onChange={(e) => setEditingWorker({ ...editingWorker, name: e.target.value })}
              placeholder="홍길동"
            />
          </div>
          <div>
            <label>장애유형</label>
            <input
              type="text"
              value={editingWorker.disabilityType || ""}
              onChange={(e) =>
                setEditingWorker({ ...editingWorker, disabilityType: e.target.value })
              }
              placeholder="지체, 시각 등"
            />
          </div>
          <div>
            <label>중증여부</label>
            <select
              value={editingWorker.severity}
              onChange={(e) =>
                setEditingWorker({ ...editingWorker, severity: e.target.value as any })
              }
            >
              <option value="MILD">경증</option>
              <option value="SEVERE">중증</option>
            </select>
          </div>
          <div>
            <label>성별</label>
            <select
              value={editingWorker.gender}
              onChange={(e) =>
                setEditingWorker({ ...editingWorker, gender: e.target.value as any })
              }
            >
              <option value="M">남성</option>
              <option value="F">여성</option>
            </select>
          </div>
          <div>
            <label>입사일</label>
            <input
              type="date"
              value={editingWorker.hireDate || ""}
              onChange={(e) => setEditingWorker({ ...editingWorker, hireDate: e.target.value })}
            />
          </div>
          <div>
            <label>월 임금 (원)</label>
            <input
              type="number"
              value={editingWorker.monthlySalary || ""}
              onChange={(e) =>
                setEditingWorker({ ...editingWorker, monthlySalary: Number(e.target.value) })
              }
              placeholder="2000000"
            />
          </div>
          <div>
            <label>고용보험</label>
            <select
              value={editingWorker.hasEmploymentInsurance ? "Y" : "N"}
              onChange={(e) =>
                setEditingWorker({
                  ...editingWorker,
                  hasEmploymentInsurance: e.target.value === "Y",
                })
              }
            >
              <option value="Y">가입</option>
              <option value="N">미가입</option>
            </select>
          </div>
          <div>
            <label>최저임금</label>
            <select
              value={editingWorker.meetsMinimumWage ? "Y" : "N"}
              onChange={(e) =>
                setEditingWorker({
                  ...editingWorker,
                  meetsMinimumWage: e.target.value === "Y",
                })
              }
            >
              <option value="Y">이상</option>
              <option value="N">미만</option>
            </select>
          </div>
        </div>
        <button
          onClick={addWorker}
          style={{
            marginTop: 16,
            background: "#10b981",
            color: "white",
            padding: "10px 20px",
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
          }}
        >
          근로자 추가
        </button>

        {/* 등록된 근로자 목록 */}
        {allWorkers.length > 0 && (
          <div style={{ marginTop: 24 }}>
            <h3>등록된 장애인 근로자 ({allWorkers.length}명)</h3>
            <div style={{ marginTop: 12, overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: "#f5f5f5" }}>
                    <th style={{ padding: 8, border: "1px solid #ddd" }}>성명</th>
                    <th style={{ padding: 8, border: "1px solid #ddd" }}>장애유형</th>
                    <th style={{ padding: 8, border: "1px solid #ddd" }}>중증여부</th>
                    <th style={{ padding: 8, border: "1px solid #ddd" }}>성별</th>
                    <th style={{ padding: 8, border: "1px solid #ddd" }}>입사일</th>
                    <th style={{ padding: 8, border: "1px solid #ddd" }}>월 임금</th>
                    <th style={{ padding: 8, border: "1px solid #ddd" }}>고용보험</th>
                    <th style={{ padding: 8, border: "1px solid #ddd" }}>최저임금</th>
                    <th style={{ padding: 8, border: "1px solid #ddd" }}>삭제</th>
                  </tr>
                </thead>
                <tbody>
                  {allWorkers.map((w) => (
                    <tr key={w.id}>
                      <td style={{ padding: 8, border: "1px solid #ddd", textAlign: "center" }}>
                        {w.name}
                      </td>
                      <td style={{ padding: 8, border: "1px solid #ddd", textAlign: "center" }}>
                        {w.disabilityType}
                      </td>
                      <td style={{ padding: 8, border: "1px solid #ddd", textAlign: "center" }}>
                        {w.severity === "MILD" ? "경증" : "중증"}
                      </td>
                      <td style={{ padding: 8, border: "1px solid #ddd", textAlign: "center" }}>
                        {w.gender === "M" ? "남" : "여"}
                      </td>
                      <td style={{ padding: 8, border: "1px solid #ddd", textAlign: "center" }}>
                        {w.hireDate}
                      </td>
                      <td style={{ padding: 8, border: "1px solid #ddd", textAlign: "right" }}>
                        {w.monthlySalary.toLocaleString()}원
                      </td>
                      <td
                        style={{
                          padding: 8,
                          border: "1px solid #ddd",
                          textAlign: "center",
                          color: w.hasEmploymentInsurance ? "#10b981" : "#ef4444",
                        }}
                      >
                        {w.hasEmploymentInsurance ? "✓" : "✗"}
                      </td>
                      <td
                        style={{
                          padding: 8,
                          border: "1px solid #ddd",
                          textAlign: "center",
                          color: w.meetsMinimumWage ? "#10b981" : "#ef4444",
                        }}
                      >
                        {w.meetsMinimumWage ? "✓" : "✗"}
                      </td>
                      <td style={{ padding: 8, border: "1px solid #ddd", textAlign: "center" }}>
                        <button
                          onClick={() => removeWorker(w.id)}
                          style={{
                            background: "#ef4444",
                            color: "white",
                            border: "none",
                            padding: "4px 12px",
                            borderRadius: 4,
                            cursor: "pointer",
                            fontSize: 12,
                          }}
                        >
                          삭제
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* 월별 상시근로자 수 입력 */}
      <div
        style={{
          marginTop: 24,
          padding: 20,
          background: "white",
          borderRadius: 8,
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        }}
      >
        <h2>월별 상시근로자 수 입력</h2>
        <div
          style={{
            marginTop: 16,
            display: "grid",
            gridTemplateColumns: "repeat(6, 1fr)",
            gap: 12,
          }}
        >
          {months.map((m, i) => (
            <div key={i}>
              <label style={{ fontSize: 13 }}>{i + 1}월</label>
              <input
                type="number"
                value={m.employees}
                onChange={(e) => updateEmployees(i, Number(e.target.value))}
                style={{ width: "100%", textAlign: "center" }}
              />
            </div>
          ))}
        </div>

        <button
          onClick={calculate}
          style={{
            width: "100%",
            marginTop: 20,
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
          💸 연간 장려금 계산하기
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
              background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
              borderRadius: 8,
              color: "white",
            }}
          >
            <h2 style={{ color: "white", marginBottom: 16 }}>💰 연간 장려금 합계</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
              <div>
                <p style={{ opacity: 0.9, fontSize: 14 }}>연간 지급인원</p>
                <p style={{ fontSize: 28, fontWeight: "bold", marginTop: 4 }}>{totalEligible}명</p>
              </div>
              <div style={{ gridColumn: "span 2" }}>
                <p style={{ opacity: 0.9, fontSize: 14 }}>연간 장려금 총액</p>
                <p style={{ fontSize: 36, fontWeight: "bold", marginTop: 4 }}>
                  {totalIncentive.toLocaleString()}원
                </p>
              </div>
            </div>
          </div>

          {/* 분기별 집계 */}
          <div
            style={{
              marginTop: 24,
              padding: 20,
              background: "white",
              borderRadius: 8,
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            }}
          >
            <h2>📊 분기별 집계</h2>
            <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
              {quarters.map((q, i) => {
                const total = q.months.reduce((sum, m) => sum + m.incentiveAmount, 0);
                return (
                  <div
                    key={i}
                    style={{
                      padding: 16,
                      background: "#f8f9fa",
                      borderRadius: 8,
                      border: "1px solid #e0e0e0",
                    }}
                  >
                    <h3 style={{ margin: 0, fontSize: 16 }}>{q.name}</h3>
                    <p style={{ marginTop: 12, fontSize: 24, fontWeight: "bold", color: "#10b981" }}>
                      {total.toLocaleString()}원
                    </p>
                  </div>
                );
              })}
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
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: "#f5f5f5" }}>
                    <th style={{ padding: 10, border: "1px solid #ddd" }}>월</th>
                    <th style={{ padding: 10, border: "1px solid #ddd" }}>상시근로자</th>
                    <th style={{ padding: 10, border: "1px solid #ddd" }}>의무고용인원</th>
                    <th style={{ padding: 10, border: "1px solid #ddd" }}>기준인원</th>
                    <th style={{ padding: 10, border: "1px solid #ddd" }}>제외인원</th>
                    <th style={{ padding: 10, border: "1px solid #ddd" }}>지급인원</th>
                    <th style={{ padding: 10, border: "1px solid #ddd" }}>장려금</th>
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
                        {r.baseCount}명
                      </td>
                      <td
                        style={{
                          padding: 8,
                          border: "1px solid #ddd",
                          textAlign: "center",
                          color: "#ef4444",
                        }}
                      >
                        {r.excludedCount}명
                      </td>
                      <td
                        style={{
                          padding: 8,
                          border: "1px solid #ddd",
                          textAlign: "center",
                          fontWeight: 600,
                          color: "#10b981",
                        }}
                      >
                        {r.eligibleCount}명
                      </td>
                      <td
                        style={{
                          padding: 8,
                          border: "1px solid #ddd",
                          textAlign: "right",
                          fontWeight: 600,
                        }}
                      >
                        {r.incentiveAmount.toLocaleString()}원
                      </td>
                    </tr>
                  ))}
                  <tr style={{ background: "#f5f5f5", fontWeight: "bold" }}>
                    <td colSpan={5} style={{ padding: 10, border: "1px solid #ddd", textAlign: "right" }}>
                      연간 합계
                    </td>
                    <td style={{ padding: 10, border: "1px solid #ddd", textAlign: "center" }}>
                      {totalEligible}명
                    </td>
                    <td
                      style={{
                        padding: 10,
                        border: "1px solid #ddd",
                        textAlign: "right",
                        color: "#10b981",
                        fontSize: 15,
                      }}
                    >
                      {totalIncentive.toLocaleString()}원
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
              <li>본 계산은 <strong>추정치</strong>이며, 실제 장려금은 공단 심사 결과에 따라 달라질 수 있습니다.</li>
              <li>장애인 근로자의 임금을 <strong>전액 지급 후</strong> 신청하셔야 합니다.</li>
              <li>고용장려금을 받을 권리는 <strong>3년간 행사하지 않으면 소멸</strong>됩니다.</li>
              <li>타 지원금(고용보험법, 산업재해보상보험법, 사회적기업육성법)과 중복지급 시 차액만 지급됩니다.</li>
              <li>정확한 장려금 산정은 한국장애인고용공단(1588-1519)에 문의하시기 바랍니다.</li>
            </ul>
          </div>
        </>
      )}

      <style jsx>{`
        label {
          display: block;
          font-weight: 500;
          margin-bottom: 4px;
          color: #333;
          font-size: 13px;
        }
        input,
        select {
          padding: 8px 10px;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 13px;
        }
        input:focus,
        select:focus {
          outline: none;
          border-color: #0070f3;
        }
        button {
          padding: 10px 20px;
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
