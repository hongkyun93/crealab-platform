import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

async function run() {
  // PostgREST triggers a schema reload when you call NOTIFY pgrst, 'reload schema'
  // Since we can't do that via JS client easily without a function, we'll try to use HTTP to the reload endpoint if available, but usually restarting the local supabase is the official way.
  console.log("To reload schema, we might need a db restart, or just execute SQL.")
  // Let's check what error moment_proposals throws.
  const { data, error } = await supabase.from('moment_proposals').select(`
    *,
    workspace:workspaces!workspace_id(
      contract_status,
      product_name,
      original_proposal_id
    )
  `).limit(1)
  console.log("Test Query Result:", error || data)
}
run()
