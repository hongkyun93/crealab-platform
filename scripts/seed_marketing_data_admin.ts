
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
    console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
}

// Disable auth in client for admin ops
const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

// --- DYNAMIC DATA GENERATORS ---

const LAST_NAMES = ['김', '이', '박', '최', '정', '강', '조', '윤', '장', '임', '한', '오', '서', '신', '권', '황', '안', '송', '류', '전'];
const FIRST_NAMES_MALE = ['준호', '민준', '서준', '도현', '예준', '시우', '하준', '주원', '지호', '지후', '준우', '민재', '현우', '동현', '승우'];
const FIRST_NAMES_FEMALE = ['서연', '서윤', '지우', '서현', '하은', '지민', '민서', '채원', '수빈', '지아', '다은', '예은', '수아', '소율', '지안'];

function generateKoreanName(index: number) {
    const lastName = LAST_NAMES[index % LAST_NAMES.length];
    const isFemale = index % 2 === 0; // Alternate gender
    const firstNames = isFemale ? FIRST_NAMES_FEMALE : FIRST_NAMES_MALE;
    // Use index to deterministically pick a first name to avoid randomness refreshing
    const firstName = firstNames[(index + Math.floor(index / LAST_NAMES.length)) % firstNames.length];
    return {
        fullName: `${lastName}${firstName}`,
        isFemale
    };
}

const NICHES = [
    { category: '💄 뷰티', key: 'beauty' },
    { category: '👗 패션', key: 'fashion' },
    { category: '🍽️ 맛집', key: 'food' }, // '푸드' -> '🍽️ 맛집' (Closest match)
    { category: '🏡 리빙/인테리어', key: 'living' }, // '리빙' -> '🏡 리빙/인테리어'
    { category: '💻 테크/IT', key: 'tech' }, // '테크' -> '💻 테크/IT'
    { category: '✈️ 여행', key: 'travel' },
    { category: '🏋️ 헬스/운동', key: 'fitness' }
];

const MOMENT_TEMPLATES_ALL = [
    // Mixed templates used randomly if category specific runs out or for variety
    { title: "오늘의 OOTD, 데일리룩 추천", category: "👗 패션", product: "청바지, 운동화", desc: "편하면서도 스타일리시한 데일리룩 코디입니다. 협찬 환영해요!" },
    { title: "환절기 피부 관리 꿀팁", category: "💄 뷰티", product: "수분크림", desc: "건조한 요즘 날씨에 딱 맞는 스킨케어 루틴 공개." },
    { title: "감성 캠핑 용품 언박싱", category: "✈️ 여행", product: "캠핑의자, 랜턴", desc: "새로 산 캠핑 장비들 소개합니다. 캠핑 용품 브랜드 연락주세요." },
    { title: "재택근무 데스크테리어", category: "🏡 리빙/인테리어", product: "키보드, 조명", desc: "일하고 싶어지는 책상 꾸미기. 데스크테리어 소품 리뷰 가능합니다." },
    { title: "다이어트 식단 공유", category: "🍽️ 맛집", product: "닭가슴살", desc: "맛있게 살 빼는 식단 레시피. 다이어트 식품 광고 기다립니다." },
    { title: "아이패드 드로잉 기초", category: "💻 테크/IT", product: "태블릿, 펜슬", desc: "취미로 시작하는 디지털 드로잉. 관련 기기 협찬 문의주세요." },
    { title: "홈트레이닝 필수템", category: "🏋️ 헬스/운동", product: "요가매트, 덤벨", desc: "집에서 하는 전신 운동 루틴. 홈트 용품 리뷰 전문입니다." },
    { title: "반려동물 수제 간식 만들기", category: "🐶 반려동물", product: "반려동물 간식", desc: "우리 강아지가 좋아하는 건강 간식 레시피." }
];

function generateMoment(niche: string, index: number) {
    // Find templates for niche or use random mixed
    const templates = MOMENT_TEMPLATES_ALL.filter(t => t.category === niche);
    const pool = templates.length > 0 ? templates : MOMENT_TEMPLATES_ALL;

    // Use index to pick a template deterministically but rotate through them
    const t = pool[index % pool.length];

    // Check if we need to add variety if same template is used multiple times? 
    // User wants "No numbers". So we return title as is.
    // If we have 100 users and 8 templates, many will have same title. That's better than "Title 1".

    return {
        title: t.title,
        product: t.product,
        desc: t.desc + ` (광고/협찬 문의 환영)`
    };
}

const BRAND_PREFIXES = ['Global', 'Urban', 'Pure', 'Tech', 'Green', 'Blue', 'Red', 'Golden', 'Silver', 'Prime', 'Daily', 'Smart', 'Future', 'Eco', 'Vita'];
const BRAND_SUFFIXES = ['Lab', 'Co', 'Inc', 'Systems', 'Solutions', 'Nature', 'Life', 'Works', 'Group', 'Studio', 'Partners', 'Ventures'];

function generateBrandName(index: number) {
    const prefix = BRAND_PREFIXES[index % BRAND_PREFIXES.length];
    const suffix = BRAND_SUFFIXES[(index + 3) % BRAND_SUFFIXES.length];
    return `${prefix} ${suffix}`;
}

async function seedAdminScaled() {
    console.log('🚀 Starting Scaled Admin Seeding (100 Creators, 50 Brands)...');

    // 1. CREATORS (1 to 100)
    console.log('\n--- 1. SEEDING 100 CREATORS ---');
    for (let i = 0; i < 100; i++) {
        const { fullName, isFemale } = generateKoreanName(i);
        // "creator_real_1" to "creator_real_100"
        const email = `creator_real_${i + 1}@example.com`;
        const password = 'Password123!';
        const niche = NICHES[i % NICHES.length];

        // Photo: Use Pollinations for hyper-realistic images
        // "Imagine a hyper-realistic portrait of a young Korean person, [category] influencer style, 8k"
        // OR "Aesthetic [category] object/scenery, hyper-realistic, 8k"

        const photoPromptBase = isFemale ? 'young Korean woman' : 'young Korean man';
        let prompt = '';

        switch (niche.key) {
            case 'beauty': prompt = `hyper-realistic portrait of ${photoPromptBase}, beauty influencer, clear skin, natural makeup, soft lighting, 8k`; break;
            case 'fashion': prompt = `hyper-realistic portrait of ${photoPromptBase}, fashion model, trendy outfit, street snap, 8k`; break;
            case 'food': prompt = `aesthetic gourmet food plating, korean cafe vibe, delicious, hyper-realistic, 8k`; break; // Object for food
            case 'living': prompt = `warm cozy aesthetic korean apartment interior, minimal design, photorealistic, 8k`; break; // Object for living
            case 'tech': prompt = `aesthetic desk setup, macbook, tech gadgets, productive vibe, photorealistic, 8k`; break; // Object for tech
            case 'travel': prompt = `beautiful travel destination scenery, healing nature, photorealistic, 8k`; break; // Scenery for travel
            case 'fitness': prompt = `hyper-realistic portrait of ${photoPromptBase}, pilates studio, workout gear, healthy lifestyle, 8k`; break;
            default: prompt = `hyper-realistic portrait of ${photoPromptBase}, natural daily look, 8k`;
        }

        const photoUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?n=${i}`; // Add n=i to ensure uniqueness if prompt is same

        console.log(`[${i + 1}/100] Creator: ${fullName} (${email})`);

        let userId = '';

        // A. Create or Get User
        const { data: user, error: userError } = await supabase.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { role_type: 'influencer', name: fullName }
        });

        if (userError) {
            // Check if user already exists
            const { data: existingUser } = await supabase.from('profiles').select('id').eq('email', email).single();
            if (existingUser) {
                // console.log(`  ℹ️ User exists, updating...`);
                userId = existingUser.id;
            } else {
                console.error(`  ❌ Create failed & not found: ${userError.message}`);
                continue;
            }
        } else {
            userId = user.user.id;
            // Wait for trigger to create profile
            await new Promise(r => setTimeout(r, 200));
        }

        if (!userId) continue;

        // B. Update Profile (Profiles & Influencer Details)
        // Fix Bio & Avatar
        await supabase.from('profiles').update({
            bio: `안녕하세요, ${niche.category} 전문 크리에이터 ${fullName}입니다. 진정성 있는 리뷰 약속드립니다.`,
            avatar_url: photoUrl,
            display_name: fullName // Ensure display name syncs
        }).eq('id', userId);

        // Extended Details
        await supabase.from('influencer_details').upsert({
            id: userId,
            instagram_handle: `user_${userId.substring(0, 8)}`,
            followers_count: Math.floor(Math.random() * 50000) + 1000,
            tags: [niche.category, 'Instagram', 'YouTube']
        });

        // C. Create 2 Moments (Upsert style? No, just insert if low count)
        // Check existing moment count?
        const { count } = await supabase.from('influencer_events').select('*', { count: 'exact', head: true }).eq('influencer_id', userId);

        const momentsToCreate = 2 - (count || 0);

        if (momentsToCreate > 0) {
            for (let m = 0; m < momentsToCreate; m++) {
                // Generate varied moment
                const momentData = generateMoment(niche.category, i * 2 + m);
                const cleanTitle = momentData.title.replace(/ \[\d+\]$/, ''); // Remove trailing [index]

                await supabase.from('influencer_events').insert({
                    influencer_id: userId,
                    title: cleanTitle,
                    description: momentData.desc,
                    target_product: momentData.product,
                    event_date: new Date().toISOString().split('T')[0],
                    category: niche.category
                });
                // console.log(`    + Moment created: ${momentData.title}`);
            }
        }
    }

    // 2. BRANDS (1 to 50)
    console.log('\n--- 2. SEEDING 50 BRANDS ---');
    for (let i = 0; i < 50; i++) {
        const name = generateBrandName(i);
        const email = `brand_real_${i + 1}@example.com`;
        const password = 'Password123!';

        console.log(`[${i + 1}/50] Brand: ${name} (${email})`);

        let userId = '';

        const { data: user, error: userError } = await supabase.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { role_type: 'brand', name: name }
        });

        if (userError) {
            const { data: existingUser } = await supabase.from('profiles').select('id').eq('email', email).single();
            if (existingUser) userId = existingUser.id;
            else continue;
        } else {
            userId = user.user.id;
            await new Promise(r => setTimeout(r, 200));
        }

        if (!userId) continue;

        // Update Profile
        // Logos: use abstract/random images or specific placeholders?
        // Let's use dicebear initials or shapes as it is a safe fallback for brands
        await supabase.from('profiles').update({
            bio: `${name} Official Account.`,
            avatar_url: `https://api.dicebear.com/7.x/shapes/svg?seed=${name}`,
            display_name: name
        }).eq('id', userId);

        // Ensure at least 1 campaign
        const { count } = await supabase.from('campaigns').select('*', { count: 'exact', head: true }).eq('brand_id', userId);
        if (!count || count < 1) {
            await supabase.from('campaigns').insert({
                brand_id: userId,
                title: `${name} 2024 S/S Campaign`,
                description: `Looking for creators to promote our new lineup.`,
                product_name: "New Collection",
                budget_min: 1000000,
                budget_max: 5000000,
                status: 'active'
            });
        }
    }

    console.log('✨ Scaled Admin Seeding Complete!');
}

seedAdminScaled();
