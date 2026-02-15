
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'

// Load environment variables
const envLocalPath = path.resolve(process.cwd(), '.env.local')
if (fs.existsSync(envLocalPath)) {
    dotenv.config({ path: envLocalPath })
} else {
    dotenv.config()
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.')
    console.error('Make sure they are set in .env.local')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function applyMigration(filePath: string) {
    try {
        const sqlContent = fs.readFileSync(filePath, 'utf8')
        console.log(`Applying migration: ${filePath}`)

        const { error } = await supabase.rpc('exec_sql', { sql: sqlContent })

        if (error) {
            console.error('Error applying migration:', error)
            process.exit(1)
        }

        console.log('Migration applied successfully!')
    } catch (err) {
        console.error('Unexpected error:', err)
        process.exit(1)
    }
}

const migrationFile = process.argv[2]
if (!migrationFile) {
    console.error('Usage: npx tsx scripts/apply_migration.ts <path-to-sql-file>')
    process.exit(1)
}

applyMigration(migrationFile)
