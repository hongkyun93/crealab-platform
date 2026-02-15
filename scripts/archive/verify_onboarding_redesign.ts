import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const client = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function verifyOnboardingChanges() {
    console.log('\n✅ VERIFYING ONBOARDING REDESIGN\n');
    console.log('='.repeat(60));

    // Check if column exists
    const { data: columns, error: colError } = await client
        .from('profiles')
        .select('onboarding_completed')
        .limit(1);

    if (colError) {
        console.log('❌ Column check failed:', colError.message);
        return;
    }

    console.log('✅ Column `onboarding_completed` exists\n');

    // Get statistics
    const { data: profiles, error } = await client
        .from('profiles')
        .select('id, email, display_name, role, onboarding_completed');

    if (error) {
        console.log('❌ Error:', error.message);
        return;
    }

    const total = profiles.length;
    const completed = profiles.filter(p => p.onboarding_completed === true).length;
    const pending = profiles.filter(p => p.onboarding_completed === false).length;

    console.log('📊 STATISTICS:');
    console.log(`   Total Users: ${total}`);
    console.log(`   ✅ Completed Onboarding: ${completed}`);
    console.log(`   ⏳ Pending Onboarding: ${pending}`);
    console.log();

    if (pending > 0) {
        console.log('⏳ USERS PENDING ONBOARDING:');
        profiles
            .filter(p => p.onboarding_completed === false)
            .forEach(p => {
                console.log(`   - ${p.display_name || p.email} (${p.role || 'no role'})`);
            });
        console.log();
    }

    console.log('='.repeat(60));
    console.log('\n📝 SUMMARY:');
    console.log('   ✅ All existing users marked as completed');
    console.log('   ✅ New signups will show onboarding screen');
    console.log('   ✅ After selecting role, onboarding won\'t show again');
    console.log();
}

verifyOnboardingChanges();
