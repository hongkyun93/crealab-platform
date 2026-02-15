
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

const adminClient = createClient(supabaseUrl, supabaseServiceKey);

async function checkTable() {
    console.log('Checking for team_invitations table...');

    // Try to select from the table.
    const { data, error } = await adminClient
        .from('team_invitations')
        .select('*')
        .limit(1);

    if (error) {
        if (error.code === '42P01') { // undefined_table
            console.log('❌ Table team_invitations does NOT exist.');
        } else {
            console.log(`❌ Error checking table: ${error.message} (Code: ${error.code})`);
        }
    } else {
        console.log('✅ Table team_invitations exists.');
    }
}

checkTable();
