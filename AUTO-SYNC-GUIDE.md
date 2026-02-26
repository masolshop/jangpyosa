# 🔄 자동 동기화 시스템 사용 가이드

## 📅 구축 날짜: 2026-02-26

---

## 🎯 개요

샌드박스에서 작업한 코드가 **자동으로 EC2 서버에 실시간 동기화**되는 시스템입니다.

**특징**:
- ✅ 파일 변경 자동 감지 (5초 간격)
- ✅ 백그라운드 실행
- ✅ 실시간 로그
- ✅ 간편한 제어 (start/stop/status)
- ✅ node_modules, .next, dist 등 자동 제외

---

## 🚀 사용 방법

### 기본 명령어

```bash
cd /home/user/webapp

# 자동 동기화 시작
./sync-control.sh start

# 상태 확인
./sync-control.sh status

# 로그 실시간 확인
./sync-control.sh log

# 중지
./sync-control.sh stop

# 재시작
./sync-control.sh restart
```

---

## 📝 상세 설명

### 1️⃣ 자동 동기화 시작

```bash
cd /home/user/webapp
./sync-control.sh start
```

**출력 예시**:
```
🚀 자동 동기화 백그라운드로 시작 중...
✅ 자동 동기화 시작 완료 (PID: 9316)
📋 로그 확인: tail -f /home/user/webapp/auto-sync.log
```

**동작**:
- 초기 동기화 실행 (전체 apps/ 디렉토리)
- 백그라운드에서 파일 변경 감시 시작
- 5초마다 변경된 파일 체크
- 변경 감지 시 자동으로 EC2에 업로드

---

### 2️⃣ 상태 확인

```bash
./sync-control.sh status
```

**출력 예시**:
```
✅ 자동 동기화 실행 중 (PID: 9316)

📊 프로세스 정보:
    PID     ELAPSED CMD
   9316       00:10 /bin/bash /home/user/webapp/auto-sync.sh

📋 최근 로그 (마지막 10줄):
2026-02-26 09:15:23 - Sync #1 completed
2026-02-26 09:16:45 - Sync #2 completed
...
```

---

### 3️⃣ 로그 실시간 확인

```bash
./sync-control.sh log
```

**출력 예시**:
```
🔄 변경 감지! 동기화 중... (#3)
/home/user/webapp/apps/api/src/routes/work-orders.ts
/home/user/webapp/apps/web/src/app/dashboard/page.tsx

✅ 동기화 완료 [2026-02-26 09:20:15]
```

종료: `Ctrl+C`

---

### 4️⃣ 중지

```bash
./sync-control.sh stop
```

**출력 예시**:
```
🛑 자동 동기화 중지 중... (PID: 9316)
✅ 자동 동기화 중지 완료
```

---

### 5️⃣ 재시작

```bash
./sync-control.sh restart
```

**출력 예시**:
```
🛑 자동 동기화 중지 중... (PID: 9316)
✅ 자동 동기화 중지 완료
🚀 자동 동기화 백그라운드로 시작 중...
✅ 자동 동기화 시작 완료 (PID: 9425)
```

---

## 🔧 동기화 설정

### 감시 대상 디렉토리
```
apps/
├── api/
│   └── src/
└── web/
    └── src/
```

### 제외 패턴
- `node_modules/`
- `.next/`
- `dist/`
- `*.log`
- `*.backup*`
- `*.bak*`
- `dev.db*`
- `.git/`

### 동기화 간격
- **5초마다** 파일 변경 체크
- 변경 감지 시 **즉시** 동기화

---

## 📊 실시간 모니터링

### 터미널 2개 사용 (권장)

**터미널 1**: 작업
```bash
cd /home/user/webapp/apps/api/src/routes
vim work-orders.ts
```

**터미널 2**: 로그 모니터링
```bash
cd /home/user/webapp
./sync-control.sh log
```

---

## 🎬 워크플로우 예시

### 시나리오: API 수정 후 테스트

```bash
# 1. 자동 동기화 시작 (최초 1회)
cd /home/user/webapp
./sync-control.sh start

# 2. 코드 수정
vim apps/api/src/routes/work-orders.ts
# 저장하면 자동으로 EC2에 업로드됨!

# 3. EC2에서 서비스 재시작 (필요시)
ssh -i ~/.ssh/jangpyosa ubuntu@43.201.0.129 "pm2 restart jangpyosa-api"

# 4. 테스트
curl https://jangpyosa.com/api/work-orders

# 작업 완료 후
# 5. 자동 동기화 중지 (선택사항)
./sync-control.sh stop
```

---

## ⚡ 성능 최적화

### 빠른 동기화를 위한 팁

1. **초기 동기화 최소화**
   - `apps/` 디렉토리만 감시
   - node_modules 등 대용량 파일 제외

2. **rsync 옵션 최적화**
   - `-z`: 압축 전송
   - `--delete`: 삭제된 파일 동기화
   - 제외 패턴으로 불필요한 파일 스킵

3. **동기화 간격 조정**
   - 기본: 5초
   - 더 빠르게: `auto-sync.sh`에서 `SYNC_INTERVAL=2` 변경
   - 더 느리게: `SYNC_INTERVAL=10` 변경

---

## 🔍 문제 해결

### 자동 동기화가 시작되지 않음
```bash
# PID 파일 삭제
rm -f /home/user/webapp/auto-sync.pid

# 재시작
./sync-control.sh start
```

### 동기화가 멈춤
```bash
# 재시작
./sync-control.sh restart
```

### SSH 키 오류
```bash
# SSH 키 권한 확인
chmod 600 ~/.ssh/jangpyosa

# 연결 테스트
ssh -i ~/.ssh/jangpyosa ubuntu@43.201.0.129 "echo OK"
```

### 로그 확인
```bash
# 전체 로그 보기
cat /home/user/webapp/auto-sync.log

# 최근 50줄
tail -50 /home/user/webapp/auto-sync.log

# 에러만 필터링
grep "❌" /home/user/webapp/auto-sync.log
```

---

## 📋 파일 구조

```
/home/user/webapp/
├── auto-sync.sh           # 자동 동기화 메인 스크립트
├── sync-control.sh        # 제어 스크립트 (start/stop/status)
├── auto-sync.log          # 동기화 로그
├── auto-sync.pid          # 프로세스 ID
├── .last-sync             # 마지막 동기화 시간
├── sync-to-ec2.sh         # 수동 전체 동기화
└── sync-code-only.sh      # 수동 소스코드 동기화
```

---

## 🔄 수동 vs 자동 동기화

### 자동 동기화 (권장 - 작업 중)
- ✅ 파일 저장 시 자동 업로드
- ✅ 실시간 반영
- ✅ 백그라운드 실행
- ⚠️ 시스템 리소스 사용

**사용 시기**: 
- 개발 중
- 빈번한 코드 수정
- 즉각적인 테스트 필요

### 수동 동기화 (권장 - 배포 시)
```bash
# 소스코드만
./sync-code-only.sh

# 전체
./sync-to-ec2.sh
```

**사용 시기**:
- 최종 배포
- 큰 변경사항 일괄 업로드
- 자동 동기화 사용 안 할 때

---

## ⚙️ 커스터마이징

### 동기화 간격 변경

`auto-sync.sh` 파일 편집:
```bash
vim /home/user/webapp/auto-sync.sh

# 찾기:
SYNC_INTERVAL=5  # 5초마다 체크

# 변경:
SYNC_INTERVAL=2  # 2초마다 체크 (더 빠름)
```

저장 후 재시작:
```bash
./sync-control.sh restart
```

### 감시 디렉토리 추가

`auto-sync.sh` 파일 편집:
```bash
# 찾기:
WATCH_DIRS="apps/"

# 변경:
WATCH_DIRS="apps/ config/ scripts/"
```

---

## 🎯 Best Practices

### ✅ 권장

1. **작업 시작 시 자동 동기화 시작**
   ```bash
   ./sync-control.sh start
   ```

2. **터미널 분할해서 로그 모니터링**
   ```bash
   ./sync-control.sh log
   ```

3. **중요한 변경 전 수동 백업**
   ```bash
   ssh -i ~/.ssh/jangpyosa ubuntu@43.201.0.129 \
     "cd /home/ubuntu/jangpyosa/apps/api && git add . && git commit -m 'backup'"
   ```

4. **작업 완료 후 자동 동기화 중지**
   ```bash
   ./sync-control.sh stop
   ```

### ⚠️ 주의

1. **대용량 파일 추가 시 제외 패턴 확인**
2. **민감한 정보 (.env 등) 자동 동기화 주의**
3. **EC2 서버 재시작은 수동으로**
4. **백그라운드 프로세스 정리 확인**

---

## 📞 요약

**시작**:
```bash
cd /home/user/webapp && ./sync-control.sh start
```

**상태**:
```bash
./sync-control.sh status
```

**중지**:
```bash
./sync-control.sh stop
```

---

**작성일**: 2026-02-26  
**작성자**: Claude Code Assistant  
**프로젝트**: 장표사 (jangpyosa.com)

---

## 🎉 현재 상태

✅ **자동 동기화 실행 중!**
- PID: 확인 필요 (`./sync-control.sh status`)
- 감시 중: `apps/` 디렉토리
- 동기화 간격: 5초
- 로그: `/home/user/webapp/auto-sync.log`

**파일을 수정하면 자동으로 EC2에 업로드됩니다!** 🚀
