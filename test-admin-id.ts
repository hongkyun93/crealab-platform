import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

async function main() {
    console.log("Fetching admin...");
    const { data, error } = await supabase.from('profiles').select('id, email, role').eq('email', 'admin@creadypick.com')
    console.log("Result:", data, "Error:", error);
}
main()
