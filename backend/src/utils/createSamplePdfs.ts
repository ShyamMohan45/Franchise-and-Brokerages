import fs from 'fs';
import path from 'path';

function createMinimalPdf(title: string, subtitle: string, items: string[]): Buffer {
  const content = `BT
/F1 20 Tf
50 720 Td
(${title}) Tj
/F1 12 Tf
0 -30 Td
(${subtitle}) Tj
/F1 10 Tf
0 -40 Td
(CONFIDENTIAL DISCLOSURE - FRANCHISEBRIDGE PLATFORM) Tj
${items.map((it, idx) => `0 -25 Td (${idx + 1}. ${it.replace(/[()]/g, '')}) Tj`).join('\n')}
ET`;

  const streamLength = Buffer.byteLength(content, 'utf-8');

  const pdfSource = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
4 0 obj
<< /Length ${streamLength} >>
stream
${content}
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000240 00000 n 
0000000340 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
420
%%EOF`;

  return Buffer.from(pdfSource, 'utf-8');
}

export function generateSamplePdfs() {
  const uploadsDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  // 1. RoastCraft FDD
  fs.writeFileSync(
    path.join(uploadsDir, 'roastcraft_master_fdd_2026.pdf'),
    createMinimalPdf(
      'ROASTCRAFT SPECIALTY COFFEE - MASTER FDD DISCLOSURE',
      'US FTC 23-Item Compliance & Commonwealth Franchise Memorandum',
      [
        'Item 1: The Franchisor and Any Parents, Predecessors, and Affiliates',
        'Item 5: Initial Franchise Fee - 800,000 INR per Unit',
        'Item 7: Estimated Initial Investment Range - 3,500,000 to 5,500,000 INR',
        'Item 12: Territory Protection - 3.5 km Exclusivity Buffer',
        'Item 19: Financial Performance Representations - 22.4% EBITDA Margins',
        'Item 22: Master Franchise Agreement Contract Form',
      ]
    )
  );

  // 2. RoastCraft SOP
  fs.writeFileSync(
    path.join(uploadsDir, 'roastcraft_espresso_sop_manual.pdf'),
    createMinimalPdf(
      'ROASTCRAFT ESPRESSO EXTRACTION & QUALITY SOP MANUAL',
      'Standard Operating Procedures - Section 4: Daily Extraction & Steam Calibration',
      [
        'SOP-01: Grinder Optical Calibration and Grammage Weighing',
        'SOP-02: Boiler Temperature Maintenance at 93.5 Degrees Celsius',
        'SOP-03: Double Shot Extraction Timing at 27-30 Seconds',
        'SOP-04: Milk Microfoam Texturing and Steaming Wand Sanitation',
        'SOP-05: Daily Cleaning and Chemical Backflushing at Shift Close',
      ]
    )
  );

  // 3. FitPulse FDD
  fs.writeFileSync(
    path.join(uploadsDir, 'fitpulse_smart_gym_fdd_2026.pdf'),
    createMinimalPdf(
      'FITPULSE 24/7 SMART GYMS - FRANCHISE DISCLOSURE PACKET',
      'Automated Neighborhood Fitness Center Model - Legal Disclosure Memorandum',
      [
        'Item 1: Corporate Entity and Technology Stack Disclosures',
        'Item 5: Initial Franchise Fee - 1,200,000 INR',
        'Item 7: Initial Investment - 6,000,000 to 9,000,000 INR',
        'Item 8: Restrictions on Sources of Products and Equipment',
        'Item 19: Financial Representations - Payback Period 22 Months',
      ]
    )
  );

  // 4. Curry Leaf Express FDD
  fs.writeFileSync(
    path.join(uploadsDir, 'curryleaf_qsr_fdd_packet.pdf'),
    createMinimalPdf(
      'CURRY LEAF EXPRESS - QSR FRANCHISE DISCLOSURE PACKET',
      'Fast Casual Coastal Indian Food Model - Complete Regulatory FDD',
      [
        'Item 1: Fast Casual QSR Commissary Support Structure',
        'Item 5: Initial Franchise Fee - 600,000 INR',
        'Item 7: Total Investment - 2,500,000 to 4,000,000 INR',
        'Item 11: Franchisor Assistance, Advertising, and POS Systems',
        'Item 19: Historic Outlet Sales and High-Volume Delivery Volume',
      ]
    )
  );

  console.log('[SamplePdfs] Sample FDD & SOP PDFs generated successfully in uploads/');
}

if (require.main === module) {
  generateSamplePdfs();
}
