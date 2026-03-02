# 배포 가이드 - 본부/지사 생성 UX 개선

## 📋 변경 사항

### ✨ 주요 기능
- **본부/지사 생성 방식 변경**: 전화번호/비밀번호 입력 → 기존 매니저 검색 및 선택
- **매니저 검색 UI**: 이름 또는 전화번호로 매니저 검색
- **자동 승진**: 선택된 매니저를 본부장/지사장으로 자동 승진
- **활동 로그**: 승진 내역 자동 기록

### 🔧 API 변경사항
1. **POST /sales/organizations**
   - 기존: `{ name, type, leaderName, phone, email, ... }`
   - 변경: `{ name, type, managerId, email, ... }`
   - 매니저 검증 및 승진 처리 추가
   - 트랜잭션으로 안전하게 처리

2. **GET /sales/available-managers**
   - 슈퍼어드민 접근 허용 (기존: 본부장만)
   - 검색 기능 강화 (이름, 전화번호)

3. **PATCH /sales/organizations/:id**
   - `leaderName`, `phone` 필드 제거 (수정 불가)
   - 조직명, 이메일, 메모만 수정 가능

### 🎨 프론트엔드 변경
- `/admin/organizations` 페이지 UI 개선
- 매니저 검색 및 선택 UI 추가
- 모달 너비 확장 (600px)
- 실시간 검색 결과 표시
- 선택된 매니저 강조 표시

## 🚀 배포 명령어

### EC2 Instance Connect로 접속 후 실행:

```bash
cd /home/ubuntu/jangpyosa && \
git pull origin main && \
cd apps/api && npm install && npm run build && \
cd ../web && npm install && npm run build && \
cd /home/ubuntu/jangpyosa && \
pm2 restart all && \
sleep 3 && \
pm2 list && \
echo "✅ 배포 완료! 커밋: 123410c"
```

### 원라인 명령어:
```bash
cd /home/ubuntu/jangpyosa && git pull origin main && cd apps/api && npm install && npm run build && cd ../web && npm install && npm run build && cd /home/ubuntu/jangpyosa && pm2 restart all && sleep 3 && pm2 list
```

## ✅ 배포 후 확인 사항

### 1. 서비스 상태 확인
```bash
pm2 list
```
- `jangpyosa-api`: online 상태
- `jangpyosa-web`: online 상태

### 2. 로그 확인
```bash
pm2 logs --lines 50
```

### 3. 기능 테스트

#### 슈퍼어드민 계정 (01063529091)
1. https://jangpyosa.com/admin/login 접속
2. 로그인: 01063529091 / 비밀번호
3. `/admin/organizations` 페이지 이동
4. "본부 등록" 버튼 클릭
5. **테스트 시나리오**:
   - 본부명 입력: "테스트본부"
   - 매니저 검색: 이름 또는 전화번호 입력
   - 검색 버튼 클릭
   - 검색 결과에서 매니저 선택
   - 이메일 입력 (선택사항)
   - "생성 및 본부장 임명" 버튼 클릭 (매니저 선택 후 활성화)
   - 성공 메시지 확인
   - 생성된 본부 확인
   - 매니저가 본부장으로 승진되었는지 확인

#### 지사 생성 테스트
1. "지사 등록" 버튼 클릭
2. 소속 본부 선택
3. 지사명 입력
4. 매니저 검색 및 선택
5. "생성 및 지사장 임명" 버튼 클릭
6. 생성 확인

### 4. 데이터베이스 확인
```sql
-- 본부/지사 생성 확인
SELECT id, name, type, leaderName, phone FROM Organization ORDER BY createdAt DESC LIMIT 5;

-- 매니저 승진 확인
SELECT id, name, phone, role, organizationName FROM SalesPerson WHERE role IN ('HEAD_MANAGER', 'BRANCH_MANAGER') ORDER BY updatedAt DESC LIMIT 5;

-- 활동 로그 확인
SELECT * FROM SalesActivityLog WHERE action = 'PROMOTION' ORDER BY createdAt DESC LIMIT 5;
```

## 🔍 트러블슈팅

### 문제: 매니저 검색 결과가 없음
- **원인**: 등록된 MANAGER 역할 매니저가 없음
- **해결**: 먼저 매니저 회원가입 필요

### 문제: "이미 본부장 또는 지사장으로 등록된 매니저입니다" 에러
- **원인**: 선택한 매니저가 이미 본부장/지사장임
- **해결**: MANAGER 역할인 다른 매니저 선택

### 문제: 빌드 실패
```bash
# 캐시 제거 후 재빌드
cd /home/ubuntu/jangpyosa/apps/api
rm -rf node_modules dist
npm install
npm run build

cd /home/ubuntu/jangpyosa/apps/web
rm -rf .next node_modules
npm install
npm run build
```

## 📊 배포 정보

- **커밋**: 123410c
- **브랜치**: main
- **배포일**: 2026-03-02
- **변경 파일**:
  - `apps/api/src/routes/sales.ts` (API 로직)
  - `apps/web/src/app/admin/organizations/page.tsx` (UI)

## 🎯 다음 단계

1. ✅ 본부/지사 생성 기능 테스트
2. ⏳ 실제 운영 데이터로 테스트
3. ⏳ 매니저 승진 이력 모니터링
4. ⏳ 사용자 피드백 수집
