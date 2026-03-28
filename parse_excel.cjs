const XLSX = require('xlsx');
const workbook = XLSX.readFile('/Users/mustafaal-yassary/Desktop/[CLINIQUE] 2025-07-28 - Doc clinique.xlsx', { cellNF: true, cellHTML: true });
for (const sheetName of workbook.SheetNames) {
  const sheet = workbook.Sheets[sheetName];
  if (sheet['!dataValidation']) {
     console.log(`\nValidations on ${sheetName}:`, sheet['!dataValidation']);
  } else {
     console.log(`\nNo simple validation lists on ${sheetName}, maybe standard properties...`);
  }
}
