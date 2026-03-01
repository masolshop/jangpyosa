#!/bin/bash

FILE="apps/web/src/app/signup/page.tsx"

# 1. 타입 정의에서 "agent" 제거
sed -i 's/type SignupType = "agent" | "supplier" | "buyer" | "invited";/type SignupType = "supplier" | "buyer" | "invited";/' "$FILE"

# 2. 매니저 전용 상태 변수 제거 (41-46행)
sed -i '/^  \/\/ 매니저 전용$/,/^  const \[branches, setBranches\] = useState<any\[\]>(\[\]);$/d' "$FILE"

# 3. 지사 목록 로드 useEffect 제거 (72-77행)
sed -i '/^  \/\/ 지사 목록 로드 (매니저용)$/,/^  }, \[type\]);$/d' "$FILE"

# 4. 매니저 유효성 검사 제거 (299-306행)
sed -i '/^    \/\/ 매니저 유효성 검사$/,/^    }$/d' "$FILE"

# 5. agent endpoint 로직 제거 (343-355행)
sed -i '/^      if (type === "agent") {$/,/^      } else if (type === "supplier") {$/c\      if (type === "supplier") {' "$FILE"

# 6. 에러 메시지에서 "매니저" 제거
sed -i 's/추천인 매니저를 찾을 수 없습니다\. 핸드폰 번호를 확인하거나 매니저에게 문의하세요\./추천인을 찾을 수 없습니다. 핸드폰 번호를 확인하세요./' "$FILE"

# 7. 제목에서 매니저 가입 제거
sed -i '/^          {type === "agent" && "👤 매니저 가입"}$/d' "$FILE"

# 8. 매니저 가입 안내 섹션 제거
sed -i '/^          {type === "agent" && ($/,/^          )}$/d' "$FILE"

# 9. 매니저 전용 필드 전체 제거 (811-864행)
sed -i '/^          {\/\* 매니저 전용 필드 \*\/}$/,/^          {\/\* 기업 전용 필드 (supplier, buyer) \*\/}$/c\          {/* 기업 전용 필드 (supplier, buyer) */}' "$FILE"

# 10. buyer 안내 문구에서 매니저 관련 항목 제거
sed -i 's/<strong>추천인 매니저<\/strong>의 핸드폰 번호를 입력해야 가입 가능합니다\./<strong>추천인<\/strong>의 핸드폰 번호를 입력해야 가입 가능합니다./' "$FILE"
sed -i '/<li style={{ color: "#d32f2f", fontWeight: 600 }}>⚠️ 매니저를 통해서만 가입 가능합니다\.<\/li>/d' "$FILE"

# 11. 추천인 매니저 핸드폰 → 추천인 핸드폰
sed -i 's/추천인 매니저 핸드폰 번호/추천인 핸드폰 번호/' "$FILE"
sed -i 's/담당 매니저에게 핸드폰 번호를 문의하세요/담당 추천인에게 핸드폰 번호를 문의하세요/' "$FILE"

echo "✅ 매니저 관련 코드 제거 완료"
