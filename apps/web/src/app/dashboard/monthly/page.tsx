"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { API_BASE } from "@/lib/api";
import { getToken, getUserRole } from "@/lib/auth";

// ============================================
// 타입 정의
// ============================================

type MonthlyData = {
  id?: string;
  year: number;
  month: number;
  totalEmployeeCount: number;
  disabledCount: number;
  recognizedCount: number;
  obligatedCount: number;
  shortfallCount: number;
  surplusCount: number;
  levy: number;
  incentive: number;
  femaleIncentiveCount?: number;
  femaleIncentiveAmount?: number;
  netAmount: number;
  details?: any[];
};

type CompanyInfo = {
  name: string;
  buyerType?: string;
  quotaRate: number;
};

// ============================================
// 유틸리티 함수
// ============================================

// 여성 장려금 계산 함수
function calculateFemaleIncentive(details?: any[]): { count: number; amount: number } {
  if (!details || details.length === 0) {
    return { count: 0, amount: 0 };
  }

  let count = 0;
  let amount = 0;

  details.forEach((emp) => {
    // 여성이고 장려금 대상인 경우
    if (emp.gender === "F" && emp.incentiveAmount > 0) {
      count++;
      // 여성 장려금은 월 30만원 (incentiveAmount 외 추가)
      amount += 300000;
    }
  });

  return { count, amount };
}

// ============================================
// 메인 컴포넌트
// ============================================

export default function MonthlyManagementPage() {
  const router = useRouter();
  const [year, setYear] = useState(2026);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // 월별 데이터
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>({
    name: "",
    quotaRate: 0.031,
  });

  // 자동 저장을 위한 타이머 ref
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // ============================================
  // 초기 로드
  // ============================================

  useEffect(() => {
    const role = getUserRole();
    if (role !== "BUYER" && role !== "SUPER_ADMIN") {
      router.push("/");
      return;
    }
    fetchMonthlyData();
  }, [year]);

  // ============================================
  // 부담기초액 계산 함수 (2026년 기준)
  // ============================================
  
  /**
   * 고용수준에 따른 월 부담기초액 계산
   * @param obligatedCount 의무고용인원
   * @param actualCount 실제 고용인원
   * @returns 월 부담기초액
   */
  function getMonthlyLevyBase(obligatedCount: number, actualCount: number): number {
    if (obligatedCount === 0) return 0;
    
    const employmentRate = actualCount / obligatedCount;
    
    if (actualCount === 0) {
      return 2156880; // 장애인 0명 고용
    } else if (employmentRate < 0.25) {
      return 1813000; // 1/4 미만
    } else if (employmentRate < 0.5) {
      return 1554000; // 1/4 ~ 1/2 미만
    } else if (employmentRate < 0.75) {
      return 1372700; // 1/2 ~ 3/4 미만
    } else {
      return 1295000; // 3/4 이상 (미달 시에도 적용)
    }
  }

  // ============================================
  // 월별 데이터 API
  // ============================================

  async function fetchMonthlyData() {
    setLoading(true);
    setError("");

    const token = getToken();
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/employees/monthly?year=${year}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("월별 데이터 조회 실패");

      const data = await res.json();
      
      // 월별 데이터에 여성 장려금 정보 추가
      const enrichedMonthlyData = data.monthlyData.map((monthData: MonthlyData) => {
        const { count, amount } = calculateFemaleIncentive(monthData.details);
        return {
          ...monthData,
          femaleIncentiveCount: count,
          femaleIncentiveAmount: amount,
        };
      });
      
      setMonthlyData(enrichedMonthlyData);
      
      // 회사 정보 및 buyerType 기반 quotaRate 설정
      const userStr = typeof window !== "undefined" ? localStorage.getItem("user") : null;
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          const buyerType = user.company?.buyerType || "PRIVATE_COMPANY";
          const quotaRate = buyerType === "PRIVATE_COMPANY" ? 0.031 : 0.038;
          
          setCompanyInfo({
            name: data.companyName || user.company?.name || "",
            buyerType,
            quotaRate,
          });
        } catch (e) {
          console.error("사용자 정보 파싱 실패:", e);
          setCompanyInfo({
            name: data.companyName || "",
            quotaRate: 0.031,
          });
        }
      } else {
        setCompanyInfo({
          name: data.companyName || "",
          quotaRate: 0.031,
        });
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function saveMonthlyData() {
    const token = getToken();
    if (!token) return;

    setSaving(true);
    setMessage("");
    setError("");

    try {
      // 월별 상시근로자 수 맵 생성
      const monthlyEmployeeCounts: { [key: number]: number } = {};
      monthlyData.forEach((data) => {
        monthlyEmployeeCounts[data.month] = data.totalEmployeeCount;
      });

      const res = await fetch(`${API_BASE}/employees/monthly`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          year,
          monthlyEmployeeCounts,
        }),
      });

      if (!res.ok) throw new Error("저장 실패");

      const result = await res.json();
      setMessage("✅ " + result.message);

      // 데이터 다시 불러오기
      await fetchMonthlyData();

      setTimeout(() => setMessage(""), 3000);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  // 자동 저장 (조용히 백그라운드에서)
  async function saveMonthlyDataSilently() {
    const token = getToken();
    if (!token) return;

    try {
      // 월별 상시근로자 수 맵 생성
      const monthlyEmployeeCounts: { [key: number]: number } = {};
      monthlyData.forEach((data) => {
        monthlyEmployeeCounts[data.month] = data.totalEmployeeCount;
      });

      const res = await fetch(`${API_BASE}/employees/monthly`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          year,
          monthlyEmployeeCounts,
        }),
      });

      if (!res.ok) throw new Error("자동 저장 실패");

      const result = await res.json();
      
      // 서버에서 받은 장려금 데이터로만 업데이트 (초기화 방지)
      if (result.data && Array.isArray(result.data)) {
        setMonthlyData((prev) =>
          prev.map((data) => {
            const serverData = result.data.find((d: any) => d.month === data.month);
            if (serverData) {
              return {
                ...data,
                incentive: serverData.incentive || 0,
                femaleIncentiveCount: serverData.femaleIncentiveCount || 0,
                femaleIncentiveAmount: serverData.femaleIncentiveAmount || 0,
                netAmount: serverData.incentive - data.levy,
              };
            }
            return data;
          })
        );
      }
    } catch (e: any) {
      console.error("자동 저장 오류:", e.message);
    }
  }

  async function updateEmployeeCount(month: number, value: string) {
    const numValue = parseInt(value) || 0;
    
    // 1. totalEmployeeCount 업데이트 (즉시)
    setMonthlyData((prev) =>
      prev.map((data) => {
        if (data.month !== month) return data;
        
        // 2. 임시 재계산 (buyerType 기반 quotaRate 적용) - 부담금만
        const obligatedCount = Math.floor(numValue * companyInfo.quotaRate);
        const shortfallCount = Math.max(0, obligatedCount - data.recognizedCount);
        const surplusCount = Math.max(0, data.recognizedCount - obligatedCount);
        
        // 고용수준별 부담기초액 적용
        const monthlyLevyBase = getMonthlyLevyBase(obligatedCount, data.recognizedCount);
        const levy = shortfallCount * monthlyLevyBase;
        const netAmount = data.incentive - levy;
        
        return {
          ...data,
          totalEmployeeCount: numValue,
          obligatedCount,
          shortfallCount,
          surplusCount,
          levy,
          netAmount,
        };
      })
    );

    // 3. 자동 저장 타이머 설정 (1.5초 후)
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    autoSaveTimerRef.current = setTimeout(async () => {
      setMessage("⏳ 자동 계산 중...");
      await saveMonthlyDataSilently();
      setMessage("✅ 자동 계산 완료");
      setTimeout(() => setMessage(""), 2000);
    }, 1500);
  }

  function fillAllMonths() {
    const firstMonth = monthlyData[0];
    if (!firstMonth) return;
    
    const firstValue = firstMonth.totalEmployeeCount || 0;
    const firstIncentive = firstMonth.incentive || 0;
    const firstRecognized = firstMonth.recognizedCount || 0;
    const firstFemaleIncentiveCount = firstMonth.femaleIncentiveCount || 0;
    const firstFemaleIncentiveAmount = firstMonth.femaleIncentiveAmount || 0;
    
    setMonthlyData((prev) =>
      prev.map((data) => {
        const obligatedCount = Math.floor(firstValue * companyInfo.quotaRate);
        const shortfallCount = Math.max(0, obligatedCount - firstRecognized);
        const surplusCount = Math.max(0, firstRecognized - obligatedCount);
        
        // 고용수준별 부담기초액 적용
        const monthlyLevyBase = getMonthlyLevyBase(obligatedCount, firstRecognized);
        const levy = shortfallCount * monthlyLevyBase;
        const netAmount = firstIncentive - levy;
        
        return {
          ...data,
          totalEmployeeCount: firstValue,
          recognizedCount: firstRecognized,
          obligatedCount,
          shortfallCount,
          surplusCount,
          incentive: firstIncentive,
          femaleIncentiveCount: firstFemaleIncentiveCount,
          femaleIncentiveAmount: firstFemaleIncentiveAmount,
          levy,
          netAmount,
        };
      })
    );
  }

  function copyPreviousMonth() {
    setMonthlyData((prev) => {
      const newData = [...prev];
      for (let i = 1; i < newData.length; i++) {
        if (!newData[i].totalEmployeeCount || newData[i].totalEmployeeCount === 0) {
          const previousCount = newData[i - 1].totalEmployeeCount;
          const obligatedCount = Math.floor(previousCount * companyInfo.quotaRate);
          const shortfallCount = Math.max(0, obligatedCount - newData[i].recognizedCount);
          const surplusCount = Math.max(0, newData[i].recognizedCount - obligatedCount);
          
          // 고용수준별 부담기초액 적용
          const monthlyLevyBase = getMonthlyLevyBase(obligatedCount, newData[i].recognizedCount);
          const levy = shortfallCount * monthlyLevyBase;
          const netAmount = newData[i].incentive - levy;
          
          newData[i] = {
            ...newData[i],
            totalEmployeeCount: previousCount,
            obligatedCount,
            shortfallCount,
            surplusCount,
            levy,
            netAmount,
          };
        }
      }
      return newData;
    });
  }

  // ============================================
  // 렌더링
  // ============================================

  if (loading) {
    return (
      <div className="container">
        <div className="card">
          <p>로딩 중...</p>
        </div>
      </div>
    );
  }

  // 연간 합계
  const yearlyLevy = monthlyData.reduce((sum, d) => sum + d.levy, 0);
  const yearlyIncentive = monthlyData.reduce((sum, d) => sum + d.incentive, 0);
  const yearlyNet = yearlyIncentive - yearlyLevy;

  // buyerType 한글 변환
  const buyerTypeLabel = 
    companyInfo.buyerType === "PRIVATE_COMPANY" ? "민간기업" :
    companyInfo.buyerType === "PUBLIC_INSTITUTION" ? "공공기관" :
    companyInfo.buyerType === "GOVERNMENT" ? "국가/지자체/교육청" :
    "민간기업";

  const quotaRatePercent = (companyInfo.quotaRate * 100).toFixed(1);

  return (
    <div className="container">
      <div className="card" style={{ maxWidth: "100%", margin: "20px auto" }}>
        <h1>📅 월별 고용장려금부담금 관리</h1>
        <div style={{ marginTop: 8, padding: 16, background: "#f0f9ff", borderRadius: 8, border: "1px solid #bae6fd" }}>
          <p style={{ margin: 0, fontSize: 16, color: "#0c4a6e" }}>
            <strong>{companyInfo.name}</strong> | {buyerTypeLabel} (의무고용률 <strong>{quotaRatePercent}%</strong>) | {year}년 월별 고용 현황 및 정밀 계산
          </p>
        </div>

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

        {/* 연도 선택 & 저장 버튼 */}
        <div
          style={{
            marginTop: 24,
            display: "flex",
            gap: 16,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <div>
            <label style={{ fontWeight: "bold", fontSize: 14, color: "#374151" }}>연도</label>
            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              style={{ marginTop: 8, padding: "8px 12px", fontSize: 14, border: "1px solid #d1d5db", borderRadius: 6 }}
            >
              <option value={2024}>2024년</option>
              <option value={2025}>2025년</option>
              <option value={2026}>2026년</option>
              <option value={2027}>2027년</option>
            </select>
          </div>

          <div style={{ flex: 1 }} />

          <button
            onClick={fillAllMonths}
            style={{
              padding: "10px 16px",
              fontSize: 14,
              background: "#10b981",
              color: "white",
              border: "none",
              borderRadius: 6,
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            📋 1월 값 전체 복사
          </button>

          <button
            onClick={copyPreviousMonth}
            style={{
              padding: "10px 16px",
              fontSize: 14,
              background: "#3b82f6",
              color: "white",
              border: "none",
              borderRadius: 6,
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            ➡️ 이전 달 자동 채우기
          </button>

          <button
            onClick={saveMonthlyData}
            disabled={saving}
            style={{
              padding: "10px 20px",
              fontSize: 16,
              fontWeight: "bold",
              background: "#f59e0b",
              color: "white",
              border: "none",
              borderRadius: 6,
              cursor: saving ? "not-allowed" : "pointer",
              opacity: saving ? 0.7 : 1,
            }}
          >
            {saving ? "저장 중..." : "💾 전체 저장"}
          </button>
        </div>

        {/* 월별 테이블 */}
        <div style={{ marginTop: 24, overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: 13,
              tableLayout: "fixed",
            }}
          >
            <thead>
              <tr style={{ background: "#f3f4f6" }}>
                <th style={{ ...tableHeaderStyle, width: "6%" }}>월</th>
                <th style={{ ...tableHeaderStyle, width: "11%" }}>상시근로자</th>
                <th style={{ ...tableHeaderStyle, width: "10%" }}>장애인수</th>
                <th style={{ ...tableHeaderStyle, width: "10%" }}>의무고용</th>
                <th style={{ ...tableHeaderStyle, width: "10%" }}>인정수</th>
                <th style={{ ...tableHeaderStyle, width: "10%" }}>미달/초과</th>
                <th style={{ ...tableHeaderStyle, width: "13%" }}>부담금</th>
                <th style={{ ...tableHeaderStyle, width: "13%" }}>장려금</th>
                <th style={{ ...tableHeaderStyle, width: "13%" }}>순액</th>
              </tr>
            </thead>
            <tbody>
              {monthlyData.map((data) => (
                <tr key={data.month} style={{ borderBottom: "1px solid #e5e7eb" }}>
                  <td style={tableCellStyle}>{data.month}월</td>
                  <td style={tableCellStyle}>
                    <input
                      type="number"
                      value={data.totalEmployeeCount}
                      onChange={(e) => updateEmployeeCount(data.month, e.target.value)}
                      style={{
                        width: 80,
                        padding: "6px 8px",
                        fontSize: 14,
                        textAlign: "center",
                        border: "1px solid #d1d5db",
                        borderRadius: 4,
                      }}
                      min="0"
                    />
                  </td>
                  <td style={tableCellStyle}>{data.disabledCount}명</td>
                  <td style={tableCellStyle}>{data.obligatedCount}명</td>
                  <td style={tableCellStyle}>{data.recognizedCount.toFixed(1)}명</td>
                  <td
                    style={{
                      ...tableCellStyle,
                      color: data.shortfallCount > 0 ? "#dc2626" : "#059669",
                      fontWeight: "bold",
                    }}
                  >
                    {data.shortfallCount > 0
                      ? `▼${data.shortfallCount}명`
                      : data.surplusCount > 0
                      ? `▲${data.surplusCount.toFixed(1)}명`
                      : "-"}
                  </td>
                  <td
                    style={{
                      ...tableCellStyle,
                      color: data.levy > 0 ? "#dc2626" : "#666",
                    }}
                  >
                    {data.levy > 0 ? `-${(data.levy / 10000).toFixed(0)}만` : "-"}
                  </td>
                  <td
                    style={{
                      ...tableCellStyle,
                      color: data.incentive > 0 ? "#059669" : "#666",
                      minWidth: 80,
                      maxWidth: 100,
                      fontSize: 12,
                    }}
                  >
                    {data.incentive > 0 ? (
                      <>
                        +{(data.incentive / 10000).toFixed(0)}만
                        {data.femaleIncentiveCount && data.femaleIncentiveCount > 0 && (
                          <><br /><span style={{ fontSize: 10, color: "#9ca3af" }}>
                            (여 {data.femaleIncentiveCount}명: +{(data.femaleIncentiveAmount! / 10000).toFixed(0)}만)
                          </span></>
                        )}
                      </>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td
                    style={{
                      ...tableCellStyle,
                      color: data.netAmount >= 0 ? "#059669" : "#dc2626",
                      fontWeight: "bold",
                    }}
                  >
                    {data.netAmount >= 0 ? "+" : "-"}
                    {Math.abs(data.netAmount / 10000).toFixed(0)}만
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ background: "#f9fafb", fontWeight: "bold", fontSize: 15 }}>
                <td colSpan={6} style={{ ...tableCellStyle, textAlign: "right" }}>
                  연간 합계
                </td>
                <td style={{ ...tableCellStyle, color: "#dc2626" }}>
                  -{(yearlyLevy / 10000).toFixed(0)}만
                </td>
                <td style={{ ...tableCellStyle, color: "#059669", minWidth: 80, maxWidth: 100 }}>
                  +{(yearlyIncentive / 10000).toFixed(0)}만
                </td>
                <td
                  style={{
                    ...tableCellStyle,
                    color: yearlyNet >= 0 ? "#059669" : "#dc2626",
                    fontSize: 16,
                  }}
                >
                  {yearlyNet >= 0 ? "+" : "-"}
                  {Math.abs(yearlyNet / 10000).toFixed(0)}만
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* 안내 */}
        <div
          style={{
            marginTop: 16,
            padding: 20,
            background: "#fef3c7",
            borderRadius: 8,
            border: "1px solid #fde047",
          }}
        >
          <p style={{ margin: 0, fontWeight: "bold", color: "#92400e", fontSize: 15 }}>
            💡 자동 계산 정보
          </p>
          <ul style={{ marginTop: 12, paddingLeft: 20, color: "#78350f", fontSize: 14, lineHeight: 1.8 }}>
            <li>
              <strong>기업 유형별 의무고용률</strong>:
              <ul style={{ marginTop: 4, paddingLeft: 20 }}>
                <li>민간기업: 3.1% (장애인 등록 직원 수 × 3.1%를 내림)</li>
                <li>공공기관: 3.8% (장애인 등록 직원 수 × 3.8%를 내림)</li>
                <li>국가/지자체/교육청: 3.8% (장애인 등록 직원 수 × 3.8%를 내림, 감면 특별 계산식 적용)</li>
              </ul>
            </li>
            <li>
              <strong>장애인 수</strong>: 등록된 직원의 입사/퇴사일 기준 자동 계산
            </li>
            <li>
              <strong>인정 수</strong>: 중증 60시간 이상 2배 인정
            </li>
            <li>
              <strong>부담금</strong>: 고용수준별 차등 적용 (2026년 기준)
              <br />
              <span style={{ fontSize: 13, color: "#666", marginLeft: 8 }}>
                • 3/4 이상: 129.5만원/월 | 1/2~3/4: 137.3만원/월 | 1/4~1/2: 155.4만원/월 | 1/4 미만: 181.3만원/월 | 0명: 215.7만원/월
              </span>
            </li>
            <li>
              <strong>장려금 계산식 (2026년 기준)</strong>:
              <div style={{ marginTop: 8, padding: 12, background: "#eff6ff", borderRadius: 6, border: "1px solid #bfdbfe" }}>
                <p style={{ margin: "4px 0", fontWeight: 600, color: "#1e40af" }}>
                  고용장려금 = (월별 지급인원 × 지급단가)의 합계액
                </p>
                <p style={{ margin: "4px 0", color: "#1e293b" }}>
                  <strong>월별 지급인원</strong> = [장애인근로자수 - 제외인원 - 기준인원]
                </p>
                <p style={{ margin: "4px 0", color: "#1e293b" }}>
                  <strong>기준인원 (2026년)</strong> = 상시근로자수 × 의무고용률 (소수점 올림)
                </p>
                <ul style={{ margin: "4px 0 4px 20px", color: "#64748b", fontSize: 13 }}>
                  <li>민간/공공기업: 3.1%</li>
                  <li>국가/지자체/교육청: 3.8%</li>
                </ul>
                <p style={{ margin: "4px 0", color: "#1e293b" }}>
                  <strong>기준인원 산입 순서</strong>: 입사일 순 → 동일시 경증·남성·임금 낮은 순
                </p>
                <p style={{ margin: "4px 0", color: "#1e293b" }}>
                  <strong>제외인원</strong>: 고용보험 미가입자 또는 최저임금 미만자
                </p>
                <p style={{ margin: "4px 0", color: "#64748b", fontSize: 13 }}>
                  💡 성별/중증도/연령별 지급단가 자동 적용 (여성·중증·청년 우대)
                </p>
              </div>
            </li>
          </ul>
        </div>

        {/* 데이터 출력 안내 */}
        <div
          style={{
            marginTop: 16,
            padding: 20,
            background: "#eff6ff",
            borderRadius: 8,
            border: "1px solid #bfdbfe",
          }}
        >
          <h4 style={{ margin: 0, color: "#1e40af", fontSize: 16 }}>
            📋 데이터 출력 및 신청 양식
          </h4>
          <div style={{ marginTop: 16, display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button
              style={{
                padding: "10px 20px",
                background: "#3b82f6",
                color: "white",
                border: "none",
                borderRadius: 6,
                cursor: "pointer",
                fontWeight: "bold",
                fontSize: 14,
              }}
            >
              📄 고용장려금 신청 양식 출력
            </button>
            <button
              style={{
                padding: "10px 20px",
                background: "#8b5cf6",
                color: "white",
                border: "none",
                borderRadius: 6,
                cursor: "pointer",
                fontWeight: "bold",
                fontSize: 14,
              }}
            >
              📄 고용부담금 신청 양식 출력
            </button>
            <button
              style={{
                padding: "10px 20px",
                background: "#10b981",
                color: "white",
                border: "none",
                borderRadius: 6,
                cursor: "pointer",
                fontWeight: "bold",
                fontSize: 14,
              }}
            >
              📊 Excel 다운로드
            </button>
            <button
              style={{
                padding: "10px 20px",
                background: "#f59e0b",
                color: "white",
                border: "none",
                borderRadius: 6,
                cursor: "pointer",
                fontWeight: "bold",
                fontSize: 14,
              }}
            >
              📑 PDF 다운로드
            </button>
          </div>
          <p style={{ marginTop: 12, fontSize: 13, color: "#1e3a8a", lineHeight: 1.6 }}>
            ⚠️ <strong>출력 기능은 추후 구현 예정입니다.</strong> 현재는 화면에서 데이터를 확인하실 수 있습니다.
          </p>
        </div>
      </div>
    </div>
  );
}

// ============================================
// 스타일
// ============================================

const tableHeaderStyle: React.CSSProperties = {
  padding: "12px 8px",
  textAlign: "center",
  fontWeight: "bold",
  fontSize: 13,
  borderBottom: "2px solid #d1d5db",
};

const tableCellStyle: React.CSSProperties = {
  padding: "10px 8px",
  textAlign: "center",
  fontSize: 13,
};
