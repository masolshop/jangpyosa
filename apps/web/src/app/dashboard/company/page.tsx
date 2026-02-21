"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";

type CompanyInfo = {
  id: string;
  name: string;
  bizNo: string;
  representative: string | null;
  type: string;
  buyerType: string | null;
  isVerified: boolean;
};

type TeamMember = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  username: string | null;
  managerName: string | null;
  managerTitle: string | null;
  managerEmail: string | null;
  managerPhone: string | null;
  role: string;
  isCompanyOwner: boolean;
  createdAt: string;
};

type ActivityLog = {
  id: string;
  userId: string;
  userName: string;
  action: string;
  targetType: string;
  targetId: string | null;
  targetName: string | null;
  details: any;
  ipAddress: string | null;
  createdAt: string;
};

type Invitation = {
  id: string;
  inviteCode: string;
  inviteUrl: string;
  companyName: string;
  role: string;
  isUsed: boolean;
  usedAt: string | null;
  expiresAt: string;
  createdAt: string;
};

export default function CompanyDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [company, setCompany] = useState<CompanyInfo | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  
  // 편집 모드
  const [editingCompany, setEditingCompany] = useState(false);
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [companyForm, setCompanyForm] = useState({ name: "", representative: "" });
  const [memberForm, setMemberForm] = useState({
    name: "",
    email: "",
    managerName: "",
    managerTitle: "",
    managerEmail: "",
    managerPhone: ""
  });

  // 초대 코드 생성
  const [creatingInvite, setCreatingInvite] = useState(false);
  const [inviteRole, setInviteRole] = useState<"BUYER" | "SUPPLIER">("BUYER");
  const [message, setMessage] = useState("");
  const [newInvitation, setNewInvitation] = useState<Invitation | null>(null);
  const [copiedCode, setCopiedCode] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      await Promise.all([
        loadCompanyInfo(),
        loadMembers(),
        loadActivityLogs(),
        loadInvitations()
      ]);
    } catch (error: any) {
      console.error("데이터 로드 실패:", error);
      if (error.status === 401) {
        router.push("/login");
      }
    } finally {
      setLoading(false);
    }
  }

  async function loadCompanyInfo() {
    const data = await apiFetch("/companies/my");
    setCompany(data.company);
    setIsOwner(data.isOwner);
    setCompanyForm({
      name: data.company.name,
      representative: data.company.representative || ""
    });
    // 회사 타입에 따라 초대 역할 자동 설정
    if (data.company.type === "BUYER") {
      setInviteRole("BUYER");
    } else if (data.company.type === "SUPPLIER") {
      setInviteRole("SUPPLIER");
    }
  }

  async function loadMembers() {
    const data = await apiFetch("/team/members");
    setMembers(data.members);
  }

  async function loadActivityLogs() {
    const data = await apiFetch("/team/activity-log?limit=20");
    setActivityLogs(data.logs);
  }

  async function loadInvitations() {
    const data = await apiFetch("/team/invitations");
    // 초대 URL을 클라이언트에서 생성
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
    const invitationsWithUrl = data.invitations.map((inv: any) => ({
      ...inv,
      inviteUrl: `${baseUrl}/signup?invite=${inv.inviteCode}`
    }));
    setInvitations(invitationsWithUrl);
  }

  async function handleUpdateCompany() {
    try {
      await apiFetch("/companies/my", {
        method: "PUT",
        body: JSON.stringify(companyForm)
      });
      setMessage("기업 정보가 수정되었습니다");
      setEditingCompany(false);
      await loadCompanyInfo();
      await loadActivityLogs();
    } catch (error: any) {
      setMessage("수정 실패: " + (error.message || "알 수 없는 오류"));
    }
  }

  async function handleUpdateMember(memberId: string) {
    try {
      await apiFetch(`/team/members/${memberId}`, {
        method: "PUT",
        body: JSON.stringify(memberForm)
      });
      setMessage("팀원 정보가 수정되었습니다");
      setEditingMemberId(null);
      await loadMembers();
      await loadActivityLogs();
    } catch (error: any) {
      setMessage("수정 실패: " + (error.message || "알 수 없는 오류"));
    }
  }

  async function handleDeleteMember(memberId: string, memberName: string) {
    if (!confirm(`정말 ${memberName} 팀원을 삭제하시겠습니까?`)) {
      return;
    }

    try {
      await apiFetch(`/team/members/${memberId}`, {
        method: "DELETE"
      });
      setMessage("팀원이 삭제되었습니다");
      await loadMembers();
      await loadActivityLogs();
    } catch (error: any) {
      alert("삭제 실패: " + (error.message || "알 수 없는 오류"));
    }
  }

  function startEditMember(member: TeamMember) {
    setEditingMemberId(member.id);
    setMemberForm({
      name: member.name,
      email: member.email || "",
      managerName: member.managerName || "",
      managerTitle: member.managerTitle || "",
      managerEmail: member.managerEmail || "",
      managerPhone: member.managerPhone || ""
    });
  }

  async function createInvitation() {
    setMessage("");
    setCreatingInvite(true);
    setNewInvitation(null);

    try {
      const data = await apiFetch("/team/invite", {
        method: "POST",
        body: JSON.stringify({ role: inviteRole })
      });
      
      // 초대 URL을 클라이언트에서 생성
      const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
      const invitationWithUrl = {
        ...data.invitation,
        inviteUrl: `${baseUrl}/signup?invite=${data.invitation.inviteCode}`
      };
      
      setNewInvitation(invitationWithUrl);
      setMessage("초대 코드가 생성되었습니다");
      await loadInvitations();
    } catch (error: any) {
      setMessage("생성 실패: " + (error.message || "알 수 없는 오류"));
    } finally {
      setCreatingInvite(false);
    }
  }

  async function deleteInvitation(id: string) {
    if (!confirm("초대 코드를 삭제하시겠습니까?")) return;

    try {
      await apiFetch(`/team/invite/${id}`, {
        method: "DELETE"
      });
      setMessage("초대 코드가 삭제되었습니다");
      await loadInvitations();
    } catch (error: any) {
      alert("삭제 실패: " + (error.message || "알 수 없는 오류"));
    }
  }

  function copyToClipboard(text: string, code: string) {
    navigator.clipboard.writeText(text);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(""), 2000);
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit"
    });
  }

  function getActionLabel(action: string) {
    const labels: Record<string, string> = {
      CREATE: "생성",
      UPDATE: "수정",
      DELETE: "삭제",
      LOGIN: "로그인",
      LOGOUT: "로그아웃",
      INVITE: "초대",
    };
    return labels[action] || action;
  }

  function getTargetTypeLabel(targetType: string) {
    const labels: Record<string, string> = {
      EMPLOYEE: "직원",
      ANNOUNCEMENT: "공지사항",
      TEAM_MEMBER: "팀원",
      COMPANY: "기업정보",
      MONTHLY_DATA: "월별데이터",
    };
    return labels[targetType] || targetType;
  }

  if (loading) {
    return (
      <div className="container" style={{ padding: 40 }}>
        <div className="card">
          <p style={{ textAlign: "center", fontSize: 16 }}>로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="container" style={{ padding: 40 }}>
        <div className="card">
          <p className="error">기업 정보를 불러올 수 없습니다</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: 40 }}>
      <div 
        className="card"
        style={{
          boxShadow: "0 10px 20px -2px rgba(59, 130, 246, 0.3), 0 6px 12px -2px rgba(59, 130, 246, 0.2)"
        }}
      >
        <h1 style={{ fontSize: 28, marginBottom: 8 }}>🏢 기업 대시보드</h1>
        <p style={{ color: "#666", fontSize: 14, marginBottom: 32 }}>
          팀원 관리 · 활동 로그 · 기업정보 수정
        </p>

        {message && (
          <div
            style={{
              marginBottom: 24,
              padding: 16,
              background: message.includes("실패") ? "#fee2e2" : "#d1fae5",
              borderRadius: 8,
              color: message.includes("실패") ? "#991b1b" : "#065f46",
              fontWeight: 600,
              boxShadow: "0 4px 8px -1px rgba(59, 130, 246, 0.3), 0 2px 4px -1px rgba(59, 130, 246, 0.2)"
            }}
          >
            {message}
          </div>
        )}

        {/* 기업 정보 */}
        <div
          style={{
            padding: 24,
            background: "rgba(219, 234, 254, 0.2)",
            borderRadius: 12,
            marginBottom: 32,
            boxShadow: "0 8px 16px -2px rgba(59, 130, 246, 0.3), 0 4px 8px -2px rgba(59, 130, 246, 0.2)"
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h2 style={{ margin: 0, fontSize: 20 }}>📋 기업 정보</h2>
            {!editingCompany && (
              <button
                onClick={() => setEditingCompany(true)}
                style={{
                  background: "#3b82f6",
                  color: "white",
                  border: "none",
                  padding: "8px 16px",
                  borderRadius: 6,
                  fontSize: 14,
                  cursor: "pointer"
                }}
              >
                ✏️ 수정
              </button>
            )}
          </div>

          {editingCompany ? (
            <div style={{ marginTop: 16 }}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>회사명</label>
                <input
                  type="text"
                  value={companyForm.name}
                  onChange={(e) => setCompanyForm({ ...companyForm, name: e.target.value })}
                  style={{ width: "100%", padding: 12, border: "1px solid #d1d5db", borderRadius: 6 }}
                />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>대표자명</label>
                <input
                  type="text"
                  value={companyForm.representative}
                  onChange={(e) => setCompanyForm({ ...companyForm, representative: e.target.value })}
                  style={{ width: "100%", padding: 12, border: "1px solid #d1d5db", borderRadius: 6 }}
                />
              </div>
              <div style={{ display: "flex", gap: 12 }}>
                <button
                  onClick={handleUpdateCompany}
                  style={{
                    flex: 1,
                    background: "#10b981",
                    color: "white",
                    border: "none",
                    padding: "12px",
                    borderRadius: 6,
                    fontWeight: "bold",
                    cursor: "pointer"
                  }}
                >
                  💾 저장
                </button>
                <button
                  onClick={() => {
                    setEditingCompany(false);
                    setCompanyForm({ name: company.name, representative: company.representative || "" });
                  }}
                  style={{
                    flex: 1,
                    background: "#6b7280",
                    color: "white",
                    border: "none",
                    padding: "12px",
                    borderRadius: 6,
                    fontWeight: "bold",
                    cursor: "pointer"
                  }}
                >
                  ❌ 취소
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
              <div>
                <p style={{ margin: 0, fontSize: 14, color: "#666" }}>회사명</p>
                <p style={{ margin: "4px 0 0 0", fontSize: 18, fontWeight: "bold" }}>{company.name}</p>
              </div>
              <div>
                <p style={{ margin: 0, fontSize: 14, color: "#666" }}>사업자등록번호</p>
                <p style={{ margin: "4px 0 0 0", fontSize: 18, fontWeight: "bold" }}>{company.bizNo}</p>
              </div>
              <div>
                <p style={{ margin: 0, fontSize: 14, color: "#666" }}>대표자명</p>
                <p style={{ margin: "4px 0 0 0", fontSize: 18, fontWeight: "bold" }}>
                  {company.representative || "-"}
                </p>
              </div>
              <div>
                <p style={{ margin: 0, fontSize: 14, color: "#666" }}>기업 유형</p>
                <p style={{ margin: "4px 0 0 0", fontSize: 18, fontWeight: "bold" }}>
                  {company.type === "BUYER" ? "고용부담금 기업" : "표준사업장"}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* 팀원 초대 */}
        <div
          style={{
            padding: 24,
            background: "rgba(219, 234, 254, 0.2)",
            borderRadius: 12,
            marginBottom: 32,
            boxShadow: "0 8px 16px -2px rgba(59, 130, 246, 0.3), 0 4px 8px -2px rgba(59, 130, 246, 0.2)"
          }}
        >
          <h2 style={{ margin: 0, fontSize: 20, marginBottom: 16 }}>✉️ 새 팀원 초대하기</h2>
          <div style={{ display: "flex", gap: 12, marginBottom: 16, alignItems: "center" }}>
            <div style={{ padding: 12, border: "2px solid #3b82f6", borderRadius: 6, background: "#eff6ff", fontWeight: "bold", color: "#1e40af" }}>
              {company?.type === "BUYER" ? "🏢 고용부담금 기업 담당자" : "🏭 표준사업장 담당자"}
            </div>
            <button
              onClick={createInvitation}
              disabled={creatingInvite}
              style={{
                background: creatingInvite ? "#d1d5db" : "#3b82f6",
                color: "white",
                border: "none",
                padding: "12px 24px",
                borderRadius: 6,
                fontWeight: "bold",
                cursor: creatingInvite ? "not-allowed" : "pointer"
              }}
            >
              {creatingInvite ? "생성 중..." : "🎫 초대 코드 생성"}
            </button>
          </div>

          {newInvitation && (
            <div
              style={{
                padding: 16,
                background: "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)",
                borderRadius: 8,
                marginTop: 16,
                border: "2px solid #3b82f6",
                boxShadow: "0 6px 12px -1px rgba(59, 130, 246, 0.3), 0 3px 6px -1px rgba(59, 130, 246, 0.2)"
              }}
            >
              <p style={{ margin: 0, fontWeight: "bold", fontSize: 14, color: "#1e40af" }}>
                초대 코드: {newInvitation.inviteCode}
              </p>
              <p style={{ margin: "8px 0 0 0", fontSize: 14, color: "#1e40af" }}>
                초대 링크: {newInvitation.inviteUrl}
              </p>
              <button
                onClick={() => copyToClipboard(newInvitation.inviteUrl, newInvitation.inviteCode)}
                style={{
                  marginTop: 12,
                  background: "#3b82f6",
                  color: "white",
                  border: "none",
                  padding: "8px 16px",
                  borderRadius: 6,
                  fontSize: 14,
                  cursor: "pointer",
                  fontWeight: "bold"
                }}
              >
                {copiedCode === newInvitation.inviteCode ? "✅ 복사됨!" : "📋 링크 복사"}
              </button>
            </div>
          )}

          {invitations.length > 0 && (
            <div style={{ marginTop: 24 }}>
              <h3 style={{ fontSize: 16, marginBottom: 12 }}>📋 초대 코드 목록</h3>
              {invitations.map((inv) => (
                <div
                  key={inv.id}
                  style={{
                    padding: 16,
                    marginBottom: 12,
                    background: inv.isUsed ? "#f3f4f6" : "rgba(239, 246, 255, 0.3)",
                    border: `2px solid ${inv.isUsed ? "#d1d5db" : "#3b82f6"}`,
                    borderRadius: 8,
                    boxShadow: inv.isUsed ? "none" : "0 4px 8px -1px rgba(59, 130, 246, 0.3), 0 2px 4px -1px rgba(59, 130, 246, 0.2)"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <p style={{ margin: 0, fontWeight: "bold", fontSize: 16 }}>
                        코드: {inv.inviteCode}
                        {inv.isUsed && (
                          <span style={{ marginLeft: 8, color: "#6b7280", fontSize: 14 }}>(사용됨)</span>
                        )}
                      </p>
                      <p style={{ margin: "4px 0 0 0", fontSize: 14, color: "#666" }}>
                        만료일: {formatDate(inv.expiresAt)}
                      </p>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      {!inv.isUsed && (
                        <>
                          <button
                            onClick={() => copyToClipboard(inv.inviteUrl, inv.inviteCode)}
                            style={{
                              background: "#3b82f6",
                              color: "white",
                              border: "none",
                              padding: "8px 12px",
                              borderRadius: 6,
                              fontSize: 14,
                              cursor: "pointer"
                            }}
                          >
                            {copiedCode === inv.inviteCode ? "✅" : "📋"}
                          </button>
                          <button
                            onClick={() => deleteInvitation(inv.id)}
                            style={{
                              background: "#ef4444",
                              color: "white",
                              border: "none",
                              padding: "8px 12px",
                              borderRadius: 6,
                              fontSize: 14,
                              cursor: "pointer"
                            }}
                          >
                            🗑️
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 팀원 목록 */}
        <div
          style={{
            padding: 24,
            background: "rgba(219, 234, 254, 0.2)",
            borderRadius: 12,
            marginBottom: 32,
            boxShadow: "0 8px 16px -2px rgba(59, 130, 246, 0.3), 0 4px 8px -2px rgba(59, 130, 246, 0.2)"
          }}
        >
          <h2 style={{ margin: 0, fontSize: 20, marginBottom: 16 }}>👥 팀원 목록 ({members.length}명)</h2>
          
          {members.length === 0 ? (
            <p style={{ textAlign: "center", color: "#666", padding: 40 }}>등록된 팀원이 없습니다</p>
          ) : (
            <div>
              {members.map((member) => (
                <div
                  key={member.id}
                  style={{
                    padding: 16,
                    marginBottom: 12,
                    background: member.isCompanyOwner ? "rgba(239, 246, 255, 0.4)" : "rgba(249, 250, 251, 0.3)",
                    border: `2px solid ${member.isCompanyOwner ? "#3b82f6" : "#e5e7eb"}`,
                    borderRadius: 8,
                    boxShadow: "0 4px 8px -1px rgba(59, 130, 246, 0.3), 0 2px 4px -1px rgba(59, 130, 246, 0.2)"
                  }}
                >
                  {editingMemberId === member.id ? (
                    <div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12, marginBottom: 12 }}>
                        <div>
                          <label style={{ display: "block", marginBottom: 4, fontSize: 14, fontWeight: 600 }}>이름</label>
                          <input
                            type="text"
                            value={memberForm.name}
                            onChange={(e) => setMemberForm({ ...memberForm, name: e.target.value })}
                            style={{ width: "100%", padding: 8, border: "1px solid #d1d5db", borderRadius: 6 }}
                          />
                        </div>
                        <div>
                          <label style={{ display: "block", marginBottom: 4, fontSize: 14, fontWeight: 600 }}>이메일</label>
                          <input
                            type="email"
                            value={memberForm.email}
                            onChange={(e) => setMemberForm({ ...memberForm, email: e.target.value })}
                            style={{ width: "100%", padding: 8, border: "1px solid #d1d5db", borderRadius: 6 }}
                          />
                        </div>
                        <div>
                          <label style={{ display: "block", marginBottom: 4, fontSize: 14, fontWeight: 600 }}>담당자명</label>
                          <input
                            type="text"
                            value={memberForm.managerName}
                            onChange={(e) => setMemberForm({ ...memberForm, managerName: e.target.value })}
                            style={{ width: "100%", padding: 8, border: "1px solid #d1d5db", borderRadius: 6 }}
                          />
                        </div>
                        <div>
                          <label style={{ display: "block", marginBottom: 4, fontSize: 14, fontWeight: 600 }}>직함</label>
                          <input
                            type="text"
                            value={memberForm.managerTitle}
                            onChange={(e) => setMemberForm({ ...memberForm, managerTitle: e.target.value })}
                            style={{ width: "100%", padding: 8, border: "1px solid #d1d5db", borderRadius: 6 }}
                          />
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 12 }}>
                        <button
                          onClick={() => handleUpdateMember(member.id)}
                          style={{
                            flex: 1,
                            background: "#10b981",
                            color: "white",
                            border: "none",
                            padding: "10px",
                            borderRadius: 6,
                            fontWeight: "bold",
                            cursor: "pointer"
                          }}
                        >
                          💾 저장
                        </button>
                        <button
                          onClick={() => setEditingMemberId(null)}
                          style={{
                            flex: 1,
                            background: "#6b7280",
                            color: "white",
                            border: "none",
                            padding: "10px",
                            borderRadius: 6,
                            fontWeight: "bold",
                            cursor: "pointer"
                          }}
                        >
                          ❌ 취소
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                          <p style={{ margin: 0, fontSize: 18, fontWeight: "bold" }}>
                            {member.name}
                            {member.isCompanyOwner && (
                              <span
                                style={{
                                  marginLeft: 8,
                                  padding: "2px 8px",
                                  background: "#3b82f6",
                                  color: "white",
                                  fontSize: 12,
                                  borderRadius: 4,
                                  fontWeight: "bold"
                                }}
                              >
                                👑 소유자
                              </span>
                            )}
                          </p>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8 }}>
                          <p style={{ margin: 0, fontSize: 14, color: "#666" }}>📞 {member.phone}</p>
                          {member.email && <p style={{ margin: 0, fontSize: 14, color: "#666" }}>✉️ {member.email}</p>}
                          {member.managerName && (
                            <p style={{ margin: 0, fontSize: 14, color: "#666" }}>
                              👤 {member.managerName} {member.managerTitle || ""}
                            </p>
                          )}
                          <p style={{ margin: 0, fontSize: 14, color: "#666" }}>
                            가입일: {formatDate(member.createdAt)}
                          </p>
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button
                          onClick={() => startEditMember(member)}
                          style={{
                            background: "#3b82f6",
                            color: "white",
                            border: "none",
                            padding: "8px 16px",
                            borderRadius: 6,
                            fontSize: 14,
                            cursor: "pointer"
                          }}
                        >
                          ✏️ 수정
                        </button>
                        {!member.isCompanyOwner && (
                          <button
                            onClick={() => handleDeleteMember(member.id, member.name)}
                            style={{
                              background: "#ef4444",
                              color: "white",
                              border: "none",
                              padding: "8px 16px",
                              borderRadius: 6,
                              fontSize: 14,
                              cursor: "pointer"
                            }}
                          >
                            🗑️ 삭제
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 활동 로그 */}
        <div
          style={{
            padding: 24,
            background: "rgba(219, 234, 254, 0.2)",
            borderRadius: 12,
            boxShadow: "0 8px 16px -2px rgba(59, 130, 246, 0.3), 0 4px 8px -2px rgba(59, 130, 246, 0.2)"
          }}
        >
          <h2 style={{ margin: 0, fontSize: 20, marginBottom: 16 }}>📜 활동 로그 (최근 20개)</h2>
          
          {activityLogs.length === 0 ? (
            <p style={{ textAlign: "center", color: "#666", padding: 40 }}>활동 기록이 없습니다</p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                <thead>
                  <tr style={{ background: "#f9fafb", borderBottom: "2px solid #e5e7eb" }}>
                    <th style={{ padding: 12, textAlign: "left" }}>시간</th>
                    <th style={{ padding: 12, textAlign: "left" }}>사용자</th>
                    <th style={{ padding: 12, textAlign: "left" }}>작업</th>
                    <th style={{ padding: 12, textAlign: "left" }}>대상</th>
                    <th style={{ padding: 12, textAlign: "left" }}>대상명</th>
                  </tr>
                </thead>
                <tbody>
                  {activityLogs.map((log) => (
                    <tr key={log.id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                      <td style={{ padding: 12 }}>{formatDate(log.createdAt)}</td>
                      <td style={{ padding: 12 }}>{log.userName}</td>
                      <td style={{ padding: 12 }}>
                        <span
                          style={{
                            padding: "4px 8px",
                            background:
                              log.action === "CREATE"
                                ? "#d1fae5"
                                : log.action === "UPDATE"
                                ? "#dbeafe"
                                : log.action === "DELETE"
                                ? "#fee2e2"
                                : "#f3f4f6",
                            borderRadius: 4,
                            fontSize: 13,
                            fontWeight: 600
                          }}
                        >
                          {getActionLabel(log.action)}
                        </span>
                      </td>
                      <td style={{ padding: 12 }}>{getTargetTypeLabel(log.targetType)}</td>
                      <td style={{ padding: 12 }}>{log.targetName || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
