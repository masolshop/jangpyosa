"use client";

import { useNotifications } from "@/lib/useNotifications";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function NotificationCenter() {
  const router = useRouter();
  const {
    notifications,
    unreadCount,
    isConnected,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    requestNotificationPermission,
  } = useNotifications();

  const [isOpen, setIsOpen] = useState(false);

  // 컴포넌트 마운트 시 브라우저 알림 권한 요청
  useEffect(() => {
    requestNotificationPermission();
  }, []);

  function handleNotificationClick(notification: any) {
    // 읽음 처리
    if (!notification.read && notification.id) {
      markAsRead(notification.id);
    }

    // 링크가 있으면 페이지 이동
    if (notification.link) {
      router.push(notification.link);
      setIsOpen(false);
    }
  }

  function getNotificationIcon(type: string) {
    switch (type) {
      case "ANNOUNCEMENT":
        return "📢";
      case "WORK_ORDER":
        return "📋";
      case "ATTENDANCE":
        return "⏰";
      case "SYSTEM":
        return "⚙️";
      default:
        return "🔔";
    }
  }

  function getNotificationColor(type: string) {
    switch (type) {
      case "ANNOUNCEMENT":
        return "#3b82f6"; // blue
      case "WORK_ORDER":
        return "#10b981"; // green
      case "ATTENDANCE":
        return "#f59e0b"; // orange
      case "SYSTEM":
        return "#6b7280"; // gray
      default:
        return "#8b5cf6"; // purple
    }
  }

  function formatTime(dateString: string) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "방금 전";
    if (minutes < 60) return `${minutes}분 전`;
    if (hours < 24) return `${hours}시간 전`;
    if (days < 7) return `${days}일 전`;
    return date.toLocaleDateString("ko-KR");
  }

  return (
    <div style={{ position: "relative" }}>
      {/* 알림 벨 버튼 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: "relative",
          padding: "8px 12px",
          background: isOpen ? "#f3f4f6" : "transparent",
          border: "none",
          borderRadius: 8,
          cursor: "pointer",
          fontSize: 20,
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
        title="알림"
      >
        🔔
        {unreadCount > 0 && (
          <span
            style={{
              position: "absolute",
              top: 4,
              right: 4,
              background: "#ef4444",
              color: "white",
              fontSize: 11,
              fontWeight: "bold",
              padding: "2px 6px",
              borderRadius: "50%",
              minWidth: 18,
              height: 18,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
        {!isConnected && (
          <span
            style={{
              position: "absolute",
              bottom: 4,
              right: 4,
              width: 8,
              height: 8,
              background: "#ef4444",
              borderRadius: "50%",
            }}
            title="연결 끊김"
          />
        )}
      </button>

      {/* 알림 드롭다운 */}
      {isOpen && (
        <>
          {/* 오버레이 */}
          <div
            onClick={() => setIsOpen(false)}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 999,
            }}
          />

          {/* 알림 패널 */}
          <div
            style={{
              position: "absolute",
              top: "calc(100% + 8px)",
              right: 0,
              width: 400,
              maxWidth: "90vw",
              maxHeight: "70vh",
              background: "white",
              border: "1px solid #e5e7eb",
              borderRadius: 12,
              boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
              zIndex: 1000,
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* 헤더 */}
            <div
              style={{
                padding: "16px 20px",
                borderBottom: "1px solid #e5e7eb",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: "600" }}>
                  알림
                </h3>
                {unreadCount > 0 && (
                  <p style={{ margin: "4px 0 0 0", fontSize: 12, color: "#6b7280" }}>
                    {unreadCount}개의 새 알림
                  </p>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  style={{
                    padding: "6px 12px",
                    background: "#f3f4f6",
                    border: "none",
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: "600",
                    color: "#3b82f6",
                    cursor: "pointer",
                  }}
                >
                  모두 읽음
                </button>
              )}
            </div>

            {/* 알림 목록 */}
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "8px 0",
              }}
            >
              {notifications.length === 0 ? (
                <div
                  style={{
                    padding: 40,
                    textAlign: "center",
                    color: "#9ca3af",
                  }}
                >
                  <div style={{ fontSize: 48, marginBottom: 12 }}>🔕</div>
                  <p style={{ margin: 0 }}>알림이 없습니다</p>
                </div>
              ) : (
                notifications.map((notification, index) => (
                  <div
                    key={notification.id || index}
                    onClick={() => handleNotificationClick(notification)}
                    style={{
                      padding: "12px 20px",
                      borderBottom: index < notifications.length - 1 ? "1px solid #f3f4f6" : "none",
                      background: notification.read ? "transparent" : "#eff6ff",
                      cursor: notification.link ? "pointer" : "default",
                      transition: "background 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      if (notification.link) {
                        e.currentTarget.style.background = "#dbeafe";
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = notification.read ? "transparent" : "#eff6ff";
                    }}
                  >
                    <div style={{ display: "flex", gap: 12 }}>
                      {/* 아이콘 */}
                      <div
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: "50%",
                          background: getNotificationColor(notification.type) + "20",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 20,
                          flexShrink: 0,
                        }}
                      >
                        {getNotificationIcon(notification.type)}
                      </div>

                      {/* 내용 */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "start",
                            gap: 8,
                          }}
                        >
                          <h4
                            style={{
                              margin: 0,
                              fontSize: 14,
                              fontWeight: "600",
                              color: "#1f2937",
                            }}
                          >
                            {notification.title}
                          </h4>
                          {notification.id && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNotification(notification.id!);
                              }}
                              style={{
                                padding: 4,
                                background: "transparent",
                                border: "none",
                                cursor: "pointer",
                                fontSize: 16,
                                color: "#9ca3af",
                                flexShrink: 0,
                              }}
                              title="삭제"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                        <p
                          style={{
                            margin: "4px 0 0 0",
                            fontSize: 13,
                            color: "#6b7280",
                            lineHeight: 1.4,
                          }}
                        >
                          {notification.message}
                        </p>
                        {notification.createdAt && (
                          <p
                            style={{
                              margin: "6px 0 0 0",
                              fontSize: 11,
                              color: "#9ca3af",
                            }}
                          >
                            {formatTime(notification.createdAt)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* 푸터 */}
            <div
              style={{
                padding: "12px 20px",
                borderTop: "1px solid #e5e7eb",
                textAlign: "center",
              }}
            >
              <button
                onClick={() => {
                  router.push("/dashboard/notifications");
                  setIsOpen(false);
                }}
                style={{
                  width: "100%",
                  padding: "8px",
                  background: "transparent",
                  border: "none",
                  borderRadius: 6,
                  fontSize: 13,
                  fontWeight: "600",
                  color: "#3b82f6",
                  cursor: "pointer",
                }}
              >
                모든 알림 보기
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
