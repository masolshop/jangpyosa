import { Router } from "express";
import { z } from "zod";
import { prisma } from "../index.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// 기업 정보 조회 (본인 기업)
router.get("/me", requireAuth, async (req, res) => {
  try {
    const userId = req.user!.id;
    const userRole = req.user!.role;

    if (userRole !== "BUYER") {
      return res.status(403).json({ error: "부담금기업만 접근 가능합니다." });
    }

    // Company 조회
    const company = await prisma.company.findUnique({
      where: { ownerUserId: userId },
      include: {
        buyerProfile: true,
      },
    });

    if (!company) {
      return res.status(404).json({ error: "기업 정보가 없습니다." });
    }

    // yearlyEmployeesJson 파싱
    let yearlyEmployees = {};
    if (company.buyerProfile?.yearlyEmployeesJson) {
      try {
        yearlyEmployees = JSON.parse(company.buyerProfile.yearlyEmployeesJson);
      } catch (e) {
        yearlyEmployees = {};
      }
    }

    return res.json({
      company: {
        id: company.id,
        name: company.name,
        bizNo: company.bizNo,
        representative: company.representative,
        type: company.type,
        isVerified: company.isVerified,
      },
      buyerProfile: {
        id: company.buyerProfile?.id,
        employeeCount: company.buyerProfile?.employeeCount || 0,
        disabledCount: company.buyerProfile?.disabledCount || 0,
        yearlyEmployees,
      },
    });
  } catch (error: any) {
    console.error("기업 정보 조회 실패:", error);
    return res.status(500).json({ error: error.message });
  }
});

// 기업 정보 수정 (월별 상시근로자 수 저장)
router.put("/me", requireAuth, async (req, res) => {
  try {
    const userId = req.user!.id;
    const userRole = req.user!.role;

    if (userRole !== "BUYER") {
      return res.status(403).json({ error: "부담금기업만 접근 가능합니다." });
    }

    const schema = z.object({
      yearlyEmployees: z.record(
        z.string(),
        z.record(z.string(), z.number())
      ).optional(), // { "2026": { "1": 100, "2": 105, ... } }
    });

    const body = schema.parse(req.body);

    const company = await prisma.company.findUnique({
      where: { ownerUserId: userId },
      include: { buyerProfile: true },
    });

    if (!company || !company.buyerProfile) {
      return res.status(404).json({ error: "기업 정보가 없습니다." });
    }

    // buyerProfile 업데이트
    const updated = await prisma.buyerProfile.update({
      where: { id: company.buyerProfile.id },
      data: {
        yearlyEmployeesJson: body.yearlyEmployees
          ? JSON.stringify(body.yearlyEmployees)
          : undefined,
      },
    });

    return res.json({
      success: true,
      buyerProfile: {
        id: updated.id,
        yearlyEmployees: body.yearlyEmployees,
      },
    });
  } catch (error: any) {
    console.error("기업 정보 수정 실패:", error);
    return res.status(500).json({ error: error.message });
  }
});

export default router;
