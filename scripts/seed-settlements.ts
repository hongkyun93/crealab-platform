/**
 * 정산 탭 가라데이터 시딩
 *
 * 실행:  npx tsx scripts/seed-settlements.ts
 * 삭제:  npx tsx scripts/seed-settlements.ts --delete
 *
 * 주의: 실행 전 Supabase SQL 에디터에서 아래 SQL 먼저 실행해야 합니다:
 *   ALTER TABLE public.settlements ALTER COLUMN proposal_id DROP NOT NULL;
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(__dirname, '..', '.env.local') })

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const BRANDS = ['나이키', '아디다스', '올리브영', '이니스프리', '배달의민족', 'CJ제일제당', '삼성전자', '현대자동차']
const PROPOSAL_TYPES = ['product_application', 'moment_proposal', 'campaign_application']
const TYPE_LABELS: Record<string, string> = {
    product_application: '제품 지원',
    moment_proposal: '모먼트 제안',
    campaign_application: '캠페인 지원',
}

function rand(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min
}

function spreadMonth(i: number): string {
    const now = new Date()
    const d = new Date(now.getFullYear(), now.getMonth() - (i % 3), 1)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function randPastDate(daysAgo: number): string {
    const d = new Date()
    d.setDate(d.getDate() - rand(1, daysAgo))
    return d.toISOString()
}

async function main() {
    const isDelete = process.argv.includes('--delete')

    // ─── 팀 찾기 ────────────────────────────────────────────────────────────
    // 1. 실제 team_members에서 owner가 mcn role인 팀 탐색
    const { data: mcnProfiles } = await supabase
        .from('profiles')
        .select('id')
        .eq('role', 'mcn')

    let teamId: string | null = null
    let teamName = 'MCN'

    if (mcnProfiles?.length) {
        const ownerIds = mcnProfiles.map((p: any) => p.id)
        const { data: ownerMember } = await supabase
            .from('team_members')
            .select('team_id')
            .in('user_id', ownerIds)
            .eq('role', 'owner')
            .limit(1)
            .maybeSingle()

        if (ownerMember) teamId = ownerMember.team_id
    }

    // fallback: 아무 팀이나
    if (!teamId) {
        const { data: anyMember } = await supabase
            .from('team_members')
            .select('team_id')
            .eq('role', 'owner')
            .limit(1)
            .maybeSingle()
        if (anyMember) teamId = anyMember.team_id
    }

    if (!teamId) {
        console.error('❌ 팀을 찾을 수 없습니다.')
        process.exit(1)
    }
    console.log(`🏢 팀 ID: ${teamId}`)


    // ─── 삭제 모드 ──────────────────────────────────────────────────────────
    if (isDelete) {
        const { error } = await supabase
            .from('settlements')
            .delete()
            .eq('team_id', teamId)
            .is('proposal_id', null) // seed 데이터만 삭제 (proposal_id가 null인 것)
        if (error) console.error('❌ 삭제 실패:', error.message)
        else console.log('✅ 가라 정산 데이터 삭제 완료')
        return
    }

    // ─── 크리에이터 목록 조회 ───────────────────────────────────────────────
    const { data: members } = await supabase
        .from('team_members')
        .select('user_id, profile:profiles(id, display_name)')
        .eq('team_id', teamId)

    if (!members?.length) {
        console.error('❌ 팀 멤버가 없습니다.')
        process.exit(1)
    }
    console.log(`👥 크리에이터 ${members.length}명 확인`)

    // ─── 배분율 UPSERT ──────────────────────────────────────────────────────
    const splitUpserts = members.map((m: any) => ({
        team_id: teamId,
        creator_id: m.user_id,
        split_ratio: (rand(60, 80)) / 100,
    }))
    await supabase.from('mcn_revenue_splits').upsert(splitUpserts, { onConflict: 'team_id,creator_id' })
    console.log('💰 배분율 UPSERT 완료')

    // ─── 정산 데이터 생성 ───────────────────────────────────────────────────
    const settlements: any[] = []

    members.forEach((m: any, memberIdx: number) => {
        const creatorId = m.user_id
        const splitRatio = splitUpserts[memberIdx].split_ratio
        // 크리에이터당 3~6건
        const count = rand(3, 6)

        for (let i = 0; i < count; i++) {
            const gross = rand(3, 50) * 100000  // 30만 ~ 500만
            const creatorAmount = Math.round(gross * splitRatio)
            const mcnAmount = gross - creatorAmount
            const withholdingAmount = Math.round(creatorAmount * 0.033)
            const netCreatorAmount = creatorAmount - withholdingAmount
            const status = i < Math.floor(count * 0.6) ? 'paid' : i === Math.floor(count * 0.6) ? 'pending' : 'escrow'
            const month = spreadMonth(memberIdx + i)
            const brandName = BRANDS[rand(0, BRANDS.length - 1)]
            const proposalType = PROPOSAL_TYPES[rand(0, PROPOSAL_TYPES.length - 1)]

            settlements.push({
                team_id: teamId,
                creator_id: creatorId,
                brand_id: null,         // 가라데이터는 brand FK 없음
                proposal_id: null,      // nullable — 이게 핵심
                proposal_type: proposalType,
                gross_amount: gross,
                split_ratio: splitRatio,
                creator_amount: creatorAmount,
                mcn_amount: mcnAmount,
                withholding_rate: 0.033,
                withholding_amount: withholdingAmount,
                net_creator_amount: netCreatorAmount,
                status,
                settlement_month: month,
                paid_at: status === 'paid' ? randPastDate(30) : null,
                note: `${brandName} ${TYPE_LABELS[proposalType]} 정산`,
                created_at: randPastDate(60),
            })
        }
    })

    // ─── INSERT ─────────────────────────────────────────────────────────────
    const { error } = await supabase.from('settlements').insert(settlements)
    if (error) {
        console.error('❌ INSERT 실패:', error.message)
        console.error('힌트:', error.hint)
        if (error.message.includes('not-null constraint') || error.message.includes('null value')) {
            const col = error.message.match(/column "([^"]+)"/)?.[1] || 'unknown'
            console.error(`\n⚠️  "${col}" 컬럼이 아직 NOT NULL입니다.`)
            console.error('Supabase SQL 에디터에서 실행하세요:')
            console.error(`  ALTER TABLE public.settlements ALTER COLUMN ${col} DROP NOT NULL;`)
        }
        process.exit(1)
    }

    console.log(`✅ 정산 가라데이터 ${settlements.length}건 INSERT 완료!`)
    console.log(`   paid: ${settlements.filter(s => s.status === 'paid').length}건`)
    console.log(`   pending: ${settlements.filter(s => s.status === 'pending').length}건`)
    console.log(`   escrow: ${settlements.filter(s => s.status === 'escrow').length}건`)
}

main().catch(e => { console.error(e); process.exit(1) })
