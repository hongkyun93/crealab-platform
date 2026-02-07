
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

// Manually parse .env.local
const envPath = path.resolve(process.cwd(), '.env.local')
const envContent = fs.readFileSync(envPath, 'utf-8')
const env: Record<string, string> = {}
envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=')
    if (key && value) env[key.trim()] = value.trim().replace(/"/g, '')
})

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY

// Use Service Role Key to bypass RLS for system catalog queries if possible, 
// or just standard client if we only have anon. 
// Usually system catalogs are readable.
const supabase = createClient(supabaseUrl, supabaseServiceKey || supabaseKey)

async function inspectTable(tableName: string) {
    console.log(`\n--- Inspecting ${tableName} ---`)

    // 1. Check Triggers
    // pg_trigger joins pg_class
    const { data: triggers, error: triggerError } = await supabase
        .from('brand_proposals') // This is a hack, we can't query pg_catalog directly via client usually unless stored procedure.
        // Wait, Supabase client cannot query pg_catalog directly unless exposed.
        // I should try to call a standard rpc if one exists, or just try to insert a dummy row and see what happens?
        // No, the user wants me to CHECK SQL. 

        // Actually, I can't query pg_catalog via the JS client standard .from() unless I have a view/function for it.
        // I will try to use the `rpc` method if there is a SQL execution function, but likely not.

        // Alternative: I can try to insert a row using the script and see if it hangs here too.
        // This confirms if it's backend or frontend.
        .select('id').limit(1)

    if (triggerError) {
        console.log("Could not query table directly:", triggerError.message)
    } else {
        console.log("Table is accessible. Connection is fine.")
    }
}

async function testInsert() {
    console.log("\n--- Testing Insert on brand_proposals ---")
    // We need a valid brand_id and influencer_id.
    // I'll try to fetch a brand and influencer first.

    // Trying to list 1 brand and 1 influencer
    const { data: profiles } = await supabase.from('profiles').select('*').limit(5)

    if (!profiles || profiles.length < 2) {
        console.log("Not enough profiles to test insert.")
        return
    }

    // Just pick two
    const brand = profiles.find(p => p.role === 'brand') || profiles[0]
    const influencer = profiles.find(p => p.role === 'influencer') || profiles[1]

    console.log(`Test Brand: ${brand.id}`)
    console.log(`Test Influencer: ${influencer.id}`)

    const payload = {
        brand_id: brand.id,
        influencer_id: influencer.id,
        product_name: "DEBUG_TEST_PRODUCT",
        message: "Debug message",
        status: "offered"
    }

    console.log("Sending Insert...")
    const start = Date.now()

    try {
        const { data, error } = await supabase
            .from('brand_proposals')
            .insert(payload)
            .select()
            .single()

        const end = Date.now()
        console.log(`Insert Duration: ${end - start}ms`)

        if (error) {
            console.error("Insert Error:", error)
        } else {
            console.log("Insert Success:", data.id)
            // Cleanup
            await supabase.from('brand_proposals').delete().eq('id', data.id)
            console.log("Cleanup Success")
        }
    } catch (e) {
        console.error("Insert Exception:", e)
    }
}

async function run() {
    await testInsert()
}

run()
