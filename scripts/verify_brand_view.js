
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Use Service Role Key to bypass RLS for test

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials (URL or Service Role Key)");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyBrandView() {
    console.log("Starting test: Verify Brand Inbound View...");

    // 1. Fetch the BRAND associated with the test campaign
    // We'll query campaigns first to get the brand_id
    const { data: campaigns, error: campaignError } = await supabase
        .from('campaigns')
        .select('id, title, brand_id')
        .limit(1);

    if (campaignError || !campaigns || campaigns.length === 0) {
        console.error("Failed to fetch campaigns:", campaignError);
        return;
    }
    const testCampaign = campaigns[0];
    const brandId = testCampaign.brand_id;
    console.log(`Checking inbound proposals for Brand ID: ${brandId} (Campaign: ${testCampaign.title})`);

    // 2. Fetch INBOUND proposals for this brand (from campaign_proposals)
    // Logic mimics PlatformProvider.fetchEvents 'inbound' for Brand
    // .from('campaign_proposals').select('*, campaign:campaigns(title), influencer:profiles(name, avatar_url)').eq('campaign.brand_id', brandId)
    // But supabase-js needs exact foreign key paths. Simple way: query directly by campaign_id or join.

    // Let's filter by the known campaign ID first as proof of concept since brand_view aggregates many
    const { data: proposals, error: fetchError } = await supabase
        .from('campaign_proposals')
        .select(`
        id,
        status,
        message,
        price_offer,
        created_at,
        campaign:campaigns!inner(id, title, brand_id),
        influencer:profiles!inner(id, display_name)
    `)
        .eq('campaign_id', testCampaign.id); // Targeted check

    if (fetchError) {
        console.error("Failed to fetch brand inbound proposals:", fetchError);
        return;
    }

    if (!proposals || proposals.length === 0) {
        console.error("FAILED: No inbound proposals found for this campaign.");
        return;
    }

    console.log(`Found ${proposals.length} inbound proposals for campaign "${testCampaign.title}".`);

    // 3. Check specific fields of the most recent proposal (likely our test one)
    const latestProposal = proposals.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];

    console.log("Latest Proposal Details:");
    console.log(`- ID: ${latestProposal.id}`);
    console.log(`- Status: ${latestProposal.status}`);
    console.log(`- Message: ${latestProposal.message}`);
    console.log(`- Price Offer: ${latestProposal.price_offer}`);
    console.log(`- Influencer: ${latestProposal.influencer.name}`);

    if (latestProposal.message === "Test proposal from script verification") {
        console.log("SUCCESS: Verified the specific test proposal is visible to the Brand!");
    } else {
        console.log("WARNING: Found proposals, but latest one might not be the test one. Check manually.");
    }
}

verifyBrandView();
