import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const client = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function fixMCNOnboarding() {
    console.log('\n🔍 CHECKING employee1@creadypick.com STATUS\n');
    console.log('='.repeat(60));

    // Get user profile
    const { data: profiles, error } = await client
        .from('profiles')
        .select('*')
        .eq('email', 'employee1@creadypick.com');

    if (error) {
        console.log('❌ Error:', error.message);
        return;
    }

    if (!profiles || profiles.length === 0) {
        console.log('❌ User not found!');
        return;
    }

    const profile = profiles[0];
    console.log('📊 CURRENT STATUS:');
    console.log(`   Email: ${profile.email}`);
    console.log(`   Name: ${profile.display_name || profile.name}`);
    console.log(`   Role: ${profile.role}`);
    console.log(`   User Type: ${profile.user_type}`);
    console.log(`   Onboarding Completed: ${profile.onboarding_completed}`);
    console.log();

    // Fix if needed
    if (profile.onboarding_completed !== true) {
        console.log('🔧 FIXING: Setting onboarding_completed = true');

        const { error: updateError } = await client
            .from('profiles')
            .update({ onboarding_completed: true })
            .eq('id', profile.id);

        if (updateError) {
            console.log('❌ Update failed:', updateError.message);
        } else {
            console.log('✅ FIXED! onboarding_completed = true');
        }
    } else {
        console.log('✅ Already set to true');
    }

    // Check again
    const { data: updated } = await client
        .from('profiles')
        .select('onboarding_completed')
        .eq('email', 'employee1@creadypick.com')
        .single();

    console.log();
    console.log('='.repeat(60));
    console.log(`Final onboarding_completed: ${updated?.onboarding_completed}`);
    console.log();
}

fixMCNOnboarding();
