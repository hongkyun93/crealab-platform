
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY! // Using service role to bypass RLS first to see if data exists
const supabaseAnon = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!) // For testing RLS

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

async function reproduce() {
    console.log("--- 1. Listing ALL invitations (Admin) ---")
    const { data: allInvites, error: listError } = await supabaseAdmin
        .from('team_invitations')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5)

    if (listError) console.error("List Error:", listError)
    else console.log("Recent Invites:", allInvites)

    if (!allInvites || allInvites.length === 0) {
        console.log("No invitations found. Cannot test.")
        return
    }

    const testCode = allInvites[0].invite_code
    console.log(`\n--- 2. Testing Query for code: ${testCode} (Anon Client) ---`)

    // Exact query from app/join/[code]/page.tsx
    const { data: invite, error: inviteError } = await supabaseAnon
        .from('team_invitations')
        .select('*, profiles:created_by(id, display_name, email, avatar_url)')
        .eq('invite_code', testCode)
        .single()

    if (inviteError) {
        console.error("❌ Anon Query Error:", inviteError)
        console.log("Possible Causes: RLS on team_invitations, RLS on profiles, or missing relationship.")
    } else {
        console.log("✅ Anon Query Success:", invite)
    }

    // Check relationship specifically
    console.log(`\n--- 3. Testing Relationship (Admin) ---`)
    const { data: relTest, error: relError } = await supabaseAdmin
        .from('team_invitations')
        .select('*, profiles:created_by(id)')
        .eq('invite_code', testCode)
        .single()

    if (relError) {
        console.error("❌ Relationship Error (Admin):", relError)
    } else {
        console.log("✅ Relationship Success (Admin):", relTest)
    }
}

reproduce()
