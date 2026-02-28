"use client";

// JSON-LD 구조화된 데이터
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "장표사닷컴",
  alternateName: "장애인표준사업장 연계고용 플랫폼",
  url: "https://jangpyosa.com",
  description: "장애인표준사업장 연계고용으로 고용부담금 50~90% 감면. 고용부담금계산기, 고용장려금계산기, 장애인직원관리솔루션 무료 제공",
  publisher: {
    "@type": "Organization",
    name: "장표사닷컴",
    url: "https://jangpyosa.com",
    logo: {
      "@type": "ImageObject",
      url: "https://jangpyosa.com/logo.png"
    }
  },
  potentialAction: {
    "@type": "SearchAction",
    target: "https://jangpyosa.com/catalog?search={search_term_string}",
    "query-input": "required name=search_term_string"
  }
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "장표사닷컴",
  alternateName: "장애인표준사업장 연계고용감면 플랫폼",
  url: "https://jangpyosa.com",
  logo: "https://jangpyosa.com/logo.png",
  description: "국내 최대 장애인표준사업장 연계고용 플랫폼. 고용부담금 50~90% 감면 도급계약 중개 서비스 및 장애인직원관리솔루션 제공",
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "Customer Service",
    availableLanguage: ["Korean"]
  },
  sameAs: [
    "https://jangpyosa.com"
  ]
};

const serviceJsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "장애인표준사업장 연계고용 서비스",
    provider: {
      "@type": "Organization",
      name: "장표사닷컴"
    },
    serviceType: "고용부담금감면 도급계약 중개",
    areaServed: "KR",
    description: "장애인표준사업장과의 도급계약을 통해 고용부담금을 50~90% 감면하는 연계고용 서비스",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "KRW"
    }
  },
  {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "장애인직원관리솔루션",
    applicationCategory: "BusinessApplication",
    provider: {
      "@type": "Organization",
      name: "장표사닷컴"
    },
    description: "장애인 직원 근태관리, 업무관리, 휴가관리를 위한 무료 관리 솔루션",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "KRW"
    }
  }
];

export default function HomePage() {
  return (
    <>
      {/* JSON-LD 구조화된 데이터 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }}
      />
      
      {/* SEO 숨김 텍스트 */}
      <div style={{ display: "none" }}>
        <h1>장표사닷컴 - 고용부담금감면 및 장애인직원관리솔루션</h1>
        <h2>파트1: 의무고용 고용부담금 연계고용감면</h2>
        <p>장표사닷컴은 장애인표준사업장과의 연계고용(도급계약)을 통해 고용부담금을 최대 90%까지 감면할 수 있는 국내 최대 플랫폼입니다.</p>
        <p>873개의 장애인표준사업장이 제공하는 다양한 상품과 서비스를 통해 도급계약을 체결하고, 장애인 의무고용률을 충족하며 고용부담금을 대폭 절감하세요.</p>
        <h3>고용부담금감면 서비스</h3>
        <ul>
          <li>고용부담금계산기: 연간 고용부담금을 정확하게 계산</li>
          <li>고용장려금계산기: 의무고용률 초과 시 받을 수 있는 장려금 계산</li>
          <li>고용연계감면계산기: 도급계약 금액별 부담금 감면액 확인</li>
          <li>표준사업장계산기: 표준사업장 전환 시 받을 수 있는 혜택 계산</li>
          <li>도급계약 카탈로그: 873개 표준사업장의 상품과 서비스 검색</li>
        </ul>
        <h3>연계고용 부담금 감면제도</h3>
        <p>장애인표준사업장 등과 도급계약을 체결하여 납품받는 경우, 해당 사업장에서 종사한 장애인을 고용한 것으로 간주하여 고용부담금을 감면하는 제도입니다.</p>
        <ul>
          <li>감면 한도: 부담금의 최대 90% 이내</li>
          <li>상한: 해당 연도 도급액의 50%를 초과할 수 없음</li>
        </ul>
        
        <h2>파트2: 장애인직원관리솔루션</h2>
        <p>장표사닷컴은 장애인 직원 근태관리, 재택근무 관리, 업무지시, 휴가관리를 한 곳에서 제공하는 무료 장애인직원관리솔루션을 제공합니다.</p>
        <h3>장애인직원관리 주요 기능</h3>
        <ul>
          <li>근태관리: 장애인 직원 출퇴근 체크, 근무시간 기록, 위치 정보</li>
          <li>업무관리: 장애인 직원 업무 배정, 진행상황 확인, 완료 처리</li>
          <li>휴가관리: 장애인 직원 휴가 신청, 연차 조회, 증빙서류 제출</li>
          <li>재택근무 관리: 원격 근무 장애인직원 실시간 관리</li>
          <li>통계 및 리포트: 월별 근태 통계, 연차 현황 자동 생성</li>
        </ul>
        <h3>장애인직원관리솔루션의 장점</h3>
        <ul>
          <li>100% 무료: 장애인표준사업장과 의무고용기업에 완전 무료 제공</li>
          <li>모바일 최적화: 스마트폰으로 간편하게 근태 체크</li>
          <li>접근성 강화: 장애인 직원을 위한 맞춤 UI/UX</li>
          <li>실시간 관리: 관리자가 직원 근무현황 실시간 확인</li>
          <li>보안 강화: 개인정보 보호 및 안전한 데이터 관리</li>
        </ul>
      </div>
      
      <div className="container">
        <div className="card">
          <h1>🏢 장표사닷컴</h1>
          <p style={{ marginTop: 16, fontSize: 18, fontWeight: 500 }}>
            장애인고용 통합 플랫폼
          </p>
          <p style={{ marginTop: 8, color: "#666", fontSize: 16 }}>
            고용부담금감면 · 연계고용 · 장애인직원관리솔루션
          </p>

          {/* 파트 1: 장애인직원관리솔루션 */}
          <div style={{ marginTop: 40 }}>
            <div style={{ 
              background: "rgba(59, 130, 246, 0.1)",
              padding: "40px", 
              borderRadius: "16px",
              border: "1px solid rgba(59, 130, 246, 0.2)",
              boxShadow: "0 8px 16px rgba(59, 130, 246, 0.15)",
              marginBottom: "30px"
            }}>
              <h2 style={{ margin: 0, fontSize: "36px", fontWeight: "bold", color: "#1e40af" }}>
                ♿ 파트1: 장애인직원관리솔루션
              </h2>
              <p style={{ marginTop: 16, fontSize: "21px", lineHeight: 1.7, color: "#1e3a8a" }}>
                장애인 직원 근태·업무·휴가를 한 곳에서! <strong style={{ color: "#059669" }}>100% 무료</strong>
              </p>
            </div>
            
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
              <ServiceCard
                icon="📅"
                title="장애인 근태관리"
                description="장애인 직원 출퇴근 체크, 근무시간 관리, 재택근무 위치 기록"
                href="/employee/attendance"
              />
              <ServiceCard
                icon="📋"
                title="장애인 업무관리"
                description="장애인 직원 업무 배정, 진행상황 확인, 완료 처리 및 피드백"
                href="/employee/work-orders"
              />
              <ServiceCard
                icon="🏖️"
                title="장애인 휴가관리"
                description="장애인 직원 휴가 신청, 연차 조회, 증빙서류 제출 및 승인"
                href="/employee/leave"
              />
            </div>

            <div style={{ marginTop: 30, padding: 26, background: "#d1ecf1", borderRadius: 12, border: "1px solid #bee5eb" }}>
              <h3 style={{ margin: 0, fontSize: "23px", color: "#0c5460" }}>✨ 장애인직원관리솔루션 특징</h3>
              <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
                <div style={{ padding: 10, background: "rgba(255,255,255,0.6)", borderRadius: 6 }}>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: "bold", color: "#0c5460" }}>✓ 100% 무료</p>
                  <p style={{ margin: "4px 0 0 0", fontSize: 13, color: "#0c5460" }}>장애인표준사업장·의무고용기업 무료</p>
                </div>
                <div style={{ padding: 10, background: "rgba(255,255,255,0.6)", borderRadius: 6 }}>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: "bold", color: "#0c5460" }}>✓ 모바일 최적화</p>
                  <p style={{ margin: "4px 0 0 0", fontSize: 13, color: "#0c5460" }}>스마트폰으로 간편하게 근태 체크</p>
                </div>
                <div style={{ padding: 10, background: "rgba(255,255,255,0.6)", borderRadius: 6 }}>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: "bold", color: "#0c5460" }}>✓ 접근성 강화</p>
                  <p style={{ margin: "4px 0 0 0", fontSize: 13, color: "#0c5460" }}>장애인 직원을 위한 맞춤 UI/UX</p>
                </div>
                <div style={{ padding: 10, background: "rgba(255,255,255,0.6)", borderRadius: 6 }}>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: "bold", color: "#0c5460" }}>✓ 실시간 관리</p>
                  <p style={{ margin: "4px 0 0 0", fontSize: 13, color: "#0c5460" }}>관리자가 직원 근무현황 실시간 확인</p>
                </div>
              </div>
            </div>
          </div>

          {/* 파트 2: 의무고용 고용부담금 연계고용감면 */}
          <div style={{ marginTop: 50 }}>
            <div style={{ 
              background: "rgba(59, 130, 246, 0.1)",
              padding: "40px", 
              borderRadius: "16px",
              border: "1px solid rgba(59, 130, 246, 0.2)",
              boxShadow: "0 8px 16px rgba(59, 130, 246, 0.15)",
              marginBottom: "30px"
            }}>
              <h2 style={{ margin: 0, fontSize: "36px", fontWeight: "bold", color: "#1e40af" }}>
                💰 파트2: 의무고용 고용부담금 연계고용감면
              </h2>
              <p style={{ marginTop: 16, fontSize: "21px", lineHeight: 1.7, color: "#1e3a8a" }}>
                장애인표준사업장 연계고용으로 <strong style={{ color: "#dc2626" }}>고용부담금 50~90% 감면</strong>
              </p>
            </div>
            
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
              <ServiceCard
                icon="💰"
                title="고용부담금계산기"
                description="장애인 의무고용률 미달 시 납부하는 연간 고용부담금을 정확히 계산하세요"
                href="/calculators/levy-annual"
              />
              <ServiceCard
                icon="💸"
                title="고용장려금계산기"
                description="장애인 의무고용률 초과 고용 시 받을 수 있는 고용장려금을 계산하세요"
                href="/calculators/incentive-annual"
              />
              <ServiceCard
                icon="📉"
                title="고용연계감면계산기"
                description="장애인표준사업장과 도급계약 시 고용부담금 감면액을 확인하세요"
                href="/calculators/linkage"
              />
              <ServiceCard
                icon="🛒"
                title="도급계약 표준사업장"
                description="873개 장애인표준사업장의 상품·서비스를 검색하고 도급계약을 의뢰하세요"
                href="/catalog"
              />
            </div>

            <div style={{ marginTop: 30, padding: 26, background: "#fff3cd", borderRadius: 12, border: "1px solid #ffc107" }}>
              <h3 style={{ margin: 0, fontSize: "23px", color: "#856404" }}>📢 연계고용 부담금 감면제도</h3>
              <p style={{ marginTop: 16, lineHeight: 1.7, fontSize: "20px", color: "#856404" }}>
                장애인표준사업장 등과 <strong>도급계약을 체결</strong>해 납품받는 경우,
                해당 사업장에서 종사한 장애인을 <strong>고용한 것으로 간주</strong>해 부담금을 감면하는 제도입니다.
              </p>
              <div style={{ marginTop: 16, padding: 14, background: "rgba(255,255,255,0.5)", borderRadius: 8 }}>
                <p style={{ margin: 0, fontSize: "18px", fontWeight: "bold", color: "#856404" }}>
                  ✓ 감면 총액: 부담금의 <span style={{ color: "#dc3545" }}>90% 이내</span>
                </p>
                <p style={{ margin: "8px 0 0 0", fontSize: "18px", fontWeight: "bold", color: "#856404" }}>
                  ✓ 상한: 해당 연도 도급액의 <span style={{ color: "#dc3545" }}>50%</span>를 초과할 수 없음
                </p>
              </div>
            </div>
          </div>

          {/* CTA 섹션 */}
          <div style={{ marginTop: 50, textAlign: "center", padding: 40, background: "#f8f9fa", borderRadius: 16 }}>
            <h3 style={{ margin: 0, fontSize: "31px", fontWeight: "bold" }}>🚀 지금 바로 시작하세요</h3>
            <p style={{ marginTop: 16, color: "#666", fontSize: "21px" }}>
              왼쪽 사이드바에서 원하는 메뉴를 선택하거나 아래 버튼을 클릭하세요
            </p>
            <div style={{ marginTop: 20, display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <a href="/signup">
                <button style={{ 
                  background: "#667eea", 
                  color: "white",
                  padding: "14px 30px",
                  fontSize: "16px",
                  fontWeight: "bold",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  transition: "all 0.3s"
                }}>
                  기업 회원가입
                </button>
              </a>
              <a href="/login">
                <button style={{ 
                  background: "#28a745", 
                  color: "white",
                  padding: "14px 30px",
                  fontSize: "16px",
                  fontWeight: "bold",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  transition: "all 0.3s"
                }}>
                  기업 로그인
                </button>
              </a>
              <a href="/employee/signup">
                <button style={{ 
                  background: "#11998e", 
                  color: "white",
                  padding: "14px 30px",
                  fontSize: "16px",
                  fontWeight: "bold",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  transition: "all 0.3s"
                }}>
                  장애인직원 회원가입
                </button>
              </a>
            </div>
          </div>

          {/* SEO 컨텐츠 섹션 */}
          <div style={{ marginTop: 50, padding: 40, background: "white", borderRadius: 16, border: "1px solid #e0e0e0" }}>
            <h3 style={{ margin: 0, fontSize: "26px", fontWeight: "bold", color: "#333" }}>
              💡 자주 묻는 질문
            </h3>
            
            <div style={{ marginTop: 26 }}>
              <div style={{ marginBottom: 26 }}>
                <h4 style={{ margin: 0, fontSize: "21px", fontWeight: "bold", color: "#667eea" }}>
                  Q. 연계고용 부담금 감면은 어떻게 받나요?
                </h4>
                <p style={{ marginTop: 10, fontSize: "18px", lineHeight: 1.7, color: "#666" }}>
                  장애인표준사업장과 도급계약을 체결하고, 해당 계약 내역을 관할 고용노동부에 신고하면 고용부담금을 최대 90%까지 감면받을 수 있습니다.
                  장표사닷컴의 계산기로 미리 감면액을 확인하세요.
                </p>
              </div>

              <div style={{ marginBottom: 26 }}>
                <h4 style={{ margin: 0, fontSize: "21px", fontWeight: "bold", color: "#667eea" }}>
                  Q. 고용부담금은 얼마나 내야 하나요?
                </h4>
                <p style={{ marginTop: 10, fontSize: "18px", lineHeight: 1.7, color: "#666" }}>
                  상시근로자 50인 이상 기업은 장애인 의무고용률(3.1%)을 충족해야 합니다. 미달 시 월 평균임금 × 미달인원만큼 고용부담금을 납부해야 합니다.
                  장표사닷컴의 고용부담금계산기로 정확한 금액을 확인하세요.
                </p>
              </div>

              <div style={{ marginBottom: 26 }}>
                <h4 style={{ margin: 0, fontSize: "21px", fontWeight: "bold", color: "#11998e" }}>
                  Q. 장애인직원관리솔루션은 정말 무료인가요?
                </h4>
                <p style={{ marginTop: 10, fontSize: "18px", lineHeight: 1.7, color: "#666" }}>
                  네, 100% 무료입니다. 장애인표준사업장, 장애인 의무고용 기업, 모든 사회적기업에 완전 무료로 제공됩니다.
                  근태관리, 업무관리, 휴가관리 모든 기능을 무료로 사용하실 수 있습니다.
                </p>
              </div>

              <div>
                <h4 style={{ margin: 0, fontSize: "21px", fontWeight: "bold", color: "#11998e" }}>
                  Q. 재택근무 장애인직원도 관리할 수 있나요?
                </h4>
                <p style={{ marginTop: 10, fontSize: "18px", lineHeight: 1.7, color: "#666" }}>
                  네, 재택근무 장애인직원의 출퇴근 체크, 업무 배정, 진행상황 확인이 모두 가능합니다.
                  스마트폰으로 간편하게 근태를 체크하고, 관리자는 실시간으로 현황을 확인할 수 있습니다.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
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
        <h3 style={{ margin: 0, fontSize: "23px", color: "#333" }}>{title}</h3>
        <p style={{ marginTop: 10, fontSize: "18px", color: "#666", lineHeight: 1.6 }}>
          {description}
        </p>
      </div>
    </a>
  );
}
