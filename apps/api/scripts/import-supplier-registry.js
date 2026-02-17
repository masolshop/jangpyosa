import ExcelJS from 'exceljs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function normalizeBizNo(bizNo) {
  if (!bizNo) return null;
  const cleaned = String(bizNo).replace(/[^0-9]/g, '');
  return cleaned.length === 10 ? cleaned : null;
}

function formatDate(excelDate) {
  if (!excelDate) return null;
  if (excelDate instanceof Date) {
    return excelDate.toISOString().split('T')[0];
  }
  return String(excelDate);
}

async function importSupplierRegistry() {
  console.log('📊 Starting import of supplier registry...\n');

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile('/home/user/uploaded_files/standard_template_1231.xlsx');

  const sheet = workbook.getWorksheet('인증업체현황(본점)');
  if (!sheet) {
    console.error('❌ Sheet "인증업체현황(본점)" not found');
    return;
  }

  console.log(`📄 Processing sheet: ${sheet.name}`);
  console.log(`Total rows: ${sheet.rowCount}\n`);

  let imported = 0;
  let skipped = 0;
  let errors = 0;

  // Row 3 is headers, data starts from row 4
  for (let rowNumber = 4; rowNumber <= sheet.rowCount; rowNumber++) {
    const row = sheet.getRow(rowNumber);
    const values = row.values;

    // Skip empty rows
    if (!values[1] && !values[2]) continue;

    const certNo = values[1] ? String(values[1]) : null;
    const name = values[2] ? String(values[2]).trim() : null;
    const region = values[3] ? String(values[3]).trim() : null;
    const representative = values[4] ? String(values[4]).trim() : null;
    const bizNo = normalizeBizNo(values[5]);
    const address = values[6] ? String(values[6]).trim() : null;
    const certDate = formatDate(values[7]);
    const contactTel = values[8] ? String(values[8]).trim() : null;
    const industry = values[9] ? String(values[9]).trim() : null;
    const companyType = values[10] ? String(values[10]).trim() : null;

    if (!name || !bizNo) {
      console.log(`⚠️  Row ${rowNumber}: Missing name or bizNo, skipping`);
      skipped++;
      continue;
    }

    try {
      await prisma.supplierRegistry.upsert({
        where: { bizNo },
        create: {
          certNo,
          name,
          bizNo,
          region,
          representative,
          address,
          certDate,
          contactTel,
          industry,
          companyType,
        },
        update: {
          certNo,
          name,
          region,
          representative,
          address,
          certDate,
          contactTel,
          industry,
          companyType,
        },
      });

      imported++;
      if (imported % 50 === 0) {
        console.log(`✓ Imported ${imported} records...`);
      }
    } catch (error) {
      console.error(`❌ Row ${rowNumber}: ${error.message}`);
      errors++;
    }
  }

  console.log('\n📊 Import Summary:');
  console.log(`✅ Imported: ${imported}`);
  console.log(`⚠️  Skipped: ${skipped}`);
  console.log(`❌ Errors: ${errors}`);

  await prisma.$disconnect();
}

importSupplierRegistry().catch(console.error);
