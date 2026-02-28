"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";

type Company = {
  id: string;
  name: string;
  bizNo: string;
  representative: string | null;
  type: string;
  buyerType: string | null;
  isVerified: boolean;
  hasApickData: boolean;
  memberCount: number;
  buyerProfile: {
    employeeCount: number;
    disabledCount: number;
  } | null;
  supplierProfile: {
    region: string | null;
    industry: string | null;
  } | null;
  createdAt: string;
  updatedAt: string;
};

type ApickData = {
  회사명: string;
  사업자등록번호: string;
  대표명: string;
  설립일?: string;
  업종?: string;
  업태?: string;
  종목?: string;
  직원수?: string;
  전화번호?: string;
  지번주소?: string;
  도로명주소?: string;
  사업자상태: string;
  과세유형: string;
};

export default function AdminCompaniesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<any>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    loadCompanies();
  }, []);

  async function loadCompanies() {
    try {
      setLoading(true);
      const data = await apiFetch("/companies/admin/all");
      setCompanies(data.companies);
    } catch (error: any) {
      console.error("Failed to load companies:", error);
      if (error.status === 401 || error.status === 403) {
        alert("슈퍼어드민만 접근 가능합니다.");
        router.push("/login");
      }
    } finally {
      setLoading(false);
    }
  }

  async function loadCompanyDetail(companyId: string) {
    try {
      const data = await apiFetch(`/companies/admin/${companyId}`);
      setSelectedCompany(data.company);
      setShowDetail(true);
    } catch (error: any) {
      alert("기업 상세 정보 조회 실패: " + (error.message || "알 수 없는 오류"));
    }
  }

  async function refreshApickData(companyId: string) {
    if (!confirm("APICK API로 최신 기업 정보를 가져오시겠습니까?")) {
      return;
    }

    try {
      setRefreshing(true);
      setMsg("");
      const data = await apiFetch(`/companies/admin/${companyId}/refresh-apick`, {
        method: "POST",
      });
      setMsg("✅ " + data.message);
      setSelectedCompany(data.company);
      await loadCompanies();
      setTimeout(() => setMsg(""), 3000);
    } catch (error: any) {
      setMsg("❌ APICK 재인증 실패: " + (error.message || "알 수 없는 오류"));
      setTimeout(() => setMsg(""), 5000);
    } finally {
      setRefreshing(false);
    }
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

  function formatBizNo(bizNo: string) {
    if (bizNo.length === 10) {
      return `${bizNo.slice(0, 3)}-${bizNo.slice(3, 5)}-${bizNo.slice(5, 10)}`;
    }
    return bizNo;
  }

  if (loading) {
    return (
      <div style={{ padding: 40 }}>
        <p style={{ textAlign: "center", fontSize: 16, color: '#666' }}>로딩 중...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: 40 }}>
      {/* 헤더 */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ 
          margin: 0, 
          fontSize: 32, 
          fontWeight: 700,
          color: '#1a237e',
        }}>
          🏭 기업관리
        </h1>
        <p style={{ 
          margin: '8px 0 0 0', 
          fontSize: 16, 
          color: '#666',
        }}>
          전체 기업 목록 및 APICK 데이터 관리
        </p>
      </div>

        {msg && (
          <div
            style={{
              marginBottom: 24,
              padding: 16,
              background: msg.includes("✅") ? "#d1fae5" : "#fee2e2",
              borderRadius: 8,
              color: msg.includes("✅") ? "#065f46" : "#991b1b",
              fontSize: 14,
            }}
          >
            {msg}
          </div>
        )}

        {/* 기업 목록 테이블 */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: 12,
          padding: 24,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}>

        {/* 통계 요약 */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 16,
            marginBottom: 32,
          }}
        >
          <div
            style={{
              padding: 20,
              background: "rgba(59, 130, 246, 0.1)",
              borderRadius: 12,
              border: "2px solid rgba(59, 130, 246, 0.3)",
            }}
          >
            <p style={{ margin: 0, fontSize: 14, color: "#666" }}>전체 기업</p>
            <p style={{ margin: "8px 0 0 0", fontSize: 32, fontWeight: "bold", color: "#0070f3" }}>
              {companies.length}
            </p>
          </div>
          <div
            style={{
              padding: 20,
              background: "rgba(16, 185, 129, 0.1)",
              borderRadius: 12,
              border: "2px solid rgba(16, 185, 129, 0.3)",
            }}
          >
            <p style={{ margin: 0, fontSize: 14, color: "#666" }}>고용부담금 기업</p>
            <p style={{ margin: "8px 0 0 0", fontSize: 32, fontWeight: "bold", color: "#10b981" }}>
              {companies.filter((c) => c.type === "BUYER").length}
            </p>
          </div>
          <div
            style={{
              padding: 20,
              background: "rgba(245, 158, 11, 0.1)",
              borderRadius: 12,
              border: "2px solid rgba(245, 158, 11, 0.3)",
            }}
          >
            <p style={{ margin: 0, fontSize: 14, color: "#666" }}>표준사업장</p>
            <p style={{ margin: "8px 0 0 0", fontSize: 32, fontWeight: "bold", color: "#f59e0b" }}>
              {companies.filter((c) => c.type === "SUPPLIER").length}
            </p>
          </div>
          <div
            style={{
              padding: 20,
              background: "rgba(139, 92, 246, 0.1)",
              borderRadius: 12,
              border: "2px solid rgba(139, 92, 246, 0.3)",
            }}
          >
            <p style={{ margin: 0, fontSize: 14, color: "#666" }}>APICK 데이터</p>
            <p style={{ margin: "8px 0 0 0", fontSize: 32, fontWeight: "bold", color: "#8b5cf6" }}>
              {companies.filter((c) => c.hasApickData).length}
            </p>
          </div>
        </div>

        {/* 기업 목록 테이블 */}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead>
              <tr style={{ background: "#f9fafb", borderBottom: "2px solid #e5e7eb" }}>
                <th style={{ padding: 12, textAlign: "left" }}>회사명</th>
                <th style={{ padding: 12, textAlign: "left" }}>사업자번호</th>
                <th style={{ padding: 12, textAlign: "left" }}>대표자</th>
                <th style={{ padding: 12, textAlign: "left" }}>유형</th>
                <th style={{ padding: 12, textAlign: "center" }}>담당자</th>
                <th style={{ padding: 12, textAlign: "center" }}>APICK</th>
                <th style={{ padding: 12, textAlign: "left" }}>가입일</th>
                <th style={{ padding: 12, textAlign: "center" }}>액션</th>
              </tr>
            </thead>
            <tbody>
              {companies.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: 40, textAlign: "center", color: "#666" }}>
                    등록된 기업이 없습니다
                  </td>
                </tr>
              ) : (
                companies.map((company) => (
                  <tr key={company.id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                    <td style={{ padding: 12 }}>
                      <strong>{company.name}</strong>
                    </td>
                    <td style={{ padding: 12 }}>{formatBizNo(company.bizNo)}</td>
                    <td style={{ padding: 12 }}>{company.representative || "-"}</td>
                    <td style={{ padding: 12 }}>
                      <span
                        style={{
                          padding: "4px 8px",
                          background:
                            company.type === "BUYER"
                              ? "#dbeafe"
                              : company.type === "SUPPLIER"
                              ? "#fef3c7"
                              : "#f3f4f6",
                          color:
                            company.type === "BUYER"
                              ? "#1e40af"
                              : company.type === "SUPPLIER"
                              ? "#92400e"
                              : "#374151",
                          borderRadius: 4,
                          fontSize: 12,
                          fontWeight: 600,
                        }}
                      >
                        {company.type === "BUYER"
                          ? "고용부담금"
                          : company.type === "SUPPLIER"
                          ? "표준사업장"
                          : company.type}
                      </span>
                      {company.buyerType && (
                        <span
                          style={{
                            marginLeft: 4,
                            fontSize: 11,
                            color: "#666",
                          }}
                        >
                          (
                          {company.buyerType === "PRIVATE_COMPANY"
                            ? "민간"
                            : company.buyerType === "PUBLIC_INSTITUTION"
                            ? "공공"
                            : "국가"}
                          )
                        </span>
                      )}
                    </td>
                    <td style={{ padding: 12, textAlign: "center" }}>{company.memberCount}명</td>
                    <td style={{ padding: 12, textAlign: "center" }}>
                      {company.hasApickData ? (
                        <span style={{ color: "#10b981", fontSize: 18 }}>✓</span>
                      ) : (
                        <span style={{ color: "#d1d5db", fontSize: 18 }}>○</span>
                      )}
                    </td>
                    <td style={{ padding: 12, fontSize: 13 }}>{formatDate(company.createdAt)}</td>
                    <td style={{ padding: 12, textAlign: "center" }}>
                      <button
                        onClick={() => loadCompanyDetail(company.id)}
                        style={{
                          background: "#0070f3",
                          color: "white",
                          border: "none",
                          padding: "6px 12px",
                          borderRadius: 6,
                          fontSize: 13,
                          cursor: "pointer",
                          fontWeight: 600,
                        }}
                      >
                        상세보기
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 상세 정보 모달 */}
      {showDetail && selectedCompany && (
        <div
          onClick={() => setShowDetail(false)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
            padding: 20,
            overflowY: "auto",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "white",
              borderRadius: 12,
              maxWidth: 800,
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
              padding: 32,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <h2 style={{ margin: 0, fontSize: 24 }}>🏢 {selectedCompany.name}</h2>
              <button
                onClick={() => setShowDetail(false)}
                style={{
                  background: "#f3f4f6",
                  border: "none",
                  borderRadius: 6,
                  padding: "8px 16px",
                  cursor: "pointer",
                  fontSize: 14,
                  fontWeight: 600,
                }}
              >
                ✕ 닫기
              </button>
            </div>

            {/* 기본 정보 */}
            <div
              style={{
                padding: 20,
                background: "#f9fafb",
                borderRadius: 8,
                marginBottom: 20,
              }}
            >
              <h3 style={{ margin: "0 0 16px 0", fontSize: 18 }}>📋 기본 정보</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
                <div>
                  <p style={{ margin: 0, fontSize: 13, color: "#666" }}>사업자번호</p>
                  <p style={{ margin: "4px 0 0 0", fontSize: 15, fontWeight: "bold" }}>
                    {formatBizNo(selectedCompany.bizNo)}
                  </p>
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: 13, color: "#666" }}>대표자명</p>
                  <p style={{ margin: "4px 0 0 0", fontSize: 15, fontWeight: "bold" }}>
                    {selectedCompany.representative || "-"}
                  </p>
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: 13, color: "#666" }}>기업 유형</p>
                  <p style={{ margin: "4px 0 0 0", fontSize: 15, fontWeight: "bold" }}>
                    {selectedCompany.type === "BUYER"
                      ? "고용부담금 기업"
                      : selectedCompany.type === "SUPPLIER"
                      ? "표준사업장"
                      : selectedCompany.type}
                  </p>
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: 13, color: "#666" }}>인증 상태</p>
                  <p style={{ margin: "4px 0 0 0", fontSize: 15, fontWeight: "bold" }}>
                    {selectedCompany.isVerified ? "✅ 인증됨" : "❌ 미인증"}
                  </p>
                </div>
              </div>
            </div>

            {/* APICK 데이터 */}
            {selectedCompany.apickData ? (
              <div
                style={{
                  padding: 20,
                  background: "rgba(59, 130, 246, 0.05)",
                  borderRadius: 8,
                  marginBottom: 20,
                  border: "2px solid rgba(59, 130, 246, 0.2)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <h3 style={{ margin: 0, fontSize: 18 }}>📊 APICK 전체 데이터</h3>
                  <button
                    onClick={() => refreshApickData(selectedCompany.id)}
                    disabled={refreshing}
                    style={{
                      background: refreshing ? "#d1d5db" : "#0070f3",
                      color: "white",
                      border: "none",
                      padding: "8px 16px",
                      borderRadius: 6,
                      fontSize: 13,
                      cursor: refreshing ? "not-allowed" : "pointer",
                      fontWeight: 600,
                    }}
                  >
                    {refreshing ? "재인증 중..." : "🔄 재인증"}
                  </button>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12, fontSize: 14 }}>
                  {Object.entries(selectedCompany.apickData as ApickData).map(([key, value]) => {
                    if (key === "success" || !value) return null;
                    return (
                      <div key={key}>
                        <p style={{ margin: 0, fontSize: 12, color: "#666" }}>{key}</p>
                        <p style={{ margin: "4px 0 0 0", fontSize: 14, fontWeight: 500 }}>
                          {typeof value === "object" ? JSON.stringify(value) : value}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div
                style={{
                  padding: 20,
                  background: "#fef2f2",
                  borderRadius: 8,
                  marginBottom: 20,
                  border: "2px solid #fecaca",
                  textAlign: "center",
                }}
              >
                <p style={{ margin: 0, color: "#991b1b", fontSize: 14 }}>
                  ⚠️ APICK 데이터가 없습니다
                </p>
                <button
                  onClick={() => refreshApickData(selectedCompany.id)}
                  disabled={refreshing}
                  style={{
                    marginTop: 12,
                    background: refreshing ? "#d1d5db" : "#ef4444",
                    color: "white",
                    border: "none",
                    padding: "10px 20px",
                    borderRadius: 6,
                    fontSize: 14,
                    cursor: refreshing ? "not-allowed" : "pointer",
                    fontWeight: 600,
                  }}
                >
                  {refreshing ? "데이터 가져오는 중..." : "📥 APICK 데이터 가져오기"}
                </button>
              </div>
            )}

            {/* 담당자 목록 */}
            {selectedCompany.members && selectedCompany.members.length > 0 && (
              <div
                style={{
                  padding: 20,
                  background: "#f9fafb",
                  borderRadius: 8,
                }}
              >
                <h3 style={{ margin: "0 0 16px 0", fontSize: 18 }}>👥 담당자 목록</h3>
                {selectedCompany.members.map((member: any) => (
                  <div
                    key={member.id}
                    style={{
                      padding: 12,
                      marginBottom: 8,
                      background: "white",
                      borderRadius: 6,
                      border: "1px solid #e5e7eb",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <p style={{ margin: 0, fontSize: 15, fontWeight: "bold" }}>
                          {member.name}
                          {member.isCompanyOwner && (
                            <span
                              style={{
                                marginLeft: 8,
                                padding: "2px 6px",
                                background: "#3b82f6",
                                color: "white",
                                fontSize: 11,
                                borderRadius: 4,
                              }}
                            >
                              소유자
                            </span>
                          )}
                        </p>
                        <p style={{ margin: "4px 0 0 0", fontSize: 13, color: "#666" }}>
                          📞 {member.phone}
                          {member.email && ` · ✉️ ${member.email}`}
                        </p>
                        {(member.managerName || member.managerTitle) && (
                          <p style={{ margin: "4px 0 0 0", fontSize: 13, color: "#666" }}>
                            👤 {member.managerName} {member.managerTitle}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
