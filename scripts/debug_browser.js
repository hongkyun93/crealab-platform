const { chromium } = require('playwright');
const path = require('path');

(async () => {
    console.log('Starting manual browser debug...');
    const browser = await chromium.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'] // Common flags for container environments
    });
    console.log('Browser launched.');

    try {
        const context = await browser.newContext();
        console.log('Context created.');

        const page = await context.newPage();
        console.log('Page created.');

        await page.goto('http://localhost:3000');
        console.log('Navigated to localhost:3000');

        const title = await page.title();
        console.log('Page title:', title);

        await page.screenshot({ path: 'debug_screenshot.png' });
        console.log('Screenshot taken.');

    } catch (error) {
        console.error('❌ Error during browser operations:', error);
    } finally {
        await browser.close();
        console.log('Browser closed.');
    }
})();
