
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkInvite() {
    const code = 'd77b3784-mlnmsbgg'
    console.log(`Checking invite code: ${code}`)

    const { data: invite, error } = await supabase
        .from('team_invitations')
        .select('*, profiles:created_by(id, display_name, email, avatar_url)')
        .eq('invite_code', code)
        .single()

    if (error) {
        console.error("Error finding invite:", error)
    } else {
        console.log("Invite found:", invite)
        if (!invite.profiles) {
            console.warn("⚠️  Linked profile (created_by) not found or null.")
        }
    }
}

checkInvite()
