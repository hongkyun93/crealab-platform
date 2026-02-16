
import { createClient } from '@supabase/supabase-js'

// Need SERVICE_ROLE_KEY to list users
// Typically found in .env.local as SUPABASE_SERVICE_ROLE_KEY or similar
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase URL or Service Role Key in environment variables.')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
})

async function listUsers() {
    console.log('Fetching users...')
    const { data: { users }, error } = await supabase.auth.admin.listUsers()

    if (error) {
        console.error('Error listing users:', error)
        return
    }

    console.log(`Found ${users.length} users. Showing recent 20 non-scale users:`)
    const relevantUsers = users
        .filter(u => !u.email?.includes('scale'))
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 20)

    relevantUsers.forEach(u => {
        console.log(`- ${u.email} (ID: ${u.id}, Created: ${u.created_at})`)
    })
}

listUsers()
