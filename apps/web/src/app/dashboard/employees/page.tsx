"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { API_BASE } from "@/lib/api";
import { getToken, getUserRole } from "@/lib/auth";
import * as XLSX from "xlsx";

// ============================================
// 타입 정의
// ============================================

type Employee = {
  id: string;
  name: string;
  phone?: string;                 // 핸드폰번호 (직원 인증용)
  registrationNumber?: string;    // 주민번호 앞 6자리 (직원 인증용 + 장려금 계산용, 예: 850315)
  disabilityType: string;
  disabilityGrade?: string;
  severity: "MILD" | "SEVERE";
  gender: "M" | "F";
  hireDate: string;
  resignDate?: string | null;
  monthlySalary: number;
  hasEmploymentInsurance: boolean;
  meetsMinimumWage: boolean;
  monthlyWorkHours?: number | null;   // 월 근로시간 (메인)
  workHoursPerWeek?: number;  // 주당 근무시간 (호환성, 사용하지 않음)
  workType?: "OFFICE" | "REMOTE" | "HYBRID";
  memo?: string;
};

// ============================================
// 메인 컴포넌트
// ============================================

export default function EmployeesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 사용자 정보
  const [companyName, setCompanyName] = useState<string>("");
  const [userName, setUserName] = useState<string>("");

  // 직원 데이터
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tab, setTab] = useState<"active" | "resigned">("active");

  const [form, setForm] = useState({
    name: "",
    phone: "",                      // 핸드폰번호
    registrationNumber: "",        // 주민번호 앞 6자리 (직원 인증용 + 장려금 계산용)
    disabilityType: "",
    disabilityGrade: "",
    severity: "MILD" as "MILD" | "SEVERE",
    gender: "M" as "M" | "F",
    hireDate: "",
    resignDate: "",
    monthlySalary: 2060740,
    hasEmploymentInsurance: true,
    meetsMinimumWage: true,
    monthlyWorkHours: 60,
    workType: "OFFICE" as "OFFICE" | "REMOTE" | "HYBRID",
    memo: "",
  });

  // 2026년 최저시급
  const MINIMUM_HOURLY_WAGE = 10320;

  // 월간 근로시간으로 월급 자동 계산
  const calculateMonthlySalary = (monthlyHours: number): number => {
    if (!monthlyHours || monthlyHours <= 0) return 0;
    const salary = monthlyHours * MINIMUM_HOURLY_WAGE;
    // 1,000원 단위로 반올림
    return Math.round(salary / 1000) * 1000;
  };

  // 월간 근로시간 변경 시 급여 자동 계산
  const handleWorkHoursChange = (hours: number) => {
    setForm({
      ...form,
      monthlyWorkHours: hours, // 월간 근로시간
      monthlySalary: calculateMonthlySalary(hours),
    });
  };

  // ============================================
  // 초기 로드
  // ============================================

  useEffect(() => {
    const role = getUserRole();
    // BUYER, SUPPLIER, SUPER_ADMIN 모두 접근 가능
    if (role !== "BUYER" && role !== "SUPPLIER" && role !== "SUPER_ADMIN") {
      router.push("/");
      return;
    }

    // 로그인한 사용자 정보 가져오기
    if (typeof window !== "undefined") {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          setCompanyName(user.company?.name || "");
          setUserName(user.name || "");
        } catch (e) {
          console.error("사용자 정보 파싱 실패:", e);
        }
      }
    }

    fetchEmployees();
  }, []);

  // ============================================
  // 직원 관리 API
  // ============================================

  async function fetchEmployees() {
    setLoading(true);
    setError("");
    
    try {
      // ✅ 통합 API 사용: Company → BuyerProfile → DisabledEmployee
      const { getCurrentUserCompany, getCompanyEmployees } = await import("@/lib/unified-api");
      const companyData = await getCurrentUserCompany();
      if (!companyData) {
        router.push("/login");
        return;
      }
      const data = await getCompanyEmployees(companyData.companyId);
      setEmployees(data as any || []);
    } catch (e: any) {
      if (e.message.includes("로그인")) {
        router.push("/login");
        return;
      }
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      // ✅ 통합 API 사용
      const { createEmployee, updateEmployee } = await import("@/lib/unified-api");
      
      const employeeData = {
        ...form,
        monthlySalary: calculateMonthlySalary(form.monthlyWorkHours || 0),
        monthlyWorkHours: form.monthlyWorkHours || null,
      };

      if (editingId) {
        await updateEmployee(editingId, employeeData as any);
      } else {
        await createEmployee(employeeData as any);
      }

      // 성공 후 데이터 갱신
      await fetchEmployees();
      resetForm();
      setMessage(editingId ? "✅ 직원 정보가 수정되었습니다." : "✅ 직원이 등록되었습니다.");
      setTimeout(() => setMessage(""), 3000);
    } catch (e: any) {
      setError(e.message);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("정말 삭제하시겠습니까?")) return;

    try {
      // ✅ 통합 API 사용
      const { deleteEmployee } = await import("@/lib/unified-api");
      await deleteEmployee(id);
      await fetchEmployees();
      setMessage("✅ 직원이 삭제되었습니다.");
      setTimeout(() => setMessage(""), 3000);
    } catch (e: any) {
      setError(e.message);
    }
  }

  function startEdit(emp: Employee) {
    setForm({
      name: emp.name,
      phone: emp.phone || "",
      registrationNumber: emp.registrationNumber || "",
      disabilityType: emp.disabilityType,
      disabilityGrade: emp.disabilityGrade || "",
      severity: emp.severity,
      gender: emp.gender,
      hireDate: emp.hireDate.split("T")[0],
      resignDate: emp.resignDate ? emp.resignDate.split("T")[0] : "",
      monthlySalary: emp.monthlySalary,
      hasEmploymentInsurance: emp.hasEmploymentInsurance,
      meetsMinimumWage: emp.meetsMinimumWage,
      monthlyWorkHours: emp.monthlyWorkHours || 60,
      workType: emp.workType || "OFFICE",
      memo: emp.memo || "",
    });
    setEditingId(emp.id);
    setShowForm(true);
  }

  function resetForm() {
    setForm({
      name: "",
      phone: "",
      registrationNumber: "",
      disabilityType: "",
      disabilityGrade: "",
      severity: "MILD",
      gender: "M",
      hireDate: "",
      resignDate: "",
      monthlySalary: 2060740,
      hasEmploymentInsurance: true,
      meetsMinimumWage: true,
      monthlyWorkHours: 60,
      workType: "OFFICE",
      memo: "",
    });
    setEditingId(null);
    setShowForm(false);
  }

  // ============================================
  // 엑셀 업로드 및 다운로드
  // ============================================

  // 엑셀 샘플 다운로드
  function downloadExcelSample() {
    const sampleData = [
      [
        "성명*",
        "핸드폰번호*",
        "주민번호앞자리*",
        "장애유형*",
        "장애등급",
        "중증여부*",
        "성별*",
        "입사일*",
        "퇴사일",
        "고용보험*",
        "최저임금*",
        "월근로시간*",
        "근무형태",
        "메모",
      ],
      [
        "홍길동",
        "010-1234-5678",
        "850315",
        "지체",
        "3급",
        "중증",
        "남",
        "2020-01-01",
        "",
        "가입",
        "이상",
        "60",
        "사무실",
        "샘플 데이터",
      ],
      [
        "김영희",
        "010-2345-6789",
        "900720",
        "시각",
        "2급",
        "중증",
        "여",
        "2021-06-01",
        "",
        "가입",
        "이상",
        "60",
        "재택",
        "",
      ],
      [
        "이철수",
        "010-3456-7890",
        "881130",
        "청각",
        "5급",
        "경증",
        "남",
        "2022-03-15",
        "",
        "가입",
        "이상",
        "60",
        "혼합",
        "",
      ],
    ];

    const sampleNotes = [
      [],
      [],
      [],
      [],
      ["📋 작성 안내"],
      ["* 표시가 있는 항목은 필수 입력 항목입니다."],
      [],
      ["[핸드폰번호]"],
      ["- 직원 핸드폰번호를 입력합니다 (예: 010-1234-5678)"],
      ["- 직원 회원가입 시 본인 인증에 사용됩니다"],
      ["- 하이픈(-) 포함 또는 미포함 모두 가능합니다"],
      [],
      ["[주민번호 앞자리]"],
      ["- 주민등록번호 앞 6자리를 입력합니다 (예: 850315)"],
      ["- 직원 회원가입 시 본인 인증에 사용됩니다"],
      ["- 장려금 계산 시 생년월일로 사용됩니다"],
      [],
      ["[중증여부]"],
      ["- 중증: 장애 1~3급 또는 중증 판정을 받은 경우"],
      ["- 경증: 장애 4~6급 또는 경증 판정을 받은 경우"],
      [],
      ["[성별]"],
      ["- 남 또는 여로 입력"],
      [],
      ["[날짜 형식]"],
      ["- YYYY-MM-DD 형식으로 입력 (예: 2020-01-01)"],
      ["- 퇴사일은 선택사항입니다"],
      [],
      ["[고용보험]"],
      ["- 가입 또는 미가입으로 입력"],
      [],
      ["[최저임금]"],
      ["- 이상 또는 미만으로 입력"],
      [],
      ["[월근로시간]"],
      ["- 월간 근로시간을 숫자로 입력 (예: 60, 최소 60시간 이상) *필수*"],
      ["- 입력하지 않으면 60시간으로 자동 설정됩니다"],
      ["- 60시간이 최소 근무시간입니다"],
      ["- ⭐ 월급여는 자동 계산됩니다: 월근로시간 × 10,320원 (1,000원 단위 반올림)"],
      [],
      ["[근무형태]"],
      ["- 사무실: 회사에서 근무 (OFFICE)"],
      ["- 재택: 재택 근무 (REMOTE)"],
      ["- 혼합: 사무실 + 재택 혼합 (HYBRID)"],
      ["- 입력하지 않으면 '사무실'로 자동 설정됩니다"],
    ];

    // 워크북 생성
    const wb = XLSX.utils.book_new();
    
    // 데이터 시트
    const ws = XLSX.utils.aoa_to_sheet(sampleData);
    ws["!cols"] = [
      { wch: 10 },  // 성명
      { wch: 15 },  // 핸드폰번호
      { wch: 15 },  // 주민번호앞자리
      { wch: 12 },  // 장애유형
      { wch: 10 },  // 장애등급
      { wch: 10 },  // 중증여부
      { wch: 8 },   // 성별
      { wch: 12 },  // 입사일
      { wch: 12 },  // 퇴사일
      { wch: 10 },  // 고용보험
      { wch: 10 },  // 최저임금
      { wch: 12 },  // 월근로시간
      { wch: 12 },  // 근무형태
      { wch: 20 },  // 메모
    ];
    XLSX.utils.book_append_sheet(wb, ws, "직원 데이터");

    // 작성 안내 시트
    const wsNotes = XLSX.utils.aoa_to_sheet(sampleNotes);
    wsNotes["!cols"] = [{ wch: 50 }];
    XLSX.utils.book_append_sheet(wb, wsNotes, "작성 안내");

    // 파일 다운로드
    const currentDate = new Date().toISOString().split("T")[0];
    XLSX.writeFile(wb, `장애인직원_엑셀샘플_${currentDate}.xlsx`);
  }

  // 엑셀 파일 업로드 처리
  async function handleExcelUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      setError("");
      setMessage("");

      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

      if (jsonData.length < 2) {
        setError("엑셀 파일에 데이터가 없습니다.");
        return;
      }

      // 헤더 확인 (첫 번째 행)
      const headers = jsonData[0];
      const dataRows = jsonData.slice(1);

      let successCount = 0;
      let failCount = 0;
      const errors: string[] = [];

      const token = getToken();
      if (!token) {
        router.push("/login");
        return;
      }

      // 각 행을 직원으로 등록
      for (let i = 0; i < dataRows.length; i++) {
        const row = dataRows[i];
        if (!row || row.length === 0 || !row[0]) continue; // 빈 행 스킵

        try {
          // 데이터 매핑 (핸드폰번호 추가)
          const workTypeStr = row[13]?.toString().trim() || "";
          let workType: "OFFICE" | "REMOTE" | "HYBRID" = "OFFICE";
          if (workTypeStr === "재택") workType = "REMOTE";
          else if (workTypeStr === "혼합") workType = "HYBRID";
          else workType = "OFFICE"; // 기본값 또는 "사무실"

          const monthlyWorkHours = Number(row[12]) || 60;
          
          const employeeData = {
            name: row[0]?.toString().trim() || "",
            phone: row[1]?.toString().trim() || "",                  // 핸드폰번호
            registrationNumber: String(row[2] ?? "").trim(),          // 주민번호 앞자리 (숫자 가능)
            disabilityType: row[3]?.toString().trim() || "",
            disabilityGrade: String(row[4] ?? "").trim(),             // 장애 등급 (숫자 가능)
            severity: (row[5]?.toString().trim() === "중증" ? "SEVERE" : "MILD") as "SEVERE" | "MILD",
            gender: (row[6]?.toString().trim() === "여" ? "F" : "M") as "M" | "F",
            hireDate: row[7] ? formatExcelDate(row[7]) : "",
            resignDate: row[8] ? formatExcelDate(row[8]) : "",
            monthlySalary: calculateMonthlySalary(monthlyWorkHours),
            hasEmploymentInsurance: row[9]?.toString().trim() === "가입",
            meetsMinimumWage: row[10]?.toString().trim() === "이상",
            monthlyWorkHours: monthlyWorkHours,
            workType: workType,
            memo: row[13]?.toString().trim() || "",
          };

          // 디버깅: 전송 데이터 확인
          console.log(`[엑셀 업로드] ${i + 2}행 (${employeeData.name}) 데이터:`, {
            phone: employeeData.phone,
            registrationNumber: employeeData.registrationNumber,
            disabilityType: employeeData.disabilityType,
            disabilityGrade: employeeData.disabilityGrade,
          });

          // 필수 항목 검증
          if (!employeeData.name || !employeeData.phone || !employeeData.registrationNumber || !employeeData.disabilityType || !employeeData.hireDate) {
            errors.push(`${i + 2}행: 필수 항목 누락 (성명, 핸드폰번호, 주민번호앞자리, 장애유형, 입사일)`);
            failCount++;
            continue;
          }

          // API 호출
          const res = await fetch(`${API_BASE}/employees`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(employeeData),
          });

          if (res.ok) {
            successCount++;
          } else {
            const errorData = await res.json();
            errors.push(`${i + 2}행 (${employeeData.name}): ${errorData.error || "등록 실패"}`);
            failCount++;
          }
        } catch (e: any) {
          errors.push(`${i + 2}행: ${e.message}`);
          failCount++;
        }
      }

      // 결과 메시지
      if (successCount > 0) {
        setMessage(`✅ ${successCount}명 등록 성공${failCount > 0 ? `, ${failCount}명 실패` : ""}`);
        await fetchEmployees(); // 목록 새로고침 (await 추가)
      } else {
        setError(`모든 등록 실패: ${failCount}명`);
      }

      if (errors.length > 0) {
        console.error("엑셀 업로드 오류:", errors);
        alert(`업로드 중 오류 발생:\n\n${errors.slice(0, 5).join("\n")}${errors.length > 5 ? `\n... 외 ${errors.length - 5}건` : ""}`);
      }
    } catch (e: any) {
      setError("엑셀 파일 읽기 실패: " + e.message);
    } finally {
      setLoading(false);
      // 파일 input 초기화
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  // 엑셀 날짜 형식 변환
  function formatExcelDate(value: any): string {
    if (!value) return "";
    
    // 이미 문자열 형식이면 그대로 반환
    if (typeof value === "string") {
      return value.trim();
    }
    
    // 엑셀 날짜 숫자 형식인 경우 변환
    if (typeof value === "number") {
      const date = XLSX.SSF.parse_date_code(value);
      if (date) {
        const year = date.y;
        const month = String(date.m).padStart(2, "0");
        const day = String(date.d).padStart(2, "0");
        return `${year}-${month}-${day}`;
      }
    }
    
    return "";
  }

  // ============================================
  // 렌더링
  // ============================================

  if (loading) {
    return (
      <div className="container">
        <div className="card">
          <p>로딩 중...</p>
        </div>
      </div>
    );
  }

  const activeEmployees = employees.filter((e) => !e.resignDate);
  const resignedEmployees = employees.filter((e) => e.resignDate);

  // 통계 계산
  const totalDisabled = activeEmployees.length;
  const severeCount = activeEmployees.filter(e => e.severity === "SEVERE").length;
  const mildCount = activeEmployees.filter(e => e.severity === "MILD").length;
  const femaleCount = activeEmployees.filter(e => e.gender === "F").length;
  const maleCount = activeEmployees.filter(e => e.gender === "M").length;

  return (
    <div className="container">
      <div className="card" style={{ maxWidth: "100%", margin: "20px auto" }}>
        <h1>👥 장애인 직원 등록·관리</h1>

        {/* 기업명 표시 */}
        {companyName && (
          <div style={{
            marginTop: 16,
            padding: "16px 24px",
            background: "linear-gradient(135deg, #0070f3 0%, #0051cc 100%)",
            borderRadius: 12,
            textAlign: "center",
            boxShadow: "0 4px 12px rgba(0, 112, 243, 0.3)",
          }}>
            <div style={{
              fontSize: 14,
              color: "rgba(255, 255, 255, 0.9)",
              marginBottom: 4,
              fontWeight: 500,
            }}>
              관리 기업
            </div>
            <div style={{
              fontSize: 24,
              fontWeight: 700,
              color: "white",
              letterSpacing: "-0.5px",
            }}>
              🏢 {companyName}
            </div>
          </div>
        )}

        <p style={{ color: "#666", marginTop: 16 }}>
          장애인 직원 정보를 등록하고 관리합니다. 입사일, 퇴사일 기준으로 월별 계산에 자동 반영됩니다.
        </p>

        {/* 메시지 */}
        {message && (
          <div
            style={{
              marginTop: 16,
              padding: 16,
              background: "#d1fae5",
              color: "#065f46",
              borderRadius: 8,
              fontWeight: "bold",
            }}
          >
            {message}
          </div>
        )}

        {error && (
          <div
            style={{
              marginTop: 16,
              padding: 16,
              background: "#fee2e2",
              color: "#991b1b",
              borderRadius: 8,
              fontWeight: "bold",
            }}
          >
            ❌ {error}
          </div>
        )}

        {/* 통계 요약 - 3개 섹션으로 분리 */}
        <div style={{ 
          marginTop: 24, 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", 
          gap: 20 
        }}>
          {/* 전체 */}
          <div style={{
            padding: 20,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            borderRadius: 12,
            color: "white"
          }}>
            <h3 style={{ margin: 0, fontSize: 18, marginBottom: 16 }}>📊 재직 중인 장애인 현황</h3>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 48, fontWeight: "bold" }}>{totalDisabled}명</div>
              <div style={{ fontSize: 16, opacity: 0.9, marginTop: 8 }}>전체</div>
            </div>
          </div>

          {/* 중증/경증 */}
          <div style={{
            padding: 20,
            background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
            borderRadius: 12,
            color: "white"
          }}>
            <h3 style={{ margin: 0, fontSize: 18, marginBottom: 16 }}>🏥 중증도별 현황</h3>
            <div style={{ display: "flex", justifyContent: "space-around" }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 40, fontWeight: "bold" }}>{severeCount}명</div>
                <div style={{ fontSize: 14, opacity: 0.9, marginTop: 4 }}>중증</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 40, fontWeight: "bold" }}>{mildCount}명</div>
                <div style={{ fontSize: 14, opacity: 0.9, marginTop: 4 }}>경증</div>
              </div>
            </div>
          </div>

          {/* 남성/여성 */}
          <div style={{
            padding: 20,
            background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
            borderRadius: 12,
            color: "white"
          }}>
            <h3 style={{ margin: 0, fontSize: 18, marginBottom: 16 }}>👥 성별 현황</h3>
            <div style={{ display: "flex", justifyContent: "space-around" }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 40, fontWeight: "bold" }}>{maleCount}명</div>
                <div style={{ fontSize: 14, opacity: 0.9, marginTop: 4 }}>남성</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 40, fontWeight: "bold" }}>{femaleCount}명</div>
                <div style={{ fontSize: 14, opacity: 0.9, marginTop: 4 }}>여성</div>
              </div>
            </div>
          </div>
        </div>

        {/* 직원 관리 섹션 */}
        <div style={{ marginTop: 32 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <h2 style={{ margin: 0 }}>직원 목록</h2>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={downloadExcelSample}
                style={{
                  padding: "10px 20px",
                  background: "#6366f1",
                  color: "white",
                  border: "none",
                  borderRadius: 6,
                  fontWeight: "bold",
                  cursor: "pointer",
                  fontSize: 15,
                }}
              >
                📥 엑셀 샘플
              </button>
              <label
                style={{
                  padding: "10px 20px",
                  background: "#8b5cf6",
                  color: "white",
                  border: "none",
                  borderRadius: 6,
                  fontWeight: "bold",
                  cursor: "pointer",
                  fontSize: 15,
                  display: "inline-flex",
                  alignItems: "center",
                }}
              >
                📤 엑셀 업로드
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleExcelUpload}
                  style={{ display: "none" }}
                />
              </label>
              <button
                onClick={() => {
                  resetForm();
                  setShowForm(true);
                }}
                style={{
                  padding: "10px 20px",
                  background: "#10b981",
                  color: "white",
                  border: "none",
                  borderRadius: 6,
                  fontWeight: "bold",
                  cursor: "pointer",
                  fontSize: 15,
                }}
              >
                ➕ 직원 추가
              </button>
            </div>
          </div>

          {/* 탭 */}
          <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
            <button
              onClick={() => setTab("active")}
              style={{
                padding: "10px 20px",
                background: tab === "active" ? "#3b82f6" : "#e5e7eb",
                color: tab === "active" ? "white" : "#666",
                border: "none",
                borderRadius: 6,
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              재직중 ({activeEmployees.length})
            </button>
            <button
              onClick={() => setTab("resigned")}
              style={{
                padding: "10px 20px",
                background: tab === "resigned" ? "#3b82f6" : "#e5e7eb",
                color: tab === "resigned" ? "white" : "#666",
                border: "none",
                borderRadius: 6,
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              퇴사 ({resignedEmployees.length})
            </button>
          </div>

          {/* 직원 폼 */}
          {showForm && (
            <div
              style={{
                marginTop: 16,
                padding: 24,
                background: "#f9fafb",
                borderRadius: 8,
                border: "2px solid #3b82f6",
              }}
            >
              <h3 style={{ marginTop: 0 }}>
                {editingId ? "✏️ 직원 정보 수정" : "➕ 새 직원 등록"}
              </h3>
              <form onSubmit={handleSubmit}>
                <div
                  style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}
                >
                  <div>
                    <label>이름 *</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label>핸드폰번호 * (직원 인증용)</label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="예: 010-1234-5678"
                      required
                    />
                    <p style={{ fontSize: 12, color: "#666", marginTop: 4 }}>
                      💡 직원 회원가입 시 본인 인증에 사용됩니다
                    </p>
                  </div>

                  <div>
                    <label>주민번호 앞자리 * (직원 인증용)</label>
                    <input
                      type="text"
                      value={form.registrationNumber}
                      onChange={(e) => setForm({ ...form, registrationNumber: e.target.value })}
                      placeholder="예: 850315"
                      maxLength={6}
                      pattern="[0-9]{6}"
                      required
                    />
                    <p style={{ fontSize: 12, color: "#666", marginTop: 4 }}>
                      💡 주민등록번호 앞 6자리만 입력 (직원 인증용)
                    </p>
                  </div>

                  <div>
                    <label>장애 유형 *</label>
                    <input
                      type="text"
                      value={form.disabilityType}
                      onChange={(e) =>
                        setForm({ ...form, disabilityType: e.target.value })
                      }
                      placeholder="예: 지체장애, 시각장애"
                      required
                    />
                  </div>

                  <div>
                    <label>장애 등급</label>
                    <input
                      type="text"
                      value={form.disabilityGrade}
                      onChange={(e) =>
                        setForm({ ...form, disabilityGrade: e.target.value })
                      }
                      placeholder="예: 2급"
                    />
                  </div>

                  <div>
                    <label>중증도 *</label>
                    <select
                      value={form.severity}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          severity: e.target.value as "MILD" | "SEVERE",
                        })
                      }
                      required
                    >
                      <option value="MILD">경증</option>
                      <option value="SEVERE">중증</option>
                    </select>
                  </div>

                  <div>
                    <label>성별 *</label>
                    <select
                      value={form.gender}
                      onChange={(e) =>
                        setForm({ ...form, gender: e.target.value as "M" | "F" })
                      }
                      required
                    >
                      <option value="M">남성</option>
                      <option value="F">여성</option>
                    </select>
                  </div>

                  <div>
                    <label>입사일 *</label>
                    <input
                      type="date"
                      value={form.hireDate}
                      onChange={(e) => setForm({ ...form, hireDate: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label>퇴사일</label>
                    <input
                      type="date"
                      value={form.resignDate}
                      onChange={(e) => setForm({ ...form, resignDate: e.target.value })}
                    />
                  </div>

                  <div>
                    <label>월간 근로시간 *</label>
                    <input
                      type="number"
                      value={form.monthlyWorkHours}
                      onChange={(e) => handleWorkHoursChange(Number(e.target.value))}
                      min="60"
                      max="240"
                      required
                    />
                    <p style={{ fontSize: 12, color: "#666", marginTop: 4 }}>
                      💡 월 60시간 이상 필수. 중증 월 60시간 이상: 의무고용 인원 계산에서 2명으로 인정
                    </p>
                  </div>

                  <div>
                    <label>월 급여 (원) * (자동 계산)</label>
                    <input
                      type="text"
                      value={new Intl.NumberFormat('ko-KR').format(calculateMonthlySalary(form.monthlyWorkHours || 0))}
                      readOnly
                      style={{
                        background: "#f3f4f6",
                        cursor: "not-allowed",
                      }}
                    />
                    <p style={{ fontSize: 12, color: "#10b981", marginTop: 4 }}>
                      ✅ 월 {form.monthlyWorkHours || 0}시간 × 10,320원 = {new Intl.NumberFormat('ko-KR').format(calculateMonthlySalary(form.monthlyWorkHours || 0))}원 (자동 계산됨)
                    </p>
                  </div>

                  <div>
                    <label>근무형태</label>
                    <select
                      value={form.workType}
                      onChange={(e) =>
                        setForm({ ...form, workType: e.target.value as "OFFICE" | "REMOTE" | "HYBRID" })
                      }
                    >
                      <option value="OFFICE">사무실 근무</option>
                      <option value="REMOTE">재택 근무</option>
                      <option value="HYBRID">혼합 (사무실 + 재택)</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <input
                        type="checkbox"
                        checked={form.hasEmploymentInsurance}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            hasEmploymentInsurance: e.target.checked,
                          })
                        }
                      />
                      <span>고용보험 가입</span>
                    </label>
                  </div>

                  <div>
                    <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <input
                        type="checkbox"
                        checked={form.meetsMinimumWage}
                        onChange={(e) =>
                          setForm({ ...form, meetsMinimumWage: e.target.checked })
                        }
                      />
                      <span>최저임금 이상</span>
                    </label>
                  </div>
                </div>

                <div style={{ marginTop: 16 }}>
                  <label>메모</label>
                  <textarea
                    value={form.memo}
                    onChange={(e) => setForm({ ...form, memo: e.target.value })}
                    rows={3}
                    placeholder="특이사항 입력..."
                  />
                </div>

                <div style={{ marginTop: 20, display: "flex", gap: 8 }}>
                  <button
                    type="submit"
                    style={{
                      flex: 1,
                      padding: 14,
                      background: "#3b82f6",
                      color: "white",
                      border: "none",
                      borderRadius: 6,
                      fontWeight: "bold",
                      cursor: "pointer",
                      fontSize: 15,
                    }}
                  >
                    {editingId ? "✅ 수정 완료" : "➕ 등록하기"}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    style={{
                      padding: 14,
                      background: "#6b7280",
                      color: "white",
                      border: "none",
                      borderRadius: 6,
                      cursor: "pointer",
                      fontSize: 15,
                    }}
                  >
                    취소
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* 직원 목록 */}
          <div style={{ marginTop: 16 }}>
            {(tab === "active" ? activeEmployees : resignedEmployees).length === 0 ? (
              <div style={{
                textAlign: "center",
                padding: 60,
                background: "#f9fafb",
                borderRadius: 8,
                border: "2px dashed #d1d5db"
              }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>👤</div>
                <p style={{ color: "#999", margin: 0, fontSize: 16 }}>
                  {tab === "active" ? "등록된 직원이 없습니다." : "퇴사한 직원이 없습니다."}
                </p>
                {tab === "active" && (
                  <p style={{ color: "#999", margin: "8px 0 0 0", fontSize: 14 }}>
                    상단의 "➕ 직원 추가" 버튼을 눌러 장애인 직원을 등록하세요.
                  </p>
                )}
              </div>
            ) : (
              <div style={{ display: "grid", gap: 12 }}>
                {(tab === "active" ? activeEmployees : resignedEmployees).map((emp) => (
                  <div
                    key={emp.id}
                    style={{
                      padding: 20,
                      background: "white",
                      border: "1px solid #e5e7eb",
                      borderRadius: 8,
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
                      e.currentTarget.style.transform = "translateY(-2px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = "none";
                      e.currentTarget.style.transform = "translateY(0)";
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <h3 style={{ margin: 0, fontSize: 20, display: "flex", alignItems: "center", gap: 8 }}>
                          {emp.name}
                          <span
                            style={{
                              padding: "3px 10px",
                              fontSize: 13,
                              background:
                                emp.severity === "SEVERE" ? "#fef3c7" : "#e0e7ff",
                              color: emp.severity === "SEVERE" ? "#92400e" : "#3730a3",
                              borderRadius: 4,
                              fontWeight: "normal",
                            }}
                          >
                            {emp.severity === "SEVERE" ? "중증" : "경증"}
                          </span>
                          <span
                            style={{
                              padding: "3px 10px",
                              fontSize: 13,
                              background: emp.gender === "F" ? "#fce7f3" : "#dbeafe",
                              color: emp.gender === "F" ? "#831843" : "#1e3a8a",
                              borderRadius: 4,
                              fontWeight: "normal",
                            }}
                          >
                            {emp.gender === "F" ? "여성" : "남성"}
                          </span>
                        </h3>
                        <p style={{ margin: "10px 0 0 0", fontSize: 15, color: "#666" }}>
                          🏷️ {emp.disabilityType}
                          {emp.disabilityGrade && ` ${emp.disabilityGrade}`}
                        </p>
                        {emp.phone && (
                          <p style={{ margin: "6px 0 0 0", fontSize: 14, color: "#666" }}>
                            📱 핸드폰: {emp.phone}
                          </p>
                        )}
                        {emp.registrationNumber && (
                          <p style={{ margin: "6px 0 0 0", fontSize: 14, color: "#666" }}>
                            🆔 주민번호: {emp.registrationNumber.substring(0, 3)}***
                          </p>
                        )}
                        <p style={{ margin: "6px 0 0 0", fontSize: 14, color: "#666" }}>
                          ⏰ 근로시간: 월 {emp.monthlyWorkHours || 60}시간 | 💰 월급: {new Intl.NumberFormat('ko-KR').format(Number(emp.monthlySalary))}원 (시급 10,320원)
                        </p>
                        <p style={{ margin: "6px 0 0 0", fontSize: 14, color: "#666" }}>
                          🏢 근무형태: {
                            emp.workType === "REMOTE" ? "재택 근무" :
                            emp.workType === "HYBRID" ? "혼합 (사무실+재택)" :
                            "사무실 근무"
                          }
                        </p>
                        <p style={{ margin: "6px 0 0 0", fontSize: 14, color: "#999" }}>
                          📅 입사: {emp.hireDate.split("T")[0]}
                          {emp.resignDate && ` | 퇴사: ${emp.resignDate.split("T")[0]}`}
                        </p>
                        {emp.memo && (
                          <p style={{ margin: "10px 0 0 0", fontSize: 13, color: "#666", fontStyle: "italic", padding: "8px 12px", background: "#f9fafb", borderRadius: 4 }}>
                            💬 {emp.memo}
                          </p>
                        )}
                      </div>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button
                          onClick={() => startEdit(emp)}
                          style={{
                            padding: "8px 16px",
                            background: "#3b82f6",
                            color: "white",
                            border: "none",
                            borderRadius: 4,
                            fontSize: 14,
                            cursor: "pointer",
                            fontWeight: "bold",
                          }}
                        >
                          수정
                        </button>
                        <button
                          onClick={() => handleDelete(emp.id)}
                          style={{
                            padding: "8px 16px",
                            background: "#ef4444",
                            color: "white",
                            border: "none",
                            borderRadius: 4,
                            fontSize: 14,
                            cursor: "pointer",
                            fontWeight: "bold",
                          }}
                        >
                          삭제
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 안내 박스 */}
        <div
          style={{
            marginTop: 32,
            padding: 20,
            background: "#eff6ff",
            borderRadius: 8,
            border: "1px solid #bfdbfe",
          }}
        >
          <h4 style={{ margin: 0, color: "#1e40af", fontSize: 16 }}>
            💡 직원 등록 안내
          </h4>
          <ul style={{ marginTop: 12, paddingLeft: 20, color: "#1e3a8a", fontSize: 14, lineHeight: 1.8 }}>
            <li>
              <strong>입사일/퇴사일</strong>을 정확히 입력하면 월별 계산 시 자동으로 재직 여부가 반영됩니다.
            </li>
            <li>
              <strong>근로시간</strong>을 입력하면 최저임금이 자동 계산됩니다 (1,000원 단위 반올림).
            </li>
            <li>
              <strong>중증 장애인</strong>이 주 60시간 이상 근무하면 부담금 인정 시 2배 계산됩니다.
            </li>
            <li>
              장려금은 <strong>성별, 중증도, 연령, 근로시간</strong>에 따라 차등 지급됩니다.
            </li>
            <li>
              등록 완료 후 <strong>"월별 고용장려금부담금 관리"</strong> 메뉴에서 상시근로자 수를 입력하면 자동 계산됩니다.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
