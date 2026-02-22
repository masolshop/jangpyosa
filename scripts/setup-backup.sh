#!/bin/bash
##############################################
# 장표사닷컴 백업 시스템 설치 스크립트
# 작성일: 2026-02-22
# 설명: 백업 스크립트 및 Cron Job 자동 설치
##############################################

set -e

echo "========================================="
echo "🔧 장표사닷컴 백업 시스템 설치"
echo "========================================="

# 현재 사용자 확인
if [ "$EUID" -eq 0 ]; then 
    echo "⚠️  root 권한으로 실행 중입니다. ubuntu 사용자로 전환하세요."
    exit 1
fi

# 디렉토리 생성
echo "📁 백업 디렉토리 생성 중..."
mkdir -p /home/ubuntu/backups/jangpyosa
mkdir -p /home/ubuntu/scripts

# 백업 스크립트 복사
echo "📄 백업 스크립트 설치 중..."
cp /home/ubuntu/jangpyosa/scripts/backup-db.sh /home/ubuntu/scripts/
cp /home/ubuntu/jangpyosa/scripts/restore-db.sh /home/ubuntu/scripts/

# 실행 권한 부여
chmod +x /home/ubuntu/scripts/backup-db.sh
chmod +x /home/ubuntu/scripts/restore-db.sh

echo "✅ 스크립트 설치 완료"
echo "   - /home/ubuntu/scripts/backup-db.sh"
echo "   - /home/ubuntu/scripts/restore-db.sh"

# 로그 파일 생성
echo "📝 로그 파일 생성 중..."
sudo touch /var/log/jangpyosa-backup.log
sudo chown ubuntu:ubuntu /var/log/jangpyosa-backup.log
sudo touch /var/log/jangpyosa-restore.log
sudo chown ubuntu:ubuntu /var/log/jangpyosa-restore.log

echo "✅ 로그 파일 생성 완료"

# Cron Job 등록 확인
echo ""
echo "📅 Cron Job 등록 확인 중..."
CRON_EXISTS=$(crontab -l 2>/dev/null | grep -c "backup-db.sh" || true)

if [ "$CRON_EXISTS" -eq 0 ]; then
    echo "⚙️  Cron Job 등록 중..."
    
    # 기존 crontab 백업
    crontab -l > /tmp/crontab.backup 2>/dev/null || true
    
    # 새 crontab 항목 추가
    (crontab -l 2>/dev/null; echo "# 장표사닷컴 DB 백업 (매일 새벽 3시)") | crontab -
    (crontab -l 2>/dev/null; echo "0 3 * * * /home/ubuntu/scripts/backup-db.sh >> /var/log/jangpyosa-backup.log 2>&1") | crontab -
    
    echo "✅ Cron Job 등록 완료 (매일 새벽 3시)"
else
    echo "ℹ️  Cron Job이 이미 등록되어 있습니다"
fi

# 등록된 Cron Job 확인
echo ""
echo "📋 등록된 Cron Job 목록:"
crontab -l | grep -A1 "장표사" || echo "   (항목 없음)"

# 테스트 백업 실행
echo ""
echo "🧪 테스트 백업 실행 중..."
/home/ubuntu/scripts/backup-db.sh

if [ $? -eq 0 ]; then
    echo "✅ 테스트 백업 성공"
    
    # 백업 파일 목록 출력
    echo ""
    echo "📋 생성된 백업 파일:"
    ls -lh /home/ubuntu/backups/jangpyosa/*.gz 2>/dev/null | tail -3 | awk '{print "   ", $9, "("$5")"}'
else
    echo "❌ 테스트 백업 실패 - 로그를 확인하세요:"
    echo "   tail -20 /var/log/jangpyosa-backup.log"
fi

# 완료
echo ""
echo "========================================="
echo "✅ 백업 시스템 설치 완료"
echo "========================================="
echo ""
echo "📖 사용 방법:"
echo "   백업 실행: /home/ubuntu/scripts/backup-db.sh"
echo "   복구 실행: /home/ubuntu/scripts/restore-db.sh [백업파일명]"
echo "   로그 확인: tail -f /var/log/jangpyosa-backup.log"
echo ""
echo "⏰ 자동 백업: 매일 새벽 3시 (KST)"
echo "📁 백업 위치: /home/ubuntu/backups/jangpyosa/"
echo "🗑️  보관 기간: 30일"
echo ""

exit 0
