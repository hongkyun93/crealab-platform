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
    // get MCN team
    const { data: team } = await supabase.from('teams').select('id').limit(1).maybeSingle();
    if (!team) return console.error('No team found');
    
    const { error } = await supabase.from('settlements').update({ team_id: team.id }).is('team_id', null);
    if (error) console.error('Update err:', error.message);
    else console.log('Successfully re-linked null team_ids to:', team.id);
    
    // Also re-create mcn_revenue_splits missing? The seed script handles this.
}
main();
