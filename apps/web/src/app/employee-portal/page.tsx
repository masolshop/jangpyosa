import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "장애인직원관리솔루션 - 장표사닷컴 | 무료 장애인고용관리",
  description: "국내유일 무료 장애인직원고용관리솔루션! 장애인직원용 재택근무 근태관리, 업무관리, 휴가관리. 장애인 직원 출퇴근 체크, 업무지시, 휴가신청을 간편하게! 장애인표준사업장과 기업을 위한 완벽한 장애인고용관리 시스템.",
  keywords: [
    "장애인직원관리솔루션",
    "장애인고용관리",
    "장애인직원관리",
    "장애인근태관리",
    "장애인출퇴근관리",
    "장애인업무관리",
    "장애인휴가관리",
    "장애인재택근무",
    "장애인표준사업장관리",
    "장애인직원솔루션",
    "무료장애인관리",
    "장애인고용솔루션",
    "장표사닷컴",
    "장애인직원출퇴근",
    "장애인직원근무관리"
  ],
  authors: [{ name: "장표사닷컴" }],
  creator: "장표사닷컴",
  publisher: "장표사닷컴",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "장애인직원관리솔루션 - 장표사닷컴",
    description: "국내유일 무료 장애인직원고용관리솔루션! 재택근무 근태관리, 업무관리, 휴가관리를 간편하게!",
    url: "https://jangpyosa.com/employee",
    siteName: "장표사닷컴",
    locale: "ko_KR",
    type: "website",
    images: [
      {
        url: "https://jangpyosa.com/images/employee-thumbnail.jpg",
        width: 800,
        height: 400,
        alt: "장표사닷컴 장애인직원관리솔루션",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "장애인직원관리솔루션 - 장표사닷컴",
    description: "국내유일 무료 장애인직원고용관리솔루션! 재택근무 근태관리, 업무관리, 휴가관리!",
    images: ["https://jangpyosa.com/images/employee-thumbnail.jpg"],
  },
  alternates: {
    canonical: "https://jangpyosa.com/employee",
  },
  other: {
    "google-site-verification": "google-site-verification-code",
  },
};

export default function EmployeePortalPage() {
  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      padding: "60px 20px",
    }}>
      <div style={{
        maxWidth: "1200px",
        margin: "0 auto",
      }}>
        {/* 헤더 */}
        <header style={{
          textAlign: "center",
          marginBottom: "60px",
          color: "white",
        }}>
          <h1 style={{
            fontSize: "48px",
            fontWeight: "bold",
            marginBottom: "20px",
            textShadow: "2px 2px 4px rgba(0,0,0,0.2)",
          }}>
            ♿ 장애인직원관리솔루션
          </h1>
          <p style={{
            fontSize: "24px",
            marginBottom: "10px",
            opacity: 0.95,
          }}>
            국내유일 <strong>무료</strong> 장애인고용관리 시스템
          </p>
          <p style={{
            fontSize: "18px",
            opacity: 0.9,
          }}>
            재택근무 근태관리 · 업무지시 · 휴가관리를 한 곳에서!
          </p>
        </header>

        {/* 주요 기능 카드 */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "30px",
          marginBottom: "60px",
        }}>
          <FeatureCard
            icon="📅"
            title="근태관리"
            description="출퇴근 체크, 근무시간 관리, 위치 기록"
            link="/employee/attendance"
          />
          <FeatureCard
            icon="📋"
            title="업무지시"
            description="업무 배정, 진행상황 확인, 완료 처리"
            link="/employee/work-orders"
          />
          <FeatureCard
            icon="🏖️"
            title="휴가관리"
            description="휴가 신청, 연차 조회, 증빙서류 제출"
            link="/employee/leave"
          />
        </div>

        {/* CTA 버튼 */}
        <div style={{
          textAlign: "center",
          marginBottom: "60px",
        }}>
          <Link
            href="/employee/login"
            style={{
              display: "inline-block",
              padding: "20px 50px",
              fontSize: "20px",
              fontWeight: "bold",
              background: "white",
              color: "#667eea",
              borderRadius: "50px",
              textDecoration: "none",
              boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
              transition: "all 0.3s",
            }}
          >
            🚀 지금 시작하기
          </Link>
          <p style={{
            marginTop: "20px",
            color: "white",
            fontSize: "14px",
            opacity: 0.9,
          }}>
            회원가입 없이 <Link href="/employee/signup" style={{ color: "white", textDecoration: "underline" }}>체험용 계정</Link>으로 바로 사용 가능!
          </p>
        </div>

        {/* SEO 키워드 섹션 */}
        <section style={{
          background: "rgba(255,255,255,0.95)",
          borderRadius: "20px",
          padding: "40px",
          boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
        }}>
          <h2 style={{
            fontSize: "32px",
            fontWeight: "bold",
            marginBottom: "30px",
            color: "#333",
            textAlign: "center",
          }}>
            왜 장표사닷컴 장애인직원관리솔루션인가?
          </h2>
          
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "20px",
            marginBottom: "30px",
          }}>
            <BenefitItem
              title="✅ 100% 무료"
              description="장애인표준사업장과 기업에 완전 무료 제공"
            />
            <BenefitItem
              title="📱 모바일 최적화"
              description="스마트폰으로 간편하게 근태 체크"
            />
            <BenefitItem
              title="♿ 접근성 강화"
              description="장애인 직원을 위한 맞춤 UI/UX"
            />
            <BenefitItem
              title="🏢 실시간 관리"
              description="관리자가 직원 근무현황 실시간 확인"
            />
            <BenefitItem
              title="📊 통계 리포트"
              description="월별 근태 통계 및 연차 현황 자동 생성"
            />
            <BenefitItem
              title="🔐 보안 강화"
              description="개인정보 보호 및 안전한 데이터 관리"
            />
          </div>

          <div style={{
            background: "#f3f4f6",
            padding: "30px",
            borderRadius: "10px",
            marginTop: "30px",
          }}>
            <h3 style={{
              fontSize: "20px",
              fontWeight: "bold",
              marginBottom: "15px",
              color: "#333",
            }}>
              🎯 이런 분들께 추천합니다
            </h3>
            <ul style={{
              listStyle: "none",
              padding: 0,
              margin: 0,
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "10px",
            }}>
              <li>✓ 장애인표준사업장 운영자</li>
              <li>✓ 장애인 의무고용 기업</li>
              <li>✓ 재택근무 장애인직원 관리자</li>
              <li>✓ 장애인고용 담당자</li>
              <li>✓ 사회적기업 운영자</li>
              <li>✓ 장애인 직원 본인</li>
            </ul>
          </div>
        </section>

        {/* 푸터 */}
        <footer style={{
          textAlign: "center",
          marginTop: "60px",
          color: "white",
          opacity: 0.9,
        }}>
          <p style={{ fontSize: "14px", marginBottom: "10px" }}>
            © 2026 장표사닷컴 | 장애인고용관리 전문 플랫폼
          </p>
          <p style={{ fontSize: "12px" }}>
            <Link href="/" style={{ color: "white", marginRight: "20px" }}>홈</Link>
            <Link href="/login" style={{ color: "white", marginRight: "20px" }}>기업 로그인</Link>
            <Link href="/employee/login" style={{ color: "white" }}>직원 로그인</Link>
          </p>
        </footer>
      </div>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  link,
}: {
  icon: string;
  title: string;
  description: string;
  link: string;
}) {
  return (
    <Link
      href={link}
      style={{
        display: "block",
        background: "white",
        borderRadius: "15px",
        padding: "30px",
        textDecoration: "none",
        color: "inherit",
        boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
        transition: "transform 0.3s, box-shadow 0.3s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-5px)";
        e.currentTarget.style.boxShadow = "0 15px 40px rgba(0,0,0,0.15)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 10px 30px rgba(0,0,0,0.1)";
      }}
    >
      <div style={{ fontSize: "48px", marginBottom: "15px" }}>{icon}</div>
      <h3 style={{
        fontSize: "24px",
        fontWeight: "bold",
        marginBottom: "10px",
        color: "#333",
      }}>
        {title}
      </h3>
      <p style={{ color: "#666", fontSize: "16px" }}>{description}</p>
    </Link>
  );
}

function BenefitItem({ title, description }: { title: string; description: string }) {
  return (
    <div style={{
      padding: "15px",
      background: "#f9fafb",
      borderRadius: "8px",
    }}>
      <h4 style={{
        fontSize: "16px",
        fontWeight: "bold",
        marginBottom: "5px",
        color: "#333",
      }}>
        {title}
      </h4>
      <p style={{ fontSize: "14px", color: "#666" }}>{description}</p>
    </div>
  );
}
