# 🔐 사업자번호 인증 방법 (두 가지)

**작성일**: 2026-03-05 07:50 KST

---

## 📋 개요

장표사닷컴은 **두 가지 다른 인증 방식**을 사용합니다:

1. **표준사업장 (SUPPLIER)** → DB 878개 데이터 매칭 인증
2. **고용부담금 기업 (BUYER)** → APICK 실제 API 인증

---

## 🏢 1. 표준사업장 인증 (SupplierRegistry)

### 특징
- ✅ 엑셀 업로드로 구축된 **878개 장애인표준사업장 DB** 사용
- ✅ 사업자번호로 DB에서 검색하여 매칭
- ✅ **비용 없음** (내부 DB 조회)
- ✅ 인증된 표준사업장만 가입 가능

### API 엔드포인트
```
GET /api/registry/verify/:bizNo
GET /registry/verify/:bizNo (백엔드)
```

### 테스트 사업자번호
```
6029669166 → 서울상무정형외과의원 (최성우) ✅
2249124402 → 다온재활의학과의원 (김정문, 박태준, 유문기) ✅
3878703598 → ㈜벨링크 (이한울) ✅
```

### 응답 예시
```json
{
  "ok": true,
  "registry": {
    "name": "서울상무정형외과의원",
    "bizNo": "6029669166",
    "representative": "최성우",
    "region": "광주지역본부",
    "industry": "보건업(정형외과)",
    "certNo": "제2025-140호",
    "certDate": "2025-12-30",
    "contactTel": "-"
  },
  "message": "장애인표준사업장 인증이 확인되었습니다"
}
```

### 회원가입 플로우
1. 회원 유형 선택: "표준사업장 기업" 선택
2. 사업자번호 입력 (10자리)
3. "인증" 버튼 클릭
4. **DB 검색** → 매칭 성공 시 상호명/대표자명 자동 입력
5. 회원가입 완료

---

## 💼 2. 고용부담금 기업 인증 (APICK API)

### 특징
- ✅ **실제 APICK API** 호출 (한국 사업자번호 검증)
- ✅ 실시간 기업 정보 조회
- ✅ 폐업 여부 확인
- ❌ **비용 발생**: 1회당 40원

### API 엔드포인트
```
GET /api/apick/bizno/:bizNo
GET /apick/bizno/:bizNo (백엔드)
```

### APICK 설정 (🔒 변경 금지!)
```javascript
APICK_PROVIDER: "real"
APICK_API_KEY: "41173030f4fc1055778b2f97ce9659b5"
```

### 테스트 사업자번호
```
1208800767 → 쿠팡 주식회사 (ROGERS HAROLD LYNN) ✅
```

### 응답 예시
```json
{
  "success": true,
  "bizNo": "1208800767",
  "companyName": "쿠팡 주식회사",
  "ceoName": "ROGERS HAROLD LYNN(로저스해럴드린)",
  "data": {
    "회사명": "쿠팡 주식회사",
    "사업자등록번호": "1208800767",
    "사업자상태": "계속사업자",
    "과세유형": "부가가치세 일반과세자",
    "대표명": "ROGERS HAROLD LYNN(로저스해럴드린)",
    "설립일": "2013-07-16",
    "업종": "도소매",
    "업태": "통신판매업",
    "전화번호": "02-1577-7011",
    "직원수": "12155"
  }
}
```

### 회원가입 플로우
1. 회원 유형 선택: "기업회원가입" 선택
2. 사업자번호 입력 (10자리)
3. "인증" 버튼 클릭
4. **APICK API 호출** → 실제 기업 정보 자동 입력
5. 회원가입 완료

---

## 🔀 코드 구현

### 프론트엔드 (apps/web/src/app/signup/page.tsx)

```typescript
async function verifyBizNo() {
  const cleanBizNo = bizNo.replace(/\D/g, "");
  
  try {
    // 표준사업장: SupplierRegistry에서 인증 확인
    if (type === "supplier") {
      const response = await fetch(`/api/registry/verify/${cleanBizNo}`);
      const data = await response.json();
      
      if (!response.ok) {
        setMsg("❌ 표준사업장이 아닙니다. 등록된 장애인표준사업장만 가입 가능합니다.");
        return;
      }
      
      setCompanyInfo({
        name: data.registry?.name || "회사명 확인 필요",
        ceo: data.registry?.representative || "대표자명 확인 필요"
      });
      setMsg("✅ 장애인표준사업장 인증 확인 완료");
    } 
    // 고용부담금 기업: APICK API로 인증
    else {
      const response = await fetch(`/api/apick/bizno/${cleanBizNo}`);
      const data = await response.json();
      
      if (!response.ok) {
        setMsg(`❌ ${data.message || "사업자번호 인증 실패"}`);
        return;
      }
      
      setCompanyInfo({
        name: data.companyName || "회사명 확인 필요",
        ceo: data.ceoName || "대표자명 확인 필요"
      });
      setMsg("✅ 사업자번호 인증 완료");
    }
  } catch (error) {
    console.error("BizNo verification error:", error);
    setMsg("❌ 사업자번호 인증 중 오류 발생");
  }
}
```

### 백엔드 라우트

**표준사업장 인증** (`apps/api/src/routes/registry.ts`)
```typescript
router.get('/verify/:bizNo', async (req, res) => {
  const bizNo = req.params.bizNo.replace(/\D/g, '');
  
  const registry = await prisma.supplierRegistry.findUnique({
    where: { bizNo },
  });

  if (!registry) {
    return res.status(404).json({ 
      ok: false,
      error: 'NOT_REGISTERED_SUPPLIER', 
      message: '등록된 장애인표준사업장이 아닙니다.' 
    });
  }

  res.json({ 
    ok: true,
    registry: {
      name: registry.name,
      bizNo: registry.bizNo,
      representative: registry.representative,
      // ...
    },
    message: '장애인표준사업장 인증이 확인되었습니다'
  });
});
```

**고용부담금 기업 인증** (`apps/api/src/routes/apick.ts`)
```typescript
router.get("/bizno/:bizNo", async (req, res) => {
  const { bizNo } = req.params;
  const cleanBizNo = bizNo.replace(/\D/g, "");
  
  // APICK API 호출
  const result = await verifyBizNo(cleanBizNo);

  if (!result.ok) {
    return res.status(400).json({
      error: "BIZNO_VERIFICATION_FAILED",
      message: result.error || "사업자번호 인증에 실패했습니다",
    });
  }

  return res.json({
    success: true,
    bizNo: cleanBizNo,
    companyName: result.name,
    ceoName: result.representative,
    data: result.data,
  });
});
```

---

## 📊 비교표

| 항목 | 표준사업장 (Supplier) | 고용부담금 기업 (Buyer) |
|------|---------------------|---------------------|
| **인증 방식** | 내부 DB 검색 (878개) | APICK 실제 API |
| **데이터 소스** | 엑셀 업로드 DB | 한국 국세청 데이터 |
| **비용** | 무료 | 1회 40원 |
| **인증 속도** | 매우 빠름 (DB 조회) | 빠름 (API 호출) |
| **데이터 범위** | 878개 표준사업장 | 전국 모든 사업자 |
| **폐업 확인** | 수동 업데이트 | 실시간 확인 |
| **API 엔드포인트** | `/api/registry/verify/:bizNo` | `/api/apick/bizno/:bizNo` |

---

## ✅ 테스트 확인

### 표준사업장 테스트
```bash
# 백엔드
curl 'http://localhost:4000/registry/verify/6029669166'

# 프론트엔드
curl 'http://localhost:3003/api/registry/verify/6029669166'
```

### 고용부담금 기업 테스트
```bash
# 백엔드
curl 'http://localhost:4000/apick/bizno/1208800767'

# 프론트엔드
curl 'http://localhost:3003/api/apick/bizno/1208800767'
```

### 브라우저 테스트
https://jangpyosa.com/signup

**표준사업장:**
1. "표준사업장 기업" 선택
2. 사업자번호: `6029669166`
3. 결과: "서울상무정형외과의원" + "최성우" ✅

**고용부담금 기업:**
1. "기업회원가입" 선택
2. 사업자번호: `1208800767`
3. 결과: "쿠팡 주식회사" + "ROGERS HAROLD LYNN" ✅

---

## 🔗 관련 파일

### 프론트엔드
- `apps/web/src/app/signup/page.tsx` - 회원가입 페이지
- `apps/web/src/app/api/registry/verify/[bizNo]/route.ts` - 표준사업장 API 프록시
- `apps/web/src/app/api/apick/bizno/[bizNo]/route.ts` - APICK API 프록시

### 백엔드
- `apps/api/src/routes/registry.ts` - 표준사업장 인증 라우트
- `apps/api/src/routes/apick.ts` - APICK 인증 라우트
- `apps/api/src/services/apick.ts` - APICK API 서비스

### 데이터베이스
- `SupplierRegistry` 테이블 - 878개 표준사업장 정보

---

**작성일**: 2026-03-05 07:50 KST  
**상태**: ✅ 두 가지 인증 방식 모두 정상 작동  
**테스트**: ✅ 표준사업장, 고용부담금 기업 인증 성공
