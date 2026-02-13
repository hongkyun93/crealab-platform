
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Use Service Role Key to bypass RLS

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials (URL or Service Role Key)");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testCampaignProposalValues() {
    console.log("Starting test: Create a test campaign proposal...");

    // 1. Fetch a valid user ID from existing data (to avoid admin API)
    let userId;

    // Try to get from existing proposals first
    const { data: existingProposals } = await supabase
        .from('campaign_proposals')
        .select('influencer_id')
        .limit(1);

    if (existingProposals && existingProposals.length > 0) {
        userId = existingProposals[0].influencer_id;
        console.log(`Using existing influencer ID from proposals: ${userId}`);
    } else {
        // Fallback: try to get from profiles
        const { data: profiles } = await supabase.from('profiles').select('id').eq('role', 'creator').limit(1);
        if (profiles && profiles.length > 0) {
            userId = profiles[0].id;
            console.log(`Using creator profile ID: ${userId}`);
        } else {
            // Second fallback: just get any profile
            const { data: anyProfile } = await supabase.from('profiles').select('id').limit(1);
            if (anyProfile && anyProfile.length > 0) {
                userId = anyProfile[0].id;
                console.log(`Using generic profile ID: ${userId}`);
            } else {
                console.error("Could not find a valid user ID to test with.");
                return;
            }
        }
    }
    const creator = { id: userId };

    // 2. Fetch a test campaign
    const { data: campaigns, error: campaignError } = await supabase
        .from('campaigns')
        .select('id, title')
        .limit(1);

    if (campaignError || !campaigns || campaigns.length === 0) {
        console.error("Failed to fetch campaigns:", campaignError);
        return;
    }
    const testCampaign = campaigns[0];
    console.log(`Using campaign: ${testCampaign.title} (${testCampaign.id})`);

    // 3. Insert into campaign_proposals
    const testProposal = {
        campaign_id: testCampaign.id,
        influencer_id: creator.id,
        message: "Test proposal from script verification",
        price_offer: 500000,
        motivation: "Testing motivation field",
        content_plan: "Testing content plan",
        portfolio_links: ["https://test.com/portfolio"],
        instagram_handle: "test_handle",
        status: 'offered'
    };

    const { data: insertedProposal, error: insertError } = await supabase
        .from('campaign_proposals')
        .insert(testProposal)
        .select()
        .single();

    if (insertError) {
        console.error("FAILED: Could not insert proposal:", insertError);
    } else {
        console.log("SUCCESS: Proposal inserted successfully into campaign_proposals!");
        console.log(insertedProposal);

        // 4. Verify fetching logic (PlatformProvider simulation)
        const { data: fetchedProposals, error: fetchError } = await supabase
            .from('campaign_proposals')
            .select('*')
            .eq('id', insertedProposal.id);

        if (fetchError || !fetchedProposals || fetchedProposals.length === 0) {
            console.error("FAILED: Could not fetch inserted proposal:", fetchError);
        } else {
            console.log("SUCCESS: Verified proposal exists in database.");
        }

        // Cleanup (optional)
        await supabase.from('campaign_proposals').delete().eq('id', insertedProposal.id);
        console.log("Cleanup: Test proposal deleted.");
    }
}

testCampaignProposalValues();
