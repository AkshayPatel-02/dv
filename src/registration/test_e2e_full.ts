// End-to-End Test Suite for OLLAVERSE Platform
// Simulates full user, admin, scanner, and email journeys

// 1. Setup Node.js globals for browser-like environment
if (typeof globalThis.localStorage === 'undefined') {
  const store = new Map<string, string>();
  globalThis.localStorage = {
    getItem: (key: string) => store.get(key) || null,
    setItem: (key: string, val: string) => store.set(key, String(val)),
    removeItem: (key: string) => store.delete(key),
    clear: () => store.clear(),
    key: (idx: number) => Array.from(store.keys())[idx] || null,
    length: 0,
  } as any;
}

import { ollaverseApi } from './src/services/ollaverseApi';
import { emailService } from './src/services/emailService';
import { configService } from './src/services/configService';
import { registrationService } from './src/services/registrationService';
import { TeamMember } from './src/types';

interface TestResult {
  suite: string;
  name: string;
  status: 'PASSED' | 'FAILED';
  details?: string;
}

const results: TestResult[] = [];

function assert(condition: boolean, suite: string, name: string, details?: string) {
  if (condition) {
    results.push({ suite, name, status: 'PASSED' });
    console.log(`  ✓ [${suite}] ${name}`);
  } else {
    results.push({ suite, name, status: 'FAILED', details });
    console.error(`  ✗ [${suite}] ${name} - FAILED: ${details || 'Assertion failed'}`);
  }
}

async function runTestSuite() {
  console.log('\n======================================================');
  console.log('🚀 RUNNING OLLAVERSE FULL END-TO-END TEST SUITE');
  console.log('======================================================\n');

  // -----------------------------------------------------------------
  // SUITE 1: System Initialization & Configuration
  // -----------------------------------------------------------------
  console.log('--- Suite 1: System Initialization & Configuration ---');
  const initialConfig = configService.getConfig();
  assert(!!initialConfig, 'Init', 'Event configuration loaded successfully');
  assert(initialConfig.venue === 'Nalanda Auditorium, VBIT', 'Init', 'Event venue matches specification');
  assert(initialConfig.eventDates === '29–30 OCTOBER 2026', 'Init', 'Event dates match 29-30 October 2026');
  assert(initialConfig.registrationOpen === true, 'Init', 'Registrations are open by default');
  assert(initialConfig.paymentQr1.upiId === 'datavedhi@oksbi', 'Init', 'Default UPI Option 1 configured');
  assert(initialConfig.paymentQr2.upiId === 'ollaverse.vbit@icici', 'Init', 'Default UPI Option 2 configured');

  // Check seed registrations
  const seeds = ollaverseApi.getRegistrations();
  assert(seeds.length >= 3, 'Init', `Default seed registrations exist (count: ${seeds.length})`);
  assert(seeds.some(s => s.registrationId === 'OLV-2026-1042'), 'Init', 'Seed OLV-2026-1042 exists');

  // -----------------------------------------------------------------
  // SUITE 2: Admin Authentication & Role Security
  // -----------------------------------------------------------------
  console.log('\n--- Suite 2: Admin Authentication & Role Security ---');
  // 2.1 Test invalid credentials
  const badAuth = await ollaverseApi.loginAdmin('invalid@vbit.ac.in', 'wrongpassword');
  assert(badAuth.success === false, 'Auth', 'Rejects non-existent email correctly');

  const wrongPasswordAuth = await ollaverseApi.loginAdmin('lenkaprabhathkumar07@gmail.com', 'badpass123');
  assert(wrongPasswordAuth.success === false, 'Auth', 'Rejects wrong password for Super Admin');

  // 2.2 Test valid Super Admin credentials
  const goodAuth = await ollaverseApi.loginAdmin('lenkaprabhathkumar07@gmail.com', '1234567890');
  assert(goodAuth.success === true, 'Auth', 'Super Admin authentication succeeds with salted SHA-256');
  assert(goodAuth.user?.role === 'SUPER ADMIN', 'Auth', 'Admin role is correctly identified as SUPER ADMIN');

  // 2.3 Verify session state
  const currentAdmin = ollaverseApi.getCurrentAdmin();
  assert(currentAdmin?.email === 'lenkaprabhathkumar07@gmail.com', 'Auth', 'Session persists active admin');

  // -----------------------------------------------------------------
  // SUITE 3: Dynamic Pricing & Cost Calculation
  // -----------------------------------------------------------------
  console.log('\n--- Suite 3: Dynamic Pricing & Cost Calculation ---');
  const price2 = configService.getPriceForTeamSize(2);
  const price3 = configService.getPriceForTeamSize(3);
  const price4 = configService.getPriceForTeamSize(4);
  assert(price2 > 0 && price3 > 0 && price4 > 0, 'Pricing', `Dynamic tier prices computed: 2->₹${price2}, 3->₹${price3}, 4->₹${price4}`);

  // -----------------------------------------------------------------
  // SUITE 4: Full Multi-Step Registration Journey
  // -----------------------------------------------------------------
  console.log('\n--- Suite 4: Multi-Step Squad Registration Flow ---');
  const teamLead: TeamMember = {
    fullName: 'Rahul Sharma',
    branch: 'CSE (AI & DS)',
    year: '3rd Year',
    rollNumber: '24P61A6701',
    whatsappNumber: '9876543210',
    email: 'rahul.sharma@vbithyd.ac.in',
  };

  const member2: TeamMember = {
    fullName: 'Sneha Patel',
    branch: 'CSE (AI & DS)',
    year: '3rd Year',
    rollNumber: '24P61A6715',
    whatsappNumber: '9876543211',
    email: 'sneha.patel@vbithyd.ac.in',
  };

  const member3: TeamMember = {
    fullName: 'Amit Verma',
    branch: 'IT',
    year: '3rd Year',
    rollNumber: '24P61A1208',
    whatsappNumber: '9876543212',
    email: 'amit.verma@vbithyd.ac.in',
  };

  const initialCount = ollaverseApi.getRegistrations().length;

  const newReg = registrationService.createRegistration({
    teamName: 'Quantum Hackers',
    teamSize: 3,
    amount: price3,
    teamLead,
    members: [member2, member3],
    payment: {
      amount: price3,
      status: 'PENDING',
      utr: '429988112233',
      paymentMethod: 'UPI Option 1 (Data Vedhi SBI)',
    },
  });

  assert(!!newReg, 'Registration', 'Registration successfully created');
  assert(newReg.registrationId.startsWith('OLV-2026-'), 'Registration', `Valid Registration ID format generated: ${newReg.registrationId}`);
  assert(newReg.verificationToken.startsWith('OLV-TK-'), 'Registration', `Valid Verification Token format generated: ${newReg.verificationToken}`);
  assert(newReg.payment.status === 'PENDING', 'Registration', 'Initial payment status is PENDING');
  assert(newReg.entry.verified === false, 'Registration', 'Initial entry verification status is false');
  assert(newReg.members.length === 2, 'Registration', 'Squad members properly saved');

  const afterCount = ollaverseApi.getRegistrations().length;
  assert(afterCount === initialCount + 1, 'Registration', `Total registrations incremented from ${initialCount} to ${afterCount}`);

  // -----------------------------------------------------------------
  // SUITE 5: Squad Pass Tracking & Token Verification
  // -----------------------------------------------------------------
  console.log('\n--- Suite 5: Squad Pass Tracking & Lookup ---');
  const fetchedById = registrationService.getById(newReg.registrationId);
  assert(fetchedById?.teamName === 'Quantum Hackers', 'Tracking', `Lookup by Registration ID (${newReg.registrationId}) matches`);

  const fetchedByToken = registrationService.getById(newReg.verificationToken);
  assert(fetchedByToken?.registrationId === newReg.registrationId, 'Tracking', `Lookup by Verification Token (${newReg.verificationToken}) matches`);

  const searchResults = registrationService.search(teamLead.rollNumber);
  assert(searchResults.some(r => r.registrationId === newReg.registrationId), 'Tracking', `Search by Team Lead Roll (${teamLead.rollNumber}) found`);

  const nonExistent = registrationService.getById('INVALID-ID-999');
  assert(nonExistent === undefined, 'Tracking', 'Lookup for non-existent ID gracefully returns undefined');

  // -----------------------------------------------------------------
  // SUITE 6: Admin Desk - Payment Verification & Status Transitions
  // -----------------------------------------------------------------
  console.log('\n--- Suite 6: Admin Payment Verification & Approval ---');
  const preVerifyStats = ollaverseApi.getPaymentStatistics();
  
  // Admin verifies payment
  const updatedReg = await registrationService.updatePaymentStatus(newReg.registrationId, 'VERIFIED', 'Admin Desk');
  assert(!!updatedReg, 'AdminPayment', 'Admin successfully updated payment status');
  assert(updatedReg?.payment.status === 'VERIFIED', 'AdminPayment', 'Payment status updated to VERIFIED in database');
  assert(!!updatedReg?.payment.verifiedAt, 'AdminPayment', 'VerifiedAt timestamp recorded');

  const postVerifyStats = ollaverseApi.getPaymentStatistics();
  assert(postVerifyStats.totalPaid === preVerifyStats.totalPaid + 1, 'AdminPayment', 'Payment analytics totalPaid count incremented');

  // -----------------------------------------------------------------
  // SUITE 7: On-Site Entry Verification & QR Scanner Check-in
  // -----------------------------------------------------------------
  console.log('\n--- Suite 7: On-Site Entry Scanner & Anti-Passback Check-in ---');
  // 7.1 First scan: Valid code -> Should successfully verify entry
  const firstScan = ollaverseApi.markEntryVerified(newReg.verificationToken, 'Gate 1 Scanner');
  assert(firstScan.success === true, 'EntryScanner', 'First scan allows gate entry');
  assert(firstScan.alreadyVerified === false, 'EntryScanner', 'First scan is not marked as duplicate');
  assert(firstScan.registration?.entry.verified === true, 'EntryScanner', 'Entry verification flag set to true');

  // 7.2 Second scan: Duplicate scan of already admitted attendee -> Anti-passback check
  const duplicateScan = ollaverseApi.markEntryVerified(newReg.verificationToken, 'Gate 2 Scanner');
  assert(duplicateScan.success === false, 'EntryScanner', 'Duplicate scan correctly blocked');
  assert(duplicateScan.alreadyVerified === true, 'EntryScanner', 'Anti-passback detects alreadyVerified = true');
  assert(!!duplicateScan.firstVerifiedAt, 'EntryScanner', 'Returns previous entry timestamp for security check');

  // 7.3 Invalid token scan -> Should reject invalid pass
  const invalidScan = ollaverseApi.markEntryVerified('FAKE-QR-CODE-TOKEN', 'Gate 1 Scanner');
  assert(invalidScan.success === false, 'EntryScanner', 'Fraudulent/Invalid QR code rejected');

  // Check entry stats
  const entryStats = ollaverseApi.getEntryStatistics();
  assert(entryStats.totalVerified >= 2, 'EntryScanner', `Entry statistics reflect verified check-ins (count: ${entryStats.totalVerified})`);

  // -----------------------------------------------------------------
  // SUITE 8: Email Outbox Simulator & Automated Notifications
  // -----------------------------------------------------------------
  console.log('\n--- Suite 8: Automated Email Notifications & Logs ---');
  const emailResult = await emailService.sendRegistrationConfirmation(newReg);
  assert(emailResult.success === true, 'Email', 'Automated registration email dispatched');
  
  const logs = emailService.getLogs();
  const targetLog = logs.find(l => l.registrationId === newReg.registrationId);
  assert(!!targetLog, 'Email', 'Email log saved in system outbox');
  assert(targetLog?.to === teamLead.email, 'Email', `Recipient matches lead email (${teamLead.email})`);
  assert(Boolean(targetLog?.subject.includes(newReg.registrationId)), 'Email', 'Subject contains unique Registration ID');
  assert(Boolean(targetLog?.bodyText.includes('Nalanda Auditorium')), 'Email', 'Body contains event venue');

  // -----------------------------------------------------------------
  // SUITE 9: Content & Guidelines Management
  // -----------------------------------------------------------------
  console.log('\n--- Suite 9: Dynamic Event Content & Settings Update ---');
  const originalTagline = ollaverseApi.getTagline();
  const testTagline = 'Build. Experiment. Create with Local AI — Powered by Data Vedhi';
  ollaverseApi.updateTagline(testTagline);
  assert(ollaverseApi.getTagline() === testTagline, 'Content', 'Admin can update live event tagline');
  // Revert
  ollaverseApi.updateTagline(originalTagline);

  // -----------------------------------------------------------------
  // SUMMARY REPORT
  // -----------------------------------------------------------------
  console.log('\n======================================================');
  console.log('📊 TEST EXECUTION SUMMARY');
  console.log('======================================================');
  const passed = results.filter(r => r.status === 'PASSED').length;
  const failed = results.filter(r => r.status === 'FAILED').length;
  const total = results.length;

  console.log(`Total Tests Run: ${total}`);
  console.log(`Passed:         ${passed} ✅`);
  console.log(`Failed:         ${failed} ❌`);
  console.log(`Success Rate:   ${((passed / total) * 100).toFixed(1)}%`);
  console.log('======================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTestSuite().catch(err => {
  console.error('Fatal error running test suite:', err);
  process.exit(1);
});
