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

interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: string;
  createdAt: string;
  isRead: boolean;
  readAt: string | null;
}

export default function EmployeeAttendancePage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [workType, setWorkType] = useState<"OFFICE" | "REMOTE">("OFFICE");
  const [location, setLocation] = useState("");
  const [isLocationDetected, setIsLocationDetected] = useState(false);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [note, setNote] = useState("");
  const [todayRecord, setTodayRecord] = useState<AttendanceRecord | null>(null);
  const [recentRecords, setRecentRecords] = useState<AttendanceRecord[]>([]);
  const [employeeInfo, setEmployeeInfo] = useState<EmployeeInfo | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    setIsMounted(true);
    loadEmployeeInfo();
    loadTodayRecord();
    loadRecentRecords();
    loadAnnouncements();
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

  /**
   * 위치 자동 감지
   * 1순위: GPS (Geolocation API)
   * 2순위: IP 기반 위치 추정
   */
  async function detectLocation() {
    setIsDetectingLocation(true);
    setLocationError("");
    
    try {
      // 1순위: GPS (정확도 높음)
      if (navigator.geolocation) {
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: true,
              timeout: 5000,
              maximumAge: 0,
            });
          });

          const { latitude, longitude, accuracy } = position.coords;
          const detectedLocation = `GPS: ${latitude.toFixed(6)}, ${longitude.toFixed(6)} (정확도: ${Math.round(accuracy)}m)`;
          setLocation(detectedLocation);
          setIsLocationDetected(true);
          setIsDetectingLocation(false);
          return detectedLocation;
        } catch (gpsError) {
          console.warn("GPS 위치 가져오기 실패:", gpsError);
        }
      }

      // 2순위: IP 기반 위치 (GPS 실패 시)
      try {
        const ipRes = await fetch("https://ipapi.co/json/");
        if (ipRes.ok) {
          const ipData = await ipRes.json();
          const detectedLocation = `IP: ${ipData.city || "알 수 없음"}, ${ipData.country_name || ""} (${ipData.ip})`;
          setLocation(detectedLocation);
          setIsLocationDetected(true);
          setIsDetectingLocation(false);
          return detectedLocation;
        }
      } catch (ipError) {
        console.warn("IP 위치 가져오기 실패:", ipError);
      }

      // 3순위: 수동 입력 필요
      setLocationError("위치 감지 실패. 수동으로 입력해주세요.");
      setIsLocationDetected(false);
      setIsDetectingLocation(false);
      return location || "위치 정보 없음";
    } catch (error) {
      console.error("위치 감지 오류:", error);
      setLocationError("위치 감지 중 오류가 발생했습니다.");
      setIsLocationDetected(false);
      setIsDetectingLocation(false);
      return location || "위치 정보 없음";
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

      // 위치가 비어있으면 자동 감지 시도
      let finalLocation = location;
      if (!location) {
        finalLocation = await detectLocation();
      }
      const autoLocation = finalLocation;

      const res = await fetch(`${API_BASE}/attendance/clock-in`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          workType,
          location: autoLocation,
          note,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || data.error || "출근 체크 실패");
      }

      setMessage(`✅ ${data.message}`);
      setNote("");
      setLocation(autoLocation); // 감지된 위치 표시
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

      // 위치가 비어있으면 자동 감지 시도
      let finalLocation = location;
      if (!location) {
        finalLocation = await detectLocation();
      }
      const autoLocation = finalLocation;

      const res = await fetch(`${API_BASE}/attendance/clock-out`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          location: autoLocation,
          note,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || data.error || "퇴근 체크 실패");
      }

      setMessage(`✅ ${data.message}`);
      setNote("");
      setLocation(autoLocation); // 감지된 위치 표시
      await loadTodayRecord();
      await loadRecentRecords();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  /**
   * 출퇴근 데이터 엑셀 다운로드
   */
  async function downloadExcel() {
    try {
      const token = getToken();
      if (!token) {
        throw new Error("로그인이 필요합니다.");
      }

      setMessage("📥 엑셀 다운로드 중...");

      const res = await fetch(`${API_BASE}/attendance/my-records`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("데이터 조회 실패");
      }

      const data = await res.json();
      const records = data.records || [];

      if (records.length === 0) {
        setError("다운로드할 출퇴근 기록이 없습니다.");
        return;
      }

      // CSV 생성 (엑셀에서 열 수 있음)
      const headers = ["날짜", "출근시간", "퇴근시간", "근무시간", "근무형태", "위치", "메모"];
      const csvRows = [
        headers.join(","),
        ...records.map((record: AttendanceRecord) => {
          const workTypeLabel = record.workType === "OFFICE" ? "사무실" : "재택";
          return [
            record.date,
            record.clockIn || "-",
            record.clockOut || "-",
            record.workHours ? `${record.workHours}h` : "-",
            workTypeLabel,
            record.location || "-",
            record.note || "-",
          ].join(",");
        }),
      ];

      const csvContent = "\uFEFF" + csvRows.join("\n"); // BOM 추가 (한글 깨짐 방지)
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `출퇴근기록_${employeeInfo?.name || "직원"}_${new Date().toISOString().split("T")[0]}.csv`;
      link.click();
      URL.revokeObjectURL(url);

      setMessage("✅ 엑셀 다운로드 완료!");
      setTimeout(() => setMessage(""), 3000);
    } catch (e: any) {
      setError(e.message);
    }
  }

  /**
   * 공지사항 로드
   */
  async function loadAnnouncements() {
    try {
      const token = getToken();
      if (!token) return;

      const res = await fetch(`${API_BASE}/announcements/my-announcements`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setAnnouncements(data.announcements || []);
        const unread = data.announcements?.filter((a: Announcement) => !a.isRead).length || 0;
        setUnreadCount(unread);
      }
    } catch (e) {
      console.error("공지사항 로드 실패:", e);
    }
  }

  /**
   * 공지사항 읽음 처리
   */
  async function markAnnouncementAsRead(announcementId: string) {
    try {
      const token = getToken();
      if (!token) return;

      const res = await fetch(`${API_BASE}/announcements/${announcementId}/read`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        // 공지사항 목록 새로고침
        await loadAnnouncements();
        setMessage("✅ 공지사항 확인완료");
        setTimeout(() => setMessage(""), 3000);
      }
    } catch (e: any) {
      console.error("공지사항 읽음 처리 실패:", e);
      setError(e.message);
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
          {isMounted ? formatTime(currentTime) : "--:--:--"}
        </div>
        <div style={{ fontSize: 18, opacity: 0.9 }}>
          {isMounted ? formatDate(currentTime) : "로딩 중..."}
        </div>
      </div>

      {/* 회사 공지사항 */}
      {announcements.length > 0 && (
        <div className="card" style={{ marginBottom: 30 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 style={{ margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
              📢 회사 공지사항
              {unreadCount > 0 && (
                <span style={{
                  background: "#ef4444",
                  color: "white",
                  fontSize: 12,
                  fontWeight: "bold",
                  padding: "4px 10px",
                  borderRadius: 12,
                }}>
                  안 읽음 {unreadCount}
                </span>
              )}
            </h3>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {announcements.map((announcement) => (
              <div
                key={announcement.id}
                style={{
                  border: announcement.isRead ? "1px solid #e5e7eb" : "2px solid #3b82f6",
                  borderRadius: 8,
                  padding: 16,
                  background: announcement.isRead ? "#fafafa" : "#eff6ff",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 8 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      {announcement.priority === "URGENT" && (
                        <span style={{
                          background: "#ef4444",
                          color: "white",
                          fontSize: 11,
                          fontWeight: "bold",
                          padding: "2px 8px",
                          borderRadius: 4,
                        }}>
                          긴급
                        </span>
                      )}
                      <h4 style={{ margin: 0, fontSize: 16, fontWeight: "600" }}>
                        {announcement.title}
                      </h4>
                    </div>
                    <p style={{ fontSize: 12, color: "#6b7280", margin: 0 }}>
                      {new Date(announcement.createdAt).toLocaleString("ko-KR")}
                    </p>
                  </div>
                  
                  {announcement.isRead ? (
                    <span style={{
                      fontSize: 12,
                      color: "#10b981",
                      fontWeight: "600",
                      whiteSpace: "nowrap",
                      marginLeft: 12,
                    }}>
                      ✓ 확인완료됨
                    </span>
                  ) : (
                    <button
                      onClick={() => markAnnouncementAsRead(announcement.id)}
                      style={{
                        padding: "6px 14px",
                        background: "#3b82f6",
                        color: "white",
                        border: "none",
                        borderRadius: 6,
                        fontSize: 13,
                        fontWeight: "600",
                        cursor: "pointer",
                        whiteSpace: "nowrap",
                        marginLeft: 12,
                      }}
                    >
                      확인완료
                    </button>
                  )}
                </div>

                <div style={{
                  padding: 12,
                  background: "white",
                  borderRadius: 6,
                  fontSize: 14,
                  lineHeight: 1.6,
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                }}>
                  {announcement.content}
                </div>

                {announcement.isRead && announcement.readAt && (
                  <p style={{ fontSize: 11, color: "#9ca3af", marginTop: 8, marginBottom: 0 }}>
                    읽은 시간: {new Date(announcement.readAt).toLocaleString("ko-KR")}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

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
            위치 (자동 감지)
          </label>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder={isDetectingLocation ? "위치 감지 중..." : "출근/퇴근 시 자동으로 감지되거나 수동 입력"}
              disabled={isDetectingLocation}
              style={{
                flex: 1,
                padding: "12px",
                border: "1px solid #d1d5db",
                borderRadius: 8,
                fontSize: 14,
                background: isDetectingLocation ? "#f9fafb" : "white",
              }}
            />
            <button
              type="button"
              onClick={detectLocation}
              disabled={isDetectingLocation}
              style={{
                padding: "12px 16px",
                background: isDetectingLocation ? "#9ca3af" : "#3b82f6",
                color: "white",
                border: "none",
                borderRadius: 8,
                fontSize: 14,
                fontWeight: "600",
                cursor: isDetectingLocation ? "not-allowed" : "pointer",
                whiteSpace: "nowrap",
              }}
            >
              {isDetectingLocation ? "감지 중..." : "📍 위치 감지"}
            </button>
          </div>
          {isLocationDetected && location && (
            <p style={{ fontSize: 12, color: "#059669", marginTop: 6, fontWeight: "600" }}>
              ✅ 감지된 위치: {location}
            </p>
          )}
          {locationError && (
            <p style={{ fontSize: 12, color: "#dc2626", marginTop: 6 }}>
              ⚠️ {locationError}
            </p>
          )}
          {!isLocationDetected && !locationError && (
            <p style={{ fontSize: 12, color: "#6b7280", marginTop: 6 }}>
              💡 GPS 또는 IP 기반으로 위치가 자동 기록되거나 직접 입력할 수 있습니다
            </p>
          )}
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
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ margin: 0 }}>📊 최근 출퇴근 기록</h3>
          {recentRecords.length > 0 && (
            <button
              onClick={downloadExcel}
              style={{
                padding: "8px 16px",
                background: "#059669",
                color: "white",
                border: "none",
                borderRadius: 6,
                fontSize: 14,
                fontWeight: "600",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              📥 엑셀 다운로드
            </button>
          )}
        </div>
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
                  <th style={{ padding: 12, textAlign: "left", fontWeight: 600 }}>위치</th>
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
                    <td style={{ padding: 12, fontSize: 12, color: "#6b7280", maxWidth: 200 }}>
                      {record.location ? (
                        <div style={{ 
                          overflow: "hidden", 
                          textOverflow: "ellipsis", 
                          whiteSpace: "nowrap",
                          cursor: "help"
                        }} title={record.location}>
                          {record.location.startsWith("GPS:") ? "📍 " : "🌐 "}
                          {record.location}
                        </div>
                      ) : "-"}
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
