"use client";

import { useEffect, useRef, useState } from "react";
import { API_BASE } from "./api";
import { getToken } from "./auth";

export interface Notification {
  id?: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  data?: any;
  read?: boolean;
  createdAt?: string;
}

// 토스트 매니저 (동적 import를 피하기 위해 여기서 직접 사용)
let showToast: ((title: string, message: string) => void) | null = null;

export function setToastManager(manager: any) {
  showToast = (title: string, message: string) => {
    manager.info(title, message);
  };
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);

  // SSE 연결 초기화
  useEffect(() => {
    const token = getToken();
    if (!token) {
      console.log("[SSE] 토큰이 없습니다. 연결하지 않습니다.");
      return;
    }

    // EventSource는 URL에 토큰을 쿼리 파라미터로 전달해야 함
    const eventSource = new EventSource(`${API_BASE}/notifications/stream?token=${token}`);
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      console.log("[SSE] 연결 성공");
      setIsConnected(true);
    };

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("[SSE] 새 알림:", data);

        if (data.type === "connected") {
          // 초기 연결 메시지는 무시
          return;
        }

        // 새 알림 추가
        setNotifications((prev) => [data, ...prev]);
        setUnreadCount((prev) => prev + 1);

        // 토스트 알림 표시
        if (showToast) {
          showToast(data.title, data.message);
        }

        // 브라우저 알림 권한이 있으면 데스크톱 알림 표시
        if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
          new Notification(data.title, {
            body: data.message,
            icon: "/favicon.ico",
            tag: data.type,
          });
        }
      } catch (error) {
        console.error("[SSE] 메시지 파싱 오류:", error);
      }
    };

    eventSource.onerror = (error) => {
      console.error("[SSE] 연결 오류:", error);
      setIsConnected(false);
      eventSource.close();
    };

    // 정리
    return () => {
      console.log("[SSE] 연결 종료");
      eventSource.close();
    };
  }, []);

  // 초기 알림 목록 로드
  useEffect(() => {
    loadNotifications();
  }, []);

  async function loadNotifications() {
    try {
      const token = getToken();
      if (!token) return;

      const res = await fetch(`${API_BASE}/notifications`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        
        const unread = (data.notifications || []).filter((n: any) => !n.read).length;
        setUnreadCount(unread);
      }
    } catch (error) {
      console.error("알림 목록 로드 실패:", error);
    }
  }

  // 알림 읽음 처리
  async function markAsRead(notificationId: string) {
    try {
      const token = getToken();
      if (!token) return;

      const res = await fetch(`${API_BASE}/notifications/${notificationId}/read`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notificationId ? { ...n, read: true } : n
          )
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error("알림 읽음 처리 실패:", error);
    }
  }

  // 모든 알림 읽음 처리
  async function markAllAsRead() {
    try {
      const token = getToken();
      if (!token) return;

      const res = await fetch(`${API_BASE}/notifications/read-all`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        setNotifications((prev) =>
          prev.map((n) => ({ ...n, read: true }))
        );
        setUnreadCount(0);
      }
    } catch (error) {
      console.error("모든 알림 읽음 처리 실패:", error);
    }
  }

  // 알림 삭제
  async function deleteNotification(notificationId: string) {
    try {
      const token = getToken();
      if (!token) return;

      const res = await fetch(`${API_BASE}/notifications/${notificationId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
        
        const notification = notifications.find((n) => n.id === notificationId);
        if (notification && !notification.read) {
          setUnreadCount((prev) => Math.max(0, prev - 1));
        }
      }
    } catch (error) {
      console.error("알림 삭제 실패:", error);
    }
  }

  // 브라우저 알림 권한 요청
  function requestNotificationPermission() {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission().then((permission) => {
        console.log("[알림] 권한:", permission);
      });
    }
  }

  return {
    notifications,
    unreadCount,
    isConnected,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    requestNotificationPermission,
    loadNotifications,
  };
}
