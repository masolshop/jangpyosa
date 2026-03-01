import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth, requireRole } from '../middleware/auth.js';
import bcryptjs from 'bcryptjs';

const router = Router();
const prisma = new PrismaClient();

// 영업 사원 역할 타입
export enum SalesRole {
  MANAGER = 'MANAGER',           // 매니저
  BRANCH_MANAGER = 'BRANCH_MANAGER', // 지사장
  HEAD_MANAGER = 'HEAD_MANAGER',     // 본부장
}

// 활동 로그 액션 타입
export enum SalesAction {
  PROMOTION = 'PROMOTION',         // 등업
  DEMOTION = 'DEMOTION',          // 강등
  TRANSFER = 'TRANSFER',          // 이동
  STATUS_CHANGE = 'STATUS_CHANGE', // 상태 변경
  REFERRAL_ADDED = 'REFERRAL_ADDED', // 추천 고객 추가
}

/**
 * GET /sales/people
 * 영업 사원 목록 조회
 */
router.get('/people', requireAuth, requireRole('SUPER_ADMIN'), async (req, res) => {
  try {
    const { role, managerId, isActive, search } = req.query;
    
    const where: any = {};
    
    // 기본적으로 활성 사용자만 조회 (isActive 파라미터가 명시적으로 전달되지 않은 경우)
    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    } else {
      where.isActive = true; // 기본값: 활성 사용자만
    }
    
    if (role) where.role = role;
    if (managerId) where.managerId = managerId;
    
    if (search) {
      where.OR = [
        { name: { contains: search as string } },
        { phone: { contains: search as string } },
        { email: { contains: search as string } },
      ];
    }
    
    const salesPeople = await prisma.salesPerson.findMany({
      where,
      include: {
        manager: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
        subordinates: {
          select: {
            id: true,
            name: true,
            role: true,
            totalReferrals: true,
            activeReferrals: true,
          },
        },
        referredCompanies: {
          where: { isActive: true },
          select: {
            id: true,
            companyName: true,
            companyBizNo: true,
            companyType: true,
            totalPayments: true,
            createdAt: true,
          },
        },
      },
      orderBy: [
        { role: 'asc' },
        { createdAt: 'desc' },
      ],
    });
    
    res.json({ salesPeople });
  } catch (error: any) {
    console.error('[GET /sales/people] Error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /sales/people/:id
 * 영업 사원 상세 조회
 */
router.get('/people/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    const salesPerson = await prisma.salesPerson.findUnique({
      where: { id },
      include: {
        manager: {
          select: {
            id: true,
            name: true,
            role: true,
            phone: true,
          },
        },
        subordinates: {
          include: {
            subordinates: true, // 하위 계층도 조회
          },
        },
        referredCompanies: {
          include: {
            salesPerson: {
              select: {
                name: true,
                role: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });
    
    if (!salesPerson) {
      return res.status(404).json({ error: '영업 사원을 찾을 수 없습니다' });
    }
    
    res.json({ salesPerson });
  } catch (error: any) {
    console.error('[GET /sales/people/:id] Error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /sales/people/create
 * 본부/지사 생성 (User + SalesPerson 함께 생성)
 */
router.post('/people/create', requireAuth, requireRole('SUPER_ADMIN'), async (req, res) => {
  try {
    const {
      organizationName, // 본부명 또는 지사명
      name, // 본부장명 또는 지사장명
      phone,
      email,
      password,
      role = SalesRole.MANAGER,
      managerId,
    } = req.body;
    
    // 필수 필드 확인
    if (!name || !phone || !password) {
      return res.status(400).json({ error: '이름, 전화번호, 비밀번호는 필수입니다' });
    }

    // organizationName은 본부/지사 생성 시 필수
    if ((role === 'HEAD_MANAGER' || role === 'BRANCH_MANAGER') && !organizationName) {
      return res.status(400).json({ error: '조직명은 필수입니다' });
    }

    // 비밀번호 길이 확인
    if (password.length < 6) {
      return res.status(400).json({ error: '비밀번호는 최소 6자 이상이어야 합니다' });
    }
    
    // 전화번호 정규화
    const normalizedPhone = phone.replace(/[-\s]/g, '');
    
    // 핸드폰번호 중복 확인 (User)
    const existingUser = await prisma.user.findUnique({
      where: { phone: normalizedPhone },
    });
    
    if (existingUser) {
      return res.status(400).json({ error: '이미 등록된 핸드폰번호입니다' });
    }

    // 핸드폰번호 중복 확인 (SalesPerson)
    const existingSalesPerson = await prisma.salesPerson.findUnique({
      where: { phone: normalizedPhone },
    });
    
    if (existingSalesPerson) {
      return res.status(400).json({ error: '이미 등록된 영업 사원입니다' });
    }

    // managerId 유효성 확인
    if (managerId) {
      const manager = await prisma.salesPerson.findUnique({
        where: { id: managerId },
      });
      if (!manager) {
        return res.status(400).json({ error: '존재하지 않는 상위 관리자입니다' });
      }
    }
    
    // 비밀번호 해시
    const passwordHash = await bcryptjs.hash(password, 10);
    
    // 추천인 코드 생성
    const referralCode = normalizedPhone.startsWith('0') 
      ? normalizedPhone.substring(1) 
      : normalizedPhone;
    const referralLink = `https://jangpyosa.com/${normalizedPhone}`;
    
    // User 생성
    const user = await prisma.user.create({
      data: {
        phone: normalizedPhone,
        name,
        email: email || undefined,
        passwordHash,
        role: 'EMPLOYEE', // 영업 사원은 EMPLOYEE 역할
        privacyAgreed: true,
        privacyAgreedAt: new Date(),
      },
    });
    
    // SalesPerson 생성
    const salesPerson = await prisma.salesPerson.create({
      data: {
        userId: user.id,
        name,
        organizationName: organizationName || null, // 본부명 또는 지사명
        phone: normalizedPhone,
        email: email || undefined,
        role,
        managerId,
        referralCode,
        referralLink,
      },
      include: {
        manager: {
          select: {
            id: true,
            name: true,
            role: true,
            phone: true,
          },
        },
      },
    });
    
    // 활동 로그 기록
    await prisma.salesActivityLog.create({
      data: {
        salesPersonId: salesPerson.id,
        adminUserId: req.user!.id,
        action: 'STATUS_CHANGE',
        toValue: 'CREATED',
        notes: `본부/지사 생성: ${name} (${role})`,
      },
    });
    
    res.status(201).json({ 
      success: true,
      salesPerson,
      message: `${role === 'HEAD_MANAGER' ? '본부장' : role === 'BRANCH_MANAGER' ? '지사장' : '매니저'} 생성이 완료되었습니다`,
    });
  } catch (error: any) {
    console.error('[POST /sales/people/create] Error:', error);
    res.status(500).json({ error: error.message || '생성 실패' });
  }
});

/**
 * POST /sales/people
 * 영업 사원 등록
 */
router.post('/people', requireAuth, requireRole('SUPER_ADMIN'), async (req, res) => {
  try {
    const {
      userId,
      name,
      phone,
      email,
      role = SalesRole.MANAGER,
      managerId,
    } = req.body;
    
    // 핸드폰번호 중복 확인
    const existingPerson = await prisma.salesPerson.findUnique({
      where: { phone },
    });
    
    if (existingPerson) {
      return res.status(400).json({ error: '이미 등록된 핸드폰번호입니다' });
    }
    
    // 추천인 코드 생성 (핸드폰번호에서 - 제거)
    const referralCode = phone.replace(/-/g, '');
    const referralLink = `https://jangpyosa.com/${referralCode}`;
    
    const salesPerson = await prisma.salesPerson.create({
      data: {
        userId,
        name,
        phone,
        email,
        role,
        managerId,
        referralCode,
        referralLink,
      },
      include: {
        manager: true,
      },
    });
    
    // 활동 로그 기록
    await prisma.salesActivityLog.create({
      data: {
        salesPersonId: salesPerson.id,
        adminUserId: req.user!.id,
        action: 'STATUS_CHANGE',
        toValue: 'REGISTERED',
        notes: `영업 사원 등록: ${name} (${role})`,
      },
    });
    
    res.status(201).json({ salesPerson });
  } catch (error: any) {
    console.error('[POST /sales/people] Error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * PUT /sales/people/:id
 * 영업 사원 정보 수정
 */
router.put('/people/:id', requireAuth, requireRole('SUPER_ADMIN'), async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      phone,
      email,
      isActive,
      inactiveReason,
      notes,
    } = req.body;
    
    const salesPerson = await prisma.salesPerson.update({
      where: { id },
      data: {
        name,
        phone,
        email,
        isActive,
        inactiveReason,
        notes,
        updatedAt: new Date(),
      },
      include: {
        manager: true,
        subordinates: true,
      },
    });
    
    res.json({ salesPerson });
  } catch (error: any) {
    console.error('[PUT /sales/people/:id] Error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /sales/people/:id/promote
 * 영업 사원 등업
 */
router.post('/people/:id/promote', requireAuth, requireRole('SUPER_ADMIN'), async (req, res) => {
  try {
    const { id } = req.params;
    const { newRole, reason } = req.body;
    
    const salesPerson = await prisma.salesPerson.findUnique({
      where: { id },
    });
    
    if (!salesPerson) {
      return res.status(404).json({ error: '영업 사원을 찾을 수 없습니다' });
    }
    
    // 등업 가능 여부 확인
    const roleHierarchy = {
      [SalesRole.MANAGER]: SalesRole.BRANCH_MANAGER,
      [SalesRole.BRANCH_MANAGER]: SalesRole.HEAD_MANAGER,
    };
    
    if (newRole !== roleHierarchy[salesPerson.role as keyof typeof roleHierarchy]) {
      return res.status(400).json({ error: '올바른 등업 경로가 아닙니다' });
    }
    
    const updated = await prisma.salesPerson.update({
      where: { id },
      data: {
        role: newRole,
        promotedAt: new Date(),
        promotedBy: req.user!.id,
      },
      include: {
        manager: true,
        subordinates: true,
      },
    });
    
    // 활동 로그 기록
    await prisma.salesActivityLog.create({
      data: {
        salesPersonId: id,
        adminUserId: req.user!.id,
        action: SalesAction.PROMOTION,
        fromValue: salesPerson.role,
        toValue: newRole,
        reason,
        notes: `${salesPerson.name} 등업: ${salesPerson.role} → ${newRole}`,
      },
    });
    
    res.json({ salesPerson: updated });
  } catch (error: any) {
    console.error('[POST /sales/people/:id/promote] Error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /sales/people/:id/toggle-active
 * 영업 사원 활성화/비활성화
 */
router.post('/people/:id/toggle-active', requireAuth, requireRole('SUPER_ADMIN'), async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive, inactiveReason } = req.body;
    
    const salesPerson = await prisma.salesPerson.findUnique({
      where: { id },
    });
    
    if (!salesPerson) {
      return res.status(404).json({ error: '영업 사원을 찾을 수 없습니다' });
    }
    
    const updated = await prisma.salesPerson.update({
      where: { id },
      data: {
        isActive,
        inactiveReason: isActive ? null : inactiveReason,
      },
      include: {
        manager: true,
        subordinates: true,
      },
    });
    
    // 활동 로그 기록
    await prisma.salesActivityLog.create({
      data: {
        salesPersonId: id,
        adminUserId: req.user!.id,
        action: SalesAction.STATUS_CHANGE,
        fromValue: salesPerson.isActive ? 'ACTIVE' : 'INACTIVE',
        toValue: isActive ? 'ACTIVE' : 'INACTIVE',
        reason: inactiveReason,
        notes: `상태 변경: ${salesPerson.isActive ? '활성' : '비활성'} → ${isActive ? '활성' : '비활성'}`,
      },
    });
    
    res.json({ salesPerson: updated });
  } catch (error: any) {
    console.error('[POST /sales/people/:id/toggle-active] Error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * PUT /sales/people/:id
 * 영업 사원 정보 수정
 */
router.put('/people/:id', requireAuth, requireRole('SUPER_ADMIN'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, email } = req.body;
    
    const salesPerson = await prisma.salesPerson.findUnique({
      where: { id },
    });
    
    if (!salesPerson) {
      return res.status(404).json({ error: '영업 사원을 찾을 수 없습니다' });
    }
    
    // 전화번호 중복 체크 (자신 제외)
    if (phone) {
      const cleanPhone = phone.replace(/[-\s]/g, '');
      const existingPerson = await prisma.salesPerson.findFirst({
        where: {
          phone: cleanPhone,
          id: { not: id },
        },
      });
      
      if (existingPerson) {
        return res.status(400).json({ error: '이미 사용 중인 전화번호입니다' });
      }
      
      const existingUser = await prisma.user.findFirst({
        where: {
          phone: cleanPhone,
          id: { not: salesPerson.userId },
        },
      });
      
      if (existingUser) {
        return res.status(400).json({ error: '이미 사용 중인 전화번호입니다' });
      }
    }
    
    // SalesPerson 업데이트
    const updated = await prisma.salesPerson.update({
      where: { id },
      data: {
        name: name || salesPerson.name,
        phone: phone ? phone.replace(/[-\s]/g, '') : salesPerson.phone,
        email: email || salesPerson.email,
      },
      include: {
        manager: true,
        subordinates: true,
      },
    });
    
    // User 테이블도 업데이트
    await prisma.user.update({
      where: { id: salesPerson.userId },
      data: {
        name: name || salesPerson.name,
        phone: phone ? phone.replace(/[-\s]/g, '') : salesPerson.phone,
        email: email || salesPerson.email,
      },
    });
    
    res.json({ 
      success: true,
      message: '정보가 수정되었습니다',
      salesPerson: updated 
    });
  } catch (error: any) {
    console.error('[PUT /sales/people/:id] Error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /sales/people/:id
 * 영업 사원 삭제 (소프트 삭제 - 비활성화)
 */
router.delete('/people/:id', requireAuth, requireRole('SUPER_ADMIN'), async (req, res) => {
  try {
    const { id } = req.params;
    
    const salesPerson = await prisma.salesPerson.findUnique({
      where: { id },
      include: {
        subordinates: true,
      },
    });
    
    if (!salesPerson) {
      return res.status(404).json({ error: '영업 사원을 찾을 수 없습니다' });
    }
    
    // 하위 조직이 있는 경우 삭제 불가
    if (salesPerson.subordinates && salesPerson.subordinates.length > 0) {
      return res.status(400).json({ 
        error: '하위 조직이 있어 삭제할 수 없습니다. 먼저 하위 조직을 재배치하거나 삭제해주세요.',
        subordinatesCount: salesPerson.subordinates.length
      });
    }
    
    console.log(`[DELETE] Deleting salesPerson: ${id}, name: ${salesPerson.name}`);
    
    // 소프트 삭제 (비활성화)
    const updatedSalesPerson = await prisma.salesPerson.update({
      where: { id },
      data: {
        isActive: false,
        inactiveReason: '슈퍼어드민에 의해 삭제됨',
      },
    });
    
    console.log(`[DELETE] SalesPerson updated:`, updatedSalesPerson);
    
    // 활동 로그 기록
    await prisma.salesActivityLog.create({
      data: {
        salesPersonId: id,
        adminUserId: req.user!.id,
        action: SalesAction.STATUS_CHANGE,
        fromValue: 'ACTIVE',
        toValue: 'DELETED',
        reason: '슈퍼어드민에 의해 삭제됨',
        notes: `영업 사원 삭제: ${salesPerson.name}`,
      },
    });
    
    res.json({ 
      success: true,
      message: '삭제되었습니다' 
    });
  } catch (error: any) {
    console.error('[DELETE /sales/people/:id] Error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /sales/people/:id/transfer
 * 영업 사원 조직 이동
 */
router.post('/people/:id/transfer', requireAuth, requireRole('SUPER_ADMIN'), async (req, res) => {
  try {
    const { id } = req.params;
    const { newManagerId, reason } = req.body;
    
    const salesPerson = await prisma.salesPerson.findUnique({
      where: { id },
      include: { manager: true },
    });
    
    if (!salesPerson) {
      return res.status(404).json({ error: '영업 사원을 찾을 수 없습니다' });
    }
    
    const updated = await prisma.salesPerson.update({
      where: { id },
      data: {
        managerId: newManagerId,
      },
      include: {
        manager: true,
        subordinates: true,
      },
    });
    
    // 활동 로그 기록
    await prisma.salesActivityLog.create({
      data: {
        salesPersonId: id,
        adminUserId: req.user!.id,
        action: SalesAction.TRANSFER,
        fromValue: salesPerson.manager?.name || 'None',
        toValue: updated.manager?.name || 'None',
        reason,
        notes: `조직 이동: ${salesPerson.manager?.name || '없음'} → ${updated.manager?.name || '없음'}`,
      },
    });
    
    res.json({ salesPerson: updated });
  } catch (error: any) {
    console.error('[POST /sales/people/:id/transfer] Error:', error);
    res.status(500).json({ error: error.message });
  }
});


/**
 * GET /sales/organization
 * 조직도 조회 (계층 구조)
 */
router.get('/organization', requireAuth, async (req, res) => {
  try {
    // 최상위 관리자들 (managerId가 null)
    const topManagers = await prisma.salesPerson.findMany({
      where: {
        managerId: null,
        isActive: true,
      },
      include: {
        subordinates: {
          where: { isActive: true },
          include: {
            subordinates: {
              where: { isActive: true },
            },
          },
        },
        referredCompanies: {
          where: { isActive: true },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
    
    res.json({ organization: topManagers });
  } catch (error: any) {
    console.error('[GET /sales/organization] Error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /sales/stats
 * 영업 통계
 */
router.get('/stats', requireAuth, requireRole('SUPER_ADMIN'), async (req, res) => {
  try {
    const totalSalesPeople = await prisma.salesPerson.count();
    const activeSalesPeople = await prisma.salesPerson.count({
      where: { isActive: true },
    });
    
    const countByRole = await prisma.salesPerson.groupBy({
      by: ['role'],
      _count: true,
    });
    
    const totalReferrals = await prisma.companyReferral.count();
    const activeReferrals = await prisma.companyReferral.count({
      where: { isActive: true },
    });
    
    const totalRevenue = await prisma.companyReferral.aggregate({
      _sum: {
        totalPayments: true,
        totalCommission: true,
      },
    });
    
    res.json({
      stats: {
        totalSalesPeople,
        activeSalesPeople,
        countByRole,
        totalReferrals,
        activeReferrals,
        totalRevenue: totalRevenue._sum.totalPayments || 0,
        totalCommission: totalRevenue._sum.totalCommission || 0,
      },
    });
  } catch (error: any) {
    console.error('[GET /sales/stats] Error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /sales/activity-logs
 * 활동 로그 조회
 */
router.get('/activity-logs', requireAuth, requireRole('SUPER_ADMIN'), async (req, res) => {
  try {
    const { salesPersonId, action, limit = 50 } = req.query;
    
    const where: any = {};
    if (salesPersonId) where.salesPersonId = salesPersonId;
    if (action) where.action = action;
    
    const logs = await prisma.salesActivityLog.findMany({
      where,
      take: parseInt(limit as string),
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    res.json({ logs });
  } catch (error: any) {
    console.error('[GET /sales/activity-logs] Error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /sales/my-info
 * 내 영업 사원 정보 조회 (현재 로그인한 사용자)
 */
router.get('/my-info', requireAuth, async (req, res) => {
  try {
    const salesPerson = await prisma.salesPerson.findUnique({
      where: { userId: req.user!.id },
      include: {
        manager: {
          select: {
            id: true,
            name: true,
            role: true,
            phone: true,
          },
        },
        subordinates: {
          where: { isActive: true },
          select: {
            id: true,
            name: true,
            role: true,
            totalReferrals: true,
            activeReferrals: true,
          },
        },
        referredCompanies: {
          where: { isActive: true },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });
    
    if (!salesPerson) {
      return res.status(404).json({ error: '영업 사원 정보를 찾을 수 없습니다' });
    }
    
    res.json({ salesPerson });
  } catch (error: any) {
    console.error('[GET /sales/my-info] Error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /sales/organizations
 * 본부/지사 목록 조회 (회원가입용 - 인증 불필요)
 */
router.get('/organizations', async (req, res) => {
  try {
    // 활성 상태인 본부만 조회
    const headquarters = await prisma.salesPerson.findMany({
      where: {
        role: 'HEAD_MANAGER',
        isActive: true,
      },
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // 활성 상태인 지사만 조회
    const branches = await prisma.salesPerson.findMany({
      where: {
        role: 'BRANCH_MANAGER',
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        managerId: true, // 소속 본부 ID
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    res.json({
      headquarters,
      branches,
    });
  } catch (error: any) {
    console.error('[GET /sales/organizations] Error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /sales/dashboard/stats
 * 매니저/지사/본부 통합 대시보드 통계
 * 
 * 매니저: 자신이 추천한 기업 통계
 * 지사: 소속 매니저들이 추천한 기업 통계 합계
 * 본부: 소속 지사+매니저들이 추천한 기업 통계 합계
 */
router.get('/dashboard/stats', requireAuth, async (req, res) => {
  try {
    const { user } = req;
    
    if (!user) {
      return res.status(401).json({ error: '인증이 필요합니다' });
    }
    
    // 현재 로그인한 영업사원 정보 조회
    const salesPerson = await prisma.salesPerson.findUnique({
      where: { userId: user.id },
      include: {
        subordinates: {
          where: { isActive: true },
          include: {
            subordinates: {
              where: { isActive: true },
            },
          },
        },
      },
    });
    
    if (!salesPerson) {
      return res.status(404).json({ error: '영업 사원 정보를 찾을 수 없습니다' });
    }
    
    // 집계 대상 ID 목록
    let targetIds: string[] = [salesPerson.id];
    
    // 역할에 따라 하위 조직 포함
    if (salesPerson.role === 'BRANCH_MANAGER') {
      // 지사장: 자신 + 소속 매니저들
      const managerIds = salesPerson.subordinates.map(s => s.id);
      targetIds = [...targetIds, ...managerIds];
    } else if (salesPerson.role === 'HEAD_MANAGER') {
      // 본부장: 자신 + 소속 지사들 + 소속 매니저들
      const branchIds = salesPerson.subordinates.map(s => s.id);
      const managerIds = salesPerson.subordinates.flatMap(branch => 
        branch.subordinates?.map(m => m.id) || []
      );
      targetIds = [...targetIds, ...branchIds, ...managerIds];
    }
    
    // CompanyReferral에서 추천 기업 정보 조회 (Company 조인하여 buyerType 가져오기)
    const referrals = await prisma.companyReferral.findMany({
      where: {
        salesPersonId: { in: targetIds },
        isActive: true,
      },
      include: {
        company: {
          select: {
            buyerType: true,
            type: true,
          },
        },
      },
    });
    
    // 기업 유형별 집계
    const stats = {
      totalCompanies: referrals.length,
      privateCompanies: 0,    // 민간기업
      publicCompanies: 0,     // 공공기관
      governmentCompanies: 0, // 국가지자체교육청
      managers: 0,            // 소속 매니저 수
      branches: 0,            // 소속 지사 수
    };
    
    // BUYER 유형의 기업만 집계
    referrals.forEach(ref => {
      if (ref.company?.type === 'BUYER' && ref.company?.buyerType) {
        switch (ref.company.buyerType) {
          case 'PRIVATE_COMPANY':
            stats.privateCompanies++;
            break;
          case 'PUBLIC_INSTITUTION':
            stats.publicCompanies++;
            break;
          case 'GOVERNMENT':
            stats.governmentCompanies++;
            break;
        }
      }
    });
    
    // 역할별 하위 조직 수 집계
    if (salesPerson.role === 'HEAD_MANAGER') {
      // 본부장: 지사 수와 매니저 수
      stats.branches = salesPerson.subordinates.filter(s => s.role === 'BRANCH_MANAGER').length;
      stats.managers = salesPerson.subordinates.flatMap(branch => 
        branch.subordinates || []
      ).length + salesPerson.subordinates.filter(s => s.role === 'MANAGER').length;
    } else if (salesPerson.role === 'BRANCH_MANAGER') {
      // 지사장: 매니저 수만
      stats.managers = salesPerson.subordinates.length;
    }
    
    res.json({
      role: salesPerson.role,
      organizationName: salesPerson.organizationName,
      name: salesPerson.name,
      phone: salesPerson.phone,
      email: salesPerson.email,
      stats,
    });
  } catch (error: any) {
    console.error('[GET /sales/dashboard/stats] Error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /sales/dashboard/companies
 * 매니저 추천 기업 리스트
 */
router.get('/dashboard/companies', requireAuth, async (req, res) => {
  try {
    const { user } = req;
    const { buyerType } = req.query; // PRIVATE_COMPANY, PUBLIC_INSTITUTION, GOVERNMENT
    
    if (!user) {
      return res.status(401).json({ error: '인증이 필요합니다' });
    }
    
    // 현재 로그인한 영업사원 정보 조회
    const salesPerson = await prisma.salesPerson.findUnique({
      where: { userId: user.id },
    });
    
    if (!salesPerson) {
      return res.status(404).json({ error: '영업 사원 정보를 찾을 수 없습니다' });
    }
    
    // 매니저만 자신의 추천 기업 리스트를 볼 수 있음
    if (salesPerson.role !== 'MANAGER') {
      return res.status(403).json({ error: '매니저만 접근 가능합니다' });
    }
    
    const where: any = {
      salesPersonId: salesPerson.id,
      isActive: true,
      company: {
        type: 'BUYER',
      },
    };
    
    // buyerType 필터
    if (buyerType) {
      where.company.buyerType = buyerType;
    }
    
    const companies = await prisma.companyReferral.findMany({
      where,
      include: {
        company: {
          select: {
            id: true,
            name: true,
            bizNo: true,
            buyerType: true,
            representative: true,
            createdAt: true,
            buyerProfile: {
              select: {
                employeeCount: true,
                disabledCount: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    res.json(companies);
  } catch (error: any) {
    console.error('[GET /sales/dashboard/companies] Error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /sales/dashboard/managers
 * 지사/본부 소속 매니저 리스트 (각 매니저의 추천 기업 통계 포함)
 */
router.get('/dashboard/managers', requireAuth, async (req, res) => {
  try {
    const { user } = req;
    
    if (!user) {
      return res.status(401).json({ error: '인증이 필요합니다' });
    }
    
    // 현재 로그인한 영업사원 정보 조회
    const salesPerson = await prisma.salesPerson.findUnique({
      where: { userId: user.id },
      include: {
        subordinates: {
          where: { isActive: true },
          orderBy: { createdAt: 'asc' },
        },
      },
    });
    
    if (!salesPerson) {
      return res.status(404).json({ error: '영업 사원 정보를 찾을 수 없습니다' });
    }
    
    // 지사장이나 본부장만 접근 가능
    if (salesPerson.role === 'MANAGER') {
      return res.status(403).json({ error: '권한이 없습니다' });
    }
    
    // 각 매니저의 추천 기업 통계 조회
    const managersWithStats = await Promise.all(
      salesPerson.subordinates.map(async (manager) => {
        const referrals = await prisma.companyReferral.findMany({
          where: {
            salesPersonId: manager.id,
            isActive: true,
            company: {
              type: 'BUYER',
            },
          },
          include: {
            company: {
              select: {
                buyerType: true,
              },
            },
          },
        });
        
        const stats = {
          privateCompanies: 0,
          publicCompanies: 0,
          governmentCompanies: 0,
        };
        
        referrals.forEach(ref => {
          if (ref.company?.buyerType) {
            switch (ref.company.buyerType) {
              case 'PRIVATE_COMPANY':
                stats.privateCompanies++;
                break;
              case 'PUBLIC_INSTITUTION':
                stats.publicCompanies++;
                break;
              case 'GOVERNMENT':
                stats.governmentCompanies++;
                break;
            }
          }
        });
        
        return {
          id: manager.id,
          name: manager.name,
          phone: manager.phone,
          email: manager.email,
          role: manager.role,
          createdAt: manager.createdAt,
          stats,
        };
      })
    );
    
    res.json(managersWithStats);
  } catch (error: any) {
    console.error('[GET /sales/dashboard/managers] Error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /sales/dashboard/branches
 * 본부 소속 지사 리스트 (각 지사의 추천 기업 통계 포함)
 */
router.get('/dashboard/branches', requireAuth, async (req, res) => {
  try {
    const { user } = req;
    
    if (!user) {
      return res.status(401).json({ error: '인증이 필요합니다' });
    }
    
    // 현재 로그인한 영업사원 정보 조회
    const salesPerson = await prisma.salesPerson.findUnique({
      where: { userId: user.id },
      include: {
        subordinates: {
          where: { 
            isActive: true,
            role: 'BRANCH_MANAGER',
          },
          include: {
            subordinates: {
              where: { isActive: true },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });
    
    if (!salesPerson) {
      return res.status(404).json({ error: '영업 사원 정보를 찾을 수 없습니다' });
    }
    
    // 본부장만 접근 가능
    if (salesPerson.role !== 'HEAD_MANAGER') {
      return res.status(403).json({ error: '본부장만 접근 가능합니다' });
    }
    
    // 각 지사의 추천 기업 통계 조회 (지사 자체 + 소속 매니저)
    const branchesWithStats = await Promise.all(
      salesPerson.subordinates.map(async (branch) => {
        // 지사 자체 + 소속 매니저 ID
        const targetIds = [branch.id, ...(branch.subordinates?.map(m => m.id) || [])];
        
        const referrals = await prisma.companyReferral.findMany({
          where: {
            salesPersonId: { in: targetIds },
            isActive: true,
            company: {
              type: 'BUYER',
            },
          },
          include: {
            company: {
              select: {
                buyerType: true,
              },
            },
          },
        });
        
        const stats = {
          privateCompanies: 0,
          publicCompanies: 0,
          governmentCompanies: 0,
        };
        
        referrals.forEach(ref => {
          if (ref.company?.buyerType) {
            switch (ref.company.buyerType) {
              case 'PRIVATE_COMPANY':
                stats.privateCompanies++;
                break;
              case 'PUBLIC_INSTITUTION':
                stats.publicCompanies++;
                break;
              case 'GOVERNMENT':
                stats.governmentCompanies++;
                break;
            }
          }
        });
        
        return {
          id: branch.id,
          organizationName: branch.organizationName,
          name: branch.name,
          phone: branch.phone,
          email: branch.email,
          createdAt: branch.createdAt,
          managerCount: branch.subordinates?.length || 0,
          stats,
        };
      })
    );
    
    res.json(branchesWithStats);
  } catch (error: any) {
    console.error('[GET /sales/dashboard/branches] Error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
