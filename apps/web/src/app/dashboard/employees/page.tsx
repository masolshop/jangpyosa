"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { API_BASE } from "@/lib/api";
import { getToken, getUserRole } from "@/lib/auth";

// ============================================
// 타입 정의
// ============================================

type Employee = {
  id: string;
  name: string;
  registrationNumber?: string;
  disabilityType: string;
  disabilityGrade?: string;
  severity: "MILD" | "SEVERE";
  gender: "M" | "F";
  birthDate?: string;
  hireDate: string;
  resignDate?: string;
  monthlySalary: number;
  hasEmploymentInsurance: boolean;
  meetsMinimumWage: boolean;
  workHoursPerWeek?: number;
  memo?: string;
};

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
  netAmount: number;
  details?: any[];
};

// ============================================
// 메인 컴포넌트
// ============================================

export default function EmployeesIntegratedPage() {
  const router = useRouter();
  const [year, setYear] = useState(2026);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // 월별 데이터
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [companyName, setCompanyName] = useState("");

  // 직원 데이터
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tab, setTab] = useState<"active" | "resigned">("active");

  const [form, setForm] = useState({
    name: "",
    disabilityType: "",
    disabilityGrade: "",
    severity: "MILD" as "MILD" | "SEVERE",
    gender: "M" as "M" | "F",
    birthDate: "",
    hireDate: "",
    resignDate: "",
    monthlySalary: 2060740,
    hasEmploymentInsurance: true,
    meetsMinimumWage: true,
    workHoursPerWeek: 40,
    memo: "",
  });

  // ============================================
  // 초기 로드
  // ============================================

  useEffect(() => {
    const role = getUserRole();
    if (role !== "BUYER" && role !== "SUPER_ADMIN") {
      router.push("/");
      return;
    }
    fetchData();
  }, [year]);

  async function fetchData() {
    setLoading(true);
    setError("");

    try {
      await Promise.all([fetchMonthlyData(), fetchEmployees()]);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  // ============================================
  // 월별 데이터 API
  // ============================================

  async function fetchMonthlyData() {
    const token = getToken();
    if (!token) {
      router.push("/login");
      return;
    }

    const res = await fetch(`${API_BASE}/employees/monthly?year=${year}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) throw new Error("월별 데이터 조회 실패");

    const data = await res.json();
    setMonthlyData(data.monthlyData);
    setCompanyName(data.companyName);
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

  async function updateEmployeeCount(month: number, value: string) {
    const numValue = parseInt(value) || 0;
    
    // 1. totalEmployeeCount 업데이트
    setMonthlyData((prev) =>
      prev.map((data) => {
        if (data.month !== month) return data;
        
        // 2. 재계산 (간단 버전)
        const quotaRate = 0.031; // 민간기업 3.1%
        const obligatedCount = Math.floor(numValue * quotaRate);
        const shortfallCount = Math.max(0, obligatedCount - data.recognizedCount);
        const surplusCount = Math.max(0, data.recognizedCount - obligatedCount);
        const levy = shortfallCount * 1260000; // 2026년 기준 부담금
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
  }

  function fillAllMonths() {
    const firstValue = monthlyData[0]?.totalEmployeeCount || 0;
    setMonthlyData((prev) =>
      prev.map((data) => ({ ...data, totalEmployeeCount: firstValue }))
    );
  }

  function copyPreviousMonth() {
    setMonthlyData((prev) => {
      const newData = [...prev];
      for (let i = 1; i < newData.length; i++) {
        if (!newData[i].totalEmployeeCount || newData[i].totalEmployeeCount === 0) {
          newData[i].totalEmployeeCount = newData[i - 1].totalEmployeeCount;
        }
      }
      return newData;
    });
  }

  // ============================================
  // 직원 관리 API
  // ============================================

  async function fetchEmployees() {
    const token = getToken();
    if (!token) return;

    const res = await fetch(`${API_BASE}/employees`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) throw new Error("직원 목록 조회 실패");

    const json = await res.json();
    setEmployees(json.employees || []);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const token = getToken();
    if (!token) return;

    try {
      const url = editingId
        ? `${API_BASE}/employees/${editingId}`
        : `${API_BASE}/employees`;
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          workHoursPerWeek: form.workHoursPerWeek || null,
          birthDate: form.birthDate || null,
        }),
      });

      if (!res.ok) throw new Error(editingId ? "수정 실패" : "등록 실패");

      // 성공 후 데이터 갱신
      await fetchData();
      resetForm();
      setMessage(editingId ? "✅ 직원 정보가 수정되었습니다." : "✅ 직원이 등록되었습니다.");
      setTimeout(() => setMessage(""), 3000);
    } catch (e: any) {
      setError(e.message);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("정말 삭제하시겠습니까?")) return;

    const token = getToken();
    if (!token) return;

    try {
      const res = await fetch(`${API_BASE}/employees/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("삭제 실패");

      await fetchData();
      setMessage("✅ 직원이 삭제되었습니다.");
      setTimeout(() => setMessage(""), 3000);
    } catch (e: any) {
      setError(e.message);
    }
  }

  function startEdit(emp: Employee) {
    setForm({
      name: emp.name,
      disabilityType: emp.disabilityType,
      disabilityGrade: emp.disabilityGrade || "",
      severity: emp.severity,
      gender: emp.gender,
      birthDate: emp.birthDate || "",
      hireDate: emp.hireDate.split("T")[0],
      resignDate: emp.resignDate ? emp.resignDate.split("T")[0] : "",
      monthlySalary: emp.monthlySalary,
      hasEmploymentInsurance: emp.hasEmploymentInsurance,
      meetsMinimumWage: emp.meetsMinimumWage,
      workHoursPerWeek: emp.workHoursPerWeek || 40,
      memo: emp.memo || "",
    });
    setEditingId(emp.id);
    setShowForm(true);
  }

  function resetForm() {
    setForm({
      name: "",
      disabilityType: "",
      disabilityGrade: "",
      severity: "MILD",
      gender: "M",
      birthDate: "",
      hireDate: "",
      resignDate: "",
      monthlySalary: 2060740,
      hasEmploymentInsurance: true,
      meetsMinimumWage: true,
      workHoursPerWeek: 40,
      memo: "",
    });
    setEditingId(null);
    setShowForm(false);
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

  const activeEmployees = employees.filter((e) => !e.resignDate);
  const resignedEmployees = employees.filter((e) => e.resignDate);

  // 연간 합계
  const yearlyLevy = monthlyData.reduce((sum, d) => sum + d.levy, 0);
  const yearlyIncentive = monthlyData.reduce((sum, d) => sum + d.incentive, 0);
  const yearlyNet = yearlyIncentive - yearlyLevy;

  return (
    <div className="container">
      <div className="card" style={{ maxWidth: "100%", margin: "20px auto" }}>
        <h1>🏢 장애인고용직원등록관리</h1>
        <p style={{ color: "#666", marginTop: 8 }}>
          {companyName} - {year}년 월별 고용 현황 및 정밀 계산
        </p>

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
            <label>연도</label>
            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              style={{ marginTop: 8 }}
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
              fontSize: 14,
              minWidth: 1200,
            }}
          >
            <thead>
              <tr style={{ background: "#f3f4f6" }}>
                <th style={tableHeaderStyle}>월</th>
                <th style={tableHeaderStyle}>상시근로자</th>
                <th style={tableHeaderStyle}>장애인수</th>
                <th style={tableHeaderStyle}>의무고용</th>
                <th style={tableHeaderStyle}>인정수</th>
                <th style={tableHeaderStyle}>미달/초과</th>
                <th style={tableHeaderStyle}>부담금</th>
                <th style={tableHeaderStyle}>장려금</th>
                <th style={tableHeaderStyle}>순액</th>
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
                    }}
                  >
                    {data.incentive > 0 ? `+${(data.incentive / 10000).toFixed(0)}만` : "-"}
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
              <tr style={{ background: "#f9fafb", fontWeight: "bold" }}>
                <td colSpan={6} style={{ ...tableCellStyle, textAlign: "right" }}>
                  연간 합계
                </td>
                <td style={{ ...tableCellStyle, color: "#dc2626" }}>
                  -{(yearlyLevy / 10000).toFixed(0)}만
                </td>
                <td style={{ ...tableCellStyle, color: "#059669" }}>
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
            padding: 16,
            background: "#fef3c7",
            borderRadius: 8,
            fontSize: 13,
          }}
        >
          <p style={{ margin: 0, fontWeight: "bold", color: "#92400e" }}>
            💡 자동 계산 정보
          </p>
          <ul style={{ marginTop: 8, paddingLeft: 20, color: "#78350f" }}>
            <li>장애인 수: 등록된 직원의 입사/퇴사일 기준 자동 계산</li>
            <li>인정 수: 중증 60시간 이상 2배 인정</li>
            <li>부담금: 미달 인원 × 126만원 (2026년 기준)</li>
            <li>
              장려금: 성별/중증도/연령/근로시간별 정밀 계산 (여성·중증·청년 우대)
            </li>
          </ul>
        </div>

        {/* 직원 관리 섹션 */}
        <div style={{ marginTop: 40 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <h2>👥 장애인 직원 관리</h2>
            <button
              onClick={() => {
                resetForm();
                setShowForm(true);
              }}
              style={{
                padding: "10px 20px",
                background: "#10b981",
                color: "white",
                border: "none",
                borderRadius: 6,
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              + 직원 추가
            </button>
          </div>

          {/* 탭 */}
          <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
            <button
              onClick={() => setTab("active")}
              style={{
                padding: "8px 16px",
                background: tab === "active" ? "#3b82f6" : "#e5e7eb",
                color: tab === "active" ? "white" : "#666",
                border: "none",
                borderRadius: 6,
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              재직중 ({activeEmployees.length})
            </button>
            <button
              onClick={() => setTab("resigned")}
              style={{
                padding: "8px 16px",
                background: tab === "resigned" ? "#3b82f6" : "#e5e7eb",
                color: tab === "resigned" ? "white" : "#666",
                border: "none",
                borderRadius: 6,
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              퇴사 ({resignedEmployees.length})
            </button>
          </div>

          {/* 직원 폼 */}
          {showForm && (
            <div
              style={{
                marginTop: 16,
                padding: 20,
                background: "#f9fafb",
                borderRadius: 8,
                border: "2px solid #3b82f6",
              }}
            >
              <h3 style={{ marginTop: 0 }}>
                {editingId ? "✏️ 직원 정보 수정" : "➕ 새 직원 등록"}
              </h3>
              <form onSubmit={handleSubmit}>
                <div
                  style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}
                >
                  <div>
                    <label>이름 *</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label>장애 유형 *</label>
                    <input
                      type="text"
                      value={form.disabilityType}
                      onChange={(e) =>
                        setForm({ ...form, disabilityType: e.target.value })
                      }
                      placeholder="예: 지체장애, 시각장애"
                      required
                    />
                  </div>

                  <div>
                    <label>장애 등급</label>
                    <input
                      type="text"
                      value={form.disabilityGrade}
                      onChange={(e) =>
                        setForm({ ...form, disabilityGrade: e.target.value })
                      }
                      placeholder="예: 2급"
                    />
                  </div>

                  <div>
                    <label>중증도 *</label>
                    <select
                      value={form.severity}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          severity: e.target.value as "MILD" | "SEVERE",
                        })
                      }
                      required
                    >
                      <option value="MILD">경증</option>
                      <option value="SEVERE">중증</option>
                    </select>
                  </div>

                  <div>
                    <label>성별 *</label>
                    <select
                      value={form.gender}
                      onChange={(e) =>
                        setForm({ ...form, gender: e.target.value as "M" | "F" })
                      }
                      required
                    >
                      <option value="M">남성</option>
                      <option value="F">여성</option>
                    </select>
                  </div>

                  <div>
                    <label>생년월일 (장려금 계산용)</label>
                    <input
                      type="date"
                      value={form.birthDate}
                      onChange={(e) => setForm({ ...form, birthDate: e.target.value })}
                    />
                  </div>

                  <div>
                    <label>입사일 *</label>
                    <input
                      type="date"
                      value={form.hireDate}
                      onChange={(e) => setForm({ ...form, hireDate: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label>퇴사일</label>
                    <input
                      type="date"
                      value={form.resignDate}
                      onChange={(e) => setForm({ ...form, resignDate: e.target.value })}
                    />
                  </div>

                  <div>
                    <label>주간 근로시간 *</label>
                    <input
                      type="number"
                      value={form.workHoursPerWeek}
                      onChange={(e) =>
                        setForm({ ...form, workHoursPerWeek: Number(e.target.value) })
                      }
                      min="1"
                      max="80"
                      required
                    />
                    <p style={{ fontSize: 12, color: "#666", marginTop: 4 }}>
                      💡 중증 60시간 이상: 부담금 2배 인정
                    </p>
                  </div>

                  <div>
                    <label>월 급여 (원) *</label>
                    <input
                      type="number"
                      value={form.monthlySalary}
                      onChange={(e) =>
                        setForm({ ...form, monthlySalary: Number(e.target.value) })
                      }
                      min="0"
                      step="1000"
                      required
                    />
                  </div>

                  <div>
                    <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <input
                        type="checkbox"
                        checked={form.hasEmploymentInsurance}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            hasEmploymentInsurance: e.target.checked,
                          })
                        }
                      />
                      <span>고용보험 가입</span>
                    </label>
                  </div>

                  <div>
                    <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <input
                        type="checkbox"
                        checked={form.meetsMinimumWage}
                        onChange={(e) =>
                          setForm({ ...form, meetsMinimumWage: e.target.checked })
                        }
                      />
                      <span>최저임금 이상</span>
                    </label>
                  </div>
                </div>

                <div style={{ marginTop: 16 }}>
                  <label>메모</label>
                  <textarea
                    value={form.memo}
                    onChange={(e) => setForm({ ...form, memo: e.target.value })}
                    rows={3}
                    placeholder="특이사항 입력..."
                  />
                </div>

                <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
                  <button
                    type="submit"
                    style={{
                      flex: 1,
                      padding: 12,
                      background: "#3b82f6",
                      color: "white",
                      border: "none",
                      borderRadius: 6,
                      fontWeight: "bold",
                      cursor: "pointer",
                    }}
                  >
                    {editingId ? "✅ 수정 완료" : "➕ 등록하기"}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    style={{
                      padding: 12,
                      background: "#6b7280",
                      color: "white",
                      border: "none",
                      borderRadius: 6,
                      cursor: "pointer",
                    }}
                  >
                    취소
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* 직원 목록 */}
          <div style={{ marginTop: 16 }}>
            {(tab === "active" ? activeEmployees : resignedEmployees).length === 0 ? (
              <p style={{ textAlign: "center", color: "#999", padding: 40 }}>
                {tab === "active" ? "등록된 직원이 없습니다." : "퇴사한 직원이 없습니다."}
              </p>
            ) : (
              <div style={{ display: "grid", gap: 12 }}>
                {(tab === "active" ? activeEmployees : resignedEmployees).map((emp) => (
                  <div
                    key={emp.id}
                    style={{
                      padding: 16,
                      background: "white",
                      border: "1px solid #e5e7eb",
                      borderRadius: 8,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <h3 style={{ margin: 0, fontSize: 18 }}>
                          {emp.name}
                          <span
                            style={{
                              marginLeft: 8,
                              padding: "2px 8px",
                              fontSize: 12,
                              background:
                                emp.severity === "SEVERE" ? "#fef3c7" : "#e0e7ff",
                              color: emp.severity === "SEVERE" ? "#92400e" : "#3730a3",
                              borderRadius: 4,
                              fontWeight: "normal",
                            }}
                          >
                            {emp.severity === "SEVERE" ? "중증" : "경증"}
                          </span>
                          <span
                            style={{
                              marginLeft: 4,
                              padding: "2px 8px",
                              fontSize: 12,
                              background: emp.gender === "F" ? "#fce7f3" : "#dbeafe",
                              color: emp.gender === "F" ? "#831843" : "#1e3a8a",
                              borderRadius: 4,
                              fontWeight: "normal",
                            }}
                          >
                            {emp.gender === "F" ? "여" : "남"}
                          </span>
                        </h3>
                        <p style={{ margin: "8px 0 0 0", fontSize: 14, color: "#666" }}>
                          {emp.disabilityType}
                          {emp.disabilityGrade && ` ${emp.disabilityGrade}`} | 주{" "}
                          {emp.workHoursPerWeek || 40}시간 |{" "}
                          {emp.monthlySalary.toLocaleString()}원/월
                        </p>
                        <p style={{ margin: "4px 0 0 0", fontSize: 13, color: "#999" }}>
                          입사: {emp.hireDate.split("T")[0]}
                          {emp.resignDate && ` | 퇴사: ${emp.resignDate.split("T")[0]}`}
                        </p>
                      </div>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button
                          onClick={() => startEdit(emp)}
                          style={{
                            padding: "6px 12px",
                            background: "#3b82f6",
                            color: "white",
                            border: "none",
                            borderRadius: 4,
                            fontSize: 13,
                            cursor: "pointer",
                          }}
                        >
                          수정
                        </button>
                        <button
                          onClick={() => handleDelete(emp.id)}
                          style={{
                            padding: "6px 12px",
                            background: "#ef4444",
                            color: "white",
                            border: "none",
                            borderRadius: 4,
                            fontSize: 13,
                            cursor: "pointer",
                          }}
                        >
                          삭제
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
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
