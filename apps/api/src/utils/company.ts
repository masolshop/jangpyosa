import { prisma } from "../index.js";

/**
 * 사용자의 회사 정보 조회 (통합 헬퍼 함수)
 * - SUPER_ADMIN: 첫 번째 BUYER 회사 반환
 * - BUYER/SUPPLIER: companyId로 조회
 * - SUPPLIER 타입이면서 buyerProfile이 있는 경우도 지원 (표준사업장)
 */
export async function getUserCompany(userId: string, userRole: string) {
  if (userRole === "SUPER_ADMIN") {
    // SUPER_ADMIN은 첫 번째 BUYER 회사 사용
    return await prisma.company.findFirst({
      where: { 
        type: "BUYER",
        buyerProfile: { isNot: null }
      },
      include: { 
        buyerProfile: true,
        supplierProfile: true,
      },
    });
  } else {
    // 일반 사용자: companyId로 조회
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        company: {
          include: { 
            buyerProfile: true,
            supplierProfile: true,
          }
        }
      }
    });
    return user?.company;
  }
}

/**
 * 회사의 buyerId 조회
 * - BUYER: buyerProfile.id 반환
 * - SUPPLIER (표준사업장): buyerProfile.id 반환 (자체 고용용)
 */
export function getBuyerId(company: any): string | null {
  return company?.buyerProfile?.id || null;
}

/**
 * 회사의 supplierId 조회
 * - SUPPLIER: supplierProfile.id 반환
 */
export function getSupplierId(company: any): string | null {
  return company?.supplierProfile?.id || null;
}
