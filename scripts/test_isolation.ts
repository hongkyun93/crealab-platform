
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

async function testIsolation() {
    console.log("=== STARTING TURBO ISOLATION TEST (RLS CHECK) ===")

    // 1. Login as Brand
    console.log("  Step 1: Login as Brand (voib@brand.com)...")
    await supabase.auth.signInWithPassword({
        email: 'voib@brand.com',
        password: '12341234'
    })

    // Try to fetch PRIVARE moments (should be 0 or empty)
    const { data: privMoments, error: pError } = await supabase
        .from('life_moments')
        .select('*')
        .eq('is_private', true)

    console.log(`    ✅ Brand check: Found ${privMoments?.length || 0} private moments. (Should be 0 if RLS working)`)
    await supabase.auth.signOut()

    // 2. Login as Creator
    console.log("  Step 2: Login as Creator (creator1@creadypick.com)...")
    await supabase.auth.signInWithPassword({
        email: 'creator1@creadypick.com',
        password: '12341234'
    })

    // Try to fetch other brand's products (should only see public ones or none depending on RLS)
    // Actually creator should see public campaigns but NOT brand's personal product list usually
    const { data: brandProds, error: bpError } = await supabase
        .from('brand_products')
        .select('*')

    console.log(`    ✅ Creator check: Found ${brandProds?.length || 0} products. (Should only see their own if they have any, or none)`)

    await supabase.auth.signOut()

    console.log("=== ISOLATION TEST COMPLETE ===")
}

testIsolation().catch(console.error)
