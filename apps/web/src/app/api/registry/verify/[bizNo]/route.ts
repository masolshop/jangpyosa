import { NextRequest, NextResponse } from "next/server";

/**
 * 표준사업장 인증 확인 API (동적 경로)
 * GET /api/registry/verify/:bizNo
 * 
 * 백엔드 API 서버의 /registry/verify/:bizNo 엔드포인트를 호출합니다.
 * SupplierRegistry에 등록된 장애인표준사업장인지 확인합니다.
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
    const apiUrl = process.env.NEXT_PUBLIC_API_BASE || process.env.API_BASE || "http://localhost:4000";
    const backendUrl = `${apiUrl}/registry/verify/${cleanBizNo}`;
    
    console.log(`🔍 Calling backend SupplierRegistry API: ${backendUrl}`);
    
    const response = await fetch(backendUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error(`❌ SupplierRegistry API error: ${response.status}`, errorData);
      
      return NextResponse.json(
        { 
          ok: false,
          error: errorData.error || "REGISTRY_VERIFICATION_FAILED",
          message: errorData.message || "장애인표준사업장 인증을 확인할 수 없습니다" 
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log(`✅ SupplierRegistry API success:`, data);

    return NextResponse.json(data);

  } catch (error: any) {
    console.error("❌ 표준사업장 인증 확인 오류:", error);
    
    return NextResponse.json(
      {
        ok: false,
        error: "INTERNAL_ERROR",
        message: "사업자번호 인증 중 오류가 발생했습니다",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
