# 🔧 Lightsail IAM Role 설정 가이드

## 📋 현재 상황
- **인스턴스**: jangpyosa (Lightsail)
- **Instance Profile**: `AmazonLightsailInstanceProfile`
- **실제 Role**: `AmazonLightsailInstanceRole` (확인됨)
- **문제**: AWS Console에서 Role을 찾을 수 없음

---

## 🎯 해결 방법 (3가지 옵션)

### ✅ 옵션 1: AWS Console에서 Role 찾기 (권장)

#### 1단계: IAM Console 접속
```
https://console.aws.amazon.com/iam/home?region=ap-northeast-2#/roles
```

#### 2단계: Role 검색
- 검색창에 입력: `Lightsail`
- 또는: `AmazonLightsail`
- 표시될 수 있는 이름들:
  - `AmazonLightsailInstanceRole`
  - `AmazonEC2RoleforAWSLightsail`
  - `LightsailExportAccess`

#### 3단계: Role 찾았을 때
Role을 클릭 → "Add permissions" → "Create inline policy" → JSON:

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

Policy name: `JangpyosaS3BackupPolicy`

---

### ✅ 옵션 2: 새 IAM Role 생성하고 교체

Lightsail에서 기본 Role 수정이 어려운 경우, 새 Role을 만들어 교체할 수 있습니다.

#### 1단계: 새 IAM Role 생성

**AWS Console → IAM → Roles → Create role**

1. **Trusted entity type**: AWS service
2. **Use case**: EC2
3. **Next**

#### 2단계: 정책 추가

**"Create policy"** 클릭 → JSON:

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

Policy name: `JangpyosaS3BackupPolicy`

#### 3단계: Role 이름 지정
- Role name: `JangpyosaBackupRole`
- Description: "Jangpyosa backup to S3"

#### 4단계: EC2 Console에서 Role 교체

⚠️ **주의**: Lightsail 인스턴스는 EC2 Console에서 IAM Role을 교체할 수 없을 수 있습니다.

대신 **Lightsail CLI** 사용:
```bash
# AWS CLI로 Lightsail 인스턴스에 Role 연결 (지원되지 않을 수 있음)
aws lightsail attach-instance-profile --instance-name jangpyosa
```

❌ **이 방법이 안 되면 옵션 3으로 진행하세요**

---

### ✅ 옵션 3: AWS Access Key 사용 (빠른 임시 방법)

IAM Role 수정이 어려우면 **Access Key**를 생성해서 사용할 수 있습니다.

⚠️ **보안 경고**: Access Key는 보안 위험이 있으므로 임시로만 사용하세요.

#### 1단계: IAM User 생성

**AWS Console → IAM → Users → Add users**

1. **User name**: `jangpyosa-backup-user`
2. **Access type**: Programmatic access (Access key)
3. **Next**

#### 2단계: 권한 추가

**Attach policies directly** → "Create policy" → JSON:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
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

Policy name: `JangpyosaS3BackupPolicy`

#### 3단계: Access Key 다운로드

User 생성 완료 후:
- **Access key ID**: `AKIAXXXXXXXXXXXXX`
- **Secret access key**: `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

⚠️ **중요**: Secret access key는 이 화면에서만 볼 수 있으니 꼭 복사하세요!

#### 4단계: EC2 서버에 자격증명 설정

```bash
# SSH 접속
ssh -i ~/.ssh/jangpyosa ubuntu@43.201.0.129

# AWS 자격증명 설정
aws configure

# 입력:
# AWS Access Key ID: [위에서 복사한 Access Key ID]
# AWS Secret Access Key: [위에서 복사한 Secret Access Key]
# Default region name: ap-northeast-2
# Default output format: json
```

#### 5단계: 테스트

```bash
# S3 버킷 생성
aws s3 mb s3://jangpyosa-backup --region ap-northeast-2

# 백업 스크립트 실행
sudo /home/ubuntu/scripts/backup-to-s3.sh

# 로그 확인
tail -f /var/log/jangpyosa-s3-backup.log
```

---

## 🎯 권장 순서

1. **먼저 시도**: 옵션 1 (기존 Role에 정책 추가)
   - IAM Console에서 "Lightsail" 검색
   - Role 찾아서 정책 추가

2. **안 되면**: 옵션 3 (Access Key 사용)
   - 빠르고 확실함
   - 나중에 옵션 1이나 2로 전환 가능

3. **나중에 개선**: 옵션 2 (새 Role 생성)
   - 더 안전함
   - EC2로 마이그레이션 시 사용

---

## 📞 다음 단계

### Access Key 방식을 선택한 경우:

```bash
# 1. AWS Console에서 IAM User 생성 및 Access Key 다운로드

# 2. SSH 접속
ssh -i ~/.ssh/jangpyosa ubuntu@43.201.0.129

# 3. AWS 자격증명 설정
aws configure
# Access Key ID: [입력]
# Secret Access Key: [입력]
# Region: ap-northeast-2
# Output: json

# 4. S3 버킷 생성
aws s3 mb s3://jangpyosa-backup --region ap-northeast-2

# 5. 버전 관리 활성화
aws s3api put-bucket-versioning \
  --bucket jangpyosa-backup \
  --versioning-configuration Status=Enabled

# 6. 퍼블릭 액세스 차단
aws s3api put-public-access-block \
  --bucket jangpyosa-backup \
  --public-access-block-configuration \
  "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"

# 7. 백업 테스트
sudo /home/ubuntu/scripts/backup-to-s3.sh

# 8. 로그 확인
tail -f /var/log/jangpyosa-s3-backup.log

# 9. S3 확인
aws s3 ls s3://jangpyosa-backup/backups/ --recursive --human-readable
```

---

## ✅ 체크리스트

### IAM Role 방식 (권장)
- [ ] IAM Console에서 Lightsail Role 찾기
- [ ] S3 정책 추가 (`JangpyosaS3BackupPolicy`)
- [ ] S3 버킷 생성
- [ ] 백업 테스트

### Access Key 방식 (빠른 임시)
- [ ] IAM User 생성 (`jangpyosa-backup-user`)
- [ ] S3 정책 추가
- [ ] Access Key 다운로드
- [ ] EC2에서 `aws configure` 실행
- [ ] S3 버킷 생성
- [ ] 백업 테스트

---

**작성일**: 2026-02-26  
**계정**: 411304301317  
**Region**: ap-northeast-2 (서울)  
**Instance Profile ARN**: arn:aws:iam::411304301317:instance-profile/AmazonLightsailInstanceProfile
