import { Router } from "express";
import { z } from "zod";
import { prisma } from "../index.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// 계약 목록 조회
router.get("/", requireAuth, async (req, res) => {
  try {
    const userId = req.user!.id;
    const userRole = req.user!.role;

    // 쿼리 파라미터
    const status = req.query.status as string | undefined;
    const year = req.query.year ? parseInt(req.query.year as string) : undefined;

    let contracts = [];

    if (userRole === "SUPER_ADMIN") {
      // 슈퍼어드민: 모든 계약 조회
      contracts = await prisma.contract.findMany({
        where: {
          ...(status && { status }),
          ...(year && {
            OR: [
              { startDate: { gte: new Date(year, 0, 1), lte: new Date(year, 11, 31) } },
              { endDate: { gte: new Date(year, 0, 1), lte: new Date(year, 11, 31) } },
            ],
          }),
        },
        include: {
          buyer: {
            include: {
              company: true,
            },
          },
          supplier: {
            include: {
              company: true,
            },
          },
          monthlyPerformances: {
            orderBy: [{ year: "asc" }, { month: "asc" }],
          },
        },
        orderBy: { createdAt: "desc" },
      });
    } else if (userRole === "BUYER") {
      // 부담금기업: 자사 계약만 조회
      const company = await prisma.company.findUnique({
        where: { ownerUserId: userId },
        include: { buyerProfile: true },
      });

      if (!company || !company.buyerProfile) {
        return res.status(404).json({ error: "기업 정보가 없습니다." });
      }

      contracts = await prisma.contract.findMany({
        where: {
          buyerId: company.buyerProfile.id,
          ...(status && { status }),
          ...(year && {
            OR: [
              { startDate: { gte: new Date(year, 0, 1), lte: new Date(year, 11, 31) } },
              { endDate: { gte: new Date(year, 0, 1), lte: new Date(year, 11, 31) } },
            ],
          }),
        },
        include: {
          supplier: {
            include: {
              company: true,
            },
          },
          monthlyPerformances: {
            orderBy: [{ year: "asc" }, { month: "asc" }],
          },
        },
        orderBy: { createdAt: "desc" },
      });
    } else if (userRole === "SUPPLIER") {
      // 표준사업장: 자사 계약만 조회
      const company = await prisma.company.findUnique({
        where: { ownerUserId: userId },
        include: { supplierProfile: true },
      });

      if (!company || !company.supplierProfile) {
        return res.status(404).json({ error: "기업 정보가 없습니다." });
      }

      contracts = await prisma.contract.findMany({
        where: {
          supplierId: company.supplierProfile.id,
          ...(status && { status }),
          ...(year && {
            OR: [
              { startDate: { gte: new Date(year, 0, 1), lte: new Date(year, 11, 31) } },
              { endDate: { gte: new Date(year, 0, 1), lte: new Date(year, 11, 31) } },
            ],
          }),
        },
        include: {
          buyer: {
            include: {
              company: true,
            },
          },
          monthlyPerformances: {
            orderBy: [{ year: "asc" }, { month: "asc" }],
          },
        },
        orderBy: { createdAt: "desc" },
      });
    } else {
      return res.status(403).json({ error: "접근 권한이 없습니다." });
    }

    return res.json({ contracts });
  } catch (error: any) {
    console.error("계약 목록 조회 실패:", error);
    return res.status(500).json({ error: error.message });
  }
});

// 계약 상세 조회
router.get("/:id", requireAuth, async (req, res) => {
  try {
    const contractId = req.params.id;
    const userId = req.user!.id;
    const userRole = req.user!.role;

    const contract = await prisma.contract.findUnique({
      where: { id: contractId },
      include: {
        buyer: {
          include: {
            company: true,
          },
        },
        supplier: {
          include: {
            company: true,
          },
        },
        monthlyPerformances: {
          orderBy: [{ year: "asc" }, { month: "asc" }],
        },
      },
    });

    if (!contract) {
      return res.status(404).json({ error: "계약을 찾을 수 없습니다." });
    }

    // 권한 체크
    if (userRole !== "SUPER_ADMIN") {
      const company = await prisma.company.findUnique({
        where: { ownerUserId: userId },
        include: { buyerProfile: true, supplierProfile: true },
      });

      const isBuyer = company?.buyerProfile?.id === contract.buyerId;
      const isSupplier = company?.supplierProfile?.id === contract.supplierId;

      if (!isBuyer && !isSupplier) {
        return res.status(403).json({ error: "접근 권한이 없습니다." });
      }
    }

    return res.json({ contract });
  } catch (error: any) {
    console.error("계약 상세 조회 실패:", error);
    return res.status(500).json({ error: error.message });
  }
});

// 계약 생성
router.post("/", requireAuth, async (req, res) => {
  try {
    const userId = req.user!.id;
    const userRole = req.user!.role;

    if (userRole !== "BUYER" && userRole !== "SUPER_ADMIN") {
      return res.status(403).json({ error: "계약은 부담금기업만 생성할 수 있습니다." });
    }

    const schema = z.object({
      supplierId: z.string().min(1),
      contractName: z.string().min(1),
      startDate: z.string(), // ISO date
      endDate: z.string(), // ISO date
      totalAmount: z.number().int().positive(),
      monthlyAmount: z.number().int().positive().optional(),
      paymentTerms: z.string().optional(),
      contractFileUrl: z.string().optional(),
      memo: z.string().optional(),
    });

    const body = schema.parse(req.body);

    // BUYER인 경우 자사 BuyerProfile 조회
    let buyerId: string;
    if (userRole === "SUPER_ADMIN") {
      const firstBuyer = await prisma.buyerProfile.findFirst();
      if (!firstBuyer) {
        return res.status(404).json({ error: "부담금기업 정보가 없습니다." });
      }
      buyerId = firstBuyer.id;
    } else {
      const company = await prisma.company.findUnique({
        where: { ownerUserId: userId },
        include: { buyerProfile: true },
      });

      if (!company || !company.buyerProfile) {
        return res.status(404).json({ error: "기업 정보가 없습니다." });
      }
      buyerId = company.buyerProfile.id;
    }

    // 계약번호 자동 생성 (CT-YYYY-NNNN)
    const year = new Date().getFullYear();
    const lastContract = await prisma.contract.findFirst({
      where: {
        contractNo: {
          startsWith: `CT-${year}-`,
        },
      },
      orderBy: { contractNo: "desc" },
    });

    let contractNo = `CT-${year}-0001`;
    if (lastContract) {
      const lastNo = parseInt(lastContract.contractNo.split("-")[2]);
      contractNo = `CT-${year}-${String(lastNo + 1).padStart(4, "0")}`;
    }

    // 계약 생성
    const contract = await prisma.contract.create({
      data: {
        contractNo,
        buyerId,
        supplierId: body.supplierId,
        contractName: body.contractName,
        startDate: new Date(body.startDate),
        endDate: new Date(body.endDate),
        totalAmount: body.totalAmount,
        monthlyAmount: body.monthlyAmount,
        paymentTerms: body.paymentTerms,
        contractFileUrl: body.contractFileUrl,
        memo: body.memo,
        status: "ACTIVE",
      },
      include: {
        buyer: {
          include: { company: true },
        },
        supplier: {
          include: { company: true },
        },
      },
    });

    // 월별 이행 계획 자동 생성
    const startDate = new Date(body.startDate);
    const endDate = new Date(body.endDate);
    const monthlyPerformances = [];

    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;

      monthlyPerformances.push({
        contractId: contract.id,
        year,
        month,
        plannedAmount: body.monthlyAmount || Math.floor(body.totalAmount / 12),
        inspectionStatus: "PENDING",
        paymentStatus: "UNPAID",
      });

      currentDate.setMonth(currentDate.getMonth() + 1);
    }

    await prisma.monthlyPerformance.createMany({
      data: monthlyPerformances,
    });

    return res.json({ contract });
  } catch (error: any) {
    console.error("계약 생성 실패:", error);
    if (error.name === "ZodError") {
      return res.status(400).json({ error: "입력값 검증 실패", details: error.errors });
    }
    return res.status(500).json({ error: error.message });
  }
});

// 계약 수정
router.put("/:id", requireAuth, async (req, res) => {
  try {
    const contractId = req.params.id;
    const userId = req.user!.id;
    const userRole = req.user!.role;

    const schema = z.object({
      contractName: z.string().min(1).optional(),
      status: z.enum(["ACTIVE", "SUSPENDED", "TERMINATED", "COMPLETED"]).optional(),
      paymentTerms: z.string().optional(),
      contractFileUrl: z.string().optional(),
      memo: z.string().optional(),
    });

    const body = schema.parse(req.body);

    // 계약 조회 및 권한 체크
    const contract = await prisma.contract.findUnique({
      where: { id: contractId },
    });

    if (!contract) {
      return res.status(404).json({ error: "계약을 찾을 수 없습니다." });
    }

    if (userRole !== "SUPER_ADMIN") {
      const company = await prisma.company.findUnique({
        where: { ownerUserId: userId },
        include: { buyerProfile: true },
      });

      if (!company?.buyerProfile || company.buyerProfile.id !== contract.buyerId) {
        return res.status(403).json({ error: "접근 권한이 없습니다." });
      }
    }

    // 계약 수정
    const updatedContract = await prisma.contract.update({
      where: { id: contractId },
      data: {
        contractName: body.contractName,
        status: body.status,
        paymentTerms: body.paymentTerms,
        contractFileUrl: body.contractFileUrl,
        memo: body.memo,
      },
      include: {
        buyer: {
          include: { company: true },
        },
        supplier: {
          include: { company: true },
        },
      },
    });

    return res.json({ contract: updatedContract });
  } catch (error: any) {
    console.error("계약 수정 실패:", error);
    if (error.name === "ZodError") {
      return res.status(400).json({ error: "입력값 검증 실패", details: error.errors });
    }
    return res.status(500).json({ error: error.message });
  }
});

// 계약 삭제
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const contractId = req.params.id;
    const userId = req.user!.id;
    const userRole = req.user!.role;

    // 계약 조회 및 권한 체크
    const contract = await prisma.contract.findUnique({
      where: { id: contractId },
    });

    if (!contract) {
      return res.status(404).json({ error: "계약을 찾을 수 없습니다." });
    }

    if (userRole !== "SUPER_ADMIN") {
      const company = await prisma.company.findUnique({
        where: { ownerUserId: userId },
        include: { buyerProfile: true },
      });

      if (!company?.buyerProfile || company.buyerProfile.id !== contract.buyerId) {
        return res.status(403).json({ error: "접근 권한이 없습니다." });
      }
    }

    // 계약 삭제 (월별 이행 내역도 Cascade로 함께 삭제됨)
    await prisma.contract.delete({
      where: { id: contractId },
    });

    return res.json({ success: true });
  } catch (error: any) {
    console.error("계약 삭제 실패:", error);
    return res.status(500).json({ error: error.message });
  }
});

// 계약 통계
router.get("/stats", requireAuth, async (req, res) => {
  try {
    const userId = req.user!.id;
    const userRole = req.user!.role;
    const year = req.query.year ? parseInt(req.query.year as string) : new Date().getFullYear();

    let buyerId: string | undefined;

    if (userRole === "BUYER") {
      const company = await prisma.company.findUnique({
        where: { ownerUserId: userId },
        include: { buyerProfile: true },
      });

      if (!company || !company.buyerProfile) {
        return res.status(404).json({ error: "기업 정보가 없습니다." });
      }
      buyerId = company.buyerProfile.id;
    } else if (userRole !== "SUPER_ADMIN") {
      return res.status(403).json({ error: "접근 권한이 없습니다." });
    }

    // 전체 계약 수
    const totalContracts = await prisma.contract.count({
      where: buyerId ? { buyerId } : undefined,
    });

    // 진행 중 계약 수
    const activeContracts = await prisma.contract.count({
      where: {
        ...(buyerId && { buyerId }),
        status: "ACTIVE",
      },
    });

    // 당월 통계
    const currentMonth = new Date().getMonth() + 1;
    
    const monthlyStats = await prisma.monthlyPerformance.aggregate({
      where: {
        year,
        month: currentMonth,
        contract: buyerId ? { buyerId } : undefined,
      },
      _sum: {
        plannedAmount: true,
        actualAmount: true,
        paymentAmount: true,
      },
    });

    // 미결제 금액 (검수 합격했으나 미지급)
    const unpaidStats = await prisma.monthlyPerformance.aggregate({
      where: {
        year,
        contract: buyerId ? { buyerId } : undefined,
        inspectionStatus: "PASSED",
        paymentStatus: { in: ["UNPAID", "PARTIAL"] },
      },
      _sum: {
        actualAmount: true,
        paymentAmount: true,
      },
    });

    const unpaidAmount = (unpaidStats._sum.actualAmount || 0) - (unpaidStats._sum.paymentAmount || 0);

    return res.json({
      year,
      totalContracts,
      activeContracts,
      monthlyPlanned: monthlyStats._sum.plannedAmount || 0,
      monthlyActual: monthlyStats._sum.actualAmount || 0,
      monthlyPaid: monthlyStats._sum.paymentAmount || 0,
      unpaidAmount,
    });
  } catch (error: any) {
    console.error("계약 통계 조회 실패:", error);
    return res.status(500).json({ error: error.message });
  }
});

export default router;
