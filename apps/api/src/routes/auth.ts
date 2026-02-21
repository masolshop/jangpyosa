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
// 📱 로그인 (핸드폰 번호 또는 username)
// ========================================

const loginSchema = z.object({
  identifier: z.string().min(1, "핸드폰 번호 또는 ID를 입력하세요"), // phone 또는 username
  password: z.string().min(1, "비밀번호를 입력하세요"),
  userType: z.enum(["AGENT", "SUPPLIER", "BUYER"]).optional(),
});

r.post("/login", async (req, res) => {
  try {
    const body = loginSchema.parse(req.body);
    
    // identifier가 순수하게 숫자로만 이루어졌으면 핸드폰 번호, 아니면 username
    // 하이픈 제거 후 10~11자리 숫자면 핸드폰으로 간주
    const cleanIdentifier = body.identifier.replace(/\D/g, "");
    const isPhone = /^\d{10,11}$/.test(cleanIdentifier);
    
    let user;
    if (isPhone) {
      // 핸드폰 번호로 로그인 (매니저용)
      const cleanPhone = normalizePhone(body.identifier);
      user = await prisma.user.findUnique({
        where: { phone: cleanPhone },
        include: { company: true, branch: true },
      });
    } else {
      // username으로 로그인 (기업용)
      user = await prisma.user.findUnique({
        where: { username: body.identifier },
        include: { company: true, branch: true },
      });
    }

    if (!user) {
      return res.status(401).json({ error: "INVALID_CREDENTIALS", message: "아이디 또는 비밀번호가 일치하지 않습니다" });
    }

    const ok = await bcrypt.compare(body.password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ error: "INVALID_CREDENTIALS", message: "아이디 또는 비밀번호가 일치하지 않습니다" });
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
  
  // 🆕 개인정보 동의
  privacyAgreed: z.boolean().refine(val => val === true, "개인정보 활용 동의는 필수입니다"),
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
        
        // 🆕 개인정보 동의
        privacyAgreed: body.privacyAgreed,
        privacyAgreedAt: new Date(),
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
  username: z.string().min(4).max(20).regex(/^[a-zA-Z0-9]+$/, "영문+숫자만 사용 가능합니다"), // 🆕 로그인 ID
  password: z.string().min(8),
  bizNo: z.string().min(10, "사업자등록번호 10자리를 입력하세요"),
  referrerPhone: z.string().min(10, "추천인 매니저 핸드폰 번호는 필수입니다"),
  
  // 🆕 담당자 정보
  managerName: z.string().min(1, "담당자 성함은 필수입니다"),
  managerTitle: z.string().min(1, "담당자 직함은 필수입니다"),
  managerEmail: z.string().email("올바른 이메일 주소를 입력하세요"),
  managerPhone: z.string().min(10, "담당자 핸드폰 번호는 필수입니다"),
  
  // 🆕 개인정보 동의
  privacyAgreed: z.boolean().refine(val => val === true, "개인정보 활용 동의는 필수입니다"),
});

r.post("/signup/supplier", async (req, res) => {
  try {
    const body = signupSupplierSchema.parse(req.body);
    const cleanBizNo = body.bizNo.replace(/\D/g, "");
    const cleanManagerPhone = normalizePhone(body.managerPhone);

    // username 중복 체크
    const existingUsername = await prisma.user.findUnique({ where: { username: body.username } });
    if (existingUsername) {
      return res.status(400).json({ error: "USERNAME_ALREADY_EXISTS", message: "이미 사용 중인 ID입니다" });
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
        phone: cleanManagerPhone, // 담당자 핸드폰 (알림톡용, unique 제약 때문에 여기 저장)
        username: body.username,
        passwordHash,
        name: apickResult.representative || "대표자",
        role: "SUPPLIER",
        referredById: referredBy.id,
        
        // 🆕 담당자 정보
        managerName: body.managerName,
        managerTitle: body.managerTitle,
        managerEmail: body.managerEmail,
        managerPhone: cleanManagerPhone,
        
        // 🆕 개인정보 동의
        privacyAgreed: body.privacyAgreed,
        privacyAgreedAt: new Date(),
        
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
  username: z.string().min(4).max(20).regex(/^[a-zA-Z0-9]+$/, "영문+숫자만 사용 가능합니다"), // 🆕 로그인 ID
  password: z.string().min(8),
  bizNo: z.string().min(10, "사업자등록번호 10자리를 입력하세요"),
  referrerPhone: z.string().min(10, "추천인 매니저 핸드폰 번호는 필수입니다"),
  buyerType: z.enum(["PRIVATE_COMPANY", "PUBLIC_INSTITUTION", "GOVERNMENT"]).default("PRIVATE_COMPANY"), // 기업 유형
  companyType: z.enum(["PRIVATE", "GOVERNMENT"]).optional(), // 호환성 유지
  
  // 🆕 담당자 정보
  managerName: z.string().min(1, "담당자 성함은 필수입니다"),
  managerTitle: z.string().min(1, "담당자 직함은 필수입니다"),
  managerEmail: z.string().email("올바른 이메일 주소를 입력하세요"),
  managerPhone: z.string().min(10, "담당자 핸드폰 번호는 필수입니다"),
  
  // 🆕 개인정보 동의
  privacyAgreed: z.boolean().refine(val => val === true, "개인정보 활용 동의는 필수입니다"),
});

r.post("/signup/buyer", async (req, res) => {
  try {
    const body = signupBuyerSchema.parse(req.body);
    const cleanBizNo = body.bizNo.replace(/\D/g, "");
    const cleanManagerPhone = normalizePhone(body.managerPhone);

    // username 중복 체크
    const existingUsername = await prisma.user.findUnique({ where: { username: body.username } });
    if (existingUsername) {
      return res.status(400).json({ error: "USERNAME_ALREADY_EXISTS", message: "이미 사용 중인 ID입니다" });
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
        phone: cleanManagerPhone, // 담당자 핸드폰 (알림톡용, unique 제약 때문에 여기 저장)
        username: body.username,
        passwordHash,
        name: apickResult.representative || "대표자",
        role: "BUYER",
        companyType: body.companyType || (buyerType === "GOVERNMENT" ? "GOVERNMENT" : "PRIVATE"), // User 테이블에도 저장 (호환성)
        referredById: referredBy.id,
        
        // 🆕 담당자 정보
        managerName: body.managerName,
        managerTitle: body.managerTitle,
        managerEmail: body.managerEmail,
        managerPhone: cleanManagerPhone,
        
        // 🆕 개인정보 동의
        privacyAgreed: body.privacyAgreed,
        privacyAgreedAt: new Date(),
        
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
// 🔍 ID 찾기 (매니저는 핸드폰, 기업은 사업자번호+담당자 핸드폰)
// ========================================

const findIdSchema = z.object({
  userType: z.enum(["AGENT", "SUPPLIER", "BUYER"]),
  phone: z.string().min(10).optional(), // 매니저용
  bizNo: z.string().min(10).optional(), // 기업용
  managerPhone: z.string().min(10).optional(), // 기업 담당자 핸드폰
});

r.post("/find-id", async (req, res) => {
  try {
    const body = findIdSchema.parse(req.body);
    
    if (body.userType === "AGENT") {
      // 매니저: 핸드폰 번호로 찾기
      if (!body.phone) {
        return res.status(400).json({ error: "PHONE_REQUIRED", message: "핸드폰 번호를 입력하세요" });
      }
      
      const cleanPhone = normalizePhone(body.phone);
      const user = await prisma.user.findUnique({ 
        where: { phone: cleanPhone },
        select: { phone: true, role: true, name: true, createdAt: true }
      });
      
      if (!user || user.role !== "AGENT") {
        return res.status(404).json({ error: "USER_NOT_FOUND", message: "해당 정보로 등록된 매니저 계정을 찾을 수 없습니다" });
      }
      
      return res.json({
        type: "AGENT",
        identifier: user.phone,
        name: user.name,
        createdAt: user.createdAt,
        message: "매니저는 핸드폰 번호로 로그인하세요"
      });
      
    } else {
      // 기업: 사업자번호 + 담당자 핸드폰으로 찾기
      if (!body.bizNo || !body.managerPhone) {
        return res.status(400).json({ 
          error: "BIZNO_AND_PHONE_REQUIRED", 
          message: "사업자번호와 담당자 핸드폰 번호를 입력하세요" 
        });
      }
      
      const cleanBizNo = body.bizNo.replace(/\D/g, "");
      const cleanManagerPhone = normalizePhone(body.managerPhone);
      
      const user = await prisma.user.findFirst({
        where: {
          role: body.userType,
          managerPhone: cleanManagerPhone,
          company: {
            bizNo: cleanBizNo
          }
        },
        select: {
          username: true,
          role: true,
          managerName: true,
          createdAt: true,
          company: {
            select: { name: true, bizNo: true }
          }
        }
      });
      
      if (!user) {
        return res.status(404).json({ 
          error: "USER_NOT_FOUND", 
          message: "해당 정보로 등록된 기업 계정을 찾을 수 없습니다" 
        });
      }
      
      return res.json({
        type: user.role,
        identifier: user.username,
        companyName: user.company?.name,
        managerName: user.managerName,
        createdAt: user.createdAt,
        message: `아이디는 "${user.username}" 입니다`
      });
    }
    
  } catch (error: any) {
    console.error("Find ID error:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "VALIDATION_ERROR", details: error.errors });
    }
    return res.status(500).json({ error: "INTERNAL_ERROR" });
  }
});

// ========================================
// ✏️ 회원정보 수정
// ========================================

const updateProfileSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  managerName: z.string().min(1).optional(),
  managerTitle: z.string().optional(),
  managerEmail: z.string().email().optional(),
  managerPhone: z.string().min(10).optional(),
  currentPassword: z.string().min(8).optional(),
  newPassword: z.string().min(8).optional(),
});

r.post("/update-profile", async (req, res) => {
  try {
    // 인증 토큰 확인
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "UNAUTHORIZED", message: "로그인이 필요합니다" });
    }
    
    const token = authHeader.split(" ")[1];
    let decoded;
    try {
      decoded = jwt.verify(token, config.jwtSecret) as { userId: string };
    } catch (error) {
      return res.status(401).json({ error: "INVALID_TOKEN", message: "유효하지 않은 토큰입니다" });
    }
    
    const body = updateProfileSchema.parse(req.body);
    
    // 현재 사용자 조회 (비밀번호 포함)
    const user = await prisma.user.findUnique({ 
      where: { id: decoded.userId }
    });
    
    if (!user) {
      return res.status(404).json({ error: "USER_NOT_FOUND", message: "사용자를 찾을 수 없습니다" });
    }
    
    // 비밀번호 변경 시 현재 비밀번호 확인
    if (body.newPassword) {
      if (!body.currentPassword) {
        return res.status(400).json({ 
          error: "CURRENT_PASSWORD_REQUIRED", 
          message: "현재 비밀번호를 입력하세요" 
        });
      }
      
      const passwordMatch = await bcrypt.compare(body.currentPassword, user.passwordHash);
      if (!passwordMatch) {
        return res.status(400).json({ 
          error: "INCORRECT_PASSWORD", 
          message: "현재 비밀번호가 일치하지 않습니다" 
        });
      }
    }
    
    // 업데이트 데이터 준비
    const updateData: any = {};
    
    if (body.name) updateData.name = body.name;
    if (body.email) updateData.email = body.email;
    if (body.managerName) updateData.managerName = body.managerName;
    if (body.managerTitle !== undefined) updateData.managerTitle = body.managerTitle;
    if (body.managerEmail) updateData.managerEmail = body.managerEmail;
    if (body.managerPhone) {
      updateData.managerPhone = normalizePhone(body.managerPhone);
    }
    
    // 새 비밀번호가 있으면 해시화
    if (body.newPassword) {
      updateData.passwordHash = await bcrypt.hash(body.newPassword, 10);
    }
    
    // 사용자 정보 업데이트
    const updatedUser = await prisma.user.update({
      where: { id: decoded.userId },
      data: updateData,
      include: { company: true, branch: true }
    });
    
    // 비밀번호 제외하고 반환
    const { passwordHash: _, ...userWithoutPassword } = updatedUser;
    
    return res.json({
      message: "회원정보가 수정되었습니다",
      user: userWithoutPassword
    });
    
  } catch (error: any) {
    console.error("Update profile error:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "VALIDATION_ERROR", details: error.errors });
    }
    return res.status(500).json({ error: "INTERNAL_ERROR", message: "회원정보 수정 실패" });
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

// ========================================
// ✅ 사업자등록번호로 등록 기업 확인 (직원 회원가입용)
// ========================================

r.post("/verify-company", async (req, res) => {
  try {
    const { bizNo } = z.object({
      bizNo: z.string().min(10, "사업자등록번호를 입력하세요"),
    }).parse(req.body);

    const cleanBizNo = bizNo.replace(/\D/g, "");

    // 기업 확인
    const company = await prisma.company.findUnique({
      where: { bizNo: cleanBizNo },
      select: {
        id: true,
        name: true,
        bizNo: true,
        representative: true,
        buyerProfile: {
          select: { id: true }
        }
      },
    });

    if (!company || !company.buyerProfile) {
      return res.status(404).json({ 
        error: "COMPANY_NOT_FOUND", 
        message: "해당 사업자등록번호로 등록된 기업이 없습니다" 
      });
    }

    return res.json({
      company: {
        id: company.id,
        name: company.name,
        bizNo: company.bizNo,
        representative: company.representative,
        buyerProfileId: company.buyerProfile.id,
      },
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "VALIDATION_ERROR", details: error.errors });
    }
    console.error("Verify company error:", error);
    return res.status(500).json({ error: "INTERNAL_ERROR", message: "기업 확인 실패" });
  }
});

// ========================================
// ✅ 인증번호로 등록 직원 확인 (직원 회원가입용)
// ========================================

r.post("/verify-employee", async (req, res) => {
  try {
    const { buyerProfileId, registrationNumber } = z.object({
      buyerProfileId: z.string().min(1, "기업 정보가 필요합니다"),
      registrationNumber: z.string().min(6, "주민등록번호 앞자리 6자리를 입력하세요"),
    }).parse(req.body);

    // 장애인 직원 매칭 (주민등록번호 앞자리로 매칭)
    const employee = await prisma.disabledEmployee.findFirst({
      where: {
        buyerId: buyerProfileId,
        registrationNumber: registrationNumber,
        resignDate: null, // 재직 중인 직원만
      },
      select: {
        id: true,
        name: true,
        workType: true,
        disabilityType: true,
        registrationNumber: true,
      },
    });

    if (!employee) {
      return res.status(404).json({ 
        error: "EMPLOYEE_NOT_FOUND", 
        message: "해당 인증번호로 등록된 직원 정보를 찾을 수 없습니다" 
      });
    }

    // 이미 계정이 연결된 직원인지 확인
    const existingEmployeeAccount = await prisma.user.findUnique({
      where: { employeeId: employee.id },
    });

    if (existingEmployeeAccount) {
      return res.status(400).json({ 
        error: "EMPLOYEE_ACCOUNT_EXISTS", 
        message: "이미 계정이 연결된 직원입니다" 
      });
    }

    return res.json({
      employee: {
        id: employee.id,
        name: employee.name,
        workType: employee.workType,
        disabilityType: employee.disabilityType,
      },
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "VALIDATION_ERROR", details: error.errors });
    }
    console.error("Verify employee error:", error);
    return res.status(500).json({ error: "INTERNAL_ERROR", message: "직원 확인 실패" });
  }
});

// ========================================
// 👷 직원(EMPLOYEE) 계정 회원가입
// ========================================

const signupEmployeeSchema = z.object({
  phone: z.string().min(10, "핸드폰 번호를 입력하세요"),
  password: z.string().min(8, "비밀번호는 8자 이상이어야 합니다"),
  employeeId: z.string().min(1, "직원 정보가 필요합니다"), // 검증 API에서 받은 직원 ID
  companyBizNo: z.string().min(10, "소속 기업 사업자등록번호를 입력하세요"),
  privacyAgreed: z.boolean().refine(val => val === true, "개인정보 활용 동의는 필수입니다"),
});

r.post("/signup/employee", async (req, res) => {
  try {
    const body = signupEmployeeSchema.parse(req.body);
    const cleanPhone = normalizePhone(body.phone);
    const cleanBizNo = body.companyBizNo.replace(/\D/g, "");

    // 핸드폰 번호 중복 체크
    const existing = await prisma.user.findUnique({ where: { phone: cleanPhone } });
    if (existing) {
      return res.status(400).json({ 
        error: "PHONE_ALREADY_EXISTS", 
        message: "이미 가입된 핸드폰 번호입니다" 
      });
    }

    // 직원 정보 확인
    const employee = await prisma.disabledEmployee.findUnique({
      where: { id: body.employeeId },
      include: { buyer: { include: { company: true } } },
    });

    if (!employee || employee.resignDate) {
      return res.status(404).json({ 
        error: "EMPLOYEE_NOT_FOUND", 
        message: "직원 정보를 찾을 수 없거나 퇴사한 직원입니다" 
      });
    }

    // 이미 계정이 연결된 직원인지 확인
    const existingEmployeeAccount = await prisma.user.findUnique({
      where: { employeeId: employee.id },
    });

    if (existingEmployeeAccount) {
      return res.status(400).json({ 
        error: "EMPLOYEE_ACCOUNT_EXISTS", 
        message: "이미 계정이 연결된 직원입니다" 
      });
    }

    // 사업자번호 일치 확인
    if (employee.buyer.company.bizNo !== cleanBizNo) {
      return res.status(400).json({ 
        error: "BIZNO_MISMATCH", 
        message: "기업 정보가 일치하지 않습니다" 
      });
    }

    const passwordHash = await bcrypt.hash(body.password, 10);

    // 직원 계정 생성
    const user = await prisma.user.create({
      data: {
        phone: cleanPhone,
        passwordHash,
        name: employee.name,
        role: "EMPLOYEE",
        employeeId: employee.id,
        companyBizNo: cleanBizNo,
        privacyAgreed: body.privacyAgreed,
        privacyAgreedAt: new Date(),
      },
    });

    return res.json({
      message: "직원 계정이 생성되었습니다",
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name,
        role: user.role,
        companyName: employee.buyer.company.name,
      },
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "VALIDATION_ERROR", details: error.errors });
    }
    console.error("Employee signup error:", error);
    return res.status(500).json({ error: "INTERNAL_ERROR", message: "회원가입 실패" });
  }
});

// ========================================
// 🔑 직원(EMPLOYEE) 로그인
// ========================================

r.post("/login/employee", async (req, res) => {
  try {
    const body = z.object({
      phone: z.string().min(10),
      password: z.string().min(1),
    }).parse(req.body);

    const cleanPhone = normalizePhone(body.phone);

    // 직원 계정 조회
    const user = await prisma.user.findFirst({
      where: { 
        phone: cleanPhone,
        role: "EMPLOYEE",
      },
    });

    if (!user) {
      return res.status(401).json({ 
        error: "INVALID_CREDENTIALS", 
        message: "핸드폰 번호 또는 비밀번호가 일치하지 않습니다" 
      });
    }

    const ok = await bcrypt.compare(body.password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ 
        error: "INVALID_CREDENTIALS", 
        message: "핸드폰 번호 또는 비밀번호가 일치하지 않습니다" 
      });
    }

    // 직원 정보 및 기업 정보 조회
    let employee = null;
    let company = null;
    
    if (user.employeeId) {
      employee = await prisma.disabledEmployee.findUnique({
        where: { id: user.employeeId },
        include: { buyer: { include: { company: true } } },
      });
      company = employee?.buyer.company;
    }

    const accessToken = jwt.sign(
      { userId: user.id, role: user.role, employeeId: user.employeeId },
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
        name: user.name,
        role: user.role,
        employeeId: user.employeeId,
        companyName: company?.name,
        companyBizNo: user.companyBizNo,
        employee: employee ? {
          id: employee.id,
          name: employee.name,
          workType: employee.workType,
          disabilityType: employee.disabilityType,
        } : null,
      },
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "VALIDATION_ERROR", details: error.errors });
    }
    console.error("Employee login error:", error);
    return res.status(500).json({ error: "INTERNAL_ERROR" });
  }
});

export default r;
