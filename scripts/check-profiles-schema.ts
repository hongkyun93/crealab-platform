
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

async function checkProfilesSchema() {
    console.log("Checking profiles table columns...")

    // We can't easily desc table via client, but we can fetch a row and look at keys
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .limit(1)

    if (error) {
        console.error("Error fetching profiles:", error)
        return
    }

    if (data && data.length > 0) {
        console.log("Columns in profiles table:", Object.keys(data[0]))
    } else {
        console.log("No profiles found to inspect columns.")
    }
}

checkProfilesSchema()
