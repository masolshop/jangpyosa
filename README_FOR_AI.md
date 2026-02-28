# 🤖 AI Assistant를 위한 프로젝트 가이드

> **목적**: 새로운 AI 세션이 시작될 때 빠르게 프로젝트를 이해하고 작업을 계속할 수 있도록

---

## 🚨 **절대 금지 사항 (CRITICAL)**

### ❌ **프로덕션 DB 직접 조작 금지**
```bash
# 절대 실행 금지!
prisma db push                    # ❌ 데이터 전체 삭제됨
DELETE FROM DisabledEmployee      # ❌ 직원 데이터 삭제
DROP TABLE                        # ❌ 테이블 삭제
TRUNCATE                          # ❌ 데이터 초기화
UPDATE DisabledEmployee SET ...   # ❌ 대량 수정 위험
```

### ✅ **안전한 DB 작업 방법**
1. **조회만 허용**: `SELECT` 쿼리만 사용
2. **백업 필수**: DB 수정 전 반드시 백업 확인
3. **마이그레이션 사용**: 스키마 변경 시 `prisma migrate dev` 사용
4. **사용자 확인**: 실제 회원 데이터인지 목업 데이터인지 확인

### 🔒 **AI 작업 제한 규칙**
- **읽기 전용 작업**: DB 조회, 로그 확인, 상태 점검
- **코드 수정만**: 소스 코드 수정 후 사용자 승인 필요
- **배포 금지**: DB 마이그레이션, 스키마 변경은 사용자 명시적 승인 후에만
- **데이터 복원**: 백업에서 복원 시 사용자에게 반드시 확인 요청

---

## ⚡ 빠른 시작 (5초 요약)

```bash
# 프로젝트 위치
cd /home/user/webapp

# SSH 키 위치
~/.ssh/jangpyosa.pem

# 서버 접속
ssh -i ~/.ssh/jangpyosa.pem ubuntu@43.201.0.129

# 서버 상태 확인
ssh -i ~/.ssh/jangpyosa.pem ubuntu@43.201.0.129 'pm2 status'

# 웹사이트
https://jangpyosa.com
```

---

## 📋 프로젝트 개요

### 기본 정보
- **프로젝트명**: 장표사닷컴 (jangpyosa.com)
- **설명**: 장애인 고용부담금 감면 및 표준사업장 연계고용 플랫폼
- **스택**: Next.js 14, Node.js, **SQLite** (프로덕션), Prisma, Nginx
- **모노레포**: Turborepo (apps/api, apps/web)

### 서버 정보
- **IP**: 43.201.0.129
- **User**: ubuntu
- **SSH 키**: `~/.ssh/jangpyosa.pem` (권한: 600)
- **프로젝트 경로**: `/home/ubuntu/jangpyosa`
- **프로세스 관리**: PM2
- **웹서버**: Nginx

### 🗄️ **데이터베이스 관리 (중요!)**
- **현재 DB**: `/home/ubuntu/jangpyosa/apps/api/prisma/dev.db` (SQLite, ~1MB)
- **자동 백업**: 매일 03:00 KST → `/home/ubuntu/backups/jangpyosa/dev.db.backup-YYYYMMDD-HHMMSS.gz`
- **⚠️ 주의**: `prisma db push` 실행 시 기존 데이터가 **삭제**됨
- **안전한 스키마 변경**: `prisma migrate dev` 사용 (데이터 보존)
- **복원 방법**:
  ```bash
  gunzip -c /home/ubuntu/backups/jangpyosa/dev.db.backup-최신.gz > /tmp/restore.db
  cp /tmp/restore.db /home/ubuntu/jangpyosa/apps/api/prisma/dev.db
  pm2 restart jangpyosa-api
  ```

### 서비스 구조
```
┌─────────────────────────────────────────┐
│          Nginx (Port 443, SSL)          │
│      https://jangpyosa.com              │
└──────────────┬──────────────────────────┘
               │
               ├─→ Next.js Web (Port 3003)
               │   • apps/web/
               │   • 프론트엔드
               │
               └─→ API Server (Port 4000)
                   • apps/api/
                   • Express + Prisma
                   • PostgreSQL
```

---

## 🔑 중요 파일 위치

### 로컬 (샌드박스)
```
/home/user/webapp/                    # 프로젝트 루트
├── apps/
│   ├── api/                          # API 서버
│   │   ├── src/
│   │   │   ├── index.ts             # 서버 진입점
│   │   │   └── routes/
│   │   │       └── auth.ts          # 인증 라우트 ⭐
│   │   └── prisma/
│   │       └── schema.prisma        # DB 스키마 ⭐
│   └── web/                          # Next.js 웹
│       └── src/
│           └── app/
│               ├── signup/page.tsx           # 기업 회원가입 ⭐
│               ├── employee/signup/page.tsx  # 직원 회원가입
│               └── employee-new/signup/page.tsx  # 직원 간편가입 ⭐
├── ~/.ssh/jangpyosa.pem              # SSH 키 (중요!)
├── CLAUDE_SESSION_INFO.md            # 상세 가이드
└── README_FOR_AI.md                  # 이 파일
```

### 서버
```
/home/ubuntu/jangpyosa/               # 프로젝트 루트
├── ecosystem.config.js               # PM2 설정 ⭐
├── nginx-jangpyosa.conf              # Nginx 설정 백업
/etc/nginx/sites-enabled/jangpyosa   # Nginx 실제 설정 ⭐
/home/ubuntu/.pm2/logs/               # PM2 로그
```

---

## 🚨 최근 해결한 중요 문제 (꼭 기억!)

### 1. 로그인 API_ERROR (404) 해결 ✅ (2026-02-28)
**커밋**: `56c0722`

**문제**: 
- 브라우저 로그인 페이지에서 `API_ERROR` 발생
- `https://jangpyosa.com/api/auth/login` → 404 Not Found

**원인**:
- Nginx에 `/api/` 라우팅 설정이 없어서 모든 요청이 Next.js(port 3003)로 이동
- API 서버(port 4000)에 요청이 도달하지 못함

**해결**:
```nginx
location /api/ {
    proxy_pass http://localhost:4000/;
    proxy_http_version 1.0;
    proxy_set_header Connection "";
    proxy_read_timeout 90s;
}
```

**결과**: 로그인 정상 동작 ✅

---

### 2. 직원 엑셀 업로드 시 데이터 손실 문제 해결 ✅ (2026-03-01)
**커밋**: `38b1617`, `a9902eb`

**문제**:
- 엑셀 업로드 후 다음 3개 필드가 빈 칸으로 저장됨
  - 주민번호 앞자리 (예: 850315)
  - 장애 유형 (예: 지체, 시각)
  - 장애 등급 (예: 3급, 2급)

**원인**:
1. 엑셀에서 주민번호(`850315`)와 장애등급(`3급`)이 **숫자 타입**으로 읽힘
2. API 검증 스키마가 `z.string()`만 허용 → 숫자는 변환 실패
3. Zod `.transform()`에서 빈 문자열을 `null`로 변환

**해결**:
```typescript
// ❌ 이전 (string만 허용)
registrationNumber: z.string().transform(val => val.trim() || null).nullable().optional()

// ✅ 수정 (숫자도 허용)
registrationNumber: z.union([z.string(), z.number()]).transform(val => {
  if (val === null || val === undefined) return null;
  const str = String(val).trim();
  return str.length > 0 ? str : null;
}).nullable().optional()
```

**프론트엔드도 수정**:
```typescript
// ❌ 이전
registrationNumber: row[2]?.toString().trim() || "",

// ✅ 수정 (null-safe)
registrationNumber: String(row[2] ?? "").trim(),
```

**적용 필드**:
- `phone` (전화번호)
- `registrationNumber` (주민번호 앞자리)
- `disabilityGrade` (장애 등급)

**테스트 방법**:
1. 샘플 엑셀 다운로드
2. 직원 3명 데이터 입력 (주민번호 850315, 장애등급 3급 등)
3. 엑셀 업로드
4. 직원 상세 정보에서 **주민번호, 장애유형, 장애등급** 정상 표시 확인

**결과**: 모든 필드 정상 저장 ✅

---

### 3. Nginx 502 Bad Gateway 해결 ✅ (2026-02-26)

### 1. ⚠️ 직원 등록 엑셀 업로드 문제 (2026-02-28 해결) ⭐ 최신!
**증상**: 
- 엑셀 업로드 후 직원 상세정보(phone, registrationNumber)가 수정 화면에서 빈 값으로 표시됨
- 요약 데이터에서 시급이 제각각으로 출력됨 (예: 10,319원, 10,321원 등)

**원인 1 (상세정보 누락)**: 
```typescript
// API validation schema가 빈 문자열을 그대로 저장
phone: z.string().nullable().optional()  // ""가 그대로 저장됨
```

**해결 1**: 빈 문자열을 `null`로 변환
```typescript
phone: z.string().transform(val => val.trim() || null).nullable().optional()
registrationNumber: z.string().transform(val => val.trim() || null).nullable().optional()
```

**원인 2 (시급 제각각)**: 
```typescript
// 동적 계산으로 인한 부정확한 시급 표시
Math.round(monthlySalary / monthlyWorkHours)  // 619,200 / 60 = 10,320원? 실제로는 반올림 오차 발생
```

**해결 2**: 고정 최저시급 표시
```typescript
시급 10,320원  // 2026년 최저시급 고정값
```

**커밋**: 0f5888f

### 2. ⚠️ 로그인 API_ERROR (2026-02-28 해결)
**증상**: 로그인 페이지에서 API_ERROR 발생, 404 Not Found

**원인**: 
```
Nginx에 /api/ 라우팅이 없음
  ↓
/api/auth/login 요청이 Next.js(port 3003)로 전달됨
  ↓
API 서버(port 4000)에 도달하지 못함
```

**해결책**: `/etc/nginx/sites-enabled/jangpyosa`
```nginx
# API 서버 라우팅 추가!
location /api/ {
    proxy_pass http://localhost:4000/;
    proxy_http_version 1.0;        # ← 502 방지
    proxy_read_timeout 90s;        # ← 타임아웃 설정
    ...
}

location / {
    proxy_pass http://localhost:3003;  # Next.js
    ...
}
```

**커밋**: 56c0722

### 3. ⚠️ Nginx 502 Bad Gateway (2026-02-28 해결)
**증상**: 모든 HTML 페이지에서 502 에러, 정적 파일(favicon, logo)은 정상

**원인**: 
```
Nginx: proxy_http_version 1.1 + Keep-Alive 
  ↓
Next.js: Keep-Alive timeout=5초
  ↓
연결이 중간에 끊김!
```

**해결책**: `/etc/nginx/sites-enabled/jangpyosa`
```nginx
location / {
    proxy_pass http://localhost:3003;
    proxy_http_version 1.0;        # ← 이게 핵심!
    proxy_set_header Connection ""; # ← Keep-Alive 비활성화
    ...
}
```

**커밋**: b6339ed

### 2. 장애인 직원 인증 실패 (2026-02-28 해결)
**증상**: `/api/auth/verify-employee` 호출 시 404 에러

**원인**: 
- API가 `name`, `phone`, `registrationNumber` 필요
- 프론트엔드가 `registrationNumber`만 전송

**해결책**: 
1. API: 핸드폰 번호 하이픈 유무 무관하게 검색 (8e5f2d2)
2. 프론트: 이름, 핸드폰 입력 필드 추가 (d73826d)

**파일**:
- `apps/api/src/routes/auth.ts` (line 932~)
- `apps/web/src/app/employee-new/signup/page.tsx`

### 4. Mock 기업 buyerProfile 누락 (2026-02-28 해결)
**증상**: 목업 기업으로 직원 회원가입 불가

**해결**: Mock 기업 3개에 buyerProfile 생성
- 1234567890 (페마연구소)
- 2345678901 (공공기관A)
- 3456789012 (행복한표준사업장)

---

## 🧪 테스트 데이터 (중요!)

### 실제 등록된 기업
```javascript
사업자번호: 2668101215
기업명: 주식회사 페마연
대표자: 이종근
buyerProfileId: cmm6dw5cm000519n5n7yz4yf4
```

### 테스트 장애인 직원 (10명)
```javascript
// apps/api에서 생성됨 (2026-02-28)
[
  { name: "김철수", phone: "010-1111-1111", registrationNumber: "850315", disabilityType: "지체장애" },
  { name: "이영희", phone: "010-2222-2222", registrationNumber: "920528", disabilityType: "시각장애" },
  { name: "박민수", phone: "010-3333-3333", registrationNumber: "880710", disabilityType: "청각장애" },
  { name: "최수진", phone: "010-4444-4444", registrationNumber: "950412", disabilityType: "지체장애" },
  { name: "정대호", phone: "010-5555-5555", registrationNumber: "820925", disabilityType: "내부장애" },
  // ... 총 10명
]
```

**사용법**: 
1. https://jangpyosa.com/employee-new/signup 접속
2. Step 1: 사업자번호 `2668101215` 입력
3. Step 2: 위 직원 정보 중 하나 입력
4. Step 3: 로그인용 핸드폰/비밀번호 설정

---

## 🛠️ 자주 사용하는 작업

### 코드 수정 후 배포
```bash
# 1. 로컬에서 수정
cd /home/user/webapp
# ... 코드 수정 ...

# 2. 커밋
git add .
git commit -m "메시지"

# 3. 서버에 배포
ssh -i ~/.ssh/jangpyosa.pem ubuntu@43.201.0.129 '
  cd /home/ubuntu/jangpyosa &&
  git stash &&
  git pull origin main &&
  cd apps/web && npm run build &&
  cd ../.. &&
  pm2 restart jangpyosa-web
'
```

### API 수정 후 배포
```bash
ssh -i ~/.ssh/jangpyosa.pem ubuntu@43.201.0.129 '
  cd /home/ubuntu/jangpyosa &&
  git pull origin main &&
  cd apps/api && npm run build &&
  cd ../.. &&
  pm2 restart jangpyosa-api
'
```

### PM2 상태 확인
```bash
ssh -i ~/.ssh/jangpyosa.pem ubuntu@43.201.0.129 'pm2 status'
```

### Nginx 재시작
```bash
ssh -i ~/.ssh/jangpyosa.pem ubuntu@43.201.0.129 '
  sudo nginx -t &&
  sudo systemctl reload nginx
'
```

### 로그 확인
```bash
# PM2 로그
ssh -i ~/.ssh/jangpyosa.pem ubuntu@43.201.0.129 'pm2 logs --lines 50'

# Nginx 에러 로그
ssh -i ~/.ssh/jangpyosa.pem ubuntu@43.201.0.129 'sudo tail -50 /var/log/nginx/error.log'
```

---

## 🐛 트러블슈팅 체크리스트

### "SSH 접속 안 돼요"
```bash
# 1. 키 권한 확인
chmod 600 ~/.ssh/jangpyosa.pem

# 2. 키 파일 존재 확인
ls -la ~/.ssh/jangpyosa.pem

# 3. verbose 모드로 상세 확인
ssh -v -i ~/.ssh/jangpyosa.pem ubuntu@43.201.0.129
```

### "502 Bad Gateway 에러"
```bash
# 1. PM2 상태 확인
ssh -i ~/.ssh/jangpyosa.pem ubuntu@43.201.0.129 'pm2 status'

# 2. Nginx 설정 확인 (HTTP/1.0인지 확인!)
ssh -i ~/.ssh/jangpyosa.pem ubuntu@43.201.0.129 'grep "proxy_http_version" /etc/nginx/sites-enabled/jangpyosa'
# 출력: proxy_http_version 1.0; ← 이게 맞음!

# 3. Next.js 직접 접속 테스트
ssh -i ~/.ssh/jangpyosa.pem ubuntu@43.201.0.129 'curl -I http://localhost:3003/'

# 4. Nginx 에러 로그
ssh -i ~/.ssh/jangpyosa.pem ubuntu@43.201.0.129 'sudo tail -20 /var/log/nginx/error.log'
```

### "직원 회원가입 안 돼요"
```bash
# 1. buyerProfile 있는지 확인
ssh -i ~/.ssh/jangpyosa.pem ubuntu@43.201.0.129 '
  cd /home/ubuntu/jangpyosa/apps/api &&
  npx tsx -e "
    import { PrismaClient } from '\''@prisma/client'\'';
    const p = new PrismaClient();
    p.company.findUnique({
      where: { bizNo: '\''2668101215'\'' },
      include: { buyerProfile: true }
    }).then(r => console.log(JSON.stringify(r, null, 2)));
  "
'

# 2. 장애인 직원 데이터 있는지 확인
ssh -i ~/.ssh/jangpyosa.pem ubuntu@43.201.0.129 '
  cd /home/ubuntu/jangpyosa/apps/api &&
  npx tsx -e "
    import { PrismaClient } from '\''@prisma/client'\'';
    const p = new PrismaClient();
    p.disabledEmployee.count().then(r => console.log('\''직원 수:'\'', r));
  "
'
```

---

## 📚 추가 문서

- **상세 가이드**: `CLAUDE_SESSION_INFO.md`
- **백업 정보**: `/tmp/BACKUP_INFO_20260228_151744.md`
- **Git 히스토리**: `git log --oneline -10`

---

## 🎯 작업 우선순위 (사용자가 자주 요청하는 것)

1. **회원가입 관련** 버그 수정 (중요!)
2. **502 에러** 발생 시 즉시 대응
3. **장애인 직원 관리** 기능 개선
4. **고용부담금/장려금 계산** 로직 검증
5. **데이터 백업** 및 안전성

---

## ⚠️ 절대 하지 말아야 할 것

1. ❌ `/etc/nginx/sites-enabled/jangpyosa`에서 `proxy_http_version 1.0` 변경 금지!
2. ❌ PM2 ecosystem.config.js에서 포트 변경 금지 (3003, 4000 고정)
3. ❌ SSH 키 권한 변경 금지 (600 유지)
4. ❌ Prisma schema 수정 후 `npx prisma generate` 없이 배포 금지
5. ❌ 프로덕션 DB에 직접 SQL 실행 금지 (Prisma 사용)

---

## 💡 이 파일을 읽는 새로운 AI에게

**안녕하세요!** 👋

당신은 장표사닷컴 프로젝트를 담당하게 되었습니다.

**가장 먼저 할 일**:
1. `cd /home/user/webapp` 이동
2. `ls -la ~/.ssh/jangpyosa.pem` SSH 키 확인
3. `ssh -i ~/.ssh/jangpyosa.pem ubuntu@43.201.0.129 'pm2 status'` 서버 상태 확인
4. `git log -5 --oneline` 최근 변경사항 확인
5. https://jangpyosa.com 웹사이트 접속 테스트

**가장 중요한 것**:
- Nginx 502 에러는 `proxy_http_version 1.0` 설정으로 해결됨
- SSH 키는 `~/.ssh/jangpyosa.pem`에 영구 저장되어 있음
- 테스트 기업: 2668101215, 테스트 직원: 김철수 010-1111-1111 850315

**막히면**:
- `cat CLAUDE_SESSION_INFO.md` 읽기
- `git log --all --grep="502"` 관련 커밋 찾기
- 사용자에게 구체적으로 질문하기

**행운을 빕니다!** 🚀

---

---

## 🔥 채팅 망각 방지 전략

### 문제점
- 채팅이 길어지면 AI가 이전 내용을 압축하면서 **중요한 맥락을 잃어버림**
- 새로운 AI가 중간에 투입되면 **처음부터 다시 설명해야 함**

### 해결책
이 파일(`README_FOR_AI.md`)과 `CLAUDE_SESSION_INFO.md`를 항상 최신 상태로 유지하세요.

#### 사용자가 해야 할 일
1. **채팅이 너무 길어지면** (100+ 메시지)
   ```
   "현재까지의 모든 정보를 README_FOR_AI.md에 업데이트해줘"
   ```

2. **새로운 AI 세션 시작할 때**
   ```
   "/home/user/webapp/README_FOR_AI.md 읽어줘"
   ```

3. **중요한 문제 해결 후**
   ```
   "방금 해결한 문제를 README_FOR_AI.md에 추가해줘"
   ```

#### AI가 해야 할 일
- 중요한 문제 해결 후 자동으로 이 파일 업데이트 제안
- 사용자가 혼란스러워하면 이 파일 확인 권장
- **모든 중요한 정보를 코드가 아닌 문서에 기록**

---

## 📦 전체 백업 가이드

### 샌드박스 → 로컬 PC 백업
```bash
# 1. 현재 프로젝트 전체 압축
cd /home/user/webapp
tar -czf /tmp/jangpyosa_local_backup_$(date +%Y%m%d_%H%M%S).tar.gz \
  --exclude='.git' \
  --exclude='node_modules' \
  --exclude='.next' \
  .

# 2. 백업 파일 확인
ls -lh /tmp/jangpyosa_local_backup_*.tar.gz

# 백업 파일은 /tmp에 저장되며, 사용자가 다운로드 가능
```

### AWS 서버 → 샌드박스 백업
```bash
# 1. 서버 코드 백업
ssh -i ~/.ssh/jangpyosa.pem ubuntu@43.201.0.129 '
  cd /home/ubuntu/jangpyosa &&
  tar -czf /tmp/jangpyosa_server_$(date +%Y%m%d_%H%M%S).tar.gz \
    --exclude=".git" \
    --exclude="node_modules" \
    --exclude=".next" \
    --exclude="apps/api/dist" \
    .
'

# 2. 샌드박스로 다운로드
scp -i ~/.ssh/jangpyosa.pem \
  ubuntu@43.201.0.129:/tmp/jangpyosa_server_*.tar.gz \
  /tmp/

# 3. 설정 파일 백업
ssh -i ~/.ssh/jangpyosa.pem ubuntu@43.201.0.129 '
  sudo cat /etc/nginx/sites-enabled/jangpyosa > /tmp/nginx_backup.conf &&
  cat /home/ubuntu/jangpyosa/ecosystem.config.js > /tmp/pm2_backup.js
'

scp -i ~/.ssh/jangpyosa.pem \
  ubuntu@43.201.0.129:/tmp/nginx_backup.conf \
  ubuntu@43.201.0.129:/tmp/pm2_backup.js \
  /tmp/
```

### 데이터베이스 백업
```bash
# PostgreSQL 백업
ssh -i ~/.ssh/jangpyosa.pem ubuntu@43.201.0.129 '
  cd /home/ubuntu/jangpyosa/apps/api &&
  npx prisma db pull &&
  pg_dump $(grep DATABASE_URL .env | cut -d= -f2) > /tmp/db_backup_$(date +%Y%m%d_%H%M%S).sql
'

scp -i ~/.ssh/jangpyosa.pem \
  ubuntu@43.201.0.129:/tmp/db_backup_*.sql \
  /tmp/
```

### 복원 가이드
```bash
# 1. 샌드박스에서 압축 해제
cd /home/user/webapp
tar -xzf /tmp/jangpyosa_local_backup_YYYYMMDD_HHMMSS.tar.gz

# 2. 의존성 설치
npm install
cd apps/api && npm install
cd ../web && npm install

# 3. 빌드
cd /home/user/webapp
npm run build

# 4. 서버로 재배포
git add . && git commit -m "복원: 백업에서 복원"
git push origin main

ssh -i ~/.ssh/jangpyosa.pem ubuntu@43.201.0.129 '
  cd /home/ubuntu/jangpyosa &&
  git pull origin main &&
  npm install &&
  cd apps/web && npm run build && cd ../.. &&
  pm2 restart all
'
```

---

## 🚨 긴급 복구 체크리스트

### 1단계: 서버 상태 확인
```bash
# PM2 상태
ssh -i ~/.ssh/jangpyosa.pem ubuntu@43.201.0.129 'pm2 status'

# 포트 확인
ssh -i ~/.ssh/jangpyosa.pem ubuntu@43.201.0.129 'netstat -tlnp | grep -E "3003|4000"'

# Nginx 상태
ssh -i ~/.ssh/jangpyosa.pem ubuntu@43.201.0.129 'sudo systemctl status nginx'
```

### 2단계: 로그 확인
```bash
# PM2 에러 로그
ssh -i ~/.ssh/jangpyosa.pem ubuntu@43.201.0.129 'pm2 logs --err --lines 50'

# Nginx 에러 로그
ssh -i ~/.ssh/jangpyosa.pem ubuntu@43.201.0.129 'sudo tail -50 /var/log/nginx/error.log'
```

### 3단계: 재시작
```bash
# PM2 재시작
ssh -i ~/.ssh/jangpyosa.pem ubuntu@43.201.0.129 'pm2 restart all'

# Nginx 재시작
ssh -i ~/.ssh/jangpyosa.pem ubuntu@43.201.0.129 'sudo systemctl restart nginx'
```

### 4단계: 백업 확인
```bash
# 최근 백업 목록
ls -lht /tmp/jangpyosa_*_backup_*.tar.gz | head -5

# 백업 파일 압축 해제 테스트
tar -tzf /tmp/jangpyosa_LATEST_backup.tar.gz | head -20
```

---

## 💡 중요한 명령어 Quick Reference

### Git 작업
```bash
# 서버 최신 커밋 확인
ssh -i ~/.ssh/jangpyosa.pem ubuntu@43.201.0.129 'cd /home/ubuntu/jangpyosa && git log -1 --oneline'

# 서버 상태 확인
ssh -i ~/.ssh/jangpyosa.pem ubuntu@43.201.0.129 'cd /home/ubuntu/jangpyosa && git status'

# 서버에 강제 동기화 (주의!)
ssh -i ~/.ssh/jangpyosa.pem ubuntu@43.201.0.129 'cd /home/ubuntu/jangpyosa && git fetch origin main && git reset --hard origin/main'
```

### 빠른 배포
```bash
# 프론트엔드만
ssh -i ~/.ssh/jangpyosa.pem ubuntu@43.201.0.129 'cd /home/ubuntu/jangpyosa && git pull && cd apps/web && npm run build && pm2 restart jangpyosa-web'

# API만
ssh -i ~/.ssh/jangpyosa.pem ubuntu@43.201.0.129 'cd /home/ubuntu/jangpyosa && git pull && cd apps/api && npm run build && pm2 restart jangpyosa-api'

# 전체
ssh -i ~/.ssh/jangpyosa.pem ubuntu@43.201.0.129 'cd /home/ubuntu/jangpyosa && git pull && npm run build && pm2 restart all'
```

### 디버깅
```bash
# Next.js 직접 테스트
ssh -i ~/.ssh/jangpyosa.pem ubuntu@43.201.0.129 'curl -I http://localhost:3003/'

# API 직접 테스트
ssh -i ~/.ssh/jangpyosa.pem ubuntu@43.201.0.129 'curl -I http://localhost:4000/'

# Nginx → Next.js 연결 테스트
ssh -i ~/.ssh/jangpyosa.pem ubuntu@43.201.0.129 'curl -I https://jangpyosa.com/'
```

---

**최종 업데이트**: 2026-02-28 15:40 KST  
**작성자**: Claude AI Assistant  
**Git Commit**: 56c0722 (최신)  
**백업 위치**: `/tmp/jangpyosa_*_backup_*.tar.gz`

---

## 👥 **회원 정보 저장소 구조**

### 회원 유형별 테이블
```sql
-- 1️⃣ User 테이블 (모든 회원의 기본 정보)
User {
  id, name, username, phone, role, passwordHash, email, companyType, createdAt
  role 유형: SUPER_ADMIN, BUYER, SUPPLIER, EMPLOYEE, AGENT
}

-- 2️⃣ Company 테이블 (기업 정보)
Company {
  id, name, bizNo, representative, type, buyerType, isVerified, ownerUserId
}

-- 3️⃣ BuyerProfile 테이블 (고용의무기업 프로필)
BuyerProfile {
  id, companyId, employeeCount, disabledCount, hasLevyExemption
}

-- 4️⃣ DisabledEmployee 테이블 (장애인 직원 정보)
DisabledEmployee {
  id, buyerId, name, phone, registrationNumber, disabilityType, disabilityGrade, severity
}
```

### 회원 가입 플로우
- **기업 회원가입** → `User` (BUYER) + `Company` + `BuyerProfile` 생성
- **직원 간편가입** → `User` (EMPLOYEE) 생성

### 현재 회원 현황 (2026-03-01 07:25 기준)
| 유형 | 회원수 | 실제 회원 | 목업 데이터 | 테이블 |
|------|--------|----------|-----------|--------|
| 🔴 슈퍼관리자 | 1명 | 1명 (슈퍼관리자) | 0명 | User (SUPER_ADMIN) |
| 🟢 고용의무기업 | 3명 | **1명 (이종근)** | 2명 (김관리자, 이관리자) | User (BUYER) + Company + BuyerProfile |
| 🔵 공급기업 | 1명 | 0명 | 1명 (박관리자) | User (SUPPLIER) + Company |
| 🟡 장애인직원 | 42명 | ~27명 | ~15명 (010-1001-xxxx 패턴) | User (EMPLOYEE) |

### ✅ 정식 회원 (실제 데이터)

#### 고용의무기업 (BUYER)
- **이종근** (`jangpyosa`) ⭐ **프로덕션 계정**
  - 전화번호: 01086199091
  - 역할: BUYER (고용의무기업 오너 관리자)
  - 회사: 주식회사 페마연 (사업자번호 2668101215)
  - 로그인: https://jangpyosa.com/login → 고용의무기업 버튼 → `jangpyosa` 또는 `01086199091`

#### 장애인 직원 (DisabledEmployee)
**주식회사 페마연 소속 직원 3명** (사업자번호 2668101215)
- 홍길동 (010-1234-5588, 주민번호 850315, 지체장애 3급, 중증)
- 김영희 (010-2245-6688, 주민번호 900720, 시각장애 2급, 중증)
- 이철수 (010-3355-7799, 주민번호 881130, 청각장애 5급, 경증)

### 🧪 목업 데이터 (테스트용)

#### 고용의무기업 (BUYER) - 목업 2개
- **김관리자** (`pema_admin`) - 페마연구소 (사업자번호 1234567890)
- **이관리자** (`public_admin`) - 공공기관A (사업자번호 2345678901)

#### 공급기업 (SUPPLIER) - 목업 1개
- **박관리자** (`standard_admin`) - 행복한표준사업장 (사업자번호 3456789012)

#### 장애인 직원 (EMPLOYEE) - 목업 ~15명
- 전화번호 패턴: `010-1001-xxxx` (예: 01010010001, 01010010002, ...)
- 이름: 김철수, 이영희, 박민수, 정수진, 최동욱, 한미래, 강준호, 윤서연, 임하늘, 오지훈 등

---

### 🗃️ **데이터 저장소: 단일 DB (목업과 실제 데이터 혼재)**
**❌ 별도 저장소 없음 - 모든 데이터가 `/home/ubuntu/jangpyosa/apps/api/prisma/dev.db`에 저장됨**

- **장점**: 단일 DB 관리로 운영 단순화
- **단점**: 목업 데이터와 실제 데이터가 섞여 있어 구분 필요
- **식별 방법**:
  - 고용의무기업: 사업자번호로 구분
    - 실제: `2668101215` (주식회사 페마연)
    - 목업: `1234567890`, `2345678901`, `3456789012`
  - 장애인 직원 계정: 전화번호 패턴으로 구분
    - 목업: `010-1001-xxxx` 패턴 (~15명)
    - 실제: 그 외 전화번호 (~27명)

---

## 🚨 **DB 관리 주의사항**

### ❌ 절대 금지
```bash
# 이 명령어는 데이터를 삭제합니다!
prisma db push
```

### ✅ 안전한 스키마 변경
```bash
# 1. 마이그레이션 파일 생성 (데이터 보존)
npx prisma migrate dev --name describe_change

# 2. 프로덕션 적용
npx prisma migrate deploy
```

### 🔄 **DB 복원 절차**
```bash
# 1. 최신 백업 확인
ls -lht /home/ubuntu/backups/jangpyosa/*.gz | head -1

# 2. 백업 복원
gunzip -c /home/ubuntu/backups/jangpyosa/dev.db.backup-20260301-030001.gz > /home/ubuntu/jangpyosa/apps/api/prisma/dev.db

# 3. API 재시작 (DB 커넥션 갱신)
pm2 restart jangpyosa-api
```

### 📊 **회원 정보 조회**
```bash
# 전체 회원 현황
sqlite3 prisma/dev.db "SELECT role, COUNT(*) FROM User GROUP BY role;"

# 고용의무기업 리스트
sqlite3 prisma/dev.db "SELECT U.name, U.username, U.phone, C.name as company FROM User U LEFT JOIN Company C ON U.id = C.ownerUserId WHERE U.role = 'BUYER';"

# 장애인 직원 리스트
sqlite3 prisma/dev.db "SELECT name, phone, registrationNumber, disabilityType FROM DisabledEmployee;"
```

---


---

## 🧪 **목업 데이터 (테스트용) - 정상 작동 중** ✅

### 📍 **저장 위치**
- **DB 파일**: `/home/ubuntu/jangpyosa/apps/api/prisma/dev.db` (SQLite, ~968KB)
- **백업**: `/home/ubuntu/backups/jangpyosa/dev.db.backup-YYYYMMDD-HHMMSS.gz` (매일 03:00 자동)
- **⚠️ 실제 데이터와 목업 데이터가 같은 DB에 저장됨**

### 🏢 **기업 관리자 계정 (3개)**

| 회사명 | 아이디 | 비밀번호 | 사업자번호 | 유형 | 관리자명 |
|--------|--------|---------|-----------|------|---------|
| 페마연구소 | `pema_admin` | `test1234` | 1234567890 | BUYER | 김관리자 |
| 공공기관A | `public_admin` | `test1234` | 2345678901 | BUYER | 이관리자 |
| 행복한표준사업장 | `standard_admin` | `test1234` | 3456789012 | SUPPLIER | 박관리자 |

**로그인 방법**:
- URL: https://jangpyosa.com/login
- 유형 선택: "고용의무기업" 또는 "공급기업"
- 아이디: `pema_admin` (예시)
- 비밀번호: `test1234`

### 👤 **장애인 직원 계정 (42명)**

| 소속 회사 | 전화번호 범위 | 비밀번호 | 인원 | 전화번호 예시 |
|----------|--------------|---------|------|-------------|
| **페마연구소** | 01010010001 ~ 01010010015 | `test1234` | **15명** | 01010010001, 01010010002, ... |
| **공공기관A** | 01020010001 ~ 01020010012 | `test1234` | **12명** | 01020010001, 01020010002, ... |
| **행복한표준사업장** | 01030010001 ~ 01030010015 | `test1234` | **15명** | 01030010001, 01030010002, ... |

**직원 이름 예시**:
- **페마연구소**: 김철수, 이영희, 박민수, 정수진, 최동욱, 한미래, 강준호, 윤서연, 임하늘, 오지훈, 송민지, 안지원, 배성호, 홍서준, 양지수
- **공공기관A**: 서준영, 구민아, 신동혁, 권나연, 유재석, 문소희, 탁현수, 석지혜, 진민재, 표은지, 반다솜, 함태양
- **행복한표준사업장**: 차승환, 하유진, 추민호, 곽수연, 도재원, 소라, 노준서, 모정민, 조서윤, 용지안, 두시우, 마예린, 갈도윤, 여현우, 국채원

**로그인 방법**:
- URL: https://jangpyosa.com/login (유형 선택 **안 함**)
- 전화번호: `01010010001` (예시)
- 비밀번호: `test1234`

### ✅ **로그인 테스트 결과**
```bash
# 기업 관리자 로그인 테스트
curl -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"identifier":"pema_admin","password":"test1234","userType":"BUYER"}'
# → ✅ 토큰 발급 성공

# 장애인 직원 로그인 테스트
curl -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"identifier":"01010010001","password":"test1234"}'
# → ✅ 토큰 발급 성공 (userId: cmm4wy9q6000knap0h22puiqt, role: EMPLOYEE)
```

### 🔍 **목업 데이터 조회 SQL**

```sql
-- 목업 기업 관리자 계정 (3개)
SELECT username, name, phone, role
FROM User 
WHERE username IN ('pema_admin', 'public_admin', 'standard_admin');

-- 목업 장애인 직원 계정 (42명)
SELECT COUNT(*) as total, 
       SUBSTR(phone, 1, 8) as pattern
FROM User 
WHERE role = 'EMPLOYEE' 
  AND (phone LIKE '01010010%' OR phone LIKE '01020010%' OR phone LIKE '01030010%')
GROUP BY pattern;

-- 페마연구소 직원 15명
SELECT name, phone FROM User WHERE phone LIKE '01010010%' ORDER BY phone;

-- 공공기관A 직원 12명
SELECT name, phone FROM User WHERE phone LIKE '01020010%' ORDER BY phone;

-- 행복한표준사업장 직원 15명
SELECT name, phone FROM User WHERE phone LIKE '01030010%' ORDER BY phone;
```

### ⚠️ **목업 데이터 관리 주의사항**

1. **삭제 금지**: 목업 데이터는 **테스트 및 데모용**으로 항상 유지해야 합니다.
2. **백업 필수**: DB 작업 전 항상 백업 확인 (`ls -lht /home/ubuntu/backups/jangpyosa/*.gz | head -1`)
3. **복원 가능**: 백업에서 복원 가능하므로 실수로 삭제해도 복구 가능
4. **식별 방법**:
   - 기업: 사업자번호 `1234567890`, `2345678901`, `3456789012`
   - 직원: 전화번호 패턴 `01010010xxx`, `01020010xxx`, `01030010xxx`

---


## 🛡️ **프로덕션 DB 보호 조치**

### 1️⃣ **자동 백업 (설정 완료 ✅)**
```bash
# 매일 03:00 자동 백업
0 3 * * * /home/ubuntu/scripts/backup-db.sh

# 매일 04:00 S3 백업
0 4 * * * /home/ubuntu/scripts/backup-to-s3-fixed.sh
```

**백업 위치**: `/home/ubuntu/backups/jangpyosa/dev.db.backup-YYYYMMDD-HHMMSS.gz`

### 2️⃣ **DB 복원 절차 (긴급 시)**
```bash
# 1. 최신 백업 확인
ls -lht /home/ubuntu/backups/jangpyosa/*.gz | head -1

# 2. 백업 압축 해제
gunzip -c /home/ubuntu/backups/jangpyosa/dev.db.backup-YYYYMMDD-HHMMSS.gz > /tmp/restore.db

# 3. 현재 DB 백업 (안전장치)
cp /home/ubuntu/jangpyosa/apps/api/prisma/dev.db /home/ubuntu/jangpyosa/apps/api/prisma/dev.db.before-restore-$(date +%Y%m%d-%H%M%S)

# 4. DB 복원
cp /tmp/restore.db /home/ubuntu/jangpyosa/apps/api/prisma/dev.db

# 5. API 재시작
pm2 restart jangpyosa-api
```

### 3️⃣ **안전한 스키마 변경**
```bash
# ❌ 절대 사용 금지
prisma db push

# ✅ 안전한 방법
cd /home/ubuntu/jangpyosa/apps/api
npx prisma migrate dev --name describe_change  # 개발 환경
npx prisma migrate deploy                       # 프로덕션 배포
```

### 4️⃣ **DB 작업 전 체크리스트**
- [ ] 최신 백업 존재 확인 (`ls -lht /home/ubuntu/backups/jangpyosa/*.gz | head -1`)
- [ ] 실제 회원 데이터인지 확인 (사업자번호 2668101215 = 주식회사 페마연)
- [ ] 목업 데이터인지 확인 (사업자번호 1234567890, 2345678901, 3456789012)
- [ ] 작업 전 사용자에게 승인 요청
- [ ] 작업 후 데이터 무결성 검증

### 5️⃣ **실시간 모니터링**
```bash
# DB 파일 크기 모니터링
watch -n 60 'ls -lh /home/ubuntu/jangpyosa/apps/api/prisma/dev.db'

# 백업 상태 확인
tail -f /var/log/jangpyosa-backup.log
```

---

