import { NextRequest, NextResponse } from "next/server";

/**
 * APICK 사업자번호 인증 API (동적 경로)
 * GET /api/apick/bizno/:bizNo
 * 
 * 백엔드 API 서버의 /apick/bizno/:bizNo 엔드포인트를 호출합니다.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { bizNo: string } }
) {
  try {
    const bizNo = params.bizNo;

    if (!bizNo) {
      return NextResponse.json(
        { error: "BIZNO_REQUIRED", message: "사업자번호를 입력하세요" },
        { status: 400 }
      );
    }

    // 사업자번호 형식 검증 (10자리 숫자)
    const cleanBizNo = bizNo.replace(/\D/g, "");
    if (cleanBizNo.length !== 10) {
      return NextResponse.json(
        { error: "INVALID_BIZNO_FORMAT", message: "사업자번호는 10자리 숫자여야 합니다" },
        { status: 400 }
      );
    }

    // 백엔드 API 서버 호출
    // 프로덕션: https://jangpyosa.com:4000, 개발: http://localhost:4000
    const apiUrl = process.env.NEXT_PUBLIC_API_BASE || 
                   (process.env.NODE_ENV === 'production' ? 'https://jangpyosa.com:4000' : 'http://localhost:4000');
    const backendUrl = `${apiUrl}/apick/bizno/${cleanBizNo}`;
    
    console.log(`🔍 Calling backend APICK API: ${backendUrl}`);
    
    const response = await fetch(backendUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error(`❌ APICK API error: ${response.status}`, errorData);
      
      return NextResponse.json(
        { 
          error: errorData.error || "APICK_API_ERROR",
          message: errorData.message || "사업자번호 인증에 실패했습니다" 
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log(`✅ APICK API success:`, data);

    return NextResponse.json(data);

  } catch (error: any) {
    console.error("❌ APICK 사업자번호 인증 오류:", error);
    
    return NextResponse.json(
      {
        error: "INTERNAL_ERROR",
        message: "사업자번호 인증 중 오류가 발생했습니다",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
