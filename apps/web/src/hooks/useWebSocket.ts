import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 
  (typeof window !== 'undefined' && window.location.hostname === 'jangpyosa.com' 
    ? 'https://jangpyosa.com' 
    : 'http://localhost:4000');

interface ReferralNotification {
  id: string;
  type: 'referral_success';
  title: string;
  message: string;
  data: {
    companyName: string;
    buyerName: string;
    buyerType: string;
    agentId: string;
    agentName: string;
  };
  timestamp: string;
}

export function useWebSocket(token: string | null) {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState<ReferralNotification[]>([]);
  const [lastNotification, setLastNotification] = useState<ReferralNotification | null>(null);

  // 알림 추가
  const addNotification = useCallback((notification: ReferralNotification) => {
    setNotifications(prev => [notification, ...prev].slice(0, 50)); // 최대 50개
    setLastNotification(notification);
    
    // 브라우저 알림 (권한이 있으면)
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        tag: notification.id,
      });
    }
  }, []);

  // 알림 읽음 처리
  const markAsRead = useCallback((notificationId: string) => {
    if (socketRef.current) {
      socketRef.current.emit('mark-notification-read', notificationId);
    }
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
    );
  }, []);

  // 알림 권한 요청
  const requestNotificationPermission = useCallback(async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        await Notification.requestPermission();
      }
    }
  }, []);

  useEffect(() => {
    if (!token) {
      return;
    }

    // Socket.IO 연결
    const socket = io(API_BASE, {
      auth: {
        token,
      },
      transports: ['websocket', 'polling'],
      path: '/socket.io',
    });

    socketRef.current = socket;

    // 연결 이벤트
    socket.on('connect', () => {
      console.log('🔌 WebSocket 연결됨:', socket.id);
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('🔌 WebSocket 연결 해제');
      setIsConnected(false);
    });

    socket.on('connect_error', (error) => {
      console.error('❌ WebSocket 연결 오류:', error);
      setIsConnected(false);
    });

    // 추천 알림 수신
    socket.on('referral-notification', (notification: ReferralNotification) => {
      console.log('📢 추천 알림 수신:', notification);
      addNotification(notification);
    });

    // 알림 읽음 처리 확인
    socket.on('notification-marked-read', ({ notificationId }) => {
      console.log('✅ 알림 읽음 처리:', notificationId);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [token, addNotification]);

  return {
    isConnected,
    notifications,
    lastNotification,
    markAsRead,
    requestNotificationPermission,
  };
}
