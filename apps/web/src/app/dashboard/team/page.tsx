"use client";

import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";

interface Invitation {
  id: string;
  inviteCode: string;
  inviteUrl: string;
  companyName: string;
  role: string;
  isUsed: boolean;
  usedAt: string | null;
  expiresAt: string;
  createdAt: string;
}

export default function TeamPage() {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState("");
  const [role, setRole] = useState<"BUYER" | "SUPPLIER">("BUYER");
  const [newInvitation, setNewInvitation] = useState<Invitation | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    loadInvitations();
  }, []);

  async function loadInvitations() {
    try {
      setLoading(true);
      const data = await apiFetch("/team/invitations");
      if (data.success) {
        setInvitations(data.invitations);
      }
    } catch (error) {
      console.error("Failed to load invitations:", error);
    } finally {
      setLoading(false);
    }
  }

  async function createInvitation() {
    try {
      setCreating(true);
      setMessage("");
      setNewInvitation(null);

      const data = await apiFetch("/team/invite", {
        method: "POST",
        body: JSON.stringify({ role }),
      });

      if (data.success) {
        setNewInvitation(data.invitation);
        setMessage("초대 코드가 생성되었습니다!");
        loadInvitations();
      } else {
        setMessage(data.error || "초대 코드 생성 실패");
      }
    } catch (error: any) {
      setMessage(error.message || "초대 코드 생성 중 오류 발생");
    } finally {
      setCreating(false);
    }
  }

  async function deleteInvitation(id: string) {
    if (!confirm("이 초대 코드를 삭제하시겠습니까?")) return;

    try {
      const data = await apiFetch(`/team/invite/${id}`, {
        method: "DELETE",
      });

      if (data.success) {
        setMessage("초대 코드가 삭제되었습니다");
        loadInvitations();
      } else {
        alert(data.error || "삭제 실패");
      }
    } catch (error: any) {
      alert(error.message || "삭제 중 오류 발생");
    }
  }

  function copyToClipboard(text: string, code: string) {
    navigator.clipboard.writeText(text);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function isExpired(dateString: string) {
    return new Date(dateString) < new Date();
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">팀원 초대</h1>
        <p className="text-gray-600 mt-2">
          팀원을 초대하여 동일한 회사 데이터를 공유할 수 있습니다
        </p>
      </div>

      {/* 새 초대 코드 생성 */}
      <div className="bg-white rounded-lg p-6 mb-6" style={{
        boxShadow: "0 4px 6px -1px rgba(59, 130, 246, 0.3), 0 2px 4px -1px rgba(59, 130, 246, 0.2)"
      }}>
        <h2 className="text-xl font-semibold mb-4">
          <i className="fas fa-user-plus mr-2 text-blue-600"></i>
          새 팀원 초대하기
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              초대할 팀원의 역할
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as "BUYER" | "SUPPLIER")}
              className="w-full md:w-64 p-2 border border-gray-300 rounded-md"
              disabled={creating}
            >
              <option value="BUYER">고용부담금 기업 담당자</option>
              <option value="SUPPLIER">표준사업장 담당자</option>
            </select>
          </div>

          <button
            onClick={createInvitation}
            disabled={creating}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {creating ? (
              <><i className="fas fa-spinner fa-spin mr-2"></i>생성 중...</>
            ) : (
              <><i className="fas fa-plus mr-2"></i>초대 코드 생성</>
            )}
          </button>

          {message && (
            <div className={`p-3 rounded-md ${newInvitation ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
              {message}
            </div>
          )}

          {newInvitation && (
            <div className="border border-green-200 rounded-lg p-4" style={{
              background: "linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%)",
              boxShadow: "0 4px 6px -1px rgba(40, 167, 69, 0.3), 0 2px 4px -1px rgba(40, 167, 69, 0.2)"
            }}>
              <h3 className="font-semibold text-green-900 mb-3">
                ✅ 초대 코드가 생성되었습니다
              </h3>
              <div className="space-y-2">
                <div>
                  <p className="text-sm text-gray-600 mb-1">초대 코드:</p>
                  <div className="flex items-center gap-2">
                    <code className="bg-white px-4 py-2 rounded border border-gray-300 font-mono text-lg font-bold text-blue-600 flex-1">
                      {newInvitation.inviteCode}
                    </code>
                    <button
                      onClick={() => copyToClipboard(newInvitation.inviteCode, newInvitation.inviteCode)}
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                      {copiedCode === newInvitation.inviteCode ? (
                        <><i className="fas fa-check mr-2"></i>복사됨</>
                      ) : (
                        <><i className="fas fa-copy mr-2"></i>복사</>
                      )}
                    </button>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">초대 링크:</p>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newInvitation.inviteUrl}
                      readOnly
                      className="bg-white px-4 py-2 rounded border border-gray-300 text-sm flex-1"
                    />
                    <button
                      onClick={() => copyToClipboard(newInvitation.inviteUrl, `link-${newInvitation.inviteCode}`)}
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                      {copiedCode === `link-${newInvitation.inviteCode}` ? (
                        <><i className="fas fa-check mr-2"></i>복사됨</>
                      ) : (
                        <><i className="fas fa-copy mr-2"></i>복사</>
                      )}
                    </button>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  <i className="fas fa-clock mr-1"></i>
                  만료일: {formatDate(newInvitation.expiresAt)}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 초대 코드 목록 */}
      <div className="bg-white rounded-lg p-6" style={{
        boxShadow: "0 4px 6px -1px rgba(59, 130, 246, 0.3), 0 2px 4px -1px rgba(59, 130, 246, 0.2)"
      }}>
        <h2 className="text-xl font-semibold mb-4">
          <i className="fas fa-list mr-2 text-gray-600"></i>
          초대 코드 목록
        </h2>

        {loading ? (
          <div className="text-center py-8 text-gray-500">
            <i className="fas fa-spinner fa-spin mr-2"></i>
            불러오는 중...
          </div>
        ) : invitations.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            생성된 초대 코드가 없습니다
          </div>
        ) : (
          <div className="space-y-4">
            {invitations.map((inv) => (
              <div
                key={inv.id}
                className={`border rounded-lg p-4 ${
                  inv.isUsed
                    ? "bg-gray-50 border-gray-300"
                    : isExpired(inv.expiresAt)
                    ? "bg-red-50 border-red-300"
                    : "bg-white border-gray-200"
                }`}
                style={!inv.isUsed && !isExpired(inv.expiresAt) ? {
                  boxShadow: "0 2px 4px rgba(59, 130, 246, 0.3), 0 1px 2px rgba(59, 130, 246, 0.2)"
                } : undefined}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <code className="bg-gray-100 px-3 py-1 rounded font-mono font-bold text-blue-600">
                        {inv.inviteCode}
                      </code>
                      {inv.isUsed && (
                        <span className="bg-gray-500 text-white text-xs px-2 py-1 rounded">
                          사용됨
                        </span>
                      )}
                      {!inv.isUsed && isExpired(inv.expiresAt) && (
                        <span className="bg-red-500 text-white text-xs px-2 py-1 rounded">
                          만료됨
                        </span>
                      )}
                      {!inv.isUsed && !isExpired(inv.expiresAt) && (
                        <span className="bg-green-500 text-white text-xs px-2 py-1 rounded">
                          사용 가능
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>
                        <span className="font-medium">역할:</span>{" "}
                        {inv.role === "BUYER" ? "고용부담금 기업" : "표준사업장"}
                      </p>
                      <p>
                        <span className="font-medium">생성일:</span>{" "}
                        {formatDate(inv.createdAt)}
                      </p>
                      <p>
                        <span className="font-medium">만료일:</span>{" "}
                        {formatDate(inv.expiresAt)}
                      </p>
                      {inv.isUsed && inv.usedAt && (
                        <p>
                          <span className="font-medium">사용일:</span>{" "}
                          {formatDate(inv.usedAt)}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {!inv.isUsed && (
                      <>
                        <button
                          onClick={() => copyToClipboard(inv.inviteUrl, `list-${inv.inviteCode}`)}
                          className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                          title="초대 링크 복사"
                        >
                          {copiedCode === `list-${inv.inviteCode}` ? (
                            <i className="fas fa-check"></i>
                          ) : (
                            <i className="fas fa-copy"></i>
                          )}
                        </button>
                        <button
                          onClick={() => deleteInvitation(inv.id)}
                          className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                          title="삭제"
                        >
                          <i className="fas fa-trash"></i>
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
    </div>
  );
}
