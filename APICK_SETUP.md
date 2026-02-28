# APICK API 설정 가이드

## 1. APICK API 키 발급
1. https://apick.app/ 접속
2. 회원가입 및 로그인
3. API 키 발급

## 2. 서버에 환경 변수 설정

### 방법 1: ecosystem.config.js 수정 (권장)

서버에 접속:
```bash
ssh -i ~/.ssh/jangpyosa.pem ubuntu@43.201.0.129
cd /home/ubuntu/jangpyosa
```

ecosystem.config.js 파일 수정:
```bash
nano ecosystem.config.js
```

APICK_API_KEY를 실제 키로 변경:
```javascript
APICK_API_KEY: "YOUR_ACTUAL_APICK_API_KEY"
```

PM2 재시작:
```bash
pm2 delete all
pm2 start ecosystem.config.js
pm2 save
```

### 방법 2: .env 파일 사용

```bash
cd /home/ubuntu/jangpyosa
cat > .env << 'ENVEOF'
APICK_PROVIDER=real
APICK_API_KEY=YOUR_ACTUAL_APICK_API_KEY
DATABASE_URL=postgresql://jp:jp_pw@localhost:5432/jangpyosa?schema=public
JWT_SECRET=your_jwt_secret_here
JWT_REFRESH_SECRET=your_jwt_refresh_secret_here
PORT=4000
CORS_ORIGIN=https://jangpyosa.com
ENVEOF

pm2 restart all --update-env
```

## 3. 확인

```bash
pm2 logs jangpyosa-api --lines 10
```

로그에서 다음이 표시되어야 함:
```
🔐 APICK Provider: real
```

## 4. 테스트

```bash
curl -X POST http://localhost:4000/api/bizno/verify \
  -H "Content-Type: application/json" \
  -d '{"bizNo":"2668101215"}'
```

성공 응답 예시:
```json
{
  "ok": true,
  "name": "회사명",
  "representative": "대표자명"
}
```
