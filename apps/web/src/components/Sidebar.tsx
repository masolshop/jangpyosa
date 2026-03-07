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
  // 🆕 화면 크기에 따라 초기 상태 설정 (PC는 열림, 모바일은 닫힘)
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
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

  // 🆕 화면 크기 감지 및 초기 상태 설정
  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      const mobile = width < 1024; // lg breakpoint
      setIsMobile(mobile);
      setIsOpen(!mobile); // PC에서는 열림, 모바일에서는 닫힘
    };

    // 초기 실행
    checkScreenSize();

    // 리사이즈 이벤트 리스너
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

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
          left: isOpen ? 330 : 16,
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
          left: isOpen ? 0 : -330,
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
            marginBottom: 8,
            marginTop: 4,
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
              maxWidth: "200px",
              height: "auto",
              display: "block",
              margin: "0 auto 6px auto",
            }}
          />
          <p
            style={{
              margin: 0,
              fontSize: 16,
              color: "#e0e0e0",
              lineHeight: 1.3,
              fontWeight: 500,
              textAlign: "center",
            }}
          >
            장애인표준사업장
            <br />
            연계고용부담금감면플랫폼
          </p>
        </a>

        {/* 알림 드롭다운 제거 - 각 메뉴에 개별 표시 */}

        <nav>
          {companyName && (
            <div
              style={{
                marginBottom: 12,
                marginTop: 12,
                padding: "12px",
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

          {/* 무료장애인직원관리솔루션 메뉴 (항상 표시, 비로그인 시 회원가입 페이지로 이동) */}
          {userRole !== "EMPLOYEE" && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 18, color: "#fff", marginBottom: 8, fontWeight: "bold", textAlign: "center" }}>
                무료장애인직원관리솔루션
              </div>
              <MenuItem href="/dashboard/employees" label="장애인직원등록관리" icon="👥" active={isActive("/dashboard/employees")} requiresRole={["BUYER", "SUPPLIER", "SUPER_ADMIN"]} currentRole={userRole} requiresAuth={true} />
              <MenuItem href="/dashboard/monthly" label="고용장려금부담금관리" icon="📅" active={isActive("/dashboard/monthly")} requiresRole={["BUYER", "SUPPLIER", "SUPER_ADMIN"]} currentRole={userRole} requiresAuth={true} />
              <MenuItem href="/dashboard/attendance" label="장애인직원근태관리" active={isActive("/dashboard/attendance")} requiresRole={["BUYER", "SUPPLIER", "SUPER_ADMIN"]} currentRole={userRole} notificationCount={notificationCounts.attendance} onNotificationClear={() => markNotificationsByTypeAsRead(['ATTENDANCE_REMINDER', 'ATTENDANCE_ISSUE'])} requiresAuth={true} />
              <MenuItem href="/dashboard/work-orders" label="장애인직원업무관리" active={isActive("/dashboard/work-orders")} requiresRole={["BUYER", "SUPPLIER", "SUPER_ADMIN"]} currentRole={userRole} notificationCount={notificationCounts.workOrder} onNotificationClear={() => markNotificationsByTypeAsRead(['WORK_ORDER', 'WORK_ORDER_COMPLETED'])} requiresAuth={true} />
              <MenuItem href="/dashboard/announcements" label="장애인직원공지관리" active={isActive("/dashboard/announcements")} requiresRole={["BUYER", "SUPPLIER", "SUPER_ADMIN"]} currentRole={userRole} notificationCount={notificationCounts.announcement} onNotificationClear={() => markNotificationsByTypeAsRead(['ANNOUNCEMENT', 'ANNOUNCEMENT_READ'])} requiresAuth={true} />
              <MenuItem href="/dashboard/leave" label="장애인직원휴가관리" active={isActive("/dashboard/leave")} requiresRole={["BUYER", "SUPPLIER", "SUPER_ADMIN"]} currentRole={userRole} notificationCount={notificationCounts.leave} onNotificationClear={() => markNotificationsByTypeAsRead(['LEAVE_REQUEST', 'LEAVE_APPROVED', 'LEAVE_REJECTED'])} requiresAuth={true} />
              <MenuItem href="/dashboard/company" label="기업대시보드" icon="🏢" active={isActive("/dashboard/company")} requiresRole={["BUYER", "SUPPLIER", "SUPER_ADMIN"]} currentRole={userRole} requiresAuth={true} />
            </div>
          )}

          {/* 직원용 메뉴 (EMPLOYEE 역할인 경우) */}
          {userRole === "EMPLOYEE" && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 18, color: "#fff", marginBottom: 8, fontWeight: "bold", textAlign: "center" }}>
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
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 18, color: "#fff", marginBottom: 8, fontWeight: "bold", textAlign: "center" }}>
                고용부담금감면계산기
              </div>
              <MenuItem href="/calculators/incentive-annual" label="고용장려금계산기" icon="💸" active={isActive("/calculators/incentive-annual")} />
              <MenuItem href="/calculators/levy-annual" label="고용부담금계산기" icon="💰" active={isActive("/calculators/levy-annual") || isActive("/calculators/levy")} subItems={[{ href: "/calculators/levy", label: "간단부담금계산" }, { href: "/calculators/levy-annual", label: "월별부담금계산" }]} />
              <MenuItem href="/calculators/linkage" label="고용연계감면계산기" icon="📉" active={isActive("/calculators/linkage")} />
              <MenuItem href="/calculators/standard-benefit" label="표준사업장혜택계산기" icon="🎁" active={isActive("/calculators/standard-benefit")} />
            </div>
          )}

          {/* 고용부담금감면및우선구매컨설팅 메뉴 (직원이 아닌 경우만 표시, 비로그인 시 회원가입 페이지로 이동) */}
          {userRole !== "EMPLOYEE" && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 18, color: "#fff", marginBottom: 8, fontWeight: "bold", textAlign: "center" }}>
                고용부담금감면및우선구매컨설팅
              </div>
              <MenuItem href="/employment-levy-obligation" label="장애인의무고용부담금" icon="📋" active={isActive("/employment-levy-obligation")} />
              <MenuItem href="/linkage-levy-exemption-system" label="연계고용부담금감면제도" icon="📉" active={isActive("/linkage-levy-exemption-system")} />
              <MenuItem href="/public-purchase-system" label="공공기관우선구매제도" icon="🏛️" active={isActive("/public-purchase-system")} />
              <MenuItem href="/standard-workplace-establishment" label="장애인표준사업장 및 자회사형 설립컨설팅" icon="🏭" active={isActive("/standard-workplace-establishment")} />
              <MenuItem href="/catalog" label="부담금감면/우선구매 맞춤컨설팅" icon="💡" active={pathname?.startsWith("/catalog")} />
              <MenuItem href="/contract-sample" label="표준도급계약서 샘플" icon="📄" active={isActive("/contract-sample")} />
              <MenuItem href="/products/manage" label="표준사업장감면맞춤컨설팅등록" icon="🏭" active={isActive("/products/manage") || isActive("/supplier/profile")} requiresRole={["SUPPLIER"]} currentRole={userRole} requiresAuth={true} />
            </div>
          )}

          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 13.2, color: "#666", marginBottom: 8, fontWeight: "bold" }}>
              계정
            </div>
            {userRole || salesRole ? (
              <>
                {userRole && (
                  <div style={{ padding: "8px 12px", marginBottom: 4, fontSize: 13, color: "#28a745" }}>
                    ✓ 로그인됨 ({userRole === "SUPER_ADMIN" ? "슈퍼관리자" : userRole === "AGENT" ? "매니저" : userRole === "SUPPLIER" ? "표준사업장" : userRole === "BUYER" ? "고용의무기업" : userRole === "EMPLOYEE" ? "직원" : userRole})
                  </div>
                )}
                {salesRole && (
                  <div style={{ padding: "8px 12px", marginBottom: 4, fontSize: 13, color: "#28a745" }}>
                    ✓ 영업 로그인됨 ({salesRole === "MANAGER" ? "매니저" : salesRole === "BRANCH_MANAGER" ? "지사장" : salesRole === "HEAD_MANAGER" ? "본부장" : salesRole})
                  </div>
                )}
                <MenuItem href="#" label="로그아웃" icon="🚪" onClick={handleLogout} />
              </>
            ) : (
              <>
                <MenuItem href="/login" label="고용감면관련기업 로그인" icon="🔑" active={isActive("/login")} />
                <MenuItem href="/signup" label="고용감면관련기업 회원가입" icon="✍️" active={isActive("/signup")} />
                <div style={{ borderTop: "1px solid #333", marginTop: 12, paddingTop: 12 }}>
                  <MenuItem href="/employee/login" label="장애인직원로그인" icon="👷" active={isActive("/employee/login")} />
                  <MenuItem href="/employee/signup" label="장애인직원회원가입" icon="📝" active={isActive("/employee/signup")} />
                  <MenuItem href="/admin/sales" label="매니저/지사/본부 로그인" icon="👔" active={isActive("/admin/sales")} />
                  <MenuItem href="/admin/login" label="슈퍼어드민 로그인" icon="🛡️" active={isActive("/admin/login")} />
                </div>
              </>
            )}
          </div>

          {/* 매니저/지사/본부 대시보드 (영업 사원 또는 SUPER_ADMIN) */}
          {(salesRole && ['MANAGER', 'BRANCH_MANAGER', 'HEAD_MANAGER'].includes(salesRole)) || userRole === "SUPER_ADMIN" ? (
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 18, color: "#fff", marginBottom: 8, fontWeight: "bold", textAlign: "center" }}>
                영업 대시보드
              </div>
              <MenuItem 
                href="/admin/sales/dashboard" 
                label={
                  salesRole === 'MANAGER' ? '매니저 대시보드' :
                  salesRole === 'BRANCH_MANAGER' ? '지사 대시보드' :
                  salesRole === 'HEAD_MANAGER' ? '본부 대시보드' :
                  '영업 대시보드'
                }
                icon="📊" 
                active={isActive("/admin/sales/dashboard")} 
              />
            </div>
          ) : null}

          {userRole === "SUPER_ADMIN" && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 18, color: "#fff", marginBottom: 8, fontWeight: "bold", textAlign: "center" }}>
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
  requiresAuth?: boolean; // 로그인 필요 여부
  onMobileClick?: () => void; // 🆕 모바일에서 클릭 시 콜백
}

function MenuItem({ href, label, icon, active = false, onClick, onNotificationClear, subItems, requiresRole, currentRole, notificationCount, requiresAuth = false, onMobileClick }: MenuItemProps) {
  const pathname = usePathname();
  const [showSubItems, setShowSubItems] = useState(false);
  // 🔧 수정: requiresRole이 없거나 undefined면 공개 메뉴 (항상 접근 가능)
  const hasAccess = !requiresRole || requiresRole.length === 0 || (currentRole && requiresRole.includes(currentRole));
  
  // 알림이 있는 메뉴인지 확인
  const hasNotifications = notificationCount !== undefined && notificationCount > 0;

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // 🆕 모바일에서 메뉴 클릭 시 사이드바 닫기
    if (typeof window !== 'undefined' && window.innerWidth < 1024 && onMobileClick) {
      setTimeout(() => onMobileClick(), 100); // 약간의 지연 후 닫기
    }

    // requiresAuth가 true이고 로그인되지 않았으면 회원가입 페이지로 리다이렉트
    if (requiresAuth && !currentRole) {
      e.preventDefault();
      window.location.href = '/signup';
      return;
    }

    if (requiresRole && requiresRole.length > 0 && (!currentRole || !requiresRole.includes(currentRole))) {
      e.preventDefault();
      const roleLabels = [];
      if (requiresRole.includes("BUYER")) roleLabels.push("고용의무기업");
      if (requiresRole.includes("SUPPLIER")) roleLabels.push("표준사업장");
      if (requiresRole.includes("SUPER_ADMIN")) roleLabels.push("관리자");
      alert(`이 메뉴는 회원가입이 필요합니다.\n\n필요한 권한: ${roleLabels.join(", ") || "특정 권한"}`);
      window.location.href = '/signup';
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
  };

  return (
    <>
      <a
        href={href}
        onClick={handleClick}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "8px 14px",
          marginBottom: 5,
          borderRadius: 8,
          border: "1px solid rgba(255, 255, 255, 0.3)",
          textDecoration: "none",
          color: active ? "white" : "#ccc",
          background: active ? "#0070f3" : "transparent",
          fontSize: 18.2,
          fontWeight: active ? 600 : 400,
          transition: "all 0.3s",
          opacity: 1,
          cursor: "pointer",
        }}
        onMouseEnter={(e) => {
          if (!active) {
            e.currentTarget.style.background = "#2a2a2a";
            e.currentTarget.style.color = "white";
            e.currentTarget.style.border = "1px solid rgba(255, 255, 255, 0.5)";
            const iconEl = e.currentTarget.querySelector(".menu-icon") as HTMLElement;
            if (iconEl) iconEl.style.opacity = "1";
          }
        }}
        onMouseLeave={(e) => {
          if (!active) {
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
                padding: "6px 12px",
                marginBottom: 3,
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
