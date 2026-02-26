# 🎉 AWS S3 백업 및 동기화 시스템 구축 완료

## 📅 완료 날짜: 2026-02-26

---

## ✅ 완료된 작업

### 1️⃣ AWS S3 자동 백업 시스템

**IAM 사용자 생성** ✅
- 사용자 이름: `jangpyosa-backup-user`
- Access Key ID: `AKIA6LLZA4C6JV6Z3PWW`
- 그룹: `jangpyosa-s3-backup-group`
- 정책: `JangpyosaS3BackupPolicy` + `AmazonS3FullAccess`

**S3 버킷 생성** ✅
- 버킷 이름: `jangpyosa-backup`
- 리전: `ap-northeast-2` (서울)
- 버전 관리: 활성화 ✅
- 암호화: AES-256 (자동)

**백업 구조**
```
s3://jangpyosa-backup/
├── backups/
│   ├── source/
│   │   └── jangpyosa-source-YYYYMMDD-HHMMSS.tar.gz  (5.8 MB)
│   └── database/
│       └── dev.db.backup-YYYYMMDD-HHMMSS.gz  (64 KB)
```

**백업 스크립트** ✅
- 위치: `/home/ubuntu/scripts/backup-to-s3-fixed.sh`
- 로그: `/var/log/jangpyosa-s3-backup.log`
- 기능:
  - 소스코드 백업 (node_modules, .next, *.log, dev.db 제외)
  - SQLite 데이터베이스 온라인 백업
  - S3 자동 업로드
  - 로컬 임시 파일 자동 정리
  - AWS 자격증명 명시적 설정

**백업 스케줄** ✅
```bash
# 로컬 DB 백업: 매일 03:00 KST
0 3 * * * /home/ubuntu/scripts/backup-db.sh >> /var/log/jangpyosa-backup.log 2>&1

# S3 원격 백업: 매일 04:00 KST
0 4 * * * /home/ubuntu/scripts/backup-to-s3-fixed.sh >> /var/log/jangpyosa-s3-backup.log 2>&1
```

**백업 보관** ✅
- 로컬: 30일 자동 삭제
- S3: 90일 보관 (Lifecycle Policy 권장)

---

### 2️⃣ 샌드박스 ↔ EC2 실시간 동기화

**SSH 설정** ✅
- SSH Key: `~/.ssh/jangpyosa`
- Config: `/home/user/webapp/.ssh-config/config`
- Host: `ubuntu@43.201.0.129`
- 경로: `/home/ubuntu/jangpyosa`

**동기화 스크립트** ✅
- 전체 동기화: `/home/user/webapp/sync-to-ec2.sh`
- 소스코드만: `/home/user/webapp/sync-code-only.sh`
- rsync 최적화: node_modules, .next, .git, *.backup*, dist 제외

**사용 방법**
```bash
# 샌드박스에서 실행
cd /home/user/webapp

# 소스코드만 빠르게 동기화
./sync-code-only.sh

# 전체 동기화
./sync-to-ec2.sh
```

---

## 📊 백업 테스트 결과

**테스트 날짜**: 2026-02-26 00:10:37 UTC (09:10 KST)

**백업 결과** ✅
- ✅ 소스코드: `5.8 MiB` → `s3://jangpyosa-backup/backups/source/jangpyosa-source-20260226-001037.tar.gz`
- ✅ 데이터베이스: `63.6 KiB` → `s3://jangpyosa-backup/backups/database/dev.db.backup-20260226-001037.gz`
- ✅ AWS 자격증명 확인
- ✅ S3 업로드 완료
- ✅ 로컬 임시 파일 정리

**백업 로그**
```
2026-02-26 00:10:37 UTC - 🌐 AWS S3 백업 시작
2026-02-26 00:10:39 UTC - ✅ AWS 자격증명 확인 완료
2026-02-26 00:10:39 UTC - ✅ 프로그램 원본 백업 완료: 5.8M
2026-02-26 00:10:39 UTC - ✅ 데이터베이스 백업 완료: 64K
2026-02-26 00:10:40 UTC - ✅ 소스코드 S3 업로드 완료
2026-02-26 00:10:42 UTC - ✅ 데이터베이스 S3 업로드 완료
2026-02-26 00:10:43 UTC - ✅ AWS S3 백업 완료
```

---

## 🔧 서버 정보

**AWS 계정**
- Account ID: `986485678268`
- Region: `ap-northeast-2` (서울)

**EC2 인스턴스**
- Type: Lightsail
- Name: `jangpyosa`
- Public IP: `43.201.0.129`
- OS: Ubuntu

**IAM 사용자**
- User: `jangpyosa-backup-user`
- ARN: `arn:aws:iam::986485678268:user/jangpyosa-backup-user`
- 자격증명 위치: `/home/ubuntu/.aws/credentials`

**S3 버킷**
- Bucket: `jangpyosa-backup`
- ARN: `arn:aws:s3:::jangpyosa-backup`
- 현재 크기: `5.9 MiB` (6 objects)

---

## 💰 비용 추정

**S3 스토리지**
- 일일 백업: ~6 MB (소스 5.8 MB + DB 64 KB)
- 월간 예상: ~180 MB (30일 × 6 MB)
- 90일 보관: ~540 MB

**비용 계산**
- S3 Standard-IA: $0.0125/GB/월
  - 0.54 GB × $0.0125 = **$0.00675/월**
- S3 PUT 요청: $0.01/1,000 요청
  - 60 요청/월 (30일 × 2 파일) = **$0.0006/월**
  
**총 예상 비용**: **$1/월 미만** 💰

---

## 🎯 사용 가이드

### 백업 확인
```bash
# SSH 접속
ssh -i ~/.ssh/jangpyosa ubuntu@43.201.0.129

# S3 백업 확인
aws s3 ls s3://jangpyosa-backup/backups/ --recursive --human-readable

# 백업 로그 확인
tail -f /var/log/jangpyosa-s3-backup.log

# 로컬 백업 확인
ls -lh /home/ubuntu/backups/jangpyosa/
```

### 수동 백업
```bash
# SSH 접속
ssh -i ~/.ssh/jangpyosa ubuntu@43.201.0.129

# 로컬 DB 백업
sudo /home/ubuntu/scripts/backup-db.sh

# S3 백업
sudo -E /home/ubuntu/scripts/backup-to-s3-fixed.sh
```

### 백업 복원
```bash
# S3에서 다운로드
aws s3 cp s3://jangpyosa-backup/backups/source/jangpyosa-source-YYYYMMDD-HHMMSS.tar.gz /tmp/

# 압축 해제
tar -xzf /tmp/jangpyosa-source-YYYYMMDD-HHMMSS.tar.gz -C /home/ubuntu/jangpyosa-restore/

# DB 복원
aws s3 cp s3://jangpyosa-backup/backups/database/dev.db.backup-YYYYMMDD-HHMMSS.gz /tmp/
gunzip /tmp/dev.db.backup-YYYYMMDD-HHMMSS.gz
cp /tmp/dev.db.backup-YYYYMMDD-HHMMSS /home/ubuntu/jangpyosa/apps/api/prisma/dev.db
```

### 코드 동기화
```bash
# 샌드박스에서 실행
cd /home/user/webapp

# 소스코드만 빠르게 동기화 (권장)
./sync-code-only.sh

# EC2에서 서비스 재시작
ssh -i ~/.ssh/jangpyosa ubuntu@43.201.0.129 "pm2 restart jangpyosa-api"
```

---

## 📝 주의사항

### 1. AWS 자격증명 보안
- ⚠️ Access Key는 절대 공개 저장소에 커밋하지 마세요
- ✅ `/home/ubuntu/.aws/credentials` 파일 권한: `600`
- ✅ 정기적으로 Access Key 교체 권장 (90일마다)

### 2. 백업 모니터링
- ✅ 매일 백업 로그 확인: `tail /var/log/jangpyosa-s3-backup.log`
- ✅ S3 버킷 크기 모니터링
- ✅ 백업 실패 시 알림 설정 권장

### 3. 비용 관리
- ✅ S3 Lifecycle Policy 설정 권장:
  - 30일 후 Standard-IA로 전환
  - 90일 후 Glacier로 전환
  - 180일 후 자동 삭제

---

## 🔄 S3 Lifecycle Policy 설정 (권장)

AWS Console → S3 → jangpyosa-backup → Management → Lifecycle rules:

```json
{
  "Rules": [
    {
      "Id": "jangpyosa-backup-lifecycle",
      "Status": "Enabled",
      "Filter": {
        "Prefix": "backups/"
      },
      "Transitions": [
        {
          "Days": 30,
          "StorageClass": "STANDARD_IA"
        },
        {
          "Days": 90,
          "StorageClass": "GLACIER"
        }
      ],
      "Expiration": {
        "Days": 180
      }
    }
  ]
}
```

---

## 📚 참고 문서

- `BACKUP-AND-SYNC-COMPLETE.md` - 전체 시스템 요약
- `AWS-SETUP-GUIDE.md` - AWS S3 백업 상세 가이드
- `LIGHTSAIL-IAM-SETUP.md` - Lightsail IAM 설정 가이드
- `IAM-POLICY-SETUP.md` - IAM 정책 설정 가이드
- `README-SYNC.md` - 동기화 시스템 사용 가이드

---

## ✅ 최종 체크리스트

### AWS 설정
- [x] IAM 사용자 생성 (`jangpyosa-backup-user`)
- [x] S3 정책 추가 (`JangpyosaS3BackupPolicy` + `AmazonS3FullAccess`)
- [x] Access Key 생성
- [x] EC2에 AWS 자격증명 설정
- [x] S3 버킷 생성 (`jangpyosa-backup`)
- [x] 버전 관리 활성화
- [x] 백업 스크립트 테스트
- [x] S3 업로드 확인

### 백업 시스템
- [x] 로컬 DB 백업 스크립트
- [x] S3 백업 스크립트 (수정버전)
- [x] Crontab 설정 (03:00, 04:00)
- [x] 백업 로그 확인
- [x] AWS 자격증명 명시적 설정
- [x] 백업 테스트 성공

### 동기화 시스템
- [x] SSH 키 설정
- [x] SSH Config 파일
- [x] 전체 동기화 스크립트
- [x] 빠른 동기화 스크립트
- [x] rsync 최적화

### 선택 사항 (미완료)
- [ ] S3 Lifecycle Policy 설정
- [ ] CloudWatch 알림 설정
- [ ] 백업 실패 알림 (Email/Slack)
- [ ] 퍼블릭 액세스 차단 (권한 부족으로 스킵)

---

## 🎉 완료!

모든 백업 및 동기화 시스템이 성공적으로 구축되었습니다!

**다음 백업 시간**:
- 로컬 DB 백업: 매일 03:00 KST
- S3 원격 백업: 매일 04:00 KST

**작성일**: 2026-02-26  
**작성자**: Claude Code Assistant  
**프로젝트**: 장표사 (jangpyosa.com)  
**사이트**: https://jangpyosa.com
