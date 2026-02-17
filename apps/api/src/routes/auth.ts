import { Router } from "express";
import { z } from "zod";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../index.js";
import { config } from "../config.js";
import { verifyBizNo } from "../services/apick.js";

const r = Router();

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1),
  phone: z.string().optional(),
  role: z.enum(["BUYER", "SUPPLIER", "AGENT", "BRANCH_ADMIN"]).optional(),
  refCode: z.string().optional(),

  companyName: z.string().min(1),
  bizNo: z.string().min(10),
  companyType: z.enum(["PRIVATE", "PUBLIC"]).default("PRIVATE"),
});

r.post("/signup", async (req, res) => {
  try {
    const body = signupSchema.parse(req.body);

    // 사업자번호 검증 (apick)
    const cleanBizNo = body.bizNo.replace(/\D/g, "");
    const v = await verifyBizNo(cleanBizNo);
    if (!v.ok) {
      return res.status(400).json({ error: "BIZNO_NOT_VERIFIED" });
    }

    // 이메일 중복 체크
    const existingUser = await prisma.user.findUnique({ where: { email: body.email } });
    if (existingUser) {
      return res.status(400).json({ error: "EMAIL_ALREADY_EXISTS" });
    }

    // 사업자번호 중복 체크
    const existingCompany = await prisma.company.findUnique({ where: { bizNo: cleanBizNo } });
    if (existingCompany) {
      return res.status(400).json({ error: "BIZNO_ALREADY_REGISTERED" });
    }

    const role = (body.role ?? "BUYER");

    // 추천코드 확인
    const referredBy = body.refCode
      ? await prisma.user.findFirst({ where: { refCode: body.refCode } })
      : null;

    const passwordHash = await bcrypt.hash(body.password, 10);

    // 유저 및 회사 생성
    const user = await prisma.user.create({
      data: {
        email: body.email,
        passwordHash,
        name: body.name,
        phone: body.phone,
        role,
        referredById: referredBy?.id,
        company: {
          create: {
            name: body.companyName,
            bizNo: cleanBizNo,
            type: body.companyType,
            isVerified: true,
            buyerProfile: role === "BUYER" ? { create: {} } : undefined,
            supplierProfile: role === "SUPPLIER" ? { create: {} } : undefined,
          },
        },
      },
      include: { company: true },
    });

    // 공급사인 경우 SupplierRegistry에서 매칭된 정보 있으면 가져오기
    if (role === "SUPPLIER") {
      const registry = await prisma.supplierRegistry.findUnique({
        where: { bizNo: cleanBizNo },
      });
      if (registry && !registry.isClaimed) {
        // Registry 정보를 SupplierProfile에 반영
        await prisma.supplierProfile.update({
          where: { companyId: user.company!.id },
          data: {
            region: registry.region,
            industry: registry.industry,
            contactTel: registry.contactTel,
          },
        });
        // Registry를 Claimed로 표시
        await prisma.supplierRegistry.update({
          where: { id: registry.id },
          data: { isClaimed: true, claimedBy: user.company!.supplierProfile?.id },
        });
      }
    }

    return res.json({
      ok: true,
      userId: user.id,
      message: "회원가입이 완료되었습니다.",
    });
  } catch (error: any) {
    console.error("Signup error:", error);
    if (error.name === "ZodError") {
      return res.status(400).json({ error: "VALIDATION_ERROR", details: error.errors });
    }
    return res.status(500).json({ error: error.message || "SIGNUP_FAILED" });
  }
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

r.post("/login", async (req, res) => {
  try {
    const body = loginSchema.parse(req.body);
    const user = await prisma.user.findUnique({
      where: { email: body.email },
      include: { company: { include: { buyerProfile: true, supplierProfile: true } } },
    });

    if (!user) {
      return res.status(400).json({ error: "INVALID_CREDENTIALS" });
    }

    const ok = await bcrypt.compare(body.password, user.passwordHash);
    if (!ok) {
      return res.status(400).json({ error: "INVALID_CREDENTIALS" });
    }

    const access = jwt.sign({ sub: user.id, role: user.role }, config.jwtSecret, {
      expiresIn: "2h",
    });
    const refresh = jwt.sign({ sub: user.id, role: user.role }, config.jwtRefreshSecret, {
      expiresIn: "14d",
    });

    return res.json({
      accessToken: access,
      refreshToken: refresh,
      user: {
        id: user.id,
        role: user.role,
        name: user.name,
        email: user.email,
        company: user.company,
      },
    });
  } catch (error: any) {
    console.error("Login error:", error);
    return res.status(500).json({ error: error.message || "LOGIN_FAILED" });
  }
});

// 토큰 갱신
r.post("/refresh", async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ error: "NO_REFRESH_TOKEN" });
    }

    const decoded = jwt.verify(refreshToken, config.jwtRefreshSecret) as { sub: string; role: string };
    const access = jwt.sign({ sub: decoded.sub, role: decoded.role }, config.jwtSecret, {
      expiresIn: "2h",
    });

    return res.json({ accessToken: access });
  } catch (error) {
    return res.status(401).json({ error: "INVALID_REFRESH_TOKEN" });
  }
});

export default r;
