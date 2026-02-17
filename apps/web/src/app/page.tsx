export default function HomePage() {
  return (
    <div className="container">
      <div className="card">
        <h1>🏢 장표사닷컴</h1>
        <p style={{ marginTop: 16, fontSize: 18, fontWeight: 500 }}>
          장애인표준사업장 연계고용 플랫폼
        </p>
        <p style={{ marginTop: 8, color: "#666", fontSize: 16 }}>
          장애인 미고용 부담금 절감을 위한 도급계약 쇼핑몰
        </p>

        <div style={{ marginTop: 40 }}>
          <h2 style={{ marginBottom: 16 }}>✨ 주요 서비스</h2>
          
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
            <ServiceCard
              icon="💰"
              title="부담금 계산기"
              description="상시근로자 수와 장애인 고용인원을 입력하여 예상 부담금을 계산하세요"
              href="/calculators/levy"
            />
            <ServiceCard
              icon="📉"
              title="감면 계산기"
              description="도급계약 금액을 입력하여 부담금 감면액을 확인하세요"
              href="/calculators/linkage"
            />
            <ServiceCard
              icon="🛒"
              title="상품 쇼핑몰"
              description="830개 장애인표준사업장의 상품과 서비스를 검색하고 도급계약을 의뢰하세요"
              href="/catalog"
            />
          </div>
        </div>

        <div style={{ marginTop: 40, padding: 20, background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", borderRadius: 8, color: "white" }}>
          <h3 style={{ margin: 0, fontSize: 20 }}>📢 제도 안내</h3>
          <p style={{ marginTop: 12, lineHeight: 1.7, fontSize: 15 }}>
            연계고용 부담금 감면제도는 장애인표준사업장 등과 도급계약을 체결해 납품받는 경우,
            해당 사업장에서 종사한 장애인을 고용한 것으로 간주해 부담금을 감면하는 제도입니다.
          </p>
          <div style={{ marginTop: 16, padding: 16, background: "rgba(255,255,255,0.15)", borderRadius: 6 }}>
            <p style={{ margin: 0, fontSize: 15, fontWeight: "bold" }}>
              ✓ 감면 총액: 부담금의 <span style={{ color: "#ffd700" }}>90% 이내</span>
            </p>
            <p style={{ margin: "8px 0 0 0", fontSize: 15, fontWeight: "bold" }}>
              ✓ 상한: 해당 연도 도급액의 <span style={{ color: "#ffd700" }}>50%</span>를 초과할 수 없음
            </p>
          </div>
        </div>

        <div style={{ marginTop: 40, textAlign: "center", padding: 20, background: "#f8f9fa", borderRadius: 8 }}>
          <h3 style={{ margin: 0, fontSize: 18 }}>🚀 지금 바로 시작하세요</h3>
          <p style={{ marginTop: 8, color: "#666" }}>
            왼쪽 사이드바에서 원하는 메뉴를 선택하세요
          </p>
          <div style={{ marginTop: 16, display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <a href="/signup">
              <button style={{ background: "#28a745", padding: "12px 24px" }}>회원가입</button>
            </a>
            <a href="/login">
              <button style={{ padding: "12px 24px" }}>로그인</button>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function ServiceCard({ icon, title, description, href }: { icon: string; title: string; description: string; href: string }) {
  return (
    <a href={href} style={{ textDecoration: "none" }}>
      <div
        style={{
          padding: 20,
          border: "1px solid #e0e0e0",
          borderRadius: 8,
          background: "white",
          transition: "all 0.3s",
          height: "100%",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-4px)";
          e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "none";
        }}
      >
        <div style={{ fontSize: 32, marginBottom: 12 }}>{icon}</div>
        <h3 style={{ margin: 0, fontSize: 18, color: "#333" }}>{title}</h3>
        <p style={{ marginTop: 8, fontSize: 14, color: "#666", lineHeight: 1.6 }}>
          {description}
        </p>
      </div>
    </a>
  );
}
