"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { clearToken, getUserRole, getToken } from "@/lib/auth";
import NotificationDropdown from "./NotificationDropdown";
import toast, { Toaster } from 'react-hot-toast';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 
  (typeof window !== 'undefined' && window.location.hostname === 'jangpyosa.com' 
    ? 'https://jangpyosa.com/api' 
    : 'http://localhost:4000');

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(true);
  const [userName, setUserName] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState<string | null>(null);
  const [managerName, setManagerName] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [salesRole, setSalesRole] = useState<string | null>(null); // MANAGER, BRANCH_MANAGER, HEAD_MANAGER
  const [notificationCounts, setNotificationCounts] = useState<{
    total: number;
    leave: number;
    workOrder: number;
    announcement: number;
    attendance: number;
  }>({ total: 0, leave: 0, workOrder: 0, announcement: 0, attendance: 0 });
  
  // 이전 알림 개수를 저장 (토스트 표시용)
  const prevCountRef = useRef<number>(0);
  const lastToastRef = useRef<string>(''); // 마지막 토스트 메시지 (중복 방지)
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // 읽지 않은 알림 개수 조회 (타입별) - 최적화
  const fetchUnreadCount = async () => {
    try {
      const token = getToken();
      if (!token) return;

      const url = `${API_BASE}/notifications/unread-count?byType=true`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const byType = data.byType || {};
        
        const counts = {
          total: data.total || 0,
          leave: (byType.LEAVE_REQUEST || 0) + (byType.LEAVE_APPROVED || 0) + (byType.LEAVE_REJECTED || 0),
          workOrder: (byType.WORK_ORDER || 0) + (byType.WORK_ORDER_COMPLETED || 0),
          announcement: (byType.ANNOUNCEMENT || 0) + (byType.ANNOUNCEMENT_READ || 0),
          attendance: (byType.ATTENDANCE_REMINDER || 0) + (byType.ATTENDANCE_ISSUE || 0),
        };
        
        // 🔔 새 알림이 있으면 토스트 표시 (중복 방지)
        if (prevCountRef.current > 0 && counts.total > prevCountRef.current) {
          let toastMessage = '';
          
          // 알림 타입별 메시지 (우선순위 순)
          if (byType.LEAVE_REQUEST > (prevCountRef.current === 0 ? 0 : byType.LEAVE_REQUEST)) {
            toastMessage = '🏖️ 새로운 휴가 신청이 있습니다';
          } else if (byType.LEAVE_APPROVED > 0) {
            toastMessage = '✅ 휴가 신청이 승인되었습니다';
          } else if (byType.WORK_ORDER > 0) {
            toastMessage = '📋 새로운 업무 지시가 있습니다';
          } else if (byType.ANNOUNCEMENT > 0) {
            toastMessage = '📢 새로운 공지사항이 있습니다';
          } else {
            const newCount = counts.total - prevCountRef.current;
            toastMessage = `🔔 새 알림 ${newCount}개`;
          }
          
          // 중복 토스트 방지
          if (toastMessage && toastMessage !== lastToastRef.current) {
            const toastStyle: any = {
              duration: 4000,
              position: 'top-right',
            };
            
            if (toastMessage.includes('휴가 신청이 있습니다')) {
              toastStyle.style = { background: '#3b82f6', color: '#fff' };
              toast(toastMessage, toastStyle);
            } else if (toastMessage.includes('승인되었습니다')) {
              toast.success(toastMessage, toastStyle);
            } else if (toastMessage.includes('업무 지시')) {
              toastStyle.style = { background: '#8b5cf6', color: '#fff' };
              toast(toastMessage, toastStyle);
            } else if (toastMessage.includes('공지사항')) {
              toastStyle.style = { background: '#f59e0b', color: '#fff' };
              toast(toastMessage, toastStyle);
            } else {
              toast(toastMessage, toastStyle);
            }
            
            lastToastRef.current = toastMessage;
          }
        }
        
        prevCountRef.current = counts.total;
        setNotificationCounts(counts);
      }
    } catch (error) {
      // 에러는 조용히 처리 (네트워크 불안정 등)
      console.warn('[Sidebar] 알림 조회 실패:', error);
    }
  };

  // 특정 타입의 알림 모두 읽음 처리 (최적화: 단일 API 호출)
  const markNotificationsByTypeAsRead = async (types: string[]) => {
    try {
      const token = getToken();
      if (!token) return;

      // 타입별 읽음 처리 API 호출
      const response = await fetch(`${API_BASE}/notifications/mark-type-read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ types }),
      });

      if (response.ok) {
        // 알림 개수 새로고침 (읽음 처리 후 즉시 반영)
        await fetchUnreadCount();
      }
    } catch (error) {
      console.warn('[Sidebar] 알림 읽음 처리 실패:', error);
    }
  };

  useEffect(() => {
    // 로그인한 사용자 정보 가져오기
    if (typeof window !== "undefined") {
      // userRole 설정
      const role = getUserRole();
      setUserRole(role);

      // 사용자 정보
      const userStr = localStorage.getItem("user");
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          setUserName(user.name || null);
          setCompanyName(user.company?.name || user.companyName || null);
          setManagerName(user.managerName || null);
        } catch (e) {
          console.error("사용자 정보 파싱 실패:", e);
        }
      }

      // 매니저/지사/본부 인증 확인
      const managerInfo = localStorage.getItem("manager_info");
      if (managerInfo) {
        try {
          const info = JSON.parse(managerInfo);
          setSalesRole(info.role); // MANAGER, BRANCH_MANAGER, HEAD_MANAGER
        } catch (e) {
          console.error("매니저 정보 파싱 실패:", e);
        }
      }

      // 알림 개수 조회
      fetchUnreadCount();

      // 폴링: 탭이 활성화되어 있을 때만 실행 (최적화)
      const startPolling = () => {
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
        }
        pollingIntervalRef.current = setInterval(fetchUnreadCount, 30000);
      };

      const stopPolling = () => {
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }
      };

      // 탭 활성화 감지
      const handleVisibilityChange = () => {
        if (document.hidden) {
          stopPolling(); // 탭이 비활성화되면 폴링 중단
        } else {
          fetchUnreadCount(); // 탭이 활성화되면 즉시 조회
          startPolling(); // 폴링 재시작
        }
      };

      // 초기 폴링 시작
      startPolling();
      
      // 탭 활성화 감지 이벤트
      document.addEventListener('visibilitychange', handleVisibilityChange);

      return () => {
        stopPolling();
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
    }
  }, []);

  useEffect(() => {
    const sidebar = document.querySelector('aside');
    if (sidebar) {
      sidebar.scrollTop = 0;
    }
  }, [pathname]);

  const handleLogout = () => {
    clearToken();
    if (typeof window !== "undefined") {
      localStorage.removeItem("user");
      localStorage.removeItem("userRole");
      localStorage.removeItem("manager_auth_token");
      localStorage.removeItem("manager_info");
    }
    setUserRole(null);
    setUserName(null);
    setCompanyName(null);
    setSalesRole(null);
    window.location.href = "/";
  };

  const isActive = (path: string) => pathname === path;

  return (
    <>
      {/* 🔔 Toast 알림 컨테이너 */}
      <Toaster />
      
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

      <aside
        style={{
          position: "fixed",
          top: 0,
          left: isOpen ? 0 : -350,
          width: 330,
          height: "100vh",
          background: "#0E2A3D",
          color: "white",
          padding: "20px",
          transition: "left 0.3s ease",
          zIndex: 1000,
          overflowY: "auto",
        }}
      >
        <a
          href="/"
          style={{
            display: "block",
            marginBottom: 16,
            marginTop: 8,
            textDecoration: "none",
            color: "white",
            cursor: "pointer",
            transition: "all 0.2s",
            textAlign: "center",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = "0.8";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = "1";
          }}
        >
          <img
            src="/logo.png"
            alt="장표사닷컴"
            style={{
              width: "100%",
              maxWidth: "224px",
              height: "auto",
              display: "block",
              margin: "0 auto 12px auto",
            }}
          />
          <p
            style={{
              margin: 0,
              fontSize: 18,
              color: "#e0e0e0",
              lineHeight: 1.4,
              fontWeight: 500,
              textAlign: "center",
            }}
          >
            장애인표준사업장
            <br />
            연계고용감면플랫폼
          </p>
        </a>

        {/* 알림 드롭다운 제거 - 각 메뉴에 개별 표시 */}

        <nav>
          {companyName && (
            <div
              style={{
                marginBottom: 20,
                marginTop: 20,
                padding: "16px",
                background: "rgba(255, 255, 255, 0.1)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                borderRadius: 8,
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: 17, fontWeight: 600, color: "#fff", marginBottom: managerName ? 8 : 0 }}>
                {companyName}
              </div>
              {managerName && (
                <div style={{ fontSize: 15, fontWeight: 400, color: "#d0d0d0" }}>
                  {managerName}
                </div>
              )}
            </div>
          )}

          {/* 관리자용 메뉴 (BUYER, SUPPLIER, SUPER_ADMIN 역할인 경우) */}
          {userRole && ["BUYER", "SUPPLIER", "SUPER_ADMIN"].includes(userRole) && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 21.424, color: "#fff", marginBottom: 12, fontWeight: "bold", textAlign: "center" }}>
                장애인직원관리솔루션
              </div>
              <MenuItem href="/dashboard/employees" label="장애인직원등록관리" icon="👥" active={isActive("/dashboard/employees")} requiresRole={["BUYER", "SUPPLIER", "SUPER_ADMIN"]} currentRole={userRole} />
              <MenuItem href="/dashboard/monthly" label="고용장려금부담금관리" icon="📅" active={isActive("/dashboard/monthly")} requiresRole={["BUYER", "SUPPLIER", "SUPER_ADMIN"]} currentRole={userRole} />
              <MenuItem href="/dashboard/attendance" label="장애인직원근태관리" active={isActive("/dashboard/attendance")} requiresRole={["BUYER", "SUPPLIER", "SUPER_ADMIN"]} currentRole={userRole} notificationCount={notificationCounts.attendance} onNotificationClear={() => markNotificationsByTypeAsRead(['ATTENDANCE_REMINDER', 'ATTENDANCE_ISSUE'])} />
              <MenuItem href="/dashboard/work-orders" label="장애인직원업무관리" active={isActive("/dashboard/work-orders")} requiresRole={["BUYER", "SUPPLIER", "SUPER_ADMIN"]} currentRole={userRole} notificationCount={notificationCounts.workOrder} onNotificationClear={() => markNotificationsByTypeAsRead(['WORK_ORDER', 'WORK_ORDER_COMPLETED'])} />
              <MenuItem href="/dashboard/announcements" label="장애인직원공지관리" active={isActive("/dashboard/announcements")} requiresRole={["BUYER", "SUPPLIER", "SUPER_ADMIN"]} currentRole={userRole} notificationCount={notificationCounts.announcement} onNotificationClear={() => markNotificationsByTypeAsRead(['ANNOUNCEMENT', 'ANNOUNCEMENT_READ'])} />
              <MenuItem href="/dashboard/leave" label="장애인직원휴가관리" active={isActive("/dashboard/leave")} requiresRole={["BUYER", "SUPPLIER", "SUPER_ADMIN"]} currentRole={userRole} notificationCount={notificationCounts.leave} onNotificationClear={() => markNotificationsByTypeAsRead(['LEAVE_REQUEST', 'LEAVE_APPROVED', 'LEAVE_REJECTED'])} />
              <MenuItem href="/dashboard/company" label="기업대시보드" icon="🏢" active={isActive("/dashboard/company")} requiresRole={["BUYER", "SUPPLIER", "SUPER_ADMIN"]} currentRole={userRole} />
            </div>
          )}

          {/* 직원용 메뉴 (EMPLOYEE 역할인 경우) */}
          {userRole === "EMPLOYEE" && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 21.424, color: "#fff", marginBottom: 12, fontWeight: "bold", textAlign: "center" }}>
                직원 메뉴
              </div>
              <MenuItem
                href="/employee/attendance"
                label="출퇴근 관리"
                active={isActive("/employee/attendance")}
                notificationCount={notificationCounts.attendance}
                onNotificationClear={() => markNotificationsByTypeAsRead(['ATTENDANCE_REMINDER', 'ATTENDANCE_ISSUE'])}
              />
              <MenuItem
                href="/employee/work-orders"
                label="업무 관리"
                active={isActive("/employee/work-orders")}
                notificationCount={notificationCounts.workOrder}
                onNotificationClear={() => markNotificationsByTypeAsRead(['WORK_ORDER'])}
              />
              <MenuItem
                href="/employee/leave"
                label="휴가 신청"
                active={isActive("/employee/leave")}
                notificationCount={notificationCounts.leave}
                onNotificationClear={() => markNotificationsByTypeAsRead(['LEAVE_REQUEST', 'LEAVE_APPROVED', 'LEAVE_REJECTED'])}
              />
            </div>
          )}

          {/* 계산기 메뉴 (직원이 아닌 경우만 표시) */}
          {userRole !== "EMPLOYEE" && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 21.424, color: "#fff", marginBottom: 12, fontWeight: "bold", textAlign: "center" }}>
                고용부담금감면계산기
              </div>
              <MenuItem href="/calculators/incentive-annual" label="고용장려금계산기" icon="💸" active={isActive("/calculators/incentive-annual")} />
              <MenuItem href="/calculators/levy-annual" label="고용부담금계산기" icon="💰" active={isActive("/calculators/levy-annual") || isActive("/calculators/levy")} subItems={[{ href: "/calculators/levy", label: "간단부담금계산" }, { href: "/calculators/levy-annual", label: "월별부담금계산" }]} />
              <MenuItem href="/calculators/linkage" label="고용연계감면계산기" icon="📉" active={isActive("/calculators/linkage")} />
              <MenuItem href="/calculators/standard-benefit" label="표준사업장혜택계산기" icon="🎁" active={isActive("/calculators/standard-benefit")} />
            </div>
          )}

          {/* 연계고용감면센터 메뉴 (직원이 아닌 경우만 표시) */}
          {userRole !== "EMPLOYEE" && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 21.424, color: "#fff", marginBottom: 12, fontWeight: "bold", textAlign: "center" }}>
                연계고용감면센터
              </div>
              {userRole === "SUPPLIER" && (
                <MenuItem href="/products/manage" label="연계고용감면상품관리" icon="🏭" active={isActive("/products/manage") || isActive("/supplier/profile")} />
              )}
              <MenuItem href="/catalog" label="상품 카탈로그" icon="🛒" active={pathname?.startsWith("/catalog")} />
              {userRole === "BUYER" && (
                <MenuItem href="/cart" label="도급계약장바구니" icon="🛍️" active={isActive("/cart")} />
              )}
              <MenuItem href="/dashboard/contracts" label="도급계약 이행·결제 관리" icon="📋" active={pathname?.startsWith("/dashboard/contracts")} requiresRole={["BUYER", "SUPER_ADMIN", "SUPPLIER"]} currentRole={userRole} />
              <MenuItem href="/dashboard/performances" label="월별 도급계약감면관리" icon="📊" active={pathname?.startsWith("/dashboard/performances")} requiresRole={["BUYER", "SUPER_ADMIN", "SUPPLIER"]} currentRole={userRole} />
              <MenuItem href="/purchase-cases" label="장애인표준사업장생산품 구매 사례" icon="📦" active={isActive("/purchase-cases")} />
              <MenuItem href="/contract-sample" label="표준도급계약서 샘플" icon="📄" active={isActive("/contract-sample")} />
            </div>
          )}

          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 13.2, color: "#666", marginBottom: 8, fontWeight: "bold" }}>
              계정
            </div>
            {userRole ? (
              <>
                <div style={{ padding: "8px 12px", marginBottom: 4, fontSize: 13, color: "#28a745" }}>
                  ✓ 로그인됨 ({userRole === "SUPER_ADMIN" ? "슈퍼관리자" : userRole === "AGENT" ? "매니저" : userRole === "SUPPLIER" ? "표준사업장" : userRole === "BUYER" ? "고용의무기업" : userRole === "EMPLOYEE" ? "직원" : userRole})
                </div>
                <MenuItem href="#" label="로그아웃" icon="🚪" onClick={handleLogout} />
              </>
            ) : (
              <>
                <MenuItem href="/login" label="기업 로그인" icon="🔑" active={isActive("/login")} />
                <MenuItem href="/signup" label="기업 회원가입" icon="✍️" active={isActive("/signup")} />
                <div style={{ borderTop: "1px solid #333", marginTop: 12, paddingTop: 12 }}>
                  <MenuItem href="/employee/login" label="장애인직원로그인" icon="👷" active={isActive("/employee/login")} />
                  <MenuItem href="/employee/signup" label="장애인직원회원가입" icon="📝" active={isActive("/employee/signup")} />
                </div>
              </>
            )}
          </div>

          {/* 매니저/지사/본부 대시보드 */}
          {salesRole && ['MANAGER', 'BRANCH_MANAGER', 'HEAD_MANAGER'].includes(salesRole) && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 21.424, color: "#fff", marginBottom: 12, fontWeight: "bold", textAlign: "center" }}>
                영업 대시보드
              </div>
              <MenuItem 
                href="/admin/sales/dashboard" 
                label={
                  salesRole === 'MANAGER' ? '매니저 대시보드' :
                  salesRole === 'BRANCH_MANAGER' ? '지사 대시보드' :
                  '본부 대시보드'
                }
                icon="📊" 
                active={isActive("/admin/sales/dashboard")} 
              />
            </div>
          )}

          {userRole === "SUPER_ADMIN" && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 21.424, color: "#fff", marginBottom: 12, fontWeight: "bold", textAlign: "center" }}>
                슈퍼어드민
              </div>
              <MenuItem href="/admin/" label="영업관리 대시보드" icon="📊" active={isActive("/admin/")} />
              <MenuItem href="/admin/company" label="기업관리 대시보드" icon="🏢" active={isActive("/admin/company")} />
              <MenuItem href="/admin/standard-workplace" label="표준사업장 대시보드" icon="🏭" active={isActive("/admin/standard-workplace")} />
            </div>
          )}
        </nav>

        <div style={{ marginTop: 28, fontSize: 22, color: "#ccc", borderTop: "1px solid #333", paddingTop: 12, textAlign: "center" }}>
          <p style={{ margin: 0 }}>© 2026 장표사닷컴</p>
        </div>
      </aside>
    </>
  );
}

interface MenuItemProps {
  href: string;
  label: string;
  icon?: string;
  active?: boolean;
  onClick?: () => void;
  onNotificationClear?: () => void; // 알림 읽음 처리 콜백
  subItems?: { href: string; label: string }[];
  requiresRole?: string[];
  currentRole?: string | null;
  notificationCount?: number; // 알림 개수 (종으로 표시)
}

function MenuItem({ href, label, icon, active = false, onClick, onNotificationClear, subItems, requiresRole, currentRole, notificationCount }: MenuItemProps) {
  const pathname = usePathname();
  const [showSubItems, setShowSubItems] = useState(false);
  const hasAccess = !requiresRole || (currentRole && requiresRole.includes(currentRole));
  
  // 알림이 있는 메뉴인지 확인
  const hasNotifications = notificationCount !== undefined && notificationCount > 0;

  return (
    <>
      <a
        href={href}
        onClick={(e) => {
          if (requiresRole && requiresRole.length > 0 && (!currentRole || !requiresRole.includes(currentRole))) {
            e.preventDefault();
            const roleLabels = [];
            if (requiresRole.includes("BUYER")) roleLabels.push("고용의무기업");
            if (requiresRole.includes("SUPPLIER")) roleLabels.push("표준사업장");
            if (requiresRole.includes("SUPER_ADMIN")) roleLabels.push("관리자");
            alert(`이 메뉴는 로그인이 필요합니다.\n\n필요한 권한: ${roleLabels.join(", ") || "특정 권한"}`);
            return;
          }

          // 알림이 있으면 읽음 처리
          if (hasNotifications && onNotificationClear) {
            onNotificationClear();
          }

          if (onClick) {
            e.preventDefault();
            onClick();
          } else if (subItems) {
            e.preventDefault();
            setShowSubItems(!showSubItems);
          }
        }}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 14px",
          marginBottom: 7,
          borderRadius: 8,
          border: "1px solid rgba(255, 255, 255, 0.3)",
          textDecoration: "none",
          color: active ? "white" : hasAccess ? "#ccc" : "#666",
          background: active ? "#0070f3" : "transparent",
          fontSize: 18.2,
          fontWeight: active ? 600 : 400,
          transition: "all 0.3s",
          opacity: hasAccess ? 1 : 0.6,
          cursor: hasAccess ? "pointer" : "not-allowed",
        }}
        onMouseEnter={(e) => {
          if (!active && hasAccess) {
            e.currentTarget.style.background = "#2a2a2a";
            e.currentTarget.style.color = "white";
            e.currentTarget.style.border = "1px solid rgba(255, 255, 255, 0.5)";
            const iconEl = e.currentTarget.querySelector(".menu-icon") as HTMLElement;
            if (iconEl) iconEl.style.opacity = "1";
          }
        }}
        onMouseLeave={(e) => {
          if (!active && hasAccess) {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "#ccc";
            e.currentTarget.style.border = "1px solid rgba(255, 255, 255, 0.3)";
            const iconEl = e.currentTarget.querySelector(".menu-icon") as HTMLElement;
            if (iconEl && !active) iconEl.style.opacity = "0";
          }
        }}
      >
        <span style={{ flex: 1 }}>{label}</span>
        
        {/* 알림 종 + 개수 (알림이 있는 경우) */}
        {hasNotifications && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 18 }}>🔔</span>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: 22,
                height: 22,
                padding: '0 6px',
                fontSize: 12,
                fontWeight: 'bold',
                color: 'white',
                background: active ? 'rgba(255, 255, 255, 0.3)' : '#ef4444',
                borderRadius: 11,
                lineHeight: 1,
              }}
            >
              {notificationCount! > 99 ? '99+' : notificationCount}
            </span>
          </div>
        )}
        
        {/* 기존 아이콘 (알림이 없고 icon이 제공된 경우만) */}
        {!hasNotifications && icon && (
          <span className="menu-icon" style={{ fontSize: 22, opacity: active ? "1" : "0", transition: "opacity 0.3s ease" }}>
            {icon}
          </span>
        )}
        
        {!hasAccess && <span style={{ fontSize: 14, marginLeft: 4 }}>🔒</span>}
        {subItems && <span style={{ fontSize: 12, marginLeft: 4 }}>{showSubItems ? "▼" : "▶"}</span>}
      </a>
      {subItems && showSubItems && (
        <div style={{ marginLeft: 20, marginBottom: 8 }}>
          {subItems.map((item, idx) => (
            <a
              key={idx}
              href={item.href}
              style={{
                display: "block",
                padding: "8px 12px",
                marginBottom: 4,
                borderRadius: 4,
                textDecoration: "none",
                color: pathname === item.href ? "#0070f3" : "#999",
                background: pathname === item.href ? "rgba(0,112,243,0.1)" : "transparent",
                fontSize: 16.8,
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                if (pathname !== item.href) {
                  e.currentTarget.style.color = "white";
                }
              }}
              onMouseLeave={(e) => {
                if (pathname !== item.href) {
                  e.currentTarget.style.color = "#999";
                }
              }}
            >
              • {item.label}
            </a>
          ))}
        </div>
      )}
    </>
  );
}
