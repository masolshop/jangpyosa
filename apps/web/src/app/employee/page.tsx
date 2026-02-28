"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function EmployeeIndexPage() {
  const router = useRouter();

  useEffect(() => {
    // 자동으로 근태관리 페이지로 리다이렉트
    router.push("/employee/attendance");
  }, [router]);

  return (
    <div style={{ 
      display: "flex", 
      justifyContent: "center", 
      alignItems: "center", 
      minHeight: "50vh",
      flexDirection: "column",
      gap: "20px"
    }}>
      <div style={{ 
        fontSize: "48px",
        animation: "spin 1s linear infinite"
      }}>
        ⏳
      </div>
      <p style={{ fontSize: "18px", color: "#666" }}>
        근태관리 페이지로 이동 중...
      </p>
      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
