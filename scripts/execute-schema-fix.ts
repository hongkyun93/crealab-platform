
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Missing Supabase URL or Service Role Key.")
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function run() {
    try {
        const migrationPath = path.join(process.cwd(), 'documents', '96_fix_invitation_schema.sql')
        const sql = fs.readFileSync(migrationPath, 'utf8')

        console.log("Executing SQL via RPC exec_sql...")
        console.log("SQL File:", migrationPath)

        const { error } = await supabase.rpc('exec_sql', { sql })

        if (error) {
            console.error("❌ RPC Error:", error.message)
            process.exit(1)
        }

        console.log("✅ Migration applied successfully via RPC!")
    } catch (err: any) {
        console.error("❌ Execution Error:", err.message)
        process.exit(1)
    }
}

run()
