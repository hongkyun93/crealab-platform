import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const client = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function checkMCNAccount() {
    console.log('\n🔍 Checking all MCN accounts...\n');

    // Get all profiles with MCN role or user_type
    const { data: profiles, error } = await client
        .from('profiles')
        .select('*')
        .or('role.eq.mcn,user_type.eq.mcn');

    if (error) {
        console.log('❌ Error:', error.message);
        return;
    }

    if (!profiles || profiles.length === 0) {
        console.log('❌ No MCN accounts found!');
        return;
    }

    console.log(`✅ Found ${profiles.length} MCN profile(s):\n`);

    for (const p of profiles) {
        console.log('─'.repeat(50));
        console.log('ID:', p.id);
        console.log('Email:', p.email);
        console.log('Name:', p.display_name);
        console.log('role:', p.role || '(NULL)'); // <-- THIS IS THE KEY!
        console.log('user_type:', p.user_type);
        console.log('Created:', new Date(p.created_at).toLocaleString());
        console.log();
    }

    console.log('='.repeat(50));
    console.log('\n📋 DIAGNOSIS:\n');

    const hasNullRole = profiles.some(p => !p.role);

    if (hasNullRole) {
        console.log('⚠️  PROBLEM FOUND:');
        console.log('   Some MCN accounts have NULL role!');
        console.log('   This causes redirect to /onboarding');
        console.log('\n💡 SOLUTION:');
        console.log('   Update role column to match user_type');
    } else {
        console.log('✅ All MCN accounts have proper role set');
    }
}

checkMCNAccount();
