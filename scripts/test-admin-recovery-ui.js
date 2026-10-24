import puppeteer from 'puppeteer-core';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const ADMIN_URL = 'http://127.0.0.1:5173/#admin';

async function runAdminLoginUITests() {
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.goto(ADMIN_URL, { waitUntil: 'networkidle2' });
    await page.waitForFunction(() => document.body.innerText.includes('Salon Admin Portal'));

    const pageText = await page.evaluate(() => document.body.innerText);
    if (/forgot (email|password)|demo admin credentials|resplandor2026!|resplandor-atl-owner-key-2026/i.test(pageText)) {
      throw new Error('Removed demo credentials or account recovery options are still visible.');
    }

    const loginControls = await page.$$eval('input', (inputs) => inputs.length);
    if (loginControls !== 2 || !/log in to dashboard/i.test(pageText)) {
      throw new Error('Admin username, password, or login controls are missing.');
    }

    console.log('Admin login UI verified: no demo credentials or recovery options are shown.');
  } finally {
    await browser.close();
  }
}

runAdminLoginUITests().catch((err) => {
  console.error('Admin login UI test failed:', err);
  process.exit(1);
});
