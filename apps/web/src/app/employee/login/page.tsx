"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { API_BASE } from "@/lib/api";

export default function EmployeeLoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    phone: "",
    password: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const cleanPhone = form.phone.replace(/[-\s]/g, "");
      const res = await fetch(`${API_BASE}/auth/login/employee`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: cleanPhone,
          password: form.password,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.message || json.error || "로그인 실패");
      }

      // 토큰 저장
      localStorage.setItem("token", json.accessToken);
      localStorage.setItem("accessToken", json.accessToken);
      localStorage.setItem("refreshToken", json.refreshToken);
      localStorage.setItem("user", JSON.stringify(json.user));
      localStorage.setItem("userRole", json.user.role);

      alert(`✅ ${json.user.name}님, 환영합니다!`);
      window.location.href = "/employee/attendance";
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px"
    }}>
      <div style={{
        maxWidth: "500px",
        width: "100%",
        background: "white",
        borderRadius: "24px",
        padding: "40px 32px",
        boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)"
      }}>
        {/* 헤더 */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <div style={{
            width: "80px",
            height: "80px",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 20px",
            fontSize: "40px"
          }}>
            👷
          </div>
          <h1 style={{
            fontSize: "32px",
            fontWeight: "800",
            color: "#1a202c",
            margin: "0 0 8px 0"
          }}>
            직원 로그인
          </h1>
          <p style={{
            fontSize: "18px",
            color: "#718096",
            margin: 0
          }}>
            장애인 직원 전용 로그인
          </p>
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div style={{
            padding: "20px",
            background: "#fff5f5",
            border: "3px solid #fc8181",
            borderRadius: "16px",
            marginBottom: "24px"
          }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "12px"
            }}>
              <span style={{ fontSize: "28px" }}>❌</span>
              <span style={{
                fontSize: "18px",
                fontWeight: "700",
                color: "#c53030"
              }}>
                {error}
              </span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* 핸드폰 번호 */}
          <div style={{ marginBottom: "24px" }}>
            <label style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "12px",
              fontSize: "18px",
              fontWeight: "700",
              color: "#2d3748"
            }}>
              <span style={{ fontSize: "24px" }}>📱</span>
              핸드폰 번호
            </label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="010-1234-5678"
              required
              autoFocus
              style={{
                width: "100%",
                padding: "20px",
                fontSize: "20px",
                fontWeight: "600",
                border: "3px solid #e2e8f0",
                borderRadius: "16px",
                outline: "none",
                transition: "all 0.3s",
                boxSizing: "border-box"
              }}
              onFocus={(e) => e.target.style.borderColor = "#667eea"}
              onBlur={(e) => e.target.style.borderColor = "#e2e8f0"}
            />
          </div>

          {/* 비밀번호 */}
          <div style={{ marginBottom: "32px" }}>
            <label style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "12px",
              fontSize: "18px",
              fontWeight: "700",
              color: "#2d3748"
            }}>
              <span style={{ fontSize: "24px" }}>🔒</span>
              비밀번호
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="비밀번호"
                required
                style={{
                  width: "100%",
                  padding: "20px",
                  paddingRight: "60px",
                  fontSize: "20px",
                  fontWeight: "600",
                  border: "3px solid #e2e8f0",
                  borderRadius: "16px",
                  outline: "none",
                  transition: "all 0.3s",
                  boxSizing: "border-box"
                }}
                onFocus={(e) => e.target.style.borderColor = "#667eea"}
                onBlur={(e) => e.target.style.borderColor = "#e2e8f0"}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: "16px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  fontSize: "24px",
                  cursor: "pointer",
                  padding: "8px"
                }}
                aria-label={showPassword ? "비밀번호 숨기기" : "비밀번호 보기"}
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          {/* 로그인 버튼 */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "24px",
              fontSize: "22px",
              fontWeight: "800",
              color: "white",
              background: loading ? "#cbd5e0" : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              border: "none",
              borderRadius: "16px",
              cursor: loading ? "not-allowed" : "pointer",
              transition: "all 0.3s",
              boxShadow: loading ? "none" : "0 8px 24px rgba(102, 126, 234, 0.4)",
              transform: loading ? "none" : "translateY(0)"
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 12px 32px rgba(102, 126, 234, 0.5)";
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 8px 24px rgba(102, 126, 234, 0.4)";
              }
            }}
          >
            {loading ? "⏳ 로그인 중..." : "🔑 로그인"}
          </button>
        </form>

        {/* 회원가입 링크 */}
        <div style={{
          marginTop: "32px",
          padding: "24px",
          background: "#f7fafc",
          borderRadius: "16px",
          textAlign: "center"
        }}>
          <p style={{
            fontSize: "18px",
            color: "#4a5568",
            margin: "0 0 16px 0",
            fontWeight: "600"
          }}>
            계정이 없으신가요?
          </p>
          <a
            href="/employee/signup"
            style={{
              display: "inline-block",
              padding: "16px 32px",
              fontSize: "18px",
              fontWeight: "700",
              color: "#667eea",
              background: "white",
              border: "3px solid #667eea",
              borderRadius: "12px",
              textDecoration: "none",
              transition: "all 0.3s"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#667eea";
              e.currentTarget.style.color = "white";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "white";
              e.currentTarget.style.color = "#667eea";
            }}
          >
            ✍️ 회원가입
          </a>
        </div>

        {/* 기업 로그인 링크 */}
        <div style={{
          marginTop: "20px",
          textAlign: "center"
        }}>
          <p style={{
            fontSize: "16px",
            color: "#718096"
          }}>
            기업 담당자이신가요?{" "}
            <a
              href="/login"
              style={{
                color: "#667eea",
                fontWeight: "700",
                textDecoration: "none"
              }}
            >
              기업 로그인 →
            </a>
          </p>
        </div>

        {/* 안내 */}
        <div style={{
          marginTop: "32px",
          padding: "20px",
          background: "#edf2f7",
          borderRadius: "16px",
          border: "3px solid #cbd5e0"
        }}>
          <h4 style={{
            margin: "0 0 12px 0",
            fontSize: "18px",
            fontWeight: "800",
            color: "#2d3748",
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}>
            <span style={{ fontSize: "24px" }}>💡</span>
            로그인 안내
          </h4>
          <ul style={{
            margin: 0,
            paddingLeft: "28px",
            color: "#4a5568",
            fontSize: "16px",
            lineHeight: "1.8"
          }}>
            <li>회원가입 시 등록한 핸드폰 번호와 비밀번호를 입력하세요</li>
            <li>로그인 후 출퇴근 관리 기능을 사용할 수 있습니다</li>
            <li>문제가 있으면 소속 기업 담당자에게 문의하세요</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
