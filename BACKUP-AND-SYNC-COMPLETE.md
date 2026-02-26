# ✅ 백업 및 동기화 시스템 구축 완료

## 📅 완료 날짜: 2026-02-26

---

## 1️⃣ AWS S3 자동 백업 시스템

### ✅ 구현된 기능
- **로컬 DB 백업**: 매일 03:00 KST
  - 위치: `/home/ubuntu/backups/jangpyosa/`
  - 형식: `dev.db.backup-YYYYMMDD-HHMMSS.gz`
  - 보관 기간: 30일

- **원격 S3 백업**: 매일 04:00 KST
  - 버킷: `s3://jangpyosa-backup`
  - 소스코드: `s3://jangpyosa-backup/backups/source/jangpyosa-source-YYYYMMDD-HHMMSS.tar.gz`
  - 데이터베이스: `s3://jangpyosa-backup/backups/database/dev.db.backup-YYYYMMDD-HHMMSS.gz`
  - 보관 기간: 90일

### 📋 Crontab 스케줄
```bash
# 로컬 DB 백업
0 3 * * * /home/ubuntu/scripts/backup-db.sh >> /var/log/jangpyosa-backup.log 2>&1

# S3 원격 백업
0 4 * * * /home/ubuntu/scripts/backup-to-s3.sh >> /var/log/jangpyosa-s3-backup.log 2>&1
```

### 🔧 백업 스크립트
- `/home/ubuntu/scripts/backup-db.sh` - 로컬 DB 백업
- `/home/ubuntu/scripts/backup-to-s3.sh` - S3 원격 백업

### ⚠️ 필요한 작업 (1회만)

#### 1. IAM Role에 S3 권한 추가
AWS Console → IAM → Roles → `AmazonLightsailInstanceRole` → Add inline policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "S3BackupAccess",
      "Effect": "Allow",
      "Action": [
        "s3:CreateBucket",
        "s3:PutBucketVersioning",
        "s3:PutPublicAccessBlock",
        "s3:PutObject",
        "s3:GetObject",
        "s3:ListBucket",
        "s3:DeleteObject"
      ],
      "Resource": [
        "arn:aws:s3:::jangpyosa-backup",
        "arn:aws:s3:::jangpyosa-backup/*"
      ]
    }
  ]
}
```

Policy Name: `JangpyosaS3BackupPolicy`

#### 2. S3 버킷 생성
```bash
# SSH 접속
ssh -i ~/.ssh/jangpyosa ubuntu@43.201.0.129

# S3 버킷 생성
aws s3 mb s3://jangpyosa-backup --region ap-northeast-2

# 버전 관리 활성화
aws s3api put-bucket-versioning \
  --bucket jangpyosa-backup \
  --versioning-configuration Status=Enabled

# 퍼블릭 액세스 차단
aws s3api put-public-access-block \
  --bucket jangpyosa-backup \
  --public-access-block-configuration \
  "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"
```

#### 3. 백업 테스트
```bash
# 백업 스크립트 수동 실행
sudo /home/ubuntu/scripts/backup-to-s3.sh

# 로그 확인
tail -f /var/log/jangpyosa-s3-backup.log

# S3 업로드 확인
aws s3 ls s3://jangpyosa-backup/backups/ --recursive --human-readable
```

### 📊 비용 추정
- 저장 용량: ~100 MB (압축 후)
- S3 Standard-IA: ~$0.0125/GB/월 → **약 $1.25/월**
- Glacier (30일 이후): ~$0.004/GB/월 → **약 $0.40/월**
- **월 예상 비용: $2 미만**

---

## 2️⃣ 샌드박스 ↔ EC2 실시간 동기화

### ✅ 구현된 기능
- **SSH 자동 인증**: `~/.ssh/jangpyosa` 키 사용
- **실시간 동기화**: rsync를 이용한 빠른 파일 전송
- **자동 제외**: node_modules, .next, .git, 로그, 백업 파일 등

### 🔧 동기화 스크립트

#### 전체 동기화 (느림, 모든 파일)
```bash
cd /home/user/webapp
./sync-to-ec2.sh
```

#### 소스코드만 동기화 (빠름, apps/ 디렉토리만)
```bash
cd /home/user/webapp
./sync-code-only.sh
```

### 📝 동기화 제외 패턴
```
node_modules/
.next/
.git/
dist/
*.log
*.backup*
*.bak*
*-backup-*
dev.db*
.env.local
.ssh-config/
```

### 🔐 SSH 설정
- **SSH Config**: `/home/user/webapp/.ssh-config/config`
- **SSH Key**: `~/.ssh/jangpyosa`
- **EC2 Host**: `ubuntu@43.201.0.129`
- **EC2 Path**: `/home/ubuntu/jangpyosa`

---

## 3️⃣ 워크플로우 가이드

### 개발 작업 시나리오

#### A. 로컬에서 코드 수정 후 배포
```bash
# 1. 샌드박스에서 코드 수정
cd /home/user/webapp/apps/api/src/routes
vim work-orders.ts

# 2. 소스코드만 빠르게 동기화
cd /home/user/webapp
./sync-code-only.sh

# 3. EC2에서 서비스 재시작 (필요시)
ssh -i ~/.ssh/jangpyosa ubuntu@43.201.0.129 "pm2 restart jangpyosa-api"
```

#### B. 전체 프로젝트 동기화
```bash
# 1. 전체 동기화 실행
cd /home/user/webapp
./sync-to-ec2.sh

# 2. npm install 및 서비스 재시작 여부 선택
# (스크립트가 대화형으로 물어봄)
```

#### C. 백업 확인
```bash
# 로컬 백업 확인
ssh -i ~/.ssh/jangpyosa ubuntu@43.201.0.129 "ls -lh /home/ubuntu/backups/jangpyosa/"

# S3 백업 확인
ssh -i ~/.ssh/jangpyosa ubuntu@43.201.0.129 "aws s3 ls s3://jangpyosa-backup/backups/ --recursive --human-readable"

# 백업 로그 확인
ssh -i ~/.ssh/jangpyosa ubuntu@43.201.0.129 "tail -50 /var/log/jangpyosa-backup.log"
ssh -i ~/.ssh/jangpyosa ubuntu@43.201.0.129 "tail -50 /var/log/jangpyosa-s3-backup.log"
```

---

## 4️⃣ 체크리스트

### AWS 설정 (1회만, 아직 미완료)
- [ ] IAM Role에 S3 정책 추가 (`JangpyosaS3BackupPolicy`)
- [ ] S3 버킷 `jangpyosa-backup` 생성
- [ ] 버전 관리 활성화
- [ ] 퍼블릭 액세스 차단 설정
- [ ] 백업 스크립트 수동 테스트
- [ ] S3에 백업 파일 업로드 확인

### 동기화 시스템 (✅ 완료)
- [x] SSH 키 설정
- [x] SSH Config 파일 생성
- [x] 전체 동기화 스크립트 (`sync-to-ec2.sh`)
- [x] 빠른 동기화 스크립트 (`sync-code-only.sh`)
- [x] rsync 설치
- [x] 제외 패턴 최적화

### 백업 시스템 (✅ 완료)
- [x] 로컬 DB 백업 스크립트
- [x] S3 백업 스크립트
- [x] Crontab 설정 (03:00, 04:00)
- [x] AWS CLI 설치 (v2.33.30)
- [x] IAM Role 연결 확인 (`AmazonLightsailInstanceRole`)

---

## 5️⃣ 참고 문서
- `AWS-SETUP-GUIDE.md` - AWS S3 백업 상세 가이드
- `IAM-POLICY-SETUP.md` - IAM 정책 설정 가이드
- `README-SYNC.md` - 동기화 시스템 사용 가이드

---

## 6️⃣ 서버 정보
- **AWS Account**: `411304301317`
- **IAM Role**: `AmazonLightsailInstanceRole`
- **EC2 IP**: `43.201.0.129`
- **Region**: `ap-northeast-2` (서울)
- **AWS CLI**: v2.33.30

---

## 7️⃣ 다음 단계

1. ✅ **동기화 시스템 테스트**
   ```bash
   cd /home/user/webapp
   ./sync-code-only.sh
   ```

2. ⚠️ **AWS S3 권한 설정** (사용자가 AWS Console에서 수동 설정 필요)
   - IAM Policy 추가
   - S3 버킷 생성
   - 백업 스크립트 테스트

3. 📊 **모니터링 설정** (선택사항)
   - CloudWatch 알림
   - S3 Lifecycle 정책
   - 백업 실패 알림

---

## 🎉 완료된 작업

✅ AWS CLI 설치 (v2.33.30)  
✅ IAM Role 연결 확인  
✅ 로컬 DB 백업 스크립트 생성  
✅ S3 백업 스크립트 생성  
✅ Crontab 설정 (03:00, 04:00)  
✅ SSH 키 설정  
✅ 전체 동기화 스크립트  
✅ 빠른 동기화 스크립트  
✅ rsync 설치 및 최적화  

⚠️ **남은 작업**: AWS Console에서 IAM 정책 추가 및 S3 버킷 생성

---

**작성일**: 2026-02-26  
**작성자**: Claude Code Assistant  
**프로젝트**: 장표사 (jangpyosa.com)  
