"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { API_BASE } from "@/lib/api";
import { getToken, getUserRole } from "@/lib/auth";

type Contract = {
  id: string;
  contractNo: string;
  contractName: string;
  startDate: string;
  endDate: string;
  totalAmount: number;
  monthlyAmount?: number;
  status: string;
  buyer: {
    company: {
      name: string;
    };
  };
  supplier: {
    company: {
      name: string;
    };
  };
  monthlyPerformances: any[];
  createdAt: string;
};

export default function ContractsPage() {
  const router = useRouter();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [yearFilter, setYearFilter] = useState<number>(new Date().getFullYear());
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const role = getUserRole();
    if (role !== "BUYER" && role !== "SUPER_ADMIN" && role !== "SUPPLIER") {
      router.push("/");
      return;
    }
    fetchContracts();
  }, [statusFilter, yearFilter]);

  async function fetchContracts() {
    const token = getToken();
    if (!token) {
      router.push("/login");
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.append("status", statusFilter);
      if (yearFilter) params.append("year", yearFilter.toString());

      const res = await fetch(`${API_BASE}/contracts?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("계약 목록 조회 실패");

      const json = await res.json();
      setContracts(json.contracts || []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "#10b981";
      case "SUSPENDED":
        return "#f59e0b";
      case "TERMINATED":
        return "#ef4444";
      case "COMPLETED":
        return "#6b7280";
      default:
        return "#6b7280";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "진행중";
      case "SUSPENDED":
        return "중단";
      case "TERMINATED":
        return "해지";
      case "COMPLETED":
        return "완료";
      default:
        return status;
    }
  };

  const filteredContracts = contracts.filter((contract) => {
    const matchesSearch =
      contract.contractNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.contractName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.supplier.company.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="container">
        <div className="card">
          <p>로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div>
            <h1 style={{ margin: 0 }}>📋 도급계약 관리</h1>
            <p style={{ margin: "8px 0 0 0", color: "#666", fontSize: 14 }}>
              연계고용 도급계약을 관리하고 월별 이행 현황을 확인하세요
            </p>
          </div>
          <button
            onClick={() => router.push("/dashboard/contracts/new")}
            style={{
              background: "#0070f3",
              color: "white",
              border: "none",
              padding: "12px 24px",
              borderRadius: 6,
              fontSize: 14,
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            ➕ 새 계약 등록
          </button>
        </div>

        {error && (
          <div style={{ padding: 12, background: "#fee", borderRadius: 6, color: "#c00", marginBottom: 16 }}>
            {error}
          </div>
        )}

        {/* 필터 */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "200px 150px 1fr",
            gap: 16,
            marginBottom: 24,
            padding: 20,
            background: "#f9fafb",
            borderRadius: 8,
          }}
        >
          <div>
            <label style={{ display: "block", marginBottom: 8, fontSize: 14, fontWeight: 600 }}>계약 상태</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 12px",
                borderRadius: 6,
                border: "1px solid #ddd",
                fontSize: 14,
              }}
            >
              <option value="all">전체</option>
              <option value="ACTIVE">진행중</option>
              <option value="SUSPENDED">중단</option>
              <option value="TERMINATED">해지</option>
              <option value="COMPLETED">완료</option>
            </select>
          </div>

          <div>
            <label style={{ display: "block", marginBottom: 8, fontSize: 14, fontWeight: 600 }}>연도</label>
            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(parseInt(e.target.value))}
              style={{
                width: "100%",
                padding: "8px 12px",
                borderRadius: 6,
                border: "1px solid #ddd",
                fontSize: 14,
              }}
            >
              {[2026, 2025, 2024].map((year) => (
                <option key={year} value={year}>
                  {year}년
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: "block", marginBottom: 8, fontSize: 14, fontWeight: 600 }}>검색</label>
            <input
              type="text"
              placeholder="계약번호, 계약명, 표준사업장명"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 12px",
                borderRadius: 6,
                border: "1px solid #ddd",
                fontSize: 14,
              }}
            />
          </div>
        </div>

        {/* 계약 목록 */}
        {filteredContracts.length === 0 ? (
          <div
            style={{
              padding: 60,
              textAlign: "center",
              background: "#f9fafb",
              borderRadius: 8,
            }}
          >
            <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
            <p style={{ margin: 0, fontSize: 16, color: "#666" }}>
              {searchTerm ? "검색 결과가 없습니다" : "등록된 계약이 없습니다"}
            </p>
            {!searchTerm && (
              <button
                onClick={() => router.push("/dashboard/contracts/new")}
                style={{
                  marginTop: 16,
                  background: "#0070f3",
                  color: "white",
                  border: "none",
                  padding: "12px 24px",
                  borderRadius: 6,
                  fontSize: 14,
                  cursor: "pointer",
                }}
              >
                첫 계약 등록하기
              </button>
            )}
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #e5e7eb" }}>
                  <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 14, fontWeight: 600 }}>
                    계약번호
                  </th>
                  <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 14, fontWeight: 600 }}>
                    계약명
                  </th>
                  <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 14, fontWeight: 600 }}>
                    표준사업장
                  </th>
                  <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 14, fontWeight: 600 }}>
                    계약기간
                  </th>
                  <th style={{ padding: "12px 16px", textAlign: "right", fontSize: 14, fontWeight: 600 }}>
                    총 계약금액
                  </th>
                  <th style={{ padding: "12px 16px", textAlign: "center", fontSize: 14, fontWeight: 600 }}>
                    상태
                  </th>
                  <th style={{ padding: "12px 16px", textAlign: "center", fontSize: 14, fontWeight: 600 }}>
                    액션
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredContracts.map((contract) => (
                  <tr
                    key={contract.id}
                    style={{
                      borderBottom: "1px solid #e5e7eb",
                      transition: "background 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "#f9fafb";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "white";
                    }}
                  >
                    <td style={{ padding: "12px 16px", fontSize: 14, fontWeight: 600 }}>
                      {contract.contractNo}
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 14 }}>{contract.contractName}</td>
                    <td style={{ padding: "12px 16px", fontSize: 14 }}>{contract.supplier.company.name}</td>
                    <td style={{ padding: "12px 16px", fontSize: 13, color: "#666" }}>
                      {new Date(contract.startDate).toLocaleDateString("ko-KR")} ~{" "}
                      {new Date(contract.endDate).toLocaleDateString("ko-KR")}
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 14, textAlign: "right", fontWeight: 600 }}>
                      {contract.totalAmount.toLocaleString()}원
                    </td>
                    <td style={{ padding: "12px 16px", textAlign: "center" }}>
                      <span
                        style={{
                          padding: "4px 12px",
                          borderRadius: 12,
                          fontSize: 13,
                          fontWeight: 600,
                          background: `${getStatusColor(contract.status)}20`,
                          color: getStatusColor(contract.status),
                        }}
                      >
                        {getStatusLabel(contract.status)}
                      </span>
                    </td>
                    <td style={{ padding: "12px 16px", textAlign: "center" }}>
                      <button
                        onClick={() => router.push(`/dashboard/contracts/${contract.id}`)}
                        style={{
                          background: "#0070f3",
                          color: "white",
                          border: "none",
                          padding: "6px 16px",
                          borderRadius: 4,
                          fontSize: 13,
                          cursor: "pointer",
                        }}
                      >
                        상세보기
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 통계 요약 */}
        {filteredContracts.length > 0 && (
          <div
            style={{
              marginTop: 24,
              padding: 20,
              background: "#f0f9ff",
              borderRadius: 8,
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: 16,
            }}
          >
            <div>
              <p style={{ margin: 0, fontSize: 13, color: "#0369a1" }}>전체 계약</p>
              <p style={{ margin: "4px 0 0 0", fontSize: 24, fontWeight: "bold", color: "#0369a1" }}>
                {filteredContracts.length}건
              </p>
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 13, color: "#10b981" }}>진행중</p>
              <p style={{ margin: "4px 0 0 0", fontSize: 24, fontWeight: "bold", color: "#10b981" }}>
                {filteredContracts.filter((c) => c.status === "ACTIVE").length}건
              </p>
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 13, color: "#6b7280" }}>총 계약금액</p>
              <p style={{ margin: "4px 0 0 0", fontSize: 24, fontWeight: "bold", color: "#6b7280" }}>
                {filteredContracts.reduce((sum, c) => sum + c.totalAmount, 0).toLocaleString()}원
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
