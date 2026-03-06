import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

async function run() {
  const { data, error } = await supabase.rpc('get_team_dashboard_summary', { target_team_id: '00000000-0000-0000-0000-000000000000' })
  console.log("RPC result:", error || "success")
}
run()
