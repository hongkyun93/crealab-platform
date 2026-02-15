import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const client = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function main() {
    console.log('\n🧪 Testing NULL Role Creation After Fix\n');

    // Create test user WITHOUT role metadata
    const testEmail = `test_null_role_${Date.now()}@test.com`;
    const { data: authData, error: authError } = await client.auth.admin.createUser({
        email: testEmail,
        password: 'password123',
        email_confirm: true,
        user_metadata: { name: 'Test No Role User' }
        // NO role or role_type in metadata → should create NULL role
    });

    if (authError) {
        console.error('❌ Failed to create test user:', authError);
        return;
    }

    console.log('✅ Created test user:', testEmail);

    // Wait a bit for trigger to complete
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Check profile
    const { data: profile } = await client
        .from('profiles')
        .select('id, email, role, user_type, display_name')
        .eq('id', authData.user.id)
        .single();

    console.log('\n📋 Profile Data:');
    console.log('  email:', profile?.email);
    console.log('  role:', profile?.role === null ? '(NULL) ✅ CORRECT!' : `"${profile?.role}" ❌ WRONG!`);
    console.log('  user_type:', profile?.user_type);
    console.log('  display_name:', profile?.display_name);

    // Check if team was created
    const { data: teams, count } = await client
        .from('team_members')
        .select('*, teams(*)', { count: 'exact' })
        .eq('user_id', authData.user.id);

    console.log('\n👥 Teams:');
    if (count === 0) {
        console.log('  No teams created ✅ CORRECT (NULL role should not create team)');
    } else {
        console.log('  ❌ WRONG! Teams were created:', teams);
    }

    console.log('\n✅ Test Complete!');
    console.log('\n📝 Next Steps:');
    console.log('1. Try logging in with:', testEmail);
    console.log('2. Password: password123');
    console.log('3. Should redirect to /onboarding because role is NULL');
}

main();
