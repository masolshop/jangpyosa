# 🔧 캐시 문제 해결 보고서

## 🐛 문제 증상
- 코드는 정상적으로 배포되었으나 실제 화면에 문구가 표시되지 않음
- 시크릿 모드에서도 동일한 증상 발생
- 브라우저 캐시 문제가 아님

## 🔍 원인 분석
**Next.js 빌드 캐시 문제**
- `.next` 디렉토리에 이전 빌드 결과가 캐시되어 있음
- PM2 restart만으로는 새로운 코드가 반영되지 않음
- Next.js는 빌드 최적화를 위해 `.next/cache`를 사용

## ✅ 해결 방법

### 1단계: `.next` 캐시 삭제
```bash
cd /home/ubuntu/jangpyosa/apps/web
rm -rf .next
```

### 2단계: 새로 빌드
```bash
npm run build
```

### 3단계: PM2 재시작
```bash
pm2 restart jangpyosa-web
```

## 📋 향후 배포 절차

코드 변경 시 다음 순서로 배포:

```bash
# 1. Git Pull
cd /home/ubuntu/jangpyosa
git pull origin main

# 2. .next 캐시 삭제 (프론트엔드 변경 시)
cd apps/web
rm -rf .next

# 3. 새로 빌드
npm run build

# 4. PM2 재시작
cd /home/ubuntu/jangpyosa
pm2 restart all
```

## 🎯 적용된 변경사항

### 붉은색 참고용 문구 추가
**페이지:**
1. ✅ 월별 고용장려금부담금 관리 (`/dashboard/monthly`)
2. ✅ 장애인 직원 등록·관리 (`/dashboard/employees`)

**스타일:**
- 배경: 연한 빨강 (#fee)
- 테두리: 진한 빨강 (#dc2626, 2px)
- 글자색: 진한 빨강 (#dc2626)
- 중앙 정렬, 굵게(600)

**문구:**
```
⚠️ 본 자동계산 프로그램은 실제 고용부담금 신고프로그램이 아닌 참고용 프로그램입니다.
```

## 🚀 최종 배포 정보

- **해결 시간**: 2026-02-22 23:52 KST
- **PM2 Restart**: #93
- **서비스 URL**: https://jangpyosa.com
- **상태**: ✅ 정상 표시 확인

---

## 💡 교훈

Next.js 프로젝트 배포 시:
1. **코드 변경 후 반드시 `.next` 캐시 삭제**
2. **재빌드 필수**
3. **PM2 restart만으로는 부족**

특히 UI 변경사항은 반드시 위 절차를 따라야 합니다.

