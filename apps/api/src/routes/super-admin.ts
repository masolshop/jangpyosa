import express from 'express';
import bcryptjs from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// 슈퍼어드민 생성 엔드포인트 (보안 키 필요)
router.post('/create-super-admin', async (req, res) => {
  try {
    // 보안 키 확인
    const secret = req.headers['x-admin-secret'];
    if (secret !== 'jangpyosa-super-secret-2025') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const { phone, name, email, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({ error: 'Phone and password are required' });
    }

    // 비밀번호 해시
    const passwordHash = await bcryptjs.hash(password, 10);

    // 기존 사용자 확인
    const existing = await prisma.user.findUnique({ where: { phone } });

    let user;
    if (existing) {
      // 기존 사용자를 SUPER_ADMIN으로 업데이트
      user = await prisma.user.update({
        where: { phone },
        data: {
          role: 'SUPER_ADMIN',
          passwordHash,
          name: name || existing.name,
          email: email || existing.email,
        },
      });
      console.log('✅ 기존 사용자를 슈퍼어드민으로 업데이트:', phone);
    } else {
      // 새로운 슈퍼어드민 생성
      user = await prisma.user.create({
        data: {
          phone,
          name: name || '슈퍼관리자',
          email: email || `admin@jangpyosa.com`,
          role: 'SUPER_ADMIN',
          passwordHash,
          privacyAgreed: true,
          privacyAgreedAt: new Date(),
        },
      });
      console.log('✅ 새로운 슈퍼어드민 생성:', phone);
    }

    return res.json({
      success: true,
      message: existing ? '슈퍼어드민으로 업데이트되었습니다' : '슈퍼어드민이 생성되었습니다',
      user: {
        phone: user.phone,
        name: user.name,
        role: user.role,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('❌ 슈퍼어드민 생성 에러:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
