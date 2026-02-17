import { Router } from "express";
import { z } from "zod";
import { prisma } from "../index.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// 직원 목록 조회
router.get("/", requireAuth, async (req, res) => {
  try {
    const userId = req.user!.id;
    const userRole = req.user!.role;

    if (userRole !== "BUYER") {
      return res.status(403).json({ error: "부담금기업만 접근 가능합니다." });
    }

    const company = await prisma.company.findUnique({
      where: { ownerUserId: userId },
      include: { buyerProfile: true },
    });

    if (!company || !company.buyerProfile) {
      return res.status(404).json({ error: "기업 정보가 없습니다." });
    }

    const employees = await prisma.disabledEmployee.findMany({
      where: { buyerId: company.buyerProfile.id },
      orderBy: [{ resignDate: "asc" }, { hireDate: "asc" }],
    });

    return res.json({ employees });
  } catch (error: any) {
    console.error("직원 목록 조회 실패:", error);
    return res.status(500).json({ error: error.message });
  }
});

// 직원 추가
router.post("/", requireAuth, async (req, res) => {
  try {
    const userId = req.user!.id;
    const userRole = req.user!.role;

    if (userRole !== "BUYER") {
      return res.status(403).json({ error: "부담금기업만 접근 가능합니다." });
    }

    const schema = z.object({
      name: z.string().min(1),
      registrationNumber: z.string().optional(),
      disabilityType: z.string().min(1),
      disabilityGrade: z.string().optional(),
      severity: z.enum(["MILD", "SEVERE"]),
      gender: z.enum(["M", "F"]),
      hireDate: z.string(), // ISO date
      resignDate: z.string().optional(),
      monthlySalary: z.number().int().positive(),
      hasEmploymentInsurance: z.boolean(),
      meetsMinimumWage: z.boolean(),
      workHoursPerWeek: z.number().int().optional(),
      memo: z.string().optional(),
    });

    const body = schema.parse(req.body);

    const company = await prisma.company.findUnique({
      where: { ownerUserId: userId },
      include: { buyerProfile: true },
    });

    if (!company || !company.buyerProfile) {
      return res.status(404).json({ error: "기업 정보가 없습니다." });
    }

    const employee = await prisma.disabledEmployee.create({
      data: {
        buyerId: company.buyerProfile.id,
        name: body.name,
        registrationNumber: body.registrationNumber,
        disabilityType: body.disabilityType,
        disabilityGrade: body.disabilityGrade,
        severity: body.severity,
        gender: body.gender,
        hireDate: new Date(body.hireDate),
        resignDate: body.resignDate ? new Date(body.resignDate) : null,
        monthlySalary: body.monthlySalary,
        hasEmploymentInsurance: body.hasEmploymentInsurance,
        meetsMinimumWage: body.meetsMinimumWage,
        workHoursPerWeek: body.workHoursPerWeek,
        memo: body.memo,
      },
    });

    return res.json({ employee });
  } catch (error: any) {
    console.error("직원 추가 실패:", error);
    return res.status(500).json({ error: error.message });
  }
});

// 직원 수정
router.put("/:id", requireAuth, async (req, res) => {
  try {
    const userId = req.user!.id;
    const userRole = req.user!.role;
    const employeeId = req.params.id;

    if (userRole !== "BUYER") {
      return res.status(403).json({ error: "부담금기업만 접근 가능합니다." });
    }

    const schema = z.object({
      name: z.string().min(1).optional(),
      registrationNumber: z.string().optional(),
      disabilityType: z.string().min(1).optional(),
      disabilityGrade: z.string().optional(),
      severity: z.enum(["MILD", "SEVERE"]).optional(),
      gender: z.enum(["M", "F"]).optional(),
      hireDate: z.string().optional(),
      resignDate: z.string().optional().nullable(),
      monthlySalary: z.number().int().positive().optional(),
      hasEmploymentInsurance: z.boolean().optional(),
      meetsMinimumWage: z.boolean().optional(),
      workHoursPerWeek: z.number().int().optional().nullable(),
      memo: z.string().optional().nullable(),
    });

    const body = schema.parse(req.body);

    const company = await prisma.company.findUnique({
      where: { ownerUserId: userId },
      include: { buyerProfile: true },
    });

    if (!company || !company.buyerProfile) {
      return res.status(404).json({ error: "기업 정보가 없습니다." });
    }

    // 직원 소유 확인
    const existing = await prisma.disabledEmployee.findUnique({
      where: { id: employeeId },
    });

    if (!existing || existing.buyerId !== company.buyerProfile.id) {
      return res.status(404).json({ error: "직원을 찾을 수 없습니다." });
    }

    const employee = await prisma.disabledEmployee.update({
      where: { id: employeeId },
      data: {
        name: body.name,
        registrationNumber: body.registrationNumber,
        disabilityType: body.disabilityType,
        disabilityGrade: body.disabilityGrade,
        severity: body.severity,
        gender: body.gender,
        hireDate: body.hireDate ? new Date(body.hireDate) : undefined,
        resignDate: body.resignDate === null ? null : (body.resignDate ? new Date(body.resignDate) : undefined),
        monthlySalary: body.monthlySalary,
        hasEmploymentInsurance: body.hasEmploymentInsurance,
        meetsMinimumWage: body.meetsMinimumWage,
        workHoursPerWeek: body.workHoursPerWeek === null ? null : body.workHoursPerWeek,
        memo: body.memo === null ? null : body.memo,
      },
    });

    return res.json({ employee });
  } catch (error: any) {
    console.error("직원 수정 실패:", error);
    return res.status(500).json({ error: error.message });
  }
});

// 직원 삭제
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const userId = req.user!.id;
    const userRole = req.user!.role;
    const employeeId = req.params.id;

    if (userRole !== "BUYER") {
      return res.status(403).json({ error: "부담금기업만 접근 가능합니다." });
    }

    const company = await prisma.company.findUnique({
      where: { ownerUserId: userId },
      include: { buyerProfile: true },
    });

    if (!company || !company.buyerProfile) {
      return res.status(404).json({ error: "기업 정보가 없습니다." });
    }

    // 직원 소유 확인
    const existing = await prisma.disabledEmployee.findUnique({
      where: { id: employeeId },
    });

    if (!existing || existing.buyerId !== company.buyerProfile.id) {
      return res.status(404).json({ error: "직원을 찾을 수 없습니다." });
    }

    await prisma.disabledEmployee.delete({
      where: { id: employeeId },
    });

    return res.json({ success: true });
  } catch (error: any) {
    console.error("직원 삭제 실패:", error);
    return res.status(500).json({ error: error.message });
  }
});

export default router;
