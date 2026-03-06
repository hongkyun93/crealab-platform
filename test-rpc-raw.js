import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

async function run() {
  const { data: users, error: err } = await supabase.auth.admin.listUsers()
  if (err) { console.error("Error listing users:", err.message); return }
  
  const mcnUser = users.users.find(u => u.email === 'ceo@invisible.inc') || users.users[0]
  
  const { data: teamMembers } = await supabase.from('team_members').select('team_id').eq('user_id', mcnUser.id).eq('role', 'owner').limit(1)
  const target_team_id = teamMembers[0].team_id
  
  console.log("Testing queries for MCN Team:", target_team_id)

  const { data: members } = await supabase.from('team_members').select('user_id').eq('team_id', target_team_id)
  console.log("Members in this team count:", members.length)

  const memberIds = members.map(m => m.user_id)
  
  const { data: proposals, error: pErr } = await supabase.from('moment_proposals').select('*').in('creator_id', memberIds)
  
  console.log("Moment proposals count for these members:", proposals?.length)
  if (proposals?.length > 0) {
      console.log("Do they have creator_team_id set correctly?", proposals[0].creator_team_id === target_team_id)
      console.log("Their creator_team_id:", proposals[0].creator_team_id)
  }

  // Check the RLS policy!
  console.log("\nIf this MCN user calls 'select * from moment_proposals', what does RLS do?")
  // RLS for MCN is: creator_team_id IN ( SELECT get_user_team_ids(auth.uid()) )
  // The creator_team_id of proposals[0] MUST match target_team_id (which is one of get_user_team_ids(auth.uid()))
}
run()
