const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envLocal = fs.readFileSync('.env.local', 'utf8');
let url = '', key = '';
for (const line of envLocal.split('\n')) {
    if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) url = line.split('=')[1].trim();
    if (line.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) key = line.split('=')[1].trim();
}

const supabase = createClient(url, key);

async function main() {
    console.log("Checking tables...");
    
    // Check product_applications
    const { data: pApps, error: pErr } = await supabase.from('product_applications').select('*').limit(1);
    console.log("product_applications fields:", pApps ? Object.keys(pApps[0] || {}) : pErr.message);

    // Check moment_proposals
    const { data: mProps, error: mErr } = await supabase.from('moment_proposals').select('*').limit(1);
    console.log("moment_proposals fields:", mProps ? Object.keys(mProps[0] || {}) : mErr.message);

    // Check settlements
    const { data: setts, error: sErr } = await supabase.from('settlements').select('*').limit(1);
    console.log("settlements fields:", setts ? Object.keys(setts[0] || {}) : sErr.message);

    // Check mcn_revenue_splits
    const { data: rev, error: rErr } = await supabase.from('mcn_revenue_splits').select('*').limit(1);
    console.log("mcn_revenue_splits fields:", rev ? Object.keys(rev[0] || {}) : rErr.message);
}

main();
