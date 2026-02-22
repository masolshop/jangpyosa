import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * 한국 시간(KST) 가져오기
 */
function getKSTNow() {
  const KST_OFFSET = 9 * 60 * 60 * 1000; // UTC+9
  return new Date(Date.now() + KST_OFFSET);
}

/**
 * 만료된 초대 코드 자동 삭제 (한국 시간 기준)
 * - 만료일이 지난 초대 코드를 자동으로 삭제합니다
 * - Cron Job으로 매일 실행 권장
 */
export async function cleanupExpiredInvitations() {
  try {
    console.log('🗑️  만료된 초대 코드 정리 시작 (한국 시간 기준)...');
    
    const kstNow = getKSTNow();
    console.log(`📅 현재 한국 시간: ${kstNow.toISOString().replace('T', ' ').replace('Z', '').substring(0, 19)} KST`);
    
    // 만료된 초대 코드 조회
    const expiredInvitations = await prisma.teamInvitation.findMany({
      where: {
        expiresAt: {
          lt: kstNow // 만료일이 현재 한국 시간보다 이전
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
          lt: kstNow
        },
        isUsed: false
      }
    });
    
    console.log(`✅ ${result.count}개의 만료된 초대 코드 삭제 완료 (한국 시간 기준)`);
    
    // 삭제 내역 로그
    expiredInvitations.forEach(inv => {
      const expiresAtKST = new Date(inv.expiresAt.getTime() + 9 * 60 * 60 * 1000);
      console.log(`  - ${inv.inviteCode} (${inv.company.name}, 만료일: ${expiresAtKST.toISOString().split('T')[0]} KST)`);
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
      console.log('📊 정리 완료 요약 (한국 시간 기준)');
      console.log('====================================');
      console.log(`삭제된 초대 코드: ${result.deleted}개`);
      if (result.deleted > 0) {
        console.log('\n삭제된 초대 코드 목록:');
        result.invitations.forEach((inv, idx) => {
          const expiresAtKST = new Date(inv.expiresAt.getTime() + 9 * 60 * 60 * 1000);
          console.log(`${idx + 1}. ${inv.inviteCode} - ${inv.companyName} (${inv.inviteeName}님, 만료: ${expiresAtKST.toISOString().split('T')[0]} KST)`);
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
