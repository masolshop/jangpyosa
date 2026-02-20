import { Hono } from 'hono';
import { prisma } from '../db.js';
import { authenticateToken } from '../middleware/auth.js';

const app = new Hono();

// 공지사항 목록 조회 (바이어)
app.get('/list', authenticateToken, async (c) => {
  try {
    const user = c.get('user');
    
    if (user.role !== 'BUYER') {
      return c.json({ error: '바이어만 접근 가능합니다' }, 403);
    }

    // 바이어의 회사 정보 가져오기
    const company = await prisma.company.findUnique({
      where: { ownerUserId: user.userId },
      include: { buyerProfile: true }
    });

    if (!company || !company.buyerProfile) {
      return c.json({ error: '회사 정보를 찾을 수 없습니다' }, 404);
    }

    const announcements = await prisma.companyAnnouncement.findMany({
      where: {
        buyerId: company.buyerProfile.id
      },
      orderBy: { createdAt: 'desc' },
      include: {
        readLogs: {
          include: {
            announcement: false
          }
        }
      }
    });

    // 각 공지에 대한 읽음 통계 추가
    const announcementsWithStats = await Promise.all(
      announcements.map(async (announcement) => {
        const totalEmployees = await prisma.disabledEmployee.count({
          where: { buyerId: company.buyerProfile!.id }
        });
        
        const readCount = announcement.readLogs.length;
        const unreadCount = totalEmployees - readCount;

        return {
          ...announcement,
          stats: {
            totalEmployees,
            readCount,
            unreadCount,
            readPercentage: totalEmployees > 0 ? Math.round((readCount / totalEmployees) * 100) : 0
          }
        };
      })
    );

    return c.json({ announcements: announcementsWithStats });
  } catch (error: any) {
    console.error('공지사항 목록 조회 오류:', error);
    return c.json({ error: error.message }, 500);
  }
});

// 공지사항 상세 조회 (읽은 직원 리스트 포함)
app.get('/:id/readers', authenticateToken, async (c) => {
  try {
    const user = c.get('user');
    const announcementId = c.req.param('id');
    
    if (user.role !== 'BUYER') {
      return c.json({ error: '바이어만 접근 가능합니다' }, 403);
    }

    const announcement = await prisma.companyAnnouncement.findUnique({
      where: { id: announcementId },
      include: {
        readLogs: {
          include: {
            announcement: false
          }
        }
      }
    });

    if (!announcement) {
      return c.json({ error: '공지사항을 찾을 수 없습니다' }, 404);
    }

    // 회사의 모든 장애인 직원 조회
    const company = await prisma.company.findUnique({
      where: { ownerUserId: user.userId },
      include: { buyerProfile: true }
    });

    if (!company || !company.buyerProfile) {
      return c.json({ error: '회사 정보를 찾을 수 없습니다' }, 404);
    }

    const allEmployees = await prisma.disabledEmployee.findMany({
      where: { buyerId: company.buyerProfile.id }
    });

    // 읽은 직원과 안 읽은 직원 분리
    const readEmployeeIds = new Set(announcement.readLogs.map(log => log.employeeId));
    
    const readEmployees = allEmployees.filter(emp => readEmployeeIds.has(emp.id)).map(emp => {
      const log = announcement.readLogs.find(l => l.employeeId === emp.id);
      return {
        ...emp,
        readAt: log?.readAt
      };
    });

    const unreadEmployees = allEmployees.filter(emp => !readEmployeeIds.has(emp.id));

    return c.json({
      announcement,
      readEmployees,
      unreadEmployees,
      stats: {
        total: allEmployees.length,
        read: readEmployees.length,
        unread: unreadEmployees.length,
        readPercentage: allEmployees.length > 0 
          ? Math.round((readEmployees.length / allEmployees.length) * 100) 
          : 0
      }
    });
  } catch (error: any) {
    console.error('공지사항 상세 조회 오류:', error);
    return c.json({ error: error.message }, 500);
  }
});

// 공지사항 작성 (바이어)
app.post('/create', authenticateToken, async (c) => {
  try {
    const user = c.get('user');
    
    if (user.role !== 'BUYER') {
      return c.json({ error: '바이어만 접근 가능합니다' }, 403);
    }

    const body = await c.req.json();
    const { title, content, priority = 'NORMAL' } = body;

    if (!title || !content) {
      return c.json({ error: '제목과 내용은 필수입니다' }, 400);
    }

    // 바이어의 회사 정보 가져오기
    const company = await prisma.company.findUnique({
      where: { ownerUserId: user.userId },
      include: { buyerProfile: true }
    });

    if (!company || !company.buyerProfile) {
      return c.json({ error: '회사 정보를 찾을 수 없습니다' }, 404);
    }

    const announcement = await prisma.companyAnnouncement.create({
      data: {
        companyId: company.id,
        buyerId: company.buyerProfile.id,
        title,
        content,
        priority,
        createdById: user.userId
      }
    });

    return c.json({ 
      message: '공지사항이 등록되었습니다',
      announcement 
    });
  } catch (error: any) {
    console.error('공지사항 작성 오류:', error);
    return c.json({ error: error.message }, 500);
  }
});

// 공지사항 수정 (바이어)
app.put('/:id', authenticateToken, async (c) => {
  try {
    const user = c.get('user');
    const announcementId = c.req.param('id');
    
    if (user.role !== 'BUYER') {
      return c.json({ error: '바이어만 접근 가능합니다' }, 403);
    }

    const body = await c.req.json();
    const { title, content, priority, isActive } = body;

    const announcement = await prisma.companyAnnouncement.update({
      where: { id: announcementId },
      data: {
        ...(title && { title }),
        ...(content && { content }),
        ...(priority && { priority }),
        ...(isActive !== undefined && { isActive })
      }
    });

    return c.json({ 
      message: '공지사항이 수정되었습니다',
      announcement 
    });
  } catch (error: any) {
    console.error('공지사항 수정 오류:', error);
    return c.json({ error: error.message }, 500);
  }
});

// 공지사항 삭제 (바이어)
app.delete('/:id', authenticateToken, async (c) => {
  try {
    const user = c.get('user');
    const announcementId = c.req.param('id');
    
    if (user.role !== 'BUYER') {
      return c.json({ error: '바이어만 접근 가능합니다' }, 403);
    }

    await prisma.companyAnnouncement.delete({
      where: { id: announcementId }
    });

    return c.json({ message: '공지사항이 삭제되었습니다' });
  } catch (error: any) {
    console.error('공지사항 삭제 오류:', error);
    return c.json({ error: error.message }, 500);
  }
});

// 공지사항 조회 (직원)
app.get('/my-announcements', authenticateToken, async (c) => {
  try {
    const user = c.get('user');
    
    if (user.role !== 'EMPLOYEE') {
      return c.json({ error: '직원만 접근 가능합니다' }, 403);
    }

    if (!user.employeeId) {
      return c.json({ error: '직원 정보를 찾을 수 없습니다' }, 404);
    }

    // 직원의 회사 BuyerProfile ID 가져오기
    const employee = await prisma.disabledEmployee.findUnique({
      where: { id: user.employeeId }
    });

    if (!employee) {
      return c.json({ error: '직원 정보를 찾을 수 없습니다' }, 404);
    }

    // 활성화된 공지사항만 조회
    const announcements = await prisma.companyAnnouncement.findMany({
      where: {
        buyerId: employee.buyerId,
        isActive: true
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' }
      ],
      include: {
        readLogs: {
          where: {
            employeeId: employee.id
          }
        }
      }
    });

    // 각 공지에 읽음 여부 추가
    const announcementsWithReadStatus = announcements.map(announcement => ({
      ...announcement,
      isRead: announcement.readLogs.length > 0,
      readAt: announcement.readLogs[0]?.readAt || null
    }));

    return c.json({ announcements: announcementsWithReadStatus });
  } catch (error: any) {
    console.error('직원 공지사항 조회 오류:', error);
    return c.json({ error: error.message }, 500);
  }
});

// 공지사항 읽음 처리 (직원)
app.post('/:id/read', authenticateToken, async (c) => {
  try {
    const user = c.get('user');
    const announcementId = c.req.param('id');
    
    if (user.role !== 'EMPLOYEE') {
      return c.json({ error: '직원만 접근 가능합니다' }, 403);
    }

    if (!user.employeeId) {
      return c.json({ error: '직원 정보를 찾을 수 없습니다' }, 404);
    }

    // 이미 읽었는지 확인
    const existingLog = await prisma.announcementReadLog.findUnique({
      where: {
        announcementId_employeeId: {
          announcementId,
          employeeId: user.employeeId
        }
      }
    });

    if (existingLog) {
      return c.json({ 
        message: '이미 읽은 공지사항입니다',
        readLog: existingLog 
      });
    }

    // 읽음 기록 생성
    const readLog = await prisma.announcementReadLog.create({
      data: {
        announcementId,
        employeeId: user.employeeId,
        userId: user.userId
      }
    });

    return c.json({ 
      message: '공지사항을 읽음으로 처리했습니다',
      readLog 
    });
  } catch (error: any) {
    console.error('공지사항 읽음 처리 오류:', error);
    return c.json({ error: error.message }, 500);
  }
});

export default app;
