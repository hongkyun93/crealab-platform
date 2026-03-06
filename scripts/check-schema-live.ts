/**
 * 실제 Supabase DB 컬럼 조회 도구 (영구 유틸)
 *
 * 사용법:
 *   npx tsx scripts/check-schema-live.ts <테이블명>
 *   npx tsx scripts/check-schema-live.ts product_applications
 *   npx tsx scripts/check-schema-live.ts workspaces settlements
 *
 * 선제조건: Supabase SQL 에디터에서 아래 RPC 먼저 생성 필요
 *   → supabase/migrations/20260307_get_table_columns_rpc.sql 실행
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(__dirname, '..', '.env.local') })

const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function getTableColumns(table: string) {
    // 방법 1: get_table_columns RPC (pg_catalog 기반 — 가장 정확)
    const { data: rpcData, error: rpcErr } = await sb.rpc('get_table_columns', { p_table: table })

    if (!rpcErr && rpcData?.length) {
        console.log(`\n=== ${table} (pg_catalog 직접 조회) ===`)
        const notNull = rpcData.filter((c: any) => c.is_nullable === 'NO' && !c.column_default)
        const nullable = rpcData.filter((c: any) => c.is_nullable === 'YES' || c.column_default)
        console.log(`🔴 NOT NULL (기본값 없음): ${notNull.map((c: any) => c.column_name).join(', ')}`)
        console.log(`🟢 nullable/default: ${nullable.map((c: any) => c.column_name).join(', ')}`)
        console.log(`\n전체 ${rpcData.length}개 컬럼:`)
        rpcData.forEach((c: any) => {
            const flag = c.is_nullable === 'NO' && !c.column_default ? '🔴' : '🟢'
            const def = c.column_default ? ` [DEFAULT: ${c.column_default.slice(0, 40)}]` : ''
            console.log(`  ${flag} ${c.column_name} (${c.data_type})${def}`)
        })
        return rpcData.map((c: any) => c.column_name) as string[]
    }

    // 방법 2: SELECT * 폴백 (테이블에 데이터 있을 때)
    const { data: rowData } = await sb.from(table as any).select('*').limit(1)
    if (rowData?.[0]) {
        const cols = Object.keys(rowData[0])
        console.log(`\n=== ${table} (SELECT * 폴백) ===`)
        cols.forEach(c => console.log(`  - ${c}`))
        return cols
    }

    // 방법 3: 빈 INSERT 에러에서 첫번째 NOT NULL 컬럼만 파악
    const { error: insertErr } = await sb.from(table as any).insert({} as any)
    console.log(`\n=== ${table} (INSERT {} 에러) ===`)
    console.log(`  ⚠️  ${insertErr?.message || '알 수 없음'}`)
    console.log(`  → RPC가 없습니다. 위 SQL 파일을 먼저 Supabase에 실행하세요.`)
    return []
}

async function main() {
    const tables = process.argv.slice(2)
    if (!tables.length) {
        console.error('사용법: npx tsx scripts/check-schema-live.ts <테이블명> [테이블명2 ...]')
        process.exit(1)
    }
    for (const t of tables) {
        await getTableColumns(t)
    }
}

export { getTableColumns }
main().catch(console.error)
