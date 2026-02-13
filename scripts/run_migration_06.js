const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
    const sqlPath = path.join(__dirname, '../documents/06_add_moment_proposal_columns.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('Executing migration from:', sqlPath);

    const { error } = await supabase.rpc('exec_sql', { sql_query: sql });

    if (error) {
        console.error('Migration failed:', error);

        // Fallback: try raw query if RPC fails (though RPC is standard for DDL in some setups, usually direct connection is needed for DDL if RPC not set up)
        // NOTE: Supabase JS client cannot run raw SQL DDL directly without a specific RPC function usually. 
        // If 'exec_sql' RPC doesn't exist, this will fail.
        // However, we used this pattern before. 
        // If it fails, I will instruct user or use psql via terminal if available.
    } else {
        console.log('Migration successful!');
    }
}

runMigration();
