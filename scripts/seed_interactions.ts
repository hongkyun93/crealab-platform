
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fakerKO } from '@faker-js/faker';

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

const APPLICATION_MESSAGES = [
    "안녕하세요! 해당 제품 평소에 관심 많았는데 꼭 체험해보고 싶습니다.",
    "제 팔로워 분들이 딱 좋아할 만한 제품이네요! 정성스러운 리뷰 약속드립니다.",
    "브랜드 이미지와 제 피드 감성이 잘 맞을 것 같아요. 협업 기회 주시면 감사하겠습니다!",
    "이전에도 비슷한 제품 리뷰 경험이 있어 퀄리티 높은 콘텐츠 제작 가능합니다.",
    "제품의 장점을 잘 살려서 릴스로 멋지게 담아보겠습니다.",
    "꼼꼼하고 솔직한 리뷰로 소문난 크리에이터입니다! 믿고 맡겨주세요.",
    "이번 캠페인 기획 의도가 너무 좋네요. 함께 참여하고 싶습니다.",
    "사진 촬영과 보정에 자신 있습니다. 제품 인생샷 남겨드릴게요!",
    "팔로워 소통률이 높은 편이라 홍보 효과 확실할 거예요.",
    "마감 기한 엄수! 가이드라인 준수! 성실하게 임하겠습니다."
];

const PROPOSAL_MESSAGES = [
    "안녕하세요, 크리에이터님! 올려주신 모먼트 보고 저희 브랜드와 잘 어울릴 것 같아 제안드립니다.",
    "평소 크리에이터님의 콘텐츠를 인상 깊게 보고 있었습니다. 저희 신제품을 먼저 경험해보시겠어요?",
    "크리에이터님의 감각적인 스타일이 저희 제품과 시너지가 날 것 같습니다. 협업 부탁드려요!",
    "이번 모먼트 분위기가 너무 좋네요. 저희 제품과 함께 더 멋진 콘텐츠 만들어보면 어떨까요?",
    "안녕하세요! 브랜드 담당자입니다. 크리에이터님과 꼭 한번 작업해보고 싶습니다.",
    "제품 무료 제공 및 소정의 원고료 지급 가능합니다. 긍정적인 검토 부탁드립니다.",
    "저희 브랜드의 새로운 캠페인에 크리에이터님을 앰버서더로 모시고 싶습니다.",
    "콘텐츠 퀄리티가 항상 좋으시네요! 저희 제품 리뷰도 부탁드리고 싶습니다.",
    "크리에이터님의 팬 층이 저희 타겟과 딱 맞습니다. 좋은 인연이 되었으면 해요.",
    "부담 없이 제품만 체험해보셔도 좋습니다. 편하게 연락 주세요!"
];

async function seedInteractions() {
    console.log('🚀 Starting Interaction Seeding...');

    // 1. Fetch Data
    console.log('📦 Fetching existing data...');

    // Get Creators
    const { data: creators, error: creatorError } = await supabase
        .from('profiles')
        .select('id, display_name')
        .eq('role', 'influencer'); // Assuming 'role' column exists or check metadata? 
    // Note: The 'profiles' table definition might rely on 'influencer_details' existence for role check if 'role' column is not reliable.
    // Let's assume 'role' column is populated as per previous scripts. 
    // If not, we can join or check. Let's try direct select first.

    if (creatorError) {
        console.error('Error fetching creators:', creatorError);
        return;
    }

    // Get Brands
    const { data: brands, error: brandError } = await supabase
        .from('profiles')
        .select('id, display_name')
        .neq('role', 'influencer'); // Simple check, or check if they have campaigns

    if (brandError) {
        console.error('Error fetching brands:', brandError);
        return;
    }

    const { data: campaigns, error: campaignError } = await supabase
        .from('campaigns')
        .select('id, title, brand_id');

    if (campaignError) {
        console.error('Error fetching campaigns:', campaignError);
        return;
    }

    const { data: moments, error: momentError } = await supabase
        .from('influencer_events')
        .select('id, title, influencer_id');

    if (momentError) {
        console.error('Error fetching moments:', momentError);
        return;
    }

    console.log(`✅ Loaded: ${creators?.length} Creators, ${brands?.length} Brands, ${campaigns?.length} Campaigns, ${moments?.length} Moments.`);

    if (!creators?.length || !campaigns?.length || !brands?.length || !moments?.length) {
        console.error('❌ Insufficient data to seed interactions.');
        return;
    }

    // 2. Seed Campaign Applications
    console.log('\n--- 1. Seeding Campaign Applications (5 per Campaign) ---');

    for (const campaign of campaigns) {
        const applicationsNeeded = 5;
        // Shuffle creators
        const shuffledCreators = [...creators].sort(() => 0.5 - Math.random());
        const selectedCreators = shuffledCreators.slice(0, applicationsNeeded);

        const applicationInserts = selectedCreators.map(creator => ({
            campaign_id: campaign.id,
            influencer_id: creator.id,
            message: fakerKO.helpers.arrayElement(APPLICATION_MESSAGES),
            motivation: fakerKO.lorem.sentence(),
            content_plan: fakerKO.lorem.paragraph(),
            instagram_handle: `inst_${creator.display_name}`, // Mock handle
            portfolio_links: [fakerKO.internet.url()],
            status: 'applied',
            created_at: fakerKO.date.recent({ days: 7 }).toISOString()
        }));

        // Use upsert or insert? Insert is fine, RLS might block if duplicate logic exists but usually ok for seeding.
        // To avoid unique constraint errors if any, maybe check first? 
        // For speed, let's just try insert and catch error or ignore conflicts.
        const { error } = await supabase.from('campaign_proposals').insert(applicationInserts);

        if (error) {
            console.error(`Error seeding applications for campaign ${campaign.id}:`, error.message);
        } else {
            // process.stdout.write('.');
        }
    }
    console.log('\n✅ Campaign Applications Seeded.');

    // 3. Seed Moment Proposals
    console.log('\n--- 2. Seeding Moment Proposals (5 per Moment) ---');

    for (const moment of moments) {
        const proposalsNeeded = 5;
        // Shuffle brands
        const shuffledBrands = [...brands].sort(() => 0.5 - Math.random());
        const selectedBrands = shuffledBrands.slice(0, proposalsNeeded);

        const proposalInserts = selectedBrands.map(brand => ({
            brand_id: brand.id,
            influencer_id: moment.influencer_id,
            event_id: moment.id,
            product_name: `협찬 제품 ${fakerKO.commerce.product()}`,
            product_type: 'gift',
            message: fakerKO.helpers.arrayElement(PROPOSAL_MESSAGES),
            status: 'offered',
            created_at: fakerKO.date.recent({ days: 7 }).toISOString()
            // Add other required fields if strictly required by constraints
        }));

        const { error } = await supabase.from('brand_proposals').insert(proposalInserts);
        if (error) {
            console.error(`Error seeding proposals for moment ${moment.id}:`, error.message);
        } else {
            // process.stdout.write('.');
        }
    }
    console.log('\n✅ Moment Proposals Seeded.');

    console.log('\n✨ Interaction Seeding Complete!');
}

seedInteractions();
