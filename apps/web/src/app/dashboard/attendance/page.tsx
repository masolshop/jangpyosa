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
  workType: string;
  disabilityType: string;
  severity: string;
};

type AttendanceRecord = {
  id: string;
  employeeId: string;
  date: string;
  workType: "OFFICE" | "REMOTE";
  clockIn: string | null;
  clockOut: string | null;
  workHours: number | null;
  location: string | null;
  note: string | null;
  employee?: Employee;
};

type EmployeeStats = {
  employee: Employee;
  stats: {
    totalDays: number;
    officeDays: number;
    remoteDays: number;
    totalHours: number;
  };
};

// ============================================
// 메인 컴포넌트
// ============================================

export default function AttendancePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [companyName, setCompanyName] = useState<string>("");
  const [employeeStats, setEmployeeStats] = useState<EmployeeStats[]>([]);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);

  // 필터
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [viewMode, setViewMode] = useState<"month" | "today">("month");

  // ============================================
  // 초기 로드
  // ============================================

  useEffect(() => {
    const role = getUserRole();
    if (role !== "BUYER" && role !== "SUPER_ADMIN") {
      router.push("/");
      return;
    }

    fetchAttendance();
  }, [selectedYear, selectedMonth, viewMode]);

  // ============================================
  // API 호출
  // ============================================

  async function fetchAttendance() {
    setLoading(true);
    setError("");

    const token = getToken();
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      let url = `${API_BASE}/attendance/company`;
      
      if (viewMode === "today") {
        const today = new Date().toISOString().split("T")[0];
        url += `?date=${today}`;
      } else {
        url += `?year=${selectedYear}&month=${selectedMonth}`;
      }

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("출퇴근 현황 조회 실패");

      const json = await res.json();
      setEmployeeStats(json.employees || []);
      setRecords(json.records || []);
      setCompanyName(json.companyName || "");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
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

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="container">
      <div className="card" style={{ maxWidth: "100%", margin: "20px auto" }}>
        <h1>⏰ 장애인직원 근태관리</h1>

        {/* 기업명 표시 */}
        {companyName && (
          <div style={{
            marginTop: 16,
            padding: "16px 24px",
            background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
            borderRadius: 12,
            textAlign: "center",
            boxShadow: "0 4px 12px rgba(16, 185, 129, 0.3)",
          }}>
            <div style={{
              fontSize: 14,
              color: "rgba(255, 255, 255, 0.9)",
              marginBottom: 4,
              fontWeight: 500,
            }}>
              관리 기업
            </div>
            <div style={{
              fontSize: 24,
              fontWeight: 700,
              color: "white",
              letterSpacing: "-0.5px",
            }}>
              🏢 {companyName}
            </div>
          </div>
        )}

        <p style={{ color: "#666", marginTop: 16 }}>
          장애인 직원의 출퇴근 기록을 조회하고 관리합니다.
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

        {/* 필터 */}
        <div style={{ 
          marginTop: 24, 
          display: "flex", 
          gap: 16, 
          alignItems: "center",
          flexWrap: "wrap",
        }}>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => setViewMode("today")}
              style={{
                padding: "10px 20px",
                background: viewMode === "today" ? "#10b981" : "#e5e7eb",
                color: viewMode === "today" ? "white" : "#666",
                border: "none",
                borderRadius: 6,
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              📅 오늘
            </button>
            <button
              onClick={() => setViewMode("month")}
              style={{
                padding: "10px 20px",
                background: viewMode === "month" ? "#10b981" : "#e5e7eb",
                color: viewMode === "month" ? "white" : "#666",
                border: "none",
                borderRadius: 6,
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              📊 월별
            </button>
          </div>

          {viewMode === "month" && (
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                style={{
                  padding: "10px 16px",
                  borderRadius: 6,
                  border: "1px solid #ddd",
                  fontSize: 14,
                }}
              >
                {[2024, 2025, 2026, 2027].map(y => (
                  <option key={y} value={y}>{y}년</option>
                ))}
              </select>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                style={{
                  padding: "10px 16px",
                  borderRadius: 6,
                  border: "1px solid #ddd",
                  fontSize: 14,
                }}
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                  <option key={m} value={m}>{m}월</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* 직원별 통계 */}
        <div style={{ marginTop: 32 }}>
          <h2>직원별 근무 현황</h2>
          {employeeStats.length === 0 ? (
            <div style={{
              textAlign: "center",
              padding: 60,
              background: "#f9fafb",
              borderRadius: 8,
              border: "2px dashed #d1d5db"
            }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>📊</div>
              <p style={{ color: "#999", margin: 0, fontSize: 16 }}>
                출퇴근 기록이 없습니다.
              </p>
            </div>
          ) : (
            <div style={{ display: "grid", gap: 16 }}>
              {employeeStats.map((empStat) => (
                <div
                  key={empStat.employee.id}
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
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ margin: 0, fontSize: 20, display: "flex", alignItems: "center", gap: 8 }}>
                        {empStat.employee.name}
                        <span
                          style={{
                            padding: "3px 10px",
                            fontSize: 13,
                            background: empStat.employee.workType === "OFFICE" ? "#dbeafe" : "#fef3c7",
                            color: empStat.employee.workType === "OFFICE" ? "#1e3a8a" : "#92400e",
                            borderRadius: 4,
                            fontWeight: "normal",
                          }}
                        >
                          {empStat.employee.workType === "OFFICE" ? "🏢 회사 근무" : 
                           empStat.employee.workType === "REMOTE" ? "🏠 재택 근무" : 
                           "🔄 하이브리드"}
                        </span>
                      </h3>
                      <p style={{ margin: "10px 0 0 0", fontSize: 15, color: "#666" }}>
                        🏷️ {empStat.employee.disabilityType} | {empStat.employee.severity === "SEVERE" ? "중증" : "경증"}
                      </p>
                    </div>
                    <div style={{ 
                      display: "grid", 
                      gridTemplateColumns: "repeat(4, 1fr)", 
                      gap: 20,
                      minWidth: 500,
                    }}>
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 28, fontWeight: "bold", color: "#10b981" }}>
                          {empStat.stats.totalDays}
                        </div>
                        <div style={{ fontSize: 13, color: "#999", marginTop: 4 }}>총 근무일</div>
                      </div>
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 28, fontWeight: "bold", color: "#3b82f6" }}>
                          {empStat.stats.officeDays}
                        </div>
                        <div style={{ fontSize: 13, color: "#999", marginTop: 4 }}>회사 출근</div>
                      </div>
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 28, fontWeight: "bold", color: "#f59e0b" }}>
                          {empStat.stats.remoteDays}
                        </div>
                        <div style={{ fontSize: 13, color: "#999", marginTop: 4 }}>재택 근무</div>
                      </div>
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 28, fontWeight: "bold", color: "#8b5cf6" }}>
                          {empStat.stats.totalHours}h
                        </div>
                        <div style={{ fontSize: 13, color: "#999", marginTop: 4 }}>총 근무시간</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 상세 근태 기록 */}
        <div style={{ marginTop: 32 }}>
          <h2>상세 근태 기록</h2>
          {records.length === 0 ? (
            <div style={{
              textAlign: "center",
              padding: 60,
              background: "#f9fafb",
              borderRadius: 8,
              border: "2px dashed #d1d5db"
            }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
              <p style={{ color: "#999", margin: 0, fontSize: 16 }}>
                기록이 없습니다.
              </p>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{
                width: "100%",
                borderCollapse: "collapse",
                background: "white",
                borderRadius: 8,
                overflow: "hidden",
              }}>
                <thead>
                  <tr style={{ background: "#f9fafb" }}>
                    <th style={{ padding: "12px 16px", textAlign: "left", borderBottom: "2px solid #e5e7eb" }}>날짜</th>
                    <th style={{ padding: "12px 16px", textAlign: "left", borderBottom: "2px solid #e5e7eb" }}>직원명</th>
                    <th style={{ padding: "12px 16px", textAlign: "center", borderBottom: "2px solid #e5e7eb" }}>근무형태</th>
                    <th style={{ padding: "12px 16px", textAlign: "center", borderBottom: "2px solid #e5e7eb" }}>출근시간</th>
                    <th style={{ padding: "12px 16px", textAlign: "center", borderBottom: "2px solid #e5e7eb" }}>퇴근시간</th>
                    <th style={{ padding: "12px 16px", textAlign: "center", borderBottom: "2px solid #e5e7eb" }}>근무시간</th>
                    <th style={{ padding: "12px 16px", textAlign: "left", borderBottom: "2px solid #e5e7eb" }}>메모</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((record) => (
                    <tr key={record.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                      <td style={{ padding: "12px 16px" }}>
                        {record.date}
                        {record.date === today && (
                          <span style={{ 
                            marginLeft: 8, 
                            padding: "2px 8px", 
                            background: "#10b981", 
                            color: "white", 
                            borderRadius: 4, 
                            fontSize: 12 
                          }}>
                            오늘
                          </span>
                        )}
                      </td>
                      <td style={{ padding: "12px 16px", fontWeight: "600" }}>
                        {record.employee?.name || "N/A"}
                      </td>
                      <td style={{ padding: "12px 16px", textAlign: "center" }}>
                        <span style={{
                          padding: "4px 12px",
                          background: record.workType === "OFFICE" ? "#dbeafe" : "#fef3c7",
                          color: record.workType === "OFFICE" ? "#1e3a8a" : "#92400e",
                          borderRadius: 4,
                          fontSize: 13,
                        }}>
                          {record.workType === "OFFICE" ? "🏢 회사" : "🏠 재택"}
                        </span>
                      </td>
                      <td style={{ padding: "12px 16px", textAlign: "center", fontFamily: "monospace" }}>
                        {record.clockIn || "-"}
                      </td>
                      <td style={{ padding: "12px 16px", textAlign: "center", fontFamily: "monospace" }}>
                        {record.clockOut || (
                          <span style={{ color: "#10b981", fontWeight: "600" }}>근무 중</span>
                        )}
                      </td>
                      <td style={{ padding: "12px 16px", textAlign: "center", fontWeight: "600" }}>
                        {record.workHours ? `${record.workHours}h` : "-"}
                      </td>
                      <td style={{ padding: "12px 16px", fontSize: 13, color: "#666" }}>
                        {record.note || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
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
            💡 근태관리 안내
          </h4>
          <ul style={{ marginTop: 12, paddingLeft: 20, color: "#1e3a8a", fontSize: 14, lineHeight: 1.8 }}>
            <li>
              <strong>직원 계정 생성:</strong> 직원이 핸드폰 번호와 사업자등록번호로 회원가입하면 자동으로 매칭됩니다.
            </li>
            <li>
              <strong>출퇴근 기록:</strong> 직원 계정에서 출근/퇴근 버튼을 눌러 자동 기록됩니다.
            </li>
            <li>
              <strong>근무형태:</strong> 출근 시 회사 근무 또는 재택 근무를 선택할 수 있습니다.
            </li>
            <li>
              <strong>근무시간:</strong> 출근~퇴근 시간이 자동으로 계산되어 표시됩니다.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
