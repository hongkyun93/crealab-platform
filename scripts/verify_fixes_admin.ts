
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function verify() {
    console.log('🔍 Verifying Fixes (Sampling 5 random creators)...');

    // Get 5 random profiles
    const { data: profiles } = await supabase.from('profiles')
        .select('*')
        .ilike('email', 'creator_real_%')
        .limit(5);

    if (!profiles) return;

    for (const p of profiles) {
        console.log(`\nUser: ${p.display_name} (${p.email})`);
        console.log(`  Avatar: ${p.avatar_url}`);

        const { data: events } = await supabase.from('influencer_events')
            .select('title, category')
            .eq('influencer_id', p.id);

        if (events) {
            events.forEach(e => console.log(`  - [${e.category}] ${e.title}`));
        }
    }
}

verify();
