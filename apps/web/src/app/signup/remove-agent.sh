#!/bin/bash

# agent 관련 모든 코드 제거

# 1. type === "agent" 조건문 제거
sed -i '/if (type === "agent")/,/^  }/d' page.tsx

# 2. handleTypeSelect("agent") 버튼 부분 제거  
sed -i '/onClick={() => handleTypeSelect("agent")}/,/^            <\/button>/d' page.tsx

# 3. type === "agent" 관련 표시 텍스트 제거
sed -i '/{type === "agent"/d' page.tsx

echo "✅ agent 관련 코드 제거 완료"
