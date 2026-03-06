/**
 * seed-60-brand-products.ts
 * 
 * 20개 브랜드에 대해 각각 3개씩(총 60개)의 현실적인 가라 제품을 
 * brand_products 테이블에 등록합니다.
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(__dirname, '..', '.env.local') })

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// 20개 브랜드 이메일 (seed-20-brands.ts 와 동일)
const BRANDS_EMAILS = [
    'marketing@amore-youthlab.kr', 'contact@innismekorea.com', 'brand@cellderma.co.kr',
    'hello@perfumehouse108.com', 'cs@hairlab.seoul', 'partner@nailstudio-n.com',
    'info@sunscreenlab.kr', 'brand@ateliermuji.kr', 'hello@vntagecollect.com',
    'cs@plussize.styleup.kr', 'brand@denim8factory.kr', 'hello@knitwear.haneul.kr',
    'cs@proteinbar.kr', 'brand@athleisurelab.com', 'hello@cleanvitamin.kr',
    'brand@fitnessplanner.kr', 'hello@homecafe.brand.kr', 'brand@hanbokcouture.com',
    'cs@greenroom.interior.kr', 'info@orgnatrue.jeju.kr'
]

// 20개 브랜드별 3개의 제품 데이터
const PRODUCTS = [
    // 1. 아모레 유스랩
    [
        { name: '유스랩 세라마이드 시카 크림 50ml', desc: '손상된 피부 장벽을 리페어하는 고농축 시카 크림.', price: 32000, cat: '스킨케어', tag: ['진정', '시카'], img: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400' },
        { name: '글로우 펩타이드 토너 패드 (70매)', desc: '간편하게 닦아내는 데일리 각질 케어 & 수분 충전 패드.', price: 24000, cat: '스킨케어', tag: ['토너패드', '수분'], img: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400' },
        { name: '비타C 15% 앰플 30ml', desc: '순수 비타민C 15% 함유. 안색 개선과 잡티 케어 전용 앰플.', price: 45000, cat: '앰플/세럼', tag: ['비타민C', '미백'], img: 'https://images.unsplash.com/photo-1629198688000-71f23e745b6e?w=400' }
    ],
    // 2. 이니스미 코리아
    [
        { name: '베일 매트 립스틱 (전 12컬러)', desc: '공기처럼 가볍게 밀착되는 포그 매트 립스틱.', price: 22000, cat: '메이크업', tag: ['립스틱', '매트립'], img: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400' },
        { name: '수분 픽싱 쿠션 기획세트 (본품+리필)', desc: '시간이 지나도 무너짐 없는 초밀착 수분 광채 쿠션.', price: 34000, cat: '베이스', tag: ['쿠션', '광채'], img: 'https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?w=400' },
        { name: '마스카라 볼륨 & 멀티프루프', desc: '물과 땀에 강한 초강력 볼륨 마스카라.', price: 18000, cat: '아이메이크업', tag: ['마스카라', '강력고정'], img: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400' }
    ],
    // 3. 셀더마 스킨랩
    [
        { name: '이엑스 리페어 앰플 50ml', desc: 'EGF 배합으로 피부 자생력을 높이는 병원 전용 앰플.', price: 68000, cat: '스킨케어', tag: ['리페어', 'EGF'], img: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=400' },
        { name: '더마 클린 마일드 폼 클렌저 150ml', desc: '약산성으로 민감 피부도 안심하고 사용하는 저자극 세안제.', price: 19000, cat: '클렌징', tag: ['약산성', '저자극'], img: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=400' },
        { name: '히알루론 워터 드롭 크림 100ml', desc: '바르는 순간 물방울이 터지는 대용량 수분 폭탄 크림.', price: 38000, cat: '크림', tag: ['수분폭탄', '대용량'], img: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=400' }
    ],
    // 4. 퍼퓸하우스 108
    [
        { name: '니치퍼퓸 [서울 포레스트] 50ml', desc: '도심 속 서울숲의 새벽 공기를 담은 우디 시트러스 향.', price: 78000, cat: '향수', tag: ['우디', '니치향수'], img: 'https://images.unsplash.com/photo-1563170351-be82bc888aa4?w=400' },
        { name: '퍼퓸 핸드크림 [제주 탠저린] 40ml', desc: '제주 감귤의 상큼함이 은은하게 남는 시그니처 핸드크림.', price: 21000, cat: '바디케어', tag: ['핸드크림', '제주감귤'], img: 'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=400' },
        { name: '프리미엄 룸 스프레이 [미드나잇 오드] 100ml', desc: '침구나 공간에 뿌리는 깊고 관능적인 오드 우드 룸스프레이.', price: 42000, cat: '프래그런스', tag: ['룸스프레이', '우디향'], img: 'https://images.unsplash.com/photo-1608528577891-eb055944f2e7?w=400' }
    ],
    // 5. 헤어랩 서울
    [
        { name: '안티 헤어로스 비오틴 샴푸 500ml', desc: '식약처 인증 탈모 완화 기능성 비오틴 샴푸.', price: 28000, cat: '헤어케어', tag: ['탈모완화', '비오틴'], img: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=400' },
        { name: '아르간 너리싱 헤어 오일 100ml', desc: '극손상 모발을 위한 무실리콘 100% 아르간 헤어 오일.', price: 35000, cat: '헤어에센스', tag: ['헤어오일', '아르간'], img: 'https://images.unsplash.com/photo-1526947425960-945c6e72858f?w=400' },
        { name: '시카 두피 쿨링 스케일러 200ml', desc: '열오른 두피를 진정시키고 각질을 제거하는 주 1회 스케일러.', price: 22000, cat: '두피케어', tag: ['두피쿨링', '스케일링'], img: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400' }
    ],
    // 6. 네일스튜디오 N
    [
        { name: '디자인 젤네일 스티커 [빈티지 로즈]', desc: '샵에서 받은 듯한 리얼 젤 퀄리티. 초밀착 반경화 젤 스티커.', price: 15900, cat: '젤네일', tag: ['젤스티커', '셀프네일'], img: 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?w=400' },
        { name: '네일스튜디오 N 프로 UV LED 램프', desc: '빠르고 완벽한 큐어링을 위한 휴대용 고출력 네일 램프.', price: 28000, cat: '네일가전', tag: ['UV램프', '젤램프'], img: 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?w=400' },
        { name: '큐티클 오일 앤 세럼 펜', desc: '휴대하며 덧바르기 좋은 스틱 타입 네일 영양 세럼.', price: 12000, cat: '네일케어', tag: ['큐티클오일', '네일케어'], img: 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?w=400' }
    ],
    // 7. 선스크린랩
    [
        { name: '에어리 워터 선 에센스 SPF50+ PA++++', desc: '백탁 없이 수분 크림처럼 가볍게 발리는 데일리 선 에센스.', price: 25000, cat: '선케어', tag: ['선크림', '수분선'], img: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400' },
        { name: '무기자차 더마 선스틱 20g', desc: '민감 피부와 아이도 쓰는 100% 무기자차 보송 선스틱.', price: 21000, cat: '선스틱', tag: ['무기자차', '보송'], img: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400' },
        { name: '울트라 레포츠 워터프루프 선크림 70ml', desc: '서핑, 마라톤 등 야외 활동 전용 강력 풀 프루프 선크림.', price: 28000, cat: '레저용', tag: ['워터프루프', '레포츠'], img: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400' }
    ],
    // 8. 아뜰리에 무지
    [
        { name: '시그니처 투버튼 울 자켓 [오트밀]', desc: '소재에 집중한 미니멀리즘 울 혼방 자켓. 완벽한 테일러링.', price: 189000, cat: '자켓', tag: ['울자켓', '미니멀'], img: 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=400' },
        { name: '에어 데일리 슬랙스 [블랙/그레이/네이비]', desc: '구김 안가고 편안한 직장인 교복 슬랙스. 사계절용 두께감.', price: 65000, cat: '팬츠', tag: ['슬랙스', '오피스룩'], img: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400' },
        { name: '코튼 100% 실켓 드레스 셔츠 [화이트]', desc: '은은한 광택감이 도는 프리미엄 실켓 코튼 셔츠.', price: 59000, cat: '셔츠', tag: ['드레스셔츠', '화이트셔츠'], img: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=400' }
    ],
    // 9. 빈티지 컬렉트
    [
        { name: '리바이스 셀비지 501 빈티지 [80s]', desc: '희소가치 있는 80년대 데드스탁 메이드 인 USA 리바이스.', price: 220000, cat: '데님', tag: ['리바이스', '빈티지데님'], img: 'https://images.unsplash.com/photo-1582552938357-32b906df40cb?w=400' },
        { name: '90s 오리지널 바시티 자켓 [Navy]', desc: '90년대 미국 칼리지 감성 그대로. 천연 소가죽 슬리브 바시티.', price: 185000, cat: '아우터', tag: ['바시티자켓', '빈티지'], img: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400' },
        { name: '빈티지 밴드 티셔츠 [락/메탈 랜덤셀렉]', desc: '멋스럽게 워싱된 오가닉 90년대 밴드 반팔 티셔츠.', price: 65000, cat: '상의', tag: ['밴드티', '오리지널'], img: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400' }
    ],
    // 10. 사이즈업 스타일
    [
        { name: '[L-4XL] 베이직 V넥 니트 [머스타드]', desc: '답답함 없이 슬림해보이는 마법 같은 V넥 니트.', price: 42000, cat: '니트', tag: ['플러스사이즈', 'V넥'], img: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=400' },
        { name: '[L-4XL] 시크릿 밴딩 스트레이트 진', desc: '허리 히든 밴딩으로 앉아도 배가 편안한 쫀쫀 데님.', price: 54000, cat: '데님', tag: ['히든밴딩', '빅사이즈'], img: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=400' },
        { name: '[L-3XL] 핀턱 와이드 찰랑 슬랙스', desc: '두꺼운 허벅지도 커버하는 체형 보정 일자 와이드 핏.', price: 49000, cat: '팬츠', tag: ['착시핏', '슬랙스'], img: 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=400' }
    ],
    // 11. 데님8 팩토리
    [
        { name: '셀비지 스트레이트 데님 01 [인디고]', desc: '생지 데님의 정석. 입을수록 내 몸에 맞게 워싱되는 매력.', price: 89000, cat: '청바지', tag: ['생지데님', '스트레이트핏'], img: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=400' },
        { name: '크롭 테이퍼드 핏 데님 [연청]', desc: '수선이 필요 없는 크롭 기장. 여유로운 테이퍼드 실루엣.', price: 79000, cat: '청바지', tag: ['테이퍼드', '크롭'], img: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=400' },
        { name: '오버핏 데님 트러커 자켓 [흑청]', desc: '도톰한 13oz 원단을 사용한 클래식한 트러커 자켓.', price: 110000, cat: '자켓', tag: ['트러커', '데님자켓'], img: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=400' }
    ],
    // 12. 하늘 니트웨어
    [
        { name: '케이블 크롭 가디건 [오프화이트]', desc: '포근한 알파카 혼방. 경쾌한 크롭 기장의 케이블 짜임 자켓.', price: 84000, cat: '가디건', tag: ['케이블가디건', '크롭'], img: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=400' },
        { name: '퓨어 캐시미어 100% 라운드 넥 [5컬러]', desc: '가볍고 따뜻한 이너로 최적의 몽골리안 퓨어 캐시미어 100%.', price: 145000, cat: '니트', tag: ['캐시미어', '퓨어'], img: 'https://images.unsplash.com/photo-1516762689617-e1cffcef479d?w=400' },
        { name: '울 혼방 뷔스티에 베스트 세트', desc: '티셔츠나 셔츠에 레이어드하기 좋은 니트 베스트 탑 투피스.', price: 62000, cat: '베스트', tag: ['뷔스티에', '레이어드'], img: 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=400' }
    ],
    // 13. 프로틴바 코리아
    [
        { name: '더블 초코 크런치 프로틴바 12개입', desc: '단백질 20g, 당류는 단 2g. 바삭한 초코 크런치 식감 유지.', price: 28000, cat: '프로틴바', tag: ['초코크런치', '저당'], img: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400' },
        { name: '리얼 딸기 요거트 단백질바 10개입', desc: '건조 딸기칩이 입힌 상큼 달달한 요거트 코팅 프로틴바.', price: 25000, cat: '프로틴바', tag: ['딸기요거트', '상큼'], img: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400' },
        { name: '비건 넛츠 프로틴 청크 250g', desc: '유청단백 대신 식물성 분리대두단백과 통견과를 뭉친 간식.', price: 15000, cat: '청크', tag: ['비건', '견과류'], img: 'https://images.unsplash.com/photo-1512288094938-363287817259?w=400' }
    ],
    // 14. 애슬레저랩
    [
        { name: '에센셜 무봉제 레깅스 9부 [블랙]', desc: 'Y존 부각 없는 입체 패턴. 탄탄하게 다리를 잡아주는 베이직 레깅스.', price: 45000, cat: '레깅스', tag: ['무봉제', 'Y존커버'], img: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400' },
        { name: '에브리데이 크롭 브라탑 매트 [더스티핑크]', desc: '편안한 서포트. 웨이트부터 요가까지 만능 데일리 브라탑.', price: 38000, cat: '브라탑', tag: ['크롭탑', '하이서포트'], img: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400' },
        { name: '컴포트 라이트 조거 팬츠 [그레이]', desc: '운동 후에도 외출복으로 그대로 입을 수 있는 날씬한 핏의 조거.', price: 52000, cat: '조거팬츠', tag: ['오운완', '조거'], img: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400' }
    ],
    // 15. 클린비타민
    [
        { name: '퓨어 멀티비타민 미네랄 컴플렉스 (30일분)', desc: '화학부형제 없는 올인원 천연 유래 멀티 비타민 13종 함유.', price: 39000, cat: '비타민', tag: ['멀티비타민', '무부형제'], img: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400' },
        { name: '식물성 알티지 오메가3 (60캡슐)', desc: '중금속 걱정 없는 미세조류 추출 프리미엄 식물성 오메가3.', price: 42000, cat: '오메가3', tag: ['식물성', '혈행건강'], img: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400' },
        { name: '시너지 듀얼 생유산균 100억 CFU (30포)', desc: '장 끝까지 살아가는 식물성 캡슐 + 맛있는 가루 혼합 제형 유산균.', price: 35000, cat: '유산균', tag: ['프로바이오틱스', '장건강'], img: 'https://images.unsplash.com/photo-1512288094938-363287817259?w=400' }
    ],
    // 16. 핏플래너
    [
        { name: '스마트 체성분 분석 체중계 Fit-S1', desc: '12가지 체성분을 앱 연동으로 기록하는 고정밀 스마트 체중계.', price: 45000, cat: '기기', tag: ['인바디체중계', '다이어트어플'], img: 'https://images.unsplash.com/photo-1604480132736-44c188fe4d20?w=400' },
        { name: '네오프렌 육각 덤벨 세트 (2kg/3kg/4kg)', desc: '바닥 스크래치 방지 네오프렌 소재 홈트 전용 덤벨.', price: 39000, cat: '홈트기구', tag: ['덤벨', '홈트'], img: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400' },
        { name: 'NBR 16mm 요가매트 + TPE 폼롤러 기획세트', desc: '층간소음 방지 두꺼운 매트와 뭉친 근육을 푸는 폼롤러 번들.', price: 54000, cat: '홈트기구', tag: ['요가매트', '폼롤러'], img: 'https://images.unsplash.com/photo-1601422407692-ec4eeec1d9b3?w=400' }
    ],
    // 17. 리빙카페 홈
    [
        { name: '오델리아 수동 버 커피 글라인더', desc: '디자인과 세라믹 버의 정밀함을 겸비한 클래식 핸드밀.', price: 68000, cat: '커피도구', tag: ['핸드밀', '원두그라인더'], img: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400' },
        { name: '시그니처 하우스 블렌드 콜드브루 원액 500ml', desc: '고소한 견과류 풍미와 다크 초콜릿의 묵직함이 살아있는 원액.', price: 21000, cat: '커피원두', tag: ['콜드브루', '홈카페'], img: 'https://images.unsplash.com/photo-1559525839-b184a4d698c7?w=400' },
        { name: '내열 유리 눈금 드립 서버 600ml', desc: '정확한 추출 양을 눈으로 확인하는 심플한 유리 서버.', price: 18000, cat: '커피도구', tag: ['드립서버', '핸드드립'], img: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400' }
    ],
    // 18. 한복꾸뛰르
    [
        { name: '하이드 데님 저고리 자켓 [여성형]', desc: '전통 저고리를 데님 자켓 로 차용하여 청바지에도 어울리는 아우터.', price: 125000, cat: '아우터', tag: ['저고리', '모던한복'], img: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400' },
        { name: '린넨 허리치마 [쑥빛/노을빛]', desc: '시원한 리넨 소재로 풍성한 실루엣이 예술인 랩 스타일 치마.', price: 89000, cat: '치마', tag: ['허리치마', '생활한복'], img: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400' },
        { name: '전통 매듭 달항아리 노리개 펜던트', desc: '가방, 키링, 치마 어디에나 포인트가 되는 수제 매듭 악세사리.', price: 34000, cat: '소품', tag: ['노리개', '키링'], img: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400' }
    ],
    // 19. 그린룸 인테리어
    [
        { name: '공기정화식물 몬스테라 L 화분 세트', desc: '이탈리아 토분과 함께 배송되는 생명력 강한 국민 플랜테리어 식물.', price: 65000, cat: '조경', tag: ['몬스테라', '토분'], img: 'https://images.unsplash.com/photo-1552046122-03184de85e08?w=400' },
        { name: '내추럴 드라이다발 센터피스 [가을 들판]', desc: '생화의 느낌을 보존처리한 프리저브드 인테리어 화병 세트.', price: 42000, cat: '인테리어소품', tag: ['프리저브드', '드라이플라워'], img: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400' },
        { name: '빈티지 원목 화분 스탠드 (2단)', desc: '협소한 공간에도 식물을 예쁘게 배치하는 아카시아 나무 랙.', price: 55000, cat: '가구', tag: ['화분스탠드', '선반'], img: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400' }
    ],
    // 20. 제주 오가나처
    [
        { name: '유기농 제주 영귤 청 500g', desc: '제주 자연 그대로 보존제 없이 착즙하여 담근 프리미엄 수제 청.', price: 23000, cat: '식품', tag: ['수제청', '유기농만다린'], img: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400' },
        { name: '동백오일 100% 인텐스 하이드레이팅 오일 30ml', desc: '제주산 동백씨앗 냉압착. 피부 광채와 헤어 보습 올인원 오일.', price: 36000, cat: '화장품', tag: ['동백오일', '페이스오일'], img: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=400' },
        { name: '현무암 스파 풋 소크솔트 200g', desc: '제주 청정 해수염과 화산송이 가루를 섞은 스트레스 해소 입욕제.', price: 18000, cat: '배쓰', tag: ['입욕제', '힐링'], img: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=400' }
    ],
]

async function main() {
    console.log('📦 60개 브랜드 제품 데이터 시딩 시작...\n')

    let successCount = 0

    // 1. 브랜드 20개의 ID를 가져오기 위해 profiles 조회
    const { data: brands, error: brandErr } = await supabase
        .from('profiles')
        .select('id, email, display_name')
        .eq('role', 'brand')
        .in('email', BRANDS_EMAILS)

    if (brandErr || !brands || brands.length === 0) {
        console.error('❌ 브랜드를 찾을 수 없습니다. seed-20-brands.ts 를 먼저 실행해주세요.')
        return
    }

    for (let i = 0; i < BRANDS_EMAILS.length; i++) {
        const email = BRANDS_EMAILS[i]
        const brand = brands.find(b => b.email === email)
        if (!brand) {
            console.error(`  ⚠️ 브랜드 없음 스킵: ${email}`)
            continue
        }

        const brandProds = PRODUCTS[i]
        if (!brandProds || brandProds.length === 0) continue

        for (const pd of brandProds) {
            const payload = {
                brand_id: brand.id,
                name: pd.name,
                description: pd.desc,
                image_url: pd.img,
                price: pd.price,
                category: pd.cat,
                tags: pd.tag,
                is_mock: true,
                selling_points: '- 타겟 고객 필수 제품\n- 유니크한 디자인\n- 가성비 우수',
                required_shots: '- 패키징 오픈 샷\n- 사용/착용 샷\n- 로고 포인트 샷',
                website_url: `https://www.example.com/item/${Math.floor(Math.random() * 99999)}`,
            }

            const { error: insertErr } = await supabase
                .from('brand_products')
                .insert([payload])

            if (insertErr) {
                console.error(`  ❌ [${brand.display_name}] 제품 등록 실패 (${pd.name}):`, insertErr.message)
            } else {
                console.log(`  ✅ [${brand.display_name.padEnd(12)}] ${pd.name} (${pd.price.toLocaleString()}원) 등록 완료`)
                successCount++
            }
        }
    }

    console.log(`\n🎉 총 ${successCount}/${PRODUCTS.flat().length}개 제품 등록 완료!`)
}

main().catch(console.error)
