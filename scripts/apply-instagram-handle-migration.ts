
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function applyMigration() {
    console.log("Applying migration 95_add_instagram_handle.sql...")

    const migrationPath = path.join(process.cwd(), 'documents', '95_add_instagram_handle.sql')
    const sql = fs.readFileSync(migrationPath, 'utf8')

    // Since Supabase JS client doesn't support raw SQL execution directly for DDL unless wrapped in a function,
    // we use the REST API via fetch or rely on the dashboard SQL editor. 
    // Wait, the user might have a function for executing SQL or we can just log instructions.
    // Actually, `rpc` can call a function if one exists to run arbitrary SQL (security risk usually).
    // Or we rely on the `pg` driver if we had connection string, but we only have URL/Key.

    // Attempting to use `rpc` if a `exec_sql` function exists (common pattern in some setups),
    // otherwise we will instruct the user.

    // For now, let's try to query something harmless to check connection.
    try {
        // We can't really execute DDL with just the JS client unless there is a specific RPC function exposed.
        // The previous scripts were just checking SELECT permissions.
        console.log("Migration file created at:", migrationPath)
        console.log("Please execute this SQL in your Supabase Dashboard SQL Editor.")
        console.log("---------------------------------------------------")
        console.log(sql)
        console.log("---------------------------------------------------")

        // Verify connection
        const { data, error } = await supabase.from('profiles').select('count', { count: 'exact', head: true })
        if (error) throw error
        console.log("Connection verified. Profile count approx:", data)

    } catch (err: any) {
        console.error("Error:", err.message)
    }
}

applyMigration()
