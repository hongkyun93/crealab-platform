import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function check() {
  const { data, count, error } = await supabase
    .from('profiles')
    .select('id, display_name, role, avatar_url', { count: 'exact' })
    .eq('is_mock', true)
    .eq('role', 'creator')

  if (error) {
    console.error('Error:', error)
  } else {
    console.log(`Mock Creators Found: ${count}`)
    console.log(data.slice(0, 5))
  }
}

check()
