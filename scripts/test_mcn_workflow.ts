
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

async function testMCNWorkflow() {
    console.log("=== STARTING TURBO MCN WORKFLOW TEST ===")

    // 1. Auth as MCN Employee
    const { data: { user }, error: authError } = await supabase.auth.signInWithPassword({
        email: 'employee1@creadypick.com',
        password: '12341234'
    })
    if (authError || !user) throw new Error("Auth failed")
    console.log("  Step 1: Auth SUCCESS")

    // 2. Fetch Teams
    console.log("  Step 2: Fetching Teams...")
    const { data: teamData, error: tError } = await supabase
        .from('team_members')
        .select(`
            role,
            team:teams (*)
        `)
        .eq('user_id', user.id)

    if (tError) {
        console.error("    ❌ Fetch FAIL:", tError.message)
    } else {
        const teams = teamData as any[]
        console.log(`    ✅ Fetch SUCCESS: Found ${teams?.length} teams.`)
        if (teams && teams.length > 0) {
            const teamId = teams[0].team.id
            console.log(`    Active Team ID: ${teamId}`)

            // 3. Fetch Team Members
            console.log("  Step 3: Fetching Team Members...")
            const { data: members, error: mError } = await supabase
                .from('team_members')
                .select('id, user_id, role')
                .eq('team_id', teamId)

            if (mError) {
                console.error("    ❌ Fetch FAIL:", mError.message)
            } else {
                console.log(`    ✅ Fetch SUCCESS: Found ${members?.length} members.`)
            }

            // 4. Invite Logic (Fetch pending invitations)
            console.log("  Step 4: Fetching Invitations...")
            const { data: invites, error: iError } = await supabase
                .from('team_invitations')
                .select('*')
                .eq('team_id', teamId)

            if (iError) {
                console.error("    ❌ Fetch FAIL:", iError.message)
            } else {
                console.log(`    ✅ Fetch SUCCESS: Found ${invites?.length} pending invitations.`)
            }
        }
    }

    console.log("=== MCN WORKFLOW TEST COMPLETE ===")
}

testMCNWorkflow().catch(console.error)
