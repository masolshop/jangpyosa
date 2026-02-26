"use client";

import { useState, useEffect } from "react";
import { API_BASE } from "@/lib/api";
import { getToken } from "@/lib/auth";

interface WorkOrder {
  id: string;
  title: string;
  content: string;
  priority: string;
  targetType: string;
  dueDate: string | null;
  createdAt: string;
  isConfirmed: boolean;
  confirmedAt: string | null;
  note: string | null;
}

export default function EmployeeWorkOrdersPage() {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  
  // 선택된 업무지시
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<WorkOrder | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  
  // 완료 보고서
  const [completionReport, setCompletionReport] = useState("");
  const [isCompletingTask, setIsCompletingTask] = useState(false);

  // 음성 읽기 관련 상태
  const [autoReadEnabled, setAutoReadEnabled] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentSpeakingId, setCurrentSpeakingId] = useState<string | null>(null);

  useEffect(() => {
    loadWorkOrders();
    
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

      const res = await fetch(`${API_BASE}/work-orders/my-work-orders`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: 'no-store',
      });

      if (res.ok) {
        const data = await res.json();
        setWorkOrders(data.workOrders || []);
      } else {
        const data = await res.json();
        setError(data.error || "업무지시를 불러올 수 없습니다");
      }
    } catch (e) {
      console.error("업무지시 로드 실패:", e);
      setError("업무지시를 불러올 수 없습니다");
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
    
    const text = `업무지시. 긴급도 ${priorityText}. ${workOrder.title}. ${workOrder.content}. ${dueDateText}`;
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

  function openDetailModal(workOrder: WorkOrder) {
    setSelectedWorkOrder(workOrder);
    setCompletionReport(workOrder.note || "");
    setIsDetailModalOpen(true);
  }

  async function completeWorkOrder() {
    if (!selectedWorkOrder) return;
    
    if (!completionReport.trim()) {
      setError("완료 보고서를 입력해주세요");
      setTimeout(() => setError(""), 3000);
      return;
    }

    try {
      setIsCompletingTask(true);
      setError("");
      
      const token = getToken();
      if (!token) return;

      const res = await fetch(`${API_BASE}/work-orders/${selectedWorkOrder.id}/confirm`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          note: completionReport,
        }),
      });

      if (res.ok) {
        setMessage("✅ 업무가 완료 처리되었습니다");
        
        // UI 즉시 업데이트: 현재 workOrder의 상태를 완료로 변경
        setWorkOrders(prevOrders => 
          prevOrders.map(order => 
            order.id === selectedWorkOrder.id 
              ? { ...order, isConfirmed: true, confirmedAt: new Date().toISOString(), note: completionReport }
              : order
          )
        );
        
        setIsDetailModalOpen(false);
        setSelectedWorkOrder(null);
        setCompletionReport("");
        
        // 서버 데이터와 동기화
        await loadWorkOrders();
        setTimeout(() => setMessage(""), 3000);
      } else {
        const data = await res.json();
        throw new Error(data.error || "업무 완료 처리 실패");
      }
    } catch (e: any) {
      setError(e.message);
      setTimeout(() => setError(""), 5000);
    } finally {
      setIsCompletingTask(false);
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

  function getStatusLabel(isConfirmed: boolean) {
    return isConfirmed ? "완료" : "대기중";
  }

  function getStatusColor(isConfirmed: boolean) {
    return isConfirmed ? "#10b981" : "#f59e0b";
  }

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "20px" }}>
      {/* 헤더 */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 30, flexWrap: "wrap", gap: 16 }}>
        <h1 style={{ fontSize: 28, margin: 0 }}>📋 나의 업무지시</h1>
        
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
        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: "#999" }}>
            로딩 중...
          </div>
        ) : workOrders.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", color: "#999" }}>
            할당된 업무지시가 없습니다.
          </div>
        ) : (
          <div>
            {workOrders.map((workOrder) => (
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
                        background: getStatusColor(workOrder.isConfirmed),
                        color: "white",
                        fontSize: 12,
                        fontWeight: "bold",
                        padding: "4px 10px",
                        borderRadius: 4,
                      }}>
                        {getStatusLabel(workOrder.isConfirmed)}
                      </span>
                      <h3 style={{ margin: 0, fontSize: 18 }}>{workOrder.title}</h3>
                    </div>
                    
                    <p style={{ fontSize: 14, color: "#6b7280", margin: "8px 0" }}>
                      {workOrder.content.length > 100 
                        ? `${workOrder.content.substring(0, 100)}...` 
                        : workOrder.content}
                    </p>
                    
                    <div style={{ display: "flex", gap: 16, fontSize: 13, color: "#6b7280", marginTop: 12 }}>
                      <span>📅 {new Date(workOrder.createdAt).toLocaleDateString("ko-KR")}</span>
                      {workOrder.dueDate && (
                        <span>⏰ 마감 {new Date(workOrder.dueDate).toLocaleDateString("ko-KR")}</span>
                      )}
                      {workOrder.confirmedAt && (
                        <span style={{ color: "#10b981" }}>✓ 완료: {new Date(workOrder.confirmedAt).toLocaleDateString("ko-KR")}</span>
                      )}
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
                      onClick={() => openDetailModal(workOrder)}
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
                      {workOrder.isConfirmed ? "상세보기" : "완료하기"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 업무지시 상세/완료 모달 */}
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
            maxWidth: 700,
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
                    background: getStatusColor(selectedWorkOrder.isConfirmed),
                    color: "white",
                    fontSize: 12,
                    fontWeight: "bold",
                    padding: "4px 10px",
                    borderRadius: 4,
                  }}>
                    {getStatusLabel(selectedWorkOrder.isConfirmed)}
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
                  setCompletionReport("");
                  setError("");
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
              {selectedWorkOrder.content}
            </div>

            <div style={{ fontSize: 14, color: "#6b7280", marginBottom: 24 }}>
              <div>📅 작성일: {new Date(selectedWorkOrder.createdAt).toLocaleString("ko-KR")}</div>
              {selectedWorkOrder.dueDate && (
                <div>⏰ 마감일: {new Date(selectedWorkOrder.dueDate).toLocaleString("ko-KR")}</div>
              )}
              {selectedWorkOrder.confirmedAt && (
                <div style={{ color: "#10b981" }}>✓ 완료일시: {new Date(selectedWorkOrder.confirmedAt).toLocaleString("ko-KR")}</div>
              )}
            </div>

            {/* 완료 보고서 입력 또는 보기 */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: "block", marginBottom: 8, fontWeight: "600", fontSize: 16 }}>
                {selectedWorkOrder.isConfirmed ? "완료 보고서" : "완료 보고서 작성"}
              </label>
              <textarea
                value={completionReport}
                onChange={(e) => setCompletionReport(e.target.value)}
                placeholder="업무 완료 내용을 상세히 작성해주세요..."
                rows={8}
                disabled={selectedWorkOrder.isConfirmed}
                style={{
                  width: "100%",
                  padding: 12,
                  border: "1px solid #d1d5db",
                  borderRadius: 8,
                  fontSize: 14,
                  resize: "vertical",
                  background: selectedWorkOrder.isConfirmed ? "#f9fafb" : "white",
                }}
              />
            </div>

            {/* 완료 버튼 (완료되지 않은 경우만) */}
            {!selectedWorkOrder.isConfirmed && (
              <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
                <button
                  onClick={completeWorkOrder}
                  disabled={isCompletingTask || !completionReport.trim()}
                  style={{
                    padding: "12px 32px",
                    background: isCompletingTask || !completionReport.trim() ? "#9ca3af" : "#10b981",
                    color: "white",
                    border: "none",
                    borderRadius: 8,
                    fontSize: 16,
                    fontWeight: "600",
                    cursor: isCompletingTask || !completionReport.trim() ? "not-allowed" : "pointer",
                  }}
                >
                  {isCompletingTask ? "처리 중..." : "✓ 완료하기"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
