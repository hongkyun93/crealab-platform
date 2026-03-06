import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

async function run() {
  const { data, error } = await supabase.rpc('execute_sql', { query: `SELECT pg_get_functiondef('public.set_proposal_team_ids'::regproc);` })
  console.log("Trigger:", error ? error.message : data)
}
run()
