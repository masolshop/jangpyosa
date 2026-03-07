/**
 * 핸드폰 번호 정규화 테스트
 * 다양한 형식의 핸드폰 번호가 올바르게 처리되는지 확인
 */

function normalizePhone(phone) {
  // 숫자만 추출
  let cleanPhone = phone.replace(/\D/g, "");
  
  // 10자리이고 0으로 시작하지 않으면 0 추가 (1012345678 -> 01012345678)
  if (cleanPhone.length === 10 && cleanPhone[0] !== "0") {
    cleanPhone = "0" + cleanPhone;
  }
  
  return cleanPhone;
}

function toReferralCode(phone) {
  const normalized = normalizePhone(phone);
  return normalized.startsWith('0') ? normalized.substring(1) : normalized;
}

// 테스트 케이스
const testCases = [
  // 입력 형식, 예상되는 normalized, 예상되는 referralCode
  ['010-1234-5678', '01012345678', '1012345678'],
  ['01012345678', '01012345678', '1012345678'],
  ['1012345678', '01012345678', '1012345678'],
  ['010 1234 5678', '01012345678', '1012345678'],
  ['(010)1234-5678', '01012345678', '1012345678'],
  ['011-234-5678', '0112345678', '112345678'],
  ['010-9876-5432', '01098765432', '1098765432'],
  ['1098765432', '01098765432', '1098765432'],
];

console.log('📱 핸드폰 번호 정규화 테스트\n');

let passCount = 0;
let failCount = 0;

testCases.forEach(([input, expectedNormalized, expectedReferralCode], index) => {
  const normalized = normalizePhone(input);
  const referralCode = toReferralCode(input);
  
  const normalizedMatch = normalized === expectedNormalized;
  const referralCodeMatch = referralCode === expectedReferralCode;
  
  const status = (normalizedMatch && referralCodeMatch) ? '✅' : '❌';
  
  if (normalizedMatch && referralCodeMatch) {
    passCount++;
  } else {
    failCount++;
  }
  
  console.log(`${status} 테스트 ${index + 1}`);
  console.log(`   입력: ${input}`);
  console.log(`   정규화: ${normalized} ${normalizedMatch ? '✅' : `❌ (예상: ${expectedNormalized})`}`);
  console.log(`   추천코드: ${referralCode} ${referralCodeMatch ? '✅' : `❌ (예상: ${expectedReferralCode})`}`);
  console.log('');
});

console.log(`\n결과: ${passCount}개 성공, ${failCount}개 실패\n`);

// 구글 시트 예시
console.log('📊 구글 시트 저장 형식 예시:');
console.log('   매니저 핸드폰: 01012345678 (User.phone)');
console.log('   추천인 코드: 1012345678 (SalesPerson.referralCode)');
console.log('   추천인 링크: https://jangpyosa.com/01012345678');
console.log('\n💡 모든 입력 형식 (010-1234-5678, 01012345678, 1012345678)이 동일하게 처리됩니다!\n');

process.exit(failCount > 0 ? 1 : 0);
