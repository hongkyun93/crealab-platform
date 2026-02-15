
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function inspectTable() {
    console.log("Inspecting team_invitations columns...")

    // Just select one row and print keys to see column names
    const { data: rows, error } = await supabase
        .from('team_invitations')
        .select('*')
        .limit(1)

    if (error) {
        console.error("Error selecting:", error)
        return
    }

    if (rows && rows.length > 0) {
        console.log("Columns found:", Object.keys(rows[0]))
        console.log("Sample Data:", rows[0])
    } else {
        console.log("No rows found, cannot infer columns from data.")
        // If no rows, try checking information_schema via exec_sql if possible
    }
}

inspectTable()
