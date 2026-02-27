import { Request, Response, NextFunction } from 'express';

/**
 * In-memory 캐시 저장소
 */
const cache = new Map<string, { data: any; timestamp: number }>();

/**
 * 캐시 만료 시간 (초)
 */
const CACHE_TTL = {
  short: 60,       // 1분 - 자주 변경되는 데이터
  medium: 300,     // 5분 - 중간 정도
  long: 3600,      // 1시간 - 거의 변경되지 않는 데이터
  day: 86400       // 24시간 - 정적 데이터
};

/**
 * 캐시 키 생성
 */
function getCacheKey(req: Request): string {
  const userId = (req as any).user?.id || 'anonymous';
  const path = req.path;
  const query = JSON.stringify(req.query);
  return `${userId}:${path}:${query}`;
}

/**
 * 캐시 미들웨어 생성 함수
 */
export function cacheMiddleware(ttl: keyof typeof CACHE_TTL = 'medium') {
  return (req: Request, res: Response, next: NextFunction) => {
    // GET 요청만 캐싱
    if (req.method !== 'GET') {
      return next();
    }

    const key = getCacheKey(req);
    const cached = cache.get(key);
    const ttlSeconds = CACHE_TTL[ttl];

    // 캐시가 있고 유효한 경우
    if (cached && Date.now() - cached.timestamp < ttlSeconds * 1000) {
      console.log(`[Cache HIT] ${key}`);
      return res.json(cached.data);
    }

    // 원래 res.json을 래핑하여 응답을 캐시에 저장
    const originalJson = res.json.bind(res);
    res.json = function (data: any) {
      cache.set(key, {
        data,
        timestamp: Date.now()
      });
      console.log(`[Cache SET] ${key} (TTL: ${ttlSeconds}s)`);
      return originalJson(data);
    };

    next();
  };
}

/**
 * 특정 패턴의 캐시 무효화
 */
export function invalidateCache(pattern?: string) {
  if (!pattern) {
    // 모든 캐시 클리어
    cache.clear();
    console.log('[Cache] All cache cleared');
    return;
  }

  // 패턴 매칭으로 캐시 삭제
  let count = 0;
  for (const key of cache.keys()) {
    if (key.includes(pattern)) {
      cache.delete(key);
      count++;
    }
  }
  console.log(`[Cache] Invalidated ${count} entries matching "${pattern}"`);
}

/**
 * 캐시 통계 조회
 */
export function getCacheStats() {
  return {
    size: cache.size,
    keys: Array.from(cache.keys())
  };
}

/**
 * 주기적인 캐시 정리 (만료된 항목 제거)
 */
setInterval(() => {
  const now = Date.now();
  let cleaned = 0;

  for (const [key, value] of cache.entries()) {
    // 최대 TTL(24시간)이 지난 항목 제거
    if (now - value.timestamp > CACHE_TTL.day * 1000) {
      cache.delete(key);
      cleaned++;
    }
  }

  if (cleaned > 0) {
    console.log(`[Cache] Cleaned ${cleaned} expired entries`);
  }
}, 3600000); // 1시간마다 실행

export { CACHE_TTL };
