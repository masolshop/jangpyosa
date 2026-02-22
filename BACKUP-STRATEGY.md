# 장표사닷컴 백업 및 복구 전략

## 📊 현재 백엔드 구동 상태

### 시스템 아키텍처
- **서버**: AWS EC2 (Ubuntu) - jangpyosa.com
- **프로세스 관리**: PM2 (fork mode)
- **백엔드 API**: Express + TypeScript (포트 4000)
- **프론트엔드**: Next.js (포트 3003)
- **데이터베이스**: SQLite 3 (Prisma ORM)

### 실행 중인 서비스
```bash
┌─────┬────────────────────┬────────┬─────────┬─────────┐
│ id  │ name              │ mode   │ status  │ restart │
├─────┼────────────────────┼────────┼─────────┼─────────┤
│ 3   │ jangpyosa-api     │ fork   │ online  │ 19      │
│ 1   │ jangpyosa-web     │ fork   │ online  │ 1       │
└─────┴────────────────────┴────────┴─────────┴─────────┘
```

### 데이터베이스 상태
- **현재 DB**: `/home/ubuntu/jangpyosa/apps/api/prisma/dev.db` (496 KB)
- **기존 백업**: `dev.db.backup-20260221-195800` (844 KB)
- **백업 날짜**: 2026년 2월 21일 19:58:00

---

## 🔴 현재 문제점

### 1. 데이터베이스 백업 체계 부재
- ❌ **자동 백업 미설정**: 현재 수동 백업만 존재
- ❌ **백업 주기 없음**: 정기적인 백업 스케줄 미운영
- ❌ **증분 백업 미구현**: 전체 백업만 수행
- ❌ **원격 저장소 미연동**: 로컬 서버에만 백업 보관 (서버 장애 시 데이터 손실 위험)

### 2. 단일 장애점 (Single Point of Failure)
- ⚠️ **SQLite 파일 기반**: 파일 손상 시 전체 데이터 손실
- ⚠️ **로컬 저장**: 서버 디스크 장애 시 복구 불가능
- ⚠️ **레플리케이션 없음**: 실시간 데이터 복제 미구현

### 3. 트랜잭션 로그 부재
- ⚠️ WAL(Write-Ahead Logging) 모드 미확인
- ⚠️ 특정 시점 복구(Point-in-Time Recovery) 불가능

---

## ✅ 권장 백업 전략

### 🔹 단기 조치 (즉시 구현 가능)

#### 1. 자동 백업 스크립트 설정
```bash
#!/bin/bash
# /home/ubuntu/scripts/backup-db.sh

BACKUP_DIR="/home/ubuntu/backups/jangpyosa"
TIMESTAMP=$(TZ='Asia/Seoul' date +%Y%m%d-%H%M%S)
DB_PATH="/home/ubuntu/jangpyosa/apps/api/prisma/dev.db"

# 백업 디렉토리 생성
mkdir -p "$BACKUP_DIR"

# SQLite 백업 (온라인 백업)
sqlite3 "$DB_PATH" ".backup '$BACKUP_DIR/dev.db.backup-$TIMESTAMP'"

# 압축 백업
gzip "$BACKUP_DIR/dev.db.backup-$TIMESTAMP"

# 30일 이상 된 백업 파일 삭제
find "$BACKUP_DIR" -name "*.gz" -mtime +30 -delete

echo "$(TZ='Asia/Seoul' date '+%Y-%m-%d %H:%M:%S KST') - 백업 완료: dev.db.backup-$TIMESTAMP.gz"
```

#### 2. Cron Job 등록 (매일 새벽 3시)
```bash
# crontab -e
0 3 * * * /home/ubuntu/scripts/backup-db.sh >> /var/log/jangpyosa-backup.log 2>&1
```

#### 3. 매시간 증분 백업 (WAL 모드 활성화)
```sql
-- Prisma Client로 실행 또는 직접 SQLite CLI에서 실행
PRAGMA journal_mode=WAL;
PRAGMA synchronous=NORMAL;
```

```bash
# 매시간 WAL 파일 백업
0 * * * * cp /home/ubuntu/jangpyosa/apps/api/prisma/dev.db-wal /home/ubuntu/backups/jangpyosa/wal-$(TZ='Asia/Seoul' date +\%Y\%m\%d-\%H\%M\%S).wal 2>/dev/null
```

---

### 🔹 중기 조치 (1주일 이내)

#### 1. AWS S3 자동 업로드
```bash
#!/bin/bash
# S3 백업 스크립트

BACKUP_FILE="/home/ubuntu/backups/jangpyosa/dev.db.backup-$TIMESTAMP.gz"
S3_BUCKET="s3://jangpyosa-backups"

# S3로 업로드
aws s3 cp "$BACKUP_FILE" "$S3_BUCKET/daily/" --storage-class STANDARD_IA

# 90일 이상 된 S3 백업은 Glacier로 이동 (Lifecycle Policy 설정)
```

#### 2. GitHub Actions 자동 백업
```yaml
# .github/workflows/db-backup.yml
name: Database Backup
on:
  schedule:
    - cron: '0 3 * * *'  # 매일 새벽 3시 (UTC 18:00 = KST 03:00)
  workflow_dispatch:

jobs:
  backup:
    runs-on: ubuntu-latest
    steps:
      - name: SSH and Backup
        uses: appleboy/ssh-action@master
        with:
          host: jangpyosa.com
          username: ubuntu
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            /home/ubuntu/scripts/backup-db.sh
            aws s3 cp /home/ubuntu/backups/jangpyosa/*.gz s3://jangpyosa-backups/
```

#### 3. Prisma Migrate 기록 보관
```bash
# migrations 디렉토리를 Git에 커밋하여 스키마 변경 이력 보존
cd /home/ubuntu/jangpyosa/apps/api/prisma
git add migrations/
git commit -m "📝 Prisma 마이그레이션 기록 보존"
```

---

### 🔹 장기 조치 (1개월 이내)

#### 1. PostgreSQL 또는 MySQL 마이그레이션
**현재 SQLite의 한계:**
- 동시 쓰기 성능 제한
- 파일 손상 취약성
- 레플리케이션 부재

**권장 데이터베이스:**
- **AWS RDS PostgreSQL**: 자동 백업, Multi-AZ 복제, Point-in-Time Recovery
- **Supabase PostgreSQL**: 실시간 복제, REST API, 무료 플랜
- **PlanetScale MySQL**: 브랜치 기반 스키마 관리, 자동 백업

#### 2. Litestream 도입 (SQLite 실시간 복제)
```bash
# Litestream 설치
wget https://github.com/benbjohnson/litestream/releases/download/v0.3.13/litestream-v0.3.13-linux-amd64.tar.gz
tar -xzf litestream-v0.3.13-linux-amd64.tar.gz
sudo mv litestream /usr/local/bin/

# litestream.yml 설정
dbs:
  - path: /home/ubuntu/jangpyosa/apps/api/prisma/dev.db
    replicas:
      - type: s3
        bucket: jangpyosa-litestream
        path: db
        region: ap-northeast-2
        retention: 720h  # 30일 보관

# Systemd 서비스로 등록
sudo systemctl enable litestream
sudo systemctl start litestream
```

#### 3. 모니터링 및 알림
```bash
# 백업 실패 시 이메일 알림
BACKUP_STATUS=$?
if [ $BACKUP_STATUS -ne 0 ]; then
    echo "백업 실패" | mail -s "장표사 DB 백업 실패 알림" admin@jangpyosa.com
fi
```

---

## 📝 복구 절차

### 1. 최신 백업에서 복구
```bash
# 서비스 중지
pm2 stop jangpyosa-api

# 백업 파일 압축 해제
gunzip /home/ubuntu/backups/jangpyosa/dev.db.backup-YYYYMMDD-HHMMSS.gz

# 기존 DB 백업 (안전 조치)
mv /home/ubuntu/jangpyosa/apps/api/prisma/dev.db /home/ubuntu/jangpyosa/apps/api/prisma/dev.db.old

# 백업 파일 복원
cp /home/ubuntu/backups/jangpyosa/dev.db.backup-YYYYMMDD-HHMMSS /home/ubuntu/jangpyosa/apps/api/prisma/dev.db

# 권한 설정
chown ubuntu:ubuntu /home/ubuntu/jangpyosa/apps/api/prisma/dev.db
chmod 664 /home/ubuntu/jangpyosa/apps/api/prisma/dev.db

# 서비스 재시작
pm2 restart jangpyosa-api

# 검증
curl https://jangpyosa.com/api/calculators/levy \
  -H "Content-Type: application/json" \
  -d '{"year":2026,"employeeCount":1000,"disabledCount":10,"companyType":"PRIVATE"}'
```

### 2. S3에서 복구
```bash
# S3에서 최신 백업 다운로드
aws s3 cp s3://jangpyosa-backups/daily/dev.db.backup-LATEST.gz /tmp/

# 압축 해제 및 복원
gunzip /tmp/dev.db.backup-LATEST.gz
cp /tmp/dev.db.backup-LATEST /home/ubuntu/jangpyosa/apps/api/prisma/dev.db

# 서비스 재시작
pm2 restart jangpyosa-api
```

---

## 🚨 긴급 상황 대응

### 시나리오 1: 서버 전체 장애
1. **즉시 조치**: S3에서 최신 백업 다운로드
2. **새 서버 구축**: EC2 인스턴스 생성 및 환경 설정
3. **코드 배포**: `git clone https://github.com/masolshop/jangpyosa.git`
4. **DB 복원**: S3 백업 파일 복사
5. **서비스 시작**: PM2로 API 및 웹 서버 실행

### 시나리오 2: 데이터 손상 발견
1. **즉시 서비스 중지**: `pm2 stop jangpyosa-api`
2. **손상 범위 확인**: SQLite integrity check
3. **최근 정상 백업 복원**: 시간 역순으로 백업 테스트
4. **데이터 검증**: 주요 테이블 레코드 수 확인
5. **서비스 재개**: 검증 완료 후 재시작

---

## 📊 백업 체크리스트

### 일일 확인 사항
- [ ] 자동 백업 실행 확인 (`/var/log/jangpyosa-backup.log`)
- [ ] 백업 파일 크기 정상 여부 확인
- [ ] 디스크 용량 확인 (`df -h`)

### 주간 확인 사항
- [ ] S3 백업 업로드 확인
- [ ] 백업 파일 복원 테스트 (스테이징 환경)
- [ ] PM2 프로세스 재시작 횟수 확인

### 월간 확인 사항
- [ ] 전체 복구 테스트 (DR 훈련)
- [ ] 백업 보관 정책 점검
- [ ] 디스크 공간 정리 (30일 이상 된 로컬 백업 삭제)

---

## 🎯 구현 우선순위

### 1단계 (즉시): 기본 백업 체계 구축
- ✅ 자동 백업 스크립트 작성
- ✅ Cron Job 등록 (매일 새벽 3시)
- ✅ 백업 복원 절차 문서화

### 2단계 (1주일): 원격 백업 구축
- ⏳ AWS S3 버킷 생성 및 권한 설정
- ⏳ S3 자동 업로드 스크립트 추가
- ⏳ GitHub Actions 백업 워크플로우 구성

### 3단계 (1개월): 고가용성 구축
- 📋 Litestream 실시간 복제 설정
- 📋 모니터링 및 알림 시스템 구축
- 📋 PostgreSQL 마이그레이션 검토

---

## 📌 관련 문서
- [FINAL-REPORT.md](./FINAL-REPORT.md) - 2026년 업데이트 최종 보고서
- [DEPLOYMENT-2026-02-22.md](./DEPLOYMENT-2026-02-22.md) - 배포 완료 보고서
- [KST-GUIDE.md](./KST-GUIDE.md) - 한국 시간 적용 가이드

---

**작성일**: 2026-02-22  
**작성자**: AI Developer  
**최종 수정**: 2026-02-22
