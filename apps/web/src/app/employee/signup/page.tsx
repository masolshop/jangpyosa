"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// Next.js 프록시를 통해 백엔드 API 호출
const API_BASE = "/api/proxy";

export default function EmployeeSignupPage() {
  const router = useRouter();

  // 폼 상태
  const [step, setStep] = useState<1 | 2 | 3>(1); // 단계: 1=기업확인, 2=직원확인, 3=비밀번호+동의
  const [bizNo, setBizNo] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [privacyAgreed, setPrivacyAgreed] = useState(false);

  // 검증 완료된 데이터
  const [verifiedCompany, setVerifiedCompany] = useState<any>(null);
  const [verifiedEmployee, setVerifiedEmployee] = useState<any>(null);

  // UI 상태
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ======================================
  // Step 1: 사업자등록번호로 등록 기업 확인
  // ======================================
  const handleVerifyCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/auth/verify-company`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bizNo }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "등록된 기업을 찾을 수 없습니다");
        return;
      }

      setVerifiedCompany(data.company);
      setStep(2);
    } catch (err: any) {
      setError("서버 오류가 발생했습니다");
    } finally {
      setLoading(false);
    }
  };

  // ======================================
  // Step 2: 인증번호로 등록 직원 확인
  // ======================================
  const handleVerifyEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/auth/verify-employee`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          buyerProfileId: verifiedCompany.buyerProfileId,
          registrationNumber,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "등록된 직원을 찾을 수 없습니다");
        return;
      }

      setVerifiedEmployee(data.employee);
      setStep(3);
    } catch (err: any) {
      setError("서버 오류가 발생했습니다");
    } finally {
      setLoading(false);
    }
  };

  // ======================================
  // Step 3: 회원가입 완료 (핸드폰 + 비밀번호 + 동의)
  // ======================================
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // 유효성 검사
    if (!phone || phone.length < 10) {
      setError("핸드폰 번호를 정확히 입력하세요");
      return;
    }

    if (password.length < 8) {
      setError("비밀번호는 8자 이상이어야 합니다");
      return;
    }

    if (password !== passwordConfirm) {
      setError("비밀번호가 일치하지 않습니다");
      return;
    }

    if (!privacyAgreed) {
      setError("개인정보 활용 동의는 필수입니다");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/auth/signup/employee`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone,
          password,
          employeeId: verifiedEmployee.id,
          companyBizNo: verifiedCompany.bizNo,
          privacyAgreed,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "회원가입에 실패했습니다");
        return;
      }

      alert("✅ 회원가입이 완료되었습니다!");
      router.push("/employee/login");
    } catch (err: any) {
      setError("서버 오류가 발생했습니다");
    } finally {
      setLoading(false);
    }
  };

  // ======================================
  // UI 렌더링
  // ======================================
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            👷 장애인직원 회원가입
          </h1>
          <p className="text-gray-600 text-sm">
            기업에 등록된 장애인 직원만 가입할 수 있습니다
          </p>
        </div>

        {/* 진행 단계 표시 */}
        <div className="flex justify-center items-center mb-8 space-x-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
            step >= 1 ? "bg-blue-500 text-white" : "bg-gray-300 text-gray-600"
          }`}>
            1
          </div>
          <div className={`w-12 h-1 ${step >= 2 ? "bg-blue-500" : "bg-gray-300"}`} />
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
            step >= 2 ? "bg-blue-500 text-white" : "bg-gray-300 text-gray-600"
          }`}>
            2
          </div>
          <div className={`w-12 h-1 ${step >= 3 ? "bg-blue-500" : "bg-gray-300"}`} />
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
            step >= 3 ? "bg-blue-500 text-white" : "bg-gray-300 text-gray-600"
          }`}>
            3
          </div>
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-300 rounded-lg text-red-700 text-sm">
            ⚠️ {error}
          </div>
        )}

        {/* Step 1: 기업 확인 */}
        {step === 1 && (
          <form onSubmit={handleVerifyCompany} className="space-y-6">
            <div className="text-center mb-4">
              <h2 className="text-xl font-bold text-gray-800 mb-2">
                📋 Step 1: 등록 기업 매칭
              </h2>
              <p className="text-gray-600 text-sm">
                소속 기업의 사업자등록번호를 입력하세요
              </p>
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">
                사업자등록번호 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={bizNo}
                onChange={(e) => setBizNo(e.target.value)}
                placeholder="123-45-67890"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                기업에서 제공받은 사업자등록번호를 입력하세요
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? "확인 중..." : "기업 확인"}
            </button>

            <div className="text-center text-sm text-gray-600">
              이미 계정이 있으신가요?{" "}
              <a href="/employee/login" className="text-blue-600 font-bold hover:underline">
                로그인하기
              </a>
            </div>
          </form>
        )}

        {/* Step 2: 직원 확인 */}
        {step === 2 && (
          <form onSubmit={handleVerifyEmployee} className="space-y-6">
            <div className="text-center mb-4">
              <h2 className="text-xl font-bold text-gray-800 mb-2">
                🔑 Step 2: 등록 직원 매칭
              </h2>
              <p className="text-gray-600 text-sm">
                주민등록번호 앞자리 6자리를 입력하세요
              </p>
            </div>

            {/* 확인된 기업 정보 */}
            <div className="bg-green-50 border border-green-300 rounded-lg p-4 mb-4">
              <p className="text-green-800 font-bold mb-1">✅ 등록 기업 확인 완료</p>
              <p className="text-gray-700 text-sm">
                <strong>{verifiedCompany.name}</strong> ({verifiedCompany.bizNo})
              </p>
              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  setVerifiedCompany(null);
                  setRegistrationNumber("");
                }}
                className="text-xs text-blue-600 hover:underline mt-2"
              >
                다시 입력하기
              </button>
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">
                인증번호 (주민등록번호 앞자리) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={registrationNumber}
                onChange={(e) => setRegistrationNumber(e.target.value)}
                placeholder="901234"
                maxLength={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                생년월일 6자리 (예: 901234)
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? "확인 중..." : "직원 확인"}
            </button>
          </form>
        )}

        {/* Step 3: 핸드폰 + 비밀번호 + 동의 */}
        {step === 3 && (
          <form onSubmit={handleSignup} className="space-y-6">
            <div className="text-center mb-4">
              <h2 className="text-xl font-bold text-gray-800 mb-2">
                📝 Step 3: 회원가입 완료
              </h2>
              <p className="text-gray-600 text-sm">
                계정 정보를 입력하세요
              </p>
            </div>

            {/* 확인된 직원 정보 */}
            <div className="bg-green-50 border border-green-300 rounded-lg p-4 mb-4">
              <p className="text-green-800 font-bold mb-1">✅ 등록 직원 확인 완료</p>
              <p className="text-gray-700 text-sm">
                <strong>이름:</strong> {verifiedEmployee.name}
              </p>
              <p className="text-gray-700 text-sm">
                <strong>근무형태:</strong> {verifiedEmployee.workType || "정규직"}
              </p>
              <p className="text-gray-700 text-sm">
                <strong>장애유형:</strong> {verifiedEmployee.disabilityType || "미분류"}
              </p>
              <button
                type="button"
                onClick={() => {
                  setStep(2);
                  setVerifiedEmployee(null);
                  setPhone("");
                  setPassword("");
                  setPasswordConfirm("");
                  setPrivacyAgreed(false);
                }}
                className="text-xs text-blue-600 hover:underline mt-2"
              >
                다시 입력하기
              </button>
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">
                핸드폰 번호 <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="010-1234-5678"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">
                비밀번호 <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="8자 이상 입력"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">
                비밀번호 확인 <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                placeholder="비밀번호 재입력"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="flex items-start space-x-2">
              <input
                type="checkbox"
                id="privacyAgreed"
                checked={privacyAgreed}
                onChange={(e) => setPrivacyAgreed(e.target.checked)}
                className="mt-1 w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                required
              />
              <label htmlFor="privacyAgreed" className="text-sm text-gray-700">
                <span className="text-red-500">*</span> 개인정보 수집 및 이용에 동의합니다
                <a href="/privacy" target="_blank" className="text-blue-600 hover:underline ml-1">
                  (자세히 보기)
                </a>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? "가입 중..." : "회원가입 완료"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
