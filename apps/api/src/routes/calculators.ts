import { Router } from "express";
import { z } from "zod";
import { prisma } from "../index.js";
import { calcLevyEstimate, calcLinkageReduction } from "../services/calculation.js";
import PDFDocument from "pdfkit";

const r = Router();

// --- helpers for standard workplace benefit calculator ---
function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function buildTaxArray(input: {
  mode: "array" | "growth";
  annualTaxArray?: number[];
  annualTaxBase?: number;
  growthRatePct?: number;
}) {
  if (input.mode === "array") {
    const arr = (input.annualTaxArray ?? []).slice(0, 10);
    while (arr.length < 10) arr.push(arr[arr.length - 1] ?? 0);
    return arr.map((v) => Math.max(0, Math.floor(v)));
  }
  const base = Math.max(0, Math.floor(input.annualTaxBase ?? 0));
  const g = (input.growthRatePct ?? 0) / 100;
  const arr = Array.from({ length: 10 }, (_, i) => Math.floor(base * Math.pow(1 + g, i)));
  return arr;
}

function calcStandardBenefitV2(b: any) {
  // ---- 1) 무상지원금(항목별 + 적격만 합산) ----
  const items = [
    { key: "facility", label: "시설", amount: b.grantItems.facilityAmount, eligible: b.grantItems.facilityEligible },
    { key: "equipment", label: "장비", amount: b.grantItems.equipmentAmount, eligible: b.grantItems.equipmentEligible },
    { key: "convenience", label: "편의시설", amount: b.grantItems.convenienceAmount, eligible: b.grantItems.convenienceEligible },
    { key: "commute", label: "통근차량", amount: b.grantItems.commuteVehicleAmount, eligible: b.grantItems.commuteVehicleEligible },
    { key: "cert", label: "인증/컨설팅", amount: b.grantItems.certConsultingAmount, eligible: b.grantItems.certConsultingEligible },
  ].map((x) => ({
    ...x,
    amount: Math.max(0, Math.floor(x.amount || 0)),
    eligible: !!x.eligible
  }));

  const eligibleSum = items.reduce((s, it) => s + (it.eligible ? it.amount : 0), 0);

  // 공단 산정금액과 비교해서 기준금액 산정
  const baseForSupport = Math.min(eligibleSum, Math.max(0, Math.floor(b.keadAssessedAmount)));

  // 75% 규칙
  const supportByRule = Math.floor(baseForSupport * 0.75);

  // 신규 장애인 고용 인원 한도: 1인당 4천만원, 최대 10억
  const newDisabledHires = Math.max(0, Math.floor(b.newDisabledHires));
  const capByNewHires = newDisabledHires * 40_000_000;
  const cap10eok = 1_000_000_000;
  const supportCap = Math.min(capByNewHires, cap10eok);

  const facilityGrant = Math.min(supportByRule, supportCap);

  // 고용관리전문가: 월 최대 300만원, 최대 24개월
  const expertMonths = clamp(Math.floor(b.expert?.months ?? 0), 0, 24);
  const expertMonthly = clamp(Math.floor(b.expert?.monthlyWage ?? 0), 0, 3_000_000);
  const expertSupport = expertMonths * expertMonthly;

  const grantTotal = facilityGrant + expertSupport;

  // ---- 2) 세액감면(10년: 100/50/30 + 연도별 한도 적용) ----
  const disabledEmployees = Math.max(0, Math.floor(b.disabledEmployees));
  const annualCap = 100_000_000 + disabledEmployees * 20_000_000;

  const taxes10y = buildTaxArray({
    mode: b.tax.mode,
    annualTaxArray: b.tax.annualTaxArray,
    annualTaxBase: b.tax.annualTaxBase,
    growthRatePct: b.tax.growthRatePct
  });

  const rates = [1,1,1, 0.5,0.5, 0.3,0.3,0.3,0.3,0.3];

  const yearly = taxes10y.map((tax, idx) => {
    const rate = rates[idx];
    const raw = Math.floor(tax * rate);
    const capped = Math.min(raw, annualCap);
    return { yearIndex: idx + 1, tax, rate, rawReduction: raw, cappedReduction: capped, annualCap };
  });

  const taxReductionTotal = yearly.reduce((s, y) => s + y.cappedReduction, 0);

  const totalBenefit = grantTotal + taxReductionTotal;

  return {
    grant: {
      items,
      eligibleSum,
      baseForSupport,
      supportByRule,
      capByNewHires,
      cap10eok,
      facilityGrant,
      expertSupport,
      grantTotal,
      rule:
        "무상지원금: (적격 항목 합계와 공단산정금액 중 작은 금액)×75%, 단 신규장애인고용 1인당 4천만원(최대 10억) 한도 적용"
    },
    tax: {
      annualCap,
      taxes10y,
      yearly,
      taxReductionTotal,
      rule:
        "세액감면: 1~3년 100%, 4~5년 50%, 6~10년 30% (연도별 한도: 1억 + 장애인상시근로자×2천만원)"
    },
    totalBenefit,
    disclaimer:
      "본 계산은 추정치이며 실제 지원·감면은 요건 충족 및 심사/승인 결과에 따라 달라질 수 있습니다."
  };
}

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

// =====================
// 표준사업장 혜택 계산기 v2
// =====================
r.post("/standard-workplace-benefit-v2", async (req, res) => {
  try {
    const schema = z.object({
      disabledEmployees: z.number().int().min(0),
      newDisabledHires: z.number().int().min(0),
      keadAssessedAmount: z.number().int().min(0),

      grantItems: z.object({
        facilityAmount: z.number().int().min(0).default(0),
        facilityEligible: z.boolean().default(true),

        equipmentAmount: z.number().int().min(0).default(0),
        equipmentEligible: z.boolean().default(true),

        convenienceAmount: z.number().int().min(0).default(0),
        convenienceEligible: z.boolean().default(true),

        commuteVehicleAmount: z.number().int().min(0).default(0),
        commuteVehicleEligible: z.boolean().default(false),

        certConsultingAmount: z.number().int().min(0).default(0),
        certConsultingEligible: z.boolean().default(false)
      }),

      expert: z.object({
        monthlyWage: z.number().int().min(0).default(0),
        months: z.number().int().min(0).max(24).default(0)
      }).optional(),

      tax: z.object({
        mode: z.enum(["array", "growth"]),
        annualTaxArray: z.array(z.number().int().min(0)).optional(),
        annualTaxBase: z.number().int().min(0).optional(),
        growthRatePct: z.number().min(-50).max(200).optional()
      })
    });

    const b = schema.parse(req.body);
    const out = calcStandardBenefitV2(b);

    res.json({ ok: true, inputs: b, ...out });
  } catch (error: any) {
    console.error("Standard workplace benefit v2 error:", error);
    if (error.name === "ZodError") {
      return res.status(400).json({ error: "VALIDATION_ERROR", details: error.errors });
    }
    res.status(500).json({ error: error.message });
  }
});

// =====================
// PDF 리포트 다운로드
// =====================
r.post("/standard-workplace-benefit-v2/report.pdf", async (req, res) => {
  try {
    const schema = z.object({
      disabledEmployees: z.number().int().min(0),
      newDisabledHires: z.number().int().min(0),
      keadAssessedAmount: z.number().int().min(0),
      grantItems: z.any(),
      expert: z.any().optional(),
      tax: z.any()
    });

    const b = schema.parse(req.body);
    const out = calcStandardBenefitV2(b);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", 'attachment; filename="standard_workplace_benefit_report.pdf"');

    const doc = new PDFDocument({ size: "A4", margin: 40 });
    doc.pipe(res);

    const n = (x: number) => (x || 0).toLocaleString();

    doc.fontSize(18).text("표준사업장 혜택 리포트(추정)", { align: "left" });
    doc.moveDown(0.5);
    doc.fontSize(10).fillColor("#666").text(out.disclaimer);
    doc.fillColor("#000");
    doc.moveDown(1);

    doc.fontSize(12).text("입력 요약");
    doc.fontSize(10).text(`- 장애인 상시근로자 수: ${b.disabledEmployees}명`);
    doc.text(`- 신규 장애인 고용 인원: ${b.newDisabledHires}명`);
    doc.text(`- 공단 산정금액: ${n(b.keadAssessedAmount)}원`);
    doc.moveDown(0.8);

    doc.fontSize(12).text("① 무상지원금(항목별)");
    doc.fontSize(10);
    out.grant.items.forEach((it: any) => {
      doc.text(`- ${it.label}: ${n(it.amount)}원  | 적격: ${it.eligible ? "Y" : "N"}`);
    });
    doc.moveDown(0.4);
    doc.text(`적격합계: ${n(out.grant.eligibleSum)}원`);
    doc.text(`지원 산정기준(min(적격합계, 공단산정)): ${n(out.grant.baseForSupport)}원`);
    doc.text(`75% 적용: ${n(out.grant.supportByRule)}원`);
    doc.text(`신규고용 한도(4천만원×인원, 최대 10억): ${n(Math.min(out.grant.capByNewHires, out.grant.cap10eok))}원`);
    doc.text(`시설/장비 등 지원 추정: ${n(out.grant.facilityGrant)}원`);
    doc.text(`전문가 지원(선택): ${n(out.grant.expertSupport)}원`);
    doc.fontSize(11).text(`무상지원 합계: ${n(out.grant.grantTotal)}원`);
    doc.moveDown(1);

    doc.fontSize(12).text("② 세액감면(10년)");
    doc.fontSize(10).text(`연도별 감면 한도: ${n(out.tax.annualCap)}원`);
    doc.moveDown(0.4);

    out.tax.yearly.forEach((y: any) => {
      doc.text(
        `${y.yearIndex}년차 | 산출세액 ${n(y.tax)}원 | 감면율 ${Math.round(y.rate * 100)}% | 감면(캡) ${n(y.cappedReduction)}원`
      );
    });
    doc.moveDown(0.4);
    doc.fontSize(11).text(`10년 세액감면 합계: ${n(out.tax.taxReductionTotal)}원`);
    doc.moveDown(1);

    doc.fontSize(12).text("③ 총 혜택(추정)");
    doc.fontSize(14).text(`${n(out.totalBenefit)}원`, { underline: true });
    doc.moveDown(0.8);

    doc.fontSize(10).fillColor("#666").text(
      "※ 실제 지원·감면은 요건 충족, 서류, 승인 및 심사 결과에 따라 달라질 수 있습니다.\n" +
      "※ 부정수급/용도외 사용/인증취소 등 사유 발생 시 지원·감면이 제한될 수 있습니다."
    );

    doc.end();
  } catch (error: any) {
    console.error("PDF report error:", error);
    res.status(500).json({ error: error.message });
  }
});

export default r;
