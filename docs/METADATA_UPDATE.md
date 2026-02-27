# 🚀 메타태그 및 OG 이미지 업데이트 완료

## 📋 업데이트 내역 (2026-02-27)

### ✅ 완료된 작업

#### 1. SEO 메타태그 추가
- **Title**: 장표사닷컴 - 국내유일 장애인고용관리솔루션
- **Description**: 연계고용감면플랫폼 및 장애인고용관리솔루션. 장애인표준사업장 연계 고용으로 고용부담금 50~90% 감면!
- **Keywords**: 장애인고용, 고용부담금, 장애인표준사업장, 연계고용 등 10개 핵심 키워드

#### 2. Open Graph (SNS 공유) 설정
- **OG 이미지**: `/public/og-image.png` (188KB)
  - 크기: 800x450px
  - 내용: "국내유일 무료 장애인고용관리솔루션 (담당자용 체험 계정 제공)"
- **OG Type**: website
- **OG Locale**: ko_KR
- **OG URL**: https://jangpyosa.com

#### 3. Twitter Card 메타데이터
- **Card Type**: summary_large_image
- **Image**: `/og-image.png`
- **Title & Description**: Open Graph와 동일

#### 4. Favicon 추가
- **파일**: `/public/favicon.ico`
- **크기**: 32x32px
- **생성 방법**: logo.png에서 리사이즈

#### 5. Next.js 구조 개선
- **layout.tsx**: Server Component로 변환 (metadata 지원)
- **LayoutContent.tsx**: Client Component 분리 (동적 기능 유지)
- **빌드 성공**: 48 pages 생성 완료

---

## 📱 메타태그 상세 정보

### Title Tag
```html
장표사닷컴 - 국내유일 장애인고용관리솔루션
```

### Meta Description
```html
연계고용감면플랫폼 및 장애인고용관리솔루션. 
장애인표준사업장 연계 고용으로 고용부담금 50~90% 감면! 
장애인고용 관리 담당자를 위한 장애인 고용관리 솔루션 무료 제공! 
장애인고용관리 담당자님 체험용 계정으로 체험후 사용하세요.
```

### Keywords
1. 장애인고용
2. 고용부담금
3. 장애인표준사업장
4. 연계고용
5. 고용부담금감면
6. 장애인고용관리
7. 장애인고용솔루션
8. 고용의무
9. 장애인채용
10. 표준사업장

---

## 🖼️ OG 이미지 정보

### 이미지 내용
```
┌─────────────────────────────────────────────────┐
│  [일러스트: 휠체어 탄 여성과 서있는 여성]        │
│                                                 │
│  장표사닷컴                                      │
│  국내유일 무료                                   │
│  장애인고용관리솔루션                            │
│  (담당자용 체험 계정 제공)                       │
│                                                 │
│  장애인표준사업장                                │
│  연계고용감면플랫폼                              │
│  (고용부담금 50~90% 감면)                       │
└─────────────────────────────────────────────────┘
```

### 사용 위치
- 카카오톡 링크 공유 시
- 페이스북 링크 공유 시
- 네이버 블로그 링크 공유 시
- 트위터/X 링크 공유 시
- 기타 SNS 플랫폼

---

## 🔧 기술적 변경사항

### Before (기존)
```typescript
// apps/web/src/app/layout.tsx
'use client';  // 전체가 Client Component

export default function RootLayout({ children }) {
  // useSearchParams, usePathname 사용
  // metadata 지원 불가
}
```

### After (변경 후)
```typescript
// apps/web/src/app/layout.tsx
export const metadata: Metadata = { ... }  // Server Component

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <head>...</head>
      <body>
        <LayoutContent>{children}</LayoutContent>  // Client Component
      </body>
    </html>
  )
}

// apps/web/src/components/LayoutContent.tsx
'use client';  // 동적 기능만 분리

export default function LayoutContent({ children }) {
  // useSearchParams, usePathname 사용
}
```

### 이점
1. ✅ SEO: 서버사이드 메타태그 렌더링
2. ✅ 성능: 초기 로딩 속도 개선
3. ✅ SNS: Open Graph 태그 크롤링 가능
4. ✅ 유지보수: 관심사 분리 (metadata vs 동적 기능)

---

## 🚀 배포 계획

### 1. AWS 서버 업데이트
```bash
# 1. SSH 접속
ssh -i ~/.ssh/jangpyosa ubuntu@jangpyosa.com

# 2. 코드 pull
cd /home/ubuntu/jangpyosa
git pull origin main

# 3. 프론트엔드 빌드
cd apps/web
npm install
npm run build

# 4. PM2 재시작
pm2 restart jangpyosa-web
pm2 status
```

### 2. 검증 방법
```bash
# 1. 메타태그 확인
curl -I https://jangpyosa.com
curl -s https://jangpyosa.com | grep -E "(og:|twitter:|title|description)" | head -20

# 2. OG 이미지 확인
curl -I https://jangpyosa.com/og-image.png

# 3. Favicon 확인
curl -I https://jangpyosa.com/favicon.ico
```

### 3. SNS 공유 테스트
- [ ] 카카오톡 링크 공유 → OG 이미지 노출 확인
- [ ] 페이스북 Debugger: https://developers.facebook.com/tools/debug/
- [ ] Twitter Card Validator: https://cards-dev.twitter.com/validator
- [ ] LinkedIn Post Inspector: https://www.linkedin.com/post-inspector/

---

## 📊 SEO 개선 효과 (예상)

### Before
- 메타태그: 기본값 (Next.js default)
- OG 이미지: 없음
- SNS 공유: 텍스트만 표시
- 검색 엔진: 제목/설명 불명확

### After
- 메타태그: 최적화된 제목/설명
- OG 이미지: 전문적인 썸네일
- SNS 공유: 이미지 + 제목 + 설명
- 검색 엔진: 명확한 키워드 타겟팅

### 개선 지표
- **CTR (Click-Through Rate)**: +30~50% 예상
- **SNS 공유율**: +60~80% 예상
- **검색 노출**: 주요 키워드 상위 노출 가능성
- **브랜드 인지도**: 전문적인 이미지 제고

---

## 📚 관련 문서

1. [Next.js Metadata 공식 문서](https://nextjs.org/docs/app/building-your-application/optimizing/metadata)
2. [Open Graph Protocol](https://ogp.me/)
3. [Twitter Cards Documentation](https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/abouts-cards)

---

## ✅ 체크리스트

### 개발 완료
- [x] 메타태그 추가 (layout.tsx)
- [x] OG 이미지 다운로드 (og-image.png)
- [x] Favicon 생성 (favicon.ico)
- [x] Client Component 분리 (LayoutContent.tsx)
- [x] 빌드 테스트 (npm run build)
- [x] Git commit & push

### 배포 대기
- [ ] AWS 서버 코드 pull
- [ ] 프론트엔드 빌드
- [ ] PM2 재시작
- [ ] 메타태그 검증
- [ ] SNS 공유 테스트

### 모니터링
- [ ] Google Search Console 등록
- [ ] 검색 노출 추적
- [ ] SNS 공유 통계
- [ ] 유입 경로 분석

---

**작성일**: 2026-02-27  
**작성자**: AI Assistant  
**상태**: ✅ 개발 완료, AWS 배포 준비 완료

**다음 단계**: AWS 서버에 배포하여 Production 환경에 적용
