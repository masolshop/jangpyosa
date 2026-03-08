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
    <>
      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #667eea 0%, #764ba2 100%)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "20px",
        paddingBottom: "100px", // 하단 메뉴 공간
        position: "relative",
        overflow: "hidden"
      }}>
        {/* 배경 장식 */}
        <div style={{
          position: "absolute",
          top: "-50%",
          right: "-20%",
          width: "500px",
          height: "500px",
          background: "rgba(255, 255, 255, 0.1)",
          borderRadius: "50%",
          filter: "blur(80px)"
        }} />
        <div style={{
          position: "absolute",
          bottom: "-30%",
          left: "-10%",
          width: "400px",
          height: "400px",
          background: "rgba(255, 255, 255, 0.1)",
          borderRadius: "50%",
          filter: "blur(60px)"
        }} />

        {/* 메인 컨텐츠 */}
        <div style={{
          width: "100%",
          maxWidth: "480px",
          position: "relative",
          zIndex: 1
        }}>
          {/* 헤더 */}
          <div style={{
            textAlign: "center",
            marginBottom: "40px"
          }}>
            <div style={{
              width: "140px",
              height: "140px",
              background: "rgba(255, 255, 255, 0.98)",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 28px",
              fontSize: "70px",
              boxShadow: "0 15px 50px rgba(0, 0, 0, 0.25)"
            }}>
              👷
            </div>
            <h1 style={{
              fontSize: "42px",
              fontWeight: "900",
              color: "white",
              margin: "0 0 16px 0",
              textShadow: "0 3px 25px rgba(0, 0, 0, 0.3)",
              letterSpacing: "-1px"
            }}>
              직원 로그인
            </h1>
            <p style={{
              fontSize: "20px",
              color: "rgba(255, 255, 255, 0.95)",
              margin: 0,
              fontWeight: "600"
            }}>
              장애인 직원 전용 로그인
            </p>
          </div>

          {/* 로그인 폼 */}
          <div style={{
            background: "rgba(255, 255, 255, 0.98)",
            borderRadius: "36px",
            padding: "48px 36px",
            boxShadow: "0 25px 70px rgba(0, 0, 0, 0.35)",
            backdropFilter: "blur(30px)"
          }}>
            {/* 에러 메시지 */}
            {error && (
              <div style={{
                padding: "24px",
                background: "#fff5f5",
                border: "4px solid #fc8181",
                borderRadius: "24px",
                marginBottom: "32px"
              }}>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "16px"
                }}>
                  <span style={{ fontSize: "32px" }}>❌</span>
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
              <div style={{ marginBottom: "32px" }}>
                <label style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  marginBottom: "16px",
                  fontSize: "20px",
                  fontWeight: "800",
                  color: "#2d3748"
                }}>
                  <span style={{ fontSize: "30px" }}>📱</span>
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
                    padding: "26px 24px",
                    fontSize: "22px",
                    fontWeight: "600",
                    border: "4px solid #e2e8f0",
                    borderRadius: "24px",
                    outline: "none",
                    transition: "all 0.3s",
                    boxSizing: "border-box",
                    background: "#f7fafc"
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#667eea";
                    e.target.style.background = "white";
                    e.target.style.transform = "scale(1.01)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#e2e8f0";
                    e.target.style.background = "#f7fafc";
                    e.target.style.transform = "scale(1)";
                  }}
                />
              </div>

              {/* 비밀번호 */}
              <div style={{ marginBottom: "40px" }}>
                <label style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  marginBottom: "16px",
                  fontSize: "20px",
                  fontWeight: "800",
                  color: "#2d3748"
                }}>
                  <span style={{ fontSize: "30px" }}>🔒</span>
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
                      padding: "26px 24px",
                      paddingRight: "70px",
                      fontSize: "22px",
                      fontWeight: "600",
                      border: "4px solid #e2e8f0",
                      borderRadius: "24px",
                      outline: "none",
                      transition: "all 0.3s",
                      boxSizing: "border-box",
                      background: "#f7fafc"
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "#667eea";
                      e.target.style.background = "white";
                      e.target.style.transform = "scale(1.01)";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "#e2e8f0";
                      e.target.style.background = "#f7fafc";
                      e.target.style.transform = "scale(1)";
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: "absolute",
                      right: "20px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      fontSize: "30px",
                      cursor: "pointer",
                      padding: "12px"
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
                  padding: "30px",
                  fontSize: "24px",
                  fontWeight: "900",
                  color: "white",
                  background: loading ? "#cbd5e0" : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  border: "none",
                  borderRadius: "24px",
                  cursor: loading ? "not-allowed" : "pointer",
                  transition: "all 0.3s",
                  boxShadow: loading ? "none" : "0 15px 40px rgba(102, 126, 234, 0.6)",
                  transform: loading ? "none" : "translateY(0)"
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.boxShadow = "0 20px 50px rgba(102, 126, 234, 0.7)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading) {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 15px 40px rgba(102, 126, 234, 0.6)";
                  }
                }}
              >
                {loading ? "⏳ 로그인 중..." : "🔑 로그인"}
              </button>
            </form>

            {/* 회원가입 링크 */}
            <div style={{
              marginTop: "36px",
              padding: "28px",
              background: "linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%)",
              borderRadius: "24px",
              textAlign: "center"
            }}>
              <p style={{
                fontSize: "19px",
                color: "#4a5568",
                margin: "0 0 20px 0",
                fontWeight: "700"
              }}>
                계정이 없으신가요?
              </p>
              <a
                href="/employee/signup"
                style={{
                  display: "inline-block",
                  padding: "20px 44px",
                  fontSize: "20px",
                  fontWeight: "900",
                  color: "#667eea",
                  background: "white",
                  border: "4px solid #667eea",
                  borderRadius: "20px",
                  textDecoration: "none",
                  transition: "all 0.3s",
                  boxShadow: "0 6px 16px rgba(102, 126, 234, 0.25)"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#667eea";
                  e.currentTarget.style.color = "white";
                  e.currentTarget.style.transform = "translateY(-3px)";
                  e.currentTarget.style.boxShadow = "0 10px 25px rgba(102, 126, 234, 0.45)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "white";
                  e.currentTarget.style.color = "#667eea";
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 6px 16px rgba(102, 126, 234, 0.25)";
                }}
              >
                ✍️ 회원가입하기
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
        borderTop: "3px solid #e2e8f0",
        display: "flex",
        justifyContent: "center",
        padding: "12px 8px 20px 8px",
        boxShadow: "0 -4px 20px rgba(0, 0, 0, 0.1)",
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
            color: "#718096",
            padding: "8px 12px",
            transition: "all 0.3s",
            flex: 1,
            cursor: "pointer"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "#667eea";
            e.currentTarget.style.transform = "translateY(-2px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "#718096";
            e.currentTarget.style.transform = "translateY(0)";
          }}>
          <span style={{ fontSize: "28px", marginBottom: "4px" }}>📅</span>
          <span style={{ fontSize: "13px", fontWeight: "700" }}>근태관리</span>
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
            color: "#718096",
            padding: "8px 12px",
            transition: "all 0.3s",
            flex: 1,
            cursor: "pointer"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "#667eea";
            e.currentTarget.style.transform = "translateY(-2px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "#718096";
            e.currentTarget.style.transform = "translateY(0)";
          }}>
          <span style={{ fontSize: "28px", marginBottom: "4px" }}>📋</span>
          <span style={{ fontSize: "13px", fontWeight: "700" }}>업무지시</span>
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
            color: "#718096",
            padding: "8px 12px",
            transition: "all 0.3s",
            flex: 1,
            cursor: "pointer"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "#667eea";
            e.currentTarget.style.transform = "translateY(-2px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "#718096";
            e.currentTarget.style.transform = "translateY(0)";
          }}>
          <span style={{ fontSize: "28px", marginBottom: "4px" }}>✈️</span>
          <span style={{ fontSize: "13px", fontWeight: "700" }}>휴가신청</span>
        </div>
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          color: "#667eea",
          padding: "8px 12px",
          flex: 1,
          position: "relative"
        }}>
          <div style={{
            position: "absolute",
            top: 0,
            left: "50%",
            transform: "translateX(-50%)",
            width: "60px",
            height: "4px",
            background: "#667eea",
            borderRadius: "2px"
          }} />
          <span style={{ fontSize: "28px", marginBottom: "4px" }}>🔒</span>
          <span style={{ fontSize: "13px", fontWeight: "900" }}>로그인</span>
        </div>
        </div>
      </div>
    </>
  );
}
