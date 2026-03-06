const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
// pass the service role or pass user credentials. Actually wait, local postgres accepts anon key but RLS blocks it.
// Let's just create a client and call a fetch to see if it responds fast.
async function test() {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  console.log("Fetching config...");
  const { data, error } = await supabase.from('profiles').select('id').limit(1);
  console.log("Config response:", { data, error });
}
test();
