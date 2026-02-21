/**
 * Apply settlement migration SQL directly via Supabase Management API
 * Run: npx tsx scripts/apply-settlement-migration.ts
 */
import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(__dirname, '..', '.env.local') })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Extract project ref from URL: https://XXXXX.supabase.co
const projectRef = SUPABASE_URL.replace('https://', '').split('.')[0]

async function runSQL(sql: string, label: string): Promise<boolean> {
    const res = await fetch(
        `https://api.supabase.com/v1/projects/${projectRef}/database/query`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
            },
            body: JSON.stringify({ query: sql }),
        }
    )
    const body = await res.json().catch(() => ({}))
    if (res.ok) {
        console.log(`  ✅ ${label}`)
        return true
    } else {
        // Try alternate endpoint
        return false
    }
}

async function runSQLAlt(sql: string, label: string): Promise<boolean> {
    // Use Supabase REST + pg_query (for projects with pg RPC)
    const res = await fetch(`${SUPABASE_URL}/rest/v1/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'apikey': SERVICE_ROLE_KEY,
            'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
            'Prefer': 'return=representation',
        },
    })
    return false
}

async function main() {
    console.log('🚀 Settlement migration via Management API...')
    console.log(`   Project: ${projectRef}`)

    const statements = [
        {
            label: 'mcn_revenue_splits 테이블',
            sql: `
                CREATE TABLE IF NOT EXISTS public.mcn_revenue_splits (
                    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
                    team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
                    creator_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
                    split_ratio numeric(4,3) NOT NULL DEFAULT 0.700,
                    effective_from date DEFAULT CURRENT_DATE,
                    created_at timestamptz DEFAULT now() NOT NULL,
                    UNIQUE(team_id, creator_id)
                );
                ALTER TABLE public.mcn_revenue_splits DISABLE ROW LEVEL SECURITY;
            `
        },
        {
            label: 'settlements 테이블',
            sql: `
                CREATE TABLE IF NOT EXISTS public.settlements (
                    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
                    team_id uuid REFERENCES public.teams(id) ON DELETE SET NULL,
                    creator_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
                    brand_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
                    proposal_type text NOT NULL,
                    proposal_id text NOT NULL,
                    workspace_id uuid REFERENCES public.workspaces(id) ON DELETE SET NULL,
                    gross_amount integer NOT NULL DEFAULT 0,
                    split_ratio numeric(4,3) NOT NULL DEFAULT 0.700,
                    creator_amount integer NOT NULL DEFAULT 0,
                    mcn_amount integer NOT NULL DEFAULT 0,
                    status text NOT NULL DEFAULT 'pending',
                    paid_at timestamptz,
                    settlement_month text,
                    note text,
                    created_at timestamptz DEFAULT now() NOT NULL,
                    updated_at timestamptz DEFAULT now() NOT NULL
                );
                ALTER TABLE public.settlements DISABLE ROW LEVEL SECURITY;
            `
        },
        {
            label: 'get_team_settlements RPC',
            sql: `
                CREATE OR REPLACE FUNCTION public.get_team_settlements(
                    target_team_id uuid,
                    target_month text DEFAULT NULL
                )
                RETURNS TABLE (
                    id uuid,
                    creator_id uuid,
                    creator_name text,
                    creator_avatar text,
                    brand_id uuid,
                    brand_name text,
                    proposal_type text,
                    proposal_id text,
                    gross_amount integer,
                    split_ratio numeric,
                    creator_amount integer,
                    mcn_amount integer,
                    status text,
                    paid_at timestamptz,
                    settlement_month text,
                    note text,
                    created_at timestamptz
                ) LANGUAGE plpgsql SECURITY DEFINER AS $$
                BEGIN
                    RETURN QUERY
                    SELECT
                        s.id, s.creator_id,
                        cp.display_name AS creator_name,
                        cp.avatar_url   AS creator_avatar,
                        s.brand_id,
                        bp.display_name AS brand_name,
                        s.proposal_type, s.proposal_id,
                        s.gross_amount, s.split_ratio,
                        s.creator_amount, s.mcn_amount,
                        s.status, s.paid_at, s.settlement_month, s.note, s.created_at
                    FROM public.settlements s
                    LEFT JOIN public.profiles cp ON cp.id = s.creator_id
                    LEFT JOIN public.profiles bp ON bp.id = s.brand_id
                    WHERE s.team_id = target_team_id
                        AND (target_month IS NULL OR s.settlement_month = target_month)
                    ORDER BY s.created_at DESC;
                END;
                $$;
            `
        }
    ]

    let allOk = true
    for (const stmt of statements) {
        const ok = await runSQL(stmt.sql, stmt.label)
        if (!ok) {
            console.log(`  ⚠️  Management API 실패: ${stmt.label}`)
            allOk = false
        }
    }

    if (!allOk) {
        console.log('\n📋 Management API가 작동하지 않습니다.')
        console.log('   Supabase Dashboard > SQL Editor에 아래 파일을 복붙해서 실행하세요:')
        console.log('   👉 supabase/migrations/20260222_settlement_system.sql')
        console.log('\n   실행 후: npx tsx scripts/seed-ir-settlements.ts')
    } else {
        console.log('\n✅ 모든 마이그레이션 완료!')
        console.log('   이제 실행: npx tsx scripts/seed-ir-settlements.ts')
    }
}

main().catch(console.error)
