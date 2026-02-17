import { config } from "../config.js";
import crypto from "crypto";

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
  data: ApickBizDetail;
  api: {
    success: boolean;
    cost: number;
    ms: number;
    pl_id: number;
  };
};

/**
 * APICK 실제 API를 호출하여 사업자번호 검증 및 기업 정보 조회
 * @param bizNo 사업자번호 (10자리, 하이픈 제거)
 * @returns 기업 정보 또는 에러
 */
export async function verifyBizNo(
  bizNo: string
): Promise<{ ok: boolean; name?: string; representative?: string; data?: ApickBizDetail; error?: string }> {
  // 사업자번호 형식 검증
  const cleanBizNo = bizNo.replace(/-/g, "");
  if (!/^\d{10}$/.test(cleanBizNo)) {
    return { ok: false, error: "사업자번호는 10자리 숫자여야 합니다" };
  }

  // Mock 모드
  if (config.apickProvider === "mock") {
    return {
      ok: true,
      name: "MOCK_COMPANY_" + cleanBizNo.slice(0, 5),
      representative: "홍길동",
      data: {
        회사명: "MOCK_COMPANY_" + cleanBizNo.slice(0, 5),
        사업자등록번호: cleanBizNo,
        사업자상태: "계속사업자",
        과세유형: "부가가치세 일반과세자",
        대표명: "홍길동",
        success: 1,
      },
    };
  }

  // 실제 APICK API 호출
  try {
    const apiKey = config.apickApiKey;
    if (!apiKey) {
      console.error("❌ APICK API Key not configured");
      return { ok: false, error: "APICK API Key가 설정되지 않았습니다" };
    }

    // FormData 생성
    const formData = new URLSearchParams();
    formData.append("biz_no", cleanBizNo);

    const response = await fetch("https://apick.app/rest/biz_detail", {
      method: "POST",
      headers: {
        "CL_AUTH_KEY": apiKey,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    });

    if (!response.ok) {
      console.error(`❌ APICK API HTTP error: ${response.status} ${response.statusText}`);
      return { ok: false, error: `APICK API 호출 실패: ${response.status}` };
    }

    const result: ApickResponse = await response.json();

    // API 성공 여부 확인
    if (!result.api.success) {
      console.error("❌ APICK API returned success=false");
      return { ok: false, error: "APICK API 호출 실패" };
    }

    // 데이터 성공 여부 확인
    if (result.data.success !== 1) {
      console.error(`❌ APICK data validation failed: success=${result.data.success}`);
      return { ok: false, error: "사업자번호 검증 실패" };
    }

    // 폐업 여부 확인
    if (result.data.사업자상태 === "폐업자") {
      return { ok: false, error: "폐업된 사업자입니다" };
    }

    // 성공
    return {
      ok: true,
      name: result.data.회사명,
      representative: result.data.대표명,
      data: result.data,
    };
  } catch (error: any) {
    console.error("❌ APICK API error:", error);
    return { ok: false, error: "APICK API 호출 중 오류 발생: " + error.message };
  }
}
