"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { API_BASE } from "@/lib/api";

export default function EmployeeLoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    phone: "",
    password: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/auth/login/employee`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: form.phone,
          password: form.password,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.message || json.error || "로그인 실패");
      }

      // 토큰 저장
      localStorage.setItem("token", json.accessToken);
      localStorage.setItem("accessToken", json.accessToken); // getToken()용
      localStorage.setItem("refreshToken", json.refreshToken);
      localStorage.setItem("user", JSON.stringify(json.user));
      localStorage.setItem("userRole", json.user.role); // getUserRole()용

      alert(`✅ ${json.user.name}님, 환영합니다!`);
      // 페이지 새로고침을 통해 Sidebar가 userRole을 다시 읽도록 함
      window.location.href = "/employee/attendance";
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container">
      <div className="card" style={{ maxWidth: "500px", margin: "40px auto" }}>
        <h1 style={{ textAlign: "center" }}>👷 직원 로그인</h1>
        <p style={{ textAlign: "center", color: "#666", marginTop: 8, marginBottom: 32 }}>
          장애인 직원 전용 로그인
        </p>

        {error && (
          <div
            style={{
              padding: 16,
              background: "#fee2e2",
              color: "#991b1b",
              borderRadius: 8,
              marginBottom: 24,
              fontWeight: "bold",
            }}
          >
            ❌ {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", marginBottom: 8, fontWeight: "600" }}>
              핸드폰 번호
            </label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="010-1234-5678"
              required
              autoFocus
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: "block", marginBottom: 8, fontWeight: "600" }}>
              비밀번호
            </label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="비밀번호"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: 16,
              background: loading ? "#ccc" : "#10b981",
              color: "white",
              border: "none",
              borderRadius: 8,
              fontSize: 16,
              fontWeight: "bold",
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "로그인 중..." : "🔑 로그인"}
          </button>
        </form>

        <div style={{ marginTop: 24, textAlign: "center" }}>
          <p style={{ color: "#666" }}>
            계정이 없으신가요?{" "}
            <a href="/employee/signup" style={{ color: "#10b981", fontWeight: "600" }}>
              회원가입
            </a>
          </p>
        </div>

        <div style={{ marginTop: 16, textAlign: "center" }}>
          <p style={{ color: "#666", fontSize: 14 }}>
            기업 담당자이신가요?{" "}
            <a href="/login" style={{ color: "#3b82f6", fontWeight: "600" }}>
              기업 로그인
            </a>
          </p>
        </div>

        {/* 안내 */}
        <div
          style={{
            marginTop: 32,
            padding: 16,
            background: "#eff6ff",
            borderRadius: 8,
            border: "1px solid #bfdbfe",
          }}
        >
          <h4 style={{ margin: 0, color: "#1e40af", fontSize: 14 }}>
            💡 로그인 안내
          </h4>
          <ul style={{ marginTop: 8, paddingLeft: 20, color: "#1e3a8a", fontSize: 13, lineHeight: 1.6 }}>
            <li>회원가입 시 등록한 핸드폰 번호와 비밀번호를 입력하세요.</li>
            <li>로그인 후 출퇴근 관리 기능을 사용할 수 있습니다.</li>
            <li>문제가 있으면 소속 기업 담당자에게 문의하세요.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
