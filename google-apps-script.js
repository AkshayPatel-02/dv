// ═══════════════════════════════════════════════════════════════════
// GOOGLE APPS SCRIPT — Frame2Reality Registration
// ═══════════════════════════════════════════════════════════════════
// 
// SETUP STEPS:
// 1. Create a new Google Sheet
// 2. Go to Extensions → Apps Script
// 3. Delete the default code and paste this entire script
// 4. Click "Deploy" → "New deployment"
// 5. Select type: "Web app"
// 6. Set "Execute as": Me
// 7. Set "Who has access": Anyone
// 8. Click "Deploy" and copy the Web App URL
// 9. Paste that URL in:
//    - src/pages/Frame2Reality.tsx → GOOGLE_SCRIPT_URL
//    - src/pages/Admin.tsx → GOOGLE_SCRIPT_URL
// 10. Done! The form submissions will now go to your Google Sheet.
//
// IMPORTANT: After any code changes, you must create a NEW deployment
// (Deploy → New deployment) for changes to take effect.
// ═══════════════════════════════════════════════════════════════════

// Sheet name where registrations will be stored
const SHEET_NAME = 'Registrations';

// ─────────────────────────────────────────────────────────────────
// HEADERS — these will be auto-created in Row 1
// ─────────────────────────────────────────────────────────────────
const HEADERS = [
  'Timestamp',
  'TeamName',
  'TeamSize',
  'TotalAmount',
  'LeaderName',
  'LeaderRoll',
  'LeaderYear',
  'LeaderBranch',
  'LeaderSection',
  'LeaderPhone',
  'LeaderEmail',
  'Member2_Name', 'Member2_Roll', 'Member2_Year', 'Member2_Branch', 'Member2_Section', 'Member2_Phone', 'Member2_Email',
  'Member3_Name', 'Member3_Roll', 'Member3_Year', 'Member3_Branch', 'Member3_Section', 'Member3_Phone', 'Member3_Email',
  'Member4_Name', 'Member4_Roll', 'Member4_Year', 'Member4_Branch', 'Member4_Section', 'Member4_Phone', 'Member4_Email',
  'Member5_Name', 'Member5_Roll', 'Member5_Year', 'Member5_Branch', 'Member5_Section', 'Member5_Phone', 'Member5_Email',
  'UTRNumber',
  'PaymentProofLink',
];

// ─────────────────────────────────────────────────────────────────
// GET the sheet (creates it + headers if it doesn't exist)
// ─────────────────────────────────────────────────────────────────
function getOrCreateSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(HEADERS);
    // Bold + freeze header row
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

// ─────────────────────────────────────────────────────────────────
// POST — Handle form submissions from Frame2Reality page
// ─────────────────────────────────────────────────────────────────
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const sheet = getOrCreateSheet();

    // Save payment proof to Google Drive if present
    let paymentProofLink = '';
    if (data.PaymentProof && data.PaymentProof.startsWith('data:')) {
      try {
        paymentProofLink = savePaymentProof(data.PaymentProof, data.PaymentProofName || 'payment.png', data.TeamName || 'Unknown');
      } catch (err) {
        paymentProofLink = 'UPLOAD_FAILED: ' + err.message;
      }
    }

    // Build row in the same order as HEADERS
    const row = [
      new Date().toISOString(),                // Timestamp
      data.TeamName || '',
      data.TeamSize || '',
      data.TotalAmount || '',
      data.LeaderName || '',
      data.LeaderRoll || '',
      data.LeaderYear || '',
      data.LeaderBranch || '',
      data.LeaderSection || '',
      data.LeaderPhone || '',
      data.LeaderEmail || '',
      // Members 2-5
      data.Member2_Name || '', data.Member2_Roll || '', data.Member2_Year || '', data.Member2_Branch || '', data.Member2_Section || '', data.Member2_Phone || '', data.Member2_Email || '',
      data.Member3_Name || '', data.Member3_Roll || '', data.Member3_Year || '', data.Member3_Branch || '', data.Member3_Section || '', data.Member3_Phone || '', data.Member3_Email || '',
      data.Member4_Name || '', data.Member4_Roll || '', data.Member4_Year || '', data.Member4_Branch || '', data.Member4_Section || '', data.Member4_Phone || '', data.Member4_Email || '',
      data.Member5_Name || '', data.Member5_Roll || '', data.Member5_Year || '', data.Member5_Branch || '', data.Member5_Section || '', data.Member5_Phone || '', data.Member5_Email || '',
      data.UTRNumber || '',
      paymentProofLink,
    ];

    sheet.appendRow(row);

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'success', message: 'Registration saved' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ─────────────────────────────────────────────────────────────────
// GET — Return all registrations to the Admin page
// ─────────────────────────────────────────────────────────────────
function doGet(e) {
  try {
    const sheet = getOrCreateSheet();
    const data = sheet.getDataRange().getValues();
    
    if (data.length <= 1) {
      // Only headers, no data
      return ContentService
        .createTextOutput(JSON.stringify({ registrations: [] }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    const headers = data[0];
    const registrations = [];

    for (let i = 1; i < data.length; i++) {
      const row = {};
      for (let j = 0; j < headers.length; j++) {
        row[headers[j]] = data[i][j] !== undefined ? String(data[i][j]) : '';
      }
      registrations.push(row);
    }

    return ContentService
      .createTextOutput(JSON.stringify({ registrations: registrations }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ─────────────────────────────────────────────────────────────────
// Save payment proof image to Google Drive
// ─────────────────────────────────────────────────────────────────
function savePaymentProof(base64Data, fileName, teamName) {
  // Extract the actual base64 content (remove "data:image/png;base64," prefix)
  const parts = base64Data.split(',');
  const mimeType = parts[0].match(/:(.*?);/)[1];
  const bytes = Utilities.base64Decode(parts[1]);
  const blob = Utilities.newBlob(bytes, mimeType, fileName);

  // Create or get folder for payment proofs
  const folderName = 'Frame2Reality_PaymentProofs';
  const folders = DriveApp.getFoldersByName(folderName);
  let folder;
  if (folders.hasNext()) {
    folder = folders.next();
  } else {
    folder = DriveApp.createFolder(folderName);
  }

  // Save with team name prefix for easy identification
  const safeName = teamName.replace(/[^a-zA-Z0-9]/g, '_');
  const file = folder.createFile(blob.setName(safeName + '_' + fileName));
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

  return file.getUrl();
}
