import { chromium, BrowserContext, Page } from '@playwright/test';

// Configuration
const TARGET_URL = 'http://localhost:3000';
const HEADLESS = true; // Set to false to watch it happen

// --- REALISTIC DATA GENERATORS ---

const NAMES_KOREAN = [
    '김서연', '이준호', '박지민', '최수빈', '정민재', '강하은', '조우진', '윤서아', '임도현', '한지우',
    '오현석', '서예진', '신동혁', '구미영', '권태준', '황보라', '송민호', '전소미', '류승룡', '백지영'
];

const NICHES = [
    { category: '뷰티', key: 'beauty', keywords: ['메이크업', '스킨케어', '퍼스널컬러'] },
    { category: '패션', key: 'fashion', keywords: ['OOTD', '데일리룩', '하객룩'] },
    { category: '푸드', key: 'food', keywords: ['홈카페', '맛집탐방', '비건레시피'] },
    { category: '리빙', key: 'living', keywords: ['데스크테리어', '자취꿀템', '플랜테리어'] },
    { category: '테크', key: 'tech', keywords: ['IT기기', '데스크셋업', '얼리어답터'] }
];

const MOMENT_TEMPLATES = {
    beauty: [
        { title: "환절기 뒤집어진 피부 복구 루틴 🚑", product: "진정 앰플, 수분 크림", desc: "환절기만 되면 붉어지는 피부 고민이신 분들? 제가 정착한 3단계 진정 루틴 공유해요. 협찬 환영합니다!" },
        { title: "웜톤 찰떡 MLBB 립 조합 추천 💄", product: "틴트, 립스틱", desc: "가을 웜톤 인생립 5종 발색 비교 영상 준비 중입니다. 신상 립 제품 협찬 제안주세요." }
    ],
    fashion: [
        { title: "키 160cm 비율 좋아보이는 코디법 👗", product: "슬랙스, 부츠", desc: "키작녀들을 위한 비율 깡패 코디 꿀팁! 다리 길어보이는 바지 핏 찾는 법. 의류 브랜드 연락 기다립니다." },
        { title: "대학생 개강총회 꾸안꾸 룩북 🎒", product: "에코백, 가디건", desc: "너무 튀지는 않지만 센스있는 캠퍼스룩. 가방이나 악세서리 협찬 받아서 스타일링 해보고 싶어요." }
    ],
    food: [
        { title: "홈카페 감성, 라떼아트 도전기 ☕️", product: "원두, 머신, 유리컵", desc: "집에서도 카페처럼! 홈카페 영상에 퀄리티를 더해줄 원두나 예쁜 컵 브랜드 찾고 있습니다." },
        { title: "다이어트 중에도 먹을 수 있는 속세맛 레시피 🥗", product: "닭가슴살, 제로소스", desc: "맛없는 닭가슴살은 이제 그만. 맛있게 식단 관리하는 팁 공유합니다. 식품 브랜드 협업 환영해요." }
    ],
    living: [
        { title: "3평 원룸, 공간 분리 인테리어 꿀팁 🏠", product: "파티션, 조명, 러그", desc: "좁은 방도 넓게 쓰는 가구 배치 노하우. 자취생 필수템 협찬 받아 리얼하게 리뷰해드립니다." },
        { title: "식물킬러도 키우기 쉬운 반려식물 추천 🌿", product: "화분, 식물영양제", desc: "플랜테리어 입문자들을 위한 식물 추천 가이드. 식물이나 가드닝 용품 브랜드 연락 주세요!" }
    ],
    tech: [
        { title: "맥북 프로, 3년 사용 찐후기 (vs 에어) 💻", product: "노트북 거치대, 허브", desc: "업무 효율 높여주는 데스크 셋업 아이템 소개 영상 기획 중입니다. 데스크테리어 소품 브랜드 찾아요." },
        { title: "삶의 질 수직상승! 로봇청소기 비교 리뷰 🤖", product: "로봇청소기, 가전", desc: "내돈내산 쓰다가 기변 고민중입니다. 최신 가전 제품 꼼꼼하게 비교 리뷰 가능합니다." }
    ]
};

// --- BRAND DATA ---
const BRAND_NAMES = [
    'Lumiere Cosmetics', 'Urban Flow', 'Green Table', 'Cozy House', 'TechNova',
    'Pure Nature', 'Daily Fit', 'Seoul Snack', 'Modern Desk', 'Blue Wave',
    'Cotton Cloud', 'Fresh Morning', 'Vivid Color', 'Slow Life', 'Golden Brew',
    'Silver Tech', 'Soft Touch', 'Happy Vegan', 'Smart Gear', 'Royal Pet'
];

const CAMPAIGN_TEMPLATES = [
    { title: "SS 시즌 신상 립 틴트 런칭 캠페인", budget: "100만원", product: "글로우 틴트" },
    { title: "프리미엄 비건 스킨케어 체험단 모집", budget: "50만원", product: "비건 토너" },
    { title: "데스크테리어 필수템, 모니터 조명 리뷰", budget: "30만원", product: "LED 바" },
    { title: "자취생 필수, 간편 밀키트 홍보", budget: "20만원", product: "마라탕 밀키트" },
    { title: "반려동물 영양제 리얼 급여 후기", budget: "100만원", product: "관절 영양제" }
];


// --- HELPER FUNCTIONS ---

function getRandomItem<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

async function safeClick(page: Page, selector: string) {
    try {
        await page.click(selector, { timeout: 3000 });
    } catch (e) {
        console.log(`    ⚠️ Click failed for ${selector}, trying force...`);
        await page.click(selector, { force: true });
    }
}

// --- MAIN SEEDING LOGIC ---

async function seedMarketingData() {
    console.log('🚀 Starting Marketing Data Seeding (20 Creators, 20 Brands)...');

    const browser = await chromium.launch({ headless: HEADLESS });
    const context = await browser.newContext();
    const page = await context.newPage();

    // 1. CREATE 20 CREATORS
    console.log('\n--- 1. SEEDING 20 CREATORS ---');
    for (let i = 0; i < 20; i++) {
        const name = NAMES_KOREAN[i];
        const email = `creator_mkt_${i + 1}@example.com`;
        const password = 'Password123!';
        const niche = NICHES[i % NICHES.length]; // cycle through niches
        const moment = getRandomItem(MOMENT_TEMPLATES[niche.key as keyof typeof MOMENT_TEMPLATES]);

        console.log(`\n👤 [${i + 1}/20] Creating Creator: ${name} (${niche.category})`);

        try {
            // A. Signup
            await page.goto(`${TARGET_URL}/signup`);
            await page.click('button:has-text("크리에이터")');

            // Correct Selectors based on inspection
            await page.fill('#creator-name', name);
            await page.fill('#creator-email', email);
            await page.fill('#creator-pw', password);

            // Handle unique 'Sign Up' button
            await page.click('button:has-text("이메일로 가입하기")');

            // Wait for success/fail
            // Fast track: If email exists, try login
            try {
                // Wait for either success (redirect/modal) or failure (error text)
                // We use a small timeout because if it succeeds it redirects fast
                await page.waitForSelector('text=이미 존재하는', { timeout: 3000 });
                console.log('    ℹ️ User exists, logging in...');
                await page.goto(`${TARGET_URL}/login`);
                await page.click('button:has-text("크리에이터")');
                await page.fill('#creator-id', email);
                await page.fill('#creator-pw', password);
                await page.click('button:has-text("로그인하기")');
            } catch {
                // If "already exists" didn't show up, we assume success or redirect
                // Check if we are still on signup page or moved
                console.log('    ✅ Signup flow proceeding...');
                await page.waitForTimeout(1000);
                if (await page.isVisible('text=로그인 페이지로 이동')) {
                    await page.click('text=로그인 페이지로 이동');
                    await page.click('button:has-text("크리에이터")');
                    await page.fill('#creator-id', email);
                    await page.fill('#creator-pw', password);
                    await page.click('button:has-text("로그인하기")');
                }
            }

            await page.waitForURL(/.*\/creator/);

            // B. Create Moment
            console.log(`    ✨ Adding Moment: ${moment.title}`);
            await page.goto(`${TARGET_URL}/creator/new`);
            await page.fill('#title', moment.title);

            // Category Select
            await page.click(`button:has-text("${niche.category}")`);

            // Target Product
            await page.fill('input[placeholder*="광고"]', moment.product);

            // Description
            await page.fill('#description', moment.desc);

            // Dates (Randomize)
            // Assuming the UI requires clicking a month button.
            // Just picking '2월' for now as per previous script
            try {
                await page.click('button:has-text("2월")', { timeout: 2000 });
            } catch { }

            await page.click('button:has-text("모먼트 등록하기")');
            // Use regex for flexible matching (e.g. query params)
            await page.waitForURL(/.*\/creator/, { timeout: 30000 });

        } catch (e) {
            console.error(`    ❌ Failed Creator ${name}:`, e);
            // Continue to next
            await context.clearCookies();
            await page.evaluate(() => localStorage.clear());
        }

        // Logout
        await page.goto(`${TARGET_URL}/creator`);
        await page.click('button:has-text("로그아웃")'); // Adjust selector if it's an icon
    }

    // 2. CREATE 20 BRANDS
    console.log('\n--- 2. SEEDING 20 BRANDS ---');
    for (let i = 0; i < 20; i++) {
        const name = BRAND_NAMES[i];
        const email = `brand_mkt_${i + 1}@example.com`;
        const password = 'Password123!';
        const campaign = getRandomItem(CAMPAIGN_TEMPLATES);

        console.log(`\n🏢 [${i + 1}/20] Creating Brand: ${name}`);

        try {
            await page.goto(`${TARGET_URL}/signup`);
            // Wait for buttons to be visible
            await page.waitForSelector('button:has-text("브랜드")');
            await page.click('button:has-text("브랜드")'); // Select Brand Role

            // Brand Signup Form Correct Selectors
            await page.fill('#brand-name', name);
            await page.fill('#brand-email', email);
            await page.fill('#brand-pw', password);

            await page.click('button:has-text("이메일로 가입하기")');

            // Login Logic (Same as above)
            try {
                await page.waitForSelector('text=이미 존재하는', { timeout: 3000 });
                console.log('    ℹ️ Brand exists, logging in...');
                await page.goto(`${TARGET_URL}/login`);
                await page.click('button:has-text("브랜드")');
                await page.fill('#brand-id', email);
                await page.fill('#brand-pw', password);
                await page.click('button:has-text("로그인하기")');
            } catch {
                console.log('    ✅ Signup flow proceeding...');
                await page.waitForTimeout(1000);
                if (await page.isVisible('text=로그인 페이지로 이동')) {
                    await page.click('text=로그인 페이지로 이동');
                    await page.click('button:has-text("브랜드")');
                    await page.fill('#brand-id', email);
                    await page.fill('#brand-pw', password);
                    await page.click('button:has-text("로그인하기")');
                }
            }

            await page.waitForURL(/.*\/brand/);

            // B. Create Campaign
            console.log(`    📢 Adding Campaign: ${campaign.title}`);
            await page.goto(`${TARGET_URL}/brand/new`);

            await page.fill('#title', campaign.title);
            await page.fill('#product', campaign.product);
            // Budget might be a select or input
            await page.fill('input[placeholder*="예산"]', campaign.budget).catch(() => { });

            // Category (Just pick first available)
            await page.click('.grid button:first-child');

            await page.click('button:has-text("캠페인 등록하기")');
            // Use regex for flexible matching (e.g. query params)
            await page.waitForURL(/.*\/brand/, { timeout: 30000 });

        } catch (e) {
            console.error(`    ❌ Failed Brand ${name}:`, e);
        }

        // Logout
        await page.goto(`${TARGET_URL}/brand`);
        await page.click('button:has-text("로그아웃")');
    }

    console.log('\n🎉 Marketing Data Seeding Complete!');
    await browser.close();
}

seedMarketingData();
