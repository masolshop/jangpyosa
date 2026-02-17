"use client";

import { useEffect, useState } from "react";
import { API_BASE } from "@/lib/api";
import { getToken } from "@/lib/auth";

type Product = {
  id: string;
  title: string;
  category: string;
  price: number;
  unit: string;
  supplier: { company: { name: string } };
};

type Registry = {
  id: string;
  certNo: string;
  name: string;
  bizNo: string;
  region: string;
  representative: string;
  address: string;
  certDate: string;
  contactTel: string;
  industry: string;
  companyType: string;
};

export default function CatalogPage() {
  const [q, setQ] = useState("");
  const [items, setItems] = useState<Product[]>([]);
  const [registries, setRegistries] = useState<Registry[]>([]);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<"products" | "registries">("registries");
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 0 });

  async function loadProducts() {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/catalog/products?q=${encodeURIComponent(q)}`, {
        cache: "no-store",
      });
      const data = await res.json();
      setItems(data.products || []);
    } catch (error) {
      console.error("Load products error:", error);
    }
    setLoading(false);
  }

  async function loadRegistries(page = 1) {
    setLoading(true);
    try {
      const res = await fetch(
        `${API_BASE}/registry/list?page=${page}&limit=20&search=${encodeURIComponent(q)}`,
        { cache: "no-store" }
      );
      const data = await res.json();
      setRegistries(data.registries || []);
      setPagination(data.pagination);
    } catch (error) {
      console.error("Load registries error:", error);
    }
    setLoading(false);
  }

  async function addToCart(productId: string) {
    setMsg("");
    const token = getToken();
    if (!token) {
      setMsg("로그인이 필요합니다.");
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/cart/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId, qty: 1 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "ADD_FAILED");
      setMsg("✓ 장바구니에 담았습니다.");
    } catch (e: any) {
      setMsg("❌ " + e.message);
    }
  }

  useEffect(() => {
    if (tab === "registries") {
      loadRegistries(1);
    } else {
      loadProducts();
    }
  }, [tab]);

  const handleSearch = () => {
    if (tab === "registries") {
      loadRegistries(1);
    } else {
      loadProducts();
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h1>🛒 도급계약 표준사업장</h1>
        <p style={{ color: "#666", marginTop: 8 }}>
          {pagination.total}개 장애인표준사업장의 상품·서비스를 검색하고 도급계약을 의뢰하세요
        </p>

        {/* 탭 메뉴 */}
        <div style={{ display: "flex", gap: 8, marginTop: 24, borderBottom: "2px solid #eee" }}>
          <button
            onClick={() => setTab("registries")}
            style={{
              padding: "12px 24px",
              background: tab === "registries" ? "#0070f3" : "transparent",
              color: tab === "registries" ? "white" : "#666",
              border: "none",
              borderBottom: tab === "registries" ? "2px solid #0070f3" : "none",
              cursor: "pointer",
              fontSize: 16,
              fontWeight: 500,
            }}
          >
            표준사업장 목록 ({pagination.total})
          </button>
          <button
            onClick={() => setTab("products")}
            style={{
              padding: "12px 24px",
              background: tab === "products" ? "#0070f3" : "transparent",
              color: tab === "products" ? "white" : "#666",
              border: "none",
              borderBottom: tab === "products" ? "2px solid #0070f3" : "none",
              cursor: "pointer",
              fontSize: 16,
              fontWeight: 500,
            }}
          >
            상품/서비스
          </button>
        </div>

        {/* 검색 바 */}
        <div style={{ display: "flex", gap: 8, marginTop: 24, flexWrap: "wrap" }}>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            placeholder={
              tab === "registries"
                ? "사업장명, 지역, 업종, 소재지로 검색"
                : "서비스/제품 검색"
            }
            style={{ flex: 1, minWidth: 200 }}
          />
          <button onClick={handleSearch}>검색</button>
        </div>

        {msg && <p className={msg.includes("✓") ? "success" : "error"}>{msg}</p>}

        {loading && <p>로딩 중...</p>}

        {/* 표준사업장 목록 */}
        {tab === "registries" && (
          <div style={{ marginTop: 24 }}>
            {registries.length === 0 && !loading && (
              <p style={{ color: "#999" }}>검색 결과가 없습니다.</p>
            )}

            {registries.map((r) => (
              <div
                key={r.id}
                style={{
                  padding: 16,
                  border: "1px solid #ddd",
                  borderRadius: 8,
                  marginBottom: 12,
                  background: "white",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: 0, fontSize: 18, color: "#333" }}>
                      {r.name}
                      {r.certNo && (
                        <span style={{ marginLeft: 8, fontSize: 14, color: "#0070f3" }}>
                          {r.certNo}
                        </span>
                      )}
                    </h3>
                    <div style={{ marginTop: 8, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 8 }}>
                      {r.representative && (
                        <p style={{ margin: 0, fontSize: 14, color: "#666" }}>
                          <strong>대표자:</strong> {r.representative}
                        </p>
                      )}
                      {r.region && (
                        <p style={{ margin: 0, fontSize: 14, color: "#666" }}>
                          <strong>지역:</strong> {r.region}
                        </p>
                      )}
                      {r.industry && (
                        <p style={{ margin: 0, fontSize: 14, color: "#666" }}>
                          <strong>업종:</strong> {r.industry}
                        </p>
                      )}
                      {r.contactTel && (
                        <p style={{ margin: 0, fontSize: 14, color: "#666" }}>
                          <strong>연락처:</strong> {r.contactTel}
                        </p>
                      )}
                    </div>
                    {r.address && (
                      <p style={{ margin: "8px 0 0 0", fontSize: 14, color: "#666" }}>
                        <strong>소재지:</strong> {r.address}
                      </p>
                    )}
                    {r.companyType && (
                      <span
                        style={{
                          display: "inline-block",
                          marginTop: 8,
                          padding: "4px 8px",
                          fontSize: 12,
                          background: r.companyType === "자회사" ? "#e7f3ff" : "#f0f0f0",
                          color: r.companyType === "자회사" ? "#0070f3" : "#666",
                          borderRadius: 4,
                        }}
                      >
                        {r.companyType}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* 페이지네이션 */}
            {pagination.totalPages > 1 && (
              <div style={{ marginTop: 24, display: "flex", justifyContent: "center", gap: 8 }}>
                <button
                  onClick={() => loadRegistries(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  style={{ padding: "8px 16px" }}
                >
                  이전
                </button>
                <span style={{ padding: "8px 16px", color: "#666" }}>
                  {pagination.page} / {pagination.totalPages}
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
        )}

        {/* 상품 목록 */}
        {tab === "products" && (
          <div style={{ marginTop: 24 }}>
            {items.length === 0 && !loading && (
              <p style={{ color: "#999" }}>
                검색 결과가 없습니다. 관리자가 상품을 등록하면 표시됩니다.
              </p>
            )}

            {items.map((p) => (
              <div
                key={p.id}
                style={{
                  padding: 16,
                  border: "1px solid #ddd",
                  borderRadius: 4,
                  marginBottom: 12,
                }}
              >
                <h3>{p.title}</h3>
                <p style={{ color: "#666", marginTop: 4 }}>
                  {p.category} | {p.price.toLocaleString()}원 / {p.unit}
                </p>
                <p style={{ fontSize: 14, marginTop: 4 }}>
                  공급사: {p.supplier.company.name}
                </p>
                <button onClick={() => addToCart(p.id)} style={{ marginTop: 8 }}>
                  장바구니 담기
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
