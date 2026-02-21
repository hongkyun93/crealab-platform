/**
 * Mock 데이터 날짜를 3월로 분산 업데이트
 * 
 * 실행: npx tsx scripts/seed-ir-march-dates.ts
 * 
 * 1. MCN 소속 크리에이터 모먼트의 event_date → 2~3월 분산
 * 2. Mock 제안서의 desired_date → 3월 분산
 */

import { supabase } from './seed-ir-data'

function randomDateInRange(startDate: Date, endDate: Date): string {
    const start = startDate.getTime()
    const end = endDate.getTime()
    const d = new Date(start + Math.random() * (end - start))
    return d.toISOString().split('T')[0]
}

async function main() {
    console.log('📅 3월 일정 분산 업데이트 시작...\n')

    // ── 1. MCN 소속 크리에이터의 모먼트들 ──
    // Find MCN team
    const { data: mcnProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', 'mock_mcn_demo@mock.creadypick.com')
        .maybeSingle()

    if (!mcnProfile) {
        console.error('❌ MCN 데모 계정이 없습니다')
        return
    }

    // Get MCN team
    const { data: team } = await supabase
        .from('teams')
        .select('id')
        .eq('created_by', mcnProfile.id)
        .maybeSingle()

    if (!team) {
        console.error('❌ MCN 팀이 없습니다')
        return
    }

    // Get team moments
    const { data: moments } = await supabase
        .from('life_moments')
        .select('id, title, influencer_id')
        .eq('team_id', team.id)
        .eq('is_mock', true)

    console.log(`📋 MCN 모먼트: ${moments?.length || 0}개`)

    // Spread across Feb 20 ~ Apr 10 (centered on March)
    const rangeStart = new Date(2026, 1, 20) // Feb 20
    const rangeEnd = new Date(2026, 3, 10)   // Apr 10
    let momentCount = 0

    for (const m of (moments || [])) {
        const eventDate = randomDateInRange(rangeStart, rangeEnd)
        const { error } = await supabase
            .from('life_moments')
            .update({ event_date: eventDate })
            .eq('id', m.id)

        if (!error) momentCount++
    }
    console.log(`  ✅ 모먼트 ${momentCount}개 날짜 업데이트\n`)

    // ── 2. Mock moment_proposals desired_date ──
    const { data: mps } = await supabase
        .from('moment_proposals')
        .select('id')
        .eq('is_mock', true)

    console.log(`📋 Moment Proposals: ${mps?.length || 0}개`)

    const marchStart = new Date(2026, 2, 1)  // Mar 1
    const marchEnd = new Date(2026, 2, 31)   // Mar 31
    let mpCount = 0

    for (const mp of (mps || [])) {
        const desiredDate = randomDateInRange(marchStart, marchEnd)
        const { error } = await supabase
            .from('moment_proposals')
            .update({ desired_date: desiredDate })
            .eq('id', mp.id)

        if (!error) mpCount++
    }
    console.log(`  ✅ Moment Proposals ${mpCount}개 desired_date 업데이트\n`)

    // ── 3. Mock brand_proposals desired_date ──
    const { data: bps } = await supabase
        .from('brand_proposals')
        .select('id')
        .eq('is_mock', true)

    console.log(`📋 Brand Proposals: ${bps?.length || 0}개`)
    let bpCount = 0

    for (const bp of (bps || [])) {
        const desiredDate = randomDateInRange(marchStart, marchEnd)
        const { error } = await supabase
            .from('brand_proposals')
            .update({ desired_date: desiredDate })
            .eq('id', bp.id)

        if (!error) bpCount++
    }
    console.log(`  ✅ Brand Proposals ${bpCount}개 desired_date 업데이트\n`)

    // ── 4. Campaign recruitment_deadline ──
    const { data: mockBrands } = await supabase
        .from('profiles')
        .select('id')
        .eq('is_mock', true)
        .eq('role', 'brand')

    if (mockBrands?.length) {
        const brandIds = mockBrands.map(b => b.id)
        const { data: campaigns } = await supabase
            .from('campaigns')
            .select('id')
            .in('brand_id', brandIds)

        console.log(`📋 Campaigns: ${campaigns?.length || 0}개`)
        let campCount = 0

        for (const c of (campaigns || [])) {
            const deadline = randomDateInRange(new Date(2026, 2, 5), new Date(2026, 2, 25))
            const { error } = await supabase
                .from('campaigns')
                .update({ recruitment_deadline: deadline })
                .eq('id', c.id)

            if (!error) campCount++
        }
        console.log(`  ✅ Campaigns ${campCount}개 deadline 업데이트\n`)
    }

    console.log('═'.repeat(50))
    console.log('🎉 3월 일정 분산 완료!')
    console.log('═'.repeat(50))
}

main().catch(console.error)
