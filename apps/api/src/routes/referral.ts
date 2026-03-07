import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { syncToGoogleSheetRealtime } from '../services/google-sheets.js';

const router = Router();
const prisma = new PrismaClient();

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

/**
 * 추천인 코드 생성 (DB 저장용)
 * 핸드폰 번호에서 앞의 0을 제거 (01012345678 -> 1012345678)
 */
function toReferralCode(phone: string): string {
  const normalized = normalizePhone(phone);
  return normalized.startsWith('0') ? normalized.substring(1) : normalized;
}

/**
 * GET /referral/validate/:code
 * 추천인 코드 검증
 * 
 * 핸드폰번호 기반 추천인 링크: https://jangpyosa.com/01012345678
 * - URL에서 핸드폰번호를 추출하여 영업 사원 조회
 * - 유효한 추천인인지 확인
 */
router.get('/validate/:code', async (req, res) => {
  try {
    const { code } = req.params;
    
    // 핸드폰번호 정규화 (010-1234-5678, 01012345678, 1012345678 모두 지원)
    // DB에는 앞의 0을 제거한 형태로 저장됨 (1012345678)
    const referralCode = toReferralCode(code);
    
    // 추천인 조회
    const salesPerson = await prisma.salesPerson.findUnique({
      where: { referralCode },
      select: {
        id: true,
        name: true,
        phone: true,
        role: true,
        isActive: true,
        totalReferrals: true,
        referralLink: true,
      },
    });
    
    if (!salesPerson) {
      return res.status(404).json({ 
        error: '유효하지 않은 추천인 코드입니다',
        isValid: false,
      });
    }
    
    if (!salesPerson.isActive) {
      return res.status(400).json({ 
        error: '비활성화된 추천인입니다',
        isValid: false,
      });
    }
    
    res.json({
      isValid: true,
      salesPerson: {
        id: salesPerson.id,
        name: salesPerson.name,
        role: salesPerson.role,
        totalReferrals: salesPerson.totalReferrals,
      },
      referralCode,
    });
  } catch (error: any) {
    console.error('[GET /referral/validate/:code] Error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /referral/register
 * 추천인 링크를 통한 기업 등록
 * 
 * Body:
 * - companyId: 등록된 기업 ID
 * - referralCode: 추천인 코드 (핸드폰번호)
 * - referralSource: 추천 경로 (optional)
 */
router.post('/register', async (req, res) => {
  try {
    const {
      companyId,
      referralCode: rawReferralCode,
      referralSource,
    } = req.body;
    
    // 핸드폰번호 정규화 (DB 저장 형식으로 변환)
    const referralCode = toReferralCode(rawReferralCode);
    
    // 기업 정보 조회
    const company = await prisma.company.findUnique({
      where: { id: companyId },
    });
    
    if (!company) {
      return res.status(404).json({ error: '기업을 찾을 수 없습니다' });
    }
    
    // 추천인 조회
    const salesPerson = await prisma.salesPerson.findUnique({
      where: { referralCode },
    });
    
    if (!salesPerson) {
      return res.status(404).json({ error: '유효하지 않은 추천인 코드입니다' });
    }
    
    if (!salesPerson.isActive) {
      return res.status(400).json({ error: '비활성화된 추천인입니다' });
    }
    
    // 이미 등록된 추천인 관계인지 확인
    const existingReferral = await prisma.companyReferral.findUnique({
      where: {
        companyId_salesPersonId: {
          companyId,
          salesPersonId: salesPerson.id,
        },
      },
    });
    
    if (existingReferral) {
      return res.status(400).json({ error: '이미 추천인 관계가 등록되어 있습니다' });
    }
    
    // 추천인 관계 생성
    const companyReferral = await prisma.companyReferral.create({
      data: {
        companyId,
        salesPersonId: salesPerson.id,
        referralCode,
        referralSource: referralSource || 'direct_link',
        companyName: company.name,
        companyBizNo: company.bizNo,
        companyType: company.type,
      },
    });
    
    // 영업 사원 통계 업데이트
    await prisma.salesPerson.update({
      where: { id: salesPerson.id },
      data: {
        totalReferrals: {
          increment: 1,
        },
      },
    });
    
    // 활동 로그 기록
    await prisma.salesActivityLog.create({
      data: {
        salesPersonId: salesPerson.id,
        action: 'REFERRAL_ADDED',
        targetId: companyId,
        toValue: company.name,
        notes: `추천 고객 추가: ${company.name} (${company.bizNo})`,
      },
    });
    
    // 🆕 구글 시트 실시간 동기화 (비동기, 실패해도 등록은 성공)
    syncToGoogleSheetRealtime(prisma).catch(err => 
      console.error('구글 시트 동기화 실패:', err)
    );
    
    res.status(201).json({
      success: true,
      companyReferral,
      message: `${salesPerson.name}님의 추천으로 등록되었습니다`,
    });
  } catch (error: any) {
    console.error('[POST /referral/register] Error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /referral/companies/:salesPersonId
 * 영업 사원의 추천 고객 목록 조회
 */
router.get('/companies/:salesPersonId', async (req, res) => {
  try {
    const { salesPersonId } = req.params;
    const { isActive } = req.query;
    
    const where: any = { salesPersonId };
    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }
    
    const companies = await prisma.companyReferral.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    res.json({ companies });
  } catch (error: any) {
    console.error('[GET /referral/companies/:salesPersonId] Error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * PUT /referral/:id/activate
 * 추천 고객 활성화 (첫 결제 시)
 */
router.put('/:id/activate', async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentAmount, commission } = req.body;
    
    const companyReferral = await prisma.companyReferral.update({
      where: { id },
      data: {
        isActive: true,
        firstPaymentDate: new Date(),
        lastPaymentDate: new Date(),
        totalPayments: {
          increment: paymentAmount || 0,
        },
        totalCommission: {
          increment: commission || 0,
        },
      },
    });
    
    // 영업 사원 통계 업데이트
    await prisma.salesPerson.update({
      where: { id: companyReferral.salesPersonId },
      data: {
        activeReferrals: {
          increment: 1,
        },
        totalRevenue: {
          increment: paymentAmount || 0,
        },
        commission: {
          increment: commission || 0,
        },
      },
    });
    
    res.json({ companyReferral });
  } catch (error: any) {
    console.error('[PUT /referral/:id/activate] Error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /referral/payment
 * 추천 고객 결제 기록
 */
router.post('/payment', async (req, res) => {
  try {
    const {
      companyId,
      salesPersonId,
      paymentAmount,
      commission,
    } = req.body;
    
    // 추천인 관계 조회
    const companyReferral = await prisma.companyReferral.findUnique({
      where: {
        companyId_salesPersonId: {
          companyId,
          salesPersonId,
        },
      },
    });
    
    if (!companyReferral) {
      return res.status(404).json({ error: '추천인 관계를 찾을 수 없습니다' });
    }
    
    // 추천인 관계 업데이트
    const updated = await prisma.companyReferral.update({
      where: { id: companyReferral.id },
      data: {
        lastPaymentDate: new Date(),
        totalPayments: {
          increment: paymentAmount,
        },
        totalCommission: {
          increment: commission,
        },
      },
    });
    
    // 영업 사원 통계 업데이트
    await prisma.salesPerson.update({
      where: { id: salesPersonId },
      data: {
        totalRevenue: {
          increment: paymentAmount,
        },
        commission: {
          increment: commission,
        },
      },
    });
    
    res.json({ 
      success: true,
      companyReferral: updated,
    });
  } catch (error: any) {
    console.error('[POST /referral/payment] Error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
