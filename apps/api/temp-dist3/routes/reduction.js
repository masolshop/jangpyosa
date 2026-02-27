import { Router } from "express";
import { z } from "zod";
import { prisma } from "../index.js";
const r = Router();
/**
 * 🔹 합산 감면 계산 API
 *
 * 기업이 여러 표준사업장과 계약할 때 총 감면액 계산
 *
 * 계산 로직:
 * 1. 도급액 합산
 * 2. 감면 상한 계산
 *    - 감면상한1 = 부담금 × 90%
 *    - 감면상한2 = 전체 도급액 × 50%
 *    - 최대감면액 = min(감면상한1, 감면상한2)
 * 3. 감면 후 부담금 = 부담금 - 최대감면액
 */
r.post("/aggregate", async (req, res) => {
    try {
        const schema = z.object({
            year: z.number().int().default(2025),
            levyAmount: z.number().int().min(0, "부담금은 0 이상이어야 합니다"),
            contractAmounts: z.array(z.number().int().min(0)).min(1, "최소 1개 이상의 계약이 필요합니다")
        });
        const body = schema.parse(req.body);
        // 연도별 설정 조회
        const setting = await prisma.yearSetting.findUnique({
            where: { year: body.year }
        });
        if (!setting) {
            return res.status(400).json({
                error: "YEAR_SETTING_NOT_FOUND",
                message: `${body.year}년도 설정을 찾을 수 없습니다`
            });
        }
        // 총 도급액 계산
        const totalContractAmount = body.contractAmounts.reduce((sum, v) => sum + v, 0);
        // 감면 상한 계산
        const capByLevy = Math.floor(body.levyAmount * setting.maxReductionRate); // 부담금의 90%
        const capByContract = Math.floor(totalContractAmount * setting.maxReductionByContract); // 도급액의 50%
        // 최종 감면 가능액 (두 상한 중 작은 값)
        const maxReduction = Math.min(capByLevy, capByContract);
        // 감면 후 부담금
        const afterReduction = Math.max(body.levyAmount - maxReduction, 0);
        // 공급사별 감면액 (비례 배분)
        const supplierReductions = body.contractAmounts.map((amount, idx) => {
            const ratio = totalContractAmount > 0 ? amount / totalContractAmount : 0;
            const supplierReduction = Math.floor(maxReduction * ratio);
            return {
                index: idx,
                contractAmount: amount,
                ratio: Math.round(ratio * 100) / 100,
                reduction: supplierReduction
            };
        });
        return res.json({
            ok: true,
            year: body.year,
            levyAmount: body.levyAmount,
            contractCount: body.contractAmounts.length,
            totalContractAmount,
            capByLevy,
            capByContract,
            maxReduction,
            afterReduction,
            supplierReductions,
            rule: "감면총액은 부담금의 90% 이내이며 도급액 합계의 50%를 초과할 수 없습니다.",
            warning: "본 계산은 추정치이며 실제 감면액은 계약 내용, 월별 이행 여부 및 공단 심사 결과에 따라 달라질 수 있습니다."
        });
    }
    catch (error) {
        console.error("❌ 합산 감면 계산 에러:", error);
        if (error.name === "ZodError") {
            return res.status(400).json({
                error: "VALIDATION_ERROR",
                message: error.errors[0]?.message || "입력값을 확인하세요",
                details: error.errors
            });
        }
        res.status(500).json({
            error: "SERVER_ERROR",
            message: "감면 계산 중 오류가 발생했습니다"
        });
    }
});
export default r;
