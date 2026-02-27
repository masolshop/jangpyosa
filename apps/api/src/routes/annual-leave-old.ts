import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth } from '../middleware/auth.js';
import {
  calculateAnnualLeave,
  calculateDailyWage,
  calculateUnusedLeavePayment,
  getLeavePromotionDates,
  needsLeavePromotion
} from '../lib/annual-leave.js';

const router = Router();
const prisma = new PrismaClient();

// ==================== 연차 잔여 조회 ====================

/**
 * GET /api/annual-leave/company/:companyId
 * 회사의 모든 직원 연차 현황 조회
 */
router.get('/company/:companyId', requireAuth, async (req, res) => {
  try {
    const reqUser = req.user!;
    const { companyId } = req.params;
    const { year } = req.query;
    
    // DB에서 사용자 정보 조회
    const user = await prisma.user.findUnique({
      where: { id: reqUser.id },
      select: { id: true, role: true, companyId: true }
    });

    if (!user) {
      return res.status(404).json({ error: '사용자를 찾을 수 없습니다' });
    }
    
    // 권한 확인
    if (user.role !== 'BUYER' && user.role !== 'SUPER_ADMIN' && user.companyId !== companyId) {
      return res.status(403).json({ error: '권한이 없습니다' });
    }

    const currentYear = year ? parseInt(year as string) : new Date().getFullYear();

    // 회사 정보 조회
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      include: {
        buyerProfile: {
          include: {
            disabledEmployees: {
              where: {
                resignDate: null // 재직 중인 직원만
              }
            }
          }
        }
      }
    });

    if (!company || !company.buyerProfile) {
      return res.status(404).json({ error: '회사 정보를 찾을 수 없습니다' });
    }

    const buyerId = company.buyerProfile.id;
    const employees = company.buyerProfile.disabledEmployees;

    // 각 직원의 연차 계산 또는 조회
    const balances = await Promise.all(
      employees.map(async (employee) => {
        // 기존 연차 데이터 조회
        let balance = await prisma.annualLeaveBalance.findFirst({
          where: {
            employeeId: employee.id,
            year: currentYear
          }
        });

        // 없으면 계산하여 생성
        if (!balance) {
          const leaveInfo = calculateAnnualLeave(
            employee.id,
            employee.name,
            employee.hireDate,
            0, // 초기 사용 연차 0
            new Date(),
            false // 입사일 기준
          );

          const { firstNotice, secondNotice } = getLeavePromotionDates(leaveInfo.expiryDate!);

          balance = await prisma.annualLeaveBalance.create({
            data: {
              companyId,
              buyerId,
              employeeId: employee.id,
              userId: null, // User 연동 시 업데이트
              hireDate: employee.hireDate,
              workYears: leaveInfo.workYears,
              workMonths: leaveInfo.workMonths,
              year: currentYear,
              totalGenerated: leaveInfo.totalGenerated,
              baseLeave: leaveInfo.baseLeave,
              bonusLeave: leaveInfo.bonusLeave,
              used: 0,
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
        }

        return {
          ...balance,
          employeeName: employee.name,
          phone: employee.phone
        };
      })
    );

    res.json({
      company: {
        id: company.id,
        name: company.name,
        bizNo: company.bizNo
      },
      year: currentYear,
      totalEmployees: employees.length,
      balances
    });
  } catch (error: any) {
    console.error('[GET /annual-leave/company/:companyId] Error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/annual-leave/employee/:employeeId
 * 특정 직원의 연차 현황 조회
 */
router.get('/employee/:employeeId', requireAuth, async (req, res) => {
  try {
    const reqUser = req.user!;
    const { employeeId } = req.params;
    const { year } = req.query;

    const currentYear = year ? parseInt(year as string) : new Date().getFullYear();

    // DB에서 사용자 정보 조회
    const user = await prisma.user.findUnique({
      where: { id: reqUser.id },
      select: { id: true, role: true, companyId: true, employeeId: true }
    });

    if (!user) {
      return res.status(404).json({ error: '사용자를 찾을 수 없습니다' });
    }

    // 직원 정보 조회
    const employee = await prisma.disabledEmployee.findUnique({
      where: { id: employeeId },
      include: {
        buyer: {
          include: {
            company: true
          }
        }
      }
    });

    if (!employee) {
      return res.status(404).json({ error: '직원 정보를 찾을 수 없습니다' });
    }

    // 권한 확인
    const isOwner = user.employeeId === employeeId;
    const isManager = user.companyId === employee.buyer.companyId && (user.role === 'BUYER' || user.role === 'SUPER_ADMIN');

    if (!isOwner && !isManager) {
      return res.status(403).json({ error: '권한이 없습니다' });
    }

    // 연차 데이터 조회 또는 생성
    let balance = await prisma.annualLeaveBalance.findFirst({
      where: {
        employeeId,
        year: currentYear
      }
    });

    if (!balance) {
      const leaveInfo = calculateAnnualLeave(
        employee.id,
        employee.name,
        employee.hireDate,
        0,
        new Date(),
        false
      );

      const { firstNotice, secondNotice } = getLeavePromotionDates(leaveInfo.expiryDate!);

      balance = await prisma.annualLeaveBalance.create({
        data: {
          companyId: employee.buyer.companyId,
          buyerId: employee.buyerId,
          employeeId: employee.id,
          userId: null,
          hireDate: employee.hireDate,
          workYears: leaveInfo.workYears,
          workMonths: leaveInfo.workMonths,
          year: currentYear,
          totalGenerated: leaveInfo.totalGenerated,
          baseLeave: leaveInfo.baseLeave,
          bonusLeave: leaveInfo.bonusLeave,
          used: 0,
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
    }

    // 올해 사용한 휴가 조회
    const usedLeaves = await prisma.leaveRequest.findMany({
      where: {
        employeeId,
        status: 'APPROVED',
        startDate: {
          gte: new Date(currentYear, 0, 1),
          lt: new Date(currentYear + 1, 0, 1)
        }
      },
      include: {
        leaveType: true
      }
    });

    const usedDays = usedLeaves.reduce((sum, leave) => sum + leave.days, 0);

    // 실제 사용 연차로 업데이트
    if (balance.used !== usedDays) {
      balance = await prisma.annualLeaveBalance.update({
        where: { id: balance.id },
        data: {
          used: usedDays,
          remaining: balance.totalGenerated - usedDays
        }
      });
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
  } catch (error: any) {
    console.error('[GET /annual-leave/employee/:employeeId] Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== 연차 갱신 및 관리 ====================

/**
 * POST /api/annual-leave/recalculate
 * 모든 직원의 연차 재계산 (관리자용, 배치 작업)
 */
router.post('/recalculate', requireAuth, async (req, res) => {
  try {
    const reqUser = req.user!;
    
    // DB에서 사용자 정보 조회
    const user = await prisma.user.findUnique({
      where: { id: reqUser.id },
      select: { id: true, role: true, companyId: true }
    });

    if (!user) {
      return res.status(404).json({ error: '사용자를 찾을 수 없습니다' });
    }
    
    if (user.role !== 'BUYER' && user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ error: '권한이 없습니다' });
    }

    if (!user.companyId) {
      return res.status(403).json({ error: '회사 소속이 아닙니다' });
    }

    const { year } = req.body;
    const targetYear = year || new Date().getFullYear();

    // 회사의 모든 재직 직원 조회
    const company = await prisma.company.findUnique({
      where: { id: user.companyId },
      include: {
        buyerProfile: {
          include: {
            disabledEmployees: {
              where: {
                resignDate: null
              }
            }
          }
        }
      }
    });

    if (!company || !company.buyerProfile) {
      return res.status(404).json({ error: '회사 정보를 찾을 수 없습니다' });
    }

    const buyerId = company.buyerProfile.id;
    const employees = company.buyerProfile.disabledEmployees;

    let created = 0;
    let updated = 0;

    for (const employee of employees) {
      // 사용한 연차 계산
      const usedLeaves = await prisma.leaveRequest.findMany({
        where: {
          employeeId: employee.id,
          status: 'APPROVED',
          startDate: {
            gte: new Date(targetYear, 0, 1),
            lt: new Date(targetYear + 1, 0, 1)
          }
        }
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
      const existing = await prisma.annualLeaveBalance.findFirst({
        where: {
          employeeId: employee.id,
          year: targetYear
        }
      });

      if (existing) {
        await prisma.annualLeaveBalance.update({
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
        await prisma.annualLeaveBalance.create({
          data: {
            companyId: user.companyId,
            buyerId,
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

    res.json({
      success: true,
      message: `연차 재계산 완료`,
      year: targetYear,
      totalEmployees: employees.length,
      created,
      updated
    });
  } catch (error: any) {
    console.error('[POST /annual-leave/recalculate] Error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/annual-leave/promotion-notices
 * 연차 촉진 알림 대상 조회
 */
router.get('/promotion-notices', requireAuth, async (req, res) => {
  try {
    const reqUser = req.user!;
    
    // DB에서 사용자 정보 조회
    const user = await prisma.user.findUnique({
      where: { id: reqUser.id },
      select: { id: true, role: true, companyId: true }
    });

    if (!user) {
      return res.status(404).json({ error: '사용자를 찾을 수 없습니다' });
    }
    
    if (user.role !== 'BUYER' && user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ error: '권한이 없습니다' });
    }

    if (!user.companyId) {
      return res.status(403).json({ error: '회사 소속이 아닙니다' });
    }

    const now = new Date();
    const currentYear = now.getFullYear();

    // 1차 알림 대상 (6개월 전)
    const firstNoticeTargets = await prisma.annualLeaveBalance.findMany({
      where: {
        companyId: user.companyId,
        year: currentYear,
        firstNoticeSent: false,
        firstNoticeDate: {
          lte: now
        }
      }
    });

    // 2차 알림 대상 (2개월 전)
    const secondNoticeTargets = await prisma.annualLeaveBalance.findMany({
      where: {
        companyId: user.companyId,
        year: currentYear,
        secondNoticeSent: false,
        secondNoticeDate: {
          lte: now
        }
      }
    });

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
  } catch (error: any) {
    console.error('[GET /annual-leave/promotion-notices] Error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/annual-leave/send-promotion-notice
 * 연차 촉진 알림 발송 (실제 발송은 프론트엔드에서 처리)
 */
router.post('/send-promotion-notice', requireAuth, async (req, res) => {
  try {
    const reqUser = req.user!;
    
    // DB에서 사용자 정보 조회
    const user = await prisma.user.findUnique({
      where: { id: reqUser.id },
      select: { id: true, role: true, companyId: true }
    });

    if (!user) {
      return res.status(404).json({ error: '사용자를 찾을 수 없습니다' });
    }
    
    if (user.role !== 'BUYER' && user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ error: '권한이 없습니다' });
    }

    const { balanceId, noticeType } = req.body; // noticeType: 'first' or 'second'

    if (!balanceId || !noticeType) {
      return res.status(400).json({ error: '필수 항목을 입력해주세요' });
    }

    const balance = await prisma.annualLeaveBalance.findUnique({
      where: { id: balanceId }
    });

    if (!balance) {
      return res.status(404).json({ error: '연차 정보를 찾을 수 없습니다' });
    }

    if (balance.companyId !== user.companyId) {
      return res.status(403).json({ error: '권한이 없습니다' });
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
  } catch (error: any) {
    console.error('[POST /annual-leave/send-promotion-notice] Error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
