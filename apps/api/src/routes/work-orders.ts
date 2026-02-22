import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../index.js';
import { requireAuth } from '../middleware/auth.js';
import { getKSTNow } from '../utils/kst.js';

// 사용자의 회사 정보 조회 헬퍼 함수
async function getUserCompany(userId: string, userRole: string) {
  if (userRole === 'SUPER_ADMIN') {
    return await prisma.company.findFirst({
      where: { type: 'BUYER' },
      include: { buyerProfile: true }
    });
  }
  
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

// 업무지시 생성 스키마
const createWorkOrderSchema = z.object({
  title: z.string().min(1, '제목은 필수입니다'),
  content: z.string().min(1, '내용은 필수입니다'),
  targetType: z.enum(['ALL', 'GROUP', 'INDIVIDUAL'], {
    errorMap: () => ({ message: 'targetType은 ALL, GROUP, INDIVIDUAL 중 하나여야 합니다' })
  }),
  targetEmployees: z.array(z.string()).optional(), // 직원 ID 배열
  priority: z.enum(['URGENT', 'NORMAL', 'LOW']).default('NORMAL'),
  dueDate: z.string().optional(), // ISO 8601 형식
  audioFileUrl: z.string().optional(),
  audioFileName: z.string().optional(),
  audioDuration: z.number().optional()
});

// 업무지시 수정 스키마
const updateWorkOrderSchema = z.object({
  title: z.string().min(1).optional(),
  content: z.string().min(1).optional(),
  targetType: z.enum(['ALL', 'GROUP', 'INDIVIDUAL']).optional(),
  targetEmployees: z.array(z.string()).optional(),
  priority: z.enum(['URGENT', 'NORMAL', 'LOW']).optional(),
  dueDate: z.string().nullable().optional(),
  audioFileUrl: z.string().nullable().optional(),
  audioFileName: z.string().nullable().optional(),
  audioDuration: z.number().nullable().optional(),
  isActive: z.boolean().optional()
});

// 업무지시 목록 조회 (관리자)
router.get('/list', requireAuth, async (req, res) => {
  try {
    const userId = req.user!.id;
    const userRole = req.user!.role;
    
    if (!['BUYER', 'SUPPLIER', 'SUPER_ADMIN'].includes(userRole)) {
      return res.status(403).json({ error: '접근 권한이 없습니다' });
    }

    const company = await getUserCompany(userId, userRole);

    if (!company || !company.buyerProfile) {
      return res.status(404).json({ error: '회사 정보를 찾을 수 없습니다' });
    }

    const workOrders = await prisma.workOrder.findMany({
      where: {
        buyerId: company.buyerProfile.id
      },
      orderBy: [
        { priority: 'asc' }, // URGENT이 먼저 (문자열이지만 알파벳 순으로 LOW, NORMAL, URGENT)
        { createdAt: 'desc' }
      ],
      include: {
        confirmations: true
      }
    });

    // 각 업무지시에 대한 확인 통계 추가
    const workOrdersWithStats = await Promise.all(
      workOrders.map(async (workOrder) => {
        // 대상 직원 수 계산
        let targetCount = 0;
        
        if (workOrder.targetType === 'ALL') {
          targetCount = await prisma.disabledEmployee.count({
            where: { buyerId: company.buyerProfile!.id }
          });
        } else if (workOrder.targetType === 'GROUP' || workOrder.targetType === 'INDIVIDUAL') {
          const targetEmployees = workOrder.targetEmployees 
            ? JSON.parse(workOrder.targetEmployees) 
            : [];
          targetCount = targetEmployees.length;
        }
        
        const confirmedCount = workOrder.confirmations.length;
        const unconfirmedCount = targetCount - confirmedCount;

        return {
          ...workOrder,
          stats: {
            targetCount,
            confirmedCount,
            unconfirmedCount,
            confirmPercentage: targetCount > 0 
              ? Math.round((confirmedCount / targetCount) * 100) 
              : 0
          }
        };
      })
    );

    return res.json({ workOrders: workOrdersWithStats });
  } catch (error: any) {
    console.error('업무지시 목록 조회 오류:', error);
    return res.status(500).json({ error: error.message });
  }
});

// 업무지시 상세 조회 (확인한 직원 리스트 포함)
router.get('/:id/confirmations', requireAuth, async (req, res) => {
  try {
    const userId = req.user!.id;
    const userRole = req.user!.role;
    const workOrderId = req.params.id;
    
    if (!['BUYER', 'SUPPLIER', 'SUPER_ADMIN'].includes(userRole)) {
      return res.status(403).json({ error: '접근 권한이 없습니다' });
    }

    const workOrder = await prisma.workOrder.findUnique({
      where: { id: workOrderId },
      include: {
        confirmations: true
      }
    });

    if (!workOrder) {
      return res.status(404).json({ error: '업무지시를 찾을 수 없습니다' });
    }

    const company = await getUserCompany(userId, userRole);

    if (!company || !company.buyerProfile) {
      return res.status(404).json({ error: '회사 정보를 찾을 수 없습니다' });
    }

    // 대상 직원 조회
    let targetEmployees: any[] = [];
    
    if (workOrder.targetType === 'ALL') {
      targetEmployees = await prisma.disabledEmployee.findMany({
        where: { buyerId: company.buyerProfile.id }
      });
    } else if (workOrder.targetType === 'GROUP' || workOrder.targetType === 'INDIVIDUAL') {
      const targetEmployeeIds = workOrder.targetEmployees 
        ? JSON.parse(workOrder.targetEmployees) 
        : [];
      
      if (targetEmployeeIds.length > 0) {
        targetEmployees = await prisma.disabledEmployee.findMany({
          where: { 
            id: { in: targetEmployeeIds },
            buyerId: company.buyerProfile.id
          }
        });
      }
    }

    // 확인한 직원과 미확인 직원 분리
    const confirmedEmployeeIds = new Set(workOrder.confirmations.map(c => c.employeeId));
    
    const confirmedEmployees = targetEmployees
      .filter(emp => confirmedEmployeeIds.has(emp.id))
      .map(emp => {
        const confirmation = workOrder.confirmations.find(c => c.employeeId === emp.id);
        return {
          ...emp,
          confirmedAt: confirmation?.confirmedAt,
          note: confirmation?.note
        };
      });

    const unconfirmedEmployees = targetEmployees.filter(emp => !confirmedEmployeeIds.has(emp.id));

    return res.json({
      workOrder,
      confirmedEmployees,
      unconfirmedEmployees,
      stats: {
        total: targetEmployees.length,
        confirmed: confirmedEmployees.length,
        unconfirmed: unconfirmedEmployees.length,
        confirmPercentage: targetEmployees.length > 0 
          ? Math.round((confirmedEmployees.length / targetEmployees.length) * 100) 
          : 0
      }
    });
  } catch (error: any) {
    console.error('업무지시 상세 조회 오류:', error);
    return res.status(500).json({ error: error.message });
  }
});

// 업무지시 생성
router.post('/create', requireAuth, async (req, res) => {
  try {
    const userId = req.user!.id;
    const userRole = req.user!.role;
    
    if (!['BUYER', 'SUPPLIER', 'SUPER_ADMIN'].includes(userRole)) {
      return res.status(403).json({ error: '접근 권한이 없습니다' });
    }

    const validated = createWorkOrderSchema.parse(req.body);

    // targetType 검증
    if (validated.targetType === 'GROUP' || validated.targetType === 'INDIVIDUAL') {
      if (!validated.targetEmployees || validated.targetEmployees.length === 0) {
        return res.status(400).json({ 
          error: 'GROUP 또는 INDIVIDUAL 타입일 경우 targetEmployees는 필수입니다' 
        });
      }
    }

    const company = await getUserCompany(userId, userRole);

    if (!company || !company.buyerProfile) {
      return res.status(404).json({ error: '회사 정보를 찾을 수 없습니다' });
    }

    // 작성자 정보 가져오기
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({ error: '사용자 정보를 찾을 수 없습니다' });
    }

    const workOrder = await prisma.workOrder.create({
      data: {
        companyId: company.id,
        buyerId: company.buyerProfile.id,
        title: validated.title,
        content: validated.content,
        targetType: validated.targetType,
        targetEmployees: validated.targetEmployees 
          ? JSON.stringify(validated.targetEmployees) 
          : null,
        priority: validated.priority,
        dueDate: validated.dueDate ? new Date(validated.dueDate) : null,
        audioFileUrl: validated.audioFileUrl || null,
        audioFileName: validated.audioFileName || null,
        audioDuration: validated.audioDuration || null,
        createdById: userId,
        createdByName: user.name
      }
    });

    return res.json({ 
      message: '업무지시가 등록되었습니다',
      workOrder 
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: '입력 검증 실패', 
        details: error.errors 
      });
    }
    console.error('업무지시 생성 오류:', error);
    return res.status(500).json({ error: error.message });
  }
});

// 업무지시 수정
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const userId = req.user!.id;
    const userRole = req.user!.role;
    const workOrderId = req.params.id;
    
    if (!['BUYER', 'SUPPLIER', 'SUPER_ADMIN'].includes(userRole)) {
      return res.status(403).json({ error: '접근 권한이 없습니다' });
    }

    const validated = updateWorkOrderSchema.parse(req.body);

    const updateData: any = {
      updatedAt: getKSTNow()
    };

    if (validated.title !== undefined) updateData.title = validated.title;
    if (validated.content !== undefined) updateData.content = validated.content;
    if (validated.targetType !== undefined) updateData.targetType = validated.targetType;
    if (validated.targetEmployees !== undefined) {
      updateData.targetEmployees = JSON.stringify(validated.targetEmployees);
    }
    if (validated.priority !== undefined) updateData.priority = validated.priority;
    if (validated.dueDate !== undefined) {
      updateData.dueDate = validated.dueDate ? new Date(validated.dueDate) : null;
    }
    if (validated.audioFileUrl !== undefined) updateData.audioFileUrl = validated.audioFileUrl;
    if (validated.audioFileName !== undefined) updateData.audioFileName = validated.audioFileName;
    if (validated.audioDuration !== undefined) updateData.audioDuration = validated.audioDuration;
    if (validated.isActive !== undefined) updateData.isActive = validated.isActive;

    const workOrder = await prisma.workOrder.update({
      where: { id: workOrderId },
      data: updateData
    });

    return res.json({ 
      message: '업무지시가 수정되었습니다',
      workOrder 
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: '입력 검증 실패', 
        details: error.errors 
      });
    }
    console.error('업무지시 수정 오류:', error);
    return res.status(500).json({ error: error.message });
  }
});

// 업무지시 삭제
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const userId = req.user!.id;
    const userRole = req.user!.role;
    const workOrderId = req.params.id;
    
    if (!['BUYER', 'SUPPLIER', 'SUPER_ADMIN'].includes(userRole)) {
      return res.status(403).json({ error: '접근 권한이 없습니다' });
    }

    await prisma.workOrder.delete({
      where: { id: workOrderId }
    });

    return res.json({ message: '업무지시가 삭제되었습니다' });
  } catch (error: any) {
    console.error('업무지시 삭제 오류:', error);
    return res.status(500).json({ error: error.message });
  }
});

// 내 업무지시 조회 (직원)
router.get('/my-work-orders', requireAuth, async (req, res) => {
  try {
    const userId = req.user!.id;
    const userRole = req.user!.role;
    
    if (userRole !== 'EMPLOYEE') {
      return res.status(403).json({ error: '직원만 접근 가능합니다' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user || !user.employeeId) {
      return res.status(404).json({ error: '직원 정보를 찾을 수 없습니다' });
    }

    const employee = await prisma.disabledEmployee.findUnique({
      where: { id: user.employeeId }
    });

    if (!employee) {
      return res.status(404).json({ error: '직원 정보를 찾을 수 없습니다' });
    }

    // 활성화된 업무지시 조회
    const allWorkOrders = await prisma.workOrder.findMany({
      where: {
        buyerId: employee.buyerId,
        isActive: true
      },
      orderBy: [
        { priority: 'asc' },
        { createdAt: 'desc' }
      ],
      include: {
        confirmations: {
          where: {
            employeeId: employee.id
          }
        }
      }
    });

    // 내가 대상인 업무지시만 필터링
    const myWorkOrders = allWorkOrders.filter(workOrder => {
      if (workOrder.targetType === 'ALL') {
        return true;
      } else if (workOrder.targetType === 'GROUP' || workOrder.targetType === 'INDIVIDUAL') {
        const targetEmployees = workOrder.targetEmployees 
          ? JSON.parse(workOrder.targetEmployees) 
          : [];
        return targetEmployees.includes(employee.id);
      }
      return false;
    });

    // 각 업무지시에 확인 여부 추가
    const workOrdersWithConfirmStatus = myWorkOrders.map(workOrder => ({
      ...workOrder,
      isConfirmed: workOrder.confirmations.length > 0,
      confirmedAt: workOrder.confirmations[0]?.confirmedAt || null,
      note: workOrder.confirmations[0]?.note || null
    }));

    return res.json({ workOrders: workOrdersWithConfirmStatus });
  } catch (error: any) {
    console.error('직원 업무지시 조회 오류:', error);
    return res.status(500).json({ error: error.message });
  }
});

// 업무지시 확인 처리 (직원)
router.post('/:id/confirm', requireAuth, async (req, res) => {
  try {
    const userId = req.user!.id;
    const userRole = req.user!.role;
    const workOrderId = req.params.id;
    const { note } = req.body;
    
    if (userRole !== 'EMPLOYEE') {
      return res.status(403).json({ error: '직원만 접근 가능합니다' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user || !user.employeeId) {
      return res.status(404).json({ error: '직원 정보를 찾을 수 없습니다' });
    }

    // 이미 확인했는지 체크
    const existingConfirmation = await prisma.workOrderConfirmation.findUnique({
      where: {
        workOrderId_employeeId: {
          workOrderId,
          employeeId: user.employeeId
        }
      }
    });

    if (existingConfirmation) {
      return res.json({ 
        message: '이미 확인한 업무지시입니다',
        confirmation: existingConfirmation 
      });
    }

    // 확인 기록 생성
    const confirmation = await prisma.workOrderConfirmation.create({
      data: {
        workOrderId,
        employeeId: user.employeeId,
        userId: userId,
        confirmedAt: getKSTNow(),
        note: note || null
      }
    });

    return res.json({ 
      message: '업무지시를 확인했습니다',
      confirmation 
    });
  } catch (error: any) {
    console.error('업무지시 확인 처리 오류:', error);
    return res.status(500).json({ error: error.message });
  }
});

export default router;
