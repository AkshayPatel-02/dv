/**
 * @fileoverview Frame2Reality Registration System with Email Automation
 * @OnlyCurrentDoc
 */

/**
 * Required OAuth Scopes - DO NOT REMOVE
 * @param {string} https://www.googleapis.com/auth/spreadsheets - Access spreadsheets
 * @param {string} https://www.googleapis.com/auth/drive.file - Access Drive files
 * @param {string} https://www.googleapis.com/auth/script.send_mail - Send emails
 * @param {string} https://www.googleapis.com/auth/script.scriptapp - Manage triggers
 */

// ═══════════════════════════════════════════════════════════════════
// GOOGLE APPS SCRIPT — Frame2Reality Registration
// ═══════════════════════════════════════════════════════════════════
// 
// SETUP STEPS:
// 1. Create a new Google Sheet
// 2. Go to Extensions → Apps Script
// 3. Delete the default code and paste this entire script
// 4. Add OAuth scopes: Project Settings (⚙️) → Check "Show 'appsscript.json' manifest file"
// 5. Open appsscript.json and add scopes (see below for JSON)
// 6. Run the function "setupEmailTrigger" to install the email trigger
// 7. Authorize all permissions when prompted
// 8. Click "Deploy" → "New deployment"
// 9. Select type: "Web app"
// 10. Set "Execute as": Me
// 11. Set "Who has access": Anyone
// 12. Click "Deploy" and copy the Web App URL
// 13. Paste that URL in:
//    - src/pages/Frame2Reality.tsx → GOOGLE_SCRIPT_URL
//    - src/pages/Admin.tsx → GOOGLE_SCRIPT_URL
// 14. Done! The form submissions will now go to your Google Sheet.
//
// IMPORTANT: After any code changes, you must create a NEW deployment
// (Deploy → New deployment) for changes to take effect.
//
// REQUIRED appsscript.json:
// {
//   "timeZone": "Asia/Kolkata",
//   "dependencies": {},
//   "exceptionLogging": "STACKDRIVER",
//   "runtimeVersion": "V8",
//   "oauthScopes": [
//     "https://www.googleapis.com/auth/spreadsheets",
//     "https://www.googleapis.com/auth/drive.file",
//     "https://www.googleapis.com/auth/script.send_mail",
//     "https://www.googleapis.com/auth/script.scriptapp"
//   ]
// }
//
// MANUAL EMAIL WORKFLOW:
// - When a registration is received, Payment Status is set to "Pending"
// - Email Status is set to "Not Sent"
// - Admin verifies payment and types "OK" in the Payment Status column
// - Installable trigger automatically sends confirmation email to team leader
// - Email Status updates to "✅ Mail Forwarded" or "❌ Mail Failed"
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
  'PaymentStatus',
  'EmailStatus',
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
      'Pending',  // Payment Status
      'Not Sent', // Email Status
    ];

    sheet.appendRow(row);

    // Email will be sent manually after payment verification
    // Admin will type 'OK' in PaymentStatus column to trigger email

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

// ─────────────────────────────────────────────────────────────────
// Send gaming-themed confirmation email
// ─────────────────────────────────────────────────────────────────
function sendConfirmationEmail(details) {
  // Handle manual test runs without arguments
  if (!details) {
    Logger.log('⚠️ sendConfirmationEmail called without details object. Using test data...');
    details = {
      teamName: 'Test Squad',
      teamSize: '4',
      totalAmount: '450',
      leaderName: 'Test Commander',
      leaderEmail: Session.getActiveUser().getEmail(), // Your Gmail
      leaderRoll: 'TEST123',
      leaderBranch: 'CSE',
      leaderSection: 'A',
      utrNumber: '123456789012',
      paymentProofLink: ''
    };
  }

  if (!details.leaderEmail) {
    Logger.log('⚠️ No email provided, skipping confirmation email');
    return;
  }

  Logger.log('📧 Preparing to send email to: ' + details.leaderEmail);

  const htmlBody = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Frame2Reality - Workshop Confirmation</title>
</head>
<body style="margin: 0; padding: 0; background-color: #000000; font-family: 'Courier New', Courier, monospace;">
  
  <!-- Main Container -->
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #000000;">
    <tr>
      <td style="padding: 20px 10px;">
        
        <!-- Email Card -->
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #0a0a0a; border: 2px solid #22c55e; border-radius: 12px; overflow: hidden;">
          
          <!-- Header Section -->
          <tr>
            <td style="background: linear-gradient(135deg, #065f46 0%, #22c55e 100%); padding: 40px 20px; text-align: center;">
              <h1 style="margin: 0; color: #000000; font-size: 32px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; text-shadow: 0 0 10px rgba(0,0,0,0.3);">
                🎮 REGISTRATION CONFIRMED 🎮
              </h1>
              <p style="margin: 10px 0 0 0; color: #000000; font-size: 14px; font-weight: bold;">
                FRAME2REALITY: LEVEL UP FROM PLAYER TO DEVELOPER
              </p>
            </td>
          </tr>

          <!-- Terminal Header Bar -->
          <tr>
            <td style="background-color: #1a1a1a; padding: 12px 20px; border-bottom: 1px solid #333333;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td>
                    <span style="display: inline-block; width: 12px; height: 12px; background-color: #ef4444; border-radius: 50%; margin-right: 6px;"></span>
                    <span style="display: inline-block; width: 12px; height: 12px; background-color: #eab308; border-radius: 50%; margin-right: 6px;"></span>
                    <span style="display: inline-block; width: 12px; height: 12px; background-color: #22c55e; border-radius: 50%;"></span>
                  </td>
                  <td style="text-align: right;">
                    <span style="color: #666666; font-size: 11px;">CONFIRMATION_MAIL.html</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 40px 30px; color: #ffffff;">
              
              <!-- Greeting -->
              <p style="margin: 0 0 20px 0; color: #22c55e; font-size: 16px; font-weight: bold;">
                &gt; Greetings from DataVedhi.Club!
              </p>
              
              <p style="margin: 0 0 10px 0; color: #ffffff; font-size: 14px; line-height: 1.6;">
                Dear <strong style="color: #22c55e;">${details.leaderName}</strong>,
              </p>

              <p style="margin: 0 0 25px 0; color: #ffffff; font-size: 14px; line-height: 1.6;">
                We are delighted to inform you that your registration for the <strong style="color: #22c55e;">Frame2Reality</strong> workshop has been <strong style="color: #22c55e;">successfully confirmed</strong>.
              </p>

              <p style="margin: 0 0 30px 0; color: #a3a3a3; font-size: 13px; line-height: 1.6;">
                This two-day workshop will begin with guided sessions on graphics fundamentals and Unity-based game development, followed by hands-on exploration of XR and AR workflows where participants will build interactive augmented reality applications.
              </p>

              <!-- Squad Details Box -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #1a1a1a; border: 1px solid #22c55e; border-radius: 8px; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 20px;">
                    <h2 style="margin: 0 0 15px 0; color: #22c55e; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid #333333; padding-bottom: 10px;">
                      📋 YOUR TEAM DETAILS
                    </h2>
                    
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                      <tr>
                        <td style="padding: 8px 0; color: #666666; font-size: 13px; width: 140px;">Team Name:</td>
                        <td style="padding: 8px 0; color: #ffffff; font-size: 13px; font-weight: bold;">${details.teamName}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #666666; font-size: 13px;">Team Size:</td>
                        <td style="padding: 8px 0; color: #ffffff; font-size: 13px; font-weight: bold;">${details.teamSize} Members</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #666666; font-size: 13px;">Team Lead:</td>
                        <td style="padding: 8px 0; color: #ffffff; font-size: 13px; font-weight: bold;">${details.leaderName}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #666666; font-size: 13px;">Roll Number:</td>
                        <td style="padding: 8px 0; color: #ffffff; font-size: 13px; font-weight: bold;">${details.leaderRoll}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #666666; font-size: 13px;">Branch:</td>
                        <td style="padding: 8px 0; color: #ffffff; font-size: 13px; font-weight: bold;">${details.leaderBranch} - ${details.leaderSection}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Event Details Box -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #1a1a1a; border: 1px solid #22c55e; border-radius: 8px; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 20px;">
                    <h2 style="margin: 0 0 15px 0; color: #22c55e; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid #333333; padding-bottom: 10px;">
                      🎮 EVENT DETAILS
                    </h2>
                    
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                      <tr>
                        <td style="padding: 8px 0; color: #666666; font-size: 13px; width: 100px;">📅 Date:</td>
                        <td style="padding: 8px 0; color: #ffffff; font-size: 13px; font-weight: bold;">20th and 21st February, 2026</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #666666; font-size: 13px;">⏰ Time:</td>
                        <td style="padding: 8px 0; color: #ffffff; font-size: 13px; font-weight: bold;">10:00 AM – 4:20 PM</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #666666; font-size: 13px;">📍 Venue:</td>
                        <td style="padding: 8px 0; color: #ffffff; font-size: 13px; font-weight: bold;">Nalanda Auditorium, Vignana Bharathi Institute of Technology</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Payment Status Box -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #1a1a1a; border: 1px solid #22c55e; border-radius: 8px; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 20px;">
                    <h2 style="margin: 0 0 15px 0; color: #22c55e; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid #333333; padding-bottom: 10px;">
                      💳 PAYMENT CONFIRMATION
                    </h2>
                    
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                      <tr>
                        <td style="padding: 8px 0; color: #666666; font-size: 13px; width: 140px;">Amount Paid:</td>
                        <td style="padding: 8px 0; color: #22c55e; font-size: 13px; font-weight: bold;">₹${details.totalAmount}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #666666; font-size: 13px;">UTR Number:</td>
                        <td style="padding: 8px 0; color: #ffffff; font-size: 13px; font-weight: bold; font-family: 'Courier New', monospace;">${details.utrNumber}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #666666; font-size: 13px;">Status:</td>
                        <td style="padding: 8px 0;">
                          <span style="display: inline-block; background-color: #22c55e; color: #000000; padding: 4px 12px; border-radius: 4px; font-size: 11px; font-weight: bold;">
                            ✓ VERIFIED
                          </span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Important Notes -->
              <div style="background-color: #0f172a; border-left: 4px solid #22c55e; padding: 20px; margin-bottom: 30px; border-radius: 4px;">
                <h3 style="margin: 0 0 15px 0; color: #22c55e; font-size: 14px; text-transform: uppercase;">
                  ⚠️ IMPORTANT NOTES
                </h3>
                <ul style="margin: 0; padding-left: 20px; color: #a3a3a3; font-size: 13px; line-height: 1.8;">
                  <li><strong style="color: #ffffff;">Laptops are mandatory</strong> for all participants</li>
                  <li>Mode of participation: <strong style="color: #ffffff;">Team of 4-5 members</strong></li>
                  <li><strong style="color: #ffffff;">Minimum 1 Gaming laptop per team is mandatory</strong></li>
                  <li>Please arrive <strong style="color: #ffffff;">15 minutes early</strong> for registration</li>
                  <li>Carry <strong style="color: #ffffff;">valid ID proof</strong> and payment confirmation</li>
                </ul>
              </div>

              <!-- Terminal Output -->
              <div style="background-color: #000000; border: 1px solid #22c55e; padding: 15px; border-radius: 6px; margin-bottom: 30px; font-family: 'Courier New', monospace;">
                <p style="margin: 0; color: #22c55e; font-size: 12px; line-height: 1.6;">
                  <span style="color: #666666;">$</span> system.check_status --team="${details.teamName}"<br>
                  <span style="color: #666666;">&gt;</span> Registration: <span style="color: #22c55e;">✓ CONFIRMED</span><br>
                  <span style="color: #666666;">&gt;</span> Payment: <span style="color: #22c55e;">✓ VERIFIED</span><br>
                  <span style="color: #666666;">&gt;</span> Team Status: <span style="color: #22c55e;">✓ ACTIVE</span><br>
                  <span style="color: #666666;">&gt;</span> Workshop Access: <span style="color: #22c55e;">✓ GRANTED</span><br>
                  <span style="color: #666666;">$</span> Ready to level up! <span style="color: #eab308;">🎮</span>
                </p>
              </div>

              <!-- Contact Information -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #1a1a1a; border: 1px solid #333333; border-radius: 8px; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 20px;">
                    <h2 style="margin: 0 0 15px 0; color: #22c55e; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid #333333; padding-bottom: 10px;">
                      📞 CONTACT INFORMATION
                    </h2>
                    <p style="margin: 0 0 10px 0; color: #ffffff; font-size: 13px; line-height: 1.6;">
                      <strong style="color: #666666;">For any queries, contact:</strong>
                    </p>
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                      <tr>
                        <td style="padding: 6px 0; color: #a3a3a3; font-size: 13px; width: 80px;">Ashik:</td>
                        <td style="padding: 6px 0; color: #22c55e; font-size: 13px; font-weight: bold;"><a href="tel:6305985313" style="color: #22c55e; text-decoration: none;">6305985313</a></td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; color: #a3a3a3; font-size: 13px;">Shiva:</td>
                        <td style="padding: 6px 0; color: #22c55e; font-size: 13px; font-weight: bold;"><a href="tel:9390193536" style="color: #22c55e; text-decoration: none;">9390193536</a></td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Closing Message -->
              <p style="margin: 0 0 10px 0; color: #ffffff; font-size: 14px; line-height: 1.6;">
                We look forward to seeing you at the workshop. Get ready to transform your gaming passion into development skills!
              </p>
              
              <p style="margin: 0 0 30px 0; color: #22c55e; font-size: 14px; font-weight: bold;">
                Thank you,<br>
                Team DataVedhi.Club
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #0a0a0a; padding: 30px 20px; text-align: center; border-top: 1px solid #333333;">
              <p style="margin: 0 0 10px 0; color: #22c55e; font-size: 16px; font-weight: bold;">
                DATAVEDHI.CLUB
              </p>
              <p style="margin: 0 0 15px 0; color: #666666; font-size: 11px; line-height: 1.6;">
                The Official Tech & Gaming Club of VBIT<br>
                Building the Future. One Game at a Time.
              </p>
              <div style="margin-bottom: 15px;">
                <a href="https://www.instagram.com/datavedhi.club" style="display: inline-block; margin: 0 8px; text-decoration: none;">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/a/a5/Instagram_icon.png" alt="Instagram" width="32" height="32" style="display: block; border: 0;" />
                </a>
                <a href="https://www.linkedin.com/company/data-vedhi-club-vbit/" style="display: inline-block; margin: 0 8px; text-decoration: none;">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/c/ca/LinkedIn_logo_initials.png" alt="LinkedIn" width="32" height="32" style="display: block; border: 0;" />
                </a>
              </div>
              <p style="margin: 0 0 8px 0; color: #666666; font-size: 11px;">
                Follow us for more updates on social media
              </p>
              <p style="margin: 0; color: #333333; font-size: 10px;">
                © 2026 DataVedhi.Club. All rights reserved.<br>
                This is an automated confirmation email.
              </p>
            </td>
          </tr>

        </table>
        
      </td>
    </tr>
  </table>

</body>
</html>
  `;

  // Send the email
  try {
    MailApp.sendEmail({
      to: details.leaderEmail,
      replyTo: 'datavedhi@gcet.ac.in',
      subject: '⚡ Frame2Reality Registration Confirmed | DataVedhi.Club',
      htmlBody: htmlBody,
      name: 'DataVedhi.Club - Frame2Reality'
    });
    Logger.log('✅ Email sent successfully to: ' + details.leaderEmail);
  } catch (mailErr) {
    Logger.log('❌ MailApp.sendEmail failed: ' + mailErr.message);
    throw mailErr;
  }
}

// ─────────────────────────────────────────────────────────────────
// INSTALLABLE TRIGGER — Send email when Payment Status is set to "OK"
// ─────────────────────────────────────────────────────────────────
function onEditInstallable(e) {
  try {
    const sheet = e.source.getActiveSheet();
    
    // Only process edits in the Registrations sheet
    if (sheet.getName() !== SHEET_NAME) return;
    
    const range = e.range;
    const row = range.getRow();
    const col = range.getColumn();
    
    // Skip header row
    if (row === 1) return;
    
    // Get the header row to find column indices
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const paymentStatusCol = headers.indexOf('PaymentStatus') + 1;
    const emailStatusCol = headers.indexOf('EmailStatus') + 1;
    
    // Check if the edited column is PaymentStatus
    if (col !== paymentStatusCol) return;
    
    const value = e.value ? e.value.toString().trim().toUpperCase() : '';
    
    // Trigger email sending only when "OK" is entered
    if (value === 'OK') {
      Logger.log('Payment status set to OK for row ' + row + '. Sending email...');
      
      // Get all data from the edited row
      const rowData = sheet.getRange(row, 1, 1, headers.length).getValues()[0];
      
      // Build team details object
      const details = {
        teamName: rowData[headers.indexOf('TeamName')] || 'Unknown Team',
        teamSize: rowData[headers.indexOf('TeamSize')] || '4',
        totalAmount: rowData[headers.indexOf('TotalAmount')] || '450',
        leaderName: rowData[headers.indexOf('LeaderName')] || 'Commander',
        leaderEmail: rowData[headers.indexOf('LeaderEmail')] || '',
        leaderRoll: rowData[headers.indexOf('LeaderRoll')] || '',
        leaderBranch: rowData[headers.indexOf('LeaderBranch')] || '',
        leaderSection: rowData[headers.indexOf('LeaderSection')] || '',
        utrNumber: rowData[headers.indexOf('UTRNumber')] || '',
        paymentProofLink: rowData[headers.indexOf('PaymentProofLink')] || ''
      };
      
      // Validate email exists
      if (!details.leaderEmail || details.leaderEmail === '') {
        sheet.getRange(row, emailStatusCol).setValue('❌ No Email Found');
        Logger.log('❌ No email address found for row ' + row);
        return;
      }
      
      // Send the confirmation email
      try {
        sendConfirmationEmail(details);
        sheet.getRange(row, emailStatusCol).setValue('✅ Mail Forwarded');
        Logger.log('✅ Email sent successfully to: ' + details.leaderEmail);
        SpreadsheetApp.flush(); // Save changes immediately
      } catch (emailErr) {
        sheet.getRange(row, emailStatusCol).setValue('❌ Mail Failed: ' + emailErr.message);
        Logger.log('❌ Email send failed: ' + emailErr.message);
      }
    }
  } catch (err) {
    Logger.log('❌ onEdit error: ' + err.message);
  }
}

// ─────────────────────────────────────────────────────────────────
// AUTHORIZATION HELPER — Run this function manually to authorize email permissions
// ─────────────────────────────────────────────────────────────────
function authorizeEmailPermissions() {
  Logger.log('🔐 Testing email permissions...');
  
  try {
    // Test MailApp access directly (this triggers the authorization prompt)
    const remaining = MailApp.getRemainingDailyQuota();
    Logger.log('✅ MailApp access granted. Daily quota remaining: ' + remaining);
    
    Logger.log('✅ Authorization successful! You can now send emails.');
    Logger.log('💡 Try typing "OK" in the PaymentStatus column to test email sending.');
    
    return 'SUCCESS: Email permissions authorized. Daily quota: ' + remaining;
  } catch (err) {
    Logger.log('❌ Authorization failed: ' + err.message);
    throw new Error('Please authorize the required permissions when prompted.');
  }
}

// ─────────────────────────────────────────────────────────────────
// SETUP TRIGGER — Run this ONCE to install the onEdit trigger with full permissions
// ─────────────────────────────────────────────────────────────────
function setupEmailTrigger() {
  // Remove all existing triggers first
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(trigger => {
    if (trigger.getHandlerFunction() === 'onEditInstallable') {
      ScriptApp.deleteTrigger(trigger);
    }
  });
  
  // Create new installable onEdit trigger
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  ScriptApp.newTrigger('onEditInstallable')
    .forSpreadsheet(ss)
    .onEdit()
    .create();
  
  Logger.log('✅ Email trigger installed successfully!');
  Logger.log('💡 Now type "OK" in the PaymentStatus column to test email sending.');
  
  return 'SUCCESS: Trigger installed. Try typing OK in PaymentStatus column.';
}
