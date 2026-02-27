# 장표사 프로젝트 백업 완료 보고서

**백업 일시**: 2026-02-27 22:25 KST  
**프로젝트명**: 장표사 (jangpyosa)  
**최종 커밋**: 44908b2 - DB 정리 완료

---

## 📦 백업 위치

### AWS 서버 백업
- **경로**: `/home/ubuntu/backups/comprehensive_2026-02-28_07-25-43.tar.gz`
- **크기**: 16 MB
- **서버**: jangpyosa.com (ubuntu@jangpyosa.com)

### 로컬 샌드박스 백업
- **경로**: `/home/user/webapp/backups/comprehensive_2026-02-27_22-25-57.tar.gz`
- **크기**: 16 MB

---

## 📋 백업 내용

### 1. 데이터베이스 (SQLite)
- ✅ **dev.db.backup** (872 KB) - 바이너리 백업
- ✅ **dev.db.sql** (215 KB) - SQL 덤프 (복원 가능)

### 2. 소스코드
- ✅ **전체 소스코드 압축** (16 MB)
  - `node_modules` 제외
  - `.git` 제외
  - `.next` 빌드 캐시 제외
  - `dist` 빌드 결과 제외

### 3. 설정 파일
- ✅ PM2 프로세스 설정 (pm2_processes.json)
- ✅ 시스템 정보 (system_info.txt)
- ⚠️ 환경 변수 파일 (.env) - 서버에 없음 (환경 변수는 시스템 레벨에서 관리)

### 4. 사용자 데이터 요약
- ✅ 관리자 계정 정보
- ✅ 장애인 직원 계정 정보
- ✅ 역할별 계정 통계

---

## 👥 계정 현황

### 관리자 계정 (3명)

| 역할 | 아이디 | 이름 | 전화번호 | 비밀번호 |
|------|--------|------|----------|----------|
| BUYER | pema_admin | 김관리자 | 010-1000-0001 | test1234 |
| BUYER | public_admin | 이관리자 | 010-2000-0001 | test1234 |
| SUPPLIER | standard_admin | 박관리자 | 010-3000-0001 | test1234 |

### 장애인 직원 계정 (42명)

#### 페마연구소 (15명)
- 전화번호: `010-1001-0001` ~ `010-1001-0015`
- 비밀번호: 모두 `test1234`
- 예시: 김철수(010-1001-0001), 이영희(010-1001-0002), 박민수(010-1001-0003)

#### 공공기관A (12명)
- 전화번호: `010-2001-0001` ~ `010-2001-0012`
- 비밀번호: 모두 `test1234`
- 예시: 서준영(010-2001-0001), 구민아(010-2001-0002), 신동혁(010-2001-0003)

#### 행복한표준사업장 (15명)
- 전화번호: `010-3001-0001` ~ `010-3001-0015`
- 비밀번호: 모두 `test1234`
- 예시: 차승환(010-3001-0001), 하유진(010-3001-0002), 추민호(010-3001-0003)

---

## 🔧 데이터베이스 정리 완료 내역

### ✅ 전화번호 형식 통일
- **이전**: 혼재 (`010-1234-5678`, `01012345678`, `1012345678`)
- **이후**: 통일 (`01012345678` - 11자리, 하이픈 없음)
- **결과**: 로그인 시 자동 정규화로 모든 형식 지원

### ✅ User ↔ DisabledEmployee 연결
- **employeeId 매핑**: 100% 완료 (42/42명)
- **companyId 매핑**: 100% 완료 (42/42명)
- **중복 User 레코드**: 모두 제거 (39개 삭제)

### ✅ 연차 시스템 연동
- API 엔드포인트: `GET /annual-leave/employee/:employeeId`
- 응답 필드: `totalGenerated`, `used`, `remaining`
- 자동 계산: 입사일 기반 연차 자동 생성

---

## 🚀 배포 상태

### AWS 서버 (jangpyosa.com)

#### PM2 프로세스
```
┌────┬──────────────────┬─────────┬────────┬──────────┐
│ id │ name             │ mode    │ uptime │ status   │
├────┼──────────────────┼─────────┼────────┼──────────┤
│ 62 │ jangpyosa-api    │ fork    │ 77m    │ online   │
│ 61 │ jangpyosa-web    │ fork    │ 13m    │ online   │
└────┴──────────────────┴─────────┴────────┴──────────┘
```

#### Git 정보
- **현재 커밋**: `44908b2`
- **브랜치**: `main`
- **메시지**: "chore: DB 정리 완료 - 모든 장애인 직원 계정 정리 및 연결"

#### 서비스 URL
- **웹사이트**: https://jangpyosa.com
- **관리자 로그인**: https://jangpyosa.com/login
- **직원 로그인**: https://jangpyosa.com/employee/login
- **API**: http://jangpyosa.com:4000

---

## 🔄 복원 절차

### 데이터베이스 복원

#### SQL 덤프로 복원 (권장)
```bash
# 백업 압축 해제
cd /home/ubuntu/backups
tar -xzf comprehensive_2026-02-28_07-25-43.tar.gz

# DB 복원
cd comprehensive_2026-02-28_07-25-43
sqlite3 /home/ubuntu/jangpyosa/apps/api/prisma/dev.db < dev.db.sql
```

#### 바이너리 백업으로 복원
```bash
# 기존 DB 백업 (안전을 위해)
mv /home/ubuntu/jangpyosa/apps/api/prisma/dev.db /home/ubuntu/jangpyosa/apps/api/prisma/dev.db.old

# 백업에서 복원
cp /home/ubuntu/backups/comprehensive_2026-02-28_07-25-43/dev.db.backup \
   /home/ubuntu/jangpyosa/apps/api/prisma/dev.db
```

### 소스코드 복원
```bash
# 백업 압축 해제
cd /home/ubuntu/backups
tar -xzf comprehensive_2026-02-28_07-25-43.tar.gz

# 소스코드 추출
cd comprehensive_2026-02-28_07-25-43
tar -xzf jangpyosa_source_2026-02-28_07-25-43.tar.gz -C /home/ubuntu/jangpyosa

# 의존성 설치 및 빌드
cd /home/ubuntu/jangpyosa
npm install
npm run build

# 서비스 재시작
pm2 restart all
```

### PM2 프로세스 복원
```bash
# PM2 설정 복원
pm2 delete all
pm2 start /home/ubuntu/backups/comprehensive_2026-02-28_07-25-43/pm2_processes.json
pm2 save
```

---

## 🧪 테스트 검증

### 로그인 테스트
```bash
# 장애인 직원 로그인 테스트
curl -X POST https://jangpyosa.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"identifier":"010-1001-0001","password":"test1234"}'

# 관리자 로그인 테스트
curl -X POST https://jangpyosa.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"identifier":"pema_admin","password":"test1234"}'
```

### 연차 조회 테스트
```bash
# employeeId: cmm4x583s000iczhk2vetm4b1 (김철수)
curl -X GET "http://127.0.0.1:4000/annual-leave/employee/cmm4x583s000iczhk2vetm4b1?year=2026" \
  -H "Authorization: Bearer {JWT_TOKEN}"
```

---

## 📊 주요 통계

### 코드 통계
- **총 파일 수**: ~1,000개 (node_modules 제외)
- **소스코드 크기**: 16 MB (압축)
- **데이터베이스 크기**: 872 KB

### 데이터 통계
- **총 사용자 수**: 45명 (관리자 3명 + 직원 42명)
- **회사 수**: 3개 (페마연구소, 공공기관A, 행복한표준사업장)
- **장애인 직원 수**: 42명
- **연차 데이터**: 자동 계산 및 관리

---

## 🎯 완료된 주요 기능

### ✅ 인증 시스템
- [x] 관리자 로그인 (아이디/비밀번호)
- [x] 장애인 직원 로그인 (핸드폰/비밀번호)
- [x] 전화번호 자동 정규화
- [x] JWT 토큰 인증

### ✅ 연차 관리
- [x] 입사일 기반 자동 계산
- [x] 연차 발생/사용/잔여 추적
- [x] 관리자 대시보드 연차 현황
- [x] 직원 개인 연차 현황 카드

### ✅ 휴가 신청
- [x] 직원 휴가 신청
- [x] 관리자 승인/반려
- [x] 연차 자동 차감

### ✅ 데이터 정합성
- [x] User ↔ DisabledEmployee 연결
- [x] User ↔ Company 연결
- [x] 전화번호 형식 통일
- [x] 중복 레코드 제거

---

## 📝 백업 이력

| 날짜 | 커밋 | 설명 | 백업 파일 |
|------|------|------|-----------|
| 2026-02-27 22:25 | 44908b2 | DB 정리 완료 | comprehensive_2026-02-27_22-25-57.tar.gz |
| 2026-02-28 07:25 | 44908b2 | AWS 서버 백업 | comprehensive_2026-02-28_07-25-43.tar.gz |

---

## 🔐 보안 주의사항

### 백업 파일 보안
- ⚠️ 백업 파일에는 **실제 사용자 데이터**가 포함되어 있습니다
- ⚠️ 백업 파일을 안전한 곳에 보관하세요
- ⚠️ 백업 파일을 외부에 공유하지 마세요

### 계정 보안
- 🔒 모든 테스트 계정 비밀번호는 `test1234`입니다
- 🔒 프로덕션 환경에서는 **반드시 비밀번호를 변경**하세요
- 🔒 관리자 계정은 별도의 강력한 비밀번호를 사용하세요

---

## 📞 문의 및 지원

- **프로젝트**: https://github.com/masolshop/jangpyosa
- **웹사이트**: https://jangpyosa.com
- **API 상태**: http://jangpyosa.com:4000/health

---

**백업 완료 일시**: 2026-02-27 22:30 KST  
**작성자**: AI Assistant  
**상태**: ✅ 모든 백업 완료 및 검증됨
