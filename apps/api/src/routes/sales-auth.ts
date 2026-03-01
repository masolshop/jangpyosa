import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config.js';

const router = Router();
const prisma = new PrismaClient();

const JWT_SECRET = config.jwtSecret || 'your-secret-key';

/**
 * POST /sales/auth/signup
 * 매니저 회원가입
 */
router.post('/signup', async (req, res) => {
  try {
    const { name, phone, email, password } = req.body;

    // 입력 검증
    if (!name || !phone || !password) {
      return res.status(400).json({ error: '필수 정보를 입력해주세요' });
    }

    // 핸드폰 번호 중복 확인
    const existingUser = await prisma.user.findUnique({
      where: { phone },
    });

    if (existingUser) {
      return res.status(400).json({ error: '이미 등록된 핸드폰 번호입니다' });
    }

    // 비밀번호 해싱
    const passwordHash = await bcrypt.hash(password, 10);

    // User 생성 (EMPLOYEE 역할)
    const user = await prisma.user.create({
      data: {
        phone,
        email: email || `sales_${phone}@jangpyosa.com`,
        passwordHash,
        name,
        role: 'EMPLOYEE', // 영업 사원은 EMPLOYEE 역할
      },
    });

    // SalesPerson 생성 (기본 MANAGER 역할)
    const salesPerson = await prisma.salesPerson.create({
      data: {
        userId: user.id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        role: 'MANAGER', // 기본 매니저로 시작
        referralCode: user.phone.replace(/^0/, ''), // 0 제거
        referralLink: `https://jangpyosa.com/${user.phone}`,
        totalReferrals: 0,
        activeReferrals: 0,
        totalRevenue: 0,
        commission: 0,
        isActive: true,
      },
    });

    // JWT 토큰 생성
    const token = jwt.sign(
      {
        userId: user.id,
        salesPersonId: salesPerson.id,
        role: salesPerson.role,
      },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    // 활동 로그
    // 활동 로그
    await prisma.salesActivityLog.create({
      data: {
        salesPersonId: salesPerson.id,
        action: 'SIGNUP',
        fromValue: null,
        toValue: JSON.stringify({ role: 'MANAGER' }),
        reason: '신규 가입',
      },
    });

    res.json({
      token,
      salesPerson: {
        id: salesPerson.id,
        userId: user.id,
        name: salesPerson.name,
        phone: salesPerson.phone,
        email: salesPerson.email,
        role: salesPerson.role,
        referralCode: salesPerson.referralCode,
        referralLink: salesPerson.referralLink,
      },
    });
  } catch (error: any) {
    console.error('[POST /sales/auth/signup] Error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /sales/auth/login
 * 매니저 로그인
 */
router.post('/login', async (req, res) => {
  try {
    const { phone, password } = req.body;

    // 입력 검증
    if (!phone || !password) {
      return res.status(400).json({ error: '핸드폰 번호와 비밀번호를 입력해주세요' });
    }

    // 사용자 찾기
    const user = await prisma.user.findUnique({
      where: { phone },
    });

    if (!user) {
      return res.status(401).json({ error: '핸드폰 번호 또는 비밀번호가 올바르지 않습니다' });
    }

    // 비밀번호 확인
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: '핸드폰 번호 또는 비밀번호가 올바르지 않습니다' });
    }

    // SalesPerson 찾기
    const salesPerson = await prisma.salesPerson.findUnique({
      where: { userId: user.id },
      include: {
        manager: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
        subordinates: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
    });

    if (!salesPerson) {
      return res.status(404).json({ error: '영업 사원 정보를 찾을 수 없습니다' });
    }

    // 비활성 계정 확인
    if (!salesPerson.isActive) {
      return res.status(403).json({ error: '비활성 상태의 계정입니다. 관리자에게 문의하세요' });
    }

    // JWT 토큰 생성
    const token = jwt.sign(
      {
        userId: user.id,
        salesPersonId: salesPerson.id,
        role: salesPerson.role,
      },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    // 로그인 활동 로그
    await prisma.salesActivityLog.create({
      data: {
        salesPersonId: salesPerson.id,
        action: 'LOGIN',
        fromValue: null,
        toValue: null,
        reason: '로그인',
      },
    });

    res.json({
      token,
      salesPerson: {
        id: salesPerson.id,
        userId: user.id,
        name: salesPerson.name,
        phone: salesPerson.phone,
        email: salesPerson.email,
        role: salesPerson.role,
        referralCode: salesPerson.referralCode,
        referralLink: salesPerson.referralLink,
        totalReferrals: salesPerson.totalReferrals,
        activeReferrals: salesPerson.activeReferrals,
        totalRevenue: salesPerson.totalRevenue,
        commission: salesPerson.commission,
        manager: salesPerson.manager,
        subordinates: salesPerson.subordinates,
      },
    });
  } catch (error: any) {
    console.error('[POST /sales/auth/login] Error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /sales/auth/me
 * 내 정보 조회 (토큰 검증)
 */
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: '인증 토큰이 없습니다' });
    }

    // 토큰 검증
    const decoded: any = jwt.verify(token, JWT_SECRET);

    // SalesPerson 조회
    const salesPerson = await prisma.salesPerson.findUnique({
      where: { id: decoded.salesPersonId },
      include: {
        manager: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
        subordinates: {
          select: {
            id: true,
            name: true,
            role: true,
            totalReferrals: true,
            activeReferrals: true,
          },
        },
      },
    });

    if (!salesPerson) {
      return res.status(404).json({ error: '영업 사원 정보를 찾을 수 없습니다' });
    }

    res.json({ salesPerson });
  } catch (error: any) {
    console.error('[GET /sales/auth/me] Error:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: '유효하지 않은 토큰입니다' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: '토큰이 만료되었습니다' });
    }
    res.status(500).json({ error: error.message });
  }
});

export default router;
