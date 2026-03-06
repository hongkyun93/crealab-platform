/**
 * MCN ERP 시나리오용 40건 초고퀄리티 전체 크리에이터 데모 생성 (V4)
 *
 * 26명 전원 활용, 2~4월 분산, 극단적 ERP 엣지 케이스 포함.
 * 실행: npx tsx scripts/seed-erp-master.ts
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

// 26명 전부 맵핑 (최근 조회 기준)
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

// 5개 핵심 브랜드 재사용
const B_IDS = [
    '6b8cedf0-1548-42fc-ba3f-ed434ace5bb9', // 올리브영
    '2ce9d5bb-0421-49a9-8850-c117101b2f1c', // 아모레유스랩
    'b63d56e4-1009-4330-8420-b6dc73b1622e', // 선스크린랩
    '3293e5f8-bff5-4292-b3ef-7104537c8575', // 보이브
    '52f01d28-92ab-40ee-86b0-8e85e5c9d887', // 네일스튜디오N
]

function getC(idx: number) { return C_IDS[idx % C_IDS.length] }
function getB(idx: number) { return B_IDS[idx % B_IDS.length] }

type RowData = {
    idx: number; creator_id: string; brand_id: string; cat: string; chan: string; sub: string;
    title: string; product: string; desc: string; msg: string;
    price: number; ratio: number; month: string; s_status: string; date: string;
}

// 40개의 극한 시나리오
const RAW_DATA: RowData[] = [
    // === 2026-01 (완전 종료된 히스토리용, 5건) ===
    { idx: 1, creator_id: getC(0), brand_id: getB(0), cat: '뷰티', chan: 'instagram', sub: 'reels', title: '초단기 릴스 테스트 (3일컷)', product: '신년 기획 기초 2종', desc: '설날 맞이 초간단 선물 추천', msg: '업로드부터 정산까지 초스피드건 진행완료', price: 200000, ratio: 0.6, month: '2026-01', s_status: 'paid', date: '2026-01-05' },
    { idx: 2, creator_id: getC(1), brand_id: getB(1), cat: '뷰티', chan: 'youtube', sub: 'long_form', title: '연간 앰배서더 1차 잔금', product: '유스 앰플 풀라인 런칭 (앰배서더)', desc: '연간 계약 중 1분기 런칭 영상 및 화보 촬영', msg: '앰배서더 1차 잔금 지급 요청건', price: 18000000, ratio: 0.85, month: '2026-01', s_status: 'paid', date: '2026-01-10' },
    { idx: 3, creator_id: getC(2), brand_id: getB(2), cat: '뷰티', chan: 'instagram', sub: 'feed', title: '단가 네고 완료건', product: '데일리 무기자차 선크림', desc: '초기 500 제안받고 450으로 협의완료 스토어', msg: '단가 협의 후 최종 진행된 건', price: 4500000, ratio: 0.75, month: '2026-01', s_status: 'paid', date: '2026-01-15' },
    { idx: 4, creator_id: getC(3), brand_id: getB(3), cat: '패션', chan: 'youtube', sub: 'shorts', title: '조회수 인센티브 특별건', product: 'SS 프리뷰 셋업 3종', desc: '조회수 100만 달성 특별 인센티브 50만원 추가지급', msg: '100만 뷰 달성 보너스 포함', price: 1500000, ratio: 0.70, month: '2026-01', s_status: 'paid', date: '2026-01-20' },
    { idx: 5, creator_id: getC(4), brand_id: getB(4), cat: '뷰티', chan: 'tiktok', sub: 'short_form', title: '해외직구 배송 지연 보상건', product: '수입산 파츠 네일 박스', desc: '제품 수급 2주 지연으로 계약금만 받고 종료', msg: '브랜드 측 제품 수급 문제로 취소 보상금만 받음', price: 500000, ratio: 0.8, month: '2026-01', s_status: 'paid', date: '2026-01-25' },

    // === 2026-02 (에스크로, 지연, 취소 중심, 10건) ===
    { idx: 6, creator_id: getC(5), brand_id: getB(0), cat: '뷰티', chan: 'youtube', sub: 'long_form', title: '[법인결제 지연] 세일 결산 영상', product: '세일기간 추천템 10건 블라인드 테스트', desc: '영상은 2월 초 나갔으나 아직 돈 안들어옴', msg: '브랜드 예산 락인으로 법인카드 한도 이슈 발생', price: 4000000, ratio: 0.75, month: '2026-02', s_status: 'escrow', date: '2026-02-02' },
    { idx: 7, creator_id: getC(6), brand_id: getB(1), cat: '패션', chan: 'instagram', sub: 'reels', title: '[MCN 락] 세금계산서 발행 지연', product: '남성 오피스룩 셋업', desc: '크리에이터 종소세 체납으로 MCN 강제 홀딩', msg: '개인 세무 이슈 해결 전까지 정산 지급 강제 보류 (Pending)', price: 3000000, ratio: 0.7, month: '2026-02', s_status: 'pending', date: '2026-02-05' },
    { idx: 8, creator_id: getC(7), brand_id: getB(2), cat: '뷰티', chan: 'blog', sub: 'post', title: '[무한 수정 늪] 1달째 초안 반려중', product: '신규 성분 더마 크림', desc: '자사 기존 제품과 비교 성분이 마음에 안들어 4차 수정요청', msg: '브랜드 컨펌 초과. 위약금 고지 예정', price: 1000000, ratio: 0.65, month: '2026-02', s_status: 'escrow', date: '2026-02-08' },
    { idx: 9, creator_id: getC(8), brand_id: getB(3), cat: '라이프', chan: 'youtube', sub: 'long_form', title: '[상도덕 위반] 경쟁사 노출 강제 취소', product: 'SS 럭셔리 라운지웨어', desc: '영상 내 타사 로고 심하게 노출 분쟁', msg: '경쟁사 제품 로고 노출로 계약 파기 (Cancelled)', price: 5000000, ratio: 0.8, month: '2026-02', s_status: 'cancelled', date: '2026-02-12' },
    { idx: 10, creator_id: getC(9), brand_id: getB(4), cat: '패션', chan: 'instagram', sub: 'feed', title: '단순 변심 상호 합의 취소', product: '봄맞이 페디큐어 스티커', desc: '크리에이터 발톱 부상으로 촬영 불가, 쿨하게 취소', msg: '일정 조율 불발, 노 페널티 취소 완료', price: 800000, ratio: 0.6, month: '2026-02', s_status: 'cancelled', date: '2026-02-15' },
    { idx: 11, creator_id: getC(10), brand_id: getB(0), cat: '뷰티', chan: 'tiktok', sub: 'short_form', title: '정상 정산 2월 틱톡 하울', product: '올영 라이브 단독 패키지', desc: '라이브 방송 전 바람잡이용 숏크', msg: '정상 릴스/틱톡 게재, 정상 지급', price: 1500000, ratio: 0.75, month: '2026-02', s_status: 'paid', date: '2026-02-18' },
    { idx: 12, creator_id: getC(11), brand_id: getB(1), cat: '패션', chan: 'youtube', sub: 'shorts', title: '환절기 스킨케어 숏츠', product: '진정 수분 앰플 스틱', desc: '일교차 심한 날 추천템', msg: '정상 완료건', price: 1200000, ratio: 0.70, month: '2026-02', s_status: 'paid', date: '2026-02-20' },
    { idx: 13, creator_id: getC(12), brand_id: getB(2), cat: '다이어트', chan: 'instagram', sub: 'reels', title: '야외 러닝에 필수 선쿠션', product: '대용량 쿨링 선쿠션', desc: '러닝 크루 인싸템', msg: '정상 완료건', price: 1800000, ratio: 0.75, month: '2026-02', s_status: 'paid', date: '2026-02-22' },
    { idx: 14, creator_id: getC(13), brand_id: getB(3), cat: '패션', chan: 'youtube', sub: 'long_form', title: '신학기 보이브 룩북 풀세트', product: '보이브 캠퍼스 룩 5세트', desc: '새내기 추천 개강룩북', msg: '정산 에스크로 묶임 (브랜드 측 지연)', price: 3500000, ratio: 0.8, month: '2026-02', s_status: 'escrow', date: '2026-02-25' },
    { idx: 15, creator_id: getC(14), brand_id: getB(4), cat: '뷰티', chan: 'instagram', sub: 'feed', title: '초저단가 거절', product: '1회용 큐티클 오일 (단가10)', desc: '너무 낮은 단가 제안', msg: '단가 10만원에 피드+스토리 요구. 바로 거절함', price: 100000, ratio: 0.5, month: '2026-02', s_status: 'rejected', date: '2026-02-28' },

    // === 2026-03 (현재 가장 핫한 대규모 Pending 구간, 15건) ===
    { idx: 16, creator_id: getC(15), brand_id: getB(0), cat: '패션', chan: 'youtube', sub: 'video_ppl', title: '[서명 대기] PPL 단가 최종협의', product: '올영 봄 세일 단독 기획전', desc: '브랜드 서명은 끝났는데 크리에이터가 서명 안함', msg: '이번주 금요일까지 서명 부탁드립니다 (Pending)', price: 5000000, ratio: 0.75, month: '2026-03', s_status: 'pending', date: '2026-03-01' },
    { idx: 17, creator_id: getC(16), brand_id: getB(1), cat: '빈티지', chan: 'instagram', sub: 'reels', title: '[배송 중] 제품 배송 1주째', product: 'NEW 아모레 한정판 팔레트', desc: '택배 파업으로 아직 제품 도착 안함', msg: '제품 배송 상태 모니터링 중. 기간 연장 협의 완', price: 2500000, ratio: 0.7, month: '2026-03', s_status: 'pending', date: '2026-03-03' },
    { idx: 18, creator_id: getC(17), brand_id: getB(2), cat: '스포츠', chan: 'youtube', sub: 'long_form', title: '[초안 대기] 마감 임박 알람', product: '야외 레저용 강력 워터프루프 선크림', desc: '모레가 초안 마감인데 소식이 없음 Alert', msg: '마스터 트래커 지연 알람 테스트용', price: 4500000, ratio: 0.8, month: '2026-03', s_status: 'pending', date: '2026-03-05' },
    { idx: 19, creator_id: getC(18), brand_id: getB(3), cat: '뷰티', chan: 'blog', sub: 'post', title: '[전속계약 충돌] 위약금 물고 취소', product: '보이브 프리미엄 스킨케어 런칭', desc: '경쟁사(아모레) 전속 계약 위반 소지로 MCN 강제 취소', msg: '경쟁사 중복 노출 이슈로 계약 거절 및 Cancelled 처리', price: 6000000, ratio: 0.85, month: '2026-03', s_status: 'cancelled', date: '2026-03-08' },
    { idx: 20, creator_id: getC(19), brand_id: getB(4), cat: '일상', chan: 'tiktok', sub: 'short_form', title: '[크리에이터 노쇼] 강제 해지', product: '네일스튜디오 신생아 손 케어 세트', desc: '제품 받고 연락 두절. 법적 고지', msg: '내용증명 발송 및 Cancelled (페널티 부과 예정)', price: 2000000, ratio: 0.6, month: '2026-03', s_status: 'cancelled', date: '2026-03-10' },
    { idx: 21, creator_id: getC(20), brand_id: getB(0), cat: '뷰티', chan: 'youtube', sub: 'long_form', title: '메가 인플루언서 9:1 계약 (초고단가)', product: '올리브영 단독 메인 구좌 입점', desc: '초대형 유튜버 특별 배분율 (9:1) 테스트', msg: '특별 정산. 배분율 90%', price: 25000000, ratio: 0.9, month: '2026-03', s_status: 'pending', date: '2026-03-12' },
    { idx: 22, creator_id: getC(21), brand_id: getB(1), cat: '헤어', chan: 'instagram', sub: 'reels', title: '5:5 신인 크리에이터 키우기', product: '헤어 앰플 볼륨업 테스트', desc: 'MCN이 기획/촬영/편집 100% 지원 (5:5)', msg: 'MCN 전사 지원 5:5 배분율. 2건 세트', price: 1000000, ratio: 0.5, month: '2026-03', s_status: 'pending', date: '2026-03-14' },
    { idx: 23, creator_id: getC(22), brand_id: getB(2), cat: '스킨케어', chan: 'youtube', sub: 'shorts', title: '성분 전문 리뷰 숏츠', product: '신생아용 초순수 더마 선크림', desc: '단가 정상, 3월 에스크로 진행중', msg: '업로드 완료, 브랜드 컨펌 대기', price: 2000000, ratio: 0.75, month: '2026-03', s_status: 'escrow', date: '2026-03-16' },
    { idx: 24, creator_id: getC(23), brand_id: getB(3), cat: '라이프', chan: 'instagram', sub: 'feed', title: '한복 커버 촬영 룩북', product: '보이브 SS 악세사리 (전통 컨셉)', desc: '한복+현대 악세사리 믹스매치', msg: '신인 6:4 비율 테스트', price: 800000, ratio: 0.6, month: '2026-03', s_status: 'pending', date: '2026-03-18' },
    { idx: 25, creator_id: getC(24), brand_id: getB(4), cat: '뷰티', chan: 'blog', sub: 'post', title: '집에서 혼자하는 봄꽃 네일', product: '벚꽃 컬렉션 시럽젤', desc: '상세 리뷰 포스팅 대기중', msg: '정상 진행 중', price: 500000, ratio: 0.7, month: '2026-03', s_status: 'pending', date: '2026-03-20' },
    { idx: 26, creator_id: getC(25), brand_id: getB(0), cat: '다이어트', chan: 'instagram', sub: 'reels', title: '유기농 간식 리뷰', product: '올리브영 유기농 맛밤 3박스', desc: '다이어터 야식 대용 릴스', msg: '지급 보류 (오류 테스트용 Escrow)', price: 1500000, ratio: 0.75, month: '2026-03', s_status: 'escrow', date: '2026-03-22' },
    { idx: 27, creator_id: getC(0), brand_id: getB(1), cat: '뷰티', chan: 'youtube', sub: 'long_form', title: '안티에이징 밤 사용기', product: '유스 링클 나이트 밤', desc: '초고화질 4K 촬영', msg: '정상 pending', price: 4000000, ratio: 0.8, month: '2026-03', s_status: 'pending', date: '2026-03-24' },
    { idx: 28, creator_id: getC(1), brand_id: getB(2), cat: '라이프', chan: 'tiktok', sub: 'short_form', title: '선스틱 ASMR 긁는 소리', product: '쿨링 선스틱', desc: '틱톡 맞춤형 소리/비주얼 중심', msg: '업로드 이틀 지연, 브랜드 항의 에스크로', price: 1200000, ratio: 0.65, month: '2026-03', s_status: 'escrow', date: '2026-03-26' },
    { idx: 29, creator_id: getC(2), brand_id: getB(3), cat: '패션', chan: 'youtube', sub: 'video_ppl', title: '보이브 가방 언박싱', product: '26SS 버킷백 블랙', desc: '기존 브이로그 안에 짧은 PPL 삽입', msg: '정상 pending', price: 2000000, ratio: 0.75, month: '2026-03', s_status: 'pending', date: '2026-03-28' },
    { idx: 30, creator_id: getC(3), brand_id: getB(4), cat: '뷰티', chan: 'instagram', sub: 'feed', title: '유리알 광택 네일 피드', product: '글래스 탑코트 3종', desc: '초저단가 제안 거절 (두번째)', msg: '20만원에 무리한 요구 거절', price: 200000, ratio: 0.5, month: '2026-03', s_status: 'rejected', date: '2026-03-30' },

    // === 2026-04 (사전 제안 및 선입금 완료 미래건, 10건) ===
    { idx: 31, creator_id: getC(4), brand_id: getB(0), cat: '뷰티', chan: 'instagram', sub: 'live', title: '[라이브 대기] 선대금 30% 선입금', product: '가정의 달 올리브영 빅세일 단독 라이브', desc: '4월 말 진행되는 쇼핑라이브 (1500만)', msg: '계약금 30% 입금 완료. 본방 대기중', price: 15000000, ratio: 0.85, month: '2026-04', s_status: 'pending', date: '2026-04-02' },
    { idx: 32, creator_id: getC(5), brand_id: getB(1), cat: '라이프', chan: 'youtube', sub: 'long_form', title: '어버이날 효도 여행 및 선물 언박싱', product: '유스 럭셔리 프리미엄 효 세트', desc: '호캉스 브이로그 내 PPL', msg: '4월 일정 조율 중. 촬영 전 선대금 Pending', price: 5500000, ratio: 0.8, month: '2026-04', s_status: 'pending', date: '2026-04-05' },
    { idx: 33, creator_id: getC(6), brand_id: getB(2), cat: '스포츠', chan: 'instagram', sub: 'reels', title: '초여름 바캉스 풀파티 룩 릴스', product: '워터프루프 선쿠션 빅사이즈', desc: '수영장 풀파티 방수 테스트', msg: '수영장 섭외비 포함 단가 (Pending)', price: 4000000, ratio: 0.75, month: '2026-04', s_status: 'pending', date: '2026-04-08' },
    { idx: 34, creator_id: getC(7), brand_id: getB(3), cat: '패션', chan: 'youtube', sub: 'long_form', title: '여름 린넨 컬렉션 미리보기 룩북', product: '보이브 얼리서머 린넨 코트', desc: '출시 전 미리 입어보는 얼리어답터 컨셉', msg: '제품 출시 일정 지연으로 촬영일정 홀딩 (Escrow)', price: 3500000, ratio: 0.8, month: '2026-04', s_status: 'escrow', date: '2026-04-11' },
    { idx: 35, creator_id: getC(8), brand_id: getB(4), cat: '뷰티', chan: 'tiktok', sub: 'short_form', title: '초여름 네온 컬러 젤네일', product: '네온 팝 아트 에디션', desc: '5월 페스티벌 타겟 튀는 네일', msg: '협의 진행 중 (제안 단계)', price: 1800000, ratio: 0.7, month: '2026-04', s_status: 'pending', date: '2026-04-14' },
    { idx: 36, creator_id: getC(9), brand_id: getB(0), cat: '뷰티', chan: 'blog', sub: 'post', title: '페스티벌 화장 꿀팁 성지 (취소)', product: '올리브영 페스티벌 키트', desc: '크리에이터 일정 문제로 취소 보상금 물어줌', msg: '아티스트 건강 문제로 계약 파기. 브랜드 측 위약금 지급 (Cancelled)', price: 2000000, ratio: 0.75, month: '2026-04', s_status: 'cancelled', date: '2026-04-17' },
    { idx: 37, creator_id: getC(10), brand_id: getB(1), cat: '일상', chan: 'youtube', sub: 'shorts', title: '출근길 아침 5분 부기 싹 나이트크림', product: '유스 릴렉싱 부기 앰플', desc: '출근 브이로그 숏폼', msg: '에스크로(선입금 완료)', price: 3000000, ratio: 0.8, month: '2026-04', s_status: 'escrow', date: '2026-04-20' },
    { idx: 38, creator_id: getC(11), brand_id: getB(2), cat: '패션', chan: 'instagram', sub: 'feed', title: '초간단 무기자차 백탁 잡기 챌린지', product: '더마 무기자차 톤업 앰플', desc: '백탁 활용 톤업 크림처럼 쓰기', msg: '거절 처리 (모델 이미지 안맞음)', price: 1000000, ratio: 0.65, month: '2026-04', s_status: 'rejected', date: '2026-04-23' },
    { idx: 39, creator_id: getC(12), brand_id: getB(3), cat: '스포츠', chan: 'youtube', sub: 'video_ppl', title: '서핑 여행 룩북 중간 PPL', product: '보이브 서퍼 비치웨어 래쉬가드', desc: '양양 서핑 트립 VLOG', msg: '비치웨어 촬영 대기', price: 4500000, ratio: 0.85, month: '2026-04', s_status: 'pending', date: '2026-04-26' },
    { idx: 40, creator_id: getC(13), brand_id: getB(4), cat: '라이프', chan: 'instagram', sub: 'reels', title: '셀프 패디큐어 전격 가이드', product: '프리미엄 젤스티커 발 패키지', desc: '샌들 계절 대비 패디큐어 준비 릴스', msg: '계약 대기 상태', price: 2200000, ratio: 0.75, month: '2026-04', s_status: 'pending', date: '2026-04-29' },
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
    console.log(`🚀 MCN ERP 시나리오용 40건 극단적 데모 생성 시작... `)
    console.log(`======================================================\n`)

    // 1. 기존 데이터 전체 스위핑 (모든 creator_id 대상)
    console.log('🗑️  기존 MCN 데이터 클리닝 중 (settlements -> workspaces -> moments)...')
    await sb.from('settlements').delete().eq('team_id', TEAM_ID)

    // 외래키 무결성을 위해 moment_proposals를 null로 먼저 풀고 지움
    const { data: wsData } = await sb.from('workspaces').select('id')
    const wsIds = wsData?.map(w => w.id) || []
    if (wsIds.length) {
        // ad_contest_applications (fk) cascade 삭제
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

    // 2. 40건 연속 주입
    for (const row of RAW_DATA) {
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
            console.log(`[${String(row.idx).padStart(2, '0')}/40] 🛑 [거절됨] ₩${row.price.toLocaleString()} — ${row.title}`)
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
            console.log(`[${String(row.idx).padStart(2, '0')}/40] ${icon} [${row.month}] ₩${row.price.toLocaleString().padStart(10, ' ')} (${row.ratio * 10}:MCN) — ${row.title}`)
        }
    }

    // 3. mcn_revenue_splits
    const splits = C_IDS.map((id, index) => {
        // 배분율 5:5부터 9:1까지 다양하게 세팅
        const r = [0.8, 0.75, 0.7, 0.6, 0.9, 0.5][index % 6]
        return { team_id: TEAM_ID, creator_id: id, split_ratio: r }
    })
    const { error: splitErr } = await sb.from('mcn_revenue_splits').upsert(splits, { onConflict: 'team_id,creator_id' })
    if (splitErr) console.warn('⚠️  배분율 UPSERT 실패:', splitErr.message)
    else console.log('\n✅ 26명 전원 배분율(50%~90%) 무작위 설정 완료')

    console.log(`\n🎉 40건 프리미엄 데이터 생성 완벽 종료. 앱에서 MCN ERP 대시보드를 확인하세요.`)
}

main().catch(console.error)
