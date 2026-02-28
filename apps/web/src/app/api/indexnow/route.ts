import { NextResponse } from 'next/server';

const INDEXNOW_KEY = '45f78c3e0b9f3f8b490a266922b276f7';

export async function POST(request: Request) {
  try {
    const { urls } = await request.json();

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json(
        { error: 'URLs array is required' },
        { status: 400 }
      );
    }

    // IndexNow API 엔드포인트 (네이버)
    const indexNowUrl = 'https://searchadvisor.naver.com/indexnow';

    const payload = {
      host: 'jangpyosa.com',
      key: INDEXNOW_KEY,
      keyLocation: `https://jangpyosa.com/${INDEXNOW_KEY}.txt`,
      urlList: urls,
    };

    // 네이버 IndexNow에 제출
    const response = await fetch(indexNowUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify(payload),
    });

    if (response.ok || response.status === 202) {
      return NextResponse.json({
        success: true,
        message: 'URLs submitted to IndexNow successfully',
        urls,
        status: response.status,
      });
    } else {
      const errorText = await response.text();
      return NextResponse.json(
        {
          error: 'Failed to submit to IndexNow',
          status: response.status,
          details: errorText,
        },
        { status: response.status }
      );
    }
  } catch (error) {
    console.error('IndexNow submission error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}

// GET 요청으로 주요 페이지를 자동 제출
export async function GET() {
  const mainUrls = [
    'https://jangpyosa.com/',
    'https://jangpyosa.com/employee',
    'https://jangpyosa.com/calculators/levy-annual',
    'https://jangpyosa.com/calculators/incentive-annual',
    'https://jangpyosa.com/calculators/linkage',
    'https://jangpyosa.com/catalog',
  ];

  try {
    const indexNowUrl = 'https://searchadvisor.naver.com/indexnow';

    const payload = {
      host: 'jangpyosa.com',
      key: INDEXNOW_KEY,
      keyLocation: `https://jangpyosa.com/${INDEXNOW_KEY}.txt`,
      urlList: mainUrls,
    };

    const response = await fetch(indexNowUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify(payload),
    });

    if (response.ok || response.status === 202) {
      return NextResponse.json({
        success: true,
        message: 'Main pages submitted to IndexNow automatically',
        urls: mainUrls,
        status: response.status,
      });
    } else {
      const errorText = await response.text();
      return NextResponse.json(
        {
          error: 'Failed to submit to IndexNow',
          status: response.status,
          details: errorText,
        },
        { status: response.status }
      );
    }
  } catch (error) {
    console.error('IndexNow auto-submission error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}
