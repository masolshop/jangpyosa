import { Router } from "express";
import { z } from "zod";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../index.js";
import { config } from "../config.js";
import { verifyBizNo } from "../services/apick.js";

const r = Router();

// ========================================
// 🔧 헬퍼 함수
// ========================================

/**
 * 핸드폰 번호 정규화
 * 지원 형식: 010-1234-5678, 01012345678, 1012345678
 * @param phone 입력된 핸드폰 번호
 * @returns 11자리 숫자 문자열 (예: 01012345678)
 */
function normalizePhone(phone: string): string {
  // 숫자만 추출
  let cleanPhone = phone.replace(/\D/g, "");
  
  // 10자리이고 0으로 시작하지 않으면 0 추가 (1012345678 -> 01012345678)
  if (cleanPhone.length === 10 && cleanPhone[0] !== "0") {
    cleanPhone = "0" + cleanPhone;
  }
  
  return cleanPhone;
}

// ========================================
// 📱 핸드폰 번호 기반 로그인
// ========================================

const loginSchema = z.object({
  phone: z.string().min(10, "핸드폰 번호를 입력하세요"),
  password: z.string().min(1, "비밀번호를 입력하세요"),
  userType: z.enum(["AGENT", "SUPPLIER", "BUYER"]).optional(),
});

r.post("/login", async (req, res) => {
  try {
    const body = loginSchema.parse(req.body);
    const cleanPhone = normalizePhone(body.phone);

    const user = await prisma.user.findUnique({
      where: { phone: cleanPhone },
      include: { company: true, branch: true },
    });

    if (!user) {
      return res.status(401).json({ error: "INVALID_CREDENTIALS" });
    }

    const ok = await bcrypt.compare(body.password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ error: "INVALID_CREDENTIALS" });
    }

    // 회원 유형 검증 (선택된 경우)
    if (body.userType && user.role !== "SUPER_ADMIN") {
      if (user.role !== body.userType) {
        const roleLabels: Record<string, string> = {
          AGENT: "매니저",
          SUPPLIER: "표준사업장",
          BUYER: "부담금기업"
        };
        return res.status(403).json({ 
          error: "USER_TYPE_MISMATCH",
          message: `이 핸드폰 번호는 "${roleLabels[user.role]}" 계정입니다. "${roleLabels[body.userType]}" 버튼이 아닌 "${roleLabels[user.role]}" 버튼을 눌러주세요.`,
          actualRole: user.role,
          requestedRole: body.userType
        });
      }
    }

    const accessToken = jwt.sign(
      { userId: user.id, role: user.role },
      config.jwtSecret,
      { expiresIn: "7d" }
    );

    const refreshToken = jwt.sign(
      { userId: user.id },
      config.jwtRefreshSecret,
      { expiresIn: "30d" }
    );

    return res.json({
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        phone: user.phone,
        email: user.email,
        name: user.name,
        role: user.role,
        branchId: user.branchId,
        branchName: user.branch?.name,
        refCode: user.refCode,
        company: user.company,
      },
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "VALIDATION_ERROR", details: error.errors });
    }
    console.error("Login error:", error);
    return res.status(500).json({ error: "INTERNAL_ERROR" });
  }
});

// ========================================
// 👤 매니저(AGENT) 회원가입
// ========================================

const signupAgentSchema = z.object({
  phone: z.string().min(10),
  password: z.string().min(8),
  name: z.string().min(1),
  email: z.string().email().optional(),
  branchId: z.string().min(1, "지사를 선택하세요"),
  refCode: z.string().optional(), // 추천코드 (매니저가 생성하는 고유코드)
});

r.post("/signup/agent", async (req, res) => {
  try {
    const body = signupAgentSchema.parse(req.body);
    const cleanPhone = normalizePhone(body.phone);

    // 핸드폰 번호 중복 체크
    const existing = await prisma.user.findUnique({ where: { phone: cleanPhone } });
    if (existing) {
      return res.status(400).json({ error: "PHONE_ALREADY_EXISTS" });
    }

    // 추천코드 중복 체크 (제공된 경우)
    if (body.refCode) {
      const existingRefCode = await prisma.user.findUnique({ where: { refCode: body.refCode } });
      if (existingRefCode) {
        return res.status(400).json({ error: "REFCODE_ALREADY_EXISTS" });
      }
    }

    // 지사 존재 확인
    const branch = await prisma.branch.findUnique({ where: { id: body.branchId } });
    if (!branch) {
      return res.status(400).json({ error: "BRANCH_NOT_FOUND" });
    }

    const passwordHash = await bcrypt.hash(body.password, 10);

    const user = await prisma.user.create({
      data: {
        phone: cleanPhone,
        email: body.email,
        passwordHash,
        name: body.name,
        role: "AGENT",
        branchId: body.branchId,
        refCode: body.refCode,
      },
      include: { branch: true },
    });

    return res.json({
      message: "매니저 가입 완료",
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name,
        role: user.role,
        branchName: user.branch?.name,
        refCode: user.refCode,
      },
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "VALIDATION_ERROR", details: error.errors });
    }
    console.error("Agent signup error:", error);
    return res.status(500).json({ error: "INTERNAL_ERROR" });
  }
});

// ========================================
// 🏭 표준사업장 기업 회원가입 (SUPPLIER)
// ========================================

const signupSupplierSchema = z.object({
  phone: z.string().min(10),
  password: z.string().min(8),
  bizNo: z.string().min(10, "사업자등록번호 10자리를 입력하세요"),
  referrerPhone: z.string().min(10, "추천인 매니저 핸드폰 번호는 필수입니다"), // 필수로 변경
});

r.post("/signup/supplier", async (req, res) => {
  try {
    const body = signupSupplierSchema.parse(req.body);
    const cleanPhone = normalizePhone(body.phone);
    const cleanBizNo = body.bizNo.replace(/\D/g, "");

    // 핸드폰 번호 중복 체크
    const existingUser = await prisma.user.findUnique({ where: { phone: cleanPhone } });
    if (existingUser) {
      return res.status(400).json({ error: "PHONE_ALREADY_EXISTS" });
    }

    // 사업자번호 중복 체크 (1기업 1계정)
    const existingCompany = await prisma.company.findUnique({ where: { bizNo: cleanBizNo } });
    if (existingCompany) {
      return res.status(400).json({ error: "BIZNO_ALREADY_REGISTERED" });
    }

    // APICK 유료 API로 사업자번호 인증
    const apickResult = await verifyBizNo(cleanBizNo);
    if (!apickResult.ok) {
      return res.status(400).json({
        error: "BIZNO_VERIFICATION_FAILED",
        message: apickResult.error || "사업자번호 인증 실패",
      });
    }

    // 추천인 매니저 확인 (핸드폰 번호로 매칭) - 필수
    const cleanReferrerPhone = normalizePhone(body.referrerPhone);
    const referredBy = await prisma.user.findFirst({
      where: { phone: cleanReferrerPhone, role: "AGENT" },
      include: { branch: true },
    });

    if (!referredBy) {
      return res.status(400).json({
        error: "REFERRER_NOT_FOUND",
        message: "해당 핸드폰 번호의 매니저를 찾을 수 없습니다",
      });
    }

    const passwordHash = await bcrypt.hash(body.password, 10);

    // User, Company, SupplierProfile 생성
    const user = await prisma.user.create({
      data: {
        phone: cleanPhone,
        passwordHash,
        name: apickResult.representative || "대표자",
        role: "SUPPLIER",
        referredById: referredBy.id,
        company: {
          create: {
            name: apickResult.name!,
            bizNo: cleanBizNo,
            representative: apickResult.representative,
            type: "SUPPLIER",
            isVerified: true,
            apickData: apickResult.data ? JSON.stringify(apickResult.data) : null,
            supplierProfile: {
              create: {},
            },
          },
        },
      },
      include: {
        company: {
          include: { supplierProfile: true },
        },
        referredBy: {
          include: { branch: true },
        },
      },
    });

    // ✅ SupplierRegistry 매칭 (표준사업장 DB에서 자동 프리필)
    const registry = await prisma.supplierRegistry.findUnique({
      where: { bizNo: cleanBizNo },
    });

    if (registry && user.company?.supplierProfile) {
      await prisma.supplierProfile.update({
        where: { id: user.company.supplierProfile.id },
        data: {
          registryBizNo: cleanBizNo,
          region: registry.region,
          industry: registry.industry,
          contactTel: registry.contactTel,
        },
      });
    }

    return res.json({
      message: "표준사업장 기업 가입 완료",
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name,
        role: user.role,
        company: {
          name: user.company?.name,
          bizNo: user.company?.bizNo,
          representative: user.company?.representative,
        },
        referredBy: referredBy
          ? {
              name: user.referredBy?.name,
              branch: user.referredBy?.branch?.name,
            }
          : null,
        registryMatched: !!registry,
      },
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "VALIDATION_ERROR", details: error.errors });
    }
    console.error("Supplier signup error:", error);
    return res.status(500).json({ error: "INTERNAL_ERROR" });
  }
});

// ========================================
// 🏢 고용부담금 기업 회원가입 (BUYER)
// ========================================

const signupBuyerSchema = z.object({
  phone: z.string().min(10),
  password: z.string().min(8),
  bizNo: z.string().min(10, "사업자등록번호 10자리를 입력하세요"),
  referrerPhone: z.string().min(10, "추천인 매니저 핸드폰 번호는 필수입니다"), // 필수로 변경
  buyerType: z.enum(["PRIVATE_COMPANY", "PUBLIC_INSTITUTION", "GOVERNMENT"]).default("PRIVATE_COMPANY"), // 기업 유형
  companyType: z.enum(["PRIVATE", "GOVERNMENT"]).optional(), // 호환성 유지
});

r.post("/signup/buyer", async (req, res) => {
  try {
    const body = signupBuyerSchema.parse(req.body);
    const cleanPhone = normalizePhone(body.phone);
    const cleanBizNo = body.bizNo.replace(/\D/g, "");

    // 핸드폰 번호 중복 체크
    const existingUser = await prisma.user.findUnique({ where: { phone: cleanPhone } });
    if (existingUser) {
      return res.status(400).json({ error: "PHONE_ALREADY_EXISTS" });
    }

    // 사업자번호 중복 체크 (1기업 1계정)
    const existingCompany = await prisma.company.findUnique({ where: { bizNo: cleanBizNo } });
    if (existingCompany) {
      return res.status(400).json({ error: "BIZNO_ALREADY_REGISTERED" });
    }

    // APICK 유료 API로 사업자번호 인증
    const apickResult = await verifyBizNo(cleanBizNo);
    if (!apickResult.ok) {
      return res.status(400).json({
        error: "BIZNO_VERIFICATION_FAILED",
        message: apickResult.error || "사업자번호 인증 실패",
      });
    }

    // 추천인 매니저 확인 (핸드폰 번호로 매칭) - 필수
    const cleanReferrerPhone = normalizePhone(body.referrerPhone);
    const referredBy = await prisma.user.findFirst({
      where: { phone: cleanReferrerPhone, role: "AGENT" },
      include: { branch: true },
    });

    if (!referredBy) {
      return res.status(400).json({
        error: "REFERRER_NOT_FOUND",
        message: "해당 핸드폰 번호의 매니저를 찾을 수 없습니다",
      });
    }

    const passwordHash = await bcrypt.hash(body.password, 10);

    // buyerType 결정 (신규 필드 우선, 없으면 companyType에서 변환)
    const buyerType = body.buyerType || (body.companyType === "GOVERNMENT" ? "GOVERNMENT" : "PRIVATE_COMPANY");

    // User, Company, BuyerProfile 생성
    const user = await prisma.user.create({
      data: {
        phone: cleanPhone,
        passwordHash,
        name: apickResult.representative || "대표자",
        role: "BUYER",
        companyType: body.companyType || (buyerType === "GOVERNMENT" ? "GOVERNMENT" : "PRIVATE"), // User 테이블에도 저장 (호환성)
        referredById: referredBy.id,
        company: {
          create: {
            name: apickResult.name!,
            bizNo: cleanBizNo,
            representative: apickResult.representative,
            type: "BUYER",
            buyerType, // 🆕 Company 테이블에 buyerType 저장
            isVerified: true,
            apickData: apickResult.data ? JSON.stringify(apickResult.data) : null,
            buyerProfile: {
              create: {},
            },
          },
        },
      },
      include: {
        company: {
          include: { buyerProfile: true },
        },
        referredBy: {
          include: { branch: true },
        },
      },
    });

    return res.json({
      message: "고용부담금 기업 가입 완료",
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name,
        role: user.role,
        company: {
          name: user.company?.name,
          bizNo: user.company?.bizNo,
          representative: user.company?.representative,
        },
        referredBy: referredBy
          ? {
              name: user.referredBy?.name,
              branch: user.referredBy?.branch?.name,
            }
          : null,
      },
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "VALIDATION_ERROR", details: error.errors });
    }
    console.error("Buyer signup error:", error);
    return res.status(500).json({ error: "INTERNAL_ERROR" });
  }
});

// ========================================
// 🔑 비밀번호 찾기/변경
// ========================================

const forgotPasswordSchema = z.object({
  phone: z.string().min(10),
});

r.post("/forgot-password", async (req, res) => {
  try {
    const body = forgotPasswordSchema.parse(req.body);
    const cleanPhone = normalizePhone(body.phone);

    const user = await prisma.user.findUnique({ where: { phone: cleanPhone } });
    if (!user) {
      // 보안상 사용자 존재 여부를 노출하지 않음
      return res.json({ message: "인증번호가 발송되었습니다" });
    }

    // TODO: SMS 인증번호 발송 로직
    // 임시로 성공 응답
    return res.json({
      message: "인증번호가 발송되었습니다",
      // MVP: 실제로는 SMS 발송 후 세션에 저장
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "VALIDATION_ERROR", details: error.errors });
    }
    return res.status(500).json({ error: "INTERNAL_ERROR" });
  }
});

const resetPasswordSchema = z.object({
  phone: z.string().min(10),
  verificationCode: z.string().min(6), // SMS 인증번호
  newPassword: z.string().min(8),
});

r.post("/reset-password", async (req, res) => {
  try {
    const body = resetPasswordSchema.parse(req.body);
    const cleanPhone = normalizePhone(body.phone);

    // TODO: 인증번호 검증 로직
    // MVP: 간단한 검증 (실제로는 Redis/세션에서 확인)
    if (body.verificationCode !== "123456") {
      return res.status(400).json({ error: "INVALID_VERIFICATION_CODE" });
    }

    const user = await prisma.user.findUnique({ where: { phone: cleanPhone } });
    if (!user) {
      return res.status(404).json({ error: "USER_NOT_FOUND" });
    }

    const passwordHash = await bcrypt.hash(body.newPassword, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    return res.json({ message: "비밀번호가 변경되었습니다" });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "VALIDATION_ERROR", details: error.errors });
    }
    return res.status(500).json({ error: "INTERNAL_ERROR" });
  }
});

// ========================================
// 🔄 토큰 갱신
// ========================================

r.post("/refresh", async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(401).json({ error: "NO_REFRESH_TOKEN" });
    }

    const decoded = jwt.verify(refreshToken, config.jwtRefreshSecret) as { userId: string };
    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });

    if (!user) {
      return res.status(401).json({ error: "USER_NOT_FOUND" });
    }

    const accessToken = jwt.sign(
      { userId: user.id, role: user.role },
      config.jwtSecret,
      { expiresIn: "7d" }
    );

    return res.json({ accessToken });
  } catch (error) {
    return res.status(401).json({ error: "INVALID_REFRESH_TOKEN" });
  }
});

export default r;
