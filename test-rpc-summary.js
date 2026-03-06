import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

async function run() {
  const { data: team } = await supabase.from('teams').select('id').limit(1)
  if (!team?.[0]) return console.log('no team')
  
  const { data, error } = await supabase.rpc('get_team_dashboard_summary', { target_team_id: team[0].id })
  console.log(data || error)
}
run()
