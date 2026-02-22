"use client";

import { useState, useEffect } from "react";
import { API_BASE } from "@/lib/api";
import { getToken } from "@/lib/auth";

interface WorkOrder {
  id: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  dueDate: string | null;
  attachmentUrls: string[];
  createdAt: string;
  sender: {
    id: string;
    name: string;
  };
  recipients: {
    id: string;
    name: string;
    status: string;
    completedAt: string | null;
    completionReport: string | null;
  }[];
}

interface WorkOrderDetail {
  id: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  dueDate: string | null;
  attachmentUrls: string[];
  createdAt: string;
  sender: {
    id: string;
    name: string;
  };
  recipients: {
    id: string;
    name: string;
    status: string;
    completedAt: string | null;
    completionReport: string | null;
  }[];
}

export default function WorkOrdersPage() {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  
  // 업무지시 작성 모달
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [recipientType, setRecipientType] = useState<"ALL" | "INDIVIDUAL">("ALL");
  const [recipientIds, setRecipientIds] = useState<string[]>([]);
  const [employees, setEmployees] = useState<{ id: string; name: string; }[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("NORMAL");
  const [dueDate, setDueDate] = useState("");
  
  // 업무지시 상세 모달
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<WorkOrderDetail | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // 음성 읽기 관련 상태
  const [autoReadEnabled, setAutoReadEnabled] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentSpeakingId, setCurrentSpeakingId] = useState<string | null>(null);

  useEffect(() => {
    loadWorkOrders();
    loadEmployees();
    
    // localStorage에서 자동 음성 읽기 설정 로드
    const savedAutoRead = localStorage.getItem('autoReadWorkOrders');
    if (savedAutoRead === 'true') {
      setAutoReadEnabled(true);
    }
  }, []);

  async function loadWorkOrders() {
    try {
      setLoading(true);
      const token = getToken();
      if (!token) return;

      const res = await fetch(`${API_BASE}/work-orders`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setWorkOrders(data.workOrders || []);
      }
    } catch (e) {
      console.error("업무지시 로드 실패:", e);
    } finally {
      setLoading(false);
    }
  }

  async function loadEmployees() {
    try {
      const token = getToken();
      if (!token) return;

      const res = await fetch(`${API_BASE}/employees`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setEmployees(data.employees || []);
      }
    } catch (e) {
      console.error("직원 목록 로드 실패:", e);
    }
  }

  /**
   * 자동 읽기 설정 토글
   */
  function toggleAutoRead() {
    const newValue = !autoReadEnabled;
    setAutoReadEnabled(newValue);
    localStorage.setItem('autoReadWorkOrders', newValue.toString());
    
    if (newValue) {
      setMessage("✅ 자동 음성 읽기가 활성화되었습니다");
    } else {
      setMessage("❌ 자동 음성 읽기가 비활성화되었습니다");
      stopSpeaking();
    }
    setTimeout(() => setMessage(""), 3000);
  }

  /**
   * 단일 업무지시 음성 재생
   */
  function speakSingleWorkOrder(workOrder: WorkOrder) {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      setError("이 브라우저는 음성 재생을 지원하지 않습니다");
      setTimeout(() => setError(""), 3000);
      return;
    }
    
    // 이미 이 업무지시를 재생 중이면 중지
    if (currentSpeakingId === workOrder.id) {
      stopSpeaking();
      return;
    }
    
    // 다른 업무지시를 재생 중이면 중지하고 새로 시작
    stopSpeaking();
    
    const priorityText = {
      'URGENT': '긴급',
      'HIGH': '높음',
      'NORMAL': '보통',
      'LOW': '낮음'
    }[workOrder.priority] || '보통';
    
    const dueDateText = workOrder.dueDate 
      ? `마감일 ${new Date(workOrder.dueDate).toLocaleDateString('ko-KR')}`
      : '';
    
    const text = `업무지시. 긴급도 ${priorityText}. ${workOrder.title}. ${workOrder.description}. ${dueDateText}`;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ko-KR';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    
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
    setCurrentSpeakingId(workOrder.id);
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

  async function createWorkOrder() {
    if (!title || !description) {
      setError("제목과 내용을 입력해주세요");
      return;
    }

    if (recipientType === "INDIVIDUAL" && recipientIds.length === 0) {
      setError("수신자를 선택해주세요");
      return;
    }

    try {
      setLoading(true);
      setError("");
      
      const token = getToken();
      if (!token) return;

      const res = await fetch(`${API_BASE}/work-orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          description,
          priority,
          dueDate: dueDate || null,
          recipientType,
          recipientIds: recipientType === "INDIVIDUAL" ? recipientIds : undefined,
        }),
      });

      if (res.ok) {
        setMessage("✅ 업무지시가 등록되었습니다");
        setIsCreateModalOpen(false);
        setTitle("");
        setDescription("");
        setPriority("NORMAL");
        setDueDate("");
        setRecipientType("ALL");
        setRecipientIds([]);
        await loadWorkOrders();
        setTimeout(() => setMessage(""), 3000);
      } else {
        const data = await res.json();
        throw new Error(data.error || "업무지시 등록 실패");
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function loadWorkOrderDetail(workOrderId: string) {
    try {
      setLoading(true);
      const token = getToken();
      if (!token) return;

      const res = await fetch(`${API_BASE}/work-orders/${workOrderId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setSelectedWorkOrder(data.workOrder);
        setIsDetailModalOpen(true);
      }
    } catch (e) {
      console.error("업무지시 상세 로드 실패:", e);
    } finally {
      setLoading(false);
    }
  }

  function getPriorityColor(priority: string) {
    switch (priority) {
      case "URGENT": return "#ef4444";
      case "HIGH": return "#f59e0b";
      case "NORMAL": return "#3b82f6";
      case "LOW": return "#6b7280";
      default: return "#3b82f6";
    }
  }

  function getPriorityLabel(priority: string) {
    switch (priority) {
      case "URGENT": return "긴급";
      case "HIGH": return "높음";
      case "NORMAL": return "보통";
      case "LOW": return "낮음";
      default: return "보통";
    }
  }

  function getStatusLabel(status: string) {
    switch (status) {
      case "PENDING": return "대기중";
      case "IN_PROGRESS": return "진행중";
      case "COMPLETED": return "완료";
      default: return status;
    }
  }

  function getStatusColor(status: string) {
    switch (status) {
      case "PENDING": return "#f59e0b";
      case "IN_PROGRESS": return "#3b82f6";
      case "COMPLETED": return "#10b981";
      default: return "#6b7280";
    }
  }

  return (
    <div style={{ maxWidth: 1200, margin: "40px auto", padding: "0 20px" }}>
      {/* 헤더 */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 30, flexWrap: "wrap", gap: 16 }}>
        <h1 style={{ fontSize: 28, margin: 0 }}>📋 업무지시</h1>
        
        <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          {/* 자동 음성 읽기 토글 */}
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
            ✏️ 업무지시 등록
          </button>
        </div>
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

      {/* 업무지시 목록 */}
      <div style={{ background: "white", borderRadius: 12, boxShadow: "0 1px 3px rgba(0,0,0,0.1)", overflow: "hidden" }}>
        {loading && workOrders.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", color: "#999" }}>
            로딩 중...
          </div>
        ) : workOrders.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", color: "#999" }}>
            등록된 업무지시가 없습니다.
          </div>
        ) : (
          <div>
            {workOrders.map((workOrder) => {
              const completedCount = workOrder.recipients.filter(r => r.status === "COMPLETED").length;
              const totalCount = workOrder.recipients.length;
              const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
              
              return (
                <div
                  key={workOrder.id}
                  style={{
                    padding: 24,
                    borderBottom: "1px solid #e5e7eb",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                        <span style={{
                          background: getPriorityColor(workOrder.priority),
                          color: "white",
                          fontSize: 12,
                          fontWeight: "bold",
                          padding: "4px 10px",
                          borderRadius: 4,
                        }}>
                          {getPriorityLabel(workOrder.priority)}
                        </span>
                        <span style={{
                          background: getStatusColor(workOrder.status),
                          color: "white",
                          fontSize: 12,
                          fontWeight: "bold",
                          padding: "4px 10px",
                          borderRadius: 4,
                        }}>
                          {getStatusLabel(workOrder.status)}
                        </span>
                        <h3 style={{ margin: 0, fontSize: 18 }}>{workOrder.title}</h3>
                      </div>
                      
                      <p style={{ fontSize: 14, color: "#6b7280", margin: "8px 0" }}>
                        {workOrder.description.length > 100 
                          ? `${workOrder.description.substring(0, 100)}...` 
                          : workOrder.description}
                      </p>
                      
                      <div style={{ display: "flex", gap: 16, fontSize: 13, color: "#6b7280", marginTop: 12 }}>
                        <span>📅 {new Date(workOrder.createdAt).toLocaleDateString("ko-KR")}</span>
                        {workOrder.dueDate && (
                          <span>⏰ 마감 {new Date(workOrder.dueDate).toLocaleDateString("ko-KR")}</span>
                        )}
                        <span>👤 발신: {workOrder.sender.name}</span>
                        <span>👥 수신: {totalCount}명</span>
                        <span style={{ color: "#10b981", fontWeight: "600" }}>
                          ✓ 완료 {completedCount}명 ({completionRate}%)
                        </span>
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: 8, marginLeft: 24, flexWrap: "wrap" }}>
                      {/* 음성 재생 버튼 */}
                      <button
                        onClick={() => speakSingleWorkOrder(workOrder)}
                        style={{
                          padding: "8px 16px",
                          background: currentSpeakingId === workOrder.id ? "#f59e0b" : "#6366f1",
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
                        title={currentSpeakingId === workOrder.id ? "재생 중지" : "음성으로 듣기"}
                      >
                        {currentSpeakingId === workOrder.id ? "⏸️ 중지" : "🔊 듣기"}
                      </button>
                      
                      <button
                        onClick={() => loadWorkOrderDetail(workOrder.id)}
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
                        상세보기
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 업무지시 작성 모달 */}
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
            <h2 style={{ marginTop: 0, marginBottom: 24 }}>✏️ 업무지시 등록</h2>
            
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", marginBottom: 8, fontWeight: "600" }}>
                수신 대상
              </label>
              <select
                value={recipientType}
                onChange={(e) => {
                  setRecipientType(e.target.value as "ALL" | "INDIVIDUAL");
                  setRecipientIds([]);
                }}
                style={{
                  width: "100%",
                  padding: 12,
                  border: "1px solid #d1d5db",
                  borderRadius: 8,
                  fontSize: 14,
                }}
              >
                <option value="ALL">전체 직원</option>
                <option value="INDIVIDUAL">개별 선택</option>
              </select>
            </div>

            {recipientType === "INDIVIDUAL" && (
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", marginBottom: 8, fontWeight: "600" }}>
                  수신자 선택
                </label>
                <div style={{
                  border: "1px solid #d1d5db",
                  borderRadius: 8,
                  padding: 12,
                  maxHeight: 200,
                  overflowY: "auto",
                }}>
                  {employees.map((emp) => (
                    <label key={emp.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 0" }}>
                      <input
                        type="checkbox"
                        checked={recipientIds.includes(emp.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setRecipientIds([...recipientIds, emp.id]);
                          } else {
                            setRecipientIds(recipientIds.filter(id => id !== emp.id));
                          }
                        }}
                      />
                      <span>{emp.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", marginBottom: 8, fontWeight: "600" }}>
                긴급도
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
                <option value="LOW">낮음</option>
                <option value="NORMAL">보통</option>
                <option value="HIGH">높음</option>
                <option value="URGENT">긴급</option>
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
                placeholder="업무지시 제목을 입력하세요"
                style={{
                  width: "100%",
                  padding: 12,
                  border: "1px solid #d1d5db",
                  borderRadius: 8,
                  fontSize: 14,
                }}
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", marginBottom: 8, fontWeight: "600" }}>
                내용
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="업무지시 내용을 입력하세요"
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

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: "block", marginBottom: 8, fontWeight: "600" }}>
                마감일 (선택)
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                style={{
                  width: "100%",
                  padding: 12,
                  border: "1px solid #d1d5db",
                  borderRadius: 8,
                  fontSize: 14,
                }}
              />
            </div>

            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
              <button
                onClick={() => {
                  setIsCreateModalOpen(false);
                  setTitle("");
                  setDescription("");
                  setPriority("NORMAL");
                  setDueDate("");
                  setRecipientType("ALL");
                  setRecipientIds([]);
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
                onClick={createWorkOrder}
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

      {/* 업무지시 상세 모달 */}
      {isDetailModalOpen && selectedWorkOrder && (
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
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                  <span style={{
                    background: getPriorityColor(selectedWorkOrder.priority),
                    color: "white",
                    fontSize: 12,
                    fontWeight: "bold",
                    padding: "4px 10px",
                    borderRadius: 4,
                  }}>
                    {getPriorityLabel(selectedWorkOrder.priority)}
                  </span>
                  <span style={{
                    background: getStatusColor(selectedWorkOrder.status),
                    color: "white",
                    fontSize: 12,
                    fontWeight: "bold",
                    padding: "4px 10px",
                    borderRadius: 4,
                  }}>
                    {getStatusLabel(selectedWorkOrder.status)}
                  </span>
                </div>
                <h2 style={{ marginTop: 0, marginBottom: 0 }}>
                  {selectedWorkOrder.title}
                </h2>
              </div>
              <button
                onClick={() => {
                  setIsDetailModalOpen(false);
                  setSelectedWorkOrder(null);
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
              {selectedWorkOrder.description}
            </div>

            <div style={{ fontSize: 14, color: "#6b7280", marginBottom: 24 }}>
              <div>📅 작성일: {new Date(selectedWorkOrder.createdAt).toLocaleString("ko-KR")}</div>
              {selectedWorkOrder.dueDate && (
                <div>⏰ 마감일: {new Date(selectedWorkOrder.dueDate).toLocaleString("ko-KR")}</div>
              )}
              <div>👤 발신자: {selectedWorkOrder.sender.name}</div>
            </div>

            {/* 첨부파일 */}
            {selectedWorkOrder.attachmentUrls && selectedWorkOrder.attachmentUrls.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <h3 style={{ fontSize: 16, marginBottom: 12 }}>📎 첨부파일</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {selectedWorkOrder.attachmentUrls.map((url, index) => (
                    <a
                      key={index}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        padding: 8,
                        background: "#eff6ff",
                        borderRadius: 6,
                        color: "#3b82f6",
                        textDecoration: "none",
                        fontSize: 14,
                      }}
                    >
                      📄 첨부파일 {index + 1}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* 수신자 목록 */}
            <div>
              <h3 style={{ fontSize: 18, marginBottom: 16 }}>
                👥 수신자 목록 ({selectedWorkOrder.recipients.length}명)
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
                      <th style={{ padding: 12, textAlign: "left", fontWeight: 600, fontSize: 14 }}>상태</th>
                      <th style={{ padding: 12, textAlign: "left", fontWeight: 600, fontSize: 14 }}>완료일시</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedWorkOrder.recipients.map((recipient) => (
                      <tr key={recipient.id} style={{ borderTop: "1px solid #e5e7eb" }}>
                        <td style={{ padding: 12, fontSize: 14 }}>{recipient.name}</td>
                        <td style={{ padding: 12, fontSize: 14 }}>
                          <span style={{
                            background: getStatusColor(recipient.status),
                            color: "white",
                            fontSize: 12,
                            fontWeight: "bold",
                            padding: "2px 8px",
                            borderRadius: 4,
                          }}>
                            {getStatusLabel(recipient.status)}
                          </span>
                        </td>
                        <td style={{ padding: 12, fontSize: 14 }}>
                          {recipient.completedAt ? new Date(recipient.completedAt).toLocaleString("ko-KR") : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
