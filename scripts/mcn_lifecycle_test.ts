
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const ADMIN_CLIENT = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Config
const TIMESTAMP = Date.now();
const LOGGING = true;

async function log(step: string, msg: string, data?: any) {
    if (LOGGING) console.log(`[${step}] ${msg}`, data ? JSON.stringify(data, null, 2) : '');
}

async function createUser(role: string, index: number, email_prefix: string) {
    const email = `${email_prefix}_${index}_${TIMESTAMP}@test.com`;
    const password = 'password123';

    const { data, error } = await ADMIN_CLIENT.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { name: `${role.toUpperCase()} ${index}`, role } // Metadata is used by trigger
    });

    if (error) throw new Error(`Failed to create user ${email}: ${error.message}`);

    // Simulate Onboarding: Update Profile Role
    // Trigger handles initial insert, but onboarding updates role/user_type
    await ADMIN_CLIENT.from('profiles').update({
        role: role,
        user_type: role === 'brand' ? 'brand' : 'influencer',
        display_name: `${role.toUpperCase()} ${index}`
    }).eq('id', data.user.id);

    return { ...data.user, email, password };
}

async function getClientForUser(user: any) {
    const { data, error } = await ADMIN_CLIENT.auth.signInWithPassword({
        email: user.email,
        password: user.password
    });
    if (error) throw error;

    return createClient(SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
        global: { headers: { Authorization: `Bearer ${data.session.access_token}` } }
    });
}

async function main() {
    try {
        log('INIT', 'Starting 16-Step MCN Full Lifecycle Verification (with Shipment)');

        // -------------------------------------------------------------
        // 1. MCN Signup (Staff 1, 2, 3)
        // -------------------------------------------------------------
        log('STEP 1', 'Creating MCN Staff 1, 2, 3');
        const mcn1 = await createUser('mcn', 1, 'mcn');
        const mcn2 = await createUser('mcn', 2, 'mcn');
        const mcn3 = await createUser('mcn', 3, 'mcn');
        log('STEP 1', 'MCN Staff Created', { id1: mcn1.id });

        // -------------------------------------------------------------
        // 2. Creator Signup (Creator 1, 2, 3)
        // -------------------------------------------------------------
        log('STEP 2', 'Creating Creators 1, 2, 3');
        const cr1 = await createUser('influencer', 1, 'creator');
        const cr2 = await createUser('influencer', 2, 'creator');
        const cr3 = await createUser('influencer', 3, 'creator');
        log('STEP 2', 'Creators Created', { id1: cr1.id });

        // -------------------------------------------------------------
        // 3. MCN Team Creation & Joining
        // -------------------------------------------------------------
        log('STEP 3', 'Creating MCN Team and Joining Members');
        // MCN1 creates team
        const mcn1Client = await getClientForUser(mcn1);
        const { data: team, error: teamErr } = await mcn1Client.from('teams')
            .insert({ name: 'Creadypick Team', slug: `creadypick-team-${TIMESTAMP}`, logo_url: null })
            .select().single();
        if (teamErr) throw new Error(`Team Creation Failed: ${teamErr.message}`);
        log('STEP 3', 'Team Created', team);

        // MCN1 Invites MCN2, MCN3, CR1, CR2, CR3
        const members = [mcn2, mcn3, cr1, cr2, cr3];
        for (const m of members) {
            // Direct Insert by Owner test
            // If this fails, we need to fix policy.
            const role = m.email.includes('mcn') ? 'admin' : 'member';
            const { error: joinErr } = await mcn1Client.from('team_members').insert({
                team_id: team.id,
                user_id: m.id,
                role: role
            });
            if (joinErr) throw new Error(`Member Addition Failed for ${m.email}: ${joinErr.message}`);
        }
        log('STEP 3', 'All Members Joined Team');

        // -------------------------------------------------------------
        // 4. MCN2 creates Moment for Creator 1, 2, 3
        // -------------------------------------------------------------
        log('STEP 4', 'MCN2 creates Moments for CR1, CR2, CR3');
        const mcn2Client = await getClientForUser(mcn2);

        const creators = [cr1, cr2, cr3];
        const moments = [];

        for (const cr of creators) {
            const momentData = {
                title: `Moment for ${cr.email}`,
                description: 'Proxy created moment',
                influencer_id: cr.id,
                is_private: false,
                status: 'active'
            };
            // Note: UI probably sets `team_id` or trigger sets it. 
            // We insert into `life_moments`.
            const { data: mom, error: momErr } = await mcn2Client.from('life_moments')
                .insert(momentData)
                .select().single();

            if (momErr) throw new Error(`Proxy Moment Creation Failed for ${cr.email}: ${momErr.message}`);
            moments.push(mom);
        }
        log('STEP 4', 'Moments Created', moments.map(m => m.id));

        // -------------------------------------------------------------
        // 5. Brand Signup (Brand 1, 2, 3)
        // -------------------------------------------------------------
        log('STEP 5', 'Creating Brands 1, 2, 3');
        const br1 = await createUser('brand', 1, 'brand');
        const br2 = await createUser('brand', 2, 'brand');
        const br3 = await createUser('brand', 3, 'brand');

        log('STEP 5', 'Brands Created');

        // -------------------------------------------------------------
        // 6. Brand 1 -> Creator 1 Moment Proposal
        // -------------------------------------------------------------
        log('STEP 6', 'Brand 1 proposes to Creator 1 Moment');
        const br1Client = await getClientForUser(br1);
        const moment1 = moments[0]; // CR1's moment
        const proposalData1 = {
            moment_id: moment1.id,
            brand_id: br1.id,
            influencer_id: cr1.id,
            product_name: 'Brand Product 1',
            price_offer: 1000,
            status: 'offered',
            message: 'Let us collab'
        };
        const { data: prop1, error: prop1Err } = await br1Client.from('moment_proposals')
            .insert(proposalData1)
            .select().single();
        if (prop1Err) throw new Error(`Brand 1 Proposal Failed: ${prop1Err.message}`);
        log('STEP 6', 'Proposal Sent', prop1.id);

        // -------------------------------------------------------------
        // 7. MCN1 Accepts Brand 1 Proposal (Scenario says MCN1)
        // -------------------------------------------------------------
        log('STEP 7', 'MCN1 Accepts Proposal & Submits Address');
        const { error: acceptErr } = await mcn1Client.from('moment_proposals')
            .update({ status: 'accepted' })
            .eq('id', prop1.id);
        if (acceptErr) throw new Error(`MCN1 Accept Failed: ${acceptErr.message}`);

        // 7-1. MCN1 inputs Shipping Address
        log('STEP 7-1', 'MCN1 inputs Shipping Address');
        const { error: addrErr } = await mcn1Client.from('moment_proposals')
            .update({
                shipping_name: 'Creator One',
                shipping_phone: '010-1234-5678',
                shipping_address: 'Seoul, Gangnam-gu'
            })
            .eq('id', prop1.id);
        if (addrErr) throw new Error(`MCN1 Address Input Failed: ${addrErr.message}`);

        // 7-2. Brand 1 inputs Tracking Number
        log('STEP 7-2', 'Brand 1 inputs Tracking Number');
        const { error: trackErr } = await br1Client.from('moment_proposals')
            .update({
                tracking_number: 'TRACK123456',
                delivery_status: 'shipped'
            })
            .eq('id', prop1.id);
        if (trackErr) throw new Error(`Brand 1 Tracking Input Failed: ${trackErr.message}`);

        // 7-3. Complete
        log('STEP 7-3', 'Completing Collaboration');
        const { error: completeErr } = await mcn1Client.from('moment_proposals')
            .update({ status: 'completed' })
            .eq('id', prop1.id);
        if (completeErr) throw new Error(`MCN1 Complete Failed: ${completeErr.message}`);
        log('STEP 7', 'Collaboration & Shipment Completed');

        // -------------------------------------------------------------
        // 8. Brand 2 Creates Campaign
        // -------------------------------------------------------------
        log('STEP 8', 'Brand 2 Creates Campaign');
        const br2Client = await getClientForUser(br2);
        // Campaign needs brand_id.
        const { data: camp, error: campErr } = await br2Client.from('campaigns')
            .insert({
                title: 'Brand 2 Campaign',
                brand_id: br2.id,
                description: 'Campaign Desc',
                product_name: 'Product 2',
                budget_min: 5000,
                budget_max: 15000,
                status: 'active'
            })
            .select().single();
        if (campErr) throw new Error(`Campaign Creation Failed: ${campErr.message}`);
        log('STEP 8', 'Campaign Created', camp.id);

        // -------------------------------------------------------------
        // 9. MCN2 (Staff 2) applies to Campaign on behalf of Creator 2
        // -------------------------------------------------------------
        log('STEP 9', 'MCN2 applies to Campaign for Creator 2');
        // Table: campaign_proposals (or campaign_applications?) 
        // Check schema for correct table name. Assuming 'campaign_proposals'.
        const { data: campProp, error: campPropErr } = await mcn2Client.from('campaign_proposals')
            .insert({
                campaign_id: camp.id,
                influencer_id: cr2.id, // Proxy application
                motivation: 'I want to join',
                status: 'pending'
            })
            .select().single();
        if (campPropErr) throw new Error(`Proxy Campaign Application Failed: ${campPropErr.message}`);
        log('STEP 9', 'Application Submitted', campProp.id);

        // -------------------------------------------------------------
        // 10. Brand 2 Accepts & Completes
        // -------------------------------------------------------------
        log('STEP 10', 'Brand 2 Accepts & Ships');
        const { error: br2AcceptErr } = await br2Client.from('campaign_proposals')
            .update({ status: 'accepted' })
            .eq('id', campProp.id);
        if (br2AcceptErr) throw new Error(`Brand 2 Accept Failed: ${br2AcceptErr.message}`);

        // 10-1. MCN2 inputs Shipping Address
        log('STEP 10-1', 'MCN2 inputs Shipping Address');
        const { error: campAddrErr } = await mcn2Client.from('campaign_proposals')
            .update({
                shipping_name: 'Creator Two',
                shipping_phone: '010-9876-5432',
                shipping_address: 'Busan, Haeundae-gu'
            })
            .eq('id', campProp.id);
        if (campAddrErr) throw new Error(`MCN2 Address Input Failed: ${campAddrErr.message}`);

        // 10-2. Brand 2 inputs Tracking Number
        log('STEP 10-2', 'Brand 2 inputs Tracking Number');
        const { error: campTrackErr } = await br2Client.from('campaign_proposals')
            .update({
                tracking_number: 'TRACK987654',
                delivery_status: 'shipped'
            })
            .eq('id', campProp.id);
        if (campTrackErr) throw new Error(`Brand 2 Tracking Input Failed: ${campTrackErr.message}`);

        // 10-3. Complete
        log('STEP 10-3', 'Completing Campaign Collaboration');
        const { error: br2CompleteErr } = await br2Client.from('campaign_proposals')
            .update({ status: 'completed' })
            .eq('id', campProp.id);
        if (br2CompleteErr) throw new Error(`Brand 2 Complete Failed: ${br2CompleteErr.message}`);
        log('STEP 10', 'Campaign Collaboration & Shipment Completed');

        // -------------------------------------------------------------
        // 11. Brand 3 Uploads Product
        // -------------------------------------------------------------
        log('STEP 11', 'Brand 3 Uploads Product');
        const br3Client = await getClientForUser(br3);
        const { data: prod, error: prodErr } = await br3Client.from('brand_products')
            .insert({
                brand_id: br3.id,
                name: 'Brand 3 Awesome Product',
                price: 50000,
                category: 'Beauty'
            })
            .select().single();
        if (prodErr) throw new Error(`Product Upload Failed: ${prodErr.message}`);
        log('STEP 11', 'Product Uploaded', prod.id);

        // -------------------------------------------------------------
        // 12. MCN3 (Staff 3) proposes to Product for Creator 3
        // -------------------------------------------------------------
        log('STEP 12', 'MCN3 proposes to Product for Creator 3');
        const mcn3Client = await getClientForUser(mcn3);
        // Table: brand_proposals
        const { data: brandProp, error: brandPropErr } = await mcn3Client.from('brand_proposals')
            .insert({
                product_id: prod.id,
                product_name: prod.name,
                brand_id: br3.id,
                influencer_id: cr3.id, // Proxy
                message: 'Lets collab on this product',
                status: 'offered'
            })
            .select().single();
        if (brandPropErr) throw new Error(`Proxy Product Proposal Failed: ${brandPropErr.message}`);
        log('STEP 12', 'Product Proposal Sent', brandProp.id);

        // -------------------------------------------------------------
        // 13. Brand 3 Accepts & Completes
        // -------------------------------------------------------------
        log('STEP 13', 'Brand 3 Accepts & Ships');
        const { error: br3AcceptErr } = await br3Client.from('brand_proposals')
            .update({ status: 'accepted' })
            .eq('id', brandProp.id);
        if (br3AcceptErr) throw new Error(`Brand 3 Accept Failed: ${br3AcceptErr.message}`);

        // 13-1. MCN3 inputs Shipping Address
        log('STEP 13-1', 'MCN3 inputs Shipping Address');
        const { error: brandAddrErr } = await mcn3Client.from('brand_proposals')
            .update({
                shipping_name: 'Creator Three',
                shipping_phone: '010-5555-5555',
                shipping_address: 'Incheon, Songdo'
            })
            .eq('id', brandProp.id);
        if (brandAddrErr) throw new Error(`MCN3 Address Input Failed: ${brandAddrErr.message}`);

        // 13-2. Brand 3 inputs Tracking Number
        log('STEP 13-2', 'Brand 3 inputs Tracking Number');
        const { error: brandTrackErr } = await br3Client.from('brand_proposals')
            .update({
                tracking_number: 'TRACK555555',
                delivery_status: 'shipped'
            })
            .eq('id', brandProp.id);
        if (brandTrackErr) throw new Error(`Brand 3 Tracking Input Failed: ${brandTrackErr.message}`);

        // 13-3. Complete
        log('STEP 13-3', 'Completing Product Collaboration');
        const { error: br3CompleteErr } = await br3Client.from('brand_proposals')
            .update({ status: 'completed' })
            .eq('id', brandProp.id);
        if (br3CompleteErr) throw new Error(`Brand 3 Complete Failed: ${br3CompleteErr.message}`);
        log('STEP 13', 'Product Collaboration & Shipment Completed');


        log('SUCCESS', 'All 16 MCN Scenarios (w/ Logistics) Passed Successfully! ✅');

    } catch (e: any) {
        console.error(`❌ SCENARIO FAILED: ${e.message}`);
        process.exit(1);
    }
}

main();
