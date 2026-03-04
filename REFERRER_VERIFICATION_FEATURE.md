# 🔍 추천인 매니저 핸드폰 확인 기능

**날짜**: 2026-03-05  
**기능**: 회원가입 시 추천인 매니저 핸드폰 번호 확인

## ✅ 기능 개요

고용의무기업과 표준사업장 회원가입 시 추천인 매니저의 핸드폰 번호를 입력하고 "확인" 버튼을 클릭하여 매니저 정보를 확인한 후 가입할 수 있는 기능입니다.

## 🎯 주요 기능

### 1️⃣ **핸드폰 번호 확인**
- 추천인 매니저의 핸드폰 번호 입력 (11자리)
- "확인" 버튼 클릭 또는 Enter 키로 확인
- 실시간 매니저 정보 조회 및 표시

### 2️⃣ **매니저 정보 표시**
확인 완료 시 다음 정보가 표시됩니다:
- ✅ **이름**: 매니저 성함
- 👔 **직급**: 매니저 / 지사장 / 본부장
- 🏢 **소속**: 본부/지사명 (있는 경우)

### 3️⃣ **필수 확인**
- 매니저 확인을 완료해야만 회원가입 진행 가능
- 핸드폰 번호 변경 시 재확인 필요

## 📍 구현 내용

### 백엔드 API

#### 엔드포인트
```
POST /sales/verify-referrer
```

#### 요청
```json
{
  "phone": "01012345678"
}
```

#### 응답 (성공)
```json
{
  "success": true,
  "manager": {
    "id": "manager-id",
    "name": "김철수",
    "phone": "01012345678",
    "role": "MANAGER",
    "roleName": "매니저",
    "organizationName": "서울본부"
  },
  "message": "김철수 매니저 확인 완료"
}
```

#### 응답 (실패)
```json
{
  "success": false,
  "error": "등록된 매니저를 찾을 수 없습니다"
}
```

#### 특징
- 🔓 **인증 불필요**: 회원가입 시 사용하므로 인증 토큰 없이 호출 가능
- ✅ **활성 매니저만**: `isActive: true` 매니저만 조회
- 📞 **정규화된 검색**: 하이픈 제거하고 순수 숫자로 검색

### 프론트엔드 API

#### 엔드포인트
```
POST /api/sales/verify-referrer
```

백엔드 API를 호출하는 Next.js API 라우트입니다.

### UI 구현

#### 1. 상태 관리
```typescript
const [referrerPhone, setReferrerPhone] = useState("");
const [referrerVerified, setReferrerVerified] = useState(false);
const [referrerInfo, setReferrerInfo] = useState<{
  name: string;
  role: string;
  organizationName: string;
} | null>(null);
const [verifyingReferrer, setVerifyingReferrer] = useState(false);
```

#### 2. 확인 함수
```typescript
async function verifyReferrer() {
  const cleanPhone = referrerPhone.replace(/\D/g, "");
  if (cleanPhone.length !== 11) {
    setMsg("핸드폰 번호 11자리를 입력하세요");
    return;
  }
  
  setVerifyingReferrer(true);
  // ... API 호출 및 결과 처리
}
```

#### 3. UI 컴포넌트

**입력 필드 + 확인 버튼**
```tsx
<div style={{ display: "flex", gap: 8 }}>
  <input
    type="tel"
    placeholder="010-9876-5432"
    value={referrerPhone}
    onChange={handleReferrerPhoneChange}
    onKeyDown={handleReferrerPhoneKeyDown}
    maxLength={13}
  />
  <button
    onClick={verifyReferrer}
    disabled={verifying || phone.length !== 13}
  >
    {verifying ? "확인 중..." : verified ? "✓ 확인됨" : "확인"}
  </button>
</div>
```

**확인 완료 정보 표시**
```tsx
{referrerVerified && referrerInfo && (
  <div style={{ background: "#f0fdf4", border: "2px solid #10b981" }}>
    <p>✅ 추천인 매니저 확인 완료</p>
    <p>
      <strong>이름:</strong> {referrerInfo.name}<br/>
      <strong>직급:</strong> {referrerInfo.role}<br/>
      <strong>소속:</strong> {referrerInfo.organizationName}
    </p>
  </div>
)}
```

## 🎨 UI 디자인

### 확인 버튼 상태별 색상

| 상태 | 색상 | 텍스트 |
|------|------|--------|
| **확인 전** | 파란색 (#0070f3) | "확인" |
| **확인 중** | 회색 (#ccc) | "확인 중..." |
| **확인 완료** | 초록색 (#10b981) | "✓ 확인됨" |

### 정보 표시 박스
- **배경색**: 연한 초록 (#f0fdf4)
- **테두리**: 2px 초록색 (#10b981)
- **아이콘**: ✅ 녹색 체크마크
- **폰트**: 13px, 굵은 제목 + 일반 내용

## 🧪 테스트 방법

### 1. 표준사업장 회원가입
1. https://jangpyosa.com/signup 접속
2. "표준사업장 회원가입" 선택
3. 사업자번호 인증 완료
4. 추천인 매니저 핸드폰 번호 입력
5. "확인" 버튼 클릭
6. 매니저 정보 확인
7. 회원가입 계속 진행

### 2. 고용의무기업 회원가입
1. https://jangpyosa.com/signup 접속
2. "고용의무기업 회원가입" 선택
3. 사업자번호 인증 완료
4. 추천인 매니저 핸드폰 번호 입력
5. "확인" 버튼 클릭
6. 매니저 정보 확인
7. 회원가입 계속 진행

### 3. 유효성 검사 테스트

#### ✅ 성공 케이스
- 등록된 활성 매니저의 핸드폰 번호 입력
- → 초록색 박스에 매니저 정보 표시

#### ❌ 실패 케이스
- 미등록 핸드폰 번호 입력
  - → "등록된 매니저를 찾을 수 없습니다" 메시지
- 11자리 미만 입력
  - → "핸드폰 번호 11자리를 입력하세요" 메시지
- 비활성 매니저의 번호 입력
  - → "등록된 매니저를 찾을 수 없습니다" 메시지

## 📊 데이터베이스 구조

### SalesPerson 테이블
```prisma
model SalesPerson {
  id               String   @id @default(cuid())
  phone            String   @unique
  name             String
  role             String   // MANAGER, BRANCH_MANAGER, HEAD_MANAGER
  isActive         Boolean  @default(true)
  organizationName String?
  // ... 기타 필드
}
```

## 🔐 보안

### 공개 접근 가능한 이유
1. **회원가입 전**: 사용자가 아직 인증되지 않은 상태
2. **제한된 정보**: 매니저의 이름과 직급만 노출 (민감 정보 없음)
3. **활성 매니저만**: `isActive: true` 매니저만 조회
4. **필수 검증**: 실제 회원가입 시 백엔드에서 추가 검증

## 🚀 배포 정보

### 파일 변경
- ✅ `apps/api/src/routes/sales.ts` - 백엔드 API 추가
- ✅ `apps/web/src/app/api/sales/verify-referrer/route.ts` - 프론트엔드 API 추가
- ✅ `apps/web/src/app/signup/page.tsx` - UI 구현

### 배포 단계
1. ✅ Git 커밋 및 푸시 (`4a3dad4`)
2. ✅ 프로덕션 서버 git pull
3. ✅ API 재시작 (PM2)
4. ✅ Next.js 빌드
5. ✅ Web 재시작 (PM2)

### 서비스 상태
- **API**: ✅ 정상 (localhost:4000)
- **Web**: ✅ 정상 (localhost:3003, Ready in 435ms)
- **새 라우트**: `/api/sales/verify-referrer` ✅

## 📝 사용자 경험 개선

### Before (개선 전)
- 매니저 핸드폰 번호만 입력
- 번호가 맞는지 확인 불가
- 회원가입 후 에러 발생 시 처음부터 다시

### After (개선 후)
- ✅ 매니저 핸드폰 번호 입력 → 확인 버튼 클릭
- ✅ 실시간으로 매니저 이름, 직급, 소속 확인
- ✅ 올바른 매니저 확인 후 안심하고 회원가입 진행
- ✅ 잘못된 번호 입력 시 즉시 피드백

## 🔗 관련 문서

- `SIGNUP_MESSAGE_UPDATE.md` - 인증 메시지 변경
- `AUTHENTICATION_METHODS.md` - 인증 방식 설명
- `BRANCH_TOGGLE_FEATURE.md` - 지사 목록 토글

## ✨ 결론

추천인 매니저 핸드폰 확인 기능이 성공적으로 구현 및 배포되었습니다. 사용자는 회원가입 시 매니저의 핸드폰 번호를 입력하고 실시간으로 매니저 정보를 확인한 후 안전하게 가입할 수 있습니다.

**상태**: ✅ **배포 완료 및 정상 작동 중**
