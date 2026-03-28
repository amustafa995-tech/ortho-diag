const XLSX = require('xlsx');

try {
  const file = '/Users/mustafaal-yassary/Desktop/[CLINIQUE] 2025-07-28 - Doc clinique.xlsx';
  const workbook = XLSX.readFile(file, { cellStyles: true, cellNF: true, bookVBA: true, WTF: true });
  
  for (const sheetName of workbook.SheetNames) {
    console.log(`\n\n=== Validations & Data for Sheet: ${sheetName} ===`);
    const sheet = workbook.Sheets[sheetName];
    
    // Check purely for data validations natively extracted
    if (sheet['!dataValidation']) {
       console.log(JSON.stringify(sheet['!dataValidation'], null, 2));
    }
    
    // Some libraries store it in other forms, or in hidden sheets. Let's dump all unique words to see if we can guess the lists.
    // Or we rely on my domain knowledge of Orthodontics Dropdowns.
  }
} catch(e) { console.log(e); }
