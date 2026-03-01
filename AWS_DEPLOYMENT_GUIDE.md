## 🚀 AWS 서버 배포 가이드

### ✅ GitHub 업로드 완료
- 커밋 ID: `b5e35a9` (수정/삭제 기능)
- 커밋 ID: `9ded79d` (문서)
- 커밋 ID: `616109d` (배포 스크립트)
- GitHub URL: https://github.com/masolshop/jangpyosa

---

## 💻 배포 방법 (3가지 중 선택)

### 방법 1: 한 줄 명령어 (가장 빠름) ⚡

AWS 서버에 SSH 접속 후:

```bash
cd /home/ubuntu/jangpyosa && git fetch origin && git reset --hard origin/main && cd apps/api && npm run build && cd ../web && npm run build && pm2 restart jangpyosa-api && pm2 restart jangpyosa-web && pm2 list
```

### 방법 2: 배포 스크립트 사용 (권장) 📦

AWS 서버에 SSH 접속 후:

```bash
cd /home/ubuntu/jangpyosa
git pull origin main
chmod +x deploy-to-aws.sh
./deploy-to-aws.sh
```

### 방법 3: 단계별 실행 📝

```bash
# 1. SSH 접속
ssh ubuntu@43.201.0.129

# 2. 프로젝트 디렉토리로 이동
cd /home/ubuntu/jangpyosa

# 3. 최신 코드 가져오기
git fetch origin
git reset --hard origin/main

# 4. 최신 커밋 확인
git log --oneline -5

# 5. API 빌드
cd apps/api
npm run build

# 6. Web 빌드
cd ../web
npm run build

# 7. PM2 재시작
pm2 restart jangpyosa-api
pm2 restart jangpyosa-web

# 8. 상태 확인
pm2 list
pm2 logs --lines 20
```

---

## 📦 배포될 내용

### 1. 수정 기능 ✏️
- 본부/지사 카드에 `✏️ 수정` 버튼
- 수정 모달 (이름, 전화번호, 이메일)
- X 닫기 버튼 포함

### 2. 삭제 기능 🗑️
- 본부/지사 카드에 `🗑️ 삭제` 버튼
- 하위 조직 있으면 삭제 거부
- 소프트 삭제 (isActive = false)

### 3. 본부 정보 개선 📊
- **변경 전**: `추천: N명 | 매출: ₩XXX`
- **변경 후**: `지사 N개 | 소속매니저 N명`

### 4. API 엔드포인트 🔧
- PUT /sales/people/:id (수정)
- DELETE /sales/people/:id (삭제)

---

## ✅ 배포 후 확인사항

### 1. PM2 상태 확인
```bash
pm2 list
```

**기대 결과**:
```
┌────┬────────────────────┬──────────┬──────┬───────────┐
│ id │ name               │ mode     │ ↺    │ status    │
├────┼────────────────────┼──────────┼──────┼───────────┤
│ 0  │ jangpyosa-api      │ fork     │ 39   │ online    │
│ 1  │ jangpyosa-web      │ fork     │ 38   │ online    │
└────┴────────────────────┴──────────┴──────┴───────────┘
```

### 2. 로그 확인
```bash
pm2 logs --lines 50
```

### 3. 브라우저 테스트
1. https://jangpyosa.com/admin/login 접속
2. ID: `01063529091`, PW: `admin123` 로그인
3. 영업 관리 메뉴 클릭
4. 조직도 보기 선택
5. 본부 카드 확인:
   - ✅ `지사 N개 | 소속매니저 N명` 표시
   - ✅ `✏️ 수정` 버튼 확인
   - ✅ `🗑️ 삭제` 버튼 확인
6. 수정 버튼 클릭하여 모달 확인

---

## 🔍 문제 발생 시

### PM2가 offline이면
```bash
pm2 restart all
pm2 logs
```

### 빌드 에러가 발생하면
```bash
# API 재빌드
cd /home/ubuntu/jangpyosa/apps/api
rm -rf dist
npm run build

# Web 재빌드
cd /home/ubuntu/jangpyosa/apps/web
rm -rf .next
npm run build

# PM2 재시작
pm2 restart all
```

### Git 충돌이 발생하면
```bash
cd /home/ubuntu/jangpyosa
git fetch origin
git reset --hard origin/main
```

---

## 📝 배포 완료 체크리스트

- [ ] SSH 접속 완료
- [ ] 최신 코드 pull 완료
- [ ] API 빌드 성공
- [ ] Web 빌드 성공
- [ ] PM2 재시작 완료
- [ ] PM2 상태 확인 (online)
- [ ] 브라우저에서 기능 확인
  - [ ] 본부 정보 표시 개선 확인
  - [ ] 수정 버튼 동작 확인
  - [ ] 삭제 버튼 동작 확인

---

## 🌐 주요 URL

- **슈퍼어드민 로그인**: https://jangpyosa.com/admin/login
- **슈퍼어드민 대시보드**: https://jangpyosa.com/admin
- **영업 관리**: https://jangpyosa.com/admin/sales-management
- **매니저 로그인**: https://jangpyosa.com/admin/sales

---

## 📞 배포 지원

문제가 발생하면 다음 정보를 확인해주세요:

1. **PM2 로그**:
   ```bash
   pm2 logs --lines 100
   ```

2. **서버 상태**:
   ```bash
   uptime
   df -h
   free -h
   ```

3. **Git 상태**:
   ```bash
   cd /home/ubuntu/jangpyosa
   git log --oneline -5
   git status
   ```

---

**배포 완료 후 이 가이드를 참고하여 기능을 테스트해주세요!** 🚀
