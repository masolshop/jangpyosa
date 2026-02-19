"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/api";

type Mode = "find-id" | "reset-password";
type UserType = "AGENT" | "SUPPLIER" | "BUYER" | "";
type Step = "input" | "verify";

export default function ForgotPasswordPage() {
  // 모드 선택: ID 찾기 or 비밀번호 찾기
  const [mode, setMode] = useState<Mode>("find-id");
  
  // ID 찾기 state
  const [userType, setUserType] = useState<UserType>("");
  const [phone, setPhone] = useState("");
  const [bizNo, setBizNo] = useState("");
  const [managerPhone, setManagerPhone] = useState("");
  const [foundId, setFoundId] = useState<any>(null);
  
  // 비밀번호 찾기 state
  const [step, setStep] = useState<Step>("input");
  const [identifier, setIdentifier] = useState(""); // phone 또는 username
  const [verificationCode, setVerificationCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirm, setNewPasswordConfirm] = useState("");
  
  // 공통 state
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const formatPhone = (value: string) => {
    const cleaned = value.replace(/\D/g, "");
    if (cleaned.length <= 3) return cleaned;
    if (cleaned.length <= 7) return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7, 11)}`;
  };

  const formatBizNo = (value: string) => {
    const cleaned = value.replace(/\D/g, "");
    if (cleaned.length <= 3) return cleaned;
    if (cleaned.length <= 5) return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 5)}-${cleaned.slice(5, 10)}`;
  };

  // ID 찾기
  async function onFindId() {
    setMsg("");
    setFoundId(null);
    
    if (!userType) {
      setMsg("❌ 회원 유형을 선택하세요");
      return;
    }
    
    if (userType === "AGENT" && !phone) {
      setMsg("❌ 핸드폰 번호를 입력하세요");
      return;
    }
    
    if ((userType === "SUPPLIER" || userType === "BUYER") && (!bizNo || !managerPhone)) {
      setMsg("❌ 사업자번호와 담당자 핸드폰 번호를 입력하세요");
      return;
    }
    
    setLoading(true);
    try {
      const body: any = { userType };
      
      if (userType === "AGENT") {
        body.phone = phone.replace(/\D/g, "");
      } else {
        body.bizNo = bizNo.replace(/\D/g, "");
        body.managerPhone = managerPhone.replace(/\D/g, "");
      }
      
      const result = await apiFetch("/auth/find-id", {
        method: "POST",
        body: JSON.stringify(body),
      });
      
      setFoundId(result);
      setMsg(`✅ ${result.message}`);
    } catch (error: any) {
      setMsg(`❌ ${error.data?.message || error.message || "ID 찾기 실패"}`);
    } finally {
      setLoading(false);
    }
  }

  // 비밀번호 찾기 - 인증번호 발송
  async function onRequestCode() {
    setMsg("");
    if (!identifier) {
      setMsg("❌ 핸드폰 번호 또는 ID를 입력하세요");
      return;
    }

    setLoading(true);
    try {
      // identifier가 숫자로만 이루어졌으면 핸드폰, 아니면 username
      const isPhone = /^\d+$/.test(identifier.replace(/\D/g, ""));
      
      if (isPhone) {
        const cleanPhone = identifier.replace(/\D/g, "");
        await apiFetch("/auth/forgot-password", {
          method: "POST",
          body: JSON.stringify({ phone: cleanPhone }),
        });
      } else {
        // username으로 찾기 (TODO: API 추가 필요)
        setMsg("❌ 기업 계정은 담당자 핸드폰 번호로 찾으세요");
        setLoading(false);
        return;
      }

      setMsg("✅ 인증번호가 발송되었습니다 (테스트: 123456)");
      setStep("verify");
    } catch (error: any) {
      setMsg(`❌ ${error.data?.message || error.message || "인증번호 발송 실패"}`);
    } finally {
      setLoading(false);
    }
  }

  // 비밀번호 변경
  async function onResetPassword() {
    setMsg("");

    if (!verificationCode || !newPassword || !newPasswordConfirm) {
      setMsg("❌ 모든 항목을 입력하세요");
      return;
    }

    if (newPassword !== newPasswordConfirm) {
      setMsg("❌ 비밀번호가 일치하지 않습니다");
      return;
    }

    if (newPassword.length < 8) {
      setMsg("❌ 비밀번호는 8자 이상이어야 합니다");
      return;
    }

    setLoading(true);
    try {
      const cleanPhone = identifier.replace(/\D/g, "");
      await apiFetch("/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({
          phone: cleanPhone,
          verificationCode,
          newPassword,
        }),
      });

      setMsg("✅ 비밀번호가 변경되었습니다. 로그인 페이지로 이동합니다...");

      setTimeout(() => {
        window.location.href = "/login";
      }, 2000);
    } catch (error: any) {
      setMsg(`❌ ${error.data?.message || error.message || "비밀번호 변경 실패"}`);
    } finally {
      setLoading(false);
    }
  }

  const getUserTypeLabel = (type: UserType) => {
    switch (type) {
      case "AGENT": return "👔 매니저";
      case "SUPPLIER": return "🏭 표준사업장";
      case "BUYER": return "🏢 고용의무기업";
      default: return "";
    }
  };

  return (
    <div className="container">
      <div className="card" style={{ maxWidth: 480, margin: "40px auto" }}>
        <h1>🔍 ID/비밀번호 찾기</h1>
        
        {/* 모드 선택 */}
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "1fr 1fr", 
          gap: 12,
          marginTop: 24
        }}>
          <button
            type="button"
            onClick={() => {
              setMode("find-id");
              setMsg("");
              setFoundId(null);
            }}
            style={{
              padding: "12px",
              border: `2px solid ${mode === "find-id" ? "#0070f3" : "#ddd"}`,
              background: mode === "find-id" ? "#e7f3ff" : "white",
              color: mode === "find-id" ? "#0070f3" : "#666",
              borderRadius: 8,
              cursor: "pointer",
              fontSize: 15,
              fontWeight: mode === "find-id" ? 600 : 400,
              transition: "all 0.2s"
            }}
          >
            🔍 ID 찾기
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("reset-password");
              setMsg("");
              setStep("input");
            }}
            style={{
              padding: "12px",
              border: `2px solid ${mode === "reset-password" ? "#0070f3" : "#ddd"}`,
              background: mode === "reset-password" ? "#e7f3ff" : "white",
              color: mode === "reset-password" ? "#0070f3" : "#666",
              borderRadius: 8,
              cursor: "pointer",
              fontSize: 15,
              fontWeight: mode === "reset-password" ? 600 : 400,
              transition: "all 0.2s"
            }}
          >
            🔑 비밀번호 찾기
          </button>
        </div>

        {/* ============ ID 찾기 ============ */}
        {mode === "find-id" && (
          <>
            <p style={{ marginTop: 16, color: "#666", fontSize: 14 }}>
              회원 유형을 선택하고 정보를 입력하세요
            </p>

            {/* 회원 유형 선택 */}
            <div style={{ marginTop: 20 }}>
              <label style={{ fontWeight: 600 }}>회원 유형</label>
              <div style={{ 
                display: "grid", 
                gridTemplateColumns: "repeat(3, 1fr)", 
                gap: 8,
                marginTop: 8
              }}>
                {(["AGENT", "SUPPLIER", "BUYER"] as UserType[]).map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => {
                      setUserType(type);
                      setMsg("");
                      setFoundId(null);
                    }}
                    style={{
                      padding: "10px",
                      border: `2px solid ${userType === type ? "#0070f3" : "#ddd"}`,
                      background: userType === type ? "#e7f3ff" : "white",
                      color: userType === type ? "#0070f3" : "#666",
                      borderRadius: 6,
                      cursor: "pointer",
                      fontSize: 13,
                      fontWeight: userType === type ? 600 : 400,
                      transition: "all 0.2s"
                    }}
                  >
                    {getUserTypeLabel(type)}
                  </button>
                ))}
              </div>
            </div>

            {/* 매니저: 핸드폰 번호 */}
            {userType === "AGENT" && (
              <div style={{ marginTop: 16 }}>
                <label>핸드폰 번호</label>
                <input
                  type="tel"
                  placeholder="010-1234-5678"
                  value={phone}
                  onChange={(e) => setPhone(formatPhone(e.target.value))}
                  maxLength={13}
                />
              </div>
            )}

            {/* 기업: 사업자번호 + 담당자 핸드폰 */}
            {(userType === "SUPPLIER" || userType === "BUYER") && (
              <>
                <div style={{ marginTop: 16 }}>
                  <label>사업자번호</label>
                  <input
                    type="text"
                    placeholder="123-45-67890"
                    value={bizNo}
                    onChange={(e) => setBizNo(formatBizNo(e.target.value))}
                    maxLength={12}
                  />
                </div>
                <div style={{ marginTop: 16 }}>
                  <label>담당자 핸드폰 번호</label>
                  <input
                    type="tel"
                    placeholder="010-1234-5678"
                    value={managerPhone}
                    onChange={(e) => setManagerPhone(formatPhone(e.target.value))}
                    maxLength={13}
                  />
                </div>
              </>
            )}

            {userType && (
              <button
                onClick={onFindId}
                disabled={loading}
                style={{ width: "100%", marginTop: 20 }}
              >
                {loading ? "검색 중..." : "ID 찾기"}
              </button>
            )}

            {/* ID 찾기 결과 */}
            {foundId && (
              <div style={{
                marginTop: 20,
                padding: 16,
                background: "#e7f3ff",
                borderRadius: 8,
                border: "1px solid #0070f3"
              }}>
                <p style={{ fontWeight: 600, color: "#0070f3", marginBottom: 12 }}>
                  ✅ ID를 찾았습니다
                </p>
                {foundId.type === "AGENT" ? (
                  <>
                    <p style={{ fontSize: 14, marginBottom: 6 }}>
                      <strong>이름:</strong> {foundId.name}
                    </p>
                    <p style={{ fontSize: 14, marginBottom: 6 }}>
                      <strong>핸드폰:</strong> {foundId.identifier}
                    </p>
                    <p style={{ fontSize: 14, marginBottom: 6 }}>
                      <strong>가입일:</strong> {new Date(foundId.createdAt).toLocaleDateString()}
                    </p>
                    <p style={{ fontSize: 13, color: "#666", marginTop: 12, padding: 10, background: "#fff", borderRadius: 6 }}>
                      💡 매니저는 핸드폰 번호로 로그인하세요
                    </p>
                  </>
                ) : (
                  <>
                    <p style={{ fontSize: 14, marginBottom: 6 }}>
                      <strong>회사명:</strong> {foundId.companyName}
                    </p>
                    <p style={{ fontSize: 14, marginBottom: 6 }}>
                      <strong>담당자:</strong> {foundId.managerName}
                    </p>
                    <p style={{ fontSize: 16, fontWeight: 600, marginTop: 12, padding: 12, background: "#fff", borderRadius: 6, color: "#0070f3" }}>
                      🔑 아이디: <span style={{ fontSize: 18 }}>{foundId.identifier}</span>
                    </p>
                    <p style={{ fontSize: 14, marginTop: 6 }}>
                      <strong>가입일:</strong> {new Date(foundId.createdAt).toLocaleDateString()}
                    </p>
                  </>
                )}
                <button
                  onClick={() => window.location.href = "/login"}
                  style={{ width: "100%", marginTop: 16 }}
                >
                  로그인하기
                </button>
              </div>
            )}

            {msg && !foundId && (
              <p
                style={{
                  marginTop: 12,
                  padding: 12,
                  borderRadius: 6,
                  fontSize: 14,
                  background: msg.includes("✅") ? "#e7f3ff" : "#ffe7e7",
                  color: msg.includes("✅") ? "#0070f3" : "#d32f2f",
                }}
              >
                {msg}
              </p>
            )}
          </>
        )}

        {/* ============ 비밀번호 찾기 ============ */}
        {mode === "reset-password" && (
          <>
            {step === "input" && (
              <>
                <p style={{ marginTop: 16, color: "#666", fontSize: 14 }}>
                  가입한 핸드폰 번호로 인증번호를 발송합니다
                </p>

                <div style={{ marginTop: 20 }}>
                  <label>핸드폰 번호</label>
                  <input
                    type="tel"
                    placeholder="010-1234-5678"
                    value={identifier}
                    onChange={(e) => setIdentifier(formatPhone(e.target.value))}
                    maxLength={13}
                  />

                  <button
                    onClick={onRequestCode}
                    disabled={loading}
                    style={{ width: "100%", marginTop: 16 }}
                  >
                    {loading ? "발송 중..." : "인증번호 발송"}
                  </button>

                  {msg && (
                    <p
                      style={{
                        marginTop: 12,
                        padding: 12,
                        borderRadius: 6,
                        fontSize: 14,
                        background: msg.includes("✅") ? "#e7f3ff" : "#ffe7e7",
                        color: msg.includes("✅") ? "#0070f3" : "#d32f2f",
                      }}
                    >
                      {msg}
                    </p>
                  )}
                </div>
              </>
            )}

            {step === "verify" && (
              <>
                <p style={{ marginTop: 16, color: "#666", fontSize: 14 }}>
                  {identifier}로 발송된 인증번호를 입력하세요
                </p>

                <div style={{ marginTop: 20 }}>
                  <label>인증번호</label>
                  <input
                    type="text"
                    placeholder="6자리 숫자"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    maxLength={6}
                  />

                  <label style={{ marginTop: 16 }}>새 비밀번호</label>
                  <input
                    type="password"
                    placeholder="8자 이상"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />

                  <label style={{ marginTop: 16 }}>새 비밀번호 확인</label>
                  <input
                    type="password"
                    placeholder="비밀번호 재입력"
                    value={newPasswordConfirm}
                    onChange={(e) => setNewPasswordConfirm(e.target.value)}
                  />

                  <button
                    onClick={onResetPassword}
                    disabled={loading}
                    style={{ width: "100%", marginTop: 20 }}
                  >
                    {loading ? "변경 중..." : "비밀번호 변경"}
                  </button>

                  <button
                    onClick={() => setStep("input")}
                    style={{
                      width: "100%",
                      marginTop: 8,
                      background: "#f5f5f5",
                      color: "#333",
                    }}
                  >
                    다시 발송
                  </button>

                  {msg && (
                    <p
                      style={{
                        marginTop: 12,
                        padding: 12,
                        borderRadius: 6,
                        fontSize: 14,
                        background: msg.includes("✅") ? "#e7f3ff" : "#ffe7e7",
                        color: msg.includes("✅") ? "#0070f3" : "#d32f2f",
                      }}
                    >
                      {msg}
                    </p>
                  )}
                </div>

                <div
                  style={{
                    marginTop: 16,
                    padding: 12,
                    background: "#fff9e6",
                    borderRadius: 6,
                    fontSize: 12,
                    color: "#856404",
                  }}
                >
                  💡 <strong>테스트용 인증번호:</strong> 123456
                </div>
              </>
            )}
          </>
        )}

        <div style={{ marginTop: 24, textAlign: "center", fontSize: 14, color: "#666" }}>
          <p>
            <a href="/login" style={{ color: "#0070f3", textDecoration: "underline" }}>
              로그인으로 돌아가기
            </a>
          </p>
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
          font-weight: 500;
          color: #333;
          font-size: 14px;
        }
        input {
          width: 100%;
          padding: 12px;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 14px;
          box-sizing: border-box;
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
          font-size: 15px;
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
