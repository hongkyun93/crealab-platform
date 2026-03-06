/**
 * 전체 데모 데이터 초기화 + 5건 초고퀄리티 재생성
 *
 * 실행:  npx tsx scripts/seed-demo-collabs.ts
 * 삭제:  npx tsx scripts/seed-demo-collabs.ts --delete
 *
 * 삭제 순서: settlements → workspaces → moment_proposals → life_moments
 * 생성 체인: life_moments → moment_proposals → workspaces → settlements
 *
 * 실제 DB 컬럼 기준 (2026-03-06 get_table_columns RPC 확인):
 *  - life_moments:    NOT NULL 없음
 *  - moment_proposals: brand_id, creator_id, moment_id NOT NULL
 *  - workspaces:      brand_id, creator_id, project_title NOT NULL
 *  - settlements:     creator_id NOT NULL
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(__dirname, '..', '.env.local') })

const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// ─── 실제 ID 맵 (2026-03-06 DB 조회 확인) ─────────────────────────────────────
const TEAM_ID = '8c998fdd-1f3b-47e0-8711-79a760460089'

const C = {
    서연스킨: '1a673318-ed79-4643-9e5b-9a5df91ba993',
    채린글로우: 'cfc58f55-ed06-4aba-af2c-3b8aa5c10523',
    소미스킨랩: '2d874986-4dba-4acc-b4e5-1b52f974ba8e',
    수빈OOTD: 'e346ee84-3b6f-4b46-9462-064ee9e52520',
    예진네일즈: '575a6a17-7045-4867-bc22-08472b058030',
}

const B = {
    올리브영: '6b8cedf0-1548-42fc-ba3f-ed434ace5bb9',
    아모레유스랩: '2ce9d5bb-0421-49a9-8850-c117101b2f1c',
    선스크린랩: 'b63d56e4-1009-4330-8420-b6dc73b1622e',
    보이브: '3293e5f8-bff5-4292-b3ef-7104537c8575',
    네일스튜디오N: '52f01d28-92ab-40ee-86b0-8e85e5c9d887',
}

// ─── 5건 초고퀄리티 협업 정의 ──────────────────────────────────────────────────
const DEMO = [
    {
        // ① 올리브영 × 서연스킨 — 선케어 릴스 (완료 + 정산 완료)
        label: '올리브영 × 서연스킨',
        creator_id: C.서연스킨,
        brand_id: B.올리브영,
        life_moment: {
            title: '자외선 차단제 3종 7일 착용 착용테스트',
            description: '올리브영 PB 선크림 vs 해외직구 vs 피부과 선크림. 발림감·지속력·백탁 없음 3개 기준 실사용 7일 비교 리뷰.',
            category: '뷰티',
            moment_start_date: '2026-01-20',
        },
        moment_proposal: {
            message: '안녕하세요 올리브영 마케팅팀입니다. 신규 PB 선크림 출시에 맞춰 피부 타입별 7일 착용 비교 콘텐츠 제안드립니다. 피드 1건 + 릴스 1건, 인플루언서 재량껏 스타일링 자유롭게 진행하시면 됩니다.',
            status: 'completed',
            created_at: new Date('2026-01-12T10:30:00+09:00').toISOString(),
        },
        workspace: {
            project_title: '올리브영 PB선크림 SPF50+ 7일 비교 릴스',
            product_name: '올리브영 선크림 SPF50+ 올데이프로텍션 50ml',
            price_offer: 1_500_000,
            status: 'settlement',
            channel_name: 'instagram',
            channel_subtype: 'reels',
            brand_condition_confirmed: true,
            creator_condition_confirmed: true,
            contract_status: 'signed',
            delivery_status: 'delivered',
        },
        settlement: {
            gross_amount: 1_500_000,
            split_ratio: 0.75,
            settlement_month: '2026-02',
            status: 'paid',
            paid_at: new Date('2026-02-18T14:00:00+09:00').toISOString(),
            note: '올리브영 PB선크림 7일 착용 비교 릴스 — 1월 콘텐츠 정산',
        },
    },
    {
        // ② 아모레유스랩 × 채린글로우 — 앰플 세럼 피드+스토리 (계약 완료, 콘텐츠 제작 중)
        label: '아모레유스랩 × 채린글로우',
        creator_id: C.채린글로우,
        brand_id: B.아모레유스랩,
        life_moment: {
            title: '봄 환절기 수분 폭탄 스킨케어 루틴',
            description: '환절기 건조함 대비 집중 수분 앰플·세럼 루틴. 아침/저녁 2단계 비교 3주 테스트.',
            category: '뷰티',
            moment_start_date: '2026-02-25',
        },
        moment_proposal: {
            message: '채린글로우님 안녕하세요. 아모레퍼시픽 유스랩 신제품 유스 액티브 앰플 세럼 론칭 캠페인입니다. 봄 스킨케어 루틴 콘텐츠로 피드 2장 + 스토리 3장 구성 제안드립니다. 제품 7일 사용 후 글로우 스킨 결 비포/애프터 형식으로 부탁드립니다.',
            status: 'accepted',
            created_at: new Date('2026-02-18T15:00:00+09:00').toISOString(),
        },
        workspace: {
            project_title: '아모레유스랩 유스 액티브 앰플 세럼 봄 루틴 피드+스토리',
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
        settlement: {
            gross_amount: 2_200_000,
            split_ratio: 0.75,
            settlement_month: '2026-03',
            status: 'escrow',
            paid_at: null,
            note: '아모레유스랩 유스 액티브 앰플 세럼 피드+스토리 — 3월 정산 예정',
        },
    },
    {
        // ③ 선스크린랩 × 소미스킨랩 — 선케어 전문 유튜브 콘텐츠 (계약 서명 완료, 촬영 대기)
        label: '선스크린랩 × 소미스킨랩',
        creator_id: C.소미스킨랩,
        brand_id: B.선스크린랩,
        life_moment: {
            title: '2026 봄 선케어 성분 파헤치기 ☀️',
            description: '성분 덕후 관점에서 SPF/PA 등급별 차이, 자외선 A/B 차단 원리, 올바른 선크림 사용법까지 총망라. 선케어 입문자부터 고수까지 필수 영상.',
            category: '뷰티',
            moment_start_date: '2026-03-05',
        },
        moment_proposal: {
            message: '소미스킨랩님, 피부과 전문의와 협업한 선케어 성분 분석 유튜브 영상 제안드립니다. 저희 선스크린랩 제품 3종을 성분 관점에서 비교 분석해주시는 20분 분량 영상입니다. 영상 제작비 전액 지원 및 PPL 형태로 진행합니다.',
            status: 'accepted',
            created_at: new Date('2026-02-28T09:00:00+09:00').toISOString(),
        },
        workspace: {
            project_title: '선스크린랩 선케어 성분 분석 유튜브 콘텐츠',
            product_name: '선스크린랩 더마 선크림 SPF50+ PA++++  50g × 3종 세트',
            price_offer: 3_500_000,
            status: 'in_progress',
            channel_name: 'youtube',
            channel_subtype: 'long_form',
            brand_condition_confirmed: true,
            creator_condition_confirmed: true,
            contract_status: 'signed',
            delivery_status: 'pending',
        },
        settlement: {
            gross_amount: 3_500_000,
            split_ratio: 0.70,
            settlement_month: '2026-03',
            status: 'pending',
            paid_at: null,
            note: '선스크린랩 유튜브 선케어 성분 분석 영상 — 3월 정산 예정',
        },
    },
    {
        // ④ 보이브 × 수빈OOTD — 봄 신상 코디 릴스 시리즈 (제안 수락, 계약중)
        label: '보이브 × 수빈OOTD',
        creator_id: C.수빈OOTD,
        brand_id: B.보이브,
        life_moment: {
            title: '보이브 봄 시즌 하울 & 코디 챌린지 🌸',
            description: '2026 봄/SS 신상 아이템으로 7일간 다른 코디 시리즈. 미니멀 시티룩 / 캐주얼 데일리 / 오피스 세미포멀 3가지 무드.',
            category: '패션',
            moment_start_date: '2026-03-15',
        },
        moment_proposal: {
            message: '수빈OOTD님 안녕하세요! 보이브 2026 SS 컬렉션 런칭 캠페인 파트너 제안드립니다. 7일 코디 챌린지 릴스 시리즈(1일 1코디 × 7편) 협업으로, 각 영상마다 QR코드 링크 삽입 및 할인코드 제공 방식입니다. 피팅용 의류 전 시즌 세트 제공해드립니다.',
            status: 'offered',
            created_at: new Date('2026-03-01T11:00:00+09:00').toISOString(),
        },
        workspace: {
            project_title: '보이브 2026 SS 7일 코디 챌린지 릴스 시리즈',
            product_name: '보이브 2026 SS 컬렉션 스타터 세트 (상의 3종 + 하의 2종)',
            price_offer: 4_000_000,
            status: 'active',
            channel_name: 'instagram',
            channel_subtype: 'reels',
            brand_condition_confirmed: true,
            creator_condition_confirmed: false,
            contract_status: 'pending',
            delivery_status: 'pending',
        },
        settlement: {
            gross_amount: 4_000_000,
            split_ratio: 0.75,
            settlement_month: '2026-04',
            status: 'pending',
            paid_at: null,
            note: '보이브 SS 7일 코디 챌린지 릴스 시리즈 — 4월 정산 예정 (협의 중)',
        },
    },
    {
        // ⑤ 네일스튜디오N × 예진네일즈 — 젤네일 튜토리얼 시리즈 (제안 단계)
        label: '네일스튜디오N × 예진네일즈',
        creator_id: C.예진네일즈,
        brand_id: B.네일스튜디오N,
        life_moment: {
            title: '봄 젤네일 컬러 트렌드 TOP 5 셀프 튜토리얼',
            description: '2026 봄 팬톤 컬러 기반 젤네일 디자인 5종. 초보도 따라할 수 있는 단계별 영상. 네일 도구 추천 포함.',
            category: '뷰티',
            moment_start_date: '2026-03-20',
        },
        moment_proposal: {
            message: '안녕하세요 예진네일즈님, 네일스튜디오 N입니다. 저희 2026 봄 신상 젤네일 키트 출시에 맞춰 셀프 네일 튜토리얼 숏폼 시리즈 협업 제안드립니다. 5가지 봄 컬러 각 영상 5분 내외 틱톡/릴스 동시 업로드 방식이며 키트 전 컬러 무상 제공 + 협찬비 별도입니다.',
            status: 'offered',
            created_at: new Date('2026-03-04T14:00:00+09:00').toISOString(),
        },
        workspace: {
            project_title: '네일스튜디오 N 봄 젤네일 키트 셀프 튜토리얼 숏폼 시리즈',
            product_name: '네일스튜디오 N 봄 컬렉션 젤네일 키트 5종 세트',
            price_offer: 1_800_000,
            status: 'active',
            channel_name: 'tiktok',
            channel_subtype: 'short_form',
            brand_condition_confirmed: false,
            creator_condition_confirmed: false,
            contract_status: 'none',
            delivery_status: 'pending',
        },
        settlement: {
            gross_amount: 1_800_000,
            split_ratio: 0.70,
            settlement_month: '2026-04',
            status: 'pending',
            paid_at: null,
            note: '네일스튜디오 N 봄 젤네일 튜토리얼 시리즈 — 협의 진행 중',
        },
    },
]

function calc(gross: number, ratio: number) {
    const c = Math.round(gross * ratio)
    const m = gross - c
    const w = Math.round(c * 0.033)
    return { creatorAmount: c, mcnAmount: m, withholdingAmount: w, netCreatorAmount: c - w }
}

async function deleteAll() {
    console.log('🗑️  전체 삭제 시작...\n')

    // 1. 모든 settlements 삭제 (creator FK가 NOT NULL이라서 workspaces 먼저 가면 안 됨)
    const { error: sErr, count: sCount } = await sb.from('settlements').delete({ count: 'exact' }).neq('id', '00000000-0000-0000-0000-000000000000')
    console.log(`  settlements: ${sErr ? '❌ ' + sErr.message : '✅ 삭제 완료'}`)

    // 2. 모든 workspaces 삭제
    const { data: allWs } = await sb.from('workspaces').select('id, original_proposal_id, original_proposal_type').order('created_at')
    const wsIds = (allWs || []).map((w: any) => w.id)

    if (wsIds.length) {
        // moment_proposals.workspace_id = null로 초기화 (FK 정합성)
        await sb.from('moment_proposals').update({ workspace_id: null }).in('workspace_id', wsIds)

        const { error: wErr } = await sb.from('workspaces').delete().in('id', wsIds)
        console.log(`  workspaces (${wsIds.length}건): ${wErr ? '❌ ' + wErr.message : '✅ 삭제 완료'}`)
    }

    // 3. 우리 팀의 moment_proposals 삭제 (team_id 기준)
    const { data: mps } = await sb.from('moment_proposals').select('id, moment_id').eq('creator_team_id', TEAM_ID)
    if (!mps?.length) {
        // creator_team_id가 없으면 team_members 기준
        const { data: memberIds } = await sb.from('team_members').select('user_id').eq('team_id', TEAM_ID)
        const ids = (memberIds || []).map((m: any) => m.user_id)
        const { data: mpsAll } = await sb.from('moment_proposals').select('id, moment_id').in('creator_id', ids)
        const mpIds = (mpsAll || []).map((m: any) => m.id)
        const momentIds = (mpsAll || []).map((m: any) => m.moment_id).filter(Boolean)

        if (mpIds.length) {
            await sb.from('moment_proposals').delete().in('id', mpIds)
            console.log(`  moment_proposals (${mpIds.length}건): ✅ 삭제 완료`)
        }
        if (momentIds.length) {
            await sb.from('life_moments').delete().in('id', momentIds)
            console.log(`  life_moments (${momentIds.length}건): ✅ 삭제 완료`)
        }
    } else {
        const mpIds = mps.map((m: any) => m.id)
        const momentIds = mps.map((m: any) => m.moment_id).filter(Boolean)
        await sb.from('moment_proposals').delete().in('id', mpIds)
        console.log(`  moment_proposals (${mpIds.length}건): ✅ 삭제 완료`)
        if (momentIds.length) {
            await sb.from('life_moments').delete().in('id', momentIds)
            console.log(`  life_moments (${momentIds.length}건): ✅ 삭제 완료`)
        }
    }

    console.log('\n✅ 전체 삭제 완료\n')
}

async function main() {
    const isDelete = process.argv.includes('--delete')

    if (isDelete) {
        await deleteAll()
        return
    }

    // 삭제부터
    await deleteAll()

    // ─── 5건 생성 ─────────────────────────────────────────────────────────────
    console.log('🚀 5건 초고퀄리티 데모 협업 생성 시작...\n')

    for (const [i, collab] of DEMO.entries()) {
        console.log(`[${i + 1}/5] 📦 ${collab.label}`)

        // 1. life_moments
        const { data: lm, error: lmErr } = await sb
            .from('life_moments')
            .insert({
                creator_id: collab.creator_id,
                team_id: TEAM_ID,
                title: collab.life_moment.title,
                description: collab.life_moment.description,
                category: collab.life_moment.category,
                moment_start_date: collab.life_moment.moment_start_date,
                status: 'completed',
            })
            .select('id').single()

        if (lmErr) { console.error(`  ❌ life_moments: ${lmErr.message}`); continue }

        // 2. moment_proposals
        const { data: mp, error: mpErr } = await sb
            .from('moment_proposals')
            .insert({
                brand_id: collab.brand_id,
                creator_id: collab.creator_id,
                moment_id: lm.id,
                message: collab.moment_proposal.message,
                status: collab.moment_proposal.status,
                creator_team_id: TEAM_ID,
                created_at: collab.moment_proposal.created_at,
            })
            .select('id').single()

        if (mpErr) { console.error(`  ❌ moment_proposals: ${mpErr.message}`); continue }

        // 3. workspaces
        const { data: ws, error: wsErr } = await sb
            .from('workspaces')
            .insert({
                brand_id: collab.brand_id,
                creator_id: collab.creator_id,
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
            .select('id').single()

        if (wsErr) { console.error(`  ❌ workspaces: ${wsErr.message}`); continue }

        // workspace_id 역참조 업데이트
        await sb.from('moment_proposals').update({ workspace_id: ws.id }).eq('id', mp.id)

        // 4. settlement
        const { gross_amount, split_ratio, settlement_month, status, paid_at, note } = collab.settlement
        const { creatorAmount, mcnAmount, withholdingAmount, netCreatorAmount } = calc(gross_amount, split_ratio)

        const { error: sErr } = await sb.from('settlements').insert({
            team_id: TEAM_ID,
            creator_id: collab.creator_id,
            brand_id: collab.brand_id,
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
            status,
            settlement_month,
            paid_at,
            note,
        })

        if (sErr) {
            console.error(`  ❌ settlements: ${sErr.message}`)
        } else {
            const statusEmoji = { paid: '✅', escrow: '🔒', pending: '⏳' }[status] || '⏳'
            console.log(`  ✅ 생성 완료 | ${statusEmoji} ${status} | ₩${gross_amount.toLocaleString()} Gross → 크리에이터 ₩${creatorAmount.toLocaleString()} / MCN ₩${mcnAmount.toLocaleString()}`)
        }
    }

    // 5. mcn_revenue_splits UPSERT
    const splits = Object.values(C).map(id => ({ team_id: TEAM_ID, creator_id: id, split_ratio: 0.75 }))
    await sb.from('mcn_revenue_splits').upsert(splits, { onConflict: 'team_id,creator_id' })

    console.log(`
═══════════════════════════════════════════════════════
🎉 완료! 5건 초고퀄리티 데모 협업 생성

① 올리브영 × 서연스킨      ₩1,500,000  → paid ✅ (2월)
② 아모레유스랩 × 채린글로우  ₩2,200,000  → escrow 🔒 (3월)
③ 선스크린랩 × 소미스킨랩   ₩3,500,000  → pending ⏳ (3월)
④ 보이브 × 수빈OOTD        ₩4,000,000  → pending ⏳ (4월)
⑤ 네일스튜디오N × 예진네일즈 ₩1,800,000  → pending ⏳ (4월)

마스터트래커: moment_proposals 5건 ✅
캘린더:       life_moments 날짜 이벤트 5건 ✅
크리에이터관리: 5명 proposal 카운트 반영 ✅
정산탭:       settlements 5건 (2·3·4월 분산) ✅
═══════════════════════════════════════════════════════
`)
}

main().catch(e => { console.error(e); process.exit(1) })
