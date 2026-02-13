
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

async function verifyProposalVisibility() {
    console.log("--- Verifying Moment Proposal Visibility ---");

    // 1. Get a test creator ID (or list recent moment proposals to find one)
    const { data: recentProposals, error: propError } = await supabase
        .from('moment_proposals')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1);

    if (propError || !recentProposals || recentProposals.length === 0) {
        console.error("No moment proposals found to test.");
        return;
    }

    const testProposal = recentProposals[0];
    const influencerId = testProposal.influencer_id;
    console.log(`Testing with Proposal ID: ${testProposal.id}`);
    console.log(`Influencer ID: ${influencerId}`);
    console.log(`Moment ID: ${testProposal.moment_id}`);

    // 2. Simulate the query from ProposalProvider (fetchBrandProposals logic)
    // We want to see if this proposal is returned for this influencer
    const { data: momentRes, error: momentError } = await supabase
        .from('moment_proposals')
        .select(`
            *,
            brand:profiles!brand_id(display_name, avatar_url),
            influencer:profiles!influencer_id(display_name, avatar_url),
            moment:life_moments(title, event_date)
        `)
        // Logic from ProposalProvider: .or(`brand_id.eq.${id},influencer_id.eq.${id}`)
        .or(`brand_id.eq.${influencerId},influencer_id.eq.${influencerId}`)
        .order('created_at', { ascending: false });

    if (momentError) {
        console.error("Error executing provider query:", momentError);
        return;
    }

    // 3. Check if our test proposal is in the results
    const found = momentRes.find(p => p.id === testProposal.id);

    if (found) {
        console.log("\n[SUCCESS] Proposal returned by Provider Query.");
        console.log("Mapped Data Preview (what the UI expects):");
        console.log({
            id: found.id,
            brand_id: found.brand_id,
            moment_id: found.moment_id,
            event_id: found.moment_id, // This determines if the filter works
            product_name: found.product_name || found.conditions?.product_name,
            status: found.status
        });

        if (!found.moment) {
            console.warn("\n[WARNING] 'moment' relation is null. Is the moment deleted?");
        } else {
            console.log(`Linked Moment: ${found.moment.title}`);
        }

    } else {
        console.error("\n[FAILURE] Proposal NOT returned by Provider Query for this influencer ID.");
        console.log("Check RLS policies or query logic.");
    }
}

verifyProposalVisibility();
