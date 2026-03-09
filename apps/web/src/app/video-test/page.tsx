"use client";

import { useState } from "react";
import VideoCall from "@/components/VideoCall";

export default function VideoTestPage() {
  const [inCall, setInCall] = useState(false);
  const [roomName, setRoomName] = useState("");
  const [userName, setUserName] = useState("");

  const handleStartCall = () => {
    if (roomName.trim() && userName.trim()) {
      setInCall(true);
    } else {
      alert("방 이름과 사용자 이름을 입력해주세요.");
    }
  };

  const handleEndCall = () => {
    setInCall(false);
  };

  if (inCall) {
    return <VideoCall roomName={roomName} userName={userName} onClose={handleEndCall} />;
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #e0f2f1 0%, #b2dfdb 50%, #80cbc4 100%)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      padding: "20px"
    }}>
      <div style={{
        width: "100%",
        maxWidth: "500px",
        background: "white",
        borderRadius: "24px",
        padding: "48px 32px",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12)"
      }}>
        <h1 style={{
          fontSize: "32px",
          fontWeight: "700",
          color: "#00695c",
          marginBottom: "32px",
          textAlign: "center"
        }}>
          🎥 화상회의 시작
        </h1>

        <div style={{ marginBottom: "24px" }}>
          <label style={{
            display: "block",
            marginBottom: "8px",
            fontSize: "14px",
            fontWeight: "600",
            color: "#424242"
          }}>
            회의 방 이름
          </label>
          <input
            type="text"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            placeholder="예: work-order-123"
            style={{
              width: "100%",
              padding: "14px 16px",
              fontSize: "15px",
              border: "1px solid #e0e0e0",
              borderRadius: "8px",
              outline: "none",
              transition: "all 0.2s",
              boxSizing: "border-box",
              background: "#fafafa"
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "#26a69a";
              e.target.style.background = "#ffffff";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "#e0e0e0";
              e.target.style.background = "#fafafa";
            }}
          />
        </div>

        <div style={{ marginBottom: "32px" }}>
          <label style={{
            display: "block",
            marginBottom: "8px",
            fontSize: "14px",
            fontWeight: "600",
            color: "#424242"
          }}>
            사용자 이름
          </label>
          <input
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="예: 홍길동"
            style={{
              width: "100%",
              padding: "14px 16px",
              fontSize: "15px",
              border: "1px solid #e0e0e0",
              borderRadius: "8px",
              outline: "none",
              transition: "all 0.2s",
              boxSizing: "border-box",
              background: "#fafafa"
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "#26a69a";
              e.target.style.background = "#ffffff";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "#e0e0e0";
              e.target.style.background = "#fafafa";
            }}
          />
        </div>

        <button
          onClick={handleStartCall}
          style={{
            width: "100%",
            padding: "16px",
            fontSize: "18px",
            fontWeight: "700",
            color: "white",
            background: "#00796b",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            transition: "all 0.2s",
            boxShadow: "0 2px 8px rgba(0, 121, 107, 0.3)"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#00695c";
            e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 121, 107, 0.4)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "#00796b";
            e.currentTarget.style.boxShadow = "0 2px 8px rgba(0, 121, 107, 0.3)";
          }}
        >
          🎥 화상회의 시작
        </button>

        <div style={{
          marginTop: "24px",
          padding: "16px",
          background: "#e8f5e9",
          borderRadius: "8px",
          fontSize: "13px",
          color: "#2e7d32"
        }}>
          <strong>💡 사용 방법:</strong>
          <ul style={{ marginTop: "8px", paddingLeft: "20px" }}>
            <li>같은 방 이름으로 입장하면 화상회의가 시작됩니다</li>
            <li>카메라와 마이크 권한을 허용해주세요</li>
            <li>무료 무제한 사용 가능합니다</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
