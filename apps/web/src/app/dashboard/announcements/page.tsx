"use client";

import { useState, useEffect } from "react";
import { API_BASE } from "@/lib/api";
import { getToken } from "@/lib/auth";

interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: string;
  isActive: boolean;
  createdAt: string;
  stats: {
    totalEmployees: number;
    readCount: number;
    unreadCount: number;
    readPercentage: number;
  };
}

interface Employee {
  id: string;
  name: string;
  registrationNumber: string;
  readAt?: string;
}

interface AnnouncementDetail {
  announcement: Announcement;
  readEmployees: Employee[];
  unreadEmployees: Employee[];
  stats: {
    total: number;
    read: number;
    unread: number;
    readPercentage: number;
  };
}

export default function AnnouncementsPage() {
  // 탭 상태
  const [activeTab, setActiveTab] = useState<"announcements" | "work-orders">("announcements");
  
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  
  // 공지 작성 모달
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [priority, setPriority] = useState("NORMAL");
  
  // 공지 수정 모달
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editPriority, setEditPriority] = useState("NORMAL");
  
  // 공지 상세 모달
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<AnnouncementDetail | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // 음성 읽기 관련 상태
  const [autoReadEnabled, setAutoReadEnabled] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentSpeakingId, setCurrentSpeakingId] = useState<string | null>(null);

  useEffect(() => {
    loadAnnouncements();
    
    // localStorage에서 자동 음성 읽기 설정 로드
    const savedAutoRead = localStorage.getItem('autoReadAnnouncements');
    if (savedAutoRead === 'true') {
      setAutoReadEnabled(true);
    }
  }, []);

  async function loadAnnouncements() {
    try {
      setLoading(true);
      const token = getToken();
      if (!token) return;

      const res = await fetch(`${API_BASE}/announcements/list`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setAnnouncements(data.announcements || []);
      }
    } catch (e) {
      console.error("공지사항 로드 실패:", e);
    } finally {
      setLoading(false);
    }
  }

  /**
   * 자동 읽기 설정 토글
   */
  function toggleAutoRead() {
    const newValue = !autoReadEnabled;
    setAutoReadEnabled(newValue);
    localStorage.setItem('autoReadAnnouncements', newValue.toString());
    
    if (newValue) {
      setMessage("✅ 자동 음성 읽기가 활성화되었습니다");
    } else {
      setMessage("❌ 자동 음성 읽기가 비활성화되었습니다");
      stopSpeaking(); // 현재 재생 중이면 중지
    }
    setTimeout(() => setMessage(""), 3000);
  }

  /**
   * 단일 공지사항 음성 재생
   */
  function speakSingleAnnouncement(announcement: Announcement) {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      setError("이 브라우저는 음성 재생을 지원하지 않습니다");
      setTimeout(() => setError(""), 3000);
      return;
    }
    
    // 이미 이 공지를 재생 중이면 중지
    if (currentSpeakingId === announcement.id) {
      stopSpeaking();
      return;
    }
    
    // 다른 공지를 재생 중이면 중지하고 새로 시작
    stopSpeaking();
    
    const text = `공지사항. ${announcement.priority === 'URGENT' ? '긴급. ' : ''}${announcement.title}. ${announcement.content}`;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ko-KR';
    utterance.rate = 1.0; // 정상 속도
    utterance.pitch = 1.0;
    utterance.volume = 1.0; // 최대 음량
    
    utterance.onend = () => {
      setIsSpeaking(false);
      setCurrentSpeakingId(null);
    };
    
    utterance.onerror = (e) => {
      console.error("음성 재생 오류:", e);
      setIsSpeaking(false);
      setCurrentSpeakingId(null);
    };
    
    setIsSpeaking(true);
    setCurrentSpeakingId(announcement.id);
    window.speechSynthesis.speak(utterance);
  }

  /**
   * 음성 재생 중지
   */
  function stopSpeaking() {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setCurrentSpeakingId(null);
    }
  }

  async function createAnnouncement() {
    if (!title || !content) {
      setError("제목과 내용을 입력해주세요");
      return;
    }

    try {
      setLoading(true);
      setError("");
      
      const token = getToken();
      if (!token) return;

      const res = await fetch(`${API_BASE}/announcements/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          content,
          priority,
        }),
      });

      if (res.ok) {
        setMessage("✅ 공지사항이 등록되었습니다");
        setIsCreateModalOpen(false);
        setTitle("");
        setContent("");
        setPriority("NORMAL");
        await loadAnnouncements();
        setTimeout(() => setMessage(""), 3000);
      } else {
        const data = await res.json();
        throw new Error(data.error || "공지사항 등록 실패");
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function loadAnnouncementDetail(announcementId: string) {
    try {
      setLoading(true);
      const token = getToken();
      if (!token) return;

      const res = await fetch(`${API_BASE}/announcements/${announcementId}/readers`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setSelectedAnnouncement(data);
        setIsDetailModalOpen(true);
      }
    } catch (e) {
      console.error("공지사항 상세 로드 실패:", e);
    } finally {
      setLoading(false);
    }
  }

  function openEditModal(announcement: Announcement) {
    setEditingAnnouncement(announcement);
    setEditTitle(announcement.title);
    setEditContent(announcement.content);
    setEditPriority(announcement.priority);
    setIsEditModalOpen(true);
  }

  async function updateAnnouncement() {
    if (!editTitle || !editContent) {
      setError("제목과 내용을 입력해주세요");
      return;
    }

    if (!editingAnnouncement) return;

    try {
      setLoading(true);
      setError("");
      
      const token = getToken();
      if (!token) return;

      const res = await fetch(`${API_BASE}/announcements/${editingAnnouncement.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: editTitle,
          content: editContent,
          priority: editPriority,
        }),
      });

      if (res.ok) {
        setMessage("✅ 공지사항이 수정되었습니다");
        setIsEditModalOpen(false);
        setEditingAnnouncement(null);
        setEditTitle("");
        setEditContent("");
        setEditPriority("NORMAL");
        await loadAnnouncements();
        setTimeout(() => setMessage(""), 3000);
      } else {
        const data = await res.json();
        throw new Error(data.error || "공지사항 수정 실패");
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function deleteAnnouncement(announcementId: string) {
    if (!confirm("정말 삭제하시겠습니까?")) return;

    try {
      setLoading(true);
      const token = getToken();
      if (!token) return;

      const res = await fetch(`${API_BASE}/announcements/${announcementId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        setMessage("✅ 공지사항이 삭제되었습니다");
        await loadAnnouncements();
        setTimeout(() => setMessage(""), 3000);
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 1200, margin: "40px auto", padding: "0 20px" }}>
      {/* 헤더 */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 30, flexWrap: "wrap", gap: 16 }}>
        <h1 style={{ fontSize: 28, margin: 0 }}>📢 회사공지업무방</h1>
        
        <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          {/* 자동 음성 읽기 토글 (공지사항 탭에서만 표시) */}
          {activeTab === "announcements" && (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 14, color: "#6b7280", fontWeight: 500 }}>🔊 자동 음성 읽기</span>
              <button
                onClick={toggleAutoRead}
                style={{
                  width: 52,
                  height: 28,
                  background: autoReadEnabled ? "#10b981" : "#d1d5db",
                  borderRadius: 14,
                  border: "none",
                  cursor: "pointer",
                  position: "relative",
                  transition: "background 0.3s",
                }}
                aria-label={autoReadEnabled ? "자동 읽기 활성화됨" : "자동 읽기 비활성화됨"}
              >
                <span style={{
                  position: "absolute",
                  top: 2,
                  left: autoReadEnabled ? 26 : 2,
                  width: 24,
                  height: 24,
                  background: "white",
                  borderRadius: "50%",
                  transition: "left 0.3s",
                }} />
              </button>
            </div>
          )}
          
          {/* 공지 작성 버튼 (공지사항 탭에서만 표시) */}
          {activeTab === "announcements" && (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              style={{
                padding: "12px 24px",
                background: "#3b82f6",
                color: "white",
                border: "none",
                borderRadius: 8,
                fontSize: 16,
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              ✏️ 공지 작성
            </button>
          )}
        </div>
      </div>

      {/* 탭 메뉴 */}
      <div style={{
        display: "flex",
        gap: 8,
        marginBottom: 24,
        borderBottom: "2px solid #e5e7eb",
      }}>
        <button
          onClick={() => setActiveTab("announcements")}
          style={{
            padding: "12px 24px",
            background: activeTab === "announcements" ? "#3b82f6" : "transparent",
            color: activeTab === "announcements" ? "white" : "#6b7280",
            border: "none",
            borderRadius: "8px 8px 0 0",
            fontSize: 16,
            fontWeight: "600",
            cursor: "pointer",
            transition: "all 0.2s",
            marginBottom: -2,
            borderBottom: activeTab === "announcements" ? "2px solid #3b82f6" : "none",
          }}
        >
          📢 공지사항
        </button>
        <button
          onClick={() => setActiveTab("work-orders")}
          style={{
            padding: "12px 24px",
            background: activeTab === "work-orders" ? "#3b82f6" : "transparent",
            color: activeTab === "work-orders" ? "white" : "#6b7280",
            border: "none",
            borderRadius: "8px 8px 0 0",
            fontSize: 16,
            fontWeight: "600",
            cursor: "pointer",
            transition: "all 0.2s",
            marginBottom: -2,
            borderBottom: activeTab === "work-orders" ? "2px solid #3b82f6" : "none",
          }}
        >
          📋 업무지시
        </button>
      </div>

      {/* 메시지 */}
      {message && (
        <div style={{
          padding: 16,
          background: "#d1fae5",
          color: "#065f46",
          borderRadius: 8,
          marginBottom: 24,
          fontWeight: "bold",
        }}>
          {message}
        </div>
      )}

      {error && (
        <div style={{
          padding: 16,
          background: "#fee2e2",
          color: "#991b1b",
          borderRadius: 8,
          marginBottom: 24,
          fontWeight: "bold",
        }}>
          ❌ {error}
        </div>
      )}

      {/* 탭 컨텐츠 */}
      {activeTab === "announcements" ? (
        /* 공지사항 목록 */
        <div style={{ background: "white", borderRadius: 12, boxShadow: "0 1px 3px rgba(0,0,0,0.1)", overflow: "hidden" }}>
        {loading && announcements.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", color: "#999" }}>
            로딩 중...
          </div>
        ) : announcements.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", color: "#999" }}>
            등록된 공지사항이 없습니다.
          </div>
        ) : (
          <div>
            {announcements.map((announcement) => (
              <div
                key={announcement.id}
                style={{
                  padding: 24,
                  borderBottom: "1px solid #e5e7eb",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                      {announcement.priority === "URGENT" && (
                        <span style={{
                          background: "#ef4444",
                          color: "white",
                          fontSize: 12,
                          fontWeight: "bold",
                          padding: "4px 10px",
                          borderRadius: 4,
                        }}>
                          긴급
                        </span>
                      )}
                      {!announcement.isActive && (
                        <span style={{
                          background: "#9ca3af",
                          color: "white",
                          fontSize: 12,
                          fontWeight: "bold",
                          padding: "4px 10px",
                          borderRadius: 4,
                        }}>
                          비활성
                        </span>
                      )}
                      <h3 style={{ margin: 0, fontSize: 18 }}>{announcement.title}</h3>
                    </div>
                    
                    <p style={{ fontSize: 14, color: "#6b7280", margin: "8px 0" }}>
                      {announcement.content.length > 100 
                        ? `${announcement.content.substring(0, 100)}...` 
                        : announcement.content}
                    </p>
                    
                    <div style={{ display: "flex", gap: 16, fontSize: 13, color: "#6b7280", marginTop: 12 }}>
                      <span>📅 {new Date(announcement.createdAt).toLocaleDateString("ko-KR")}</span>
                      <span>👥 전체 {announcement.stats.totalEmployees}명</span>
                      <span style={{ color: "#10b981", fontWeight: "600" }}>
                        ✓ 읽음 {announcement.stats.readCount}명 ({announcement.stats.readPercentage}%)
                      </span>
                      <span style={{ color: "#ef4444", fontWeight: "600" }}>
                        ⏳ 안 읽음 {announcement.stats.unreadCount}명
                      </span>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 8, marginLeft: 24, flexWrap: "wrap" }}>
                    {/* 음성 재생 버튼 */}
                    <button
                      onClick={() => speakSingleAnnouncement(announcement)}
                      style={{
                        padding: "8px 16px",
                        background: currentSpeakingId === announcement.id ? "#f59e0b" : "#6366f1",
                        color: "white",
                        border: "none",
                        borderRadius: 6,
                        fontSize: 14,
                        fontWeight: "600",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                      }}
                      title={currentSpeakingId === announcement.id ? "재생 중지" : "음성으로 듣기"}
                    >
                      {currentSpeakingId === announcement.id ? "⏸️ 중지" : "🔊 듣기"}
                    </button>
                    
                    <button
                      onClick={() => loadAnnouncementDetail(announcement.id)}
                      style={{
                        padding: "8px 16px",
                        background: "#3b82f6",
                        color: "white",
                        border: "none",
                        borderRadius: 6,
                        fontSize: 14,
                        fontWeight: "600",
                        cursor: "pointer",
                      }}
                    >
                      확인리스트
                    </button>
                    <button
                      onClick={() => openEditModal(announcement)}
                      style={{
                        padding: "8px 16px",
                        background: "#10b981",
                        color: "white",
                        border: "none",
                        borderRadius: 6,
                        fontSize: 14,
                        fontWeight: "600",
                        cursor: "pointer",
                      }}
                    >
                      수정
                    </button>
                    <button
                      onClick={() => deleteAnnouncement(announcement.id)}
                      style={{
                        padding: "8px 16px",
                        background: "#ef4444",
                        color: "white",
                        border: "none",
                        borderRadius: 6,
                        fontSize: 14,
                        fontWeight: "600",
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

      {/* 공지 작성 모달 */}
      {isCreateModalOpen && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
        }}>
          <div style={{
            background: "white",
            borderRadius: 12,
            padding: 32,
            maxWidth: 600,
            width: "90%",
            maxHeight: "90vh",
            overflowY: "auto",
          }}>
            <h2 style={{ marginTop: 0, marginBottom: 24 }}>✏️ 공지사항 작성</h2>
            
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", marginBottom: 8, fontWeight: "600" }}>
                우선순위
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                style={{
                  width: "100%",
                  padding: 12,
                  border: "1px solid #d1d5db",
                  borderRadius: 8,
                  fontSize: 14,
                }}
              >
                <option value="NORMAL">일반</option>
                <option value="URGENT">긴급</option>
                <option value="LOW">낮음</option>
              </select>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", marginBottom: 8, fontWeight: "600" }}>
                제목
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="공지사항 제목을 입력하세요"
                style={{
                  width: "100%",
                  padding: 12,
                  border: "1px solid #d1d5db",
                  borderRadius: 8,
                  fontSize: 14,
                }}
              />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: "block", marginBottom: 8, fontWeight: "600" }}>
                내용
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="공지사항 내용을 입력하세요"
                rows={10}
                style={{
                  width: "100%",
                  padding: 12,
                  border: "1px solid #d1d5db",
                  borderRadius: 8,
                  fontSize: 14,
                  resize: "vertical",
                }}
              />
            </div>

            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
              <button
                onClick={() => {
                  setIsCreateModalOpen(false);
                  setTitle("");
                  setContent("");
                  setPriority("NORMAL");
                  setError("");
                }}
                style={{
                  padding: "12px 24px",
                  background: "#6b7280",
                  color: "white",
                  border: "none",
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                취소
              </button>
              <button
                onClick={createAnnouncement}
                disabled={loading}
                style={{
                  padding: "12px 24px",
                  background: loading ? "#9ca3af" : "#3b82f6",
                  color: "white",
                  border: "none",
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: "600",
                  cursor: loading ? "not-allowed" : "pointer",
                }}
              >
                {loading ? "등록 중..." : "등록"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 공지 수정 모달 */}
      {isEditModalOpen && editingAnnouncement && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
        }}>
          <div style={{
            background: "white",
            borderRadius: 12,
            padding: 32,
            maxWidth: 600,
            width: "90%",
            maxHeight: "90vh",
            overflowY: "auto",
          }}>
            <h2 style={{ marginTop: 0, marginBottom: 24 }}>✏️ 공지사항 수정</h2>
            
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", marginBottom: 8, fontWeight: "600" }}>
                우선순위
              </label>
              <select
                value={editPriority}
                onChange={(e) => setEditPriority(e.target.value)}
                style={{
                  width: "100%",
                  padding: 12,
                  border: "1px solid #d1d5db",
                  borderRadius: 8,
                  fontSize: 14,
                }}
              >
                <option value="NORMAL">일반</option>
                <option value="URGENT">긴급</option>
                <option value="LOW">낮음</option>
              </select>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", marginBottom: 8, fontWeight: "600" }}>
                제목
              </label>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="공지사항 제목을 입력하세요"
                style={{
                  width: "100%",
                  padding: 12,
                  border: "1px solid #d1d5db",
                  borderRadius: 8,
                  fontSize: 14,
                }}
              />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: "block", marginBottom: 8, fontWeight: "600" }}>
                내용
              </label>
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                placeholder="공지사항 내용을 입력하세요"
                rows={10}
                style={{
                  width: "100%",
                  padding: 12,
                  border: "1px solid #d1d5db",
                  borderRadius: 8,
                  fontSize: 14,
                  resize: "vertical",
                }}
              />
            </div>

            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
              <button
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingAnnouncement(null);
                  setEditTitle("");
                  setEditContent("");
                  setEditPriority("NORMAL");
                  setError("");
                }}
                style={{
                  padding: "12px 24px",
                  background: "#6b7280",
                  color: "white",
                  border: "none",
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                취소
              </button>
              <button
                onClick={updateAnnouncement}
                disabled={loading}
                style={{
                  padding: "12px 24px",
                  background: loading ? "#9ca3af" : "#10b981",
                  color: "white",
                  border: "none",
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: "600",
                  cursor: loading ? "not-allowed" : "pointer",
                }}
              >
                {loading ? "수정 중..." : "수정 완료"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 공지 상세 모달 */}
      {isDetailModalOpen && selectedAnnouncement && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
        }}>
          <div style={{
            background: "white",
            borderRadius: 12,
            padding: 32,
            maxWidth: 900,
            width: "90%",
            maxHeight: "90vh",
            overflowY: "auto",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 24 }}>
              <h2 style={{ marginTop: 0, marginBottom: 0 }}>
                {selectedAnnouncement.announcement.title}
              </h2>
              <button
                onClick={() => {
                  setIsDetailModalOpen(false);
                  setSelectedAnnouncement(null);
                }}
                style={{
                  padding: "8px 16px",
                  background: "#6b7280",
                  color: "white",
                  border: "none",
                  borderRadius: 6,
                  fontSize: 14,
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                닫기
              </button>
            </div>

            <div style={{
              padding: 16,
              background: "#f9fafb",
              borderRadius: 8,
              marginBottom: 24,
              whiteSpace: "pre-wrap",
              lineHeight: 1.6,
            }}>
              {selectedAnnouncement.announcement.content}
            </div>

            {/* 통계 */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 16,
              marginBottom: 32,
            }}>
              <div style={{
                padding: 16,
                background: "#eff6ff",
                borderRadius: 8,
                textAlign: "center",
              }}>
                <div style={{ fontSize: 24, fontWeight: "bold", color: "#3b82f6", marginBottom: 4 }}>
                  {selectedAnnouncement.stats.total}명
                </div>
                <div style={{ fontSize: 13, color: "#6b7280" }}>전체 직원</div>
              </div>
              <div style={{
                padding: 16,
                background: "#d1fae5",
                borderRadius: 8,
                textAlign: "center",
              }}>
                <div style={{ fontSize: 24, fontWeight: "bold", color: "#10b981", marginBottom: 4 }}>
                  {selectedAnnouncement.stats.read}명 ({selectedAnnouncement.stats.readPercentage}%)
                </div>
                <div style={{ fontSize: 13, color: "#6b7280" }}>읽음</div>
              </div>
              <div style={{
                padding: 16,
                background: "#fee2e2",
                borderRadius: 8,
                textAlign: "center",
              }}>
                <div style={{ fontSize: 24, fontWeight: "bold", color: "#ef4444", marginBottom: 4 }}>
                  {selectedAnnouncement.stats.unread}명
                </div>
                <div style={{ fontSize: 13, color: "#6b7280" }}>안 읽음</div>
              </div>
            </div>

            {/* 읽은 직원 목록 */}
            {selectedAnnouncement.readEmployees.length > 0 && (
              <div style={{ marginBottom: 32 }}>
                <h3 style={{ fontSize: 18, marginBottom: 16, color: "#10b981" }}>
                  ✓ 읽은 직원 ({selectedAnnouncement.readEmployees.length}명)
                </h3>
                <div style={{
                  border: "1px solid #d1d5db",
                  borderRadius: 8,
                  overflow: "hidden",
                }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ background: "#f9fafb" }}>
                        <th style={{ padding: 12, textAlign: "left", fontWeight: 600, fontSize: 14 }}>이름</th>
                        <th style={{ padding: 12, textAlign: "left", fontWeight: 600, fontSize: 14 }}>주민번호</th>
                        <th style={{ padding: 12, textAlign: "left", fontWeight: 600, fontSize: 14 }}>읽은 시간</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedAnnouncement.readEmployees.map((emp) => (
                        <tr key={emp.id} style={{ borderTop: "1px solid #e5e7eb" }}>
                          <td style={{ padding: 12, fontSize: 14 }}>{emp.name}</td>
                          <td style={{ padding: 12, fontSize: 14 }}>{emp.registrationNumber}</td>
                          <td style={{ padding: 12, fontSize: 14 }}>
                            {emp.readAt ? new Date(emp.readAt).toLocaleString("ko-KR") : "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 안 읽은 직원 목록 */}
            {selectedAnnouncement.unreadEmployees.length > 0 && (
              <div>
                <h3 style={{ fontSize: 18, marginBottom: 16, color: "#ef4444" }}>
                  ⏳ 안 읽은 직원 ({selectedAnnouncement.unreadEmployees.length}명)
                </h3>
                <div style={{
                  border: "1px solid #d1d5db",
                  borderRadius: 8,
                  overflow: "hidden",
                }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ background: "#f9fafb" }}>
                        <th style={{ padding: 12, textAlign: "left", fontWeight: 600, fontSize: 14 }}>이름</th>
                        <th style={{ padding: 12, textAlign: "left", fontWeight: 600, fontSize: 14 }}>주민번호</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedAnnouncement.unreadEmployees.map((emp) => (
                        <tr key={emp.id} style={{ borderTop: "1px solid #e5e7eb" }}>
                          <td style={{ padding: 12, fontSize: 14 }}>{emp.name}</td>
                          <td style={{ padding: 12, fontSize: 14 }}>{emp.registrationNumber}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )
      ) : (
        /* 업무지시 탭 - iframe으로 표시 */
        <div style={{
          background: "white",
          borderRadius: 12,
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          overflow: "hidden",
          height: "calc(100vh - 250px)",
          minHeight: 600,
        }}>
          <iframe
            src="/dashboard/work-orders"
            style={{
              width: "100%",
              height: "100%",
              border: "none",
            }}
            title="업무지시"
          />
        </div>
      )}
    </div>
  );
}
