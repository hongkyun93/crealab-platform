
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Missing Supabase Config');
    process.exit(1);
}

const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
});

async function main() {
    console.log('🚀 Starting DB Insert Debug (Profile Role)...');

    try {
        // 1. Get Existing User WITH Profile
        const { data: profile } = await adminClient
            .from('profiles')
            .select('id, email, role')
            .limit(1)
            .single();

        if (!profile) {
            console.error('❌ No profiles found to test with.');
            process.exit(1);
        }
        const testUserId = profile.id;
        const originalRole = profile.role;
        console.log('Using Existing Profile:', testUserId, profile.email, 'Role:', originalRole);

        // 2. Test Profile Role Update to 'influencer'
        console.log('2️⃣  Testing PROFILE ROLE update to "influencer"...');
        const { error: roleError } = await adminClient
            .from('profiles')
            .update({ role: 'influencer' })
            .eq('id', testUserId);

        if (roleError) {
            console.error('❌ Profile Role Update Failed:', roleError);
        } else {
            console.log('✅ Profile Role Update Success (Role "influencer" is allowed)');

            // Restore Original Role
            console.log('3️⃣  Restoring Original Role...');
            await adminClient.from('profiles').update({ role: originalRole }).eq('id', testUserId);
        }

    } catch (err: any) {
        console.error('Unexpected Error:', err);
    }
}

main();
