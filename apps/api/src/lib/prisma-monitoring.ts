import { PrismaClient } from '@prisma/client';

/**
 * 쿼리 성능 모니터링을 위한 Prisma 확장
 */
export function createPrismaWithMonitoring() {
  const prisma = new PrismaClient({
    log: [
      { emit: 'event', level: 'query' },
      { emit: 'event', level: 'error' },
      { emit: 'event', level: 'warn' }
    ]
  });

  // 쿼리 성능 통계
  const queryStats = {
    totalQueries: 0,
    slowQueries: 0,
    averageTime: 0,
    maxTime: 0,
    queries: [] as Array<{ query: string; duration: number; timestamp: Date }>
  };

  // 쿼리 이벤트 리스너
  prisma.$on('query' as any, (e: any) => {
    const duration = e.duration;
    
    // 통계 업데이트
    queryStats.totalQueries++;
    queryStats.averageTime = 
      (queryStats.averageTime * (queryStats.totalQueries - 1) + duration) / 
      queryStats.totalQueries;
    
    if (duration > queryStats.maxTime) {
      queryStats.maxTime = duration;
    }

    // 느린 쿼리 (100ms 이상)
    if (duration > 100) {
      queryStats.slowQueries++;
      console.warn(`[SLOW QUERY] ${duration}ms - ${e.query.substring(0, 100)}...`);
      
      // 최근 10개의 느린 쿼리 저장
      queryStats.queries.push({
        query: e.query,
        duration,
        timestamp: new Date()
      });
      
      if (queryStats.queries.length > 10) {
        queryStats.queries.shift();
      }
    } else if (duration > 10) {
      console.log(`[Query] ${duration}ms`);
    }
  });

  // 에러 이벤트 리스너
  prisma.$on('error' as any, (e: any) => {
    console.error('[Prisma Error]', e);
  });

  // 경고 이벤트 리스너  
  prisma.$on('warn' as any, (e: any) => {
    console.warn('[Prisma Warning]', e);
  });

  // 통계 조회 함수 추가
  (prisma as any).getQueryStats = () => ({
    ...queryStats,
    averageTime: Math.round(queryStats.averageTime * 100) / 100,
    slowQueryPercentage: queryStats.totalQueries > 0 
      ? Math.round((queryStats.slowQueries / queryStats.totalQueries) * 10000) / 100
      : 0
  });

  // 통계 초기화 함수
  (prisma as any).resetQueryStats = () => {
    queryStats.totalQueries = 0;
    queryStats.slowQueries = 0;
    queryStats.averageTime = 0;
    queryStats.maxTime = 0;
    queryStats.queries = [];
  };

  return prisma;
}

/**
 * 주기적인 성능 리포트 (15분마다)
 */
export function startPerformanceReporting(prisma: any) {
  setInterval(() => {
    const stats = prisma.getQueryStats();
    
    if (stats.totalQueries > 0) {
      console.log('\n=== Prisma Performance Report ===');
      console.log(`Total Queries: ${stats.totalQueries}`);
      console.log(`Average Time: ${stats.averageTime}ms`);
      console.log(`Max Time: ${stats.maxTime}ms`);
      console.log(`Slow Queries: ${stats.slowQueries} (${stats.slowQueryPercentage}%)`);
      console.log('================================\n');
    }
  }, 900000); // 15분
}
