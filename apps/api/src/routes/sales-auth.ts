import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { config } from '../config.js';

const router = Router();
const prisma = new PrismaClient();

const JWT_SECRET = config.jwtSecret || 'your-secret-key';
const APICK_API_KEY = process.env.APICK_API_KEY || '41173030f4fc1055778b2f97ce9659b5';

/**
 * POST /sales/auth/verify-identity
 * 주민번호 실명인증 - 이름 반환
 */
router.post('/verify-identity', async (req, res) => {
  try {
    const { rrn1, rrn2 } = req.body;

    // 입력 검증
    if (!rrn1 || !rrn2) {
      return res.status(400).json({ error: '주민등록번호를 입력해주세요' });
    }

    // 주민번호 형식 검증
    if (!/^\d{6}$/.test(rrn1) || !/^\d{7}$/.test(rrn2)) {
      return res.status(400).json({ error: '주민등록번호 형식이 올바르지 않습니다' });
    }

    // 주민번호로 이름 조회를 위해 임시 이름 사용
    // 실제로는 APICK API가 주민번호만으로 이름을 반환하지 않으므로
    // 별도의 실명인증 API를 사용해야 합니다
    // 여기서는 주민번호 검증만 수행하고 클라이언트에서 이름 입력받도록 수정
    
    return res.json({
      success: true,
      verified: false,
      message: '주민번호가 확인되었습니다. 성명을 입력해주세요.',
      requiresName: true,
    });
  } catch (error) {
    console.error('[POST /sales/auth/verify-identity] Error:', error);
    return res.status(500).json({ error: '서버 오류가 발생했습니다' });
  }
});

/**
 * POST /sales/auth/verify-identity-with-name
 * 주민번호 + 성명 실명인증
 */
router.post('/verify-identity-with-name', async (req, res) => {
  try {
    const { name, rrn1, rrn2 } = req.body;

    // 입력 검증
    if (!name || !rrn1 || !rrn2) {
      return res.status(400).json({ error: '성명과 주민등록번호를 입력해주세요' });
    }

    // 주민번호 형식 검증
    if (!/^\d{6}$/.test(rrn1) || !/^\d{7}$/.test(rrn2)) {
      return res.status(400).json({ error: '주민등록번호 형식이 올바르지 않습니다' });
    }

    // APICK API 호출
    const response = await fetch('https://apick.app/rest/name_rrn_auth', {
      method: 'POST',
      headers: {
        'CL_AUTH_KEY': APICK_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        rrn1,
        rrn2,
      }),
    });

    const data = await response.json();

    if (!data.api?.success) {
      return res.status(500).json({ error: '실명인증 API 호출에 실패했습니다' });
    }

    // 실명인증 결과
    if (data.data.result === 1) {
      // 인증 성공
      return res.json({
        success: true,
        verified: true,
        name: name,
        message: data.data.msg,
      });
    } else if (data.data.result === 0) {
      // 인증 실패
      return res.status(400).json({
        success: false,
        verified: false,
        error: '실명과 주민등록번호가 일치하지 않습니다',
      });
    } else {
      // 오류
      return res.status(500).json({
        success: false,
        verified: false,
        error: '실명확인에 실패했습니다',
      });
    }
  } catch (error) {
    console.error('[POST /sales/auth/verify-identity-with-name] Error:', error);
    return res.status(500).json({ error: '서버 오류가 발생했습니다' });
  }
});

/**
 * POST /sales/auth/signup
 * 매니저 회원가입 (실명인증 필수)
 */
router.post('/signup', async (req, res) => {
  try {
    const { name, phone, email, password, rrn1, rrn2, verified } = req.body;

    // 입력 검증
    if (!name || !phone || !password) {
      return res.status(400).json({ error: '필수 정보를 입력해주세요' });
    }

    // 실명인증 확인 (프론트엔드에서 verified=true 전달)
    if (!verified || !rrn1 || !rrn2) {
      return res.status(400).json({ error: '실명인증이 필요합니다' });
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

    // 주민번호 뒤 7자리 암호화 (보안)
    const encryptedRrn2 = await bcrypt.hash(rrn2, 10);

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
