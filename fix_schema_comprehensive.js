const fs = require('fs');

const pathMaster = './supabase/migrations/00_master_schema_v6.sql';
const pathSafe = './supabase/migrations/00_master_schema_v6_safe.sql';

let masterSql = fs.readFileSync(pathMaster, 'utf8');
const safeSql = fs.readFileSync(pathSafe, 'utf8');

// --- 1. Find and Restore Missing Functions ---
console.log('--- 1. Missing Functions Scan ---');
// Match any `public.function_name(` or just `public.function_name` used in triggers/policies
const funcUsageRegex = /public\.([a-zA-Z0-9_]+)(?:\s*\()?/g;
const requiredFunctions = new Set();
let match;
while ((match = funcUsageRegex.exec(masterSql)) !== null) {
    // Exclude common schema table names that might be matched if followed by '(' occasionally
    // We only care about actual function usages.
    const name = match[1];
    if (['profiles', 'workspaces', 'campaigns', 'teams', 'life_moments', 'brand_products'].includes(name)) continue;
    requiredFunctions.add(name);
}

// Find defined functions
const funcDefRegex = /CREATE (?:OR REPLACE )?FUNCTION public\.([a-zA-Z0-9_]+)\(/g;
const definedFunctions = new Set();
while ((match = funcDefRegex.exec(masterSql)) !== null) {
    definedFunctions.add(match[1]);
}

const missingFunctions = Array.from(requiredFunctions).filter(f => !definedFunctions.has(f));
console.log('Potentially missing functions:', missingFunctions);

let appendedSql = '';
missingFunctions.forEach(funcName => {
    // Try to find the exact definition in safeSql
    const regex1 = new RegExp(`CREATE OR REPLACE FUNCTION public\\.${funcName}\\([\\s\\S]*?\\$\\$;`, 'g');
    const regex2 = new RegExp(`CREATE FUNCTION public\\.${funcName}\\([\\s\\S]*?\\$\\$;`, 'g');

    let blocks = safeSql.match(regex1) || safeSql.match(regex2);

    if (blocks && blocks.length > 0) {
        appendedSql += `\n\n-- RESTORED FUNCTION: ${funcName}\n` + blocks[0];
        console.log(`✅ Extracted definition for: ${funcName}`);
    } else {
        console.log(`⚠️  Could not find definition for ${funcName} in safe SQL. Might not be a function or is a built-in.`);
    }
});

// Insert restored functions near the top
if (appendedSql.length > 0) {
    const insertPos = masterSql.indexOf('CREATE FUNCTION ');
    if (insertPos !== -1) {
        masterSql = masterSql.substring(0, insertPos) + '\n' + appendedSql + '\n\n' + masterSql.substring(insertPos);
    } else {
        masterSql += '\n' + appendedSql;
    }
    console.log('Appended missing functions to master SQL.');
}


// --- 2. Sanitize Outdated Columns ---
console.log('\n--- 2. Outdated Column Scan ---');
const outdatedColumns = [
    'proposal_id', 'brand_proposal_id', 'moment_proposal_id',
    'product_application_id', 'campaign_application_id', 'event_id',
    'proposal_type'
];

let lines = masterSql.split('\n');
let newLines = [];
let inFunction = false;

for (let i = 0; i < lines.length; i++) {
    let line = lines[i];

    // Check if we are inside a function Definition block (we already fixed set_proposal_team_ids, but need to be careful)
    if (line.includes('CREATE OR REPLACE FUNCTION') || line.includes('CREATE FUNCTION')) {
        inFunction = true;
    }
    if (inFunction && line.trim() === '$$;') {
        inFunction = false;
    }

    let hasOutdated = false;
    for (let col of outdatedColumns) {
        // We look for foreign keys, indexes, policies, constraints using these columns
        // e.g. FOREIGN KEY (proposal_id), USING btree (proposal_id), UNIQUE (proposal_id)
        const regexStr = `\\(${col}\\)|USING btree \\(${col}\\)|FOREIGN KEY \\(${col}\\)`;
        const rx = new RegExp(regexStr, 'i');

        if (rx.test(line) && !inFunction && !line.includes('workspaces') && !line.includes('CREATE TABLE')) {
            console.log(`❌ Removing constraint/index line referencing ${col}: \n   ${line.trim()}`);
            hasOutdated = true;
            break;
        }

        // Also check CREATE TRIGGER lines that might have WHEN (new.proposal_id IS NOT NULL)
        if (line.includes('CREATE TRIGGER') && line.includes(col)) {
            console.log(`❌ Removing trigger line referencing ${col}: \n   ${line.trim()}`);
            hasOutdated = true;
            break;
        }

        // Also check CREATE POLICY lines that might have proposal_id
        if (line.includes('CREATE POLICY') && line.includes(col)) {
            // For policies, it might be safer to comment them out so we don't break syntax, 
            // but usually policies are single line statements.
            console.log(`❌ Removing policy line referencing ${col}: \n   ${line.trim()}`);
            hasOutdated = true;
            break;
        }
    }

    if (!hasOutdated) {
        newLines.push(line);
    }
}

masterSql = newLines.join('\n');

// Write back the fully parsed and cleaned SQL
fs.writeFileSync(pathMaster, masterSql, 'utf8');
console.log('\n✅ Comprehensive Scan and Fix Complete.');
