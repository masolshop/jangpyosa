import { Router } from 'express';
import { prisma } from '../index.js';
import { requireAuth } from '../middleware/auth.js';

// 사용자의 회사 정보 조회 헬퍼 함수 (getUserCompany)
async function getUserCompany(userId: string, userRole: string) {
  if (userRole === 'SUPER_ADMIN') {
    // 슈퍼 어드민은 첫 번째 BUYER 회사를 반환
    return await prisma.company.findFirst({
      where: { type: 'BUYER' },
      include: { buyerProfile: true }
    });
  }
  
  // 일반 사용자는 자신이 속한 회사를 반환
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      company: {
        include: { buyerProfile: true }
      }
    }
  });
  
  return user?.company || null;
}

const router = Router();

// 공지사항 목록 조회 (바이어, 표준사업장, 슈퍼 어드민)
router.get('/list', requireAuth, async (req, res) => {
  try {
    const userId = req.user!.id;
    const userRole = req.user!.role;
    
    if (!['BUYER', 'SUPPLIER', 'SUPER_ADMIN'].includes(userRole)) {
      return res.status(403).json({ error: '접근 권한이 없습니다' });
    }

    // 사용자의 회사 정보 가져오기
    const company = await getUserCompany(userId, userRole);

    if (!company || !company.buyerProfile) {
      return res.status(404).json({ error: '회사 정보를 찾을 수 없습니다' });
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

    return res.json({ announcements: announcementsWithStats });
  } catch (error: any) {
    console.error('공지사항 목록 조회 오류:', error);
    return res.status(500).json({ error: error.message });
  }
});

// 공지사항 상세 조회 (읽은 직원 리스트 포함)
router.get('/:id/readers', requireAuth, async (req, res) => {
  try {
    const userId = req.user!.id;
    const userRole = req.user!.role;
    const announcementId = req.params.id;
    
    if (!['BUYER', 'SUPPLIER', 'SUPER_ADMIN'].includes(userRole)) {
      return res.status(403).json({ error: '접근 권한이 없습니다' });
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
      return res.status(404).json({ error: '공지사항을 찾을 수 없습니다' });
    }

    // 회사의 모든 장애인 직원 조회
    const company = await getUserCompany(userId, userRole);

    if (!company || !company.buyerProfile) {
      return res.status(404).json({ error: '회사 정보를 찾을 수 없습니다' });
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

    return res.json({
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
    return res.status(500).json({ error: error.message });
  }
});

// 공지사항 작성 (바이어, 표준사업장, 슈퍼 어드민)
router.post('/create', requireAuth, async (req, res) => {
  try {
    const userId = req.user!.id;
    const userRole = req.user!.role;
    
    if (!['BUYER', 'SUPPLIER', 'SUPER_ADMIN'].includes(userRole)) {
      return res.status(403).json({ error: '접근 권한이 없습니다' });
    }

    const { title, content, priority = 'NORMAL' } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: '제목과 내용은 필수입니다' });
    }

    // 사용자의 회사 정보 가져오기
    const company = await getUserCompany(userId, userRole);

    if (!company || !company.buyerProfile) {
      return res.status(404).json({ error: '회사 정보를 찾을 수 없습니다' });
    }

    const announcement = await prisma.companyAnnouncement.create({
      data: {
        companyId: company.id,
        buyerId: company.buyerProfile.id,
        title,
        content,
        priority,
        createdById: userId
      }
    });

    return res.json({ 
      message: '공지사항이 등록되었습니다',
      announcement 
    });
  } catch (error: any) {
    console.error('공지사항 작성 오류:', error);
    return res.status(500).json({ error: error.message });
  }
});

// 공지사항 수정 (바이어, 표준사업장, 슈퍼 어드민)
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const userId = req.user!.id;
    const userRole = req.user!.role;
    const announcementId = req.params.id;
    
    if (!['BUYER', 'SUPPLIER', 'SUPER_ADMIN'].includes(userRole)) {
      return res.status(403).json({ error: '접근 권한이 없습니다' });
    }

    const { title, content, priority, isActive } = req.body;

    const announcement = await prisma.companyAnnouncement.update({
      where: { id: announcementId },
      data: {
        ...(title && { title }),
        ...(content && { content }),
        ...(priority && { priority }),
        ...(isActive !== undefined && { isActive })
      }
    });

    return res.json({ 
      message: '공지사항이 수정되었습니다',
      announcement 
    });
  } catch (error: any) {
    console.error('공지사항 수정 오류:', error);
    return res.status(500).json({ error: error.message });
  }
});

// 공지사항 삭제 (바이어, 표준사업장, 슈퍼 어드민)
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const userId = req.user!.id;
    const userRole = req.user!.role;
    const announcementId = req.params.id;
    
    if (!['BUYER', 'SUPPLIER', 'SUPER_ADMIN'].includes(userRole)) {
      return res.status(403).json({ error: '접근 권한이 없습니다' });
    }

    await prisma.companyAnnouncement.delete({
      where: { id: announcementId }
    });

    return res.json({ message: '공지사항이 삭제되었습니다' });
  } catch (error: any) {
    console.error('공지사항 삭제 오류:', error);
    return res.status(500).json({ error: error.message });
  }
});

// 공지사항 조회 (직원)
router.get('/my-announcements', requireAuth, async (req, res) => {
  try {
    const userId = req.user!.id;
    const userRole = req.user!.role;
    
    if (userRole !== 'EMPLOYEE') {
      return res.status(403).json({ error: '직원만 접근 가능합니다' });
    }

    // 사용자 정보 조회
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user || !user.employeeId) {
      return res.status(404).json({ error: '직원 정보를 찾을 수 없습니다' });
    }

    // 직원의 회사 BuyerProfile ID 가져오기
    const employee = await prisma.disabledEmployee.findUnique({
      where: { id: user.employeeId }
    });

    if (!employee) {
      return res.status(404).json({ error: '직원 정보를 찾을 수 없습니다' });
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

    return res.json({ announcements: announcementsWithReadStatus });
  } catch (error: any) {
    console.error('직원 공지사항 조회 오류:', error);
    return res.status(500).json({ error: error.message });
  }
});

// 공지사항 읽음 처리 (직원)
router.post('/:id/read', requireAuth, async (req, res) => {
  try {
    const userId = req.user!.id;
    const userRole = req.user!.role;
    const announcementId = req.params.id;
    
    if (userRole !== 'EMPLOYEE') {
      return res.status(403).json({ error: '직원만 접근 가능합니다' });
    }

    // 사용자 정보 조회
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user || !user.employeeId) {
      return res.status(404).json({ error: '직원 정보를 찾을 수 없습니다' });
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
      return res.json({ 
        message: '이미 읽은 공지사항입니다',
        readLog: existingLog 
      });
    }

    // 읽음 기록 생성
    const readLog = await prisma.announcementReadLog.create({
      data: {
        announcementId,
        employeeId: user.employeeId,
        userId: userId
      }
    });

    return res.json({ 
      message: '공지사항을 읽음으로 처리했습니다',
      readLog 
    });
  } catch (error: any) {
    console.error('공지사항 읽음 처리 오류:', error);
    return res.status(500).json({ error: error.message });
  }
});

export default router;
