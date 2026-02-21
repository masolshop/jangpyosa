import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const router = Router();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// 인증 미들웨어
function authMiddleware(req: any, res: any, next: any) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  
  const token = authHeader.substring(7);
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.userId = decoded.userId;
    req.userRole = decoded.role;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid token" });
  }
}

// 랜덤 초대 코드 생성 (8자리 영문+숫자)
function generateInviteCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // 혼동하기 쉬운 문자 제외 (0, O, I, 1 등)
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * POST /api/team/invite
 * 팀원 초대 코드 생성
 * 
 * Body:
 * {
 *   "role": "BUYER" | "SUPPLIER"  // 초대할 팀원의 역할
 * }
 */
router.post("/invite", authMiddleware, async (req: any, res: any) => {
  try {
    const { userId, userRole } = req;
    const { role } = req.body;

    // 역할 검증
    if (!role || !["BUYER", "SUPPLIER"].includes(role)) {
      return res.status(400).json({ error: "유효하지 않은 역할입니다" });
    }

    // 현재 사용자의 회사 정보 조회
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { company: true }
    });

    if (!user || !user.companyId) {
      return res.status(400).json({ error: "회사 정보를 찾을 수 없습니다" });
    }

    // 회사 소유자 또는 동일 역할인지 확인
    if (user.role !== role && !user.isCompanyOwner) {
      return res.status(403).json({ error: "초대 권한이 없습니다" });
    }

    // 초대 코드 생성 (중복 체크)
    let inviteCode = generateInviteCode();
    let attempts = 0;
    while (attempts < 10) {
      const existing = await prisma.teamInvitation.findUnique({
        where: { inviteCode }
      });
      if (!existing) break;
      inviteCode = generateInviteCode();
      attempts++;
    }

    if (attempts >= 10) {
      return res.status(500).json({ error: "초대 코드 생성 실패" });
    }

    // 만료일 설정 (7일 후)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // 초대 코드 생성
    const invitation = await prisma.teamInvitation.create({
      data: {
        companyId: user.companyId,
        inviteCode,
        invitedBy: userId,
        companyType: user.company!.type,
        role,
        expiresAt
      },
      include: {
        company: true,
        sender: {
          select: {
            name: true,
            managerName: true,
            managerTitle: true
          }
        }
      }
    });

    // 초대 링크 생성
    const inviteUrl = `${process.env.FRONTEND_URL || "http://localhost:3000"}/signup?invite=${inviteCode}`;

    return res.json({
      success: true,
      invitation: {
        id: invitation.id,
        inviteCode: invitation.inviteCode,
        inviteUrl,
        companyName: invitation.company.name,
        bizNo: invitation.company.bizNo,
        role: invitation.role,
        expiresAt: invitation.expiresAt,
        invitedBy: invitation.sender.name || invitation.sender.managerName
      }
    });
  } catch (error) {
    console.error("Error creating invitation:", error);
    return res.status(500).json({ error: "초대 코드 생성 중 오류가 발생했습니다" });
  }
});

/**
 * GET /api/team/invite/:code
 * 초대 코드 정보 조회 (공개 API - 인증 불필요)
 */
router.get("/invite/:code", async (req: any, res: any) => {
  try {
    const { code } = req.params;

    const invitation = await prisma.teamInvitation.findUnique({
      where: { inviteCode: code },
      include: {
        company: true,
        sender: {
          select: {
            name: true,
            managerName: true,
            managerTitle: true
          }
        }
      }
    });

    if (!invitation) {
      return res.status(404).json({ error: "유효하지 않은 초대 코드입니다" });
    }

    // 이미 사용된 초대 코드
    if (invitation.isUsed) {
      return res.status(400).json({ 
        error: "이미 사용된 초대 코드입니다",
        used: true
      });
    }

    // 만료된 초대 코드
    if (new Date() > new Date(invitation.expiresAt)) {
      return res.status(400).json({ 
        error: "만료된 초대 코드입니다",
        expired: true
      });
    }

    return res.json({
      success: true,
      invitation: {
        companyName: invitation.company.name,
        bizNo: invitation.company.bizNo,
        representative: invitation.company.representative,
        buyerType: invitation.company.buyerType,
        role: invitation.role,
        invitedBy: invitation.sender.name || invitation.sender.managerName,
        inviterTitle: invitation.sender.managerTitle,
        expiresAt: invitation.expiresAt
      }
    });
  } catch (error) {
    console.error("Error fetching invitation:", error);
    return res.status(500).json({ error: "초대 정보 조회 중 오류가 발생했습니다" });
  }
});

/**
 * GET /api/team/invitations
 * 내가 생성한 초대 코드 목록 조회
 */
router.get("/invitations", authMiddleware, async (req: any, res: any) => {
  try {
    const { userId } = req;

    const invitations = await prisma.teamInvitation.findMany({
      where: { invitedBy: userId },
      include: {
        company: {
          select: {
            name: true,
            bizNo: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    return res.json({
      success: true,
      invitations: invitations.map(inv => ({
        id: inv.id,
        inviteCode: inv.inviteCode,
        inviteUrl: `${process.env.FRONTEND_URL || "http://localhost:3000"}/signup?invite=${inv.inviteCode}`,
        companyName: inv.company.name,
        role: inv.role,
        isUsed: inv.isUsed,
        usedAt: inv.usedAt,
        expiresAt: inv.expiresAt,
        createdAt: inv.createdAt
      }))
    });
  } catch (error) {
    console.error("Error fetching invitations:", error);
    return res.status(500).json({ error: "초대 목록 조회 중 오류가 발생했습니다" });
  }
});

/**
 * DELETE /api/team/invite/:id
 * 초대 코드 삭제 (취소)
 */
router.delete("/invite/:id", authMiddleware, async (req: any, res: any) => {
  try {
    const { userId } = req;
    const { id } = req.params;

    const invitation = await prisma.teamInvitation.findUnique({
      where: { id }
    });

    if (!invitation) {
      return res.status(404).json({ error: "초대 코드를 찾을 수 없습니다" });
    }

    if (invitation.invitedBy !== userId) {
      return res.status(403).json({ error: "삭제 권한이 없습니다" });
    }

    if (invitation.isUsed) {
      return res.status(400).json({ error: "이미 사용된 초대 코드는 삭제할 수 없습니다" });
    }

    await prisma.teamInvitation.delete({
      where: { id }
    });

    return res.json({ success: true, message: "초대 코드가 삭제되었습니다" });
  } catch (error) {
    console.error("Error deleting invitation:", error);
    return res.status(500).json({ error: "초대 코드 삭제 중 오류가 발생했습니다" });
  }
});

export default router;
