# 🏗️ 도급계약 이행·결제 관리 시스템 설계서

## 📋 개요
부담금 기업과 표준사업장 간의 연계고용 도급계약을 체결하고, 월별 계약 이행 및 결제를 관리하는 종합 시스템입니다.

---

## 🎯 핵심 기능

### 1. 계약 관리 (Contract Management)
- **계약서 등록**: 계약번호, 계약기간, 총 계약금액, 월별 금액
- **계약 상태**: ACTIVE(진행중), SUSPENDED(중단), TERMINATED(해지), COMPLETED(완료)
- **계약서 파일**: PDF 업로드 및 다운로드

### 2. 월별 이행 관리 (Monthly Performance Tracking)
- **계획 vs 실적**: 당월 계획금액과 실제 이행금액 비교
- **이행률 계산**: (실제금액 / 계획금액) × 100%
- **증빙자료**: 이행 증빙 파일 업로드 (사진, PDF 등)
- **이행 내역**: 세부 작업 내역 설명

### 3. 검수 관리 (Inspection Management)
- **검수 상태**: PENDING(대기), PASSED(합격), FAILED(불합격), WAIVED(면제)
- **검수일**: 검수 완료 일자
- **검수 메모**: 검수자 의견 및 피드백

### 4. 결제 관리 (Payment Management)
- **결제 상태**: UNPAID(미지급), PARTIAL(부분지급), PAID(완납), OVERDUE(연체)
- **결제 정보**: 금액, 일자, 방법, 참조번호
- **세금계산서**: 발행번호, 발행일, 파일 업로드
- **결제 이력**: 상세 결제 로그 기록

---

## 📊 데이터 구조

### Contract (도급계약서)
```typescript
{
  id: string                    // 계약 ID
  contractNo: string            // 계약번호 (CT-2026-0001)
  buyerId: string               // 부담금기업 ID
  supplierId: string            // 표준사업장 ID
  contractName: string          // 계약명
  startDate: Date               // 시작일
  endDate: Date                 // 종료일
  totalAmount: number           // 총 계약금액
  monthlyAmount: number         // 월 고정금액 (optional)
  status: string                // 계약 상태
  paymentTerms: string          // 결제 조건
  contractFileUrl: string       // 계약서 파일 URL
  memo: string                  // 메모
  createdAt: Date
  updatedAt: Date
}
```

### MonthlyPerformance (월별 이행 내역)
```typescript
{
  id: string
  contractId: string
  year: number                  // 2026
  month: number                 // 1-12
  plannedAmount: number         // 계획금액
  actualAmount: number          // 실제금액
  performanceRate: number       // 이행률 (%)
  description: string           // 이행 설명
  evidenceFileUrls: string      // 증빙파일 URLs (JSON)
  
  // 검수
  inspectionStatus: string      // PENDING, PASSED, FAILED, WAIVED
  inspectionDate: Date
  inspectionNotes: string
  
  // 결제
  paymentStatus: string         // UNPAID, PARTIAL, PAID, OVERDUE
  paymentAmount: number
  paymentDate: Date
  paymentMethod: string
  paymentReference: string
  
  // 세금계산서
  invoiceNo: string
  invoiceDate: Date
  invoiceFileUrl: string
  
  createdAt: Date
  updatedAt: Date
}
```

### PaymentHistory (결제 이력)
```typescript
{
  id: string
  performanceId: string         // MonthlyPerformance ID
  amount: number                // 결제 금액
  paymentDate: Date             // 결제일
  paymentMethod: string         // 결제 방법
  reference: string             // 참조번호
  status: string                // COMPLETED, CANCELLED, REFUNDED
  memo: string
  createdBy: string             // 처리자 User ID
  createdAt: Date
}
```

---

## 🔄 워크플로우

### 계약 체결 플로우
```
1. 카탈로그 → 장바구니 추가
2. 장바구니 → 계약 요청
3. 표준사업장 승인
4. 계약서 생성 (Contract 생성)
5. 월별 이행 계획 생성 (MonthlyPerformance 자동 생성)
```

### 월별 이행 플로우
```
1. 이행 예정 (PENDING)
   ↓
2. 이행 완료 & 증빙자료 업로드 (actualAmount 입력)
   ↓
3. 검수 진행 (PASSED/FAILED)
   ↓ (PASSED인 경우)
4. 세금계산서 발행
   ↓
5. 결제 진행 (PAID)
```

### 결제 플로우
```
1. 검수 합격 (inspectionStatus = PASSED)
   ↓
2. 세금계산서 발행 (invoiceNo 입력)
   ↓
3. 결제 승인 (paymentStatus = PAID)
   ↓
4. PaymentHistory 기록
   ↓
5. 고용공단 감면 신청
```

---

## 🎨 UI/UX 설계

### 1. 계약 목록 페이지 (`/dashboard/contracts`)
- 전체 계약 목록 테이블
- 필터: 상태별, 기간별, 업체별
- 검색: 계약번호, 계약명
- 액션: 상세보기, 월별현황, 계약서 다운로드

### 2. 계약 상세 페이지 (`/dashboard/contracts/:id`)
- 계약 정보 요약
- 월별 이행 현황 타임라인
- 결제 현황 차트
- 증빙자료 갤러리

### 3. 월별 이행 관리 페이지 (`/dashboard/contracts/:id/monthly`)
- 월별 카드 레이아웃
- 각 월: 계획/실제/이행률, 검수/결제 상태
- 빠른 액션 버튼: 이행등록, 검수, 결제

### 4. 이행 등록 모달
- 실제 이행금액 입력
- 이행 내역 텍스트
- 증빙자료 파일 업로드
- 저장 → 검수 대기 상태로

### 5. 검수 모달
- 검수 결과 선택 (합격/불합격/면제)
- 검수 메모 입력
- 합격 시 → 세금계산서 발행 안내

### 6. 결제 모달
- 결제 금액 입력
- 결제 방법 선택
- 결제 일자 선택
- 세금계산서 번호 입력
- 세금계산서 파일 업로드

---

## 📈 대시보드 통계

### 계약 현황 카드
- 전체 계약 수
- 진행 중 계약
- 당월 예정 금액
- 당월 이행 금액
- 당월 결제 금액
- 미결제 금액

### 이행률 차트
- 월별 이행률 추이 (Line Chart)
- 계약별 이행률 비교 (Bar Chart)

### 결제 현황 차트
- 월별 결제 현황 (Stacked Bar)
- 미결제 항목 (Pie Chart)

---

## 🔔 알림 시스템

### 자동 알림 트리거
1. **이행 예정일 3일 전**: "○○ 계약 이행 예정입니다"
2. **검수 대기**: "○○ 계약 검수가 필요합니다"
3. **결제 예정일**: "○○ 계약 결제일입니다"
4. **결제 연체**: "○○ 계약이 연체되었습니다"

---

## 🔒 권한 관리

### BUYER (부담금 기업)
- 계약 목록 조회
- 월별 이행 내역 조회
- 검수 진행
- 결제 처리
- 대시보드 통계 조회

### SUPPLIER (표준사업장)
- 자사 계약 목록 조회
- 이행 내역 등록
- 증빙자료 업로드
- 결제 상태 조회

### SUPER_ADMIN
- 전체 계약 조회
- 모든 액션 가능
- 통계 리포트 생성

---

## 🚀 API 엔드포인트

### 계약 관리
- `GET /contracts` - 계약 목록
- `GET /contracts/:id` - 계약 상세
- `POST /contracts` - 계약 생성
- `PUT /contracts/:id` - 계약 수정
- `DELETE /contracts/:id` - 계약 삭제

### 월별 이행
- `GET /contracts/:id/performances` - 월별 이행 목록
- `GET /performances/:id` - 이행 상세
- `POST /performances` - 이행 등록
- `PUT /performances/:id` - 이행 수정
- `PUT /performances/:id/inspection` - 검수 처리
- `PUT /performances/:id/payment` - 결제 처리

### 통계
- `GET /contracts/stats` - 계약 통계
- `GET /contracts/:id/stats` - 개별 계약 통계

---

## 💡 추천 기능 (Phase 2)

1. **자동 계획 생성**: 계약 생성 시 월별 이행 계획 자동 생성
2. **엑셀 일괄 업로드**: 월별 이행 내역 엑셀 업로드
3. **PDF 리포트**: 계약별 이행·결제 리포트 PDF 생성
4. **이메일 알림**: 중요 이벤트 이메일 자동 발송
5. **고용공단 연동**: 감면 신청 자동화
6. **계약 갱신 알림**: 계약 종료 30일 전 알림
7. **모바일 앱**: 이행 등록 모바일 지원

---

## 🎓 베스트 프랙티스

### 1. 데이터 무결성
- 계약금액 = Σ월별 계획금액
- 결제금액 ≤ 실제 이행금액
- 검수 합격 후에만 결제 가능

### 2. 상태 전이 규칙
```
이행: PENDING → (actualAmount 입력) → 검수 대기
검수: PENDING → PASSED/FAILED
결제: UNPAID → (결제 처리) → PAID
```

### 3. 파일 관리
- 계약서: `/uploads/contracts/{contractId}/contract.pdf`
- 증빙자료: `/uploads/performances/{performanceId}/evidence_{timestamp}.jpg`
- 세금계산서: `/uploads/performances/{performanceId}/invoice.pdf`

### 4. 감사 로그
- 모든 변경 사항 기록
- 누가, 언제, 무엇을, 어떻게 변경했는지

---

## 📞 문의
- 담당자: AI Developer
- 이메일: developer@jangpyosa.com
- 버전: 1.0.0
- 작성일: 2026-02-17
