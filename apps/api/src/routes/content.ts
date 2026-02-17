import { Router } from "express";
import { prisma } from "../index.js";

const r = Router();

// 콘텐츠 페이지 조회 (게스트도 가능)
r.get("/pages/:slug", async (req, res) => {
  try {
    const page = await prisma.page.findUnique({
      where: { slug: req.params.slug },
    });

    if (!page) {
      return res.status(404).json({ error: "PAGE_NOT_FOUND" });
    }

    res.json({ ok: true, page });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 콘텐츠 페이지 목록
r.get("/pages", async (req, res) => {
  try {
    const pages = await prisma.page.findMany({
      orderBy: { updatedAt: "desc" },
    });

    res.json({ ok: true, pages });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default r;
