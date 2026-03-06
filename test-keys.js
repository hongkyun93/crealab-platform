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
    console.log(Object.keys((await supabase.from('life_moments').select('*').limit(1)).data[0] || {}));
    console.log(Object.keys((await supabase.from('product_applications').select('*').limit(1)).data[0] || {}));
    console.log(Object.keys((await supabase.from('moment_proposals').select('*').limit(1)).data[0] || {}));
}
main();
