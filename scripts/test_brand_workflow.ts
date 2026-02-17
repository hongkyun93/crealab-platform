
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

async function testBrandWorkflow() {
    console.log("=== STARTING TURBO BRAND WORKFLOW TEST ===")

    // 1. Auth as Brand
    const { data: { user }, error: authError } = await supabase.auth.signInWithPassword({
        email: 'voib@brand.com',
        password: '12341234'
    })
    if (authError || !user) throw new Error("Auth failed")
    console.log("  Step 1: Auth SUCCESS")

    // 2. Campaign CRUD
    console.log("  Step 2: Campaign CRUD...")
    const { data: campaign, error: cError } = await supabase
        .from('campaigns')
        .insert({
            brand_id: user.id,
            title: 'TURBO TEST CAMPAIGN',
            product_name: 'Turbo Juice',
            category: '건강',
            description: 'This is a test campaign description.',
            status: 'active'
        })
        .select()
        .single()

    if (cError) {
        console.error("    ❌ Create FAIL:", cError.message)
    } else {
        console.log("    ✅ Create SUCCESS: ID", campaign.id)

        // Update
        const { error: uError } = await supabase
            .from('campaigns')
            .update({ title: 'TURBO TEST CAMPAIGN UPDATED' })
            .eq('id', campaign.id)
        console.log(uError ? "    ❌ Update FAIL" : "    ✅ Update SUCCESS")

        // Delete
        const { error: dError } = await supabase
            .from('campaigns')
            .delete()
            .eq('id', campaign.id)
        console.log(dError ? "    ❌ Delete FAIL" : "    ✅ Delete SUCCESS")
    }

    // 3. Product CRUD
    console.log("  Step 3: Product CRUD...")
    const { data: product, error: pError } = await supabase
        .from('brand_products')
        .insert({
            brand_id: user.id,
            name: 'TURBO TEST PRODUCT',
            category: '테크',
            description: 'Test product description'
        })
        .select()
        .single()

    if (pError) {
        console.error("    ❌ Create FAIL:", pError.message)
    } else {
        console.log("    ✅ Create SUCCESS: ID", product.id)

        // Update
        const { error: puError } = await supabase
            .from('brand_products')
            .update({ name: 'TURBO TEST PRODUCT UPDATED' })
            .eq('id', product.id)
        console.log(puError ? "    ❌ Update FAIL" : "    ✅ Update SUCCESS")

        // Delete
        const { error: pdError } = await supabase
            .from('brand_products')
            .delete()
            .eq('id', product.id)
        console.log(pdError ? "    ❌ Delete FAIL" : "    ✅ Delete SUCCESS")
    }

    console.log("=== BRAND WORKFLOW TEST COMPLETE ===")
}

testBrandWorkflow().catch(console.error)
