
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const MCN_USER_ID = 'f474a96e-527c-4cab-acc1-51cc45e06595';
const CREATOR_TEAM_ID = 'ecef0e58-2098-40a0-ac33-75018112e1f0';

async function main() {
    console.log(`Adding MCN User ${MCN_USER_ID} to Creator Team ${CREATOR_TEAM_ID}...`);

    const { error } = await adminClient
        .from('team_members')
        .insert({
            team_id: CREATOR_TEAM_ID,
            user_id: MCN_USER_ID,
            role: 'admin' // Grant Admin role for full management
        });

    if (error) {
        if (error.code === '23505') { // Unique violation
            console.log('User is already in the team!');
        } else {
            console.error('Error adding user to team:', error);
            process.exit(1);
        }
    } else {
        console.log('✅ Successfully added MCN user to Creator Team!');
    }
}

main();
