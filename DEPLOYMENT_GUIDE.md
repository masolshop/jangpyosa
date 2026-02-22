# 🚀 프로덕션 배포 가이드

## ⚠️ 중요: 표준사업장 권한 마이그레이션 필수!

현재 코드 업데이트로 **표준사업장(SUPPLIER)도 장애인 직원 관리 기능을 사용할 수 있도록** 변경되었습니다.

하지만 **기존 표준사업장 계정**은 `buyerProfile`이 없어서 다음과 같은 에러가 발생합니다:
```
❌ 출퇴근 현황 조회 실패
❌ 기업 정보가 없습니다
```

## 📋 배포 절차

### 1️⃣ 서버 접속
```bash
ssh ubuntu@43.201.0.129
```

### 2️⃣ 프로젝트 이동 및 최신 코드 가져오기
```bash
cd /home/ubuntu/jangpyosa
git pull origin main
```

### 3️⃣ 데이터베이스 마이그레이션 (필수!)

**방법 A: SQL 스크립트 실행 (권장)**
```bash
cd apps/api
sqlite3 prisma/dev.db < scripts/update-supplier-profiles.sql
```

**방법 B: TypeScript 스크립트 실행**
```bash
cd apps/api
npm run fix:supplier-buyer-profile
```

### 4️⃣ API 서버 빌드 및 재시작
```bash
cd /home/ubuntu/jangpyosa/apps/api
npm run build
pm2 restart jangpyosa-api
```

### 5️⃣ WEB 서버 빌드 및 재시작
```bash
cd /home/ubuntu/jangpyosa/apps/web
npm run build
pm2 restart jangpyosa-web
```

### 6️⃣ 상태 확인
```bash
# PM2 프로세스 상태 확인
pm2 status

# API 로그 확인 (에러 체크)
pm2 logs jangpyosa-api --lines 50 --nostream

# WEB 로그 확인 (에러 체크)
pm2 logs jangpyosa-web --lines 50 --nostream
```

### 7️⃣ 서비스 테스트

**브라우저에서 테스트:**
1. https://jangpyosa.com 접속
2. 표준사업장 계정(supplier01)으로 로그인
3. 👥 장애인 직원 등록·관리 메뉴 클릭
4. 정상 접근 확인 ✅

**팀원 계정 테스트 (buyer0101):**
1. 초대링크로 가입한 팀원 계정으로 로그인
2. 👥 장애인 직원 등록·관리 메뉴 클릭
3. ⏰ 장애인직원근태관리 메뉴 클릭
4. 회사의 직원 데이터가 정상 출력되는지 확인 ✅

## 🔍 문제 해결

### 문제 1: "기업 정보가 없습니다" 에러
**원인**: 표준사업장 계정에 `buyerProfile`이 없음

**해결방법**:
```bash
cd /home/ubuntu/jangpyosa/apps/api
sqlite3 prisma/dev.db < scripts/update-supplier-profiles.sql
pm2 restart jangpyosa-api
```

### 문제 2: 팀원 계정이 회사 데이터를 볼 수 없음
**원인**: 팀원의 `companyId`가 올바르게 설정되지 않았거나, 코드가 업데이트되지 않음

**확인 방법**:
```bash
cd /home/ubuntu/jangpyosa/apps/api
sqlite3 prisma/dev.db

# 팀원 계정 확인
SELECT u.username, u.name, u.companyId, c.name as companyName 
FROM User u 
LEFT JOIN Company c ON c.id = u.companyId 
WHERE u.username = 'buyer0101';
```

**해결방법**:
```bash
cd /home/ubuntu/jangpyosa
git pull origin main
cd apps/api && npm run build && pm2 restart jangpyosa-api
cd ../web && npm run build && pm2 restart jangpyosa-web
```

### 문제 3: 빌드 에러 발생
**해결방법**:
```bash
cd /home/ubuntu/jangpyosa

# node_modules 재설치
cd apps/api && rm -rf node_modules && npm install
cd ../web && rm -rf node_modules && npm install

# 다시 빌드
cd apps/api && npm run build
cd ../web && npm run build

# 재시작
pm2 restart all
```

## 📊 변경 내역

### 코드 변경 (Git 커밋)
- `6ef7637` - README 업데이트 (마이그레이션 필수 안내)
- `c304c68` - 표준사업장 buyerProfile 마이그레이션 스크립트 추가
- `cec6ab3` - README 업데이트 (표준사업장 권한 확장 반영)
- `0452b99` - 표준사업장 권한 확장 (API 및 프론트엔드)

### API 변경 내역
1. **장애인 직원 관리** (`/api/employees`)
   - SUPPLIER 권한 추가 ✅
   - getUserCompany() 함수로 팀원 지원 ✅

2. **월별 부담금/장려금 관리** (`/api/employees/monthly`)
   - SUPPLIER 권한 추가 ✅
   - getUserCompany() 함수로 팀원 지원 ✅

3. **출퇴근 관리** (`/api/attendance`)
   - SUPPLIER 권한 추가 ✅
   - user.company로 팀원 지원 ✅

### 프론트엔드 변경 내역
1. `/dashboard/employees` - SUPPLIER 권한 추가
2. `/dashboard/monthly` - SUPPLIER 권한 추가
3. `/dashboard/attendance` - SUPPLIER 권한 추가

## ✅ 배포 완료 체크리스트

- [ ] 서버 접속 확인
- [ ] git pull 완료
- [ ] 데이터베이스 마이그레이션 실행
- [ ] API 빌드 성공
- [ ] API 재시작 성공
- [ ] WEB 빌드 성공
- [ ] WEB 재시작 성공
- [ ] PM2 프로세스 정상 실행 확인
- [ ] 표준사업장 로그인 테스트
- [ ] 팀원 계정 로그인 테스트
- [ ] 장애인 직원 관리 메뉴 접근 테스트
- [ ] 출퇴근 관리 메뉴 접근 테스트
- [ ] 실제 데이터 조회 확인

## 📞 문제 발생 시

문제가 지속되면 다음 정보를 확인하세요:

1. **API 로그 확인**:
   ```bash
   pm2 logs jangpyosa-api --lines 100
   ```

2. **데이터베이스 확인**:
   ```bash
   cd /home/ubuntu/jangpyosa/apps/api
   sqlite3 prisma/dev.db "SELECT COUNT(*) FROM BuyerProfile;"
   ```

3. **서비스 재시작**:
   ```bash
   pm2 restart all
   pm2 status
   ```

---

**⚠️ 마이그레이션 없이는 표준사업장과 팀원 계정이 직원 관리 기능을 사용할 수 없습니다!**
