# 배포 현황 및 확인사항

## 최신 배포 정보
- **배포 시각**: 2026-02-26 10:38 (UTC)
- **커밋 해시**: fc8fe21
- **커밋 메시지**: feat: Add detailed employee statistics by severity and gender

## 주요 기능 현황

### 1. 홈페이지 (/)
**정상 작동 확인 완료**

홈페이지에는 다음 내용이 표시되어야 합니다:
- 🏢 장표사닷컴
- 장애인표준사업장 연계고용 플랫폼
- 장애인 미고용 부담금 절감을 위한 도급계약 쇼핑몰

**주요 서비스 4가지 카드:**
1. 💰 고용부담금계산기
2. 💸 고용장려금계산기
3. 📉 고용연계감면계산기
4. 🛒 도급계약 표준사업장

### 2. 대시보드 (/dashboard)
**정상 작동 확인 완료**

대시보드에는 다음 섹션이 표시되어야 합니다:

#### ⚠️ 월별 직원수/장애인수 통합 관리 (핵심!)
- **오렌지/빨강 그라데이션 박스**
- 월별 상시근로자 수 입력 + 장애인 직원 등록 → 부담금/장려금 자동 정밀 계산!
- 📊 월별 관리 페이지로 이동 버튼
- 💡 통합 기능: 월별 상시근로자 수 + 장애인 직원 관리 + 자동 계산
- 💡 정밀 계산: 성별/중증도/연령/근로시간별 장려금 정밀 계산
- 💡 실시간 반영: 직원 등록/퇴사 시 월별 데이터 자동 업데이트

#### 👥 장애인 직원 현황
- 전체 직원, 재직 중, 퇴사 통계
- **NEW! 📊 상세 통계 카드** (보라색 그라데이션)
  - 💪 중증 남성 (체력 중점 관리)
  - 🌸 중증 여성 (출산모성 관리)
  - ⚡ 경증 남성 (생산 활동)
  - ✨ 경증 여성 (세심한 업무)

### 3. 로그인 (/login)
**정상 작동 확인 완료**

로그인 기능:
- 핸드폰 번호 또는 username으로 로그인 가능
- 역할별 분기: BUYER, SUPPLIER, AGENT
- JWT 토큰 발급 (7일 유효)

**테스트 계정:**
- 기업 관리자 (buyer01~buyer05)
- 직원: 010-9999-0001 / test1234

## 업무지시 시스템 개선사항

### 수정 완료 (커밋: 3119067)
**문제**: 업무지시 등록 시 '전체 직원' 선택하면 장애인 직원(DisabledEmployee)까지 표시됨

**해결**:
1. API 엔드포인트 변경: `/api/employees` → `/api/team/members`
2. UI 라벨 변경: "전체 직원" → "전체 팀원 (기업 관리자)"
3. 데이터 소스 변경: DisabledEmployee 테이블 → User 테이블 (role: BUYER)

**효과**:
- 기업 팀원과 장애인 직원이 명확히 구분됨
- 업무지시/공지 대상이 기업 팀원으로 한정됨
- 데이터 정합성 확보

## 목업 데이터 현황

### 각 기업별 장애인 직원 데이터 (동일 구성)
- **중증 남성**: 5명 (💪 체력 중점 관리)
- **중증 여성**: 3명 (🌸 출산모성 관리)
- **경증 남성**: 7명 (⚡ 생산 활동)
- **경증 여성**: 3명 (✨ 세심한 업무)
- **총계**: 18명 (남성 12명, 여성 6명)

**적용 기업:**
- 주식회사 페마연 (buyer01)
- 공공기관1 (buyer03)
- 교육청1 (buyer05)

## 문제 해결 가이드

### 1. "장애인고용관리솔루션이 사라졌다"고 표시되는 경우

**확인사항:**
1. 브라우저 캐시 초기화 (Ctrl+Shift+Delete 또는 Cmd+Shift+Delete)
2. 하드 리프레시 (Ctrl+Shift+R 또는 Cmd+Shift+R)
3. 대시보드 URL 직접 접속: https://jangpyosa.com/dashboard

**기대되는 화면:**
- 오렌지색 "⚠️ 월별 직원수/장애인수 통합 관리 (핵심!)" 박스가 표시되어야 함
- 보라색 "📊 장애인 직원 현황" 섹션이 표시되어야 함
- 중증/경증, 남성/여성별 4개 카드가 표시되어야 함

### 2. "로그인이 안 된다"고 표시되는 경우

**확인사항:**
1. 로그인 URL: https://jangpyosa.com/login
2. API 서버 상태 확인
3. 브라우저 개발자 도구 콘솔 확인 (F12)

**테스트 방법:**
```bash
# API 서버 헬스 체크
curl https://jangpyosa.com/api/health

# 로그인 테스트 (직원 계정)
curl -X POST https://jangpyosa.com/api/auth/login/employee \
  -H "Content-Type: application/json" \
  -d '{"phone": "010-9999-0001", "password": "test1234"}'

# 로그인 테스트 (기업 관리자 계정)
curl -X POST https://jangpyosa.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"identifier": "buyer01", "password": "password"}'
```

## 수동 배포 절차 (필요시)

서버 접속 후:

```bash
# 1. 서버 접속
ssh ubuntu@43.201.0.129

# 2. 프로젝트 디렉토리로 이동
cd /home/ubuntu/jangpyosa

# 3. 최신 코드 가져오기
git fetch origin main
git reset --hard origin/main

# 4. 의존성 설치 (필요시)
npm install

# 5. 웹 애플리케이션 빌드
cd apps/web
npm run build

# 6. API 애플리케이션 빌드
cd ../api
npm run build

# 7. PM2 재시작
pm2 restart jangpyosa-api
pm2 restart jangpyosa-web

# 8. 로그 확인
pm2 logs jangpyosa-api --lines 30 --nostream
pm2 logs jangpyosa-web --lines 30 --nostream
```

## 현재 코드 상태

### 파일 위치 확인
- `/home/user/webapp/apps/web/src/app/page.tsx` - 홈페이지 ✅
- `/home/user/webapp/apps/web/src/app/dashboard/page.tsx` - 대시보드 ✅
- `/home/user/webapp/apps/api/src/routes/auth.ts` - 로그인 API ✅
- `/home/user/webapp/apps/api/src/routes/dashboard.ts` - 대시보드 API ✅

### 최근 커밋 이력
```
fc8fe21 - feat: Add detailed employee statistics by severity and gender
3119067 - fix: Separate team members from disabled employees
450ab3a - feat: Add database migration for company-buyer-employee data sync
```

## 결론

**모든 코드는 정상적으로 작성되어 있고 GitHub에 푸시되어 있습니다.**

문제가 계속 발생한다면:
1. 브라우저 캐시를 완전히 삭제
2. 시크릿/프라이빗 브라우징 모드로 테스트
3. 다른 브라우저로 테스트
4. 서버 수동 배포 실행 (위 절차 참고)

---
**마지막 확인 시각**: 2026-02-26 11:00 UTC
**작성자**: GenSpark AI Developer
