"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { API_BASE } from "@/lib/api";
import { getToken, getUserRole } from "@/lib/auth";

type Employee = {
  id: string;
  name: string;
  registrationNumber?: string;
  disabilityType: string;
  disabilityGrade?: string;
  severity: "MILD" | "SEVERE";
  gender: "M" | "F";
  hireDate: string;
  resignDate?: string;
  monthlySalary: number;
  hasEmploymentInsurance: boolean;
  meetsMinimumWage: boolean;
  workHoursPerWeek?: number;
  memo?: string;
};

export default function EmployeesPage() {
  const router = useRouter();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tab, setTab] = useState<"active" | "resigned">("active");

  const [form, setForm] = useState({
    name: "",
    disabilityType: "",
    disabilityGrade: "",
    severity: "MILD" as "MILD" | "SEVERE",
    gender: "M" as "M" | "F",
    hireDate: "",
    resignDate: "",
    monthlySalary: 2060740,
    hasEmploymentInsurance: true,
    meetsMinimumWage: true,
    workHoursPerWeek: 40,
    memo: "",
  });

  useEffect(() => {
    const role = getUserRole();
    if (role !== "BUYER" && role !== "SUPER_ADMIN") {
      router.push("/");
      return;
    }
    fetchEmployees();
  }, []);

  async function fetchEmployees() {
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
          resignDate: form.resignDate || null,
        }),
      });

      if (!res.ok) throw new Error("저장 실패");

      await fetchEmployees();
      resetForm();
      setShowForm(false);
    } catch (e: any) {
      alert(e.message);
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
    } catch (e: any) {
      alert(e.message);
    }
  }

  function handleEdit(emp: Employee) {
    setEditingId(emp.id);
    setForm({
      name: emp.name,
      disabilityType: emp.disabilityType,
      disabilityGrade: emp.disabilityGrade || "",
      severity: emp.severity,
      gender: emp.gender,
      hireDate: emp.hireDate.split("T")[0],
      resignDate: emp.resignDate ? emp.resignDate.split("T")[0] : "",
      monthlySalary: emp.monthlySalary,
      hasEmploymentInsurance: emp.hasEmploymentInsurance,
      meetsMinimumWage: emp.meetsMinimumWage,
      workHoursPerWeek: emp.workHoursPerWeek || 40,
      memo: emp.memo || "",
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetForm() {
    setEditingId(null);
    setForm({
      name: "",
      disabilityType: "",
      disabilityGrade: "",
      severity: "MILD",
      gender: "M",
      hireDate: "",
      resignDate: "",
      monthlySalary: 2060740,
      hasEmploymentInsurance: true,
      meetsMinimumWage: true,
      workHoursPerWeek: 40,
      memo: "",
    });
  }

  const activeEmployees = employees.filter((e) => !e.resignDate);
  const resignedEmployees = employees.filter((e) => e.resignDate);

  if (loading) {
    return (
      <div className="container">
        <div className="card">
          <p>로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="card">
        <h1>👥 장애인 직원 관리</h1>
        <p style={{ color: "#666", marginTop: 8 }}>
          직원을 등록하면 부담금/장려금/감면 계산기에서 자동으로 활용됩니다.
        </p>

        {error && <p className="error">{error}</p>}

        {/* 직원 추가 버튼 */}
        <div style={{ marginTop: 24 }}>
          <button
            onClick={() => {
              resetForm();
              setShowForm(!showForm);
            }}
            style={{ background: "#10b981", width: "100%" }}
          >
            {showForm ? "✖️ 취소" : "➕ 직원 추가"}
          </button>
        </div>

        {/* 직원 등록/수정 폼 */}
        {showForm && (
          <form
            onSubmit={handleSubmit}
            style={{
              marginTop: 24,
              padding: 20,
              background: "#f9fafb",
              borderRadius: 8,
            }}
          >
            <h2>{editingId ? "✏️ 직원 수정" : "➕ 직원 추가"}</h2>
            <div
              style={{
                marginTop: 16,
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: 16,
              }}
            >
              <div>
                <label>성명 *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label>장애유형 *</label>
                <input
                  type="text"
                  value={form.disabilityType}
                  onChange={(e) =>
                    setForm({ ...form, disabilityType: e.target.value })
                  }
                  placeholder="지체, 시각, 청각 등"
                  required
                />
              </div>
              <div>
                <label>장애등급</label>
                <input
                  type="text"
                  value={form.disabilityGrade}
                  onChange={(e) =>
                    setForm({ ...form, disabilityGrade: e.target.value })
                  }
                  placeholder="1급, 2급 등"
                />
              </div>
              <div>
                <label>중증여부 *</label>
                <select
                  value={form.severity}
                  onChange={(e) =>
                    setForm({ ...form, severity: e.target.value as any })
                  }
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
                    setForm({ ...form, gender: e.target.value as any })
                  }
                >
                  <option value="M">남성</option>
                  <option value="F">여성</option>
                </select>
              </div>
              <div>
                <label>입사일 *</label>
                <input
                  type="date"
                  value={form.hireDate}
                  onChange={(e) =>
                    setForm({ ...form, hireDate: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label>퇴사일 (선택)</label>
                <input
                  type="date"
                  value={form.resignDate}
                  onChange={(e) =>
                    setForm({ ...form, resignDate: e.target.value })
                  }
                />
              </div>
              <div>
                <label>월 임금 (원) *</label>
                <input
                  type="number"
                  value={form.monthlySalary}
                  onChange={(e) =>
                    setForm({ ...form, monthlySalary: Number(e.target.value) })
                  }
                  required
                />
              </div>
              <div>
                <label>주당 근무시간</label>
                <input
                  type="number"
                  value={form.workHoursPerWeek}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      workHoursPerWeek: Number(e.target.value),
                    })
                  }
                />
              </div>
              <div>
                <label>고용보험 가입 *</label>
                <select
                  value={form.hasEmploymentInsurance ? "Y" : "N"}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      hasEmploymentInsurance: e.target.value === "Y",
                    })
                  }
                >
                  <option value="Y">가입</option>
                  <option value="N">미가입</option>
                </select>
              </div>
              <div>
                <label>최저임금 이상 *</label>
                <select
                  value={form.meetsMinimumWage ? "Y" : "N"}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      meetsMinimumWage: e.target.value === "Y",
                    })
                  }
                >
                  <option value="Y">이상</option>
                  <option value="N">미만</option>
                </select>
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label>메모</label>
                <textarea
                  value={form.memo}
                  onChange={(e) => setForm({ ...form, memo: e.target.value })}
                  rows={3}
                  style={{ width: "100%", resize: "vertical" }}
                />
              </div>
            </div>
            <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
              <button type="submit" style={{ flex: 1, background: "#0070f3" }}>
                {editingId ? "✏️ 수정 완료" : "➕ 등록"}
              </button>
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setShowForm(false);
                }}
                style={{ flex: 1, background: "#6b7280" }}
              >
                취소
              </button>
            </div>
          </form>
        )}

        {/* 안내 메시지 */}
        <div
          style={{
            marginTop: 24,
            padding: 16,
            background: "#dbeafe",
            borderRadius: 6,
          }}
        >
          <p style={{ margin: 0, fontSize: 14 }}>
            💡 <strong>한 번만 등록하세요!</strong> 등록된 직원 정보는 부담금
            계산기, 장려금 계산기, 감면 계산기에서 자동으로 활용됩니다.
          </p>
        </div>

        {/* 탭 */}
        <div style={{ marginTop: 24, display: "flex", gap: 8 }}>
          <button
            onClick={() => setTab("active")}
            style={{
              flex: 1,
              background: tab === "active" ? "#0070f3" : "#e5e7eb",
              color: tab === "active" ? "white" : "#374151",
            }}
          >
            재직 중 ({activeEmployees.length}명)
          </button>
          <button
            onClick={() => setTab("resigned")}
            style={{
              flex: 1,
              background: tab === "resigned" ? "#0070f3" : "#e5e7eb",
              color: tab === "resigned" ? "white" : "#374151",
            }}
          >
            퇴사 ({resignedEmployees.length}명)
          </button>
        </div>

        {/* 직원 목록 */}
        <div style={{ marginTop: 16 }}>
          {tab === "active" && activeEmployees.length === 0 && (
            <p style={{ textAlign: "center", color: "#666", padding: 40 }}>
              등록된 직원이 없습니다.
            </p>
          )}
          {tab === "resigned" && resignedEmployees.length === 0 && (
            <p style={{ textAlign: "center", color: "#666", padding: 40 }}>
              퇴사한 직원이 없습니다.
            </p>
          )}

          {(tab === "active" ? activeEmployees : resignedEmployees).map(
            (emp) => (
              <div
                key={emp.id}
                style={{
                  marginBottom: 12,
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
                    alignItems: "start",
                  }}
                >
                  <div>
                    <h3 style={{ margin: 0, fontSize: 18 }}>
                      {emp.name}{" "}
                      <span style={{ fontSize: 14, color: "#666" }}>
                        ({emp.severity === "MILD" ? "경증" : "중증"} /{" "}
                        {emp.gender === "M" ? "남" : "여"})
                      </span>
                    </h3>
                    <p style={{ margin: "8px 0 0 0", fontSize: 14, color: "#666" }}>
                      {emp.disabilityType}
                      {emp.disabilityGrade && ` ${emp.disabilityGrade}`}
                    </p>
                    <p style={{ margin: "4px 0 0 0", fontSize: 14, color: "#666" }}>
                      입사: {emp.hireDate.split("T")[0]}
                      {emp.resignDate &&
                        ` → 퇴사: ${emp.resignDate.split("T")[0]}`}
                    </p>
                    <p style={{ margin: "4px 0 0 0", fontSize: 14, color: "#666" }}>
                      월급: {emp.monthlySalary.toLocaleString()}원 | 주{" "}
                      {emp.workHoursPerWeek || 40}시간
                    </p>
                    <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
                      <span
                        style={{
                          padding: "2px 8px",
                          background: emp.hasEmploymentInsurance
                            ? "#d1fae5"
                            : "#fee2e2",
                          color: emp.hasEmploymentInsurance
                            ? "#065f46"
                            : "#991b1b",
                          borderRadius: 4,
                          fontSize: 12,
                        }}
                      >
                        {emp.hasEmploymentInsurance
                          ? "고용보험 ✓"
                          : "고용보험 ✗"}
                      </span>
                      <span
                        style={{
                          padding: "2px 8px",
                          background: emp.meetsMinimumWage
                            ? "#d1fae5"
                            : "#fee2e2",
                          color: emp.meetsMinimumWage ? "#065f46" : "#991b1b",
                          borderRadius: 4,
                          fontSize: 12,
                        }}
                      >
                        {emp.meetsMinimumWage
                          ? "최저임금 ✓"
                          : "최저임금 ✗"}
                      </span>
                    </div>
                    {emp.memo && (
                      <p
                        style={{
                          margin: "8px 0 0 0",
                          fontSize: 13,
                          color: "#666",
                          fontStyle: "italic",
                        }}
                      >
                        📝 {emp.memo}
                      </p>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      onClick={() => handleEdit(emp)}
                      style={{
                        background: "#3b82f6",
                        padding: "8px 16px",
                        fontSize: 14,
                      }}
                    >
                      수정
                    </button>
                    <button
                      onClick={() => handleDelete(emp.id)}
                      style={{
                        background: "#ef4444",
                        padding: "8px 16px",
                        fontSize: 14,
                      }}
                    >
                      삭제
                    </button>
                  </div>
                </div>
              </div>
            )
          )}
        </div>

        {/* 하단 링크 */}
        <div
          style={{
            marginTop: 32,
            padding: 20,
            background: "#f9fafb",
            borderRadius: 8,
          }}
        >
          <h3 style={{ margin: 0, fontSize: 16 }}>
            ✅ 직원 등록 완료 후 이용 가능한 계산기
          </h3>
          <div
            style={{
              marginTop: 16,
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: 12,
            }}
          >
            <a href="/calculators/levy-annual" style={{ textDecoration: "none" }}>
              <button style={{ width: "100%", background: "#0070f3" }}>
                💰 부담금 계산기
              </button>
            </a>
            <a
              href="/calculators/incentive-annual"
              style={{ textDecoration: "none" }}
            >
              <button style={{ width: "100%", background: "#10b981" }}>
                💸 장려금 계산기
              </button>
            </a>
            <a href="/calculators/linkage" style={{ textDecoration: "none" }}>
              <button style={{ width: "100%", background: "#f59e0b" }}>
                📉 감면 계산기
              </button>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
