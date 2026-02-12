
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'

// Load env vars
const envPath = path.resolve(process.cwd(), '.env.local')
if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath })
} else {
    console.log(".env.local not found")
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

async function main() {
    const id = '87351c72-d6c4-4cf0-9a40-9fd73f7d7dca'

    console.log(`Searching for ID: ${id}`)

    // 1. Try campaigns table
    let { data: campaign, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('id', id)
        .single()

    if (campaign) {
        console.log("FOUND IN CAMPAIGNS:")
        console.log(JSON.stringify(campaign, null, 2))
        return
    }

    // 2. Try products table (sometimes called brand_products)
    console.log("Not found in campaigns, checking brand_products...")
    // Note: The error message suggested 'brand_products'
    const { data: brandProduct, error: bpError } = await supabase
        .from('brand_products')
        .select('*')
        .eq('id', id)
        .single()

    if (brandProduct) {
        console.log("FOUND IN BRAND_PRODUCTS:")
        console.log(JSON.stringify(brandProduct, null, 2))
        return
    }

    // 3. Try products table (just in case)
    /*
    const { data: product, error: pError } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single()
    
    if (product) {
         console.log("FOUND IN PRODUCTS:")
         console.log(JSON.stringify(product, null, 2))
         return
    }
    */

    console.log("Not found in any table.")
    if (error) console.error("Campaign Error:", error.message)
    if (bpError) console.error("BrandProduct Error:", bpError.message)
}

main()
