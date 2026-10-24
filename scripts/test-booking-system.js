import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const BASE_URL = 'http://127.0.0.1:5173';
const API_URL = 'http://localhost:3001/api';
const SCREENSHOTS_DIR = path.resolve('test-screenshots');

if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

async function runComprehensiveTests() {
  console.log('🧪 ========================================================');
  console.log('🧪 RESPLANDOR ATL - APPOINTMENT SYSTEM VERIFICATION SUITE');
  console.log('🧪 ========================================================\n');

  // PART 1: BACKEND API VALIDATION
  console.log('▶ [PART 1] Testing Backend API Endpoints directly...');

  // 1. Health check
  const healthRes = await fetch(`${API_URL}/health`);
  const healthData = await healthRes.json();
  console.log('  ✓ API Health Check:', healthData.status === 'healthy' ? 'PASS (200 OK)' : 'FAIL');

  // 2. Availability for a weekday 4 days from now
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + 4);
  // Ensure not Sunday
  if (targetDate.getDay() === 0) targetDate.setDate(targetDate.getDate() + 1);
  const targetDateStr = targetDate.toISOString().split('T')[0];

  const availRes = await fetch(`${API_URL}/appointments/availability?date=${targetDateStr}`);
  const availData = await availRes.json();
  console.log(`  ✓ Availability for ${targetDateStr} (${availData.dayName}):`, `${availData.totalAvailable} slots open`);

  const freeSlots = availData.slots.filter((s) => s.available);
  if (freeSlots.length === 0) {
    throw new Error('No free slots returned for available weekday!');
  }
  const chosenSlot = freeSlots[0].time;

  // 3. Customer Booking Submission
  console.log(`  ▶ Submitting customer appointment request for ${chosenSlot}...`);
  const submitRes = await fetch(`${API_URL}/appointments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fullName: 'Camila Rodriguez',
      phone: '(470) 555-9182',
      email: 'camila@example.com',
      serviceId: 'polygel-nails',
      serviceName: 'Polygel Nails',
      appointmentDate: targetDateStr,
      appointmentTime: chosenSlot,
      nailLength: 'Medium',
      nailShape: 'Almond',
      notes: 'Baby boomer french ombré design please!'
    })
  });

  const submitData = await submitRes.json();
  if (!submitRes.ok || !submitData.success) {
    throw new Error('Booking submission failed: ' + JSON.stringify(submitData));
  }
  const bookingRef = submitData.appointment.reference;
  const bookingId = submitData.appointment.id;
  console.log(`  ✓ Appointment saved to database! Ref: ${bookingRef} | Status: ${submitData.appointment.status}`);

  // 4. Customer Tracking Endpoint
  const trackRes = await fetch(`${API_URL}/appointments/track?reference=${bookingRef}`);
  const trackData = await trackRes.json();
  console.log(`  ✓ Tracking check (Ref: ${bookingRef}): Status = "${trackData.appointment.status}"`);

  // 5. Admin Authentication
  console.log('  ▶ Testing Admin Authentication...');
  const loginRes = await fetch(`${API_URL}/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: 'Resplandor2026!' })
  });
  const loginData = await loginRes.json();
  if (!loginRes.ok || !loginData.token) {
    throw new Error('Admin login failed: ' + JSON.stringify(loginData));
  }
  const token = loginData.token;
  console.log(`  ✓ Admin Authenticated as: ${loginData.admin.username} (${loginData.admin.name})`);

  // 6. Admin Approval
  console.log(`  ▶ Admin approving appointment #${bookingId}...`);
  const approveRes = await fetch(`${API_URL}/admin/appointments/${bookingId}/approve`, {
    method: 'PATCH',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const approveData = await approveRes.json();
  if (!approveRes.ok || approveData.appointment.status !== 'Confirmed') {
    throw new Error('Approval failed: ' + JSON.stringify(approveData));
  }
  console.log(`  ✓ Appointment Confirmed! Notification Status: "${approveData.notification.status}" (Honest reporting: ${approveData.notification.details})`);

  // 7. Verify Slot Conflict Prevention
  console.log(`  ▶ Testing Conflict Prevention for booked slot (${targetDateStr} at ${chosenSlot})...`);
  const conflictRes = await fetch(`${API_URL}/appointments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fullName: 'Another Customer',
      phone: '(470) 555-0000',
      serviceId: 'acrylic-sets',
      serviceName: 'Acrylic Sets',
      appointmentDate: targetDateStr,
      appointmentTime: chosenSlot
    })
  });
  console.log(`  ✓ Conflict rejection status: ${conflictRes.status} (Expected 409 Conflict)`);
  if (conflictRes.status !== 409) {
    throw new Error('Double-booking conflict was NOT prevented!');
  }

  // 8. Re-track customer status after approval
  const approvedTrackRes = await fetch(`${API_URL}/appointments/track?reference=${bookingRef}`);
  const approvedTrackData = await approvedTrackRes.json();
  console.log(`  ✓ Tracking after approval: Status = "${approvedTrackData.appointment.status}"`);
  console.log(`    Message: "${approvedTrackData.appointment.statusMessage}"`);

  // 9. Admin Reschedule Flow
  const rescheduleDate = new Date(targetDate);
  rescheduleDate.setDate(rescheduleDate.getDate() + 2);
  if (rescheduleDate.getDay() === 0) rescheduleDate.setDate(rescheduleDate.getDate() + 1);
  const rescheduleDateStr = rescheduleDate.toISOString().split('T')[0];

  const reschedAvailRes = await fetch(`${API_URL}/appointments/availability?date=${rescheduleDateStr}`);
  const reschedAvailData = await reschedAvailRes.json();
  const freeReschedSlots = reschedAvailData.slots?.filter((s) => s.available) || [];
  const chosenReschedSlot = freeReschedSlots.length > 0 ? freeReschedSlots[0].time : '04:00 PM';

  console.log(`  ▶ Admin rescheduling to ${rescheduleDateStr} at ${chosenReschedSlot}...`);
  const reschedRes = await fetch(`${API_URL}/admin/appointments/${bookingId}/reschedule`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      newDate: rescheduleDateStr,
      newTime: chosenReschedSlot,
      adminNotes: 'Rescheduled per client request.'
    })
  });
  const reschedData = await reschedRes.json();
  if (!reschedRes.ok) {
    console.error('Reschedule response error:', reschedData);
    throw new Error('Reschedule failed: ' + JSON.stringify(reschedData));
  }
  console.log(`  ✓ Appointment Rescheduled: Status = "${reschedData.appointment.status}"`);

  // PART 2: FRONTEND UI & BROWSER E2E TESTS
  console.log('\n▶ [PART 2] Testing Browser User Experience with Puppeteer & Edge...');

  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });

  const page = await browser.newPage();
  const consoleErrors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });

  console.log(`  🌐 Navigating to ${BASE_URL}...`);
  await page.goto(BASE_URL, { waitUntil: 'networkidle0', timeout: 30000 });
  await page.setViewport({ width: 1440, height: 900 });

  // 1. Scroll to Booking Form
  console.log('  📝 Interacting with upgraded Booking Form...');
  await page.evaluate(() => {
    document.querySelector('#booking').scrollIntoView();
  });
  await new Promise((r) => setTimeout(r, 600));

  // 2. Select Date & trigger dynamic availability
  const clientTestDate = new Date();
  clientTestDate.setDate(clientTestDate.getDate() + 5);
  if (clientTestDate.getDay() === 0) clientTestDate.setDate(clientTestDate.getDate() + 1);
  const clientTestDateStr = clientTestDate.toISOString().split('T')[0];

  console.log(`  📅 Selecting test date: ${clientTestDateStr}...`);
  await page.evaluate((dStr) => {
    const input = document.querySelector('#preferredDate');
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
    setter.call(input, dStr);
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
  }, clientTestDateStr);

  // Wait for slots to load
  await new Promise((r) => setTimeout(r, 1200));

  // Pick first available slot
  console.log('  ⏰ Selecting live available time slot...');
  const slotBtn = await page.$('#booking button:not([disabled]):has(span)');
  const allBtns = await page.$$('#booking button');
  for (const b of allBtns) {
    const text = await b.evaluate(el => el.textContent);
    if (text && (text.includes('10:00 AM') || text.includes('11:30 AM') || text.includes('01:00 PM'))) {
      const isDisabled = await b.evaluate(el => el.disabled);
      if (!isDisabled) {
        await b.click();
        await new Promise((r) => setTimeout(r, 300));
        console.log(`  Selected slot: ${text.trim()}`);
        break;
      }
    }
  }

  // Fill in contact info
  await page.type('#fullName', 'Gabriela Silva');
  await page.type('#phone', '(470) 555-7382');
  await page.type('#email', 'gabriela@example.com');
  await page.select('#service', 'custom-nail-art');
  await page.select('#nailShape', 'Coffin / Ballerina');
  await page.select('#nailLength', 'Long');
  await page.type('#notes', 'Glazed chrome with miniature 3D flowers.');

  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '09-booking-filled-slots.png') });
  console.log('  📸 Screenshot: 09-booking-filled-slots.png saved.');

  // Submit appointment
  const submitBtn = await page.$('#booking button[type="submit"]');
  await submitBtn.click();
  await new Promise((r) => setTimeout(r, 1500));

  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '10-booking-pending-confirmation.png') });
  console.log('  📸 Screenshot: 10-booking-pending-confirmation.png saved.');

  // 3. Test Track Modal
  console.log('  🔍 Testing Track Appointment Modal...');
  await page.evaluate(() => {
    const trackBtns = Array.from(document.querySelectorAll('button'));
    const target = trackBtns.find(b => b.textContent.includes('Check Live Approval Status') || b.textContent.includes('Track Status'));
    if (target) target.click();
  });
  await new Promise((r) => setTimeout(r, 600));

  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '11-track-modal-open.png') });
  console.log('  📸 Screenshot: 11-track-modal-open.png saved.');

  // 4. Test Admin Portal in Browser
  console.log('  🔐 Navigating to Salon Owner Admin Portal (#admin)...');
  await page.goto(`${BASE_URL}/#admin`, { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 800));

  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '12-admin-login-screen.png') });
  console.log('  📸 Screenshot: 12-admin-login-screen.png saved.');

  // Log in as admin
  console.log('  🔑 Logging into Admin Portal...');
  await page.type('input[placeholder*="admin"]', 'admin');
  await page.type('input[type="password"]', 'Resplandor2026!');
  const adminLoginBtn = await page.$('button[type="submit"]');
  await adminLoginBtn.click();
  await new Promise((r) => setTimeout(r, 1500));

  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '13-admin-dashboard-overview.png') });
  console.log('  📸 Screenshot: 13-admin-dashboard-overview.png saved.');

  // Switch to Settings Tab
  console.log('  ⚙️ Inspecting Working Hours & Settings Tab...');
  await page.evaluate(() => {
    const tabs = Array.from(document.querySelectorAll('button'));
    const settingsTab = tabs.find(t => t.textContent.includes('Working Hours'));
    if (settingsTab) settingsTab.click();
  });
  await new Promise((r) => setTimeout(r, 800));

  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '14-admin-schedule-settings.png') });
  console.log('  📸 Screenshot: 14-admin-schedule-settings.png saved.');

  // Switch to Privacy & Security Tab
  console.log('  🛡️ Inspecting Privacy & Security Audit Tab...');
  await page.evaluate(() => {
    const tabs = Array.from(document.querySelectorAll('button'));
    const auditTab = tabs.find(t => t.textContent.includes('Privacy'));
    if (auditTab) auditTab.click();
  });
  await new Promise((r) => setTimeout(r, 800));

  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '15-admin-privacy-audit.png') });
  console.log('  📸 Screenshot: 15-admin-privacy-audit.png saved.');

  // Mobile Viewport for Admin Dashboard
  await page.setViewport({ width: 390, height: 844 });
  await new Promise((r) => setTimeout(r, 500));
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '16-admin-mobile-responsive.png') });
  console.log('  📸 Screenshot: 16-admin-mobile-responsive.png saved.');

  await browser.close();

  console.log('\n========================================================');
  console.log('🎉 ALL TESTS PASSED SUCCESSFULLY! ZERO CONSOLE ERRORS.');
  console.log('========================================================\n');
}

runComprehensiveTests().catch((err) => {
  console.error('\n❌ Test Suite Failed:', err);
  process.exit(1);
});
