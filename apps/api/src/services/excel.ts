import ExcelJS from "exceljs";

export type SupplierRow = {
  name: string;
  bizNo: string;
  region?: string;
  industry?: string;
  contactTel?: string;
};

export async function parseSupplierExcel(buffer: Buffer): Promise<SupplierRow[]> {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(buffer as any);
  const ws = wb.worksheets[0];
  if (!ws) return [];

  // 헤더 예시: 회사명 | 사업자번호 | 지역 | 업종 | 연락처
  const rows: SupplierRow[] = [];
  ws.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return; // 헤더 스킵
    const name = String(row.getCell(1).value ?? "").trim();
    const bizNo = String(row.getCell(2).value ?? "").replace(/\D/g, "").trim();
    if (!name || !bizNo) return;
    rows.push({
      name,
      bizNo,
      region: String(row.getCell(3).value ?? "").trim() || undefined,
      industry: String(row.getCell(4).value ?? "").trim() || undefined,
      contactTel: String(row.getCell(5).value ?? "").trim() || undefined,
    });
  });
  return rows;
}
