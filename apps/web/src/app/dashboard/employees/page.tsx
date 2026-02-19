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

// ============================================
// 메인 컴포넌트
// ============================================

export default function EmployeesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

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

  // 2026년 최저시급
  const MINIMUM_HOURLY_WAGE = 10030;

  // 근로시간으로 월급 자동 계산 (주 근로시간 × 4.345주 × 최저시급)
  const calculateMonthlySalary = (weeklyHours: number): number => {
    if (!weeklyHours || weeklyHours <= 0) return 0;
    const monthlyHours = weeklyHours * 4.345; // 월 평균 주수
    const salary = monthlyHours * MINIMUM_HOURLY_WAGE;
    // 1,000원 단위로 반올림
    return Math.round(salary / 1000) * 1000;
  };

  // 근로시간 변경 시 급여 자동 계산
  const handleWorkHoursChange = (hours: number) => {
    setForm({
      ...form,
      workHoursPerWeek: hours,
      monthlySalary: calculateMonthlySalary(hours),
    });
  };

  // ============================================
  // 초기 로드
  // ============================================

  useEffect(() => {
    const role = getUserRole();
    if (role !== "BUYER" && role !== "SUPER_ADMIN") {
      router.push("/");
      return;
    }
    fetchEmployees();
  }, []);

  // ============================================
  // 직원 관리 API
  // ============================================

  async function fetchEmployees() {
    setLoading(true);
    setError("");
    
    const token = getToken();
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/employees`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("직원 목록 조회 실패");

      const json = await res.json();
      setEmployees(json.employees || []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
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
      await fetchEmployees();
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

      await fetchEmployees();
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

  // 통계 계산
  const totalDisabled = activeEmployees.length;
  const severeCount = activeEmployees.filter(e => e.severity === "SEVERE").length;
  const mildCount = activeEmployees.filter(e => e.severity === "MILD").length;
  const femaleCount = activeEmployees.filter(e => e.gender === "F").length;
  const maleCount = activeEmployees.filter(e => e.gender === "M").length;

  return (
    <div className="container">
      <div className="card" style={{ maxWidth: "100%", margin: "20px auto" }}>
        <h1>👥 장애인 직원 등록·관리</h1>
        <p style={{ color: "#666", marginTop: 8 }}>
          장애인 직원 정보를 등록하고 관리합니다. 입사일, 퇴사일 기준으로 월별 계산에 자동 반영됩니다.
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

        {/* 통계 요약 - 3개 섹션으로 분리 */}
        <div style={{ 
          marginTop: 24, 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", 
          gap: 20 
        }}>
          {/* 전체 */}
          <div style={{
            padding: 20,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            borderRadius: 12,
            color: "white"
          }}>
            <h3 style={{ margin: 0, fontSize: 18, marginBottom: 16 }}>📊 재직 중인 장애인 현황</h3>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 48, fontWeight: "bold" }}>{totalDisabled}명</div>
              <div style={{ fontSize: 16, opacity: 0.9, marginTop: 8 }}>전체</div>
            </div>
          </div>

          {/* 중증/경증 */}
          <div style={{
            padding: 20,
            background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
            borderRadius: 12,
            color: "white"
          }}>
            <h3 style={{ margin: 0, fontSize: 18, marginBottom: 16 }}>🏥 중증도별 현황</h3>
            <div style={{ display: "flex", justifyContent: "space-around" }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 40, fontWeight: "bold" }}>{severeCount}명</div>
                <div style={{ fontSize: 14, opacity: 0.9, marginTop: 4 }}>중증</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 40, fontWeight: "bold" }}>{mildCount}명</div>
                <div style={{ fontSize: 14, opacity: 0.9, marginTop: 4 }}>경증</div>
              </div>
            </div>
          </div>

          {/* 남성/여성 */}
          <div style={{
            padding: 20,
            background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
            borderRadius: 12,
            color: "white"
          }}>
            <h3 style={{ margin: 0, fontSize: 18, marginBottom: 16 }}>👥 성별 현황</h3>
            <div style={{ display: "flex", justifyContent: "space-around" }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 40, fontWeight: "bold" }}>{maleCount}명</div>
                <div style={{ fontSize: 14, opacity: 0.9, marginTop: 4 }}>남성</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 40, fontWeight: "bold" }}>{femaleCount}명</div>
                <div style={{ fontSize: 14, opacity: 0.9, marginTop: 4 }}>여성</div>
              </div>
            </div>
          </div>
        </div>

        {/* 직원 관리 섹션 */}
        <div style={{ marginTop: 32 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <h2 style={{ margin: 0 }}>직원 목록</h2>
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
                fontSize: 15,
              }}
            >
              ➕ 직원 추가
            </button>
          </div>

          {/* 탭 */}
          <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
            <button
              onClick={() => setTab("active")}
              style={{
                padding: "10px 20px",
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
                padding: "10px 20px",
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
                padding: 24,
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
                      onChange={(e) => handleWorkHoursChange(Number(e.target.value))}
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
                    <p style={{ fontSize: 12, color: "#10b981", marginTop: 4 }}>
                      ✅ 주 {form.workHoursPerWeek || 0}시간 기준 최저임금: {calculateMonthlySalary(form.workHoursPerWeek || 0).toLocaleString()}원 (자동 계산됨, 1천원 단위)
                    </p>
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

                <div style={{ marginTop: 20, display: "flex", gap: 8 }}>
                  <button
                    type="submit"
                    style={{
                      flex: 1,
                      padding: 14,
                      background: "#3b82f6",
                      color: "white",
                      border: "none",
                      borderRadius: 6,
                      fontWeight: "bold",
                      cursor: "pointer",
                      fontSize: 15,
                    }}
                  >
                    {editingId ? "✅ 수정 완료" : "➕ 등록하기"}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    style={{
                      padding: 14,
                      background: "#6b7280",
                      color: "white",
                      border: "none",
                      borderRadius: 6,
                      cursor: "pointer",
                      fontSize: 15,
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
              <div style={{
                textAlign: "center",
                padding: 60,
                background: "#f9fafb",
                borderRadius: 8,
                border: "2px dashed #d1d5db"
              }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>👤</div>
                <p style={{ color: "#999", margin: 0, fontSize: 16 }}>
                  {tab === "active" ? "등록된 직원이 없습니다." : "퇴사한 직원이 없습니다."}
                </p>
                {tab === "active" && (
                  <p style={{ color: "#999", margin: "8px 0 0 0", fontSize: 14 }}>
                    상단의 "➕ 직원 추가" 버튼을 눌러 장애인 직원을 등록하세요.
                  </p>
                )}
              </div>
            ) : (
              <div style={{ display: "grid", gap: 12 }}>
                {(tab === "active" ? activeEmployees : resignedEmployees).map((emp) => (
                  <div
                    key={emp.id}
                    style={{
                      padding: 20,
                      background: "white",
                      border: "1px solid #e5e7eb",
                      borderRadius: 8,
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
                      e.currentTarget.style.transform = "translateY(-2px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = "none";
                      e.currentTarget.style.transform = "translateY(0)";
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
                        <h3 style={{ margin: 0, fontSize: 20, display: "flex", alignItems: "center", gap: 8 }}>
                          {emp.name}
                          <span
                            style={{
                              padding: "3px 10px",
                              fontSize: 13,
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
                              padding: "3px 10px",
                              fontSize: 13,
                              background: emp.gender === "F" ? "#fce7f3" : "#dbeafe",
                              color: emp.gender === "F" ? "#831843" : "#1e3a8a",
                              borderRadius: 4,
                              fontWeight: "normal",
                            }}
                          >
                            {emp.gender === "F" ? "여성" : "남성"}
                          </span>
                        </h3>
                        <p style={{ margin: "10px 0 0 0", fontSize: 15, color: "#666" }}>
                          🏷️ {emp.disabilityType}
                          {emp.disabilityGrade && ` ${emp.disabilityGrade}`}
                        </p>
                        <p style={{ margin: "6px 0 0 0", fontSize: 14, color: "#666" }}>
                          ⏰ 주 {emp.workHoursPerWeek || 40}시간 | 💰 월 {emp.monthlySalary.toLocaleString()}원
                        </p>
                        <p style={{ margin: "6px 0 0 0", fontSize: 14, color: "#999" }}>
                          📅 입사: {emp.hireDate.split("T")[0]}
                          {emp.resignDate && ` | 퇴사: ${emp.resignDate.split("T")[0]}`}
                        </p>
                        {emp.memo && (
                          <p style={{ margin: "10px 0 0 0", fontSize: 13, color: "#666", fontStyle: "italic", padding: "8px 12px", background: "#f9fafb", borderRadius: 4 }}>
                            💬 {emp.memo}
                          </p>
                        )}
                      </div>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button
                          onClick={() => startEdit(emp)}
                          style={{
                            padding: "8px 16px",
                            background: "#3b82f6",
                            color: "white",
                            border: "none",
                            borderRadius: 4,
                            fontSize: 14,
                            cursor: "pointer",
                            fontWeight: "bold",
                          }}
                        >
                          수정
                        </button>
                        <button
                          onClick={() => handleDelete(emp.id)}
                          style={{
                            padding: "8px 16px",
                            background: "#ef4444",
                            color: "white",
                            border: "none",
                            borderRadius: 4,
                            fontSize: 14,
                            cursor: "pointer",
                            fontWeight: "bold",
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

        {/* 안내 박스 */}
        <div
          style={{
            marginTop: 32,
            padding: 20,
            background: "#eff6ff",
            borderRadius: 8,
            border: "1px solid #bfdbfe",
          }}
        >
          <h4 style={{ margin: 0, color: "#1e40af", fontSize: 16 }}>
            💡 직원 등록 안내
          </h4>
          <ul style={{ marginTop: 12, paddingLeft: 20, color: "#1e3a8a", fontSize: 14, lineHeight: 1.8 }}>
            <li>
              <strong>입사일/퇴사일</strong>을 정확히 입력하면 월별 계산 시 자동으로 재직 여부가 반영됩니다.
            </li>
            <li>
              <strong>근로시간</strong>을 입력하면 최저임금이 자동 계산됩니다 (1,000원 단위 반올림).
            </li>
            <li>
              <strong>중증 장애인</strong>이 주 60시간 이상 근무하면 부담금 인정 시 2배 계산됩니다.
            </li>
            <li>
              장려금은 <strong>성별, 중증도, 연령, 근로시간</strong>에 따라 차등 지급됩니다.
            </li>
            <li>
              등록 완료 후 <strong>"월별 장애인 고용 관리"</strong> 메뉴에서 상시근로자 수를 입력하면 자동 계산됩니다.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
