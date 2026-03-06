/**
 * 마스터 트래커용 대용량 데모 데이터 생성기
 * 15명 크리에이터 × 각 3~5건 협업 = 총 ~60건
 * 마스터 트래커의 7가지 단계(협의, 계약, 배송, 콘텐츠, 정산, 완료, 취소)에 고르게 분산.
 * 
 * 실행: npx tsx scripts/seed-erp-master.ts
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(__dirname, '..', '.env.local') })

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

const TEAM_ID = '8c998fdd-1f3b-47e0-8711-79a760460089'

const CREATORS = [
    { id: "5a2a3a9f-1f75-4e33-94bc-9c88073b01f1", name: "크픽직원1" },
    { id: "5afe835a-f87b-49f6-8a1a-3911c23d9223", name: "고결" },
    { id: "8bb9de29-7324-4f13-a7e8-b21ce379b45e", name: "hongkyuniiii" },
    { id: "71fdf528-669b-4a7a-8b15-6379112c63e3", name: "나래플러스" },
    { id: "f128cb0f-6841-415a-9308-506f0800a966", name: "도윤맨즈" },
    { id: "e346ee84-3b6f-4b46-9462-064ee9e52520", name: "수빈OOTD" },
    { id: "474afbc3-e375-4ff1-9b0e-890aedec826c", name: "태희의옷장" },
    { id: "67ccae44-300c-4473-a47b-380561684d34", name: "하늘니트" },
    { id: "7190bff8-f695-4cbd-a921-d7a043e6527b", name: "하린빈티지" },
    { id: "1a673318-ed79-4643-9e5b-9a5df91ba993", name: "서연스킨" },
    { id: "a7a17d57-6b43-4f7d-a620-ca77d9a27192", name: "서현향수일기" },
    { id: "2d874986-4dba-4acc-b4e5-1b52f974ba8e", name: "소미스킨랩" },
    { id: "63dec43c-53fb-4eb9-9eca-9faadc9be35f", name: "수아코스메틱" },
    { id: "326dee5c-c08c-4b1a-8ea3-4c68d40e40b6", name: "유나메이크업" },
    { id: "aa9f96e8-42e1-4da2-90b6-ccc7f4aa060b", name: "정아클리닉" }
]

const BRANDS = [
    { id: "52f01d28-92ab-40ee-86b0-8e85e5c9d887", name: "네일스튜디오 N" },
    { id: "3293e5f8-bff5-4292-b3ef-7104537c8575", name: "보이브" },
    { id: "c6c73ac6-55b4-4795-84a8-1828617ebb20", name: "JIN HYUNG KANG" },
    { id: "b63d56e4-1009-4330-8420-b6dc73b1622e", name: "선스크린랩" },
    { id: "09d861dd-581d-4347-96f5-dbe5b51f8b9d", name: "리빙카페 홈" },
    { id: "6b8cedf0-1548-42fc-ba3f-ed434ace5bb9", name: "올리브영" },
    { id: "e8175ba8-728d-490d-aed0-cb40e47c2e63", name: "아뜰리에 무지" },
    { id: "2ce9d5bb-0421-49a9-8850-c117101b2f1c", name: "아모레 유스랩" },
    { id: "981e7b79-e32e-4729-90c5-5acced8c2c8a", name: "빈티지 컬렉트" },
    { id: "47a4f91a-2670-41a8-af19-062455729976", name: "데님8 팩토리" }
]

// 스테이지 정의
const STAGES = [
    { name: '협의', wsStatus: 'active', mpStatus: 'offered', cStatus: 'none', dStatus: 'pending', sStatus: null, contentStatus: 'pending', ratio: 0.15 },
    { name: '계약', wsStatus: 'active', mpStatus: 'accepted', cStatus: 'pending', dStatus: 'pending', sStatus: null, contentStatus: 'pending', ratio: 0.15 },
    { name: '배송/리뷰', wsStatus: 'in_progress', mpStatus: 'accepted', cStatus: 'signed', dStatus: 'shipping', sStatus: null, contentStatus: 'pending', ratio: 0.15 },
    { name: '콘텐츠제작', wsStatus: 'in_progress', mpStatus: 'accepted', cStatus: 'signed', dStatus: 'delivered', sStatus: null, contentStatus: 'revision', ratio: 0.20 },
    { name: '정산대기', wsStatus: 'settlement', mpStatus: 'completed', cStatus: 'signed', dStatus: 'delivered', sStatus: 'pending', contentStatus: 'approved', ratio: 0.15 },
    { name: '정산완료', wsStatus: 'completed', mpStatus: 'completed', cStatus: 'signed', dStatus: 'delivered', sStatus: 'paid', contentStatus: 'approved', ratio: 0.10 },
    { name: '취소', wsStatus: 'cancelled', mpStatus: 'cancelled', cStatus: 'cancelled', dStatus: 'cancelled', sStatus: 'cancelled', contentStatus: 'cancelled', ratio: 0.10 },
]

// 랜덤 유틸
const ranBrand = () => BRANDS[Math.floor(Math.random() * BRANDS.length)]
const ranChan = () => ['instagram', 'youtube', 'tiktok', 'blog'][Math.floor(Math.random() * 4)]
const ranPrice = () => [300000, 500000, 1000000, 2500000, 5000000, 8000000][Math.floor(Math.random() * 6)]
const ranOffset = () => Math.floor(Math.random() * 40) - 20 // -20일 ~ +20일

// 70개 제안 생성 (각 크리에이터당 ~4~5개)
const SEEDS: any[] = []
let idCount = 1

for (const c of CREATORS) {
    const numCollabs = Math.floor(Math.random() * 3) + 3 // 3~5건
    for (let i = 0; i < numCollabs; i++) {
        // 스테이지 분포에 따라 배분
        const r = Math.random()
        let stage
        let sum = 0
        for (const s of STAGES) {
            sum += s.ratio
            if (r <= sum) { stage = s; break }
        }
        if (!stage) stage = STAGES[0]

        const b = ranBrand()
        const chan = ranChan()
        const price = ranPrice()
        const baseDate = new Date()
        baseDate.setDate(baseDate.getDate() + ranOffset())
        const dsStr = baseDate.toISOString()

        SEEDS.push({
            id: idCount++,
            creator_id: c.id,
            creator_name: c.name,
            brand_id: b.id,
            brand_name: b.name,
            title: `[${b.name}] ${stage.name} 테스트용 시드`,
            product: `${b.name} 주력 상품 (대용량)`,
            chan,
            price,
            ...stage,
            date: dsStr
        })
    }
}

async function main() {
    console.log(`🚀 마스터트래커 타겟 대용량 데이터 셋업 시작 (총 ${SEEDS.length}건)`)
    console.log(`   (이 스크립트는 기존 30건을 지우지 않고 **추가 결합**합니다.)`)

    let success = 0
    let fail = 0

    // 1건 단위 트랜잭션 (에러 격리)
    for (const row of SEEDS) {
        try {
            // 1. life_moments
            const { data: lm, error: lmErr } = await sb.from('life_moments').insert({
                creator_id: row.creator_id,
                team_id: TEAM_ID,
                title: `${row.creator_name}의 ${row.brand_name} 협업 라이프모먼트`,
                description: `ERP 데이터 생성기 - ${row.name} 단계`,
                category: '테스트',
                moment_start_date: row.date.split('T')[0],
                status: row.mpStatus === 'cancelled' ? 'cancelled' : 'completed'
            }).select('id').single()
            if (lmErr) throw lmErr

            // 2. moment_proposals
            const { data: mp, error: mpErr } = await sb.from('moment_proposals').insert({
                brand_id: row.brand_id,
                creator_id: row.creator_id,
                moment_id: lm.id,
                message: `${row.name} 단계 점검용 자동생성 데이터 (단가: ${row.price})`,
                status: row.mpStatus,
                creator_team_id: TEAM_ID,
                created_at: row.date,
            }).select('id').single()
            if (mpErr) throw mpErr

            // 3. workspaces
            const { data: ws, error: wsErr } = await sb.from('workspaces').insert({
                brand_id: row.brand_id,
                creator_id: row.creator_id,
                project_title: row.title,
                product_name: row.product,
                price_offer: row.price,
                status: row.wsStatus,
                channel_name: row.chan,
                channel_subtype: 'feed',
                brand_condition_confirmed: row.cStatus !== 'none',
                creator_condition_confirmed: row.cStatus === 'signed',
                contract_status: row.cStatus,
                delivery_status: row.dStatus,
                content_submission_status: row.contentStatus,
                original_proposal_id: mp.id,
                original_proposal_type: 'moment_proposal',
                created_at: row.date,
            }).select('id').single()
            if (wsErr) throw wsErr

            await sb.from('moment_proposals').update({ workspace_id: ws.id }).eq('id', mp.id)

            // 4. settlements (정산 단계 진입한 경우에만 생성)
            if (row.sStatus) {
                const cRatio = 0.70
                const crAmt = Math.round(row.price * cRatio)
                const wAmt = Math.round(crAmt * 0.033)

                await sb.from('settlements').insert({
                    team_id: TEAM_ID,
                    creator_id: row.creator_id,
                    brand_id: row.brand_id,
                    workspace_id: ws.id,
                    proposal_id: mp.id,
                    proposal_type: 'moment_proposal',
                    gross_amount: row.price,
                    split_ratio: cRatio,
                    creator_amount: crAmt,
                    mcn_amount: row.price - crAmt,
                    withholding_rate: 0.033,
                    withholding_amount: wAmt,
                    net_creator_amount: crAmt - wAmt,
                    status: row.sStatus,
                    settlement_month: row.date.slice(0, 7), // YYYY-MM
                    paid_at: row.sStatus === 'paid' ? row.date : null,
                    note: `마스터트래커 테스트 - ${row.name} 단계`,
                    created_at: row.date,
                })
            }

            success++
            process.stdout.write(success % 10 === 0 ? '🚀' : '·')
        } catch (e: any) {
            console.error(`\n❌ [${row.id}] Error: ${e.message}`)
            fail++
        }
    }

    // 수익 배분율 전체 크리에이터 강제 업데이트 (누락 방지)
    const splits = CREATORS.map(c => ({ team_id: TEAM_ID, creator_id: c.id, split_ratio: 0.70 }))
    await sb.from('mcn_revenue_splits').upsert(splits, { onConflict: 'team_id,creator_id' })

    console.log(`\n\n🎉 마스터 트래커 데이터 셋업 완료!`)
    console.log(`✅ 성공: ${success}건 / ❌ 실패: ${fail}건. 앱을 확인해주세요!`)
}

main().catch(console.error)
