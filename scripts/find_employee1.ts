import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const client = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function main() {
    const email = 'employee1@creadypick.com';

    console.log(`\n🔍 Searching for: ${email}\n`);

    // 1. Check auth.users
    const { data: authData } = await client.auth.admin.listUsers();
    const authUser = authData.users.find((u: any) => u.email === email);

    if (authUser) {
        console.log('✅ Found in auth.users (Supabase Auth):');
        console.log('   ID:', authUser.id);
        console.log('   Email:', authUser.email);
        console.log('   Email Confirmed:', authUser.email_confirmed_at ? 'Yes' : 'No');
        console.log('   Created:', new Date(authUser.created_at).toLocaleString());
        console.log('   Last Sign In:', authUser.last_sign_in_at ? new Date(authUser.last_sign_in_at).toLocaleString() : 'Never');
        console.log('   Metadata:', JSON.stringify(authUser.user_metadata, null, 2));
    } else {
        console.log('❌ NOT found in auth.users');
    }

    // 2. Check profiles
    const { data: profile, error: profileError } = await client
        .from('profiles')
        .select('*')
        .eq('email', email)
        .single();

    if (profile) {
        console.log('\n✅ Found in profiles table:');
        console.log('   ID:', profile.id);
        console.log('   Email:', profile.email);
        console.log('   Name:', profile.display_name);
        console.log('   Role:', profile.role || '(NULL)');
        console.log('   User Type:', profile.user_type);
        console.log('   Created:', new Date(profile.created_at).toLocaleString());
    } else if (profileError) {
        console.log('\n⚠️  Error checking profiles:', profileError.message);
    } else {
        console.log('\n❌ NOT found in profiles table');
    }

    // 3. Check team memberships
    if (authUser || profile) {
        const userId = authUser?.id || profile?.id;
        const { data: memberships } = await client
            .from('team_members')
            .select('*, teams(*)')
            .eq('user_id', userId);

        if (memberships && memberships.length > 0) {
            console.log('\n👥 Team Memberships:');
            for (const m of memberships) {
                console.log(`   - ${m.teams.name} (${m.role})`);
            }
        } else {
            console.log('\n👤 No team memberships');
        }
    }

    // 4. Summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 SUMMARY:');
    if (authUser && profile) {
        console.log('✅ Account exists in BOTH auth.users AND profiles');
        console.log('   → This is a fully registered user');
    } else if (authUser) {
        console.log('⚠️  Account exists in auth.users but NOT in profiles');
        console.log('   → Auth account created but profile incomplete');
    } else if (profile) {
        console.log('⚠️  Account exists in profiles but NOT in auth.users');
        console.log('   → Data inconsistency!');
    } else {
        console.log('❌ Account does NOT exist anywhere');
        console.log('   → Can register with this email');
    }
}

main();
