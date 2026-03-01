const fs = require('fs');

let content = fs.readFileSync('apps/web/src/app/signup/page.tsx', 'utf8');

// Fix indentation after return statements
content = content.replace(
  /    if \(step === "select" && !isInvited\) \{\n      return \(\n      <div className="container">/,
  '    if (step === "select" && !isInvited) {\n      return (\n        <div className="container">'
);

content = content.replace(
  /    if \(step === "form"\) \{\n      return \(\n      <div className="container">/,
  '    if (step === "form") {\n      return (\n        <div className="container">'
);

fs.writeFileSync('apps/web/src/app/signup/page.tsx', content);
console.log('✅ 인덴트 수정 완료');
