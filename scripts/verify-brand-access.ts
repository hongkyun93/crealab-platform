import { chromium } from '@playwright/test';

const TARGET_URL = 'https://creadypick.vercel.app';

async function verifyBrandAccess() {
    console.log('🚀 Launching browser for Brand Verification...');
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();

    const uniqueId = `brand_${Date.now()}`;
    const email = `${uniqueId}@example.com`;
    const password = 'password1234';
    const brandName = 'VerifyBrand';

    try {
        console.log(`🚀 Starting Brand Signup: ${email}`);

        // 1. Signup as Brand
        await page.goto(`${TARGET_URL}/signup`);

        // Select Brand Role
        await page.click('button:has-text("브랜드")');

        await page.fill('#brand-name', brandName);
        await page.fill('#brand-email', email);
        await page.fill('#brand-pw', password);

        await page.click('button:has-text("이메일로 가입하기")');

        // Check result
        try {
            const success = page.waitForSelector('text=회원가입 이메일을 보냈습니다', { timeout: 15000 });
            await success;
            console.log(`  ✅ Signup successful.`);

            await page.waitForTimeout(2000); // Wait for redirect/toast
            await page.click('text=로그인 페이지로 이동');
        } catch (e) {
            console.error('  ❌ Signup failed or timeout.');
            await page.screenshot({ path: 'brand_signup_fail.png' });
            throw e;
        }

        // 2. Login
        await page.waitForTimeout(1000);
        if (!page.url().includes('/login')) {
            await page.goto(`${TARGET_URL}/login`);
        }

        await page.click('button:has-text("브랜드")');
        await page.fill('#brand-id', email);
        await page.fill('#brand-pw', password);
        await page.click('button:has-text("로그인하기")');

        await page.waitForURL(/.*\/brand/, { timeout: 15000 });
        console.log(`  ✅ Logged in as Brand.`);

        // 3. Verify Moments Visibility
        // Wait for moments to load
        console.log(`  👀 Checking for moments...`);
        await page.waitForTimeout(5000); // Give time for data fetch

        // Take a screenshot of the dashboard
        await page.screenshot({ path: 'brand_dashboard_view.png', fullPage: true });

        // Check for specific text that indicates moments are present
        // Creator accounts were: Creator_Beauty_1, Creator_Fashion_2, Creator_Food_3
        // Moments were titled: "Moment 1: 뷰티 Life", etc.

        const content = await page.content();
        let foundCount = 0;

        if (content.includes("뷰티 Life")) { console.log("    ✅ Found '뷰티 Life' moment."); foundCount++; }
        if (content.includes("패션 Life")) { console.log("    ✅ Found '패션 Life' moment."); foundCount++; }
        if (content.includes("푸드 Life")) { console.log("    ✅ Found '푸드 Life' moment."); foundCount++; }

        if (foundCount > 0) {
            console.log(`  ✨ SUCCESS: Found ${foundCount} test moments on Brand Dashboard.`);
        } else {
            console.error(`  ❌ FAILED: No test moments found. Check 'brand_dashboard_view.png'.`);
            // Check if there's a "No moments" message
            if (content.includes("등록된 모먼트가 없습니다")) {
                console.log("    ℹ️ Dashboard shows 'No moments' state.");
            }
        }

    } catch (e) {
        console.error('  ❌ Exception during verification:', e);
        await page.screenshot({ path: 'brand_verification_exception.png' });
    } finally {
        await browser.close();
    }
}

verifyBrandAccess();
