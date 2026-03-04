import { NextResponse } from 'next/server';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || process.env.API_BASE || 'http://localhost:4000';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phone } = body;
    
    if (!phone) {
      return NextResponse.json(
        { success: false, error: '핸드폰 번호를 입력하세요' },
        { status: 400 }
      );
    }
    
    // 백엔드 API 호출
    const response = await fetch(`${API_BASE}/sales/verify-referrer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ phone }),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }
    
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('[API /sales/verify-referrer] Error:', error);
    return NextResponse.json(
      { success: false, error: '서버 연결에 실패했습니다' },
      { status: 500 }
    );
  }
}
