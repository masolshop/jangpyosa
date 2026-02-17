"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/api";
import { setToken, setUserRole } from "@/lib/auth";

export default function LoginPage() {
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
    setMsg("");
    setLoading(true);
    try {
      // 하이픈 제거
      const cleanPhone = phone.replace(/\D/g, "");
      
      const out = await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify({ phone: cleanPhone, password }),
      });
      
      setToken(out.accessToken);
      setUserRole(out.user.role);
      
      // 사용자 정보 로컬스토리지 저장
      localStorage.setItem("user", JSON.stringify(out.user));
      
      setMsg("로그인 성공!");
      
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
      setMsg("로그인 실패: " + (e.message || "핸드폰 번호 또는 비밀번호를 확인하세요"));
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
          <p style={{ fontWeight: 600, marginBottom: 8 }}>💡 테스트 계정</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '4px 8px', fontSize: 11 }}>
            <span style={{ fontWeight: 600 }}>슈퍼어드민:</span>
            <span>010-1234-5678 / admin1234</span>
            
            <span style={{ fontWeight: 600 }}>매니저 1:</span>
            <span>010-9876-5432 / agent1234</span>
            
            <span style={{ fontWeight: 600 }}>매니저 2:</span>
            <span>010-8765-4321 / agent1234</span>
            
            <span style={{ fontWeight: 600 }}>표준사업장:</span>
            <span>010-9999-8888 / test1234</span>
            
            <span style={{ fontWeight: 600 }}>부담금기업:</span>
            <span>010-5555-6666 / test1234</span>
          </div>
        </div>
        
        <div
          style={{
            marginTop: 16,
            padding: 12,
            background: "#e7f3ff",
            borderRadius: 8,
            fontSize: 12,
            color: "#0070f3",
          }}
        >
          <p style={{ margin: 0, fontWeight: 600 }}>
            ℹ️ 회원 유형은 가입 시 선택하며, 로그인 후 자동으로 인식됩니다
          </p>
        </div>
      </div>
    </div>
  );
}
