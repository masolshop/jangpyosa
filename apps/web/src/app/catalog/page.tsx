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

export default function CatalogPage() {
  const [q, setQ] = useState("");
  const [items, setItems] = useState<Product[]>([]);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    const res = await fetch(`${API_BASE}/catalog/products?q=${encodeURIComponent(q)}`, {
      cache: "no-store",
    });
    const data = await res.json();
    setItems(data.products || []);
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
    load();
  }, []);

  return (
    <div className="container">
      <div className="card">
        <h1>🛒 연계고용 도급 쇼핑몰</h1>
        <p style={{ color: "#666", marginTop: 8 }}>
          830개 장애인표준사업장의 상품·서비스를 검색하고 도급계약을 의뢰하세요
        </p>

        <div style={{ display: "flex", gap: 8, marginTop: 24, flexWrap: "wrap" }}>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="서비스/제품 검색"
            style={{ flex: 1, minWidth: 200 }}
          />
          <button onClick={load}>검색</button>
          <a href="/cart">
            <button style={{ background: "#28a745" }}>장바구니</button>
          </a>
          <a href="/calculators/levy">
            <button style={{ background: "#6c757d" }}>부담금 계산기</button>
          </a>
          <a href="/calculators/linkage">
            <button style={{ background: "#6c757d" }}>연계고용 계산기</button>
          </a>
        </div>

        {msg && <p className={msg.includes("✓") ? "success" : "error"}>{msg}</p>}

        {loading && <p>로딩 중...</p>}

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
              <button
                onClick={() => addToCart(p.id)}
                style={{ marginTop: 8 }}
              >
                장바구니 담기
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
