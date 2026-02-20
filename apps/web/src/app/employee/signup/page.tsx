"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { API_BASE } from "@/lib/api";

export default function EmployeeSignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    phone: "",
    password: "",
    confirmPassword: "",
    name: "",
    companyBizNo: "",
    registrationNumber: "",
    privacyAgreed: false,
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    // 유효성 검사
    if (form.password !== form.confirmPassword) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }

    if (!form.privacyAgreed) {
      setError("개인정보 활용 동의는 필수입니다.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/auth/signup/employee`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: form.phone,
          password: form.password,
          name: form.name,
          companyBizNo: form.companyBizNo,
          registrationNumber: form.registrationNumber,
          privacyAgreed: form.privacyAgreed,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.message || json.error || "회원가입 실패");
      }

      alert("✅ 직원 계정이 생성되었습니다! 로그인해주세요.");
      router.push("/employee/login");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container">
      <div className="card" style={{ maxWidth: "500px", margin: "40px auto" }}>
        <h1 style={{ textAlign: "center" }}>👷 직원 회원가입</h1>
        <p style={{ textAlign: "center", color: "#666", marginTop: 8, marginBottom: 32 }}>
          장애인 직원 전용 계정을 생성합니다
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
              이름 *
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="홍길동"
              required
            />
            <p style={{ fontSize: 13, color: "#666", marginTop: 4 }}>
              💡 기업에 등록된 이름과 동일해야 합니다
            </p>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", marginBottom: 8, fontWeight: "600" }}>
              핸드폰 번호 *
            </label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="010-1234-5678"
              required
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", marginBottom: 8, fontWeight: "600" }}>
              비밀번호 *
            </label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="8자 이상"
              minLength={8}
              required
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", marginBottom: 8, fontWeight: "600" }}>
              비밀번호 확인 *
            </label>
            <input
              type="password"
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              placeholder="비밀번호 재입력"
              minLength={8}
              required
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", marginBottom: 8, fontWeight: "600" }}>
              소속 기업 사업자등록번호 *
            </label>
            <input
              type="text"
              value={form.companyBizNo}
              onChange={(e) => setForm({ ...form, companyBizNo: e.target.value })}
              placeholder="123-45-67890"
              required
            />
            <p style={{ fontSize: 13, color: "#666", marginTop: 4 }}>
              💡 소속 기업의 사업자등록번호를 입력하세요
            </p>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", marginBottom: 8, fontWeight: "600" }}>
              인증번호 (주민등록번호 앞자리 또는 기업 제공 코드) *
            </label>
            <input
              type="text"
              value={form.registrationNumber}
              onChange={(e) => setForm({ ...form, registrationNumber: e.target.value })}
              placeholder="예: 850315 또는 기업 제공 코드"
              required
            />
            <p style={{ fontSize: 13, color: "#666", marginTop: 4 }}>
              💡 기업에 등록된 인증번호를 입력하세요
            </p>
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={form.privacyAgreed}
                onChange={(e) => setForm({ ...form, privacyAgreed: e.target.checked })}
                required
              />
              <span>개인정보 활용에 동의합니다 (필수)</span>
            </label>
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
            {loading ? "처리 중..." : "✅ 회원가입"}
          </button>
        </form>

        <div style={{ marginTop: 24, textAlign: "center" }}>
          <p style={{ color: "#666" }}>
            이미 계정이 있으신가요?{" "}
            <a href="/employee/login" style={{ color: "#10b981", fontWeight: "600" }}>
              로그인
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
            💡 회원가입 안내
          </h4>
          <ul style={{ marginTop: 8, paddingLeft: 20, color: "#1e3a8a", fontSize: 13, lineHeight: 1.6 }}>
            <li>소속 기업이 먼저 "장애인 직원 등록·관리"에서 직원 정보를 등록해야 합니다.</li>
            <li>이름과 인증번호가 기업에 등록된 정보와 일치해야 회원가입이 가능합니다.</li>
            <li>회원가입 후 출퇴근 관리 기능을 사용할 수 있습니다.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
