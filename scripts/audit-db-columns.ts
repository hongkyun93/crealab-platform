#!/usr/bin/env npx tsx
/**
 * DB Column Audit Script
 * 
 * Parses the master schema SQL to extract all table columns,
 * then scans the codebase for Supabase queries and validates
 * that every column referenced in code actually exists in the DB.
 * 
 * Usage: npx tsx scripts/audit-db-columns.ts
 */

import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'

const ROOT = path.resolve(__dirname, '..')
const SCHEMA_PATH = path.join(ROOT, 'supabase/migrations/00_master_schema_v4.sql')

// ─── 1. Parse Master Schema ─────────────────────────────────────────
interface TableSchema {
    [tableName: string]: string[]  // column names
}

function parseSchema(sqlPath: string): TableSchema {
    const sql = fs.readFileSync(sqlPath, 'utf-8')
    const schema: TableSchema = {}

    // Match CREATE TABLE blocks
    const tableRegex = /CREATE TABLE IF NOT EXISTS public\.(\w+)\s*\(([\s\S]*?)\);/g
    let match: RegExpExecArray | null

    while ((match = tableRegex.exec(sql)) !== null) {
        const tableName = match[1]
        const body = match[2]

        const columns: string[] = []
        const lines = body.split('\n')
        for (const line of lines) {
            const trimmed = line.trim()
            // Skip comments, constraints, empty lines
            if (!trimmed || trimmed.startsWith('--') || trimmed.startsWith('CONSTRAINT') ||
                trimmed.startsWith('UNIQUE') || trimmed.startsWith('CHECK')) continue

            // Extract column name (first word)
            const colMatch = trimmed.match(/^(\w+)\s+/)
            if (colMatch && !['PRIMARY', 'FOREIGN', 'REFERENCES', 'ON', 'DEFAULT'].includes(colMatch[1].toUpperCase())) {
                columns.push(colMatch[1])
            }
        }

        schema[tableName] = columns
    }

    return schema
}

// ─── 2. Scan Codebase for Supabase Queries ──────────────────────────
interface ColumnUsage {
    table: string
    column: string
    file: string
    line: number
    operation: 'insert' | 'update' | 'select' | 'eq'
}

function scanCodebase(schema: TableSchema): ColumnUsage[] {
    const issues: ColumnUsage[] = []
    const knownTables = Object.keys(schema)

    // Find all .ts and .tsx files (excluding node_modules, .next)
    const files = execSync(
        `find ${ROOT}/components ${ROOT}/lib ${ROOT}/app -name '*.ts' -o -name '*.tsx' | grep -v node_modules | grep -v .next`,
        { encoding: 'utf-8' }
    ).trim().split('\n').filter(Boolean)

    for (const filePath of files) {
        const content = fs.readFileSync(filePath, 'utf-8')
        const lines = content.split('\n')
        const relPath = path.relative(ROOT, filePath)

        // Track current table context
        let currentTable: string | null = null

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i]

            // Detect .from('table_name')
            const fromMatch = line.match(/\.from\s*\(\s*['"](\w+)['"]\s*\)/)
            if (fromMatch && knownTables.includes(fromMatch[1])) {
                currentTable = fromMatch[1]
            }

            if (!currentTable) continue

            // Detect .insert({ column: value })
            const insertMatch = line.match(/\.insert\s*\(\s*\{/)
            if (insertMatch) {
                // Scan forward for column names in the insert object
                let braceDepth = 0
                for (let j = i; j < Math.min(i + 40, lines.length); j++) {
                    const insertLine = lines[j]

                    // Track brace depth to skip nested objects (e.g. jsonb literals)
                    for (const ch of insertLine) {
                        if (ch === '{') braceDepth++
                        if (ch === '}') braceDepth--
                    }

                    // Only check top-level properties (depth 1 = inside the insert object)
                    if (braceDepth === 1) {
                        // Match property names like "column_name:" (snake_case)
                        const propMatches = insertLine.matchAll(/^\s+(\w+)\s*:/g)
                        for (const pm of propMatches) {
                            const col = pm[1]
                            // Skip non-column keys and JS syntax
                            if (['const', 'let', 'var', 'return', 'if', 'else', 'try', 'catch', 'await', 'async'].includes(col)) continue
                            if (col.startsWith('_') || /[A-Z]/.test(col[0])) continue // skip camelCase/private vars

                            if (!schema[currentTable!]?.includes(col)) {
                                issues.push({
                                    table: currentTable!,
                                    column: col,
                                    file: relPath,
                                    line: j + 1,
                                    operation: 'insert'
                                })
                            }
                        }
                    }

                    // End of insert object
                    if (braceDepth <= 0) break
                }
            }

            // Detect .update({ column: value })
            const updateMatch = line.match(/\.update\s*\(\s*\{/)
            if (updateMatch) {
                for (let j = i; j < Math.min(i + 40, lines.length); j++) {
                    const updateLine = lines[j]
                    const propMatches = updateLine.matchAll(/^\s+(\w+)\s*:/g)
                    for (const pm of propMatches) {
                        const col = pm[1]
                        if (['const', 'let', 'var', 'return', 'if', 'else', 'try', 'catch', 'await', 'async'].includes(col)) continue
                        if (col.startsWith('_') || /[A-Z]/.test(col[0])) continue

                        if (!schema[currentTable!]?.includes(col)) {
                            issues.push({
                                table: currentTable!,
                                column: col,
                                file: relPath,
                                line: j + 1,
                                operation: 'update'
                            })
                        }
                    }
                    if (updateLine.includes('})') || updateLine.includes('}).')) break
                }
            }

            // Reset context at function boundaries
            if (line.includes('const ') && line.includes(' = async') || line.match(/^\s*\}/)) {
                // Don't reset too aggressively - only reset after clear function ends
            }
        }
    }

    // Deduplicate
    const seen = new Set<string>()
    return issues.filter(i => {
        const key = `${i.table}:${i.column}:${i.file}:${i.line}`
        if (seen.has(key)) return false
        seen.add(key)
        return true
    })
}

// ─── 3. Check RPC Return Fields vs Usage ────────────────────────────
function checkRPCFields(schema: TableSchema): string[] {
    const warnings: string[] = []

    const schemaSQL = fs.readFileSync(SCHEMA_PATH, 'utf-8')

    // Extract RPC return fields from get_current_user_info
    const rpcMatch = schemaSQL.match(/get_current_user_info[\s\S]*?json_build_object\(([\s\S]*?)\)\s*INTO/m)
    if (!rpcMatch) return warnings

    const rpcBody = rpcMatch[1]
    const rpcKeys: string[] = []
    const keyMatches = rpcBody.matchAll(/'(\w+)'/g)
    for (const km of keyMatches) {
        rpcKeys.push(km[1])
    }

    // Check which profiles columns are NOT returned by the RPC
    const profileCols = schema['profiles'] || []
    const settingsFile = path.join(ROOT, 'components/creator/views/SettingsView.tsx')

    if (fs.existsSync(settingsFile)) {
        const settingsContent = fs.readFileSync(settingsFile, 'utf-8')

        // Find effectiveUser.* references
        const usedKeys = new Set<string>()
        const refMatches = settingsContent.matchAll(/effectiveUser\.(\w+)/g)
        for (const rm of refMatches) {
            usedKeys.add(rm[1])
        }

        // Check each used key against RPC return keys
        for (const key of usedKeys) {
            if (!rpcKeys.includes(key) && key !== 'role' && key !== 'id' && key !== 'email') {
                warnings.push(`⚠️  SettingsView uses effectiveUser.${key} but RPC doesn't return it`)
            }
        }
    }

    return warnings
}

// ─── Main ────────────────────────────────────────────────────────────
function main() {
    console.log('🔍 DB Column Audit — Scanning...\n')

    // 1. Parse schema
    const schema = parseSchema(SCHEMA_PATH)
    console.log(`📋 Found ${Object.keys(schema).length} tables in master schema:`)
    for (const [table, cols] of Object.entries(schema)) {
        console.log(`   ${table}: ${cols.length} columns`)
    }
    console.log()

    // 2. Scan codebase
    const issues = scanCodebase(schema)

    // 3. Check RPC
    const rpcWarnings = checkRPCFields(schema)

    // 4. Report
    if (issues.length === 0 && rpcWarnings.length === 0) {
        console.log('✅ No column mismatches found! All code references match the DB schema.\n')
        process.exit(0)
    }

    if (issues.length > 0) {
        console.log(`\n🔴 Found ${issues.length} column mismatch(es):\n`)
        for (const issue of issues) {
            console.log(`   ${issue.file}:${issue.line}`)
            console.log(`   → ${issue.operation.toUpperCase()} on "${issue.table}" uses column "${issue.column}" — NOT IN SCHEMA`)
            console.log()
        }
    }

    if (rpcWarnings.length > 0) {
        console.log(`\n🟡 RPC Warnings (${rpcWarnings.length}):\n`)
        for (const w of rpcWarnings) {
            console.log(`   ${w}`)
        }
        console.log()
    }

    // Exit with error if there are column mismatches
    if (issues.length > 0) {
        process.exit(1)
    }
}

main()
