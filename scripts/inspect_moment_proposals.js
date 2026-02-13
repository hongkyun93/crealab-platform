
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

async function inspectMomentProposals() {
    console.log("Fetching recent moment proposals...");

    const { data, error } = await supabase
        .from('moment_proposals')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

    if (error) {
        console.error("Error fetching proposals:", error);
        return;
    }

    console.log(`Found ${data.length} proposals.`);

    data.forEach((p, index) => {
        console.log(`\n--- Proposal ${index + 1} ---`);
        console.log(`ID: ${p.id}`);
        console.log(`Price Offer: ${p.price_offer}`); // Checked in previous step
        console.log(`Conditions:`, JSON.stringify(p.conditions, null, 2));

        // specifically check for condition_final_submission_date
        const c = p.conditions || {};
        console.log(`[CHECK] condition_final_submission_date: ${c.condition_final_submission_date}`);
    });
}

inspectMomentProposals();
