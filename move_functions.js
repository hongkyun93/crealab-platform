const fs = require('fs');

const path = './supabase/migrations/00_master_schema_v6.sql';
let sql = fs.readFileSync(path, 'utf8');

// Find the index where the RESTORED FUNCTIONs start
const restoreIndex = sql.indexOf('-- RESTORED FUNCTION: ');

if (restoreIndex !== -1) {
    const restoredPart = sql.substring(restoreIndex);
    let originalPart = sql.substring(0, restoreIndex);

    // Find the right place to insert. Around where exec_sql is defined.
    // Or simply insert it after "CREATE SCHEMA public;"
    // Or simply find the first FUNCTION definition and put it before it.
    const firstFuncIndex = originalPart.indexOf('CREATE FUNCTION ');
    if (firstFuncIndex !== -1) {
        // Find the beginning of that block
        const prevComment = originalPart.lastIndexOf('--', firstFuncIndex);
        const insertPos = prevComment !== -1 ? prevComment : firstFuncIndex;

        sql = originalPart.substring(0, insertPos) + '\n' + restoredPart + '\n\n' + originalPart.substring(insertPos);
        fs.writeFileSync(path, sql, 'utf8');
        console.log('Moved restored functions to the top');
    } else {
        console.log('Could not find a place to insert the functions.');
    }
} else {
    console.log('No RESTORED FUNCTIONs found at the end.');
}
