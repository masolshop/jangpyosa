# 업무지시 시스템 구축 완료 보고서

## 📅 배포 정보
- **배포 일시**: 2026년 2월 22일 13:10 (KST)
- **배포 환경**: AWS EC2 (jangpyosa.com) + 로컬 개발
- **Git Commit**: 4a48fac
- **담당자**: AI Developer

---

## ✅ 구현 완료 항목

### 1. 데이터베이스 스키마 설계

#### 📦 WorkOrder 모델
```prisma
model WorkOrder {
  id              String                @id @default(cuid())
  companyId       String                // Company ID
  buyerId         String                // BuyerProfile ID
  title           String                // 지시 제목
  content         String                // 지시 내용
  targetType      String                // ALL (전체), GROUP (그룹), INDIVIDUAL (개인)
  targetEmployees String?               // JSON array: 대상 직원 ID 목록
  priority        String                @default("NORMAL") // URGENT, NORMAL, LOW
  dueDate         DateTime?             // 완료 기한
  audioFileUrl    String?               // 음성 파일 URL
  audioFileName   String?               // 음성 파일 이름
  audioDuration   Int?                  // 음성 파일 길이 (초)
  isActive        Boolean               @default(true)
  createdById     String                // 작성자 User ID
  createdByName   String                // 작성자 이름
  createdAt       DateTime              @default(now())
  updatedAt       DateTime              @updatedAt
  company         Company               @relation(...)
  confirmations   WorkOrderConfirmation[]
}
```

#### ✅ WorkOrderConfirmation 모델
```prisma
model WorkOrderConfirmation {
  id              String      @id @default(cuid())
  workOrderId     String
  employeeId      String      // DisabledEmployee ID
  userId          String      // User ID (직원 계정)
  confirmedAt     DateTime    @default(now())
  note            String?     // 확인 메모
  workOrder       WorkOrder   @relation(...)
}
```

### 2. 업무지시 발송 타입
- **전체 발송 (ALL)**: 회사의 모든 장애인 직원에게 발송
- **그룹 발송 (GROUP)**: 선택된 여러 직원에게 발송
- **개인 발송 (INDIVIDUAL)**: 특정 직원 한 명에게 발송

### 3. 우선순위 및 마감일
- **우선순위**: URGENT (긴급), NORMAL (보통), LOW (낮음)
- **마감일**: 선택적 완료 기한 설정

### 4. 음성 첨부 기능
- **audioFileUrl**: 음성 파일 URL (외부 저장소 또는 CDN)
- **audioFileName**: 원본 파일명
- **audioDuration**: 재생 시간 (초 단위)

---

## 📡 구현된 API 엔드포인트

### 관리자용 API (바이어, 표준사업장, 슈퍼 어드민)

#### 1. 업무지시 생성
```http
POST /api/work-orders/create
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "청소 업무 지시",
  "content": "오늘 오후 3시까지 1층 사무실 청소를 완료해주세요.",
  "targetType": "ALL",  // 전체 발송
  "priority": "NORMAL",
  "dueDate": "2026-02-23T15:00:00.000Z",
  "audioFileUrl": "https://example.com/audio/instruction.mp3",
  "audioFileName": "청소_지시사항.mp3",
  "audioDuration": 45
}
```

**응답:**
```json
{
  "message": "업무지시가 등록되었습니다",
  "workOrder": {
    "id": "clxx...",
    "title": "청소 업무 지시",
    "content": "오늘 오후 3시까지 1층 사무실 청소를 완료해주세요.",
    "targetType": "ALL",
    "priority": "NORMAL",
    "createdByName": "홍길동 담당자",
    ...
  }
}
```

#### 2. 업무지시 목록 조회
```http
GET /api/work-orders/list
Authorization: Bearer <token>
```

**응답:**
```json
{
  "workOrders": [
    {
      "id": "clxx...",
      "title": "청소 업무 지시",
      "content": "...",
      "targetType": "ALL",
      "priority": "URGENT",
      "dueDate": "2026-02-23T15:00:00.000Z",
      "audioFileUrl": "https://example.com/audio/instruction.mp3",
      "stats": {
        "targetCount": 50,      // 대상 직원 수
        "confirmedCount": 32,   // 확인한 직원 수
        "unconfirmedCount": 18, // 미확인 직원 수
        "confirmPercentage": 64 // 확인률 (%)
      }
    }
  ]
}
```

#### 3. 업무지시 확인 현황 상세
```http
GET /api/work-orders/:id/confirmations
Authorization: Bearer <token>
```

**응답:**
```json
{
  "workOrder": { ... },
  "confirmedEmployees": [
    {
      "id": "emp1...",
      "name": "김철수",
      "confirmedAt": "2026-02-22T09:30:00.000Z",
      "note": "확인했습니다"
    }
  ],
  "unconfirmedEmployees": [
    {
      "id": "emp2...",
      "name": "이영희"
    }
  ],
  "stats": {
    "total": 50,
    "confirmed": 32,
    "unconfirmed": 18,
    "confirmPercentage": 64
  }
}
```

#### 4. 업무지시 수정
```http
PUT /api/work-orders/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "청소 업무 지시 (수정)",
  "priority": "URGENT",
  "dueDate": "2026-02-23T14:00:00.000Z"
}
```

#### 5. 업무지시 삭제
```http
DELETE /api/work-orders/:id
Authorization: Bearer <token>
```

---

### 직원용 API (장애인 직원)

#### 1. 내 업무지시 조회
```http
GET /api/work-orders/my-work-orders
Authorization: Bearer <token>
```

**응답:**
```json
{
  "workOrders": [
    {
      "id": "clxx...",
      "title": "청소 업무 지시",
      "content": "오늘 오후 3시까지 1층 사무실 청소를 완료해주세요.",
      "targetType": "ALL",
      "priority": "URGENT",
      "dueDate": "2026-02-23T15:00:00.000Z",
      "audioFileUrl": "https://example.com/audio/instruction.mp3",
      "audioFileName": "청소_지시사항.mp3",
      "audioDuration": 45,
      "createdByName": "홍길동 담당자",
      "createdAt": "2026-02-22T09:00:00.000Z",
      "isConfirmed": false,  // 확인 여부
      "confirmedAt": null,
      "note": null
    }
  ]
}
```

#### 2. 업무지시 확인 처리
```http
POST /api/work-orders/:id/confirm
Authorization: Bearer <token>
Content-Type: application/json

{
  "note": "확인했습니다. 오후 3시까지 완료하겠습니다."
}
```

**응답:**
```json
{
  "message": "업무지시를 확인했습니다",
  "confirmation": {
    "id": "conf...",
    "workOrderId": "clxx...",
    "employeeId": "emp1...",
    "userId": "user1...",
    "confirmedAt": "2026-02-22T10:15:00.000Z",
    "note": "확인했습니다. 오후 3시까지 완료하겠습니다."
  }
}
```

---

## 🎯 주요 기능

### 1. 단체 발송 (ALL)
- 회사의 모든 장애인 직원에게 자동으로 발송
- 대상 직원 수 자동 계산
- 확인률 실시간 통계

### 2. 그룹 발송 (GROUP)
- 선택된 여러 직원에게 발송
- `targetEmployees` 배열에 직원 ID 목록 전달
- 예: `["emp1", "emp2", "emp3"]`

### 3. 개인 발송 (INDIVIDUAL)
- 특정 직원 한 명에게만 발송
- `targetEmployees` 배열에 직원 ID 하나만 전달
- 예: `["emp1"]`

### 4. 음성 첨부
- 외부 저장소 또는 CDN의 음성 파일 URL 첨부
- 파일명 및 재생 시간 정보 저장
- 직원이 모바일/웹에서 음성 재생 가능

### 5. 우선순위 관리
- **URGENT** (긴급): 빨간색으로 표시, 최우선 정렬
- **NORMAL** (보통): 기본 우선순위
- **LOW** (낮음): 회색으로 표시

### 6. 마감일 설정
- 선택적 완료 기한 설정
- 마감일 지난 업무지시 시각적 표시

### 7. 확인 통계
- 대상 직원 수
- 확인한 직원 수
- 미확인 직원 수
- 확인률 (%)

### 8. 확인 여부 추적
- 각 직원의 확인 여부 실시간 추적
- 확인 시각 기록
- 확인 메모 (선택)

---

## 🧪 테스트 시나리오

### 시나리오 1: 전체 직원에게 긴급 업무지시
```bash
# 1. 관리자가 전체 직원에게 업무지시 생성
POST /api/work-orders/create
{
  "title": "긴급 안전 교육",
  "content": "오늘 오후 2시, 강당에서 안전 교육이 진행됩니다.",
  "targetType": "ALL",
  "priority": "URGENT",
  "dueDate": "2026-02-22T14:00:00.000Z"
}

# 2. 직원1이 내 업무지시 조회
GET /api/work-orders/my-work-orders
→ "긴급 안전 교육" 항목 표시, isConfirmed: false

# 3. 직원1이 확인 처리
POST /api/work-orders/:id/confirm
{ "note": "확인했습니다" }

# 4. 관리자가 확인 현황 조회
GET /api/work-orders/:id/confirmations
→ 확인한 직원 목록에 직원1 표시
```

### 시나리오 2: 특정 직원에게 음성 첨부 업무지시
```bash
# 1. 관리자가 특정 직원에게 음성 첨부 업무지시 생성
POST /api/work-orders/create
{
  "title": "청소 업무 지시",
  "content": "음성 지시사항을 확인해주세요.",
  "targetType": "INDIVIDUAL",
  "targetEmployees": ["emp1"],
  "priority": "NORMAL",
  "audioFileUrl": "https://example.com/audio/cleaning.mp3",
  "audioFileName": "청소_지시사항.mp3",
  "audioDuration": 60
}

# 2. 직원1이 내 업무지시 조회
GET /api/work-orders/my-work-orders
→ 음성 파일 URL 포함된 업무지시 표시

# 3. 직원1이 음성 재생 후 확인
POST /api/work-orders/:id/confirm
{ "note": "음성 확인 완료, 청소 시작하겠습니다" }
```

---

## 📊 데이터베이스 마이그레이션

### 로컬 개발 환경
```bash
npx prisma migrate deploy
✅ Migration 20260222120000_add_work_order_system applied
```

### 프로덕션 환경
```bash
sqlite3 prisma/dev.db < migrations/20260222120000_add_work_order_system/migration.sql
npx prisma generate
pm2 restart jangpyosa-api
✅ Migration applied successfully
```

---

## 🚀 배포 상태

### 로컬 개발 환경
- ✅ 스키마 설계 완료
- ✅ 마이그레이션 적용 완료
- ✅ API 구현 완료
- ✅ API 서버 재시작 완료
- ✅ 헬스 체크 통과

### 프로덕션 환경 (jangpyosa.com)
- ✅ Git pull 완료 (commit 4a48fac)
- ✅ 마이그레이션 SQL 실행 완료
- ✅ Prisma Client 재생성 완료
- ✅ PM2 재시작 완료 (jangpyosa-api)
- ✅ API 헬스 체크 통과

---

## 📝 API 사용 예시

### 예시 1: 전체 직원에게 공지
```javascript
// 관리자
const response = await fetch('https://jangpyosa.com/api/work-orders/create', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    title: '회사 공지',
    content: '내일 전사 회의가 있습니다.',
    targetType: 'ALL',
    priority: 'NORMAL'
  })
});
```

### 예시 2: 특정 직원에게 개인 업무지시
```javascript
// 관리자
const response = await fetch('https://jangpyosa.com/api/work-orders/create', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    title: '재고 정리',
    content: '창고 A 구역 재고를 정리해주세요.',
    targetType: 'INDIVIDUAL',
    targetEmployees: ['emp_abc123'],
    priority: 'URGENT',
    dueDate: '2026-02-23T17:00:00.000Z',
    audioFileUrl: 'https://storage.com/audio/inventory.mp3',
    audioFileName: '재고정리_지시.mp3',
    audioDuration: 90
  })
});
```

### 예시 3: 직원이 자신의 업무지시 조회
```javascript
// 직원
const response = await fetch('https://jangpyosa.com/api/work-orders/my-work-orders', {
  headers: {
    'Authorization': `Bearer ${employeeToken}`
  }
});

const { workOrders } = await response.json();
// workOrders[0].audioFileUrl → 음성 파일 재생
```

### 예시 4: 직원이 업무지시 확인
```javascript
// 직원
const response = await fetch(`https://jangpyosa.com/api/work-orders/${workOrderId}/confirm`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${employeeToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    note: '확인했습니다. 바로 시작하겠습니다.'
  })
});
```

---

## 🔗 기존 공지사항 시스템과의 차이점

### 공지사항 (CompanyAnnouncement)
- **용도**: 회사 전체 공지 (일방향 커뮤니케이션)
- **대상**: 항상 전체 직원
- **읽음 처리**: 단순 읽음 체크
- **우선순위**: URGENT, NORMAL, LOW
- **음성 첨부**: 없음

### 업무지시 (WorkOrder)
- **용도**: 업무 지시 및 확인 (양방향 커뮤니케이션)
- **대상**: 전체 / 그룹 / 개인 선택 가능
- **확인 처리**: 확인 메모 첨부 가능
- **우선순위**: URGENT, NORMAL, LOW
- **마감일**: 설정 가능
- **음성 첨부**: 지원 ✅
- **확인 통계**: 실시간 확인률 표시

---

## 🎯 향후 개선 계획

### 단기 (1주일 이내)
- [ ] 음성 파일 직접 업로드 API 구현
- [ ] 프론트엔드 UI 구현 (업무지시 생성, 조회, 확인)
- [ ] 푸시 알림 연동 (새 업무지시 발송 시)

### 중기 (1개월 이내)
- [ ] 음성 파일 자동 변환 (mp3, wav, m4a → 표준 포맷)
- [ ] 업무지시 템플릿 기능
- [ ] 반복 업무지시 스케줄링 (매일, 매주, 매월)
- [ ] 업무지시 완료 보고 기능

### 장기 (3개월 이내)
- [ ] 음성 인식 (STT) 통한 자동 텍스트 변환
- [ ] 음성 합성 (TTS) 통한 자동 음성 생성
- [ ] 업무지시 통계 대시보드
- [ ] 이메일/SMS 알림 연동

---

## 📚 관련 문서
- [BACKUP-STRATEGY.md](./BACKUP-STRATEGY.md) - 백업 전략 문서
- [BACKUP-DEPLOYMENT-REPORT.md](./BACKUP-DEPLOYMENT-REPORT.md) - 백업 시스템 배포 보고서
- [FINAL-REPORT.md](./FINAL-REPORT.md) - 2026년 업데이트 최종 보고서

---

## 📞 문의 및 지원
- **GitHub**: https://github.com/masolshop/jangpyosa
- **Production**: https://jangpyosa.com
- **API Base**: https://jangpyosa.com/api

---

**작성일**: 2026-02-22  
**작성자**: AI Developer  
**최종 검증**: 2026-02-22 13:10 (KST)  
**배포 상태**: ✅ 성공
