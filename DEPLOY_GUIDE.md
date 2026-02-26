# 업무 완료 상태 수정사항 배포 가이드

## 🔧 수정 내용

업무지시 완료 상태가 업데이트되지 않는 문제를 수정했습니다.

### 문제점
- `/api/work-orders/my-work-orders` 엔드포인트가 `recipients` 관계를 사용하여 완료 상태를 조회
- 실제 완료 데이터는 `WorkOrderConfirmation` 테이블에 저장됨
- 결과: 완료 버튼을 눌러도 UI에서 상태가 업데이트되지 않음

### 해결방법
- `WorkOrderConfirmation` 테이블을 직접 조회하도록 변경
- Map 구조를 사용하여 효율적으로 확인 상태를 매핑
- `isConfirmed`, `confirmedAt`, `note` 필드를 정확히 반영

## 📦 배포 방법

서버에 SSH로 접속하여 다음 명령을 실행하세요:

```bash
# 1. 서버 접속
ssh ubuntu@15.164.103.96

# 2. 프로젝트 디렉토리로 이동
cd /home/ubuntu/jangpyosa

# 3. 최신 코드 가져오기
git pull origin main

# 4. API 서버 재시작
pm2 restart jangpyosa-api

# 5. 로그 확인
pm2 logs jangpyosa-api --lines 20

# 6. 서비스 상태 확인
pm2 status
```

## ✅ 테스트 방법

로컬에서 다음 스크립트를 실행하여 배포가 정상적으로 완료되었는지 확인:

```bash
cd /home/user/webapp
./test-work-order-status.sh
```

### 예상 결과
- ✅ 로그인 성공
- ✅ 업무지시 조회 성공 (5개)
- ✅ 완료된 업무는 `isConfirmed: true`, `confirmedAt`, `note` 표시
- ✅ 미완료 업무는 `isConfirmed: false`, 확인 시각 "미확인"

## 🎯 UI 테스트

1. https://jangpyosa.com/employee/login 접속
2. 로그인: 01099990001 / test1234
3. "📋 업무 관리" 메뉴 클릭
4. 업무 목록에서 "완료하기" 버튼 클릭
5. 완료 메모 입력 후 "✓ 완료하기" 클릭
6. **예상 동작:**
   - ✅ 상태 배지가 즉시 🟠 "대기중" → 🟢 "완료"로 변경
   - ✅ 버튼이 "완료하기" → "상세보기"로 변경
   - ✅ 완료 시각과 메모가 표시됨

## 📝 변경된 파일

- `apps/api/src/routes/work-orders.ts` (라인 447-485)
  - `recipients` include 제거
  - `WorkOrderConfirmation` 테이블 직접 조회
  - Map 구조로 효율적인 매핑

## 🔗 관련 Commit

- Commit: `ec59e24`
- 메시지: "fix: Use WorkOrderConfirmation table for work order status"
- 브랜치: `main`

## 🚨 주의사항

배포 전 반드시:
1. ✅ Git pull로 최신 코드 가져오기
2. ✅ PM2로 API 서버 재시작
3. ✅ 로그 확인하여 에러 없는지 체크
4. ✅ 테스트 스크립트로 검증

