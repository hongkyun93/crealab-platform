
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const MCN_USER_ID = 'f474a96e-527c-4cab-acc1-51cc45e06595';
const MOMENT_ID = 'cc97243b-09fe-4e3a-a7a8-77d6bb7de129';

async function main() {
    console.log(`Checking access for User ${MCN_USER_ID} to Moment ${MOMENT_ID}`);

    // 1. Get Moment Details
    const { data: moment, error: momentError } = await adminClient
        .from('life_moments')
        .select('*')
        .eq('id', MOMENT_ID)
        .single();

    if (momentError) {
        console.error('Error fetching moment:', momentError);
        return;
    }
    console.log('Moment Details:', {
        id: moment.id,
        team_id: moment.team_id,
        influencer_id: moment.influencer_id,
        is_private: moment.is_private
    });

    // 2. Get User's Teams
    const { data: teamMembers, error: teamError } = await adminClient
        .from('team_members')
        .select('team_id, role')
        .eq('user_id', MCN_USER_ID);

    if (teamError) {
        console.error('Error fetching user teams:', teamError);
        return;
    }

    const userTeamIds = teamMembers.map(tm => tm.team_id);
    console.log('User Teams:', userTeamIds);

    // 3. Check Match
    const momentTeamId = moment.team_id;
    const hasAccess = userTeamIds.includes(momentTeamId);

    console.log('---------------------------------------------------');
    if (hasAccess) {
        console.log('✅ User IS in the Moment\'s Team.');
        console.log('If access is blocked, it might be RLS caching or policy issue.');
    } else {
        console.log('❌ User is NOT in the Moment\'s Team.');
        console.log(`Moment Team ID: ${momentTeamId}`);
        console.log(`User Team IDs: ${JSON.stringify(userTeamIds)}`);

        if (!momentTeamId) {
            console.log('⚠️ Moment has NO team_id. This is likely the cause if RLS requires team_id check.');

            // Check if influencer has a team
            const { data: infTeams } = await adminClient.from('team_members').select('team_id').eq('user_id', moment.influencer_id);
            console.log('Influencer Teams:', infTeams);
        }
    }
}

main();
