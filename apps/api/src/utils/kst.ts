/**
 * 한국 시간(KST, UTC+9) 유틸리티
 * 
 * 모든 시간은 한국 시간(KST)으로 강제 변환됩니다.
 */

// 한국 시간대 오프셋 (UTC+9)
const KST_OFFSET = 9 * 60 * 60 * 1000; // 9시간을 밀리초로

/**
 * 현재 한국 시간을 Date 객체로 반환
 */
export function getKSTNow(): Date {
  return new Date(Date.now() + KST_OFFSET);
}

/**
 * UTC Date 객체를 한국 시간 Date 객체로 변환
 */
export function toKST(date: Date): Date {
  return new Date(date.getTime() + KST_OFFSET);
}

/**
 * 한국 시간 Date 객체를 UTC Date 객체로 변환
 */
export function toUTC(kstDate: Date): Date {
  return new Date(kstDate.getTime() - KST_OFFSET);
}

/**
 * 한국 시간을 YYYY-MM-DD 형식으로 반환
 */
export function getKSTDate(date?: Date): string {
  const kstDate = date ? toKST(date) : getKSTNow();
  return kstDate.toISOString().split('T')[0];
}

/**
 * 한국 시간을 YYYY-MM-DD HH:MM:SS 형식으로 반환
 */
export function getKSTDateTime(date?: Date): string {
  const kstDate = date ? toKST(date) : getKSTNow();
  return kstDate.toISOString().replace('T', ' ').replace('Z', '').substring(0, 19);
}

/**
 * 한국 시간을 HH:MM:SS 형식으로 반환
 */
export function getKSTTime(date?: Date): string {
  const kstDate = date ? toKST(date) : getKSTNow();
  return kstDate.toISOString().substring(11, 19);
}

/**
 * UTC Date를 한국 시간 문자열로 변환
 * @param date UTC Date 객체
 * @param format 'date' | 'datetime' | 'time'
 */
export function formatKST(date: Date, format: 'date' | 'datetime' | 'time' = 'datetime'): string {
  const kstDate = toKST(date);
  
  switch (format) {
    case 'date':
      return kstDate.toISOString().split('T')[0];
    case 'time':
      return kstDate.toISOString().substring(11, 19);
    case 'datetime':
    default:
      return kstDate.toISOString().replace('T', ' ').replace('Z', '').substring(0, 19);
  }
}

/**
 * 한국 시간 문자열(YYYY-MM-DD)을 UTC Date로 변환
 */
export function parseKSTDate(dateString: string): Date {
  // YYYY-MM-DD 형식을 한국 시간 기준으로 파싱
  const [year, month, day] = dateString.split('-').map(Number);
  const kstDate = new Date(Date.UTC(year, month - 1, day) - KST_OFFSET);
  return kstDate;
}

/**
 * 한국 시간 기준으로 오늘 시작 시간 (00:00:00 KST)
 */
export function getKSTTodayStart(): Date {
  const today = getKSTDate();
  return parseKSTDate(today);
}

/**
 * 한국 시간 기준으로 오늘 종료 시간 (23:59:59 KST)
 */
export function getKSTTodayEnd(): Date {
  const today = getKSTDate();
  const [year, month, day] = today.split('-').map(Number);
  const kstEndDate = new Date(Date.UTC(year, month - 1, day, 23, 59, 59) - KST_OFFSET);
  return kstEndDate;
}

/**
 * 한국 시간 기준 현재 연도
 */
export function getKSTYear(): number {
  const kstNow = getKSTNow();
  return kstNow.getUTCFullYear();
}

/**
 * 한국 시간 기준 현재 월 (1-12)
 */
export function getKSTMonth(): number {
  const kstNow = getKSTNow();
  return kstNow.getUTCMonth() + 1;
}

/**
 * 한국 시간 기준 현재 일 (1-31)
 */
export function getKSTDay(): number {
  const kstNow = getKSTNow();
  return kstNow.getUTCDate();
}

/**
 * 한국 시간 기준 현재 시 (0-23)
 */
export function getKSTHour(): number {
  const kstNow = getKSTNow();
  return kstNow.getUTCHours();
}

/**
 * 한국 시간 기준 현재 분 (0-59)
 */
export function getKSTMinute(): number {
  const kstNow = getKSTNow();
  return kstNow.getUTCMinutes();
}

/**
 * 한국 시간 기준 현재 초 (0-59)
 */
export function getKSTSecond(): number {
  const kstNow = getKSTNow();
  return kstNow.getUTCSeconds();
}
