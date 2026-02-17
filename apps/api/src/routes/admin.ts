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

// ========================================
// 🏢 지사(Branch) 관리 API
// ========================================

// 지사 목록 조회
r.get("/branches", async (req, res) => {
  try {
    const branches = await prisma.branch.findMany({
      include: {
        _count: {
          select: { agents: true }, // 소속 매니저 수
        },
      },
      orderBy: { name: "asc" },
    });
    res.json({ ok: true, branches });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 지사 생성
const createBranchSchema = z.object({
  name: z.string().min(1, "지사명을 입력하세요"),
  code: z.string().min(1, "지사 코드를 입력하세요"),
  region: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
});

r.post("/branches", async (req, res) => {
  try {
    const body = createBranchSchema.parse(req.body);

    // 지사명 중복 체크
    const existing = await prisma.branch.findUnique({ where: { name: body.name } });
    if (existing) {
      return res.status(400).json({ error: "BRANCH_NAME_EXISTS" });
    }

    // 지사 코드 중복 체크
    const existingCode = await prisma.branch.findUnique({ where: { code: body.code } });
    if (existingCode) {
      return res.status(400).json({ error: "BRANCH_CODE_EXISTS" });
    }

    const branch = await prisma.branch.create({
      data: body,
    });

    res.json({ ok: true, branch });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "VALIDATION_ERROR", details: error.errors });
    }
    res.status(500).json({ error: error.message });
  }
});

// 지사 수정
const updateBranchSchema = z.object({
  name: z.string().min(1).optional(),
  region: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  isActive: z.boolean().optional(),
});

r.put("/branches/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const body = updateBranchSchema.parse(req.body);

    // 지사명 중복 체크 (변경하는 경우)
    if (body.name) {
      const existing = await prisma.branch.findFirst({
        where: { name: body.name, NOT: { id } },
      });
      if (existing) {
        return res.status(400).json({ error: "BRANCH_NAME_EXISTS" });
      }
    }

    const branch = await prisma.branch.update({
      where: { id },
      data: body,
    });

    res.json({ ok: true, branch });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "VALIDATION_ERROR", details: error.errors });
    }
    res.status(500).json({ error: error.message });
  }
});

// 지사 삭제 (소속 매니저가 없는 경우에만)
r.delete("/branches/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // 소속 매니저 확인
    const agentCount = await prisma.user.count({
      where: { branchId: id, role: "AGENT" },
    });

    if (agentCount > 0) {
      return res.status(400).json({
        error: "BRANCH_HAS_AGENTS",
        message: `이 지사에는 ${agentCount}명의 매니저가 소속되어 있습니다. 먼저 매니저를 이동하거나 삭제하세요.`,
      });
    }

    await prisma.branch.delete({ where: { id } });
    res.json({ ok: true, message: "지사가 삭제되었습니다" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 매니저 지사 이동
const moveAgentSchema = z.object({
  agentId: z.string().min(1),
  newBranchId: z.string().min(1),
});

r.post("/branches/move-agent", async (req, res) => {
  try {
    const body = moveAgentSchema.parse(req.body);

    // 매니저 확인
    const agent = await prisma.user.findUnique({
      where: { id: body.agentId },
      include: { branch: true },
    });

    if (!agent || agent.role !== "AGENT") {
      return res.status(404).json({ error: "AGENT_NOT_FOUND" });
    }

    // 새 지사 확인
    const newBranch = await prisma.branch.findUnique({
      where: { id: body.newBranchId },
    });

    if (!newBranch) {
      return res.status(404).json({ error: "BRANCH_NOT_FOUND" });
    }

    // 지사 이동
    const updated = await prisma.user.update({
      where: { id: body.agentId },
      data: { branchId: body.newBranchId },
      include: { branch: true },
    });

    res.json({
      ok: true,
      message: `${agent.name} 매니저가 ${agent.branch?.name}에서 ${newBranch.name}으로 이동되었습니다`,
      agent: {
        id: updated.id,
        name: updated.name,
        phone: updated.phone,
        branchName: updated.branch?.name,
      },
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "VALIDATION_ERROR", details: error.errors });
    }
    res.status(500).json({ error: error.message });
  }
});

// 지사별 매니저 목록 조회
r.get("/branches/:id/agents", async (req, res) => {
  try {
    const { id } = req.params;

    const branch = await prisma.branch.findUnique({
      where: { id },
      include: {
        agents: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
            refCode: true,
            createdAt: true,
            _count: {
              select: { referrals: true }, // 추천한 회원 수
            },
          },
        },
      },
    });

    if (!branch) {
      return res.status(404).json({ error: "BRANCH_NOT_FOUND" });
    }

    res.json({ ok: true, branch });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ========================================
// 📅 연도별 설정 관리
// ========================================

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
