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
  
  // 🆕 감면 리스크 확인 체크박스
  const [showRiskModal, setShowRiskModal] = useState(false);
  const [riskCheck1, setRiskCheck1] = useState(false);
  const [riskCheck2, setRiskCheck2] = useState(false);
  const [riskCheck3, setRiskCheck3] = useState(false);

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
  
  // 🆕 도급계약 의뢰 버튼 클릭 시 리스크 확인 모달 표시
  function handleContractRequest() {
    setShowRiskModal(true);
  }
  
  // 🆕 리스크 확인 후 계약 의뢰 진행
  async function confirmAndRequest() {
    if (!riskCheck1 || !riskCheck2 || !riskCheck3) {
      setMsg("❌ 감면 리스크 확인을 위해 3가지 항목을 모두 체크해주세요.");
      return;
    }
    
    try {
      // ContractRequest 생성 (buyerAcceptedRiskDisclosure: true)
      await apiFetch("/cart/checkout", {
        method: "POST",
        body: JSON.stringify({
          buyerAcceptedRiskDisclosure: true,
          requirements: "장바구니에서 도급계약 의뢰",
          durationMonths: 12
        })
      });
      
      setMsg("✅ 도급계약 의뢰가 완료되었습니다.");
      setShowRiskModal(false);
      setRiskCheck1(false);
      setRiskCheck2(false);
      setRiskCheck3(false);
      
      // 장바구니 다시 로드 (비워진 상태)
      loadCart();
    } catch (e: any) {
      setMsg("계약 의뢰 실패: " + e.message);
    }
  }

  useEffect(() => {
    loadCart();
  }, []);

  return (
    <div className="container">
      <div className="card">
        <h1>🛒 장바구니</h1>

        {msg && <p className={msg.includes("성공") || msg.includes("완료") || msg.includes("삭제") ? "success" : "error"}>{msg}</p>}

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
                <button 
                  style={{ background: "#28a745" }}
                  onClick={handleContractRequest}
                >
                  도급계약 의뢰
                </button>
              </div>
            </div>
          </>
        )}
      </div>
      
      {/* 🆕 감면 리스크 확인 모달 */}
      {showRiskModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000
          }}
          onClick={() => setShowRiskModal(false)}
        >
          <div
            style={{
              background: "white",
              padding: 32,
              borderRadius: 8,
              maxWidth: 600,
              width: "90%",
              maxHeight: "80vh",
              overflowY: "auto"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ marginBottom: 16, color: "#dc3545" }}>⚠️ 연계고용 감면 리스크 확인 (필수)</h2>
            
            <div style={{ 
              background: "#fff3cd", 
              padding: 16, 
              borderRadius: 4, 
              marginBottom: 24,
              border: "1px solid #ffc107"
            }}>
              <p style={{ fontWeight: "bold", marginBottom: 8 }}>
                도급계약 의뢰 전 반드시 확인하세요
              </p>
              <p style={{ fontSize: 14, lineHeight: 1.6 }}>
                연계고용 부담금 감면은 법적 요건을 충족해야 하며, 계약서만으로는 자동 감면되지 않습니다. 
                아래 3가지 리스크를 확인하고 동의해주세요.
              </p>
            </div>
            
            <div style={{ marginBottom: 24 }}>
              <label style={{ 
                display: "flex", 
                alignItems: "flex-start", 
                marginBottom: 16,
                padding: 16,
                background: "#f8f9fa",
                borderRadius: 4,
                cursor: "pointer"
              }}>
                <input
                  type="checkbox"
                  checked={riskCheck1}
                  onChange={(e) => setRiskCheck1(e.target.checked)}
                  style={{ marginTop: 4, marginRight: 12, minWidth: 20 }}
                />
                <div style={{ flex: 1 }}>
                  <strong>1. 감면 적용 한도 (최대 90% 이내, 도급액 50% 한도)</strong>
                  <p style={{ fontSize: 14, marginTop: 4, color: "#666" }}>
                    연간 부담금의 90% 이내, 그리고 도급계약 금액의 50% 이내로만 감면이 적용됩니다. 
                    두 한도 중 더 작은 금액이 최종 감면액입니다.
                  </p>
                </div>
              </label>
              
              <label style={{ 
                display: "flex", 
                alignItems: "flex-start", 
                marginBottom: 16,
                padding: 16,
                background: "#f8f9fa",
                borderRadius: 4,
                cursor: "pointer"
              }}>
                <input
                  type="checkbox"
                  checked={riskCheck2}
                  onChange={(e) => setRiskCheck2(e.target.checked)}
                  style={{ marginTop: 4, marginRight: 12, minWidth: 20 }}
                />
                <div style={{ flex: 1 }}>
                  <strong>2. 월별 이행 기준 (계약서만으로는 감면 불가)</strong>
                  <p style={{ fontSize: 14, marginTop: 4, color: "#666" }}>
                    매월 실제 납품/검수/대금 지급이 이루어져야 해당 월의 감면이 인정됩니다. 
                    계약서만 체결하고 이행하지 않으면 감면되지 않습니다.
                  </p>
                </div>
              </label>
              
              <label style={{ 
                display: "flex", 
                alignItems: "flex-start", 
                marginBottom: 16,
                padding: 16,
                background: "#f8f9fa",
                borderRadius: 4,
                cursor: "pointer"
              }}>
                <input
                  type="checkbox"
                  checked={riskCheck3}
                  onChange={(e) => setRiskCheck3(e.target.checked)}
                  style={{ marginTop: 4, marginRight: 12, minWidth: 20 }}
                />
                <div style={{ flex: 1 }}>
                  <strong>3. 근로자 인정 조건 (최저임금 이상 + 월 60시간 이상)</strong>
                  <p style={{ fontSize: 14, marginTop: 4, color: "#666" }}>
                    표준사업장 장애인 근로자가 최저임금 이상, 월 60시간 이상 근무해야 인정 인원에 포함됩니다. 
                    중증 장애인은 2배로 계산되며, 조건 미달 시 감면 인원에서 제외됩니다.
                  </p>
                </div>
              </label>
            </div>
            
            <div style={{ 
              background: "#e7f3ff", 
              padding: 16, 
              borderRadius: 4, 
              marginBottom: 24,
              border: "1px solid #007bff"
            }}>
              <p style={{ fontSize: 14, fontWeight: "bold", marginBottom: 8 }}>
                📞 문의: 한국장애인고용공단 (1588-1519)
              </p>
              <p style={{ fontSize: 13, color: "#666", lineHeight: 1.6 }}>
                법적 근거: 장애인고용촉진 및 직업재활법 제33조 (연계고용 부담금 감면)
              </p>
            </div>
            
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => setShowRiskModal(false)}
                style={{ flex: 1, background: "#6c757d" }}
              >
                취소
              </button>
              <button
                onClick={confirmAndRequest}
                style={{ 
                  flex: 1, 
                  background: riskCheck1 && riskCheck2 && riskCheck3 ? "#28a745" : "#ccc",
                  cursor: riskCheck1 && riskCheck2 && riskCheck3 ? "pointer" : "not-allowed"
                }}
                disabled={!riskCheck1 || !riskCheck2 || !riskCheck3}
              >
                확인 후 계약 의뢰
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
