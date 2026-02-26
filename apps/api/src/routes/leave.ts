import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
const prisma = new PrismaClient();

// 사용자 정보 조회 헬퍼 함수
async function getUserWithCompany(userId: string) {
  return await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      role: true,
      companyId: true,
      employeeId: true
    }
  });
}

// ==================== 휴가 유형 관리 (관리자용) ====================

// 휴가 유형 목록 조회
router.get('/types', requireAuth, async (req, res) => {
  try {
    const reqUser = req.user!;
    
    // DB에서 User 정보 조회
    const user = await prisma.user.findUnique({
      where: { id: reqUser.id },
      select: { companyId: true }
    });
    
    if (!user?.companyId) {
      return res.status(403).json({ error: '회사 소속이 아닙니다' });
    }

    const leaveTypes = await prisma.leaveType.findMany({
      where: { companyId: user.companyId },
      orderBy: [
        { displayOrder: 'asc' },
        { createdAt: 'desc' }
      ]
    });

    res.json({ leaveTypes });
  } catch (error: any) {
    console.error('[GET /leave/types] Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// 휴가 유형 생성
router.post('/types', requireAuth, async (req, res) => {
  try {
    const user = (req as any).user;
    
    if (user.role !== 'BUYER' && user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ error: '권한이 없습니다' });
    }

    if (!user.companyId) {
      return res.status(403).json({ error: '회사 소속이 아닙니다' });
    }

    const { name, description, requiresDocument, maxDaysPerYear, isPaid, displayOrder } = req.body;

    if (!name) {
      return res.status(400).json({ error: '휴가 유형명은 필수입니다' });
    }

    // 중복 확인
    const existing = await prisma.leaveType.findFirst({
      where: {
        companyId: user.companyId,
        name
      }
    });

    if (existing) {
      return res.status(400).json({ error: '이미 존재하는 휴가 유형입니다' });
    }

    const leaveType = await prisma.leaveType.create({
      data: {
        companyId: user.companyId,
        name,
        description: description || null,
        requiresDocument: requiresDocument || false,
        maxDaysPerYear: maxDaysPerYear || null,
        isPaid: isPaid !== undefined ? isPaid : true,
        displayOrder: displayOrder || 0
      }
    });

    res.json({ leaveType });
  } catch (error: any) {
    console.error('[POST /leave/types] Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// 휴가 유형 수정
router.put('/types/:id', requireAuth, async (req, res) => {
  try {
    const user = (req as any).user;
    const { id } = req.params;
    
    if (user.role !== 'BUYER' && user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ error: '권한이 없습니다' });
    }

    if (!user.companyId) {
      return res.status(403).json({ error: '회사 소속이 아닙니다' });
    }

    // 소유권 확인
    const leaveType = await prisma.leaveType.findFirst({
      where: {
        id,
        companyId: user.companyId
      }
    });

    if (!leaveType) {
      return res.status(404).json({ error: '휴가 유형을 찾을 수 없습니다' });
    }

    const { name, description, requiresDocument, maxDaysPerYear, isPaid, isActive, displayOrder } = req.body;

    // 이름 변경 시 중복 확인
    if (name && name !== leaveType.name) {
      const existing = await prisma.leaveType.findFirst({
        where: {
          companyId: user.companyId,
          name,
          id: { not: id }
        }
      });

      if (existing) {
        return res.status(400).json({ error: '이미 존재하는 휴가 유형명입니다' });
      }
    }

    const updated = await prisma.leaveType.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(requiresDocument !== undefined && { requiresDocument }),
        ...(maxDaysPerYear !== undefined && { maxDaysPerYear }),
        ...(isPaid !== undefined && { isPaid }),
        ...(isActive !== undefined && { isActive }),
        ...(displayOrder !== undefined && { displayOrder })
      }
    });

    res.json({ leaveType: updated });
  } catch (error: any) {
    console.error('[PUT /leave/types/:id] Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// 휴가 유형 삭제
router.delete('/types/:id', requireAuth, async (req, res) => {
  try {
    const user = (req as any).user;
    const { id } = req.params;
    
    if (user.role !== 'BUYER' && user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ error: '권한이 없습니다' });
    }

    if (!user.companyId) {
      return res.status(403).json({ error: '회사 소속이 아닙니다' });
    }

    // 소유권 확인
    const leaveType = await prisma.leaveType.findFirst({
      where: {
        id,
        companyId: user.companyId
      }
    });

    if (!leaveType) {
      return res.status(404).json({ error: '휴가 유형을 찾을 수 없습니다' });
    }

    // 사용 중인지 확인
    const requestCount = await prisma.leaveRequest.count({
      where: { leaveTypeId: id }
    });

    if (requestCount > 0) {
      return res.status(400).json({ 
        error: '사용 중인 휴가 유형은 삭제할 수 없습니다',
        requestCount
      });
    }

    await prisma.leaveType.delete({
      where: { id }
    });

    res.json({ success: true, message: '휴가 유형이 삭제되었습니다' });
  } catch (error: any) {
    console.error('[DELETE /leave/types/:id] Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== 휴가 신청 (직원용) ====================

// 내 휴가 신청 목록
router.get('/requests/my', requireAuth, async (req, res) => {
  try {
    const user = (req as any).user;
    
    if (user.role !== 'EMPLOYEE') {
      return res.status(403).json({ error: '직원만 접근 가능합니다' });
    }

    const requests = await prisma.leaveRequest.findMany({
      where: { userId: user.id },
      include: {
        leaveType: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ requests });
  } catch (error: any) {
    console.error('[GET /leave/requests/my] Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// 휴가 신청
router.post('/requests', requireAuth, async (req, res) => {
  try {
    const authUser = (req as any).user;
    
    if (authUser.role !== 'EMPLOYEE') {
      return res.status(403).json({ error: '직원만 접근 가능합니다' });
    }

    // DB에서 사용자 정보 조회 (employeeId, companyId 확인)
    const user = await prisma.user.findUnique({
      where: { id: authUser.id }
    });

    if (!user) {
      return res.status(404).json({ error: '사용자를 찾을 수 없습니다' });
    }

    if (!user.employeeId || !user.companyId) {
      return res.status(403).json({ error: '직원 정보가 없습니다' });
    }

    const { leaveTypeId, startDate, endDate, days, reason } = req.body;

    if (!leaveTypeId || !startDate || !endDate || !days) {
      return res.status(400).json({ error: '필수 항목을 입력해주세요' });
    }

    // 휴가 유형 확인
    const leaveType = await prisma.leaveType.findFirst({
      where: {
        id: leaveTypeId,
        companyId: user.companyId,
        isActive: true
      }
    });

    if (!leaveType) {
      return res.status(404).json({ error: '휴가 유형을 찾을 수 없습니다' });
    }

    const request = await prisma.leaveRequest.create({
      data: {
        companyId: user.companyId,
        leaveTypeId,
        employeeId: user.employeeId,
        userId: user.id,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        days: parseFloat(days),
        reason: reason || null
      },
      include: {
        leaveType: true
      }
    });

    res.json({ request });
  } catch (error: any) {
    console.error('[POST /leave/requests] Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// 휴가 신청 취소
router.patch('/requests/:id/cancel', requireAuth, async (req, res) => {
  try {
    const user = (req as any).user;
    const { id } = req.params;

    const request = await prisma.leaveRequest.findFirst({
      where: {
        id,
        userId: user.id
      }
    });

    if (!request) {
      return res.status(404).json({ error: '휴가 신청을 찾을 수 없습니다' });
    }

    if (request.status !== 'PENDING') {
      return res.status(400).json({ error: '대기 중인 신청만 취소할 수 있습니다' });
    }

    const updated = await prisma.leaveRequest.update({
      where: { id },
      data: { status: 'CANCELLED' },
      include: { leaveType: true }
    });

    res.json({ request: updated });
  } catch (error: any) {
    console.error('[PATCH /leave/requests/:id/cancel] Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// 서류 전송 완료 표시
router.patch('/requests/:id/document-sent', requireAuth, async (req, res) => {
  try {
    const user = (req as any).user;
    const { id } = req.params;
    const { documentNote } = req.body;

    const request = await prisma.leaveRequest.findFirst({
      where: {
        id,
        userId: user.id
      }
    });

    if (!request) {
      return res.status(404).json({ error: '휴가 신청을 찾을 수 없습니다' });
    }

    const updated = await prisma.leaveRequest.update({
      where: { id },
      data: {
        documentSent: true,
        documentNote: documentNote || null
      },
      include: { leaveType: true }
    });

    res.json({ request: updated });
  } catch (error: any) {
    console.error('[PATCH /leave/requests/:id/document-sent] Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== 휴가 승인/거부 (관리자용) ====================

// 전체 휴가 신청 목록 (관리자용)
router.get('/requests', requireAuth, async (req, res) => {
  try {
    const reqUser = req.user!;
    
    // DB에서 User 정보 조회
    const user = await getUserWithCompany(reqUser.id);
    
    if (!user) {
      return res.status(404).json({ error: '사용자를 찾을 수 없습니다' });
    }
    
    if (user.role !== 'BUYER' && user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ error: '권한이 없습니다' });
    }

    if (!user.companyId) {
      return res.status(403).json({ error: '회사 소속이 아닙니다' });
    }

    const { status } = req.query;

    const requests = await prisma.leaveRequest.findMany({
      where: {
        companyId: user.companyId,
        ...(status && { status: status as string })
      },
      include: {
        leaveType: true
      },
      orderBy: { createdAt: 'desc' }
    });

    // 직원 정보 추가
    const employeeIds = [...new Set(requests.map(r => r.employeeId))];
    const employees = await prisma.disabledEmployee.findMany({
      where: { id: { in: employeeIds } },
      select: { id: true, name: true }
    });

    const employeeMap = new Map(employees.map(e => [e.id, e]));

    const requestsWithEmployee = requests.map(request => ({
      ...request,
      employeeName: employeeMap.get(request.employeeId)?.name || '알 수 없음'
    }));

    res.json({ leaveRequests: requestsWithEmployee });
  } catch (error: any) {
    console.error('[GET /leave/requests] Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// 휴가 승인
router.patch('/requests/:id/approve', requireAuth, async (req, res) => {
  try {
    const user = (req as any).user;
    const { id } = req.params;
    const { reviewNote } = req.body;
    
    if (user.role !== 'BUYER' && user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ error: '권한이 없습니다' });
    }

    const request = await prisma.leaveRequest.findFirst({
      where: {
        id,
        companyId: user.companyId
      }
    });

    if (!request) {
      return res.status(404).json({ error: '휴가 신청을 찾을 수 없습니다' });
    }

    if (request.status !== 'PENDING') {
      return res.status(400).json({ error: '대기 중인 신청만 승인할 수 있습니다' });
    }

    const updated = await prisma.leaveRequest.update({
      where: { id },
      data: {
        status: 'APPROVED',
        reviewedBy: user.id,
        reviewedAt: new Date(),
        reviewNote: reviewNote || null
      },
      include: { leaveType: true }
    });

    res.json({ request: updated });
  } catch (error: any) {
    console.error('[PATCH /leave/requests/:id/approve] Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// 휴가 거부
router.patch('/requests/:id/reject', requireAuth, async (req, res) => {
  try {
    const user = (req as any).user;
    const { id } = req.params;
    const { reviewNote } = req.body;
    
    if (user.role !== 'BUYER' && user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ error: '권한이 없습니다' });
    }

    if (!reviewNote) {
      return res.status(400).json({ error: '거부 사유를 입력해주세요' });
    }

    const request = await prisma.leaveRequest.findFirst({
      where: {
        id,
        companyId: user.companyId
      }
    });

    if (!request) {
      return res.status(404).json({ error: '휴가 신청을 찾을 수 없습니다' });
    }

    if (request.status !== 'PENDING') {
      return res.status(400).json({ error: '대기 중인 신청만 거부할 수 있습니다' });
    }

    const updated = await prisma.leaveRequest.update({
      where: { id },
      data: {
        status: 'REJECTED',
        reviewedBy: user.id,
        reviewedAt: new Date(),
        reviewNote
      },
      include: { leaveType: true }
    });

    res.json({ request: updated });
  } catch (error: any) {
    console.error('[PATCH /leave/requests/:id/reject] Error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
