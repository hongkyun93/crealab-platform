const fs = require('fs');

const masterSql = fs.readFileSync('./supabase/migrations/00_master_schema_v6.sql', 'utf8');
const safeSql = fs.readFileSync('./supabase/migrations/00_master_schema_v6_safe.sql', 'utf8');

// 1. Find all required functions from triggers in masterSql
const triggerRegex = /CREATE TRIGGER \w+ (?:BEFORE|AFTER) (?:INSERT|UPDATE|DELETE) ON [\w.]+ FOR EACH ROW EXECUTE FUNCTION public\.(\w+)\(/g;
const requiredFunctions = new Set();
let match;
while ((match = triggerRegex.exec(masterSql)) !== null) {
    requiredFunctions.add(match[1]);
}

console.log('Required functions based on triggers:', Array.from(requiredFunctions));

// 2. Find currently defined functions in masterSql
const funcDefRegex = /CREATE (?:OR REPLACE )?FUNCTION public\.([^()]+)\(/g;
const definedFunctions = new Set();
while ((match = funcDefRegex.exec(masterSql)) !== null) {
    definedFunctions.add(match[1]);
}

console.log('Currently defined functions:', Array.from(definedFunctions));

// 3. Identify missing functions
const missingFunctions = Array.from(requiredFunctions).filter(f => !definedFunctions.has(f));
console.log('Missing functions:', missingFunctions);

// 4. Extract missing function definitions from safeSql and append to masterSql
let appendedSql = '';
missingFunctions.forEach(funcName => {
    // Try to find the function block in safeSql
    // It usually starts with CREATE OR REPLACE FUNCTION public.funcName( and ends with $$;
    const blockRegex = new RegExp(`CREATE OR REPLACE FUNCTION public\\.${funcName}\\([\\s\\S]*?\\$\\$;`, 'g');
    const blocks = safeSql.match(blockRegex);

    if (blocks && blocks.length > 0) {
        appendedSql += `\n\n-- RESTORED FUNCTION: ${funcName}\n` + blocks[0];
        console.log(`Extracted definition for: ${funcName}`);
    } else {
        // Try without OR REPLACE
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
    fs.appendFileSync('./supabase/migrations/00_master_schema_v6.sql', appendedSql, 'utf8');
    console.log('Successfully appended missing functions to master SQL.');
} else {
    console.log('No missing functions to append or could not find their definitions.');
}
