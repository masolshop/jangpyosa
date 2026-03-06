import { google, sheets_v4 } from 'googleapis';
import { JWT } from 'google-auth-library';

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

interface GoogleSheetsConfig {
  clientEmail: string;
  privateKey: string;
  spreadsheetId: string;
}

let sheetsService: sheets_v4.Sheets | null = null;
let config: GoogleSheetsConfig | null = null;

/**
 * Google Sheets 서비스 초기화
 */
export function initGoogleSheets(serviceConfig: GoogleSheetsConfig) {
  config = serviceConfig;
  
  try {
    const auth = new JWT({
      email: config.clientEmail,
      key: config.privateKey.replace(/\\n/g, '\n'),
      scopes: SCOPES,
    });

    sheetsService = google.sheets({ version: 'v4', auth });
    console.log('✅ Google Sheets 서비스 초기화 완료');
    return true;
  } catch (error) {
    console.error('❌ Google Sheets 초기화 실패:', error);
    return false;
  }
}

/**
 * 본부 데이터 동기화
 */
export async function syncHeadquartersToSheet(headquarters: any[]) {
  if (!sheetsService || !config) {
    throw new Error('Google Sheets 서비스가 초기화되지 않았습니다');
  }

  const values = [
    ['ID', '본부명', '본부장', '전화번호', '이메일', '활성상태', '비고', '생성일', '수정일'],
    ...headquarters.map(hq => [
      hq.id,
      hq.name,
      hq.leaderName,
      hq.phone,
      hq.email || '',
      hq.isActive ? 'Y' : 'N',
      hq.notes || '',
      hq.createdAt.toISOString(),
      hq.updatedAt.toISOString(),
    ]),
  ];

  await sheetsService.spreadsheets.values.update({
    spreadsheetId: config.spreadsheetId,
    range: '본부!A1',
    valueInputOption: 'RAW',
    requestBody: { values },
  });

  console.log(`✅ 본부 ${headquarters.length}개 동기화 완료`);
}

/**
 * 지사 데이터 동기화
 */
export async function syncBranchesToSheet(branches: any[]) {
  if (!sheetsService || !config) {
    throw new Error('Google Sheets 서비스가 초기화되지 않았습니다');
  }

  const values = [
    ['ID', '지사명', '지사장', '전화번호', '이메일', '소속본부ID', '소속본부명', '활성상태', '비고', '생성일', '수정일'],
    ...branches.map(branch => [
      branch.id,
      branch.name,
      branch.leaderName,
      branch.phone,
      branch.email || '',
      branch.parentId || '',
      branch.parent?.name || '',
      branch.isActive ? 'Y' : 'N',
      branch.notes || '',
      branch.createdAt.toISOString(),
      branch.updatedAt.toISOString(),
    ]),
  ];

  await sheetsService.spreadsheets.values.update({
    spreadsheetId: config.spreadsheetId,
    range: '지사!A1',
    valueInputOption: 'RAW',
    requestBody: { values },
  });

  console.log(`✅ 지사 ${branches.length}개 동기화 완료`);
}

/**
 * 매니저 데이터 동기화
 */
export async function syncManagersToSheet(managers: any[]) {
  if (!sheetsService || !config) {
    throw new Error('Google Sheets 서비스가 초기화되지 않았습니다');
  }

  const values = [
    ['ID', '이름', '전화번호', '이메일', '역할', '소속조직ID', '소속조직명', '상위매니저ID', '상위매니저명', '추천코드', '추천링크', '총추천수', '활성추천수', '총매출', '수수료', '승인상태', '활성상태', '비고', '생성일', '수정일'],
    ...managers.map(manager => [
      manager.id,
      manager.name,
      manager.phone,
      manager.email || '',
      getRoleKorean(manager.role),
      manager.organizationId || '',
      manager.organization?.name || '',
      manager.managerId || '',
      manager.manager?.name || '',
      manager.referralCode,
      manager.referralLink,
      manager.totalReferrals,
      manager.activeReferrals,
      manager.totalRevenue,
      manager.commission,
      manager.isActive ? 'Y' : 'N',
      manager.isActive ? 'Y' : 'N',
      manager.notes || '',
      manager.createdAt.toISOString(),
      manager.updatedAt.toISOString(),
    ]),
  ];

  await sheetsService.spreadsheets.values.update({
    spreadsheetId: config.spreadsheetId,
    range: '매니저!A1',
    valueInputOption: 'RAW',
    requestBody: { values },
  });

  console.log(`✅ 매니저 ${managers.length}개 동기화 완료`);
}

/**
 * 추천 기업 데이터 동기화
 */
export async function syncReferredCompaniesToSheet(companies: any[]) {
  if (!sheetsService || !config) {
    throw new Error('Google Sheets 서비스가 초기화되지 않았습니다');
  }

  const values = [
    ['ID', '기업명', '사업자번호', '기업유형', '대표자', '담당자', '담당자전화', '담당자이메일', '추천인ID', '추천인명', '추천인역할', '추천코드', '추천경로', '활성상태', '비고', '추천일', '수정일'],
    ...companies.map(company => [
      company.id,
      company.companyName || '',
      company.companyBizNo || '',
      getCompanyTypeKorean(company.companyType),
      company.company?.representative || '',
      company.company?.ownerUser?.managerName || '',
      company.company?.ownerUser?.managerPhone || '',
      company.company?.ownerUser?.managerEmail || '',
      company.salesPersonId,
      company.salesPerson?.name || '',
      getRoleKorean(company.salesPerson?.role || ''),
      company.referralCode,
      getReferralSourceKorean(company.referralSource),
      company.isActive ? 'Y' : 'N',
      company.notes || '',
      company.createdAt.toISOString(),
      company.updatedAt.toISOString(),
    ]),
  ];

  await sheetsService.spreadsheets.values.update({
    spreadsheetId: config.spreadsheetId,
    range: '추천기업!A1',
    valueInputOption: 'RAW',
    requestBody: { values },
  });

  console.log(`✅ 추천 기업 ${companies.length}개 동기화 완료`);
}

/**
 * 전체 데이터 동기화
 */
export async function syncAllDataToSheet(data: {
  headquarters: any[];
  branches: any[];
  managers: any[];
  referredCompanies?: any[];
}) {
  console.log('🔄 구글 시트 전체 동기화 시작...');
  
  try {
    await syncHeadquartersToSheet(data.headquarters);
    await syncBranchesToSheet(data.branches);
    await syncManagersToSheet(data.managers);
    
    // 추천 기업 동기화 (선택 사항)
    if (data.referredCompanies) {
      await syncReferredCompaniesToSheet(data.referredCompanies);
    }
    
    // 마지막 동기화 시간 기록
    if (sheetsService && config) {
      await sheetsService.spreadsheets.values.update({
        spreadsheetId: config.spreadsheetId,
        range: '동기화정보!A1',
        valueInputOption: 'RAW',
        requestBody: {
          values: [
            ['마지막 동기화 시간'],
            [new Date().toISOString()],
          ],
        },
      });
    }
    
    console.log('✅ 전체 데이터 동기화 완료');
    return true;
  } catch (error) {
    console.error('❌ 구글 시트 동기화 실패:', error);
    throw error;
  }
}

/**
 * 실시간 동기화 (비동기, 실패해도 메인 로직에 영향 없음)
 */
export async function syncToGoogleSheetRealtime(prisma: any) {
  // Google Sheets가 초기화되지 않은 경우 무시
  if (!sheetsService || !config) {
    console.log('⚠️  Google Sheets 미설정 - 동기화 스킵');
    return;
  }

  try {
    console.log('🔄 실시간 구글 시트 동기화 시작...');
    
    // 전체 데이터 조회
    const [organizations, salesPeople, referredCompanies] = await Promise.all([
      prisma.organization.findMany({
        where: { isActive: true },
        include: {
          parent: true,
        },
        orderBy: { createdAt: 'asc' },
      }),
      prisma.salesPerson.findMany({
        where: { isActive: true },
        include: {
          organization: true,
          manager: true,
        },
        orderBy: { createdAt: 'asc' },
      }),
      prisma.companyReferral.findMany({
        where: { isActive: true },
        include: {
          salesPerson: {
            select: {
              id: true,
              name: true,
              role: true,
              phone: true,
            },
          },
          company: {
            include: {
              ownerUser: {
                select: {
                  managerName: true,
                  managerPhone: true,
                  managerEmail: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    // 본부와 지사 분리
    const headquarters = organizations.filter((org: any) => org.type === 'HEADQUARTERS');
    const branches = organizations.filter((org: any) => org.type === 'BRANCH');

    // 동기화 실행
    await syncAllDataToSheet({
      headquarters,
      branches,
      managers: salesPeople,
      referredCompanies,
    });

    console.log('✅ 실시간 동기화 완료');
  } catch (error) {
    // 에러가 발생해도 무시 (비동기 동기화이므로)
    console.error('⚠️  실시간 동기화 실패 (메인 로직은 정상 처리됨):', error);
  }
}

/**
 * 역할 한글 변환
 */
function getRoleKorean(role: string): string {
  const roleMap: Record<string, string> = {
    SUPER_ADMIN: '슈퍼관리자',
    HEAD_MANAGER: '본부장',
    BRANCH_MANAGER: '지사장',
    MANAGER: '매니저',
  };
  return roleMap[role] || role;
}

/**
 * 기업 유형 한글 변환
 */
function getCompanyTypeKorean(type: string): string {
  const typeMap: Record<string, string> = {
    STANDARD_WORKPLACE: '표준사업장',
    EMPLOYMENT_OBLIGATION: '고용의무기업',
    PRIVATE_COMPANY: '민간기업',
    PUBLIC_INSTITUTION: '공공기관',
    GOVERNMENT: '정부기관',
    SUPPLIER: '공급기업',
    BUYER: '구매기업',
  };
  return typeMap[type] || type;
}

/**
 * 추천 경로 한글 변환
 */
function getReferralSourceKorean(source: string): string {
  const sourceMap: Record<string, string> = {
    direct_link: '직접링크',
    qr_code: 'QR코드',
    manual: '수동등록',
    website: '웹사이트',
    mobile_app: '모바일앱',
  };
  return sourceMap[source] || source;
}

/**
 * 구글 시트 초기 설정 (시트 생성 및 헤더 포맷팅)
 */
export async function setupGoogleSheet() {
  if (!sheetsService || !config) {
    throw new Error('Google Sheets 서비스가 초기화되지 않았습니다');
  }

  try {
    // 시트 존재 여부 확인 및 생성
    const spreadsheet = await sheetsService.spreadsheets.get({
      spreadsheetId: config.spreadsheetId,
    });

    const existingSheets = spreadsheet.data.sheets?.map(s => s.properties?.title) || [];
    const requiredSheets = ['본부', '지사', '매니저', '추천기업', '동기화정보'];

    for (const sheetName of requiredSheets) {
      if (!existingSheets.includes(sheetName)) {
        await sheetsService.spreadsheets.batchUpdate({
          spreadsheetId: config.spreadsheetId,
          requestBody: {
            requests: [
              {
                addSheet: {
                  properties: {
                    title: sheetName,
                  },
                },
              },
            ],
          },
        });
        console.log(`✅ 시트 생성: ${sheetName}`);
      }
    }

    console.log('✅ 구글 시트 초기 설정 완료');
    return true;
  } catch (error) {
    console.error('❌ 구글 시트 초기 설정 실패:', error);
    throw error;
  }
}
