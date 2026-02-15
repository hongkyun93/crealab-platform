import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const client = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function main() {
    console.log('\n🧪 Testing Onboarding Redirect Logic\n');

    // Create test user WITHOUT role
    const testEmail = `test_norole_${Date.now()}@test.com`;
    const { data: authData, error: authError } = await client.auth.admin.createUser({
        email: testEmail,
        password: 'password123',
        email_confirm: true,
        user_metadata: { name: 'Test User No Role' }
        // Intentionally NOT setting role in metadata
    });

    if (authError) {
        console.error('❌ Failed to create test user:', authError);
        return;
    }

    console.log('✅ Created test user:', testEmail);
    console.log('User ID:', authData.user.id);

    // Check profile
    const { data: profile } = await client
        .from('profiles')
        .select('id, email, role, user_type')
        .eq('id', authData.user.id)
        .single();

    console.log('\n📋 Profile Data:');
    console.log('  email:', profile?.email);
    console.log('  role:', profile?.role || '(NULL) ← Should redirect to /onboarding');
    console.log('  user_type:', profile?.user_type);

    console.log('\n✅ Test Setup Complete!');
    console.log('\nNext steps:');
    console.log('1. Try logging in with:', testEmail);
    console.log('2. Password: password123');
    console.log('3. Should redirect to /onboarding because role is NULL');

    // Cleanup
    console.log('\nCleanup: Delete test user? (y/n)');
}

main();
