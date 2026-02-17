"use client";

import { useEffect, useState } from "react";

type Registry = {
  id: string;
  certNo: string;
  name: string;
  bizNo: string;
  region: string;
  representative: string;
  address: string;
  contactTel: string;
  industry: string;
  companyType: string;
};

export default function CatalogPage() {
  const [q, setQ] = useState("");
  const [registries, setRegistries] = useState<Registry[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 0 });

  async function loadRegistries(page = 1) {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/proxy/registry/list?page=${page}&limit=20&search=${encodeURIComponent(q)}`
      );
      const data = await res.json();
      console.log("Loaded data:", data);
      setRegistries(data.registries || []);
      setPagination(data.pagination || { page: 1, total: 0, totalPages: 0 });
    } catch (error) {
      console.error("Load registries error:", error);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadRegistries(1);
  }, []);

  const handleSearch = () => {
    loadRegistries(1);
  };

  return (
    <div className="container">
      <div className="card">
        <h1>🛒 도급계약 표준사업장</h1>
        <p style={{ color: "#666", marginTop: 8 }}>
          {pagination.total}개 장애인표준사업장의 상품·서비스를 검색하고 도급계약을 의뢰하세요
        </p>

        {/* 검색 바 */}
        <div style={{ display: "flex", gap: 8, marginTop: 24, flexWrap: "wrap" }}>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            placeholder="사업장명, 지역, 업종, 소재지로 검색"
            style={{ flex: 1, minWidth: 200 }}
          />
          <button onClick={handleSearch}>검색</button>
        </div>

        {loading && <p style={{ marginTop: 24 }}>로딩 중...</p>}

        {/* 표준사업장 목록 */}
        <div style={{ marginTop: 24 }}>
          {registries.length === 0 && !loading && (
            <p style={{ color: "#999" }}>검색 결과가 없습니다.</p>
          )}

          {registries.map((r) => (
            <div
              key={r.id}
              style={{
                padding: 20,
                border: "1px solid #ddd",
                borderRadius: 8,
                marginBottom: 12,
                background: "white",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 12 }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: 0, fontSize: 18, color: "#333", fontWeight: 600 }}>
                    {r.name}
                    {r.certNo && (
                      <span style={{ marginLeft: 8, fontSize: 13, color: "#0070f3", fontWeight: 400 }}>
                        {r.certNo}
                      </span>
                    )}
                  </h3>
                </div>
                {r.companyType && (
                  <span
                    style={{
                      display: "inline-block",
                      padding: "4px 12px",
                      fontSize: 12,
                      background: r.companyType === "자회사" ? "#e7f3ff" : "#f0f0f0",
                      color: r.companyType === "자회사" ? "#0070f3" : "#666",
                      borderRadius: 4,
                      fontWeight: 500,
                    }}
                  >
                    {r.companyType}
                  </span>
                )}
              </div>

              {/* 업종 및 주요 생산품 (강조) */}
              {r.industry && (
                <div
                  style={{
                    padding: 12,
                    background: "#f8f9fa",
                    borderRadius: 6,
                    marginBottom: 12,
                    borderLeft: "3px solid #0070f3",
                  }}
                >
                  <p style={{ margin: 0, fontSize: 14, color: "#333", fontWeight: 500 }}>
                    <span style={{ color: "#0070f3", marginRight: 8 }}>📦</span>
                    <strong>업종 및 주요 생산품:</strong>
                  </p>
                  <p style={{ margin: "4px 0 0 24px", fontSize: 14, color: "#555", lineHeight: 1.6 }}>
                    {r.industry}
                  </p>
                </div>
              )}

              {/* 기본 정보 */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 12 }}>
                {r.representative && (
                  <p style={{ margin: 0, fontSize: 14, color: "#666" }}>
                    <strong style={{ color: "#333" }}>대표자:</strong> {r.representative}
                  </p>
                )}
                {r.region && (
                  <p style={{ margin: 0, fontSize: 14, color: "#666" }}>
                    <strong style={{ color: "#333" }}>지역:</strong> {r.region}
                  </p>
                )}
              </div>

              {/* 소재지 */}
              {r.address && (
                <p style={{ margin: "12px 0 0 0", fontSize: 14, color: "#666" }}>
                  <strong style={{ color: "#333" }}>소재지:</strong> {r.address}
                </p>
              )}
            </div>
          ))}

          {/* 페이지네이션 */}
          {pagination.totalPages > 1 && (
            <div style={{ marginTop: 24, display: "flex", justifyContent: "center", gap: 8, alignItems: "center" }}>
              <button
                onClick={() => loadRegistries(pagination.page - 1)}
                disabled={pagination.page === 1}
                style={{ padding: "8px 16px" }}
              >
                이전
              </button>
              <span style={{ padding: "8px 16px", color: "#666" }}>
                {pagination.page} / {pagination.totalPages} (총 {pagination.total}개)
              </span>
              <button
                onClick={() => loadRegistries(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                style={{ padding: "8px 16px" }}
              >
                다음
              </button>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .container {
          padding: 20px;
          max-width: 1200px;
          margin: 0 auto;
        }
        .card {
          background: white;
          border-radius: 12px;
          padding: 32px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        h1 {
          margin: 0;
          font-size: 28px;
          color: #333;
        }
        input {
          padding: 12px;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 14px;
        }
        input:focus {
          outline: none;
          border-color: #0070f3;
        }
        button {
          padding: 12px 24px;
          background: #0070f3;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 14px;
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
