#!/bin/bash
##############################################
# 장표사닷컴 데이터베이스 복구 스크립트
# 작성일: 2026-02-22
# 사용법: ./restore-db.sh [백업파일명]
##############################################

# 설정
BACKUP_DIR="/home/ubuntu/backups/jangpyosa"
DB_PATH="/home/ubuntu/jangpyosa/apps/api/prisma/dev.db"
LOG_FILE="/var/log/jangpyosa-restore.log"

# 로그 함수
log() {
    echo "$(TZ='Asia/Seoul' date '+%Y-%m-%d %H:%M:%S KST') - $1" | tee -a "$LOG_FILE"
}

# 에러 핸들링
set -e
trap 'log "❌ 복구 실패: $BASH_COMMAND"' ERR

# 시작
log "========================================="
log "🔄 데이터베이스 복구 시작"

# 백업 파일 확인
if [ -z "$1" ]; then
    # 인자가 없으면 최신 백업 파일 자동 선택
    LATEST_BACKUP=$(ls -t "$BACKUP_DIR"/*.gz | head -1)
    if [ -z "$LATEST_BACKUP" ]; then
        log "❌ 백업 파일을 찾을 수 없습니다"
        exit 1
    fi
    BACKUP_FILE="$LATEST_BACKUP"
    log "ℹ️  최신 백업 파일 선택: $(basename $BACKUP_FILE)"
else
    # 인자로 받은 파일명 사용
    if [[ "$1" != *.gz ]]; then
        BACKUP_FILE="$BACKUP_DIR/$1.gz"
    else
        BACKUP_FILE="$BACKUP_DIR/$1"
    fi
    
    if [ ! -f "$BACKUP_FILE" ]; then
        log "❌ 백업 파일을 찾을 수 없습니다: $BACKUP_FILE"
        log "ℹ️  사용 가능한 백업 파일 목록:"
        ls -lh "$BACKUP_DIR"/*.gz | awk '{print "   ", $9, "("$5")"}'
        exit 1
    fi
    log "ℹ️  백업 파일 선택: $(basename $BACKUP_FILE)"
fi

# PM2로 API 서비스 중지
log "🛑 API 서비스 중지 중..."
pm2 stop jangpyosa-api || log "⚠️  API 서비스가 이미 중지되어 있습니다"

# 현재 DB 백업 (안전 조치)
SAFETY_BACKUP="$DB_PATH.before-restore-$(TZ='Asia/Seoul' date +%Y%m%d-%H%M%S)"
log "💾 현재 DB 안전 백업 중..."
cp "$DB_PATH" "$SAFETY_BACKUP" || log "⚠️  현재 DB 백업 실패 (파일이 없을 수 있음)"

if [ -f "$SAFETY_BACKUP" ]; then
    SAFETY_SIZE=$(du -h "$SAFETY_BACKUP" | cut -f1)
    log "✅ 안전 백업 완료: $SAFETY_SIZE"
fi

# 백업 파일 압축 해제
log "📦 백업 파일 압축 해제 중..."
TEMP_DB="/tmp/jangpyosa-restore-$(TZ='Asia/Seoul' date +%Y%m%d-%H%M%S).db"
gunzip -c "$BACKUP_FILE" > "$TEMP_DB"

RESTORED_SIZE=$(du -h "$TEMP_DB" | cut -f1)
log "✅ 압축 해제 완료: $RESTORED_SIZE"

# 복원된 DB 무결성 검사
log "🔍 복원된 DB 무결성 검사 중..."
INTEGRITY_CHECK=$(sqlite3 "$TEMP_DB" "PRAGMA integrity_check;" 2>&1)

if [ "$INTEGRITY_CHECK" != "ok" ]; then
    log "❌ DB 무결성 검사 실패: $INTEGRITY_CHECK"
    log "⚠️  복구를 중단합니다. 안전 백업: $SAFETY_BACKUP"
    rm -f "$TEMP_DB"
    exit 1
fi

log "✅ 무결성 검사 통과"

# DB 파일 교체
log "🔄 DB 파일 교체 중..."
rm -f "$DB_PATH"
mv "$TEMP_DB" "$DB_PATH"

# 권한 설정
chown ubuntu:ubuntu "$DB_PATH"
chmod 664 "$DB_PATH"
log "✅ DB 파일 권한 설정 완료"

# WAL 및 SHM 파일 삭제 (깨끗한 상태로 시작)
rm -f "${DB_PATH}-wal" "${DB_PATH}-shm"
log "🗑️  WAL/SHM 파일 삭제 완료"

# API 서비스 재시작
log "🚀 API 서비스 재시작 중..."
pm2 restart jangpyosa-api

# 대기 (서비스 시작 대기)
sleep 5

# 서비스 상태 확인
if pm2 list | grep -q "jangpyosa-api.*online"; then
    log "✅ API 서비스 정상 재시작"
else
    log "❌ API 서비스 재시작 실패"
    log "⚠️  안전 백업에서 복구를 시도하세요: $SAFETY_BACKUP"
    exit 1
fi

# API 엔드포인트 테스트
log "🧪 API 엔드포인트 테스트 중..."
sleep 3

API_TEST=$(curl -s -X POST https://jangpyosa.com/api/calculators/levy \
    -H "Content-Type: application/json" \
    -d '{"year":2026,"employeeCount":1000,"disabledCount":10,"companyType":"PRIVATE"}' \
    | jq -r '.ok' 2>/dev/null || echo "false")

if [ "$API_TEST" == "true" ]; then
    log "✅ API 정상 작동 확인"
else
    log "⚠️  API 테스트 실패 - 수동 확인 필요"
fi

# 완료
log "========================================="
log "✅ 데이터베이스 복구 완료"
log "📁 복구된 백업: $(basename $BACKUP_FILE)"
log "📁 안전 백업: $SAFETY_BACKUP"
log "========================================="

exit 0
