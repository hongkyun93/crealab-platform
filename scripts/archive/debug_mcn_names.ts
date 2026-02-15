
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const MCN_USER_ID = 'f474a96e-527c-4cab-acc1-51cc45e06595';
const MOMENT_ID = 'cc97243b-09fe-4e3a-a7a8-77d6bb7de129';
const MOMENT_TEAM_ID = 'ecef0e58-2098-40a0-ac33-75018112e1f0';
const USER_TEAM_ID = 'd77b3784-8493-4433-8185-e484def9e157';

async function main() {
    // Get Team Names
    const { data: teams } = await adminClient
        .from('teams')
        .select('id, name')
        .in('id', [MOMENT_TEAM_ID, USER_TEAM_ID]);

    console.log('Teams:', teams);

    const momentTeam = teams?.find(t => t.id === MOMENT_TEAM_ID);
    const userTeam = teams?.find(t => t.id === USER_TEAM_ID);

    console.log(`User is in: ${userTeam?.name} (${userTeam?.id})`);
    console.log(`Moment is in: ${momentTeam?.name} (${momentTeam?.id})`);

    // Check if User is invited to Moment Team
    const { data: invitations } = await adminClient
        .from('team_invitations')
        .select('*')
        .eq('team_id', MOMENT_TEAM_ID)
        .eq('email', 'soomin@love.com'); // Assuming MCN email

    if (invitations && invitations.length > 0) {
        console.log('Found pending invitations for User to Moment Team:', invitations);
    } else {
        console.log('No pending invitations found for soomin@love.com to Moment Team.');
    }
}

main();
