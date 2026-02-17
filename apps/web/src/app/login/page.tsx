"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/api";
import { setToken, setUserRole } from "@/lib/auth";

type UserType = "AGENT" | "SUPPLIER" | "BUYER" | "";

export default function LoginPage() {
  const [userType, setUserType] = useState<UserType>("");
  const [phone, setPhone] = useState("");
  const [password, setPw] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // 핸드폰 번호 포맷팅 (010-1234-5678)
  const formatPhone = (value: string) => {
    const cleaned = value.replace(/\D/g, "");
    if (cleaned.length <= 3) return cleaned;
    if (cleaned.length <= 7) return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7, 11)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setPhone(formatted);
  };

  async function onLogin() {
    // ✅ 유형 선택 필수 제거 - 핸드폰+비밀번호만 검증
    // if (!userType) {
    //   setMsg("회원 유형을 선택해주세요");
    //   return;
    // }

    setMsg("");
    setLoading(true);
    try {
      // 하이픈 제거
      const cleanPhone = phone.replace(/\D/g, "");
      
      const out = await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify({ 
          phone: cleanPhone, 
          password,
          // userType은 참고용으로만 전송 (백엔드에서 무시됨)
        }),
      });
      
      // ✅ 유형 불일치 검증 제거 - 가입된 유형으로 자동 로그인
      // 선택한 버튼과 상관없이 DB에 저장된 실제 유형으로 로그인됨
      
      setToken(out.accessToken);
      setUserRole(out.user.role);
      
      // 사용자 정보 로컬스토리지 저장
      localStorage.setItem("user", JSON.stringify(out.user));
      
      // 선택한 유형과 다르면 안내 메시지 표시
      if (userType && userType !== out.user.role && out.user.role !== "SUPER_ADMIN") {
        setMsg(`✅ ${getUserTypeLabel(out.user.role)} 계정으로 로그인되었습니다`);
      } else {
        setMsg("✅ 로그인 성공!");
      }
      
      // 역할별 리다이렉션
      setTimeout(() => {
        if (out.user.role === "SUPER_ADMIN") {
          window.location.href = "/admin/branches";
        } else if (out.user.role === "AGENT") {
          window.location.href = "/";
        } else if (out.user.role === "SUPPLIER") {
          window.location.href = "/supplier/profile";
        } else if (out.user.role === "BUYER") {
          window.location.href = "/catalog";
        } else {
          window.location.href = "/";
        }
      }, 1000);
    } catch (e: any) {
      setMsg("❌ 로그인 실패: " + (e.message || "핸드폰 번호 또는 비밀번호를 확인하세요"));
    } finally {
      setLoading(false);
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      onLogin();
    }
  };

  const getUserTypeLabel = (type: UserType) => {
    switch (type) {
      case "AGENT": return "매니저";
      case "SUPPLIER": return "표준사업장";
      case "BUYER": return "부담금기업";
      default: return "";
    }
  };

  return (
    <div className="container">
      <div className="card" style={{ maxWidth: 420, margin: "40px auto" }}>
        <h1>🔑 로그인</h1>
        <p style={{ marginTop: 8, color: "#666" }}>장표사닷컴에 오신 것을 환영합니다</p>

        <div style={{ marginTop: 24 }}>
          {/* 회원 유형 선택 */}
          <label style={{ fontWeight: 600, marginBottom: 8 }}>회원 유형</label>
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(3, 1fr)", 
            gap: 8,
            marginBottom: 16
          }}>
            <button
              type="button"
              onClick={() => setUserType("AGENT")}
              style={{
                padding: "12px 16px",
                border: `2px solid ${userType === "AGENT" ? "#0070f3" : "#ddd"}`,
                background: userType === "AGENT" ? "#e7f3ff" : "white",
                color: userType === "AGENT" ? "#0070f3" : "#666",
                borderRadius: 8,
                cursor: "pointer",
                fontSize: 14,
                fontWeight: userType === "AGENT" ? 600 : 400,
                transition: "all 0.2s"
              }}
            >
              👔 매니저
            </button>
            <button
              type="button"
              onClick={() => setUserType("SUPPLIER")}
              style={{
                padding: "12px 16px",
                border: `2px solid ${userType === "SUPPLIER" ? "#0070f3" : "#ddd"}`,
                background: userType === "SUPPLIER" ? "#e7f3ff" : "white",
                color: userType === "SUPPLIER" ? "#0070f3" : "#666",
                borderRadius: 8,
                cursor: "pointer",
                fontSize: 14,
                fontWeight: userType === "SUPPLIER" ? 600 : 400,
                transition: "all 0.2s"
              }}
            >
              🏭 표준사업장
            </button>
            <button
              type="button"
              onClick={() => setUserType("BUYER")}
              style={{
                padding: "12px 16px",
                border: `2px solid ${userType === "BUYER" ? "#0070f3" : "#ddd"}`,
                background: userType === "BUYER" ? "#e7f3ff" : "white",
                color: userType === "BUYER" ? "#0070f3" : "#666",
                borderRadius: 8,
                cursor: "pointer",
                fontSize: 14,
                fontWeight: userType === "BUYER" ? 600 : 400,
                transition: "all 0.2s"
              }}
            >
              🏢 부담금기업
            </button>
          </div>

          <label>핸드폰 번호</label>
          <input
            type="tel"
            placeholder="010-1234-5678"
            value={phone}
            onChange={handlePhoneChange}
            onKeyPress={handleKeyPress}
            maxLength={13}
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
            disabled={loading || !phone || !password}
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
          <p style={{ marginBottom: 8, fontWeight: 600 }}>💡 안내</p>
          <p style={{ marginBottom: 4 }}>
            • 회원 유형 버튼은 선택하지 않아도 로그인 가능합니다
          </p>
          <p style={{ marginBottom: 4 }}>
            • 핸드폰 번호와 비밀번호만으로 자동 로그인됩니다
          </p>
          <p style={{ marginBottom: 4 }}>
            • 가입하신 유형(매니저/표준사업장/부담금기업)으로 자동 접속됩니다
          </p>
          <p>
            • 회원가입 시 선택한 유형은 변경할 수 없습니다
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
          <p style={{ marginBottom: 8, fontWeight: 600 }}>🧪 테스트 계정</p>
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "auto 1fr 1fr",
            gap: "8px",
            fontSize: 12
          }}>
            <strong>슈퍼관리자:</strong>
            <span>010-1234-5678</span>
            <span>admin1234</span>
            
            <strong>매니저 1:</strong>
            <span>010-9876-5432</span>
            <span>agent1234</span>
            
            <strong>표준사업장:</strong>
            <span>010-8888-9999</span>
            <span>test1234</span>
            
            <strong>부담금기업:</strong>
            <span>010-5555-6666</span>
            <span>test1234</span>
          </div>
        </div>
      </div>

      <style jsx>{`
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
