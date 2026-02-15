
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkSchema() {
    console.log("Checking team_invitations schema...")

    // We can't query information_schema easily with JS client unless we use RPC or just try to insert/select and see error.
    // Or we use the exec_sql RPC we just verified working!

    const sql = `
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns 
        WHERE table_name = 'team_invitations';
    `

    const { data, error } = await supabase.rpc('exec_sql', {
        sql: `
        DO $$ 
        DECLARE 
            r RECORD;
        BEGIN 
            FOR r IN ${sql} LOOP 
                RAISE NOTICE 'Column: % Type: % Nullable: %', r.column_name, r.data_type, r.is_nullable; 
            END LOOP; 
        END $$;
    ` })

    // The RAISE NOTICE won't be captured in the RPC response data easily with the current exec_sql implementation 
    // which just executes and returns void.
    // Let's just try to select * limit 1 and print data keys to see columns.

    const { data: rows, error: selectError } = await supabase
        .from('team_invitations')
        .select('*')
        .limit(1)

    if (selectError) {
        console.error("Select Error:", selectError)
    } else {
        console.log("Query successful. Row structure (if any):", rows && rows[0] ? Object.keys(rows[0]) : "No rows found")
        // If no rows, we can't see keys. 
        // Let's try to insert a dummy with invite_code and see if it fails.
    }
}

checkSchema()
