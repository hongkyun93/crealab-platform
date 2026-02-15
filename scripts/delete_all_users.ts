import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const client = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function deleteAllUsers() {
    console.log('\n⚠️  WARNING: This will DELETE ALL USER ACCOUNTS!\n');

    // 1. Get all auth users
    const { data: authData } = await client.auth.admin.listUsers();
    const users = authData.users;

    console.log(`📊 Found ${users.length} users in auth.users:\n`);

    for (const user of users) {
        console.log(`   - ${user.email} (ID: ${user.id.substring(0, 8)}...)`);
    }

    console.log('\n🗑️  Deleting all users...\n');

    let successCount = 0;
    let errorCount = 0;

    for (const user of users) {
        try {
            await client.auth.admin.deleteUser(user.id);
            console.log(`   ✅ Deleted: ${user.email}`);
            successCount++;
        } catch (error: any) {
            console.log(`   ❌ Error deleting ${user.email}:`, error.message);
            errorCount++;
        }
    }

    console.log('\n' + '='.repeat(50));
    console.log('📊 SUMMARY:');
    console.log(`   ✅ Successfully deleted: ${successCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);
    console.log(`   📝 Total: ${users.length}`);

    // 2. Verify profiles were cascade deleted
    const { count: profileCount } = await client
        .from('profiles')
        .select('*', { count: 'exact', head: true });

    console.log(`\n🔍 Remaining profiles: ${profileCount || 0}`);

    if (profileCount && profileCount > 0) {
        console.log('⚠️  Warning: Some profiles remain. Deleting manually...');
        const { error } = await client.from('profiles').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        if (error) {
            console.log('❌ Error deleting profiles:', error.message);
        } else {
            console.log('✅ All profiles deleted');
        }
    }

    console.log('\n✅ All user accounts deleted! Database is clean.\n');
}

deleteAllUsers();
