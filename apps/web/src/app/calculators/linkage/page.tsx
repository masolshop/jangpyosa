"use client";

import { useState, useEffect } from "react";
import { formatCurrencyWithKorean } from "@/lib/currency";

type CompanyType = "PRIVATE" | "GOVERNMENT";

interface MonthData {
  disabledWorkers: number;       // 장애인 근로자 수
  severeDisabled: number;        // 중증 장애인 수
}

interface CalculationResult {
  // 공통 결과
  monthlyReduction: number[];        // 월별 감면액
  totalReductionCalculated: number;  // 연간 감면액 계산값
  finalReduction: number;            // 최종 감면액
  levyAfterReduction: number;        // 감면 후 납부 부담금
  
  // 민간/공공기관 전용
  recipientRatio?: number;           // 수급액 비율
  maxBy90Percent?: number;           // 부담금 90% 상한
  maxBy50Percent?: number;           // 도급액 50% 상한
  
  // 국가/지자체/교육청 전용
  excessAmount?: number;             // 우선구매 초과액
  applicableRecipientAmount?: number; // 적용 가능한 수급액
}

export default function LinkageCalcPage() {
  // 기업 유형 선택
  const [companyType, setCompanyType] = useState<CompanyType>("PRIVATE");
  
  // 공통 입력
  const [year, setYear] = useState("");
  const [baseAmount, setBaseAmount] = useState(""); // 2025년 부담기초액
  const [annualLevy, setAnnualLevy] = useState(""); // 연간 발생 부담금
  const [supplierTotalSales, setSupplierTotalSales] = useState(""); // 표준사업장 연간 총매출
  const [annualRecipientAmount, setAnnualRecipientAmount] = useState(""); // 연간 수급액 (도급액)
  
  // 월별 장애인 근로자 데이터 (12개월)
  const [monthlyData, setMonthlyData] = useState<MonthData[]>(
    Array(12).fill(null).map(() => ({
      disabledWorkers: 10,
      severeDisabled: 5,
    }))
  );
  
  // 국가/지자체/교육청 전용 입력
  const [purchaseTarget, setPurchaseTarget] = useState(""); // 표준사업장 생산품 구매목표
  const [actualPurchase, setActualPurchase] = useState(""); // 실제 구매액
  
  const [result, setResult] = useState<CalculationResult | null>(null);
  
  // 계산 실행
  const calculate = () => {
    if (companyType === "PRIVATE") {
      calculatePrivate();
    } else {
      calculateGovernment();
    }
  };
  
  // 민간/공공기관 계산
  const calculatePrivate = () => {
    // 수급액 비율 = 연간 수급액 / 표준사업장 연간 총매출
    const recipientRatio = Math.round((Number(annualRecipientAmount || 0) / Number(supplierTotalSales || 1)) * 10000) / 10000;
    
    // 월별 감면액 계산
    const monthlyReduction = monthlyData.map((month) => {
      // 2배수 적용 인원 = 중증장애인×2 + (전체-중증)
      const appliedWorkers = month.severeDisabled * 2 + (month.disabledWorkers - month.severeDisabled);
      
      // 월별 감면액 = 수급액 비율 × 부담기초액 × 2배수 적용 인원
      const reduction = Math.floor((recipientRatio * Number(baseAmount || 0) * appliedWorkers) / 10) * 10;
      return reduction;
    });
    
    // 연간 감면액 계산값
    const totalReductionCalculated = monthlyReduction.reduce((sum, val) => sum + val, 0);
    
    // 감면 한도 계산
    // 1. 부담금의 90% 이내
    const maxBy90Percent = Math.floor(Number(annualLevy || 0) * 0.9);
    
    // 2. 도급액의 50% 이내
    const maxBy50Percent = Math.floor(Number(annualRecipientAmount || 0) * 0.5);
    
    // 최종 감면액 = MIN(계산값, 부담금 90%, 도급액 50%)
    const finalReduction = Math.min(
      totalReductionCalculated,
      maxBy90Percent,
      maxBy50Percent
    );
    
    // 감면 후 납부 부담금
    const levyAfterReduction = Number(annualLevy || 0) - finalReduction;
    
    setResult({
      monthlyReduction,
      totalReductionCalculated,
      finalReduction,
      levyAfterReduction,
      recipientRatio,
      maxBy90Percent,
      maxBy50Percent,
    });
  };
  
  // 국가/지자체/교육청 계산
  const calculateGovernment = () => {
    // 우선구매 초과액 = 실제 구매액 - 구매목표
    const excessAmount = Math.max(0, Number(actualPurchase || 0) - Number(purchaseTarget || 0));
    
    // 적용 가능한 수급액 = MIN(연간 수급액, 우선구매 초과액)
    const applicableRecipientAmount = Math.min(Number(annualRecipientAmount || 0), excessAmount);
    
    // 수급액 비율 = 적용 가능한 수급액 / 표준사업장 연간 총매출
    const recipientRatio = Math.round((applicableRecipientAmount / Number(supplierTotalSales || 1)) * 10000) / 10000;
    
    // 월별 감면액 계산
    const monthlyReduction = monthlyData.map((month) => {
      const appliedWorkers = month.severeDisabled * 2 + (month.disabledWorkers - month.severeDisabled);
      const reduction = Math.floor((recipientRatio * Number(baseAmount || 0) * appliedWorkers) / 10) * 10;
      return reduction;
    });
    
    // 연간 감면액 계산값
    const totalReductionCalculated = monthlyReduction.reduce((sum, val) => sum + val, 0);
    
    // 감면 한도: 부담금의 90% 이내 (국가/지자체는 도급액 50% 제한 없음)
    const maxBy90Percent = Math.floor(Number(annualLevy || 0) * 0.9);
    
    // 최종 감면액
    const finalReduction = Math.min(totalReductionCalculated, maxBy90Percent);
    
    // 감면 후 납부 부담금
    const levyAfterReduction = Number(annualLevy || 0) - finalReduction;
    
    setResult({
      monthlyReduction,
      totalReductionCalculated,
      finalReduction,
      levyAfterReduction,
      excessAmount,
      applicableRecipientAmount,
    });
  };
  
  // 월별 데이터 수정
  const updateMonthData = (index: number, field: keyof MonthData, value: number) => {
    const newData = [...monthlyData];
    newData[index] = { ...newData[index], [field]: value };
    setMonthlyData(newData);
  };
  
  // 모든 월에 같은 값 적용
  const applyToAllMonths = (field: keyof MonthData, value: number) => {
    setMonthlyData(monthlyData.map(month => ({ ...month, [field]: value })));
  };

  return (
    <div style={{ padding: "40px", maxWidth: 1400, margin: "0 auto" }}>
      {/* 헤더 */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 32, fontWeight: "bold", marginBottom: 12 }}>
          📉 연계고용 부담금 감면 계산기
        </h1>
        <p style={{ fontSize: 16, color: "#666", lineHeight: 1.6 }}>
          장애인표준사업장과의 도급계약에 따른 부담금 감면액을 정확하게 계산합니다.
          <br />
          <strong>2025년도 기준</strong> · 부담기초액 1,258,000원
        </p>
      </div>

      {/* 기업 유형 선택 */}
      <div style={{ marginBottom: 32, padding: 24, background: "#f8f9fa", borderRadius: 12 }}>
        <h2 style={{ fontSize: 20, fontWeight: "bold", marginBottom: 16 }}>
          1️⃣ 기업 유형 선택
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <button
            onClick={() => setCompanyType("PRIVATE")}
            style={{
              padding: "20px",
              border: companyType === "PRIVATE" ? "3px solid #0070f3" : "2px solid #ddd",
              borderRadius: 12,
              background: companyType === "PRIVATE" ? "#e7f3ff" : "white",
              cursor: "pointer",
              transition: "all 0.2s",
              fontWeight: companyType === "PRIVATE" ? "bold" : "normal",
              fontSize: 16,
            }}
          >
            <div style={{ fontSize: 32, marginBottom: 8 }}>🏢</div>
            <div style={{ color: companyType === "PRIVATE" ? "#0070f3" : "#333" }}>
              민간/공공기관
            </div>
            <div style={{ fontSize: 13, color: "#666", marginTop: 8 }}>
              일반 기업 및 공공기관<br />
              (부담금 90% + 도급액 50% 한도)
            </div>
          </button>
          
          <button
            onClick={() => setCompanyType("GOVERNMENT")}
            style={{
              padding: "20px",
              border: companyType === "GOVERNMENT" ? "3px solid #0070f3" : "2px solid #ddd",
              borderRadius: 12,
              background: companyType === "GOVERNMENT" ? "#e7f3ff" : "white",
              cursor: "pointer",
              transition: "all 0.2s",
              fontWeight: companyType === "GOVERNMENT" ? "bold" : "normal",
              fontSize: 16,
            }}
          >
            <div style={{ fontSize: 32, marginBottom: 8 }}>🏛️</div>
            <div style={{ color: companyType === "GOVERNMENT" ? "#0070f3" : "#333" }}>
              국가/지자체/교육청
            </div>
            <div style={{ fontSize: 13, color: "#666", marginTop: 8 }}>
              국가기관, 지방자치단체, 교육청<br />
              (우선구매 초과액 반영)
            </div>
          </button>
        </div>
      </div>

      {/* 기본 정보 입력 */}
      <div style={{ marginBottom: 32, padding: 24, background: "white", borderRadius: 12, border: "1px solid #e5e5e5" }}>
        <h2 style={{ fontSize: 20, fontWeight: "bold", marginBottom: 16 }}>
          2️⃣ 기본 정보 입력
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div>
            <label style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>연도</label>
            <input
              type="number"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              placeholder="2025"
              style={{ width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: 6 }}
            />
          </div>
          
          <div>
            <label style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>
              부담기초액 (원)
            </label>
            <input
              type="number"
              value={baseAmount}
              onChange={(e) => setBaseAmount(e.target.value)}
              placeholder="1258000"
              style={{ width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: 6 }}
            />
            <p style={{ fontSize: 12, color: "#666", margin: "4px 0 0 0" }}>
              2025년: 1,258,000원
            </p>
          </div>
          
          <div>
            <label style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>
              연간 발생 부담금 (원)
            </label>
            <input
              type="number"
              value={annualLevy}
              onChange={(e) => setAnnualLevy(e.target.value)}
              placeholder="20000000"
              style={{ width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: 6 }}
            />
          </div>
          
          <div>
            <label style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>
              표준사업장 연간 총매출 (원)
            </label>
            <input
              type="number"
              value={supplierTotalSales}
              onChange={(e) => setSupplierTotalSales(e.target.value)}
              placeholder="120000000"
              style={{ width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: 6 }}
            />
          </div>
          
          <div>
            <label style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>
              연간 수급액 (도급액 합계, 원)
            </label>
            <input
              type="number"
              value={annualRecipientAmount}
              onChange={(e) => setAnnualRecipientAmount(e.target.value)}
              placeholder="12000000"
              style={{ width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: 6 }}
            />
          </div>
          
          {companyType === "GOVERNMENT" && (
            <>
              <div>
                <label style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>
                  표준사업장 생산품 구매목표 (원)
                </label>
                <input
                  type="number"
                  value={purchaseTarget}
                  onChange={(e) => setPurchaseTarget(e.target.value)}
                  placeholder="100000000"
                  style={{ width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: 6 }}
                />
              </div>
              
              <div>
                <label style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>
                  실제 구매액 (원)
                </label>
                <input
                  type="number"
                  value={actualPurchase}
                  onChange={(e) => setActualPurchase(e.target.value)}
                  placeholder="150000000"
                  style={{ width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: 6 }}
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* 월별 장애인 근로자 데이터 */}
      <div style={{ marginBottom: 32, padding: 24, background: "white", borderRadius: 12, border: "1px solid #e5e5e5" }}>
        <h2 style={{ fontSize: 20, fontWeight: "bold", marginBottom: 16 }}>
          3️⃣ 월별 장애인 근로자 수
        </h2>
        
        {/* 일괄 적용 */}
        <div style={{ marginBottom: 16, padding: 16, background: "#f8f9fa", borderRadius: 8 }}>
          <p style={{ marginBottom: 12, fontWeight: 600 }}>모든 월에 같은 값 적용:</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 12 }}>
            <input
              type="number"
              placeholder="장애인 근로자 수"
              id="bulk-disabled"
              style={{ padding: "8px", border: "1px solid #ddd", borderRadius: 6 }}
            />
            <input
              type="number"
              placeholder="중증 장애인 수"
              id="bulk-severe"
              style={{ padding: "8px", border: "1px solid #ddd", borderRadius: 6 }}
            />
            <button
              onClick={() => {
                const disabled = Number((document.getElementById("bulk-disabled") as HTMLInputElement)?.value || 0);
                const severe = Number((document.getElementById("bulk-severe") as HTMLInputElement)?.value || 0);
                if (disabled > 0) applyToAllMonths("disabledWorkers", disabled);
                if (severe > 0) applyToAllMonths("severeDisabled", severe);
              }}
              style={{
                padding: "8px 16px",
                background: "#0070f3",
                color: "white",
                border: "none",
                borderRadius: 6,
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              일괄 적용
            </button>
          </div>
        </div>
        
        {/* 월별 입력 */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
          {monthlyData.map((month, index) => (
            <div key={index} style={{ padding: 12, background: "#f8f9fa", borderRadius: 8 }}>
              <div style={{ fontWeight: 600, marginBottom: 8 }}>{index + 1}월</div>
              <input
                type="number"
                value={month.disabledWorkers}
                onChange={(e) => updateMonthData(index, "disabledWorkers", Number(e.target.value))}
                placeholder="전체"
                style={{ width: "100%", padding: "6px", border: "1px solid #ddd", borderRadius: 4, marginBottom: 6, fontSize: 13 }}
              />
              <input
                type="number"
                value={month.severeDisabled}
                onChange={(e) => updateMonthData(index, "severeDisabled", Number(e.target.value))}
                placeholder="중증"
                style={{ width: "100%", padding: "6px", border: "1px solid #ddd", borderRadius: 4, fontSize: 13 }}
              />
              <div style={{ fontSize: 11, color: "#666", marginTop: 4 }}>
                인정: {month.severeDisabled * 2 + (month.disabledWorkers - month.severeDisabled)}명
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 계산 버튼 */}
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <button
          onClick={calculate}
          style={{
            padding: "16px 48px",
            fontSize: 18,
            fontWeight: "bold",
            background: "linear-gradient(135deg, #0070f3 0%, #0051cc 100%)",
            color: "white",
            border: "none",
            borderRadius: 12,
            cursor: "pointer",
            boxShadow: "0 4px 12px rgba(0, 112, 243, 0.3)",
          }}
        >
          💰 감면액 계산하기
        </button>
      </div>

      {/* 계산 결과 */}
      {result && (
        <div style={{ padding: 32, background: "#e7f3ff", borderRadius: 12, border: "2px solid #0070f3" }}>
          <h2 style={{ fontSize: 24, fontWeight: "bold", marginBottom: 24, color: "#0070f3" }}>
            ✅ 감면 계산 결과
          </h2>
          
          {/* 민간/공공기관 결과 */}
          {companyType === "PRIVATE" && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ padding: 16, background: "white", borderRadius: 8, marginBottom: 12 }}>
                <p style={{ fontSize: 14, color: "#666", marginBottom: 8 }}>수급액 비율</p>
                <p style={{ fontSize: 20, fontWeight: "bold" }}>
                  {result.recipientRatio} ({(result.recipientRatio! * 100).toFixed(2)}%)
                </p>
              </div>
              
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                <div style={{ padding: 16, background: "white", borderRadius: 8 }}>
                  <p style={{ fontSize: 14, color: "#666", marginBottom: 8 }}>부담금 90% 한도</p>
                  <p style={{ fontSize: 18, fontWeight: "bold" }}>
                    {formatCurrencyWithKorean(result.maxBy90Percent!)}
                  </p>
                </div>
                
                <div style={{ padding: 16, background: "white", borderRadius: 8 }}>
                  <p style={{ fontSize: 14, color: "#666", marginBottom: 8 }}>도급액 50% 한도</p>
                  <p style={{ fontSize: 18, fontWeight: "bold" }}>
                    {formatCurrencyWithKorean(result.maxBy50Percent!)}
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* 국가/지자체/교육청 결과 */}
          {companyType === "GOVERNMENT" && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                <div style={{ padding: 16, background: "white", borderRadius: 8 }}>
                  <p style={{ fontSize: 14, color: "#666", marginBottom: 8 }}>우선구매 초과액</p>
                  <p style={{ fontSize: 18, fontWeight: "bold", color: "#28a745" }}>
                    {formatCurrencyWithKorean(result.excessAmount!)}
                  </p>
                </div>
                
                <div style={{ padding: 16, background: "white", borderRadius: 8 }}>
                  <p style={{ fontSize: 14, color: "#666", marginBottom: 8 }}>적용 가능 수급액</p>
                  <p style={{ fontSize: 18, fontWeight: "bold" }}>
                    {formatCurrencyWithKorean(result.applicableRecipientAmount!)}
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* 공통 결과 */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 16 }}>
            <div style={{ padding: 20, background: "white", borderRadius: 8 }}>
              <p style={{ fontSize: 14, color: "#666", marginBottom: 8 }}>연간 감면액 계산값</p>
              <p style={{ fontSize: 20, fontWeight: "bold" }}>
                {formatCurrencyWithKorean(result.totalReductionCalculated)}
              </p>
            </div>
            
            <div style={{ padding: 20, background: "#28a745", borderRadius: 8, color: "white" }}>
              <p style={{ fontSize: 14, opacity: 0.9, marginBottom: 8 }}>✅ 최종 감면액</p>
              <p style={{ fontSize: 24, fontWeight: "bold" }}>
                {formatCurrencyWithKorean(result.finalReduction)}
              </p>
            </div>
            
            <div style={{ padding: 20, background: "white", borderRadius: 8 }}>
              <p style={{ fontSize: 14, color: "#666", marginBottom: 8 }}>감면 후 납부 부담금</p>
              <p style={{ fontSize: 20, fontWeight: "bold" }}>
                {formatCurrencyWithKorean(result.levyAfterReduction)}
              </p>
            </div>
          </div>
          
          {/* 월별 감면액 상세 */}
          <details style={{ marginTop: 16 }}>
            <summary style={{ cursor: "pointer", fontWeight: 600, padding: "12px", background: "white", borderRadius: 8 }}>
              📊 월별 감면액 상세보기
            </summary>
            <div style={{ marginTop: 12, padding: 16, background: "white", borderRadius: 8 }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid #ddd" }}>
                    <th style={{ padding: "8px", textAlign: "left" }}>월</th>
                    <th style={{ padding: "8px", textAlign: "right" }}>전체 근로자</th>
                    <th style={{ padding: "8px", textAlign: "right" }}>중증</th>
                    <th style={{ padding: "8px", textAlign: "right" }}>인정 인원</th>
                    <th style={{ padding: "8px", textAlign: "right" }}>감면액</th>
                  </tr>
                </thead>
                <tbody>
                  {result.monthlyReduction.map((reduction, index) => {
                    const month = monthlyData[index];
                    const applied = month.severeDisabled * 2 + (month.disabledWorkers - month.severeDisabled);
                    return (
                      <tr key={index} style={{ borderBottom: "1px solid #eee" }}>
                        <td style={{ padding: "8px" }}>{index + 1}월</td>
                        <td style={{ padding: "8px", textAlign: "right" }}>{month.disabledWorkers}명</td>
                        <td style={{ padding: "8px", textAlign: "right" }}>{month.severeDisabled}명</td>
                        <td style={{ padding: "8px", textAlign: "right", fontWeight: 600 }}>{applied}명</td>
                        <td style={{ padding: "8px", textAlign: "right", fontWeight: 600, color: "#0070f3" }}>
                          {formatCurrencyWithKorean(reduction)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </details>
        </div>
      )}
      
      {/* 안내사항 */}
      <div style={{ marginTop: 32, padding: 24, background: "#fff9e6", borderRadius: 12, border: "2px solid #ffc107" }}>
        <h3 style={{ fontSize: 18, fontWeight: "bold", marginBottom: 12, color: "#f57c00" }}>
          ⚠️ 주의사항
        </h3>
        <ul style={{ margin: 0, paddingLeft: 20, color: "#666", lineHeight: 1.8, fontSize: 14 }}>
          <li>중증 장애인은 2배수로 인정됩니다.</li>
          <li>최저임금 이상을 받는 상시근로 장애인만 인정됩니다.</li>
          <li>
            <strong>민간/공공기관</strong>: 감면액은 부담금의 90% 이내, 도급액의 50% 이내로 제한됩니다.
          </li>
          <li>
            <strong>국가/지자체/교육청</strong>: 표준사업장 생산품 우선구매 목표를 초과한 금액 중에서만 수급액으로 인정됩니다.
          </li>
          <li>도급 약정이 없거나 이행이 완성되지 않은 달은 감면액 산정에서 제외됩니다.</li>
          <li>정확한 감면액은 한국장애인고용공단에 문의하시기 바랍니다. (☎ 1588-1519)</li>
        </ul>
      </div>
    </div>
  );
}
