# 슈퍼어드민 계정 정보

## 📋 계정 정보

| 항목 | 내용 |
|------|------|
| **전화번호 (ID)** | 01063529091 |
| **비밀번호** | admin123 |
| **이름** | 슈퍼관리자 |
| **이메일** | admin@jangpyosa.com |
| **역할** | SUPER_ADMIN |

## 🔗 로그인 URL

- **슈퍼어드민 로그인**: https://jangpyosa.com/admin/login
- **슈퍼어드민 대시보드**: https://jangpyosa.com/admin

## 🔐 슈퍼어드민 생성 API

### 엔드포인트
```
POST https://jangpyosa.com/api/create-super-admin
```

### 헤더
```json
{
  "Content-Type": "application/json",
  "X-Admin-Secret": "jangpyosa-super-secret-2025"
}
```

### 요청 본문
```json
{
  "phone": "01063529091",
  "name": "슈퍼관리자",
  "email": "admin@jangpyosa.com",
  "password": "admin123"
}
```

### 사용 예시 (curl)
```bash
curl -X POST https://jangpyosa.com/api/create-super-admin \
  -H "Content-Type: application/json" \
  -H "X-Admin-Secret: jangpyosa-super-secret-2025" \
  -d '{
    "phone": "01063529091",
    "name": "슈퍼관리자",
    "email": "admin@jangpyosa.com",
    "password": "admin123"
  }'
```

### 응답
```json
{
  "success": true,
  "message": "슈퍼어드민으로 업데이트되었습니다",
  "user": {
    "phone": "01063529091",
    "name": "슈퍼관리자",
    "role": "SUPER_ADMIN",
    "email": "admin@jangpyosa.com"
  }
}
```

## 🎯 슈퍼어드민 vs 매니저 구분

| 구분 | 슈퍼어드민 | 매니저 |
|------|-----------|--------|
| **역할** | SUPER_ADMIN | EMPLOYEE |
| **로그인 URL** | /admin/login | /admin/sales |
| **대시보드** | /admin | /admin/sales/dashboard |
| **권한** | 전체 시스템 관리 | 영업 관리만 |
| **접근 범위** | 영업관리, 기업관리, 표준사업장관리, 시스템설정 | 자신의 추천고객, 실적, 커미션 |

## 🔒 인증 플로우

### 슈퍼어드민 로그인
1. **로그인 페이지**: https://jangpyosa.com/admin/login
2. **아이디 입력**: 01063529091
3. **비밀번호 입력**: admin123
4. **인증 확인**: 
   - User.role === 'SUPER_ADMIN' 체크
   - 실패 시 "슈퍼어드민 권한이 없습니다" 에러
5. **토큰 저장**: localStorage에 accessToken, userRole 저장
6. **리다이렉트**: /admin (슈퍼어드민 대시보드)

### 매니저 로그인
1. **로그인 페이지**: https://jangpyosa.com/admin/sales
2. **전화번호**: 01012345001 (테스트 매니저)
3. **비밀번호**: manager123
4. **인증 확인**: 
   - User.role === 'EMPLOYEE' 체크
   - SalesPerson 레코드 확인
5. **토큰 저장**: localStorage에 managerToken 저장
6. **리다이렉트**: /admin/sales/dashboard (매니저 대시보드)

## 📁 관련 파일

### 백엔드 (API)
- `/apps/api/src/routes/super-admin.ts` - 슈퍼어드민 생성 API
- `/apps/api/src/routes/auth.ts` - 일반 로그인 API
- `/apps/api/src/routes/sales-auth.ts` - 매니저 로그인 API

### 프론트엔드 (Web)
- `/apps/web/src/app/admin/login/page.tsx` - 슈퍼어드민 로그인 페이지
- `/apps/web/src/app/admin/page.tsx` - 슈퍼어드민 대시보드
- `/apps/web/src/app/admin/layout.tsx` - 인증 레이아웃
- `/apps/web/src/app/admin/sales/page.tsx` - 매니저 로그인/가입
- `/apps/web/src/app/admin/sales/dashboard/page.tsx` - 매니저 대시보드

## 🛠️ 트러블슈팅

### 문제: 슈퍼어드민 로그인 후 매니저 대시보드로 리다이렉트
**원인**: /admin/login의 리다이렉트 경로가 잘못됨
**해결**: window.location.href = '/admin'으로 수정 (커밋 e537581)

### 문제: /admin/sales 접근 시 /admin으로 리다이렉트
**원인**: layout.tsx의 인증 체크가 /admin/sales 서브패스 미인식
**해결**: pathname?.startsWith(SALES_PATH) 조건 추가 (커밋 e9cd19c)

### 문제: 슈퍼어드민 계정이 없음
**원인**: DB에 SUPER_ADMIN 역할 사용자 없음
**해결**: POST /api/create-super-admin API로 생성 (커밋 573dd1c)

## ✅ 테스트 체크리스트

- [x] 슈퍼어드민 계정 생성/업데이트
- [x] 슈퍼어드민 로그인 (01063529091 / admin123)
- [x] 슈퍼어드민 대시보드 접근 (/admin)
- [x] 매니저 로그인 (01012345001 / manager123)
- [x] 매니저 대시보드 접근 (/admin/sales/dashboard)
- [x] 역할 분리 (SUPER_ADMIN vs EMPLOYEE)
- [x] 인증 체크 (슈퍼어드민 전용 페이지 접근 제한)

## 📝 참고사항

1. **비밀번호 변경**: 프로덕션 환경에서는 반드시 강력한 비밀번호로 변경하세요.
2. **보안 키**: X-Admin-Secret 헤더는 외부에 노출되지 않도록 주의하세요.
3. **계정 관리**: 슈퍼어드민 계정은 최소 인원만 사용하도록 관리하세요.
4. **로그 모니터링**: 슈퍼어드민 접근 로그를 정기적으로 확인하세요.
