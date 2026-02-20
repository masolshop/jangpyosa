"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { API_BASE } from "@/lib/api";
import { getToken, getUserRole } from "@/lib/auth";

// ============================================
// 타입 정의
// ============================================

type TodayStatus = {
  today: string;
  record: {
    id: string;
    workType: "OFFICE" | "REMOTE" | "HYBRID";
    clockIn: string;
    clockOut: string | null;
    workHours: number | null;
    note: string | null;
  } | null;
  status: "NOT_CLOCKED_IN" | "WORKING" | "CLOCKED_OUT";
};

// ============================================
// 메인 컴포넌트
// ============================================

export default function EmployeeAttendancePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [todayStatus, setTodayStatus] = useState<TodayStatus | null>(null);
  const [selectedWorkType, setSelectedWorkType] = useState<"OFFICE" | "REMOTE" | "HYBRID">("OFFICE");

  const [userName, setUserName] = useState<string>("");
  const [companyName, setCompanyName] = useState<string>("");

  // ============================================
  // 초기 로드
  // ============================================

  useEffect(() => {
    const role = getUserRole();
    if (role !== "EMPLOYEE") {
      router.push("/");
      return;
    }

    // 사용자 정보 로드
    if (typeof window !== "undefined") {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          setUserName(user.name || "");
          setCompanyName(user.companyName || "");
        } catch (e) {
          console.error("사용자 정보 파싱 실패:", e);
        }
      }
    }

    fetchTodayStatus();
  }, []);

  // ============================================
  // API 호출
  // ============================================

  async function fetchTodayStatus() {
    setLoading(true);
    setError("");

    const token = getToken();
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/attendance/today`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("오늘 상태 조회 실패");

      const json = await res.json();
      setTodayStatus(json);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleClockIn() {
    const token = getToken();
    if (!token) return;

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await fetch(`${API_BASE}/attendance/clock-in`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          workType: selectedWorkType,
        }),
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.message || json.error || "출근 처리 실패");
      }

      setMessage("✅ 출근 처리되었습니다!");
      setTimeout(() => setMessage(""), 3000);
      await fetchTodayStatus();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleClockOut() {
    if (!confirm("퇴근 처리하시겠습니까?")) return;

    const token = getToken();
    if (!token) return;

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await fetch(`${API_BASE}/attendance/clock-out`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.message || json.error || "퇴근 처리 실패");
      }

      const json = await res.json();
      setMessage(`✅ 퇴근 처리되었습니다! (${json.workHours}시간 근무)`);
      setTimeout(() => setMessage(""), 3000);
      await fetchTodayStatus();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  // ============================================
  // 렌더링
  // ============================================

  if (loading && !todayStatus) {
    return (
      <div className="container">
        <div className="card">
          <p>로딩 중...</p>
        </div>
      </div>
    );
  }

  const currentTime = new Date().toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  return (
    <div className="container">
      <div className="card" style={{ maxWidth: "600px", margin: "20px auto" }}>
        <h1 style={{ textAlign: "center", marginBottom: 8 }}>⏰ 출퇴근 관리</h1>
        
        {companyName && (
          <div style={{
            textAlign: "center",
            fontSize: 18,
            color: "#666",
            marginBottom: 24,
          }}>
            🏢 {companyName} | {userName}
          </div>
        )}

        {/* 현재 시각 */}
        <div style={{
          padding: "24px",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          borderRadius: 12,
          textAlign: "center",
          marginBottom: 24,
          boxShadow: "0 4px 12px rgba(102, 126, 234, 0.3)",
        }}>
          <div style={{ fontSize: 14, color: "rgba(255, 255, 255, 0.9)", marginBottom: 8 }}>
            현재 시각
          </div>
          <div style={{ fontSize: 48, fontWeight: "bold", color: "white", fontFamily: "monospace" }}>
            {currentTime}
          </div>
          <div style={{ fontSize: 16, color: "rgba(255, 255, 255, 0.9)", marginTop: 8 }}>
            {new Date().toLocaleDateString("ko-KR", { 
              year: "numeric", 
              month: "long", 
              day: "numeric",
              weekday: "long",
            })}
          </div>
        </div>

        {/* 메시지 */}
        {message && (
          <div
            style={{
              marginBottom: 16,
              padding: 16,
              background: "#d1fae5",
              color: "#065f46",
              borderRadius: 8,
              fontWeight: "bold",
              textAlign: "center",
            }}
          >
            {message}
          </div>
        )}

        {error && (
          <div
            style={{
              marginBottom: 16,
              padding: 16,
              background: "#fee2e2",
              color: "#991b1b",
              borderRadius: 8,
              fontWeight: "bold",
              textAlign: "center",
            }}
          >
            ❌ {error}
          </div>
        )}

        {/* 오늘 상태 */}
        {todayStatus && (
          <div style={{
            padding: 24,
            background: "#f9fafb",
            borderRadius: 12,
            marginBottom: 24,
          }}>
            <h3 style={{ margin: 0, marginBottom: 16, textAlign: "center" }}>
              📅 오늘 근무 상태
            </h3>

            {todayStatus.status === "NOT_CLOCKED_IN" && (
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>🌅</div>
                <p style={{ fontSize: 18, color: "#666", margin: 0 }}>
                  아직 출근하지 않았습니다.
                </p>
              </div>
            )}

            {todayStatus.status === "WORKING" && todayStatus.record && (
              <div>
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 16,
                  padding: 16,
                  background: "white",
                  borderRadius: 8,
                }}>
                  <div>
                    <div style={{ fontSize: 14, color: "#999", marginBottom: 4 }}>근무형태</div>
                    <div style={{ fontSize: 18, fontWeight: "bold" }}>
                      {todayStatus.record.workType === "OFFICE" ? "🏢 회사 근무" : 
                       todayStatus.record.workType === "REMOTE" ? "🏠 재택 근무" : 
                       "🔄 하이브리드"}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 14, color: "#999", marginBottom: 4 }}>출근시간</div>
                    <div style={{ fontSize: 18, fontWeight: "bold", fontFamily: "monospace" }}>
                      {todayStatus.record.clockIn}
                    </div>
                  </div>
                </div>
                <div style={{
                  padding: 16,
                  background: "#10b981",
                  color: "white",
                  borderRadius: 8,
                  textAlign: "center",
                  fontSize: 20,
                  fontWeight: "bold",
                }}>
                  💼 근무 중
                </div>
              </div>
            )}

            {todayStatus.status === "CLOCKED_OUT" && todayStatus.record && (
              <div>
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 16,
                  marginBottom: 16,
                }}>
                  <div style={{
                    padding: 16,
                    background: "white",
                    borderRadius: 8,
                    textAlign: "center",
                  }}>
                    <div style={{ fontSize: 14, color: "#999", marginBottom: 4 }}>출근시간</div>
                    <div style={{ fontSize: 20, fontWeight: "bold", fontFamily: "monospace" }}>
                      {todayStatus.record.clockIn}
                    </div>
                  </div>
                  <div style={{
                    padding: 16,
                    background: "white",
                    borderRadius: 8,
                    textAlign: "center",
                  }}>
                    <div style={{ fontSize: 14, color: "#999", marginBottom: 4 }}>퇴근시간</div>
                    <div style={{ fontSize: 20, fontWeight: "bold", fontFamily: "monospace" }}>
                      {todayStatus.record.clockOut}
                    </div>
                  </div>
                </div>
                <div style={{
                  padding: 20,
                  background: "#3b82f6",
                  color: "white",
                  borderRadius: 8,
                  textAlign: "center",
                }}>
                  <div style={{ fontSize: 16, marginBottom: 8 }}>총 근무시간</div>
                  <div style={{ fontSize: 36, fontWeight: "bold" }}>
                    {todayStatus.record.workHours}시간
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 출퇴근 버튼 */}
        {todayStatus && todayStatus.status === "NOT_CLOCKED_IN" && (
          <div>
            <h3 style={{ marginBottom: 16 }}>🚪 출근하기</h3>
            
            {/* 근무형태 선택 */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: "block", marginBottom: 8, fontWeight: "600" }}>
                근무형태 선택
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                <button
                  onClick={() => setSelectedWorkType("OFFICE")}
                  style={{
                    padding: "20px",
                    background: selectedWorkType === "OFFICE" ? "#3b82f6" : "white",
                    color: selectedWorkType === "OFFICE" ? "white" : "#666",
                    border: selectedWorkType === "OFFICE" ? "2px solid #3b82f6" : "2px solid #e5e7eb",
                    borderRadius: 12,
                    fontSize: 16,
                    fontWeight: "bold",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                >
                  🏢<br />회사 근무
                </button>
                <button
                  onClick={() => setSelectedWorkType("REMOTE")}
                  style={{
                    padding: "20px",
                    background: selectedWorkType === "REMOTE" ? "#f59e0b" : "white",
                    color: selectedWorkType === "REMOTE" ? "white" : "#666",
                    border: selectedWorkType === "REMOTE" ? "2px solid #f59e0b" : "2px solid #e5e7eb",
                    borderRadius: 12,
                    fontSize: 16,
                    fontWeight: "bold",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                >
                  🏠<br />재택 근무
                </button>
                <button
                  onClick={() => setSelectedWorkType("HYBRID")}
                  style={{
                    padding: "20px",
                    background: selectedWorkType === "HYBRID" ? "#8b5cf6" : "white",
                    color: selectedWorkType === "HYBRID" ? "white" : "#666",
                    border: selectedWorkType === "HYBRID" ? "2px solid #8b5cf6" : "2px solid #e5e7eb",
                    borderRadius: 12,
                    fontSize: 16,
                    fontWeight: "bold",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                >
                  🔄<br />하이브리드
                </button>
              </div>
            </div>

            <button
              onClick={handleClockIn}
              disabled={loading}
              style={{
                width: "100%",
                padding: "20px",
                background: loading ? "#ccc" : "#10b981",
                color: "white",
                border: "none",
                borderRadius: 12,
                fontSize: 20,
                fontWeight: "bold",
                cursor: loading ? "not-allowed" : "pointer",
                boxShadow: "0 4px 12px rgba(16, 185, 129, 0.3)",
              }}
            >
              {loading ? "처리 중..." : "✅ 출근하기"}
            </button>
          </div>
        )}

        {todayStatus && todayStatus.status === "WORKING" && (
          <button
            onClick={handleClockOut}
            disabled={loading}
            style={{
              width: "100%",
              padding: "20px",
              background: loading ? "#ccc" : "#ef4444",
              color: "white",
              border: "none",
              borderRadius: 12,
              fontSize: 20,
              fontWeight: "bold",
              cursor: loading ? "not-allowed" : "pointer",
              boxShadow: "0 4px 12px rgba(239, 68, 68, 0.3)",
            }}
          >
            {loading ? "처리 중..." : "🚪 퇴근하기"}
          </button>
        )}

        {todayStatus && todayStatus.status === "CLOCKED_OUT" && (
          <div style={{
            padding: 20,
            background: "#f3f4f6",
            borderRadius: 12,
            textAlign: "center",
          }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🌙</div>
            <p style={{ fontSize: 18, color: "#666", margin: 0 }}>
              오늘 업무가 종료되었습니다.<br />
              고생하셨습니다!
            </p>
          </div>
        )}

        {/* 안내 */}
        <div
          style={{
            marginTop: 24,
            padding: 16,
            background: "#eff6ff",
            borderRadius: 8,
            border: "1px solid #bfdbfe",
          }}
        >
          <h4 style={{ margin: 0, color: "#1e40af", fontSize: 14 }}>
            💡 사용 안내
          </h4>
          <ul style={{ marginTop: 8, paddingLeft: 20, color: "#1e3a8a", fontSize: 13, lineHeight: 1.6 }}>
            <li>출근 시 근무형태(회사/재택)를 선택하세요.</li>
            <li>출근 버튼을 누르면 현재 시각이 기록됩니다.</li>
            <li>퇴근 버튼을 누르면 자동으로 근무시간이 계산됩니다.</li>
            <li>하루에 한 번만 출퇴근 기록이 가능합니다.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
