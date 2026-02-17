"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/api";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<"phone" | "verify">("phone");
  const [phone, setPhone] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirm, setNewPasswordConfirm] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const formatPhone = (value: string) => {
    const cleaned = value.replace(/\D/g, "");
    if (cleaned.length <= 3) return cleaned;
    if (cleaned.length <= 7) return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7, 11)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(formatPhone(e.target.value));
  };

  async function onRequestCode() {
    setMsg("");
    if (!phone) {
      setMsg("핸드폰 번호를 입력하세요");
      return;
    }

    setLoading(true);
    try {
      const cleanPhone = phone.replace(/\D/g, "");
      await apiFetch("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ phone: cleanPhone }),
      });

      setMsg("✅ 인증번호가 발송되었습니다 (테스트: 123456)");
      setStep("verify");
    } catch (error: any) {
      setMsg(`❌ ${error.message || "인증번호 발송 실패"}`);
    } finally {
      setLoading(false);
    }
  }

  async function onResetPassword() {
    setMsg("");

    if (!verificationCode || !newPassword || !newPasswordConfirm) {
      setMsg("모든 항목을 입력하세요");
      return;
    }

    if (newPassword !== newPasswordConfirm) {
      setMsg("비밀번호가 일치하지 않습니다");
      return;
    }

    if (newPassword.length < 8) {
      setMsg("비밀번호는 8자 이상이어야 합니다");
      return;
    }

    setLoading(true);
    try {
      const cleanPhone = phone.replace(/\D/g, "");
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
      setMsg(`❌ ${error.message || "비밀번호 변경 실패"}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container">
      <div className="card" style={{ maxWidth: 420, margin: "40px auto" }}>
        <h1>🔑 비밀번호 찾기</h1>

        {step === "phone" && (
          <>
            <p style={{ marginTop: 8, color: "#666" }}>
              가입한 핸드폰 번호로 인증번호를 발송합니다
            </p>

            <div style={{ marginTop: 24 }}>
              <label>핸드폰 번호</label>
              <input
                type="tel"
                placeholder="010-1234-5678"
                value={phone}
                onChange={handlePhoneChange}
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
            <p style={{ marginTop: 8, color: "#666" }}>
              {phone}로 발송된 인증번호를 입력하세요
            </p>

            <div style={{ marginTop: 24 }}>
              <label>인증번호</label>
              <input
                type="text"
                placeholder="6자리 숫자"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                maxLength={6}
              />

              <label>새 비밀번호</label>
              <input
                type="password"
                placeholder="8자 이상"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />

              <label>새 비밀번호 확인</label>
              <input
                type="password"
                placeholder="비밀번호 재입력"
                value={newPasswordConfirm}
                onChange={(e) => setNewPasswordConfirm(e.target.value)}
              />

              <button
                onClick={onResetPassword}
                disabled={loading}
                style={{ width: "100%", marginTop: 16 }}
              >
                {loading ? "변경 중..." : "비밀번호 변경"}
              </button>

              <button
                onClick={() => setStep("phone")}
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
                marginTop: 24,
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

        <div style={{ marginTop: 24, textAlign: "center", fontSize: 14, color: "#666" }}>
          <p>
            <a href="/login" style={{ color: "#0070f3" }}>
              로그인으로 돌아가기
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
