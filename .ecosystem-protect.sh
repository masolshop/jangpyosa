#!/bin/bash
# APICK 설정 보호 스크립트

echo "🔒 APICK 설정 보호 확인..."

# 1. ecosystem.config.js 백업
BACKUP_DIR="/home/ubuntu/jangpyosa-backups/ecosystem"
mkdir -p $BACKUP_DIR
cp ecosystem.config.js $BACKUP_DIR/ecosystem.config.js.$(date +%Y%m%d-%H%M%S).backup

# 2. 설정 확인
if grep -q 'APICK_PROVIDER: "real"' ecosystem.config.js && grep -q '41173030f4fc1055778b2f97ce9659b5' ecosystem.config.js; then
    echo "✅ APICK 설정 정상: 실제 API 사용 중"
else
    echo "❌ 경고: APICK 설정이 변경되었습니다!"
    echo "복구 방법: git show 8b57393:ecosystem.config.js > ecosystem.config.js"
    exit 1
fi

# 3. 백업 개수 제한 (최근 10개만 유지)
cd $BACKUP_DIR
ls -t ecosystem.config.js.*.backup | tail -n +11 | xargs rm -f 2>/dev/null

echo "🔒 보호 조치 완료"
echo "📦 백업 위치: $BACKUP_DIR"
ls -lht $BACKUP_DIR | head -5
