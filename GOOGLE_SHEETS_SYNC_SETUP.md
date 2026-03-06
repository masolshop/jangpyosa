# 구글 시트 동기화 설정 가이드

## 1. Google Cloud 프로젝트 생성

### 1-1. Google Cloud Console 접속
1. https://console.cloud.google.com/ 접속
2. 새 프로젝트 생성: "장표사-시트동기화"

### 1-2. Google Sheets API 활성화
1. "API 및 서비스" → "라이브러리"
2. "Google Sheets API" 검색
3. "사용 설정" 클릭

### 1-3. Google Drive API 활성화
1. "Google Drive API" 검색
2. "사용 설정" 클릭

### 1-4. 서비스 계정 생성
1. "API 및 서비스" → "사용자 인증 정보"
2. "사용자 인증 정보 만들기" → "서비스 계정"
3. 이름: "jangpyosa-sheets-sync"
4. 역할: "편집자"
5. "완료" 클릭

### 1-5. 서비스 계정 키 생성
1. 생성된 서비스 계정 클릭
2. "키" 탭 → "키 추가" → "새 키 만들기"
3. 형식: JSON
4. 다운로드된 JSON 파일 저장
   - 파일명 예: `jangpyosa-sheets-sync-abc123.json`
   - 저장 위치: `/home/ubuntu/jangpyosa/apps/api/credentials/`

## 2. 구글 시트 생성 및 권한 설정

### 2-1. 새 구글 시트 생성
1. https://sheets.google.com/ 접속
2. "빈 스프레드시트" 생성
3. 이름: "장표사 매니저 관리 (자동 동기화)"

### 2-2. 시트 구조 생성
- **시트 1**: 본부
- **시트 2**: 지사
- **시트 3**: 매니저
- **시트 4**: 통계 (선택)

### 2-3. 서비스 계정에 편집 권한 부여
1. 구글 시트 우측 상단 "공유" 클릭
2. 서비스 계정 이메일 입력
   - 형식: `jangpyosa-sheets-sync@PROJECT_ID.iam.gserviceaccount.com`
3. 권한: "편집자"
4. "전송" 클릭

### 2-4. 시트 ID 복사
- URL에서 시트 ID 복사
- 예: `https://docs.google.com/spreadsheets/d/1ABC...XYZ/edit`
- 시트 ID: `1ABC...XYZ`

## 3. 환경 변수 설정

`/home/ubuntu/jangpyosa/apps/api/.env` 파일에 추가:

```bash
# 구글 시트 동기화
GOOGLE_SHEETS_ENABLED=true
GOOGLE_SHEETS_SPREADSHEET_ID=1ABC...XYZ
GOOGLE_SERVICE_ACCOUNT_EMAIL=jangpyosa-sheets-sync@PROJECT_ID.iam.gserviceaccount.com
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# 또는 JSON 파일 경로
GOOGLE_APPLICATION_CREDENTIALS=/home/ubuntu/jangpyosa/apps/api/credentials/jangpyosa-sheets-sync.json
```

## 4. 서비스 계정 JSON 파일 구조

```json
{
  "type": "service_account",
  "project_id": "jangpyosa-sheets-sync",
  "private_key_id": "abc123...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "jangpyosa-sheets-sync@PROJECT_ID.iam.gserviceaccount.com",
  "client_id": "123456789",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/..."
}
```

## 5. 보안 주의사항

⚠️ **중요**: 서비스 계정 JSON 파일은 절대 Git에 커밋하지 마세요!

`.gitignore`에 추가:
```
apps/api/credentials/
*.json
```

## 6. 테스트

서버에서 테스트:
```bash
cd /home/ubuntu/jangpyosa/apps/api
npm run sync:sheets:test
```

성공 시 출력:
```
✅ 구글 시트 연결 성공
✅ 시트 ID: 1ABC...XYZ
✅ 접근 권한: OK
```
