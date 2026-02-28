/**
 * 전화번호/사업자번호 정규화 유틸리티 (프론트엔드용)
 * 
 * 목적: AI 혼동 방지 및 데이터 일관성 유지
 * - 하이픈, 공백, 점 등 모든 비숫자 문자 제거
 * - API 전송 전 항상 정규화 필수
 * 
 * @see README_FOR_AI.md - 하이픈 정책
 */

/**
 * 전화번호 정규화
 * 
 * @param phone - 원본 전화번호 (예: "010-1234-5678", "010 1234 5678", "01012345678")
 * @returns 숫자만 포함된 전화번호 (예: "01012345678") 또는 빈 문자열
 * 
 * @example
 * normalizePhone("010-1234-5678") // "01012345678"
 * normalizePhone("010 1234 5678") // "01012345678"
 * normalizePhone("010.1234.5678") // "01012345678"
 * normalizePhone(null) // ""
 * normalizePhone("") // ""
 */
export function normalizePhone(phone: string | null | undefined): string {
  if (!phone) return "";
  
  // 모든 비숫자 문자 제거 (하이픈, 공백, 점, 괄호 등)
  return phone.replace(/\D/g, "");
}

/**
 * 사업자등록번호 정규화
 * 
 * @param bizNo - 원본 사업자번호 (예: "123-45-67890", "123 45 67890", "1234567890")
 * @returns 숫자만 포함된 사업자번호 (예: "1234567890") 또는 빈 문자열
 * 
 * @example
 * normalizeBizNo("123-45-67890") // "1234567890"
 * normalizeBizNo("123 45 67890") // "1234567890"
 * normalizeBizNo("123.45.67890") // "1234567890"
 * normalizeBizNo(null) // ""
 * normalizeBizNo("") // ""
 */
export function normalizeBizNo(bizNo: string | null | undefined): string {
  if (!bizNo) return "";
  
  // 모든 비숫자 문자 제거 (하이픈, 공백, 점 등)
  return bizNo.replace(/\D/g, "");
}

/**
 * 전화번호 포맷팅 (표시용)
 * 
 * @param phone - 정규화된 전화번호 (예: "01012345678")
 * @returns 포맷팅된 전화번호 (예: "010-1234-5678") 또는 원본
 * 
 * @example
 * formatPhone("01012345678") // "010-1234-5678"
 * formatPhone("0212345678") // "02-1234-5678"
 * formatPhone("050112345678") // "0501-1234-5678"
 */
export function formatPhone(phone: string | null | undefined): string {
  if (!phone) return "";
  
  // 이미 정규화된 숫자만 포함된 전화번호 가정
  const cleaned = phone.replace(/\D/g, "");
  
  // 휴대폰 (010, 011, 016, 017, 018, 019)
  if (cleaned.startsWith("01") && cleaned.length === 11) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7)}`;
  }
  
  // 서울 지역번호 (02)
  if (cleaned.startsWith("02") && cleaned.length === 10) {
    return `${cleaned.slice(0, 2)}-${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
  }
  
  // 기타 지역번호 (031, 032, 051 등) - 10자리
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  
  // 대표번호 (1588, 1577, 0501 등) - 12자리
  if (cleaned.length === 12) {
    return `${cleaned.slice(0, 4)}-${cleaned.slice(4, 8)}-${cleaned.slice(8)}`;
  }
  
  // 기타: 원본 반환
  return phone;
}

/**
 * 사업자등록번호 포맷팅 (표시용)
 * 
 * @param bizNo - 정규화된 사업자번호 (예: "1234567890")
 * @returns 포맷팅된 사업자번호 (예: "123-45-67890") 또는 원본
 * 
 * @example
 * formatBizNo("1234567890") // "123-45-67890"
 */
export function formatBizNo(bizNo: string | null | undefined): string {
  if (!bizNo) return "";
  
  // 이미 정규화된 숫자만 포함된 사업자번호 가정
  const cleaned = bizNo.replace(/\D/g, "");
  
  // 10자리인 경우 포맷팅
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 5)}-${cleaned.slice(5)}`;
  }
  
  // 기타: 원본 반환
  return bizNo;
}

/**
 * 주민등록번호 앞자리 정규화
 * 
 * @param registrationNumber - 주민번호 앞자리 (예: "850315", "85-03-15")
 * @returns 숫자만 포함된 주민번호 앞자리 (예: "850315") 또는 빈 문자열
 * 
 * @example
 * normalizeRegistrationNumber("850315") // "850315"
 * normalizeRegistrationNumber("85-03-15") // "850315"
 */
export function normalizeRegistrationNumber(
  registrationNumber: string | number | null | undefined
): string {
  if (registrationNumber === null || registrationNumber === undefined) return "";
  
  // 모든 비숫자 문자 제거
  return String(registrationNumber).replace(/\D/g, "");
}

/**
 * 실시간 전화번호 입력 포맷팅 (input onChange용)
 * 사용자가 입력하는 동안 자동으로 하이픈 추가
 * 
 * @param value - 사용자 입력값
 * @returns 포맷팅된 전화번호
 * 
 * @example
 * formatPhoneInput("010") // "010"
 * formatPhoneInput("01012") // "010-12"
 * formatPhoneInput("0101234") // "010-1234"
 * formatPhoneInput("01012345678") // "010-1234-5678"
 */
export function formatPhoneInput(value: string): string {
  const cleaned = value.replace(/\D/g, "");
  
  if (cleaned.length <= 3) {
    return cleaned;
  } else if (cleaned.length <= 7) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
  } else if (cleaned.length <= 11) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7)}`;
  }
  
  return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7, 11)}`;
}

/**
 * 실시간 사업자번호 입력 포맷팅 (input onChange용)
 * 사용자가 입력하는 동안 자동으로 하이픈 추가
 * 
 * @param value - 사용자 입력값
 * @returns 포맷팅된 사업자번호
 * 
 * @example
 * formatBizNoInput("123") // "123"
 * formatBizNoInput("12345") // "123-45"
 * formatBizNoInput("123456789") // "123-45-6789"
 * formatBizNoInput("1234567890") // "123-45-67890"
 */
export function formatBizNoInput(value: string): string {
  const cleaned = value.replace(/\D/g, "");
  
  if (cleaned.length <= 3) {
    return cleaned;
  } else if (cleaned.length <= 5) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
  } else if (cleaned.length <= 10) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 5)}-${cleaned.slice(5)}`;
  }
  
  return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 5)}-${cleaned.slice(5, 10)}`;
}
