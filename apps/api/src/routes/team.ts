import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
const prisma = new PrismaClient();

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
router.post("/invite", requireAuth, async (req: any, res: any) => {
  try {
    const userId = req.user!.id;
    const userRole = req.user!.role;
    const { role, inviteeName, inviteePhone } = req.body;

    // 역할 검증
    if (!role || !["BUYER", "SUPPLIER"].includes(role)) {
      return res.status(400).json({ error: "유효하지 않은 역할입니다" });
    }

    // 초대받을 사람 정보 검증
    if (!inviteeName || !inviteePhone) {
      return res.status(400).json({ error: "초대받을 사람의 이름과 핸드폰 번호를 입력하세요" });
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
        inviteeName,
        inviteePhone,
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

    return res.json({
      success: true,
      invitation: {
        id: invitation.id,
        inviteCode: invitation.inviteCode,
        companyName: invitation.company.name,
        bizNo: invitation.company.bizNo,
        role: invitation.role,
        inviteeName: invitation.inviteeName,
        inviteePhone: invitation.inviteePhone,
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
        inviteeName: invitation.inviteeName,
        inviteePhone: invitation.inviteePhone,
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
router.get("/invitations", requireAuth, async (req: any, res: any) => {
  try {
    const userId = req.user!.id;

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
router.delete("/invite/:id", requireAuth, async (req: any, res: any) => {
  try {
    const userId = req.user!.id;
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

/**
 * GET /api/team/members
 * 팀원 목록 조회
 */
router.get("/members", requireAuth, async (req: any, res: any) => {
  try {
    const userId = req.user!.id;

    // 현재 사용자의 회사 조회
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { companyId: true }
    });

    if (!user?.companyId) {
      return res.status(404).json({ error: "소속 회사가 없습니다" });
    }

    // 팀원 목록 조회
    const members = await prisma.user.findMany({
      where: { companyId: user.companyId },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        username: true,
        managerName: true,
        managerTitle: true,
        managerEmail: true,
        managerPhone: true,
        role: true,
        isCompanyOwner: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: [
        { isCompanyOwner: 'desc' }, // 소유자 먼저
        { createdAt: 'asc' } // 그 다음 가입일순
      ]
    });

    return res.json({
      success: true,
      members
    });
  } catch (error) {
    console.error("Error fetching members:", error);
    return res.status(500).json({ error: "팀원 목록 조회 중 오류가 발생했습니다" });
  }
});

/**
 * PUT /api/team/members/:id
 * 팀원 정보 수정
 */
router.put("/members/:id", requireAuth, async (req: any, res: any) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const { name, email, managerName, managerTitle, managerEmail, managerPhone } = req.body;

    // 현재 사용자의 회사 조회
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { companyId: true, name: true }
    });

    if (!currentUser?.companyId) {
      return res.status(404).json({ error: "소속 회사가 없습니다" });
    }

    // 수정할 팀원 조회
    const targetUser = await prisma.user.findUnique({
      where: { id },
      select: { companyId: true, isCompanyOwner: true }
    });

    if (!targetUser) {
      return res.status(404).json({ error: "팀원을 찾을 수 없습니다" });
    }

    if (targetUser.companyId !== currentUser.companyId) {
      return res.status(403).json({ error: "다른 회사의 팀원은 수정할 수 없습니다" });
    }

    // 팀원 정보 업데이트
    const updated = await prisma.user.update({
      where: { id },
      data: {
        name,
        email,
        managerName,
        managerTitle,
        managerEmail,
        managerPhone
      }
    });

    // 활동 로그 기록
    await prisma.activityLog.create({
      data: {
        companyId: currentUser.companyId,
        userId: userId,
        userName: currentUser.name,
        action: "UPDATE",
        targetType: "TEAM_MEMBER",
        targetId: updated.id,
        targetName: updated.name,
        details: JSON.stringify({
          changes: { name, email, managerName, managerTitle, managerEmail, managerPhone }
        })
      }
    });

    return res.json({
      success: true,
      member: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        managerName: updated.managerName,
        managerTitle: updated.managerTitle,
        managerEmail: updated.managerEmail,
        managerPhone: updated.managerPhone
      }
    });
  } catch (error) {
    console.error("Error updating member:", error);
    return res.status(500).json({ error: "팀원 정보 수정 중 오류가 발생했습니다" });
  }
});

/**
 * DELETE /api/team/members/:id
 * 팀원 삭제
 */
router.delete("/members/:id", requireAuth, async (req: any, res: any) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    // 자기 자신 삭제 방지
    if (userId === id) {
      return res.status(400).json({ error: "본인은 삭제할 수 없습니다" });
    }

    // 현재 사용자의 회사 조회
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { companyId: true, name: true }
    });

    if (!currentUser?.companyId) {
      return res.status(404).json({ error: "소속 회사가 없습니다" });
    }

    // 삭제할 팀원 조회
    const targetUser = await prisma.user.findUnique({
      where: { id },
      select: { companyId: true, isCompanyOwner: true, name: true }
    });

    if (!targetUser) {
      return res.status(404).json({ error: "팀원을 찾을 수 없습니다" });
    }

    if (targetUser.companyId !== currentUser.companyId) {
      return res.status(403).json({ error: "다른 회사의 팀원은 삭제할 수 없습니다" });
    }

    // 회사 소유자 삭제 방지
    if (targetUser.isCompanyOwner) {
      return res.status(400).json({ error: "회사 소유자는 삭제할 수 없습니다" });
    }

    // 활동 로그 먼저 기록 (삭제 전)
    await prisma.activityLog.create({
      data: {
        companyId: currentUser.companyId,
        userId: userId,
        userName: currentUser.name,
        action: "DELETE",
        targetType: "TEAM_MEMBER",
        targetId: id,
        targetName: targetUser.name,
        details: JSON.stringify({
          deletedUser: {
            id,
            name: targetUser.name
          }
        })
      }
    });

    // 팀원 삭제 (companyId를 null로 설정하여 소속 해제)
    await prisma.user.update({
      where: { id },
      data: {
        companyId: null,
        isCompanyOwner: false
      }
    });

    return res.json({ 
      success: true, 
      message: "팀원이 삭제되었습니다" 
    });
  } catch (error) {
    console.error("Error deleting member:", error);
    return res.status(500).json({ error: "팀원 삭제 중 오류가 발생했습니다" });
  }
});

/**
 * GET /api/team/activity-log
 * 활동 로그 조회
 */
router.get("/activity-log", requireAuth, async (req: any, res: any) => {
  try {
    const userId = req.user!.id;
    const { limit = 50, offset = 0 } = req.query;

    // 현재 사용자의 회사 조회
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { companyId: true }
    });

    if (!user?.companyId) {
      return res.status(404).json({ error: "소속 회사가 없습니다" });
    }

    // 활동 로그 조회
    const logs = await prisma.activityLog.findMany({
      where: { companyId: user.companyId },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit as string),
      skip: parseInt(offset as string)
    });

    // 전체 로그 개수
    const total = await prisma.activityLog.count({
      where: { companyId: user.companyId }
    });

    return res.json({
      success: true,
      logs: logs.map(log => ({
        id: log.id,
        userId: log.userId,
        userName: log.userName,
        action: log.action,
        targetType: log.targetType,
        targetId: log.targetId,
        targetName: log.targetName,
        details: log.details ? JSON.parse(log.details) : null,
        ipAddress: log.ipAddress,
        createdAt: log.createdAt
      })),
      total,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string)
    });
  } catch (error) {
    console.error("Error fetching activity log:", error);
    return res.status(500).json({ error: "활동 로그 조회 중 오류가 발생했습니다" });
  }
});

export default router;
