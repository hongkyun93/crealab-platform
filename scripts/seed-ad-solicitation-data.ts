import { chromium } from '@playwright/test';
import * as path from 'path';

const TARGET_URL = 'https://creadypick.vercel.app';

// Available Images (10 Unique)
const IMAGES = [
    '/Users/kimhongkyun/.gemini/antigravity/brain/e108f878-bb15-4507-bf27-34b594bf3cd5/profile_beauty_influencer_1770688261419.png',
    '/Users/kimhongkyun/.gemini/antigravity/brain/e108f878-bb15-4507-bf27-34b594bf3cd5/profile_fashion_influencer_1770688277391.png',
    '/Users/kimhongkyun/.gemini/antigravity/brain/e108f878-bb15-4507-bf27-34b594bf3cd5/profile_food_influencer_1770688300942.png',
    '/Users/kimhongkyun/.gemini/antigravity/brain/e108f878-bb15-4507-bf27-34b594bf3cd5/profile_h_beauty_1_1770689583315.png',
    '/Users/kimhongkyun/.gemini/antigravity/brain/e108f878-bb15-4507-bf27-34b594bf3cd5/profile_h_beauty_2_1770689599402.png',
    '/Users/kimhongkyun/.gemini/antigravity/brain/e108f878-bb15-4507-bf27-34b594bf3cd5/profile_h_fashion_1_1770689622895.png',
    '/Users/kimhongkyun/.gemini/antigravity/brain/e108f878-bb15-4507-bf27-34b594bf3cd5/profile_h_fashion_3_1770689645710.png',
    '/Users/kimhongkyun/.gemini/antigravity/brain/e108f878-bb15-4507-bf27-34b594bf3cd5/profile_h_food_1_1770689662093.png',
    '/Users/kimhongkyun/.gemini/antigravity/brain/e108f878-bb15-4507-bf27-34b594bf3cd5/profile_h_living_1_1770689695127.png',
    '/Users/kimhongkyun/.gemini/antigravity/brain/e108f878-bb15-4507-bf27-34b594bf3cd5/profile_h_travel_1_1770689712856.png'
];

// Helper to get image (cycling)
const getImage = (index) => IMAGES[index % IMAGES.length];

// 18 Personas with Ad Solicitation Focus
const PERSONAS = [
    // 1. Beauty (Original - Updated)
    {
        name: 'Minji_Beauty_Pro',
        email: 'minji.pro.ad@creadypick.com',
        password: 'password1234',
        category: '뷰티',
        handle: 'minji.beauty_official',
        bio: '협찬/광고 문의 환영 💌 | 2030 직장인 타겟 뷰티 마케팅 | 꼼꼼한 비포애프터 보장',
        imagePath: getImage(0),
        moments: [
            {
                title: '30대 직장인 타겟 기초화장품 광고주님 모십니다 📢',
                targetProduct: '기초화장품, 앰플, 크림',
                month: '2월',
                description: '[광고 제안]\n제 팔로워의 70%가 구매력 있는 2030 직장인 여성입니다. \n출근 준비 시간을 줄여주는 올인원 제품이나, 야근 후 지친 피부를 달래주는 진정 라인 홍보에 자신 있습니다.\n\n- 예상 노출: 릴스 2만뷰 이상 보장\n- 톤앤매너: 고급스럽고 차분한 분위기'
            },
            {
                title: '여름 시즌 대비 자외선 차단제 캠페인 제안 ☀️',
                targetProduct: '선크림, 선스틱',
                month: '2월',
                description: '미리 준비하는 여름 휴가 시즌! \n백탁 없는 촉촉한 유기자차 선크림 숏폼 콘텐츠 기획 중입니다.\n야외 활동이 많은 주말 브이로그 형식으로 자연스럽게 제품을 노출해드립니다.'
            },
            {
                title: '색조 메이크업 신상 런칭 프로모션 함께해요 💄',
                targetProduct: '립스틱, 틴트, 쿠션',
                month: '2월',
                description: '퍼스널 컬러 진단 콘텐츠와 연계하여 귀사의 신상 립 틴트 전색상 발색 리뷰를 제안합니다.\n단순 발색뿐 아니라 착색력 유지력 테스트까지 꼼꼼하게 담아 구매 전환을 유도하겠습니다.'
            }
        ]
    },
    // 2. Beauty (New)
    {
        name: 'Glow_Sora',
        email: 'sora.glow@creadypick.com',
        password: 'password1234',
        category: '뷰티',
        handle: 'glow_sora',
        bio: '물광 피부 연출 전문 ✨ | 스킨케어 브랜드 전속 모델 경험 다수 | 영상 퀄리티 보장',
        imagePath: getImage(3),
        moments: [
            {
                title: '건성 피부 구원템! 수분 앰플 협찬 기다립니다 💧',
                targetProduct: '히알루론산 앰플, 수분크림',
                month: '2월',
                description: '환절기 건조함으로 고민하는 팔로워들에게 딱 맞는 고보습 앰플을 찾고 있습니다.\n제품의 제형과 흡수력을 강조한 고화질 클로즈업 릴스로 제품력을 확실하게 보여드리겠습니다.'
            },
            {
                title: '비건 뷰티 브랜드 마케팅 담당자님 찾아요 🌿',
                targetProduct: '비건 화장품, 클린 뷰티',
                month: '2월',
                description: '가치 소비를 지향하는 MZ세대를 타겟으로 한 비건 뷰티 캠페인을 기획 중입니다.\n친환경 패키지와 순한 성분을 진정성 있게 소구하여 브랜드 이미지를 높여드리겠습니다.'
            },
            {
                title: '피부과 시술 후 관리템 공구 진행 제안',
                targetProduct: '재생크림, 시카밤',
                month: '2월',
                description: '최근 리쥬란/써마지 등 시술 관련 콘텐츠 조회수가 급증하고 있습니다.\n시술 후 예민해진 피부에 사용하기 좋은 더마 코스메틱 브랜드와의 공구 혹은 장기 협업을 제안드립니다.'
            }
        ]
    },
    // 3. Beauty (New - Makeup)
    {
        name: 'Artist_Yuna',
        email: 'yuna.art@creadypick.com',
        password: 'password1234',
        category: '뷰티',
        handle: 'makeup_yuna',
        bio: '현직 메이크업 샵 원장 🖌️ | 아이돌 메이크업 튜토리얼 | 제품 PPL 문의 환영',
        imagePath: getImage(4),
        moments: [
            {
                title: '아이돌 속눈썹 연출! 마스카라/가닥속눈썹 광고 받습니다 👁️',
                targetProduct: '마스카라, 속눈썹 영양제',
                month: '2월',
                description: '샵에서 실제 아이돌에게 사용하는 짱짱한 컬링 마스카라로 입소문 내드립니다.\n비포/애프터가 확실한 튜토리얼 영상으로 1020 타겟에게 강력하게 어필하겠습니다.'
            },
            {
                title: '지속력 갑! 파운데이션 & 쿠션 챌린지 ⏰',
                targetProduct: '파운데이션, 쿠션, 픽서',
                month: '2월',
                description: '아침 9시부터 밤 9시까지 무너짐 없는 베이스 메이크업 챌린지!\n땀과 유분에도 강한 귀사의 제품력을 극한의 상황에서 증명해보이는 숏폼을 제작해드립니다.'
            },
            {
                title: '글리터/하이라이터 영롱한 발색샷 찍어드려요 ✨',
                targetProduct: '글리터, 섀도우, 하이라이터',
                month: '2월',
                description: '조명 맛집 스튜디오에서 촬영하여 제품의 펄감을 기가 막히게 잡아냅니다.\n까마귀 코덕들을 홀릴 수 있는 고퀄리티 발색 영상이 필요하시다면 연락 주세요.'
            }
        ]
    },
    // 4. Fashion (Original - Updated)
    {
        name: 'OOTD_Jin_Official',
        email: 'jin.ootd.ad@creadypick.com',
        password: 'password1234',
        category: '패션',
        handle: 'jin_daily_look',
        bio: '쇼핑몰 모델 출신 165cm 👗 | 데일리룩/하객룩/출근룩 | 릴스 착장 정보 문의 폭주',
        imagePath: getImage(1),
        moments: [
            {
                title: '봄 시즌 신상 자켓/트렌치코트 룩북 협업 제안 🧥',
                targetProduct: '자켓, 트렌치코트, 블라우스',
                month: '2월',
                description: '다가오는 봄, 데이트룩과 출근룩으로 활용 가능한 아우터 룩북을 기획하고 있습니다.\n자연광 스튜디오에서 감성적인 분위기로 제품의 핏과 디테일을 살려 촬영해드립니다.'
            },
            {
                title: '디자이너 가방 브랜드 서포터즈/단건 홍보 희망 👜',
                targetProduct: '핸드백, 숄더백, 미니백',
                month: '2월',
                description: '2030 여성이 선호하는 디자이너 브랜드 가방을 소개하고 싶습니다.\n다양한 코디에 매치하여 활용도 높은 데일리백으로 포지셔닝 해드리겠습니다.'
            },
            {
                title: '성수동 핫플 카페 투어룩 OOTD 협찬 ☕️',
                targetProduct: '원피스, 니트, 데님',
                month: '2월',
                description: '성수동 힙한 카페들을 배경으로 귀사의 의류를 착용하고 자연스러운 라이프스타일 컷을 연출합니다.\n인스타 감성의 고해상도 사진 5장 이상과 릴스 1건을 패키지로 제공합니다.'
            }
        ]
    },
    // 5. Fashion (New - Street)
    {
        name: 'Street_Hipster',
        email: 'street.hip@creadypick.com',
        password: 'password1234',
        category: '패션',
        handle: 'hip_seoul',
        bio: '스트릿/워크웨어 매니아 🧢 | 한정판 스니커즈 리뷰 | 브랜드 룩북 모델 가능',
        imagePath: getImage(5),
        moments: [
            {
                title: '오버핏 후드/맨투맨 브랜드 룩북 모델 지원합니다 👕',
                targetProduct: '후드티, 맨투맨, 조거팬츠',
                month: '2월',
                description: '남녀공용 스트릿 브랜드의 힙한 무드를 잘 살릴 수 있습니다.\n홍대/연남동 스트릿 배경으로 트렌디한 숏폼 룩북을 제작하여 1020 타겟에게 어필하겠습니다.'
            },
            {
                title: '스니커즈/신발 런칭 캠페인 바이럴 맡겨주세요 👟',
                targetProduct: '운동화, 스니커즈, 단화',
                month: '2월',
                description: '신발 덕후들도 인정하는 디테일한 리뷰!\n착화감부터 코디 꿀팁까지, 신발의 매력을 200% 끌어올리는 콘텐츠를 약속드립니다.'
            },
            {
                title: '안경/선글라스 등 패션 소품 협찬 문의 🕶️',
                targetProduct: '안경, 선글라스, 모자',
                month: '2월',
                description: '룩의 완성은 악세서리! 밋밋한 코디에 포인트를 주는 아이웨어/헤드웨어 브랜드를 찾습니다.\n얼굴형별 스타일링 팁과 함께 자연스럽게 제품을 노출해드립니다.'
            }
        ]
    },
    // 6. Food (Original - Updated)
    {
        name: 'Gourmet_Conan_Pro',
        email: 'conan.food.ad@creadypick.com',
        password: 'password1234',
        category: '푸드',
        handle: 'conan_tasty',
        bio: '맛집 인플루언서 랭킹 1위 도전 🍽️ | F&B 브랜드 팝업 초청 환영 | 릴스 맛집',
        imagePath: getImage(2),
        moments: [
            {
                title: '성수/압구정 F&B 팝업스토어 방문 취재 요청 🎫',
                targetProduct: '식품 팝업, 카페, 레스토랑',
                month: '2월',
                description: '오픈런 대란이 예상되는 핫한 팝업스토어, 제가 먼저 가보고 생생하게 전달해드립니다.\n웨이팅 라인부터 내부 체험존, 한정판 메뉴 시식까지 풀코스 리뷰 릴스 제작!'
            },
            {
                title: '신상 디저트/카페 메뉴 시식단 모집하나요? 🍰',
                targetProduct: '베이커리, 디저트, 커피',
                month: '2월',
                description: '편의점 신상부터 호텔 디저트까지! 디저트에 진심인 미식가입니다.\n먹음직스러운 단면 샷과 리얼한 맛 표현으로 디저트 덕후들의 지갑을 열게 하겠습니다.'
            },
            {
                title: '밀키트/HMR 식품 조리 및 먹방 영상 제작 🥘',
                targetProduct: '밀키트, 냉동식품, 간편식',
                month: '2월',
                description: '집에서도 셰프의 맛을! 간편하지만 근사한 한 끼 식사를 연출해드립니다.\n보글보글 끓는 소리(ASMR)와 함께라면 더욱 매력적인 야식/캠핑 요리 콘텐츠 제안.'
            }
        ]
    },
    // 7. Food (New - Stylist)
    {
        name: 'Stylist_Anne',
        email: 'anne.cook@creadypick.com',
        password: 'password1234',
        category: '푸드',
        handle: 'anne_kitchen',
        bio: '푸드 스타일리스트 🥗 | 예쁜 플레이팅 & 건강 식단 | 주방용품 광고 문의',
        imagePath: getImage(7),
        moments: [
            {
                title: '예쁜 그릇/커트러리 브랜드 플레이팅 협업 제안 🍽️',
                targetProduct: '접시, 커트러리, 테이블매트',
                month: '2월',
                description: '음식의 맛을 더해주는 테이블웨어! 감각적인 플레이팅으로 귀사의 제품을 더욱 돋보이게 촬영합니다.\n홈파티, 브런치 등 상황별 테이블 세팅 노하우와 함께 자연스럽게 제품을 홍보하세요.'
            },
            {
                title: '다이어트 도시락/샐러드 정기배송 체험단 신청 🥗',
                targetProduct: '샐러드, 닭가슴살, 다이어트식품',
                month: '2월',
                description: '맛있게 먹으면서 관리하자! 유지어터들을 위한 식단 관리 템을 찾고 있습니다.\n영양 성분 분석과 맛 평가, 일주일 식단 브이로그로 다이어터들의 공감을 이끌어내겠습니다.'
            },
            {
                title: '프리미엄 주방가전(블렌더/에어프라이어) 리뷰어 🍳',
                targetProduct: '블렌더, 에어프라이어, 커피머신',
                month: '2월',
                description: '요리의 질을 높여주는 스마트한 주방가전! 실제 사용기를 바탕으로 한 꼼꼼한 리뷰를 약속드립니다.\n기기 작동법부터 활용 레시피까지, 구매를 고민하는 분들의 궁금증을 완벽하게 해결해드립니다.'
            }
        ]
    },
    // 8. Living (New)
    {
        name: 'Living_Jieun',
        email: 'jieun.home@creadypick.com',
        password: 'password1234',
        category: '리빙/인테리어',
        handle: 'jieun.home',
        bio: '오늘의집 스타일 24평 아파트 인테리어 🏠 | 가구/소품 배치 꿀팁 | 룸투어 환영',
        imagePath: getImage(8),
        moments: [
            {
                title: '봄맞이 거실 인테리어 소품/가구 협찬 받아요 🛋️',
                targetProduct: '소파, 러그, 조명',
                month: '2월',
                description: '봄 분위기 물씬 나는 거실로 변신! 화사한 패브릭 소품이나 포인트 가구를 찾고 있습니다.\n비포/애프터 룸투어 영상으로 인테리어 효과를 극적으로 보여드리겠습니다.'
            },
            {
                title: '자취생 필수템! 수납/정리용품 광고주님 모십니다 📦',
                targetProduct: '수납함, 옷걸이, 정리대',
                month: '2월',
                description: '좁은 집도 넓게 쓰는 마법! 정리 정돈 노하우와 함께 귀사의 수납 아이템을 소개하고 싶습니다.\n깔끔하게 정리된 공간을 보며 희열을 느끼는 자취생 타겟에게 강력 추천!'
            },
            {
                title: '침실 분위기 깡패 만드는 무드등/캔들 추천 🕯️',
                targetProduct: '무드등, 캔들, 디퓨저',
                month: '2월',
                description: '잠들기 전, 아늑한 침실 무드를 책임질 조명과 향기 아이템을 찾습니다.\n감성적인 나이트 루틴 브이로그에 자연스럽게 녹여내어 구매 욕구를 자극하겠습니다.'
            }
        ]
    },
    // 9. Travel (New)
    {
        name: 'Travel_Hoon',
        email: 'hoon.travel@creadypick.com',
        password: 'password1234',
        category: '여행',
        handle: 'hoon_trip',
        bio: '퇴사 후 세계일주 중 ✈️ | 여행 꿀팁 & 숙소 리뷰 | 액티비티 체험단 문의',
        imagePath: getImage(9),
        moments: [
            {
                title: '제주도 감성 숙소/풀빌라 숙박권 협찬 찾습니다 🌴',
                targetProduct: '호텔, 펜션, 리조트',
                month: '2월',
                description: '제주 여행을 계획 중인 커플/가족에게 추억을 선사할 감성 숙소를 소개해주세요.\n룸 컨디션, 어메니티, 조식, 수영장 등 숙소의 매력을 구석구석 담은 고퀄리티 영상 리뷰를 제작합니다.'
            },
            {
                title: '여행용 캐리어/백팩 기내용 사이즈 홍보 제안 🧳',
                targetProduct: '캐리어, 여행가방, 백팩',
                month: '2월',
                description: '튼튼하고 수납력 좋은 여행 가방! 공항 패션 아이템으로도 손색없는 제품을 찾습니다.\n실제 짐 싸는 모습(Packing With Me)부터 공항 이동까지, 여행의 설렘을 담아 제품을 노출합니다.'
            },
            {
                title: '여행지 액티비티/투어 상품 체험단 신청 🏄‍♂️',
                targetProduct: '서핑, 스노쿨링, 원데이클래스',
                month: '2월',
                description: '여행지에서의 특별한 경험! 서핑, 스쿠버다이빙 등 액티비티 체험 영상을 제작해드립니다.\n생동감 넘치는 액션캠 영상으로 보는 이들의 도전 정신을 자극하고 예약으로 이어지게 만들겠습니다.'
            }
        ]
    },
    // 10. Tech (New - using Fashion image 3 as Tech/Outdoor crossover to save API)
    {
        name: 'Tech_Minho',
        email: 'minho.tech@creadypick.com',
        password: 'password1234',
        category: 'IT/테크',
        handle: 'minho_gadget',
        bio: 'IT 기기 심층 리뷰 💻 | 애플/삼성 신제품 언박싱 | 테크 유튜버 꿈나무',
        imagePath: getImage(6), // Reusing fashion3 (sporty) as maybe wearable tech reviewer
        moments: [
            {
                title: '신상 스마트폰/태블릿 악세서리 협찬 문의 📱',
                targetProduct: '케이스, 필름, 거치대',
                month: '2월',
                description: '소중한 IT 기기를 보호하고 꾸며줄 케이스/파우치 브랜드를 찾습니다.\n디자인과 실용성을 모두 갖춘 제품을 1020 학생/직장인 타겟에게 힙하게 소개하겠습니다.'
            },
            {
                title: '데스크테리어 필수템! 키보드/마우스 광고 제안 ⌨️',
                targetProduct: '키보드, 마우스, 장패드',
                month: '2월',
                description: '업무 효율 UP! 게임 실력 UP! 타건감 좋은 기계식 키보드나 인체공학 마우스 리뷰를 제안합니다.\nASMR 타건 영상과 깔끔한 데스크 셋업 샷으로 테크 덕후들의 마음을 사로잡겠습니다.'
            },
            {
                title: '삶의 질 수직상승! 스마트홈 IoT 기기 리뷰 🏠',
                targetProduct: '스마트플러그, AI스피커, 로봇청소기',
                month: '2월',
                description: '스마트한 우리 집 만들기! 음성 제어, 원격 제어 등 편리한 IoT 라이프를 보여드립니다.\n설치부터 실사용기까지, 누구나 쉽게 따라 할 수 있는 친절한 가이드 영상을 제작합니다.'
            }
        ]
    },
    // 11-15... (Generating 5 more variations recycling images)
    {
        name: 'Daily_Yujin',
        email: 'yujin.daily@creadypick.com',
        password: 'password1234',
        category: '일상/브이로그',
        handle: 'yujin_log',
        bio: '평범한 대학생의 일상 📚 | 카페/맛집/공부 | 서포터즈 활동 환영',
        imagePath: getImage(0), // Reuse beauty1
        moments: [
            {
                title: '대학생 시험기간 필수템! 영양제/에너지드링크 광고 💊',
                targetProduct: '비타민, 유산균, 에너지드링크',
                month: '2월',
                description: '시험기간 밤샘 공부 필수템! 지친 체력을 충전해줄 에너지 드링크나 영양제를 찾습니다.\n도서관 브이로그(스터디윗미) 속에 자연스럽게 제품 섭취 장면을 노출하여 20대 대학생들에게 추천합니다.'
            },
            {
                title: '문구 덕후 모여라! 다이어리/필기구 협찬 문의 ✏️',
                targetProduct: '다이어리, 펜, 스티커',
                month: '2월',
                description: '새 학기 맞이 다이어리 꾸미기(다꾸)! 예쁜 문구류와 함께라면 공부 의욕 뿜뿜.\n감성적인 필기 ASMR 영상과 다꾸 꿀팁으로 문구 덕후들을 저격하겠습니다.'
            },
            {
                title: '편의점 꿀조합 레시피 숏폼 광고 제안 🏪',
                targetProduct: '편의점음식, 컵라면, 음료',
                month: '2월',
                description: '편의점에서 5천원으로 한 끼 해결! 꿀조합 레시피 숏폼을 제작해드립니다.\n간단하지만 맛있는 조합으로 1020 자취생들의 침샘을 자극하고 편의점으로 달려가게 만들겠습니다.'
            }
        ]
    },
    {
        name: 'Mom_Suji',
        email: 'suji.mom@creadypick.com',
        password: 'password1234',
        category: '육아',
        handle: 'suji_mom',
        bio: '5살 딸맘 육아 소통 👶 | 육아템 리뷰 & 공동구매 | 키즈 모델 DM',
        imagePath: getImage(8), // Reuse living1
        moments: [
            {
                title: '우리 아이 등원룩 패션 브랜드 협찬 찾아요 🎒',
                targetProduct: '유아동복, 신발, 가방',
                month: '2월',
                description: '어린이집 등원길 패셔니스타! 활동성 좋고 예쁜 키즈 패션 브랜드를 소개해주세요.\n아이의 사랑스러운 착용샷과 함께 엄마들의 코디 고민을 덜어줄 룩북을 제안합니다.'
            },
            {
                title: '육아는 장비빨! 유아용품/장난감 체험단 신청 🧸',
                targetProduct: '장난감, 유모차, 카시트',
                month: '2월',
                description: '아이도 좋아하고 엄마도 편한 신박한 육아템! 깐깐한 엄마의 시선으로 꼼꼼하게 리뷰합니다.\n실제 사용하는 모습과 솔직한 장단점 분석으로 육아맘들의 신뢰를 얻겠습니다.'
            },
            {
                title: '아이 간식/유아식 건강한 먹거리 광고 제안 🍎',
                targetProduct: '유기농간식, 이유식, 주스',
                month: '2월',
                description: '우리 아이 입에 들어가는 건 아무거나 먹일 수 없죠. 성분 좋고 맛도 좋은 유아식을 찾습니다.\n아이가 맛있게 먹는 먹방 영상으로 안심하고 먹일 수 있는 제품임을 증명해드립니다.'
            }
        ]
    },
    {
        name: 'Pet_Coco',
        email: 'coco.pet@creadypick.com',
        password: 'password1234',
        category: '반려동물',
        handle: 'coco_poodle',
        bio: '푸들 코코의 견생일기 🐶 | 강아지 용품/간식 리뷰 | 펫 프렌들리 장소 추천',
        imagePath: getImage(6), // Reuse fashion3
        moments: [
            {
                title: '반려견 산책 용품(하네스/리드줄) 튼튼한거 찾아요 🐕',
                targetProduct: '하네스, 리드줄, 배변봉투',
                month: '2월',
                description: '1일 1산책 필수! 반려견의 안전과 편안함을 책임질 산책 용품 브랜드를 찾습니다.\n야외에서 신나게 뛰어노는 영상과 함께 제품의 내구성과 편의성을 강조하겠습니다.'
            },
            {
                title: '강아지 수제 간식/사료 기호성 테스트 🍖',
                targetProduct: '사료, 간식, 영양제',
                month: '2월',
                description: '입맛 까다로운 댕댕이도 순삭! 기호성 좋은 프리미엄 사료/간식을 제보해주세요.\n침 흘리며 기다리는 모습부터 ASMR 먹방까지, 견주들의 구매욕을 자극하는 영상을 제작합니다.'
            },
            {
                title: '펫 샴푸/위생용품 목욕 시간 브이로그 🚿',
                targetProduct: '강아지샴푸, 발비누, 칫솔',
                month: '2월',
                description: '목욕 싫어하는 강아지도 얌전해지는 꿀팁! 순한 성분의 펫 케어 제품을 소개합니다.\n거품 몽글몽글 목욕 장면과 뽀송해진 털 빗질 영상으로 힐링과 정보를 동시에 전달합니다.'
            }
        ]
    },
    {
        name: 'Health_Min',
        email: 'min_gym@creadypick.com',
        password: 'password1234',
        category: '운동/건강',
        handle: 'min_workout',
        bio: '헬스 & 바디프로필 💪 | 운동복/보충제 리뷰 | PT 모집중',
        imagePath: getImage(5), // Reuse fashion1
        moments: [
            {
                title: '짐웨어/요가복 핏 예쁜 브랜드 협찬 문의 🧘‍♀️',
                targetProduct: '레깅스, 브라탑, 운동화',
                month: '2월',
                description: '운동할 때도 예뻐야 하니까! 기능성과 디자인을 모두 잡은 애슬레저 룩을 찾습니다.\n헬스장/필라테스 스튜디오에서 운동하는 모습으로 완벽한 핏과 편안한 착용감을 보여드립니다.'
            },
            {
                title: '단백질 보충제/셰이크 맛있는거 추천해주세요 🥤',
                targetProduct: '프로틴, 닭가슴살, 다이어트보조제',
                month: '2월',
                description: '비린 맛 NO! 맛있게 마시는 프로틴 셰이크 비교 리뷰를 기획 중입니다.\n운동 후 꿀꺽꿀꺽 마시는 영상과 함께 성분/맛/가성비까지 철저하게 분석해드립니다.'
            },
            {
                title: '홈트 용품(매트/덤벨) 층간소음 없는 제품 찾아요 🏠',
                targetProduct: '요가매트, 폼롤러, 밴드',
                month: '2월',
                description: '집에서도 헬스장처럼! 층간소음 걱정 없는 두툼한 매트와 홈트 소도구를 소개해주세요.\n누구나 쉽게 따라 할 수 있는 홈트 루틴 영상에 귀사의 제품을 자연스럽게 녹여내겠습니다.'
            }
        ]
    },
    {
        name: 'Game_Jin',
        email: 'jin.game@creadypick.com',
        password: 'password1234',
        category: '게임',
        handle: 'jin_play',
        bio: '종합 게임 스트리머 🎮 | 신작 게임 리뷰 | 게이밍 기어 협찬 환영',
        imagePath: getImage(6), // Reuse tech image
        moments: [
            {
                title: '모바일 게임 신작 사전예약 마케팅 함께해요 📱',
                targetProduct: '모바일게임, RPG, 전략게임',
                month: '2월',
                description: '대작 스멜 나는 신규 모바일 게임! 출시 전 사전예약 붐업을 위한 플레이 영상을 제작합니다.\n핵심 콘텐츠 공략과 화려한 스킬 연출을 숏폼으로 편집하여 게이머들의 기대감을 증폭시키겠습니다.'
            },
            {
                title: '게이밍 헤드셋/마이크 사운드 장비 광고 제안 🎧',
                targetProduct: '헤드셋, 마이크, 스피커',
                month: '2월',
                description: '사운드 플레이가 중요한 FPS 게임! 발소리까지 잡아내는 고성능 헤드셋을 찾습니다.\n선명한 마이크 음질 테스트와 실제 게임 플레이 중 들리는 리얼한 사운드를 전달해드립니다.'
            },
            {
                title: '편한 게이밍 의자 24시간 앉아본 후기 🪑',
                targetProduct: '게이밍의자, 책상',
                month: '2월',
                description: '하루 종일 게임해도 허리 안 아픈 인생 의자를 찾아라!\n장시간 착용 후기와 다양한 기능을 꼼꼼하게 리뷰하여 게이머들의 허리 건강을 지키는 제품임을 어필하겠습니다.'
            }
        ]
    }
];

async function seedAdSolicitation() {
    console.log('🚀 Launching browser for Ad Solicitation Seeding (15+ Personas)...');
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();

    console.log(`🚀 Target: ${TARGET_URL}`);

    // Loop through personas
    for (let i = 0; i < PERSONAS.length; i++) {
        const persona = PERSONAS[i];
        console.log(`\n[${i + 1}/${PERSONAS.length}] 👤 Processing: ${persona.name}`);

        try {
            // Setup Robust Dialog Handler (re-added each iteration safer? no, cleaner to add once but loop safety matters)
            // Ideally setup once per page, but if page crashes/reloads? 
            // We just reuse valid page.
            page.on('dialog', async dialog => {
                const msg = dialog.message();
                // console.log(`    🔔 Alert: ${msg}`); // Reduce noise
                try { await dialog.accept(); } catch (e) { }
            });

            // 0. Ensure Clean State
            try {
                if (page.url() === 'about:blank' || !page.url().startsWith(TARGET_URL)) {
                    await page.goto(TARGET_URL);
                }
                await page.evaluate(() => localStorage.clear());
                await page.evaluate(() => sessionStorage.clear());
                await context.clearCookies();
            } catch (e) {
                // Ignore cleanup errors
            }

            // 1. Signup
            await page.goto(`${TARGET_URL}/signup`);
            await page.click('button:has-text("크리에이터")');
            await page.fill('#creator-name', persona.name);
            await page.fill('#creator-email', persona.email);
            await page.fill('#creator-pw', persona.password);

            await page.click('button:has-text("이메일로 가입하기")');

            // Wait/Check
            try {
                await Promise.race([
                    page.waitForSelector('text=회원가입 이메일을 보냈습니다', { timeout: 3000 }),
                    page.waitForSelector('.text-red-500', { timeout: 3000 })
                ]);
            } catch (e) { }

            try {
                await page.click('text=로그인 페이지로 이동', { timeout: 5000 });
            } catch (e) { }

            // 2. Login
            await page.waitForTimeout(500);
            if (!page.url().includes('/login')) await page.goto(`${TARGET_URL}/login`);

            await page.click('button:has-text("크리에이터")');
            await page.fill('#creator-id', persona.email);
            await page.fill('#creator-pw', persona.password);
            await page.click('button:has-text("로그인하기")');

            try {
                await page.waitForURL(/.*\/creator/, { timeout: 10000 });
            } catch (e) {
                console.log(`    ❌ Login failed/timeout. Skip.`);
                continue;
            }

            // 3. Update Profile
            await page.goto(`${TARGET_URL}/creator/settings`);
            // Upload Avatar
            try {
                // Handle hidden input
                await page.setInputFiles('input[type="file"]', persona.imagePath);
                await page.waitForTimeout(2000); // Image upload time
            } catch (e) {
                console.log(`    ⚠️ Image upload failed: ${e.message}`);
            }

            await page.fill('#handle', persona.handle);
            await page.fill('#bio', persona.bio);
            await page.click('button:has-text("저장하기")');
            await page.waitForTimeout(1000);

            // 4. Create Moments
            for (const moment of persona.moments) {
                await page.goto(`${TARGET_URL}/creator/new`);
                await page.fill('#title', moment.title);
                await page.click(`button:has-text("${persona.category}")`);
                await page.fill('input[placeholder*="광고 진행이 가능한"]', moment.targetProduct);

                // Month = 2월
                await page.click(`.grid-cols-3 >> nth=0 >> button:has-text("${moment.month}")`);
                // Posting Month = Random (e.g. 3월)
                await page.click(`.grid-cols-3 >> nth=1 >> button:has-text("3월")`);

                await page.fill('#description', moment.description);
                await page.click('button:has-text("모먼트 등록하기")');
                await page.waitForTimeout(1000);
            }
            console.log(`    ✅ Success.`);

        } catch (e) {
            console.error(`    ❌ Error: ${e.message}`);
        }
    }

    await browser.close();
    console.log('🎉 Ad Solicitation Seeding Complete!');
}

seedAdSolicitation();
