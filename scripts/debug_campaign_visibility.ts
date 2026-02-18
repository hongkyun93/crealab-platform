
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function debugCampaignVisibility() {
    console.log('--- Debugging Campaign Visibility ---')

    // 1. Log in as the brand user (You need to provide the email/password or use a service role for admin check)
    // For this script, let's use Service Role to see ALL data first to confirm existence, then check RLS if possible?
    // Actually, client-side RLS debugging is hard without login. 
    // Let's use the SERVICE_ROLE_KEY to bypass RLS and see what the data LOOKS like.

    const supabaseAdmin = createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    // 2. Fetch specific brand's campaigns
    // Replace with the specific brand ID if known, or fetch a brand first.
    // I'll fetch the most recent campaign created.

    const { data: campaigns, error } = await supabaseAdmin
        .from('campaigns')
        .select('id, title, brand_id, team_id, status')
        .limit(5)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching campaigns (Admin):', error)
        return
    }

    console.log('Recent Campaigns (Admin View):', campaigns)

    if (campaigns && campaigns.length > 0) {
        const sampleCampaign = campaigns[0]
        console.log('\n--- Sample Campaign Data ---')
        console.log('ID:', sampleCampaign.id)
        console.log('Brand ID:', sampleCampaign.brand_id)
        console.log('Team ID:', sampleCampaign.team_id)

        // 3. Check the Brand User's Team
        const { data: brandUser, error: brandError } = await supabaseAdmin
            .from('profiles')
            .select('id, email, role')
            .eq('id', sampleCampaign.brand_id)
            .single()

        if (brandUser) {
            console.log('\n--- Brand User Data ---')
            console.log('User ID:', brandUser.id)
            console.log('Email:', brandUser.email)

            const { data: teamMembers, error: tmError } = await supabaseAdmin
                .from('team_members')
                .select('team_id, role')
                .eq('user_id', brandUser.id)

            console.log('Team Memberships:', teamMembers)

            if (teamMembers && teamMembers.length > 0) {
                const matches = teamMembers.some(tm => tm.team_id === sampleCampaign.team_id)
                console.log('\n>>> DIRECT MATCH CHECK <<<')
                console.log(`Does Brand Team ID (${teamMembers[0].team_id}) match Campaign Team ID (${sampleCampaign.team_id})? ${matches}`)
            } else {
                console.log('\n>>> MISMATCH DETECTED <<<')
                console.log('Brand User has NO team memberships.')
            }
        }
    }
}

debugCampaignVisibility()
