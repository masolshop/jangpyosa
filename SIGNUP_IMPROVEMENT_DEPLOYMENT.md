# 매니저 회원가입 개선 - AWS 배포 가이드

## 📋 변경 사항 요약

### 1. UI 변경
- ✅ '영업 사원 전용' → '본부지사매니저전용' 표기 변경
- ✅ 로그인/회원가입 모달에 X 닫기 버튼 추가 (항상 표시)

### 2. 회원가입 프로세스 개선
- ✅ 비밀번호 확인 아래 **본부 선택** 드롭다운 추가
- ✅ 본부 선택 시 **소속 지사 리스트** 동적 로드
- ✅ 지사 선택 가능 (선택사항, 미선택 시 본부 직속)
- ✅ '슈퍼어드민이 배정합니다' 안내 문구 삭제

### 3. 백엔드 로직
- ✅ 회원가입 시 `managerId` 파라미터 필수 (본부 또는 지사 ID)
- ✅ 신규 가입자는 `isActive=false`로 설정 (승인 대기 상태)
- ✅ 로그인 시 `isActive` 체크 추가 (비활성 계정 로그인 차단)
- ✅ `GET /sales/organizations` 엔드포인트로 본부/지사 목록 제공

### 4. 승인 프로세스
- ✅ 가입 완료 후 '슈퍼어드민 승인 후 로그인 가능' 안내 메시지 표시
- ✅ 슈퍼어드민이 영업 관리 페이지에서 승인 필요

---

## 🚀 AWS 배포 방법

### 방법 1: 한 줄 명령어 (권장)

AWS 서버에 SSH 접속 후 다음 명령어를 **한 번에** 실행:

```bash
cd /home/ubuntu/jangpyosa && git fetch origin && git reset --hard origin/main && cd apps/api && npm run build && cd ../web && npm run build && cd ../.. && pm2 restart jangpyosa-api && pm2 restart jangpyosa-web && pm2 list
```

### 방법 2: 단계별 실행

```bash
# 1. SSH 접속
ssh ubuntu@43.201.0.129

# 2. 프로젝트 디렉토리로 이동
cd /home/ubuntu/jangpyosa

# 3. 최신 코드 가져오기
git fetch origin
git reset --hard origin/main

# 4. API 빌드
cd apps/api
npm run build

# 5. Web 빌드
cd ../web
npm run build

# 6. PM2 재시작
cd ../..
pm2 restart jangpyosa-api
pm2 restart jangpyosa-web

# 7. 상태 확인
pm2 list
pm2 logs --lines 50
```

---

## 🧪 테스트 방법

### 1. 회원가입 페이지 확인
**URL:** https://jangpyosa.com/admin/sales

**확인 항목:**
- [ ] 페이지 제목: '본부지사매니저전용'
- [ ] 로그인 모달에 X 닫기 버튼
- [ ] 회원가입 모달에 X 닫기 버튼

### 2. 회원가입 플로우 테스트

#### Step 1: 실명인증
1. 성명 입력
2. 주민등록번호 입력 (앞 6자리 + 뒤 7자리)
3. [실명인증] 버튼 클릭
4. ✅ "실명인증이 완료되었습니다!" 알림 확인

#### Step 2: 회원 정보 입력
1. 인증된 이름 (읽기 전용) 확인
2. 핸드폰번호 입력 (예: 01012345678)
3. 이메일 입력 (선택사항)
4. 비밀번호 입력 (최소 6자)
5. 비밀번호 확인 입력

#### Step 3: 본부/지사 선택 ⭐ 새 기능
1. **본부 선택** 드롭다운 클릭
   - [ ] 등록된 본부 목록이 표시되는지 확인
2. 본부를 선택하면
   - [ ] 자동으로 해당 본부의 지사 목록이 로드되는지 확인
3. **지사 선택** 드롭다운 (본부 선택 시에만 표시)
   - [ ] "본부 직속" 옵션 확인
   - [ ] 해당 본부 소속 지사 목록 확인
4. [회원가입] 버튼 클릭

#### Step 4: 가입 완료
- [ ] 알림 메시지 확인: "회원가입이 완료되었습니다! 슈퍼어드민 승인 후 로그인이 가능합니다."
- [ ] 자동으로 로그인 화면으로 전환되는지 확인

### 3. 로그인 제한 테스트 (승인 전)

1. 방금 가입한 계정으로 로그인 시도
2. **기대 결과:**
   - [ ] 에러 메시지: "비활성 상태의 계정입니다. 관리자에게 문의하세요"
   - [ ] 로그인 차단 확인

### 4. 슈퍼어드민 승인 테스트

#### 슈퍼어드민 로그인
**URL:** https://jangpyosa.com/admin/login
- **ID:** 01063529091
- **PW:** admin123

#### 영업 관리 페이지 접속
**URL:** https://jangpyosa.com/admin/sales-management

1. [목록 보기] 탭 클릭
2. 신규 가입자 찾기
3. 확인 사항:
   - [ ] 상태: 비활성 (빨간색 배지)
   - [ ] 관리 버튼: "활성화" 버튼 확인
4. [활성화] 버튼 클릭
5. 성공 메시지 확인
6. 상태가 "활성" (초록색 배지)으로 변경되는지 확인

### 5. 승인 후 로그인 테스트

1. 매니저 로그인 페이지 이동: https://jangpyosa.com/admin/sales
2. 방금 승인한 계정으로 로그인 시도
3. **기대 결과:**
   - [ ] 로그인 성공
   - [ ] 대시보드로 리다이렉트: https://jangpyosa.com/admin/sales/dashboard
   - [ ] 매니저 정보 정상 표시

---

## 🔧 문제 해결

### PM2 프로세스 확인
```bash
pm2 list
```

**기대 출력:**
```
┌─────┬────────────────────┬─────────────┬─────────┬─────────┐
│ id  │ name               │ mode        │ ↺       │ status  │
├─────┼────────────────────┼─────────────┼─────────┼─────────┤
│ 0   │ jangpyosa-api      │ cluster     │ 0       │ online  │
│ 1   │ jangpyosa-web      │ cluster     │ 0       │ online  │
└─────┴────────────────────┴─────────────┴─────────┴─────────┘
```

### 로그 확인
```bash
# 전체 로그 (최근 50줄)
pm2 logs --lines 50

# API 로그만
pm2 logs jangpyosa-api --lines 20

# Web 로그만
pm2 logs jangpyosa-web --lines 20
```

### 프로세스 재시작 (문제 발생 시)
```bash
# 개별 재시작
pm2 restart jangpyosa-api
pm2 restart jangpyosa-web

# 전체 재시작
pm2 restart all
```

### 빌드 실패 시
```bash
# API 빌드 재시도
cd /home/ubuntu/jangpyosa/apps/api
npm run build

# Web 빌드 재시도
cd /home/ubuntu/jangpyosa/apps/web
npm run build
```

---

## 📊 API 엔드포인트

### 신규 추가
- `GET /sales/organizations` - 본부/지사 목록 조회

### 수정된 엔드포인트
- `POST /sales/auth/signup` - `managerId` 파라미터 필수, `isActive=false` 설정
- `POST /sales/auth/login` - `isActive` 체크 추가

---

## 🔗 주요 URL

| 페이지 | URL |
|--------|-----|
| 슈퍼어드민 로그인 | https://jangpyosa.com/admin/login |
| 매니저 로그인/가입 | https://jangpyosa.com/admin/sales |
| 영업 관리 (슈퍼어드민) | https://jangpyosa.com/admin/sales-management |
| 매니저 대시보드 | https://jangpyosa.com/admin/sales/dashboard |

---

## 📝 커밋 정보

- **주요 커밋:** `47d2e93` - 매니저 회원가입 개선
- **배포 스크립트:** `0d21fb2` - 배포 스크립트 추가
- **GitHub:** https://github.com/masolshop/jangpyosa

---

## ✅ 배포 체크리스트

- [ ] GitHub에 최신 코드 푸시 완료
- [ ] AWS 서버 SSH 접속
- [ ] 최신 코드 가져오기 (`git reset --hard origin/main`)
- [ ] API 빌드 성공
- [ ] Web 빌드 성공
- [ ] PM2 재시작 완료
- [ ] 프로세스 상태 확인 (online)
- [ ] 회원가입 페이지 접속 확인
- [ ] 본부/지사 선택 UI 확인
- [ ] 회원가입 → 승인 대기 플로우 테스트
- [ ] 슈퍼어드민 승인 기능 테스트
- [ ] 승인 후 로그인 테스트

---

**배포 완료 후 이 문서를 체크리스트로 사용하여 모든 기능을 검증하세요!** ✅
