import { Router } from "express";
import { z } from "zod";
import { prisma } from "../index.js";

const r = Router();

// 상품/공급사 검색 (게스트도 가능)
r.get("/products", async (req, res) => {
  try {
    const q = String(req.query.q ?? "").trim();
    const category = String(req.query.category ?? "").trim();
    const region = String(req.query.region ?? "").trim();
    const page = Number(req.query.page ?? 1);
    const limit = Math.min(Number(req.query.limit ?? 20), 100);

    const where: any = {
      isActive: true,
    };

    if (category) {
      where.category = { contains: category, mode: "insensitive" };
    }

    if (q) {
      where.OR = [
        { title: { contains: q, mode: "insensitive" } },
        { category: { contains: q, mode: "insensitive" } },
      ];
    }

    // 지역 필터 (supplier의 region)
    if (region) {
      where.supplier = {
        region: { contains: region, mode: "insensitive" },
      };
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          supplier: {
            include: {
              company: true,
            },
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.product.count({ where }),
    ]);

    res.json({
      ok: true,
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 카테고리 목록
r.get("/categories", async (req, res) => {
  try {
    const categories = await prisma.product.findMany({
      where: { isActive: true },
      select: { category: true },
      distinct: ["category"],
    });

    res.json({
      ok: true,
      categories: categories.map((c) => c.category).filter(Boolean),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 공급사 목록
r.get("/suppliers", async (req, res) => {
  try {
    const page = Number(req.query.page ?? 1);
    const limit = Math.min(Number(req.query.limit ?? 20), 100);
    const region = String(req.query.region ?? "").trim();

    const where: any = {
      approved: true,
    };

    if (region) {
      where.region = { contains: region, mode: "insensitive" };
    }

    const [suppliers, total] = await Promise.all([
      prisma.supplierProfile.findMany({
        where,
        include: {
          company: true,
          products: {
            where: { isActive: true },
            take: 5,
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.supplierProfile.count({ where }),
    ]);

    res.json({
      ok: true,
      suppliers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default r;
