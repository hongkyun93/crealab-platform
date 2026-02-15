
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function run() {
    const sql = `
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'team_invitations'
        ORDER BY ordinal_position;
    `
    // We'll wrap this in a DO block to raise notice, since exec_sql doesn't return result sets generally (returns void).
    // Or we can try to select into a temp table?
    // Actually, exec_sql is defined as returning void.
    // So we can't get data back easily unless we raise exception/notice and capture it?
    // Supabase JS client doesn't capture notices easily.

    // Instead, let's just use the `exec_sql` to rename the column if it exists.
    // If we assume it is `invited_by`, let's try to rename it to `created_by`.

    // But better: let's try to SELECT specific columns.

    // Try selecting 'invited_by' column.
    const { data: d1, error: e1 } = await supabase.from('team_invitations').select('invited_by').limit(1)
    if (!e1) {
        console.log("Column 'invited_by' EXISTS.")
    } else {
        console.log("Column 'invited_by' query error:", e1.message)
    }

    // Try selecting 'created_by' column.
    const { data: d2, error: e2 } = await supabase.from('team_invitations').select('created_by').limit(1)
    if (!e2) {
        console.log("Column 'created_by' EXISTS.")
    } else {
        console.log("Column 'created_by' query error:", e2.message)
    }
}

run()
