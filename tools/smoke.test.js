#!/usr/bin/env node
/* Simple puppeteer smoke test for eTax Mobile */
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const BASE = process.env.BASE_URL || 'http://localhost:3000';
const EVIDENCE_DIR = path.join(process.cwd(), 'evidence');

async function ensureDir(p){ await fs.promises.mkdir(p, { recursive: true }); }

async function assertText(page, text){
  await page.waitForFunction((t)=>document.body && document.body.innerText.includes(t), {}, text);
}

async function screenshot(page, name){
  await ensureDir(EVIDENCE_DIR);
  await page.screenshot({ path: path.join(EVIDENCE_DIR, name), fullPage: true });
}

async function run(){
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox','--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  page.setDefaultTimeout(30000);

  // 1) Login page
  await page.goto(`${BASE}/login`, { waitUntil: 'networkidle2' });
  await assertText(page, 'eTax Mobile');
  await screenshot(page, 'login.png');

  // Fill and submit login (localStorage fallback data)
  await page.type('#mst-input', '00109202830');
  await page.type('#password-input', '123456');
  await page.click('button[type="submit"]');
  // Wait for redirect to home
  await assertText(page, 'Chức năng hay dùng');
  await screenshot(page, 'home.png');

  // 2) Open drawer
  await page.click('button[aria-label="Mở menu điều hướng"]');
  await assertText(page, 'Hoá đơn điện tử');
  await screenshot(page, 'drawer.png');

  // 3) Move to three child pages
  await page.goto(`${BASE}/tra-cuu-nghia-vu-thue`, { waitUntil: 'networkidle2' });
  await assertText(page, 'Tra cứu nghĩa vụ thuế');
  await screenshot(page, 'nghia-vu.png');

  await page.goto(`${BASE}/tra-cuu-chung-tu`, { waitUntil: 'networkidle2' });
  await assertText(page, 'Tra cứu chứng từ');
  // Fill dates (inputs already have defaults but we assert typing works)
  const inputs = await page.$$('input');
  if (inputs[1]) { await inputs[1].click({ clickCount: 3 }); await inputs[1].type('10/10/2025'); }
  if (inputs[2]) { await inputs[2].click({ clickCount: 3 }); await inputs[2].type('10/10/2025'); }
  // Click Tra cứu
  await page.evaluate(() => {
    const btns=[...document.querySelectorAll('button')];
    const b=btns.find(el=>el.textContent && el.textContent.trim().includes('Tra cứu'));
    if(b) (b).click();
  });
  // Wait for table or message
  await assertText(page, 'In chứng từ');
  await screenshot(page, 'chung-tu.png');
  // Open print modal via main button at bottom
  await page.evaluate(() => {
    const btns=[...document.querySelectorAll('button')];
    const b=btns.reverse().find(el=>el.textContent && el.textContent.trim()==='In chứng từ');
    if(b) (b).click();
  });
  await assertText(page, 'Xác nhận in chứng từ');
  await screenshot(page, 'chung-tu-print-modal.png');
  // Confirm -> open viewer
  await page.evaluate(() => {
    const btns=[...document.querySelectorAll('button')];
    const b=btns.find(el=>el.textContent && el.textContent.trim()==='Đồng ý');
    if(b) (b).click();
  });
  await assertText(page, 'Done');
  await screenshot(page, 'chung-tu-viewer.png');

  await page.goto(`${BASE}/thong-bao`, { waitUntil: 'networkidle2' });
  await assertText(page, 'Thông báo');
  await screenshot(page, 'thong-bao.png');

  await browser.close();
  console.log('Smoke test passed. Evidence saved to:', EVIDENCE_DIR);
}

run().catch((err)=>{ console.error(err); process.exit(1); });
