
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkTables() {
    console.log("Checking tables...")

    const { error } = await supabase
        .from('team_invitations')
        .select('*')
        .limit(1)

    if (error) {
        console.log("Error accessing 'team_invitations':", error.message)
        console.log("Code:", error.code)
    } else {
        console.log("'team_invitations' table exists and is accessible.")
    }

    const { error: memberError } = await supabase
        .from('team_members')
        .select('*')
        .limit(1)

    if (memberError) {
        console.log("Error accessing 'team_members':", memberError.message)
    } else {
        console.log("'team_members' table exists and is accessible.")
    }
}

checkTables()
