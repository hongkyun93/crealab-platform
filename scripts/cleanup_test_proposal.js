
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanup() {
    const proposalId = '84ac33b7-5340-48ef-99c3-01e5e13387bb';
    console.log(`Cleaning up test proposal: ${proposalId}`);

    const { error } = await supabase
        .from('campaign_proposals')
        .delete()
        .eq('id', proposalId);

    if (error) {
        console.error("Error deleting proposal:", error);
    } else {
        console.log("Cleanup successful.");
    }
}

cleanup();
