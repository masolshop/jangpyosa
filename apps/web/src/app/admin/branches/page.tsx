"use client";

import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";

type Branch = {
  id: string;
  name: string;
  code: string;
  region: string;
  phone: string;
  isActive: boolean;
  _count?: { agents: number };
};

type Agent = {
  id: string;
  name: string;
  phone: string;
  email: string;
  refCode: string;
  _count?: { referrals: number };
};

export default function BranchManagementPage() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  // 새 지사 생성
  const [newBranch, setNewBranch] = useState({
    name: "",
    code: "",
    region: "",
    phone: "",
  });

  useEffect(() => {
    loadBranches();
  }, []);

  async function loadBranches() {
    try {
      const data = await apiFetch("/admin/branches");
      setBranches(data.branches || []);
    } catch (error) {
      console.error("Failed to load branches:", error);
    }
  }

  async function loadAgents(branchId: string) {
    try {
      const data = await apiFetch(`/admin/branches/${branchId}/agents`);
      setAgents(data.branch.agents || []);
    } catch (error) {
      console.error("Failed to load agents:", error);
    }
  }

  async function onCreateBranch() {
    setMsg("");
    if (!newBranch.name || !newBranch.code) {
      setMsg("지사명과 코드는 필수입니다");
      return;
    }

    setLoading(true);
    try {
      await apiFetch("/admin/branches", {
        method: "POST",
        body: JSON.stringify(newBranch),
      });

      setMsg("✅ 지사가 생성되었습니다");
      setShowCreateModal(false);
      setNewBranch({ name: "", code: "", region: "", phone: "" });
      loadBranches();
    } catch (error: any) {
      setMsg(`❌ ${error.message || "생성 실패"}`);
    } finally {
      setLoading(false);
    }
  }

  async function onDeleteBranch(branchId: string) {
    if (!confirm("정말 이 지사를 삭제하시겠습니까?")) return;

    setLoading(true);
    try {
      await apiFetch(`/admin/branches/${branchId}`, {
        method: "DELETE",
      });

      setMsg("✅ 지사가 삭제되었습니다");
      loadBranches();
    } catch (error: any) {
      setMsg(`❌ ${error.message || "삭제 실패"}`);
    } finally {
      setLoading(false);
    }
  }

  function onSelectBranch(branch: Branch) {
    setSelectedBranch(branch);
    loadAgents(branch.id);
  }

  return (
    <div className="container">
      <div className="card">
        <h1>🏢 지사 관리</h1>
        <p style={{ color: "#666", marginTop: 8 }}>
          전국 지사 및 소속 매니저를 관리합니다
        </p>

        <button
          onClick={() => setShowCreateModal(true)}
          style={{ marginTop: 16 }}
        >
          ➕ 새 지사 생성
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

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 2fr",
            gap: 24,
            marginTop: 24,
          }}
        >
          {/* 지사 목록 */}
          <div>
            <h3>지사 목록 ({branches.length}개)</h3>
            <div style={{ marginTop: 12 }}>
              {branches.map((branch) => (
                <div
                  key={branch.id}
                  onClick={() => onSelectBranch(branch)}
                  style={{
                    padding: 12,
                    marginBottom: 8,
                    border: "1px solid #ddd",
                    borderRadius: 6,
                    cursor: "pointer",
                    background:
                      selectedBranch?.id === branch.id ? "#f0f8ff" : "white",
                  }}
                >
                  <div style={{ fontWeight: 600, fontSize: 14 }}>
                    {branch.name}
                  </div>
                  <div style={{ fontSize: 12, color: "#666", marginTop: 4 }}>
                    {branch.region} · 매니저 {branch._count?.agents || 0}명
                  </div>
                  <div style={{ fontSize: 11, color: "#999", marginTop: 2 }}>
                    코드: {branch.code}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 지사 상세 */}
          <div>
            {selectedBranch ? (
              <>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <h3>{selectedBranch.name} 상세</h3>
                  <div>
                    <button
                      onClick={() => setShowEditModal(true)}
                      style={{
                        padding: "6px 12px",
                        fontSize: 13,
                        marginRight: 8,
                      }}
                    >
                      수정
                    </button>
                    <button
                      onClick={() => onDeleteBranch(selectedBranch.id)}
                      style={{
                        padding: "6px 12px",
                        fontSize: 13,
                        background: "#d32f2f",
                      }}
                    >
                      삭제
                    </button>
                  </div>
                </div>

                <div
                  style={{
                    padding: 16,
                    background: "#f5f5f5",
                    borderRadius: 8,
                    marginTop: 12,
                  }}
                >
                  <p style={{ margin: 0, fontSize: 14 }}>
                    <strong>지역:</strong> {selectedBranch.region || "-"}
                  </p>
                  <p style={{ margin: "8px 0 0 0", fontSize: 14 }}>
                    <strong>전화:</strong> {selectedBranch.phone || "-"}
                  </p>
                  <p style={{ margin: "8px 0 0 0", fontSize: 14 }}>
                    <strong>코드:</strong> {selectedBranch.code}
                  </p>
                  <p style={{ margin: "8px 0 0 0", fontSize: 14 }}>
                    <strong>상태:</strong>{" "}
                    <span
                      style={{
                        color: selectedBranch.isActive ? "#0070f3" : "#999",
                      }}
                    >
                      {selectedBranch.isActive ? "활성" : "비활성"}
                    </span>
                  </p>
                </div>

                <h4 style={{ marginTop: 24 }}>
                  소속 매니저 ({agents.length}명)
                </h4>
                <div style={{ marginTop: 12 }}>
                  {agents.length === 0 ? (
                    <p style={{ color: "#999", fontSize: 14 }}>
                      소속 매니저가 없습니다
                    </p>
                  ) : (
                    agents.map((agent) => (
                      <div
                        key={agent.id}
                        style={{
                          padding: 12,
                          marginBottom: 8,
                          border: "1px solid #ddd",
                          borderRadius: 6,
                        }}
                      >
                        <div style={{ fontWeight: 600, fontSize: 14 }}>
                          {agent.name}
                        </div>
                        <div
                          style={{ fontSize: 12, color: "#666", marginTop: 4 }}
                        >
                          📱 {agent.phone}
                        </div>
                        {agent.email && (
                          <div
                            style={{
                              fontSize: 12,
                              color: "#666",
                              marginTop: 2,
                            }}
                          >
                            📧 {agent.email}
                          </div>
                        )}
                        {agent.refCode && (
                          <div
                            style={{
                              fontSize: 12,
                              color: "#0070f3",
                              marginTop: 2,
                            }}
                          >
                            🎫 {agent.refCode}
                          </div>
                        )}
                        <div
                          style={{ fontSize: 11, color: "#999", marginTop: 4 }}
                        >
                          추천 회원: {agent._count?.referrals || 0}명
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </>
            ) : (
              <div
                style={{
                  textAlign: "center",
                  padding: 48,
                  color: "#999",
                  fontSize: 14,
                }}
              >
                왼쪽에서 지사를 선택하세요
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 지사 생성 모달 */}
      {showCreateModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() => setShowCreateModal(false)}
        >
          <div
            className="card"
            style={{ maxWidth: 480, margin: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2>새 지사 생성</h2>

            <div style={{ marginTop: 16 }}>
              <label>지사명 *</label>
              <input
                type="text"
                placeholder="예: 경남지사"
                value={newBranch.name}
                onChange={(e) =>
                  setNewBranch({ ...newBranch, name: e.target.value })
                }
              />

              <label>지사 코드 *</label>
              <input
                type="text"
                placeholder="예: GYEONGNAM"
                value={newBranch.code}
                onChange={(e) =>
                  setNewBranch({
                    ...newBranch,
                    code: e.target.value.toUpperCase(),
                  })
                }
              />

              <label>지역</label>
              <input
                type="text"
                placeholder="예: 경상남도"
                value={newBranch.region}
                onChange={(e) =>
                  setNewBranch({ ...newBranch, region: e.target.value })
                }
              />

              <label>전화번호</label>
              <input
                type="text"
                placeholder="예: 055-1234-5678"
                value={newBranch.phone}
                onChange={(e) =>
                  setNewBranch({ ...newBranch, phone: e.target.value })
                }
              />

              <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
                <button
                  onClick={onCreateBranch}
                  disabled={loading}
                  style={{ flex: 1 }}
                >
                  {loading ? "생성 중..." : "생성"}
                </button>
                <button
                  onClick={() => setShowCreateModal(false)}
                  style={{ flex: 1, background: "#f5f5f5", color: "#333" }}
                >
                  취소
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
