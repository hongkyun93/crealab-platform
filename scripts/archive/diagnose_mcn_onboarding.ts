import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const client = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function diagnoseOnboardingIssue() {
    console.log('\n🔍 DIAGNOSING ONBOARDING REDIRECT ISSUE\n');
    console.log('='.repeat(60));

    // 1. Get ALL MCN accounts from profiles
    const { data: profiles, error } = await client
        .from('profiles')
        .select('*')
        .or('role.eq.mcn,user_type.eq.mcn');

    if (error) {
        console.log('❌ Error fetching profiles:', error.message);
        return;
    }

    if (!profiles || profiles.length === 0) {
        console.log('❌ NO MCN PROFILES FOUND!');
        return;
    }

    console.log(`✅ Found ${profiles.length} MCN profile(s)\n`);

    for (const p of profiles) {
        console.log('─'.repeat(60));
        console.log('📋 PROFILE DATA:');
        console.log('   ID:', p.id);
        console.log('   Email:', p.email);
        console.log('   Display Name:', p.display_name);
        console.log('   🔴 role:', p.role === null ? 'NULL ❌' : p.role === 'mcn' ? 'mcn ✅' : `'${p.role}' ⚠️`);
        console.log('   user_type:', p.user_type);
        console.log('   Created:', new Date(p.created_at).toLocaleString());
        console.log();

        // Check auth.users metadata
        const { data: authUsers } = await client.auth.admin.listUsers();
        const authUser = authUsers.users.find((u: any) => u.id === p.id);

        if (authUser) {
            console.log('🔐 AUTH.USERS METADATA:');
            console.log('   Email:', authUser.email);
            console.log('   Metadata role:', authUser.user_metadata?.role || '(not set)');
            console.log('   Metadata role_type:', authUser.user_metadata?.role_type || '(not set)');
            console.log();
        }
    }

    console.log('='.repeat(60));
    console.log('\n🔬 DIAGNOSIS:\n');

    const hasNullRole = profiles.some(p => p.role === null || p.role === undefined);
    const hasWrongRole = profiles.some(p => p.role && p.role !== 'mcn');

    if (hasNullRole) {
        console.log('🚨 PROBLEM IDENTIFIED:');
        console.log('   One or more MCN accounts have NULL role!');
        console.log('   This causes auth-provider to redirect to /onboarding');
        console.log();
        console.log('💡 ROOT CAUSE:');
        console.log('   Line 171 in auth-provider.tsx checks: !userWithRole.role');
        console.log('   If role is NULL, it redirects to /onboarding');
        console.log();
        console.log('🔧 SOLUTION:');
        console.log('   Run: UPDATE profiles SET role = \'mcn\' WHERE user_type = \'mcn\' AND role IS NULL;');
    } else if (hasWrongRole) {
        console.log('⚠️  INCONSISTENCY FOUND:');
        console.log('   role field exists but is not \'mcn\'');
        console.log('   Check if there\'s a mismatch between role and user_type');
    } else {
        console.log('✅ All MCN accounts have proper role set');
        console.log();
        console.log('❓ IF STILL REDIRECTING TO /ONBOARDING:');
        console.log('   1. Check browser console for auth-provider logs');
        console.log('   2. Verify server restarted after code changes');
        console.log('   3. Clear browser cache and cookies');
        console.log('   4. Check auth-provider.tsx Line 171 logic');
    }

    console.log();
}

diagnoseOnboardingIssue();
