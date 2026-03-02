import { Router, Request, Response } from 'express';
import { prisma } from '../index.js';

const router = Router();

// 표준사업장 목록 조회 (공개 API)
router.get('/list', async (req: Request, res: Response) => {
  try {
    const { page = '1', limit = '20', search } = req.query;

    const where: any = {};

    if (search && typeof search === 'string') {
      where.OR = [
        { name: { contains: search } },
        { industry: { contains: search } },
        { region: { contains: search } },
        { address: { contains: search } },
      ];
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);

    const [registries, total] = await Promise.all([
      prisma.supplierRegistry.findMany({
        where,
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.supplierRegistry.count({ where }),
    ]);

    res.json({
      ok: true,
      registries,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('Get registries list error:', error);
    res.status(500).json({ error: 'Failed to get registries' });
  }
});

// 사업자번호로 표준사업장 인증 확인 (공개 API)
router.get('/verify/:bizNo', async (req: Request, res: Response) => {
  try {
    const bizNo = req.params.bizNo.replace(/\D/g, ''); // 숫자만 추출
    
    if (bizNo.length !== 10) {
      return res.status(400).json({ 
        error: 'INVALID_BIZNO_FORMAT', 
        message: '사업자번호는 10자리 숫자여야 합니다' 
      });
    }

    const registry = await prisma.supplierRegistry.findUnique({
      where: { bizNo },
    });

    if (!registry) {
      return res.status(404).json({ 
        ok: false,
        error: 'NOT_REGISTERED_SUPPLIER', 
        message: '등록된 장애인표준사업장이 아닙니다. 인증을 받은 표준사업장만 가입 가능합니다.' 
      });
    }

    res.json({ 
      ok: true,
      registry: {
        name: registry.name,
        bizNo: registry.bizNo,
        representative: registry.representative,
        region: registry.region,
        industry: registry.industry,
        certNo: registry.certNo,
        certDate: registry.certDate,
        contactTel: registry.contactTel,
      },
      message: '장애인표준사업장 인증이 확인되었습니다'
    });
  } catch (error) {
    console.error('Verify registry bizNo error:', error);
    res.status(500).json({ error: 'Failed to verify registry' });
  }
});

// 표준사업장 상세 조회 (공개 API)
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const registry = await prisma.supplierRegistry.findUnique({
      where: { id: req.params.id },
      include: {
        claimedProfiles: {
          include: {
            company: true,
          },
        },
      },
    });

    if (!registry) {
      return res.status(404).json({ error: 'Registry not found' });
    }

    res.json({ registry });
  } catch (error) {
    console.error('Get registry detail error:', error);
    res.status(500).json({ error: 'Failed to get registry' });
  }
});

export default router;
