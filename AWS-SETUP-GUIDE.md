# 🌐 AWS S3 백업 설정 가이드

## 📋 현재 상태
- ✅ S3 백업 스크립트 생성 완료: `/home/ubuntu/scripts/backup-to-s3.sh`
- ✅ Crontab 설정 완료: 매일 새벽 4시 자동 실행
- ⚠️  AWS CLI 설치 필요
- ⚠️  AWS 자격증명 설정 필요
- ⚠️  S3 버킷 생성 필요

---

## 🚀 AWS S3 백업 설정 단계

### 1단계: S3 버킷 생성

AWS 콘솔에서 S3 버킷을 생성합니다:

```bash
# AWS CLI로 버킷 생성 (또는 AWS 콘솔 사용)
aws s3 mb s3://jangpyosa-backup --region ap-northeast-2

# 버킷 버전 관리 활성화
aws s3api put-bucket-versioning \
  --bucket jangpyosa-backup \
  --versioning-configuration Status=Enabled
```

**권장 설정:**
- 버킷명: `jangpyosa-backup` (또는 원하는 이름)
- 리전: `ap-northeast-2` (서울)
- 버전 관리: 활성화
- 암호화: AES-256 또는 KMS
- 퍼블릭 액세스: 차단

### 2단계: IAM 역할 생성 (권장)

EC2 인스턴스에 IAM 역할을 연결하면 AWS 자격증명 없이 S3에 접근할 수 있습니다.

**IAM 정책 (JSON):**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
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

**설정 방법:**
1. AWS 콘솔 → IAM → 역할 → 역할 만들기
2. "AWS 서비스" → "EC2" 선택
3. 위 정책을 가진 정책 생성 및 연결
4. EC2 콘솔 → 인스턴스 → 작업 → 보안 → IAM 역할 수정

### 3단계: AWS CLI 설치 (서버에서 실행)

```bash
# SSH로 서버 접속
ssh -i ~/.ssh/jangpyosa ubuntu@43.201.0.129

# apt 잠금 해제 (필요시)
sudo killall apt apt-get 2>/dev/null || true
sleep 3

# unzip 설치
sudo apt-get update
sudo apt-get install -y unzip

# AWS CLI 설치
cd /tmp
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install
rm -rf aws awscliv2.zip

# 설치 확인
aws --version
```

### 4단계: AWS 자격증명 설정

**방법 1: IAM 역할 사용 (권장)**
- EC2 인스턴스에 IAM 역할을 연결하면 자동으로 인증됩니다
- 추가 설정 불필요

**방법 2: AWS 자격증명 직접 설정**
```bash
# AWS 자격증명 설정
aws configure

# 입력 내용:
# AWS Access Key ID: [액세스 키]
# AWS Secret Access Key: [시크릿 키]
# Default region name: ap-northeast-2
# Default output format: json

# 테스트
aws sts get-caller-identity
```

### 5단계: S3 버킷명 수정

백업 스크립트에서 실제 S3 버킷명으로 수정:

```bash
# 백업 스크립트 편집
nano /home/ubuntu/scripts/backup-to-s3.sh

# 다음 줄을 실제 버킷명으로 변경:
S3_BUCKET="s3://jangpyosa-backup"  # 실제 버킷명으로 변경
```

### 6단계: 수동 테스트

```bash
# 백업 스크립트 수동 실행
sudo /home/ubuntu/scripts/backup-to-s3.sh

# 로그 확인
tail -f /var/log/jangpyosa-s3-backup.log

# S3 버킷 확인
aws s3 ls s3://jangpyosa-backup/backups/ --recursive --human-readable
```

---

## 📊 백업 스케줄

| 백업 유형 | 실행 시간 | 보관 위치 | 보관 기간 |
|----------|----------|----------|----------|
| **로컬 DB 백업** | 매일 03:00 (KST) | `/home/ubuntu/backups/jangpyosa/` | 30일 |
| **S3 원격 백업** | 매일 04:00 (KST) | `s3://jangpyosa-backup/backups/` | 90일 |

## 📦 백업 내용

### S3 백업 구조
```
s3://jangpyosa-backup/
└── backups/
    ├── source/
    │   └── jangpyosa-source-YYYYMMDD-HHMMSS.tar.gz  (프로그램 원본)
    └── database/
        └── dev.db.backup-YYYYMMDD-HHMMSS.gz  (SQLite DB)
```

### 백업 제외 항목
- `node_modules/` (의존성 패키지)
- `.next/` (빌드 결과물)
- `*.log` (로그 파일)
- `dev.db` (별도 백업)

---

## 🔧 S3 Lifecycle 정책 설정 (선택)

S3 비용 절감을 위한 Lifecycle 정책:

```json
{
  "Rules": [
    {
      "Id": "MoveToGlacierAfter30Days",
      "Status": "Enabled",
      "Prefix": "backups/",
      "Transitions": [
        {
          "Days": 30,
          "StorageClass": "GLACIER"
        }
      ],
      "Expiration": {
        "Days": 90
      }
    }
  ]
}
```

**적용 방법:**
```bash
aws s3api put-bucket-lifecycle-configuration \
  --bucket jangpyosa-backup \
  --lifecycle-configuration file://lifecycle.json
```

---

## 🆘 문제 해결

### AWS CLI 설치 오류
```bash
# apt 잠금 오류 시
sudo killall apt apt-get
sudo rm /var/lib/dpkg/lock-frontend
sudo rm /var/lib/dpkg/lock
sudo dpkg --configure -a
```

### S3 업로드 권한 오류
```bash
# IAM 역할 확인
aws sts get-caller-identity

# S3 버킷 권한 테스트
aws s3 ls s3://jangpyosa-backup/
```

### 백업 실패 시
```bash
# 로그 확인
tail -100 /var/log/jangpyosa-s3-backup.log

# 수동 실행으로 디버깅
sudo bash -x /home/ubuntu/scripts/backup-to-s3.sh
```

---

## 📝 복구 방법

### 소스코드 복구
```bash
# S3에서 다운로드
aws s3 cp s3://jangpyosa-backup/backups/source/jangpyosa-source-YYYYMMDD-HHMMSS.tar.gz /tmp/

# 압축 해제
cd /home/ubuntu
tar -xzf /tmp/jangpyosa-source-YYYYMMDD-HHMMSS.tar.gz -C jangpyosa/

# 의존성 설치
cd jangpyosa/apps/api && npm install
cd ../web && npm install && npm run build

# 서비스 재시작
pm2 restart all
```

### 데이터베이스 복구
```bash
# S3에서 다운로드
aws s3 cp s3://jangpyosa-backup/backups/database/dev.db.backup-YYYYMMDD-HHMMSS.gz /tmp/

# 압축 해제
gunzip /tmp/dev.db.backup-YYYYMMDD-HHMMSS.gz

# 현재 DB 백업
mv /home/ubuntu/jangpyosa/apps/api/prisma/dev.db /home/ubuntu/jangpyosa/apps/api/prisma/dev.db.old

# 복구
cp /tmp/dev.db.backup-YYYYMMDD-HHMMSS /home/ubuntu/jangpyosa/apps/api/prisma/dev.db

# 서비스 재시작
pm2 restart jangpyosa-api
```

---

## ✅ 설정 완료 체크리스트

- [ ] S3 버킷 생성
- [ ] IAM 역할/정책 생성 및 EC2 연결
- [ ] AWS CLI 설치
- [ ] AWS 자격증명 설정
- [ ] 백업 스크립트에서 S3 버킷명 수정
- [ ] 수동 백업 테스트 성공
- [ ] S3 Lifecycle 정책 설정 (선택)
- [ ] 복구 절차 테스트 (선택)

---

## 💰 비용 예상

**S3 Standard-IA (Infrequent Access) 기준:**
- 저장: ~$0.0125/GB/월
- 예상 백업 크기: ~100MB (압축 후)
- 월 비용: ~$1.25

**추가 절감:**
- 30일 후 Glacier로 이동: ~$0.004/GB/월
- 90일 후 자동 삭제

---

이제 준비가 완료되었습니다! AWS 설정을 완료하고 백업을 테스트하세요. 🚀
