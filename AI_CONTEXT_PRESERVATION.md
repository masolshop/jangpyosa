# 🧠 AI 맥락 보존 가이드 (Context Preservation Guide)

> **목적**: 채팅 압축이나 새로운 AI 세션으로 인한 맥락 손실 방지

---

## 📌 핵심 원칙

### 문제점
- ❌ 채팅이 길어지면 AI가 이전 내용을 "압축"하면서 중요한 정보를 잃어버림
- ❌ 새로운 AI 세션이 시작되면 처음부터 다시 설명해야 함
- ❌ 같은 문제를 반복해서 해결하게 됨

### 해결책
이 프로젝트는 **3단계 문서화 시스템**을 사용합니다:

```
┌──────────────────────────────────────────┐
│  1단계: README_FOR_AI.md                 │
│  → 5초 요약 + 빠른 시작                   │
└──────────────────────────────────────────┘
           ↓
┌──────────────────────────────────────────┐
│  2단계: CLAUDE_SESSION_INFO.md           │
│  → 상세 기술 정보 + 해결한 문제          │
└──────────────────────────────────────────┘
           ↓
┌──────────────────────────────────────────┐
│  3단계: AI_CONTEXT_PRESERVATION.md       │
│  → 망각 방지 전략 + 백업 가이드 (이 파일)│
└──────────────────────────────────────────┘
```

---

## 🤖 새로운 AI를 위한 온보딩 (5분 프로토콜)

당신이 이 프로젝트에 새로 투입된 AI라면, **순서대로** 읽으세요:

### STEP 1: 기본 정보 파악 (1분)
```bash
cd /home/user/webapp
cat README_FOR_AI.md
```

**확인할 것**:
- [ ] 프로젝트명: 장표사닷컴 (jangpyosa.com)
- [ ] SSH 키 위치: `~/.ssh/jangpyosa.pem`
- [ ] 서버 IP: 43.201.0.129
- [ ] 포트: 3003 (Next.js), 4000 (API)

### STEP 2: 서버 상태 확인 (2분)
```bash
# SSH 키 권한 확인
ls -l ~/.ssh/jangpyosa.pem
# 출력: -rw------- (600이어야 함!)

# 서버 접속 테스트
ssh -i ~/.ssh/jangpyosa.pem ubuntu@43.201.0.129 'echo "✅ SSH 성공!"'

# PM2 상태 확인
ssh -i ~/.ssh/jangpyosa.pem ubuntu@43.201.0.129 'pm2 status'
# 출력: jangpyosa-api, jangpyosa-web 둘 다 online이어야 함

# 웹사이트 접속 테스트
curl -I https://jangpyosa.com
# 출력: HTTP/1.1 200 OK 또는 HTTP/2 200
```

### STEP 3: 최근 변경사항 파악 (2분)
```bash
# 최근 5개 커밋 확인
cd /home/user/webapp
git log -5 --oneline

# 서버의 최신 커밋 확인
ssh -i ~/.ssh/jangpyosa.pem ubuntu@43.201.0.129 \
  'cd /home/ubuntu/jangpyosa && git log -1 --oneline'

# 상세 가이드 읽기
cat CLAUDE_SESSION_INFO.md
```

### STEP 4: 사용자에게 보고
```
✅ 온보딩 완료!

현재 상태:
- SSH 접속: 정상
- PM2 프로세스: jangpyosa-api (port 4000), jangpyosa-web (port 3003) 실행 중
- 웹사이트: https://jangpyosa.com 정상
- 최신 커밋: [커밋 해시] [커밋 메시지]

무엇을 도와드릴까요?
```

---

## 📝 사용자 가이드 (망각 방지 전략)

### 언제 이 가이드를 사용해야 하나?

#### 상황 1: 채팅이 너무 길어졌을 때 (100+ 메시지)
**증상**:
- AI가 이전에 해결한 문제를 다시 물어봄
- 같은 설명을 반복해야 함
- AI가 혼란스러워 보임

**해결책**:
```
"지금까지의 모든 중요한 정보를 README_FOR_AI.md와 CLAUDE_SESSION_INFO.md에 업데이트해줘"
```

#### 상황 2: 새로운 AI 세션을 시작할 때
**첫 메시지**:
```
"/home/user/webapp/README_FOR_AI.md와 CLAUDE_SESSION_INFO.md를 읽고 현재 프로젝트 상태를 파악해줘"
```

#### 상황 3: 중요한 문제를 해결한 후
**마지막 요청**:
```
"방금 해결한 [문제명]을 README_FOR_AI.md의 '🚨 최근 해결한 중요 문제' 섹션에 추가해줘"
```

#### 상황 4: 프로젝트를 며칠 동안 안 건드린 후
**재시작할 때**:
```
"README_FOR_AI.md를 읽고 최근 변경사항을 요약해줘"
```

---

## 🔧 AI 개발자를 위한 Best Practices

### 1. 중요한 정보는 코드가 아닌 문서에 기록

❌ **나쁜 예**:
```typescript
// apps/api/src/routes/auth.ts
// 2026-02-28: 핸드폰 번호 하이픈 제거 처리 추가
const normalizedPhone = phone.replace(/-/g, '');
```

✅ **좋은 예**:
```typescript
// apps/api/src/routes/auth.ts
const normalizedPhone = phone.replace(/-/g, '');
```

그리고 `CLAUDE_SESSION_INFO.md`에 추가:
```markdown
### 장애인 직원 인증 로직 개선 (2026-02-28)
- API가 핸드폰 번호를 하이픈 유무 무관하게 검색
- 파일: apps/api/src/routes/auth.ts (line 932~)
- 커밋: 8e5f2d2
```

### 2. 문제 해결 후 즉시 문서화

해결한 문제는 **반드시** 문서에 기록하세요:

```markdown
### [문제명] (해결일)
**증상**: [정확한 에러 메시지 또는 현상]

**원인**: [근본 원인]

**해결책**: [적용한 수정사항]

**파일**: [수정한 파일 경로]

**커밋**: [커밋 해시]

**재발 방지**: [다시 발생하지 않도록 주의할 점]
```

### 3. 중요한 명령어는 재사용 가능하게

자주 사용하는 명령어는 **스크립트로 만들거나 문서에 기록**:

```bash
# ❌ 나쁜 예: 매번 긴 명령어를 타이핑
ssh -i ~/.ssh/jangpyosa.pem ubuntu@43.201.0.129 'cd /home/ubuntu/jangpyosa && git pull && ...'

# ✅ 좋은 예: 스크립트로 저장
cat > /home/user/webapp/scripts/quick-deploy.sh << 'EOF'
#!/bin/bash
ssh -i ~/.ssh/jangpyosa.pem ubuntu@43.201.0.129 '
  cd /home/ubuntu/jangpyosa &&
  git pull origin main &&
  npm run build &&
  pm2 restart all
'
EOF
chmod +x /home/user/webapp/scripts/quick-deploy.sh

# 사용
./scripts/quick-deploy.sh
```

### 4. 테스트 데이터는 문서에 명시

Mock 데이터나 테스트 계정은 **반드시 문서에 기록**:

```markdown
## 테스트 데이터

### 실제 등록된 기업
- 사업자번호: 2668101215
- 기업명: 주식회사 페마연
- 대표자: 이종근

### 테스트 장애인 직원
1. 김철수 / 010-1111-1111 / 850315 / 지체장애
2. 이영희 / 010-2222-2222 / 920528 / 시각장애
...
```

---

## 📦 완벽한 백업 전략

### 백업해야 할 것 (4종 세트)

```
1. 로컬 코드 (샌드박스)
2. 서버 코드 (AWS EC2)
3. 서버 설정 (Nginx, PM2)
4. 데이터베이스 (PostgreSQL)
```

### 자동 백업 스크립트

#### 전체 백업 (ALL-IN-ONE)
```bash
#!/bin/bash
# 파일명: /home/user/webapp/scripts/full-backup.sh

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/tmp"

echo "🚀 전체 백업 시작: $TIMESTAMP"

# 1. 로컬 코드 백업
echo "📦 1/4: 로컬 코드 백업..."
cd /home/user/webapp
tar -czf "$BACKUP_DIR/local_code_$TIMESTAMP.tar.gz" \
  --exclude='.git' \
  --exclude='node_modules' \
  --exclude='.next' \
  --exclude='apps/api/dist' \
  .
echo "✅ 완료: $BACKUP_DIR/local_code_$TIMESTAMP.tar.gz"

# 2. 서버 코드 백업
echo "📦 2/4: 서버 코드 백업..."
ssh -i ~/.ssh/jangpyosa.pem ubuntu@43.201.0.129 "
  cd /home/ubuntu/jangpyosa &&
  tar -czf /tmp/server_code_$TIMESTAMP.tar.gz \
    --exclude='.git' \
    --exclude='node_modules' \
    --exclude='.next' \
    --exclude='apps/api/dist' \
    .
"
scp -i ~/.ssh/jangpyosa.pem \
  ubuntu@43.201.0.129:/tmp/server_code_$TIMESTAMP.tar.gz \
  "$BACKUP_DIR/"
echo "✅ 완료: $BACKUP_DIR/server_code_$TIMESTAMP.tar.gz"

# 3. 서버 설정 백업
echo "📦 3/4: 서버 설정 백업..."
ssh -i ~/.ssh/jangpyosa.pem ubuntu@43.201.0.129 "
  sudo cat /etc/nginx/sites-enabled/jangpyosa > /tmp/nginx_$TIMESTAMP.conf &&
  cat /home/ubuntu/jangpyosa/ecosystem.config.js > /tmp/pm2_$TIMESTAMP.js
"
scp -i ~/.ssh/jangpyosa.pem \
  ubuntu@43.201.0.129:/tmp/nginx_$TIMESTAMP.conf \
  ubuntu@43.201.0.129:/tmp/pm2_$TIMESTAMP.js \
  "$BACKUP_DIR/"
echo "✅ 완료: $BACKUP_DIR/nginx_$TIMESTAMP.conf, $BACKUP_DIR/pm2_$TIMESTAMP.js"

# 4. 데이터베이스 백업
echo "📦 4/4: 데이터베이스 백업..."
ssh -i ~/.ssh/jangpyosa.pem ubuntu@43.201.0.129 "
  cd /home/ubuntu/jangpyosa/apps/api &&
  DATABASE_URL=\$(grep DATABASE_URL .env | cut -d= -f2) &&
  pg_dump \"\$DATABASE_URL\" > /tmp/database_$TIMESTAMP.sql 2>&1
"
scp -i ~/.ssh/jangpyosa.pem \
  ubuntu@43.201.0.129:/tmp/database_$TIMESTAMP.sql \
  "$BACKUP_DIR/"
echo "✅ 완료: $BACKUP_DIR/database_$TIMESTAMP.sql"

# 요약
echo ""
echo "✅ 전체 백업 완료!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📁 백업 파일 목록:"
ls -lh "$BACKUP_DIR"/*_$TIMESTAMP.* 2>/dev/null | awk '{print "  - " $9 " (" $5 ")"}'
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "💾 총 용량: $(du -sh "$BACKUP_DIR"/*_$TIMESTAMP.* 2>/dev/null | awk '{s+=$1} END {print s}')"
```

#### 백업 실행
```bash
chmod +x /home/user/webapp/scripts/full-backup.sh
cd /home/user/webapp && bash scripts/full-backup.sh
```

---

## 🚨 긴급 복구 프로토콜

### 시나리오 1: "웹사이트가 안 열려요!" (502 에러)

```bash
# 1단계: 서비스 상태 확인
ssh -i ~/.ssh/jangpyosa.pem ubuntu@43.201.0.129 'pm2 status'

# 2단계: 로그 확인
ssh -i ~/.ssh/jangpyosa.pem ubuntu@43.201.0.129 'pm2 logs --err --lines 20'

# 3단계: 재시작
ssh -i ~/.ssh/jangpyosa.pem ubuntu@43.201.0.129 'pm2 restart all'

# 4단계: Nginx 설정 확인 (중요!)
ssh -i ~/.ssh/jangpyosa.pem ubuntu@43.201.0.129 \
  'grep "proxy_http_version" /etc/nginx/sites-enabled/jangpyosa'
# 반드시 "proxy_http_version 1.0;" 이어야 함!

# 5단계: 테스트
curl -I https://jangpyosa.com
```

### 시나리오 2: "SSH 접속이 안 돼요!"

```bash
# 1단계: 키 권한 확인
ls -l ~/.ssh/jangpyosa.pem
# 출력: -rw------- (600)

# 권한이 다르면:
chmod 600 ~/.ssh/jangpyosa.pem

# 2단계: 키 파일 존재 확인
cat ~/.ssh/jangpyosa.pem | head -1
# 출력: -----BEGIN RSA PRIVATE KEY-----

# 3단계: Verbose 모드로 접속 시도
ssh -v -i ~/.ssh/jangpyosa.pem ubuntu@43.201.0.129
```

### 시나리오 3: "코드를 수정했는데 반영이 안 돼요!"

```bash
# 1단계: 로컬 변경사항 확인
cd /home/user/webapp
git status

# 2단계: 커밋
git add .
git commit -m "수정: [변경 내용]"

# 3단계: 서버 동기화 확인
ssh -i ~/.ssh/jangpyosa.pem ubuntu@43.201.0.129 \
  'cd /home/ubuntu/jangpyosa && git log -1 --oneline'

# 4단계: 서버에 Pull
ssh -i ~/.ssh/jangpyosa.pem ubuntu@43.201.0.129 \
  'cd /home/ubuntu/jangpyosa && git pull origin main'

# 5단계: 빌드 & 재시작
ssh -i ~/.ssh/jangpyosa.pem ubuntu@43.201.0.129 '
  cd /home/ubuntu/jangpyosa &&
  npm run build &&
  pm2 restart all
'
```

### 시나리오 4: "모든 게 다 망가졌어요!" (최악의 경우)

```bash
# 1단계: 최근 백업 확인
ls -lht /tmp/*_backup_*.tar.gz | head -5

# 2단계: 서버 상태 완전 확인
ssh -i ~/.ssh/jangpyosa.pem ubuntu@43.201.0.129 '
  echo "=== PM2 ===" &&
  pm2 status &&
  echo "=== Nginx ===" &&
  sudo systemctl status nginx &&
  echo "=== 포트 ===" &&
  netstat -tlnp | grep -E "3003|4000"
'

# 3단계: 필요하면 완전 재시작
ssh -i ~/.ssh/jangpyosa.pem ubuntu@43.201.0.129 '
  pm2 stop all &&
  sudo systemctl restart nginx &&
  pm2 start ecosystem.config.js &&
  pm2 status
'

# 4단계: 그래도 안 되면 백업에서 복원
# (위의 "백업 스크립트" 섹션 참조)
```

---

## 🎯 AI가 절대 잊지 말아야 할 핵심 정보

### 1. Nginx 502 에러의 근본 원인 (가장 중요!)
```nginx
# /etc/nginx/sites-enabled/jangpyosa

location / {
    proxy_pass http://localhost:3003;
    proxy_http_version 1.0;        # ← 이게 1.1이면 502 에러!
    proxy_set_header Connection ""; # ← 이것도 중요!
    # ... 나머지 설정
}
```

**이유**: Next.js의 Keep-Alive 타임아웃(5초)과 Nginx의 HTTP/1.1 Keep-Alive가 충돌

### 2. 장애인 직원 인증 로직
```typescript
// apps/api/src/routes/auth.ts (line 932~)

// 핸드폰 번호는 하이픈 유무 무관하게 검색
const normalizedPhone = phone.replace(/-/g, '');

const employee = await prisma.disabledEmployee.findFirst({
  where: {
    name,
    registrationNumber,
    OR: [
      { phone: normalizedPhone },
      { phone: normalizedPhone.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3') }
    ]
  }
});
```

### 3. SSH 키 영구 저장
```bash
# 키 위치: ~/.ssh/jangpyosa.pem
# 권한: 600 (절대 변경하지 말 것!)

# 확인 방법:
ls -l ~/.ssh/jangpyosa.pem
# 출력: -rw------- 1 user user 1679 ... /home/user/.ssh/jangpyosa.pem
```

### 4. PM2 프로세스 구조
```javascript
// ecosystem.config.js

module.exports = {
  apps: [
    {
      name: 'jangpyosa-api',
      script: 'node_modules/.bin/tsx',
      args: 'src/index.ts',
      cwd: '/home/ubuntu/jangpyosa/apps/api',
      instances: 1,
      exec_mode: 'fork',
      env: { NODE_ENV: 'production', PORT: 4000 }
    },
    {
      name: 'jangpyosa-web',
      script: 'node_modules/.bin/next',
      args: 'start -p 3003',
      cwd: '/home/ubuntu/jangpyosa/apps/web',
      instances: 1,
      exec_mode: 'fork',
      env: { NODE_ENV: 'production', PORT: 3003 }
    }
  ]
};
```

### 5. 테스트 데이터 (반드시 기억!)
```javascript
// 실제 등록된 기업
사업자번호: 2668101215
기업명: 주식회사 페마연

// 테스트 직원 (총 10명)
1. 김철수 / 010-1111-1111 / 850315 / 지체장애
2. 이영희 / 010-2222-2222 / 920528 / 시각장애
3. 박민수 / 010-3333-3333 / 880710 / 청각장애
// ... (나머지는 README_FOR_AI.md 참조)
```

---

## 📚 관련 문서

- **빠른 시작**: `README_FOR_AI.md`
- **상세 가이드**: `CLAUDE_SESSION_INFO.md`
- **백업 정보**: `/tmp/BACKUP_INFO_*.md`
- **배포 가이드**: `배포가이드_긴급.md`

---

## ✅ 체크리스트: 이 가이드를 잘 활용하고 있나요?

### AI 개발자 체크리스트
- [ ] 중요한 문제 해결 후 `README_FOR_AI.md`에 추가했나?
- [ ] 새로운 API나 기능 추가 시 문서에 기록했나?
- [ ] 백업을 정기적으로 생성하고 있나?
- [ ] 사용자가 혼란스러워하면 이 가이드를 권장했나?

### 사용자 체크리스트
- [ ] 채팅이 100+ 메시지를 넘으면 문서 업데이트를 요청했나?
- [ ] 새로운 AI 세션 시작 시 가이드 읽기를 요청했나?
- [ ] 중요한 문제 해결 후 문서화를 요청했나?
- [ ] 정기적으로 백업을 생성하고 있나?

---

**최종 업데이트**: 2026-02-28 15:35 KST  
**작성자**: Claude AI Assistant  
**목적**: 채팅 압축으로 인한 맥락 손실 방지  
**다음 업데이트**: 중요한 문제 해결 또는 사용자 요청 시
