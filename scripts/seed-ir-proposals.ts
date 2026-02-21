/**
 * IR 데모용 Mock 제안서 80건 생성
 * 
 * 실행: npx tsx scripts/seed-ir-proposals.ts
 * 삭제: npx tsx scripts/seed-ir-proposals.ts --delete
 * 
 * - moment_proposals: 30건
 * - brand_proposals: 30건
 * - campaign + campaign_applications: 20건
 * 
 * 모든 제안서는 is_mock=true, MCN 소속 크리에이터 대상
 */

import { supabase } from './seed-ir-data'
import { randomUUID } from 'crypto'

// ── Status distributions ──
function pickStatus(pool: { status: string; weight: number }[]): string {
    const total = pool.reduce((s, p) => s + p.weight, 0)
    let r = Math.random() * total
    for (const p of pool) {
        r -= p.weight
        if (r <= 0) return p.status
    }
    return pool[pool.length - 1].status
}

const PROPOSAL_STATUSES = [
    { status: 'offered', weight: 4 },
    { status: 'accepted', weight: 3 },
    { status: 'in_progress', weight: 4 },
    { status: 'completed', weight: 3 },
    { status: 'rejected', weight: 2 },
]

const CAMPAIGN_STATUSES = [
    { status: 'pending', weight: 3 },
    { status: 'accepted', weight: 3 },
    { status: 'in_progress', weight: 4 },
    { status: 'completed', weight: 3 },
    { status: 'rejected', weight: 1 },
]

// ── Fill progress fields based on status ──
function fillProgressFields(status: string, brandName: string) {
    const base: any = {}

    if (status === 'offered' || status === 'pending') {
        // Just sent, no actions taken
        return base
    }

    if (status === 'accepted') {
        base.brand_condition_confirmed = true
        // influencer hasn't confirmed yet
        return base
    }

    if (status === 'in_progress') {
        base.brand_condition_confirmed = true
        base.influencer_condition_confirmed = true
        base.contract_status = 'signed'
        base.brand_signature = brandName
        base.influencer_signature = '크리에이터 서명'
        base.brand_signed_at = randomPastDate(14)
        base.influencer_signed_at = randomPastDate(12)
        // Some in_progress have shipping
        if (Math.random() > 0.4) {
            base.delivery_status = 'shipped'
            base.tracking_number = `CJ${Math.floor(1000000000 + Math.random() * 9000000000)}`
        }
        return base
    }

    if (status === 'completed') {
        base.brand_condition_confirmed = true
        base.influencer_condition_confirmed = true
        base.contract_status = 'signed'
        base.brand_signature = brandName
        base.influencer_signature = '크리에이터 서명'
        base.brand_signed_at = randomPastDate(30)
        base.influencer_signed_at = randomPastDate(28)
        base.delivery_status = 'delivered'
        base.tracking_number = `CJ${Math.floor(1000000000 + Math.random() * 9000000000)}`
        base.content_submission_url = 'https://www.instagram.com/p/demo_content'
        base.content_submission_status = 'approved'
        base.content_submission_date = randomPastDate(5)
        return base
    }

    // rejected - no extra fields
    return base
}

function randomPastDate(daysAgo: number): string {
    const d = new Date()
    d.setDate(d.getDate() - Math.floor(Math.random() * daysAgo))
    return d.toISOString()
}

function randomFutureDate(daysAhead: number): string {
    const d = new Date()
    d.setDate(d.getDate() + Math.floor(Math.random() * daysAhead) + 7)
    return d.toISOString().split('T')[0]
}

function randomPrice(): number {
    const prices = [500000, 800000, 1000000, 1500000, 2000000, 3000000, 5000000]
    return prices[Math.floor(Math.random() * prices.length)]
}

const MESSAGES = [
    '안녕하세요! 저희 브랜드와 잘 맞을 것 같아 제안드립니다.',
    '크리에이터님의 콘텐츠를 인상깊게 봤습니다. 협업 제안드려요!',
    '모먼트 주제와 저희 제품이 잘 어울릴 것 같습니다.',
    '팔로워분들에게도 좋은 반응이 예상됩니다. 함께해요!',
    '작년에도 좋은 결과가 있었는데, 이번에도 제안드립니다.',
    '저희 신상품 론칭에 맞춰 콘텐츠 제작을 부탁드립니다.',
    '인스타그램 릴스로 제작해주시면 감사하겠습니다.',
    '유튜브 쇼츠 또는 인스타그램 릴스 중 편하신 채널로 부탁드려요.',
]

// ── Helper: random pick from array ──
function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)] }

async function main() {
    const isDelete = process.argv.includes('--delete')

    if (isDelete) {
        console.log('🗑️  mock 제안서 삭제 중...')
        const { error: e1 } = await supabase.from('moment_proposals').delete().eq('is_mock', true)
        if (e1) console.error('moment_proposals 삭제 실패:', e1.message)
        else console.log('✅ moment_proposals 삭제')

        const { error: e2 } = await supabase.from('brand_proposals').delete().eq('is_mock', true)
        if (e2) console.error('brand_proposals 삭제 실패:', e2.message)
        else console.log('✅ brand_proposals 삭제')

        // Campaign applications don't have is_mock — delete by mock campaign's brand_id
        const { data: mockBrands } = await supabase.from('profiles').select('id').eq('is_mock', true).eq('role', 'brand')
        if (mockBrands?.length) {
            const brandIds = mockBrands.map(b => b.id)
            // Delete applications for mock campaigns
            const { data: mockCampaigns } = await supabase.from('campaigns').select('id').in('brand_id', brandIds)
            if (mockCampaigns?.length) {
                const campIds = mockCampaigns.map(c => c.id)
                await supabase.from('campaign_applications').delete().in('campaign_id', campIds)
                console.log('✅ campaign_applications 삭제')
            }
            await supabase.from('campaigns').delete().in('brand_id', brandIds)
            console.log('✅ campaigns 삭제')
        }

        console.log('🎉 제안서 삭제 완료!')
        return
    }

    // ── Load data ──
    console.log('📊 기존 데이터 조회 중...')

    // Get mock brands
    const { data: brandProfiles } = await supabase
        .from('profiles')
        .select('id, display_name, email')
        .eq('is_mock', true)
        .eq('role', 'brand')
        .order('display_name')

    if (!brandProfiles?.length) {
        console.error('❌ mock 브랜드가 없습니다. seed-ir-brands.ts를 먼저 실행하세요.')
        return
    }
    console.log(`  브랜드: ${brandProfiles.length}개`)

    // Get brand products
    const brandIds = brandProfiles.map(b => b.id)
    const { data: allProducts } = await supabase
        .from('brand_products')
        .select('id, brand_id, name, price, category')
        .eq('is_mock', true)
        .in('brand_id', brandIds)

    console.log(`  제품: ${allProducts?.length || 0}개`)

    // Get MCN team creators (is_mock + role=creator + has team membership)
    const { data: mcnCreators } = await supabase
        .from('profiles')
        .select('id, display_name, tags, instagram_handle')
        .eq('is_mock', true)
        .eq('role', 'creator')

    if (!mcnCreators?.length) {
        console.error('❌ mock 크리에이터가 없습니다.')
        return
    }
    console.log(`  크리에이터: ${mcnCreators.length}명`)

    // Get creator moments
    const creatorIds = mcnCreators.map(c => c.id)
    const { data: moments } = await supabase
        .from('life_moments')
        .select('id, influencer_id, title, category, team_id')
        .eq('is_mock', true)
        .in('influencer_id', creatorIds)

    console.log(`  모먼트: ${moments?.length || 0}개`)

    // Build products map per brand
    const productsByBrand: Record<string, typeof allProducts> = {}
    for (const p of (allProducts || [])) {
        if (!productsByBrand[p.brand_id]) productsByBrand[p.brand_id] = []
        productsByBrand[p.brand_id].push(p)
    }

    // ── Phase 2A: Moment Proposals (30건) ──
    console.log('\n📋 [1/3] Moment Proposals 30건 생성...')
    let mpCount = 0
    const usedMomentPairs = new Set<string>()

    for (let i = 0; i < 30; i++) {
        const moment = pick(moments || [])
        if (!moment) break
        const brand = pick(brandProfiles)
        const pairKey = `${brand.id}-${moment.id}`
        if (usedMomentPairs.has(pairKey)) continue
        usedMomentPairs.add(pairKey)

        const products = productsByBrand[brand.id] || []
        const product = products.length > 0 ? pick(products) : null
        const status = pickStatus(PROPOSAL_STATUSES)
        const progress = fillProgressFields(status, brand.display_name)

        const { error } = await supabase.from('moment_proposals').insert({
            brand_id: brand.id,
            influencer_id: moment.influencer_id,
            moment_id: moment.id,
            product_id: product?.id || null,
            product_name: product?.name || '샘플 제품',
            product_type: 'gift',
            price_offer: randomPrice(),
            message: pick(MESSAGES),
            status,
            is_mock: true,
            desired_date: randomFutureDate(30),
            content_type: pick(['릴스', '피드', '스토리', '릴스+피드']),
            influencer_team_id: moment.team_id || null,
            ...progress,
            created_at: randomPastDate(45),
        })

        if (error) {
            console.warn(`  ⚠️ MP 실패:`, error.message)
        } else {
            mpCount++
        }
    }
    console.log(`  ✅ Moment Proposals ${mpCount}건 생성`)

    // ── Phase 2B: Brand Proposals (30건) ──
    console.log('\n📋 [2/3] Brand Proposals 30건 생성...')
    let bpCount = 0
    const usedBrandPairs = new Set<string>()

    for (let i = 0; i < 30; i++) {
        const brand = pick(brandProfiles)
        const creator = pick(mcnCreators)
        const pairKey = `${brand.id}-${creator.id}`
        if (usedBrandPairs.has(pairKey)) continue
        usedBrandPairs.add(pairKey)

        const products = productsByBrand[brand.id] || []
        const product = products.length > 0 ? pick(products) : null
        const status = pickStatus(PROPOSAL_STATUSES)
        const progress = fillProgressFields(status, brand.display_name)

        const { error } = await supabase.from('brand_proposals').insert({
            brand_id: brand.id,
            influencer_id: creator.id,
            product_id: product?.id || null,
            product_name: product?.name || '샘플 제품',
            product_type: 'gift',
            price_offer: randomPrice(),
            message: pick(MESSAGES),
            status,
            is_mock: true,
            desired_date: randomFutureDate(30),
            content_type: pick(['릴스', '피드', '스토리', '릴스+피드']),
            instagram_handle: creator.instagram_handle,
            ...progress,
            created_at: randomPastDate(45),
        })

        if (error) {
            console.warn(`  ⚠️ BP 실패:`, error.message)
        } else {
            bpCount++
        }
    }
    console.log(`  ✅ Brand Proposals ${bpCount}건 생성`)

    // ── Phase 2C: Campaigns + Campaign Applications (20건) ──
    console.log('\n📋 [3/3] Campaigns + Applications 20건 생성...')
    let caCount = 0

    // Create 5 campaigns across different brands, then 20 applications
    const campaignBrands = brandProfiles.slice(0, 10) // Use first 10 brands
    const campaignIds: string[] = []

    for (let i = 0; i < 5; i++) {
        const brand = campaignBrands[i % campaignBrands.length]
        const products = productsByBrand[brand.id] || []
        const product = products.length > 0 ? pick(products) : null

        const { data: campaign, error: campErr } = await supabase.from('campaigns').insert({
            brand_id: brand.id,
            title: `${brand.display_name} ${pick(['여름', '가을', '겨울', '봄', '시즌'])} 크리에이터 모집`,
            description: `${brand.display_name}에서 ${product?.name || '신상품'} 체험단을 모집합니다. 인스타그램/유튜브 콘텐츠 제작이 가능한 크리에이터를 찾습니다.`,
            product_name: product?.name || '신상품',
            product_image_url: null,
            budget_min: 50000,
            budget_max: 300000,
            status: 'active',
            category: product?.category || '💄 뷰티',
            tags: [product?.category || '💄 뷰티'],
            recruitment_count: pick([5, 10, 15, 20]),
            recruitment_deadline: randomFutureDate(14),
            channels: pick([['instagram'], ['youtube'], ['instagram', 'youtube']]),
            product_type: 'gift',
        }).select('id').single()

        if (campErr || !campaign) {
            console.warn(`  ⚠️ 캠페인 생성 실패:`, campErr?.message)
            continue
        }
        campaignIds.push(campaign.id)
    }
    console.log(`  ✅ 캠페인 ${campaignIds.length}개 생성`)

    // Applications: 20건
    const usedAppPairs = new Set<string>()
    for (let i = 0; i < 20; i++) {
        const campaignId = pick(campaignIds)
        const creator = pick(mcnCreators)
        const pairKey = `${campaignId}-${creator.id}`
        if (usedAppPairs.has(pairKey)) continue
        usedAppPairs.add(pairKey)

        const status = pickStatus(CAMPAIGN_STATUSES)
        const progress = fillProgressFields(status, '브랜드')

        const { error } = await supabase.from('campaign_applications').insert({
            campaign_id: campaignId,
            influencer_id: creator.id,
            status,
            message: pick(MESSAGES),
            price_offer: randomPrice(),
            motivation: '해당 제품에 관심이 많아 지원합니다. 기존 콘텐츠와도 잘 어울릴 것 같습니다.',
            content_plan: '릴스 1건 + 피드 1건으로 제품 사용 후기를 진정성 있게 전달할 예정입니다.',
            instagram_handle: creator.instagram_handle,
            ...progress,
            created_at: randomPastDate(30),
        })

        if (error) {
            console.warn(`  ⚠️ CA 실패:`, error.message)
        } else {
            caCount++
        }
    }
    console.log(`  ✅ Campaign Applications ${caCount}건 생성`)

    // ── Summary ──
    console.log('\n' + '═'.repeat(50))
    console.log('🎉 Mock 제안서 생성 완료!')
    console.log('═'.repeat(50))
    console.log(`  Moment Proposals: ${mpCount}건`)
    console.log(`  Brand Proposals:  ${bpCount}건`)
    console.log(`  Campaign Apps:    ${caCount}건`)
    console.log(`  총합:             ${mpCount + bpCount + caCount}건`)
}

main().catch(console.error)
