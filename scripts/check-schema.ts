import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { resolve } from 'path';
dotenv.config({ path: resolve(__dirname, '../.env.local') });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

(async () => {
    // postgres RPC isn't enabled by default for raw queries, so let's just do a standard select on one row and Object.keys
    const { data: props } = await supabase.from('moment_proposals').select('*').limit(1);
    if (props && props.length > 0) console.log('moment_proposals keys:', Object.keys(props[0]));
    
    // If empty, let's insert a valid minimum row and then log it, then delete it.
    if (!props || props.length === 0) {
        // we need a valid brand_id, creator_id, moment_id... this is hard to mock without valid UUIDs of real records.
        // Let's get one creator and brand
        const { data: c } = await supabase.from('profiles').select('id').eq('role', 'creator').limit(1);
        const { data: b } = await supabase.from('profiles').select('id').eq('role', 'brand').limit(1);
        const { data: m } = await supabase.from('life_moments').select('id').limit(1);
        
        if (c?.length && b?.length && m?.length) {
            const res = await supabase.from('moment_proposals').insert({
                brand_id: b[0].id, creator_id: c[0].id, moment_id: m[0].id
            }).select();
            if (res.data && res.data.length > 0) {
                console.log('moment_proposals keys from insert:', Object.keys(res.data[0]));
                await supabase.from('moment_proposals').delete().eq('id', res.data[0].id);
            } else {
                console.log(res.error);
            }
        } else {
            console.log('Not enough data to mock an insert.');
        }
    }
})();
