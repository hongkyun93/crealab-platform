const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function runBenchmark() {
    console.log('--- MCN Settlement Data Fetch Benchmark ---');
    const teamId = 'a47321f4-af5a-4712-a722-e14fc7cf28b9'; // Using known team ID from prior logs
    const month = '2026-03';

    // 1. RPC 
    console.time('1. get_team_settlements RPC');
    const res1 = await supabase.rpc('get_team_settlements', { target_team_id: teamId, target_month: month });
    console.timeEnd('1. get_team_settlements RPC');
    console.log('   RPC Success:', !res1.error, 'Rows:', res1.data?.length);

    // 1b. Fallback table query
    console.time('1b. Fallback query (settlements table join)');
    const res1b = await supabase.from('settlements').select('id, creator_id, brand_id, creator:creator_id(display_name), brand:brand_id(display_name)').eq('team_id', teamId).eq('settlement_month', month);
    console.timeEnd('1b. Fallback query (settlements table join)');
    console.log('   Fallback Success:', !res1b.error, 'Rows:', res1b.data?.length);

    // 2. Revenue Splits
    console.time('2. mcn_revenue_splits query');
    const res2 = await supabase.from('mcn_revenue_splits').select('creator_id, split_ratio').eq('team_id', teamId);
    console.timeEnd('2. mcn_revenue_splits query');
    console.log('   Splits Success:', !res2.error, 'Rows:', res2.data?.length);

    // 3. Bank Info
    console.time('3. team_members bank info cross-join');
    const res3 = await supabase.from('team_members').select('user_id, profile:profiles(bank_name, account_number, account_holder)').eq('team_id', teamId);
    console.timeEnd('3. team_members bank info cross-join');
    console.log('   Bank Info Success:', !res3.error, 'Rows:', res3.data?.length);

    // 4. MCN Business Info
    console.time('4. teams table standard query');
    const res4 = await supabase.from('teams').select('name, business_registration_number, representative_name').eq('id', teamId).single();
    console.timeEnd('4. teams table standard query');
    console.log('   Team Info Success:', !res4.error);

    console.log('\nConclusion: The time taken to load is the MAX of the concurrent requests plus network latency.');
}

runBenchmark().catch(console.error);
