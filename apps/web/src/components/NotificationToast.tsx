"use client";

import { useEffect, useState } from 'react';
import { useWebSocket } from '@/hooks/useWebSocket';

interface NotificationToastProps {
  token: string | null;
}

export default function NotificationToast({ token }: NotificationToastProps) {
  const { isConnected, lastNotification, requestNotificationPermission } = useWebSocket(token);
  const [show, setShow] = useState(false);
  const [currentNotification, setCurrentNotification] = useState<any>(null);

  // 브라우저 알림 권한 요청
  useEffect(() => {
    requestNotificationPermission();
  }, [requestNotificationPermission]);

  // 새 알림이 오면 토스트 표시
  useEffect(() => {
    if (lastNotification) {
      setCurrentNotification(lastNotification);
      setShow(true);
      
      // 5초 후 자동 숨김
      const timer = setTimeout(() => {
        setShow(false);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [lastNotification]);

  if (!show || !currentNotification) {
    return null;
  }

  const getBuyerTypeColor = (type: string) => {
    switch (type) {
      case 'PRIVATE_COMPANY': return 'bg-green-500';
      case 'PUBLIC_INSTITUTION': return 'bg-purple-500';
      case 'GOVERNMENT': return 'bg-orange-500';
      default: return 'bg-blue-500';
    }
  };

  const getBuyerTypeLabel = (type: string) => {
    switch (type) {
      case 'PRIVATE_COMPANY': return '민간기업';
      case 'PUBLIC_INSTITUTION': return '공공기관';
      case 'GOVERNMENT': return '정부기관';
      default: return type;
    }
  };

  return (
    <>
      {/* WebSocket 연결 상태 표시 (개발용) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed top-2 right-2 z-50">
          <div className={`px-2 py-1 rounded text-xs ${isConnected ? 'bg-green-500' : 'bg-red-500'} text-white`}>
            {isConnected ? '🟢 연결됨' : '🔴 연결 안됨'}
          </div>
        </div>
      )}

      {/* 알림 토스트 */}
      <div className="fixed top-20 right-4 z-50 max-w-md animate-slide-in">
        <div className="bg-white rounded-lg shadow-2xl border-l-4 border-blue-500 p-4 hover:shadow-3xl transition-all">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                <span className="text-2xl">🎉</span>
              </div>
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-lg font-bold text-gray-900 mb-1">
                {currentNotification.title}
              </h3>
              <p className="text-sm text-gray-600 mb-2">
                {currentNotification.message}
              </p>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded text-xs font-medium text-white ${getBuyerTypeColor(currentNotification.data.buyerType)}`}>
                  {getBuyerTypeLabel(currentNotification.data.buyerType)}
                </span>
                <span className="text-xs text-gray-500">
                  {new Date(currentNotification.timestamp).toLocaleTimeString('ko-KR')}
                </span>
              </div>
            </div>
            <button
              onClick={() => setShow(false)}
              className="ml-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </>
  );
}
