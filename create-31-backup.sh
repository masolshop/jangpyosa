#!/bin/bash

# 3.1절 기념 장표사닷컴 백업 스크립트
# 2026년 3월 1일 - 제107주년 3·1절 기념

BACKUP_DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="장표사닷컴-31절기념-${BACKUP_DATE}"
BACKUP_DIR="/home/user/webapp-backup"
BACKUP_FILE="${BACKUP_DIR}/${BACKUP_NAME}.tar.gz"

echo "=========================================="
echo "🇰🇷 3.1절 기념 백업 시작"
echo "=========================================="
echo "날짜: $(date '+%Y년 %m월 %d일 %H시 %M분 %S초')"
echo "백업명: ${BACKUP_NAME}"
echo ""

# 백업 디렉토리 생성
mkdir -p "${BACKUP_DIR}"

# 제외할 디렉토리 목록
EXCLUDE_DIRS=(
  "node_modules"
  ".next"
  "dist"
  "build"
  ".git/objects"
  ".git/logs"
  "coverage"
  ".cache"
  "tmp"
  ".DS_Store"
)

# 백업 생성
echo "📦 압축 중..."
cd /home/user

tar -czf "${BACKUP_FILE}" \
  --exclude="webapp/node_modules" \
  --exclude="webapp/**/node_modules" \
  --exclude="webapp/.next" \
  --exclude="webapp/**/dist" \
  --exclude="webapp/**/build" \
  --exclude="webapp/.git/objects" \
  --exclude="webapp/.git/logs" \
  --exclude="webapp/coverage" \
  --exclude="webapp/**/.cache" \
  webapp/

if [ $? -eq 0 ]; then
  BACKUP_SIZE=$(du -h "${BACKUP_FILE}" | cut -f1)
  echo ""
  echo "✅ 백업 완료!"
  echo "파일: ${BACKUP_FILE}"
  echo "크기: ${BACKUP_SIZE}"
  echo ""
  
  # 백업 파일 목록
  echo "📋 백업 내용:"
  tar -tzf "${BACKUP_FILE}" | head -20
  echo "..."
  echo "(총 $(tar -tzf "${BACKUP_FILE}" | wc -l) 개 파일)"
  echo ""
  
  # 백업 검증
  echo "🔍 백업 파일 검증 중..."
  if tar -tzf "${BACKUP_FILE}" > /dev/null 2>&1; then
    echo "✅ 백업 파일이 정상입니다."
  else
    echo "❌ 백업 파일에 오류가 있습니다."
    exit 1
  fi
  
else
  echo "❌ 백업 실패!"
  exit 1
fi

echo ""
echo "=========================================="
echo "🇰🇷 3.1 독립운동 정신을 기리며"
echo "=========================================="
echo "1919년 3월 1일, 대한민국 임시정부 수립"
echo "2026년 3월 1일, 장표사닷컴 시스템 백업"
echo ""
echo "대한민국 만세! 🇰🇷"
echo "=========================================="

