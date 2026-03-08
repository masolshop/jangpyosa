"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { API_BASE } from "@/lib/api";

export default function EmployeeLoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

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

      // JSON 파싱 시도 전에 응답 타입 확인
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
      }

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
    <>
      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #e0f2f1 0%, #b2dfdb 50%, #80cbc4 100%)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "20px",
        paddingBottom: "100px",
        position: "relative",
        overflow: "hidden"
      }}>
        {/* 배경 장식 - 부드러운 원형 */}
        <div style={{
          position: "absolute",
          top: "-10%",
          right: "-5%",
          width: "350px",
          height: "350px",
          background: "rgba(255, 255, 255, 0.3)",
          borderRadius: "50%",
          filter: "blur(80px)"
        }} />
        <div style={{
          position: "absolute",
          bottom: "-10%",
          left: "-5%",
          width: "300px",
          height: "300px",
          background: "rgba(178, 223, 219, 0.4)",
          borderRadius: "50%",
          filter: "blur(60px)"
        }} />
        <div style={{
          position: "absolute",
          top: "30%",
          right: "10%",
          width: "200px",
          height: "200px",
          background: "rgba(128, 203, 196, 0.3)",
          borderRadius: "50%",
          filter: "blur(50px)"
        }} />

        {/* 메인 컨텐츠 */}
        <div style={{
          width: "100%",
          maxWidth: "440px",
          position: "relative",
          zIndex: 1
        }}>
          {/* 로고 & 타이틀 */}
          <div style={{
            background: "rgba(255, 255, 255, 0.95)",
            borderRadius: "24px 24px 0 0",
            padding: "40px 32px 32px",
            textAlign: "center",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)"
          }}>
            <div style={{
              fontSize: "48px",
              fontWeight: "700",
              color: "#00695c",
              marginBottom: "12px",
              letterSpacing: "-1px",
              fontFamily: "system-ui, -apple-system, sans-serif"
            }}>
              장표사닷컴
            </div>
            <div style={{
              fontSize: "16px",
              color: "#00897b",
              letterSpacing: "0.5px",
              fontWeight: "600"
            }}>
              장애인직원 전용
            </div>
          </div>

          {/* 로그인 폼 */}
          <div style={{
            background: "rgba(255, 255, 255, 0.95)",
            borderRadius: "0 0 24px 24px",
            padding: "32px",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12)",
            backdropFilter: "blur(10px)"
          }}>
            {/* 에러 메시지 */}
            {error && (
              <div style={{
                padding: "16px",
                background: "#ffebee",
                border: "1px solid #ef5350",
                borderRadius: "12px",
                marginBottom: "24px",
                color: "#c62828",
                fontSize: "14px",
                fontWeight: "500"
              }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* 아이디 (핸드폰 번호) */}
              <div style={{ marginBottom: "20px" }}>
                <label style={{
                  display: "block",
                  marginBottom: "8px",
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#424242"
                }}>
                  아이디
                </label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="예시"
                  required
                  autoFocus
                  style={{
                    width: "100%",
                    padding: "14px 16px",
                    fontSize: "15px",
                    border: "1px solid #e0e0e0",
                    borderRadius: "8px",
                    outline: "none",
                    transition: "all 0.2s",
                    boxSizing: "border-box",
                    background: "#fafafa",
                    color: "#424242"
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

              {/* 비밀번호 */}
              <div style={{ marginBottom: "24px" }}>
                <label style={{
                  display: "block",
                  marginBottom: "8px",
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#424242"
                }}>
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
                      padding: "14px 16px",
                      paddingRight: "48px",
                      fontSize: "15px",
                      border: "1px solid #e0e0e0",
                      borderRadius: "8px",
                      outline: "none",
                      transition: "all 0.2s",
                      boxSizing: "border-box",
                      background: "#fafafa",
                      color: "#424242"
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
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: "absolute",
                      right: "12px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      fontSize: "20px",
                      cursor: "pointer",
                      padding: "4px"
                    }}
                    aria-label={showPassword ? "비밀번호 숨기기" : "비밀번호 보기"}
                  >
                    {showPassword ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>

              {/* 아이디 기억하기 체크박스 */}
              <div style={{
                display: "flex",
                alignItems: "center",
                marginBottom: "24px"
              }}>
                <label style={{
                  display: "flex",
                  alignItems: "center",
                  cursor: "pointer",
                  fontSize: "14px",
                  color: "#616161"
                }}>
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    style={{
                      width: "16px",
                      height: "16px",
                      marginRight: "8px",
                      cursor: "pointer",
                      accentColor: "#26a69a"
                    }}
                  />
                  아이디 기억하기
                </label>
              </div>

              {/* 로그인 버튼 */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "16px",
                  fontSize: "16px",
                  fontWeight: "700",
                  color: "white",
                  background: loading ? "#b0bec5" : "#00796b",
                  border: "none",
                  borderRadius: "8px",
                  cursor: loading ? "not-allowed" : "pointer",
                  transition: "all 0.2s",
                  boxShadow: loading ? "none" : "0 2px 8px rgba(0, 121, 107, 0.3)"
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.currentTarget.style.background = "#00695c";
                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 121, 107, 0.4)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading) {
                    e.currentTarget.style.background = "#00796b";
                    e.currentTarget.style.boxShadow = "0 2px 8px rgba(0, 121, 107, 0.3)";
                  }
                }}
              >
                {loading ? "로그인 중..." : "로그인"}
              </button>
            </form>

            {/* 비밀번호 찾기 / 회원가입 */}
            <div style={{
              marginTop: "24px",
              textAlign: "center"
            }}>
              <a
                href="/employee/signup"
                style={{
                  fontSize: "13px",
                  color: "#00897b",
                  textDecoration: "none",
                  fontWeight: "500"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.textDecoration = "underline";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.textDecoration = "none";
                }}
              >
                비밀번호를 잊으셨나요?
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* 하단 네비게이션 바 - 고정 */}
      <div style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        background: "white",
        borderTop: "1px solid #e0e0e0",
        display: "flex",
        justifyContent: "center",
        padding: "8px 8px 16px 8px",
        boxShadow: "0 -2px 10px rgba(0, 0, 0, 0.05)",
        zIndex: 100
      }}>
        <div style={{
          display: "flex",
          justifyContent: "space-around",
          maxWidth: "600px",
          width: "100%"
        }}>
        <div 
          onClick={() => {
            const token = localStorage.getItem("accessToken");
            if (!token) {
              alert("로그인이 필요합니다.");
            } else {
              window.location.href = "/employee/attendance";
            }
          }}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textDecoration: "none",
            color: "#9e9e9e",
            padding: "8px 12px",
            transition: "all 0.2s",
            flex: 1,
            cursor: "pointer"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "#00897b";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "#9e9e9e";
          }}>
          <span style={{ fontSize: "24px", marginBottom: "4px" }}>📅</span>
          <span style={{ fontSize: "11px", fontWeight: "600" }}>근태관리</span>
        </div>
        <div 
          onClick={() => {
            const token = localStorage.getItem("accessToken");
            if (!token) {
              alert("로그인이 필요합니다.");
            } else {
              window.location.href = "/employee/work-orders";
            }
          }}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textDecoration: "none",
            color: "#9e9e9e",
            padding: "8px 12px",
            transition: "all 0.2s",
            flex: 1,
            cursor: "pointer"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "#00897b";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "#9e9e9e";
          }}>
          <span style={{ fontSize: "24px", marginBottom: "4px" }}>📋</span>
          <span style={{ fontSize: "11px", fontWeight: "600" }}>업무지시</span>
        </div>
        <div 
          onClick={() => {
            const token = localStorage.getItem("accessToken");
            if (!token) {
              alert("로그인이 필요합니다.");
            } else {
              window.location.href = "/employee/leave";
            }
          }}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textDecoration: "none",
            color: "#9e9e9e",
            padding: "8px 12px",
            transition: "all 0.2s",
            flex: 1,
            cursor: "pointer"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "#00897b";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "#9e9e9e";
          }}>
          <span style={{ fontSize: "24px", marginBottom: "4px" }}>✈️</span>
          <span style={{ fontSize: "11px", fontWeight: "600" }}>휴가신청</span>
        </div>
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          color: "#00897b",
          padding: "8px 12px",
          flex: 1,
          position: "relative"
        }}>
          <div style={{
            position: "absolute",
            top: 0,
            left: "50%",
            transform: "translateX(-50%)",
            width: "50px",
            height: "3px",
            background: "#00897b",
            borderRadius: "2px"
          }} />
          <span style={{ fontSize: "24px", marginBottom: "4px" }}>🔓</span>
          <span style={{ fontSize: "11px", fontWeight: "700" }}>로그인</span>
        </div>
        </div>
      </div>
    </>
  );
}
