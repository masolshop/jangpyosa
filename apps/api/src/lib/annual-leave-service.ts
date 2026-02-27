import { prisma } from './prisma.js';
import {
  calculateAnnualLeave,
  calculateDailyWage,
  getLeavePromotionDates
} from './annual-leave.js';
import { NotFoundError } from './errors.js';

/**
 * 직원의 연차 잔액 조회 또는 생성
 */
export async function getOrCreateAnnualLeaveBalance(
  employeeId: string,
  year: number
) {
  // 기존 데이터 조회
  let balance = await prisma.annualLeaveBalance.findFirst({
    where: { employeeId, year }
  });

  if (balance) {
    return balance;
  }

  // 직원 정보 조회
  const employee = await prisma.disabledEmployee.findUnique({
    where: { id: employeeId },
    select: {
      id: true,
      name: true,
      hireDate: true,
      monthlySalary: true,
      buyerId: true,
      buyer: {
        select: { companyId: true }
      }
    }
  });

  if (!employee) {
    throw new NotFoundError('직원 정보');
  }

  // 사용한 연차 계산
  const usedLeaves = await prisma.leaveRequest.findMany({
    where: {
      employeeId,
      status: 'APPROVED',
      startDate: {
        gte: new Date(year, 0, 1),
        lt: new Date(year + 1, 0, 1)
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

  // 생성
  balance = await prisma.annualLeaveBalance.create({
    data: {
      companyId: employee.buyer.companyId,
      buyerId: employee.buyerId,
      employeeId: employee.id,
      userId: null,
      hireDate: employee.hireDate,
      workYears: leaveInfo.workYears,
      workMonths: leaveInfo.workMonths,
      year,
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

  return balance;
}

/**
 * 회사의 모든 재직 직원 조회
 */
export async function getActiveEmployeesByCompany(companyId: string) {
  const company = await prisma.company.findUnique({
    where: { id: companyId },
    include: {
      buyerProfile: {
        include: {
          disabledEmployees: {
            where: { resignDate: null },
            orderBy: { hireDate: 'asc' }
          }
        }
      }
    }
  });

  if (!company || !company.buyerProfile) {
    throw new NotFoundError('회사 정보');
  }

  return {
    company,
    buyerId: company.buyerProfile.id,
    employees: company.buyerProfile.disabledEmployees
  };
}

/**
 * 여러 직원의 연차 잔액 일괄 조회 (N+1 문제 해결)
 */
export async function getBulkAnnualLeaveBalances(
  employeeIds: string[],
  year: number
) {
  // 기존 잔액 조회
  const existingBalances = await prisma.annualLeaveBalance.findMany({
    where: {
      employeeId: { in: employeeIds },
      year
    }
  });

  const existingMap = new Map(existingBalances.map(b => [b.employeeId, b]));
  const missingEmployeeIds = employeeIds.filter(id => !existingMap.has(id));

  // 없는 직원들의 잔액 생성
  if (missingEmployeeIds.length > 0) {
    const newBalances = await Promise.all(
      missingEmployeeIds.map(id => getOrCreateAnnualLeaveBalance(id, year))
    );

    newBalances.forEach(balance => {
      existingMap.set(balance.employeeId, balance);
    });
  }

  // 원래 순서대로 반환
  return employeeIds.map(id => existingMap.get(id)!);
}
