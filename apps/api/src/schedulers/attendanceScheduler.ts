import cron from 'node-cron';
import { prisma } from '../index.js';
import {
  notifyAttendanceLate,
  notifyAttendanceAbsent
} from '../services/notificationService.js';

/**
 * 지각 체크 함수 (수동 실행 가능)
 */
export async function runAttendanceLateCheck() {
  console.log('[Attendance Scheduler] 지각 체크 시작');
  
  const today = new Date().toISOString().split('T')[0];
  
  // 모든 활성 직원 조회
  const employees = await prisma.disabledEmployee.findMany({
    where: {
      user: { role: 'EMPLOYEE' }
    },
    select: {
      id: true,
      name: true,
      buyerId: true,
      attendanceRecords: {
        where: { date: today },
        select: { clockIn: true }
      }
    }
  });
  
  // 출근 기록이 없는 직원 필터링
  const lateEmployees = employees.filter(e => 
    !e.attendanceRecords.some(r => r.clockIn)
  );
  
  // 알림 전송
  for (const emp of lateEmployees) {
    try {
      await notifyAttendanceLate(
        emp.buyerId,
        emp.name,
        emp.id,
        '09:30'
      );
    } catch (error) {
      console.error(`[Attendance Scheduler] 지각 알림 전송 실패: ${emp.name}`, error);
    }
  }
  
  console.log(`[Attendance Scheduler] 지각 알림 ${lateEmployees.length}건 전송`);
  return { count: lateEmployees.length, employees: lateEmployees };
}

/**
 * 무단결근 체크 함수 (수동 실행 가능)
 */
export async function runAttendanceAbsentCheck() {
  console.log('[Attendance Scheduler] 무단결근 체크 시작');
  
  const today = new Date().toISOString().split('T')[0];
  
  const employees = await prisma.disabledEmployee.findMany({
    where: {
      user: { role: 'EMPLOYEE' }
    },
    select: {
      id: true,
      name: true,
      buyerId: true,
      attendanceRecords: {
        where: { date: today },
        select: { id: true }
      }
    }
  });
  
  // 근태 기록이 없는 직원
  const absentEmployees = employees.filter(e => 
    e.attendanceRecords.length === 0
  );
  
  for (const emp of absentEmployees) {
    try {
      await notifyAttendanceAbsent(
        emp.buyerId,
        emp.name,
        emp.id,
        today
      );
    } catch (error) {
      console.error(`[Attendance Scheduler] 무단결근 알림 전송 실패: ${emp.name}`, error);
    }
  }
  
  console.log(`[Attendance Scheduler] 무단결근 알림 ${absentEmployees.length}건 전송`);
  return { count: absentEmployees.length, employees: absentEmployees };
}

/**
 * 지각 체크 스케줄러 (평일 09:30)
 */
export function scheduleAttendanceLateCheck() {
  cron.schedule('30 9 * * 1-5', async () => {
    try {
      await runAttendanceLateCheck();
    } catch (error) {
      console.error('[Attendance Scheduler] 지각 체크 오류:', error);
    }
  }, {
    timezone: 'Asia/Seoul'
  });
  
  console.log('[Attendance Scheduler] 지각 체크 스케줄러 등록됨 (평일 09:30 KST)');
}

/**
 * 무단결근 체크 스케줄러 (평일 18:00)
 */
export function scheduleAttendanceAbsentCheck() {
  cron.schedule('0 18 * * 1-5', async () => {
    try {
      await runAttendanceAbsentCheck();
    } catch (error) {
      console.error('[Attendance Scheduler] 무단결근 체크 오류:', error);
    }
  }, {
    timezone: 'Asia/Seoul'
  });
  
  console.log('[Attendance Scheduler] 무단결근 체크 스케줄러 등록됨 (평일 18:00 KST)');
}

/**
 * 모든 근태 스케줄러 시작
 */
export function startAttendanceSchedulers() {
  scheduleAttendanceLateCheck();
  scheduleAttendanceAbsentCheck();
  console.log('[Attendance Scheduler] 근태 스케줄러 시스템 시작됨');
}
