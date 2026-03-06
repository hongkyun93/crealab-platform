import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
async function run() {
  const { data, error } = await supabase.rpc('exec_sql', { query: `SELECT column_name FROM information_schema.columns WHERE table_name = 'product_applications'` })
  console.log(JSON.stringify(data || error, null, 2))
}
run()
