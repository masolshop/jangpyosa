"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/api";
import { setToken, setUserRole } from "@/lib/auth";

export default function LoginPage() {
  const [identifier, setIdentifier] = useState(""); // phone 또는 username
  const [password, setPw] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  async function onLogin() {
    if (!identifier || !password) {
      setMsg("❌ 아이디/핸드폰 번호와 비밀번호를 입력하세요");
      return;
    }

    setMsg("");
    setLoading(true);
    try {
      // 전화번호/아이디에서 하이픈 제거
      const cleanIdentifier = identifier.replace(/[-\s]/g, "");
      
      const out = await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify({ 
          identifier: cleanIdentifier,
          password
        }),
      });

      setToken(out.accessToken);
      setUserRole(out.user.role);
      
      // 사용자 정보 로컬스토리지 저장
      localStorage.setItem("user", JSON.stringify(out.user));
      
      setMsg("✅ 로그인 성공!");
      
      // 역할별 자동 리다이렉션
      setTimeout(() => {
        if (out.user.role === "SUPER_ADMIN") {
          // 슈퍼어드민 → 지사 관리
          window.location.href = "/admin/branches";
        } else if (out.user.role === "AGENT") {
          // 매니저 → 홈
          window.location.href = "/";
        } else if (out.user.role === "SUPPLIER") {
          // 표준사업장 → 기업회원 대시보드
          window.location.href = "/dashboard";
        } else if (out.user.role === "BUYER") {
          // 고용의무기업 → 기업회원 대시보드
          window.location.href = "/dashboard";
        } else {
          window.location.href = "/";
        }
      }, 1000);
    } catch (e: any) {
      console.error("Login error:", e);
      
      // 에러 메시지 개선
      let errorMsg = "로그인에 실패했습니다. 다시 시도해주세요.";
      
      if (e.data?.error === "INVALID_CREDENTIALS") {
        errorMsg = "아이디 또는 비밀번호가 일치하지 않습니다. 다시 확인해주세요.";
      } else if (e.message) {
        errorMsg = e.message;
      }
      
      setMsg(`❌ ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      onLogin();
    }
  };

  return (
    <div className="container">
      <div className="card" style={{ maxWidth: 420, margin: "40px auto" }}>
        <h1>🔑 로그인</h1>
        <p style={{ marginTop: 8, color: "#666" }}>장표사닷컴에 오신 것을 환영합니다</p>

        <div style={{ marginTop: 24 }}>
          <form onSubmit={(e) => { e.preventDefault(); onLogin(); }}>

          <label>아이디 또는 핸드폰 번호</label>
          <input
            type="text"
            placeholder="영문+숫자 ID 또는 010-1234-5678"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            onKeyPress={handleKeyPress}
            style={{ fontSize: 16 }}
          />

          <label>비밀번호</label>
          <input
            type="password"
            placeholder="비밀번호 (8자 이상)"
            value={password}
            onChange={(e) => setPw(e.target.value)}
            onKeyPress={handleKeyPress}
            style={{ fontSize: 16 }}
          />

          <button
            onClick={onLogin}
            disabled={loading || !identifier || !password}
            style={{ width: "100%", marginTop: 16 }}
          >
            {loading ? "로그인 중..." : "로그인"}
          </button>

          {msg && (
            <p
              style={{
                marginTop: 12,
                padding: 12,
                borderRadius: 6,
                fontSize: 14,
                background: msg.includes("성공") ? "#e7f3ff" : "#ffe7e7",
                color: msg.includes("성공") ? "#0070f3" : "#d32f2f",
              }}
            >
              {msg}
            </p>
          )}
          </form>
        </div>

        <div style={{ marginTop: 24, textAlign: "center", fontSize: 14 }}>
          <p style={{ marginBottom: 12 }}>
            <a
              href="/forgot-password"
              style={{ color: "#666", textDecoration: "underline" }}
            >
              비밀번호를 잊으셨나요?
            </a>
          </p>
          <p style={{ color: "#666" }}>
            계정이 없으신가요?{" "}
            <a href="/signup" style={{ color: "#0070f3", fontWeight: 600 }}>
              회원가입
            </a>
          </p>
        </div>

        <div
          style={{
            marginTop: 32,
            padding: 16,
            background: "#f5f5f5",
            borderRadius: 8,
            fontSize: 12,
            color: "#666",
          }}
        >
          <p style={{ marginBottom: 8, fontWeight: 600 }}>💡 회원 구분</p>
          <p style={{ marginBottom: 8 }}>
            <strong>🏢 고용의무기업</strong>: 장애인 고용부담금 납부 대상 기업<br/>
            <strong>🏭 표준사업장</strong>: 장애인표준사업장 인증 기업<br/>
            <strong>👔 매니저</strong>: 지사 소속 영업 담당자
          </p>
          <p style={{ padding: 10, background: "#e7f3ff", borderRadius: 6, color: "#0070f3", fontSize: 13 }}>
            ℹ️ 로그인 시 회원 유형이 자동으로 인식됩니다.
          </p>
        </div>

        <div
          style={{
            marginTop: 16,
            padding: 16,
            background: "#fff3cd",
            borderRadius: 8,
            fontSize: 13,
          }}
        >
          <p style={{ marginBottom: 12, fontWeight: 600, color: "#856404" }}>🧪 테스트 계정</p>
          
          {/* 슈퍼어드민 & 매니저 */}
          <div style={{ marginBottom: 16 }}>
            <p style={{ fontSize: 12, fontWeight: 600, marginBottom: 8, color: "#666" }}>관리자 계정</p>
            <div style={{ 
              display: "grid", 
              gridTemplateColumns: "auto 1fr 1fr",
              gap: "6px",
              fontSize: 12
            }}>
              <strong>슈퍼어드민:</strong>
              <span>superadmin 또는 01063529091</span>
              <span>01063529091</span>
              
              <strong>매니저:</strong>
              <span>010-9876-5432</span>
              <span>agent1234</span>
            </div>
          </div>

          {/* 표준사업장 */}
          <div style={{ marginBottom: 16 }}>
            <p style={{ fontSize: 12, fontWeight: 600, marginBottom: 8, color: "#666" }}>표준사업장 계정</p>
            <div style={{ 
              display: "grid", 
              gridTemplateColumns: "auto 1fr 1fr",
              gap: "6px",
              fontSize: 12
            }}>
              <strong>ID:</strong>
              <span>supplier01</span>
              <span>test1234</span>
            </div>
          </div>

          {/* 고용의무기업 */}
          <div>
            <p style={{ fontSize: 12, fontWeight: 600, marginBottom: 8, color: "#666" }}>고용의무기업 계정</p>
            <div style={{ 
              display: "grid", 
              gridTemplateColumns: "auto 1fr 1fr",
              gap: "6px",
              fontSize: 12
            }}>
              <strong style={{ color: "#0070f3" }}>민간1 (3.1%):</strong>
              <span>buyer01</span>
              <span>test1234</span>
              
              <strong style={{ color: "#0070f3" }}>민간2 (3.1%):</strong>
              <span>buyer02</span>
              <span>test1234</span>
              
              <strong style={{ color: "#059669" }}>공공1 (3.8%):</strong>
              <span>buyer03</span>
              <span>test1234</span>
              
              <strong style={{ color: "#059669" }}>공공2 (3.8%):</strong>
              <span>buyer04</span>
              <span>test1234</span>
              
              <strong style={{ color: "#dc2626" }}>국가1 (3.8%+감면):</strong>
              <span>buyer05</span>
              <span>test1234</span>
              
              <strong style={{ color: "#dc2626" }}>국가2 (3.8%+감면):</strong>
              <span>buyer06</span>
              <span>test1234</span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 20px;
        }
        .card {
          background: white;
          border-radius: 12px;
          padding: 32px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
        }
        label {
          display: block;
          margin-bottom: 8px;
          margin-top: 16px;
          font-weight: 500;
          color: #333;
        }
        input {
          width: 100%;
          padding: 12px;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 14px;
        }
        input:focus {
          outline: none;
          border-color: #0070f3;
        }
        button {
          padding: 12px 24px;
          background: #0070f3;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        button:hover:not(:disabled) {
          background: #0051cc;
        }
        button:disabled {
          background: #ccc;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}
