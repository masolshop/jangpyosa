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
        attachmentEmail: company.attachmentEmail,
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

    if (userRole !== "BUYER" && userRole !== "SUPPLIER") {
      return res.status(403).json({ error: "기업 회원만 접근 가능합니다." });
    }

    const schema = z.object({
      name: z.string().optional(),
      representative: z.string().optional(),
      attachmentEmail: z.string().optional(),
      yearlyEmployees: z.record(
        z.string(),
        z.record(z.string(), z.number())
      ).optional(),
    });

    const body = schema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { companyId: true, name: true }
    });

    if (!user?.companyId) {
      return res.status(404).json({ error: "소속 기업이 없습니다." });
    }

    const userName = user.name || "Unknown";

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
        ...(body.attachmentEmail !== undefined && { attachmentEmail: body.attachmentEmail }),
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

// 🆕 슈퍼어드민: 모든 기업 목록 조회
router.get("/admin/all", requireAuth, async (req, res) => {
  try {
    const userRole = req.user!.role;

    if (userRole !== "SUPER_ADMIN") {
      return res.status(403).json({ error: "슈퍼어드민만 접근 가능합니다." });
    }

    const companies = await prisma.company.findMany({
      include: {
        buyerProfile: {
          select: {
            employeeCount: true,
            disabledCount: true,
          },
        },
        supplierProfile: {
          select: {
            region: true,
            industry: true,
          },
        },
        members: {
          select: {
            id: true,
            name: true,
            phone: true,
            isCompanyOwner: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.json({
      success: true,
      companies: companies.map((company) => ({
        id: company.id,
        name: company.name,
        bizNo: company.bizNo,
        representative: company.representative,
        type: company.type,
        buyerType: company.buyerType,
        isVerified: company.isVerified,
        hasApickData: !!company.apickData,
        memberCount: company.members.length,
        buyerProfile: company.buyerProfile,
        supplierProfile: company.supplierProfile,
        createdAt: company.createdAt,
        updatedAt: company.updatedAt,
      })),
    });
  } catch (error: any) {
    console.error("기업 목록 조회 실패:", error);
    return res.status(500).json({ error: error.message });
  }
});

// 🆕 슈퍼어드민: 특정 기업 상세 정보 조회 (APICK 데이터 포함)
router.get("/admin/:companyId", requireAuth, async (req, res) => {
  try {
    const userRole = req.user!.role;
    const { companyId } = req.params;

    if (userRole !== "SUPER_ADMIN") {
      return res.status(403).json({ error: "슈퍼어드민만 접근 가능합니다." });
    }

    const company = await prisma.company.findUnique({
      where: { id: companyId },
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
            createdAt: true,
          },
        },
      },
    });

    if (!company) {
      return res.status(404).json({ error: "기업을 찾을 수 없습니다." });
    }

    // APICK 데이터 파싱
    let apickData = null;
    if (company.apickData) {
      try {
        apickData = JSON.parse(company.apickData);
      } catch (e) {
        console.error("APICK 데이터 파싱 실패:", e);
      }
    }

    return res.json({
      success: true,
      company: {
        ...company,
        apickData,
      },
    });
  } catch (error: any) {
    console.error("기업 상세 조회 실패:", error);
    return res.status(500).json({ error: error.message });
  }
});

// 🆕 슈퍼어드민: 기업 APICK 데이터 재인증 및 저장
router.post("/admin/:companyId/refresh-apick", requireAuth, async (req, res) => {
  try {
    const userRole = req.user!.role;
    const { companyId } = req.params;

    if (userRole !== "SUPER_ADMIN") {
      return res.status(403).json({ error: "슈퍼어드민만 접근 가능합니다." });
    }

    const company = await prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!company) {
      return res.status(404).json({ error: "기업을 찾을 수 없습니다." });
    }

    // APICK API 호출
    const { verifyBizNo } = await import("../services/apick.js");
    const result = await verifyBizNo(company.bizNo);

    if (!result.ok) {
      return res.status(400).json({
        error: "APICK_VERIFICATION_FAILED",
        message: result.error || "사업자번호 인증 실패",
      });
    }

    // APICK 데이터 저장
    const updatedCompany = await prisma.company.update({
      where: { id: companyId },
      data: {
        apickData: JSON.stringify(result.data),
        name: result.name || company.name,
        representative: result.representative || company.representative,
        isVerified: true,
      },
    });

    return res.json({
      success: true,
      message: "APICK 데이터가 업데이트되었습니다",
      company: {
        ...updatedCompany,
        apickData: result.data,
      },
    });
  } catch (error: any) {
    console.error("APICK 재인증 실패:", error);
    return res.status(500).json({ error: error.message });
  }
});

export default router;
