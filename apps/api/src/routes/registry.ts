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
