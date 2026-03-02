const fs = require('fs');
const path = './supabase/migrations/00_master_schema_v6.sql';
let sql = fs.readFileSync(path, 'utf8');

// replace AS $ with AS $$
sql = sql.replace(/AS \$(?!\$)/g, 'AS $$$$');

// replace $; with $$;
sql = sql.replace(/\n\$(?!\$);/g, '\n$$$$;');

fs.writeFileSync(path, sql, 'utf8');
console.log('Fixed AS $$ syntax errors');
