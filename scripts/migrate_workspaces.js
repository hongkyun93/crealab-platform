
require('dotenv').config({ path: '.env.local' });
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const connectionString = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL;

if (!connectionString) {
    console.error("Error: DATABASE_URL or SUPABASE_DB_URL is not set in .env.local");
    console.log("Please ensure you have the direct connection string (postgres://...) set up.");
    process.exit(1);
}

const client = new Client({
    connectionString: connectionString,
});

async function migrate() {
    try {
        await client.connect();
        console.log("Connected to database...");

        const sqlPath = path.join(__dirname, '../documents/07_create_workspaces.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log("Executing migration: 07_create_workspaces.sql");
        await client.query(sql);

        console.log("Migration executed successfully!");

        // Optional: Verify table creation
        const res = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('workspaces', 'workspace_members');
    `);

        console.log("Created tables:", res.rows.map(r => r.table_name).join(', '));

    } catch (err) {
        console.error("Migration failed:", err);
    } finally {
        await client.end();
    }
}

migrate();
