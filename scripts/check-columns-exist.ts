
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

// Load env vars from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase env vars")
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkSpecificColumns() {
    console.log("Checking for 'tags' and 'price_video' columns in profiles...")

    const { data, error } = await supabase
        .from('profiles')
        .select('tags, price_video')
        .limit(1)

    if (error) {
        console.error("Error fetching specific columns:", error.message)
        if (error.code === 'PGRST204') { // Column not found error code usually
            console.log("CONFIRMED: Columns do not exist.")
        }
    } else {
        console.log("SUCCESS: Columns exist.")
        console.log("Data:", data)
    }
}

checkSpecificColumns()
