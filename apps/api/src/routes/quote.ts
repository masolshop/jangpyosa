import { Router } from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
const prisma = new PrismaClient();

// 견적문의 생성 스키마
const createQuoteInquirySchema = z.object({
  productId: z.string().optional(),
  companyName: z.string().min(1, '회사명을 입력해주세요'),
  contactName: z.string().min(1, '담당자명을 입력해주세요'),
  contactPhone: z.string().min(10, '연락처를 입력해주세요'),
  contactEmail: z.string().email('올바른 이메일을 입력해주세요').optional(),
  bizNo: z.string().optional(),
  category: z.string().min(1, '카테고리를 선택해주세요'),
  productName: z.string().min(1, '상품명을 입력해주세요'),
  quantity: z.number().int().positive().optional(),
  budget: z.string().optional(),
  timeline: z.string().optional(),
  requirements: z.string().optional(),
  attachmentUrls: z.string().optional(), // JSON array string
});

// POST /api/quotes - 견적문의 등록 (인증 불필요 - 누구나 문의 가능)
router.post('/', async (req, res) => {
  try {
    const data = createQuoteInquirySchema.parse(req.body);

    const inquiry = await prisma.quoteInquiry.create({
      data: {
        ...data,
        status: 'PENDING',
      },
    });

    res.status(201).json({
      message: '견적문의가 접수되었습니다. 빠른 시일 내에 연락드리겠습니다.',
      inquiry,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: '입력 정보가 올바르지 않습니다',
        details: error.errors 
      });
    }
    console.error('견적문의 생성 오류:', error);
    res.status(500).json({ error: '견적문의 접수 중 오류가 발생했습니다' });
  }
});

// GET /api/quotes - 견적문의 목록 조회 (슈퍼어드민 전용)
router.get('/', requireAuth, async (req, res) => {
  try {
    const user = req.user;

    // 슈퍼어드민만 조회 가능
    if (!user || user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ error: '접근 권한이 없습니다' });
    }

    const { status, category, page = '1', limit = '20' } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const where: any = {};
    if (status) where.status = status;
    if (category) where.category = category;

    const [inquiries, total] = await Promise.all([
      prisma.quoteInquiry.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit as string),
      }),
      prisma.quoteInquiry.count({ where }),
    ]);

    res.json({
      inquiries,
      pagination: {
        total,
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        totalPages: Math.ceil(total / parseInt(limit as string)),
      },
    });
  } catch (error) {
    console.error('견적문의 목록 조회 오류:', error);
    res.status(500).json({ error: '목록 조회 중 오류가 발생했습니다' });
  }
});

// GET /api/quotes/:id - 견적문의 상세 조회 (슈퍼어드민 전용)
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const user = req.user;

    if (!user || user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ error: '접근 권한이 없습니다' });
    }

    const inquiry = await prisma.quoteInquiry.findUnique({
      where: { id: req.params.id },
    });

    if (!inquiry) {
      return res.status(404).json({ error: '견적문의를 찾을 수 없습니다' });
    }

    res.json(inquiry);
  } catch (error) {
    console.error('견적문의 상세 조회 오류:', error);
    res.status(500).json({ error: '조회 중 오류가 발생했습니다' });
  }
});

// PUT /api/quotes/:id - 견적문의 처리 (슈퍼어드민 전용)
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const user = req.user;

    if (!user || user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ error: '접근 권한이 없습니다' });
    }

    const { status, adminNote } = req.body;

    const inquiry = await prisma.quoteInquiry.update({
      where: { id: req.params.id },
      data: {
        status,
        adminNote,
        respondedAt: status !== 'PENDING' ? new Date() : undefined,
        respondedBy: status !== 'PENDING' ? user!.id : undefined,
      },
    });

    res.json({
      message: '견적문의가 업데이트되었습니다',
      inquiry,
    });
  } catch (error) {
    console.error('견적문의 업데이트 오류:', error);
    res.status(500).json({ error: '업데이트 중 오류가 발생했습니다' });
  }
});

// GET /api/quotes/stats/summary - 견적문의 통계 (슈퍼어드민 전용)
router.get('/stats/summary', requireAuth, async (req, res) => {
  try {
    const user = req.user;

    if (!user || user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ error: '접근 권한이 없습니다' });
    }

    const [pending, inProgress, quoted, completed, total] = await Promise.all([
      prisma.quoteInquiry.count({ where: { status: 'PENDING' } }),
      prisma.quoteInquiry.count({ where: { status: 'IN_PROGRESS' } }),
      prisma.quoteInquiry.count({ where: { status: 'QUOTED' } }),
      prisma.quoteInquiry.count({ where: { status: 'COMPLETED' } }),
      prisma.quoteInquiry.count(),
    ]);

    res.json({
      pending,
      inProgress,
      quoted,
      completed,
      total,
    });
  } catch (error) {
    console.error('견적문의 통계 조회 오류:', error);
    res.status(500).json({ error: '통계 조회 중 오류가 발생했습니다' });
  }
});

export default router;
