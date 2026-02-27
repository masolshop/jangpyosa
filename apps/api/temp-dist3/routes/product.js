import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../index.js';
import { requireAuth } from '../middleware/auth.js';
const router = Router();
// 🔹 상품 생성 스키마 (표준사업장용)
const createProductSchema = z.object({
    // 기본 정보
    title: z.string().min(2, '상품명을 2자 이상 입력하세요'),
    category: z.string().min(1, '카테고리를 선택하세요'),
    summary: z.string().optional(),
    description: z.string().optional(),
    // 가격 및 수량
    price: z.number().int().positive('단가는 양수여야 합니다'),
    unit: z.string().min(1, '단위를 입력하세요'),
    minOrderQty: z.number().int().positive().default(1),
    // 납품 및 리드타임
    leadTimeDays: z.number().int().positive().default(7),
    deliveryCycle: z.string().optional(),
    // 계약 조건 (법적 근거 항목)
    spec: z.string().min(5, '규격/재질/사양을 5자 이상 입력하세요'),
    processDescription: z.string().optional(),
    contractMinMonths: z.number().int().min(12, '최소 계약기간은 12개월 이상이어야 합니다').default(12),
    // 가격 상세
    vatIncluded: z.boolean().default(true),
    shippingIncluded: z.boolean().default(false),
    extraCostNote: z.string().optional(),
    // 품질 기준
    inspectionCriteria: z.string().optional(),
    defectPolicy: z.string().optional(),
    // 거래 조건
    invoiceAvailable: z.boolean().default(true),
    quoteLeadTimeDays: z.number().int().positive().default(3),
    // 이미지
    thumbnailUrl: z.string().url('유효한 URL을 입력하세요').optional(),
    imageUrls: z.array(z.string().url()).optional(), // 배열로 받아서 JSON string으로 저장
    // 키워드
    keywords: z.string().optional(),
    isActive: z.boolean().default(true),
    // 🆕 민원 방지 필수 항목 (연계고용 감면 리스크 최소화)
    noSubcontractConfirm: z.boolean().refine(val => val === true, {
        message: '직접이행 확인은 필수입니다'
    }),
    monthlyDeliverySchedule: z.string().min(1, '납품주기를 입력하세요'),
    monthlyBillingBasis: z.string().min(1, '월별 산출 기준을 입력하세요'),
    monthlyBillingDay: z.number().int().min(1).max(31).default(31),
    monthlyPaymentDay: z.number().int().min(1).max(31).default(10),
    monthlyFixedAmount: z.number().int().positive('월 확정금액은 양수여야 합니다').optional(),
    monthlyAmountNote: z.string().optional(),
    costBreakdownJson: z.string().min(1, '보수 산출내역을 입력하세요'),
    evidenceMethods: z.string().min(1, '이행증빙 방식을 선택하세요'),
    invoiceIssueConfirmed: z.boolean().refine(val => val === true, {
        message: '세금계산서 발행 가능 확인은 필수입니다'
    }),
    receiptNote: z.string().optional()
});
// 🔹 상품 수정 스키마
const updateProductSchema = createProductSchema.partial();
// ========================================
// 🟢 상품 등록 (표준사업장 전용)
// ========================================
router.post('/', requireAuth, async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({
                error: 'UNAUTHORIZED',
                message: '로그인이 필요합니다'
            });
        }
        // 공급사 프로필 확인
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { company: { include: { supplierProfile: true } } }
        });
        if (!user?.company?.supplierProfile) {
            return res.status(403).json({
                error: 'FORBIDDEN',
                message: '표준사업장 기업만 상품을 등록할 수 있습니다'
            });
        }
        // 승인되지 않은 공급사는 상품 등록 불가
        if (!user.company.supplierProfile.approved) {
            return res.status(403).json({
                error: 'NOT_APPROVED',
                message: '관리자 승인 후 상품을 등록할 수 있습니다'
            });
        }
        // 요청 데이터 검증
        const body = createProductSchema.parse(req.body);
        // imageUrls 배열을 JSON string으로 변환
        const imageUrlsString = body.imageUrls ? JSON.stringify(body.imageUrls) : null;
        // 상품 생성
        const product = await prisma.product.create({
            data: {
                supplierId: user.company.supplierProfile.id,
                title: body.title,
                category: body.category,
                summary: body.summary,
                description: body.description,
                price: body.price,
                unit: body.unit,
                minOrderQty: body.minOrderQty,
                leadTimeDays: body.leadTimeDays,
                deliveryCycle: body.deliveryCycle,
                spec: body.spec,
                processDescription: body.processDescription,
                contractMinMonths: body.contractMinMonths,
                vatIncluded: body.vatIncluded,
                shippingIncluded: body.shippingIncluded,
                extraCostNote: body.extraCostNote,
                inspectionCriteria: body.inspectionCriteria,
                defectPolicy: body.defectPolicy,
                invoiceAvailable: body.invoiceAvailable,
                quoteLeadTimeDays: body.quoteLeadTimeDays,
                thumbnailUrl: body.thumbnailUrl,
                imageUrls: imageUrlsString,
                keywords: body.keywords,
                isActive: body.isActive,
                // 🆕 민원 방지 필수 항목
                noSubcontractConfirm: body.noSubcontractConfirm,
                monthlyDeliverySchedule: body.monthlyDeliverySchedule,
                monthlyBillingBasis: body.monthlyBillingBasis,
                monthlyBillingDay: body.monthlyBillingDay,
                monthlyPaymentDay: body.monthlyPaymentDay,
                monthlyFixedAmount: body.monthlyFixedAmount,
                monthlyAmountNote: body.monthlyAmountNote,
                costBreakdownJson: body.costBreakdownJson,
                evidenceMethods: body.evidenceMethods,
                invoiceIssueConfirmed: body.invoiceIssueConfirmed,
                receiptNote: body.receiptNote
            }
        });
        res.json({
            message: '상품이 등록되었습니다',
            product
        });
    }
    catch (error) {
        console.error('❌ 상품 등록 에러:', error);
        if (error.name === 'ZodError') {
            return res.status(400).json({
                error: 'VALIDATION_ERROR',
                message: error.errors[0]?.message || '입력값을 확인하세요',
                details: error.errors
            });
        }
        res.status(500).json({
            error: 'SERVER_ERROR',
            message: '상품 등록 중 오류가 발생했습니다'
        });
    }
});
// ========================================
// 🟢 상품 목록 조회 (공개)
// ========================================
router.get('/', async (req, res) => {
    try {
        const { page = '1', limit = '20', category, keyword, supplierId, minPrice, maxPrice } = req.query;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;
        // 필터 조건 구성
        const where = {
            isActive: true
        };
        if (category) {
            where.category = category;
        }
        if (supplierId) {
            where.supplierId = supplierId;
        }
        if (minPrice || maxPrice) {
            where.price = {};
            if (minPrice)
                where.price.gte = parseInt(minPrice);
            if (maxPrice)
                where.price.lte = parseInt(maxPrice);
        }
        if (keyword) {
            where.OR = [
                { title: { contains: keyword } },
                { description: { contains: keyword } },
                { keywords: { contains: keyword } }
            ];
        }
        // 상품 목록 조회
        const [products, total] = await Promise.all([
            prisma.product.findMany({
                where,
                skip,
                take: limitNum,
                orderBy: { createdAt: 'desc' },
                include: {
                    supplier: {
                        include: {
                            company: true,
                            registry: true
                        }
                    }
                }
            }),
            prisma.product.count({ where })
        ]);
        // imageUrls를 JSON 파싱해서 반환
        const productsWithParsedImages = products.map(p => ({
            ...p,
            imageUrls: p.imageUrls ? JSON.parse(p.imageUrls) : []
        }));
        res.json({
            products: productsWithParsedImages,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                totalPages: Math.ceil(total / limitNum)
            }
        });
    }
    catch (error) {
        console.error('❌ 상품 목록 조회 에러:', error);
        res.status(500).json({
            error: 'SERVER_ERROR',
            message: '상품 목록 조회 중 오류가 발생했습니다'
        });
    }
});
// ========================================
// 🟢 상품 상세 조회 (공개)
// ========================================
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const product = await prisma.product.findUnique({
            where: { id },
            include: {
                supplier: {
                    include: {
                        company: true,
                        registry: true
                    }
                }
            }
        });
        if (!product) {
            return res.status(404).json({
                error: 'NOT_FOUND',
                message: '상품을 찾을 수 없습니다'
            });
        }
        // imageUrls를 JSON 파싱
        const productWithParsedImages = {
            ...product,
            imageUrls: product.imageUrls ? JSON.parse(product.imageUrls) : []
        };
        res.json(productWithParsedImages);
    }
    catch (error) {
        console.error('❌ 상품 상세 조회 에러:', error);
        res.status(500).json({
            error: 'SERVER_ERROR',
            message: '상품 조회 중 오류가 발생했습니다'
        });
    }
});
// ========================================
// 🟢 상품 수정 (표준사업장 전용)
// ========================================
router.put('/:id', requireAuth, async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({
                error: 'UNAUTHORIZED',
                message: '로그인이 필요합니다'
            });
        }
        const { id } = req.params;
        // 상품 소유 확인
        const product = await prisma.product.findUnique({
            where: { id },
            include: {
                supplier: {
                    include: {
                        company: { include: { ownerUser: true } }
                    }
                }
            }
        });
        if (!product) {
            return res.status(404).json({
                error: 'NOT_FOUND',
                message: '상품을 찾을 수 없습니다'
            });
        }
        if (product.supplier.company.ownerUser.id !== userId) {
            return res.status(403).json({
                error: 'FORBIDDEN',
                message: '본인이 등록한 상품만 수정할 수 있습니다'
            });
        }
        // 요청 데이터 검증
        const body = updateProductSchema.parse(req.body);
        // imageUrls 배열을 JSON string으로 변환 (있을 경우)
        const imageUrlsString = body.imageUrls ? JSON.stringify(body.imageUrls) : undefined;
        // 상품 수정
        const updatedProduct = await prisma.product.update({
            where: { id },
            data: {
                ...body,
                imageUrls: imageUrlsString
            }
        });
        res.json({
            message: '상품이 수정되었습니다',
            product: updatedProduct
        });
    }
    catch (error) {
        console.error('❌ 상품 수정 에러:', error);
        if (error.name === 'ZodError') {
            return res.status(400).json({
                error: 'VALIDATION_ERROR',
                message: error.errors[0]?.message || '입력값을 확인하세요',
                details: error.errors
            });
        }
        res.status(500).json({
            error: 'SERVER_ERROR',
            message: '상품 수정 중 오류가 발생했습니다'
        });
    }
});
// ========================================
// 🟢 상품 삭제 (표준사업장 전용)
// ========================================
router.delete('/:id', requireAuth, async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({
                error: 'UNAUTHORIZED',
                message: '로그인이 필요합니다'
            });
        }
        const { id } = req.params;
        // 상품 소유 확인
        const product = await prisma.product.findUnique({
            where: { id },
            include: {
                supplier: {
                    include: {
                        company: { include: { ownerUser: true } }
                    }
                }
            }
        });
        if (!product) {
            return res.status(404).json({
                error: 'NOT_FOUND',
                message: '상품을 찾을 수 없습니다'
            });
        }
        if (product.supplier.company.ownerUser.id !== userId) {
            return res.status(403).json({
                error: 'FORBIDDEN',
                message: '본인이 등록한 상품만 삭제할 수 있습니다'
            });
        }
        // 상품 삭제
        await prisma.product.delete({
            where: { id }
        });
        res.json({
            message: '상품이 삭제되었습니다'
        });
    }
    catch (error) {
        console.error('❌ 상품 삭제 에러:', error);
        res.status(500).json({
            error: 'SERVER_ERROR',
            message: '상품 삭제 중 오류가 발생했습니다'
        });
    }
});
// ========================================
// 🟢 내 상품 목록 조회 (표준사업장 전용)
// ========================================
router.get('/my/list', requireAuth, async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({
                error: 'UNAUTHORIZED',
                message: '로그인이 필요합니다'
            });
        }
        // 공급사 프로필 확인
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { company: { include: { supplierProfile: true } } }
        });
        if (!user?.company?.supplierProfile) {
            return res.status(403).json({
                error: 'FORBIDDEN',
                message: '표준사업장 기업만 조회할 수 있습니다'
            });
        }
        const products = await prisma.product.findMany({
            where: { supplierId: user.company.supplierProfile.id },
            orderBy: { createdAt: 'desc' }
        });
        // imageUrls를 JSON 파싱
        const productsWithParsedImages = products.map(p => ({
            ...p,
            imageUrls: p.imageUrls ? JSON.parse(p.imageUrls) : []
        }));
        res.json({
            products: productsWithParsedImages,
            total: products.length
        });
    }
    catch (error) {
        console.error('❌ 내 상품 목록 조회 에러:', error);
        res.status(500).json({
            error: 'SERVER_ERROR',
            message: '상품 목록 조회 중 오류가 발생했습니다'
        });
    }
});
export default router;
