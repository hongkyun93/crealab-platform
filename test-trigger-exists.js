import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

async function run() {
  const { data, error } = await supabase.rpc('execute_sql', { query: `SELECT trigger_name FROM information_schema.triggers WHERE event_object_table = 'moment_proposals';` })
  console.log("Triggers:", error ? error.message : data)
}
run()
