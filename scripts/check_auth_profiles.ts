import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const client = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function main() {
    // Get all auth users
    const { data: authData, error: authError } = await client.auth.admin.listUsers();

    if (authError) {
        console.error('Failed to fetch auth users:', authError);
        return;
    }

    console.log(`\n📊 Total Auth Users: ${authData.users.length}\n`);

    // Get all profiles
    const { data: profiles, error: profileError, count } = await client
        .from('profiles')
        .select('id, email, display_name, role, created_at', { count: 'exact' })
        .order('created_at', { ascending: false })
        .limit(10);

    if (profileError) {
        console.error('Failed to fetch profiles:', profileError);
        return;
    }

    console.log(`📋 Total Profiles: ${count}`);
    console.log(`📋 Recent Profiles (showing ${profiles.length}):\n`);

    for (const p of profiles) {
        const authUser = authData.users.find((u: any) => u.id === p.id);
        console.log('---');
        console.log('Email:', p.email);
        console.log('Name:', p.display_name || '(없음)');
        console.log('Role:', p.role || '(NULL)');
        console.log('Auth User:', authUser ? '✅ exists' : '❌ missing');
        console.log('Created:', new Date(p.created_at).toLocaleString());
    }

    // Check for orphaned auth users (auth.users without profiles)
    const allProfileIds = new Set(profiles.map(p => p.id));

    // Get full profile list to check
    const { data: allProfiles } = await client.from('profiles').select('id');
    const allProfileIdsSet = new Set(allProfiles?.map((p: any) => p.id) || []);

    const orphaned = authData.users.filter((u: any) => !allProfileIdsSet.has(u.id));

    if (orphaned.length > 0) {
        console.log(`\n⚠️  Found ${orphaned.length} auth users WITHOUT profiles:`);
        for (const u of orphaned.slice(0, 5)) {
            console.log('  -', u.email, '(created:', new Date(u.created_at).toLocaleString() + ')');
        }
    } else {
        console.log('\n✅ All auth users have corresponding profiles!');
    }
}

main();
