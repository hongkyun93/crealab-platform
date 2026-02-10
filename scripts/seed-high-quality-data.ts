import { chromium } from '@playwright/test';
import * as path from 'path';

const TARGET_URL = 'https://creadypick.vercel.app';

// High Quality Data Sets
const PERSONAS = [
    {
        email: 'test_beauty_pro@creadypick.com', // Fixed Email for consistency
        password: 'password1234',
        name: 'Minji_Beauty',
        handle: 'minji.beauty_official',
        category: '뷰티',
        bio: '퍼스널컬러 진단 & 데일리 메이크업 꿀팁 공유 💄 | 현직 메이크업 아티스트 | 협찬 환영 DM 💌',
        imagePath: '/Users/kimhongkyun/.gemini/antigravity/brain/e108f878-bb15-4507-bf27-34b594bf3cd5/profile_beauty_influencer_1770688261419.png',
        moments: [
            {
                title: '건조한 기내에서도 살아남는 승무원 미스트 찐후기 ✈️',
                targetProduct: '미스트, 수분크림, 마스크팩',
                month: '2월',
                description: '장거리 비행 때마다 챙겨가는 파우치 공개! 💧 기내 건조함 싹 잡아주는 수분 루틴 소개하려고 해요.\n\n[기획 의도]\n승무원 지인 추천으로 정착한 꿀템들 위주로, 실제 비포/애프터 수분도 체크까지 포함된 리얼 후기입니다.\n\n[촬영 포인트]\n기내 조명 아래서의 피부 광채 표현, 텍스처 클로즈업, 비행기 창가 샷 필수 포함.'
            },
            {
                title: '올리브영 세일기간 꼭 쟁여야 할 수분크림 TOP 3 🏆',
                targetProduct: '수분크림, 진정크림',
                month: '2월',
                description: '올영 알바생 출신이 추천하는 찐 가성비템부터 백화점 저렴이 버전까지! 💸\n\n[콘텐츠 구성]\n1. 속건조 잡는 젤 타입\n2. 트러블 진정 시카 크림\n3. 화장 잘 먹는 꾸덕 크림\n\n각 제형 비교 영상과 함께 메이크업 궁합도 테스트할 예정입니다.'
            }
        ]
    },
    {
        email: 'test_fashion_pro@creadypick.com',
        password: 'password1234',
        name: 'OOTD_Jin',
        handle: 'jin_daily_look',
        category: '패션',
        bio: '미니멀룩 & 출근룩 코디북 🧥 | 키 160cm 데일리룩 | 정보는 게시물 하단 👇',
        imagePath: '/Users/kimhongkyun/.gemini/antigravity/brain/e108f878-bb15-4507-bf27-34b594bf3cd5/profile_fashion_influencer_1770688277391.png',
        moments: [
            {
                title: '10만원대 하객룩 코디, 브랜드 추천 💍',
                targetProduct: '원피스, 트위드자켓, 핸드백',
                month: '2월',
                description: '결혼식 시즌, 뭐 입을지 고민이라면? 🤔 격식은 차리되 너무 튀지 않는 센스 있는 하객룩 모음.\n\n[스타일링 제안]\n- 고급스러운 트위드 셋업\n- 체형 커버 롱 원피스\n- 포인트 악세서리 매칭법\n\n실내/실외 자연광 착용샷 위주로 고급스러운 무드 연출 예정입니다.'
            },
            {
                title: '여름 장마철 레인부츠 코디법 (헌터 vs 락피쉬) ☔️',
                targetProduct: '레인부츠, 숏팬츠, 우비',
                month: '2월',
                description: '비 오는 날에도 스타일 포기 못해! 🌧 레인부츠 롱/숏 기장별 코디 꿀팁.\n\n[비교 리뷰]\n착화감, 무게, 코디 범용성 꼼꼼 비교!\n비 내리는 거리에서의 감성적인 무드 영상과 함께 룩북 형식으로 제작합니다.'
            }
        ]
    },
    {
        email: 'test_food_pro@creadypick.com',
        password: 'password1234',
        name: 'Gourmet_Conan',
        handle: 'conan_tasty_seoul',
        category: '푸드',
        bio: '서울 맛집 뿌시기 👊 | 광고 없는 솔직 후기만 올립니다 | 협찬 문의는 메일로 📩',
        imagePath: '/Users/kimhongkyun/.gemini/antigravity/brain/e108f878-bb15-4507-bf27-34b594bf3cd5/profile_food_influencer_1770688300942.png',
        moments: [
            {
                title: '성수동 팝업스토어 웨이팅 없이 들어가는 꿀팁 ☕️',
                targetProduct: '카페, 디저트, 팝업스토어',
                month: '2월',
                description: '핫플 웨이팅 지긋지긋하다면 필독! 🔥 평일 오픈런 vs 주말 눈치게임 성공 전략.\n\n[콘텐츠 내용]\n- 현장 대기 등록 꿀팁\n- 근처 숨은 맛집 루트 추천\n- 포토존 인생샷 가이드\n\n생동감 넘치는 릴스 형식으로 핫한 현장 분위기를 담아냅니다.'
            },
            {
                title: '집에서 만드는 엽떡 레시피 (싱크로율 99%) 🌶',
                targetProduct: '밀키트, 소스, 조리도구',
                month: '2월',
                description: '배달비 아까워서 직접 개발했습니다. 👨‍🍳 시판 소스 조합으로 만드는 엽떡 맛 그대로!\n\n[레시피 포인트]\n- 고춧가루 비율 황금비율 공개\n- 떡 불지 않게 삶는 법\n- 필수 토핑 추천\n\n보글보글 끓는 ASMR 사운드와 함께 침샘 자극하는 먹방까지 포함!'
            }
        ]
    }
];

async function seedHighQuality() {
    console.log('🚀 Launching browser for High Quality Seeding...');
    // Increase timeout for image uploads (30s default might be tight on slower networks)
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();

    console.log(`🚀 Target: ${TARGET_URL}`);

    for (const persona of PERSONAS) {
        console.log(`\n👤 Processing Persona: ${persona.name} (${persona.email})`);

        try {
            // Setup Robust Dialog Handler
            page.on('dialog', async dialog => {
                const msg = dialog.message();
                console.log(`    🔔 Alert: ${msg}`);
                try {
                    await dialog.accept();
                } catch (e: any) {
                    // Ignore "Cannot accept dialog which is already handled" error
                    if (!e.message.includes('already handled')) {
                        console.error('    ⚠️ Dialog Error:', e.message);
                    }
                }
            });

            // 0. Ensure Clean State (Navigate -> Clear)
            try {
                // Determine if we need to navigate to clear (only if url is about:blank or diff origin)
                if (page.url() === 'about:blank' || !page.url().startsWith(TARGET_URL)) {
                    await page.goto(TARGET_URL);
                }
                await page.evaluate(() => localStorage.clear());
                await page.evaluate(() => sessionStorage.clear());
                await context.clearCookies();
                console.log(`    🧹 Session Cleared.`);
            } catch (e) {
                console.log(`    ℹ️ Cleanup warning (non-fatal): ${e}`);
            }

            // 1. Signup (or Login if exists)
            await page.goto(`${TARGET_URL}/signup`);
            await page.click('button:has-text("크리에이터")');
            await page.fill('#creator-name', persona.name);
            await page.fill('#creator-email', persona.email); // Use persona email
            await page.fill('#creator-pw', persona.password);

            console.log(`    Attempting Signup...`);
            await page.click('button:has-text("이메일로 가입하기")');

            // Wait for success or "User already registered" error
            try {
                const successSelector = 'text=회원가입 이메일을 보냈습니다';
                const errorSelector = '.text-red-500'; // Generic error text class

                await Promise.race([
                    page.waitForSelector(successSelector, { timeout: 5000 }),
                    page.waitForSelector(errorSelector, { timeout: 5000 })
                ]);

                if (await page.isVisible(errorSelector)) {
                    const errText = await page.innerText(errorSelector);
                    console.log(`    ℹ️ Signup result: ${errText} (Likely already exists, proceeding to Login)`);
                } else {
                    console.log(`    ✅ Signup Request Sent.`);
                    await page.click('text=로그인 페이지로 이동');
                }
            } catch (e) {
                console.log(`    ℹ️ Signup timeout/checking, likely redirecting or error.`);
            }

            // 2. Login
            await page.waitForTimeout(1000);
            if (!page.url().includes('/login')) await page.goto(`${TARGET_URL}/login`);

            await page.click('button:has-text("크리에이터")');
            await page.fill('#creator-id', persona.email);
            await page.fill('#creator-pw', persona.password);
            await page.click('button:has-text("로그인하기")');
            await page.waitForURL(/.*\/creator/, { timeout: 15000 });
            console.log(`    ✅ Logged in.`);

            // 3. Update Profile (Image + Bio)
            console.log(`    🎨 Updating Profile...`);
            await page.goto(`${TARGET_URL}/creator/settings`);

            // Upload Profile Image
            // We need to trigger the hidden file input. 
            // The file input in 'avatar-upload.tsx' is hidden. We need to locate it.
            // Assuming standard file input <input type="file" ... />
            console.log(`    📸 Uploading Avatar: ${persona.imagePath}`);
            const fileInput = await page.waitForSelector('input[type="file"]', { state: 'attached' });
            await fileInput.setInputFiles(persona.imagePath);
            await page.waitForTimeout(3000); // Wait for upload to complete (Supabase)

            await page.fill('#handle', persona.handle);
            await page.fill('#bio', persona.bio);
            await page.click('button:has-text("저장하기")');
            // Wait for alert "저장되었습니다" handled by dialog listener
            await page.waitForTimeout(2000);
            console.log(`    ✅ Profile Updated.`);

            // 4. Create Moments
            for (const moment of persona.moments) {
                console.log(`    ✨ Creating Moment: ${moment.title}`);
                await page.goto(`${TARGET_URL}/creator/new`);

                await page.fill('#title', moment.title);
                await page.click(`button:has-text("${persona.category}")`);
                await page.fill('input[placeholder*="광고 진행이 가능한"]', moment.targetProduct);

                // Select Month (Force specific month for visibility)
                await page.click(`.grid-cols-3 >> nth=0 >> button:has-text("${moment.month}")`);

                // Posting Month (Randomize future)
                await page.click(`.grid-cols-3 >> nth=1 >> button:has-text("1월")`); // Just pick one

                await page.fill('#description', moment.description);

                await page.click('button:has-text("모먼트 등록하기")');
                await page.waitForURL(/.*\/creator/, { timeout: 15000 });
                console.log(`      ✅ Created.`);
            }

            console.log(`    ✅ Persona Complete.`);

        } catch (e) {
            console.error(`  ❌ Failed for ${persona.name}:`, e);
            await page.screenshot({ path: `error_${persona.name}.png` });
        }
    }

    await browser.close();
    console.log('🎉 High Quality Seeding Complete!');
}

seedHighQuality();
