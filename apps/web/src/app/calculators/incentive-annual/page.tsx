"use client";

import { useState } from "react";
import { API_BASE } from "@/lib/api";
import { getToken, getUserRole } from "@/lib/auth";

type Worker = {
  id: string;
  name: string;
  disabilityType: string;
  severity: "MILD" | "SEVERE";
  gender: "M" | "F";
  hireDate: string; // YYYY-MM-DD
  resignDate?: string; // YYYY-MM-DD (퇴사일, 선택)
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
  const [editingWorkerId, setEditingWorkerId] = useState<string | null>(null);
  const [editingWorker, setEditingWorker] = useState<Partial<Worker>>({
    severity: "MILD",
    gender: "M",
    hasEmploymentInsurance: true,
    meetsMinimumWage: true,
  });

  const [results, setResults] = useState<MonthResult[] | null>(null);
  const [loadingEmployees, setLoadingEmployees] = useState(false);

  const quotaRate = companyType === "PRIVATE" ? 0.031 : 0.038;

  // DB에서 직원 데이터 불러오기
  async function loadFromDB() {
    const token = getToken();
    const role = getUserRole();

    if (role !== "BUYER") {
      alert("부담금기업만 이용 가능합니다.");
      return;
    }

    if (!token) {
      alert("로그인이 필요합니다.");
      window.location.href = "/login";
      return;
    }

    setLoadingEmployees(true);
    try {
      const res = await fetch(`${API_BASE}/employees`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("직원 데이터 로드 실패");

      const json = await res.json();
      const employees = json.employees || [];

      if (employees.length === 0) {
        alert("등록된 직원이 없습니다. 먼저 직원을 등록하세요.");
        return;
      }

      // 기존 allWorkers를 DB 데이터로 교체
      const loadedWorkers: Worker[] = employees.map((emp: any) => ({
        id: emp.id,
        name: emp.name,
        disabilityType: emp.disabilityType,
        severity: emp.severity,
        gender: emp.gender,
        hireDate: emp.hireDate.split("T")[0],
        resignDate: emp.resignDate ? emp.resignDate.split("T")[0] : undefined,
        monthlySalary: emp.monthlySalary,
        hasEmploymentInsurance: emp.hasEmploymentInsurance,
        meetsMinimumWage: emp.meetsMinimumWage,
      }));

      setAllWorkers(loadedWorkers);

      // 월별 자동 매칭
      const newMonths = months.map((m, idx) => {
        const month = idx + 1;
        const monthDate = new Date(2026, month - 1, 1);

        const workersThisMonth = loadedWorkers.filter((w) => {
          const hireDate = new Date(w.hireDate);
          if (hireDate > monthDate) return false;

          if (w.resignDate) {
            const resignDate = new Date(w.resignDate);
            if (resignDate < monthDate) return false;
          }

          return true;
        });

        return {
          ...m,
          workers: workersThisMonth,
        };
      });

      setMonths(newMonths);
      alert(`${loadedWorkers.length}명의 직원 데이터를 불러왔습니다!`);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setLoadingEmployees(false);
    }
  }

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

    if (editingWorkerId) {
      // 수정 모드
      setAllWorkers(
        allWorkers.map((w) =>
          w.id === editingWorkerId
            ? {
                ...w,
                name: editingWorker.name!,
                disabilityType: editingWorker.disabilityType || "지체",
                severity: editingWorker.severity!,
                gender: editingWorker.gender!,
                hireDate: editingWorker.hireDate!,
                resignDate: editingWorker.resignDate,
                monthlySalary: editingWorker.monthlySalary!,
                hasEmploymentInsurance: editingWorker.hasEmploymentInsurance!,
                meetsMinimumWage: editingWorker.meetsMinimumWage!,
              }
            : w
        )
      );
      setEditingWorkerId(null);
    } else {
      // 추가 모드
      const worker: Worker = {
        id: Date.now().toString(),
        name: editingWorker.name!,
        disabilityType: editingWorker.disabilityType || "지체",
        severity: editingWorker.severity!,
        gender: editingWorker.gender!,
        hireDate: editingWorker.hireDate!,
        resignDate: editingWorker.resignDate,
        monthlySalary: editingWorker.monthlySalary!,
        hasEmploymentInsurance: editingWorker.hasEmploymentInsurance!,
        meetsMinimumWage: editingWorker.meetsMinimumWage!,
      };
      setAllWorkers([...allWorkers, worker]);
    }

    setEditingWorker({
      severity: "MILD",
      gender: "M",
      hasEmploymentInsurance: true,
      meetsMinimumWage: true,
    });
  }

  function editWorker(worker: Worker) {
    setEditingWorkerId(worker.id);
    setEditingWorker(worker);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEdit() {
    setEditingWorkerId(null);
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

      // 해당 월에 근무 중인 근로자 필터링 (입사일 <= 월 && (퇴사일 없음 || 퇴사일 >= 월))
      const activeWorkers = allWorkers.filter((w) => {
        const hireDate = new Date(w.hireDate);
        if (hireDate > monthDate) return false;

        if (w.resignDate) {
          const resignDate = new Date(w.resignDate);
          // 퇴사일이 해당 월보다 이전이면 제외
          if (resignDate < monthDate) return false;
        }

        return true;
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

      {/* 직원 데이터 불러오기 버튼 */}
      <div
        style={{
          marginTop: 24,
          padding: 16,
          background: "#f0fdf4",
          borderRadius: 8,
          border: "2px solid #10b981",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
          <span style={{ fontSize: 24 }}>👥</span>
          <div style={{ flex: 1 }}>
            <h3 style={{ margin: 0, fontSize: 16, color: "#10b981" }}>
              직원 데이터 자동 불러오기
            </h3>
            <p style={{ margin: "4px 0 0 0", fontSize: 14, color: "#666" }}>
              등록된 장애인 직원 정보를 불러와 자동으로 월별 장려금을 계산합니다
            </p>
          </div>
          <button
            onClick={loadFromDB}
            disabled={loadingEmployees}
            style={{
              background: "#10b981",
              padding: "12px 24px",
              fontSize: 16,
              fontWeight: "bold",
              border: "none",
              borderRadius: 6,
              color: "white",
              cursor: loadingEmployees ? "not-allowed" : "pointer",
              opacity: loadingEmployees ? 0.6 : 1,
            }}
          >
            {loadingEmployees ? "불러오는 중..." : "📥 불러오기"}
          </button>
        </div>
        <p style={{ margin: 0, fontSize: 13, color: "#666" }}>
          💡 직원이 등록되지 않았다면{" "}
          <a
            href="/dashboard/employees"
            style={{ color: "#10b981", textDecoration: "underline" }}
          >
            직원 관리
          </a>
          에서 먼저 등록하세요
        </p>
      </div>

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
        <h2>{editingWorkerId ? "장애인 근로자 수정" : "장애인 근로자 등록"}</h2>
        {editingWorkerId && (
          <div
            style={{
              marginTop: 8,
              padding: 8,
              background: "#fef3c7",
              borderRadius: 4,
              fontSize: 14,
              color: "#92400e",
            }}
          >
            ✏️ <strong>수정 모드:</strong> 근로자 정보를 수정하고 있습니다.
          </div>
        )}
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
            <label>퇴사일 (선택)</label>
            <input
              type="date"
              value={editingWorker.resignDate || ""}
              onChange={(e) => setEditingWorker({ ...editingWorker, resignDate: e.target.value })}
              placeholder="재직 중이면 비워두세요"
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
        <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
          <button
            onClick={addWorker}
            style={{
              background: editingWorkerId ? "#f59e0b" : "#10b981",
              color: "white",
              padding: "10px 20px",
              border: "none",
              borderRadius: 6,
              cursor: "pointer",
            }}
          >
            {editingWorkerId ? "✏️ 근로자 수정 완료" : "➕ 근로자 추가"}
          </button>
          {editingWorkerId && (
            <button
              onClick={cancelEdit}
              style={{
                background: "#6b7280",
                color: "white",
                padding: "10px 20px",
                border: "none",
                borderRadius: 6,
                cursor: "pointer",
              }}
            >
              ✖️ 취소
            </button>
          )}
        </div>

        <div
          style={{
            marginTop: 16,
            padding: 12,
            background: "#dbeafe",
            borderRadius: 6,
            fontSize: 14,
          }}
        >
          💡 <strong>자동 월별 매칭:</strong> 등록된 근로자는 입사일과 퇴사일에 따라 자동으로 각 월에 매칭됩니다. 퇴사일이 없으면 재직 중으로 간주됩니다.
        </div>

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
                    <th style={{ padding: 8, border: "1px solid #ddd" }}>퇴사일</th>
                    <th style={{ padding: 8, border: "1px solid #ddd" }}>월 임금</th>
                    <th style={{ padding: 8, border: "1px solid #ddd" }}>고용보험</th>
                    <th style={{ padding: 8, border: "1px solid #ddd" }}>최저임금</th>
                    <th style={{ padding: 8, border: "1px solid #ddd" }}>관리</th>
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
                      <td style={{ padding: 8, border: "1px solid #ddd", textAlign: "center" }}>
                        {w.resignDate || <span style={{ color: "#10b981" }}>재직중</span>}
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
                        <div style={{ display: "flex", gap: 4, justifyContent: "center" }}>
                          <button
                            onClick={() => editWorker(w)}
                            style={{
                              background: "#3b82f6",
                              color: "white",
                              border: "none",
                              padding: "4px 12px",
                              borderRadius: 4,
                              cursor: "pointer",
                              fontSize: 12,
                            }}
                          >
                            수정
                          </button>
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
                        </div>
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
