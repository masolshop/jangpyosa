import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth } from '../middleware/auth.js';
import jwt from 'jsonwebtoken';
import { config } from '../config.js';

const router = Router();
const prisma = new PrismaClient();

const JWT_SECRET = config.jwtSecret || 'your-secret-key';

// 영업 사원 전용 인증 미들웨어 (sales 대시보드용)
const requireSalesAuth = async (req: any, res: any, next: any) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: '인증 토큰이 없습니다' });
    }

    const decoded: any = jwt.verify(token, JWT_SECRET);
    
    const salesPerson = await prisma.salesPerson.findUnique({
      where: { id: decoded.salesPersonId },
    });

    if (!salesPerson) {
      return res.status(404).json({ error: '영업 사원 정보를 찾을 수 없습니다' });
    }

    req.salesPerson = salesPerson;
    next();
  } catch (error: any) {
    console.error('[requireSalesAuth] Error:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: '유효하지 않은 토큰입니다' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: '토큰이 만료되었습니다' });
    }
    return res.status(500).json({ error: error.message });
  }
};

/**
 * GET /api/agent/stats
 * 매니저 본인의 추천 통계 (AGENT role 사용자)
 */
router.get('/agent/stats', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const userRole = req.user!.role;
    
    // AGENT role이 아닌 경우 에러
    if (userRole !== 'AGENT') {
      return res.status(403).json({ error: 'AGENT role 사용자만 접근 가능합니다' });
    }
    
    // 추천한 사용자 조회 (BUYER만)
    const referrals = await prisma.user.findMany({
      where: {
        referredById: userId,
        role: 'BUYER'
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            bizNo: true,
            buyerType: true,
            isVerified: true,
            createdAt: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    // 통계 계산
    const totalReferrals = referrals.length;
    const activeReferrals = referrals.filter(r => r.company?.isVerified).length;
    
    // 이번 달 추천
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisMonthReferrals = referrals.filter(
      r => new Date(r.createdAt) >= startOfMonth
    ).length;
    
    // 이번 주 추천
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const thisWeekReferrals = referrals.filter(
      r => new Date(r.createdAt) >= startOfWeek
    ).length;
    
    // 기업 유형별 통계
    const byBuyerType: Record<string, number> = {
      'PRIVATE_COMPANY': 0,
      'PUBLIC_INSTITUTION': 0,
      'GOVERNMENT': 0
    };
    referrals.forEach(r => {
      const type = r.company?.buyerType;
      if (type && byBuyerType[type] !== undefined) {
        byBuyerType[type]++;
      }
    });
    
    res.json({
      totalReferrals,
      activeReferrals,
      thisMonthReferrals,
      thisWeekReferrals,
      privateCompanies: byBuyerType['PRIVATE_COMPANY'],
      publicCompanies: byBuyerType['PUBLIC_INSTITUTION'],
      governmentCompanies: byBuyerType['GOVERNMENT'],
      byBuyerType,
      lastReferralDate: referrals.length > 0 ? referrals[0].createdAt : null
    });
  } catch (error: any) {
    console.error('[GET /agent/stats] Error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/agent/referrals
 * 매니저 본인의 추천 기업 목록
 */
router.get('/agent/referrals', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const userRole = req.user!.role;
    
    // AGENT role이 아닌 경우 에러
    if (userRole !== 'AGENT') {
      return res.status(403).json({ error: 'AGENT role 사용자만 접근 가능합니다' });
    }
    
    const { status, buyerType, limit = '50', offset = '0' } = req.query;
    
    const where: any = {
      referredById: userId,
      role: 'BUYER'
    };
    
    // 상태 필터
    if (status === 'active') {
      where.company = { isVerified: true };
    } else if (status === 'inactive') {
      where.company = { isVerified: false };
    }
    
    // 기업 유형 필터
    if (buyerType) {
      where.company = { ...where.company, buyerType };
    }
    
    const referrals = await prisma.user.findMany({
      where,
      include: {
        company: {
          select: {
            id: true,
            name: true,
            bizNo: true,
            buyerType: true,
            isVerified: true,
            representative: true,
            createdAt: true,
            buyerProfile: {
              select: {
                employeeCount: true,
                disabledCount: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: parseInt(limit as string),
      skip: parseInt(offset as string)
    });
    
    const total = await prisma.user.count({ where });
    
    res.json({
      referrals: referrals.map(r => ({
        id: r.id,
        name: r.name,
        phone: r.phone,
        managerName: r.managerName,
        managerTitle: r.managerTitle,
        managerEmail: r.managerEmail,
        company: r.company,
        createdAt: r.createdAt
      })),
      pagination: {
        total,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
        hasMore: parseInt(offset as string) + parseInt(limit as string) < total
      }
    });
  } catch (error: any) {
    console.error('[GET /agent/referrals] Error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/branch/:branchId/stats
 * 지사 통계 (지사에 속한 모든 매니저의 추천 통계)
 */
router.get('/branch/:branchId/stats', requireAuth, async (req: Request, res: Response) => {
  try {
    const { branchId } = req.params;
    
    // 권한 체크: SUPER_ADMIN이거나 해당 지사 소속이어야 함
    const userWithBranch = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { role: true, branchId: true }
    });
    
    if (userWithBranch?.role !== 'SUPER_ADMIN' && userWithBranch?.branchId !== branchId) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    // 지사 정보
    const branch = await prisma.branch.findUnique({
      where: { id: branchId }
    });
    
    if (!branch) {
      return res.status(404).json({ error: 'Branch not found' });
    }
    
    // 지사의 모든 매니저
    const managers = await prisma.user.findMany({
      where: {
        branchId,
        role: 'AGENT'
      },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true
      }
    });
    
    // 각 매니저의 추천 수 계산
    const managerStatsPromises = managers.map(async (manager) => {
      const referrals = await prisma.user.findMany({
        where: {
          referredById: manager.id,
          role: 'BUYER'
        },
        include: {
          company: {
            select: {
              isVerified: true,
              buyerType: true
            }
          }
        }
      });
      
      // 기업 유형별 집계
      const privateCompanies = referrals.filter(r => r.company?.buyerType === 'PRIVATE_COMPANY').length;
      const publicCompanies = referrals.filter(r => r.company?.buyerType === 'PUBLIC_INSTITUTION').length;
      const governmentCompanies = referrals.filter(r => r.company?.buyerType === 'GOVERNMENT').length;
      
      return {
        id: manager.id,
        name: manager.name,
        phone: manager.phone,
        email: manager.email,
        totalReferrals: referrals.length,
        activeReferrals: referrals.filter(r => r.company?.isVerified).length,
        privateCompanies,
        publicCompanies,
        governmentCompanies,
        referrals
      };
    });
    
    const managerStats = await Promise.all(managerStatsPromises);
    
    // 지사 전체 통계 계산
    let totalReferrals = 0;
    let activeReferrals = 0;
    let totalPrivateCompanies = 0;
    let totalPublicCompanies = 0;
    let totalGovernmentCompanies = 0;
    
    managerStats.forEach(manager => {
      totalReferrals += manager.totalReferrals;
      activeReferrals += manager.activeReferrals;
      totalPrivateCompanies += manager.privateCompanies;
      totalPublicCompanies += manager.publicCompanies;
      totalGovernmentCompanies += manager.governmentCompanies;
    });
    
    // 매니저 순위 정렬
    managerStats.sort((a, b) => b.totalReferrals - a.totalReferrals);
    
    res.json({
      branch: {
        id: branch.id,
        name: branch.name,
        region: branch.region,
        totalManagers: managers.length
      },
      stats: {
        totalManagers: managers.length,
        totalReferrals,
        totalCompanies: totalReferrals, // alias
        activeReferrals,
        privateCompanies: totalPrivateCompanies,
        publicCompanies: totalPublicCompanies,
        governmentCompanies: totalGovernmentCompanies
      },
      managers: managerStats.map(m => ({
        id: m.id,
        name: m.name,
        phone: m.phone,
        email: m.email,
        totalReferrals: m.totalReferrals,
        activeReferrals: m.activeReferrals,
        stats: {
          privateCompanies: m.privateCompanies,
          publicCompanies: m.publicCompanies,
          governmentCompanies: m.governmentCompanies
        }
      }))
    });
  } catch (error: any) {
    console.error('[GET /branch/:branchId/stats] Error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/headquarters/stats
 * 본부 전체 통계 (모든 지사 및 매니저의 추천 통계)
 */
router.get('/headquarters/stats', requireAuth, async (req: Request, res: Response) => {
  try {
    // SUPER_ADMIN만 접근 가능
    if (req.user!.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ error: 'SUPER_ADMIN role 사용자만 접근 가능합니다' });
    }
    
    // 모든 지사 조회
    const branches = await prisma.branch.findMany({
      orderBy: {
        name: 'asc'
      }
    });
    
    // 각 지사의 통계 계산
    const branchStatsPromises = branches.map(async (branch) => {
      const managers = await prisma.user.findMany({
        where: {
          branchId: branch.id,
          role: 'AGENT'
        },
        select: {
          id: true
        }
      });
      
      const managerIds = managers.map(m => m.id);
      
      // 지사 전체 추천 수
      const referrals = await prisma.user.findMany({
        where: {
          referredById: { in: managerIds },
          role: 'BUYER'
        },
        include: {
          company: {
            select: {
              isVerified: true,
              buyerType: true,
              createdAt: true
            }
          }
        }
      });
      
      return {
        branch,
        managers,
        referrals
      };
    });
    
    const branchDataList = await Promise.all(branchStatsPromises);
    
    // 전체 통계 계산
    let totalManagers = 0;
    let totalReferrals = 0;
    let activeReferrals = 0;
    let totalPrivateCompanies = 0;
    let totalPublicCompanies = 0;
    let totalGovernmentCompanies = 0;
    
    // 월별 추천 수 (최근 12개월)
    const now = new Date();
    const monthlyReferrals: Record<string, number> = {};
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyReferrals[key] = 0;
    }
    
    // 지사별 통계
    const branchStats = branchDataList.map(({ branch, managers, referrals }) => {
      const branchTotalManagers = managers.length;
      const branchTotalReferrals = referrals.length;
      const branchActiveReferrals = referrals.filter(r => r.company?.isVerified).length;
      
      // 기업 유형별 집계
      const privateCompanies = referrals.filter(r => r.company?.buyerType === 'PRIVATE_COMPANY').length;
      const publicCompanies = referrals.filter(r => r.company?.buyerType === 'PUBLIC_INSTITUTION').length;
      const governmentCompanies = referrals.filter(r => r.company?.buyerType === 'GOVERNMENT').length;
      
      totalManagers += branchTotalManagers;
      totalReferrals += branchTotalReferrals;
      activeReferrals += branchActiveReferrals;
      totalPrivateCompanies += privateCompanies;
      totalPublicCompanies += publicCompanies;
      totalGovernmentCompanies += governmentCompanies;
      
      // 월별 집계
      referrals.forEach((r: any) => {
        const date = new Date(r.company?.createdAt || r.createdAt);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        if (monthlyReferrals[key] !== undefined) {
          monthlyReferrals[key]++;
        }
      });
      
      return {
        id: branch.id,
        name: branch.name,
        region: branch.region,
        totalManagers: branchTotalManagers,
        totalReferrals: branchTotalReferrals,
        activeReferrals: branchActiveReferrals,
        stats: {
          privateCompanies,
          publicCompanies,
          governmentCompanies
        }
      };
    });
    
    // 지사 순위 정렬
    branchStats.sort((a, b) => b.totalReferrals - a.totalReferrals);
    
    res.json({
      summary: {
        totalBranches: branches.length,
        totalManagers,
        totalReferrals,
        totalCompanies: totalReferrals, // alias
        activeReferrals,
        privateCompanies: totalPrivateCompanies,
        publicCompanies: totalPublicCompanies,
        governmentCompanies: totalGovernmentCompanies
      },
      monthlyReferrals: Object.entries(monthlyReferrals).map(([month, count]) => ({
        month,
        count
      })),
      branches: branchStats
    });
  } catch (error: any) {
    console.error('[GET /headquarters/stats] Error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
