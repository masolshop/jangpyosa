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
  const [privacyAgreed, setPrivacyAgreed] = useState(false); // 🆕 개인정보 동의

  // 매니저 전용
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [branchId, setBranchId] = useState("");
  const [refCode, setRefCode] = useState("");
  const [branches, setBranches] = useState<any[]>([]);

  // 기업 전용
  const [username, setUsername] = useState(""); // 🆕 로그인 ID
  const [bizNo, setBizNo] = useState("");
  const [referrerPhone, setReferrerPhone] = useState("");
  const [buyerType, setBuyerType] = useState<"PRIVATE_COMPANY" | "PUBLIC_INSTITUTION" | "GOVERNMENT">("PRIVATE_COMPANY");
  
  // 🆕 기업 담당자 정보
  const [managerName, setManagerName] = useState("");
  const [managerTitle, setManagerTitle] = useState("");
  const [managerEmail, setManagerEmail] = useState("");
  const [managerPhone, setManagerPhone] = useState("");

  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [companyInfo, setCompanyInfo] = useState<{name: string; ceo: string} | null>(null);
  const [verifying, setVerifying] = useState(false);

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

  // APICK 사업자번호 자동 인증
  async function verifyBizNo() {
    const cleanBizNo = bizNo.replace(/\D/g, "");
    if (cleanBizNo.length !== 10) {
      setMsg("사업자번호 10자리를 입력하세요");
      return;
    }
    
    setVerifying(true);
    setMsg("");
    setCompanyInfo(null);
    
    try {
      const response = await fetch(`/api/bizno/verify?bizNo=${cleanBizNo}`);
      const data = await response.json();
      
      if (!response.ok) {
        setMsg(`❌ ${data.message || "사업자번호 인증 실패"}`);
        return;
      }
      
      setCompanyInfo({
        name: data.companyName || "회사명 확인 필요",
        ceo: data.ceoName || "대표자명 확인 필요"
      });
      setMsg("✅ 사업자번호 인증 완료");
    } catch (error) {
      console.error("BizNo verification error:", error);
      setMsg("❌ 사업자번호 인증 중 오류 발생");
    } finally {
      setVerifying(false);
    }
  }

  const handleBizNoKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      verifyBizNo();
    }
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
      if (type === "buyer" && !buyerType) {
        setMsg("기업 유형을 선택하세요");
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
          buyerType,
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
      console.error("Signup error:", error);
      
      // 에러 메시지 개선
      let errorMsg = "알 수 없는 오류가 발생했습니다";
      
      if (error.error === "PHONE_ALREADY_EXISTS") {
        errorMsg = "이미 가입된 핸드폰 번호입니다. 로그인하거나 다른 번호를 사용하세요.";
      } else if (error.error === "BIZNO_ALREADY_REGISTERED") {
        errorMsg = "이미 가입된 사업자번호입니다. 담당자 추가 기능을 이용하세요. (동일 사업자번호로 추가 가입 가능)";
      } else if (error.error === "BIZNO_VERIFICATION_FAILED") {
        errorMsg = "사업자번호 인증에 실패했습니다. 번호를 확인하거나 관리자에게 문의하세요.";
      } else if (error.error === "REFERRER_NOT_FOUND") {
        errorMsg = "추천인 매니저를 찾을 수 없습니다. 핸드폰 번호를 확인하거나 매니저에게 문의하세요.";
      } else if (error.error === "BRANCH_NOT_FOUND") {
        errorMsg = "선택한 지사를 찾을 수 없습니다. 관리자에게 문의하세요.";
      } else if (error.error === "REFCODE_ALREADY_EXISTS") {
        errorMsg = "이미 사용 중인 추천코드입니다. 다른 코드를 입력하세요.";
      } else if (error.error === "VALIDATION_ERROR") {
        errorMsg = "입력 정보를 확인하세요. 필수 항목이 누락되었거나 형식이 잘못되었습니다.";
      } else if (error.message) {
        errorMsg = error.message;
      }
      
      setMsg(`❌ 가입 실패: ${errorMsg}`);
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
          
          <div style={{
            marginTop: 20,
            padding: 16,
            background: "#f8f9fa",
            borderRadius: 8,
            fontSize: 14,
            lineHeight: 1.6,
            color: "#333"
          }}>
            <p style={{ margin: 0, fontWeight: 600, marginBottom: 8 }}>📋 가입 전 안내사항</p>
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              <li><strong>고용부담금 기업</strong>: 3가지 유형(민간기업, 공공기관, 국가/지자체/교육청)이 있으며, 유형에 따라 의무고용률과 감면 계산식이 다릅니다.</li>
              <li><strong>표준사업장 기업</strong>: 장애인표준사업장 인증을 받은 기업만 가입 가능합니다.</li>
              <li><strong>매니저</strong>: 소속 지사를 선택하고, 기업 추천 시 사용할 추천코드를 등록합니다.</li>
              <li style={{ marginTop: 8, color: "#0070f3", fontWeight: 600 }}>💡 이미 가입한 기업의 담당자는 동일한 사업자번호로 추가 가입 가능합니다.</li>
            </ul>
          </div>

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
                <li>📊 장애인 직원 등록 및 관리</li>
                <li>💰 고용부담금/장려금 자동 계산</li>
                <li>🏭 표준사업장 검색 및 도급계약</li>
                <li>📉 연계고용 감면 계산</li>
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
                <li>🛍️ 상품/서비스 등록 및 관리</li>
                <li>📑 도급계약 견적서 제출</li>
                <li>🤝 월별 이행 내역 관리</li>
                <li>💳 결제/정산 관리</li>
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
                <li>🎯 기업 추천 및 매칭</li>
                <li>🔑 추천코드 관리</li>
                <li>📈 실적 및 수수료 관리</li>
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
        
        {/* 가입 안내 */}
        <div style={{
          marginTop: 16,
          padding: 14,
          background: "#e7f3ff",
          borderLeft: "4px solid #0070f3",
          borderRadius: 4,
          fontSize: 13,
          lineHeight: 1.6
        }}>
          {type === "agent" && (
            <p style={{ margin: 0 }}>
              💡 <strong>매니저 가입 안내</strong><br/>
              소속 지사를 선택하고, 기업 추천 시 사용할 고유한 추천코드를 등록하세요.
            </p>
          )}
          {type === "supplier" && (
            <p style={{ margin: 0 }}>
              💡 <strong>표준사업장 가입 안내</strong><br/>
              사업자번호 입력 시 APICK API로 자동 인증되며, 기업명과 대표자명이 자동으로 입력됩니다.<br/>
              <span style={{ color: "#d32f2f", fontWeight: 600 }}>⚠️ 동일한 사업자번호로 중복 가입 시 에러가 발생합니다.</span>
            </p>
          )}
          {type === "buyer" && (
            <>
              <p style={{ margin: 0 }}>
                💡 <strong>고용부담금 기업 가입 안내</strong>
              </p>
              <ul style={{ margin: "8px 0 0 0", paddingLeft: 20, fontSize: 13, lineHeight: 1.6 }}>
                <li><strong>기업 유형</strong>을 정확히 선택하세요. 유형에 따라 의무고용률과 감면 계산식이 달라집니다.</li>
                <li><strong>사업자등록번호</strong> 입력 시 APICK API로 상호명과 대표자명이 자동 출력됩니다.</li>
                <li><strong>추천인 매니저</strong>의 핸드폰 번호를 입력해야 가입 가능합니다.</li>
                <li style={{ color: "#d32f2f", fontWeight: 600 }}>⚠️ 매니저를 통해서만 가입 가능합니다.</li>
              </ul>
            </>
          )}
        </div>

        <div style={{ marginTop: 24 }}>
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
            </>
          )}

          {/* 기업 전용 필드 (buyer, supplier) */}
          {(type === "supplier" || type === "buyer") && (
            <>
              {/* BUYER 전용: 기업 유형 선택 (3가지) - 맨 위로 */}
              {type === "buyer" && (
                <>
                  <label>기업 유형 *</label>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 16 }}>
                    {/* 민간기업 */}
                    <button
                      type="button"
                      onClick={() => setBuyerType("PRIVATE_COMPANY")}
                      style={{
                        padding: "16px 12px",
                        border: buyerType === "PRIVATE_COMPANY" ? "2px solid #0070f3" : "2px solid #ddd",
                        borderRadius: 8,
                        background: buyerType === "PRIVATE_COMPANY" ? "#e7f3ff" : "white",
                        cursor: "pointer",
                        transition: "all 0.2s",
                        fontSize: 13,
                        fontWeight: buyerType === "PRIVATE_COMPANY" ? "bold" : "normal",
                        color: buyerType === "PRIVATE_COMPANY" ? "#0070f3" : "#666",
                        textAlign: "center"
                      }}
                    >
                      🏢<br/>
                      <strong>민간기업</strong><br/>
                      <span style={{ fontSize: 11, fontWeight: "normal", color: "#888" }}>의무고용률 3.1%</span>
                    </button>
                    
                    {/* 공공기관 */}
                    <button
                      type="button"
                      onClick={() => setBuyerType("PUBLIC_INSTITUTION")}
                      style={{
                        padding: "16px 12px",
                        border: buyerType === "PUBLIC_INSTITUTION" ? "2px solid #0070f3" : "2px solid #ddd",
                        borderRadius: 8,
                        background: buyerType === "PUBLIC_INSTITUTION" ? "#e7f3ff" : "white",
                        cursor: "pointer",
                        transition: "all 0.2s",
                        fontSize: 13,
                        fontWeight: buyerType === "PUBLIC_INSTITUTION" ? "bold" : "normal",
                        color: buyerType === "PUBLIC_INSTITUTION" ? "#0070f3" : "#666",
                        textAlign: "center"
                      }}
                    >
                      🏛️<br/>
                      <strong>공공기관</strong><br/>
                      <span style={{ fontSize: 11, fontWeight: "normal", color: "#888" }}>의무고용률 3.8%</span>
                    </button>
                    
                    {/* 국가/지자체/교육청 */}
                    <button
                      type="button"
                      onClick={() => setBuyerType("GOVERNMENT")}
                      style={{
                        padding: "16px 12px",
                        border: buyerType === "GOVERNMENT" ? "2px solid #0070f3" : "2px solid #ddd",
                        borderRadius: 8,
                        background: buyerType === "GOVERNMENT" ? "#e7f3ff" : "white",
                        cursor: "pointer",
                        transition: "all 0.2s",
                        fontSize: 13,
                        fontWeight: buyerType === "GOVERNMENT" ? "bold" : "normal",
                        color: buyerType === "GOVERNMENT" ? "#0070f3" : "#666",
                        textAlign: "center"
                      }}
                    >
                      🏫<br/>
                      <strong>국가/지자체<br/>교육청</strong><br/>
                      <span style={{ fontSize: 11, fontWeight: "normal", color: "#888" }}>의무고용률 3.8%</span>
                    </button>
                  </div>
                  
                </>
              )}

              {/* 사업자등록번호 */}
              <label>사업자등록번호 *</label>
              <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                <input
                  type="text"
                  placeholder="123-45-67890"
                  value={bizNo}
                  onChange={handleBizNoChange}
                  onKeyDown={handleBizNoKeyDown}
                  maxLength={12}
                  style={{ flex: 1 }}
                />
                <button
                  type="button"
                  onClick={verifyBizNo}
                  disabled={verifying || bizNo.replace(/\D/g, "").length !== 10}
                  style={{
                    padding: "10px 16px",
                    background: verifying ? "#ccc" : "#0070f3",
                    color: "white",
                    border: "none",
                    borderRadius: 6,
                    cursor: verifying ? "not-allowed" : "pointer",
                    fontSize: 14,
                    fontWeight: 600,
                    whiteSpace: "nowrap"
                  }}
                >
                  {verifying ? "인증 중..." : "인증"}
                </button>
              </div>
              <p style={{ fontSize: 12, color: "#666", margin: "4px 0 0 0" }}>
                💡 사업자번호를 입력하고 <strong>엔터</strong> 또는 <strong>인증 버튼</strong>을 클릭하세요
              </p>
              
              {/* APICK 인증 결과 */}
              {companyInfo && (
                <div style={{
                  marginTop: 12,
                  padding: 12,
                  background: "#e7f3ff",
                  borderRadius: 6,
                  fontSize: 13,
                  lineHeight: 1.6
                }}>
                  <p style={{ margin: 0, fontWeight: 600, color: "#0070f3" }}>✅ APICK 인증 완료</p>
                  <p style={{ margin: "8px 0 0 0", color: "#333" }}>
                    <strong>상호명:</strong> {companyInfo.name}<br/>
                    <strong>대표자명:</strong> {companyInfo.ceo}
                  </p>
                </div>
              )}

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

              {/* 추천인 매니저 핸드폰 번호 - 마지막 */}
              <label>추천인 매니저 핸드폰 번호 *</label>
              <input
                type="tel"
                placeholder="010-9876-5432"
                value={referrerPhone}
                onChange={handleReferrerPhoneChange}
                maxLength={13}
              />
              <p style={{ fontSize: 12, color: "#d32f2f", fontWeight: 600, margin: "4px 0 12px 0" }}>
                ⚠️ 매니저를 통해서만 가입 가능합니다. 매니저의 핸드폰 번호를 입력하세요.
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
