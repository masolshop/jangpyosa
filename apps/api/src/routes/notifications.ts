import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { config } from '../config.js';

const router = Router();
const prisma = new PrismaClient();

// SSE 연결 관리
const sseConnections = new Map<string, Response[]>();

/**
 * SSE 연결 설정 (쿼리 파라미터로 토큰 전달)
 */
router.get('/notifications/stream', async (req: Request, res: Response) => {
  // EventSource는 헤더를 설정할 수 없으므로 쿼리 파라미터로 토큰 전달
  const token = req.query.token as string;
  
  if (!token) {
    return res.status(401).json({ error: '토큰이 필요합니다' });
  }

  let userId: string;
  try {
    const decoded = jwt.verify(token, config.jwtSecret) as any;
    userId = decoded.userId;
  } catch (error) {
    return res.status(401).json({ error: '유효하지 않은 토큰입니다' });
  }

  if (!userId) {
    return res.status(401).json({ error: '인증이 필요합니다' });
  }

  // SSE 헤더 설정
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no'); // Nginx 버퍼링 비활성화

  // CORS 설정
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  // 사용자별 연결 저장
  if (!sseConnections.has(userId)) {
    sseConnections.set(userId, []);
  }
  sseConnections.get(userId)!.push(res);

  console.log(`[SSE] 사용자 ${userId} 연결됨. 현재 연결 수: ${sseConnections.get(userId)!.length}`);

  // 초기 연결 메시지
  res.write(`data: ${JSON.stringify({ type: 'connected', message: '알림 연결 성공' })}\n\n`);

  // Heartbeat (30초마다)
  const heartbeatInterval = setInterval(() => {
    res.write(`:heartbeat\n\n`);
  }, 30000);

  // 연결 종료 처리
  req.on('close', () => {
    clearInterval(heartbeatInterval);
    
    const connections = sseConnections.get(userId);
    if (connections) {
      const index = connections.indexOf(res);
      if (index > -1) {
        connections.splice(index, 1);
      }
      
      if (connections.length === 0) {
        sseConnections.delete(userId);
      }
    }
    
    console.log(`[SSE] 사용자 ${userId} 연결 해제됨. 남은 연결 수: ${connections?.length || 0}`);
  });
});

/**
 * 특정 사용자에게 알림 전송
 */
export function sendNotificationToUser(userId: string, notification: any) {
  const connections = sseConnections.get(userId);
  
  if (!connections || connections.length === 0) {
    console.log(`[SSE] 사용자 ${userId}의 활성 연결이 없습니다.`);
    return false;
  }

  const data = JSON.stringify(notification);
  let sentCount = 0;

  connections.forEach((res, index) => {
    try {
      res.write(`data: ${data}\n\n`);
      sentCount++;
    } catch (error) {
      console.error(`[SSE] 사용자 ${userId}의 연결 ${index}에 알림 전송 실패:`, error);
    }
  });

  console.log(`[SSE] 사용자 ${userId}에게 알림 전송 완료 (${sentCount}/${connections.length} 연결)`);
  return sentCount > 0;
}

/**
 * 여러 사용자에게 알림 전송
 */
export function sendNotificationToUsers(userIds: string[], notification: any) {
  let successCount = 0;

  userIds.forEach(userId => {
    if (sendNotificationToUser(userId, notification)) {
      successCount++;
    }
  });

  console.log(`[SSE] ${successCount}/${userIds.length}명에게 알림 전송 완료`);
  return successCount;
}

/**
 * 전체 사용자에게 알림 전송 (브로드캐스트)
 */
export function broadcastNotification(notification: any) {
  const data = JSON.stringify(notification);
  let totalSent = 0;

  sseConnections.forEach((connections, userId) => {
    connections.forEach(res => {
      try {
        res.write(`data: ${data}\n\n`);
        totalSent++;
      } catch (error) {
        console.error(`[SSE] 사용자 ${userId}에게 브로드캐스트 실패:`, error);
      }
    });
  });

  console.log(`[SSE] 브로드캐스트 완료: 총 ${totalSent}개 연결에 전송`);
  return totalSent;
}

/**
 * 알림 목록 조회
 */
router.get('/notifications', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;

    if (!userId) {
      return res.status(401).json({ error: '인증이 필요합니다' });
    }

    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    res.json({ notifications });
  } catch (error: any) {
    console.error('알림 목록 조회 오류:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * 알림 읽음 처리
 */
router.post('/notifications/:id/read', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ error: '인증이 필요합니다' });
    }

    const notification = await prisma.notification.update({
      where: { id, userId },
      data: { read: true, readAt: new Date() },
    });

    res.json({ notification });
  } catch (error: any) {
    console.error('알림 읽음 처리 오류:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * 모든 알림 읽음 처리
 */
router.post('/notifications/read-all', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;

    if (!userId) {
      return res.status(401).json({ error: '인증이 필요합니다' });
    }

    await prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true, readAt: new Date() },
    });

    res.json({ success: true });
  } catch (error: any) {
    console.error('모든 알림 읽음 처리 오류:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * 알림 삭제
 */
router.delete('/notifications/:id', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ error: '인증이 필요합니다' });
    }

    await prisma.notification.delete({
      where: { id, userId },
    });

    res.json({ success: true });
  } catch (error: any) {
    console.error('알림 삭제 오류:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
