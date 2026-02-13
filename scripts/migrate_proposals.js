
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Use Service Role Key for admin rights

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials (URL or Service Role Key)");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function migrateProposals() {
    console.log("Starting migration: proposals -> campaign_proposals");

    // 1. Fetch all legacy proposals
    const { data: proposals, error: fetchError } = await supabase
        .from('proposals')
        .select('*');

    if (fetchError) {
        console.error("Error fetching proposals:", fetchError);
        return;
    }

    if (!proposals || proposals.length === 0) {
        console.log("No proposals found to migrate.");
        return;
    }

    console.log(`Found ${proposals.length} proposals to migrate.`);

    let successCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    // 2. Iterate and insert
    for (const p of proposals) {
        // Check if already exists
        const { data: existing } = await supabase
            .from('campaign_proposals')
            .select('id')
            .eq('id', p.id)
            .single();

        if (existing) {
            console.log(`Skipping Proposal ID ${p.id} (already exists)`);
            skippedCount++;
            continue;
        }

        // Map fields
        const newProposal = {
            id: p.id,
            campaign_id: p.campaign_id, // Assuming implicit UUID cast works or is string
            influencer_id: p.influencer_id,
            message: p.message,
            price_offer: p.cost, // Renamed column
            status: p.status,
            created_at: p.created_at,
            motivation: p.motivation,
            content_plan: p.content_plan,
            portfolio_links: p.portfolio_links,
            instagram_handle: p.instagram_handle,
            insight_screenshot: p.insight_screenshot
        };

        const { error: insertError } = await supabase
            .from('campaign_proposals')
            .insert(newProposal);

        if (insertError) {
            console.error(`Error migrating Proposal ID ${p.id}:`, insertError);
            errorCount++;
        } else {
            console.log(`Migrated Proposal ID ${p.id}`);
            successCount++;
        }
    }

    console.log("Migration completed.");
    console.log(`Success: ${successCount}`);
    console.log(`Skipped: ${skippedCount}`);
    console.log(`Errors: ${errorCount}`);
}

migrateProposals();
