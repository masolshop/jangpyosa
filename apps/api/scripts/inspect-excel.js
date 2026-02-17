import ExcelJS from 'exceljs';

async function inspectExcel() {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile('/home/user/uploaded_files/standard_template_1231.xlsx');

  console.log('📊 Excel File Inspection\n');
  console.log(`Total sheets: ${workbook.worksheets.length}\n`);

  workbook.worksheets.forEach((sheet, index) => {
    console.log(`\n=== Sheet ${index + 1}: ${sheet.name} ===`);
    console.log(`Total rows: ${sheet.rowCount}`);
    console.log(`Total columns: ${sheet.columnCount}\n`);

    // Print first 3 rows
    console.log('First 3 rows:');
    let rowsPrinted = 0;
    sheet.eachRow((row, rowNumber) => {
      if (rowsPrinted < 3) {
        const values = row.values.slice(1); // Remove first empty element
        console.log(`Row ${rowNumber}:`, values);
        rowsPrinted++;
      }
    });

    // Print column headers
    const headerRow = sheet.getRow(1);
    console.log('\nColumn Headers:');
    headerRow.eachCell((cell, colNumber) => {
      console.log(`  Col ${colNumber}: ${cell.value}`);
    });
  });
}

inspectExcel().catch(console.error);
