/**
 * MCN ERP 시나리오용 80건 초고퀄리티 전체 크리에이터 데모 생성 (V5 확장판)
 *
 * 기존 40건 + 신규 40건(완전한 엣지 케이스 및 회계/법무/정산/운영 특수 상황 풀커버)
 * 26명 전원 3~4건씩 고르게 배분.
 *
 * 실행: npx tsx scripts/seed-erp-master-80.ts
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(__dirname, '..', '.env.local') })

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
const TEAM_ID = '8c998fdd-1f3b-47e0-8711-79a760460089'

const C_IDS = [
    '5a2a3a9f-1f75-4e33-94bc-9c88073b01f1', '71fdf528-669b-4a7a-8b15-6379112c63e3', '326dee5c-c08c-4b1a-8ea3-4c68d40e40b6',
    '9523a68b-68e4-4180-a1a3-b08b88ab8b1a', '575a6a17-7045-4867-bc22-08472b058030', '5afe835a-f87b-49f6-8a1a-3911c23d9223',
    'f128cb0f-6841-415a-9308-506f0800a966', 'cfc58f55-ed06-4aba-af2c-3b8aa5c10523', '6cb54fda-9edf-4e1a-8820-7a5e23653d20',
    '8bb9de29-7324-4f13-a7e8-b21ce379b45e', 'e346ee84-3b6f-4b46-9462-064ee9e52520', '67ccae44-300c-4473-a47b-380561684d34',
    '6346296a-e263-4e21-a787-dc397310ad97', '474afbc3-e375-4ff1-9b0e-890aedec826c', 'aa9f96e8-42e1-4da2-90b6-ccc7f4aa060b',
    'f139cac3-2f55-4b15-ba02-ea2acc43d68b', '7190bff8-f695-4cbd-a921-d7a043e6527b', 'a1342e86-e5f8-4a70-b511-abda45914b0a',
    '1a673318-ed79-4643-9e5b-9a5df91ba993', 'c60ba058-1a89-427f-b4fe-c3a7fd9238db', 'a7a17d57-6b43-4f7d-a620-ca77d9a27192',
    '71ec2210-f15a-4bf7-93b7-3e2ab5d4100c', '2d874986-4dba-4acc-b4e5-1b52f974ba8e', '4776cd14-56cd-442f-8dcb-8e2e20041961',
    '63dec43c-53fb-4eb9-9eca-9faadc9be35f', 'ce4aac6f-d170-4183-bf04-97dabd4363eb'
]
const B_IDS = [
    '6b8cedf0-1548-42fc-ba3f-ed434ace5bb9', '2ce9d5bb-0421-49a9-8850-c117101b2f1c', 'b63d56e4-1009-4330-8420-b6dc73b1622e',
    '3293e5f8-bff5-4292-b3ef-7104537c8575', '52f01d28-92ab-40ee-86b0-8e85e5c9d887',
]

function getC(idx: number) { return C_IDS[idx % C_IDS.length] }
function getB(idx: number) { return B_IDS[idx % B_IDS.length] }

type Row = { idx: number; creator_id: string; brand_id: string; cat: string; chan: string; sub: string; title: string; product: string; desc: string; msg: string; price: number; ratio: number; month: string; s_status: string; date: string; }

const RAW_DATA: Row[] = [
    // === 기존 40건 (복구생략, 압축) ===
    { idx: 1, creator_id: getC(0), brand_id: getB(0), cat: '뷰티', chan: 'instagram', sub: 'reels', title: '초단기 릴스 테스트 (3일컷)', product: '신년 기획 기초 2종', desc: '설날 맞이 추천', msg: '완료건', price: 200000, ratio: 0.6, month: '2026-01', s_status: 'paid', date: '2026-01-05' },
    { idx: 2, creator_id: getC(1), brand_id: getB(1), cat: '뷰티', chan: 'youtube', sub: 'long_form', title: '연간 앰배서더 1차 잔금', product: '유스 앰플 풀라인 런칭 (앰배서더)', desc: '1분기 런칭 영상', msg: '앰배서더 1차 잔금 지급 요청건', price: 18000000, ratio: 0.85, month: '2026-01', s_status: 'paid', date: '2026-01-10' },
    { idx: 3, creator_id: getC(2), brand_id: getB(2), cat: '뷰티', chan: 'instagram', sub: 'feed', title: '단가 네고 완료건', product: '데일리 무기자차 선크림', desc: '초기 500 제안받고 450으로 협의완료', msg: '단가 협의 후 최종 진행된 건', price: 4500000, ratio: 0.75, month: '2026-01', s_status: 'paid', date: '2026-01-15' },
    { idx: 4, creator_id: getC(3), brand_id: getB(3), cat: '패션', chan: 'youtube', sub: 'shorts', title: '조회수 인센티브 특별건', product: 'SS 프리뷰 셋업 3종', desc: '조회수 100만 달성 특별 인센티브 50만원 추가지급', msg: '100만 뷰 달성 보너스 포함', price: 1500000, ratio: 0.70, month: '2026-01', s_status: 'paid', date: '2026-01-20' },
    { idx: 5, creator_id: getC(4), brand_id: getB(4), cat: '뷰티', chan: 'tiktok', sub: 'short_form', title: '해외직구 배송 지연 보상건', product: '수입산 파츠 네일 박스', desc: '제품 수급 2주 지연으로 계약금만 받고 종료', msg: '보상금 50만', price: 500000, ratio: 0.8, month: '2026-01', s_status: 'paid', date: '2026-01-25' },
    { idx: 6, creator_id: getC(5), brand_id: getB(0), cat: '뷰티', chan: 'youtube', sub: 'long_form', title: '[법인결제 지연] 세일 결산 영상', product: '세일기간 추천템 10건', desc: '법인카드 한도 이슈 발생', msg: '지급 지연중', price: 4000000, ratio: 0.75, month: '2026-02', s_status: 'escrow', date: '2026-02-02' },
    { idx: 7, creator_id: getC(6), brand_id: getB(1), cat: '패션', chan: 'instagram', sub: 'reels', title: '[MCN 락] 세금계산서 발행 지연', product: '남성 오피스룩 셋업', desc: '크리에이터 종소세 체납', msg: 'MCN 강제 보류', price: 3000000, ratio: 0.7, month: '2026-02', s_status: 'pending', date: '2026-02-05' },
    { idx: 8, creator_id: getC(7), brand_id: getB(2), cat: '뷰티', chan: 'blog', sub: 'post', title: '[무한 수정 늪] 1달째 초안 반려중', product: '신규 성분 더마 크림', desc: '자사 기존 제품과 비교가 마음에 안들어 4차 수정요청', msg: '위약금 고지 예정', price: 1000000, ratio: 0.65, month: '2026-02', s_status: 'escrow', date: '2026-02-08' },
    { idx: 9, creator_id: getC(8), brand_id: getB(3), cat: '라이프', chan: 'youtube', sub: 'long_form', title: '[상도덕 위반] 경쟁사 노출 강제 취소', product: 'SS 럭셔리 라운지웨어', desc: '영상 내 타사 로고 노출 분쟁', msg: '계약 파기', price: 5000000, ratio: 0.8, month: '2026-02', s_status: 'cancelled', date: '2026-02-12' },
    { idx: 10, creator_id: getC(9), brand_id: getB(4), cat: '패션', chan: 'instagram', sub: 'feed', title: '단순 변심 상호 합의 취소', product: '봄맞이 페디큐어 스티커', desc: '크리에이터 발톱 부상', msg: '합의 취소', price: 800000, ratio: 0.6, month: '2026-02', s_status: 'cancelled', date: '2026-02-15' },
    { idx: 11, creator_id: getC(10), brand_id: getB(0), cat: '뷰티', chan: 'tiktok', sub: 'short_form', title: '정상 정산 2월 틱톡 하울', product: '올영 라이브 단독', desc: '단순 하울', msg: '정상 지급', price: 1500000, ratio: 0.75, month: '2026-02', s_status: 'paid', date: '2026-02-18' },
    { idx: 12, creator_id: getC(11), brand_id: getB(1), cat: '패션', chan: 'youtube', sub: 'shorts', title: '환절기 스킨케어 숏츠', product: '진정 수분 앰플 스틱', desc: '일교차 심한 날', msg: '완료', price: 1200000, ratio: 0.70, month: '2026-02', s_status: 'paid', date: '2026-02-20' },
    { idx: 13, creator_id: getC(12), brand_id: getB(2), cat: '다이어트', chan: 'instagram', sub: 'reels', title: '야외 러닝에 필수 선쿠션', product: '대용량 쿨링 선쿠션', desc: '러닝 크루 인싸템', msg: '완료', price: 1800000, ratio: 0.75, month: '2026-02', s_status: 'paid', date: '2026-02-22' },
    { idx: 14, creator_id: getC(13), brand_id: getB(3), cat: '패션', chan: 'youtube', sub: 'long_form', title: '신학기 보이브 룩북 풀세트', product: '보이브 캠퍼스 룩', desc: '개강룩북', msg: '에스크로 묶임', price: 3500000, ratio: 0.8, month: '2026-02', s_status: 'escrow', date: '2026-02-25' },
    { idx: 15, creator_id: getC(14), brand_id: getB(4), cat: '뷰티', chan: 'instagram', sub: 'feed', title: '초저단가 거절', product: '1회용 큐티클 오일', desc: '무리한 요구', msg: '단칼 거절함', price: 100000, ratio: 0.5, month: '2026-02', s_status: 'rejected', date: '2026-02-28' },
    { idx: 16, creator_id: getC(15), brand_id: getB(0), cat: '패션', chan: 'youtube', sub: 'video_ppl', title: '[서명 대기] PPL 단가 최종협의', product: '올영 봄 세일', desc: '크리에이터 서명 대기', msg: '전자서명 요망', price: 5000000, ratio: 0.75, month: '2026-03', s_status: 'pending', date: '2026-03-01' },
    { idx: 17, creator_id: getC(16), brand_id: getB(1), cat: '빈티지', chan: 'instagram', sub: 'reels', title: '[배송 중] 제품 배송 1주째', product: '팔레트', desc: '택배 파업', msg: '배송조회증', price: 2500000, ratio: 0.7, month: '2026-03', s_status: 'pending', date: '2026-03-03' },
    { idx: 18, creator_id: getC(17), brand_id: getB(2), cat: '스포츠', chan: 'youtube', sub: 'long_form', title: '[초안 대기] 마감 임박 알람', product: '선크림', desc: '모레 마감', msg: 'Alert', price: 4500000, ratio: 0.8, month: '2026-03', s_status: 'pending', date: '2026-03-05' },
    { idx: 19, creator_id: getC(18), brand_id: getB(3), cat: '뷰티', chan: 'blog', sub: 'post', title: '[전속계약 충돌] 위약금 물고 취소', product: '보이브 프리미엄', desc: '경쟁사 모델이라 취소', msg: '위약금 10% 부과', price: 6000000, ratio: 0.85, month: '2026-03', s_status: 'cancelled', date: '2026-03-08' },
    { idx: 20, creator_id: getC(19), brand_id: getB(4), cat: '일상', chan: 'tiktok', sub: 'short_form', title: '[크리에이터 노쇼] 강제 해지', product: '손 케어 세트', desc: '제품 먹튀', msg: '내용증명 발송', price: 2000000, ratio: 0.6, month: '2026-03', s_status: 'cancelled', date: '2026-03-10' },
    { idx: 21, creator_id: getC(20), brand_id: getB(0), cat: '뷰티', chan: 'youtube', sub: 'long_form', title: '메가 인플루언서 9:1 계약', product: '올리브영 메인', desc: '초대형 유튜버', msg: '특별 정산 90%', price: 25000000, ratio: 0.9, month: '2026-03', s_status: 'pending', date: '2026-03-12' },
    { idx: 22, creator_id: getC(21), brand_id: getB(1), cat: '헤어', chan: 'instagram', sub: 'reels', title: '5:5 신인 크리에이터 키우기', product: '헤어 앰플', desc: 'MCN 100% 지원', msg: '전사 지원', price: 1000000, ratio: 0.5, month: '2026-03', s_status: 'pending', date: '2026-03-14' },
    { idx: 23, creator_id: getC(22), brand_id: getB(2), cat: '스킨케어', chan: 'youtube', sub: 'shorts', title: '성분 전문 리뷰 숏츠', product: '선크림', desc: '정상 진행중', msg: '컨펌 대기', price: 2000000, ratio: 0.75, month: '2026-03', s_status: 'escrow', date: '2026-03-16' },
    { idx: 24, creator_id: getC(23), brand_id: getB(3), cat: '라이프', chan: 'instagram', sub: 'feed', title: '한복 커버 촬영 룩북', product: '보이브 SS', desc: '한복+현대', msg: '정상', price: 800000, ratio: 0.6, month: '2026-03', s_status: 'pending', date: '2026-03-18' },
    { idx: 25, creator_id: getC(24), brand_id: getB(4), cat: '뷰티', chan: 'blog', sub: 'post', title: '집에서 혼자하는 봄꽃 네일', product: '벚꽃 컬렉션', desc: '상세 리뷰', msg: '정상', price: 500000, ratio: 0.7, month: '2026-03', s_status: 'pending', date: '2026-03-20' },
    { idx: 26, creator_id: getC(25), brand_id: getB(0), cat: '다이어트', chan: 'instagram', sub: 'reels', title: '유기농 간식 리뷰', product: '맛밤 3박스', desc: '야식 대용', msg: '에스크로(test)', price: 1500000, ratio: 0.75, month: '2026-03', s_status: 'escrow', date: '2026-03-22' },
    { idx: 27, creator_id: getC(0), brand_id: getB(1), cat: '뷰티', chan: 'youtube', sub: 'long_form', title: '안티에이징 밤 사용기', product: '유스 링클 나이트 밤', desc: '4K 촬영', msg: '정상', price: 4000000, ratio: 0.8, month: '2026-03', s_status: 'pending', date: '2026-03-24' },
    { idx: 28, creator_id: getC(1), brand_id: getB(2), cat: '라이프', chan: 'tiktok', sub: 'short_form', title: '선스틱 ASMR 긁는 소리', product: '쿨링 선스틱', desc: '소리 중심', msg: '지연 항의 에스크로', price: 1200000, ratio: 0.65, month: '2026-03', s_status: 'escrow', date: '2026-03-26' },
    { idx: 29, creator_id: getC(2), brand_id: getB(3), cat: '패션', chan: 'youtube', sub: 'video_ppl', title: '보이브 가방 언박싱', product: '버킷백', desc: 'VLOG 내 짧은 PPL', msg: '정상', price: 2000000, ratio: 0.75, month: '2026-03', s_status: 'pending', date: '2026-03-28' },
    { idx: 30, creator_id: getC(3), brand_id: getB(4), cat: '뷰티', chan: 'instagram', sub: 'feed', title: '유리알 광택 네일 피드', product: '글래스 탑코트 3종', desc: '단가 후려침', msg: '강제 거절', price: 200000, ratio: 0.5, month: '2026-03', s_status: 'rejected', date: '2026-03-30' },
    { idx: 31, creator_id: getC(4), brand_id: getB(0), cat: '뷰티', chan: 'instagram', sub: 'live', title: '[라이브 대기] 선대금 30% 선입금', product: '올리브영 라이브', desc: '쇼핑라이브', msg: '계약금 30%', price: 15000000, ratio: 0.85, month: '2026-04', s_status: 'pending', date: '2026-04-02' },
    { idx: 32, creator_id: getC(5), brand_id: getB(1), cat: '라이프', chan: 'youtube', sub: 'long_form', title: '어버이날 효도 여행 및 선물 언박싱', product: '유스 럭셔리 효 세트', desc: '호캉스', msg: '조율 중', price: 5500000, ratio: 0.8, month: '2026-04', s_status: 'pending', date: '2026-04-05' },
    { idx: 33, creator_id: getC(6), brand_id: getB(2), cat: '스포츠', chan: 'instagram', sub: 'reels', title: '초여름 바캉스 풀파티 룩 릴스', product: '선쿠션', desc: '풀파티 방수', msg: '섭외비 포함', price: 4000000, ratio: 0.75, month: '2026-04', s_status: 'pending', date: '2026-04-08' },
    { idx: 34, creator_id: getC(7), brand_id: getB(3), cat: '패션', chan: 'youtube', sub: 'long_form', title: '여름 린넨 컬렉션 미리보기 룩북', product: '보이브 린넨', desc: '얼리어답터', msg: '제품 지연 홀딩', price: 3500000, ratio: 0.8, month: '2026-04', s_status: 'escrow', date: '2026-04-11' },
    { idx: 35, creator_id: getC(8), brand_id: getB(4), cat: '뷰티', chan: 'tiktok', sub: 'short_form', title: '초여름 네온 컬러 젤네일', product: '팝 아트 에디션', desc: '페스티벌 네일', msg: '제안 단계', price: 1800000, ratio: 0.7, month: '2026-04', s_status: 'pending', date: '2026-04-14' },
    { idx: 36, creator_id: getC(9), brand_id: getB(0), cat: '뷰티', chan: 'blog', sub: 'post', title: '페스티벌 화장 꿀팁 성지 (취소)', product: '올리브영 페스티벌 키트', desc: '아티스트 일정 문제', msg: '브랜드 측 위약금 지급 (Cancelled)', price: 2000000, ratio: 0.75, month: '2026-04', s_status: 'cancelled', date: '2026-04-17' },
    { idx: 37, creator_id: getC(10), brand_id: getB(1), cat: '일상', chan: 'youtube', sub: 'shorts', title: '출근길 아침 5분 부기 싹 나이트크림', product: '유스 부기 앰플', desc: '출근 브이로그 숏폼', msg: '에스크로', price: 3000000, ratio: 0.8, month: '2026-04', s_status: 'escrow', date: '2026-04-20' },
    { idx: 38, creator_id: getC(11), brand_id: getB(2), cat: '패션', chan: 'instagram', sub: 'feed', title: '초간단 백탁 잡기 챌린지', product: '더마 무기자차 톤업 앰플', desc: '백탁 활용 톤업 크림처럼 쓰기', msg: '모델 거절', price: 1000000, ratio: 0.65, month: '2026-04', s_status: 'rejected', date: '2026-04-23' },
    { idx: 39, creator_id: getC(12), brand_id: getB(3), cat: '스포츠', chan: 'youtube', sub: 'video_ppl', title: '서핑 여행 룩북 중간 PPL', product: '보이브 서퍼 래쉬가드', desc: '양양 여행', msg: '비치웨어 촬영 대기', price: 4500000, ratio: 0.85, month: '2026-04', s_status: 'pending', date: '2026-04-26' },
    { idx: 40, creator_id: getC(13), brand_id: getB(4), cat: '라이프', chan: 'instagram', sub: 'reels', title: '셀프 패디큐어 전격 가이드', product: '프리미엄 젤스티커 발 패키지', desc: '샌들 계절 대비 패디큐어 준비 릴스', msg: '계약 대기 상태', price: 2200000, ratio: 0.75, month: '2026-04', s_status: 'pending', date: '2026-04-29' },

    // ==========================================
    // === 신규 추가 41 ~ 80 (Extreme Edge Cases) ===
    // ==========================================

    // [특수 상황] MCN 수수료율 인상 테스트 (보통 7:3인데 이건 MCN이 60%를 떼가는 악덕(?)계약 케이스)
    { idx: 41, creator_id: getC(14), brand_id: getB(0), cat: '뷰티', chan: 'youtube', sub: 'long_form', title: 'MCN 60% 수취 (풀지원 테스트)', product: '올리브영 대형 런칭쇼 VLOG', desc: 'MCN에서 장비 3천만원어치 렌탈해주고 찍은 영상', msg: '장비대여료 명목으로 MCN쉐어 60% 진행', price: 15000000, ratio: 0.4, month: '2026-02', s_status: 'paid', date: '2026-02-03' },

    // [특수 상황] 원천세 (3.3%) 미적용 대상 혹은 복잡한 세무 처리 케이스 (부가세 포함 10% 등)를 가정
    { idx: 42, creator_id: getC(15), brand_id: getB(1), cat: '뷰티', chan: 'instagram', sub: 'reels', title: '세금계산서 오발행 (금액 수정)', product: '세럼 1주일 챌린지', desc: '처음에 100만에 발행했다가 80만으로 수정 발행', msg: '환입 및 재발행으로 인해 정산 지급일 지연됨', price: 800000, ratio: 0.7, month: '2026-02', s_status: 'escrow', date: '2026-02-06' },

    // [특수 상황] 기부 목적 0원 계약 혹은 자선 행사 (가격이 낮음)
    { idx: 43, creator_id: getC(16), brand_id: getB(2), cat: '라이프', chan: 'instagram', sub: 'feed', title: '선스크린랩 환경보호 캠페인', product: '리프세이프 바다보호 선크림 기부', desc: '노개런티 수익금 전액 기부 목적 포스팅', msg: '교통비 실비 5만원만 정산 (기부 프로젝트)', price: 50000, ratio: 1.0, month: '2026-02', s_status: 'paid', date: '2026-02-09' },

    // 2월 잔여 (Paid, Escrow 위주 조합)
    { idx: 44, creator_id: getC(17), brand_id: getB(3), cat: '패션', chan: 'youtube', sub: 'shorts', title: '10만원짜리 낡은 가방 리폼', product: '보이브 업사이클 킷', desc: '환경보호 숏폼', msg: '완료', price: 1200000, ratio: 0.75, month: '2026-02', s_status: 'paid', date: '2026-02-14' },
    { idx: 45, creator_id: getC(18), brand_id: getB(4), cat: '뷰티', chan: 'tiktok', sub: 'short_form', title: '글로벌 틱톡 뷰파티 참가 기록', product: '네일아트 전문가 세트', desc: '글로벌 노출 틱톡 챌린지', msg: '달러 환율 적용 전 에스크로 홀드', price: 5000000, ratio: 0.8, month: '2026-02', s_status: 'escrow', date: '2026-02-18' },
    { idx: 46, creator_id: getC(19), brand_id: getB(0), cat: '다이어트', chan: 'youtube', sub: 'long_form', title: '3대 500 치팅데이 VLOG', product: '올리브영 고단백 스낵', desc: '헬스 유튜버 식단', msg: '정산완료', price: 3000000, ratio: 0.7, month: '2026-02', s_status: 'paid', date: '2026-02-21' },
    { idx: 47, creator_id: getC(20), brand_id: getB(1), cat: '뷰티', chan: 'instagram', sub: 'reels', title: '아저씨가 바르는 아이크림', product: '유스 링클 포맨', desc: '아재 타겟 뷰티', msg: '지급지연', price: 2000000, ratio: 0.75, month: '2026-02', s_status: 'escrow', date: '2026-02-23' },
    { idx: 48, creator_id: getC(21), brand_id: getB(2), cat: '뷰티', chan: 'blog', sub: 'post', title: '의대가 알려주는 피부 노화의 비밀', product: 'UV 실드 마스크', desc: '전문가 칼럼형', msg: '취소 (내용 허위과장 논란 우려)', price: 1500000, ratio: 0.8, month: '2026-02', s_status: 'cancelled', date: '2026-02-26' },
    { idx: 49, creator_id: getC(22), brand_id: getB(3), cat: '패션', chan: 'instagram', sub: 'feed', title: '봄비 내리는 날씨 OOTD', product: '보이브 방수 트렌치 코트', desc: '레인코트', msg: '완료', price: 1000000, ratio: 0.65, month: '2026-02', s_status: 'paid', date: '2026-02-27' },
    { idx: 50, creator_id: getC(23), brand_id: getB(4), cat: '일상', chan: 'youtube', sub: 'video_ppl', title: '강아지 네일샵 동반 브이로그', product: '애견동반샵 스튜디오 N', desc: '반려견', msg: '위약금 30% 발생', price: 2000000, ratio: 0.7, month: '2026-02', s_status: 'cancelled', date: '2026-02-28' },

    // [초대형 소송/법적 분쟁]
    { idx: 51, creator_id: getC(24), brand_id: getB(0), cat: '라이프', chan: 'youtube', sub: 'long_form', title: '[소송 진행중] 거짓 리뷰 논란', product: '특수 기능성 샴푸 (올리브영 입점)', desc: '효능이 1도 없다는 구독자 폭동 발생', msg: '법무팀에서 정산금 전액 압류 및 에스크로 락 (법적 분쟁 진행중)', price: 10000000, ratio: 0.8, month: '2026-03', s_status: 'escrow', date: '2026-03-01' },

    // [채널 정지 사태]
    { idx: 52, creator_id: getC(25), brand_id: getB(1), cat: '뷰티', chan: 'youtube', sub: 'shorts', title: '[채널 해킹] 광고 영상 날아감', product: '유스 앰플 시그니처 10ml', desc: '크리에이터 유튜브 채널이 해킹당해 영상 삭제됨', msg: '복구 전까지 대금 지급 펜딩, 최악의 경우 취소 환불', price: 5000000, ratio: 0.75, month: '2026-03', s_status: 'pending', date: '2026-03-04' },

    // [다중 플랫폼 계약]
    { idx: 53, creator_id: getC(0), brand_id: getB(2), cat: '스포츠', chan: 'multi', sub: 'reels+shorts+tiktok', title: '원소스 멀티유즈 3사 플랫폼 도배', product: '서핑용 방수 강력 선크림', desc: '하나 찍어서 유튜브, 인스타, 틱톡 동시 업로드 계약', msg: '인스타 틱톡은 올렸는데 유튜브 쇼츠 업로드 지연으로 Pending 중', price: 6000000, ratio: 0.85, month: '2026-03', s_status: 'pending', date: '2026-03-07' },

    // 3월 잔여
    { idx: 54, creator_id: getC(1), brand_id: getB(3), cat: '패션', chan: 'instagram', sub: 'feed', title: '제주도 카페투어룩', product: '보이브 제주컬렉션', desc: '제주도 촬영', msg: '서명 완료, 제작 중', price: 2000000, ratio: 0.7, month: '2026-03', s_status: 'pending', date: '2026-03-09' },
    { idx: 55, creator_id: getC(2), brand_id: getB(4), cat: '뷰티', chan: 'blog', sub: 'post', title: '손톱 무좀 극복기 (약혐주의)', product: '메디컬 케어 라인', desc: '사실적 묘사', msg: '광고 심의 통과 대기중', price: 1500000, ratio: 0.6, month: '2026-03', s_status: 'pending', date: '2026-03-11' },
    { idx: 56, creator_id: getC(3), brand_id: getB(0), cat: '뷰티', chan: 'youtube', sub: 'video_ppl', title: '아이돌 메이크업샵 방문기', product: '올리브영 인기 브러쉬 세트', desc: '샵 원장님 추천', msg: '편집 중', price: 3500000, ratio: 0.8, month: '2026-03', s_status: 'pending', date: '2026-03-13' },
    { idx: 57, creator_id: getC(4), brand_id: getB(1), cat: '뷰티', chan: 'tiktok', sub: 'short_form', title: '남친이 골라주는 스킨케어 챌린지', product: '유스랩 커플 세트', desc: '재미난 숏폼', msg: '촬영 대기', price: 2000000, ratio: 0.75, month: '2026-03', s_status: 'pending', date: '2026-03-15' },
    { idx: 58, creator_id: getC(5), brand_id: getB(2), cat: '뷰티', chan: 'instagram', sub: 'reels', title: '출근길 지하철에서 바르는 선스틱', product: '스마트 선스틱', desc: '지하철 화장', msg: '지하철 촬영 허가 문제로 지연', price: 1800000, ratio: 0.7, month: '2026-03', s_status: 'escrow', date: '2026-03-17' },
    { idx: 59, creator_id: getC(6), brand_id: getB(3), cat: '패션', chan: 'youtube', sub: 'long_form', title: '1주일 만보 걷기 프로젝트 의상', product: '에어 액티브 스니커즈 & 트레이닝', desc: '운동복', msg: '조회수 저조로 재촬영 요구받음 (분쟁)', price: 4000000, ratio: 0.8, month: '2026-03', s_status: 'escrow', date: '2026-03-19' },
    { idx: 60, creator_id: getC(7), brand_id: getB(4), cat: '일상', chan: 'instagram', sub: 'feed', title: '네일샵 폐업정리 언박싱', product: '재고정리 패키지', desc: '어그로', msg: '브랜드 측에서 자극적 제목 싫어해서 거절', price: 500000, ratio: 0.5, month: '2026-03', s_status: 'rejected', date: '2026-03-22' },
    { idx: 61, creator_id: getC(8), brand_id: getB(0), cat: '뷰티', chan: 'tiktok', sub: 'short_form', title: '화장품으로 그림그리기', product: '올영 색조 팔레트', desc: '아트', msg: '정상 펜딩', price: 1200000, ratio: 0.65, month: '2026-03', s_status: 'pending', date: '2026-03-24' },
    { idx: 62, creator_id: getC(9), brand_id: getB(1), cat: '뷰티', chan: 'youtube', sub: 'long_form', title: '피부과 의사가 본 아모레 앰플 성분', product: '유스 링클 집중 앰플', desc: '전문가 리뷰', msg: '서명 대기', price: 4500000, ratio: 0.85, month: '2026-03', s_status: 'pending', date: '2026-03-26' },
    { idx: 63, creator_id: getC(10), brand_id: getB(2), cat: '뷰티', chan: 'instagram', sub: 'reels', title: '메이크업 고정 픽서 겸 선미스트', product: '선 미스트 스프레이', desc: '여름대비', msg: '협상 중단 (취소)', price: 1500000, ratio: 0.7, month: '2026-03', s_status: 'cancelled', date: '2026-03-28' },

    // [콘텐츠 검열] 심의 불가로 인한 취소
    { idx: 64, creator_id: getC(11), brand_id: getB(3), cat: '패션', chan: 'youtube', sub: 'shorts', title: '[광고심의 반려] 과도한 노출 의상 룩북', product: '보이브 SS 언더웨어 런칭', desc: '심의 규정 위반으로 인해 유튜브 옐로딱지', msg: '플랫폼 커뮤니티 가이드 위반 삭제. 전액 환불 및 파기', price: 5000000, ratio: 0.8, month: '2026-03', s_status: 'cancelled', date: '2026-03-31' },

    // === 2026-04 (사전 기획, 장기 프로젝트, 특수 계약, 16건) ===

    // [블랙 프라이데이 / 특수 상반기 세일 메가 기획]
    { idx: 65, creator_id: getC(12), brand_id: getB(0), cat: '쇼핑', chan: 'youtube', sub: 'long_form', title: '상반기 결산 올영 빅보이 하울 100만 유튜버 기획', product: '올리브영 전품목 기획', desc: '상반기 최대 프로젝트, 예산 3천만', msg: '선금 10% 지급. 4월 촬영대기', price: 30000000, ratio: 0.9, month: '2026-04', s_status: 'pending', date: '2026-04-01' },

    // [해외 로케이션 촬영]
    { idx: 66, creator_id: getC(13), brand_id: getB(1), cat: '뷰티', chan: 'instagram', sub: 'reels', title: '파리 패션위크에서 바르는 앰플 세럼', product: '유스 VIP 에디션', desc: '해외 현지 촬영', msg: '해외 체류일정 컨펌 대기', price: 8000000, ratio: 0.85, month: '2026-04', s_status: 'pending', date: '2026-04-03' },

    // [초단기 모델 발탁 (광고 초상권 계약)]
    { idx: 67, creator_id: getC(14), brand_id: getB(2), cat: '뷰티', chan: 'multi', sub: 'reels', title: 'SNS 광고 소재 6개월 옥외/온라인 무제한 활용', product: '뉴 더마 선크림 베이직', desc: '단순 포스팅이 아니라 초상권 팔림. 고단가', msg: '초상권 활용 범위 조율 중 (Escrow)', price: 12000000, ratio: 0.8, month: '2026-04', s_status: 'escrow', date: '2026-04-06' },

    // 4월 잔여
    { idx: 68, creator_id: getC(15), brand_id: getB(3), cat: '패션', chan: 'blog', sub: 'post', title: '회사원 5인조 단체복 블라인드 테스트', product: '보이브 스마트 팬츠 콜라보', desc: '단체촬영', msg: '인원 조율 대기', price: 4000000, ratio: 0.75, month: '2026-04', s_status: 'pending', date: '2026-04-09' },
    { idx: 69, creator_id: getC(16), brand_id: getB(4), cat: '뷰티', chan: 'tiktok', sub: 'short_form', title: '남자도 네일한다 #그루밍족', product: '맨즈 매트 탑코트', desc: '남성 타겟', msg: '거절 (단가 문제)', price: 500000, ratio: 0.5, month: '2026-04', s_status: 'rejected', date: '2026-04-11' },
    { idx: 70, creator_id: getC(17), brand_id: getB(0), cat: '다이어트', chan: 'instagram', sub: 'feed', title: '다이어트 보조제 허위 사실 조심', product: '올영 검증 보조제 세트', desc: '식약처 인증마크 포커스', msg: '심의 통과 대기', price: 2500000, ratio: 0.7, month: '2026-04', s_status: 'pending', date: '2026-04-13' },
    { idx: 71, creator_id: getC(18), brand_id: getB(1), cat: '뷰티', chan: 'youtube', sub: 'shorts', title: '마스크 벗고 당당하게 피부 관리', product: '트러블 진정 패치', desc: '근접샷', msg: '제품 배송 대기', price: 1800000, ratio: 0.75, month: '2026-04', s_status: 'pending', date: '2026-04-16' },
    { idx: 72, creator_id: getC(19), brand_id: getB(2), cat: '뷰티', chan: 'youtube', sub: 'long_form', title: '임산부가 발라도 되는 선크림', product: '순수 무기자차 베이비용', desc: '안전성 검증 영상', msg: '산부인과 자문 대기', price: 4500000, ratio: 0.8, month: '2026-04', s_status: 'escrow', date: '2026-04-18' },
    { idx: 73, creator_id: getC(20), brand_id: getB(3), cat: '패션', chan: 'instagram', sub: 'reels', title: '스우파 느낌 스트릿 패션', product: '보이브 스트릿 라인', desc: '댄스팀 콜라보', msg: '의상 대여 펜딩', price: 3500000, ratio: 0.75, month: '2026-04', s_status: 'pending', date: '2026-04-21' },
    { idx: 74, creator_id: getC(21), brand_id: getB(4), cat: '일상', chan: 'youtube', sub: 'vlog', title: '웨딩 네일 고르기 VLOG', product: '웨딩 프렌치 네일 세트', desc: '예비신부 콘셉트', msg: '정상 펜딩', price: 2800000, ratio: 0.7, month: '2026-04', s_status: 'pending', date: '2026-04-23' },
    { idx: 75, creator_id: getC(22), brand_id: getB(0), cat: '뷰티', chan: 'blog', sub: 'post', title: '환절기 두피 각질 싹 비우기', product: '올영 판매 1위 스칼프 샴푸', desc: '두피 현미경 컷', msg: '촬영 예약 완료', price: 1500000, ratio: 0.65, month: '2026-04', s_status: 'pending', date: '2026-04-25' },
    { idx: 76, creator_id: getC(23), brand_id: getB(1), cat: '뷰티', chan: 'instagram', sub: 'feed', title: '승무원 미스트 팩으로 쓰기', product: '유스 수분 폭탄 미스트', desc: '비행기 배경', msg: '기내 촬영 불가로 보류', price: 2000000, ratio: 0.7, month: '2026-04', s_status: 'escrow', date: '2026-04-26' },
    { idx: 77, creator_id: getC(24), brand_id: getB(2), cat: '스포츠', chan: 'tiktok', sub: 'short_form', title: '골프장 라운딩 필수템 백스윙샷', product: '골프 선패치 프리미엄', desc: '골프 스윙 틱톡', msg: '골프장 예약 완료', price: 2200000, ratio: 0.75, month: '2026-04', s_status: 'pending', date: '2026-04-27' },
    { idx: 78, creator_id: getC(25), brand_id: getB(3), cat: '패션', chan: 'instagram', sub: 'reels', title: '5만원으로 머리부터 발끝까지 1세트 맞추기', product: '보이브 베이직 기획전', desc: '초가성비 룩북', msg: '거절 (단가가 제품가격보다 낮음)', price: 30000, ratio: 0.5, month: '2026-04', s_status: 'rejected', date: '2026-04-28' },
    { idx: 79, creator_id: getC(0), brand_id: getB(4), cat: '뷰티', chan: 'youtube', sub: 'video_ppl', title: '기분전환용 힐링 글리터 네일', product: '글로우 글리터 풀패키지', desc: '기분전환 브이로그', msg: '취소 (일정변경 3회 위반)', price: 1800000, ratio: 0.7, month: '2026-04', s_status: 'cancelled', date: '2026-04-29' },
    { idx: 80, creator_id: getC(1), brand_id: getB(0), cat: '뷰티', chan: 'instagram', sub: 'live', title: '[마지막 4월] 올영 라스트콜 특가', product: '올리브영 클리어런스 박스', desc: '재고정리 창고대방출', msg: '단가 최저 50만 라이브 진행 확정', price: 500000, ratio: 0.6, month: '2026-04', s_status: 'pending', date: '2026-04-30' },
]

function mapWorkspaceStatus(s: string) {
    if (s === 'paid') return 'settlement'
    if (s === 'escrow') return 'in_progress'
    if (s === 'cancelled') return 'cancelled'
    if (s === 'rejected') return 'none'
    return 'active'
}

function mapMomentStatus(s: string) {
    if (s === 'paid') return 'completed'
    if (s === 'escrow') return 'accepted'
    if (s === 'cancelled') return 'cancelled'
    if (s === 'rejected') return 'rejected'
    return 'offered'
}

function mapContractStatus(s: string) {
    if (s === 'paid' || s === 'escrow') return 'signed'
    if (s === 'cancelled' || s === 'rejected') return 'none'
    return 'pending'
}

function mapDeliveryStatus(s: string) {
    if (s === 'paid') return 'delivered'
    if (s === 'escrow') return 'shipped'
    return 'pending'
}

function calc(gross: number, ratio: number) {
    const c = Math.round(gross * ratio)
    const m = gross - c
    const w = Math.round(c * 0.033)
    return { c, m, w, n: c - w }
}

async function main() {
    console.log(`\n======================================================`)
    console.log(`🚀 ERP 시나리오용 80건 [초광폭 데모] 생성 시작...`)
    console.log(`======================================================\n`)

    console.log('🗑️  기존 MCN 데이터 클리닝 중 (settlements -> workspaces -> moments)...')
    await sb.from('settlements').delete().eq('team_id', TEAM_ID)

    const { data: wsData } = await sb.from('workspaces').select('id')
    const wsIds = wsData?.map(w => w.id) || []
    if (wsIds.length) {
        await sb.from('ad_contest_applications').delete().in('workspace_id', wsIds)
        await sb.from('moment_proposals').update({ workspace_id: null }).in('workspace_id', wsIds)
        await sb.from('workspaces').delete().in('id', wsIds)
    }

    const { data: memberData } = await sb.from('team_members').select('user_id').eq('team_id', TEAM_ID)
    const tMembers = memberData?.map(m => m.user_id) || []

    if (tMembers.length) {
        const { data: mpData } = await sb.from('moment_proposals').select('id, moment_id').in('creator_id', tMembers)
        const mpIds = mpData?.map(m => m.id) || []
        const mIds = mpData?.map(m => m.moment_id).filter(Boolean) || []

        if (mpIds.length) await sb.from('moment_proposals').delete().in('id', mpIds)
        if (mIds.length) await sb.from('life_moments').delete().in('id', mIds)
    }
    console.log('✅ 클리닝 완료\n')

    let countPaid = 0, countPending = 0, countEscrow = 0, countCancel = 0, countReject = 0;

    // 80건 생성 루프
    for (const row of RAW_DATA) {
        if (row.s_status === 'paid') countPaid++;
        if (row.s_status === 'pending') countPending++;
        if (row.s_status === 'escrow') countEscrow++;
        if (row.s_status === 'cancelled') countCancel++;
        if (row.s_status === 'rejected') countReject++;

        const mStat = mapMomentStatus(row.s_status)
        const wStat = mapWorkspaceStatus(row.s_status)
        const cStat = mapContractStatus(row.s_status)
        const dStat = mapDeliveryStatus(row.s_status)

        const startT = new Date(`${row.date}T10:00:00+09:00`).toISOString()
        const paidT = row.s_status === 'paid' ? new Date(`${row.date}T14:00:00+09:00`).toISOString() : null

        // (A) life_moments
        const { data: lm, error: lmErr } = await sb.from('life_moments').insert({
            creator_id: row.creator_id, team_id: TEAM_ID, title: row.title,
            description: row.desc, category: row.cat, moment_start_date: row.date,
            status: mStat === 'rejected' || mStat === 'cancelled' ? 'cancelled' : 'completed'
        }).select('id').single()
        if (lmErr) { console.error(`[${row.idx}] ❌ life_moments Error:`, lmErr.message); continue }

        // (B) moment_proposals
        const { data: mp, error: mpErr } = await sb.from('moment_proposals').insert({
            brand_id: row.brand_id, creator_id: row.creator_id, moment_id: lm.id,
            message: row.msg, status: mStat, creator_team_id: TEAM_ID, created_at: startT,
        }).select('id').single()
        if (mpErr) { console.error(`[${row.idx}] ❌ moment_proposals Error:`, mpErr.message); continue }

        if (row.s_status === 'rejected') {
            console.log(`[${String(row.idx).padStart(2, '0')}/80] 🛑 [거절됨] ₩${row.price.toLocaleString()} — ${row.title}`)
            continue
        }

        // (C) workspaces
        const { data: ws, error: wsErr } = await sb.from('workspaces').insert({
            brand_id: row.brand_id, creator_id: row.creator_id,
            project_title: `${row.title}`, product_name: row.product,
            price_offer: row.price, status: wStat, channel_name: row.chan, channel_subtype: row.sub,
            brand_condition_confirmed: cStat !== 'pending', creator_condition_confirmed: cStat === 'signed',
            contract_status: cStat, delivery_status: dStat,
            original_proposal_id: mp.id, original_proposal_type: 'moment_proposal', created_at: startT,
        }).select('id').single()
        if (wsErr) { console.error(`[${row.idx}] ❌ workspaces Error:`, wsErr.message); continue }

        await sb.from('moment_proposals').update({ workspace_id: ws.id }).eq('id', mp.id)

        // (D) settlements
        const { c, m, w, n } = calc(row.price, row.ratio)
        const { error: sErr } = await sb.from('settlements').insert({
            team_id: TEAM_ID, creator_id: row.creator_id, brand_id: row.brand_id, workspace_id: ws.id,
            proposal_id: mp.id, proposal_type: 'moment_proposal',
            gross_amount: row.price, split_ratio: row.ratio,
            creator_amount: c, mcn_amount: m, withholding_rate: 0.033, withholding_amount: w, net_creator_amount: n,
            status: row.s_status, settlement_month: row.month, paid_at: paidT,
            note: `[${row.month}] ${row.product} 정산 (${row.s_status})`, created_at: startT,
        })
        if (sErr) console.error(`[${row.idx}] ❌ settlements Error:`, sErr.message)
        else {
            const icon = { paid: '✅', escrow: '🔒', pending: '⏳', cancelled: '🚫' }[row.s_status] || '❓'
            console.log(`[${String(row.idx).padStart(2, '0')}/80] ${icon} [${row.month}] ₩${row.price.toLocaleString().padStart(10, ' ')} (${row.ratio * 10}:MCN) — ${row.title.substring(0, 30)}`)
        }
    }

    const splits = C_IDS.map((id, index) => {
        const r = [0.8, 0.75, 0.7, 0.6, 0.9, 0.5][index % 6]
        return { team_id: TEAM_ID, creator_id: id, split_ratio: r }
    })
    const { error: splitErr } = await sb.from('mcn_revenue_splits').upsert(splits, { onConflict: 'team_id,creator_id' })
    if (splitErr) console.warn('⚠️  배분율 UPSERT 실패:', splitErr.message)
    else console.log('\n✅ 26명 전원 배분율(50%~90%) 무작위 설정 완료')

    console.log(`
======================================================
🎉 80건 프리미엄 데이터 생성 완벽 종료.

[ 통계 ]
✅ Paid (완료)       : ${countPaid}건
⏳ Pending (대기)    : ${countPending}건
🔒 Escrow (보류)     : ${countEscrow}건
🚫 Cancelled (취소)  : ${countCancel}건
🛑 Rejected (거절)   : ${countReject}건
----------------------------------
Total             : 80건
======================================================
`)
}

main().catch(console.error)
