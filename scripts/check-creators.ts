import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { resolve } from 'path';
dotenv.config({ path: resolve(__dirname, '../.env.local') });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

(async () => {
    const { data } = await supabase.from('profiles').select('email, handle, is_mock, role').eq('role', 'creator').limit(25);
    console.log("Mock Check:", data);
})();
