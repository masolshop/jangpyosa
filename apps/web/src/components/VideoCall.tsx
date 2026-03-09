"use client";

import React, { useEffect } from 'react';

interface VideoCallProps {
  roomName: string;
  userName?: string;
  onClose?: () => void;
}

const VideoCall: React.FC<VideoCallProps> = ({ 
  roomName, 
  userName = "사용자",
  onClose 
}) => {
  useEffect(() => {
    // Jitsi Meet External API 스크립트 로드
    const script = document.createElement('script');
    script.src = 'https://meet.jangpyosa.com/external_api.js';
    script.async = true;
    script.onload = () => initJitsi();
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const initJitsi = () => {
    const domain = 'meet.jangpyosa.com';
    const options = {
      roomName: roomName,
      width: '100%',
      height: '100%',
      parentNode: document.querySelector('#jitsi-container'),
      userInfo: {
        displayName: userName
      },
      configOverwrite: {
        startWithAudioMuted: true,
        startWithVideoMuted: false,
        prejoinPageEnabled: false,
      },
      interfaceConfigOverwrite: {
        SHOW_JITSI_WATERMARK: false,
        SHOW_WATERMARK_FOR_GUESTS: false,
        DEFAULT_BACKGROUND: '#474747',
        TOOLBAR_BUTTONS: [
          'microphone', 'camera', 'closedcaptions', 'desktop', 'fullscreen',
          'fodeviceselection', 'hangup', 'profile', 'chat', 'recording',
          'livestreaming', 'etherpad', 'sharedvideo', 'settings', 'raisehand',
          'videoquality', 'filmstrip', 'invite', 'feedback', 'stats', 'shortcuts',
          'tileview', 'videobackgroundblur', 'download', 'help', 'mute-everyone',
        ],
      }
    };

    // @ts-ignore
    const api = new window.JitsiMeetExternalAPI(domain, options);

    api.addEventListener('readyToClose', () => {
      api.dispose();
      if (onClose) onClose();
    });
  };

  return (
    <div style={{
      width: '100%',
      height: '600px',
      borderRadius: '12px',
      overflow: 'hidden',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
    }}>
      <div id="jitsi-container" style={{ width: '100%', height: '100%' }}></div>
    </div>
  );
};

export default VideoCall;
