const fs = require('fs');

let content = fs.readFileSync('apps/web/src/app/signup/page.tsx', 'utf8');

// 1. Remove "agent" from type definition
content = content.replace(
  'type SignupType = "agent" | "supplier" | "buyer" | "invited";',
  'type SignupType = "supplier" | "buyer" | "invited";'
);

// 2. Remove manager-only state variables (lines ~41-46)
content = content.replace(
  /  \/\/ 매니저 전용\n  const \[name, setName\] = useState\(""\);\n  const \[email, setEmail\] = useState\(""\);\n  const \[branchId, setBranchId\] = useState\(""\);\n  const \[refCode, setRefCode\] = useState\(""\);\n  const \[branches, setBranches\] = useState<any\[\]>\(\[\]\);/,
  ''
);

// 3. Remove branch loading useEffect (lines ~72-77)
content = content.replace(
  /  \/\/ 지사 목록 로드 \(매니저용\)\n  useEffect\(\(\) => \{\n    if \(type === "agent"\) \{\n      loadBranches\(\);\n    \}\n  \}, \[type\]\);/,
  ''
);

// 4. Remove loadBranches function
content = content.replace(
  /  async function loadBranches\(\) \{[\s\S]*?\n  \}/,
  ''
);

// 5. Remove manager validation block
content = content.replace(
  /    \/\/ 매니저 유효성 검사\n    if \(type === "agent"\) \{[\s\S]*?\n    \}/,
  ''
);

// 6. Remove agent signup endpoint block
content = content.replace(
  /      if \(type === "agent"\) \{[\s\S]*?\n      \} else if \(type === "supplier"\) \{/,
  '      if (type === "supplier") {'
);

// 7. Update error messages
content = content.replace(
  '추천인 매니저를 찾을 수 없습니다. 핸드폰 번호를 확인하거나 매니저에게 문의하세요.',
  '추천인을 찾을 수 없습니다. 핸드폰 번호를 확인하세요.'
);

// 8. Remove manager button from signup options (lines ~738-776)
content = content.replace(
  /\n\s+{\/\* 매니저 \*\/}\n\s+<div[\s\S]*?<\/ul>\n\s+<\/div>\n\s+<\/div>/m,
  ''
);

// 9. Remove manager title from form heading
content = content.replace(
  /{type === "agent" && "👤 매니저 가입"}\n\s+/,
  ''
);

// 10. Remove manager signup guide section
content = content.replace(
  /{type === "agent" && \(\n\s+<p style=\{\{ margin: 0 \}\}>\n\s+💡 <strong>매니저 가입 안내<\/strong><br\/>\n\s+소속 지사를 선택하고, 기업 추천 시 사용할 고유한 추천코드를 등록하세요\.\n\s+<\/p>\n\s+\)}\n\s+/,
  ''
);

// 11. Remove manager-only form fields section (lines ~811-864)
content = content.replace(
  /\s+{\/\* 매니저 전용 필드 \*\/}\n\s+{type === "agent" && \([\s\S]*?\n\s+<\/>\n\s+\)}\n\n/,
  ''
);

// 12. Update buyer guide - remove manager references
content = content.replace(
  '<li><strong>추천인 매니저</strong>의 핸드폰 번호를 입력해야 가입 가능합니다.</li>',
  '<li><strong>추천인</strong>의 핸드폰 번호를 입력해야 가입 가능합니다.</li>'
);
content = content.replace(
  '<li style={{ color: "#d32f2f", fontWeight: 600 }}>⚠️ 매니저를 통해서만 가입 가능합니다.</li>',
  ''
);

// 13. Update referrer phone label
content = content.replace(
  /추천인 매니저 핸드폰 번호/g,
  '추천인 핸드폰 번호'
);
content = content.replace(
  '담당 매니저에게 핸드폰 번호를 문의하세요',
  '담당 추천인에게 핸드폰 번호를 문의하세요'
);

// 14. Update signup type info list - remove manager bullet point
content = content.replace(
  '<li><strong>매니저</strong>: 소속 지사를 선택하고, 기업 추천 시 사용할 추천코드를 등록합니다.</li>',
  ''
);

fs.writeFileSync('apps/web/src/app/signup/page.tsx', content);
console.log('✅ 매니저 관련 코드 제거 완료');
