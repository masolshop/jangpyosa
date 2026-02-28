"use client";

import { useState, useEffect, useRef } from "react";
import { getToken } from "@/lib/auth";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  read: boolean;
  priority: string;
  category: string;
  createdAt: string;
}

interface NotificationDropdownProps {
  onUnreadCountChange?: (count: number) => void;
}

export default function NotificationDropdown({ onUnreadCountChange }: NotificationDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 알림 목록 조회
  const fetchNotifications = async () => {
    try {
      const token = getToken();
      if (!token) return;

      setLoading(true);
      const response = await fetch(`${API_BASE}/notifications?limit=10`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
        
        if (onUnreadCountChange) {
          onUnreadCountChange(data.unreadCount || 0);
        }
      }
    } catch (error) {
      console.error('알림 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  // 알림 읽음 처리
  const markAsRead = async (id: string) => {
    try {
      const token = getToken();
      if (!token) return;

      const response = await fetch(`${API_BASE}/notifications/${id}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        // 로컬 상태 업데이트
        setNotifications(prev =>
          prev.map(n => (n.id === id ? { ...n, read: true } : n))
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
        
        if (onUnreadCountChange) {
          onUnreadCountChange(Math.max(0, unreadCount - 1));
        }
      }
    } catch (error) {
      console.error('알림 읽음 처리 실패:', error);
    }
  };

  // 모든 알림 읽음 처리
  const markAllAsRead = async () => {
    try {
      const token = getToken();
      if (!token) return;

      const response = await fetch(`${API_BASE}/notifications/mark-all-read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        setUnreadCount(0);
        
        if (onUnreadCountChange) {
          onUnreadCountChange(0);
        }
      }
    } catch (error) {
      console.error('모든 알림 읽음 처리 실패:', error);
    }
  };

  // 알림 클릭 처리
  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }

    if (notification.link) {
      window.location.href = notification.link;
    }
    
    setIsOpen(false);
  };

  // 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 초기 조회 (폴링 제거 - Sidebar에서 처리)
  useEffect(() => {
    if (isOpen) {
      fetchNotifications(); // 드롭다운이 열릴 때만 조회
    }
  }, [isOpen]);

  // 아이콘 매핑
  const getIconForType = (type: string) => {
    const iconMap: Record<string, string> = {
      LEAVE_REQUEST: '🏖️',
      LEAVE_APPROVED: '✅',
      LEAVE_REJECTED: '❌',
      LEAVE_EXPIRING: '⏰',
      LEAVE_LOW_BALANCE: '📊',
      WORK_ORDER_ASSIGNED: '📋',
      WORK_ORDER_COMPLETED: '✅',
      ANNOUNCEMENT: '📢',
      SYSTEM: '🔔',
    };
    return iconMap[type] || '🔔';
  };

  // 시간 표시 포맷
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}일 전`;
    if (hours > 0) return `${hours}시간 전`;
    if (minutes > 0) return `${minutes}분 전`;
    return '방금 전';
  };

  return (
    <div ref={dropdownRef} style={{ position: 'relative', display: 'inline-block' }}>
      {/* 알림 벨 버튼 */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) fetchNotifications();
        }}
        style={{
          position: 'relative',
          background: 'transparent',
          border: 'none',
          fontSize: 24,
          cursor: 'pointer',
          padding: 8,
          color: '#fff',
          transition: 'all 0.2s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
        }}
      >
        🔔
        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              minWidth: 20,
              height: 20,
              padding: '0 6px',
              fontSize: 11,
              fontWeight: 'bold',
              color: 'white',
              background: '#ef4444',
              borderRadius: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* 드롭다운 */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: 8,
            width: 380,
            maxHeight: 500,
            background: 'white',
            borderRadius: 8,
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            zIndex: 2000,
            overflow: 'hidden',
          }}
        >
          {/* 헤더 */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '16px 20px',
              borderBottom: '1px solid #e5e7eb',
              background: '#f9fafb',
            }}
          >
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#111' }}>
              알림 {unreadCount > 0 && `(${unreadCount})`}
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#0070f3',
                  fontSize: 13,
                  cursor: 'pointer',
                  padding: '4px 8px',
                }}
              >
                모두 읽음
              </button>
            )}
          </div>

          {/* 알림 목록 */}
          <div style={{ maxHeight: 400, overflowY: 'auto' }}>
            {loading ? (
              <div style={{ padding: 40, textAlign: 'center', color: '#999' }}>
                로딩 중...
              </div>
            ) : notifications.length === 0 ? (
              <div style={{ padding: 40, textAlign: 'center', color: '#999' }}>
                알림이 없습니다
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  style={{
                    padding: '16px 20px',
                    borderBottom: '1px solid #f3f4f6',
                    cursor: 'pointer',
                    background: notification.read ? 'white' : '#eff6ff',
                    transition: 'background 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = notification.read ? '#f9fafb' : '#dbeafe';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = notification.read ? 'white' : '#eff6ff';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    <div style={{ fontSize: 24, lineHeight: 1 }}>
                      {getIconForType(notification.type)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                        <h4
                          style={{
                            margin: 0,
                            fontSize: 14,
                            fontWeight: notification.read ? 400 : 600,
                            color: '#111',
                          }}
                        >
                          {notification.title}
                        </h4>
                        {!notification.read && (
                          <span
                            style={{
                              display: 'inline-block',
                              width: 8,
                              height: 8,
                              background: '#0070f3',
                              borderRadius: '50%',
                              marginLeft: 8,
                              flexShrink: 0,
                            }}
                          />
                        )}
                      </div>
                      <p
                        style={{
                          margin: '4px 0',
                          fontSize: 13,
                          color: '#666',
                          lineHeight: 1.5,
                        }}
                      >
                        {notification.message}
                      </p>
                      <span style={{ fontSize: 12, color: '#999' }}>
                        {formatTime(notification.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* 푸터 */}
          {notifications.length > 0 && (
            <div
              style={{
                padding: '12px 20px',
                borderTop: '1px solid #e5e7eb',
                textAlign: 'center',
                background: '#f9fafb',
              }}
            >
              <a
                href="/notifications"
                style={{
                  fontSize: 13,
                  color: '#0070f3',
                  textDecoration: 'none',
                  fontWeight: 500,
                }}
              >
                모든 알림 보기 →
                </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
