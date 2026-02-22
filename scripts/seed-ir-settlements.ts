/**
 * IR 데모용 모의 정산 데이터 시딩
 *
 * 실행: npx tsx scripts/seed-ir-settlements.ts
 * 삭제: npx tsx scripts/seed-ir-settlements.ts --delete
 *
 * 동작:
 *  1. completed 상태인 mock 제안서(product_applications, moment_proposals, campaign_applications) 조회
 *  2. mcn_revenue_splits에 크리에이터별 배분율 UPSERT (없으면 60~80% 랜덤)
 *  3. settlements 레코드 생성 (70%는 paid, 30%는 pending)
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(__dirname, '..', '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
if (!supabaseUrl || !supabaseKey) {
    console.error('❌ 환경변수가 없습니다.')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

function randomPastDate(maxDaysAgo: number): string {
    const d = new Date()
    d.setDate(d.getDate() - Math.floor(Math.random() * maxDaysAgo + 1))
    return d.toISOString()
}

function toSettlementMonth(isoString: string): string {
    // 'YYYY-MM' format
    return isoString.slice(0, 7)
}

// Spread settlement months across last 3 months for realistic demo
function spreadMonth(index: number): string {
    const now = new Date()
    const monthOffset = index % 3 // 0, 1, 2 months ago
    const d = new Date(now.getFullYear(), now.getMonth() - monthOffset, 1)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

async function main() {
    const isDelete = process.argv.includes('--delete')

    if (isDelete) {
        console.log('🗑️  모의 정산 데이터 삭제 중...')

        // settlements: delete by joining with mock creator profiles
        const { data: mockCreators } = await supabase
            .from('profiles')
            .select('id')
            .eq('is_mock', true)
            .eq('role', 'creator')

        if (mockCreators?.length) {
            const creatorIds = mockCreators.map((c: any) => c.id)
            const { error: sErr } = await supabase
                .from('settlements')
                .delete()
                .in('creator_id', creatorIds)
            if (sErr) console.error('settlements 삭제 실패:', sErr.message)
            else console.log('✅ settlements 삭제')
        }

        // mcn_revenue_splits: delete for mock team
        const { data: mcnProfile } = await supabase
            .from('profiles')
            .select('id')
            .eq('is_mock', true)
            .eq('role', 'mcn')
            .maybeSingle()

        if (mcnProfile) {
            const { data: team } = await supabase
                .from('teams')
                .select('id')
                .eq('created_by', mcnProfile.id)
                .maybeSingle()
            if (team) {
                const { error: splitErr } = await supabase
                    .from('mcn_revenue_splits')
                    .delete()
                    .eq('team_id', team.id)
                if (splitErr) console.error('mcn_revenue_splits 삭제 실패:', splitErr.message)
                else console.log('✅ mcn_revenue_splits 삭제')
            }
        }

        console.log('🎉 삭제 완료!')
        return
    }

    // ── 1. MCN 팀 조회 ──
    console.log('📊 MCN 팀 정보 조회 중...')

    const { data: mcnProfile } = await supabase
        .from('profiles')
        .select('id, display_name')
        .eq('is_mock', true)
        .eq('role', 'mcn')
        .maybeSingle()

    if (!mcnProfile) {
        console.error('❌ mock MCN 계정이 없습니다. seed-ir-brand-mcn.ts를 먼저 실행하세요.')
        process.exit(1)
    }
    console.log(`  MCN: ${mcnProfile.display_name}`)

    const { data: team } = await supabase
        .from('teams')
        .select('id, name')
        .eq('created_by', mcnProfile.id)
        .maybeSingle()

    if (!team) {
        console.error('❌ MCN 팀이 없습니다.')
        process.exit(1)
    }
    console.log(`  팀: ${team.name} (${team.id})`)

    // ── 2. 소속 크리에이터 조회 ──
    const { data: memberRows } = await supabase
        .from('team_members')
        .select('user_id')
        .eq('team_id', team.id)

    const creatorIds: string[] = (memberRows || []).map((m: any) => m.user_id)

    // Filter to only creator-role profiles (exclude MCN itself)
    const { data: creatorProfiles } = await supabase
        .from('profiles')
        .select('id, display_name')
        .in('id', creatorIds)
        .eq('role', 'creator')

    if (!creatorProfiles?.length) {
        console.error('❌ 소속 크리에이터가 없습니다.')
        process.exit(1)
    }
    console.log(`  소속 크리에이터: ${creatorProfiles.length}명`)

    const creatorIdSet = new Set(creatorProfiles.map((c: any) => c.id))
    const creatorDisplayNames: Record<string, string> = {}
    for (const c of creatorProfiles as any[]) {
        creatorDisplayNames[c.id] = c.display_name
    }

    // ── 3. mcn_revenue_splits UPSERT ──
    console.log('\n💰 배분율 설정 중...')

    // Preset ratios per creator (realistic variety)
    const PRESET_RATIOS = [0.80, 0.75, 0.75, 0.70, 0.70, 0.70, 0.65, 0.65, 0.60]

    const splitUpserts = (creatorProfiles as any[]).map((c, i) => ({
        team_id: team.id,
        creator_id: c.id,
        split_ratio: PRESET_RATIOS[i % PRESET_RATIOS.length],
        effective_from: '2026-01-01',
    }))

    const { error: splitErr } = await supabase
        .from('mcn_revenue_splits')
        .upsert(splitUpserts, { onConflict: 'team_id,creator_id' })

    if (splitErr) {
        console.error('  ⚠️  배분율 UPSERT 실패:', splitErr.message)
    } else {
        console.log(`  ✅ 배분율 ${splitUpserts.length}건 설정`)
    }

    // Build split ratio map
    const splitMap: Record<string, number> = {}
    for (const s of splitUpserts) {
        splitMap[s.creator_id] = s.split_ratio
    }

    // ── 4. completed 제안서 조회 ──
    console.log('\n📋 완료 제안서 조회 중...')

    // Brand proposals
    const { data: completedBP } = await supabase
        .from('product_applications')
        .select('id, brand_id, influencer_id, price_offer, created_at')
        .eq('is_mock', true)
        .eq('status', 'completed')
        .in('influencer_id', Array.from(creatorIdSet))

    // Moment proposals
    const { data: completedMP } = await supabase
        .from('moment_proposals')
        .select('id, brand_id, influencer_id, price_offer, created_at')
        .eq('is_mock', true)
        .eq('status', 'completed')
        .in('influencer_id', Array.from(creatorIdSet))

    // Campaign applications (get brand_id via campaign join)
    const { data: completedCA } = await supabase
        .from('campaign_applications')
        .select('id, influencer_id, price_offer, created_at, campaign:campaigns(brand_id)')
        .eq('status', 'completed')
        .in('influencer_id', Array.from(creatorIdSet))

    console.log(`  product_applications 완료: ${completedBP?.length || 0}건`)
    console.log(`  moment_proposals 완료: ${completedMP?.length || 0}건`)
    console.log(`  campaign_applications 완료: ${completedCA?.length || 0}건`)

    // ── 5. settlements 생성 ──
    console.log('\n🏦 정산 레코드 생성 중...')

    const settlementRecords: any[] = []
    let idx = 0

    const buildRecord = (
        proposalType: string,
        proposalId: string,
        creatorId: string,
        brandId: string | null,
        priceOffer: number | null,
        createdAt: string
    ) => {
        const gross = priceOffer || 1000000 // fallback at 10x scale
        const ratio = splitMap[creatorId] ?? 0.70
        const creatorAmount = Math.round(gross * ratio)
        const mcnAmount = gross - creatorAmount
        const withholdingAmount = Math.round(creatorAmount * 0.033)
        const netCreatorAmount = creatorAmount - withholdingAmount
        const isPaid = Math.random() < 0.70 // 70% already paid
        const month = spreadMonth(idx)

        idx++

        return {
            team_id: team.id,
            creator_id: creatorId,
            brand_id: brandId,
            proposal_type: proposalType,
            proposal_id: proposalId,
            gross_amount: gross,
            split_ratio: ratio,
            creator_amount: creatorAmount,
            mcn_amount: mcnAmount,
            withholding_rate: 0.033,
            withholding_amount: withholdingAmount,
            net_creator_amount: netCreatorAmount,
            status: isPaid ? 'paid' : 'pending',
            paid_at: isPaid ? randomPastDate(10) : null,
            settlement_month: month,
            note: null,
        }
    }

    for (const p of (completedBP as any[] || [])) {
        settlementRecords.push(buildRecord(
            'product_application', p.id, p.influencer_id, p.brand_id, p.price_offer, p.created_at
        ))
    }

    for (const p of (completedMP as any[] || [])) {
        settlementRecords.push(buildRecord(
            'moment_proposal', p.id, p.influencer_id, p.brand_id, p.price_offer, p.created_at
        ))
    }

    for (const p of (completedCA as any[] || [])) {
        const brandId = (p as any).campaign?.brand_id || null
        settlementRecords.push(buildRecord(
            'campaign_application', p.id, p.influencer_id, brandId, p.price_offer, p.created_at
        ))
    }

    // Always add synthetic demo settlements for richer demo data
    console.log('  ℹ️  합성 데모 정산 데이터 20건 추가...')

    const SYNTHETIC_AMOUNTS = [500000, 800000, 1000000, 1500000, 2000000, 3000000, 4000000, 5000000] // 10x scale
    const creators = creatorProfiles as any[]

    // Get mock brand IDs to make data look realistic
    const { data: mockBrands } = await supabase
        .from('profiles')
        .select('id')
        .eq('is_mock', true)
        .eq('role', 'brand')

    const brandIds = (mockBrands || []).map((b: any) => b.id)

    for (let i = 0; i < 20; i++) {
        const creator = creators[i % creators.length]
        const gross = SYNTHETIC_AMOUNTS[Math.floor(Math.random() * SYNTHETIC_AMOUNTS.length)]
        const ratio = splitMap[creator.id] ?? 0.70
        const creatorAmount = Math.round(gross * ratio)
        const mcnAmount = gross - creatorAmount
        const isPaid = i < 14 // first 14 paid, last 6 pending
        const month = spreadMonth(i)
        const brandId = brandIds.length > 0 ? brandIds[i % brandIds.length] : null

        const withholdingAmt = Math.round(creatorAmount * 0.033)
        const netCreatorAmt = creatorAmount - withholdingAmt

        settlementRecords.push({
            team_id: team.id,
            creator_id: creator.id,
            brand_id: brandId,
            proposal_type: ['product_application', 'moment_proposal', 'campaign_application'][i % 3],
            proposal_id: `synthetic-${Date.now()}-${i}`,
            gross_amount: gross,
            split_ratio: ratio,
            creator_amount: creatorAmount,
            mcn_amount: mcnAmount,
            withholding_rate: 0.033,
            withholding_amount: withholdingAmt,
            net_creator_amount: netCreatorAmt,
            status: isPaid ? 'paid' : 'pending',
            paid_at: isPaid ? randomPastDate(20) : null,
            settlement_month: month,
            note: null,
        })
    }


    // Insert in batches of 10
    let successCount = 0
    const BATCH = 10
    for (let i = 0; i < settlementRecords.length; i += BATCH) {
        const batch = settlementRecords.slice(i, i + BATCH)
        const { error } = await supabase.from('settlements').insert(batch)
        if (error) {
            console.error(`  ⚠️  배치 ${Math.floor(i / BATCH) + 1} 실패:`, error.message)
        } else {
            successCount += batch.length
        }
    }

    // ── 6. Summary ──
    const paidCount = settlementRecords.filter(r => r.status === 'paid').length
    const pendingCount = settlementRecords.filter(r => r.status === 'pending').length
    const totalGross = settlementRecords.reduce((s, r) => s + r.gross_amount, 0)
    const totalCreator = settlementRecords.reduce((s, r) => s + r.creator_amount, 0)
    const totalMcn = settlementRecords.reduce((s, r) => s + r.mcn_amount, 0)

    console.log('\n' + '═'.repeat(50))
    console.log('🎉 정산 데이터 시딩 완료!')
    console.log('═'.repeat(50))
    console.log(`  총 정산 레코드: ${successCount}건`)
    console.log(`  지급 완료:  ${paidCount}건`)
    console.log(`  지급 대기:  ${pendingCount}건`)
    console.log(`  총 매출:    ₩${totalGross.toLocaleString()}`)
    console.log(`  크리에이터: ₩${totalCreator.toLocaleString()}`)
    console.log(`  MCN 수수료: ₩${totalMcn.toLocaleString()}`)
    console.log('═'.repeat(50))
}

main().catch(console.error)
