
import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'
import { Client } from 'pg'

dotenv.config({ path: '.env.local' })

async function run() {
    const dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL

    if (!dbUrl) {
        console.error("❌ Error: DATABASE_URL is missing.")
        console.error("Please run this script with your Supabase Connection String:")
        console.error('Example: DATABASE_URL="postgresql://postgres.[ref]:[password]@..." npx tsx scripts/apply_master.ts')
        process.exit(1)
    }

    const client = new Client({
        connectionString: dbUrl,
    })

    try {
        await client.connect()
        console.log("✅ Connected to database.")

        const sqlPath = path.join(process.cwd(), 'documents', '00_master_schema.sql')
        console.log(`📖 Reading SQL from ${sqlPath}...`)

        const sql = fs.readFileSync(sqlPath, 'utf8')

        console.log("🚀 Executing SQL...")
        // We execute the whole file as one query. 
        // Note: pg library handles multiple statements in one query string usually.
        await client.query(sql)

        console.log("✅ Master Schema applied successfully!")
        console.log("The invitation logic (MCN owner permissions, invite_code generation) should now be fixed.")

    } catch (err: any) {
        console.error("❌ SQL Execution Error:", err.message)
        if (err.position) {
            console.error(`   at position: ${err.position}`)
        }
        process.exit(1)
    } finally {
        await client.end()
    }
}

run()
