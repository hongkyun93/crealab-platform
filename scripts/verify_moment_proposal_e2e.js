const { chromium } = require('playwright');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

// Setup Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const TEST_EMAIL = 'e2e_brand@test.com';
const TEST_PASSWORD = 'password123';

async function setupTestUser() {
    const { data: { user }, error } = await supabase.auth.admin.createUser({
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
        email_confirm: true,
        user_metadata: { role: 'brand', name: 'E2E Brand' }
    });
    let userId = user?.id;
    if (error && error.message.includes('already been registered')) {
        const { data: { users } } = await supabase.auth.admin.listUsers();
        userId = users.find(u => u.email === TEST_EMAIL).id;
        await supabase.auth.admin.updateUserById(userId, { password: TEST_PASSWORD });
    }
    await supabase.from('profiles').upsert({
        id: userId,
        email: TEST_EMAIL,
        role: 'brand',
        display_name: 'E2E Brand',
        is_mock: false
    });
    return userId;
}

(async () => {
    let browser;
    let page;
    try {
        await setupTestUser();

        browser = await chromium.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
        page = await context.newPage();

        // 1. Login
        console.log('1️⃣  Login...');
        await page.goto('http://localhost:3000/login');
        if (page.url().includes('/login')) {
            await page.getByRole('tab', { name: '브랜드' }).click();
            await page.waitForTimeout(500);
            await page.fill('#brand-id', TEST_EMAIL);
            await page.fill('#brand-pw', TEST_PASSWORD);
            // Click login
            const visibleLoginBtn = page.getByRole('button', { name: '로그인하기' }).locator('visible=true');
            if (await visibleLoginBtn.count() > 0) await visibleLoginBtn.click();
            else await page.locator('[value="brand"] button[type="submit"]').click();

            await page.waitForURL('http://localhost:3000/brand', { timeout: 15000 });
            console.log('   ✅ Login Successful');
        }

        // 2. Discover / Detail
        console.log('2️⃣  Navigate to Moment...');
        // Direct nav to a valid moment
        const { data: moment } = await supabase.from('life_moments').select('id').limit(1).single();
        if (!moment) throw new Error('No DB Moment found');

        await page.goto(`http://localhost:3000/event/${moment.id}`);
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(2000);

        console.log('3️⃣  On Page. Checking content...');
        // Debug screenshot
        await page.screenshot({ path: 'artifacts/step3_debug.png' });

        // Check for "Propose" button with WAITING
        console.log('   Waiting for Propose selector...');
        try {
            await page.waitForSelector('button:has-text("협업 제안하기")', { timeout: 5000 });
            console.log('   Found button!');
            await page.getByText('협업 제안하기').click();
        } catch (e) {
            console.error('   ❌ Button NOT found.');
            const text = await page.innerText('body');
            console.log('   [PAGE TEXT START]\n' + text.substring(0, 1000) + '\n   [PAGE TEXT END]');
            await page.screenshot({ path: 'artifacts/step3_fail.png' });
            throw e;
        }

        // 4. Form
        console.log('4️⃣  Filling Form...');
        // Wait for dialog
        await page.waitForSelector('#productName', { timeout: 5000 });

        await page.fill('#productName', 'E2E Product');
        await page.fill('#message', 'E2E Auto Proposal');
        const gumae = await page.locator('#compensation');
        if (await gumae.count() > 0) await gumae.fill('100000');

        // 5. Submit
        console.log('5️⃣  Submitting...');
        page.on('dialog', async d => await d.dismiss());

        const submitBtn = await page.locator('div[role="dialog"] button:has-text("발송"), div[role="dialog"] button:has-text("보내기"), div[role="dialog"] button:has-text("제안하기")').last();
        await submitBtn.click();

        await page.waitForTimeout(5000);
        console.log('✅ Success!');

    } catch (error) {
        console.error('❌ Failed:', error);
        process.exit(1);
    } finally {
        if (browser) await browser.close();
    }
})();
