import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { resolve } from 'path';
dotenv.config({ path: resolve(__dirname, '../.env.local') });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

(async () => {
    // using raw rpc or a trick to get column names:
    const { data, error } = await supabase.from('moment_proposals').select('*').limit(0);
    console.log(error);
    // well supabase js might not return empty columns array. Let's just create a raw query if needed, or query a postgres function.
})();
