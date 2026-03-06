import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''; // Needs admin or executing rpc directly

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function reload() {
  console.log('Sending RPC to reload schema cache...');
  // A common trick to optionally reload cache is to run a simple POST to /rest/v1/rpc/reload_schema_cache if it exists
  const { data, error } = await supabase.rpc('reload_schema_cache');
  if (error) {
    console.error('RPC reload error:', error.message);
    
    // Fallback: Just query the columns of `teams` to see if name exists
    const res = await supabase.from('teams').select('*').limit(1);
    console.log('Test team fetch:', res.data ? res.data : res.error);
  } else {
    console.log('Cache reloaded', data);
  }
}
reload();
