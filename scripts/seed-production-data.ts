import { chromium } from '@playwright/test';

const TARGET_URL = 'https://creadypick.vercel.app';
const ACCOUNT_COUNT = 3;
const MOMENTS_PER_ACCOUNT = 2;

// Realistic Data Generators
const CATEGORIES = [
    '뷰티', '패션', '푸드', '리빙/인테리어', '여행',
    '육아', '반려동물', 'IT/테크', '게임', '교육',
    '운동/건강', '문화/예술', '음악', '댄스', '연기',
    '일상/브이로그', '유머', '자동차', '금융/재테크', '기타'
];

function getProfileData(category: string, index: number) {
    const bios = {
        '뷰티': "💄 메이크업 아티스트 & 뷰티 크리에이터. 퍼스널 컬러 진단 및 데일리 메이크업 튜토리얼을 공유합니다.",
        '패션': "👗 OOTD & 데일리룩 아카이브. 미니멀리즘과 스트릿 패션을 사랑하는 패션 블로거입니다.",
        '푸드': "🍳 홈쿡 & 맛집 탐방. 누구나 쉽게 따라할 수 있는 레시피와 숨은 맛집을 소개해요.",
        '리빙/인테리어': "🏡 내 집 꾸미기 & 홈스타일링. 아늑한 공간을 만드는 인테리어 꿀팁을 공유합니다.",
        '여행': "✈️ 세계 여행자. 낯선 곳에서의 설렘과 여행 팁을 기록합니다.",
        '육아': "👶 현실 육아 일기. 아이와 함께 성장하는 엄마표 놀이와 육아템 리뷰.",
        '반려동물': "🐶 댕댕이와의 행복한 일상. 강아지 훈련 팁과 애견 동반 장소 추천.",
        'IT/테크': "💻 IT 기기 얼리어답터. 최신 테크 뉴스 리뷰와 언박싱.",
        '게임': "🎮 종합 게임 스트리머. 신작 게임 리뷰와 공략, 재미있는 플레이 하이라이트.",
        '교육': "📚 자기계발 & 공부 자극. 효율적인 공부법과 생산성 향상 팁.",
        '운동/건강': "🏋️ 오운완 & 식단 기록. 건강한 라이프스타일과 운동 루틴 공유.",
        '문화/예술': "🎨 전시 & 공연 리뷰. 영감을 주는 예술과 문화를 소개합니다.",
        '음악': "🎵 인디 음악 추천 & 플레이리스트. 감성 충만한 음악 이야기를 나눕니다.",
        '댄스': "💃 댄스 커버 & 안무 창작. K-POP 댄스와 스트릿 댄스 영상.",
        '연기': "🎭 배우 지망생의 연기 연습 일지. 독백 영상과 촬영 현장 스케치.",
        '일상/브이로그': "📹 소소한 일상 기록. 평범한 하루 속 특별한 순간들을 담습니다.",
        '유머': "🤣 웃음 폭탄 & 밈 모음. 일상의 재미있는 순간들을 공유해요.",
        '자동차': "🚗 자동차 시승기 & 드라이브 코스. 차를 사랑하는 모든 이들을 위한 공간.",
        '금융/재테크': "💰 사회초년생 재테크 & 주식 투자. 경제적 자유를 향한 여정.",
        '기타': "✨ 자유로운 영혼의 잡화점. 다양한 관심사와 취미를 공유합니다."
    };

    return {
        name: `Creator_${category}_${index + 1}`,
        handle: `@creator_${category}_${index + 1}`.toLowerCase(),
        bio: (bios as any)[category] || `열정적인 ${category} 크리에이터입니다!`
    };
}

async function seed() {
    console.log('🚀 Launching browser...');
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();

    console.log(`🚀 Starting production seed on ${TARGET_URL}`);

    for (let i = 0; i < ACCOUNT_COUNT; i++) {
        const page = await context.newPage();
        const uniqueId = `seed_${Date.now()}_${i}`;
        const email = `${uniqueId}@example.com`;
        const password = 'password1234';

        const category = CATEGORIES[i % CATEGORIES.length];
        const profile = getProfileData(category, i);

        console.log(`[${i + 1}/${ACCOUNT_COUNT}] Processing: ${email} (${category})`);

        try {
            // Setup strict dialog handling once per page
            page.on('dialog', async dialog => {
                console.log(`    🔔 Alert: ${dialog.message()}`);
                await dialog.accept();
            });

            // 1. Signup
            await page.goto(`${TARGET_URL}/signup`);

            await page.click('button:has-text("크리에이터")');

            await page.fill('#creator-name', profile.name);
            await page.fill('#creator-email', email);
            await page.fill('#creator-pw', password);

            await page.click('button:has-text("이메일로 가입하기")');

            // Check result
            try {
                const success = page.waitForSelector('text=회원가입 이메일을 보냈습니다', { timeout: 15000 });
                const error = page.waitForSelector('.text-red-500', { timeout: 15000 });

                await Promise.race([success, error]);

                if (await page.isVisible('.text-red-500')) {
                    const errorText = await page.innerText('.text-red-500');
                    console.error(`  ❌ Signup Failed: ${errorText}`);

                    if (errorText.includes("Too many requests") || errorText.includes("limit")) {
                        console.error("  ⚠️ RATE LIMIT HIT. Waiting 60 seconds...");
                        await new Promise(r => setTimeout(r, 60000));
                        i--; // Retry this index
                        continue;
                    }

                    await page.screenshot({ path: `signup_error_${i}.png` });
                    await page.close();
                    continue;
                }

                console.log(`  ✅ Signup successful. Attempting login...`);
                await page.waitForTimeout(2000);
                await page.click('text=로그인 페이지로 이동');

            } catch (e) {
                console.log('  ℹ️ Timeout waiting for result. checking page text...');
                const bodyText = await page.innerText('body');
                console.log(`  📄 Page Text Dump: ${bodyText.substring(0, 200)}...`);
                await page.screenshot({ path: `signup_timeout_${i}.png` });

                if (page.url().includes('/signup')) {
                    console.error('  ❌ Stuck on signup page (Response took > 15s).');
                    await page.close();
                    continue;
                }
            }

            // 2. Login
            await page.waitForTimeout(2000);
            if (!page.url().includes('/login')) {
                await page.goto(`${TARGET_URL}/login`);
            }

            await page.click('button:has-text("크리에이터")');
            await page.fill('#creator-id', email);
            await page.fill('#creator-pw', password);
            await page.click('button:has-text("로그인하기")');

            // Wait for dashboard
            try {
                await page.waitForURL(/.*\/creator/, { timeout: 10000 });
                console.log(`  ✅ Logged in.`);
            } catch (e) {
                console.error(`  ❌ Login failed. Verification might still be ON.`);
                await page.screenshot({ path: `login_fail_${i}.png` });
                await page.close();
                if (i === 0) break;
                continue;
            }

            // 2.5 Profile Setup
            console.log(`  🎨 Setting up profile...`);
            await page.goto(`${TARGET_URL}/creator/settings`);

            // Handle
            await page.fill('#handle', profile.handle);
            // Bio
            await page.fill('#bio', profile.bio);
            // Save
            // Dialog handler is already set up at the top
            await page.click('button:has-text("저장하기")');

            // Wait for redirect to dashboard (any domain)
            await page.waitForURL(/.*\/creator/);
            console.log(`    - Profile Updated.`);

            // 3. Create Moments
            for (let m = 0; m < MOMENTS_PER_ACCOUNT; m++) {
                await page.goto(`${TARGET_URL}/creator/new`);

                await page.fill('#title', `FIXED_DATE Moment ${m + 1}: ${category} Life`);
                await page.click(`button:has-text("${category}")`);
                await page.fill('input[placeholder*="광고 진행이 가능한"]', 'Sample Product');

                const months = ["12월"]; // Force December for top visibility
                const randomMonth = months[0];
                await page.click(`.grid-cols-3 >> nth=0 >> button:has-text("${randomMonth}")`);

                if (m === 0) {
                    await page.click('label:has-text("업로드 일정 협의 가능")');
                } else {
                    const randomPostingMonth = months[Math.floor(Math.random() * months.length)];
                    await page.click(`.grid-cols-3 >> nth=1 >> button:has-text("${randomPostingMonth}")`);
                }

                await page.fill('#description', `Generated moment for ${category}. Testing production verification.`);

                await page.fill('#description', `Generated moment for ${category}. Testing production verification.`);

                // Dialog handler is already set up at the top
                await page.click('button:has-text("모먼트 등록하기")');

                // Wait for potential redirect OR just wait a bit if it stays on page (spa)
                try {
                    await page.waitForURL(/.*\/creator/, { timeout: 15000 });
                } catch (e) {
                    console.log("    ⚠️ Redirect timeout. Check if moment was actually created or if just slow.");
                }
                console.log(`    - Moment ${m + 1} creation attempt finished.`);
            }

            console.log(`  👋 Logged out.`);

        } catch (e) {
            console.error(`  ❌ Exception for account ${i}:`, e);
            await page.screenshot({ path: `exception_${i}.png` });
        } finally {
            await page.close();
            // Rate limiting protection: Wait 5 seconds between accounts
            console.log(`  ⏳ Waiting 5s before next account...`);
            await new Promise(r => setTimeout(r, 5000));
        }
    }

    await browser.close();
    console.log('✨ Seeding complete/stopped.');
}

seed();
