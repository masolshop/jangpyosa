"use client";

import Sidebar from "@/components/Sidebar";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getToken } from "@/lib/auth";
import "./mobile.css";

export default function EmployeeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // 로그인 체크
    const token = getToken();
    setIsLoggedIn(!!token);
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    e.preventDefault();
    
    const token = getToken();
    if (!token) {
      // 로그인되지 않은 경우 로그인 페이지로
      router.push("/employee/login");
    } else {
      // 로그인된 경우 해당 페이지로
      router.push(path);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userRole");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    router.push("/employee/login");
  };

  // 로그인/회원가입 페이지는 레이아웃 없이 표시
  const isAuthPage = pathname === "/employee/login" || pathname === "/employee/signup";

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />
      <main style={{ marginLeft: 360, padding: "40px", flex: 1, width: "100%" }}>
        {children}
      </main>
      
      {/* 모바일 하단 네비게이션 */}
      <nav className="mobile-nav">
        <a 
          href="/employee/attendance" 
          className={`mobile-nav-item ${pathname === "/employee/attendance" ? "active" : ""}`}
          onClick={(e) => handleNavClick(e, "/employee/attendance")}
        >
          <span className="mobile-nav-icon">📅</span>
          <span>근태관리</span>
        </a>
        <a 
          href="/employee/work-orders" 
          className={`mobile-nav-item ${pathname === "/employee/work-orders" ? "active" : ""}`}
          onClick={(e) => handleNavClick(e, "/employee/work-orders")}
        >
          <span className="mobile-nav-icon">📋</span>
          <span>업무지시</span>
        </a>
        <a 
          href="/employee/leave" 
          className={`mobile-nav-item ${pathname === "/employee/leave" ? "active" : ""}`}
          onClick={(e) => handleNavClick(e, "/employee/leave")}
        >
          <span className="mobile-nav-icon">🏖️</span>
          <span>휴가신청</span>
        </a>
        {isLoggedIn ? (
          <button 
            className="mobile-nav-item"
            onClick={handleLogout}
            style={{ 
              background: "none", 
              border: "none", 
              cursor: "pointer",
              color: "#666",
              fontSize: "12px"
            }}
          >
            <span className="mobile-nav-icon">🚪</span>
            <span>로그아웃</span>
          </button>
        ) : (
          <a 
            href="/employee/login" 
            className={`mobile-nav-item ${pathname === "/employee/login" ? "active" : ""}`}
            onClick={(e) => {
              e.preventDefault();
              router.push("/employee/login");
            }}
          >
            <span className="mobile-nav-icon">🔐</span>
            <span>로그인</span>
          </a>
        )}
      </nav>
    </div>
  );
}
