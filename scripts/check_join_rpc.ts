
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase URL or Service Role Key');
    process.exit(1);
}

const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function checkRpc() {
    console.log('Checking for join_team_with_code RPC...');

    // Try to call the RPC with a dummy code. 
    // If it errors with "function not found", it doesn't exist.
    // If it errors with "Invalid invitation code", it exists.

    const { data, error } = await adminClient.rpc('join_team_with_code', { code: 'dummy-code' });

    if (error) {
        if (error.code === '42883') { // undefined_function
            console.log('❌ Function join_team_with_code does NOT exist.');
        } else if (error.message === 'Invalid invitation code') {
            console.log('✅ Function join_team_with_code exists (returned expected "Invalid code" error).');
        } else {
            console.log(`❓ Function might exist, but returned unexpected error: ${error.message} (Code: ${error.code})`);
            // If it's a PL/pgSQL error like "Invalid invitation code", it confirms existence.
            if (error.message.includes("Invalid invitation code")) {
                console.log('✅ Function exists.');
            } else if (error.message.includes("Not authenticated")) {
                // This also confirms existence, as the function checks auth first.
                console.log('✅ Function exists (Auth check hit).');
            }
        }
    } else {
        console.log('✅ Function exists and returned data (Unexpected for dummy code):', data);
    }
}

checkRpc();
