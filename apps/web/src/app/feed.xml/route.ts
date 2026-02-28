export async function GET() {
  const baseUrl = 'https://jangpyosa.com';
  const currentDate = new Date().toUTCString();

  const items = [
    {
      title: '장표사닷컴 - 고용부담금감면 플랫폼',
      link: baseUrl,
      description: '장애인표준사업장 연계고용으로 고용부담금을 50~90% 감면하는 국내 최대 도급계약 플랫폼입니다. 873개 장애인표준사업장과 도급계약으로 장애인 의무고용률을 충족하세요.',
      pubDate: currentDate,
    },
    {
      title: '장애인직원관리솔루션 - 무료 장애인고용관리 시스템',
      link: `${baseUrl}/employee`,
      description: '장애인 직원 근태관리, 작업지시서 관리, 휴가관리를 한 번에! 완전 무료로 제공되는 장애인 직원 관리 솔루션입니다.',
      pubDate: currentDate,
    },
    {
      title: '고용부담금 계산기',
      link: `${baseUrl}/calculators/levy-annual`,
      description: '고용부담금을 자동으로 계산해드립니다. 상시근로자 수와 장애인 고용 현황을 입력하면 연간 고용부담금을 즉시 확인할 수 있습니다.',
      pubDate: currentDate,
    },
    {
      title: '고용장려금 계산기',
      link: `${baseUrl}/calculators/incentive-annual`,
      description: '장애인 고용시 받을 수 있는 고용장려금을 계산해드립니다. 장애등급, 근로시간에 따라 받을 수 있는 장려금을 즉시 확인하세요.',
      pubDate: currentDate,
    },
    {
      title: '연계고용부담금 감면 계산기',
      link: `${baseUrl}/calculators/linkage`,
      description: '장애인표준사업장과 도급계약을 체결하면 얼마나 고용부담금을 절감할 수 있는지 계산해드립니다.',
      pubDate: currentDate,
    },
    {
      title: '장애인표준사업장 카탈로그',
      link: `${baseUrl}/catalog`,
      description: '전국 873개 장애인표준사업장 정보를 한눈에 확인하세요. 지역별, 업종별, 생산품목별로 검색 가능합니다.',
      pubDate: currentDate,
    },
  ];

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>장표사닷컴</title>
    <link>${baseUrl}</link>
    <description>장애인표준사업장 연계고용으로 고용부담금 50~90% 감면</description>
    <language>ko</language>
    <lastBuildDate>${currentDate}</lastBuildDate>
    <atom:link href="${baseUrl}/feed.xml" rel="self" type="application/rss+xml"/>
${items.map(item => `    <item>
      <title>${item.title}</title>
      <link>${item.link}</link>
      <description><![CDATA[${item.description}]]></description>
      <pubDate>${item.pubDate}</pubDate>
      <guid isPermaLink="true">${item.link}</guid>
    </item>`).join('\n')}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
}
