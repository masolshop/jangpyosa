import { Router } from "express";
import { z } from "zod";
import { prisma } from "../index.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// 특정 계약의 월별 이행 목록 조회
router.get("/contracts/:contractId/performances", requireAuth, async (req, res) => {
  try {
    const contractId = req.params.contractId;
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
        include: { buyerProfile: true, supplierProfile: true },
      });

      const isBuyer = company?.buyerProfile?.id === contract.buyerId;
      const isSupplier = company?.supplierProfile?.id === contract.supplierId;

      if (!isBuyer && !isSupplier) {
        return res.status(403).json({ error: "접근 권한이 없습니다." });
      }
    }

    const performances = await prisma.monthlyPerformance.findMany({
      where: { contractId },
      orderBy: [{ year: "asc" }, { month: "asc" }],
    });

    return res.json({ performances });
  } catch (error: any) {
    console.error("월별 이행 목록 조회 실패:", error);
    return res.status(500).json({ error: error.message });
  }
});

// 월별 이행 상세 조회
router.get("/performances/:id", requireAuth, async (req, res) => {
  try {
    const performanceId = req.params.id;
    const userId = req.user!.id;
    const userRole = req.user!.role;

    const performance = await prisma.monthlyPerformance.findUnique({
      where: { id: performanceId },
      include: {
        contract: {
          include: {
            buyer: { include: { company: true } },
            supplier: { include: { company: true } },
          },
        },
      },
    });

    if (!performance) {
      return res.status(404).json({ error: "이행 내역을 찾을 수 없습니다." });
    }

    // 권한 체크
    if (userRole !== "SUPER_ADMIN") {
      const company = await prisma.company.findUnique({
        where: { ownerUserId: userId },
        include: { buyerProfile: true, supplierProfile: true },
      });

      const isBuyer = company?.buyerProfile?.id === performance.contract.buyerId;
      const isSupplier = company?.supplierProfile?.id === performance.contract.supplierId;

      if (!isBuyer && !isSupplier) {
        return res.status(403).json({ error: "접근 권한이 없습니다." });
      }
    }

    return res.json({ performance });
  } catch (error: any) {
    console.error("이행 상세 조회 실패:", error);
    return res.status(500).json({ error: error.message });
  }
});

// 이행 등록/수정 (표준사업장이 이행 내역 입력)
router.put("/performances/:id", requireAuth, async (req, res) => {
  try {
    const performanceId = req.params.id;
    const userId = req.user!.id;
    const userRole = req.user!.role;

    const schema = z.object({
      actualAmount: z.number().int().positive().optional(),
      description: z.string().optional(),
      evidenceFileUrls: z.string().optional(), // JSON array string
    });

    const body = schema.parse(req.body);

    // 이행 내역 조회
    const performance = await prisma.monthlyPerformance.findUnique({
      where: { id: performanceId },
      include: { contract: true },
    });

    if (!performance) {
      return res.status(404).json({ error: "이행 내역을 찾을 수 없습니다." });
    }

    // 권한 체크: 표준사업장만 이행 등록 가능
    if (userRole !== "SUPER_ADMIN") {
      const company = await prisma.company.findUnique({
        where: { ownerUserId: userId },
        include: { supplierProfile: true },
      });

      if (!company?.supplierProfile || company.supplierProfile.id !== performance.contract.supplierId) {
        return res.status(403).json({ error: "접근 권한이 없습니다." });
      }
    }

    // 이행률 계산
    let performanceRate = null;
    if (body.actualAmount !== undefined && performance.plannedAmount > 0) {
      performanceRate = (body.actualAmount / performance.plannedAmount) * 100;
    }

    // 이행 내역 업데이트
    const updatedPerformance = await prisma.monthlyPerformance.update({
      where: { id: performanceId },
      data: {
        actualAmount: body.actualAmount,
        performanceRate,
        description: body.description,
        evidenceFileUrls: body.evidenceFileUrls,
      },
    });

    return res.json({ performance: updatedPerformance });
  } catch (error: any) {
    console.error("이행 등록 실패:", error);
    if (error.name === "ZodError") {
      return res.status(400).json({ error: "입력값 검증 실패", details: error.errors });
    }
    return res.status(500).json({ error: error.message });
  }
});

// 검수 처리 (부담금기업이 검수 진행)
router.put("/performances/:id/inspection", requireAuth, async (req, res) => {
  try {
    const performanceId = req.params.id;
    const userId = req.user!.id;
    const userRole = req.user!.role;

    const schema = z.object({
      inspectionStatus: z.enum(["PASSED", "FAILED", "WAIVED"]),
      inspectionNotes: z.string().optional(),
    });

    const body = schema.parse(req.body);

    // 이행 내역 조회
    const performance = await prisma.monthlyPerformance.findUnique({
      where: { id: performanceId },
      include: { contract: true },
    });

    if (!performance) {
      return res.status(404).json({ error: "이행 내역을 찾을 수 없습니다." });
    }

    // 권한 체크: 부담금기업만 검수 가능
    if (userRole !== "SUPER_ADMIN") {
      const company = await prisma.company.findUnique({
        where: { ownerUserId: userId },
        include: { buyerProfile: true },
      });

      if (!company?.buyerProfile || company.buyerProfile.id !== performance.contract.buyerId) {
        return res.status(403).json({ error: "접근 권한이 없습니다." });
      }
    }

    // 실제 이행금액이 입력되지 않은 경우
    if (!performance.actualAmount) {
      return res.status(400).json({ error: "이행 금액이 입력되지 않았습니다." });
    }

    // 검수 처리
    const updatedPerformance = await prisma.monthlyPerformance.update({
      where: { id: performanceId },
      data: {
        inspectionStatus: body.inspectionStatus,
        inspectionDate: new Date(),
        inspectionNotes: body.inspectionNotes,
      },
    });

    return res.json({ performance: updatedPerformance });
  } catch (error: any) {
    console.error("검수 처리 실패:", error);
    if (error.name === "ZodError") {
      return res.status(400).json({ error: "입력값 검증 실패", details: error.errors });
    }
    return res.status(500).json({ error: error.message });
  }
});

// 결제 처리 (부담금기업이 결제 진행)
router.put("/performances/:id/payment", requireAuth, async (req, res) => {
  try {
    const performanceId = req.params.id;
    const userId = req.user!.id;
    const userRole = req.user!.role;

    const schema = z.object({
      paymentAmount: z.number().int().positive(),
      paymentDate: z.string(), // ISO date
      paymentMethod: z.string().min(1),
      paymentReference: z.string().optional(),
      invoiceNo: z.string().optional(),
      invoiceDate: z.string().optional(), // ISO date
      invoiceFileUrl: z.string().optional(),
    });

    const body = schema.parse(req.body);

    // 이행 내역 조회
    const performance = await prisma.monthlyPerformance.findUnique({
      where: { id: performanceId },
      include: { contract: true },
    });

    if (!performance) {
      return res.status(404).json({ error: "이행 내역을 찾을 수 없습니다." });
    }

    // 권한 체크: 부담금기업만 결제 가능
    if (userRole !== "SUPER_ADMIN") {
      const company = await prisma.company.findUnique({
        where: { ownerUserId: userId },
        include: { buyerProfile: true },
      });

      if (!company?.buyerProfile || company.buyerProfile.id !== performance.contract.buyerId) {
        return res.status(403).json({ error: "접근 권한이 없습니다." });
      }
    }

    // 검수 합격 여부 확인
    if (performance.inspectionStatus !== "PASSED" && performance.inspectionStatus !== "WAIVED") {
      return res.status(400).json({ error: "검수가 완료되지 않았습니다." });
    }

    // 결제 금액이 실제 이행금액을 초과하는지 확인
    if (body.paymentAmount > (performance.actualAmount || 0)) {
      return res.status(400).json({ error: "결제 금액이 이행 금액을 초과할 수 없습니다." });
    }

    // 결제 상태 결정
    let paymentStatus = "PAID";
    if (body.paymentAmount < (performance.actualAmount || 0)) {
      paymentStatus = "PARTIAL";
    }

    // 결제 처리
    const updatedPerformance = await prisma.monthlyPerformance.update({
      where: { id: performanceId },
      data: {
        paymentAmount: body.paymentAmount,
        paymentDate: new Date(body.paymentDate),
        paymentMethod: body.paymentMethod,
        paymentReference: body.paymentReference,
        paymentStatus,
        invoiceNo: body.invoiceNo,
        invoiceDate: body.invoiceDate ? new Date(body.invoiceDate) : null,
        invoiceFileUrl: body.invoiceFileUrl,
      },
    });

    // 결제 이력 기록
    await prisma.paymentHistory.create({
      data: {
        performanceId: performanceId,
        amount: body.paymentAmount,
        paymentDate: new Date(body.paymentDate),
        paymentMethod: body.paymentMethod,
        reference: body.paymentReference,
        status: "COMPLETED",
        createdBy: userId,
      },
    });

    return res.json({ performance: updatedPerformance });
  } catch (error: any) {
    console.error("결제 처리 실패:", error);
    if (error.name === "ZodError") {
      return res.status(400).json({ error: "입력값 검증 실패", details: error.errors });
    }
    return res.status(500).json({ error: error.message });
  }
});

// 결제 이력 조회
router.get("/performances/:id/payment-history", requireAuth, async (req, res) => {
  try {
    const performanceId = req.params.id;
    const userId = req.user!.id;
    const userRole = req.user!.role;

    // 이행 내역 조회 및 권한 체크
    const performance = await prisma.monthlyPerformance.findUnique({
      where: { id: performanceId },
      include: { contract: true },
    });

    if (!performance) {
      return res.status(404).json({ error: "이행 내역을 찾을 수 없습니다." });
    }

    if (userRole !== "SUPER_ADMIN") {
      const company = await prisma.company.findUnique({
        where: { ownerUserId: userId },
        include: { buyerProfile: true, supplierProfile: true },
      });

      const isBuyer = company?.buyerProfile?.id === performance.contract.buyerId;
      const isSupplier = company?.supplierProfile?.id === performance.contract.supplierId;

      if (!isBuyer && !isSupplier) {
        return res.status(403).json({ error: "접근 권한이 없습니다." });
      }
    }

    const history = await prisma.paymentHistory.findMany({
      where: { performanceId },
      orderBy: { createdAt: "desc" },
    });

    return res.json({ history });
  } catch (error: any) {
    console.error("결제 이력 조회 실패:", error);
    return res.status(500).json({ error: error.message });
  }
});

export default router;
