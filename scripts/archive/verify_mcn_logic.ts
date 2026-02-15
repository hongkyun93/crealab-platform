
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Missing Supabase Config');
    process.exit(1);
}

const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
});

async function prepareUser(email: string, role: string) {
    const { data: { users } } = await adminClient.auth.admin.listUsers();
    const user = users.find(u => u.email === email);

    if (user) {
        console.log(`Found existing user: ${email} (${user.id})`);
        await adminClient.auth.admin.updateUserById(user.id, { password: 'password123' });
        const { error: profileError } = await adminClient.from('profiles').upsert({
            id: user.id,
            email: user.email,
            role: role,
            display_name: email.split('@')[0]
        });
        if (profileError) console.error(`Error updating profile for ${email}:`, profileError);

        // Verify existence
        const { data: pCheck } = await adminClient.from('profiles').select('id').eq('id', user.id).single();
        if (!pCheck) console.error(`CRITICAL: Profile for ${email} NOT FOUND after upsert!`);

        return user;
    } else {
        console.log(`Creating new user: ${email}`);
        const { data: { user: newUser }, error } = await adminClient.auth.admin.createUser({
            email,
            password: 'password123',
            email_confirm: true,
            user_metadata: {
                display_name: email.split('@')[0],
                role_type: role === 'brand' ? 'brand' : 'influencer'
            }
        });
        if (error) throw error;
        if (!newUser) throw new Error('Failed to create user');

        await adminClient.from('profiles').upsert({
            id: newUser.id,
            email: newUser.email,
            role: role,
            display_name: email.split('@')[0]
        });
        return newUser;
    }
}

async function main() {
    console.log('🚀 Starting MCN Proxy Verification (Robust Team Setup)...');

    const agencyEmail = 'creator_scale_36@example.com';
    const creatorEmail = 'creator_scale_37@example.com';
    const brandEmail = 'e2e_brand@test.com';

    try {
        console.log('Preparing Users...');
        const agencyUser = await prepareUser(agencyEmail, 'admin');
        const creatorUser = await prepareUser(creatorEmail, 'influencer');
        const brandUser = await prepareUser(brandEmail, 'brand');

        console.log(`Agency: ${agencyUser.id}`);
        console.log(`Creator: ${creatorUser.id}`);
        console.log(`Brand: ${brandUser.id}`);

        // Clean up existing team memberships to start fresh (for verification)
        await adminClient.from('team_members').delete().eq('user_id', agencyUser.id);
        await adminClient.from('team_members').delete().eq('user_id', creatorUser.id);

        // Create FRESH Team
        const timestamp = Date.now();
        console.log('Creating NEW MCN Team...');
        const slug = `mcn-verify-${timestamp}`;
        const { data: team, error: teamError } = await adminClient
            .from('teams')
            .insert({
                name: `MCN Verif Team ${timestamp}`,
                slug: slug
            })
            .select()
            .single();
        if (teamError) throw teamError;
        console.log(`Team Created: ${team.id}`);

        // Add Members explicitly
        const { error: m1 } = await adminClient.from('team_members').insert({ team_id: team.id, user_id: agencyUser.id, role: 'owner' });
        if (m1) console.error('Error adding agency:', m1);

        const { error: m2 } = await adminClient.from('team_members').insert({ team_id: team.id, user_id: creatorUser.id, role: 'member' });
        if (m2) console.error('Error adding creator:', m2);

        console.log('Team Members Added.');

        // Login as Agency
        console.log('Logging in as Agency...');
        const authClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        const { data: authData, error: authError } = await authClient.auth.signInWithPassword({
            email: agencyEmail,
            password: 'password123'
        });
        if (authError) throw authError;

        // TEST 1: Proxy Moment Creation
        console.log('🧪 TEST 1: Proxy Moment Creation');
        // Note: influencer_id is the target creator
        const { data: moment, error: momentError } = await authClient
            .from('life_moments')
            .insert({
                title: 'Proxy Moment Verification',
                influencer_id: creatorUser.id,
                event_date: new Date().toISOString(),
                category: 'Verification'
            })
            .select()
            .single();

        if (momentError) {
            console.error('❌ Moment Creation Failed:', momentError);
            process.exit(1);
        }

        // RLS will hide team_id from the response for the creator, but maybe not for the agency owner?
        // Actually, if I created it, I should see it?
        // Let's check. If team_id is missing, we might need admin check.
        if (moment.team_id === team.id) {
            console.log('✅ Moment Created Successfully with Correct Team ID!');
        } else {
            // Fallback check with admin if RLS hides it
            const { data: adminMoment } = await adminClient.from('life_moments').select('team_id').eq('id', moment.id).single();
            if (adminMoment?.team_id === team.id) {
                console.log('✅ Moment Created Successfully (Verified via Admin)!');
            } else {
                console.error(`❌ Moment Team ID Mismatch. Expect ${team.id}, Got ${moment.team_id || adminMoment?.team_id}`);
                process.exit(1);
            }
        }

        // TEST 2: Proxy Campaign Application
        console.log('🧪 TEST 2: Proxy Campaign Application');
        const { data: campaign } = await adminClient
            .from('campaigns')
            .insert({
                brand_id: brandUser.id,
                product_name: 'Verif Product',
                title: 'Verif Campaign',
                status: 'active',
                description: 'test'
            })
            .select()
            .single();

        const { data: proposal, error: proposalError } = await authClient
            .from('campaign_proposals')
            .insert({
                campaign_id: campaign.id,
                influencer_id: creatorUser.id,
                message: 'Proxy App Verification',
                status: 'applied'
            })
            .select()
            .single();

        if (proposalError) {
            console.error('❌ Campaign Application Failed:', proposalError);
            process.exit(1);
        }

        // Check influencer_team_id
        if (proposal.influencer_team_id === team.id) {
            console.log('✅ Campaign Application Successful with Correct Team ID!');
        } else {
            // Fallback check
            const { data: adminProposal } = await adminClient.from('campaign_proposals').select('influencer_team_id').eq('id', proposal.id).single();
            if (adminProposal?.influencer_team_id === team.id) {
                console.log('✅ Campaign Application Successful (Verified via Admin)!');
            } else {
                console.error(`❌ Proposal Team ID Mismatch. Expect ${team.id}, Got ${proposal.influencer_team_id || adminProposal?.influencer_team_id}`);
                process.exit(1);
            }
        }


        // TEST 3: Proxy Product Application (Outbound/Brand Product Apply)
        console.log('🧪 TEST 3: Proxy Product Application');

        // 1. Create a Product (as Brand)
        const { data: product, error: prodError } = await adminClient
            .from('brand_products')
            .insert({
                brand_id: brandUser.id,
                name: 'Proxy Test Product',
                price: 50000,
                category: 'Beauty'
            })
            .select()
            .single();

        if (prodError) {
            console.error('❌ Product Creation Failed:', prodError);
            process.exit(1);
        }
        console.log('   Product Created:', product.id);

        // 2. Apply to Product (as Agency for Creator)
        // Note: BrandProductDetailView uses 'addProposal' which inserts to 'brand_proposals' with status 'applied'
        const { data: productProposal, error: ppError } = await authClient
            .from('brand_proposals')
            .insert({
                brand_id: brandUser.id,
                influencer_id: creatorUser.id,
                product_id: product.id,
                product_name: product.name,
                message: 'Proxy Product Application Test',
                status: 'applied'
            })
            .select()
            .single();

        if (ppError) {
            console.error('❌ Product Application Failed:', ppError);
            console.log('   (This is EXPECTED if RLS for brand_proposals is missing)');
            // Do not exit, just log failure to confirm hypothesis
        } else {
            console.log('✅ Product Application Successful!');
        }

        // =================================================================
        // LIFECYCLE EXTENSION: ACCEPTANCE & CONTRACT
        // =================================================================
        console.log('\n🔄 EXTENDED LIFECYCLE VERIFICATION (Accept & Contract)');

        // 1. Brand Accepts Moment (from Test 1)
        console.log('   [Scenario 1 Extension] Brand Proposing to Moment...');
        const { data: momentProp, error: mpError } = await adminClient
            .from('moment_proposals')
            .insert({
                brand_id: brandUser.id,
                influencer_id: creatorUser.id,
                moment_id: moment.id,
                product_name: "Moment Collab",
                status: 'offered',
                message: 'Let us collab!'
            })
            .select()
            .single();

        if (mpError) { console.error('❌ Brand Moment Proposal Failed:', mpError); }
        else {
            console.log('   Brand Proposed to Moment:', momentProp.id);

            // Agency Accepts Proposal
            console.log('   Agency Accepting Moment Proposal...');
            const { error: acceptError } = await authClient
                .from('moment_proposals')
                .update({ status: 'accepted' })
                .eq('id', momentProp.id);

            if (acceptError) console.error('❌ Agency Accept Failed (Moment):', acceptError);
            else console.log('✅ Agency Accepted Moment Proposal');

            // Agency Signs Contract
            console.log('   Agency Signing Contract (Moment)...');
            const { error: signError } = await authClient
                .from('moment_proposals')
                .update({
                    contract_status: 'signed_by_influencer',
                    influencer_signature: 'Agency Proxy Signature'
                })
                .eq('id', momentProp.id);

            if (signError) console.error('❌ Agency Sign Failed (Moment):', signError);
            else console.log('✅ Agency Signed Contract (Moment)');
        }

        // 2. Brand Accepts Campaign Application (from Test 2)
        console.log('\n   [Scenario 2 Extension] Brand Accepting Campaign Application...');
        const { error: campAcceptError } = await adminClient
            .from('campaign_proposals')
            .update({ status: 'accepted' })
            .eq('id', proposal.id);

        if (campAcceptError) console.error('❌ Brand Accept Failed (Campaign):', campAcceptError);
        else {
            console.log('   Brand Accepted Campaign Application');

            // Agency Signs Contract
            console.log('   Agency Signing Contract (Campaign)...');
            const { error: signError } = await authClient
                .from('campaign_proposals')
                .update({
                    contract_status: 'signed_by_influencer',
                    influencer_signature: 'Agency Proxy Signature'
                })
                .eq('id', proposal.id);

            if (signError) console.error('❌ Agency Sign Failed (Campaign):', signError);
            else console.log('✅ Agency Signed Contract (Campaign)');
        }

        // 3. Brand Accepts Product Application (from Test 3)
        if (productProposal) {
            console.log('\n   [Scenario 3 Extension] Brand Accepting Product Application...');
            const { error: prodAcceptError } = await adminClient
                .from('brand_proposals')
                .update({ status: 'accepted' })
                .eq('id', productProposal.id);

            if (prodAcceptError) console.error('❌ Brand Accept Failed (Product):', prodAcceptError);
            else {
                console.log('   Brand Accepted Product Application');

                // Agency Signs Contract
                console.log('   Agency Signing Contract (Product)...');
                const { error: signError } = await authClient
                    .from('brand_proposals')
                    .update({
                        contract_status: 'signed_by_influencer',
                        influencer_signature: 'Agency Proxy Signature'
                    })
                    .eq('id', productProposal.id);

                if (signError) console.error('❌ Agency Sign Failed (Product):', signError);
                else console.log('✅ Agency Signed Contract (Product)');
            }
        }

        console.log('🎉 VERIFICATION COMPLETE');

    } catch (err: any) {
        console.error('Verification Failed:', err.message || err);
        process.exit(1);
    }
}

main();
