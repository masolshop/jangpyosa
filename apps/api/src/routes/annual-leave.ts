import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { prisma } from '../lib/prisma.js';
import { handleError, NotFoundError, UnauthorizedError, BadRequestError } from '../lib/errors.js';
import {
  getOrCreateAnnualLeaveBalance,
  getActiveEmployeesByCompany,
  getBulkAnnualLeaveBalances
} from '../lib/annual-leave-service.js';
import { needsLeavePromotion, calculateAnnualLeave, calculateDailyWage, getLeavePromotionDates } from '../lib/annual-leave.js';

const router = Router();

// ==================== 유틸리티 함수 ====================

/**
 * 사용자 권한 확인
 */
async function checkUserPermission(userId: string, companyId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true, companyId: true }
  });

  if (!user) {
    throw new NotFoundError('사용자');
  }

  const hasPermission = 
    user.role === 'SUPER_ADMIN' ||
    (user.role === 'BUYER' && user.companyId === companyId);

  if (!hasPermission) {
    throw new UnauthorizedError();
  }

  return user;
}

// ==================== 연차 잔여 조회 ====================

/**
 * GET /api/annual-leave/company/:companyId
 * 회사의 모든 직원 연차 현황 조회 (최적화됨)
 */
router.get('/company/:companyId', requireAuth, async (req, res) => {
  try {
    const { companyId } = req.params;
    const year = req.query.year ? parseInt(req.query.year as string) : new Date().getFullYear();
    
    // 권한 확인
    await checkUserPermission(req.user!.id, companyId);

    // 회사 및 직원 정보 조회
    const { company, employees } = await getActiveEmployeesByCompany(companyId);

    // 연차 잔액 일괄 조회 (N+1 문제 해결)
    const employeeIds = employees.map(e => e.id);
    const balances = await getBulkAnnualLeaveBalances(employeeIds, year);

    // 직원 정보와 병합
    const balancesWithEmployee = balances.map((balance, index) => ({
      ...balance,
      employeeName: employees[index].name,
      phone: employees[index].phone
    }));

    res.json({
      company: {
        id: company.id,
        name: company.name,
        bizNo: company.bizNo
      },
      year,
      totalEmployees: employees.length,
      balances: balancesWithEmployee
    });
  } catch (error) {
    handleError(error, res);
  }
});

/**
 * GET /api/annual-leave/employee/:employeeId
 * 특정 직원의 연차 현황 조회 (최적화됨)
 */
router.get('/employee/:employeeId', requireAuth, async (req, res) => {
  try {
    const { employeeId } = req.params;
    const year = req.query.year ? parseInt(req.query.year as string) : new Date().getFullYear();
    const reqUser = req.user!;

    // 직원 정보 조회
    const employee = await prisma.disabledEmployee.findUnique({
      where: { id: employeeId },
      include: {
        buyer: {
          include: { company: true }
        }
      }
    });

    if (!employee) {
      throw new NotFoundError('직원 정보');
    }

    // 권한 확인
    const user = await prisma.user.findUnique({
      where: { id: reqUser.id },
      select: { id: true, role: true, companyId: true, employeeId: true }
    });

    if (!user) {
      throw new NotFoundError('사용자');
    }

    const isOwner = user.employeeId === employeeId;
    const isManager = user.companyId === employee.buyer.companyId && 
                     (user.role === 'BUYER' || user.role === 'SUPER_ADMIN');

    if (!isOwner && !isManager) {
      throw new UnauthorizedError();
    }

    // 연차 데이터 조회 또는 생성
    const balance = await getOrCreateAnnualLeaveBalance(employeeId, year);

    // 올해 사용한 휴가 조회
    const usedLeaves = await prisma.leaveRequest.findMany({
      where: {
        employeeId,
        status: 'APPROVED',
        startDate: {
          gte: new Date(year, 0, 1),
          lt: new Date(year + 1, 0, 1)
        }
      },
      include: { leaveType: true },
      orderBy: { startDate: 'desc' }
    });

    const usedDays = usedLeaves.reduce((sum, leave) => sum + leave.days, 0);

    // 실제 사용 연차로 업데이트 (차이가 있을 경우만)
    if (balance.used !== usedDays) {
      await prisma.annualLeaveBalance.update({
        where: { id: balance.id },
        data: {
          used: usedDays,
          remaining: balance.totalGenerated - usedDays
        }
      });
      balance.used = usedDays;
      balance.remaining = balance.totalGenerated - usedDays;
    }

    // 촉진 알림 확인
    const promotion = needsLeavePromotion(balance.expiryDate);

    res.json({
      balance,
      employee: {
        id: employee.id,
        name: employee.name,
        phone: employee.phone,
        hireDate: employee.hireDate
      },
      usedLeaves,
      promotion
    });
  } catch (error) {
    handleError(error, res);
  }
});

// ==================== 연차 갱신 및 관리 ====================

/**
 * POST /api/annual-leave/recalculate
 * 모든 직원의 연차 재계산 (배치 작업, 최적화됨)
 */
router.post('/recalculate', requireAuth, async (req, res) => {
  try {
    const reqUser = req.user!;
    const { year } = req.body;
    const targetYear = year || new Date().getFullYear();
    
    // 사용자 정보 조회
    const user = await prisma.user.findUnique({
      where: { id: reqUser.id },
      select: { id: true, role: true, companyId: true }
    });

    if (!user) {
      throw new NotFoundError('사용자');
    }
    
    if (user.role !== 'BUYER' && user.role !== 'SUPER_ADMIN') {
      throw new UnauthorizedError();
    }

    if (!user.companyId) {
      throw new BadRequestError('회사 소속이 아닙니다');
    }

    // 회사의 모든 재직 직원 조회
    const { employees } = await getActiveEmployeesByCompany(user.companyId);

    let created = 0;
    let updated = 0;

    // 트랜잭션으로 일괄 처리
    await prisma.$transaction(async (tx) => {
      for (const employee of employees) {
        // 사용한 연차 계산
        const usedLeaves = await tx.leaveRequest.findMany({
          where: {
            employeeId: employee.id,
            status: 'APPROVED',
            startDate: {
              gte: new Date(targetYear, 0, 1),
              lt: new Date(targetYear + 1, 0, 1)
            }
          },
          select: { days: true }
        });

        const usedDays = usedLeaves.reduce((sum, leave) => sum + leave.days, 0);

        // 연차 계산
        const leaveInfo = calculateAnnualLeave(
          employee.id,
          employee.name,
          employee.hireDate,
          usedDays,
          new Date(),
          false
        );

        const { firstNotice, secondNotice } = getLeavePromotionDates(leaveInfo.expiryDate!);

        // 기존 데이터 확인
        const existing = await tx.annualLeaveBalance.findFirst({
          where: {
            employeeId: employee.id,
            year: targetYear
          }
        });

        if (existing) {
          await tx.annualLeaveBalance.update({
            where: { id: existing.id },
            data: {
              workYears: leaveInfo.workYears,
              workMonths: leaveInfo.workMonths,
              totalGenerated: leaveInfo.totalGenerated,
              baseLeave: leaveInfo.baseLeave,
              bonusLeave: leaveInfo.bonusLeave,
              used: usedDays,
              remaining: leaveInfo.remaining,
              isUnderOneYear: leaveInfo.isUnderOneYear,
              expiryDate: leaveInfo.expiryDate!,
              firstNoticeDate: firstNotice,
              secondNoticeDate: secondNotice,
              dailyWage: calculateDailyWage(employee.monthlySalary)
            }
          });
          updated++;
        } else {
          await tx.annualLeaveBalance.create({
            data: {
              companyId: user.companyId!,
              buyerId: employee.buyerId,
              employeeId: employee.id,
              userId: null,
              hireDate: employee.hireDate,
              workYears: leaveInfo.workYears,
              workMonths: leaveInfo.workMonths,
              year: targetYear,
              totalGenerated: leaveInfo.totalGenerated,
              baseLeave: leaveInfo.baseLeave,
              bonusLeave: leaveInfo.bonusLeave,
              used: usedDays,
              remaining: leaveInfo.remaining,
              isUnderOneYear: leaveInfo.isUnderOneYear,
              expiryDate: leaveInfo.expiryDate!,
              firstNoticeDate: firstNotice,
              secondNoticeDate: secondNotice,
              firstNoticeSent: false,
              secondNoticeSent: false,
              dailyWage: calculateDailyWage(employee.monthlySalary),
              unusedPayment: null
            }
          });
          created++;
        }
      }
    });

    res.json({
      success: true,
      message: `연차 재계산 완료`,
      year: targetYear,
      totalEmployees: employees.length,
      created,
      updated
    });
  } catch (error) {
    handleError(error, res);
  }
});

/**
 * GET /api/annual-leave/promotion-notices
 * 연차 촉진 알림 대상 조회 (최적화됨)
 */
router.get('/promotion-notices', requireAuth, async (req, res) => {
  try {
    const reqUser = req.user!;
    
    // 사용자 정보 조회
    const user = await prisma.user.findUnique({
      where: { id: reqUser.id },
      select: { id: true, role: true, companyId: true }
    });

    if (!user) {
      throw new NotFoundError('사용자');
    }
    
    if (user.role !== 'BUYER' && user.role !== 'SUPER_ADMIN') {
      throw new UnauthorizedError();
    }

    if (!user.companyId) {
      throw new BadRequestError('회사 소속이 아닙니다');
    }

    const now = new Date();
    const currentYear = now.getFullYear();

    // 1차 및 2차 알림 대상 동시 조회
    const [firstNoticeTargets, secondNoticeTargets] = await Promise.all([
      prisma.annualLeaveBalance.findMany({
        where: {
          companyId: user.companyId,
          year: currentYear,
          firstNoticeSent: false,
          firstNoticeDate: { lte: now }
        }
      }),
      prisma.annualLeaveBalance.findMany({
        where: {
          companyId: user.companyId,
          year: currentYear,
          secondNoticeSent: false,
          secondNoticeDate: { lte: now }
        }
      })
    ]);

    // 직원 정보 추가
    const employeeIds = [
      ...new Set([
        ...firstNoticeTargets.map(b => b.employeeId),
        ...secondNoticeTargets.map(b => b.employeeId)
      ])
    ];

    const employees = await prisma.disabledEmployee.findMany({
      where: { id: { in: employeeIds } },
      select: { id: true, name: true, phone: true }
    });

    const employeeMap = new Map(employees.map(e => [e.id, e]));

    const firstNotices = firstNoticeTargets.map(balance => ({
      ...balance,
      employee: employeeMap.get(balance.employeeId)
    }));

    const secondNotices = secondNoticeTargets.map(balance => ({
      ...balance,
      employee: employeeMap.get(balance.employeeId)
    }));

    res.json({
      firstNotices,
      secondNotices,
      totalFirstNotices: firstNotices.length,
      totalSecondNotices: secondNotices.length
    });
  } catch (error) {
    handleError(error, res);
  }
});

/**
 * POST /api/annual-leave/send-promotion-notice
 * 연차 촉진 알림 발송
 */
router.post('/send-promotion-notice', requireAuth, async (req, res) => {
  try {
    const reqUser = req.user!;
    const { balanceId, noticeType } = req.body;
    
    // 사용자 정보 조회
    const user = await prisma.user.findUnique({
      where: { id: reqUser.id },
      select: { id: true, role: true, companyId: true }
    });

    if (!user) {
      throw new NotFoundError('사용자');
    }
    
    if (user.role !== 'BUYER' && user.role !== 'SUPER_ADMIN') {
      throw new UnauthorizedError();
    }

    if (!balanceId || !noticeType) {
      throw new BadRequestError('필수 항목을 입력해주세요');
    }

    const balance = await prisma.annualLeaveBalance.findUnique({
      where: { id: balanceId }
    });

    if (!balance) {
      throw new NotFoundError('연차 정보');
    }

    if (balance.companyId !== user.companyId) {
      throw new UnauthorizedError();
    }

    // 발송 상태 업데이트
    const updated = await prisma.annualLeaveBalance.update({
      where: { id: balanceId },
      data: {
        ...(noticeType === 'first' && { firstNoticeSent: true }),
        ...(noticeType === 'second' && { secondNoticeSent: true })
      }
    });

    res.json({
      success: true,
      message: '촉진 알림이 발송되었습니다',
      balance: updated
    });
  } catch (error) {
    handleError(error, res);
  }
});

export default router;
