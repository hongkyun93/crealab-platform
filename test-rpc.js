import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
async function run() {
  // Let's get the first active team id
  const { data: teams } = await supabase.from('teams').select('id').limit(1)
  if (!teams?.length) {
      console.log('No teams found')
      return
  }
  const teamId = teams[0].id
  console.log('Testing RPC with team_id:', teamId)
  
  const { data, error } = await supabase.rpc('get_team_dashboard_summary', { target_team_id: teamId })
  if (error) console.error('get_team_dashboard_summary error:', error)
  else console.log('get_team_dashboard_summary SUCCESS')

  const { data: data2, error: error2 } = await supabase.rpc('get_team_proposals', { target_team_id: teamId })
  if (error2) console.error('get_team_proposals error:', error2)
  else console.log('get_team_proposals SUCCESS')
}
run()
