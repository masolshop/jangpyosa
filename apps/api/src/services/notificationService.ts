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
 * 읽지 않은 알림 개수 조회 (단일 타입)
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

/**
 * 읽지 않은 알림 개수 조회 (타입별 그룹화) - 최적화
 * 8번의 쿼리 대신 1번의 groupBy 쿼리로 모든 타입별 개수 조회
 */
export async function getUnreadCountByTypes(userId: string) {
  // 타입별 개수 집계
  const notifications = await prisma.notification.groupBy({
    by: ['type'],
    where: {
      userId,
      read: false,
    },
    _count: {
      id: true,
    },
  });
  
  // 총 개수 계산
  const total = notifications.reduce((sum, item) => sum + item._count.id, 0);
  
  // 타입별 개수 객체로 변환
  const byType: Record<string, number> = {};
  notifications.forEach(item => {
    byType[item.type] = item._count.id;
  });
  
  return {
    total,
    byType: {
      LEAVE_REQUEST: byType.LEAVE_REQUEST || 0,
      LEAVE_APPROVED: byType.LEAVE_APPROVED || 0,
      LEAVE_REJECTED: byType.LEAVE_REJECTED || 0,
      WORK_ORDER: byType.WORK_ORDER || 0,
      WORK_ORDER_COMPLETED: byType.WORK_ORDER_COMPLETED || 0,
      ANNOUNCEMENT: byType.ANNOUNCEMENT || 0,
      ANNOUNCEMENT_READ: byType.ANNOUNCEMENT_READ || 0,
      ATTENDANCE_REMINDER: byType.ATTENDANCE_REMINDER || 0,
      ATTENDANCE_ISSUE: byType.ATTENDANCE_ISSUE || 0,
    },
  };
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

/**
 * 공지사항 확인 알림 (관리자에게)
 * 직원이 공지를 확인했을 때 관리자에게 알림
 */
export async function notifyAnnouncementRead(params: {
  managerIds: string[];
  employeeName: string;
  announcementTitle: string;
  announcementId: string;
  readCount: number;
  totalCount: number;
}) {
  const { managerIds, employeeName, announcementTitle, announcementId, readCount, totalCount } = params;
  
  return createBulkNotifications(managerIds, {
    type: NotificationType.ANNOUNCEMENT,
    title: '✅ 공지사항 확인됨',
    message: `${employeeName}님이 "${announcementTitle}"을(를) 확인했습니다. (${readCount}/${totalCount}명)`,
    link: `/dashboard/announcements/${announcementId}/readers`,
    data: { announcementId, employeeName, readCount, totalCount },
    priority: NotificationPriority.LOW,
    category: NotificationCategory.GENERAL,
  });
}

/**
 * 업무 완료 알림 (관리자에게)
 * 직원이 업무를 완료했을 때 관리자에게 알림
 */
export async function notifyWorkOrderCompleted(params: {
  managerIds: string[];
  employeeName: string;
  workOrderTitle: string;
  workOrderId: string;
  confirmedCount: number;
  totalCount: number;
}) {
  const { managerIds, employeeName, workOrderTitle, workOrderId, confirmedCount, totalCount } = params;
  
  return createBulkNotifications(managerIds, {
    type: NotificationType.WORK_ORDER_COMPLETED,
    title: '✅ 업무 완료 확인',
    message: `${employeeName}님이 "${workOrderTitle}" 업무를 완료했습니다. (${confirmedCount}/${totalCount}명)`,
    link: `/dashboard/work-orders/${workOrderId}`,
    data: { workOrderId, employeeName, confirmedCount, totalCount },
    priority: NotificationPriority.NORMAL,
    category: NotificationCategory.WORK,
  });
}

/**
 * 근태 이상 알림 (관리자에게)
 * 지각, 조퇴, 결근 등 근태 이상 발생 시
 */
export async function notifyAttendanceIssue(params: {
  managerIds: string[];
  employeeName: string;
  issueType: 'LATE' | 'EARLY_LEAVE' | 'ABSENT' | 'NO_CHECKOUT';
  date: string;
  details?: string;
}) {
  const { managerIds, employeeName, issueType, date, details } = params;
  
  const issueTypeText = {
    LATE: '지각',
    EARLY_LEAVE: '조퇴',
    ABSENT: '결근',
    NO_CHECKOUT: '퇴근 미체크'
  }[issueType];
  
  const message = details 
    ? `${employeeName}님이 ${date}에 ${issueTypeText} 처리되었습니다. (${details})`
    : `${employeeName}님이 ${date}에 ${issueTypeText} 처리되었습니다.`;
  
  return createBulkNotifications(managerIds, {
    type: NotificationType.ATTENDANCE_ISSUE,
    title: `⚠️ 근태 이상: ${issueTypeText}`,
    message,
    link: `/dashboard/attendance`,
    data: { employeeName, issueType, date, details },
    priority: NotificationPriority.NORMAL,
    category: NotificationCategory.GENERAL,
  });
}

/**
 * 출근 알림 (직원에게)
 * 출근 시간이 다가왔을 때
 */
export async function notifyAttendanceReminder(params: {
  employeeId: string;
  time: string;
}) {
  const { employeeId, time } = params;
  
  return createNotification({
    userId: employeeId,
    type: NotificationType.ATTENDANCE_REMINDER,
    title: '⏰ 출근 시간 알림',
    message: `${time}까지 출근해주세요.`,
    link: `/employee/attendance`,
    data: { time },
    priority: NotificationPriority.NORMAL,
    category: NotificationCategory.GENERAL,
  });
}

/**
 * 지각 알림 (편의 함수)
 */
export async function notifyAttendanceLate(
  buyerId: string,
  employeeName: string,
  employeeId: string,
  currentTime: string
) {
  // 관리자 찾기
  const managers = await prisma.user.findMany({
    where: {
      role: 'BUYER',
      company: { buyerProfile: { id: buyerId } }
    },
    select: { id: true }
  });
  
  if (managers.length === 0) return;
  
  return notifyAttendanceIssue({
    managerIds: managers.map(m => m.id),
    employeeName,
    issueType: 'LATE',
    date: new Date().toISOString().split('T')[0],
    details: `${currentTime} 기준`
  });
}

/**
 * 조퇴 알림 (편의 함수)
 */
export async function notifyAttendanceEarlyLeave(
  buyerId: string,
  employeeName: string,
  employeeId: string,
  leaveTime: string
) {
  const managers = await prisma.user.findMany({
    where: {
      role: 'BUYER',
      company: { buyerProfile: { id: buyerId } }
    },
    select: { id: true }
  });
  
  if (managers.length === 0) return;
  
  return notifyAttendanceIssue({
    managerIds: managers.map(m => m.id),
    employeeName,
    issueType: 'EARLY_LEAVE',
    date: new Date().toISOString().split('T')[0],
    details: `${leaveTime} 퇴근`
  });
}

/**
 * 무단결근 알림 (편의 함수)
 */
export async function notifyAttendanceAbsent(
  buyerId: string,
  employeeName: string,
  employeeId: string,
  date: string
) {
  const managers = await prisma.user.findMany({
    where: {
      role: 'BUYER',
      company: { buyerProfile: { id: buyerId } }
    },
    select: { id: true }
  });
  
  if (managers.length === 0) return;
  
  return notifyAttendanceIssue({
    managerIds: managers.map(m => m.id),
    employeeName,
    issueType: 'ABSENT',
    date,
    details: undefined
  });
}
