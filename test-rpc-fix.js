import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

async function run() {
  // Find a team ID that actually has mock data
  const { data: sampleProp } = await supabase.from('moment_proposals').select('creator_team_id').limit(1)
  if (!sampleProp || sampleProp.length === 0) { console.log("No moment proposals!"); return }
  
  const target_team_id = sampleProp[0].creator_team_id
  console.log("Found a live team ID that has data:", target_team_id)

  // Find a user ID IN THIS TEAM so we can simulate `auth.uid()` passing the RPC check...
  // Wait, we can't easily simulate `auth.uid()` from JS without JWT.
  // BUT we can mimic the main select block of the RPC!
  
  const { data: creator_summary, error } = await supabase.rpc('execute_sql', {
      query: `
        SELECT json_agg(creator_summary) FROM (
            SELECT
              tm.user_id, p.display_name,
              COALESCE(mp.total_proposals, 0) AS total_moment_proposals,
              COALESCE(mp.pending_proposals, 0) AS pending_moment_proposals
            FROM public.team_members tm
            JOIN public.profiles p ON p.id = tm.user_id
            LEFT JOIN LATERAL (
              SELECT COUNT(*) total_proposals,
                COUNT(*) FILTER (WHERE m.status='offered') pending_proposals
              FROM public.moment_proposals m WHERE m.creator_id=tm.user_id
            ) mp ON true
            WHERE tm.team_id='${target_team_id}'
            ORDER BY p.display_name
        ) creator_summary;
      `
  })
  console.log("RPC Data equivalent:", error || creator_summary)

  
  // Wait, execute_sql doesn't exist!! I will just use JS to fetch it directly:
  const { data: members } = await supabase.from('team_members').select('user_id, profiles(display_name)').eq('team_id', target_team_id)
  for (const m of members) {
      const { data: moments } = await supabase.from('moment_proposals').select('id, status').eq('creator_id', m.user_id)
      if (moments?.length > 0) {
          console.log(`Creator ${m.profiles.display_name} has ${moments.length} moments mapped!`)
      }
  }

}
run()
