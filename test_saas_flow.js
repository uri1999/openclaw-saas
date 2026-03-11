const puppeteer = require('puppeteer');
const path = require('path');

const ARTIFACT_DIR = '/Users/ankitpatel/.gemini/antigravity/brain/b90b0191-31e3-4a46-baa0-243459d695ef';

(async () => {
    console.log('Starting puppeteer script...');
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.setViewport({ width: 1280, height: 800 });
    console.log('Navigating to landing page...');
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' });

    await page.waitForSelector('button.primary-button');
    const startBtns = await page.$$('button.primary-button');
    await startBtns[0].click();

    await page.waitForSelector('.wizard-container', { timeout: 5000 });
    await new Promise(r => setTimeout(r, 500));
    console.log('Step 1...');
    await page.type('input[type="text"]', 'Enterprise Agent');
    await page.type('textarea', 'Test Purpose');

    const continueBtnStep1 = await page.evaluateHandle(() => {
        return Array.from(document.querySelectorAll('button')).find(el => el.textContent === 'Continue');
    });
    await continueBtnStep1.click();

    await new Promise(r => setTimeout(r, 500));
    console.log('Step 2...');
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'saas_step2.png') });

    const continueBtnStep2 = await page.evaluateHandle(() => {
        return Array.from(document.querySelectorAll('button')).find(el => el.textContent === 'Continue');
    });
    await continueBtnStep2.click();

    await new Promise(r => setTimeout(r, 500));
    console.log('Step 3...');
    const continueBtnStep3 = await page.evaluateHandle(() => {
        return Array.from(document.querySelectorAll('button')).find(el => el.textContent === 'Continue');
    });
    await continueBtnStep3.click();

    await new Promise(r => setTimeout(r, 500));
    console.log('Step 4...');
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'saas_step4_review.png') });

    const provisionBtn = await page.evaluateHandle(() => {
        return Array.from(document.querySelectorAll('button')).find(el => el.textContent.includes('Provision Agent'));
    });
    await provisionBtn.click();

    console.log('Waiting for backend...');
    await page.waitForFunction(() => {
        return document.body.innerText.includes('Agent Successfully Provisioned');
    }, { timeout: 10000 });

    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'saas_success.png') });
    console.log('Success! Screenshots saved.');

    await browser.close();
})();
