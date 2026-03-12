import { Router } from "express";
import { z } from "zod";
import { prisma } from "../index.js";
import { requireAuth } from "../middleware/auth.js";
import { getKSTDate, getKSTTime, getKSTNow } from "../utils/kst.js";
import { getUserCompany, getBuyerId } from "../utils/company.js";

const router = Router();

// ============================================
// 📅 출퇴근 기록 API
// ============================================

/**
 * POST /attendance/clock-in
 * 출근 체크
 */
router.post("/clock-in", requireAuth, async (req, res) => {
  try {
    const userId = req.user!.id;
    const userRole = req.user!.role;

    // 직원 계정만 출근 가능
    if (userRole !== "EMPLOYEE") {
      return res.status(403).json({ error: "직원 계정만 출근할 수 있습니다." });
    }

    const schema = z.object({
      workType: z.enum(["OFFICE", "REMOTE"]),
      location: z.string().optional(), // GPS 좌표 (선택)
      note: z.string().optional(),
    });

    const body = schema.parse(req.body);

    // 사용자 정보 조회 (companyId 포함)
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        employeeId: true,
        companyId: true,
      },
    });

    if (!user || !user.employeeId || !user.companyId) {
      return res.status(404).json({ error: "직원 정보를 찾을 수 없습니다." });
    }

    // DisabledEmployee 정보 조회 (buyerId 획득)
    const employee = await prisma.disabledEmployee.findUnique({
      where: { id: user.employeeId },
      select: { id: true, buyerId: true },
    });

    if (!employee) {
      return res.status(404).json({ error: "장애인 직원 정보를 찾을 수 없습니다." });
    }

    // 오늘 날짜 (한국 시간)
    const today = getKSTDate(); // YYYY-MM-DD (KST)
    const clockInTime = getKSTTime(); // HH:MM:SS (KST)

    // 오늘 이미 출근했는지 확인
    const existing = await prisma.attendanceRecord.findUnique({
      where: {
        employeeId_date: {
          employeeId: user.employeeId,
          date: today,
        },
      },
    });

    if (existing) {
      return res.status(400).json({ 
        error: "ALREADY_CLOCKED_IN", 
        message: "이미 출근 처리되었습니다.",
        record: existing,
      });
    }

    // 출근 기록 생성
    const record = await prisma.attendanceRecord.create({
      data: {
        companyId: user.companyId,
        buyerId: employee.buyerId,
        employeeId: user.employeeId,
        userId: user.id,
        date: today,
        workType: body.workType,
        clockIn: clockInTime,
        location: body.location,
        note: body.note,
      },
    });

    return res.json({ 
      message: "출근 처리되었습니다.", 
      record,
    });
  } catch (error: any) {
    console.error("출근 체크 실패:", error);
    return res.status(500).json({ error: error.message });
  }
});

/**
 * POST /attendance/clock-out
 * 퇴근 체크
 */
router.post("/clock-out", requireAuth, async (req, res) => {
  try {
    const userId = req.user!.id;
    const userRole = req.user!.role;

    if (userRole !== "EMPLOYEE") {
      return res.status(403).json({ error: "직원 계정만 퇴근할 수 있습니다." });
    }

    const schema = z.object({
      note: z.string().optional(),
    });

    const body = schema.parse(req.body);

    // 사용자 정보 조회
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.employeeId) {
      return res.status(404).json({ error: "직원 정보를 찾을 수 없습니다." });
    }

    // 오늘 날짜
    // 오늘 날짜 (한국 시간)
    const today = getKSTDate(); // YYYY-MM-DD (KST)
    const now = getKSTNow(); // 한국 시간 Date 객체
    const clockOutTime = getKSTTime(); // HH:MM:SS (KST)

    // 오늘 출근 기록 확인
    const record = await prisma.attendanceRecord.findUnique({
      where: {
        employeeId_date: {
          employeeId: user.employeeId,
          date: today,
        },
      },
    });

    if (!record) {
      return res.status(400).json({ 
        error: "NO_CLOCK_IN", 
        message: "출근 기록이 없습니다. 먼저 출근 체크를 해주세요.",
      });
    }

    if (record.clockOut) {
      return res.status(400).json({ 
        error: "ALREADY_CLOCKED_OUT", 
        message: "이미 퇴근 처리되었습니다.",
        record,
      });
    }

    // 근무 시간 계산
    const clockInParts = record.clockIn!.split(":").map(Number);
    const clockOutParts = clockOutTime.split(":").map(Number);

    const clockInMinutes = clockInParts[0] * 60 + clockInParts[1];
    const clockOutMinutes = clockOutParts[0] * 60 + clockOutParts[1];

    let workMinutes = clockOutMinutes - clockInMinutes;
    if (workMinutes < 0) {
      workMinutes += 24 * 60; // 자정을 넘긴 경우
    }

    const workHours = Math.round((workMinutes / 60) * 100) / 100; // 소수점 2자리

    // 조퇴 체크 (17:00 이전)
    const hour = now.getHours();
    if (hour < 17) {
      // 직원 정보 조회
      const employee = await prisma.disabledEmployee.findUnique({
        where: { id: user.employeeId },
        select: { name: true, buyerId: true }
      });
      
      if (employee) {
        // 동적 import로 notificationService 로드
        const { notifyAttendanceEarlyLeave } = await import('../services/notificationService.js');
        await notifyAttendanceEarlyLeave(
          employee.buyerId,
          employee.name,
          user.employeeId,
          clockOutTime
        );
      }
    }

    // 퇴근 기록 업데이트
    const updated = await prisma.attendanceRecord.update({
      where: { id: record.id },
      data: {
        clockOut: clockOutTime,
        workHours,
        note: body.note || record.note,
      },
    });

    return res.json({ 
      message: "퇴근 처리되었습니다.", 
      record: updated,
      workHours,
    });
  } catch (error: any) {
    console.error("퇴근 체크 실패:", error);
    return res.status(500).json({ error: error.message });
  }
});

/**
 * GET /attendance/my-records
 * 직원 본인의 출퇴근 기록 조회
 */
router.get("/my-records", requireAuth, async (req, res) => {
  try {
    const userId = req.user!.id;
    const userRole = req.user!.role;

    if (userRole !== "EMPLOYEE") {
      return res.status(403).json({ error: "직원 계정만 조회할 수 있습니다." });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.employeeId) {
      return res.status(404).json({ error: "직원 정보를 찾을 수 없습니다." });
    }

    const { year, month } = req.query;

    let records;
    if (year && month) {
      // 특정 월 조회
      const yearNum = parseInt(year as string);
      const monthNum = parseInt(month as string);
      const startDate = `${yearNum}-${String(monthNum).padStart(2, "0")}-01`;
      const endDate = `${yearNum}-${String(monthNum).padStart(2, "0")}-31`;

      records = await prisma.attendanceRecord.findMany({
        where: {
          employeeId: user.employeeId,
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
        orderBy: { date: "desc" },
      });
    } else {
      // 최근 30일 조회
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const startDate = thirtyDaysAgo.toISOString().split("T")[0];

      records = await prisma.attendanceRecord.findMany({
        where: {
          employeeId: user.employeeId,
          date: { gte: startDate },
        },
        orderBy: { date: "desc" },
      });
    }

    // 통계 계산
    const totalDays = records.length;
    const officeDays = records.filter(r => r.workType === "OFFICE").length;
    const remoteDays = records.filter(r => r.workType === "REMOTE").length;
    const totalHours = records.reduce((sum, r) => sum + (r.workHours || 0), 0);

    return res.json({ 
      records,
      stats: {
        totalDays,
        officeDays,
        remoteDays,
        totalHours: Math.round(totalHours * 100) / 100,
      },
    });
  } catch (error: any) {
    console.error("출퇴근 기록 조회 실패:", error);
    return res.status(500).json({ error: error.message });
  }
});

/**
 * GET /attendance/today
 * 오늘 출퇴근 상태 조회
 */
router.get("/today", requireAuth, async (req, res) => {
  try {
    const userId = req.user!.id;
    const userRole = req.user!.role;

    if (userRole !== "EMPLOYEE") {
      return res.status(403).json({ error: "직원 계정만 조회할 수 있습니다." });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.employeeId) {
      return res.status(404).json({ error: "직원 정보를 찾을 수 없습니다." });
    }

    const today = getKSTDate();

    const record = await prisma.attendanceRecord.findUnique({
      where: {
        employeeId_date: {
          employeeId: user.employeeId,
          date: today,
        },
      },
    });

    // 직원 정보와 회사 정보 가져오기
    const employee = await prisma.disabledEmployee.findUnique({
      where: { id: user.employeeId },
      include: {
        buyer: {
          include: {
            company: {
              select: {
                name: true,
                bizNo: true,
              }
            }
          }
        }
      }
    });

    return res.json({ 
      today,
      record: record || null,
      status: !record ? "NOT_CLOCKED_IN" : (record.clockOut ? "CLOCKED_OUT" : "WORKING"),
      employee: employee ? {
        name: employee.name,
        companyName: employee.buyer.company.name,
      } : null,
    });
  } catch (error: any) {
    console.error("오늘 상태 조회 실패:", error);
    return res.status(500).json({ error: error.message });
  }
});

/**
 * GET /attendance/company
 * 관리자용: 회사 전체 직원 출퇴근 현황
 */
router.get("/company", requireAuth, async (req, res) => {
  try {
    const userId = req.user!.id;
    const userRole = req.user!.role;

    // BUYER, SUPPLIER, SUPER_ADMIN 모두 접근 가능
    if (userRole !== "BUYER" && userRole !== "SUPPLIER" && userRole !== "SUPER_ADMIN") {
      return res.status(403).json({ error: "부담금기업 또는 표준사업장만 접근 가능합니다." });
    }

    // ✅ 통합 헬퍼 함수 사용
    const company = await getUserCompany(userId, userRole);
    const buyerId = getBuyerId(company);

    if (!company || !buyerId) {
      return res.status(404).json({ error: "기업 정보가 없습니다." });
    }

    const { year, month, date } = req.query;

    // 직원 목록 조회
    const employees = await prisma.disabledEmployee.findMany({
      where: { 
        buyerId: buyerId,
        resignDate: null, // 재직 중인 직원만
      },
      orderBy: { name: "asc" },
    });

    let records;
    if (date) {
      // 특정 날짜 조회
      records = await prisma.attendanceRecord.findMany({
        where: {
          employeeId: { in: employees.map(e => e.id) },
          date: date as string,
        },
        include: {
          employee: true,
        },
      });
    } else if (year && month) {
      // 특정 월 조회
      const yearNum = parseInt(year as string);
      const monthNum = parseInt(month as string);
      const startDate = `${yearNum}-${String(monthNum).padStart(2, "0")}-01`;
      const endDate = `${yearNum}-${String(monthNum).padStart(2, "0")}-31`;

      records = await prisma.attendanceRecord.findMany({
        where: {
          employeeId: { in: employees.map(e => e.id) },
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
        include: {
          employee: true,
        },
        orderBy: [{ date: "desc" }, { employee: { name: "asc" } }],
      });
    } else {
      // 오늘 조회 (기본값)
      const today = getKSTDate();
      records = await prisma.attendanceRecord.findMany({
        where: {
          employeeId: { in: employees.map(e => e.id) },
          date: today,
        },
        include: {
          employee: true,
        },
      });
    }

    // 직원별 통계
    const employeeStats = employees.map(emp => {
      const empRecords = records.filter(r => r.employeeId === emp.id);
      const totalDays = empRecords.length;
      const officeDays = empRecords.filter(r => r.workType === "OFFICE").length;
      const remoteDays = empRecords.filter(r => r.workType === "REMOTE").length;
      const totalHours = empRecords.reduce((sum, r) => sum + (r.workHours || 0), 0);

      return {
        employee: emp,
        stats: {
          totalDays,
          officeDays,
          remoteDays,
          totalHours: Math.round(totalHours * 100) / 100,
        },
      };
    });

    return res.json({ 
      employees: employeeStats,
      records,
      companyName: company.name,
    });
  } catch (error: any) {
    console.error("회사 출퇴근 현황 조회 실패:", error);
    return res.status(500).json({ error: error.message });
  }
});

/**
 * PUT /attendance/:id
 * 출퇴근 기록 수정 (관리자 또는 본인)
 */
router.put("/:id", requireAuth, async (req, res) => {
  try {
    const userId = req.user!.id;
    const userRole = req.user!.role;
    const recordId = req.params.id;

    const schema = z.object({
      workType: z.enum(["OFFICE", "REMOTE"]).optional(),
      clockIn: z.string().optional(),
      clockOut: z.string().optional(),
      note: z.string().optional(),
    });

    const body = schema.parse(req.body);

    // 기존 기록 조회
    const record = await prisma.attendanceRecord.findUnique({
      where: { id: recordId },
      include: { employee: { include: { buyer: true } } },
    });

    if (!record) {
      return res.status(404).json({ error: "출퇴근 기록을 찾을 수 없습니다." });
    }

    // 권한 확인
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const isOwner = user?.employeeId === record.employeeId;
    const isManager = userRole === "BUYER" || userRole === "SUPPLIER" || userRole === "SUPER_ADMIN";

    if (!isOwner && !isManager) {
      return res.status(403).json({ error: "수정 권한이 없습니다." });
    }

    // 근무시간 재계산 (출근/퇴근 시간이 변경된 경우)
    let workHours = record.workHours;
    const clockIn = body.clockIn || record.clockIn;
    const clockOut = body.clockOut || record.clockOut;

    if (clockIn && clockOut) {
      const clockInParts = clockIn.split(":").map(Number);
      const clockOutParts = clockOut.split(":").map(Number);
      const clockInMinutes = clockInParts[0] * 60 + clockInParts[1];
      const clockOutMinutes = clockOutParts[0] * 60 + clockOutParts[1];
      let workMinutes = clockOutMinutes - clockInMinutes;
      if (workMinutes < 0) workMinutes += 24 * 60;
      workHours = Math.round((workMinutes / 60) * 100) / 100;
    }

    const updated = await prisma.attendanceRecord.update({
      where: { id: recordId },
      data: {
        workType: body.workType,
        clockIn: body.clockIn,
        clockOut: body.clockOut,
        workHours,
        note: body.note,
      },
    });

    return res.json({ message: "출퇴근 기록이 수정되었습니다.", record: updated });
  } catch (error: any) {
    console.error("출퇴근 기록 수정 실패:", error);
    return res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /attendance/:id
 * 출퇴근 기록 삭제 (관리자만)
 */
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const userId = req.user!.id;
    const userRole = req.user!.role;
    const recordId = req.params.id;

    // BUYER, SUPPLIER, SUPER_ADMIN 모두 접근 가능
    if (userRole !== "BUYER" && userRole !== "SUPPLIER" && userRole !== "SUPER_ADMIN") {
      return res.status(403).json({ error: "부담금기업 또는 표준사업장만 접근 가능합니다." });
    }

    await prisma.attendanceRecord.delete({
      where: { id: recordId },
    });

    return res.json({ success: true, message: "출퇴근 기록이 삭제되었습니다." });
  } catch (error: any) {
    console.error("출퇴근 기록 삭제 실패:", error);
    return res.status(500).json({ error: error.message });
  }
});

// ============================================
// 테스트 엔드포인트 (개발/검증용)
// ============================================

/**
 * POST /attendance/test/check-late
 * 지각 체크 수동 실행 (테스트용)
 */
router.post("/test/check-late", requireAuth, async (req, res) => {
  try {
    const userRole = req.user!.role;
    
    // 관리자만 실행 가능
    if (!['BUYER', 'SUPER_ADMIN'].includes(userRole)) {
      return res.status(403).json({ error: "관리자만 실행할 수 있습니다." });
    }
    
    const { runAttendanceLateCheck } = await import('../schedulers/attendanceScheduler.js');
    const result = await runAttendanceLateCheck();
    
    return res.json({
      success: true,
      message: "지각 체크 완료",
      count: result.count,
      employees: result.employees.map(e => ({
        id: e.id,
        name: e.name,
        buyerId: e.buyerId
      }))
    });
  } catch (error: any) {
    console.error("지각 체크 실행 실패:", error);
    return res.status(500).json({ error: error.message });
  }
});

/**
 * POST /attendance/test/check-absent
 * 무단결근 체크 수동 실행 (테스트용)
 */
router.post("/test/check-absent", requireAuth, async (req, res) => {
  try {
    const userRole = req.user!.role;
    
    // 관리자만 실행 가능
    if (!['BUYER', 'SUPER_ADMIN'].includes(userRole)) {
      return res.status(403).json({ error: "관리자만 실행할 수 있습니다." });
    }
    
    const { runAttendanceAbsentCheck } = await import('../schedulers/attendanceScheduler.js');
    const result = await runAttendanceAbsentCheck();
    
    return res.json({
      success: true,
      message: "무단결근 체크 완료",
      count: result.count,
      employees: result.employees.map(e => ({
        id: e.id,
        name: e.name,
        buyerId: e.buyerId
      }))
    });
  } catch (error: any) {
    console.error("무단결근 체크 실행 실패:", error);
    return res.status(500).json({ error: error.message });
  }
});

export default router;
