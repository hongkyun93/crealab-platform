/**
 * seed-mock-collabs.ts
 * 
 * 23명의 가라 크리에이터 각각에 대해 2026년 3~4월 일정의 "광고 구인용" life_moments 생성.
 * 크리에이터당 최소 2개씩(총 46개 이상) 생성하여 대시보드 캘린더를 풍성하게 채움.
 * 크리에이터가 예정된 플랜(여행, 이사, 바디프로필 등)을 올리고 협찬/광고를 제안받는 내용을 초현실적으로 작성.
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(__dirname, '..', '.env.local') })

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const BRAND_EMAILS = {
    sizesup: 'cs@plussize.styleup.kr',
    denim8: 'brand@denim8factory.kr',
    vintage: 'hello@vntagecollect.com',
    atelier: 'brand@ateliermuji.kr',
    knit: 'hello@knitwear.haneul.kr',
    amore: 'marketing@amore-youthlab.kr',
    perfume: 'hello@perfumehouse108.com',
    cellderma: 'brand@cellderma.co.kr',
    innis: 'contact@innismekorea.com',
    sunscreen: 'info@sunscreenlab.kr',
    hairlab: 'cs@hairlab.seoul',
    protein: 'cs@proteinbar.kr',
    athleisure: 'brand@athleisurelab.com',
    cleanvit: 'hello@cleanvitamin.kr',
    hanbok: 'brand@hanbokcouture.com',
    jeju: 'info@orgnatrue.jeju.kr',
    nail: 'partner@nailstudio-n.com',
    homecafe: 'hello@homecafe.brand.kr',
    greenroom: 'cs@greenroom.interior.kr'
}

// 총 46개 모먼트 (크리에이터당 2개씩 분배, 날짜와 내용, 제안 브랜드를 다채롭게 구성)
const COLLABS = [
    // 1. narae.plus_size
    { handle: 'narae.plus_size', title: '🌸 봄맞이 플러스사이즈 하객룩 3선 기획 🌸', date: '2026-03-22', brandEmail: BRAND_EMAILS.sizesup, price: 900000, state: 'in_progress', cat: 'fashion', desc: "다가오는 4월 결혼식 시즌을 맞이하여 77~99 사이즈 구독자분들이 가장 많이 요청해주신 '체형 커버 완벽 하객룩' 콘텐츠를 기획 중입니다. 원피스, 셋업 수트 등 포멀한 의류 브랜드의 협찬 및 단기 광고를 기다립니다." },
    { handle: 'narae.plus_size', title: '✈️ 후쿠오카 2박3일 빅사이즈 로맨틱 여행룩', date: '2026-04-18', brandEmail: BRAND_EMAILS.knit, price: 950000, state: 'offered', cat: 'fashion', desc: "4월 중순 후쿠오카 여행을 갑니다! 체형 커버되면서도 사진 예쁘게 나오는 플로럴 원피스나 니트가디건류, 캐주얼 페미닌 브랜드 제안 받습니다!" },

    // 2. doyun.mens
    { handle: 'doyun.mens', title: '☕️ 성수동 주말 데이트 남친룩 브이로그', date: '2026-04-05', brandEmail: BRAND_EMAILS.denim8, price: 750000, state: 'offered', cat: 'fashion', desc: "4월 첫째 주 주말, 여자친구와 성수동 팝업스토어 데이트 룩. 자연스러운 캐주얼/미니멀 브랜드 룩(아우터, 셔츠, 슬랙스 메인)을 찾습니다." },
    { handle: 'doyun.mens', title: '🎸 시티보이룩 1주일 코디 완성', date: '2026-03-12', brandEmail: BRAND_EMAILS.vintage, price: 700000, state: 'completed', cat: 'fashion', desc: "트렌디한 시티보이 스타일로 1주일 룩북 영상을 찍을 예정입니다. 워크 자켓, 오버핏 셔츠, 와이드 데님팬츠 협찬 적극 환영합니다." },

    // 3. subin_ootd.kr
    { handle: 'subin_ootd.kr', title: '🎧 홍대 Y2K 감성 카페 투어룩', date: '2026-03-10', brandEmail: BRAND_EMAILS.vintage, price: 700000, state: 'completed', cat: 'fashion', desc: "빈티지하고 힙한 무드의 홍대/합정 카페 투어 릴스 촬영 예정입니다. 1020 타겟의 스트릿 룩, 실버 액세서리 협업 환영!" },
    { handle: 'subin_ootd.kr', title: '📸 DDP 패션위크 룩북 스트릿 스냅', date: '2026-04-20', brandEmail: BRAND_EMAILS.denim8, price: 800000, state: 'in_progress', cat: 'fashion', desc: "DDP에서 힙한 스트릿 스냅을 찍을 컨셉입니다. 선글라스, 청크한 스니커즈, 와이드 팬츠 브랜드 광고 구합니다!" },

    // 4. taehee.closet
    { handle: 'taehee.closet', title: '🏢 1주일 직장인 출근룩 OOTD 챌린지', date: '2026-03-25', brandEmail: BRAND_EMAILS.atelier, price: 1100000, state: 'in_progress', cat: 'fashion', desc: "오피스 상권 한복판에서 촬영하는 리얼 직장인 5일 출근룩! 2030 여성 타겟으로 활동성 좋고 구김 안 가는 오피스룩 제안받습니다." },
    { handle: 'taehee.closet', title: '🌷 팀 회식 & 금요일 퇴근길 감성룩', date: '2026-04-12', brandEmail: BRAND_EMAILS.knit, price: 1050000, state: 'offered', cat: 'fashion', desc: "불금을 보내는 직장인의 꾸안꾸 퇴근룩 & 회식룩. 세련된 카디건, 실크 블라우스, 로퍼 하우스 브랜드 제안 기다립니다." },

    // 5. haneul.knit
    { handle: 'haneul.knit', title: '🌼 제주도 유채꽃 여행 감성 룩북', date: '2026-04-18', brandEmail: BRAND_EMAILS.knit, price: 750000, state: 'offered', cat: 'fashion', desc: "가족들과 4월 중순 제주도 봄꽃 나들이를 떠납니다. 제주의 따뜻한 색감과 어울리는 니트, 원피스류 환영합니다." },
    { handle: 'haneul.knit', title: '🧶 첫 공방 클래스 오픈! 단아한 강사룩', date: '2026-03-08', brandEmail: BRAND_EMAILS.atelier, price: 700000, state: 'completed', cat: 'fashion', desc: "니팅 클래스를 진행하는 날, 프로페셔널하지만 부드러운 인상을 주는 뉴트럴톤 치마/슬랙스/투피스 셋업 광고 원합니다." },

    // 6. harin.vntg
    { handle: 'harin.vntg', title: '🛹 성수 빈티지샵 하울 & 코디', date: '2026-03-12', brandEmail: BRAND_EMAILS.vintage, price: 800000, state: 'completed', cat: 'fashion', desc: "성수동 빈티지샵 하울 아이템들과 함께 믹스매치할 트렌디한 브랜드 아이템(고프코어, 그런지룩)을 찾습니다." },
    { handle: 'harin.vntg', title: '🎸 락페스티벌 느낌 페스티벌 룩북', date: '2026-04-28', brandEmail: BRAND_EMAILS.denim8, price: 900000, state: 'offered', cat: 'fashion', desc: "올해 첫 야외 페스티벌 시즌! 가죽자켓, 그래픽 티셔츠, 카고팬츠 등 스트릿 무드의 액티브 의류 협업 기다려요." },

    // 7. seoyeon.skin
    { handle: 'seoyeon.skin', title: '🚨 봄 환절기 대참사 극복! 스킨케어 루틴', date: '2026-03-20', brandEmail: BRAND_EMAILS.amore, price: 850000, state: 'in_progress', cat: 'beauty', desc: "꽃가루로 뒤집어지는 피부 진정 루틴. 시카, 판테놀 성분의 더마 코스메틱 에센스/크림 브랜디드 제안을 기다립니다!" },
    { handle: 'seoyeon.skin', title: '💧 인생 물광템 비교 리뷰 실험', date: '2026-04-10', brandEmail: BRAND_EMAILS.cellderma, price: 950000, state: 'offered', cat: 'beauty', desc: "속건조 잡는 수분 앰플, 마스크팩 3주간 꼼꼼하게 테스트할 분량입니다. 성분 자신 있는 제품으로 연락주세요." },

    // 8. seohyun.parfum
    { handle: 'seohyun.parfum', title: '💐 벚꽃 피는 봄에 어울리는 인생 향수 TOP 3', date: '2026-04-12', brandEmail: BRAND_EMAILS.perfume, price: 950000, state: 'offered', cat: 'beauty', desc: "벚꽃 분위기의 플로럴/시트러스 계열 니치 향수나 바디워시 스폰서십을 찾습니다. 글로 읽기만 해도 향이 느껴지게 만들게요." },
    { handle: 'seohyun.parfum', title: '🌙 나이트 릴렉싱 샤워 & 바디케어', date: '2026-03-15', brandEmail: BRAND_EMAILS.hairlab, price: 850000, state: 'completed', cat: 'beauty', desc: "잠수타듯 푹 쉬고 싶은 밤. 아로마 바디워시, 바디스크럽, 입욕제 등 향기 위주의 테라피 제품 제안 부탁드려요." },

    // 9. somi.skinlab
    { handle: 'somi.skinlab', title: '🏥 피부과 안 가도 되는 프리미엄 홈케어', date: '2026-03-28', brandEmail: BRAND_EMAILS.cellderma, price: 1500000, state: 'in_progress', cat: 'beauty', desc: "집에서 리프팅 효과 내는 뷰티 디바이스와 고기능성 앰플 특집 릴스입니다. 저만의 활용 꿀팁 듬뿍 담아 제작합니다." },
    { handle: 'somi.skinlab', title: '🛡️ 봄 자외선 완벽 방어 선크림 비교', date: '2026-04-05', brandEmail: BRAND_EMAILS.sunscreen, price: 1400000, state: 'in_progress', cat: 'beauty', desc: "강해지는 봄볕 대비 선크림/선스틱 리뷰. 백탁 없고 화장 안 밀리는 제품에 한정하여 단기 계약 진행합니다." },

    // 10. sua.cosmetics
    { handle: 'sua.cosmetics', title: '💄 쿨톤병 완치! 100% 성공하는 봄 웜 메이크업', date: '2026-03-05', brandEmail: BRAND_EMAILS.innis, price: 700000, state: 'completed', cat: 'beauty', desc: "봄 신상 코랄/봄웜 블러셔, 립틴트, 팔레트 협찬 원합니다. 발색 샷 진짜 장인처럼 예쁘게 찍어드릴게요." },
    { handle: 'sua.cosmetics', title: '✨ 데일리 글리터 & 애교살 포인트룩', date: '2026-04-19', brandEmail: BRAND_EMAILS.innis, price: 750000, state: 'offered', cat: 'beauty', desc: "10대들의 워너비 애교살 글리터 메이크업! 화사하고 영롱한 글리터 섀도우, 아이라이너 브랜드 캠페인 기다립니다." },

    // 11. yuna.makeup_art
    { handle: 'yuna.makeup_art', title: '🖤 걸크러쉬 쎈언니 스모키 메이크업', date: '2026-04-20', brandEmail: BRAND_EMAILS.innis, price: 1200000, state: 'offered', cat: 'beauty', desc: "발색력 엄청나고 지속력 좋은 워터프루프 라인, 글리터, 쉐딩 제품을 메인으로 한 페스티벌 메이크업 영상." },
    { handle: 'yuna.makeup_art', title: '🎭 컨투어링 & 하이라이팅 입체 메이크업', date: '2026-03-22', brandEmail: BRAND_EMAILS.amore, price: 1100000, state: 'in_progress', cat: 'beauty', desc: "얼굴형 완전 작아지는 마법의 쉐딩 & 치크 스틱 브랜디드 영상. 자연스러운 음영 메이크업 아이템 환영합니다." },

    // 12. jeonga.clinic
    { handle: 'jeonga.clinic', title: '✨ 시술 후 필수! 2주간 재생 관리 꿀팁', date: '2026-03-24', brandEmail: BRAND_EMAILS.sunscreen, price: 1100000, state: 'in_progress', cat: 'beauty', desc: "레이저 토닝 직후 피부 얇아졌을 때 써도 절대 안 따가운 진짜 순한 무기자차 선크림, 재생크림 기다립니다. (EGF 우대)" },
    { handle: 'jeonga.clinic', title: '🧊 얼음 마사지 & 붓기 싹 빼는 아침루틴', date: '2026-04-14', brandEmail: BRAND_EMAILS.cellderma, price: 1200000, state: 'offered', cat: 'beauty', desc: "촬영 전날 과식했을 때 하는 붓기 관리법. 쿨링 롤러, 패드, 마스크팩 류 브랜드 제안 기다립니다." },

    // 13. chaerin.glow
    { handle: 'chaerin.glow', title: '💦 베이스 메이크업 무너짐 방지 지속력 실험', date: '2026-03-15', brandEmail: BRAND_EMAILS.cellderma, price: 900000, state: 'completed', cat: 'beauty', desc: "아침부터 밤 10시까지 픽서 뿌렸을 때와 안 뿌렸을 때 반반 바르고 하루종일 추적하는 반반 메이크업 실험 영상을 찍을 예정입니다." },
    { handle: 'chaerin.glow', title: '✨ 유리알 광택 립글로스 전색상 발색', date: '2026-04-02', brandEmail: BRAND_EMAILS.innis, price: 850000, state: 'offered', cat: 'beauty', desc: "촉촉립의 최강자 가리기! 올봄 신상 글로이/오일 틴트 전색상 리뷰를 기획 중입니다! 뷰티 브랜드 적극 컨택 바랍니다." },

    // 14. haeun.beauty.log
    { handle: 'haeun.beauty.log', title: '🥂 5성급 호텔 호캉스 여배우 나이트 케어', date: '2026-04-03', brandEmail: BRAND_EMAILS.hairlab, price: 2000000, state: 'offered', cat: 'beauty', desc: "시그니엘 프리미어룸 숙박 예정입니다. 대리석 욕실과 한강 야경을 배경으로 고급스러운 스파 루틴 촬영합니다. 프리미엄 헤어 오일/스크럽 연락 주세요." },
    { handle: 'haeun.beauty.log', title: '💼 백화점 VIP 라운지 & 쇼핑 데이 GRWM', date: '2026-03-18', brandEmail: BRAND_EMAILS.perfume, price: 2100000, state: 'in_progress', cat: 'beauty', desc: "우아한 럭셔리 라이프스타일! 나갈 때 뿌리는 고급 니치 향수, 퍼퓸 핸드크림 메인으로 브이로그 진행합니다." },

    // 15. soyul.diet
    { handle: 'soyul.diet', title: '🥗 다이어트 정체기 돌파 3일 식단 브이로그', date: '2026-03-20', brandEmail: BRAND_EMAILS.protein, price: 850000, state: 'in_progress', cat: 'fitness', desc: "저당, 고단백, 대체당 간식이나 포만감 높은 프로틴 쉐이크 브랜드 PPL 구합니다. 영양성분 분석까지 싹 해드립니다." },
    { handle: 'soyul.diet', title: '🚴‍♀️ 따릉이 타고 한강 런데이! 운동 기록', date: '2026-04-16', brandEmail: BRAND_EMAILS.cleanvit, price: 900000, state: 'offered', cat: 'fitness', desc: "운동 나갈 때 꼭 챙겨먹는 부스터 에너지 음료/비타민/아르기닌 제품! 눈에 확 들어오는 활동적인 영상미 보장합니다." },

    // 16. seunga.sporty
    { handle: 'seunga.sporty', title: '💪 바디프로필 D-30 빡센 하체 운동 루틴', date: '2026-04-10', brandEmail: BRAND_EMAILS.athleisure, price: 1000000, state: 'offered', cat: 'fitness', desc: "헬스장에서 스쿼트, 런지 도는 영상. Y존 부각 없고 땀흡수 잘 되는 애슬레저룩(레깅스, 브라탑) 협찬 부탁드립니다!" },
    { handle: 'seunga.sporty', title: '📸 바디프로필 촬영 당일 브이로그', date: '2026-04-25', brandEmail: BRAND_EMAILS.protein, price: 1200000, state: 'offered', cat: 'fitness', desc: "촬영 당일 수분 조절, 직전 펌핑, 그리고 끝난 후 먹는 식사! 다이어터 보상용 맛있는 닭가슴살 볶음밥 연락주세요." },

    // 17. chaeun.detox
    { handle: 'chaeun.detox', title: '💊 올리브영 털이! 봄맞이 이너뷰티 영양제', date: '2026-03-26', brandEmail: BRAND_EMAILS.cleanvit, price: 700000, state: 'in_progress', cat: 'fitness', desc: "푸룬주스, 콤부차, 유산균, 효소 등 디톡스와 장건강에 도움되는 브랜드 제안주세요. 진짜 눈바디 변화 찍어드립니다." },
    { handle: 'chaeun.detox', title: '🧘‍♀️ 퇴근 후 힐링 홈요가 루틴', date: '2026-03-10', brandEmail: BRAND_EMAILS.athleisure, price: 700000, state: 'completed', cat: 'fitness', desc: "하루 피로를 날려주는 홈트레이닝 요가! 방음 매트, 마사지 폼롤러, 편안한 요가복 브랜디드 제안 받습니다." },

    // 18. minkyung.hair
    { handle: 'minkyung.hair', title: '💆‍♀️ 봄철 두피 열감 싹 내리는 비법', date: '2026-03-08', brandEmail: BRAND_EMAILS.hairlab, price: 800000, state: 'completed', cat: 'beauty', desc: "두피 스케일링 컨텐츠입니다. 쿨링감 좋은 샴푸나 두피 팩 찾고 있습니다. 비포애프터 확대해서 깔끔하게 촬영합니다." },
    { handle: 'minkyung.hair', title: '✂️ 단발병 퇴치! 아이돌 똥머리 스타일링', date: '2026-04-11', brandEmail: BRAND_EMAILS.hairlab, price: 900000, state: 'offered', cat: 'beauty', desc: "셀프 헤어 스타일링 시 잔머리를 깔끔하게 고정해 주는 헤어 에센스, 스프레이, 혹은 고데기 기기 제품 제안 주세요!" },

    // 19. soi.hanbok
    { handle: 'soi.hanbok', title: '🏯 전주 한옥마을 당일치기 생활한복 스냅', date: '2026-04-15', brandEmail: BRAND_EMAILS.hanbok, price: 700000, state: 'offered', cat: 'lifestyle', desc: "전주 한옥마을 컨셉 스냅 촬영! 현대식으로 영하게 재해석된 생활한복, 장신구 관련 브랜드들 연락 기다립니다. 릴스로 남깁니다." },
    { handle: 'soi.hanbok', title: '🍵 비오는 봄날, 다도(茶道) 힐링 타임', date: '2026-03-24', brandEmail: BRAND_EMAILS.homecafe, price: 750000, state: 'in_progress', cat: 'lifestyle', desc: "집에서 차를 내리고 책을 읽는 VLOG. 전통 다과, 블렌딩 티, 혹은 작가 도자기 티팟 브랜드들의 스폰서를 구합니다." },

    // 20. yerim.organic
    { handle: 'yerim.organic', title: '🍊 제주도 귤밭 오두막 한달살기 시작', date: '2026-03-14', brandEmail: BRAND_EMAILS.jeju, price: 700000, state: 'completed', cat: 'lifestyle', desc: "제주 시골집 무해한 한달살기! 수제 잼, 유기농 식음료, 친환경 비누 등 소규모 브랜드 제품을 소박하게 영상에 녹여드려요." },
    { handle: 'yerim.organic', title: '🧺 제로웨이스트 피크닉 짐싸기', date: '2026-04-20', brandEmail: BRAND_EMAILS.greenroom, price: 800000, state: 'offered', cat: 'lifestyle', desc: "봄맞이 친환경 소풍 브이로그. 다회용기, 에코백, 우드 식기류 등 에코 프렌들리 리빙 브랜드들의 제안을 환영합니다!" },

    // 21. yejin.nails_
    { handle: 'yejin.nails_', title: '💅 집에서 샵 퀄리티? 봄 신상 셀프 네일', date: '2026-03-29', brandEmail: BRAND_EMAILS.nail, price: 750000, state: 'in_progress', cat: 'beauty', desc: "파스텔톤 시럽네일 기획! 반경화 젤네일 파츠, 젤램프, 큐티클 오일 류 등 네일 케어 용품 협찬/단기 광고 환영." },
    { handle: 'yejin.nails_', title: '🦶 여름 필수! 발각질 케어 및 패디큐어', date: '2026-04-22', brandEmail: BRAND_EMAILS.nail, price: 800000, state: 'offered', cat: 'beauty', desc: "슬리퍼 신기 전 미리 하는 발 관리 꿀팁과 패디큐어 스티커 제품 소개 영상 기획 중입니다!" },

    // 22. jimin.homecafe
    { handle: 'jimin.homecafe', title: '🥞 주말 아침 여유로운 홈카페 브런치', date: '2026-04-05', brandEmail: BRAND_EMAILS.homecafe, price: 900000, state: 'offered', cat: 'lifestyle', desc: "일요일 아침 식사 브이로그. 퀄리티 좋은 원두, 드립퍼나 감성 플레이팅이 가능한 글라스 웨어 리빙 브랜드 제안주세요." },
    { handle: 'jimin.homecafe', title: '🍓 봄 제철 딸기로 수제청 만들기', date: '2026-03-12', brandEmail: BRAND_EMAILS.jeju, price: 800000, state: 'completed', cat: 'lifestyle', desc: "딸기청을 담그며 소통하는 영상. 수제청과 곁들이면 좋은 탄산수, 티 디저트, 도마/칼 등 주방 용품 PPL 기다립니다." },

    // 23. jia.luxury_life
    { handle: 'jia.luxury_life', title: '🍾 새로 이사한 한강뷰 아파트 랜선 집들이 & 홈파티', date: '2026-03-21', brandEmail: BRAND_EMAILS.greenroom, price: 2500000, state: 'in_progress', cat: 'lifestyle', desc: "한강뷰 리모델링 끝나고 친구들 초대하는 홈파티 브이로그! 대형 플랜테리어 식물, 홈 데코, 인테리어 조명 프리미엄 브랜드 제안주세요." },
    { handle: 'jia.luxury_life', title: '⛳️ 봄 라운딩! 프리미엄 골프웨어 코디', date: '2026-04-10', brandEmail: BRAND_EMAILS.athleisure, price: 2300000, state: 'offered', cat: 'lifestyle', desc: "4월 골프장 첫 필드 나갑니다. 클래식하고 고급스러운 골프웨어, 골프 용품, 모자 브랜드 제안 기다립니다. 핏 미쳤습니다!" },
]

async function main() {
    console.log('🚀 3-4월 다채로운 46개 모먼트 & 협업 제안 볼륨업 시딩 시작...\n')

    const { data: creators, error: cErr } = await supabase
        .from('profiles')
        .select('id, email')
        .eq('role', 'creator')
        .eq('is_mock', true)

    if (cErr || !creators) throw new Error('크리에이터 조회 실패: ' + cErr?.message)

    console.log('팀 맵핑 수집중...')
    // 크리에이터의 MCN team_id 가져오기 (MCN 대시보드 노출용)
    const { data: teamMembers } = await supabase
        .from('team_members')
        .select('user_id, team_id')
        .in('user_id', creators.map(c => c.id))

    const creatorTeamMap = new Map()
    teamMembers?.forEach(tm => {
        creatorTeamMap.set(tm.user_id, tm.team_id)
    })

    const { data: brands, error: bErr } = await supabase
        .from('profiles')
        .select('id, email, display_name')
        .eq('role', 'brand')
        .eq('is_mock', true)


    if (bErr || !brands) throw new Error('브랜드 조회 실패: ' + bErr?.message)

    console.log('데이터 삽입 대기중...\n')

    // 1. mock life_moments 들의 ID를 먼저 가져옵니다.
    const { data: mockMoments } = await supabase.from('life_moments').select('id').eq('is_mock', true)

    if (mockMoments && mockMoments.length > 0) {
        const momentIds = mockMoments.map(m => m.id)

        // 2. 해당 모먼트와 연결된 moment_proposals를 지웁니다.
        // 배열을 50개씩 잘라서 삭제 (Supabase in 구문 한도 고려)
        for (let i = 0; i < momentIds.length; i += 50) {
            const chunk = momentIds.slice(i, i + 50)
            await supabase.from('moment_proposals').delete().in('moment_id', chunk)
            await supabase.from('life_moments').delete().in('id', chunk)
        }
        console.log(`🗑️ 기존 mock 레거시 데이터(${momentIds.length}개) 완벽 삭제 완료\n`)
    } else {
        console.log('🗑️ 삭제할 기존 mock 모먼트가 존재하지 않습니다.\n')
    }

    let mCount = 0
    let pCount = 0

    // 셔플된 COLLABS 풀 생성
    const collabPool = [...COLLABS]
    for (let i = collabPool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [collabPool[i], collabPool[j]] = [collabPool[j], collabPool[i]];
    }

    const now = new Date()

    for (const creator of creators) {
        let numMoments = 0
        const rand = Math.random()
        if (rand < 0.1) numMoments = 0
        else if (rand < 0.4) numMoments = 1
        else if (rand < 0.7) numMoments = 2
        else if (rand < 0.9) numMoments = 3
        else numMoments = 4

        const teamId = creatorTeamMap.get(creator.id) || null

        for (let i = 0; i < numMoments; i++) {
            let collab = collabPool.pop()
            if (!collab) {
                // 풀이 비었으면 다시 랜덤 추출
                collab = COLLABS[Math.floor(Math.random() * COLLABS.length)]
            }

            const brand = brands.find(b => b.email === collab.brandEmail)
            if (!brand) continue

            const { data: products } = await supabase
                .from('brand_products')
                .select('*')
                .eq('brand_id', brand.id)
                .limit(3)

            const product = products?.[Math.floor(Math.random() * (products.length || 1))] || products?.[0]

            const daysAgo = Math.floor(Math.random() * 20)
            const randomHours = Math.floor(Math.random() * 24)
            const randomMinutes = Math.floor(Math.random() * 60)

            const createdDate = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000) - (randomHours * 60 * 60 * 1000) - (randomMinutes * 60 * 1000))

            // life_moments 생성
            const { data: moment, error: momentErr } = await supabase
                .from('life_moments')
                .insert({
                    creator_id: creator.id,
                    team_id: teamId,
                    title: collab.title,
                    description: collab.desc,
                    moment_start_date: collab.date,
                    moment_end_date: collab.date,
                    category: collab.cat,
                    is_mock: true,
                    status: 'recruiting',
                    created_at: createdDate.toISOString(),
                    updated_at: createdDate.toISOString()
                })
                .select()
                .single()

            if (momentErr || !moment) {
                console.error(`  ❌ 모먼트 생성 실패:`, momentErr?.message)
                continue
            }
            mCount++

            let pStatus = collab.state
            if (pStatus === 'in_progress') pStatus = 'accepted'

            const dateObj = new Date(collab.date)
            const conditions = {
                priceOffer: collab.price,
                productName: product?.name || '샘플 제품',
                contentType: '리뷰 영상',
                deadline: dateObj.toISOString(),
                isMock: true
            }

            let brandMsg = `안녕하세요! 저희 ${brand.display_name} 마케팅팀입니다.\n크리에이터님께서 올려주신 [${collab.title}] 기획을 너무 재밌게 봤습니다! 저희 주력 제품과 컨셉이 완벽하게 맞아서 콜라보 제안드립니다.`
            if (pStatus === 'completed') {
                brandMsg = `저희 이번 봄 시즌 신제품 캠페인에 ${brand.display_name} 앰배서더로 함께 해주시면 어떨까 하여 연락드렸습니다. 제안서 검토 부탁드립니다!`
            }

            const { data: proposal, error: propErr } = await supabase
                .from('moment_proposals')
                .insert({
                    brand_id: brand.id,
                    creator_id: creator.id,
                    creator_team_id: teamId, // MCN Dashboard RLS Bypass mapping
                    moment_id: moment.id,
                    product_id: product?.id || null,
                    status: pStatus,
                    message: brandMsg,
                    conditions: conditions,
                    created_at: createdDate.toISOString(),
                    updated_at: createdDate.toISOString()
                })
                .select()
                .single()

            if (propErr || !proposal) {
                console.error(`  ❌ 제안 생성 실패:`, propErr?.message)
                continue
            }
            pCount++
            console.log(`  ✅ [${creator.email.split('@')[0]}] ${pStatus.padEnd(10)} | ${brand.display_name}`)

            if (pStatus === 'accepted' || pStatus === 'completed') {
                const wsData = {
                    creator_id: creator.id,
                    brand_id: brand.id,
                    original_proposal_type: 'moment_proposal',
                    original_proposal_id: proposal.id,
                    project_title: collab.title,
                    product_name: product?.name || '샘플 제품',
                    price_offer: collab.price,
                    status: 'active',
                    contract_status: 'none',
                    delivery_status: 'pending',
                    content_submission_status: 'pending',
                    created_at: createdDate.toISOString(),
                    updated_at: createdDate.toISOString()
                }
                const { data: ws, error: wsErr } = await supabase
                    .from('workspaces')
                    .insert(wsData)
                    .select()
                    .single()

                if (wsErr) {
                    console.error('  ❌ 워크스페이스 생성 실패:', wsErr.message)
                } else {
                    await supabase.from('moment_proposals').update({ workspace_id: ws.id }).eq('id', proposal.id)
                }
            }
        }
    }

    console.log(`\n🎉 완료! 다채로운 모먼트 ${mCount}개, 제안 ${pCount}개 업데이트 완료. (랜덤 배정)`)
}

main().catch(console.error)
