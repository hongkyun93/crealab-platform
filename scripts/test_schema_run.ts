import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'
import { Client } from 'pg'

dotenv.config({ path: '.env.local' })

async function run() {
    const dbUrl = "postgresql://postgres.wbeyxjoqcwjbcuwvjrsa:ndmQFFh8ivSM5AM3MOdDFqr0ZPdxCgdPawvtG0HlnEJ0cm8eZFfoz3cNTFjkgqE@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres"

    if (!dbUrl) {
        console.error("❌ Error: DATABASE_URL is missing.")
        process.exit(1)
    }

    const client = new Client({
        connectionString: dbUrl,
    })

    try {
        await client.connect()
        console.log("✅ Connected to database.")

        const sqlPath = path.join(process.cwd(), 'supabase', 'migrations', '00_master_schema_v6.sql')
        console.log(`📖 Reading SQL from ${sqlPath}...`)

        const sql = fs.readFileSync(sqlPath, 'utf8')

        console.log("🚀 Executing SQL...")
        await client.query(sql)

        console.log("✅ Master Schema applied successfully!")

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
