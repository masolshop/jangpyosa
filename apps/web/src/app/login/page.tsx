"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/api";
import { setToken, setUserRole } from "@/lib/auth";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPw] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  async function onLogin() {
    setMsg("");
    setLoading(true);
    try {
      const out = await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      setToken(out.accessToken);
      setUserRole(out.user.role);
      setMsg("로그인 성공!");
      setTimeout(() => {
        window.location.href = "/catalog";
      }, 1000);
    } catch (e: any) {
      setMsg("로그인 실패: " + e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container">
      <div className="card" style={{ maxWidth: 420, margin: "40px auto" }}>
        <h1>로그인</h1>
        <p style={{ marginTop: 8, color: "#666" }}>장표사닷컴에 오신 것을 환영합니다</p>

        <div style={{ marginTop: 24 }}>
          <label>이메일</label>
          <input
            type="email"
            placeholder="email@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <label>비밀번호</label>
          <input
            type="password"
            placeholder="비밀번호 (8자 이상)"
            value={password}
            onChange={(e) => setPw(e.target.value)}
          />

          <button
            onClick={onLogin}
            disabled={loading}
            style={{ width: "100%", marginTop: 16 }}
          >
            {loading ? "로그인 중..." : "로그인"}
          </button>

          {msg && (
            <p className={msg.includes("성공") ? "success" : "error"}>{msg}</p>
          )}
        </div>

        <div style={{ marginTop: 24, textAlign: "center" }}>
          <p>
            계정이 없으신가요? <a href="/signup">회원가입</a>
          </p>
        </div>
      </div>
    </div>
  );
}
