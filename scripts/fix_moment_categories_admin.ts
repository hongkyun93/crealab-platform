
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase URL or Service Key. Check .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const NICHES = [
    { category: '💄 뷰티', key: 'beauty' },
    { category: '👗 패션', key: 'fashion' },
    { category: '🍽️ 맛집', key: 'food' }, // '푸드' -> '🍽️ 맛집' (Closest match)
    { category: '🏡 리빙/인테리어', key: 'living' }, // '리빙' -> '🏡 리빙/인테리어'
    { category: '💻 테크/IT', key: 'tech' }, // '테크' -> '💻 테크/IT'
    { category: '✈️ 여행', key: 'travel' },
    { category: '🏋️ 헬스/운동', key: 'fitness' }
];

async function fixCategories() {
    console.log('🔧 Fixing Moment Categories & Profile Tags for 100 Users...');

    for (let i = 0; i < 100; i++) {
        const email = `creator_real_${i + 1}@example.com`;
        const niche = NICHES[i % NICHES.length];

        // Get User ID
        const { data: user, error } = await supabase.from('profiles').select('id').eq('email', email).single();

        if (error || !user) {
            console.log(`⚠️ User not found or error for ${email}: ${error?.message}`);
            continue;
        }

        if ((i + 1) % 10 === 0) {
            console.log(`[${i + 1}/100] Updating ${email} -> ${niche.category}`);
        }

        // 1. Update Events (Moments)
        const { error: eventError } = await supabase.from('influencer_events')
            .update({ category: niche.category })
            .eq('influencer_id', user.id);

        if (eventError) console.error(`  ❌ Event Update Failed: ${eventError.message}`);

        // 2. Update Tags in influencer_details (Profile Tags)
        const { error: detailError } = await supabase.from('influencer_details').upsert({
            id: user.id,
            tags: [niche.category, 'Instagram', 'YouTube']
        });

        if (detailError) console.error(`  ❌ Details Update Failed: ${detailError.message}`);
    }
    console.log('✅ Fix Complete!');
}

fixCategories();
