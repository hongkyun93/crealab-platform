/**
 * 데모용 협업 풀체인 시딩 (v3 — 실제 DB 스키마 기준)
 *
 * 실행:  npx tsx scripts/seed-demo-collabs.ts
 * 삭제:  npx tsx scripts/seed-demo-collabs.ts --delete
 *
 * 생성 체인 (pg_catalog로 확인한 실제 스키마 기준):
 *  1. life_moments      (NOT NULL 없음 — 가장 단순)
 *  2. moment_proposals  (brand_id, creator_id, moment_id NOT NULL)
 *  3. workspaces        (brand_id, creator_id, project_title NOT NULL)
 *  4. settlements       (creator_id NOT NULL, 나머지 nullable)
 *
 * 결과:
 *  → 마스터 트래커: moment_proposals 기반 (get_team_proposals RPC)
 *  → 캘린더:       moment_proposals.created_at + life_moments.moment_start_date
 *  → 크리에이터 관리: moment_proposals 카운트 (get_team_dashboard_summary)
 *  → 정산 탭:      settlements.workspace_id 연결
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(__dirname, '..', '.env.local') })

const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// ─── 실제 ID (2026-03-06 pg_catalog 확인) ─────────────────────────────────────
const TEAM_ID = '8c998fdd-1f3b-47e0-8711-79a760460089'

const CREATORS = {
    서연스킨: { id: '1a673318-ed79-4643-9e5b-9a5df91ba993', handle: '서연스킨' },
    채린글로우: { id: 'cfc58f55-ed06-4aba-af2c-3b8aa5c10523', handle: '채린글로우' },
}

const BRANDS = {
    올리브영: { id: '6b8cedf0-1548-42fc-ba3f-ed434ace5bb9' },
    아모레유스랩: { id: '2ce9d5bb-0421-49a9-8850-c117101b2f1c' },
}

// ─── 데모 협업 2건 ──────────────────────────────────────────────────────────────
interface CollabDef {
    label: string
    creator: { id: string; handle: string }
    brand: { id: string }
    lifeMonument: {
        title: string
        description: string
        category: string
        moment_start_date: string
    }
    workspace: {
        project_title: string
        product_name: string
        price_offer: number
        status: string
        channel_name: string
        channel_subtype: string
        brand_condition_confirmed: boolean
        creator_condition_confirmed: boolean
        contract_status: string
        delivery_status: string
    }
    momentProposal: {
        message: string
        status: string
        created_at: string
    }
    settlement: {
        gross_amount: number
        split_ratio: number
        settlement_month: string
        status: string
        paid_at: string | null
        note: string
    }
}

const DEMO_COLLABS: CollabDef[] = [
    {
        label: '올리브영 × 서연스킨 — 선크림 SPF50+ 릴스 (완료/정산완료)',
        creator: CREATORS.서연스킨,
        brand: BRANDS.올리브영,
        lifeMonument: {
            title: '자외선 차단제 집중 비교 리뷰',
            description: '일상 보습 + 자외선 차단을 동시에 잡는 제품 비교. 발림감·백탁·지속력 3종 테스트.',
            category: '뷰티',
            moment_start_date: '2026-01-20',
        },
        workspace: {
            project_title: '올리브영 선크림 SPF50+ 릴스 리뷰 협업',
            product_name: '선크림 SPF50+ 올데이프로텍션 50ml',
            price_offer: 1_500_000,
            status: 'settlement',
            channel_name: 'instagram',
            channel_subtype: 'reels',
            brand_condition_confirmed: true,
            creator_condition_confirmed: true,
            contract_status: 'signed',
            delivery_status: 'delivered',
        },
        momentProposal: {
            message: '올리브영 PB선크림 신제품 출시에 맞춰 피부결 중심 릴스(피드 1건+릴스 1건) 제안드립니다. 발림감·지속력 중심 7일 사용 후기 형식입니다.',
            status: 'completed',
            created_at: new Date('2026-01-15T09:30:00Z').toISOString(),
        },
        settlement: {
            gross_amount: 1_500_000,
            split_ratio: 0.75,
            settlement_month: '2026-02',
            status: 'paid',
            paid_at: new Date('2026-02-20T14:00:00Z').toISOString(),
            note: '올리브영 선크림 SPF50+ 릴스 리뷰 정산',
        },
    },
    {
        label: '아모레유스랩 × 채린글로우 — 앰플 세럼 피드+스토리 (진행 중)',
        creator: CREATORS.채린글로우,
        brand: BRANDS.아모레유스랩,
        lifeMonument: {
            title: '봄 스킨케어 루틴 뷰티 컨텐츠',
            description: '봄철 환절기 피부 대비 스킨케어 루틴 공유. 앰플·세럼 집중 수분 루틴 Before/After.',
            category: '뷰티',
            moment_start_date: '2026-02-25',
        },
        workspace: {
            project_title: '아모레유스랩 유스 액티브 앰플 세럼 피드+스토리 협업',
            product_name: '유스 액티브 앰플 세럼 30ml',
            price_offer: 2_200_000,
            status: 'in_progress',
            channel_name: 'instagram',
            channel_subtype: 'feed',
            brand_condition_confirmed: true,
            creator_condition_confirmed: true,
            contract_status: 'signed',
            delivery_status: 'pending',
        },
        momentProposal: {
            message: '아모레퍼시픽 유스랩 신규 앰플 론칭 캠페인. 7일 사용 Before/After 피드 2장 + 스토리 3장. 글로우 스킨 결 중심 구성.',
            status: 'accepted',
            created_at: new Date('2026-02-20T15:00:00Z').toISOString(),
        },
        settlement: {
            gross_amount: 2_200_000,
            split_ratio: 0.75,
            settlement_month: '2026-03',
            status: 'escrow',
            paid_at: null,
            note: '아모레유스랩 앰플 세럼 피드+스토리 정산 (진행 중)',
        },
    },
]

function calcSettlement(gross: number, ratio: number) {
    const creatorAmount = Math.round(gross * ratio)
    const mcnAmount = gross - creatorAmount
    const withholdingAmount = Math.round(creatorAmount * 0.033)
    const netCreatorAmount = creatorAmount - withholdingAmount
    return { creatorAmount, mcnAmount, withholdingAmount, netCreatorAmount }
}

async function main() {
    const isDelete = process.argv.includes('--delete')

    if (isDelete) {
        console.log('🗑️  데모 데이터 삭제 중...')
        for (const c of DEMO_COLLABS) {
            const cid = c.creator.id
            const bid = c.brand.id
            await sb.from('settlements').delete().eq('creator_id', cid).eq('brand_id', bid).eq('team_id', TEAM_ID)
            console.log(`  ✅ settlement 삭제 (${c.label})`)
            // workspace 삭제 (creator+brand 기준)
            const { data: ws } = await sb.from('workspaces').select('id').eq('creator_id', cid).eq('brand_id', bid).eq('project_title', c.workspace.project_title)
            if (ws?.length) {
                await sb.from('workspaces').delete().in('id', ws.map((w: any) => w.id))
                console.log(`  ✅ workspace 삭제 (${c.label})`)
            }
            const { data: mp } = await sb.from('moment_proposals').select('id').eq('creator_id', cid).eq('brand_id', bid)
            if (mp?.length) {
                const mpIds = mp.map((m: any) => m.id)
                // life_moments 삭제 (moment_proposals → moment_id)
                const { data: mps } = await sb.from('moment_proposals').select('moment_id').in('id', mpIds)
                const momentIds = mps?.map((m: any) => m.moment_id).filter(Boolean) || []
                await sb.from('moment_proposals').delete().in('id', mpIds)
                if (momentIds.length) await sb.from('life_moments').delete().in('id', momentIds)
                console.log(`  ✅ moment_proposals + life_moments 삭제 (${c.label})`)
            }
        }
        console.log('\n🎉 삭제 완료')
        return
    }

    // ─── INSERT ────────────────────────────────────────────────────────────────
    for (const collab of DEMO_COLLABS) {
        console.log(`\n📦 생성 중: ${collab.label}`)

        // 1. life_moments (NOT NULL 없음 — 안전)
        const { data: lm, error: lmErr } = await sb
            .from('life_moments')
            .insert({
                creator_id: collab.creator.id,
                team_id: TEAM_ID,
                title: collab.lifeMonument.title,
                description: collab.lifeMonument.description,
                category: collab.lifeMonument.category,
                moment_start_date: collab.lifeMonument.moment_start_date,
                status: 'completed',
            })
            .select('id')
            .single()

        if (lmErr) { console.error(`  ❌ life_moments: ${lmErr.message}`); continue }
        console.log(`  ✅ life_moments: ${lm.id}`)

        // 2. moment_proposals (brand_id, creator_id, moment_id NOT NULL)
        const { data: mp, error: mpErr } = await sb
            .from('moment_proposals')
            .insert({
                brand_id: collab.brand.id,
                creator_id: collab.creator.id,
                moment_id: lm.id,
                message: collab.momentProposal.message,
                status: collab.momentProposal.status,
                creator_team_id: TEAM_ID,
                created_at: collab.momentProposal.created_at,
            })
            .select('id')
            .single()

        if (mpErr) { console.error(`  ❌ moment_proposals: ${mpErr.message}`); continue }
        console.log(`  ✅ moment_proposals: ${mp.id}`)

        // 3. workspaces (brand_id, creator_id, project_title NOT NULL)
        const { data: ws, error: wsErr } = await sb
            .from('workspaces')
            .insert({
                brand_id: collab.brand.id,
                creator_id: collab.creator.id,
                project_title: collab.workspace.project_title,
                product_name: collab.workspace.product_name,
                price_offer: collab.workspace.price_offer,
                status: collab.workspace.status,
                channel_name: collab.workspace.channel_name,
                channel_subtype: collab.workspace.channel_subtype,
                brand_condition_confirmed: collab.workspace.brand_condition_confirmed,
                creator_condition_confirmed: collab.workspace.creator_condition_confirmed,
                contract_status: collab.workspace.contract_status,
                delivery_status: collab.workspace.delivery_status,
                original_proposal_id: mp.id,
                original_proposal_type: 'moment_proposal',
            })
            .select('id')
            .single()

        if (wsErr) { console.error(`  ❌ workspaces: ${wsErr.message}`); continue }
        console.log(`  ✅ workspaces: ${ws.id}`)

        // workspace_id를 moment_proposals에 역참조 업데이트
        await sb.from('moment_proposals').update({ workspace_id: ws.id }).eq('id', mp.id)

        // 4. settlements (creator_id NOT NULL, 나머지 nullable)
        const { gross_amount, split_ratio } = collab.settlement
        const { creatorAmount, mcnAmount, withholdingAmount, netCreatorAmount } = calcSettlement(gross_amount, split_ratio)

        const { error: sErr } = await sb.from('settlements').insert({
            team_id: TEAM_ID,
            creator_id: collab.creator.id,
            brand_id: collab.brand.id,
            workspace_id: ws.id,
            proposal_id: mp.id,
            proposal_type: 'moment_proposal',
            gross_amount,
            split_ratio,
            creator_amount: creatorAmount,
            mcn_amount: mcnAmount,
            withholding_rate: 0.033,
            withholding_amount: withholdingAmount,
            net_creator_amount: netCreatorAmount,
            status: collab.settlement.status,
            settlement_month: collab.settlement.settlement_month,
            paid_at: collab.settlement.paid_at,
            note: collab.settlement.note,
        })

        if (sErr) {
            console.error(`  ❌ settlements: ${sErr.message}`)
        } else {
            console.log(`  ✅ settlements (${collab.settlement.status})`)
            console.log(`     Gross ₩${gross_amount.toLocaleString()} → 크리에이터 ₩${creatorAmount.toLocaleString()} / MCN ₩${mcnAmount.toLocaleString()} / 실지급 ₩${netCreatorAmount.toLocaleString()}`)
        }
    }

    // 5. mcn_revenue_splits
    const splits = Object.values(CREATORS).map(c => ({ team_id: TEAM_ID, creator_id: c.id, split_ratio: 0.75 }))
    const { error: splitErr } = await sb.from('mcn_revenue_splits').upsert(splits, { onConflict: 'team_id,creator_id' })
    if (splitErr) console.warn('⚠️  배분율 UPSERT 실패:', splitErr.message)
    else console.log('\n✅ 배분율(75%) 설정 완료')

    console.log('\n🎉 완료!')
    console.log('   마스터 트래커: moment_proposals → (get_team_proposals RPC 업데이트 필요)')
    console.log('   캘린더:        life_moments.moment_start_date + moment_proposals.created_at')
    console.log('   크리에이터관리: moment_proposals 카운트 반영')
    console.log('   정산 탭:       settlements → workspaces 연결 완료')
}

main().catch(e => { console.error(e); process.exit(1) })
