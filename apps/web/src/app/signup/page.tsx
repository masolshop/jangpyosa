"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/api";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPw] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [bizNo, setBizNo] = useState("");
  const [companyType, setCompanyType] = useState("PRIVATE");
  const [role, setRole] = useState("BUYER");
  const [refCode, setRefCode] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSignup() {
    setMsg("");
    setLoading(true);
    try {
      await apiFetch("/auth/signup", {
        method: "POST",
        body: JSON.stringify({
          email,
          password,
          name,
          phone,
          companyName,
          bizNo,
          companyType,
          role,
          refCode: refCode || undefined,
        }),
      });
      setMsg("회원가입 성공! 로그인 페이지로 이동합니다...");
      setTimeout(() => {
        window.location.href = "/login";
      }, 2000);
    } catch (e: any) {
      setMsg("회원가입 실패: " + e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container">
      <div className="card" style={{ maxWidth: 600, margin: "40px auto" }}>
        <h1>회원가입</h1>
        <p style={{ marginTop: 8, color: "#666" }}>
          장표사닷컴에 가입하여 부담금 절감 솔루션을 이용하세요
        </p>

        <div style={{ marginTop: 24 }}>
          <h3>개인 정보</h3>
          <label>이름</label>
          <input
            placeholder="홍길동"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <label>이메일</label>
          <input
            type="email"
            placeholder="email@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <label>비밀번호 (8자 이상)</label>
          <input
            type="password"
            placeholder="********"
            value={password}
            onChange={(e) => setPw(e.target.value)}
          />

          <label>휴대폰 (선택)</label>
          <input
            placeholder="010-1234-5678"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          <h3 style={{ marginTop: 24 }}>회사 정보</h3>
          <label>회사명</label>
          <input
            placeholder="(주)테스트기업"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
          />

          <label>사업자번호 (10자리)</label>
          <input
            placeholder="1234567890"
            value={bizNo}
            onChange={(e) => setBizNo(e.target.value)}
          />

          <label>기업 구분</label>
          <select value={companyType} onChange={(e) => setCompanyType(e.target.value)}>
            <option value="PRIVATE">민간기업</option>
            <option value="PUBLIC">공공기관</option>
          </select>

          <label>회원 유형</label>
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="BUYER">구매기업 (부담금 절감)</option>
            <option value="SUPPLIER">공급기업 (표준사업장)</option>
            <option value="AGENT">영업자 (매니저)</option>
            <option value="BRANCH_ADMIN">영업자 (지사)</option>
          </select>

          <label>추천코드 (선택)</label>
          <input
            placeholder="영업자 추천코드가 있으면 입력"
            value={refCode}
            onChange={(e) => setRefCode(e.target.value)}
          />

          <button
            onClick={onSignup}
            disabled={loading}
            style={{ width: "100%", marginTop: 24 }}
          >
            {loading ? "가입 중..." : "회원가입"}
          </button>

          {msg && (
            <p className={msg.includes("성공") ? "success" : "error"}>{msg}</p>
          )}
        </div>

        <div style={{ marginTop: 24, textAlign: "center" }}>
          <p>
            이미 계정이 있으신가요? <a href="/login">로그인</a>
          </p>
        </div>
      </div>
    </div>
  );
}
