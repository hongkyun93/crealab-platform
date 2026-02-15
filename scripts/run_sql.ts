
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.');
    process.exit(1);
}

const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function main() {
    // Get SQL from command line argument or stdin
    let sql = process.argv[2];

    if (!sql) {
        // Try reading from stdin if no argument
        try {
            sql = fs.readFileSync(0, 'utf-8');
        } catch (e) {
            // Ignore
        }
    }

    if (!sql || !sql.trim()) {
        console.error('Usage: ts-node scripts/run_sql.ts "SELECT * FROM ... "');
        console.error('Or pipe SQL: echo "SELECT 1" | ts-node scripts/run_sql.ts');
        console.error('NOTE: This script uses the exec_sql RPC function which must be enabled in the database.');
        process.exit(1);
    }

    console.log('Executing SQL using admin privileges...');
    console.log('---------------------------------------------------');
    console.log(sql);
    console.log('---------------------------------------------------');

    const { data, error } = await adminClient.rpc('exec_sql', { sql });

    if (error) {
        console.error('❌ Execution Failed:');
        console.error(error.message);
        console.error(JSON.stringify(error, null, 2));
        process.exit(1);
    }

    console.log('✅ Execution Successful.');
    if (data) {
        console.log('Output:', JSON.stringify(data, null, 2));
    }
}

main();
