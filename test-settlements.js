const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envLocal = fs.readFileSync('.env.local', 'utf8');
let url = '', key = '';
for (const line of envLocal.split('\n')) {
    if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) url = line.split('=')[1].trim();
    if (line.startsWith('SUPABASE_SERVICE_ROLE_KEY=')) key = line.split('=')[1].trim();
}

const supabase = createClient(url, key);

async function main() {
    console.log('--- Checking [settlements] table ---');
    const res1 = await supabase.from('settlements').select('*').limit(1);
    console.log('Data:', res1.data);
    console.log('Error:', res1.error ? res1.error : 'Null (Table exists!)');
    
    console.log('--- Checking [get_team_settlements] RPC ---');
    const res2 = await supabase.rpc('get_team_settlements', { target_team_id: '00000000-0000-0000-0000-000000000000' });
    console.log('Data:', res2.data);
    console.log('Error:', res2.error ? res2.error : 'Null (RPC exists!)');
}
main();
