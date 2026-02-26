# 🔄 샌드박스 ↔ EC2 실시간 동기화 가이드

## 📋 개요
이 가이드는 샌드박스 로컬 작업을 AWS EC2 서버에 실시간으로 동기화하는 방법을 설명합니다.

---

## 🔑 SSH 키 정보
- **키 파일**: `~/.ssh/jangpyosa`
- **EC2 호스트**: `ubuntu@43.201.0.129`
- **프로젝트 경로**: `/home/ubuntu/jangpyosa`

---

## 🚀 빠른 시작

### 1. 샌드박스에서 EC2로 동기화

```bash
cd /home/user/webapp
./sync-to-ec2.sh
```

### 2. 선택적 npm install 및 서비스 재시작

동기화 후 프롬프트가 표시되면:
- `y` 입력: npm install + 빌드 + PM2 재시작
- `n` 입력: 파일만 동기화

---

## 📁 동기화 제외 항목

다음 파일/디렉토리는 **동기화에서 제외**됩니다:
- `node_modules/` - 의존성 패키지 (서버에서 별도 설치)
- `.next/` - Next.js 빌드 결과물
- `.git/` - Git 히스토리
- `*.log` - 로그 파일
- `.env.local` - 로컬 환경변수
- `dev.db` - SQLite 데이터베이스
- `.ssh-config/` - SSH 설정
- `sync-to-ec2.sh` - 동기화 스크립트

---

## 🔧 고급 사용법

### 수동 rsync 명령어

```bash
# 기본 동기화
rsync -avzh --delete \
    --exclude 'node_modules/' \
    --exclude '.next/' \
    -e "ssh -i ~/.ssh/jangpyosa" \
    /home/user/webapp/ \
    ubuntu@43.201.0.129:/home/ubuntu/jangpyosa/

# 건조 실행 (실제로 동기화하지 않고 미리보기)
rsync -avzh --delete --dry-run \
    --exclude 'node_modules/' \
    --exclude '.next/' \
    -e "ssh -i ~/.ssh/jangpyosa" \
    /home/user/webapp/ \
    ubuntu@43.201.0.129:/home/ubuntu/jangpyosa/
```

### 특정 파일만 동기화

```bash
# apps/api 디렉토리만 동기화
rsync -avzh \
    -e "ssh -i ~/.ssh/jangpyosa" \
    /home/user/webapp/apps/api/ \
    ubuntu@43.201.0.129:/home/ubuntu/jangpyosa/apps/api/

# 단일 파일 동기화
scp -i ~/.ssh/jangpyosa \
    /home/user/webapp/apps/api/src/routes/work-orders.ts \
    ubuntu@43.201.0.129:/home/ubuntu/jangpyosa/apps/api/src/routes/
```

### 서버에서 직접 명령 실행

```bash
# PM2 상태 확인
ssh -i ~/.ssh/jangpyosa ubuntu@43.201.0.129 "pm2 status"

# API 서버 로그 확인
ssh -i ~/.ssh/jangpyosa ubuntu@43.201.0.129 "pm2 logs jangpyosa-api --lines 50"

# 서비스 재시작
ssh -i ~/.ssh/jangpyosa ubuntu@43.201.0.129 "pm2 restart jangpyosa-api"
```

---

## 🔄 일반적인 워크플로우

### 1. 코드 수정 후 테스트

```bash
# 1. 샌드박스에서 코드 수정
vim apps/api/src/routes/work-orders.ts

# 2. EC2로 동기화
./sync-to-ec2.sh

# 3. 프롬프트에서 'y' 입력 (npm install + 재시작)

# 4. 서버 로그 확인
ssh -i ~/.ssh/jangpyosa ubuntu@43.201.0.129 "pm2 logs --nostream | tail -20"
```

### 2. 긴급 핫픽스

```bash
# 특정 파일만 빠르게 동기화
scp -i ~/.ssh/jangpyosa \
    apps/api/src/routes/work-orders.ts \
    ubuntu@43.201.0.129:/home/ubuntu/jangpyosa/apps/api/src/routes/

# API 재시작
ssh -i ~/.ssh/jangpyosa ubuntu@43.201.0.129 "pm2 restart jangpyosa-api"
```

### 3. 데이터베이스 스키마 변경

```bash
# Prisma 스키마 동기화
./sync-to-ec2.sh

# 서버에서 Prisma 마이그레이션
ssh -i ~/.ssh/jangpyosa ubuntu@43.201.0.129 \
    "cd /home/ubuntu/jangpyosa/apps/api && npx prisma generate && pm2 restart jangpyosa-api"
```

---

## 📊 동기화 옵션 설명

| 옵션 | 설명 |
|------|------|
| `-a` | Archive mode (권한, 시간 등 보존) |
| `-v` | Verbose (상세 출력) |
| `-z` | 압축 전송 |
| `-h` | Human-readable (사람이 읽기 쉬운 형식) |
| `--delete` | 원격에서 로컬에 없는 파일 삭제 |
| `--exclude` | 특정 패턴 제외 |
| `--dry-run` | 실제 실행하지 않고 미리보기 |

---

## ⚠️ 주의사항

### 1. --delete 옵션
`--delete` 옵션은 원격 서버에서 로컬에 없는 파일을 **삭제**합니다.
- 신중하게 사용하세요!
- 먼저 `--dry-run`으로 테스트하세요

### 2. 데이터베이스 파일
- `dev.db`는 동기화에서 **제외**됩니다
- DB 변경은 마이그레이션이나 백업/복구로 처리하세요

### 3. 환경변수
- `.env.local`은 동기화되지 않습니다
- 서버의 `.env` 파일을 별도로 관리하세요

### 4. node_modules
- `node_modules/`는 동기화되지 않습니다
- 의존성 변경 시 서버에서 `npm install` 실행 필요

---

## 🆘 문제 해결

### SSH 키 권한 오류
```bash
chmod 600 ~/.ssh/jangpyosa
```

### rsync가 없을 때
```bash
# 로컬 (샌드박스)에서
apt-get update && apt-get install -y rsync

# 서버에서
ssh -i ~/.ssh/jangpyosa ubuntu@43.201.0.129 "sudo apt-get update && sudo apt-get install -y rsync"
```

### PM2 서비스가 응답하지 않을 때
```bash
# 서버에서 PM2 재시작
ssh -i ~/.ssh/jangpyosa ubuntu@43.201.0.129 "pm2 kill && pm2 resurrect"
```

### 동기화가 느릴 때
```bash
# 압축 레벨 조정 (-z 옵션 제거하면 더 빠름)
rsync -avh --delete \
    --exclude 'node_modules/' \
    --exclude '.next/' \
    -e "ssh -i ~/.ssh/jangpyosa" \
    /home/user/webapp/ \
    ubuntu@43.201.0.129:/home/ubuntu/jangpyosa/
```

---

## 📝 체크리스트

작업 전 확인 사항:
- [ ] SSH 키가 존재하고 권한이 올바른가? (`chmod 600 ~/.ssh/jangpyosa`)
- [ ] EC2 서버에 접속 가능한가? (`ssh -i ~/.ssh/jangpyosa ubuntu@43.201.0.129`)
- [ ] rsync가 설치되어 있는가? (`which rsync`)
- [ ] 동기화하려는 파일이 제외 목록에 없는가?
- [ ] 백업이 필요한 중요한 변경사항인가?

---

## 💡 팁

### 1. SSH 설정 파일 사용

`~/.ssh/config`에 다음 추가:
```
Host jangpyosa-ec2
    HostName 43.201.0.129
    User ubuntu
    IdentityFile ~/.ssh/jangpyosa
```

그러면 더 간단하게 접속 가능:
```bash
ssh jangpyosa-ec2
scp file.txt jangpyosa-ec2:/path/to/dest
```

### 2. 동기화 전 백업

중요한 변경 전에는 백업:
```bash
ssh -i ~/.ssh/jangpyosa ubuntu@43.201.0.129 \
    "cd /home/ubuntu && tar -czf jangpyosa-backup-$(date +%Y%m%d-%H%M%S).tar.gz jangpyosa/"
```

### 3. Git 워크플로우와 통합

```bash
# 1. 로컬에서 커밋
git add .
git commit -m "feat: add new feature"

# 2. EC2로 동기화
./sync-to-ec2.sh

# 3. 서버에서도 커밋 (선택)
ssh -i ~/.ssh/jangpyosa ubuntu@43.201.0.129 \
    "cd /home/ubuntu/jangpyosa && git add . && git commit -m 'sync from sandbox'"
```

---

이제 샌드박스에서 작업한 내용을 실시간으로 EC2에 동기화할 수 있습니다! 🚀
