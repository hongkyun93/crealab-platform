
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function verify() {
    console.log('🔍 Verifying Interaction Seeding...');

    // 1. Check Campaign Applications
    const { data: campaigns } = await supabase.from('campaigns').select('id, title');
    let campSuccess = true;

    if (campaigns) {
        for (const camp of campaigns) {
            const { count } = await supabase
                .from('campaign_proposals')
                .select('*', { count: 'exact', head: true })
                .eq('campaign_id', camp.id);

            if ((count || 0) < 5) {
                console.error(`❌ Campaign "${camp.title}" has only ${count} applications (Expected >= 5)`);
                campSuccess = false;
            }
        }
    }
    if (campSuccess) console.log('✅ All campaigns have at least 5 applications.');

    // 2. Check Moment Proposals
    const { data: moments } = await supabase.from('influencer_events').select('id, title');
    let momentSuccess = true;

    if (moments) {
        for (const mom of moments) {
            const { count } = await supabase
                .from('brand_proposals')
                .select('*', { count: 'exact', head: true })
                .eq('event_id', mom.id);

            if ((count || 0) < 5) {
                console.error(`❌ Moment "${mom.title}" has only ${count} proposals (Expected >= 5)`);
                momentSuccess = false;
            }
        }
    }
    if (momentSuccess) console.log('✅ All moments have at least 5 proposals.');

    if (campSuccess && momentSuccess) {
        console.log('✨ Verification Successful!');
    } else {
        console.error('⚠️ Verification Failed. See errors above.');
        process.exit(1);
    }
}

verify();
