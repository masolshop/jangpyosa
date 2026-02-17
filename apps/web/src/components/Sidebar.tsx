"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { clearToken, getUserRole } from "@/lib/auth";

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    setUserRole(getUserRole());
  }, []);

  const handleLogout = () => {
    clearToken();
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
          left: isOpen ? 260 : 16,
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
          left: isOpen ? 0 : -260,
          width: 240,
          height: "100vh",
          background: "#1a1a1a",
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
            marginBottom: 32, 
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
          <h2 style={{ margin: 0, fontSize: 24 }}>🏢 장표사닷컴</h2>
          <p style={{ margin: "4px 0 0 0", fontSize: 14.4, color: "#999", lineHeight: 1.4 }}>
            장애인표준사업장<br />
            연계고용플랫폼
          </p>
        </a>

        {/* 메인 메뉴 */}
        <nav>
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 11, color: "#666", marginBottom: 8, fontWeight: "bold" }}>
              메인
            </div>
            <MenuItem
              href="/catalog"
              label="도급계약 표준사업장"
              icon="🛒"
              active={isActive("/catalog")}
            />
            <MenuItem
              href="/contract-sample"
              label="표준도급계약서 샘플"
              icon="📄"
              active={isActive("/contract-sample")}
            />
            {userRole === "BUYER" && (
              <MenuItem
                href="/cart"
                label="장바구니"
                icon="🛍️"
                active={isActive("/cart")}
              />
            )}
            {userRole === "SUPPLIER" && (
              <MenuItem
                href="/supplier/profile"
                label="프로필 관리"
                icon="🏭"
                active={isActive("/supplier/profile")}
              />
            )}
          </div>

          {/* 계산기 */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 11, color: "#666", marginBottom: 8, fontWeight: "bold" }}>
              계산기
            </div>
            <MenuItem
              href="/calculators/levy"
              label="부담금 계산기"
              icon="💰"
              active={isActive("/calculators/levy")}
            />
            <MenuItem
              href="/calculators/linkage"
              label="감면 계산기"
              icon="📉"
              active={isActive("/calculators/linkage")}
            />
          </div>

          {/* 콘텐츠 */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 11, color: "#666", marginBottom: 8, fontWeight: "bold" }}>
              안내
            </div>
            <MenuItem
              href="/content/establishment"
              label="표준사업장 설립"
              icon="📄"
              active={isActive("/content/establishment")}
            />
            <MenuItem
              href="/content/linkage"
              label="연계사업 안내"
              icon="📋"
              active={isActive("/content/linkage")}
            />
            <MenuItem
              href="/content/health-voucher"
              label="헬스바우처"
              icon="🏥"
              active={isActive("/content/health-voucher")}
            />
          </div>

          {/* 계정 */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 11, color: "#666", marginBottom: 8, fontWeight: "bold" }}>
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
                    userRole === "BUYER" ? "부담금기업" :
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
                  label="로그인"
                  icon="🔑"
                  active={isActive("/login")}
                />
                <MenuItem
                  href="/signup"
                  label="회원가입"
                  icon="✍️"
                  active={isActive("/signup")}
                />
              </>
            )}
          </div>

          {/* 슈퍼어드민 전용 메뉴 */}
          {userRole === "SUPER_ADMIN" && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 11, color: "#666", marginBottom: 8, fontWeight: "bold" }}>
                관리자
              </div>
              <MenuItem
                href="/admin/branches"
                label="지사 관리"
                icon="🏢"
                active={isActive("/admin/branches")}
              />
            </div>
          )}
        </nav>

        {/* 푸터 */}
        <div
          style={{
            position: "absolute",
            bottom: 20,
            left: 20,
            right: 20,
            fontSize: 11,
            color: "#666",
            borderTop: "1px solid #333",
            paddingTop: 12,
          }}
        >
          <p style={{ margin: 0 }}>© 2026 장표사닷컴</p>
          <p style={{ margin: "4px 0 0 0" }}>한국장애인고용공단 협력</p>
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
}: {
  href: string;
  label: string;
  icon: string;
  active?: boolean;
  onClick?: () => void;
}) {
  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <a
      href={href}
      onClick={handleClick}
      style={{
        display: "flex",
        alignItems: "center",
        padding: "10px 12px",
        marginBottom: 4,
        borderRadius: 6,
        textDecoration: "none",
        color: active ? "white" : "#ccc",
        background: active ? "#0070f3" : "transparent",
        fontSize: 14,
        transition: "all 0.2s",
      }}
      onMouseEnter={(e) => {
        if (!active) {
          e.currentTarget.style.background = "#2a2a2a";
          e.currentTarget.style.color = "white";
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          e.currentTarget.style.background = "transparent";
          e.currentTarget.style.color = "#ccc";
        }
      }}
    >
      <span style={{ marginRight: 8 }}>{icon}</span>
      <span>{label}</span>
    </a>
  );
}
