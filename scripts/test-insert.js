const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function test() {
  const payload = {
    brand_id: 'e16ca614-3a72-4d2d-9477-8ae33b4e7fe6', // Just any valid uuid
    title: 'Test',
    target_challenger_count: 30,
    base_reward: 10000,
    total_budget: 480000,
    status: 'draft'
  };
  
  console.log("Inserting...");
  const res = await supabase.from('ad_contests').insert(payload).select().single();
  console.log("Result:", res);
}
test().catch(console.error);
