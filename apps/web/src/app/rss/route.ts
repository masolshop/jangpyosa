import { NextResponse } from 'next/server';

export async function GET() {
  const baseUrl = 'https://jangpyosa.com';
  const currentDate = new Date().toUTCString();

  // 주요 콘텐츠 페이지 정의
  const items = [
    {
      title: '장표사닷컴 - 고용부담금감면 플랫폼',
      link: baseUrl,
      description: '장애인표준사업장 연계고용으로 고용부담금을 50~90% 감면하는 국내 최대 도급계약 플랫폼입니다. 873개 장애인표준사업장과 도급계약으로 장애인 의무고용률을 충족하세요.',
      pubDate: currentDate,
      guid: baseUrl,
    },
    {
      title: '장애인직원관리솔루션 - 무료 장애인고용관리 시스템',
      link: `${baseUrl}/employee`,
      description: '장애인 직원 근태관리, 작업지시서 관리, 휴가관리를 한 번에! 완전 무료로 제공되는 장애인 직원 관리 솔루션입니다. 모바일 출퇴근 체크, 실시간 근무현황 확인, 작업지시서 배정 및 완료 관리 기능을 제공합니다.',
      pubDate: currentDate,
      guid: `${baseUrl}/employee`,
    },
    {
      title: '고용부담금 계산기 - 연간 고용부담금 자동 계산',
      link: `${baseUrl}/calculators/levy-annual`,
      description: '고용부담금을 자동으로 계산해드립니다. 상시근로자 수와 장애인 고용 현황을 입력하면 연간 고용부담금을 즉시 확인할 수 있습니다. 고용의무인원, 부담기초액, 월별 납부액까지 상세하게 계산됩니다.',
      pubDate: currentDate,
      guid: `${baseUrl}/calculators/levy-annual`,
    },
    {
      title: '고용장려금 계산기 - 장애인 고용 장려금 자동 계산',
      link: `${baseUrl}/calculators/incentive-annual`,
      description: '장애인 고용시 받을 수 있는 고용장려금을 계산해드립니다. 장애등급, 근로시간에 따라 받을 수 있는 장려금을 즉시 확인하세요. 중증장애인, 경증장애인 구분하여 정확한 장려금 산출이 가능합니다.',
      pubDate: currentDate,
      guid: `${baseUrl}/calculators/incentive-annual`,
    },
    {
      title: '연계고용부담금 감면 계산기 - 도급계약 감면액 계산',
      link: `${baseUrl}/calculators/linkage`,
      description: '장애인표준사업장과 도급계약을 체결하면 얼마나 고용부담금을 절감할 수 있는지 계산해드립니다. 도급금액에 따른 감면 인원과 감면액을 즉시 확인할 수 있습니다. 최대 90%까지 고용부담금 절감이 가능합니다.',
      pubDate: currentDate,
      guid: `${baseUrl}/calculators/linkage`,
    },
    {
      title: '장애인표준사업장 카탈로그 - 873개 사업장 정보',
      link: `${baseUrl}/catalog`,
      description: '전국 873개 장애인표준사업장 정보를 한눈에 확인하세요. 지역별, 업종별, 생산품목별로 검색 가능하며, 각 사업장의 연락처, 주요 생산품, 인증현황을 제공합니다. 도급계약 체결을 위한 최적의 파트너를 찾아보세요.',
      pubDate: currentDate,
      guid: `${baseUrl}/catalog`,
    },
    {
      title: '직원 출퇴근 관리 - 모바일 근태관리 시스템',
      link: `${baseUrl}/employee/attendance`,
      description: '장애인 직원의 출퇴근을 모바일로 간편하게 관리하세요. GPS 기반 위치 확인, 사진 인증, 실시간 근무현황 조회 기능을 제공합니다. 관리자는 PC에서 전체 직원의 근태 현황을 한눈에 확인할 수 있습니다.',
      pubDate: currentDate,
      guid: `${baseUrl}/employee/attendance`,
    },
    {
      title: '작업지시서 관리 - 업무 배정 및 진행관리',
      link: `${baseUrl}/employee/work-orders`,
      description: '장애인 직원에게 작업지시서를 배정하고 진행상황을 실시간으로 관리하세요. 작업내용, 담당자, 마감일을 설정하고 완료 여부를 체크할 수 있습니다. 업무 히스토리 관리로 생산성 향상에 도움이 됩니다.',
      pubDate: currentDate,
      guid: `${baseUrl}/employee/work-orders`,
    },
    {
      title: '휴가 관리 - 연차 및 휴가 신청 시스템',
      link: `${baseUrl}/employee/leave`,
      description: '장애인 직원의 연차, 병가, 경조사 등 각종 휴가를 체계적으로 관리하세요. 직원은 모바일로 휴가를 신청하고, 관리자는 승인/반려 처리할 수 있습니다. 남은 연차 일수 자동 계산 기능도 제공됩니다.',
      pubDate: currentDate,
      guid: `${baseUrl}/employee/leave`,
    },
    {
      title: '직원 회원가입 - 장애인 직원 계정 생성',
      link: `${baseUrl}/employee/signup`,
      description: '장애인 직원으로 회원가입하고 근태관리 시스템을 사용하세요. 핸드폰 번호로 간편하게 가입할 수 있으며, 가입 후 즉시 출퇴근 체크 및 작업지시서 확인이 가능합니다.',
      pubDate: currentDate,
      guid: `${baseUrl}/employee/signup`,
    },
  ];

  const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>장표사닷컴 - 고용부담금감면 및 장애인고용관리 플랫폼</title>
    <link>${baseUrl}</link>
    <description>장애인표준사업장 연계고용으로 고용부담금 50~90% 감면! 무료 장애인직원관리솔루션, 고용부담금계산기, 고용장려금계산기 제공</description>
    <language>ko</language>
    <lastBuildDate>${currentDate}</lastBuildDate>
    <atom:link href="${baseUrl}/rss" rel="self" type="application/rss+xml"/>
${items
  .map(
    (item) => `    <item>
      <title>${item.title}</title>
      <link>${item.link}</link>
      <description><![CDATA[${item.description}]]></description>
      <pubDate>${item.pubDate}</pubDate>
      <guid isPermaLink="true">${item.guid}</guid>
    </item>`
  )
  .join('\n')}
  </channel>
</rss>`;

  return new NextResponse(rssXml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
