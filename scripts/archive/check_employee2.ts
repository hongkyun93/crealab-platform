import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const client = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function main() {
    const email = 'employee2@creadypick.com';

    console.log(`\n🔍 Checking: ${email}\n`);

    // Check profiles table
    const { data: profile, error: profileError } = await client
        .from('profiles')
        .select('*')
        .eq('email', email)
        .single();

    if (profileError) {
        console.log('❌ Profile Error:', profileError.message);
        console.log('   Code:', profileError.code);
    } else if (profile) {
        console.log('✅ Profile Found:');
        console.log('   ID:', profile.id);
        console.log('   Email:', profile.email);
        console.log('   Name:', profile.display_name);
        console.log('   Role:', profile.role || '(NULL)');
        console.log('   User Type:', profile.user_type);
        console.log('   Created:', new Date(profile.created_at).toLocaleString());
    } else {
        console.log('❌ Profile NOT found');
    }

    // Check auth user
    const { data: authData } = await client.auth.admin.listUsers();
    const authUser = authData.users.find((u: any) => u.email === email);

    if (authUser) {
        console.log('\n✅ Auth User Found:');
        console.log('   ID:', authUser.id);
        console.log('   Email:', authUser.email);
        console.log('   Confirmed:', authUser.email_confirmed_at ? 'Yes' : 'No');
        console.log('   Created:', new Date(authUser.created_at).toLocaleString());
        console.log('   Metadata:', JSON.stringify(authUser.user_metadata, null, 2));
    } else {
        console.log('\n❌ Auth User NOT found');
    }

    // Try to find by name
    const { data: byName } = await client
        .from('profiles')
        .select('id, email, display_name')
        .ilike('display_name', '%크픽직원2%');

    if (byName && byName.length > 0) {
        console.log('\n🔎 Found by name search:');
        for (const p of byName) {
            console.log('   -', p.email, '(', p.display_name, ')');
        }
    }
}

main();
