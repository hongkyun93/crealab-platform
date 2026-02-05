import { InfluencerEvent, Product } from "@/components/providers/platform-provider"

export const MOCK_PRODUCTS: Product[] = [
    // Tech & Electronics
    { id: "101", brandId: "brand_samsung", brandName: "SAMSUNG", name: "Galaxy Watch 6 Classic", price: 459000, image: "⌚️", link: "https://samsung.com", points: "수면 코칭, 베젤 링", shots: "착용샷, 운동샷", category: "테크", isMock: true },
    { id: "102", brandId: "brand_sony", brandName: "Sony", name: "WH-1000XM5", price: 479000, image: "🎧", link: "https://sony.com", points: "최고의 노이즈 캔슬링", shots: "지하철 착용, 카페 착용", category: "테크", isMock: true },
    { id: "103", brandId: "brand_apple", brandName: "Apple", name: "iPad Air 5", price: 929000, image: "📱", link: "https://apple.com", points: "M1 칩 성능, 가벼운 무게", shots: "드로잉, 필기", category: "테크", isMock: true },
    { id: "104", brandId: "brand_lg", brandName: "LG", name: "Gram 17", price: 1890000, image: "💻", link: "https://lge.com", points: "초경량 대화면", shots: "카페 작업, 휴대", category: "테크", isMock: true },
    { id: "105", brandId: "brand_canon", brandName: "Canon", name: "EOS R50", price: 1100000, image: "📷", link: "https://canon.com", points: "브이로그 최적화", shots: "촬영 모습, 결과물", category: "테크", isMock: true },
    { id: "106", brandId: "brand_logitech", brandName: "Logitech", name: "MX Master 3S", price: 139000, image: "🖱️", link: "https://logitech.com", points: "무소음, 인체공학", shots: "데스크 셋업", category: "테크", isMock: true },
    { id: "107", brandId: "brand_dyson", brandName: "Dyson", name: "Supersonic Shine", price: 580000, image: "💇‍♀️", link: "https://dyson.com", points: "모발 손상 방지", shots: "사용 전후", category: "테크", isMock: true },
    { id: "108", brandId: "brand_nintendo", brandName: "Nintendo", name: "Switch OLED", price: 415000, image: "🎮", link: "https://nintendo.com", points: "선명한 화질", shots: "게임 플레이, 독 모드", category: "테크", isMock: true },
    { id: "109", brandId: "brand_gopro", brandName: "GoPro", name: "Hero 12", price: 550000, image: "📹", link: "https://gopro.com", points: "강력한 손떨림 방지", shots: "액티비티, 수중 촬영", category: "테크", isMock: true },
    { id: "110", brandId: "brand_anker", brandName: "Anker", name: "MagGo 보조배터리", price: 69000, image: "🔋", link: "https://anker.com", points: "맥세이프 호환", shots: "충전 중 사용", category: "테크", isMock: true },

    // Fashion & Sport
    { id: "201", brandId: "brand_nike", brandName: "Nike", name: "Pegasus 40", price: 159000, image: "👟", link: "https://nike.com", points: "데일리 러닝", shots: "러닝 중", category: "스포츠", isMock: true },
    { id: "202", brandId: "brand_adidas", brandName: "Adidas", name: "Samba OG", price: 139000, image: "👟", link: "https://adidas.com", points: "클래식 디자인", shots: "데일리룩", category: "패션", isMock: true },
    { id: "203", brandId: "brand_nb", brandName: "New Balance", name: "993 Grey", price: 259000, image: "👟", link: "https://newbalance.com", points: "편안한 착화감", shots: "전신 코디", category: "패션", isMock: true },
    { id: "204", brandId: "brand_patagonia", brandName: "Patagonia", name: "배기스 쇼츠", price: 89000, image: "🩳", link: "https://patagonia.com", points: "친환경 소재, 다용도", shots: "여행, 물놀이", category: "패션", isMock: true },
    { id: "205", brandId: "brand_ralph", brandName: "Ralph Lauren", name: "옥스포드 셔츠", price: 169000, image: "👔", link: "https://ralphlauren.com", points: "클래식 핏", shots: "데이트룩", category: "패션", isMock: true },
    { id: "206", brandId: "brand_gentle", brandName: "Gentle Monster", name: "Lilit 01", price: 269000, image: "🕶️", link: "https://gentlemonster.com", points: "트렌디한 쉐입", shots: "셀카, 착용컷", category: "패션", isMock: true },
    { id: "207", brandId: "brand_lululemon", brandName: "Lululemon", name: "Align Leggings", price: 138000, image: "🧘‍♀️", link: "https://lululemon.com", points: "안 입은 듯한 편안함", shots: "요가, 필라테스", category: "스포츠", isMock: true },
    { id: "208", brandId: "brand_north", brandName: "The North Face", name: "눕시 자켓", price: 329000, image: "🧥", link: "https://thenorthface.com", points: "보온성, 스트릿 무드", shots: "겨울 코디", category: "패션", isMock: true },
    { id: "209", brandId: "brand_stussy", brandName: "Stussy", name: "베이직 티셔츠", price: 68000, image: "👕", link: "https://stussy.com", points: "로고 포인트", shots: "스트릿 패션", category: "패션", isMock: true },
    { id: "210", brandId: "brand_crocs", brandName: "Crocs", name: "클래식 클로그", price: 49000, image: "🐊", link: "https://crocs.com", points: "커스텀 지비츠", shots: "여름 휴가", category: "패션", isMock: true },

    // Beauty
    { id: "301", brandId: "brand_cosrx", brandName: "COSRX", name: "스네일 에센스", price: 26000, image: "🧴", link: "https://cosrx.com", points: "수분 진정", shots: "제형 컷", category: "뷰티", isMock: true },
    { id: "302", brandId: "brand_laneige", brandName: "Laneige", name: "네오 쿠션", price: 30000, image: "🪞", link: "https://laneige.com", points: "초밀착 커버", shots: "메이크업 전후", category: "뷰티", isMock: true },
    { id: "303", brandId: "brand_olive", brandName: "Olive Young", name: "케어플러스 패치", price: 7000, image: "🩹", link: "https://oliveyoung.com", points: "트러블 케어", shots: "부착 컷", category: "뷰티", isMock: true },
    { id: "304", brandId: "brand_dior", brandName: "Dior", name: "립 글로우", price: 48000, image: "💄", link: "https://dior.com", points: "국민 립밤", shots: "발색 컷", category: "뷰티", isMock: true },
    { id: "305", brandId: "brand_aesop", brandName: "Aesop", name: "핸드 밤", price: 39000, image: "👐", link: "https://aesop.com", points: "고급스러운 향", shots: "파우치 공개", category: "뷰티", isMock: true },
    { id: "306", brandId: "brand_jo", brandName: "Jo Malone", name: "블랙베리 앤 베이", price: 210000, image: "🌸", link: "https://jomalone.com", points: "시그니처 향", shots: "향수병 연출", category: "뷰티", isMock: true },
    { id: "307", brandId: "brand_medi", brandName: "Mediheal", name: "티트리 마스크", price: 20000, image: "🧖‍♀️", link: "https://mediheal.com", points: "급속 진정", shots: "나이트 루틴", category: "뷰티", isMock: true },
    { id: "308", brandId: "brand_romand", brandName: "Rom&nd", name: "쥬시 래스팅 틴트", price: 13000, image: "👄", link: "https://romand.com", points: "탕후루 광택", shots: "립 발색", category: "뷰티", isMock: true },
    { id: "309", brandId: "brand_innisfree", brandName: "Innisfree", name: "그린티 세럼", price: 24000, image: "🌿", link: "https://innisfree.com", points: "속건조 해결", shots: "스킨케어 루틴", category: "뷰티", isMock: true },
    { id: "310", brandId: "brand_tamburins", brandName: "Tamburins", name: "퍼퓸 핸드", price: 35000, image: "🧴", link: "https://tamburins.com", points: "오브제 디자인", shots: "가방 속 잇템", category: "뷰티", isMock: true },

    // Food & Living
    { id: "401", brandId: "brand_starbucks", brandName: "Starbucks", name: "캡슐 커피", price: 9000, image: "☕️", link: "https://starbucks.com", points: "홈카페", shots: "커피 내리는 영상", category: "푸드", isMock: true },
    { id: "402", brandId: "brand_ikea", brandName: "IKEA", name: "LERBERG 선반", price: 25000, image: "🗄️", link: "https://ikea.com", points: "국민 선반", shots: "인테리어 전체", category: "리빙", isMock: true },
    { id: "403", brandId: "brand_market", brandName: "Kurly", name: "그릭 요거트", price: 4500, image: "🥣", link: "https://kurly.com", points: "꾸덕함", shots: "요거트 볼 플레이팅", category: "푸드", isMock: true },
    { id: "404", brandId: "brand_today", brandName: "Today's House", name: "호텔식 수건", price: 5000, image: "🧖", link: "https://ohou.se", points: "도톰한 두께", shots: "욕실 배치", category: "리빙", isMock: true },
    { id: "405", brandId: "brand_balmuda", brandName: "Balmuda", name: "토스터기", price: 360000, image: "🍞", link: "https://balmuda.com", points: "겉바속촉", shots: "토스트 조리", category: "리빙", isMock: true },
    { id: "406", brandId: "brand_osulloc", brandName: "Osulloc", name: "녹차 밀크 스프레드", price: 9500, image: "🍵", link: "https://osulloc.com", points: "진한 녹차맛", shots: "빵 종류별 시식", category: "푸드", isMock: true },
    { id: "407", brandId: "brand_cookat", brandName: "Cookat", name: "딸기 찹쌀떡", price: 10900, image: "🍡", link: "https://cookat.com", points: "달콤 쫀득", shots: "반갈샷", category: "푸드", isMock: true },
    { id: "408", brandId: "brand_lecreuset", brandName: "Le Creuset", name: "머그컵 세트", price: 45000, image: "☕️", link: "https://lecreuset.com", points: "선물용 추천", shots: "티타임", category: "리빙", isMock: true },
    { id: "409", brandId: "brand_cj", brandName: "CJ", name: "고메 소바바 치킨", price: 8900, image: "🍗", link: "https://cj.com", points: "단짠 소이소스", shots: "야식 먹방", category: "푸드", isMock: true },
    { id: "410", brandId: "brand_dasoni", brandName: "Dasoni", name: "규조토 발매트", price: 15000, image: "👣", link: "https://dasoni.com", points: "빠른 건조", shots: "사용 영상", category: "리빙", isMock: true },

    // Wedding
    { id: "601", brandId: "brand_duo", brandName: "듀오", name: "결혼정보 서비스", price: 3000000, image: "💍", link: "https://duo.co.kr", points: "성혼율 1위", shots: "상담 후기", category: "웨딩", isMock: true },
    { id: "602", brandId: "brand_sdm", brandName: "스드메 패키지", name: "웨딩 토탈 케어", price: 2500000, image: "👰‍♀️", link: "https://wedding.com", points: "합리적 가격", shots: "피팅 촬영", category: "웨딩", isMock: true },

    // Others (Books, Travel, Kids)
    { id: "501", brandId: "brand_millie", brandName: "Millie", name: "전자책 1년 구독", price: 99000, image: "📚", link: "https://millie.co.kr", points: "독서 습관", shots: "아이패드 독서", category: "라이프", isMock: true },
    { id: "502", brandId: "brand_yanolja", brandName: "Yanolja", name: "풀빌라 숙박권", price: 350000, image: "🏨", link: "https://yanolja.com", points: "프라이빗 수영장", shots: "수영복 샷", category: "여행", isMock: true },
    { id: "503", brandId: "brand_lego", brandName: "Lego", name: "꽃다발 세트", price: 79000, image: "💐", link: "https://lego.com", points: "시들지 않는 꽃", shots: "조립 과정", category: "취미", isMock: true },
    { id: "504", brandId: "brand_pet", brandName: "Pet Friends", name: "강아지 유모차", price: 150000, image: "🐕", link: "https://pet.com", points: "편안한 주행", shots: "산책 영상", category: "반려동물", isMock: true },
    { id: "505", brandId: "brand_pinkfong", brandName: "Pinkfong", name: "아기상어 인형", price: 25000, image: "🦈", link: "https://pinkfong.com", points: "노래 나오는 인형", shots: "아이와 함께", category: "육아", isMock: true },
    { id: "506", brandId: "brand_class101", brandName: "Class101", name: "아이패드 드로잉", price: 180000, image: "🎨", link: "https://class101.net", points: "취미 찾기", shots: "그림 완성본", category: "라이프", isMock: true },
    { id: "507", brandId: "brand_monami", brandName: "Monami", name: "153 프리미엄", price: 20000, image: "🖊️", link: "https://monami.com", points: "메탈 바디", shots: "다이어리 꾸미기", category: "라이프", isMock: true },
    { id: "508", brandId: "brand_jeju", brandName: "Jeju Air", name: "제주도 왕복 항공권", price: 80000, image: "✈️", link: "https://jejuair.net", points: "특가 항공권", shots: "비행기 창문샷", category: "여행", isMock: true },
    { id: "509", brandId: "brand_kodak", brandName: "Kodak", name: "미니샷 3", price: 140000, image: "📸", link: "https://kodak.com", points: "레트로 감성", shots: "폴라로이드 꾸미기", category: "취미", isMock: true },
    { id: "510", brandId: "brand_calm", brandName: "Calm", name: "명상 앱 구독", price: 50000, image: "🧘", link: "https://calm.com", points: "숙면, 스트레스 완화", shots: "자기 전 루틴", category: "라이프", isMock: true }
];

export const MOCK_EVENTS: InfluencerEvent[] = [
    // Lifestyle & Living
    {
        id: "101", influencer: "김세라", handle: "@sarah_k", verified: true, avatar: "김", category: "🏡 리빙/인테리어",
        event: "30평대 아파트 리모델링", date: "2026년 3월",
        description: "구축 아파트 올수리 리모델링 과정을 담습니다.",
        tags: ["인테리어", "리모델링", "랜선집들이"], followers: 45000,
        targetProduct: "바닥재, 조명, 욕실 자재", eventDate: "2026년 3월", postingDate: "2026년 4월", isMock: true
    },
    {
        id: "102", influencer: "살림왕", handle: "@home_king", verified: false, avatar: "살", category: "🏡 리빙/인테리어",
        event: "봄맞이 대청소 & 수납 정리", date: "2026년 4월",
        description: "겨울 묵은 짐을 정리하고 수납공간을 재배치합니다.",
        tags: ["청소", "정리정돈", "수납"], followers: 12000,
        targetProduct: "수납함, 정리 용품, 로봇청소기", eventDate: "2026년 4월", postingDate: "2026년 4월", isMock: true
    },
    {
        id: "103", influencer: "식물집사", handle: "@plant_lover", verified: true, avatar: "식", category: "🎨 취미/DIY",
        event: "거실 베란다 정원 꾸미기", date: "2026년 3월",
        description: "삭막한 베란다를 플랜테리어 공간으로 바꿉니다.",
        tags: ["식물", "플랜테리어", "홈가드닝"], followers: 28000,
        targetProduct: "대형 화분, 식물 생장등", eventDate: "2026년 3월", postingDate: "2026년 3월", isMock: true
    },
    {
        id: "104", influencer: "자취생 K", handle: "@single_life", verified: false, avatar: "K", category: "🏡 리빙/인테리어",
        event: "첫 자취 시작 & 이사", date: "2026년 2월",
        description: "대학생의 첫 자취방 꾸미기 브이로그입니다.",
        tags: ["자취", "이사", "원룸"], followers: 5000,
        targetProduct: "매트리스, 1인용 소파, 미니 밥솥", eventDate: "2026년 2월", postingDate: "2026년 2월", isMock: true
    },
    {
        id: "105", influencer: "미니멀리스트", handle: "@empty_space", verified: true, avatar: "미", category: "🏡 리빙/인테리어",
        event: "주방 식기 전면 교체", date: "2026년 5월",
        description: "오래된 플라스틱 용기를 버리고 유리/스테인리스로 교체합니다.",
        tags: ["주방", "제로웨이스트", "살림"], followers: 33000,
        targetProduct: "밀폐용기 세트, 원목 도마", eventDate: "2026년 5월", postingDate: "2026년 5월", isMock: true
    },
    // Health & Fitness
    {
        id: "201", influencer: "박민준", handle: "@minjun_fit", verified: true, avatar: "박", category: "🏋️ 헬스/운동",
        event: "여름 대비 바디프로필", date: "2026년 6월",
        description: "6월 촬영을 목표로 체지방 5%에 도전합니다.",
        tags: ["헬스", "바디프로필", "식단"], followers: 120000,
        targetProduct: "단백질 보충제, 닭가슴살 도시락", eventDate: "2026년 6월", postingDate: "2026년 6월", isMock: true
    },
    {
        id: "202", influencer: "다이어터 찐", handle: "@diet_jjin", verified: false, avatar: "찐", category: "🥗 다이어트",
        event: "결혼식 전 -5kg 감량", date: "2026년 4월",
        description: "친구 결혼식 축가를 위해 급찐급빠 다이어트 돌입!",
        tags: ["다이어트", "급찐급빠", "홈트"], followers: 8000,
        targetProduct: "다이어트 보조제, 샐러드", eventDate: "2026년 4월", postingDate: "2026년 4월", isMock: true
    },
    {
        id: "203", influencer: "요가 파이어", handle: "@yoga_fire", verified: true, avatar: "요", category: "🏋️ 헬스/운동",
        event: "야외 요가 원데이 클래스", date: "2026년 5월",
        description: "구독자들과 한강에서 야외 요가를 진행합니다.",
        tags: ["요가", "야외운동", "이벤트"], followers: 42000,
        targetProduct: "요가 매트, 요가복, 이온 음료", eventDate: "2026년 5월", postingDate: "2026년 5월", isMock: true
    },
    {
        id: "204", influencer: "러닝 크루", handle: "@run_run", verified: true, avatar: "러", category: "🏋️ 헬스/운동",
        event: "서울 하프 마라톤 출전", date: "2026년 4월",
        description: "크루원 20명과 함께 하프 마라톤 완주에 도전합니다.",
        tags: ["러닝", "마라톤", "크루"], followers: 65000,
        targetProduct: "러닝화, 스포츠 테이핑", eventDate: "2026년 4월", postingDate: "2026년 4월", isMock: true
    },
    {
        id: "205", influencer: "클라이밍", handle: "@wall_climb", verified: true, avatar: "클", category: "🏋️ 헬스/운동",
        event: "자연 암벽 등반 여행", date: "2026년 5월",
        description: "실내를 벗어나 국내 암벽 명소로 2박 3일 떠납니다.",
        tags: ["클라이밍", "암벽등반", "아웃도어"], followers: 23000,
        targetProduct: "클라이밍 팬츠, 초크, 캠핑 장비", eventDate: "2026년 5월", postingDate: "2026년 6월", isMock: true
    },
    // Beauty & Fashion
    {
        id: "301", influencer: "민지 뷰티", handle: "@minji_beauty", verified: true, avatar: "민", category: "💄 뷰티",
        event: "환절기 스킨케어 루틴", date: "2026년 3월",
        description: "미세먼지와 건조함 잡는 나만의 루틴을 공개합니다.",
        tags: ["스킨케어", "환절기", "피부관리"], followers: 350000,
        targetProduct: "진정 앰플, 마스크팩", eventDate: "2026년 3월", postingDate: "2026년 3월", isMock: true
    },
    {
        id: "302", influencer: "데일리룩", handle: "@daily_look", verified: true, avatar: "D", category: "👗 패션",
        event: "벚꽃 놀이 데이트룩 코디", date: "2026년 4월",
        description: "벚꽃 축제 인생샷 건지는 색감 깡패 코디 모음.",
        tags: ["OOTD", "봄코디", "데이트룩"], followers: 120000,
        targetProduct: "원피스, 가디건, 미니백", eventDate: "2026년 4월", postingDate: "2026년 4월", isMock: true
    },
    {
        id: "303", influencer: "코덕 리스트", handle: "@cosmetic_duck", verified: false, avatar: "코", category: "💄 뷰티",
        event: "명품 vs 저렴이 반반 메이크업", date: "2026년 3월",
        description: "백화점 파운데이션과 로드샵 제품을 반반 비교합니다.",
        tags: ["메이크업", "비교리뷰", "저렴이"], followers: 18000,
        targetProduct: "파운데이션, 쿠션", eventDate: "2026년 3월", postingDate: "2026년 3월", isMock: true
    },
    {
        id: "304", influencer: "하객룩", handle: "@wedding_guest", verified: false, avatar: "하", category: "👗 패션",
        event: "5월의 신부, 친구 결혼식", date: "2026년 5월",
        description: "가장 친한 친구 결혼식 사회를 보게 되었습니다.",
        tags: ["하객룩", "결혼식", "정장"], followers: 9000,
        targetProduct: "정장 셋업, 구두, 쥬얼리", eventDate: "2026년 5월", postingDate: "2026년 5월", isMock: true
    },
    {
        id: "305", influencer: "명품 하울", handle: "@luxury_haul", verified: true, avatar: "명", category: "👗 패션",
        event: "도쿄 빈티지 쇼핑 투어", date: "2026년 6월",
        description: "도쿄 오모테산도 명품 빈티지 샵을 털어봅니다.",
        tags: ["일본여행", "쇼핑", "하울"], followers: 210000,
        targetProduct: "캐리어, 여행용 파우치", eventDate: "2026년 6월", postingDate: "2026년 6월", isMock: true
    },
    // Adding 35 more items to reach 50
    // --- Tech & Gadgets (Expanding) ---
    {
        id: "401", influencer: "얼리어답터 준", handle: "@early_jun", verified: true, avatar: "준", category: "💻 테크/IT",
        event: "갤럭시 Z 플립6 2주 사용기", date: "2026년 8월",
        description: "실사용자 입장에서 장단점을 솔직하게 분석합니다.\n• 희망 협찬: 케이스, 보호필름, 충전기, 보조배터리\n• 이벤트 시기: 8월 둘째 주\n• 업로드 예정: 8월 20일 리뷰 영상 게시",
        tags: ["스마트폰", "IT리뷰", "갤럭시"], followers: 156000,
        targetProduct: "스마트폰 악세서리", eventDate: "2026년 8월", postingDate: "2026년 8월", isMock: true
    },
    {
        id: "402", influencer: "데스크셋업", handle: "@my_desk_setup", verified: false, avatar: "데", category: "💻 테크/IT",
        event: "화이트 감성 데스크 셋업 완성", date: "2026년 5월",
        description: "모든 기기를 화이트 톤으로 맞춘 데스크테리어를 소개합니다.\n• 희망 협찬: 화이트 키보드, 마우스, 모니터 암, 데스크 매트\n• 이벤트 시기: 5월 초\n• 업로드 예정: 5월 15일 룸투어 업로드",
        tags: ["데스크테리어", "방꾸미기", "IT"], followers: 42000,
        targetProduct: "키보드, 마우스, 모니터암", eventDate: "2026년 5월", postingDate: "2026년 5월", isMock: true
    },
    {
        id: "403", influencer: "카메라 깎는 노인", handle: "@cam_master", verified: true, avatar: "C", category: "💻 테크/IT",
        event: "입문용 미러리스 카메라 추천 가이드", date: "2026년 4월",
        description: "유튜브 시작하는 분들을 위한 가성비 카메라 및 렌즈 추천.\n• 희망 협찬: 입문용 카메라, 삼각대, 조명, 마이크\n• 이벤트 시기: 4월 중순\n• 업로드 예정: 4월 25일 총정리 영상",
        tags: ["카메라", "영상촬영", "유튜브장비"], followers: 89000,
        targetProduct: "카메라 바디, 렌즈", eventDate: "2026년 4월", postingDate: "2026년 4월", isMock: true
    },
    {
        id: "404", influencer: "음향덕후", handle: "@sound_good", verified: false, avatar: "음", category: "💻 테크/IT",
        event: "노이즈 캔슬링 헤드폰 3종 비교", date: "2026년 6월",
        description: "소니, 보스, 애플 헤드폰을 비행기 소음 환경에서 비교합니다.\n• 희망 협찬: 헤드폰 대여 또는 협찬\n• 이벤트 시기: 6월 초 해외 출장 시 테스트\n• 업로드 예정: 6월 15일",
        tags: ["음향기기", "헤드폰", "비교리뷰"], followers: 23000,
        targetProduct: "헤드폰", eventDate: "2026년 6월", postingDate: "2026년 6월", isMock: true
    },
    {
        id: "405", influencer: "개발자 라이프", handle: "@code_life", verified: true, avatar: "Dev", category: "💻 테크/IT",
        event: "판교 개발자의 재택근무 브이로그", date: "2026년 3월",
        description: "효율적인 업무를 위한 장비와 소프트웨어를 소개합니다.\n• 희망 협찬: 인체공학 의자, 버티컬 마우스, 생산성 앱 구독권\n• 이벤트 시기: 3월 한 달간\n• 업로드 예정: 매주 금요일 퇴근 후",
        tags: ["개발자", "재택근무", "생산성"], followers: 55000,
        targetProduct: "인체공학 의자, 마우스", eventDate: "2026년 3월", postingDate: "2026년 3월", isMock: true
    },

    // --- Beauty & Fashion (Expanding) ---
    {
        id: "406", influencer: "퍼스널컬러 진단", handle: "@color_match", verified: true, avatar: "P", category: "💄 뷰티",
        event: "여름 쿨톤 인생 립스틱 찾기", date: "2026년 5월",
        description: "여쿨라에게 형광등 켜주는 핑크 립 10종 발색 비교.\n• 희망 협찬: 쿨톤 립 신상, 블러셔\n• 이벤트 시기: 5월 초\n• 업로드 예정: 5월 10일",
        tags: ["퍼스널컬러", "여름쿨톤", "립추천"], followers: 105000,
        targetProduct: "틴트, 립스틱", eventDate: "2026년 5월", postingDate: "2026년 5월", isMock: true
    },
    {
        id: "407", influencer: "맨즈 그루밍", handle: "@man_beauty", verified: false, avatar: "M", category: "💄 뷰티",
        event: "남자 면접 프리패스 헤어 & 메이크업", date: "2026년 9월",
        description: "하반기 공채 시즌 대비 깔끔한 인상 만들기 튜토리얼.\n• 희망 협찬: 남성용 비비크림, 헤어 왁스, 눈썹 칼\n• 이벤트 시기: 9월 공채 시즌\n• 업로드 예정: 9월 1일",
        tags: ["남자메이크업", "면접", "그루밍"], followers: 32000,
        targetProduct: "남성 화장품, 헤어제품", eventDate: "2026년 8월", postingDate: "2026년 9월", isMock: true
    },
    {
        id: "408", influencer: "키작녀 코디", handle: "@155_cm", verified: true, avatar: "키", category: "👗 패션",
        event: "키 155cm의 비율 좋아보이는 가을 코디", date: "2026년 9월",
        description: "수선 없이 입는 슬랙스와 부츠컷 데님 추천.\n• 희망 협찬: 키작녀 전용 쇼핑몰 의류, 굽 있는 운동화\n• 이벤트 시기: 9월 중순\n• 업로드 예정: 9월 20일 룩북",
        tags: ["키작녀", "가을코디", "데일리룩"], followers: 180000,
        targetProduct: "바지, 운동화", eventDate: "2026년 9월", postingDate: "2026년 9월", isMock: true
    },
    {
        id: "409", influencer: "스트릿 패션왕", handle: "@street_mood", verified: true, avatar: "S", category: "👗 패션",
        event: "성수동 팝업스토어 투어 룩", date: "2026년 4월",
        description: "요즘 핫한 성수동 팝업들을 돌며 입기 좋은 힙한 코디.\n• 희망 협찬: 오버핏 후드, 카고 팬츠, 메신저백\n• 이벤트 시기: 4월 주말\n• 업로드 예정: 4월 15일",
        tags: ["스트릿", "성수동", "OOTD"], followers: 210000,
        targetProduct: "스트릿 의류, 가방", eventDate: "2026년 4월", postingDate: "2026년 4월", isMock: true
    },
    {
        id: "410", influencer: "네일 아티스트", handle: "@nail_art_j", verified: false, avatar: "N", category: "💄 뷰티",
        event: "집에서 하는 셀프 젤네일 꿀팁", date: "2026년 3월",
        description: "샵 가지 않고도 퀄리티 있게! 지속력 높이는 방법 공개.\n• 희망 협찬: 젤네일 키트, 램프, 파츠\n• 이벤트 시기: 3월 초\n• 업로드 예정: 3월 5일",
        tags: ["셀프네일", "젤네일", "취미"], followers: 28000,
        targetProduct: "젤네일 세트", eventDate: "2026년 3월", postingDate: "2026년 3월", isMock: true
    },

    // --- Food & Cooking (Expanding) ---
    {
        id: "411", influencer: "디저트 헌터", handle: "@sweet_tooth", verified: true, avatar: "디", category: "🍽️ 맛집",
        event: "전국 빵지순례 1탄: 대전 성심당", date: "2026년 4월",
        description: "튀김소보로 외에 숨겨진 존맛 빵들을 털어옵니다.\n• 희망 협찬: KTX, 대전 숙소, 빵 보관 용기\n• 이벤트 시기: 4월 초\n• 업로드 예정: 4월 8일 먹방",
        tags: ["빵지순례", "디저트", "먹방"], followers: 75000,
        targetProduct: "밀폐용기, 여행상품", eventDate: "2026년 4월", postingDate: "2026년 4월", isMock: true
    },
    {
        id: "412", influencer: "자취요리 뚝딱", handle: "@one_pan_cook", verified: true, avatar: "뚝", category: "🍽️ 맛집",
        event: "배달비 아끼는 만원 일주일 식단", date: "2026년 5월",
        description: "고물가 시대, 식비 방어를 위한 초가성비 레시피.\n• 희망 협찬: 대용량 식자재, 소스류, 밀키트\n• 이벤트 시기: 5월 한 주간 도전\n• 업로드 예정: 5월 말 결산 영상",
        tags: ["절약", "집밥", "식비방어"], followers: 330000,
        targetProduct: "식료품, 주방용품", eventDate: "2026년 5월", postingDate: "2026년 5월", isMock: true
    },
    {
        id: "413", influencer: "비건 라이프", handle: "@vegan_table", verified: false, avatar: "V", category: "🍽️ 맛집",
        event: "맛있어서 놀라는 비건 데이트 맛집", date: "2026년 6월",
        description: "비건이 아닌 친구도 만족하는 서울 비건 레스토랑 탐방.\n• 희망 협찬: 비건 화장품, 텀블러, 친환경 제품\n• 이벤트 시기: 6월 주말\n• 업로드 예정: 6월 10일",
        tags: ["비건", "채식", "친환경"], followers: 15000,
        targetProduct: "비건 식품, 친환경 제품", eventDate: "2026년 6월", postingDate: "2026년 6월", isMock: true
    },
    {
        id: "414", influencer: "술꾼 도시 여자", handle: "@city_drink", verified: true, avatar: "술", category: "🍽️ 맛집",
        event: "전통주 칵테일 홈파티", date: "2026년 12월",
        description: "연말 파티에 어울리는 전통주 하이볼 레시피 소개.\n• 희망 협찬: 전통주, 예쁜 잔, 파티 용품\n• 이벤트 시기: 12월 24일\n• 업로드 예정: 12월 20일 미리보기",
        tags: ["홈파티", "전통주", "칵테일"], followers: 92000,
        targetProduct: "주류, 글라스", eventDate: "2026년 12월", postingDate: "2026년 12월", isMock: true
    },
    {
        id: "415", influencer: "프로 캠핑러", handle: "@camp_master", verified: true, avatar: "캠", category: "✈️ 여행",
        event: "그리들로 만드는 캠핑 요리 5선", date: "2026년 10월",
        description: "삼겹살부터 볶음밥까지 그리들 하나로 끝내는 코스.\n• 희망 협찬: 그리들, 버너, 밀키트, 캠핑 체어\n• 이벤트 시기: 10월 가을 캠핑\n• 업로드 예정: 10월 15일",
        tags: ["캠핑요리", "먹방", "가을캠핑"], followers: 160000,
        targetProduct: "캠핑 조리도구", eventDate: "2026년 10월", postingDate: "2026년 10월", isMock: true
    },

    // --- Travel & Activity (Expanding) ---
    {
        id: "416", influencer: "여행 작가 김", handle: "@travel_writer", verified: true, avatar: "작", category: "✈️ 여행",
        event: "나홀로 떠나는 교토 감성 여행", date: "2026년 11월",
        description: "가을 단풍이 아름다운 교토의 숨은 명소와 카페 기록.\n• 희망 협찬: 필름 카메라, 데이터 유심, 여행자 보험\n• 이벤트 시기: 11월 중순\n• 업로드 예정: 11월 말 여행 에세이 영상",
        tags: ["일본여행", "교토", "감성여행"], followers: 85000,
        targetProduct: "여행 필수품, 카메라", eventDate: "2026년 11월", postingDate: "2026년 11월", isMock: true
    },
    {
        id: "417", influencer: "고프로 장인", handle: "@action_cam", verified: true, avatar: "G", category: "✈️ 여행",
        event: "양양 서핑 강습 브이로그", date: "2026년 7월",
        description: "서핑 초보의 좌충우돌 강습기와 양양 핫플 소개.\n• 희망 협찬: 래쉬가드, 선스틱, 액션캠 악세서리\n• 이벤트 시기: 7월 서핑 시즌\n• 업로드 예정: 8월 초",
        tags: ["서핑", "양양", "액티비티"], followers: 45000,
        targetProduct: "수영복, 액션캠", eventDate: "2026년 7월", postingDate: "2026년 8월", isMock: true
    },
    {
        id: "418", influencer: "차박 캠퍼", handle: "@car_camping", verified: false, avatar: "차", category: "✈️ 여행",
        event: "경차로 떠나는 스텔스 차박", date: "2026년 5월",
        description: "퇴근 후 바로 떠나는 미니멀 차박 노하우.\n• 희망 협찬: 차박 텐트, 차량용 매트, 보조배터리\n• 이벤트 시기: 5월 주말\n• 업로드 예정: 5월 20일",
        tags: ["차박", "미니멀캠핑", "여행"], followers: 27000,
        targetProduct: "차박 용품", eventDate: "2026년 5월", postingDate: "2026년 5월", isMock: true
    },
    {
        id: "419", influencer: "호캉스 리뷰어", handle: "@hotel_checkin", verified: true, avatar: "H", category: "✈️ 여행",
        event: "5성급 호텔 라운지 & 수영장 100% 즐기기", date: "2026년 8월",
        description: "서울 호캉스 추천 및 부대시설 이용 꿀팁.\n• 희망 협찬: 수영복, 호캉스룩, 캐리어\n• 이벤트 시기: 8월 휴가철\n• 업로드 예정: 8월 10일",
        tags: ["호캉스", "호텔리뷰", "휴가"], followers: 130000,
        targetProduct: "수영복, 여행 가방", eventDate: "2026년 8월", postingDate: "2026년 8월", isMock: true
    },
    {
        id: "420", influencer: "등산하는 직장인", handle: "@mt_hiker", verified: false, avatar: "산", category: "✈️ 여행",
        event: "한라산 백록담 등반 도전", date: "2026년 10월",
        description: "가을 단풍 시즌 한라산 등반 과정과 준비물 소개.\n• 희망 협찬: 등산화, 등산 스틱, 등산 가방, 행동식\n• 이벤트 시기: 10월 말\n• 업로드 예정: 11월 초 완등 인증",
        tags: ["등산", "한라산", "운동"], followers: 40000,
        targetProduct: "아웃도어 의류/장비", eventDate: "2026년 10월", postingDate: "2026년 11월", isMock: true
    },

    // --- Parenting & Kids (Expanding) ---
    {
        id: "421", influencer: "쌍둥이 맘", handle: "@twins_mom", verified: true, avatar: "쌍", category: "👶 육아",
        event: "쌍둥이 돌잔치 준비 A to Z", date: "2026년 4월",
        description: "답례품 선정부터 성장 동영상 제작까지 모조리 공유해요.\n• 희망 협찬: 아기 정장, 답례품, 돌상 대여\n• 이벤트 시기: 4월 15일\n• 업로드 예정: 4월 30일 후기 영상",
        tags: ["육아", "돌잔치", "쌍둥이"], followers: 62000,
        targetProduct: "육아용품, 행사용품", eventDate: "2026년 4월", postingDate: "2026년 4월", isMock: true
    },
    {
        id: "422", influencer: "육아대디 준빠", handle: "@jun_pa", verified: false, avatar: "준", category: "👶 육아",
        event: "아빠랑 문화센터 가는 날", date: "2026년 3월",
        description: "육아 휴직 중인 아빠의 문화센터 적응기.\n• 희망 협찬: 아기띠, 기저귀 가방, 유아 간식\n• 이벤트 시기: 3월 봄학기 개강\n• 업로드 예정: 매주 수요일",
        tags: ["육아빠", "문화센터", "육아브이로그"], followers: 15000,
        targetProduct: "유아 외출용품", eventDate: "2026년 3월", postingDate: "2026년 3월", isMock: true
    },
    {
        id: "423", influencer: "초등맘 다이어리", handle: "@elementary_mom", verified: true, avatar: "초", category: "👶 육아",
        event: "신학기 아이방 인테리어해주기", date: "2026년 2월",
        description: "초등학교 입학하는 아이를 위해 책상과 침대를 바꿉니다.\n• 희망 협찬: 초등학생 책상, 의자, 스탠드, 침구\n• 이벤트 시기: 2월 입학 전\n• 업로드 예정: 2월 25일 룸투어",
        tags: ["아이방꾸미기", "초등맘", "입학준비"], followers: 89000,
        targetProduct: "키즈 가구, 학용품", eventDate: "2026년 2월", postingDate: "2026년 2월", isMock: true
    },
    {
        id: "424", influencer: "장난감 리뷰왕", handle: "@toy_king", verified: true, avatar: "K", category: "👶 육아",
        event: "어린이날 선물 BEST 5 추천", date: "2026년 5월",
        description: "아이들이 실제로 좋아하는 장난감 솔직 리뷰.\n• 희망 협찬: 인기 장난감, 보드게임\n• 이벤트 시기: 4월 말 촬영\n• 업로드 예정: 5월 1일 특집 영상",
        tags: ["장난감", "육아템", "선물추천"], followers: 250000,
        targetProduct: "완구", eventDate: "2026년 4월", postingDate: "2026년 5월", isMock: true
    },
    {
        id: "425", influencer: "이유식 연구소", handle: "@baby_food_lab", verified: false, avatar: "이", category: "👶 육아",
        event: "후기 이유식 큐브 대량생산", date: "2026년 6월",
        description: "한 번 만들어서 2주 편하게 먹는 토핑 이유식 노하우.\n• 희망 협찬: 이유식 마스터기, 큐브 틀, 이유식 용기\n• 이벤트 시기: 6월 초\n• 업로드 예정: 6월 10일",
        tags: ["이유식", "육아꿀팁", "레시피"], followers: 38000,
        targetProduct: "이유식 조리도구", eventDate: "2026년 6월", postingDate: "2026년 6월", isMock: true
    },

    // --- Pet (Expanding) ---
    {
        id: "426", influencer: "고양이 콩이", handle: "@kong_cat", verified: true, avatar: "콩", category: "🐶 반려동물",
        event: "고양이 다이어트 프로젝트", date: "2026년 4월",
        description: "뚱냥이 탈출을 위한 장난감 사냥 놀이와 식단 관리.\n• 희망 협찬: 다이어트 사료, 자동 장난감, 캣휠\n• 이벤트 시기: 3개월 장기 프로젝트\n• 업로드 예정: 4월부터 격주 연재",
        tags: ["고양이", "반려묘", "다이어트"], followers: 120000,
        targetProduct: "반려동물 사료/용품", eventDate: "2026년 4월", postingDate: "2026년 4월", isMock: true
    },
    {
        id: "427", influencer: "강형욱 제자", handle: "@dog_trainer_wannabe", verified: false, avatar: "강", category: "🐶 반려동물",
        event: "우리 강아지 분리불안 훈련", date: "2026년 3월",
        description: "혼자 있는 강아지를 위한 펫CCTV 설치와 훈련 과정.\n• 희망 협찬: 펫카메라, 노즈워크 장난감, 진정 간식\n• 이벤트 시기: 3월\n• 업로드 예정: 3월 20일",
        tags: ["강아지훈련", "반려견", "펫테크"], followers: 18000,
        targetProduct: "펫 가전", eventDate: "2026년 3월", postingDate: "2026년 3월", isMock: true
    },
    {
        id: "428", influencer: "햄스터 마을", handle: "@hamster_village", verified: true, avatar: "H", category: "🐶 반려동물",
        event: "자연주의 햄스터 케이지 꾸미기", date: "2026년 7월",
        description: "햄스터가 행복한 대형 아크릴 케이지 셋팅.\n• 희망 협찬: 베딩, 은신처, 쳇바퀴\n• 이벤트 시기: 7월 초\n• 업로드 예정: 7월 12일",
        tags: ["햄스터", "소동물", "케이지꾸미기"], followers: 45000,
        targetProduct: "소동물 용품", eventDate: "2026년 7월", postingDate: "2026년 7월", isMock: true
    },

    // --- Self Improvement & Hobbies (Expanding) ---
    {
        id: "429", influencer: "공부하는 직장인", handle: "@study_worker", verified: true, avatar: "공", category: "📚 도서/자기계발",
        event: "퇴근 후 영어회화 마스터하기", date: "2026년 9월",
        description: "하루 30분 전화영어로 비즈니스 회화 정복 도전.\n• 희망 협찬: 영어 학습 앱, 태블릿 PC, 필기구\n• 이벤트 시기: 9월부터 100일 챌린지\n• 업로드 예정: 매일 숏폼 인증",
        tags: ["공부", "자기계발", "영어"], followers: 67000,
        targetProduct: "교육 서비스", eventDate: "2026년 9월", postingDate: "2026년 9월", isMock: true
    },
    {
        id: "430", influencer: "굿노트 장인", handle: "@ipad_diary", verified: true, avatar: "다", category: "🎨 취미/DIY",
        event: "2027년 다이어리 속지 무료 나눔", date: "2026년 12월",
        description: "직접 제작한 아이패드 다이어리 속지를 구독자에게 배포합니다.\n• 희망 협찬: 아이패드 악세서리, 전자책 플랫폼\n• 이벤트 시기: 12월 말\n• 업로드 예정: 12월 25일 크리스마스 선물",
        tags: ["다이어리", "아이패드", "굿노트"], followers: 140000,
        targetProduct: "디지털 문구", eventDate: "2026년 12월", postingDate: "2026년 12월", isMock: true
    },
    {
        id: "431", influencer: "뜨개질 요정", handle: "@knitting_fairy", verified: true, avatar: "실", category: "🎨 취미/DIY",
        event: "자이언트 얀 가방 만들기 라이브", date: "2026년 11월",
        description: "겨울 맞이 포근한 가방 만들기 원데이 클래스 라이브.\n• 희망 협찬: 뜨개실, 라벨, 포장용품\n• 이벤트 시기: 11월 11일 빼빼로데이\n• 업로드 예정: 라이브 방송",
        tags: ["뜨개질", "취미", "DIY"], followers: 58000,
        targetProduct: "DIY 키트", eventDate: "2026년 11월", postingDate: "2026년 11월", isMock: true
    },
    {
        id: "432", influencer: "홈카페 바리스타", handle: "@home_cafe_master", verified: true, avatar: "커", category: "🍽️ 맛집",
        event: "나만의 시그니처 라떼 만들기", date: "2026년 8월",
        description: "여름 덛위를 날려버릴 아이스 라떼 레시피 3종.\n• 희망 협찬: 원두, 시럽, 유리컵, 제빙기\n• 이벤트 시기: 8월 초\n• 업로드 예정: 8월 5일 홈카페 영상",
        tags: ["홈카페", "커피", "레시피"], followers: 210000,
        targetProduct: "커피 용품", eventDate: "2026년 8월", postingDate: "2026년 8월", isMock: true
    },
    {
        id: "433", influencer: "책 읽어주는 남자", handle: "@book_reader", verified: false, avatar: "책", category: "📚 도서/자기계발",
        event: "한 달에 10권 읽기 챌린지", date: "2026년 10월",
        description: "독서의 계절 가을, 함께 책 읽을 구독자 모집.\n• 희망 협찬: 도서, 독서대, 북카페 이용권\n• 이벤트 시기: 10월 한 달\n• 업로드 예정: 매주 책 추천 영상",
        tags: ["독서", "책추천", "자기계발"], followers: 35000,
        targetProduct: "도서", eventDate: "2026년 10월", postingDate: "2026년 10월", isMock: true
    },
    {
        id: "434", influencer: "주식 초보", handle: "@stock_baby", verified: false, avatar: "주", category: "💰 재테크",
        event: "시드머니 1억 모으기 과정 공개", date: "2026년 4월",
        description: "사회초년생의 월급 70% 저축과 주식 투자 기록.\n• 희망 협찬: 투자 관련 도서, 경제 신문 구독권\n• 이벤트 시기: 상시\n• 업로드 예정: 매월 월말 결산",
        tags: ["주식", "재테크", "저축"], followers: 12000,
        targetProduct: "금융 서비스", eventDate: "2026년 4월", postingDate: "2026년 4월", isMock: true
    },
    {
        id: "435", influencer: "미술관 가는 길", handle: "@art_gallery", verified: true, avatar: "A", category: "🎬 영화/문화",
        event: "프리즈 서울 아트페어 브이로그", date: "2026년 9월",
        description: "세계적인 아트페어 프리즈 서울 현장을 담습니다.\n• 희망 협찬: 전시 티켓, 편안한 신발\n• 이벤트 시기: 9월 아트위크\n• 업로드 예정: 9월 10일",
        tags: ["전시", "미술", "문화생활"], followers: 49000,
        targetProduct: "문화/예술 티켓", eventDate: "2026년 9월", postingDate: "2026년 9월", isMock: true
    },

    // --- Wedding (New) ---
    {
        id: "436", influencer: "예신 다이어리", handle: "@wedding_diaries", verified: true, avatar: "👰‍♀️", category: "💍 웨딩/결혼",
        event: "D-100 결혼 준비 브이로그", date: "2026년 9월",
        description: "상견례부터 본식까지 리얼한 결혼 준비 과정을 담습니다.\n• 희망 협찬: 가전, 가구, 청첩장, 답례품\n• 이벤트 시기: 9월부터 매주\n• 업로드 예정: 매주 일요일",
        tags: ["결혼준비", "예비신부", "웨딩"], followers: 24000,
        targetProduct: "가전, 가구, 청첩장", eventDate: "2026년 9월", postingDate: "2026년 10월", isMock: true
    },

    // --- Guest Influencer (Su-min) Private Data ---
    {
        id: "ev_guest_1", influencer: "김수민", handle: "@im_breath_ing", influencerId: "guest_influencer", verified: true, avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop",
        category: "✈️ 여행", event: "7월 제주도 여름 휴가 브이로그", date: "2026년 7월",
        description: "제주도에서의 일주일간의 여름 휴가 브이로그입니다.\n• 희망 협찬: 항공권, 호텔 숙박권, 여름 원피스, 렌터카\n• 업로드 예정: 7월 15일 고정 커뮤니티 & 유튜브 영상",
        tags: ["제주도", "여름휴가", "브이로그"], followers: 5851,
        targetProduct: "항공, 숙박, 의류", eventDate: "2026년 7월", postingDate: "2026년 7월", isMock: true
    },
    {
        id: "ev_guest_2", influencer: "김수민", handle: "@im_breath_ing", influencerId: "guest_influencer", verified: true, avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop",
        category: "💄 뷰티", event: "데일리 썸머 메이크업 튜토리얼", date: "2026년 6월",
        description: "지속력 좋은 여름 무드 메이크업을 소개합니다.\n• 희망 협찬: 선크림, 쿠션 파운데이션, 워터프루프 아이라이너\n• 업로드 예정: 6월 초 릴스 & 숏츠",
        tags: ["메이크업", "여름뷰티", "지속력좋은"], followers: 5851,
        targetProduct: "화장품", eventDate: "2026년 6월", postingDate: "2026년 6월", isMock: true
    },
    {
        id: "ev_guest_3", influencer: "김수민", handle: "@im_breath_ing", influencerId: "guest_influencer", verified: true, avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop",
        category: "🥗 다이어트", event: "운동 시작! 필라테스 10회 챌린지", date: "2026년 5월",
        description: "운동 초보의 필라테스 적응기 및 식단 기록.\n• 희망 협찬: 요가복, 단백질 쉐이크, 스마트 워치\n• 업로드 예정: 주 2회 인스타그램 스토리 & 게시물",
        tags: ["오운완", "필라테스", "다이어트식단"], followers: 5851,
        targetProduct: "요가복, 건강식품", eventDate: "2026년 5월", postingDate: "2026년 5월", isMock: true
    },
    {
        id: "ev_guest_4", influencer: "김수민", handle: "@im_breath_ing", influencerId: "guest_influencer", verified: true, avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop",
        category: "👗 패션", event: "봄맞이 옷장 정리 & 룩북", date: "2026년 4월", status: "completed",
        description: "올해의 봄 패션 아이템 소개 및 룩북 영상.\n• 협찬 완료: 멜린 가디건, ABC 마트 스니커즈\n• 성과: 조회수 1.2만회, 댓글 80개",
        tags: ["봄코디", "룩북", "OOTD"], followers: 5851,
        targetProduct: "봄 의류", eventDate: "2026년 4월", postingDate: "2026년 4월", isMock: true
    },
    {
        id: "ev_guest_5", influencer: "김수민", handle: "@im_breath_ing", influencerId: "guest_influencer", verified: true, avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop",
        category: "✈️ 여행", event: "그랜드 하얏트 제주 호캉스 브이로그", date: "2026년 3월", status: "completed",
        description: "제주도 최고급 호텔에서의 힐링 브이로그.\n• 협찬 완료: 그랜드 하얏트 숙박권, 조식권\n• 성과: 유튜브 조회수 5천회 돌파",
        tags: ["호캉스", "제주여행", "그랜드하얏트"], followers: 5851,
        targetProduct: "호텔 숙박권", eventDate: "2026년 3월", postingDate: "2026년 3월", isMock: true
    }
];

export const MOCK_BRAND_PROPOSALS: any[] = [
    {
        id: "p1",
        brand_id: "brand_samsung",
        influencer_id: "guest_influencer",
        product_name: "Galaxy Watch 6 Classic",
        product_type: "gift",
        compensation_amount: "500,000원",
        has_incentive: true,
        incentive_detail: "판매 수익의 5% 셰어",
        content_type: "인스타그램 릴스 1회, 스토리 2회",
        message: "라이프스타일이 저희 브랜드 지향점과 너무 잘 맞으셔서 제안드립니다!",
        status: "accepted",
        created_at: new Date().toISOString(),
        brand_name: "SAMSUNG", isMock: true
    },
    {
        id: "p2",
        brand_id: "brand_apple",
        influencer_id: "guest_influencer",
        product_name: "iPad Air 5",
        product_type: "gift",
        compensation_amount: "300,000원",
        has_incentive: false,
        incentive_detail: "",
        content_type: "유튜브 브이로그 내 PPL",
        message: "크리에이터님의 작업 방식이 아이패드의 생산성과 잘 어울립니다.",
        status: "pending",
        created_at: new Date().toISOString(),
        brand_name: "Apple", isMock: true
    },
    {
        id: "p3",
        brand_id: "brand_nike",
        influencer_id: "guest_influencer",
        product_name: "Pegasus 40",
        product_type: "gift",
        compensation_amount: "200,000원",
        has_incentive: true,
        incentive_detail: "나이키 멤버십 포인트 10만점",
        content_type: "인스타그램 피드 1회",
        message: "매일 러닝하시는 모습이 인상깊어서 제안드려요!",
        status: "accepted",
        created_at: new Date().toISOString(),
        brand_name: "Nike", isMock: true
    },
    {
        id: "p4",
        brand_id: "brand_dyson",
        influencer_id: "guest_influencer",
        product_name: "Supersonic Shine",
        product_type: "loan",
        compensation_amount: "400,000원",
        has_incentive: false,
        incentive_detail: "",
        content_type: "언박싱 & 튜토리얼 숏츠",
        message: "고급스러운 이미지의 헤어 케어 리뷰를 부탁드리고 싶습니다.",
        status: "offered",
        created_at: new Date().toISOString(),
        brand_name: "Dyson", isMock: true
    },
    {
        id: "p5",
        brand_id: "brand_jeju",
        influencer_id: "guest_influencer",
        event_id: "ev_guest_1",
        product_name: "제주도 왕복 항공권",
        product_type: "gift",
        compensation_amount: "비용 전액 지원",
        has_incentive: false,
        content_type: "유튜브 브이로그 & 릴스 1회",
        message: "제주 여행 브이로그 일정이 있으시다고 해서 항공권을 협찬해드리고 싶습니다!",
        status: "accepted",
        created_at: new Date(Date.now() - 172800000).toISOString(),
        brand_name: "제주항공", isMock: true
    },
    {
        id: "p6",
        brand_id: "brand_laneige",
        influencer_id: "guest_influencer",
        event_id: "ev_guest_2",
        product_name: "네오 쿠션 메이크업 세트",
        product_type: "gift",
        compensation_amount: "300,000원",
        has_incentive: true,
        incentive_detail: "구매 연결 시 추가 보상",
        content_type: "릴스 메이크업 튜토리얼",
        message: "여름용 매트 쿠션 광고주를 찾고 계셔서 제안드립니다.",
        status: "offered",
        created_at: new Date(Date.now() - 86400000).toISOString(),
        brand_name: "라네즈", isMock: true
    },
    {
        id: "p7",
        brand_id: "brand_lululemon",
        influencer_id: "guest_influencer",
        event_id: "ev_guest_3",
        product_name: "Align 요가복 상하의 세트",
        product_type: "gift",
        compensation_amount: "200,000원",
        has_incentive: false,
        content_type: "인스타그램 피드 착용샷",
        message: "운동 챌린지 시작하시는 기념으로 요가복을 보내드리고 싶습니다.",
        status: "accepted",
        created_at: new Date(Date.now() - 259200000).toISOString(),
        brand_name: "룰루레몬", isMock: true
    }
];


export const MOCK_MESSAGES: any[] = [
    {
        id: "m1",
        senderId: "brand_samsung",
        receiverId: "guest_influencer",
        proposalId: "p1",
        content: "안녕하세요! 김수민님, 제안드린 갤럭시 워치 캠페인 확인 부탁드립니다.",
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        read: true,
        senderName: "SAMSUNG",
        isMock: true
    },
    {
        id: "m2",
        senderId: "guest_influencer",
        receiverId: "brand_samsung",
        proposalId: "p1",
        content: "네, 안녕하세요! 확인했습니다. 이번 제품 기능이 너무 좋아서 릴스로 제작하면 반응이 좋을 것 같아요.",
        timestamp: new Date(Date.now() - 82800000).toISOString(),
        read: true,
        senderName: "김수민",
        isMock: true
    },
    {
        id: "m3",
        senderId: "brand_samsung",
        receiverId: "guest_influencer",
        proposalId: "p1",
        content: "좋습니다! 가이드라인 전달드리면 검토 부탁드릴게요.",
        timestamp: new Date(Date.now() - 79200000).toISOString(),
        read: false,
        senderName: "SAMSUNG",
        isMock: true
    },
    {
        id: "m4",
        senderId: "brand_nike",
        receiverId: "guest_influencer",
        proposalId: "p3",
        content: "러닝화 협찬 관련하여 사이즈 문의 드립니다.",
        timestamp: new Date(Date.now() - 43200000).toISOString(),
        read: true,
        senderName: "Nike",
        isMock: true
    },
    {
        id: "m5",
        senderId: "guest_influencer",
        receiverId: "brand_nike",
        proposalId: "p3",
        content: "안녕하세요! 보통 240 신는데, 나이키는 245가 편하더라구요. 245로 부탁드립니다.",
        timestamp: new Date(Date.now() - 36000000).toISOString(),
        read: true,
        senderName: "김수민",
        isMock: true
    },
    {
        id: "m6",
        senderId: "brand_jeju",
        receiverId: "guest_influencer",
        proposalId: "p5",
        content: "안녕하세요 수민님! 제주항공입니다. 제안드린 항공권 협찬 안내받으셨을까요?",
        timestamp: new Date(Date.now() - 172800000).toISOString(),
        read: true,
        senderName: "제주항공",
        isMock: true
    },
    {
        id: "m7",
        senderId: "guest_influencer",
        receiverId: "brand_jeju",
        proposalId: "p5",
        content: "네! 제주행 일정이 있어서 마침 딱 필요했는데 너무 감사합니다. 일정 조율은 어떻게 하면 될까요?",
        timestamp: new Date(Date.now() - 169200000).toISOString(),
        read: true,
        senderName: "김수민",
        isMock: true
    },
    {
        id: "m8",
        senderId: "brand_jeju",
        receiverId: "guest_influencer",
        proposalId: "p5",
        content: "원하시는 날짜와 편명 알려주시면 저희가 바로 발권해드리고 메일로 바우처 보내드리겠습니다.",
        timestamp: new Date(Date.now() - 165600000).toISOString(),
        read: true,
        senderName: "제주항공",
        isMock: true
    },
    {
        id: "m9",
        senderId: "guest_influencer",
        receiverId: "brand_jeju",
        proposalId: "p5",
        content: "감사합니다! 7월 10일 김포-제주 오전 10시편, 7월 17일 제주-김포 오후 4시편으로 부탁드려도 될까요?",
        timestamp: new Date(Date.now() - 162000000).toISOString(),
        read: true,
        senderName: "김수민",
        isMock: true
    },
    {
        id: "m10",
        senderId: "brand_jeju",
        receiverId: "guest_influencer",
        proposalId: "p5",
        content: "네, 해당 편명으로 확인했습니다. 지금 바로 발권 진행하고 확정 메일 보내드릴게요!",
        timestamp: new Date(Date.now() - 158400000).toISOString(),
        read: true,
        senderName: "제주항공",
        isMock: true
    }
];

