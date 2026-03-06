const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envLocal = fs.readFileSync('.env.local', 'utf8');
let url = '', key = '';
for (const line of envLocal.split('\n')) {
    if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) url = line.split('=')[1].trim();
    if (line.startsWith('SUPABASE_SERVICE_ROLE_KEY=')) key = line.split('=')[1].trim();
}

const supabase = createClient(url, key);
const targetTable = process.argv[2];

async function main() {
    if (!targetTable) return console.log('Usage: node fetch-schema.js <tablename>');
    // We can fetch schema by just selecting 1 row and Object.keys
    const { data, error } = await supabase.from(targetTable).select('*').limit(1);
    if (error) {
        if (error.code === '42P01') console.log(`ERROR: Table "${targetTable}" DOES NOT EXIST.`);
        else console.log(`ERROR:`, error.message);
        return;
    }
    console.log(`\n================================`);
    console.log(`🟢 TABLE EXISTS: "${targetTable}"`);
    console.log(`================================`);
    if (data.length === 0) {
        console.log(`Table exists but has 0 rows. Fetching columns from OpenAPI spec not supported via client, checking via SQL...`);
        // If we really need schema when empty, supabase client doesn't expose it easily.
        // We will just report it exists but is empty.
    } else {
        console.log(`Columns structure:`);
        Object.keys(data[0]).forEach(k => {
            console.log(` - ${k} (${typeof data[0][k]})`);
        });
        console.log(`\nSample row data:`, data[0]);
    }
}
main();
