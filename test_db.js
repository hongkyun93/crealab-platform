import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

async function test() {
    const { data: m } = await supabase.from('moment_proposals').select('*').limit(1).order('created_at', { ascending: false })
    console.log('moment_proposals:', m ? m[0] : null)
    const { data: c } = await supabase.from('campaign_applications').select('*').limit(1).order('created_at', { ascending: false })
    console.log('campaign_applications:', c ? c[0] : null)
}
test()
