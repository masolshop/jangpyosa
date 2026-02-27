import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount,
} from '../services/notificationService';

const router = Router();

/**
 * GET /notifications
 * 알림 목록 조회
 */
router.get('/', requireAuth, async (req, res) => {
  try {
    const userId = req.user!.id;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;
    const unreadOnly = req.query.unreadOnly === 'true';
    
    const result = await getUserNotifications(userId, { limit, offset, unreadOnly });
    
    res.json(result);
  } catch (error: any) {
    console.error('알림 목록 조회 실패:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /notifications/unread-count
 * 읽지 않은 알림 개수
 */
router.get('/unread-count', requireAuth, async (req, res) => {
  try {
    const userId = req.user!.id;
    const count = await getUnreadCount(userId);
    
    res.json({ count });
  } catch (error: any) {
    console.error('읽지 않은 알림 개수 조회 실패:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * PUT /notifications/:id/read
 * 알림 읽음 처리
 */
router.put('/:id/read', requireAuth, async (req, res) => {
  try {
    const userId = req.user!.id;
    const notificationId = req.params.id;
    
    const notification = await markAsRead(notificationId, userId);
    
    res.json({
      notification: {
        ...notification,
        data: notification.data ? JSON.parse(notification.data) : null,
      },
    });
  } catch (error: any) {
    console.error('알림 읽음 처리 실패:', error);
    
    if (error.message === 'Notification not found') {
      return res.status(404).json({ error: '알림을 찾을 수 없습니다' });
    }
    
    res.status(500).json({ error: error.message });
  }
});

/**
 * PUT /notifications/mark-all-read
 * 모든 알림 읽음 처리
 */
router.put('/mark-all-read', requireAuth, async (req, res) => {
  try {
    const userId = req.user!.id;
    const result = await markAllAsRead(userId);
    
    res.json({ success: true, count: result.count });
  } catch (error: any) {
    console.error('모든 알림 읽음 처리 실패:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /notifications/:id
 * 알림 삭제
 */
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const userId = req.user!.id;
    const notificationId = req.params.id;
    
    await deleteNotification(notificationId, userId);
    
    res.json({ success: true });
  } catch (error: any) {
    console.error('알림 삭제 실패:', error);
    
    if (error.message === 'Notification not found') {
      return res.status(404).json({ error: '알림을 찾을 수 없습니다' });
    }
    
    res.status(500).json({ error: error.message });
  }
});

export default router;
