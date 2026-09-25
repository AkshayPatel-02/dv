/**
 * ╔══════════════════════════════════════════════════════╗
 *   OLLAVERSE — Google Apps Script (Final)
 *   → Receives registration from the website
 *   → Saves payment screenshot to Google Drive
 *   → Logs all details neatly into Google Sheets
 * ╚══════════════════════════════════════════════════════╝
 *
 * HOW TO USE:
 * 1. Open your Google Sheet → Extensions → Apps Script
 * 2. Delete everything and paste this entire file
 * 3. Add the OllaverseLib library:
 *    - Click Libraries (+)
 *    - Script ID: 1kmgSXhIf7uUwFUaiVQmQGxn8ex9vyEA7wu0hbee85D_7CtLvFg1BdfFt
 *    - Version: 1, Identifier: OllaverseLib
 * 4. Click Save (Ctrl+S)
 * 5. Click Deploy → New Deployment → Web App
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 6. Click Deploy → Copy the Web App URL
 * 7. Paste that URL in .env.local → VITE_GOOGLE_SHEETS_URL
 *
 * Current Web App URL: https://script.google.com/macros/s/AKfycbzMLN5fuUd_qYMPMRkbjDOEKL9usRwkdWW1RZ7YOjeIvvAXcbedCCDxBdILhXI5jXgs/exec
 */

const SHEET_NAME        = 'Registrations';
const DRIVE_FOLDER_NAME = 'Ollaverse Payment Screenshots';

// ─────────────────────────────────────────────
//  MAIN HANDLER — receives POST from website
// ─────────────────────────────────────────────
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const sheet = getOrCreateSheet();

    // 1. Save screenshot to Drive, get link
    let screenshotLink = '—';
    if (data.paymentScreenshot && data.paymentScreenshot.startsWith('data:image')) {
      try {
        screenshotLink = saveImageToDrive(
          data.paymentScreenshot,
          data.paymentFileName || `payment_${Date.now()}.png`,
          data.teamName
        );
      } catch (imgErr) {
        screenshotLink = '⚠ Image save error: ' + imgErr.message;
      }
    }

    // 2. Build the row
    const row = [
      new Date(data.timestamp),          // A: Timestamp
      data.teamName    || '—',           // B: Team Name
      Number(data.teamSize) || '—',      // C: Team Size
      `₹${data.amountPaid || 0}`,        // D: Amount Paid
      data.teamLeadEmail || '—',         // E: Team Lead Email
      screenshotLink                     // F: Screenshot Link
    ];

    // Append up to 4 members (6 fields each)
    const members = Array.isArray(data.members) ? data.members : [];
    for (let i = 0; i < 4; i++) {
      const m = members[i] || {};
      row.push(
        m.name    || '',
        m.email   || '',
        m.roll    || '',
        m.dept    || '',
        m.year    ? `${m.year}${m.year === '2' ? 'nd' : 'rd'} Year` : '',
        m.section ? `Section ${m.section}` : ''
      );
    }

    sheet.appendRow(row);

    // Stripe rows alternately for readability
    const lastRow = sheet.getLastRow();
    if (lastRow % 2 === 0) {
      sheet.getRange(lastRow, 1, 1, row.length)
           .setBackground('#f3f0ff'); // light purple tint
    }

    // Auto-fit columns on first registration
    if (lastRow <= 3) sheet.autoResizeColumns(1, row.length);

    return jsonResponse({ status: 'success', row: lastRow });

  } catch (err) {
    return jsonResponse({ status: 'error', message: err.message });
  }
}

// ─────────────────────────────────────────────
//  GET — simple health check
// ─────────────────────────────────────────────
function doGet(e) {
  return jsonResponse({ status: 'ok', message: 'Ollaverse Registration API is running 🚀' });
}

// ─────────────────────────────────────────────
//  TEST FUNCTION
// ─────────────────────────────────────────────
function testRegistration() {
  const fakeData = {
    timestamp: new Date().toISOString(),
    teamName: 'Test Team Alpha',
    teamSize: '3',
    amountPaid: 225,
    teamLeadEmail: 'test@vbit.ac.in',
    paymentFileName: 'test_screenshot.png',
    paymentScreenshot: null,
    members: [
      { name: 'Rahul Kumar',  email: 'rahul@vbit.ac.in', roll: '22B91A0501', dept: 'CSE', year: '2', section: 'A' },
      { name: 'Priya Singh',  email: 'priya@vbit.ac.in', roll: '22B91A0502', dept: 'CSM', year: '2', section: 'B' },
      { name: 'Arun Reddy',   email: 'arun@vbit.ac.in',  roll: '22B91A0503', dept: 'IT',  year: '3', section: 'C' }
    ]
  };

  const sheet = getOrCreateSheet();
  const row = [
    new Date(fakeData.timestamp),
    fakeData.teamName,
    Number(fakeData.teamSize),
    `₹${fakeData.amountPaid}`,
    fakeData.teamLeadEmail,
    '✅ TEST ROW — No screenshot'
  ];
  for (let i = 0; i < 4; i++) {
    const m = fakeData.members[i] || {};
    row.push(
      m.name    || '',
      m.email   || '',
      m.roll    || '',
      m.dept    || '',
      m.year    ? `${m.year}${m.year === '2' ? 'nd' : 'rd'} Year` : '',
      m.section ? `Section ${m.section}` : ''
    );
  }
  sheet.appendRow(row);
  Logger.log('✅ Test row added to sheet: ' + SHEET_NAME);
}

// ─────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────

function getOrCreateSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);

    const headers = [
      'Timestamp',
      'Team Name',
      'Team Size',
      'Amount Paid',
      'Team Lead Email',
      '📸 Payment Screenshot'
    ];
    for (let i = 1; i <= 4; i++) {
      headers.push(
        `M${i} Full Name`,
        `M${i} Email`,
        `M${i} Roll No`,
        `M${i} Department`,
        `M${i} Year`,
        `M${i} Section`
      );
    }

    const headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setValues([headers]);
    headerRange
      .setBackground('#4c1d95')
      .setFontColor('#ffffff')
      .setFontWeight('bold')
      .setFontFamily('Arial')
      .setFontSize(10)
      .setHorizontalAlignment('center')
      .setVerticalAlignment('middle')
      .setWrap(true);
    sheet.setRowHeight(1, 40);
    sheet.setFrozenRows(1);
    sheet.setFrozenColumns(2);

    sheet.setColumnWidth(1, 160);
    sheet.setColumnWidth(2, 160);
    sheet.setColumnWidth(3, 80);
    sheet.setColumnWidth(4, 100);
    sheet.setColumnWidth(5, 200);
    sheet.setColumnWidth(6, 250);
  }

  return sheet;
}

function saveImageToDrive(base64Data, fileName, teamName) {
  const folders = DriveApp.getFoldersByName(DRIVE_FOLDER_NAME);
  const folder = folders.hasNext()
    ? folders.next()
    : DriveApp.createFolder(DRIVE_FOLDER_NAME);

  const base64   = base64Data.split(',')[1];
  const mimeType = base64Data.split(';')[0].split(':')[1];
  const safeName = (teamName || 'team').replace(/[^a-zA-Z0-9_\- ]/g, '_');
  const safeFile = (fileName  || 'payment.png').replace(/[^a-zA-Z0-9_.\- ]/g, '_');

  const blob = Utilities.newBlob(
    Utilities.base64Decode(base64),
    mimeType,
    `${safeName}_${safeFile}`
  );
  const file = folder.createFile(blob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

  return file.getUrl();
}

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
