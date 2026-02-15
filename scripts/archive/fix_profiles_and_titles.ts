
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
    { category: '🍽️ 맛집', key: 'food' },
    { category: '🏡 리빙/인테리어', key: 'living' },
    { category: '💻 테크/IT', key: 'tech' },
    { category: '✈️ 여행', key: 'travel' },
    { category: '🏋️ 헬스/운동', key: 'fitness' }
];

async function fixProfilesAndTitles() {
    console.log('🔧 Fixing Profile Photos & Removing Title Numbers for 100 Users...');

    for (let i = 0; i < 100; i++) {
        const email = `creator_real_${i + 1}@example.com`;
        const niche = NICHES[i % NICHES.length];

        // Determine Gender (Alternating)
        const isFemale = i % 2 === 0;
        const photoPromptBase = isFemale ? 'young Korean woman' : 'young Korean man';
        let prompt = '';

        // Use Pollinations AI for Hyper-Realistic Photos
        // Logic: Beauty/Fashion/Fitness -> Person. Food/Living/Tech/Travel -> Object/Scenery (to avoid uncannies or just strictly follow user pref)
        // User: "If person, must be Korean. Or can be object".

        switch (niche.key) {
            case 'beauty': prompt = `hyper-realistic portrait of ${photoPromptBase}, beauty influencer, clear skin, natural makeup, soft lighting, 8k, high quality, photorealistic`; break;
            case 'fashion': prompt = `hyper-realistic portrait of ${photoPromptBase}, fashion model, trendy outfit, street snap, 8k, photorealistic`; break;
            case 'food': prompt = `aesthetic gourmet food plating, korean cafe vibe, delicious, hyper-realistic, 8k`; break;
            case 'living': prompt = `warm cozy aesthetic korean apartment interior, minimal design, photorealistic, 8k`; break;
            case 'tech': prompt = `aesthetic desk setup, macbook, tech gadgets, productive vibe, photorealistic, 8k`; break;
            case 'travel': prompt = `beautiful travel destination scenery, healing nature, photorealistic, 8k`; break;
            case 'fitness': prompt = `hyper-realistic portrait of ${photoPromptBase}, pilates studio, workout gear, healthy lifestyle, 8k`; break;
            default: prompt = `hyper-realistic portrait of ${photoPromptBase}, natural daily look, 8k, photorealistic`;
        }

        const photoUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?n=${i}`;

        // Get User ID
        const { data: user, error } = await supabase.from('profiles').select('id').eq('email', email).single();

        if (error || !user) {
            console.log(`⚠️ User not found or error for ${email}: ${error?.message}`);
            continue;
        }

        if ((i + 1) % 10 === 0) {
            console.log(`[${i + 1}/100] Updating ${email}...`);
        }

        // 1. Update Profile Photo
        const { error: profileError } = await supabase.from('profiles').update({
            avatar_url: photoUrl
        }).eq('id', user.id);

        if (profileError) console.error(`  ❌ Profile Update Failed: ${profileError.message}`);

        // 2. Fetch and Clean Moment Titles
        const { data: events, error: fetchError } = await supabase.from('influencer_events').select('id, title').eq('influencer_id', user.id);

        if (fetchError) {
            console.error(`  ❌ Event Fetch Failed: ${fetchError.message}`);
        } else if (events && events.length > 0) {
            for (const event of events) {
                // Remove trailing numbers in brackets (e.g., "Title [12]")
                // Regex: Space + escaped [ + digits + escaped ] + end of string
                if (/\s\[\d+\]$/.test(event.title)) {
                    const cleanTitle = event.title.replace(/\s\[\d+\]$/, '');
                    await supabase.from('influencer_events').update({ title: cleanTitle }).eq('id', event.id);
                }
            }
        }
    }
    console.log('✅ Fix Complete!');
}

fixProfilesAndTitles();
