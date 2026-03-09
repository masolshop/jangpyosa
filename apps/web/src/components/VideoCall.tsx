"use client";

import { useEffect, useRef } from 'react';

interface VideoCallProps {
  roomName: string;
  userName: string;
  onClose?: () => void;
}

declare global {
  interface Window {
    JitsiMeetExternalAPI: any;
  }
}

export default function VideoCall({ roomName, userName, onClose }: VideoCallProps) {
  const jitsiContainer = useRef<HTMLDivElement>(null);
  const apiRef = useRef<any>(null);

  useEffect(() => {
    // Jitsi Meet API 스크립트 로드
    const script = document.createElement('script');
    script.src = 'https://meet.jit.si/external_api.js';
    script.async = true;
    script.onload = () => initJitsi();
    document.body.appendChild(script);

    return () => {
      // 정리
      if (apiRef.current) {
        apiRef.current.dispose();
      }
      document.body.removeChild(script);
    };
  }, []);

  const initJitsi = () => {
    if (!jitsiContainer.current || !window.JitsiMeetExternalAPI) return;

    const domain = 'meet.jit.si';
    const options = {
      roomName: `jangpyosa-${roomName}`,
      width: '100%',
      height: '100%',
      parentNode: jitsiContainer.current,
      configOverwrite: {
        startWithAudioMuted: false,
        startWithVideoMuted: false,
        enableWelcomePage: false,
        prejoinPageEnabled: false,
        disableDeepLinking: true,
      },
      interfaceConfigOverwrite: {
        TOOLBAR_BUTTONS: [
          'microphone', 
          'camera', 
          'closedcaptions', 
          'desktop', 
          'fullscreen', 
          'hangup', 
          'chat',
          'tileview'
        ],
        SHOW_JITSI_WATERMARK: false,
        SHOW_WATERMARK_FOR_GUESTS: false,
        DEFAULT_LOGO_URL: '',
        DEFAULT_WELCOME_PAGE_LOGO_URL: '',
        SHOW_BRAND_WATERMARK: false,
        SHOW_POWERED_BY: false,
        MOBILE_APP_PROMO: false,
      },
      userInfo: {
        displayName: userName
      }
    };

    try {
      apiRef.current = new window.JitsiMeetExternalAPI(domain, options);

      // 이벤트 리스너
      apiRef.current.addEventListener('readyToClose', () => {
        if (onClose) {
          onClose();
        }
      });

      apiRef.current.addEventListener('videoConferenceJoined', () => {
        console.log('화상회의 입장 완료');
      });

      apiRef.current.addEventListener('videoConferenceLeft', () => {
        console.log('화상회의 퇴장');
        if (onClose) {
          onClose();
        }
      });
    } catch (error) {
      console.error('Jitsi 초기화 오류:', error);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: '#000',
      zIndex: 9999
    }}>
      {/* 닫기 버튼 */}
      <button
        onClick={() => {
          if (apiRef.current) {
            apiRef.current.executeCommand('hangup');
          }
          if (onClose) {
            onClose();
          }
        }}
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          zIndex: 10000,
          padding: '12px 24px',
          background: '#e74c3c',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontSize: '16px',
          fontWeight: '600',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(231, 76, 60, 0.4)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = '#c0392b';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = '#e74c3c';
        }}
      >
        ✕ 나가기
      </button>

      {/* Jitsi Meet 컨테이너 */}
      <div 
        ref={jitsiContainer}
        style={{
          width: '100%',
          height: '100%'
        }}
      />
    </div>
  );
}
