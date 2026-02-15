
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const MCN_TEAM_ID = 'd77b3784-8493-4433-8185-e484def9e157';
const CREATOR_USER_ID = 'f152eff0-dc3b-48ae-8657-d44eda8be864';

async function main() {
    console.log(`Checking membership of Creator ${CREATOR_USER_ID} in MCN Team ${MCN_TEAM_ID}...`);

    const { data: membership } = await adminClient
        .from('team_members')
        .select('*')
        .eq('team_id', MCN_TEAM_ID)
        .eq('user_id', CREATOR_USER_ID)
        .single();

    if (membership) {
        console.log('✅ Creator IS in MCN Team.');
        console.log('Membership:', membership);
    } else {
        console.log('❌ Creator is NOT in MCN Team.');
    }
}

main();
