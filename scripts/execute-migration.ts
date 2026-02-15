
import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'
import { Client } from 'pg'

dotenv.config({ path: '.env.local' })

async function run() {
    const dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL

    if (!dbUrl) {
        console.error("❌ DATABASE_URL or POSTGRES_URL not found in environment.")
        console.log("Cannot execute SQL directly without connection string.")
        process.exit(1)
    }

    console.log("✅ Database connection string found.")

    const client = new Client({
        connectionString: dbUrl,
    })

    try {
        await client.connect()
        console.log("✅ Connected to database.")

        const migrationPath = path.join(process.cwd(), 'documents', '95_add_instagram_handle.sql')
        const sql = fs.readFileSync(migrationPath, 'utf8')

        console.log("Executing SQL from:", migrationPath)
        await client.query(sql)

        console.log("✅ Migration applied successfully!")
    } catch (err: any) {
        console.error("❌ Error executing migration:", err.message)
        process.exit(1)
    } finally {
        await client.end()
    }
}

run()
