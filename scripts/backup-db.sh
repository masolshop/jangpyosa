#!/bin/bash
##############################################
# 장표사닷컴 데이터베이스 자동 백업 스크립트
# 작성일: 2026-02-22
# 설명: SQLite 온라인 백업 및 압축
##############################################

# 설정
BACKUP_DIR="/home/ubuntu/backups/jangpyosa"
TIMESTAMP=$(TZ='Asia/Seoul' date +%Y%m%d-%H%M%S)
DB_PATH="/home/ubuntu/jangpyosa/apps/api/prisma/dev.db"
BACKUP_FILE="$BACKUP_DIR/dev.db.backup-$TIMESTAMP"
LOG_FILE="/var/log/jangpyosa-backup.log"

# 로그 함수
log() {
    echo "$(TZ='Asia/Seoul' date '+%Y-%m-%d %H:%M:%S KST') - $1" | tee -a "$LOG_FILE"
}

# 에러 핸들링
set -e
trap 'log "❌ 백업 실패: $BASH_COMMAND"' ERR

# 시작
log "========================================="
log "🔄 데이터베이스 백업 시작"

# 백업 디렉토리 생성
mkdir -p "$BACKUP_DIR"

# DB 파일 존재 확인
if [ ! -f "$DB_PATH" ]; then
    log "❌ 데이터베이스 파일을 찾을 수 없습니다: $DB_PATH"
    exit 1
fi

# 현재 DB 크기 확인
DB_SIZE=$(du -h "$DB_PATH" | cut -f1)
log "📊 현재 DB 크기: $DB_SIZE"

# SQLite 온라인 백업 (서비스 중단 없이 백업)
log "💾 백업 수행 중..."
sqlite3 "$DB_PATH" ".backup '$BACKUP_FILE'"

# 백업 파일 검증
if [ ! -f "$BACKUP_FILE" ]; then
    log "❌ 백업 파일 생성 실패"
    exit 1
fi

BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
log "✅ 백업 파일 생성 완료: $BACKUP_SIZE"

# 압축
log "📦 백업 파일 압축 중..."
gzip "$BACKUP_FILE"

if [ ! -f "$BACKUP_FILE.gz" ]; then
    log "❌ 압축 파일 생성 실패"
    exit 1
fi

COMPRESSED_SIZE=$(du -h "$BACKUP_FILE.gz" | cut -f1)
log "✅ 압축 완료: $COMPRESSED_SIZE"

# 백업 파일 무결성 검사
log "🔍 백업 파일 무결성 검사 중..."
gunzip -t "$BACKUP_FILE.gz"
log "✅ 무결성 검사 통과"

# 30일 이상 된 로컬 백업 파일 삭제
log "🗑️  오래된 백업 파일 정리 중..."
OLD_BACKUPS=$(find "$BACKUP_DIR" -name "*.gz" -mtime +30)
if [ -n "$OLD_BACKUPS" ]; then
    find "$BACKUP_DIR" -name "*.gz" -mtime +30 -delete
    log "✅ $(echo "$OLD_BACKUPS" | wc -l)개의 오래된 백업 파일 삭제 완료"
else
    log "ℹ️  삭제할 오래된 백업 파일 없음"
fi

# 현재 백업 파일 목록
BACKUP_COUNT=$(ls -1 "$BACKUP_DIR"/*.gz 2>/dev/null | wc -l)
log "📋 현재 보관 중인 백업 파일: ${BACKUP_COUNT}개"

# 디스크 용량 확인
DISK_USAGE=$(df -h /home/ubuntu | awk 'NR==2 {print $5}')
log "💿 디스크 사용량: $DISK_USAGE"

# 완료
log "✅ 데이터베이스 백업 완료"
log "📁 백업 파일: $BACKUP_FILE.gz"
log "========================================="

exit 0
