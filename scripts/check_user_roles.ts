import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const client = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function main() {
    // Get recent users (non-test)
    const { data: profiles, error } = await client
        .from('profiles')
        .select('id, email, role, user_type, display_name, created_at')
        .order('created_at', { ascending: false })
        .limit(20);

    if (error) {
        console.error('Failed to fetch profiles:', error);
        return;
    }

    console.log(`\n📊 Recent ${profiles.length} users:\n`);

    for (const p of profiles) {
        console.log('---');
        console.log('Email:', p.email);
        console.log('role:', p.role || '(NULL)');
        console.log('user_type:', p.user_type || '(NULL)');
        console.log('display_name:', p.display_name || '(NULL)');
        console.log('Created:', new Date(p.created_at).toLocaleString());
    }
}

main();
