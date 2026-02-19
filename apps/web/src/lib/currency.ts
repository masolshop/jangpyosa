/**
 * 숫자를 한글 금액으로 변환하는 함수
 * @param num 변환할 숫자
 * @returns 한글 금액 문자열 (예: "천이백삼십사만오천육백칠십팔")
 */
export function toKoreanCurrency(num: number): string {
  const units = ['', '만', '억', '조'];
  const smallUnits = ['', '천', '백', '십'];
  
  if (num === 0) return '';
  
  let result = '';
  let unitIndex = 0;
  
  while (num > 0) {
    const part = num % 10000;
    if (part > 0) {
      let partStr = '';
      let tempPart = part;
      let smallUnitIndex = 0;
      
      while (tempPart > 0) {
        const digit = tempPart % 10;
        if (digit > 0) {
          // 1천, 1백, 1십은 "일"을 생략
          if (digit === 1 && smallUnitIndex > 0) {
            partStr = smallUnits[smallUnitIndex] + partStr;
          } else {
            partStr = digit + smallUnits[smallUnitIndex] + partStr;
          }
        }
        tempPart = Math.floor(tempPart / 10);
        smallUnitIndex++;
      }
      
      result = partStr + units[unitIndex] + result;
    }
    num = Math.floor(num / 10000);
    unitIndex++;
  }
  
  return result;
}

/**
 * 금액 포맷팅 함수 (천단위 구분 + 한글)
 * @param amount 포맷팅할 금액
 * @returns 포맷된 금액과 한글 표기
 */
export function formatCurrency(amount: number): { formatted: string; korean: string } {
  const roundedAmount = Math.round(amount);
  const formatted = roundedAmount.toLocaleString();
  const korean = toKoreanCurrency(roundedAmount);
  
  return {
    formatted,
    korean: korean ? `(${korean}원)` : ''
  };
}

/**
 * 금액을 포맷된 문자열로 반환 (천단위 구분 + 한글)
 * @param amount 포맷팅할 금액
 * @returns "12,345,678원 (천이백삼십사만오천육백칠십팔원)"
 */
export function formatCurrencyWithKorean(amount: number): string {
  const { formatted, korean } = formatCurrency(amount);
  return `${formatted}원 ${korean}`;
}
