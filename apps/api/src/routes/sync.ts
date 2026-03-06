/**
 * 구글 시트 동기화 API
 */
import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { syncToGoogleSheetRealtime } from '../services/google-sheets.js';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

/**
 * POST /sync/google-sheets
 * 수동으로 전체 데이터 동기화 트리거
 */
router.post('/google-sheets', requireAuth, requireRole('SUPER_ADMIN'), async (req, res) => {
  try {
    await syncToGoogleSheetRealtime(prisma);
    res.json({ 
      success: true, 
      message: '구글 시트 동기화가 완료되었습니다',
      timestamp: new Date(),
    });
  } catch (error: any) {
    console.error('[POST /sync/google-sheets] Error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message || '동기화 실패'
    });
  }
});

/**
 * GET /sync/last-sync
 * 마지막 동기화 시간 조회 (구글 시트에서)
 */
router.get('/last-sync', requireAuth, requireRole('SUPER_ADMIN'), async (req, res) => {
  try {
    // TODO: 구글 시트에서 마지막 동기화 시간 읽어오기
    res.json({ 
      lastSync: null,
      message: '마지막 동기화 시간 조회 기능은 추후 구현 예정'
    });
  } catch (error: any) {
    console.error('[GET /sync/last-sync] Error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
