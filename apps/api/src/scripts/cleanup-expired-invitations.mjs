import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * 만료된 초대 코드 자동 삭제
 * - 만료일이 지난 초대 코드를 자동으로 삭제합니다
 * - Cron Job으로 매일 실행 권장
 */
export async function cleanupExpiredInvitations() {
  try {
    console.log('🗑️  만료된 초대 코드 정리 시작...');
    
    const now = new Date();
    
    // 만료된 초대 코드 조회
    const expiredInvitations = await prisma.teamInvitation.findMany({
      where: {
        expiresAt: {
          lt: now // 만료일이 현재 시간보다 이전
        },
        isUsed: false // 사용되지 않은 것만
      },
      include: {
        company: {
          select: {
            name: true,
            bizNo: true
          }
        }
      }
    });
    
    if (expiredInvitations.length === 0) {
      console.log('ℹ️  삭제할 만료된 초대 코드가 없습니다.');
      return { deleted: 0, invitations: [] };
    }
    
    // 만료된 초대 코드 삭제
    const result = await prisma.teamInvitation.deleteMany({
      where: {
        expiresAt: {
          lt: now
        },
        isUsed: false
      }
    });
    
    console.log(`✅ ${result.count}개의 만료된 초대 코드 삭제 완료`);
    
    // 삭제 내역 로그
    expiredInvitations.forEach(inv => {
      console.log(`  - ${inv.inviteCode} (${inv.company.name}, 만료일: ${inv.expiresAt.toISOString().split('T')[0]})`);
    });
    
    return {
      deleted: result.count,
      invitations: expiredInvitations.map(inv => ({
        inviteCode: inv.inviteCode,
        companyName: inv.company.name,
        bizNo: inv.company.bizNo,
        inviteeName: inv.inviteeName,
        inviteePhone: inv.inviteePhone,
        expiresAt: inv.expiresAt,
        createdAt: inv.createdAt
      }))
    };
  } catch (error) {
    console.error('❌ 만료된 초대 코드 삭제 중 오류 발생:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// 직접 실행 시 (Cron Job)
if (import.meta.url === `file://${process.argv[1]}`) {
  cleanupExpiredInvitations()
    .then(result => {
      console.log('\n====================================');
      console.log('📊 정리 완료 요약');
      console.log('====================================');
      console.log(`삭제된 초대 코드: ${result.deleted}개`);
      if (result.deleted > 0) {
        console.log('\n삭제된 초대 코드 목록:');
        result.invitations.forEach((inv, idx) => {
          console.log(`${idx + 1}. ${inv.inviteCode} - ${inv.companyName} (${inv.inviteeName}님, 만료: ${inv.expiresAt.toISOString().split('T')[0]})`);
        });
      }
      console.log('====================================\n');
      process.exit(0);
    })
    .catch(error => {
      console.error('Cleanup failed:', error);
      process.exit(1);
    });
}
