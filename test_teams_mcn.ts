import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  console.log('--- Testing MCN Team Creation ---');
  // Register a mock MCN user
  const email = `test_mcn_${Date.now()}@example.com`;
  const { data: authUser, error: authErr } = await supabase.auth.signUp({
    email,
    password: 'Password123!',
    options: {
        data: { role: 'mcn', display_name: 'Test MCN' }
    }
  });

  if (authErr) {
    console.error('Signup err:', authErr);
    return;
  }
  
  console.log('User signed up:', authUser.user?.id);

  // Try to create a team
  const { data: team, error: teamErr } = await supabase
    .from('teams')
    .insert({
      name: 'Test Team MCN',
      slug: `test-mcn-${Date.now()}`
    })
    .select()
    .single();

  if (teamErr) {
    console.error('Team creation error:', teamErr);
  } else {
    console.log('Team created successfully:', team);
  }
}
test();
