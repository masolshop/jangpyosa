# IAM 정책 설정 가이드

## 🎯 현재 상태
- ✅ AWS CLI 설치됨 (v2.33.30)
- ✅ IAM Role 연결됨: `AmazonLightsailInstanceRole`
- ✅ AWS Account: `411304301317`
- ❌ S3 권한 없음 (AccessDenied)

## 📝 필요한 작업

### 1️⃣ IAM 정책 추가 (AWS 콘솔)

1. **AWS Console** 접속 → IAM 서비스로 이동
2. **Roles** → `AmazonLightsailInstanceRole` 검색
3. **Add permissions** → **Create inline policy** 클릭
4. **JSON** 탭 선택 후 아래 정책 붙여넣기:

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

5. **Review policy** → Name: `JangpyosaS3BackupPolicy`
6. **Create policy** 클릭

---

### 2️⃣ S3 버킷 생성 (정책 추가 후)

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

# 확인
aws s3 ls s3://jangpyosa-backup/
```

---

### 3️⃣ 백업 스크립트 테스트

```bash
# 백업 스크립트 실행 (수동)
sudo /home/ubuntu/scripts/backup-to-s3.sh

# 로그 확인
tail -f /var/log/jangpyosa-s3-backup.log

# S3 업로드 확인
aws s3 ls s3://jangpyosa-backup/backups/ --recursive --human-readable
```

---

## 📊 자동 백업 스케줄

```
# 로컬 DB 백업: 매일 03:00 KST
0 3 * * * /home/ubuntu/scripts/backup-db.sh >> /var/log/jangpyosa-backup.log 2>&1

# S3 원격 백업: 매일 04:00 KST
0 4 * * * /home/ubuntu/scripts/backup-to-s3.sh >> /var/log/jangpyosa-s3-backup.log 2>&1
```

---

## 🔧 대체 방법: AWS Access Key 사용 (비권장)

IAM Role 수정이 어려운 경우 임시로 Access Key 사용 가능:

```bash
# AWS 자격증명 설정
aws configure
# Access Key ID: [입력]
# Secret Access Key: [입력]
# Region: ap-northeast-2
# Output format: json
```

⚠️ **보안 경고**: Access Key는 외부 노출 위험이 있으므로 IAM Role 사용을 권장합니다.

---

## ✅ 체크리스트

- [ ] IAM Role에 S3 정책 추가
- [ ] S3 버킷 `jangpyosa-backup` 생성
- [ ] 버전 관리 활성화
- [ ] 퍼블릭 액세스 차단 설정
- [ ] 백업 스크립트 수동 테스트
- [ ] 로그 확인
- [ ] S3에 백업 파일 업로드 확인
- [ ] 크론 작업 확인 (다음 날 04:00에 자동 실행)

---

## 📞 문제 해결

### AccessDenied 에러가 계속 발생하는 경우
```bash
# IAM Role 정책 확인
aws iam get-role --role-name AmazonLightsailInstanceRole

# 정책 목록 확인
aws iam list-attached-role-policies --role-name AmazonLightsailInstanceRole
```

### 버킷이 이미 존재한다는 에러
```bash
# 다른 버킷 이름 사용
aws s3 mb s3://jangpyosa-backup-$(date +%Y%m%d) --region ap-northeast-2
```
