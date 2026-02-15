
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
    console.log('🚀 Starting Signup Error Reproduction...');

    const testEmail = `signup_test_${Date.now()}@example.com`;
    const password = 'password123';

    try {
        console.log(`Attempting to create user: ${testEmail}`);

        // Scenario 1: Minimal Metadata (Simulating simple signup)
        const { data, error } = await adminClient.auth.admin.createUser({
            email: testEmail,
            password: password,
            email_confirm: true,
            user_metadata: {
                name: 'Signup Test User',
                role_type: 'influencer'
            }
        });

        if (error) {
            console.error('❌ User Creation Failed:', error);
            console.error('   Message:', error.message);
            // "Database error saving new user" usually comes here
        } else {
            console.log('✅ User Created Successfully:', data.user.id);

            // Cleanup
            await adminClient.auth.admin.deleteUser(data.user.id);
            console.log('   (Cleaned up test user)');
        }

    } catch (err: any) {
        console.error('Unexpected Error:', err);
    }
}

main();
