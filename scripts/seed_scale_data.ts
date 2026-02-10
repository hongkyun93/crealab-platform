
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fakerTH, fakerKO } from '@faker-js/faker';

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
    console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

// --- CONSTANTS ---

const NICHES = [
    { category: '💄 뷰티', key: 'beauty', products: ['수분크림', '립스틱', '파운데이션', '마스크팩', '향수'] },
    { category: '👗 패션', key: 'fashion', products: ['디자이너 가방', '운동화', '반지/목걸이', '청바지', '시계'] },
    { category: '🍽️ 맛집', key: 'food', products: ['밀키트', '디저트', '건강기능식품', '음료수', '신선식품'] },
    { category: '🏡 리빙/인테리어', key: 'living', products: ['침구세트', '감성 조명', '디퓨저', '주방용품', '가구'] },
    { category: '💻 테크/IT', key: 'tech', products: ['무선 이어폰', '키보드', '스마트워치', '노트북 파우치', '충전기'] },
    { category: '✈️ 여행', key: 'travel', products: ['캐리어', '여행용 파우치', '호텔 숙박권', '캠핑용품', '카메라'] },
    { category: '🏋️ 헬스/운동', key: 'fitness', products: ['요가매트', '단백질 보충제', '애슬레저룩', '폼롤러', '스마트 체중계'] },
    { category: '🐶 반려동물', key: 'pet', products: ['사료/간식', '배변패드', '장난감', '펫 유모차', '영양제'] },
    { category: '👶 육아', key: 'parenting', products: ['기저귀', '물티슈', '유아식', '장난감', '유모차'] },
    { category: '📚 도서/자기계발', key: 'education', products: ['도서', '온라인 강의 수강권', '문구류', '다이어리', '학습지'] }
];

const MOMENT_TITLES = [
    "이번 주말 OOTD 공유해요 ✨", "요즘 푹 빠진 최애템 소개", "나만의 힐링 스팟 발견!", "오늘 점심은 이걸로 해결 😋",
    "집콕 생활 필수템", "환절기 피부 관리 루틴", "감성 충만 홈카페 오픈 ☕", "운동 인증샷! 오운완 💪",
    "새로 산 장비 언박싱", "반려동물과 함께하는 일상", "여행지 추천! 여기 꼭 가보세요", "자기관리 꿀팁 대방출",
    "책상 꾸미기 완성 🖥️", "맛있는 녀석들 촬영지 방문", "다이어트 식단 기록", "주말 드라이브 코스 추천",
    "셀프 인테리어 도전기", "신상 카페 투어", "피크닉 가기 좋은 날씨 ☀️", "나에게 주는 선물 🎁"
];

const CAMPAIGN_TITLES_TEMPLATE = [
    "[체험단] {product} 리뷰어 모집합니다!",
    "{product}와 함께하는 특별한 일상공유 캠페인",
    "✨ {category} 크리에이터 주목! {product} 협찬",
    "프리미엄 {product} 런칭 기념 체험단 모집",
    "{product} 찐리뷰 남겨주실 분 찾아요 👀",
    "[긴급] {product} 숏폼 영상 제작 캠페인",
    "감성 가득 {product} 사진 찍어주실 분?",
    "{product} 2주 사용 챌린지 참여자 모집",
    "{category} 인플루언서 전용 {product} 시크릿 오퍼",
    "오직 크리에이터만을 위한 {product} 제공 이벤트"
];

// --- GENERATORS ---

function generateKoreanName(index: number) {
    // Deterministic random
    fakerKO.seed(index * 123);
    const firstName = fakerKO.person.firstName();
    const lastName = fakerKO.person.lastName();
    const gender = index % 2 === 0 ? 'female' : 'male';
    return { name: `${lastName}${firstName}`, gender };
}

function generateMoment(niche: any, seed: number) {
    fakerKO.seed(seed);
    const title = fakerKO.helpers.arrayElement(MOMENT_TITLES);
    const product = fakerKO.helpers.arrayElement(niche.products);

    // Future Date usually
    const eventDate = fakerKO.date.future({ years: 0.2 }).toISOString().split('T')[0];
    // Past date sometimes
    const isPast = seed % 5 === 0;
    const finalDate = isPast ? fakerKO.date.past({ years: 0.2 }).toISOString().split('T')[0] : eventDate;

    // Posting date is roughly 1-2 weeks after event
    const postingDateObj = new Date(finalDate);
    postingDateObj.setDate(postingDateObj.getDate() + 7 + Math.floor(Math.random() * 7));
    const postingDate = postingDateObj.toISOString().split('T')[0];

    return {
        title: title,
        description: `안녕하세요! ${niche.category} 크리에이터로서 솔직하고 꼼꼼한 ${product} 리뷰 약속드립니다. \n주로 인스타그램 릴스와 피드에 업로드할 예정이며, 팔로워들과 활발하게 소통하겠습니다. \n가이드라인 준수는 기본! 퀄리티 높은 콘텐츠 보장해요.`,
        targetProduct: product,
        eventDate: finalDate,
        postingDate: postingDate,
        tags: [niche.category, '협찬환영', '리뷰', '체험단']
    };
}

function generateCampaign(niche: any, brandName: string, seed: number) {
    fakerKO.seed(seed);
    const product = fakerKO.helpers.arrayElement(niche.products);
    const titleTemplate = fakerKO.helpers.arrayElement(CAMPAIGN_TITLES_TEMPLATE);
    const title = titleTemplate.replace('{product}', product).replace('{category}', niche.category);

    // Budget
    const budget = `${fakerKO.number.int({ min: 10, max: 100 })}0,000원 + 제품제공`;

    return {
        title,
        productName: product,
        category: niche.category,
        budget,
        target: `${niche.category} 전문, 팔로워 1k 이상, 사진/영상 퀄리티 우수`,
        description: `안녕하세요, ${brandName}입니다.\n이번에 새롭게 출시한 ${product}를 가장 먼저 체험해보실 크리에이터 분들을 찾습니다.\n\n[제공 혜택]\n- ${product} 본품 제공\n- 소정의 원고료 지급 (${budget})\n\n[미션]\n- 제품 언박싱 및 사용 후기 인스타그램 피드 1회 업로드\n- 필수 해시태그 포함\n\n많은 지원 부탁드립니다!`,
        eventDate: fakerKO.date.future({ years: 0.1 }).toISOString().split('T')[0],
        postingDate: fakerKO.date.future({ years: 0.2 }).toISOString().split('T')[0],
        tags: [niche.category, '신제품', '체험단', '유료광고']
    };
}

// --- MAIN SEEDING FUNCTION ---

async function seedScaleData() {
    console.log('🚀 Starting Large Scale Data Seeding...');

    // 1. CREATORS (50) - SKIPPING AS ALREADY DONE
    console.log('\n--- 1. Creating 50 Creators (SKIPPED) ---');
    /* 
    for (let i = 0; i < 50; i++) {
        const { name, gender } = generateKoreanName(i);
        const email = `creator_scale_${i + 1}@example.com`;
        const password = 'Password123!';
        const niche = NICHES[i % NICHES.length];

        // Photo Prompt
        const baseStyle = gender === 'female' ? "Korean woman, influencer, beauty shot, soft lighting" : "Korean man, influencer, model shot, street fashion";
        const prompt = `hyper-realistic portrait of ${baseStyle}, ${niche.key} theme, 8k, detailed`;
        const photoUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?n=${i + 1000}`; // Offset ensure unique

        process.stdout.write(`Creating Creator ${i + 1}/50: ${name} (${niche.category})... `);

        // A. Auth User
        const { data: userData, error: userError } = await supabase.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { role_type: 'influencer', name: name }
        });

        let userId = userData.user?.id;

        if (userError) {
            // If already exists, try to get existing
            const { data: existing } = await supabase.from('profiles').select('id').eq('email', email).single();
            if (existing) userId = existing.id;
            else {
                console.log(`❌ Failed: ${userError.message}`);
                continue;
            }
        }

        if (!userId) {
            console.log('❌ No User ID');
            continue;
        }

        // B. Update Profile
        fakerKO.seed(i);
        const address = `${fakerKO.location.state()} ${fakerKO.location.city()} ${fakerKO.location.street()}`;
        const phone = `010-${fakerKO.string.numeric(4)}-${fakerKO.string.numeric(4)}`;

        await supabase.from('profiles').update({
            bio: `[${niche.category} 전문] 안녕하세요, ${name}입니다. 진정성 있는 콘텐츠를 만듭니다. 연락주세요!`,
            avatar_url: photoUrl,
            display_name: name,
            address: address,
            phone: phone
        }).eq('id', userId);

        // C. Update Influencer Details (Important for tags/followers)
        const followers = fakerKO.number.int({ min: 1000, max: 500000 });
        await supabase.from('influencer_details').upsert({
            id: userId,
            instagram_handle: `inst_${name}_${i}`,
            followers_count: followers,
            tags: [niche.category, ...fakerKO.helpers.arrayElements(['일상', '소통', '협찬환영', 'DM환영'], 2)]
        });

        // D. Create 2 Moments
        const { count } = await supabase.from('influencer_events').select('*', { count: 'exact', head: true }).eq('influencer_id', userId);
        const momentsNeeded = 2 - (count || 0);

        if (momentsNeeded > 0) {
            for (let m = 0; m < momentsNeeded; m++) {
                const moment = generateMoment(niche, i * 100 + m);
                await supabase.from('influencer_events').insert({
                    influencer_id: userId,
                    title: moment.title,
                    description: moment.description,
                    target_product: moment.targetProduct,
                    event_date: moment.eventDate,
                    category: niche.category,
                    posting_date: moment.postingDate,
                    status: 'active',
                    tags: moment.tags
                });
            }
        }
        console.log('✅ Done');
    } 
    */

    // 2. BRANDS (20)
    console.log('\n--- 2. Creating 20 Brands ---');
    for (let i = 0; i < 20; i++) {
        fakerKO.seed(i * 555);
        const niche = NICHES[i % NICHES.length]; // Cycle through niches
        const companyName = fakerKO.company.name(); // Faker KO Company names are ok? Or generate manually?
        // Use simpler name generation
        const brandName = i % 2 === 0 ? companyName : `${fakerKO.word.noun()} ${fakerKO.word.noun()}`;

        const email = `brand_scale_${i + 1}@example.com`;
        const password = 'Password123!';

        // Logo Prompt
        const logoPrompt = `minimalist modern logo design for ${brandName}, ${niche.key} brand, vector style, white background`;
        const logoUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(logoPrompt)}?n=${i + 2000}`;

        process.stdout.write(`Creating Brand ${i + 1}/20: ${brandName} (${niche.category})... `);

        // A. Auth User
        const { data: userData, error: userError } = await supabase.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { role_type: 'brand', name: brandName }
        });

        let userId = userData.user?.id;
        if (userError) {
            const { data: existing } = await supabase.from('profiles').select('id').eq('email', email).single();
            if (existing) userId = existing.id;
            else {
                console.log(`❌ Failed: ${userError.message}`);
                continue;
            }
        }

        if (!userId) {
            console.log('❌ No User ID');
            continue;
        }

        // B. Update Profile
        const address = `${fakerKO.location.state()} ${fakerKO.location.city()} ${fakerKO.location.street()}`;
        const phone = `02-${fakerKO.string.numeric(3)}-${fakerKO.string.numeric(4)}`;

        await supabase.from('profiles').update({
            bio: `${brandName} 공식 계정입니다. ${niche.category} 관련 제품을 제조/판매하고 있습니다.`,
            avatar_url: logoUrl,
            display_name: brandName,
            address: address,
            phone: phone,
            role: 'brand' // Ensure role is set
        }).eq('id', userId);

        // C. Create 1 Campaign
        const { count } = await supabase.from('campaigns').select('*', { count: 'exact', head: true }).eq('brand_id', userId);

        if (!count || count < 1) {
            const camp = generateCampaign(niche, brandName, i * 777);

            // Generate product image
            const prodPrompt = `product photography of ${camp.productName}, ${niche.key}, studio lighting, 8k`;
            const prodImgUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prodPrompt)}?n=${i + 3000}`;

            await supabase.from('campaigns').insert({
                brand_id: userId,
                title: camp.title,
                product_name: camp.productName,
                category: camp.category,
                budget: camp.budget, // String
                target: camp.target,
                description: camp.description,
                image: prodImgUrl,
                status: 'active',
                event_date: camp.eventDate,
                posting_date: camp.postingDate,
                tags: camp.tags
            });
        }
        console.log('✅ Done');
    }

    console.log('\n✨ Database seeding complete!');
}

seedScaleData();
