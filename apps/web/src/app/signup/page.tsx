"use client";

import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";

type SignupType = "agent" | "supplier" | "buyer";

export default function SignupPage() {
  const [step, setStep] = useState<"select" | "form">("select");
  const [type, setType] = useState<SignupType>("buyer");

  // 공통 필드
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");

  // 매니저 전용
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [branchId, setBranchId] = useState("");
  const [refCode, setRefCode] = useState("");
  const [branches, setBranches] = useState<any[]>([]);

  // 기업 전용
  const [bizNo, setBizNo] = useState("");
  const [referrerPhone, setReferrerPhone] = useState("");

  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // 지사 목록 로드 (매니저용)
  useEffect(() => {
    if (type === "agent") {
      loadBranches();
    }
  }, [type]);

  async function loadBranches() {
    try {
      const res = await fetch("/api/branches/list");
      const data = await res.json();
      setBranches(data.branches || []);
    } catch (error) {
      console.error("Failed to load branches:", error);
    }
  }

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

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(formatPhone(e.target.value));
  };

  const handleReferrerPhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setReferrerPhone(formatPhone(e.target.value));
  };

  const handleBizNoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBizNo(formatBizNo(e.target.value));
  };

  const handleTypeSelect = (selectedType: SignupType) => {
    setType(selectedType);
    setStep("form");
  };

  async function onSignup() {
    setMsg("");

    // 유효성 검사
    if (!phone || !password) {
      setMsg("필수 항목을 입력하세요");
      return;
    }

    if (password !== passwordConfirm) {
      setMsg("비밀번호가 일치하지 않습니다");
      return;
    }

    if (password.length < 8) {
      setMsg("비밀번호는 8자 이상이어야 합니다");
      return;
    }

    const cleanPhone = phone.replace(/\D/g, "");

    if (type === "agent") {
      if (!name || !branchId) {
        setMsg("이름과 지사를 선택하세요");
        return;
      }
    }

    if (type === "supplier" || type === "buyer") {
      if (!bizNo) {
        setMsg("사업자등록번호를 입력하세요");
        return;
      }
      if (!referrerPhone) {
        setMsg("추천인 매니저 핸드폰 번호를 입력하세요");
        return;
      }
    }

    setLoading(true);

    try {
      let endpoint = "";
      let body: any = {
        phone: cleanPhone,
        password,
      };

      if (type === "agent") {
        endpoint = "/auth/signup/agent";
        body = {
          ...body,
          name,
          email: email || undefined,
          branchId,
          refCode: refCode || undefined,
        };
      } else if (type === "supplier") {
        endpoint = "/auth/signup/supplier";
        body = {
          ...body,
          bizNo: bizNo.replace(/\D/g, ""),
          referrerPhone: referrerPhone.replace(/\D/g, ""),
        };
      } else if (type === "buyer") {
        endpoint = "/auth/signup/buyer";
        body = {
          ...body,
          bizNo: bizNo.replace(/\D/g, ""),
          referrerPhone: referrerPhone.replace(/\D/g, ""),
        };
      }

      const result = await apiFetch(endpoint, {
        method: "POST",
        body: JSON.stringify(body),
      });

      setMsg(`✅ ${result.message || "가입 완료!"} 로그인 페이지로 이동합니다...`);

      setTimeout(() => {
        window.location.href = "/login";
      }, 2000);
    } catch (error: any) {
      setMsg(`❌ 가입 실패: ${error.message || "알 수 없는 오류"}`);
    } finally {
      setLoading(false);
    }
  }

  if (step === "select") {
    return (
      <div className="container">
        <div className="card" style={{ maxWidth: 720, margin: "40px auto" }}>
          <h1>✍️ 회원가입</h1>
          <p style={{ marginTop: 8, color: "#666" }}>가입할 계정 유형을 선택하세요</p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: 16,
              marginTop: 32,
            }}
          >
            {/* 고용부담금 기업 */}
            <div
              onClick={() => handleTypeSelect("buyer")}
              style={{
                padding: 24,
                border: "2px solid #ddd",
                borderRadius: 12,
                cursor: "pointer",
                textAlign: "center",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#0070f3";
                e.currentTarget.style.background = "#f5f9ff";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "#ddd";
                e.currentTarget.style.background = "white";
              }}
            >
              <div style={{ fontSize: 48, marginBottom: 12 }}>🏢</div>
              <h3 style={{ margin: 0, fontSize: 18 }}>고용부담금 기업</h3>
              <p style={{ margin: "8px 0 0 0", fontSize: 14, color: "#666" }}>
                장애인 고용부담금 납부 대상 기업
              </p>
              <ul
                style={{
                  marginTop: 12,
                  paddingLeft: 20,
                  fontSize: 13,
                  color: "#666",
                  textAlign: "left",
                }}
              >
                <li>표준사업장 검색</li>
                <li>도급계약 견적 의뢰</li>
                <li>부담금 감면 계산</li>
              </ul>
            </div>

            {/* 표준사업장 기업 */}
            <div
              onClick={() => handleTypeSelect("supplier")}
              style={{
                padding: 24,
                border: "2px solid #ddd",
                borderRadius: 12,
                cursor: "pointer",
                textAlign: "center",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#0070f3";
                e.currentTarget.style.background = "#f5f9ff";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "#ddd";
                e.currentTarget.style.background = "white";
              }}
            >
              <div style={{ fontSize: 48, marginBottom: 12 }}>🏭</div>
              <h3 style={{ margin: 0, fontSize: 18 }}>표준사업장 기업</h3>
              <p style={{ margin: "8px 0 0 0", fontSize: 14, color: "#666" }}>
                장애인표준사업장 인증 기업
              </p>
              <ul
                style={{
                  marginTop: 12,
                  paddingLeft: 20,
                  fontSize: 13,
                  color: "#666",
                  textAlign: "left",
                }}
              >
                <li>상품/서비스 등록</li>
                <li>도급계약 수주</li>
                <li>프로필 관리</li>
              </ul>
            </div>

            {/* 매니저 */}
            <div
              onClick={() => handleTypeSelect("agent")}
              style={{
                padding: 24,
                border: "2px solid #ddd",
                borderRadius: 12,
                cursor: "pointer",
                textAlign: "center",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#0070f3";
                e.currentTarget.style.background = "#f5f9ff";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "#ddd";
                e.currentTarget.style.background = "white";
              }}
            >
              <div style={{ fontSize: 48, marginBottom: 12 }}>👤</div>
              <h3 style={{ margin: 0, fontSize: 18 }}>매니저</h3>
              <p style={{ margin: "8px 0 0 0", fontSize: 14, color: "#666" }}>
                지사 소속 영업 담당자
              </p>
              <ul
                style={{
                  marginTop: 12,
                  paddingLeft: 20,
                  fontSize: 13,
                  color: "#666",
                  textAlign: "left",
                }}
              >
                <li>기업 추천 및 매칭</li>
                <li>추천코드 관리</li>
                <li>실적 관리</li>
              </ul>
            </div>
          </div>

          <div style={{ marginTop: 32, textAlign: "center", fontSize: 14, color: "#666" }}>
            <p>
              이미 계정이 있으신가요?{" "}
              <a href="/login" style={{ color: "#0070f3", fontWeight: 600 }}>
                로그인
              </a>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 입력 폼
  return (
    <div className="container">
      <div className="card" style={{ maxWidth: 520, margin: "40px auto" }}>
        <button
          onClick={() => setStep("select")}
          style={{
            padding: "8px 16px",
            background: "#f5f5f5",
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
            fontSize: 14,
            marginBottom: 16,
          }}
        >
          ← 뒤로 가기
        </button>

        <h1>
          {type === "agent" && "👤 매니저 가입"}
          {type === "supplier" && "🏭 표준사업장 기업 가입"}
          {type === "buyer" && "🏢 고용부담금 기업 가입"}
        </h1>

        <div style={{ marginTop: 24 }}>
          {/* 공통: 핸드폰 번호 */}
          <label>핸드폰 번호 (아이디) *</label>
          <input
            type="tel"
            placeholder="010-1234-5678"
            value={phone}
            onChange={handlePhoneChange}
            maxLength={13}
          />

          {/* 공통: 비밀번호 */}
          <label>비밀번호 *</label>
          <input
            type="password"
            placeholder="8자 이상"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <label>비밀번호 확인 *</label>
          <input
            type="password"
            placeholder="비밀번호 재입력"
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
          />

          {/* 매니저 전용 필드 */}
          {type === "agent" && (
            <>
              <label>이름 *</label>
              <input
                type="text"
                placeholder="홍길동"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />

              <label>이메일 (선택)</label>
              <input
                type="email"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <label>소속 지사 *</label>
              <select value={branchId} onChange={(e) => setBranchId(e.target.value)}>
                <option value="">지사를 선택하세요</option>
                {branches.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name} ({branch.region})
                  </option>
                ))}
              </select>

              <label>추천코드 (선택)</label>
              <input
                type="text"
                placeholder="예: AGENT003"
                value={refCode}
                onChange={(e) => setRefCode(e.target.value.toUpperCase())}
              />
            </>
          )}

          {/* 기업 전용 필드 */}
          {(type === "supplier" || type === "buyer") && (
            <>
              <label>사업자등록번호 *</label>
              <input
                type="text"
                placeholder="123-45-67890"
                value={bizNo}
                onChange={handleBizNoChange}
                maxLength={12}
              />
              <p style={{ fontSize: 12, color: "#666", margin: "4px 0 12px 0" }}>
                💡 APICK API로 자동 인증되며, 상호명과 대표자명이 자동 입력됩니다
              </p>

              <label>추천인 매니저 핸드폰 번호 *</label>
              <input
                type="tel"
                placeholder="010-9876-5432"
                value={referrerPhone}
                onChange={handleReferrerPhoneChange}
                maxLength={13}
              />
              <p style={{ fontSize: 12, color: "#666", margin: "4px 0 12px 0" }}>
                💡 추천인 매니저의 핸드폰 번호를 입력하세요 (필수)
              </p>
            </>
          )}

          <button
            onClick={onSignup}
            disabled={loading}
            style={{ width: "100%", marginTop: 24 }}
          >
            {loading ? "가입 중..." : "가입하기"}
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
      </div>
    </div>
  );
}
