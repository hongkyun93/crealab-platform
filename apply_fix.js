require('dotenv').config({path: '.env.local'});
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const sql = fs.readFileSync('fix_settlement_trigger.sql', 'utf8');

async function apply() {
  const { data, error } = await supabase.rpc('exec_sql', { sql });
  if (error) {
    console.error('Failed to apply SQL:', error);
  } else {
    console.log('Successfully applied SQL fix.');
  }
}
apply();
