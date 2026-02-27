"use client";

import { useState } from "react";
import { API_BASE } from "@/lib/api";

interface MonthlyResult {
  month: number;
  totalEmployeeCount: number;
  disabledCount: number;
  recognizedCount: number;
  obligatedCount: number;
  shortfallCount: number;
  employmentRate: number;
  levyApplicationRate: number;
  levyPerPerson: number;
  levy: number;
  incentive: number;
  netAmount: number;
}

interface SimulationResponse {
  ok: boolean;
  year: number;
  companyType: string;
  totalEmployees: number;
  monthly: MonthlyResult[];
  yearly: {
    totalLevy: number;
    totalIncentive: number;
    netAmount: number;
  };
}

// 숫자 포맷팅
function formatNumber(num: number): string {
  return Math.round(num).toLocaleString();
}

// 금액을 만원 단위로 변환
function toManwon(amount: number): string {
  return (Math.round(amount / 10000)).toLocaleString() + "만";
}

export default function MonthlySimulationPage() {
  const [year] = useState(2026);
  const [companyType, setCompanyType] = useState("PRIVATE_COMPANY");
  
  // 월별 상시근로자 수 (1월~12월)
  const [monthlyCounts, setMonthlyCounts] = useState<number[]>([
    100, 1000, 1200, 1300, 1400, 1500, 300, 300, 300, 300, 300, 300
  ]);
  
  // 장애인 직원 데이터 (페마연 예시)
  const [disabledEmployees] = useState([
    { 
      id: "emp1", name: "김장애01", severity: "SEVERE" as const, gender: "M" as const,
      hireDate: "2024-01-01", monthlyWorkHours: 80, monthlySalary: 2800000,
      hasEmploymentInsurance: true, meetsMinimumWage: true
    },
    { 
      id: "emp2", name: "이장애02", severity: "SEVERE" as const, gender: "F" as const,
      hireDate: "2024-02-01", monthlyWorkHours: 85, monthlySalary: 2900000,
      hasEmploymentInsurance: true, meetsMinimumWage: true
    },
    { 
      id: "emp3", name: "박장애03", severity: "SEVERE" as const, gender: "M" as const,
      hireDate: "2024-03-01", monthlyWorkHours: 75, monthlySalary: 2700000,
      hasEmploymentInsurance: true, meetsMinimumWage: true
    },
    { 
      id: "emp4", name: "최장애04", severity: "SEVERE" as const, gender: "F" as const,
      hireDate: "2024-04-01", monthlyWorkHours: 90, monthlySalary: 3000000,
      hasEmploymentInsurance: true, meetsMinimumWage: true
    },
    { 
      id: "emp5", name: "정장애05", severity: "SEVERE" as const, gender: "M" as const,
      hireDate: "2024-05-01", monthlyWorkHours: 70, monthlySalary: 2600000,
      hasEmploymentInsurance: true, meetsMinimumWage: true
    },
    { 
      id: "emp6", name: "강장애06", severity: "MILD" as const, gender: "F" as const,
      hireDate: "2024-06-01", monthlyWorkHours: 88, monthlySalary: 2500000,
      hasEmploymentInsurance: true, meetsMinimumWage: true
    },
    { 
      id: "emp7", name: "윤장애07", severity: "MILD" as const, gender: "M" as const,
      hireDate: "2024-07-01", monthlyWorkHours: 82, monthlySalary: 2550000,
      hasEmploymentInsurance: true, meetsMinimumWage: true
    },
    { 
      id: "emp8", name: "임장애08", severity: "MILD" as const, gender: "F" as const,
      hireDate: "2024-08-01", monthlyWorkHours: 78, monthlySalary: 2450000,
      hasEmploymentInsurance: true, meetsMinimumWage: true
    },
    { 
      id: "emp9", name: "한장애09", severity: "MILD" as const, gender: "M" as const,
      hireDate: "2024-09-01", monthlyWorkHours: 85, monthlySalary: 2600000,
      hasEmploymentInsurance: true, meetsMinimumWage: true
    },
    { 
      id: "emp10", name: "서장애10", severity: "MILD" as const, gender: "F" as const,
      hireDate: "2024-10-01", monthlyWorkHours: 80, monthlySalary: 2500000,
      hasEmploymentInsurance: true, meetsMinimumWage: true
    },
  ]);

  const [result, setResult] = useState<SimulationResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCountChange = (month: number, value: string) => {
    const newCounts = [...monthlyCounts];
    newCounts[month] = parseInt(value) || 0;
    setMonthlyCounts(newCounts);
  };

  const handleCalculate = async () => {
    setError("");
    setLoading(true);
    
    try {
      const res = await fetch(`${API_BASE}/calculators/monthly-simulation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          year,
          monthlyEmployeeCounts: monthlyCounts,
          companyType,
          disabledEmployees,
        }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        setError(data.error || "계산 실패");
        return;
      }
      
      setResult(data);
    } catch (e: any) {
      setError("오류: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: 1400, margin: "40px auto" }}>
      <div className="card">
        <h1>📊 월별 장려금/부담금 시뮬레이션</h1>
        
        <div style={{ 
          marginTop: 16, 
          padding: 16, 
          background: "#e0f2fe", 
          borderRadius: 4,
          border: "1px solid #7dd3fc"
        }}>
          <p style={{ margin: 0, fontWeight: 600, color: "#0369a1" }}>
            ✨ 2026년 최신 로직 적용
          </p>
          <p style={{ margin: "8px 0 0 0", color: "#0c4a6e", fontSize: 14 }}>
            • 상시근로자 수를 월별로 변경하면서 장려금과 부담금을 시뮬레이션합니다<br/>
            • 중증 장애인(월 60시간 이상)은 2명으로 인정됩니다<br/>
            • 고용률에 따라 부담금 적용률이 달라집니다 (0~100%)
          </p>
        </div>

        <div style={{ marginTop: 24 }}>
          <label>기업 구분</label>
          <select value={companyType} onChange={(e) => setCompanyType(e.target.value)}>
            <option value="PRIVATE_COMPANY">민간기업 (3.1%)</option>
            <option value="PUBLIC_INSTITUTION">공공기관·공기업 (3.8%)</option>
            <option value="GOVERNMENT">국가·지자체·교육청 (3.8%)</option>
          </select>

          <h3 style={{ marginTop: 32, marginBottom: 16 }}>월별 상시근로자 수</h3>
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", 
            gap: 12 
          }}>
            {monthlyCounts.map((count, index) => (
              <div key={index}>
                <label style={{ fontSize: 14 }}>{index + 1}월</label>
                <input
                  type="number"
                  value={count}
                  onChange={(e) => handleCountChange(index, e.target.value)}
                  min="0"
                />
              </div>
            ))}
          </div>

          <div style={{ 
            marginTop: 24, 
            padding: 12, 
            background: "#f3f4f6", 
            borderRadius: 4 
          }}>
            <p style={{ margin: 0, fontSize: 14 }}>
              <strong>장애인 직원:</strong> {disabledEmployees.length}명 
              (중증 {disabledEmployees.filter(e => e.severity === 'SEVERE').length}명, 
              경증 {disabledEmployees.filter(e => e.severity === 'MILD').length}명)
            </p>
          </div>

          <button 
            onClick={handleCalculate} 
            disabled={loading}
            style={{ width: "100%", marginTop: 24, padding: 16, fontSize: 16 }}
          >
            {loading ? "계산 중..." : "시뮬레이션 실행"}
          </button>

          {error && <p className="error" style={{ marginTop: 16 }}>{error}</p>}
        </div>

        {result && (
          <div style={{ marginTop: 32 }}>
            <h2>계산 결과</h2>
            
            {/* 연간 요약 */}
            <div style={{ 
              marginTop: 16, 
              padding: 20, 
              background: "#f8fafc",
              borderRadius: 8,
              border: "2px solid #e2e8f0"
            }}>
              <h3 style={{ marginTop: 0, marginBottom: 16 }}>📈 연간 요약</h3>
              <div style={{ 
                display: "grid", 
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", 
                gap: 16 
              }}>
                <div>
                  <p style={{ margin: 0, fontSize: 14, color: "#64748b" }}>총 부담금</p>
                  <p style={{ margin: "4px 0 0 0", fontSize: 20, fontWeight: "bold", color: "#dc2626" }}>
                    {toManwon(result.yearly.totalLevy)}원
                  </p>
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: 14, color: "#64748b" }}>총 장려금</p>
                  <p style={{ margin: "4px 0 0 0", fontSize: 20, fontWeight: "bold", color: "#16a34a" }}>
                    +{toManwon(result.yearly.totalIncentive)}원
                  </p>
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: 14, color: "#64748b" }}>순액</p>
                  <p style={{ 
                    margin: "4px 0 0 0", 
                    fontSize: 20, 
                    fontWeight: "bold",
                    color: result.yearly.netAmount >= 0 ? "#16a34a" : "#dc2626"
                  }}>
                    {result.yearly.netAmount >= 0 ? "+" : ""}{toManwon(result.yearly.netAmount)}원
                  </p>
                </div>
              </div>
            </div>

            {/* 월별 상세 테이블 */}
            <div style={{ marginTop: 24, overflowX: "auto" }}>
              <table style={{ 
                width: "100%", 
                borderCollapse: "collapse",
                fontSize: 14
              }}>
                <thead>
                  <tr style={{ background: "#f1f5f9" }}>
                    <th style={{ padding: 12, border: "1px solid #e2e8f0" }}>월</th>
                    <th style={{ padding: 12, border: "1px solid #e2e8f0" }}>상시근로자</th>
                    <th style={{ padding: 12, border: "1px solid #e2e8f0" }}>장애인수</th>
                    <th style={{ padding: 12, border: "1px solid #e2e8f0" }}>의무고용</th>
                    <th style={{ padding: 12, border: "1px solid #e2e8f0" }}>인정수</th>
                    <th style={{ padding: 12, border: "1px solid #e2e8f0" }}>미달/초과</th>
                    <th style={{ padding: 12, border: "1px solid #e2e8f0" }}>부담금</th>
                    <th style={{ padding: 12, border: "1px solid #e2e8f0" }}>장려금</th>
                    <th style={{ padding: 12, border: "1px solid #e2e8f0" }}>순액</th>
                  </tr>
                </thead>
                <tbody>
                  {result.monthly.map((m) => {
                    const shortage = m.shortfallCount;
                    const excess = m.recognizedCount > m.obligatedCount 
                      ? m.recognizedCount - m.obligatedCount 
                      : 0;
                    
                    return (
                      <tr key={m.month} style={{ background: m.month % 2 === 0 ? "#fafafa" : "white" }}>
                        <td style={{ padding: 12, border: "1px solid #e2e8f0", textAlign: "center" }}>
                          {m.month}월
                        </td>
                        <td style={{ padding: 12, border: "1px solid #e2e8f0", textAlign: "right" }}>
                          {formatNumber(m.totalEmployeeCount)}
                        </td>
                        <td style={{ padding: 12, border: "1px solid #e2e8f0", textAlign: "right" }}>
                          {m.disabledCount}명
                        </td>
                        <td style={{ padding: 12, border: "1px solid #e2e8f0", textAlign: "right" }}>
                          {m.obligatedCount}명
                        </td>
                        <td style={{ padding: 12, border: "1px solid #e2e8f0", textAlign: "right" }}>
                          {m.recognizedCount.toFixed(1)}명
                        </td>
                        <td style={{ 
                          padding: 12, 
                          border: "1px solid #e2e8f0", 
                          textAlign: "right",
                          color: shortage > 0 ? "#dc2626" : "#16a34a"
                        }}>
                          {shortage > 0 ? `▼${shortage.toFixed(1)}명` : excess > 0 ? `▲${excess.toFixed(1)}명` : "-"}
                        </td>
                        <td style={{ 
                          padding: 12, 
                          border: "1px solid #e2e8f0", 
                          textAlign: "right",
                          color: m.levy > 0 ? "#dc2626" : "#64748b"
                        }}>
                          {m.levy > 0 ? `-${toManwon(m.levy)}` : "-"}
                        </td>
                        <td style={{ 
                          padding: 12, 
                          border: "1px solid #e2e8f0", 
                          textAlign: "right",
                          color: m.incentive > 0 ? "#16a34a" : "#64748b"
                        }}>
                          {m.incentive > 0 ? `+${toManwon(m.incentive)}` : "-"}
                        </td>
                        <td style={{ 
                          padding: 12, 
                          border: "1px solid #e2e8f0", 
                          textAlign: "right",
                          fontWeight: "bold",
                          color: m.netAmount >= 0 ? "#16a34a" : "#dc2626"
                        }}>
                          {m.netAmount >= 0 ? "+" : ""}{toManwon(m.netAmount)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
