
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY! // Attempt to use service role if available for admin check

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkNotifications() {
    console.log("Checking notifications table...")

    // Try to select 1 notification (might return error if table doesn't exist or RLS)
    const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .limit(1)

    if (error) {
        console.error("Error accessing notifications table:", error)
        console.log("Details:", JSON.stringify(error, null, 2))
    } else {
        console.log("Success! Notifications table accessible.")
        console.log("Data sample:", data)
    }
}

checkNotifications()
