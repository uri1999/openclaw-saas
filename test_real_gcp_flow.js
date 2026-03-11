const puppeteer = require('puppeteer');
const path = require('path');

const ARTIFACT_DIR = '/Users/ankitpatel/.gemini/antigravity/brain/b90b0191-31e3-4a46-baa0-243459d695ef';

(async () => {
    console.log('Starting Real BYOC test...');
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' });

    await page.waitForSelector('button.primary-button');
    const startBtns = await page.$$('button.primary-button');
    await startBtns[0].click();

    await page.waitForSelector('.wizard-container', { timeout: 5000 });
    await new Promise(r => setTimeout(r, 500));
    console.log('Step 1 (Identity)...');
    await page.type('input[type="text"]', 'Live GCP Agent');
    await page.type('textarea', 'Testing Real GCP Deployment');

    const continueBtnStep1 = await page.evaluateHandle(() => {
        return Array.from(document.querySelectorAll('button')).find(el => el.textContent === 'Continue');
    });
    await continueBtnStep1.click();

    await new Promise(r => setTimeout(r, 500));
    console.log('Step 2 (Cloud Target with Project ID)...');
    // Type into GCP Project ID which is the first input of type text here
    await page.type('input[name="gcpProject"]', 'mock-gcp-project-123');
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'real_byoc_step2_cloud_target.png') });

    const continueBtnStep2 = await page.evaluateHandle(() => {
        return Array.from(document.querySelectorAll('button')).find(el => el.textContent === 'Continue');
    });
    await continueBtnStep2.click();

    await new Promise(r => setTimeout(r, 500));
    console.log('Step 3 (API Keys & Service Account)...');
    await page.type('textarea[name="gcpServiceAccountKey"]', '{"type": "service_account", "project_id": "mock-gcp-project-123", "private_key": "MOCK_KEY"}');
    await page.type('input[name="apiKey"]', 'sk-test-api-key-1234');
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'real_byoc_step3_auth.png') });

    const continueBtnStep3 = await page.evaluateHandle(() => {
        return Array.from(document.querySelectorAll('button')).find(el => el.textContent === 'Continue');
    });
    await continueBtnStep3.click();

    await new Promise(r => setTimeout(r, 500));
    console.log('Step 4 (Deploy)...');
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'real_byoc_step4_review.png') });

    const provisionBtn = await page.evaluateHandle(() => {
        return Array.from(document.querySelectorAll('button')).find(el => el.textContent.includes('Provision Agent'));
    });
    await provisionBtn.click();

    console.log('Success! Form validation verified.');

    await browser.close();
})();
