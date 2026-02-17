import { Router } from "express";
import { z } from "zod";
import { prisma } from "../index.js";
import { calcLevyEstimate, calcLinkageReduction } from "../services/calculation.js";

const r = Router();

// 부담금 계산기 (게스트도 사용 가능)
r.post("/levy", async (req, res) => {
  try {
    const schema = z.object({
      year: z.number().int(),
      employeeCount: z.number().int().min(0),
      disabledCount: z.number().int().min(0),
      companyType: z.enum(["PRIVATE", "PUBLIC"]).default("PRIVATE"),
    });
    const body = schema.parse(req.body);

    const setting = await prisma.yearSetting.findUnique({ where: { year: body.year } });
    if (!setting) {
      return res.status(400).json({ error: "YEAR_SETTING_NOT_FOUND" });
    }

    const out = calcLevyEstimate({
      employeeCount: body.employeeCount,
      disabledCount: body.disabledCount,
      yearSetting: setting,
      companyType: body.companyType,
    });

    res.json({
      ok: true,
      year: body.year,
      companyType: body.companyType,
      employeeCount: body.employeeCount,
      disabledCount: body.disabledCount,
      ...out,
      note:
        "본 결과는 설정된 부담기초액 기반의 추정치입니다. 실제 산정·신청은 한국장애인고용공단/부담금 시스템 기준을 확인하세요.",
    });
  } catch (error: any) {
    console.error("Levy calculation error:", error);
    if (error.name === "ZodError") {
      return res.status(400).json({ error: "VALIDATION_ERROR", details: error.errors });
    }
    res.status(500).json({ error: error.message });
  }
});

// 연계고용 감면 계산기 (게스트도 사용 가능)
r.post("/linkage", async (req, res) => {
  try {
    const schema = z.object({
      year: z.number().int(),
      levyAmount: z.number().int().min(0),
      contractAmount: z.number().int().min(0),
      targetReductionRate: z.number().min(0).max(1).optional(),
    });
    const body = schema.parse(req.body);

    const setting = await prisma.yearSetting.findUnique({ where: { year: body.year } });
    if (!setting) {
      return res.status(400).json({ error: "YEAR_SETTING_NOT_FOUND" });
    }

    const out = calcLinkageReduction({
      levyAmount: body.levyAmount,
      contractAmount: body.contractAmount,
      yearSetting: setting,
      targetReductionRate: body.targetReductionRate,
    });

    res.json({
      ok: true,
      year: body.year,
      levyAmount: body.levyAmount,
      contractAmount: body.contractAmount,
      ...out,
      rule:
        "감면 총액은 부담금의 90% 이내이며, 도급액의 50%를 초과할 수 없습니다(상한 자동 적용).",
      note:
        "연계고용 부담금 감면제도는 장애인표준사업장 등과 도급계약을 체결해 납품받는 경우, 해당 사업장에서 종사한 장애인을 고용한 것으로 간주해 부담금을 감면하는 제도입니다.",
    });
  } catch (error: any) {
    console.error("Linkage calculation error:", error);
    if (error.name === "ZodError") {
      return res.status(400).json({ error: "VALIDATION_ERROR", details: error.errors });
    }
    res.status(500).json({ error: error.message });
  }
});

// 연도별 설정 조회 (계산기에서 사용)
r.get("/settings/:year", async (req, res) => {
  try {
    const year = Number(req.params.year);
    const setting = await prisma.yearSetting.findUnique({ where: { year } });

    if (!setting) {
      return res.status(404).json({ error: "YEAR_SETTING_NOT_FOUND" });
    }

    res.json({ ok: true, setting });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default r;
