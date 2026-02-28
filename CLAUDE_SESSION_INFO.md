# 🤖 Claude 세션 정보 - 장표사닷컴 프로젝트

## 📅 최종 업데이트
- **날짜**: 2026-02-28 15:20 KST
- **Git Commit**: b6339ed
- **상태**: ✅ 모든 시스템 정상 작동

---

## 🔐 AWS 서버 접속 정보

### SSH 키 위치
```bash
~/.ssh/jangpyosa.pem
```

### 서버 정보
- **IP**: 43.201.0.129
- **User**: ubuntu
- **접속 명령어**:
```bash
ssh -i ~/.ssh/jangpyosa.pem ubuntu@43.201.0.129
```

### 권한 확인 (필요시)
```bash
chmod 600 ~/.ssh/jangpyosa.pem
```

---

## 🚀 자주 사용하는 명령어

### 1. 서버 접속
```bash
ssh -i ~/.ssh/jangpyosa.pem ubuntu@43.201.0.129
```

### 2. 파일 업로드 (로컬 → 서버)
```bash
scp -i ~/.ssh/jangpyosa.pem /local/file ubuntu@43.201.0.129:/home/ubuntu/jangpyosa/
```

### 3. 파일 다운로드 (서버 → 로컬)
```bash
scp -i ~/.ssh/jangpyosa.pem ubuntu@43.201.0.129:/remote/file /local/path
```

### 4. 배포 (로컬에서)
```bash
cd /home/user/webapp
./deploy.sh  # 또는 수동 배포
```

### 5. 서버 상태 확인
```bash
ssh -i ~/.ssh/jangpyosa.pem ubuntu@43.201.0.129 '
cd /home/ubuntu/jangpyosa &&
pm2 status &&
git log -1 --oneline
'
```

### 6. PM2 재시작
```bash
ssh -i ~/.ssh/jangpyosa.pem ubuntu@43.201.0.129 '
cd /home/ubuntu/jangpyosa &&
pm2 restart all
'
```

### 7. Nginx 재시작
```bash
ssh -i ~/.ssh/jangpyosa.pem ubuntu@43.201.0.129 '
sudo systemctl restart nginx
'
```

---

## 📂 중요 파일 경로

### 서버
- **프로젝트**: `/home/ubuntu/jangpyosa`
- **Nginx 설정**: `/etc/nginx/sites-enabled/jangpyosa`
- **PM2 Ecosystem**: `/home/ubuntu/jangpyosa/ecosystem.config.js`
- **PM2 로그**: `/home/ubuntu/.pm2/logs/`
- **API 코드**: `/home/ubuntu/jangpyosa/apps/api`
- **Web 코드**: `/home/ubuntu/jangpyosa/apps/web`

### 로컬
- **프로젝트**: `/home/user/webapp`
- **SSH 키**: `~/.ssh/jangpyosa.pem`
- **백업**: `/tmp/*backup*20260228*`

---

## 🌐 서비스 URL

- **메인**: https://jangpyosa.com
- **직원 회원가입**: https://jangpyosa.com/employee-new/signup
- **기업 회원가입**: https://jangpyosa.com/signup
- **로그인**: https://jangpyosa.com/login

---

## 🗄️ 데이터베이스

### 연결 정보 (서버)
- **타입**: PostgreSQL
- **ORM**: Prisma
- **스키마**: `/home/ubuntu/jangpyosa/apps/api/prisma/schema.prisma`

### 유용한 명령어
```bash
# 서버에서
cd /home/ubuntu/jangpyosa/apps/api
npx prisma studio  # DB GUI
npx prisma db pull  # 스키마 업데이트
npx prisma generate  # 클라이언트 재생성
```

---

## 🔧 최근 해결한 주요 문제

### 1. Nginx 502 Bad Gateway (b6339ed)
- **원인**: HTTP/1.1 Keep-Alive timeout 불일치
- **해결**: proxy_http_version 1.0으로 변경
- **파일**: `/etc/nginx/sites-enabled/jangpyosa`

### 2. 장애인 직원 인증 (8e5f2d2, d73826d)
- 핸드폰 번호 하이픈 유무 상관없이 검색
- 이름, 핸드폰 필드 추가

### 3. 중복 핸드폰 가입 방지 (2e8ecb3)
- 모든 회원가입 페이지에 안내 추가

---

## 🧪 테스트 데이터

### 테스트 기업
- **사업자번호**: 2668101215
- **기업명**: 주식회사 페마연

### 테스트 직원 (10명)
| 이름 | 핸드폰 | 주민번호 | 장애유형 |
|------|--------|----------|----------|
| 김철수 | 010-1111-1111 | 850315 | 지체장애 |
| 이영희 | 010-2222-2222 | 920528 | 시각장애 |
| 박민수 | 010-3333-3333 | 880710 | 청각장애 |

---

## 📋 체크리스트: 새 세션 시작할 때

- [ ] SSH 키 확인: `ls -la ~/.ssh/jangpyosa.pem`
- [ ] Git 상태 확인: `cd /home/user/webapp && git status`
- [ ] 서버 상태 확인: `ssh -i ~/.ssh/jangpyosa.pem ubuntu@43.201.0.129 'pm2 status'`
- [ ] 웹사이트 접속 확인: https://jangpyosa.com
- [ ] 최근 커밋 확인: `git log -5 --oneline`

---

## 🆘 트러블슈팅

### SSH 접속 안 될 때
```bash
# 1. 키 권한 확인
chmod 600 ~/.ssh/jangpyosa.pem

# 2. verbose 모드로 확인
ssh -v -i ~/.ssh/jangpyosa.pem ubuntu@43.201.0.129

# 3. known_hosts 문제시
ssh-keygen -R 43.201.0.129
```

### PM2 프로세스 문제
```bash
# 서버에서
pm2 logs --err  # 에러 로그 확인
pm2 restart all  # 재시작
pm2 delete all && pm2 start ecosystem.config.js  # 완전 재시작
```

### Nginx 502 에러
```bash
# 서버에서
sudo nginx -t  # 설정 테스트
sudo tail -50 /var/log/nginx/error.log  # 에러 로그
sudo systemctl restart nginx  # 재시작
```

---

## 📦 백업 위치
- **로컬**: `/tmp/*backup*20260228*.tar.gz`
- **서버**: `/home/ubuntu/jangpyosa/nginx-jangpyosa.conf`
- **GitHub**: https://github.com/masolshop/jangpyosa (b6339ed)

---

## 💡 중요 알림

⚠️ **이 파일은 다음 세션에서 바로 참고할 수 있도록 만들어졌습니다!**

다음에 다시 시작할 때:
1. `cd /home/user/webapp`
2. `cat CLAUDE_SESSION_INFO.md` 읽기
3. SSH 키가 `~/.ssh/jangpyosa.pem`에 있는지 확인
4. 서버 접속 테스트

---

**작성**: Claude AI Assistant  
**프로젝트**: 장표사닷컴 (jangpyosa.com)  
**최종 수정**: 2026-02-28 15:20 KST
