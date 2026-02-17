import { Router } from "express";
import { prisma } from "../index.js";

const r = Router();

// ========================================
// 🌐 공개 API (인증 불필요)
// ========================================

// 지사 목록 조회 (회원가입용)
r.get("/branches", async (req, res) => {
  try {
    const branches = await prisma.branch.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        code: true,
        region: true,
      },
      orderBy: { name: "asc" },
    });
    res.json({ ok: true, branches });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default r;
