# 배포 내역 - 2026-03-04 19:30 KST

## 🔧 수정 사항

### 강남지사 매니저 리스트 문제 해결

**문제:**
- 강남지사 클릭 시 매니저 리스트에 김경섭(KSK본부 본부장)이 표시됨
- 김경섭은 KSK본부의 본부장이므로 강남지사 리스트에 나타나면 안 됨

**원인:**
- 김경섭의 `managerId` 필드가 `박지사(강남지사 지사장)`의 ID로 잘못 설정됨
- 이로 인해 박지사의 subordinates 조회 시 김경섭이 포함됨
- API `/sales/branches/:id/managers`는 organizationId로 필터하지만,
  대시보드에서 지사 매니저 표시 시 subordinates 관계를 사용하는 경우가 있음

**해결:**
- 김경섭의 `managerId`를 `null`로 수정
- HEAD_MANAGER(본부장)는 상위 매니저가 없어야 하는 것이 정상

**수정 전:**
```
김경섭:
- role: HEAD_MANAGER
- organizationName: KSK본부
- managerId: cmm8lc9jf0008xz0vxey0hecm (박지사)  ❌
```

**수정 후:**
```
김경섭:
- role: HEAD_MANAGER
- organizationName: KSK본부  
- managerId: null  ✅
```

## 📊 테스트 방법

1. https://jangpyosa.com/admin/sales/dashboard 접속
2. 슈퍼어드민 또는 본부장 계정으로 로그인
3. **강남지사** 클릭하여 매니저 리스트 확장
4. **김경섭이 리스트에 없는 것을 확인** ✅
5. 강남지사에는 **박지사(지사장), 이매니저(매니저)** 만 표시되어야 함

## 🔍 검증 결과

서버 데이터베이스 확인:
- 강남지사 소속 매니저: 박지사, 이매니저 (2명)
- 김경섭: KSK본부 소속, HEAD_MANAGER, managerId = null

## 📝 관련 스크립트

- `apps/api/src/scripts/debug-gangnam-issue.ts` - 문제 디버깅 스크립트
- `apps/api/src/scripts/fix-kim-manager-id.ts` - 수정 스크립트

