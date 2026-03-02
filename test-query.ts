import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.join(process.cwd(), '.env.local') })

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function test() {
    const { data, error } = await supabase
        .from('submission_feedback')
        .select(`
        *,
        sender:profiles!sender_id(display_name, avatar_url)
    `)
        .limit(1)

    if (error) {
        console.error('Error fetching submission_feedback:', error)
    } else {
        console.log('Success fetching submission_feedback:', data)
    }
}

test()
