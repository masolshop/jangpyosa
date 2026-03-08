# 🚨 긴급 복구 매뉴얼 (Emergency Recovery Guide)

## 📋 목차
1. [서버 완전 장애 시 복구](#1-서버-완전-장애-시-복구)
2. [코드만 복구 (서버는 정상)](#2-코드만-복구-서버는-정상)
3. [특정 파일만 복구](#3-특정-파일만-복구)
4. [데이터베이스 복구](#4-데이터베이스-복구)
5. [환경 변수 복구](#5-환경-변수-복구)

---

## 1. 서버 완전 장애 시 복구

### 시나리오: 서버가 완전히 날아간 경우 (새 서버 구축)

```bash
# 1) 새 서버에 SSH 접속
ssh -i lightsail_key.pem ubuntu@NEW_SERVER_IP

# 2) 기본 패키지 설치
sudo apt update && sudo apt upgrade -y
sudo apt install -y git curl build-essential

# 3) Node.js 설치 (v20.x)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 4) PM2 설치
sudo npm install -g pm2

# 5) GitHub에서 전체 코드 복제
cd /home/ubuntu
git clone https://github.com/masolshop/jangpyosa.git
cd jangpyosa

# 6) Git 인증 설정 (Token 사용)
git config --global credential.helper store
git remote set-url origin https://YOUR_GITHUB_TOKEN@github.com/masolshop/jangpyosa.git

# 7) 환경 변수 파일 생성 (백업에서 복사 또는 수동 입력)
nano .env
nano apps/api/.env
nano apps/web/.env.local

# 8) 의존성 설치
npm install
cd apps/api && npm install && cd ../..
cd apps/web && npm install && cd ../..

# 9) 데이터베이스 복구 (백업에서)
# 옵션 A: 백업 파일에서 복구
cp /path/to/backup/dev.db apps/api/prisma/dev.db

# 옵션 B: Prisma 마이그레이션으로 새로 생성
cd apps/api
npx prisma migrate deploy
npx prisma db push
cd ../..

# 10) 빌드
npm run build

# 11) PM2로 서비스 시작
pm2 start ecosystem.config.js
pm2 save
pm2 startup  # 부팅 시 자동 시작 설정

# 12) Nginx 설정 (필요 시)
sudo apt install -y nginx
sudo nano /etc/nginx/sites-available/jangpyosa
# (기존 설정 복사)
sudo ln -s /etc/nginx/sites-available/jangpyosa /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# 13) 방화벽 설정
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable

# 14) SSL 인증서 (Let's Encrypt)
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d jangpyosa.com -d www.jangpyosa.com
```

---

## 2. 코드만 복구 (서버는 정상)

### 시나리오 A: GitHub 최신 버전으로 완전 초기화

```bash
# ⚠️ 주의: 로컬 변경사항이 모두 삭제됩니다!

# 1) 현재 상태 백업
cd /home/ubuntu/jangpyosa
tar -czf ~/backup-before-reset-$(date +%Y%m%d-%H%M%S).tar.gz \
  --exclude='node_modules' --exclude='.next' --exclude='dist' .

# 2) PM2 프로세스 중지
pm2 stop all

# 3) GitHub 최신 버전으로 초기화
git fetch origin
git reset --hard origin/main
git clean -fd

# 4) 의존성 재설치 (필요 시)
npm install
cd apps/api && npm install && cd ../..
cd apps/web && npm install && cd ../..

# 5) 빌드
npm run build

# 6) PM2 재시작
pm2 restart all

# 7) 확인
pm2 logs --lines 50
curl http://localhost:3003
```

### 시나리오 B: 완전히 새로 Clone (가장 확실)

```bash
# 1) PM2 중지
pm2 stop all

# 2) 현재 폴더 백업
cd /home/ubuntu
mv jangpyosa jangpyosa.backup-$(date +%Y%m%d-%H%M%S)

# 3) GitHub에서 새로 Clone
git clone https://YOUR_GITHUB_TOKEN@github.com/masolshop/jangpyosa.git
cd jangpyosa

# 4) 백업에서 필요한 파일 복사
cp ../jangpyosa.backup-*/.env* ./ 2>/dev/null || true
cp ../jangpyosa.backup-*/apps/api/.env apps/api/ 2>/dev/null || true
cp ../jangpyosa.backup-*/apps/web/.env.local apps/web/ 2>/dev/null || true
cp ../jangpyosa.backup-*/apps/api/prisma/dev.db apps/api/prisma/ 2>/dev/null || true

# 5) 의존성 설치
npm install
cd apps/api && npm install && cd ../..
cd apps/web && npm install && cd ../..

# 6) 빌드
npm run build

# 7) PM2 재시작
pm2 start ecosystem.config.js
pm2 save

# 8) 확인
pm2 status
pm2 logs --lines 50
```

---

## 3. 특정 파일만 복구

### 단일 파일 복구

```bash
cd /home/ubuntu/jangpyosa

# 특정 파일을 GitHub 버전으로 복구
git fetch origin
git checkout origin/main -- apps/web/src/app/catalog/page.tsx

# 확인
git status
git diff HEAD
```

### 여러 파일 복구

```bash
cd /home/ubuntu/jangpyosa

# 여러 파일 한 번에 복구
git checkout origin/main -- \
  apps/api/src/routes/sales.ts \
  apps/web/src/app/admin/sales/dashboard/page.tsx \
  apps/web/src/app/catalog/page.tsx
```

### 전체 디렉토리 복구

```bash
cd /home/ubuntu/jangpyosa

# 디렉토리 전체 복구
git checkout origin/main -- apps/web/src/app/admin/
```

---

## 4. 데이터베이스 복구

### 자동 백업에서 복구

```bash
# 1) 백업 파일 확인
ls -lh /home/ubuntu/jangpyosa-backups/*.backup.gz

# 2) PM2 중지
pm2 stop jangpyosa-api

# 3) 최신 백업 복구
cd /home/ubuntu/jangpyosa/apps/api/prisma
cp dev.db dev.db.backup-$(date +%Y%m%d-%H%M%S)

# 4) 백업에서 복원
gunzip -c /home/ubuntu/jangpyosa-backups/dev.db.2026-03-08-XXXXXX.backup.gz > dev.db

# 5) PM2 재시작
pm2 start jangpyosa-api

# 6) 확인
pm2 logs jangpyosa-api --lines 50
```

### Prisma 마이그레이션으로 재생성

```bash
cd /home/ubuntu/jangpyosa/apps/api

# 기존 DB 백업
cp prisma/dev.db prisma/dev.db.backup-$(date +%Y%m%d-%H%M%S)

# 새로 생성
rm prisma/dev.db
npx prisma migrate deploy
npx prisma db push

# 초기 데이터 생성 (필요 시)
npm run seed  # seed 스크립트가 있는 경우
```

---

## 5. 환경 변수 복구

### .env 파일 복구

```bash
# 백업에서 복구
cd /home/ubuntu/jangpyosa
cp /home/ubuntu/backups/code-backup-XXXXXX/.env ./
cp /home/ubuntu/backups/code-backup-XXXXXX/apps/api/.env apps/api/
cp /home/ubuntu/backups/code-backup-XXXXXX/apps/web/.env.local apps/web/

# 또는 예제 파일에서 복사
cp .env.example .env
nano .env  # 수동 편집
```

### 주요 환경 변수 (참고용)

```bash
# 루트 .env
NODE_ENV=production

# apps/api/.env
DATABASE_URL="file:./prisma/dev.db"
JWT_SECRET="your-jwt-secret"
APICK_API_KEY="your-apick-key"
APICK_API_SECRET="your-apick-secret"

# apps/web/.env.local
NEXT_PUBLIC_API_BASE=https://jangpyosa.com:4000
API_BASE=http://localhost:4000
```

---

## 🎯 비상 상황별 빠른 참조

| 상황 | 복구 방법 | 소요 시간 | 난이도 |
|------|----------|----------|--------|
| 🔴 **서버 전체 장애** | [방법 1](#1-서버-완전-장애-시-복구) | 30-60분 | ⭐⭐⭐⭐ |
| 🟡 **코드 문제** | [방법 2-A](#시나리오-a-github-최신-버전으로-완전-초기화) | 5-10분 | ⭐⭐ |
| 🟢 **파일 일부만** | [방법 3](#3-특정-파일만-복구) | 1-2분 | ⭐ |
| 🔵 **DB 문제** | [방법 4](#4-데이터베이스-복구) | 2-5분 | ⭐⭐ |
| ⚪ **환경변수 문제** | [방법 5](#5-환경-변수-복구) | 1-2분 | ⭐ |

---

## 📞 체크리스트

### 복구 전 확인사항
- [ ] 백업 파일 존재 확인
- [ ] GitHub Token 유효성 확인
- [ ] SSH 접속 가능 확인
- [ ] PM2 프로세스 상태 확인

### 복구 후 확인사항
- [ ] 서비스 정상 작동 확인 (`pm2 status`)
- [ ] 로그 에러 없음 확인 (`pm2 logs`)
- [ ] 웹사이트 접속 확인 (https://jangpyosa.com)
- [ ] API 응답 확인 (`curl http://localhost:4000/api/health`)
- [ ] 데이터베이스 연결 확인

---

## 🔗 관련 문서
- [AWS 설정 가이드](./AWS-SETUP-GUIDE.md)
- [배포 가이드](./DEPLOYMENT_GUIDE.md)
- [백업 전략](./BACKUP-STRATEGY.md)

---

**문서 생성일**: 2026-03-08  
**마지막 업데이트**: 2026-03-08  
**작성자**: AI Assistant  
**GitHub 저장소**: https://github.com/masolshop/jangpyosa
