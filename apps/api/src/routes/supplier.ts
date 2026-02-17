import { Router, Request, Response } from 'express';
import { z } from 'zod';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { prisma } from '../index.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = Router();

// 이미지 업로드 설정
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, path.join(__dirname, '../../uploads/suppliers'));
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed!'));
  },
});

// 공급사 프로필 조회
router.get('/profile', requireAuth, requireRole('SUPPLIER'), async (req: any, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        company: {
          include: {
            supplierProfile: {
              include: {
                registry: true,
              },
            },
          },
        },
      },
    });

    if (!user?.company?.supplierProfile) {
      return res.status(404).json({ error: 'Supplier profile not found' });
    }

    res.json({ profile: user.company.supplierProfile });
  } catch (error) {
    console.error('Get supplier profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
});

// 공급사 프로필 업데이트
router.put('/profile', requireAuth, requireRole('SUPPLIER'), async (req: any, res: Response) => {
  try {
    const schema = z.object({
      region: z.string().optional(),
      industry: z.string().optional(),
      contactName: z.string().optional(),
      contactTel: z.string().optional(),
      contractDescription: z.string().optional(),
      minContractAmount: z.number().int().positive().optional().nullable(),
      maxContractAmount: z.number().int().positive().optional().nullable(),
      detailPageContent: z.string().optional().nullable(),
    });

    const data = schema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { company: { include: { supplierProfile: true } } },
    });

    if (!user?.company?.supplierProfile) {
      return res.status(404).json({ error: 'Supplier profile not found' });
    }

    const updated = await prisma.supplierProfile.update({
      where: { id: user.company.supplierProfile.id },
      data,
      include: { registry: true },
    });

    res.json({ ok: true, profile: updated });
  } catch (error) {
    console.error('Update supplier profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// 이미지 업로드 (최대 5개)
router.post(
  '/profile/images',
  requireAuth,
  requireRole('SUPPLIER'),
  upload.array('images', 5),
  async (req: any, res: Response) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        include: { company: { include: { supplierProfile: true } } },
      });

      if (!user?.company?.supplierProfile) {
        return res.status(404).json({ error: 'Supplier profile not found' });
      }

      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        return res.status(400).json({ error: 'No images uploaded' });
      }

      // Generate URLs for uploaded files
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const imageUrls = files.map((file) => `${baseUrl}/uploads/suppliers/${file.filename}`);

      // Update profile with image URLs
      const updateData: any = {};
      imageUrls.forEach((url, index) => {
        if (index < 5) {
          updateData[`image${index + 1}`] = url;
        }
      });

      const updated = await prisma.supplierProfile.update({
        where: { id: user.company.supplierProfile.id },
        data: updateData,
      });

      res.json({ ok: true, images: imageUrls, profile: updated });
    } catch (error) {
      console.error('Upload images error:', error);
      res.status(500).json({ error: 'Failed to upload images' });
    }
  }
);

// 이미지 삭제
router.delete('/profile/images/:imageIndex', requireAuth, requireRole('SUPPLIER'), async (req: any, res: Response) => {
  try {
    const imageIndex = parseInt(req.params.imageIndex);
    if (imageIndex < 1 || imageIndex > 5) {
      return res.status(400).json({ error: 'Invalid image index (must be 1-5)' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { company: { include: { supplierProfile: true } } },
    });

    if (!user?.company?.supplierProfile) {
      return res.status(404).json({ error: 'Supplier profile not found' });
    }

    const updateData: any = {};
    updateData[`image${imageIndex}`] = null;

    const updated = await prisma.supplierProfile.update({
      where: { id: user.company.supplierProfile.id },
      data: updateData,
    });

    res.json({ ok: true, profile: updated });
  } catch (error) {
    console.error('Delete image error:', error);
    res.status(500).json({ error: 'Failed to delete image' });
  }
});

// 공급사 목록 조회 (공개 API - 승인된 공급사만)
router.get('/list', async (req: Request, res: Response) => {
  try {
    const { page = '1', limit = '20', search, region, industry } = req.query;

    const where: any = {
      approved: true,
    };

    if (search && typeof search === 'string') {
      where.OR = [
        { company: { name: { contains: search } } },
        { industry: { contains: search } },
      ];
    }

    if (region && typeof region === 'string') {
      where.region = { contains: region };
    }

    if (industry && typeof industry === 'string') {
      where.industry = { contains: industry };
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);

    const [suppliers, total] = await Promise.all([
      prisma.supplierProfile.findMany({
        where,
        include: {
          company: true,
          registry: true,
        },
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.supplierProfile.count({ where }),
    ]);

    res.json({
      suppliers,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('Get suppliers list error:', error);
    res.status(500).json({ error: 'Failed to get suppliers' });
  }
});

// 공급사 상세 조회 (공개 API)
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const supplier = await prisma.supplierProfile.findUnique({
      where: { id: req.params.id },
      include: {
        company: true,
        registry: true,
        products: {
          where: { isActive: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!supplier) {
      return res.status(404).json({ error: 'Supplier not found' });
    }

    if (!supplier.approved) {
      return res.status(403).json({ error: 'Supplier not approved yet' });
    }

    res.json({ supplier });
  } catch (error) {
    console.error('Get supplier detail error:', error);
    res.status(500).json({ error: 'Failed to get supplier' });
  }
});

export default router;
