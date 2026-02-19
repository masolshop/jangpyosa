import express from "express";
import { verifyBizNo } from "../services/apick.js";

const router = express.Router();

/**
 * GET /apick/bizno/:bizNo
 * 사업자등록번호 검증 및 기업 정보 조회
 * 
 * @param bizNo - 사업자등록번호 (10자리, 하이픈 포함 가능)
 * @returns 기업 정보 (회사명, 대표자명 등)
 */
router.get("/bizno/:bizNo", async (req, res) => {
  try {
    const { bizNo } = req.params;

    if (!bizNo) {
      return res.status(400).json({
        error: "BIZNO_REQUIRED",
        message: "사업자번호를 입력하세요",
      });
    }

    // 사업자번호 형식 검증
    const cleanBizNo = bizNo.replace(/\D/g, "");
    if (cleanBizNo.length !== 10) {
      return res.status(400).json({
        error: "INVALID_BIZNO_FORMAT",
        message: "사업자번호는 10자리 숫자여야 합니다",
      });
    }

    // APICK API 호출
    const result = await verifyBizNo(cleanBizNo);

    if (!result.ok) {
      return res.status(400).json({
        error: "BIZNO_VERIFICATION_FAILED",
        message: result.error || "사업자번호 인증에 실패했습니다",
      });
    }

    // 성공 응답
    return res.json({
      success: true,
      bizNo: cleanBizNo,
      companyName: result.name,
      ceoName: result.representative,
      data: result.data,
      message: "사업자번호 인증 완료",
    });

  } catch (error: any) {
    console.error("❌ APICK bizno verification error:", error);
    return res.status(500).json({
      error: "INTERNAL_ERROR",
      message: "사업자번호 인증 중 오류가 발생했습니다",
      details: error.message,
    });
  }
});

export default router;
