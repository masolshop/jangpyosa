import { Router } from "express";
import multer from "multer";
import { z } from "zod";
import { prisma } from "../index.js";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/rbac.js";
import { parseSupplierExcel } from "../services/excel.js";

const r = Router();
const upload = multer();

r.use(requireAuth);
r.use(requireRole(["SUPER_ADMIN"]));

// 연도별 설정 upsert
r.post("/year-settings/upsert", async (req, res) => {
  try {
    const schema = z.object({
      year: z.number().int(),
      privateQuotaRate: z.number(),
      publicQuotaRate: z.number(),
      baseLevyAmount: z.number().int(),
      maxReductionRate: z.number().default(0.9),
      maxReductionByContract: z.number().default(0.5),
    });
    const body = schema.parse(req.body);

    const row = await prisma.yearSetting.upsert({
      where: { year: body.year },
      update: body,
      create: body,
    });
    res.json({ ok: true, row });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// 연도별 설정 목록 조회
r.get("/year-settings", async (req, res) => {
  const settings = await prisma.yearSetting.findMany({ orderBy: { year: "desc" } });
  res.json({ ok: true, settings });
});

// ⭐ 830개 공급사 엑셀 업로드 (SupplierRegistry에 저장)
r.post("/suppliers/import-excel", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "NO_FILE" });

    const rows = await parseSupplierExcel(req.file.buffer);

    let upserted = 0;
    let errors = 0;

    for (const s of rows) {
      try {
        const bizNo = s.bizNo.replace(/\D/g, "");
        if (bizNo.length !== 10) continue;

        await prisma.supplierRegistry.upsert({
          where: { bizNo },
          update: {
            name: s.name,
            region: s.region,
            industry: s.industry,
            contactTel: s.contactTel,
          },
          create: {
            name: s.name,
            bizNo,
            region: s.region,
            industry: s.industry,
            contactTel: s.contactTel,
          },
        });
        upserted++;
      } catch (err) {
        errors++;
        console.error("Error upserting supplier:", err);
      }
    }

    res.json({
      ok: true,
      message: "공급사 레지스트리 업로드 완료",
      total: rows.length,
      upserted,
      errors,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 공급사 레지스트리 목록
r.get("/suppliers/registry", async (req, res) => {
  const page = Number(req.query.page ?? 1);
  const limit = Number(req.query.limit ?? 50);

  const [suppliers, total] = await Promise.all([
    prisma.supplierRegistry.findMany({
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.supplierRegistry.count(),
  ]);

  res.json({
    ok: true,
    suppliers,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
});

// 콘텐츠 페이지 upsert
r.post("/pages/upsert", async (req, res) => {
  try {
    const schema = z.object({
      slug: z.string(),
      title: z.string(),
      contentMd: z.string(),
    });
    const body = schema.parse(req.body);

    const page = await prisma.page.upsert({
      where: { slug: body.slug },
      update: { title: body.title, contentMd: body.contentMd },
      create: body,
    });

    res.json({ ok: true, page });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// 통계 대시보드 (추천 기반 파이프라인)
r.get("/stats/pipeline", async (req, res) => {
  try {
    const agentId = req.query.agentId as string | undefined;

    const where = agentId ? { referredById: agentId } : {};

    const [totalUsers, buyers, suppliers, totalContracts] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.count({ where: { ...where, role: "BUYER" } }),
      prisma.user.count({ where: { ...where, role: "SUPPLIER" } }),
      prisma.contractRequest.count(),
    ]);

    res.json({
      ok: true,
      stats: {
        totalUsers,
        buyers,
        suppliers,
        totalContracts,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ 공급사 목록 조회 (승인 대기 포함)
r.get("/suppliers", async (req, res) => {
  try {
    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 20);
    const approvedOnly = req.query.approved === "true";

    const where: any = {};
    if (approvedOnly) {
      where.approved = true;
    }

    const [suppliers, total] = await Promise.all([
      prisma.supplierProfile.findMany({
        where,
        include: {
          company: true,
          registry: true,
          products: {
            where: { isActive: true },
            take: 5,
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.supplierProfile.count({ where }),
    ]);

    res.json({
      ok: true,
      suppliers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ 공급사 승인 API
r.post("/suppliers/:id/approve", async (req, res) => {
  try {
    const supplierId = req.params.id;
    const { approved } = req.body;

    const supplier = await prisma.supplierProfile.update({
      where: { id: supplierId },
      data: { approved: approved === true },
      include: {
        company: true,
      },
    });

    res.json({
      ok: true,
      message: approved ? "공급사가 승인되었습니다." : "공급사 승인이 취소되었습니다.",
      supplier,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ 공급사 상세 조회
r.get("/suppliers/:id", async (req, res) => {
  try {
    const supplier = await prisma.supplierProfile.findUnique({
      where: { id: req.params.id },
      include: {
        company: true,
        registry: true,
        products: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!supplier) {
      return res.status(404).json({ error: "공급사를 찾을 수 없습니다." });
    }

    res.json({ ok: true, supplier });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default r;
