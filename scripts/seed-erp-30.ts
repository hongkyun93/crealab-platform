/**
 * ERP 시나리오 테스트용 30건 초고퀄리티 데모 생성
 * 
 * 2월, 3월, 4월에 걸친 다양한 상태(paid, escrow, pending, cancelled, rejected), 
 * 다양한 플랫폼(youtube, instagram, tiktok, blog),
 * 다양한 단가(10만~1000만) 및 배분율(5:5 ~ 9:1) 케이스 포함.
 *
 * 실행: npx tsx scripts/seed-erp-30.ts
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(__dirname, '..', '.env.local') })

const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

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

// 상태 맵핑 유틸
function mapWorkspaceStatus(settlementStatus: string): string {
    if (settlementStatus === 'paid') return 'settlement'
    if (settlementStatus === 'escrow') return 'in_progress'
    if (settlementStatus === 'cancelled') return 'cancelled'
    if (settlementStatus === 'rejected') return 'none' // rejected from brand side
    return 'active' // pending
}

function mapMomentStatus(settlementStatus: string): string {
    if (settlementStatus === 'paid') return 'completed'
    if (settlementStatus === 'escrow') return 'accepted'
    if (settlementStatus === 'cancelled') return 'cancelled'
    if (settlementStatus === 'rejected') return 'rejected'
    return 'offered'
}

function mapContractStatus(settlementStatus: string): string {
    if (settlementStatus === 'paid') return 'signed'
    if (settlementStatus === 'escrow') return 'signed'
    if (settlementStatus === 'cancelled') return 'cancelled'
    if (settlementStatus === 'rejected') return 'none'
    return 'pending'
}

function mapDeliveryStatus(settlementStatus: string): string {
    if (settlementStatus === 'paid') return 'delivered'
    if (settlementStatus === 'escrow') return 'pending' // or delivered but not paid
    return 'pending'
}

type Scenario = {
    id: number;
    creator_id: string;
    brand_id: string;
    title: string;
    product: string;
    desc: string;
    msg: string;
    cat: string;
    chan: string;
    sub: string;
    price: number;
    ratio: number;
    month: string;
    s_status: string; // paid, escrow, pending, cancelled, rejected
    date: string;
}

const BASE_DATA: Scenario[] = [
    // ─── 2월 (대부분 완료/정산됨) ───
    { id: 1, creator_id: C.서연스킨, brand_id: B.올리브영, title: '봄맞이 선케어 빅세일 릴스', product: '올리브영 단독 기획 선크림 50ml+50ml', desc: '올리브영 2월 세일 맞이 가성비 선크림 리뷰', msg: '올영세일 선케어 부문 1위 기념 릴스 제안', cat: '뷰티', chan: 'instagram', sub: 'reels', price: 1500000, ratio: 0.75, month: '2026-02', s_status: 'paid', date: '2026-02-05' },
    { id: 2, creator_id: C.채린글로우, brand_id: B.아모레유스랩, title: '유스 액티브 앰플 2주 사용기', product: '유스 액티브 앰플 30ml', desc: '건조한 사무실 환경에서 살아남는 앰플 루틴', msg: '신제품 앰플 결광 비포애프터 챌린지', cat: '뷰티', chan: 'youtube', sub: 'long_form', price: 6000000, ratio: 0.80, month: '2026-02', s_status: 'paid', date: '2026-02-07' },
    { id: 3, creator_id: C.소미스킨랩, brand_id: B.선스크린랩, title: '성분분석: 이 선크림은 왜 안 따가울까?', product: '더마 무기자차 선크림 50g', desc: '무기자차 특유의 뻣뻣함을 잡은 성분 비밀 분석', msg: '전문가 리뷰 채널 맞춤 프리미엄 제품 라인 제안', cat: '뷰티', chan: 'youtube', sub: 'shorts', price: 2500000, ratio: 0.70, month: '2026-02', s_status: 'paid', date: '2026-02-09' },
    { id: 4, creator_id: C.수빈OOTD, brand_id: B.보이브, title: '졸업식/입학식 10만원대 하객룩 코디', product: '보이브 SS 셋업 슈트', desc: '가성비+핏 모두 잡은 셋업 코디 3종', msg: '졸업시즌 타겟팅 릴스 및 피드 발행 요망', cat: '패션', chan: 'instagram', sub: 'feed', price: 800000, ratio: 0.60, month: '2026-02', s_status: 'paid', date: '2026-02-12' },
    { id: 5, creator_id: C.예진네일즈, brand_id: B.네일스튜디오N, title: '발렌타인데이 초코시럽 네일 튜토리얼', product: '발렌타인 한정판 시럽젤 3컬러 세트', desc: '달콤한 무드의 마블 네일 아트 기법 튜토리얼', msg: '시즌 한정판 제품 홍보를 위한 틱톡 튜토리얼', cat: '뷰티', chan: 'tiktok', sub: 'short_form', price: 1200000, ratio: 0.65, month: '2026-02', s_status: 'paid', date: '2026-02-14' },
    { id: 6, creator_id: C.서연스킨, brand_id: B.아모레유스랩, title: '아모레 성수 팝업스토어 방문기 (취소 건)', product: '팝업 현장 방문 및 스케치 (초청)', desc: '오프라인 팝업스토어 브이로그', msg: '현장 방문이 개인 사정으로 인해 취소됨', cat: '일상', chan: 'youtube', sub: 'vlog', price: 3000000, ratio: 0.75, month: '2026-02', s_status: 'cancelled', date: '2026-02-18' },
    { id: 7, creator_id: C.채린글로우, brand_id: B.올리브영, title: '올영세일 장바구니 하울 (미지급 이슈 테스트)', product: '복합 스킨케어 패키지 (5종)', desc: '세일 기간 추천템 베스트 5', msg: '브랜드 예산 지연으로 아직 paid 안됨 (escrow/pending)', cat: '뷰티', chan: 'youtube', sub: 'long_form', price: 5000000, ratio: 0.85, month: '2026-02', s_status: 'escrow', date: '2026-02-22' },
    { id: 8, creator_id: C.수빈OOTD, brand_id: B.네일스튜디오N, title: '네일 브랜드 거절 시나리오 (초저단가)', product: '테스트용 기본 네일 1종', desc: '네일과 패션을 엮어달라는 무리한 제안', msg: '단가 10만원에 피드 5개 요구하여 거절함', cat: '패션', chan: 'instagram', sub: 'feed', price: 100000, ratio: 0.50, month: '2026-02', s_status: 'rejected', date: '2026-02-25' },
    { id: 9, creator_id: C.소미스킨랩, brand_id: B.보이브, title: '패션 브랜드 스킨케어 라인업 리뷰', product: '보이브 뷰티라인 첫 런칭 토너', desc: '옷 잘만드는 곳이 화장품도가능? 블라인드 테스트', msg: '신규 뷰티라인 블로그 꼼꼼 리뷰 제안', cat: '뷰티', chan: 'blog', sub: 'post', price: 600000, ratio: 0.70, month: '2026-02', s_status: 'paid', date: '2026-02-26' },
    { id: 10, creator_id: C.예진네일즈, brand_id: B.선스크린랩, title: '손등 타지않게! 네일아트 후 선케어', product: '바디 전용 대용량 선스프레이 200ml', desc: '젤램프 사용 시 손등 보호용 선스프레이 꿀팁', msg: '네일아트 시 자외선 관련 틈새시장 공략 숏폼', cat: '뷰티', chan: 'shorts', sub: 'youtube', price: 900000, ratio: 0.65, month: '2026-02', s_status: 'paid', date: '2026-02-28' },

    // ─── 3월 (현재 진행중, Escrow, Pending 위주 혼합) ───
    { id: 11, creator_id: C.서연스킨, brand_id: B.선스크린랩, title: '신학기 대비 학생용 순한 선크림', product: '마일드 베이비&스튜던트 선로션', desc: '눈시림 제로, 백탁 제로 10대 추천 선크림', msg: '신학기 타겟팅 블로그 상세 포스팅 및 인스타 피드', cat: '뷰티', chan: 'instagram', sub: 'feed', price: 1200000, ratio: 0.75, month: '2026-03', s_status: 'paid', date: '2026-03-02' },
    { id: 12, creator_id: C.채린글로우, brand_id: B.보이브, title: '봄 신상 트렌치코트 + 메이크업 룩북', product: '보이브 26SS 클래식 트렌치 맥코트', desc: '옷에 맞는 메이크업까지 제안하는 풀 룩북', msg: '메이크업 크리에이터와의 패션 콜라보 (고단가 제안)', cat: '패션', chan: 'youtube', sub: 'long_form', price: 8000000, ratio: 0.85, month: '2026-03', s_status: 'escrow', date: '2026-03-05' },
    { id: 13, creator_id: C.소미스킨랩, brand_id: B.아모레유스랩, title: '레티놀 vs 바쿠치올 부작용 없이 쓰는법', product: '유스 바쿠치올 나이트 크림', desc: '성분 전문 리뷰어의 솔직한 2주 비교 실험', msg: '자사 기존 레티놀 제품군과 비교 리뷰 부탁드립니다.', cat: '뷰티', chan: 'youtube', sub: 'long_form', price: 4500000, ratio: 0.70, month: '2026-03', s_status: 'escrow', date: '2026-03-08' },
    { id: 14, creator_id: C.수빈OOTD, brand_id: B.올리브영, title: '올리브영에서 살 수 있는 향수 코디', product: '니치 향수 디스커버리 세트', desc: '향수에 어울리는 OOTD 3가지 룩 제안', msg: '니치 향수 카테고리 확장을 위한 감성 릴스', cat: '패션', chan: 'instagram', sub: 'reels', price: 1800000, ratio: 0.65, month: '2026-03', s_status: 'pending', date: '2026-03-10' },
    { id: 15, creator_id: C.예진네일즈, brand_id: B.네일스튜디오N, title: '봄맞이 벚꽃 젤네일 키트 언박싱', product: '체리블라썸 26SS 시즈널 키트', desc: '벚꽃색 치크 네일 디자인 튜토리얼', msg: '신상품 언박싱 및 실사용 튜토리얼 (틱톡 집중)', cat: '뷰티', chan: 'tiktok', sub: 'short_form', price: 1500000, ratio: 0.70, month: '2026-03', s_status: 'escrow', date: '2026-03-12' },
    { id: 16, creator_id: C.서연스킨, brand_id: B.보이브, title: '운동갈 때 바르는 톤업 선크림 (협의 결렬)', product: '스포티 애슬레저 룩 + 톤업 선크림', desc: '운동복과 톤업 선크림 조합', msg: '타사 선크림 브랜드 전속계약 이슈로 제안 거절', cat: '뷰티', chan: 'instagram', sub: 'reels', price: 1500000, ratio: 0.75, month: '2026-03', s_status: 'rejected', date: '2026-03-15' },
    { id: 17, creator_id: C.채린글로우, brand_id: B.네일스튜디오N, title: '연예인 시상식 네일샵 원장님 인터뷰', product: '프리미엄 파츠 컬렉션 박스', desc: '글로우 메이크업과 어울리는 럭셔리 네일 (고단가)', msg: '메이크업 채널 특별 출연 및 프리미엄 라인업 노출', cat: '뷰티', chan: 'youtube', sub: 'long_form', price: 7000000, ratio: 0.80, month: '2026-03', s_status: 'pending', date: '2026-03-18' },
    { id: 18, creator_id: C.소미스킨랩, brand_id: B.올리브영, title: '올영 직원도 모르는 성분 천재 수분크림', product: '더마 수분 코팅 크림 대용량', desc: '아무도 모르는 숨꿀템 성분 파헤치기', msg: '숨겨진 유망 브랜드 발굴 컨셉의 블로그/유튜브 동시진행', cat: '뷰티', chan: 'multi', sub: 'youtube+blog', price: 3500000, ratio: 0.75, month: '2026-03', s_status: 'escrow', date: '2026-03-20' },
    { id: 19, creator_id: C.수빈OOTD, brand_id: B.보이브, title: '개강여신 캠퍼스룩 돌려입기 룩북', product: '26SS 캠퍼스 기획전 풀세트 (10피스)', desc: '10개 아이템으로 한달 버티기 룩북', msg: '대학생 타겟 릴스 3건 시리즈물 제안. 파격 단가 보장.', cat: '패션', chan: 'instagram', sub: 'reels', price: 10000000, ratio: 0.90, month: '2026-03', s_status: 'pending', date: '2026-03-22' },
    { id: 20, creator_id: C.예진네일즈, brand_id: B.아모레유스랩, title: '핸드크림 명가 아모레? 네일아티스트 인증', product: '유스 링클케어 고보습 핸드크림', desc: '손 안티에이징 루틴 및 네일 케어 병행법', msg: '네일아티스트가 추천하는 안티에이징 핸드 케어', cat: '뷰티', chan: 'instagram', sub: 'feed', price: 1100000, ratio: 0.70, month: '2026-03', s_status: 'escrow', date: '2026-03-25' },

    // ─── 4월 (예정, 진행 전, 제안 중이거나 Pending) ───
    { id: 21, creator_id: C.서연스킨, brand_id: B.아모레유스랩, title: '가정의 달 대비 기초화장품 선물세트 리뷰', product: '유스 액티브 안티에이징 3종 세트', desc: '어버이날 어머니 선물용 화장품 비교 리뷰', msg: '4월 말 사전 홍보용 영상. 고급스러운 패키징 연출', cat: '뷰티', chan: 'youtube', sub: 'long_form', price: 4000000, ratio: 0.80, month: '2026-04', s_status: 'pending', date: '2026-04-02' },
    { id: 22, creator_id: C.채린글로우, brand_id: B.올리브영, title: '워터페스티벌 대비 워터프루프 메이크업', product: '올리브영 워터프루프 색조 기획전', desc: '물놀이에도 지워지지 않는 픽싱 메이크업', msg: '여름 페스티벌 시즌 대비 선제적 릴스 노출 제안', cat: '뷰티', chan: 'instagram', sub: 'reels', price: 2800000, ratio: 0.75, month: '2026-04', s_status: 'pending', date: '2026-04-05' },
    { id: 23, creator_id: C.소미스킨랩, brand_id: B.선스크린랩, title: '아웃도어 골프용 선패치 전격 해부', product: 'UV 실드 골프 스포츠 패치 10매', desc: '선패치의 자외선 차단 능력 현미경 분석 및 야외 테스트', msg: '골프/야외활동 증가에 맞춘 신개념 제품 꼼꼼 리뷰', cat: '뷰티', chan: 'youtube', sub: 'long_form', price: 3000000, ratio: 0.70, month: '2026-04', s_status: 'pending', date: '2026-04-08' },
    { id: 24, creator_id: C.수빈OOTD, brand_id: B.보이브, title: '벚꽃놀이 데이트룩 승률 100% 원피스', product: '보이브 SS 플라워 쉬폰 원피스', desc: '벚꽃 배경 인생샷 건지는 코디 릴스', msg: '봄나들이 포토존 배경 화보급 영상 및 피드', cat: '패션', chan: 'instagram', sub: 'reels', price: 2000000, ratio: 0.70, month: '2026-04', s_status: 'pending', date: '2026-04-12' },
    { id: 25, creator_id: C.예진네일즈, brand_id: B.네일스튜디오N, title: '가정의 달 어머님 손 호강 네일아트', product: '시니어 케어 네일 영양제 + 은은한 컬러 젤', desc: '어머니 손에 어울리는 우아한 네일 튜토리얼 (가족 컨셉)', msg: '어버이날 타겟팅 감동 컨셉 브이로그+튜토리얼 혼합', cat: '일상', chan: 'youtube', sub: 'vlog', price: 2500000, ratio: 0.75, month: '2026-04', s_status: 'escrow', date: '2026-04-15' },
    { id: 26, creator_id: C.서연스킨, brand_id: B.보이브, title: '신입사원 오피스룩+메이크업 통합 룩북 (취소)', product: '오피스 셋업 및 뷰티 디바이스', desc: '보이브 의류와 뷰티 브랜드 통합 캠페인', msg: '타 브랜드와 일정 조율 실패로 취소 처리함 (위약금 없음)', cat: '패션', chan: 'youtube', sub: 'long_form', price: 5000000, ratio: 0.80, month: '2026-04', s_status: 'cancelled', date: '2026-04-18' },
    { id: 27, creator_id: C.채린글로우, brand_id: B.아모레유스랩, title: '어버이날 안티에이징 크림 공구 오픈', product: '유스 액티브 안티에이징 크림 (공구용)', desc: '공동구매 사전 공지 및 특가 안내 라이브 방송', msg: 'MCN 한정 특별 할인가 공동구매 1차 오픈 제안 (계약대기)', cat: '라이브커머스', chan: 'instagram', sub: 'live', price: 15000000, ratio: 0.85, month: '2026-04', s_status: 'pending', date: '2026-04-20' },
    { id: 28, creator_id: C.소미스킨랩, brand_id: B.올리브영, title: '해외직구 화장품의 진실 (블라인드 테스트)', product: '올리브영 입점 글로벌 더마 브랜드 3종', desc: '국내 제품 vs 해외 직구 성분 논란 팩트체크', msg: '올가닉 및 유럽 더마코스메틱 특집 기획 (매우 민감한 주제 협의중)', cat: '뷰티', chan: 'youtube', sub: 'long_form', price: 4500000, ratio: 0.70, month: '2026-04', s_status: 'pending', date: '2026-04-22' },
    { id: 29, creator_id: C.수빈OOTD, brand_id: B.선스크린랩, title: '여름 바캉스룩에 선스프레이 뿌리기', product: '아쿠아 쿨링 바디 선스프레이', desc: '휴양지 룩북 찍으면서 자연스럽게 제품 노출 PPL', msg: '얼리 썸머 타겟 비치웨어 룩북 내 중간광고 PPL 제안', cat: '패션', chan: 'youtube', sub: 'video_ppl', price: 1500000, ratio: 0.65, month: '2026-04', s_status: 'pending', date: '2026-04-25' },
    { id: 30, creator_id: C.예진네일즈, brand_id: B.올리브영, title: '올영 세일템으로 집에서 프리미엄 네일케어', product: '올리브영 자체 네일케어(큐티클, 영양제) 패키지', desc: '손상된 손톱 복구하는 갓성비템 루틴', msg: '네일아트 휴식기 필수템 리뷰 릴스. 4월말 노출 희망', cat: '뷰티', chan: 'instagram', sub: 'reels', price: 2200000, ratio: 0.75, month: '2026-04', s_status: 'pending', date: '2026-04-28' },
]

function calc(gross: number, ratio: number) {
    const c = Math.round(gross * ratio)
    const m = gross - c
    const w = Math.round(c * 0.033)
    return { creatorAmount: c, mcnAmount: m, withholdingAmount: w, netCreatorAmount: c - w }
}

async function main() {
    console.log(`🚀 ERP 시나리오용 30건 고퀄리티 생성 시작...`)

    for (const [i, row] of BASE_DATA.entries()) {
        const mStatus = mapMomentStatus(row.s_status)
        const wStatus = mapWorkspaceStatus(row.s_status)
        const cStatus = mapContractStatus(row.s_status)
        const dStatus = mapDeliveryStatus(row.s_status)

        const startTimestamp = new Date(`${row.date}T10:00:00+09:00`).toISOString()
        const paidAtTimestamp = row.s_status === 'paid' ? new Date(`${row.date}T14:00:00+09:00`).toISOString() : null

        // 1. life_moments
        const { data: lm, error: lmErr } = await sb.from('life_moments').insert({
            creator_id: row.creator_id,
            team_id: TEAM_ID,
            title: row.title,
            description: row.desc,
            category: row.cat,
            moment_start_date: row.date,
            status: mStatus === 'rejected' || mStatus === 'cancelled' ? 'cancelled' : 'completed'
        }).select('id').single()

        if (lmErr) { console.error(`[${i + 1}] ❌ life_moments Error:`, lmErr.message); continue }

        // 2. moment_proposals
        const { data: mp, error: mpErr } = await sb.from('moment_proposals').insert({
            brand_id: row.brand_id,
            creator_id: row.creator_id,
            moment_id: lm.id,
            message: row.msg,
            status: mStatus,
            creator_team_id: TEAM_ID,
            created_at: startTimestamp,
        }).select('id').single()

        if (mpErr) { console.error(`[${i + 1}] ❌ moment_proposals Error:`, mpErr.message); continue }

        // 거절된 경우 워크스페이스 생성 안 함 (실제 흐름)
        if (row.s_status === 'rejected') {
            console.log(`[${i + 1}/30] 🛑 [거절됨] ${row.title}`)
            continue
        }

        // 3. workspaces
        const { data: ws, error: wsErr } = await sb.from('workspaces').insert({
            brand_id: row.brand_id,
            creator_id: row.creator_id,
            project_title: `${row.title} 협업`,
            product_name: row.product,
            price_offer: row.price,
            status: wStatus,
            channel_name: row.chan,
            channel_subtype: row.sub,
            brand_condition_confirmed: cStatus === 'signed' || cStatus === 'pending',
            creator_condition_confirmed: cStatus === 'signed',
            contract_status: cStatus,
            delivery_status: dStatus,
            original_proposal_id: mp.id,
            original_proposal_type: 'moment_proposal',
            created_at: startTimestamp,
        }).select('id').single()

        if (wsErr) { console.error(`[${i + 1}] ❌ workspaces Error:`, wsErr.message); continue }

        await sb.from('moment_proposals').update({ workspace_id: ws.id }).eq('id', mp.id)

        // 4. settlements
        // 취소된 건은 정산에 안 넣거나 금액이 0이거나 cancelled 처리
        // ERP 테스트를 위해 취소된 건, pending 모두 넣음
        const { creatorAmount, mcnAmount, withholdingAmount, netCreatorAmount } = calc(row.price, row.ratio)
        const { error: sErr } = await sb.from('settlements').insert({
            team_id: TEAM_ID,
            creator_id: row.creator_id,
            brand_id: row.brand_id,
            workspace_id: ws.id,
            proposal_id: mp.id,
            proposal_type: 'moment_proposal',
            gross_amount: row.price,
            split_ratio: row.ratio,
            creator_amount: creatorAmount,
            mcn_amount: mcnAmount,
            withholding_rate: 0.033,
            withholding_amount: withholdingAmount,
            net_creator_amount: netCreatorAmount,
            status: row.s_status,
            settlement_month: row.month,
            paid_at: paidAtTimestamp,
            note: `[${row.month}] ${row.product} 정산 (${row.s_status})`,
            created_at: startTimestamp,
        })

        if (sErr) console.error(`[${i + 1}] ❌ settlements Error:`, sErr.message)
        else {
            let mo = { paid: '✅', escrow: '🔒', pending: '⏳', cancelled: '🚫' }[row.s_status] || '❓'
            console.log(`[${String(i + 1).padStart(2, '0')}/30] ${mo} [${row.month} / ${row.s_status}] ₩${row.price.toLocaleString()} — ${row.title}`)
        }
    }

    console.log(`\n🎉 30건 프리미엄 데이터 생성 완벽 종료. MCN Dashboard 전 영역 테스트 권장.`)
}

main().catch(console.error)
