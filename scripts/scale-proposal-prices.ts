/**
 * 모든 mock 제안서의 price_offer를 10배로 업데이트
 * 실행: npx tsx scripts/scale-proposal-prices.ts
 */
import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(__dirname, '..', '.env.local') })

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function main() {
    console.log('📈 mock 제안서 price_offer 10배 스케일업...')

    // 1. product_applications
    const { data: bp, error: bpErr } = await supabase
        .from('product_applications')
        .select('id, price_offer')
        .eq('is_mock', true)
        .not('price_offer', 'is', null)

    if (bpErr) { console.error('product_applications 조회 실패:', bpErr.message) }
    else if (bp?.length) {
        for (const row of bp) {
            await supabase
                .from('product_applications')
                .update({ price_offer: (row.price_offer || 0) * 10 })
                .eq('id', row.id)
        }
        console.log(`  ✅ product_applications ${bp.length}건 업데이트`)
    }

    // 2. moment_proposals
    const { data: mp, error: mpErr } = await supabase
        .from('moment_proposals')
        .select('id, price_offer')
        .eq('is_mock', true)
        .not('price_offer', 'is', null)

    if (mpErr) { console.error('moment_proposals 조회 실패:', mpErr.message) }
    else if (mp?.length) {
        for (const row of mp) {
            await supabase
                .from('moment_proposals')
                .update({ price_offer: (row.price_offer || 0) * 10 })
                .eq('id', row.id)
        }
        console.log(`  ✅ moment_proposals ${mp.length}건 업데이트`)
    }

    // 3. campaign_applications (no is_mock column — update via mock campaign brand_id)
    const { data: mockBrands } = await supabase
        .from('profiles')
        .select('id')
        .eq('is_mock', true)
        .eq('role', 'brand')

    if (mockBrands?.length) {
        const brandIds = mockBrands.map((b: any) => b.id)
        const { data: mockCampaigns } = await supabase
            .from('campaigns')
            .select('id')
            .in('brand_id', brandIds)

        if (mockCampaigns?.length) {
            const campIds = mockCampaigns.map((c: any) => c.id)
            const { data: ca } = await supabase
                .from('campaign_applications')
                .select('id, price_offer')
                .in('campaign_id', campIds)
                .not('price_offer', 'is', null)

            if (ca?.length) {
                for (const row of ca) {
                    await supabase
                        .from('campaign_applications')
                        .update({ price_offer: (row.price_offer || 0) * 10 })
                        .eq('id', row.id)
                }
                console.log(`  ✅ campaign_applications ${ca.length}건 업데이트`)
            }
        }
    }

    // 4. brand_products price (×10)
    const { data: products } = await supabase
        .from('brand_products')
        .select('id, price')
        .eq('is_mock', true)
        .not('price', 'is', null)

    if (products?.length) {
        for (const row of products) {
            await supabase
                .from('brand_products')
                .update({ price: (row.price || 0) * 10 })
                .eq('id', row.id)
        }
        console.log(`  ✅ brand_products ${products.length}건 업데이트`)
    }

    // 5. creator price cards (profiles: price_video, price_feed, price_story)
    const { data: creators } = await supabase
        .from('profiles')
        .select('id, price_video, price_feed, price_story, price_usage_rights, price_auto_dm')
        .eq('is_mock', true)
        .eq('role', 'creator')

    if (creators?.length) {
        for (const row of creators) {
            await supabase
                .from('profiles')
                .update({
                    price_video: (row.price_video || 0) * 10,
                    price_feed: (row.price_feed || 0) * 10,
                    price_story: (row.price_story || 0) * 10,
                    price_usage_rights: (row.price_usage_rights || 0) * 10,
                    price_auto_dm: (row.price_auto_dm || 0) * 10,
                })
                .eq('id', row.id)
        }
        console.log(`  ✅ creator 단가 ${creators.length}명 업데이트`)
    }

    console.log('\n🎉 스케일업 완료!')
}

main().catch(console.error)
