import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface CreateNotificationInput {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  data?: any;
  priority?: NotificationPriority;
  category?: NotificationCategory;
}

export enum NotificationType {
  // 휴가 관련
  LEAVE_REQUEST = 'LEAVE_REQUEST',           // 휴가 신청
  LEAVE_APPROVED = 'LEAVE_APPROVED',         // 휴가 승인
  LEAVE_REJECTED = 'LEAVE_REJECTED',         // 휴가 반려
  LEAVE_EXPIRING = 'LEAVE_EXPIRING',         // 연차 소멸 예정
  LEAVE_LOW_BALANCE = 'LEAVE_LOW_BALANCE',   // 연차 잔여 부족
  
  // 업무 관련
  WORK_ORDER_ASSIGNED = 'WORK_ORDER_ASSIGNED', // 업무 배정
  WORK_ORDER_COMPLETED = 'WORK_ORDER_COMPLETED', // 업무 완료
  WORK_ORDER_FEEDBACK = 'WORK_ORDER_FEEDBACK', // 업무 피드백
  
  // 근태 관련
  ATTENDANCE_REMINDER = 'ATTENDANCE_REMINDER', // 출근 알림
  ATTENDANCE_ISSUE = 'ATTENDANCE_ISSUE',       // 근태 이슈
  
  // 급여 관련
  SALARY_ISSUED = 'SALARY_ISSUED',             // 급여 명세서
  INCENTIVE_ISSUED = 'INCENTIVE_ISSUED',       // 장려금 지급
  
  // 공지 관련
  ANNOUNCEMENT = 'ANNOUNCEMENT',               // 공지사항
  
  // 시스템
  SYSTEM = 'SYSTEM',                           // 시스템 알림
}

export enum NotificationPriority {
  URGENT = 'URGENT',   // 긴급
  NORMAL = 'NORMAL',   // 일반
  LOW = 'LOW',         // 낮음
}

export enum NotificationCategory {
  LEAVE = 'LEAVE',     // 휴가
  WORK = 'WORK',       // 업무
  SALARY = 'SALARY',   // 급여
  SYSTEM = 'SYSTEM',   // 시스템
  GENERAL = 'GENERAL', // 일반
}

/**
 * 알림 생성
 */
export async function createNotification(input: CreateNotificationInput) {
  const { userId, type, title, message, link, data, priority, category } = input;
  
  const notification = await prisma.notification.create({
    data: {
      userId,
      type,
      title,
      message,
      link: link || null,
      data: data ? JSON.stringify(data) : null,
      priority: priority || NotificationPriority.NORMAL,
      category: category || NotificationCategory.GENERAL,
    },
  });
  
  return notification;
}

/**
 * 여러 사용자에게 알림 생성
 */
export async function createBulkNotifications(userIds: string[], input: Omit<CreateNotificationInput, 'userId'>) {
  const notifications = await Promise.all(
    userIds.map(userId => createNotification({ ...input, userId }))
  );
  
  return notifications;
}

/**
 * 사용자의 알림 목록 조회
 */
export async function getUserNotifications(userId: string, options: {
  limit?: number;
  offset?: number;
  unreadOnly?: boolean;
}) {
  const { limit = 20, offset = 0, unreadOnly = false } = options;
  
  const where: any = { userId };
  if (unreadOnly) {
    where.read = false;
  }
  
  const [notifications, total, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    }),
    prisma.notification.count({ where }),
    prisma.notification.count({ where: { userId, read: false } }),
  ]);
  
  return {
    notifications: notifications.map(n => ({
      ...n,
      data: n.data ? JSON.parse(n.data) : null,
    })),
    total,
    unreadCount,
    hasMore: total > offset + limit,
  };
}

/**
 * 알림 읽음 처리
 */
export async function markAsRead(notificationId: string, userId: string) {
  const notification = await prisma.notification.findFirst({
    where: { id: notificationId, userId },
  });
  
  if (!notification) {
    throw new Error('Notification not found');
  }
  
  if (notification.read) {
    return notification;
  }
  
  const updated = await prisma.notification.update({
    where: { id: notificationId },
    data: {
      read: true,
      readAt: new Date(),
    },
  });
  
  return updated;
}

/**
 * 모든 알림 읽음 처리
 */
export async function markAllAsRead(userId: string) {
  const result = await prisma.notification.updateMany({
    where: {
      userId,
      read: false,
    },
    data: {
      read: true,
      readAt: new Date(),
    },
  });
  
  return result;
}

/**
 * 특정 타입의 알림 읽음 처리
 */
export async function markTypeAsRead(userId: string, types: string[]) {
  const result = await prisma.notification.updateMany({
    where: {
      userId,
      type: { in: types },
      read: false,
    },
    data: {
      read: true,
      readAt: new Date(),
    },
  });
  
  return result;
}

/**
 * 알림 삭제
 */
export async function deleteNotification(notificationId: string, userId: string) {
  const notification = await prisma.notification.findFirst({
    where: { id: notificationId, userId },
  });
  
  if (!notification) {
    throw new Error('Notification not found');
  }
  
  await prisma.notification.delete({
    where: { id: notificationId },
  });
  
  return { success: true };
}

/**
 * 오래된 알림 정리 (30일 이상 읽은 알림)
 */
export async function cleanupOldNotifications() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const result = await prisma.notification.deleteMany({
    where: {
      read: true,
      readAt: {
        lt: thirtyDaysAgo,
      },
    },
  });
  
  return result;
}

/**
 * 읽지 않은 알림 개수 조회
 */
export async function getUnreadCount(userId: string, type?: string) {
  const where: any = {
    userId,
    read: false,
  };
  
  if (type) {
    where.type = type;
  }
  
  const count = await prisma.notification.count({ where });
  
  return count;
}

// ============================================
// 특정 이벤트에 대한 알림 생성 헬퍼 함수들
// ============================================

/**
 * 휴가 신청 알림 (관리자에게)
 */
export async function notifyLeaveRequest(params: {
  managerIds: string[];
  employeeName: string;
  leaveTypeId: string;
  leaveTypeName: string;
  startDate: string;
  endDate: string;
  days: number;
  requestId: string;
}) {
  const { managerIds, employeeName, leaveTypeName, startDate, endDate, days, requestId } = params;
  
  return createBulkNotifications(managerIds, {
    type: NotificationType.LEAVE_REQUEST,
    title: '🏖️ 새로운 휴가 신청',
    message: `${employeeName}님이 ${leaveTypeName} ${days}일을 신청했습니다. (${startDate} ~ ${endDate})`,
    link: `/dashboard/leave`,
    data: { requestId, employeeName, leaveTypeName, startDate, endDate, days },
    priority: NotificationPriority.NORMAL,
    category: NotificationCategory.LEAVE,
  });
}

/**
 * 휴가 승인 알림 (직원에게)
 */
export async function notifyLeaveApproved(params: {
  employeeId: string;
  leaveTypeName: string;
  startDate: string;
  endDate: string;
  days: number;
  requestId: string;
}) {
  const { employeeId, leaveTypeName, startDate, endDate, days, requestId } = params;
  
  return createNotification({
    userId: employeeId,
    type: NotificationType.LEAVE_APPROVED,
    title: '✅ 휴가 신청이 승인되었습니다',
    message: `${leaveTypeName} ${days}일이 승인되었습니다. (${startDate} ~ ${endDate})`,
    link: `/employee/leave`,
    data: { requestId, leaveTypeName, startDate, endDate, days },
    priority: NotificationPriority.NORMAL,
    category: NotificationCategory.LEAVE,
  });
}

/**
 * 휴가 반려 알림 (직원에게)
 */
export async function notifyLeaveRejected(params: {
  employeeId: string;
  leaveTypeName: string;
  startDate: string;
  endDate: string;
  days: number;
  rejectionReason?: string;
  requestId: string;
}) {
  const { employeeId, leaveTypeName, startDate, endDate, days, rejectionReason, requestId } = params;
  
  const message = rejectionReason
    ? `${leaveTypeName} ${days}일이 반려되었습니다. (${startDate} ~ ${endDate})\n사유: ${rejectionReason}`
    : `${leaveTypeName} ${days}일이 반려되었습니다. (${startDate} ~ ${endDate})`;
  
  return createNotification({
    userId: employeeId,
    type: NotificationType.LEAVE_REJECTED,
    title: '❌ 휴가 신청이 반려되었습니다',
    message,
    link: `/employee/leave`,
    data: { requestId, leaveTypeName, startDate, endDate, days, rejectionReason },
    priority: NotificationPriority.URGENT,
    category: NotificationCategory.LEAVE,
  });
}

/**
 * 연차 소멸 예정 알림 (직원에게)
 */
export async function notifyLeaveExpiring(params: {
  employeeId: string;
  remainingDays: number;
  expiryDate: string;
}) {
  const { employeeId, remainingDays, expiryDate } = params;
  
  return createNotification({
    userId: employeeId,
    type: NotificationType.LEAVE_EXPIRING,
    title: '⏰ 연차 소멸 예정 알림',
    message: `${remainingDays}일의 연차가 ${expiryDate}에 소멸 예정입니다. 미리 사용하세요!`,
    link: `/employee/leave`,
    data: { remainingDays, expiryDate },
    priority: NotificationPriority.URGENT,
    category: NotificationCategory.LEAVE,
  });
}

/**
 * 연차 잔여 부족 알림 (직원에게)
 */
export async function notifyLowLeaveBalance(params: {
  employeeId: string;
  remainingDays: number;
}) {
  const { employeeId, remainingDays } = params;
  
  return createNotification({
    userId: employeeId,
    type: NotificationType.LEAVE_LOW_BALANCE,
    title: '📊 연차 잔여 부족',
    message: `연차가 ${remainingDays}일 남았습니다. 계획적으로 사용하세요.`,
    link: `/employee/leave`,
    data: { remainingDays },
    priority: NotificationPriority.LOW,
    category: NotificationCategory.LEAVE,
  });
}
