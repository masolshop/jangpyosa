"use client";

import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import { getToken } from "@/lib/auth";

export default function AccountPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  
  // 폼 데이터
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [managerName, setManagerName] = useState("");
  const [managerTitle, setManagerTitle] = useState("");
  const [managerEmail, setManagerEmail] = useState("");
  const [managerPhone, setManagerPhone] = useState("");
  
  // 비밀번호 변경
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirm, setNewPasswordConfirm] = useState("");

  useEffect(() => {
    loadUserData();
  }, []);

  async function loadUserData() {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        
        // 폼 데이터 설정
        setName(userData.name || "");
        setEmail(userData.email || "");
        setManagerName(userData.managerName || "");
        setManagerTitle(userData.managerTitle || "");
        setManagerEmail(userData.managerEmail || "");
        setManagerPhone(formatPhone(userData.managerPhone || ""));
      } else {
        // 로그인 필요
        window.location.href = "/login";
      }
    } catch (error) {
      console.error("Failed to load user data:", error);
      setMsg("❌ 사용자 정보를 불러올 수 없습니다");
    } finally {
      setLoading(false);
    }
  }

  const formatPhone = (value: string) => {
    const cleaned = value.replace(/\D/g, "");
    if (cleaned.length <= 3) return cleaned;
    if (cleaned.length <= 7) return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7, 11)}`;
  };

  async function onSaveProfile() {
    setMsg("");
    setSaving(true);
    
    try {
      const token = getToken();
      if (!token) {
        window.location.href = "/login";
        return;
      }
      
      const updateData: any = {};
      
      // 변경된 정보만 보내기
      if (name !== user.name) updateData.name = name;
      if (email !== user.email) updateData.email = email;
      if (managerName !== user.managerName) updateData.managerName = managerName;
      if (managerTitle !== user.managerTitle) updateData.managerTitle = managerTitle;
      if (managerEmail !== user.managerEmail) updateData.managerEmail = managerEmail;
      if (managerPhone.replace(/\D/g, "") !== (user.managerPhone || "")) {
        updateData.managerPhone = managerPhone.replace(/\D/g, "");
      }
      
      // 변경 사항이 없으면 알림
      if (Object.keys(updateData).length === 0) {
        setMsg("⚠️ 변경된 정보가 없습니다");
        setSaving(false);
        return;
      }
      
      const result = await apiFetch("/auth/update-profile", {
        method: "POST",
        body: JSON.stringify(updateData),
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      
      // 로컬스토리지 업데이트
      localStorage.setItem("user", JSON.stringify(result.user));
      setUser(result.user);
      
      setMsg("✅ 회원정보가 수정되었습니다");
      
    } catch (error: any) {
      console.error("Save profile error:", error);
      setMsg(`❌ ${error.data?.message || error.message || "정보 수정 실패"}`);
    } finally {
      setSaving(false);
    }
  }

  async function onChangePassword() {
    setMsg("");
    
    if (!currentPassword || !newPassword || !newPasswordConfirm) {
      setMsg("❌ 모든 비밀번호 항목을 입력하세요");
      return;
    }
    
    if (newPassword !== newPasswordConfirm) {
      setMsg("❌ 새 비밀번호가 일치하지 않습니다");
      return;
    }
    
    if (newPassword.length < 8) {
      setMsg("❌ 비밀번호는 8자 이상이어야 합니다");
      return;
    }
    
    setSaving(true);
    
    try {
      const token = getToken();
      if (!token) {
        window.location.href = "/login";
        return;
      }
      
      const result = await apiFetch("/auth/update-profile", {
        method: "POST",
        body: JSON.stringify({
          currentPassword,
          newPassword
        }),
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      
      setMsg("✅ 비밀번호가 변경되었습니다");
      
      // 비밀번호 필드 초기화
      setCurrentPassword("");
      setNewPassword("");
      setNewPasswordConfirm("");
      setShowPasswordChange(false);
      
    } catch (error: any) {
      console.error("Change password error:", error);
      setMsg(`❌ ${error.data?.message || error.message || "비밀번호 변경 실패"}`);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div style={{ 
        minHeight: "100vh", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center" 
      }}>
        <p>로딩 중...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const getUserTypeLabel = (role: string) => {
    switch (role) {
      case "AGENT": return "👔 매니저";
      case "SUPPLIER": return "🏭 표준사업장";
      case "BUYER": return "🏢 고용의무기업";
      case "SUPER_ADMIN": return "👑 슈퍼어드민";
      default: return role;
    }
  };

  return (
    <div className="container">
      <div className="card" style={{ maxWidth: 600, margin: "40px auto" }}>
        <div style={{ marginBottom: 24 }}>
          <a href="/" style={{ color: "#0070f3", textDecoration: "none", fontSize: 14 }}>
            ← 홈으로 돌아가기
          </a>
        </div>

        <h1>👤 회원정보 수정</h1>
        
        {/* 회원 유형 표시 */}
        <div style={{
          marginTop: 16,
          padding: 12,
          background: "#e7f3ff",
          borderRadius: 8,
          fontSize: 14,
          color: "#0070f3",
          fontWeight: 600
        }}>
          {getUserTypeLabel(user.role)}
        </div>

        {/* 기본 정보 */}
        <div style={{ marginTop: 24 }}>
          <h3 style={{ marginBottom: 16, fontSize: 18 }}>기본 정보</h3>
          
          {user.role === "AGENT" && (
            <>
              <label>이름</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="이름"
              />
              
              <label style={{ marginTop: 16 }}>이메일 (선택)</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="이메일"
              />
              
              <label style={{ marginTop: 16 }}>핸드폰 번호 (로그인 ID)</label>
              <input
                type="text"
                value={formatPhone(user.phone)}
                disabled
                style={{ background: "#f5f5f5", color: "#999" }}
              />
              <p style={{ fontSize: 12, color: "#666", marginTop: 4 }}>
                * 핸드폰 번호는 변경할 수 없습니다
              </p>
            </>
          )}
          
          {(user.role === "SUPPLIER" || user.role === "BUYER") && (
            <>
              <label>로그인 ID</label>
              <input
                type="text"
                value={user.username}
                disabled
                style={{ background: "#f5f5f5", color: "#999" }}
              />
              <p style={{ fontSize: 12, color: "#666", marginTop: 4 }}>
                * 로그인 ID는 변경할 수 없습니다
              </p>
              
              {user.company && (
                <>
                  <label style={{ marginTop: 16 }}>회사명</label>
                  <input
                    type="text"
                    value={user.company.name}
                    disabled
                    style={{ background: "#f5f5f5", color: "#999" }}
                  />
                  
                  <label style={{ marginTop: 16 }}>사업자번호</label>
                  <input
                    type="text"
                    value={user.company.bizNo}
                    disabled
                    style={{ background: "#f5f5f5", color: "#999" }}
                  />
                </>
              )}
              
              <h3 style={{ marginTop: 32, marginBottom: 16, fontSize: 18 }}>담당자 정보</h3>
              
              <label>담당자 성함</label>
              <input
                type="text"
                value={managerName}
                onChange={(e) => setManagerName(e.target.value)}
                placeholder="담당자 성함"
              />
              
              <label style={{ marginTop: 16 }}>담당자 직함 (선택)</label>
              <input
                type="text"
                value={managerTitle}
                onChange={(e) => setManagerTitle(e.target.value)}
                placeholder="예: 대리, 과장"
              />
              
              <label style={{ marginTop: 16 }}>담당자 이메일 (선택)</label>
              <input
                type="email"
                value={managerEmail}
                onChange={(e) => setManagerEmail(e.target.value)}
                placeholder="담당자 이메일"
              />
              
              <label style={{ marginTop: 16 }}>담당자 핸드폰 (알림톡용)</label>
              <input
                type="tel"
                value={managerPhone}
                onChange={(e) => setManagerPhone(formatPhone(e.target.value))}
                placeholder="010-1234-5678"
                maxLength={13}
              />
            </>
          )}

          <button
            onClick={onSaveProfile}
            disabled={saving}
            style={{ width: "100%", marginTop: 24 }}
          >
            {saving ? "저장 중..." : "정보 수정"}
          </button>
        </div>

        {/* 비밀번호 변경 */}
        <div style={{ marginTop: 32, paddingTop: 32, borderTop: "1px solid #ddd" }}>
          <h3 style={{ marginBottom: 16, fontSize: 18 }}>비밀번호 변경</h3>
          
          {!showPasswordChange ? (
            <button
              onClick={() => setShowPasswordChange(true)}
              style={{ 
                width: "100%", 
                background: "#f5f5f5", 
                color: "#333" 
              }}
            >
              비밀번호 변경하기
            </button>
          ) : (
            <>
              <label>현재 비밀번호</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="현재 비밀번호"
              />
              
              <label style={{ marginTop: 16 }}>새 비밀번호</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="8자 이상"
              />
              
              <label style={{ marginTop: 16 }}>새 비밀번호 확인</label>
              <input
                type="password"
                value={newPasswordConfirm}
                onChange={(e) => setNewPasswordConfirm(e.target.value)}
                placeholder="비밀번호 재입력"
              />
              
              <button
                onClick={onChangePassword}
                disabled={saving}
                style={{ width: "100%", marginTop: 20 }}
              >
                {saving ? "변경 중..." : "비밀번호 변경"}
              </button>
              
              <button
                onClick={() => {
                  setShowPasswordChange(false);
                  setCurrentPassword("");
                  setNewPassword("");
                  setNewPasswordConfirm("");
                  setMsg("");
                }}
                style={{ 
                  width: "100%", 
                  marginTop: 8, 
                  background: "#f5f5f5", 
                  color: "#333" 
                }}
              >
                취소
              </button>
            </>
          )}
        </div>

        {/* 메시지 */}
        {msg && (
          <p
            style={{
              marginTop: 20,
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

      <style>{`
        .container {
          min-height: 100vh;
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
        input:disabled {
          background: #f5f5f5;
          color: #999;
          cursor: not-allowed;
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
