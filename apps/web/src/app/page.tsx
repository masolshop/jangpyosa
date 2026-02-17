export default function HomePage() {
  return (
    <div className="container">
      <div className="card">
        <h1>🏢 장표사닷컴</h1>
        <p style={{ marginTop: 16, fontSize: 18 }}>
          장애인표준사업장 연계고용 플랫폼
        </p>
        <p style={{ marginTop: 8, color: "#666" }}>
          장애인 미고용 부담금 절감을 위한 도급계약 쇼핑몰
        </p>

        <div style={{ marginTop: 32, display: "flex", gap: 12, flexWrap: "wrap" }}>
          <a href="/login">
            <button>로그인</button>
          </a>
          <a href="/signup">
            <button style={{ background: "#28a745" }}>회원가입</button>
          </a>
          <a href="/catalog">
            <button style={{ background: "#6c757d" }}>상품 둘러보기</button>
          </a>
        </div>

        <div style={{ marginTop: 40 }}>
          <h2 style={{ marginBottom: 16 }}>📊 주요 기능</h2>
          <ul style={{ lineHeight: 2 }}>
            <li>
              <a href="/calculators/levy">💰 장애인고용부담금 계산기</a>
            </li>
            <li>
              <a href="/calculators/linkage">📉 연계고용 감면 계산기</a>
            </li>
            <li>
              <a href="/catalog">🛒 연계고용 도급계약 쇼핑몰 (830개 업체)</a>
            </li>
            <li>
              <a href="/content/establishment">📄 장애인표준사업장 설립</a>
            </li>
            <li>
              <a href="/content/linkage">📄 장애인표준사업장 연계사업</a>
            </li>
            <li>
              <a href="/content/health-voucher">📄 연계사업_헬스바우처</a>
            </li>
          </ul>
        </div>

        <div style={{ marginTop: 40, padding: 16, background: "#f8f9fa", borderRadius: 4 }}>
          <h3>📢 제도 안내</h3>
          <p style={{ marginTop: 8, lineHeight: 1.6 }}>
            연계고용 부담금 감면제도는 장애인표준사업장 등과 도급계약을 체결해 납품받는 경우,
            해당 사업장에서 종사한 장애인을 고용한 것으로 간주해 부담금을 감면하는 제도입니다.
          </p>
          <p style={{ marginTop: 8, fontWeight: "bold" }}>
            ✓ 감면 총액: 부담금의 90% 이내
            <br />
            ✓ 상한: 해당 연도 도급액의 50%를 초과할 수 없음
          </p>
        </div>
      </div>
    </div>
  );
}
