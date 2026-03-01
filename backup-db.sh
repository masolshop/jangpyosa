#!/bin/bash

# 🔐 장표표준사업장 DB 백업 스크립트
# 작성: 2026-03-01
# 목적: 매일 자동 백업 및 보관

set -e

# 백업 설정
BACKUP_DIR="/home/ubuntu/jangpyosa-backups"
DB_PATH="/home/ubuntu/jangpyosa/apps/api/prisma/dev.db"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DATE_ONLY=$(date +%Y-%m-%d)
BACKUP_FILE="$BACKUP_DIR/dev.db.$DATE_ONLY-$TIMESTAMP.backup"
RETENTION_DAYS=30

# 백업 디렉토리 생성
mkdir -p "$BACKUP_DIR"

echo "🔄 백업 시작: $TIMESTAMP"
echo "   - 원본 DB: $DB_PATH"
echo "   - 백업 파일: $BACKUP_FILE"

# DB 파일 존재 확인
if [ ! -f "$DB_PATH" ]; then
    echo "❌ 에러: DB 파일을 찾을 수 없습니다: $DB_PATH"
    exit 1
fi

# SQLite 백업 (온라인 백업)
sqlite3 "$DB_PATH" ".backup '$BACKUP_FILE'"

if [ $? -eq 0 ]; then
    echo "✅ 백업 완료!"
    
    # 파일 크기 확인
    BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    echo "   - 백업 크기: $BACKUP_SIZE"
    
    # 압축 (gzip)
    gzip "$BACKUP_FILE"
    COMPRESSED_FILE="$BACKUP_FILE.gz"
    COMPRESSED_SIZE=$(du -h "$COMPRESSED_FILE" | cut -f1)
    echo "   - 압축 파일: $COMPRESSED_FILE"
    echo "   - 압축 크기: $COMPRESSED_SIZE"
    
    # 백업 데이터 통계 생성
    STATS_FILE="$BACKUP_DIR/backup-stats-$DATE_ONLY.txt"
    echo "=== 백업 통계 ===" > "$STATS_FILE"
    echo "날짜: $TIMESTAMP" >> "$STATS_FILE"
    echo "원본 크기: $BACKUP_SIZE" >> "$STATS_FILE"
    echo "압축 크기: $COMPRESSED_SIZE" >> "$STATS_FILE"
    echo "" >> "$STATS_FILE"
    
    # DB 통계 조회
    sqlite3 "$DB_PATH" <<EOF >> "$STATS_FILE"
.mode column
SELECT '총 데이터 통계:' as title;
SELECT 
  (SELECT COUNT(*) FROM Company) as Companies,
  (SELECT COUNT(*) FROM User) as Users,
  (SELECT COUNT(*) FROM DisabledEmployee) as DisabledEmployees,
  (SELECT COUNT(*) FROM CompanyAnnouncement) as Announcements,
  (SELECT COUNT(*) FROM WorkOrder) as WorkOrders,
  (SELECT COUNT(*) FROM AttendanceRecord) as AttendanceRecords,
  (SELECT COUNT(*) FROM LeaveRequest) as LeaveRequests,
  (SELECT COUNT(*) FROM LeaveType) as LeaveTypes;
EOF
    
    echo "   - 통계 파일: $STATS_FILE"
    
    # 오래된 백업 삭제 (30일 이상)
    echo ""
    echo "🧹 오래된 백업 정리 중..."
    find "$BACKUP_DIR" -name "dev.db.*.backup.gz" -mtime +$RETENTION_DAYS -delete
    find "$BACKUP_DIR" -name "backup-stats-*.txt" -mtime +$RETENTION_DAYS -delete
    
    REMAINING_BACKUPS=$(ls -1 "$BACKUP_DIR"/dev.db.*.backup.gz 2>/dev/null | wc -l)
    echo "   - 보관 중인 백업: $REMAINING_BACKUPS개"
    
    # 최근 3개 백업 리스트
    echo ""
    echo "📦 최근 백업 목록:"
    ls -lh "$BACKUP_DIR"/dev.db.*.backup.gz 2>/dev/null | tail -3 | awk '{print "   - " $9 " (" $5 ")"}'
    
    echo ""
    echo "✅ 백업 프로세스 완료!"
else
    echo "❌ 백업 실패!"
    exit 1
fi
