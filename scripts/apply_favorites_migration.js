
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyMigration() {
    const sqlPath = path.join(process.cwd(), 'documents', 'ensure_favorites_schema.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('Applying migration...');

    const { data, error } = await supabase.rpc('exec_sql', { sql: sql });

    if (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }

    console.log('Migration successful:', data);
}

applyMigration();
