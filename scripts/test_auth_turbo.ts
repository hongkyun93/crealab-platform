
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

async function testLogin(email: string, password: string, roleName: string) {
    console.log(`[TEST] Checking ${roleName} (${email})...`)
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
        console.error(`  ❌ FAIL: ${error.message}`)
        return false
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single()

    console.log(`  ✅ SUCCESS: Logged in. Profile Role: ${profile?.role}`)
    await supabase.auth.signOut()
    return true
}

async function runAll() {
    console.log("=== STARTING TURBO AUTH TEST ===")
    await testLogin('voib@brand.com', '12341234', 'Brand')
    await testLogin('creator1@creadypick.com', '12341234', 'Creator')
    await testLogin('employee1@creadypick.com', '12341234', 'MCN Employee')
    console.log("=== TEST COMPLETE ===")
}

runAll()
