import type { Metadata } from "next";
import Link from "next/link";
import { employeeMetadata } from "./metadata";

export const metadata: Metadata = {
  ...employeeMetadata,
  alternates: {
    canonical: "https://jangpyosa.com/employee",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

// JSON-LD 구조화된 데이터
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "장애인직원관리솔루션 - 장표사닷컴",
  applicationCategory: "BusinessApplication",
  description: "국내유일 무료 장애인고용관리 시스템. 장애인 직원 근태관리, 업무관리, 휴가관리를 한 곳에서!",
  url: "https://jangpyosa.com/employee",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "KRW"
  },
  provider: {
    "@type": "Organization",
    name: "장표사닷컴",
    url: "https://jangpyosa.com"
  },
  potentialAction: {
    "@type": "UseAction",
    target: "https://jangpyosa.com/employee/login"
  }
};

export default function EmployeePortalPage() {
  return (
    <>
      {/* JSON-LD 구조화된 데이터 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        padding: "60px 20px",
      }}>
      <div style={{
        maxWidth: "1200px",
        margin: "0 auto",
      }}>
        {/* SEO 숨김 텍스트 */}
        <div style={{ display: "none" }}>
          <h1>장애인직원관리솔루션 - 장표사닷컴</h1>
          <h2>국내유일 무료 장애인고용관리 시스템</h2>
          <p>장표사닷컴은 장애인 직원 근태관리, 재택근무 관리, 업무지시, 휴가관리를 한 곳에서 제공하는 무료 장애인직원관리솔루션입니다.</p>
          <p>장애인표준사업장, 장애인 의무고용기업을 위한 완벽한 장애인고용관리 시스템. 장애인 직원 출퇴근 체크, 근무시간 관리, 업무 배정, 휴가 신청이 가능합니다.</p>
          <p>재택근무 장애인직원의 근태를 실시간으로 관리하고, 업무지시 및 진행상황을 확인할 수 있습니다. 장애인고용 담당자와 장애인 직원 모두를 위한 맞춤형 관리솔루션입니다.</p>
          <h3>주요 기능</h3>
          <ul>
            <li>장애인 근태관리: 출퇴근 체크, 근무시간 기록, 위치 정보</li>
            <li>장애인 업무관리: 업무 배정, 진행상황 확인, 완료 처리</li>
            <li>장애인 휴가관리: 휴가 신청, 연차 조회, 증빙서류 제출</li>
            <li>재택근무 관리: 원격 근무 장애인직원 실시간 관리</li>
            <li>통계 및 리포트: 월별 근태 통계, 연차 현황 자동 생성</li>
          </ul>
          <h3>장표사닷컴 장애인직원관리솔루션의 장점</h3>
          <ul>
            <li>100% 무료: 장애인표준사업장과 의무고용기업에 완전 무료 제공</li>
            <li>모바일 최적화: 스마트폰으로 간편하게 근태 체크 가능</li>
            <li>접근성 강화: 장애인 직원을 위한 맞춤 UI/UX 디자인</li>
            <li>실시간 관리: 관리자가 직원 근무현황 실시간 확인</li>
            <li>보안 강화: 개인정보 보호 및 안전한 데이터 관리</li>
          </ul>
        </div>

        {/* 헤더 */}
        <header style={{
          textAlign: "center",
          marginBottom: "60px",
          color: "white",
        }}>
          <h2 style={{
            fontSize: "48px",
            fontWeight: "bold",
            marginBottom: "20px",
            textShadow: "2px 2px 4px rgba(0,0,0,0.2)",
          }}>
            ♿ 장애인직원관리솔루션
          </h2>
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
          <Link
            href="/employee/attendance"
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
          >
            <div style={{ fontSize: "48px", marginBottom: "15px" }}>📅</div>
            <h3 style={{
              fontSize: "24px",
              fontWeight: "bold",
              marginBottom: "10px",
              color: "#333",
            }}>
              근태관리
            </h3>
            <p style={{ color: "#666", fontSize: "16px" }}>
              출퇴근 체크, 근무시간 관리, 위치 기록
            </p>
          </Link>

          <Link
            href="/employee/work-orders"
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
          >
            <div style={{ fontSize: "48px", marginBottom: "15px" }}>📋</div>
            <h3 style={{
              fontSize: "24px",
              fontWeight: "bold",
              marginBottom: "10px",
              color: "#333",
            }}>
              업무지시
            </h3>
            <p style={{ color: "#666", fontSize: "16px" }}>
              업무 배정, 진행상황 확인, 완료 처리
            </p>
          </Link>

          <Link
            href="/employee/leave"
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
          >
            <div style={{ fontSize: "48px", marginBottom: "15px" }}>🏖️</div>
            <h3 style={{
              fontSize: "24px",
              fontWeight: "bold",
              marginBottom: "10px",
              color: "#333",
            }}>
              휴가관리
            </h3>
            <p style={{ color: "#666", fontSize: "16px" }}>
              휴가 신청, 연차 조회, 증빙서류 제출
            </p>
          </Link>
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
            체험용 계정으로 <Link href="/employee/signup" style={{ color: "white", textDecoration: "underline" }}>무료 회원가입</Link> 후 바로 사용!
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
                ✅ 100% 무료
              </h4>
              <p style={{ fontSize: "14px", color: "#666" }}>
                장애인표준사업장과 기업에 완전 무료 제공
              </p>
            </div>

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
                📱 모바일 최적화
              </h4>
              <p style={{ fontSize: "14px", color: "#666" }}>
                스마트폰으로 간편하게 근태 체크
              </p>
            </div>

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
                ♿ 접근성 강화
              </h4>
              <p style={{ fontSize: "14px", color: "#666" }}>
                장애인 직원을 위한 맞춤 UI/UX
              </p>
            </div>

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
                🏢 실시간 관리
              </h4>
              <p style={{ fontSize: "14px", color: "#666" }}>
                관리자가 직원 근무현황 실시간 확인
              </p>
            </div>

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
                📊 통계 리포트
              </h4>
              <p style={{ fontSize: "14px", color: "#666" }}>
                월별 근태 통계 및 연차 현황 자동 생성
              </p>
            </div>

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
                🔐 보안 강화
              </h4>
              <p style={{ fontSize: "14px", color: "#666" }}>
                개인정보 보호 및 안전한 데이터 관리
              </p>
            </div>
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
              <li style={{ color: "#333" }}>✓ 장애인표준사업장 운영자</li>
              <li style={{ color: "#333" }}>✓ 장애인 의무고용 기업</li>
              <li style={{ color: "#333" }}>✓ 재택근무 장애인직원 관리자</li>
              <li style={{ color: "#333" }}>✓ 장애인고용 담당자</li>
              <li style={{ color: "#333" }}>✓ 사회적기업 운영자</li>
              <li style={{ color: "#333" }}>✓ 장애인 직원 본인</li>
            </ul>
          </div>

          {/* SEO 키워드 텍스트 */}
          <div style={{
            marginTop: "30px",
            padding: "20px",
            background: "#fefce8",
            borderRadius: "8px",
            fontSize: "14px",
            lineHeight: "1.8",
            color: "#666",
          }}>
            <p style={{ marginBottom: "10px" }}>
              <strong>장표사닷컴 장애인직원관리솔루션</strong>은 장애인고용관리, 장애인근태관리, 장애인업무관리를 통합한 무료 장애인직원관리시스템입니다.
            </p>
            <p style={{ marginBottom: "10px" }}>
              재택근무 장애인 직원의 출퇴근 관리, 근무시간 관리, 업무 진행상황 관리가 가능하며, 장애인표준사업장과 장애인 의무고용 기업의 관리 효율을 높여드립니다.
            </p>
            <p style={{ marginBottom: "10px" }}>
              장애인직원 근무관리, 장애인 휴가관리, 장애인직원 출퇴근 체크 등 모든 기능을 100% 무료로 제공합니다. 
            </p>
            <p>
              장표사닷컴으로 장애인고용관리 업무를 효율적으로 처리하세요. 지금 바로 무료로 시작하실 수 있습니다!
            </p>
          </div>
          
          {/* 추가 SEO 섹션 */}
          <div style={{
            marginTop: "30px",
            padding: "20px",
            background: "white",
            borderRadius: "8px",
            fontSize: "14px",
            lineHeight: "1.8",
            color: "#333",
          }}>
            <h3 style={{
              fontSize: "18px",
              fontWeight: "bold",
              marginBottom: "15px",
            }}>
              💡 자주 묻는 질문
            </h3>
            <div style={{ marginBottom: "15px" }}>
              <p style={{ fontWeight: "bold", marginBottom: "5px" }}>Q. 장표사닷컴 장애인직원관리솔루션은 정말 무료인가요?</p>
              <p>네, 100% 무료입니다. 장애인표준사업장과 장애인 의무고용 기업, 모든 사회적기업에 완전 무료로 제공됩니다.</p>
            </div>
            <div style={{ marginBottom: "15px" }}>
              <p style={{ fontWeight: "bold", marginBottom: "5px" }}>Q. 재택근무 장애인직원도 관리할 수 있나요?</p>
              <p>네, 재택근무 장애인직원의 출퇴근 체크, 업무 배정, 진행상황 확인이 모두 가능합니다. 스마트폰으로 간편하게 근태를 체크할 수 있습니다.</p>
            </div>
            <div style={{ marginBottom: "15px" }}>
              <p style={{ fontWeight: "bold", marginBottom: "5px" }}>Q. 어떤 기능들이 포함되어 있나요?</p>
              <p>근태관리(출퇴근 체크, 근무시간), 업무관리(업무 배정, 진행상황 확인), 휴가관리(휴가 신청, 연차 조회), 통계 리포트 기능이 포함되어 있습니다.</p>
            </div>
            <div>
              <p style={{ fontWeight: "bold", marginBottom: "5px" }}>Q. 장애인 직원 본인도 사용할 수 있나요?</p>
              <p>네, 장애인 직원분들이 직접 로그인하여 출퇴근 체크, 업무 확인, 휴가 신청을 할 수 있습니다. 접근성을 강화한 UI/UX로 설계되었습니다.</p>
            </div>
          </div>
        </section>

        {/* 푸터 */}
        <footer style={{
          textAlign: "center",
          marginTop: "60px",
          color: "white",
          opacity: 0.9,
        }}>
          <div style={{
            marginBottom: "20px",
            padding: "20px",
            background: "rgba(255,255,255,0.1)",
            borderRadius: "10px",
          }}>
            <h4 style={{ marginBottom: "10px", fontSize: "16px" }}>🔗 관련 서비스</h4>
            <p style={{ fontSize: "14px", lineHeight: "1.8" }}>
              <Link href="/calculators/levy" style={{ color: "white", marginRight: "15px" }}>고용부담금 계산</Link> | 
              <Link href="/calculators/incentive" style={{ color: "white", margin: "0 15px" }}>고용장려금 계산</Link> | 
              <Link href="/dashboard" style={{ color: "white", margin: "0 15px" }}>기업 대시보드</Link>
            </p>
          </div>
          
          <p style={{ fontSize: "14px", marginBottom: "10px" }}>
            © 2026 <strong>장표사닷컴</strong> | 국내유일 무료 장애인고용관리 전문 플랫폼
          </p>
          <p style={{ fontSize: "13px", marginBottom: "10px" }}>
            장애인직원관리솔루션 · 장애인고용관리 · 장애인근태관리 · 재택근무관리
          </p>
          <p style={{ fontSize: "12px" }}>
            <Link href="/" style={{ color: "white", marginRight: "20px" }}>홈</Link>
            <Link href="/login" style={{ color: "white", marginRight: "20px" }}>기업 로그인</Link>
            <Link href="/employee/login" style={{ color: "white", marginRight: "20px" }}>직원 로그인</Link>
            <Link href="/employee/signup" style={{ color: "white" }}>직원 회원가입</Link>
          </p>
        </footer>
      </div>
    </div>
    </>
  );
}
