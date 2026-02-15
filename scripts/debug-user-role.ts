
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

async function checkUserRole() {
    const email = 'employee1@creadypick.com'
    console.log(`Checking role for: ${email}`)

    // 1. Get ID first
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role, email, id')
        .eq('email', email)
        .single()

    if (profileError) {
        console.error("Error fetching profile:", profileError)
        return
    }

    console.log("--- FOUND PROFILE ---")
    console.log("Email:", profile.email)
    console.log("Role:", profile.role)
    console.log("UUID:", profile.id)

    // 2. Simulate AuthProvider Query with JOIN
    console.log("\n--- SIMULATING AUTH PROVIDER QUERY ---")
    const { data: fullProfile, error: joinError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', profile.id)
        .single()

    if (joinError) {
        console.error("Auth Provider Query FAILED:", joinError)
        console.log("Reason: This failure triggers the fallback logic in auth-provider.tsx.")
        console.log("Fallback uses user_metadata.role. If that is missing/wrong, user becomes 'creator' by default.")
    } else {
        console.log("Auth Provider Query SUCCESS")
        console.log("Fetched Role:", fullProfile.role)
        console.log("Profile Keys:", Object.keys(fullProfile))
        console.log("Profile Data:", {
            tags: fullProfile.tags,
            price_video: fullProfile.price_video,
            tier: fullProfile.tier
        })
    }
    console.log("---------------------")
}

checkUserRole()
