"use client";

import { useState, useEffect } from "react";
import { API_BASE } from "@/lib/api";
import { getToken } from "@/lib/auth";

interface AttendanceRecord {
  id: string;
  date: string;
  workType: string;
  clockIn: string | null;
  clockOut: string | null;
  workHours: number | null;
  location: string | null;
  note: string | null;
}

interface EmployeeInfo {
  name: string;
  companyName: string;
  phone: string;
}

export default function EmployeeAttendancePage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [workType, setWorkType] = useState<"OFFICE" | "REMOTE">("OFFICE");
  const [location, setLocation] = useState("");
  const [note, setNote] = useState("");
  const [todayRecord, setTodayRecord] = useState<AttendanceRecord | null>(null);
  const [recentRecords, setRecentRecords] = useState<AttendanceRecord[]>([]);
  const [employeeInfo, setEmployeeInfo] = useState<EmployeeInfo | null>(null);

  useEffect(() => {
    loadEmployeeInfo();
    loadTodayRecord();
    loadRecentRecords();
  }, []);

  async function loadEmployeeInfo() {
    try {
      const token = getToken();
      if (!token) return;

      // localStorage에서 기본 사용자 정보 가져오기
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);
        
        // /attendance/today API에서 회사명까지 함께 받아옴
        const todayRes = await fetch(`${API_BASE}/attendance/today`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (todayRes.ok) {
          const todayData = await todayRes.json();
          
          if (todayData.employee) {
            setEmployeeInfo({
              name: todayData.employee.name,
              companyName: todayData.employee.companyName,
              phone: user.phone || "",
            });
            
            // 오늘 출퇴근 기록도 함께 설정
            setTodayRecord(todayData.record);
            return;
          }
        }
        
        // API 호출 실패 시 기본값
        setEmployeeInfo({
          name: user.name || "직원",
          companyName: "회사명 불명",
          phone: user.phone || "",
        });
      }
    } catch (e) {
      console.error("직원 정보 로딩 실패:", e);
    }
  }

  async function loadTodayRecord() {
    // loadEmployeeInfo에서 이미 처리하므로 빈 함수로 유지
    // (useEffect에서 호출하지만 실제 로딩은 loadEmployeeInfo에서 처리)
  }

  async function loadRecentRecords() {
    try {
      const token = getToken();
      if (!token) return;

      const res = await fetch(`${API_BASE}/attendance/my-records?limit=7`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        // API는 { records: [], stats: {} } 형태로 반환
        setRecentRecords(data.records || []);
      }
    } catch (e) {
      console.error("최근 출퇴근 기록 로딩 실패:", e);
    }
  }

  async function handleClockIn() {
    setMessage("");
    setError("");
    setLoading(true);

    try {
      const token = getToken();
      if (!token) {
        throw new Error("로그인이 필요합니다.");
      }

      const res = await fetch(`${API_BASE}/attendance/clock-in`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          workType,
          location,
          note,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || data.error || "출근 체크 실패");
      }

      setMessage(`✅ ${data.message}`);
      setNote("");
      setLocation("");
      await loadTodayRecord();
      await loadRecentRecords();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleClockOut() {
    setMessage("");
    setError("");
    setLoading(true);

    try {
      const token = getToken();
      if (!token) {
        throw new Error("로그인이 필요합니다.");
      }

      const res = await fetch(`${API_BASE}/attendance/clock-out`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          location,
          note,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || data.error || "퇴근 체크 실패");
      }

      setMessage(`✅ ${data.message}`);
      setNote("");
      setLocation("");
      await loadTodayRecord();
      await loadRecentRecords();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  // 현재 시각
  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "long",
    });
  };

  return (
    <div className="container" style={{ maxWidth: 800, margin: "40px auto" }}>
      {/* 헤더 */}
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <h1 style={{ fontSize: 32, marginBottom: 8 }}>⏰ 출퇴근 관리</h1>
        {employeeInfo && (
          <p style={{ fontSize: 18, color: "#666", marginTop: 8 }}>
            <strong>{employeeInfo.companyName}</strong> / {employeeInfo.name}
          </p>
        )}
      </div>

      {/* 현재 시각 */}
      <div
        className="card"
        style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          textAlign: "center",
          padding: "40px 20px",
          marginBottom: 30,
        }}
      >
        <div style={{ fontSize: 48, fontWeight: "bold", marginBottom: 8 }}>
          {formatTime(currentTime)}
        </div>
        <div style={{ fontSize: 18, opacity: 0.9 }}>{formatDate(currentTime)}</div>
      </div>

      {/* 오늘의 출퇴근 현황 */}
      {todayRecord && (
        <div
          className="card"
          style={{
            background: "#f0f9ff",
            border: "2px solid #0ea5e9",
            marginBottom: 30,
          }}
        >
          <h3 style={{ marginTop: 0, color: "#0284c7" }}>📅 오늘의 근태 현황</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <div style={{ fontSize: 14, color: "#666", marginBottom: 4 }}>출근 시간</div>
              <div style={{ fontSize: 20, fontWeight: "bold", color: "#0284c7" }}>
                {todayRecord.clockIn || "-"}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 14, color: "#666", marginBottom: 4 }}>퇴근 시간</div>
              <div style={{ fontSize: 20, fontWeight: "bold", color: "#0284c7" }}>
                {todayRecord.clockOut || "-"}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 14, color: "#666", marginBottom: 4 }}>근무 형태</div>
              <div style={{ fontSize: 16 }}>
                {todayRecord.workType === "OFFICE" ? "🏢 사무실 근무" : "🏠 재택 근무"}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 14, color: "#666", marginBottom: 4 }}>근무 시간</div>
              <div style={{ fontSize: 16 }}>
                {todayRecord.workHours ? `${todayRecord.workHours}시간` : "-"}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 메시지 */}
      {message && (
        <div
          style={{
            padding: 16,
            background: "#d1fae5",
            color: "#065f46",
            borderRadius: 8,
            marginBottom: 24,
            fontWeight: "bold",
          }}
        >
          {message}
        </div>
      )}

      {error && (
        <div
          style={{
            padding: 16,
            background: "#fee2e2",
            color: "#991b1b",
            borderRadius: 8,
            marginBottom: 24,
            fontWeight: "bold",
          }}
        >
          ❌ {error}
        </div>
      )}

      {/* 출퇴근 체크 */}
      <div className="card" style={{ marginBottom: 30 }}>
        <h3 style={{ marginTop: 0 }}>📍 근무 형태 선택</h3>
        <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
          <button
            onClick={() => setWorkType("OFFICE")}
            style={{
              flex: 1,
              padding: "16px 20px",
              background: workType === "OFFICE" ? "#3b82f6" : "#e5e7eb",
              color: workType === "OFFICE" ? "white" : "#6b7280",
              border: "none",
              borderRadius: 8,
              fontSize: 16,
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            🏢 사무실 근무
          </button>
          <button
            onClick={() => setWorkType("REMOTE")}
            style={{
              flex: 1,
              padding: "16px 20px",
              background: workType === "REMOTE" ? "#3b82f6" : "#e5e7eb",
              color: workType === "REMOTE" ? "white" : "#6b7280",
              border: "none",
              borderRadius: 8,
              fontSize: 16,
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            🏠 재택 근무
          </button>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", marginBottom: 8, fontWeight: "600" }}>
            위치 (선택)
          </label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="예: 서울시 강남구 테헤란로 123"
          />
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ display: "block", marginBottom: 8, fontWeight: "600" }}>
            메모 (선택)
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="특이사항이 있으면 입력하세요"
            rows={3}
          />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <button
            onClick={handleClockIn}
            disabled={loading || !!todayRecord?.clockIn}
            style={{
              padding: "16px 20px",
              background: todayRecord?.clockIn ? "#9ca3af" : "#10b981",
              color: "white",
              border: "none",
              borderRadius: 8,
              fontSize: 18,
              fontWeight: "bold",
              cursor: todayRecord?.clockIn ? "not-allowed" : "pointer",
            }}
          >
            {todayRecord?.clockIn ? "✅ 출근 완료" : "🚪 출근 체크"}
          </button>

          <button
            onClick={handleClockOut}
            disabled={loading || !todayRecord?.clockIn || !!todayRecord?.clockOut}
            style={{
              padding: "16px 20px",
              background:
                !todayRecord?.clockIn || todayRecord?.clockOut ? "#9ca3af" : "#ef4444",
              color: "white",
              border: "none",
              borderRadius: 8,
              fontSize: 18,
              fontWeight: "bold",
              cursor:
                !todayRecord?.clockIn || todayRecord?.clockOut ? "not-allowed" : "pointer",
            }}
          >
            {todayRecord?.clockOut ? "✅ 퇴근 완료" : "👋 퇴근 체크"}
          </button>
        </div>
      </div>

      {/* 최근 7일 출퇴근 기록 */}
      <div className="card">
        <h3 style={{ marginTop: 0 }}>📊 최근 출퇴근 기록</h3>
        {recentRecords.length === 0 ? (
          <p style={{ textAlign: "center", color: "#999", padding: "40px 0" }}>
            아직 출퇴근 기록이 없습니다.
          </p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f3f4f6" }}>
                  <th style={{ padding: 12, textAlign: "left", fontWeight: 600 }}>날짜</th>
                  <th style={{ padding: 12, textAlign: "left", fontWeight: 600 }}>출근</th>
                  <th style={{ padding: 12, textAlign: "left", fontWeight: 600 }}>퇴근</th>
                  <th style={{ padding: 12, textAlign: "left", fontWeight: 600 }}>
                    근무시간
                  </th>
                  <th style={{ padding: 12, textAlign: "left", fontWeight: 600 }}>형태</th>
                </tr>
              </thead>
              <tbody>
                {recentRecords.map((record) => (
                  <tr key={record.id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                    <td style={{ padding: 12 }}>{record.date}</td>
                    <td style={{ padding: 12 }}>{record.clockIn || "-"}</td>
                    <td style={{ padding: 12 }}>{record.clockOut || "-"}</td>
                    <td style={{ padding: 12 }}>
                      {record.workHours ? `${record.workHours}h` : "-"}
                    </td>
                    <td style={{ padding: 12 }}>
                      {record.workType === "OFFICE" ? "🏢" : "🏠"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
