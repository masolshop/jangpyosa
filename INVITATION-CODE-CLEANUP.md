# 초대 코드 자동 삭제 기능

## 📋 개요

초대 코드는 다음과 같은 경우에 **자동으로 삭제**됩니다:

1. **사용 완료 시**: 초대받은 사람이 가입을 완료하면 즉시 삭제
2. **만료 시**: 만료일(생성 후 7일)이 지나면 서버 시작 시 자동 삭제
3. **수동 삭제**: 초대를 생성한 사람이 직접 삭제 가능

## 🔧 기능 상세

### 1. 사용 완료 시 자동 삭제

**파일**: `apps/api/src/routes/auth.ts`

```typescript
// POST /api/auth/signup-invited
// 초대받은 사람이 가입 완료 시 초대 코드 자동 삭제
await prisma.teamInvitation.delete({
  where: { id: invitation.id }
});
```

### 2. 만료된 초대 코드 자동 정리

**파일**: `apps/api/src/index.ts`

서버 시작 시 만료된 초대 코드를 자동으로 정리합니다:

```typescript
app.listen(config.port, async () => {
  // 만료된 초대 코드 자동 삭제
  const result = await prisma.teamInvitation.deleteMany({
    where: {
      expiresAt: { lt: new Date() },
      isUsed: false
    }
  });
  console.log(`🗑️  만료된 초대 코드 ${result.count}개 자동 삭제 완료`);
});
```

### 3. 수동 삭제 API

**파일**: `apps/api/src/routes/team.ts`

```typescript
// DELETE /api/team/invite/:id
// 초대를 생성한 사람이 직접 삭제 가능
```

**사용 예시**:
```bash
curl -X DELETE https://jangpyosa.com/api/team/invite/{invitation_id} \
  -H "Authorization: Bearer {access_token}"
```

### 4. 만료된 초대 코드 수동 정리 스크립트

**파일**: `apps/api/src/scripts/cleanup-expired-invitations.mjs`

Cron Job으로 정기적으로 실행할 수 있습니다:

```bash
# 수동 실행
cd /home/ubuntu/jangpyosa/apps/api
node src/scripts/cleanup-expired-invitations.mjs

# Cron Job 설정 (매일 새벽 3시)
0 3 * * * cd /home/ubuntu/jangpyosa/apps/api && node src/scripts/cleanup-expired-invitations.mjs >> /var/log/cleanup-invitations.log 2>&1
```

## 📊 초대 코드 생명주기

```
생성 (expiresAt = now + 7일)
  ↓
[사용 대기 중]
  ↓
  ├─→ 가입 완료 → 즉시 삭제 ✅
  ├─→ 수동 삭제 → 즉시 삭제 ✅
  └─→ 7일 경과 → 서버 재시작 시 자동 삭제 ✅
```

## 🔍 초대 코드 조회

### 활성 초대 코드만 조회

```bash
# GET /api/team/invitations
# 사용되지 않은 초대 코드만 반환됩니다
```

**응답 예시**:
```json
{
  "success": true,
  "invitations": [
    {
      "id": "clxxxxx",
      "inviteCode": "ABC12345",
      "inviteUrl": "https://jangpyosa.com/signup?invite=ABC12345",
      "companyName": "행복한표준사업장",
      "role": "SUPPLIER",
      "isUsed": false,
      "expiresAt": "2026-03-01T00:00:00.000Z",
      "createdAt": "2026-02-22T00:00:00.000Z"
    }
  ]
}
```

## ⚙️ 설정

### 만료 기간 변경

**파일**: `apps/api/src/routes/team.ts`

```typescript
// 만료일 설정 (기본: 7일)
const expiresAt = new Date();
expiresAt.setDate(expiresAt.getDate() + 7); // 여기를 수정
```

## 📝 프로덕션 배포

```bash
# 1. 코드 Pull
cd /home/ubuntu/jangpyosa
git pull origin main

# 2. API 재시작 (만료된 초대 코드 자동 정리)
pm2 restart jangpyosa-api

# 3. 로그 확인
pm2 logs jangpyosa-api --nostream | grep "만료된 초대"
```

## 🎯 주요 변경사항

- ✅ **사용 완료 시**: 초대 코드 즉시 삭제 (기존 동작 유지)
- ✅ **만료 시**: 서버 시작 시 자동 삭제 추가
- ✅ **수동 삭제**: API 엔드포인트 제공 (기존 기능)
- ✅ **정리 스크립트**: Cron Job용 수동 정리 스크립트 추가

## 🔄 마이그레이션

데이터베이스 스키마 변경은 없으며, 기존 코드 로직만 수정되었습니다.

---

**작성일**: 2026-02-22  
**작성자**: AI Developer  
**버전**: 1.0.0
