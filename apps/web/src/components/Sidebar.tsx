"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { clearToken, getUserRole } from "@/lib/auth";

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState<string | null>(null);

  useEffect(() => {
    setUserRole(getUserRole());
    
    // 로그인한 사용자 정보 가져오기
    if (typeof window !== "undefined") {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          setUserName(user.name || null);
          // 기업 로그인: company.name, 직원 로그인: companyName
          setCompanyName(user.company?.name || user.companyName || null);
        } catch (e) {
          console.error("사용자 정보 파싱 실패:", e);
        }
      }
    }
    
    // 페이지 로드 시 사이드바를 맨 위로 스크롤
    const sidebar = document.querySelector('aside');
    if (sidebar) {
      sidebar.scrollTop = 0;
    }
  }, [pathname]);

  const handleLogout = () => {
    clearToken();
    // 사용자 정보도 삭제
    if (typeof window !== "undefined") {
      localStorage.removeItem("user");
    }
    // 상태 즉시 초기화
    setUserRole(null);
    setUserName(null);
    setCompanyName(null);
    // 홈으로 리다이렉트 (새로고침)
    window.location.href = "/";
  };

  const isActive = (path: string) => pathname === path;

  return (
    <>
      {/* 모바일 토글 버튼 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: "fixed",
          top: 16,
          left: isOpen ? 350 : 16,
          zIndex: 1001,
          background: "#0070f3",
          color: "white",
          border: "none",
          padding: "8px 12px",
          borderRadius: 4,
          cursor: "pointer",
          transition: "left 0.3s ease",
        }}
      >
        {isOpen ? "◀" : "☰"}
      </button>

      {/* 사이드바 */}
      <aside
        style={{
          position: "fixed",
          top: 0,
          left: isOpen ? 0 : -350,
          width: 330,
          height: "100vh",
          background: "#0f3a5f",
          color: "white",
          padding: "20px",
          transition: "left 0.3s ease",
          zIndex: 1000,
          overflowY: "auto",
        }}
      >
        {/* 로고 - 홈으로 이동 */}
        <a 
          href="/" 
          style={{ 
            display: "block",
            marginBottom: 16, 
            marginTop: 32,
            textDecoration: "none",
            color: "white",
            cursor: "pointer",
            transition: "all 0.2s",
            textAlign: "center"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = "0.8";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = "1";
          }}
        >
          <h2 style={{ margin: 0, fontSize: 28.8 }}>🏢 장표사닷컴</h2>
          <p style={{ margin: "4px 0 0 0", fontSize: 17.28, color: "#999", lineHeight: 1.4 }}>
            장애인표준사업장<br />
            연계고용플랫폼
          </p>
        </a>

        {/* 로그인 사용자 정보 */}
        {(userName || companyName) && (
          <div style={{
            marginBottom: 24,
            padding: "12px 16px",
            background: "rgba(0, 112, 243, 0.1)",
            border: "1px solid rgba(0, 112, 243, 0.3)",
            borderRadius: 8,
            textAlign: "center"
          }}>
            {companyName && (
              <div style={{
                fontSize: 16,
                fontWeight: 600,
                color: "#0070f3",
                marginBottom: 4
              }}>
                {companyName}
              </div>
            )}
            {userName && (
              <div style={{
                fontSize: 14,
                color: "#999"
              }}>
                {userName}
              </div>
            )}
          </div>
        )}

        {/* 메인 메뉴 */}
        <nav>
          {/* 기업장애인고용관리_실무자용 */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 20.6, color: "#fff", marginBottom: 12, fontWeight: "bold" }}>
              기업장애인고용관리_실무자용
            </div>
            <MenuItem
              href="/dashboard/company"
              label="기업 대시보드"
              icon="🏢"
              active={isActive("/dashboard/company")}
              requiresRole={["BUYER", "SUPPLIER", "SUPER_ADMIN"]}
              currentRole={userRole}
            />
            <MenuItem
              href="/dashboard/employees"
              label="장애인 직원 등록·관리"
              icon="👥"
              active={isActive("/dashboard/employees")}
              requiresRole={["BUYER", "SUPPLIER", "SUPER_ADMIN"]}
              currentRole={userRole}
            />
            <MenuItem
              href="/dashboard/monthly"
              label="월별 고용장려금부담금 관리"
              icon="📅"
              active={isActive("/dashboard/monthly")}
              requiresRole={["BUYER", "SUPPLIER", "SUPER_ADMIN"]}
              currentRole={userRole}
            />
            <MenuItem
              href="/dashboard/attendance"
              label="장애인직원근태관리"
              icon="⏰"
              active={isActive("/dashboard/attendance")}
              requiresRole={["BUYER", "SUPPLIER", "SUPER_ADMIN"]}
              currentRole={userRole}
            />
            <MenuItem
              href="/dashboard/announcements"
              label="회사공지업무방"
              icon="📢"
              active={isActive("/dashboard/announcements")}
              requiresRole={["BUYER", "SUPPLIER", "SUPER_ADMIN"]}
              currentRole={userRole}
            />
            <MenuItem
              href="/dashboard/leave"
              label="장애인직원휴가관리"
              icon="🏖️"
              active={isActive("/dashboard/leave")}
              requiresRole={["BUYER", "SUPPLIER", "SUPER_ADMIN"]}
              currentRole={userRole}
            />
          </div>

          {/* 직원용 메뉴 (EMPLOYEE 역할인 경우) */}
          {userRole === "EMPLOYEE" && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 20.6, color: "#fff", marginBottom: 12, fontWeight: "bold" }}>
                직원 메뉴
              </div>
              <MenuItem
                href="/employee/attendance"
                label="출퇴근 관리"
                icon="⏰"
                active={isActive("/employee/attendance")}
              />
            </div>
          )}

          {/* 고용계산기 */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 20.6, color: "#fff", marginBottom: 12, fontWeight: "bold" }}>
              고용계산기
            </div>
            <MenuItem
              href="/calculators/incentive-annual"
              label="고용장려금계산기"
              icon="💸"
              active={isActive("/calculators/incentive-annual")}
            />
            <MenuItem
              href="/calculators/levy-annual"
              label="고용부담금계산기"
              icon="💰"
              active={isActive("/calculators/levy-annual") || isActive("/calculators/levy")}
              subItems={[
                { href: "/calculators/levy", label: "간단부담금계산" },
                { href: "/calculators/levy-annual", label: "월별부담금계산" },
              ]}
            />
            <MenuItem
              href="/calculators/linkage"
              label="고용연계감면계산기"
              icon="📉"
              active={isActive("/calculators/linkage")}
            />
            <MenuItem
              href="/calculators/standard-benefit"
              label="표준사업장혜택계산기"
              icon="🎁"
              active={isActive("/calculators/standard-benefit")}
            />
          </div>

          {/* 연계고용도급계약센터 */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 20.6, color: "#fff", marginBottom: 12, fontWeight: "bold" }}>
              연계고용도급계약센터
            </div>
            {userRole === "SUPPLIER" && (
              <MenuItem
                href="/products/manage"
                label="연계고용감면상품관리"
                icon="🏭"
                active={isActive("/products/manage") || isActive("/supplier/profile")}
              />
            )}
            <MenuItem
              href="/catalog"
              label="상품 카탈로그"
              icon="🛒"
              active={pathname?.startsWith("/catalog")}
            />
            {userRole === "BUYER" && (
              <MenuItem
                href="/cart"
                label="도급계약장바구니"
                icon="🛍️"
                active={isActive("/cart")}
              />
            )}
            <MenuItem
              href="/dashboard/contracts"
              label="도급계약 이행·결제 관리"
              icon="📋"
              active={pathname?.startsWith("/dashboard/contracts")}
              requiresRole={["BUYER", "SUPER_ADMIN", "SUPPLIER"]}
              currentRole={userRole}
            />
            <MenuItem
              href="/dashboard/performances"
              label="월별 도급계약감면관리"
              icon="📊"
              active={pathname?.startsWith("/dashboard/performances")}
              requiresRole={["BUYER", "SUPER_ADMIN", "SUPPLIER"]}
              currentRole={userRole}
            />
            <MenuItem
              href="/purchase-cases"
              label="장애인표준사업장생산품 구매 사례"
              icon="📦"
              active={isActive("/purchase-cases")}
            />
            <MenuItem
              href="/contract-sample"
              label="표준도급계약서 샘플"
              icon="📄"
              active={isActive("/contract-sample")}
            />
          </div>

          {/* 계정 */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 13.2, color: "#666", marginBottom: 8, fontWeight: "bold" }}>
              계정
            </div>
            {userRole ? (
              <>
                <div
                  style={{
                    padding: "8px 12px",
                    marginBottom: 4,
                    fontSize: 13,
                    color: "#28a745",
                  }}
                >
                  ✓ 로그인됨 ({
                    userRole === "SUPER_ADMIN" ? "슈퍼관리자" :
                    userRole === "AGENT" ? "매니저" :
                    userRole === "SUPPLIER" ? "표준사업장" :
                    userRole === "BUYER" ? "고용의무기업" :
                    userRole === "EMPLOYEE" ? "직원" :
                    userRole
                  })
                </div>
                <MenuItem
                  href="#"
                  label="로그아웃"
                  icon="🚪"
                  onClick={handleLogout}
                />
              </>
            ) : (
              <>
                <MenuItem
                  href="/login"
                  label="기업 로그인"
                  icon="🔑"
                  active={isActive("/login")}
                />
                <MenuItem
                  href="/signup"
                  label="기업 회원가입"
                  icon="✍️"
                  active={isActive("/signup")}
                />
                <div style={{ 
                  borderTop: "1px solid #333", 
                  marginTop: 12, 
                  paddingTop: 12,
                }}>
                  <MenuItem
                    href="/employee/login"
                    label="장애인직원로그인"
                    icon="👷"
                    active={isActive("/employee/login")}
                  />
                  <MenuItem
                    href="/employee/signup"
                    label="장애인직원회원가입"
                    icon="📝"
                    active={isActive("/employee/signup")}
                  />
                </div>
              </>
            )}
          </div>

          {/* 슈퍼어드민 전용 메뉴 */}
          {userRole === "SUPER_ADMIN" && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 20.6, color: "#fff", marginBottom: 12, fontWeight: "bold" }}>
                슈퍼어드민
              </div>
              <MenuItem
                href="/admin/dashboard"
                label="대시보드"
                icon="🛡️"
                active={isActive("/admin/dashboard")}
              />
              <MenuItem
                href="/admin/branches"
                label="지사 관리"
                icon="🏢"
                active={isActive("/admin/branches")}
              />
            </div>
          )}
        </nav>

        {/* 푸터 - 맨 아래에 배치 */}
        <div
          style={{
            marginTop: 28,
            fontSize: 22,
            color: "#ccc",
            borderTop: "1px solid #333",
            paddingTop: 12,
            textAlign: "center",
          }}
        >
          <p style={{ margin: 0 }}>© 2026 장표사닷컴</p>
        </div>
      </aside>
    </>
  );
}

function MenuItem({
  href,
  label,
  icon,
  active = false,
  onClick,
  subItems,
  requiresRole,
  currentRole,
}: {
  href: string;
  label: string;
  icon: string;
  active?: boolean;
  onClick?: () => void;
  subItems?: { href: string; label: string }[];
  requiresRole?: string[];
  currentRole?: string | null;
}) {
  const pathname = usePathname();
  const [isExpanded, setIsExpanded] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    // 권한이 필요한 메뉴인 경우
    if (requiresRole && requiresRole.length > 0) {
      if (!currentRole || !requiresRole.includes(currentRole)) {
        e.preventDefault();
        const roleLabels = [];
        if (requiresRole.includes("BUYER")) roleLabels.push("고용의무기업");
        if (requiresRole.includes("SUPPLIER")) roleLabels.push("표준사업장");
        if (requiresRole.includes("SUPER_ADMIN")) roleLabels.push("관리자");
        alert(`이 메뉴는 로그인이 필요합니다.\n\n필요한 권한: ${roleLabels.join(", ") || "특정 권한"}`);
        return;
      }
    }

    if (onClick) {
      e.preventDefault();
      onClick();
    } else if (subItems) {
      e.preventDefault();
      setIsExpanded(!isExpanded);
    }
  };

  const hasAccess = !requiresRole || (currentRole && requiresRole.includes(currentRole));

  return (
    <>
      <a
        href={href}
        onClick={handleClick}
        style={{
          display: "flex",
          alignItems: "center",
          padding: "12px 14px",
          marginBottom: 4,
          borderRadius: 6,
          textDecoration: "none",
          color: active ? "white" : (hasAccess ? "#ccc" : "#666"),
          background: active ? "#0070f3" : "transparent",
          fontSize: 20.16,
          transition: "all 0.2s",
          opacity: hasAccess ? 1 : 0.6,
          cursor: hasAccess ? "pointer" : "not-allowed",
        }}
        onMouseEnter={(e) => {
          if (!active && hasAccess) {
            e.currentTarget.style.background = "#2a2a2a";
            e.currentTarget.style.color = "white";
          }
        }}
        onMouseLeave={(e) => {
          if (!active && hasAccess) {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "#ccc";
          }
        }}
      >
        <span style={{ marginRight: 10 }}>{icon}</span>
        <span style={{ flex: 1 }}>{label}</span>
        {!hasAccess && (
          <span style={{ fontSize: 14, marginLeft: 4 }}>🔒</span>
        )}
        {subItems && (
          <span style={{ fontSize: 12, marginLeft: 4 }}>
            {isExpanded ? "▼" : "▶"}
          </span>
        )}
      </a>

      {/* 하위 메뉴 */}
      {subItems && isExpanded && (
        <div style={{ marginLeft: 20, marginBottom: 8 }}>
          {subItems.map((sub, i) => (
            <a
              key={i}
              href={sub.href}
              style={{
                display: "block",
                padding: "8px 12px",
                marginBottom: 4,
                borderRadius: 4,
                textDecoration: "none",
                color: pathname === sub.href ? "#0070f3" : "#999",
                background: pathname === sub.href ? "rgba(0,112,243,0.1)" : "transparent",
                fontSize: 16.8,
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                if (pathname !== sub.href) {
                  e.currentTarget.style.color = "white";
                }
              }}
              onMouseLeave={(e) => {
                if (pathname !== sub.href) {
                  e.currentTarget.style.color = "#999";
                }
              }}
            >
              • {sub.label}
            </a>
          ))}
        </div>
      )}
    </>
  );
}
