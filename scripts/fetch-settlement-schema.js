const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fetchLiveSchema() {
    console.log('--- EXACT LIVE DB SCHEMA FETCH (Zero Guessing) ---');
    const tables = ['settlements', 'mcn_revenue_splits', 'teams', 'profiles', 'team_members'];

    for (const table of tables) {
        // Query 1 row to get exactly the columns currently present in the live Supabase
        const { data, error } = await supabase.from(table).select('*').limit(1);

        if (error) {
            console.error(`Error fetching table "${table}":`, error.message);
        } else if (!data || data.length === 0) {
            console.log(`Table "${table}" exists but is empty. Cannot infer columns via REST.`);
            // Try fetching via PostgREST OpenAPI spec using standard supabase js isn't supported easily.
        } else {
            console.log(`\n✅ TABLE: [${table}]`);
            console.log('   COLUMNS:', Object.keys(data[0]).join(', '));
        }
    }
}

fetchLiveSchema().catch(console.error);
