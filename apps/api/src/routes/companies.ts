import { Router } from "express";
import { z } from "zod";
import { prisma } from "../index.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// 기업 정보 조회 (본인 기업)
router.get("/my", requireAuth, async (req, res) => {
  try {
    const userId = req.user!.id;
    const userRole = req.user!.role;

    if (userRole !== "BUYER" && userRole !== "SUPPLIER") {
      return res.status(403).json({ error: "기업 회원만 접근 가능합니다." });
    }

    // User의 companyId로 Company 조회
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { companyId: true, isCompanyOwner: true }
    });

    if (!user?.companyId) {
      return res.status(404).json({ error: "소속 기업이 없습니다." });
    }

    // Company 조회
    const company = await prisma.company.findUnique({
      where: { id: user.companyId },
      include: {
        buyerProfile: true,
        supplierProfile: true,
        members: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
            managerName: true,
            managerTitle: true,
            managerEmail: true,
            managerPhone: true,
            isCompanyOwner: true,
            createdAt: true
          }
        }
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
        buyerType: company.buyerType,
        isVerified: company.isVerified,
      },
      buyerProfile: company.buyerProfile ? {
        id: company.buyerProfile.id,
        employeeCount: company.buyerProfile.employeeCount || 0,
        disabledCount: company.buyerProfile.disabledCount || 0,
        yearlyEmployees,
      } : null,
      supplierProfile: company.supplierProfile ? {
        id: company.supplierProfile.id,
        region: company.supplierProfile.region,
        industry: company.supplierProfile.industry,
      } : null,
      members: company.members,
      isOwner: user.isCompanyOwner
    });
  } catch (error: any) {
    console.error("기업 정보 조회 실패:", error);
    return res.status(500).json({ error: error.message });
  }
});

// 기업 정보 수정 (회사명, 대표자명 등)
router.put("/my", requireAuth, async (req, res) => {
  try {
    const userId = req.user!.id;
    const userRole = req.user!.role;
    const userName = req.user!.name;

    if (userRole !== "BUYER" && userRole !== "SUPPLIER") {
      return res.status(403).json({ error: "기업 회원만 접근 가능합니다." });
    }

    const schema = z.object({
      name: z.string().optional(),
      representative: z.string().optional(),
      yearlyEmployees: z.record(
        z.string(),
        z.record(z.string(), z.number())
      ).optional(),
    });

    const body = schema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { companyId: true }
    });

    if (!user?.companyId) {
      return res.status(404).json({ error: "소속 기업이 없습니다." });
    }

    const company = await prisma.company.findUnique({
      where: { id: user.companyId },
      include: { buyerProfile: true },
    });

    if (!company) {
      return res.status(404).json({ error: "기업 정보가 없습니다." });
    }

    // Company 정보 업데이트
    const updatedCompany = await prisma.company.update({
      where: { id: user.companyId },
      data: {
        name: body.name,
        representative: body.representative,
      },
    });

    // buyerProfile 업데이트 (BUYER인 경우)
    if (company.buyerProfile && body.yearlyEmployees) {
      await prisma.buyerProfile.update({
        where: { id: company.buyerProfile.id },
        data: {
          yearlyEmployeesJson: JSON.stringify(body.yearlyEmployees),
        },
      });
    }

    // 활동 로그 기록
    await prisma.activityLog.create({
      data: {
        companyId: user.companyId,
        userId: userId,
        userName: userName,
        action: "UPDATE",
        targetType: "COMPANY",
        targetId: updatedCompany.id,
        targetName: updatedCompany.name,
        details: JSON.stringify({
          changes: body
        }),
        ipAddress: req.ip,
      },
    });

    return res.json({
      success: true,
      company: updatedCompany,
    });
  } catch (error: any) {
    console.error("기업 정보 수정 실패:", error);
    return res.status(500).json({ error: error.message });
  }
});

export default router;
