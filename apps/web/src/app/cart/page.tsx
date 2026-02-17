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
    supplier: { company: { name: string; bizNo: string } };
  };
};

type ReductionCalc = {
  ok: boolean;
  year: number;
  levyAmount: number;
  contractCount: number;
  totalContractAmount: number;
  capByLevy: number;
  capByContract: number;
  maxReduction: number;
  afterReduction: number;
  supplierReductions: Array<{
    index: number;
    contractAmount: number;
    ratio: number;
    reduction: number;
  }>;
  rule: string;
  warning: string;
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
  
  // 🆕 합산 감면 계산
  const [levyAmount, setLevyAmount] = useState<number>(0);
  const [reductionCalc, setReductionCalc] = useState<ReductionCalc | null>(null);
  const [calcLoading, setCalcLoading] = useState(false);
  
  // 🆕 1년 감면 진행 상황표
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [monthlyProgress, setMonthlyProgress] = useState<boolean[]>(new Array(12).fill(false));

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
  
  // 🆕 합산 감면 계산 실행
  async function runAggregateCalc() {
    if (!levyAmount || levyAmount <= 0) {
      setMsg("❌ 예상 부담금을 입력하세요.");
      return;
    }
    
    if (items.length === 0) {
      setMsg("❌ 장바구니가 비어있습니다.");
      return;
    }
    
    setCalcLoading(true);
    setMsg("");
    
    try {
      // 공급사별 도급액 배열
      const supplierMap = new Map<string, number>();
      items.forEach(item => {
        const bizNo = item.product.supplier.company.bizNo;
        const amount = item.product.price * item.qty;
        supplierMap.set(bizNo, (supplierMap.get(bizNo) || 0) + amount);
      });
      
      const contractAmounts = Array.from(supplierMap.values());
      
      const res = await fetch("http://localhost:4000/reduction/aggregate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          year: 2025,
          levyAmount,
          contractAmounts
        })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setReductionCalc(data);
        setMsg("✅ 합산 감면 계산이 완료되었습니다.");
      } else {
        setMsg(`❌ 계산 실패: ${data.message || data.error}`);
      }
    } catch (e: any) {
      setMsg(`❌ 계산 중 오류: ${e.message}`);
    } finally {
      setCalcLoading(false);
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
      setReductionCalc(null); // 계산 결과 초기화
      
      // 장바구니 다시 로드 (비워진 상태)
      loadCart();
    } catch (e: any) {
      setMsg("계약 의뢰 실패: " + e.message);
    }
  }

  useEffect(() => {
    loadCart();
  }, []);

  // 🆕 공급사별 그룹화
  const supplierGroups = items.reduce((acc, item) => {
    const bizNo = item.product.supplier.company.bizNo;
    const companyName = item.product.supplier.company.name;
    
    if (!acc[bizNo]) {
      acc[bizNo] = {
        bizNo,
        companyName,
        items: [],
        total: 0
      };
    }
    
    acc[bizNo].items.push(item);
    acc[bizNo].total += item.product.price * item.qty;
    
    return acc;
  }, {} as Record<string, { bizNo: string; companyName: string; items: CartItem[]; total: number }>);
  
  const supplierCount = Object.keys(supplierGroups).length;

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
            {/* 공급사별 상품 표시 */}
            <div style={{ marginTop: 24 }}>
              <h2 style={{ marginBottom: 16 }}>📦 담긴 상품 ({supplierCount}개 표준사업장)</h2>
              
              {Object.values(supplierGroups).map((group) => (
                <div
                  key={group.bizNo}
                  style={{
                    padding: 16,
                    border: "2px solid #0070f3",
                    borderRadius: 8,
                    marginBottom: 16,
                    background: "#f8f9fa"
                  }}
                >
                  <h3 style={{ marginBottom: 12, color: "#0070f3" }}>
                    🏢 {group.companyName}
                  </h3>
                  <p style={{ fontSize: 14, color: "#666", marginBottom: 12 }}>
                    사업자번호: {group.bizNo}
                  </p>
                  
                  {group.items.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        padding: 12,
                        border: "1px solid #ddd",
                        borderRadius: 4,
                        marginBottom: 8,
                        background: "white",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div>
                        <h4 style={{ margin: 0 }}>{item.product.title}</h4>
                        <p style={{ color: "#666", marginTop: 4, fontSize: 14 }}>
                          {item.product.price.toLocaleString()}원 / {item.product.unit} × {item.qty}개
                        </p>
                        <p style={{ fontWeight: "bold", marginTop: 4 }}>
                          소계: {(item.product.price * item.qty).toLocaleString()}원
                        </p>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        style={{ background: "#dc3545", padding: "8px 12px" }}
                      >
                        삭제
                      </button>
                    </div>
                  ))}
                  
                  <div style={{ 
                    marginTop: 12, 
                    padding: 12, 
                    background: "#e7f3ff", 
                    borderRadius: 4 
                  }}>
                    <p style={{ fontWeight: "bold", margin: 0 }}>
                      이 업체 도급액 합계: {group.total.toLocaleString()}원
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* 총 도급 금액 */}
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
                {supplierCount}개 표준사업장과 계약 예정
              </p>
            </div>
            
            {/* 🆕 합산 감면 계산기 */}
            <div
              style={{
                marginTop: 24,
                padding: 20,
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                borderRadius: 8,
                color: "white"
              }}
            >
              <h2 style={{ margin: 0, marginBottom: 16 }}>💰 합산 감면 계산기</h2>
              <p style={{ marginBottom: 16, fontSize: 14, lineHeight: 1.6 }}>
                여러 표준사업장과 계약 시 총 감면액을 계산합니다. 감면 상한(부담금 90% + 도급액 50%)이 자동 적용됩니다.
              </p>
              
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", marginBottom: 8, fontWeight: "bold" }}>
                  📊 귀사의 예상 부담금 (원)
                </label>
                <input
                  type="number"
                  value={levyAmount || ""}
                  onChange={(e) => setLevyAmount(parseInt(e.target.value) || 0)}
                  placeholder="예: 20000000 (2천만원)"
                  style={{
                    width: "100%",
                    padding: 12,
                    fontSize: 16,
                    borderRadius: 4,
                    border: "none",
                    color: "#333"
                  }}
                />
                <p style={{ fontSize: 12, marginTop: 8, opacity: 0.9 }}>
                  💡 부담금 계산기에서 계산한 금액을 입력하세요
                </p>
              </div>
              
              <button
                onClick={runAggregateCalc}
                disabled={calcLoading}
                style={{
                  width: "100%",
                  padding: 14,
                  fontSize: 16,
                  fontWeight: "bold",
                  background: calcLoading ? "#999" : "white",
                  color: "#764ba2",
                  border: "none",
                  borderRadius: 6,
                  cursor: calcLoading ? "not-allowed" : "pointer"
                }}
              >
                {calcLoading ? "계산 중..." : "🧮 합산 감면액 계산하기"}
              </button>
              
              {reductionCalc && (
                <div style={{ 
                  marginTop: 20, 
                  padding: 16, 
                  background: "rgba(255,255,255,0.2)", 
                  borderRadius: 6 
                }}>
                  <h3 style={{ margin: 0, marginBottom: 12 }}>📊 계산 결과</h3>
                  
                  <div style={{ 
                    display: "grid", 
                    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", 
                    gap: 12,
                    marginBottom: 16
                  }}>
                    <div style={{ padding: 12, background: "rgba(255,255,255,0.15)", borderRadius: 4 }}>
                      <p style={{ margin: 0, fontSize: 12, opacity: 0.9 }}>계약 건수</p>
                      <p style={{ margin: 0, fontSize: 20, fontWeight: "bold", marginTop: 4 }}>
                        {reductionCalc.contractCount}개
                      </p>
                    </div>
                    
                    <div style={{ padding: 12, background: "rgba(255,255,255,0.15)", borderRadius: 4 }}>
                      <p style={{ margin: 0, fontSize: 12, opacity: 0.9 }}>총 도급액</p>
                      <p style={{ margin: 0, fontSize: 20, fontWeight: "bold", marginTop: 4 }}>
                        {reductionCalc.totalContractAmount.toLocaleString()}원
                      </p>
                    </div>
                    
                    <div style={{ padding: 12, background: "rgba(255,255,255,0.15)", borderRadius: 4 }}>
                      <p style={{ margin: 0, fontSize: 12, opacity: 0.9 }}>예상 부담금</p>
                      <p style={{ margin: 0, fontSize: 20, fontWeight: "bold", marginTop: 4 }}>
                        {reductionCalc.levyAmount.toLocaleString()}원
                      </p>
                    </div>
                  </div>
                  
                  <div style={{ 
                    padding: 16, 
                    background: "rgba(255,255,255,0.3)", 
                    borderRadius: 6,
                    marginBottom: 16
                  }}>
                    <p style={{ margin: 0, fontSize: 14, opacity: 0.9, marginBottom: 8 }}>감면 상한 계산</p>
                    <p style={{ margin: 0, fontSize: 14 }}>
                      • 부담금 기준 상한: {reductionCalc.capByLevy.toLocaleString()}원 (부담금의 90%)
                    </p>
                    <p style={{ margin: 0, fontSize: 14, marginTop: 4 }}>
                      • 도급액 기준 상한: {reductionCalc.capByContract.toLocaleString()}원 (도급액의 50%)
                    </p>
                    <p style={{ margin: 0, fontSize: 18, fontWeight: "bold", marginTop: 12, color: "#ffd700" }}>
                      → 최종 감면 가능액: {reductionCalc.maxReduction.toLocaleString()}원
                    </p>
                  </div>
                  
                  <div style={{ 
                    padding: 16, 
                    background: "rgba(255,255,255,0.3)", 
                    borderRadius: 6 
                  }}>
                    <p style={{ margin: 0, fontSize: 18, fontWeight: "bold", color: "#ffd700" }}>
                      ✅ 감면 후 부담금: {reductionCalc.afterReduction.toLocaleString()}원
                    </p>
                    <p style={{ margin: 0, fontSize: 14, marginTop: 8, opacity: 0.9 }}>
                      총 {(reductionCalc.levyAmount - reductionCalc.afterReduction).toLocaleString()}원 절감
                    </p>
                  </div>
                  
                  <div style={{ 
                    marginTop: 16, 
                    padding: 12, 
                    background: "rgba(255,255,0,0.2)", 
                    borderRadius: 4,
                    border: "1px solid rgba(255,255,0,0.4)"
                  }}>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: "bold" }}>⚠️ {reductionCalc.rule}</p>
                    <p style={{ margin: 0, fontSize: 12, marginTop: 8, opacity: 0.9 }}>
                      {reductionCalc.warning}
                    </p>
                  </div>
                </div>
              )}
            </div>
            
            {/* 🆕 1년 감면 진행 상황표 버튼 */}
            <div style={{ marginTop: 24 }}>
              <button
                onClick={() => setShowProgressModal(true)}
                style={{
                  width: "100%",
                  padding: 14,
                  fontSize: 16,
                  fontWeight: "bold",
                  background: "#28a745",
                  color: "white",
                  border: "none",
                  borderRadius: 6,
                  cursor: "pointer"
                }}
              >
                📅 1년 감면 진행 상황표 보기
              </button>
            </div>

            {/* 계약 의뢰 버튼 */}
            <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
              <a href="/calculators/linkage" style={{ flex: 1 }}>
                <button style={{ width: "100%" }}>💰 감면 계산하기</button>
              </a>
              <button 
                style={{ flex: 1, background: "#0070f3" }}
                onClick={handleContractRequest}
              >
                📄 도급계약 의뢰
              </button>
            </div>
          </>
        )}
      </div>
      
      {/* 🆕 1년 감면 진행 상황표 모달 */}
      {showProgressModal && (
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
          onClick={() => setShowProgressModal(false)}
        >
          <div
            style={{
              background: "white",
              padding: 32,
              borderRadius: 8,
              maxWidth: 800,
              width: "90%",
              maxHeight: "80vh",
              overflowY: "auto"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ marginBottom: 16, color: "#0070f3" }}>📅 1년 감면 진행 상황표 (2026년)</h2>
            
            <div style={{ 
              background: "#fff3cd", 
              padding: 16, 
              borderRadius: 4, 
              marginBottom: 24,
              border: "1px solid #ffc107"
            }}>
              <p style={{ margin: 0, fontWeight: "bold", marginBottom: 8 }}>
                📌 월별 이행 체크리스트
              </p>
              <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6 }}>
                연계고용 감면은 <strong>매월 실제 납품/검수/대금 지급</strong>이 완료되어야 해당 월의 감면이 인정됩니다.
                아래 체크리스트로 진행 상황을 관리하세요.
              </p>
            </div>
            
            <div style={{ marginBottom: 24 }}>
              <h3 style={{ marginBottom: 12 }}>✅ 월별 이행 완료 체크</h3>
              <div style={{ 
                display: "grid", 
                gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", 
                gap: 12 
              }}>
                {Array.from({ length: 12 }, (_, i) => (
                  <label
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      padding: 12,
                      background: monthlyProgress[i] ? "#d4edda" : "#f8f9fa",
                      borderRadius: 4,
                      cursor: "pointer",
                      border: `2px solid ${monthlyProgress[i] ? "#28a745" : "#ddd"}`
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={monthlyProgress[i]}
                      onChange={(e) => {
                        const newProgress = [...monthlyProgress];
                        newProgress[i] = e.target.checked;
                        setMonthlyProgress(newProgress);
                      }}
                      style={{ marginRight: 8, minWidth: 18, minHeight: 18 }}
                    />
                    <span style={{ fontWeight: monthlyProgress[i] ? "bold" : "normal" }}>
                      {i + 1}월
                    </span>
                  </label>
                ))}
              </div>
            </div>
            
            <div style={{ 
              padding: 16, 
              background: "#e7f3ff", 
              borderRadius: 4,
              marginBottom: 24
            }}>
              <p style={{ margin: 0, fontWeight: "bold", marginBottom: 8 }}>
                📊 진행 현황
              </p>
              <p style={{ margin: 0, fontSize: 18, fontWeight: "bold", color: "#0070f3" }}>
                완료: {monthlyProgress.filter(Boolean).length}개월 / 12개월
              </p>
              <div style={{
                marginTop: 12,
                height: 24,
                background: "#ddd",
                borderRadius: 12,
                overflow: "hidden"
              }}>
                <div style={{
                  width: `${(monthlyProgress.filter(Boolean).length / 12) * 100}%`,
                  height: "100%",
                  background: "linear-gradient(90deg, #0070f3, #00a8ff)",
                  transition: "width 0.3s"
                }} />
              </div>
            </div>
            
            <div style={{ 
              background: "#fff3cd", 
              padding: 16, 
              borderRadius: 4,
              marginBottom: 24,
              border: "1px solid #ffc107"
            }}>
              <p style={{ margin: 0, fontSize: 13, fontWeight: "bold", marginBottom: 8 }}>
                ⚠️ 월별 이행 프로세스
              </p>
              <ol style={{ margin: 0, paddingLeft: 20, fontSize: 13, lineHeight: 1.8 }}>
                <li>매월 표준사업장에서 납품 완료</li>
                <li>검수 및 검수확인서 작성</li>
                <li>대금 지급 (세금계산서 발행)</li>
                <li>이행증빙 자료 보관 (납품확인서, 세금계산서 등)</li>
                <li>분기별 또는 연말에 공단에 감면 신청</li>
              </ol>
            </div>
            
            <div style={{ 
              background: "#f8d7da", 
              padding: 16, 
              borderRadius: 4,
              marginBottom: 24,
              border: "1px solid #dc3545"
            }}>
              <p style={{ margin: 0, fontSize: 13, fontWeight: "bold", marginBottom: 8, color: "#dc3545" }}>
                ❌ 주의사항
              </p>
              <ul style={{ margin: 0, paddingLeft: 20, fontSize: 13, lineHeight: 1.8 }}>
                <li>월별 이행이 완료되지 않은 달은 감면이 인정되지 않습니다</li>
                <li>계약서만 체결하고 실제 납품/대금지급이 없으면 감면 불가</li>
                <li>허위 또는 부실 이행 적발 시 감면 취소 및 환수 조치</li>
                <li>이행증빙 자료는 최소 5년간 보관 필요</li>
              </ul>
            </div>
            
            <button
              onClick={() => setShowProgressModal(false)}
              style={{
                width: "100%",
                padding: 14,
                fontSize: 16,
                fontWeight: "bold",
                background: "#6c757d",
                color: "white",
                border: "none",
                borderRadius: 6,
                cursor: "pointer"
              }}
            >
              닫기
            </button>
          </div>
        </div>
      )}
      
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
