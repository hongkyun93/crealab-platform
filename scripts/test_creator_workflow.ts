
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

async function testCreatorWorkflow() {
    console.log("=== STARTING TURBO CREATOR WORKFLOW TEST ===")

    // 1. Auth as Creator
    const { data: { user }, error: authError } = await supabase.auth.signInWithPassword({
        email: 'creator1@creadypick.com',
        password: '12341234'
    })
    if (authError || !user) throw new Error("Auth failed")
    console.log("  Step 1: Auth SUCCESS")

    // 2. Rate Card Update
    console.log("  Step 2: Rate Card Update...")
    const testPrice = Math.floor(Math.random() * 1000000)
    const { error: rError } = await supabase
        .from('profiles')
        .update({ price_video: testPrice })
        .eq('id', user.id)

    if (rError) {
        console.error("    ❌ Update FAIL:", rError.message)
    } else {
        console.log("    ✅ Update SUCCESS: Set price_video to", testPrice)
    }

    // 3. Moment CRUD
    console.log("  Step 3: Moment CRUD...")
    const { data: moment, error: mError } = await supabase
        .from('life_moments')
        .insert({
            influencer_id: user.id,
            title: 'TURBO TEST MOMENT',
            description: 'This is a test moment.',
            category: '여행',
            event_date: '2026-03-01',
            status: 'active'
        })
        .select()
        .single()

    if (mError) {
        console.error("    ❌ Create FAIL:", mError.message)
    } else {
        console.log("    ✅ Create SUCCESS: ID", moment.id)

        // Update
        const { error: muError } = await supabase
            .from('life_moments')
            .update({ title: 'TURBO TEST MOMENT UPDATED' })
            .eq('id', moment.id)
        console.log(muError ? "    ❌ Update FAIL" : "    ✅ Update SUCCESS")

        // Delete
        const { error: mdError } = await supabase
            .from('life_moments')
            .delete()
            .eq('id', moment.id)
        console.log(mdError ? "    ❌ Delete FAIL" : "    ✅ Delete SUCCESS")
    }

    // 4. Discover Campaigns (Fetch)
    console.log("  Step 4: Campaign Discovery...")
    const { data: campaigns, error: fecError } = await supabase
        .from('campaigns')
        .select('id, title')
        .limit(5)

    if (fecError) {
        console.error("    ❌ Fetch FAIL:", fecError.message)
    } else {
        console.log(`    ✅ Fetch SUCCESS: Found ${campaigns?.length} campaigns.`)
    }

    console.log("=== CREATOR WORKFLOW TEST COMPLETE ===")
}

testCreatorWorkflow().catch(console.error)
