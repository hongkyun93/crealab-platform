const fs = require('fs');

const pathMaster = './supabase/migrations/00_master_schema_v6.sql';
const pathSafe = './supabase/migrations/00_master_schema_v6_safe.sql';

let masterSql = fs.readFileSync(pathMaster, 'utf8');
const safeSql = fs.readFileSync(pathSafe, 'utf8');

// 1. Find all required functions from triggers in masterSql
// We just look for EXECUTE FUNCTION public.funcName
const triggerRegex = /EXECUTE FUNCTION public\.(\w+)/g;
const requiredFunctions = new Set();
let match;
while ((match = triggerRegex.exec(masterSql)) !== null) {
    requiredFunctions.add(match[1]);
}

// 2. Find currently defined functions in masterSql
const funcDefRegex = /CREATE (?:OR REPLACE )?FUNCTION public\.([^()]+)\(/g;
const definedFunctions = new Set();
while ((match = funcDefRegex.exec(masterSql)) !== null) {
    definedFunctions.add(match[1]);
}

// 3. Identify missing functions
const missingFunctions = Array.from(requiredFunctions).filter(f => !definedFunctions.has(f));
console.log('Missing functions:', missingFunctions);

// 4. Extract missing function definitions from safeSql
let appendedSql = '';
missingFunctions.forEach(funcName => {
    const blockRegex = new RegExp(`CREATE OR REPLACE FUNCTION public\\.${funcName}\\([\\s\\S]*?\\$\\$;`, 'g');
    const blocks = safeSql.match(blockRegex);

    if (blocks && blocks.length > 0) {
        appendedSql += `\n\n-- RESTORED FUNCTION: ${funcName}\n` + blocks[0];
        console.log(`Extracted definition for: ${funcName}`);
    } else {
        const blockRegex2 = new RegExp(`CREATE FUNCTION public\\.${funcName}\\([\\s\\S]*?\\$\\$;`, 'g');
        const blocks2 = safeSql.match(blockRegex2);
        if (blocks2 && blocks2.length > 0) {
            appendedSql += `\n\n-- RESTORED FUNCTION: ${funcName}\n` + blocks2[0];
            console.log(`Extracted definition for: ${funcName}`);
        } else {
            console.log(`WARNING: Could not find definition for ${funcName} in safe SQL!`);
        }
    }
});

if (appendedSql.length > 0) {
    // Insert them at line 200 roughly, before the triggers
    const firstFuncIndex = masterSql.indexOf('CREATE FUNCTION ');
    const prevComment = masterSql.lastIndexOf('--', firstFuncIndex);
    const insertPos = prevComment !== -1 ? prevComment : firstFuncIndex;

    masterSql = masterSql.substring(0, insertPos) + '\n' + appendedSql + '\n\n' + masterSql.substring(insertPos);

    fs.writeFileSync(pathMaster, masterSql, 'utf8');
    console.log('Successfully appended missing functions to master SQL at the top.');
} else {
    console.log('No missing functions to append.');
}
