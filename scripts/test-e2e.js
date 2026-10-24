import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const URL = 'http://127.0.0.1:5173';
const SCREENSHOTS_DIR = path.resolve('test-screenshots');

if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

async function runTests() {
  console.log('🚀 Launching browser with Edge at:', EDGE_PATH);
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });

  const page = await browser.newPage();
  const consoleErrors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  console.log(`🌐 Navigating to ${URL}...`);
  await page.goto(URL, { waitUntil: 'networkidle0', timeout: 30000 });

  // 1. Check title & meta
  const title = await page.title();
  console.log('📄 Page Title:', title);
  if (!title.includes('Resplandor ATL')) {
    throw new Error('Title does not match expected value: ' + title);
  }

  // 2. Desktop Screenshot
  await page.setViewport({ width: 1440, height: 900 });
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '01-desktop-hero.png') });
  console.log('📸 Desktop Hero screenshot saved.');

  // Full page desktop
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '02-desktop-full.png'), fullPage: true });
  console.log('📸 Desktop Full Page screenshot saved.');

  // 3. Tablet Viewport (768px)
  await page.setViewport({ width: 768, height: 1024 });
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '03-tablet.png'), fullPage: true });
  console.log('📸 Tablet (768px) screenshot saved.');

  // 4. Mobile Viewport (390px)
  await page.setViewport({ width: 390, height: 844 });
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '04-mobile-390.png') });
  console.log('📸 Mobile (390px) screenshot saved.');

  // 5. Test Mobile Menu Toggle
  console.log('📱 Testing Mobile Menu...');
  const hamburgerBtn = await page.$('button[aria-label="Open navigation menu"]');
  if (hamburgerBtn) {
    await hamburgerBtn.click();
    await new Promise((r) => setTimeout(r, 400));
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '05-mobile-menu-open.png') });
    console.log('📸 Mobile Menu Opened screenshot saved.');
  }

  // Switch back to desktop for interactive flows
  await page.setViewport({ width: 1440, height: 900 });

  // 6. Test Service Selection -> Booking Form
  console.log('💅 Testing Service "Book This Service" CTA...');
  const allButtons = await page.$$('button');
  for (const btn of allButtons) {
    const text = await btn.evaluate(el => el.textContent);
    if (text && text.includes('Book This Service')) {
      await btn.click();
      await new Promise((r) => setTimeout(r, 600));
      console.log('Found and clicked "Book This Service" button.');
      break;
    }
  }

  // 7. Test Gallery Lightbox
  console.log('🖼️ Testing Gallery Lightbox...');
  const galleryCard = await page.$('#gallery .cursor-pointer');
  if (galleryCard) {
    await galleryCard.click();
    await new Promise((r) => setTimeout(r, 600));
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '06-gallery-lightbox.png') });
    console.log('📸 Lightbox screenshot saved.');

    // Close lightbox via Escape key
    await page.keyboard.press('Escape');
    await new Promise((r) => setTimeout(r, 400));
    console.log('Lightbox closed via Escape key.');
  }

  // 8. Test FAQ Accordion
  console.log('❓ Testing FAQ Accordion...');
  const secondFaq = await page.$('button[aria-controls="answer-faq-2"]');
  if (secondFaq) {
    await secondFaq.click();
    await new Promise((r) => setTimeout(r, 400));
    console.log('FAQ item 2 toggled.');
  }

  // 9. Test Booking Form Validation
  console.log('📝 Testing Booking Form Validation...');
  // Scroll to booking form
  await page.evaluate(() => {
    document.querySelector('#booking').scrollIntoView();
  });
  await new Promise((r) => setTimeout(r, 500));

  // Click Submit with empty fields
  const submitBtn = await page.$('button[type="submit"]');
  if (submitBtn) {
    await submitBtn.click();
    await new Promise((r) => setTimeout(r, 500));
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '07-form-validation-errors.png') });
    console.log('📸 Form validation errors screenshot saved.');
  }

  // Fill in valid data
  console.log('✍️ Filling valid appointment request...');
  await page.type('#fullName', 'Valeria Gomez');
  await page.type('#phone', '(470) 555-2819');
  await page.select('#service', 'acrylic-sets');
  
  // Choose future date
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 3);
  const futureDateStr = futureDate.toISOString().split('T')[0];
  await page.evaluate((dateVal) => {
    const input = document.querySelector('#preferredDate');
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
    nativeInputValueSetter.call(input, dateVal);
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
  }, futureDateStr);

  await page.select('#nailShape', 'Almond');
  await page.select('#nailLength', 'Medium');
  await page.type('#notes', 'Would love glazed rose gold chrome finish for my birthday party!');

  // Submit valid form
  await submitBtn.click();
  await new Promise((r) => setTimeout(r, 600));
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '08-form-prepared-summary.png') });
  console.log('📸 Form Prepared Summary screenshot saved.');

  // Test copy button
  const updatedButtons = await page.$$('button');
  for (const b of updatedButtons) {
    const text = await b.evaluate(el => el.textContent);
    if (text && text.includes('Copy Request')) {
      await b.click();
      await new Promise((r) => setTimeout(r, 400));
      console.log('Copy Request clicked successfully.');
      break;
    }
  }

  console.log('\n--- Test Summary ---');
  console.log('Total Console Errors:', consoleErrors.length);
  if (consoleErrors.length > 0) {
    console.error('Console errors:', consoleErrors);
  }

  await browser.close();
  console.log('✅ All tests completed successfully!');
}

runTests().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
