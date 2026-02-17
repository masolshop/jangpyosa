"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

type CartItem = {
  id: string;
  qty: number;
  product: {
    id: string;
    title: string;
    price: number;
    unit: string;
    supplier: { company: { name: string } };
  };
};

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [msg, setMsg] = useState("");

  async function loadCart() {
    try {
      const data = await apiFetch("/cart");
      setItems(data.cart?.items || []);
      const total = (data.cart?.items || []).reduce(
        (sum: number, item: CartItem) => sum + item.product.price * item.qty,
        0
      );
      setTotalAmount(total);
    } catch (e: any) {
      setMsg("장바구니 로드 실패: " + e.message);
    }
  }

  async function removeItem(itemId: string) {
    try {
      await apiFetch(`/cart/items/${itemId}`, { method: "DELETE" });
      setMsg("항목이 삭제되었습니다.");
      loadCart();
    } catch (e: any) {
      setMsg("삭제 실패: " + e.message);
    }
  }

  useEffect(() => {
    loadCart();
  }, []);

  return (
    <div className="container">
      <div className="card">
        <h1>🛒 장바구니</h1>

        {msg && <p className={msg.includes("성공") || msg.includes("삭제") ? "success" : "error"}>{msg}</p>}

        {items.length === 0 ? (
          <div style={{ marginTop: 24, textAlign: "center" }}>
            <p style={{ color: "#999" }}>장바구니가 비어있습니다.</p>
            <a href="/catalog">
              <button style={{ marginTop: 16 }}>상품 둘러보기</button>
            </a>
          </div>
        ) : (
          <>
            <div style={{ marginTop: 24 }}>
              {items.map((item) => (
                <div
                  key={item.id}
                  style={{
                    padding: 16,
                    border: "1px solid #ddd",
                    borderRadius: 4,
                    marginBottom: 12,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <h3>{item.product.title}</h3>
                    <p style={{ color: "#666", marginTop: 4 }}>
                      {item.product.price.toLocaleString()}원 / {item.product.unit} × {item.qty}개
                    </p>
                    <p style={{ fontSize: 14, marginTop: 4 }}>
                      공급사: {item.product.supplier.company.name}
                    </p>
                    <p style={{ fontWeight: "bold", marginTop: 8 }}>
                      소계: {(item.product.price * item.qty).toLocaleString()}원
                    </p>
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    style={{ background: "#dc3545" }}
                  >
                    삭제
                  </button>
                </div>
              ))}
            </div>

            <div
              style={{
                marginTop: 24,
                padding: 16,
                background: "#f8f9fa",
                borderRadius: 4,
              }}
            >
              <h2>총 도급 금액: {totalAmount.toLocaleString()}원</h2>
              <p style={{ marginTop: 8, color: "#666" }}>
                이 금액으로 연계고용 감면 계산기를 사용해보세요
              </p>
              <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
                <a href="/calculators/linkage">
                  <button>감면 계산하기</button>
                </a>
                <button style={{ background: "#28a745" }}>도급계약 의뢰</button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
