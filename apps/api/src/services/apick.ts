/**
 * ⚠️⚠️⚠️ 경고: 이 파일을 절대 수정하지 마세요! ⚠️⚠️⚠️
 * 
 * 이 APICK API 통합은 현재 프로덕션 환경에서 정상 작동 중입니다.
 * 
 * 수정 금지 사항:
 * 1. API 엔드포인트 URL (https://apick.app/rest/biz_detail)
 * 2. 헤더 설정 (CL_AUTH_KEY, Content-Type)
 * 3. Body 형식 (URLSearchParams)
 * 4. fetch 호출 방식
 * 
 * 문제 발생 시 복구 방법:
 * cp .apick_backups/apick.ts.WORKING_* apps/api/src/services/apick.ts
 * 
 * 마지막 작동 확인: 2026-03-13
 * Git 커밋: 2be0c54 (APICK Mock 모드 완전 제거 및 실제 API 키 복구)
 */

import { config } from ../config.js;
import crypto from crypto;

// APICK API 응답 타입
export type ApickBizDetail = {
  회사명: string;
  사업자등록번호: string;
  법인등록번호?: string;
  통신판매업번호?: string;
  사업자상태: string;
  과세유형: string;
  폐업일?: string;
  대표명: string;
  설립일?: string;
  업종?: string;
  업태?: string;
  종목?: string;
  전화번호?: string;
  팩스번호?: string;
  직원수?: string;
  우편번호?: string;
  지번주소?: string;
  도로명주소?: string;
  위도?: string;
  경도?: string;
  갱신일?: string;
  최초등록일?: string;
  success: number; // 0: 실패, 1: 성공, 3: timeout
};

export type ApickResponse = {
  data?: ApickBizDetail;
  result?: {
    error?: string;
  } & ApickBizDetail;
  api: {
    success: boolean;
    cost?: number;
    ms?: number;
    pl_id?: number;
  };
};

/**
 * ⚠️ 중요: 이 함수는 프로덕션에서 정상 작동 중입니다. 수정하지 마세요!
 * 
 * APICK 실제 API를 호출하여 사업자번호 검증 및 기업 정보 조회
 * @param bizNo 사업자번호 (10자리, 하이픈 제거)
 * @returns 기업 정보 또는 에러
 */
export async function verifyBizNo(
  bizNo: string
): Promise<{ ok: boolean; name?: string; representative?: string; data?: ApickBizDetail; error?: string }> {
  // 사업자번호 형식 검증
  const cleanBizNo = bizNo.replace(/-/g, );
  if (!/^\d{10}$/.test(cleanBizNo)) {
    return { ok: false, error: 사업자번호는 10자리 숫자여야 합니다 };
  }

  // 실제 APICK API 호출
  try {
    const apiKey = config.apickApiKey;
    if (!apiKey) {
      console.error(❌ APICK API Key not configured);
      return { ok: false, error: APICK API Key가 설정되지 않았습니다 };
    }

    // ⚠️ 중요: URLSearchParams 사용 - 변경하지 마세요!
    const formData = new URLSearchParams();
    formData.append(biz_no, cleanBizNo);

    // ⚠️ 중요: 이 fetch 설정은 프로덕션에서 작동하는 설정입니다!
    const response = await fetch(https://apick.app/rest/biz_detail, {
      method: POST,
      headers: {
        CL_AUTH_KEY: apiKey,
        Content-Type: application/x-www-form-urlencoded,
      },
      body: formData.toString(),
    });

    if (!response.ok) {
      console.error(`❌ APICK API HTTP error: ${response.status} ${response.statusText}`);
      return { ok: false, error: `APICK API 호출 실패: ${response.status}` };
    }

    const result: ApickResponse = await response.json();
    
    // 디버깅: APICK API 응답 로깅
    console.log(📋 APICK API Response:, JSON.stringify(result, null, 2));

    // API 성공 여부 확인
    if (!result.api || !result.api.success) {
      console.error(❌ APICK API returned success=false);
      return { ok: false, error: APICK API 호출 실패 };
    }

    // result.error 체크 (에러 응답)
    if (result.result && result.result.error) {
      console.error(`❌ APICK API error: ${result.result.error}`);
      return { ok: false, error: result.result.error };
    }

    // data 필드 확인 (신규 응답 형식)
    const bizDetail = result.data || result.result;
    if (!bizDetail || bizDetail.success === 0) {
      console.error(❌ APICK API returned no data or success=0);
      return { ok: false, error: 사업자번호를 찾을 수 없습니다 };
    }

    // 폐업 체크
    if (bizDetail.사업자상태 === 폐업자) {
      console.warn(⚠️ 폐업된 사업자:, bizDetail.회사명);
      return { ok: false, error: 폐업된 사업자입니다 };
    }

    // 성공
    console.log(✅ APICK API 성공:, {
      name: bizDetail.회사명,
      representative: bizDetail.대표명,
      status: bizDetail.사업자상태,
    });

    return {
      ok: true,
      name: bizDetail.회사명,
      representative: bizDetail.대표명,
      data: bizDetail,
    };

  } catch (error) {
    console.error(❌ APICK API exception:, error);
    return {
      ok: false,
      error: error instanceof Error ? error.message : 사업자번호 인증 중 오류가 발생했습니다,
    };
  }
}
