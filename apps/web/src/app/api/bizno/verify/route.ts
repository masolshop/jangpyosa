import { NextRequest, NextResponse } from "next/server";

/**
 * APICK 사업자번호 인증 API
 * GET /api/bizno/verify?bizNo=1234567890
 * 
 * 백엔드 API 서버의 /apick/bizno/:bizNo 엔드포인트를 호출합니다.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bizNo = searchParams.get("bizNo");

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
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
    const response = await fetch(`${apiUrl}/apick/bizno/${cleanBizNo}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      // 백엔드에서 반환한 에러 메시지 사용
      if (response.status === 404) {
        return NextResponse.json(
          { 
            error: "BIZNO_NOT_FOUND", 
            message: errorData.message || "사업자번호를 찾을 수 없습니다" 
          },
          { status: 404 }
        );
      }
      
      if (response.status === 400) {
        return NextResponse.json(
          { 
            error: "BIZNO_VERIFICATION_FAILED", 
            message: errorData.message || "사업자번호 인증에 실패했습니다" 
          },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { 
          error: "APICK_API_ERROR", 
          message: errorData.message || "APICK API 호출 중 오류가 발생했습니다" 
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    // 응답 데이터 구조화
    return NextResponse.json({
      success: true,
      bizNo: cleanBizNo,
      companyName: data.companyName || data.name || "회사명 확인 필요",
      ceoName: data.ceoName || data.ceo || "대표자명 확인 필요",
      status: data.status || "active",
      message: "사업자번호 인증 완료",
    });

  } catch (error: any) {
    console.error("APICK 사업자번호 인증 오류:", error);
    
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
