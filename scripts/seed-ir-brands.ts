/**
 * IR 데모용 20개 Mock 브랜드 계정 생성
 * 
 * 실행: npx tsx scripts/seed-ir-brands.ts
 * 삭제: npx tsx scripts/seed-ir-brands.ts --delete
 * 
 * 뷰티 8개, 패션 6개, 다이어트/건강 6개 = 총 20개 브랜드
 * 각 브랜드에 2~3개 제품 포함
 */

import { supabase } from './seed-ir-data'

const DEMO_PASSWORD = 'MockUser2026!'

interface BrandDef {
    slug: string
    name: string
    description: string
    category: string
    region: string
    website: string
    products: { name: string; description: string; price: number; category: string; selling_points: string }[]
}

const BRANDS: BrandDef[] = [
    // ── 💄 뷰티 (8개) ──
    {
        slug: 'glowlab',
        name: '글로우랩',
        description: '자연에서 온 클린뷰티. 비건 인증 스킨케어 브랜드. 동물실험 없이 피부 본연의 광채를 되찾아드립니다.',
        category: '💄 뷰티',
        region: '서울',
        website: 'https://glowlab.kr',
        products: [
            { name: '비건 히알루론산 세럼', description: '3중 히알루론산으로 48시간 수분 유지. 비건 인증.', price: 32000, category: '💄 뷰티', selling_points: '- 3중 분자량 히알루론산\n- 비건 인증, 무향\n- 48시간 수분 지속' },
            { name: '그린티 수분크림', description: '제주 유기농 녹차 추출물 72% 함유. 지성~복합성 피부 추천.', price: 38000, category: '💄 뷰티', selling_points: '- 제주 유기농 녹차 72%\n- 산뜻한 수분감\n- 지성/복합성 추천' },
            { name: '카밍 리페어 마스크팩 (10매)', description: '민감성 피부 진정 시트 마스크. 센텔라 + 판테놀 더블 케어.', price: 22000, category: '💄 뷰티', selling_points: '- 센텔라 + 판테놀\n- 0.2mm 초밀착 시트\n- 10매 대용량' },
        ],
    },
    {
        slug: 'lumiere',
        name: '루미에르코스메틱',
        description: '프로 아티스트가 만든 프리미엄 메이크업. 발색력과 지속력의 완벽한 균형.',
        category: '💄 뷰티',
        region: '서울',
        website: 'https://lumiere-cos.kr',
        products: [
            { name: '벨벳 글로우 쿠션 파운데이션', description: '피부결 보정 + 자연스러운 광채. SPF50+/PA+++.', price: 42000, category: '💄 뷰티', selling_points: '- 24시간 밀착 커버\n- SPF50+/PA+++\n- 5가지 컬러' },
            { name: '워터 틴트 립 시리즈', description: '과즙 발색 워터 틴트. 8시간 지속.', price: 18000, category: '💄 뷰티', selling_points: '- 과즙 발색\n- 8시간 지속\n- 12컬러 라인업' },
        ],
    },
    {
        slug: 'hairritual',
        name: '헤어리츄얼',
        description: '두피 과학 기반 프리미엄 헤어케어. 탈모 예방부터 모발 영양까지 한 번에.',
        category: '💄 뷰티',
        region: '서울',
        website: 'https://hairritual.kr',
        products: [
            { name: '두피 강화 탈모 샴푸', description: '비오틴 + 카페인 포뮬라. 식약처 탈모 기능성 인증.', price: 28000, category: '💄 뷰티', selling_points: '- 식약처 탈모 기능성\n- 비오틴 + 카페인\n- 약산성 두피 케어' },
            { name: '글로시 헤어 에센스', description: '아르간오일 기반 모발 코팅 에센스. 열손상 차단.', price: 24000, category: '💄 뷰티', selling_points: '- 아르간오일 78%\n- 열 프로텍션\n- 실크같은 마무리' },
        ],
    },
    {
        slug: 'scentmemory',
        name: '센트메모리',
        description: '기억을 향기로. 한국 니치 퍼퓸 브랜드. 제주의 자연에서 영감받은 유니크한 향.',
        category: '💄 뷰티',
        region: '제주',
        website: 'https://scentmemory.kr',
        products: [
            { name: '제주 동백 오 드 퍼퓸 50ml', description: '동백꽃의 따뜻한 플로럴 노트. 탑: 베르가못, 미들: 동백, 베이스: 샌달우드', price: 78000, category: '💄 뷰티', selling_points: '- 핸드메이드 소량 생산\n- 천연 향료 95%\n- 지속력 8시간+' },
            { name: '한라산 새벽 디퓨저 200ml', description: '한라산 새벽안개를 담은 공간 향기. 우디-허벌 노트.', price: 45000, category: '💄 뷰티', selling_points: '- 리드 6개 포함\n- 3개월 지속\n- 우디-허벌 베이스' },
        ],
    },
    {
        slug: 'derminus',
        name: '더마이너스',
        description: '빼기의 미학. 불필요한 성분을 뺀 민감성 피부 맞춤 스킨케어.',
        category: '💄 뷰티',
        region: '서울',
        website: 'https://derminus.kr',
        products: [
            { name: '제로 자극 진정 토너', description: '성분 7가지만으로 완성한 극저자극 토너. pH 5.5 약산성.', price: 26000, category: '💄 뷰티', selling_points: '- 성분 7가지만\n- pH 5.5\n- 무향 무색소' },
            { name: 'AHA/BHA 각질 패드 (60매)', description: '순한 각질 제거 패드. AHA 1% + BHA 0.5% 저농도 포뮬라.', price: 22000, category: '💄 뷰티', selling_points: '- 저농도 AHA+BHA\n- 양면 사용\n- 60매 대용량' },
        ],
    },
    {
        slug: 'nailpop',
        name: '네일팝',
        description: '집에서 즐기는 셀프 네일아트. 초보도 쉽게, 전문가처럼.',
        category: '💄 뷰티',
        region: '서울',
        website: 'https://nailpop.kr',
        products: [
            { name: '원스텝 젤네일 키트', description: 'LED 램프 + 젤 폴리시 6색 세트. 도구 전체 포함.', price: 48000, category: '💄 뷰티', selling_points: '- LED 램프 포함\n- 6색 젤 폴리시\n- 초보 가이드 동영상' },
            { name: '프리미엄 네일스티커 (20종)', description: '자동 경화 네일 스티커. 붙이기만 하면 완성.', price: 15000, category: '💄 뷰티', selling_points: '- 자동 경화 기술\n- 2주 유지\n- 20가지 디자인' },
        ],
    },
    {
        slug: 'sundayskin',
        name: '선데이스킨',
        description: '매일이 일요일 피부. 선케어 & 톤업 전문 브랜드.',
        category: '💄 뷰티',
        region: '서울',
        website: 'https://sundayskin.kr',
        products: [
            { name: '글로우 톤업 선크림 SPF50+', description: '자연스러운 톤업과 자외선 차단을 동시에.', price: 28000, category: '💄 뷰티', selling_points: '- SPF50+/PA++++\n- 톤업 효과\n- 백탁 없는 수분 포뮬라' },
            { name: '워터프루프 선스틱', description: '야외활동에 최적화된 고밀착 선스틱. 땀·물에도 무너지지 않음.', price: 22000, category: '💄 뷰티', selling_points: '- 워터프루프\n- 휴대 간편\n- 리터치용 최적' },
        ],
    },
    {
        slug: 'eyeblanc',
        name: '아이블랑',
        description: '눈가 전문. 아이크림 하나에 진심인 브랜드.',
        category: '💄 뷰티',
        region: '서울',
        website: 'https://eyeblanc.kr',
        products: [
            { name: '펩타이드 아이크림', description: '펩타이드 5종 + 레티놀로 눈가 잔주름 케어.', price: 45000, category: '💄 뷰티', selling_points: '- 펩타이드 5종 복합체\n- 레티놀 0.1%\n- 눈가 전용 설계' },
            { name: '콜라겐 아이패치 (30쌍)', description: '즉각 보습 + 탄력 아이패치. 10분 케어로 눈가 생기.', price: 32000, category: '💄 뷰티', selling_points: '- 마린콜라겐\n- 10분 즉각 효과\n- 30쌍 한달분' },
        ],
    },
    // ── 👗 패션 (6개) ──
    {
        slug: 'musecloset',
        name: '뮤즈클로젯',
        description: '20~30대 여성을 위한 데일리 페미닌 웨어. 편안함 속 세련미.',
        category: '👗 패션',
        region: '서울',
        website: 'https://musecloset.kr',
        products: [
            { name: 'S/S 린넨 블렌디드 셋업', description: '린넨 55% 혼방으로 구김 최소화. 오피스+데일리 겸용.', price: 89000, category: '👗 패션', selling_points: '- 린넨 55% + 폴리 45%\n- 자켓 + 팬츠 세트\n- 3컬러' },
            { name: '플리츠 미디원피스', description: '은은한 광택의 플리츠 원피스. 하객룩 + 데이트룩.', price: 65000, category: '👗 패션', selling_points: '- 플리츠 디테일\n- 백지퍼 포인트\n- S/M/L' },
        ],
    },
    {
        slug: 'mentree',
        name: '멘트리',
        description: '심플한 남성 캐주얼의 정석. 미니멀한 디자인, 편안한 핏.',
        category: '👗 패션',
        region: '서울',
        website: 'https://mentree.kr',
        products: [
            { name: '와이드 핏 치노 슬랙스', description: '데일리+출근룩 겸용 와이드 핏. 논아이론 소재.', price: 49000, category: '👗 패션', selling_points: '- 논아이론 소재\n- 와이드 핏\n- 5컬러' },
            { name: '오버핏 옥스포드 셔츠', description: '100% 면 옥스포드 원단. 레이어드에 최적화.', price: 39000, category: '👗 패션', selling_points: '- 100% 면\n- 오버핏 실루엣\n- 7컬러' },
        ],
    },
    {
        slug: 'flexable',
        name: '플렉서블',
        description: '운동할 때도 일상에서도. 하이테크 애슬레저 브랜드.',
        category: '👗 패션',
        region: '성남',
        website: 'https://flexable.kr',
        products: [
            { name: '하이웨이스트 컴프레션 레깅스', description: '4-way 스트레치 + 하이웨이스트. 요가·필라테스·런닝 겸용.', price: 45000, category: '👗 패션', selling_points: '- 4-way 스트레치\n- 하이웨이스트\n- 스퀏프루프' },
            { name: '브리즈 스포츠브라', description: '통기성 최강 메쉬 패널. 중강도 운동용.', price: 35000, category: '👗 패션', selling_points: '- 메쉬 패널 통기\n- 중강도 서포트\n- 분리형 패드' },
            { name: '쿨링 드라이핏 반팔', description: '냉감 기능성 원단. 자외선 차단 UPF 50+.', price: 29000, category: '👗 패션', selling_points: '- 냉감 원단\n- UPF 50+\n- 속건 기능' },
        ],
    },
    {
        slug: 'souljewel',
        name: '소울주얼리',
        description: '925 실버 미니멀 주얼리. 매일 착용하는 데일리 포인트.',
        category: '👗 패션',
        region: '서울',
        website: 'https://souljewelry.kr',
        products: [
            { name: '미니 체인 실버 목걸이', description: '1.5mm 케이블 체인. 925 실버 + 로듐 도금.', price: 38000, category: '👗 패션', selling_points: '- 925 실버\n- 로듐 도금 변색 방지\n- 40/45cm 조절' },
            { name: '트위스트 후프 귀걸이', description: '미니멀 트위스트 디자인. 은침 저알러지.', price: 28000, category: '👗 패션', selling_points: '- 925 은침\n- 저알러지\n- 2사이즈' },
        ],
    },
    {
        slug: 'urbanbag',
        name: '어반백',
        description: '도시의 일상을 담는 가방. 기능성과 디자인의 조화.',
        category: '👗 패션',
        region: '서울',
        website: 'https://urbanbag.kr',
        products: [
            { name: '소프트 레더 미니 토트백', description: '비건 레더 미니 토트. 크로스바디 스트랩 포함.', price: 59000, category: '👗 패션', selling_points: '- 비건 레더\n- 탈착식 스트랩\n- 6포켓 수납' },
            { name: '나일론 크로스백', description: '방수 나일론 경량 크로스백. 출퇴근 + 여행용.', price: 42000, category: '👗 패션', selling_points: '- 방수 나일론\n- 270g 초경량\n- RFID 차단 포켓' },
        ],
    },
    {
        slug: 'fromseoul',
        name: '프롬서울',
        description: 'K-패션 편집숍. 서울 감성 스트리트 캐주얼.',
        category: '👗 패션',
        region: '서울',
        website: 'https://fromseoul.kr',
        products: [
            { name: '오버사이즈 데님 자켓', description: '빈티지 워싱 데님. 남녀공용 유니섹스.', price: 79000, category: '👗 패션', selling_points: '- 빈티지 워싱\n- 유니섹스 핏\n- FREE 사이즈' },
            { name: '와이드 카고 팬츠', description: '멀티포켓 와이드 카고. 스트릿 필수템.', price: 55000, category: '👗 패션', selling_points: '- 6포켓 카고\n- 와이드 실루엣\n- 4컬러' },
        ],
    },
    // ── 🥗 다이어트/건강 (6개) ──
    {
        slug: 'fitmeal',
        name: '핏밀',
        description: '맛있는 다이어트의 시작. 고단백 저칼로리 간편식.',
        category: '🥗 다이어트',
        region: '서울',
        website: 'https://fitmeal.kr',
        products: [
            { name: '스팀 닭가슴살 10팩', description: '촉촉한 수비드 닭가슴살. 1팩 130kcal, 단백질 28g.', price: 25000, category: '🥗 다이어트', selling_points: '- 수비드 조리\n- 130kcal/팩\n- 단백질 28g' },
            { name: '곤약면 비빔냉면 5인분', description: '칼로리는 낮추고 포만감은 유지. 곤약 97%.', price: 15000, category: '🥗 다이어트', selling_points: '- 곤약 97%\n- 35kcal/인분\n- 비빔장 포함' },
            { name: '프로틴 도시락 정기배송 (주 5회)', description: '맞춤 칼로리 도시락. 영양사 설계.', price: 89000, category: '🥗 다이어트', selling_points: '- 영양사 설계\n- 주 5회 배송\n- 400~600kcal 선택' },
        ],
    },
    {
        slug: 'proteinlab',
        name: '프로틴랩',
        description: '운동하는 사람들의 단백질 연구소. 순수 원료, 과학적 배합.',
        category: '🥗 다이어트',
        region: '성남',
        website: 'https://proteinlab.kr',
        products: [
            { name: 'WPI 분리유청 프로틴 1kg', description: '순도 90% 분리유청. 인공감미료 무첨가.', price: 52000, category: '🥗 다이어트', selling_points: '- WPI 순도 90%\n- 인공감미료 무첨가\n- 초코/바닐라/딸기' },
            { name: '프로틴바 12개입', description: '1개당 단백질 20g. 간식 대용 고단백 바.', price: 28000, category: '🥗 다이어트', selling_points: '- 단백질 20g/개\n- 설탕 2g 이하\n- 4가지 맛' },
        ],
    },
    {
        slug: 'greendetox',
        name: '그린디톡스',
        description: '내 몸의 리셋 버튼. 유기농 착즙 클렌즈 주스.',
        category: '🥗 다이어트',
        region: '서울',
        website: 'https://greendetox.kr',
        products: [
            { name: '3일 클렌즈 주스 패키지', description: '1일 6병 × 3일. 유기농 과일·채소 100% 착즙.', price: 89000, category: '🥗 다이어트', selling_points: '- 유기농 100%\n- 1일 6병 구성\n- 냉장 익일배송' },
            { name: '그린 스무디 파우더', description: '케일+시금치+바나나 동결건조 파우더. 물에 타먹는 간편 그린주스.', price: 35000, category: '🥗 다이어트', selling_points: '- 동결건조 원물\n- 1회분 개별포장\n- 30일분' },
        ],
    },
    {
        slug: 'nutricore',
        name: '뉴트리코어',
        description: '건강기능식품의 핵심만. 과학적 근거 기반 영양 보충제.',
        category: '💊 건강',
        region: '서울',
        website: 'https://nutricore.kr',
        products: [
            { name: '올인원 종합비타민', description: '비타민 13종 + 미네랄 8종. 하루 1정으로 끝.', price: 32000, category: '💊 건강', selling_points: '- 비타민 13종\n- 미네랄 8종\n- 90정 3개월분' },
            { name: 'rTG 오메가3 1000mg', description: '초임계 추출 rTG 오메가3. 1일 1캡슐.', price: 38000, category: '💊 건강', selling_points: '- rTG 형태\n- EPA+DHA 1000mg\n- 60캡슐 2개월분' },
            { name: '저분자 콜라겐 + 비오틴', description: '피부 + 모발 동시 케어. 저분자 피쉬콜라겐.', price: 42000, category: '💊 건강', selling_points: '- 저분자 1000달톤\n- 비오틴 복합\n- 30포 1개월분' },
        ],
    },
    {
        slug: 'hometrainer',
        name: '홈트레이너',
        description: '집이 곧 헬스장. 스마트 홈트레이닝 장비와 앱.',
        category: '🥗 다이어트',
        region: '서울',
        website: 'https://hometrainer.kr',
        products: [
            { name: '스마트 폼롤러', description: '진동 마사지 + 앱 연동 폼롤러. 4단계 강도 조절.', price: 69000, category: '🥗 다이어트', selling_points: '- 4단계 진동\n- 블루투스 앱 연동\n- 충전식 6시간 사용' },
            { name: '저항밴드 5종 세트', description: '5가지 강도 라텍스 저항밴드. 수납 파우치 포함.', price: 25000, category: '🥗 다이어트', selling_points: '- 5가지 강도\n- 천연 라텍스\n- 파우치 포함' },
        ],
    },
    {
        slug: 'slimplan',
        name: '슬림플랜',
        description: '체중관리 토탈 솔루션. 앱 + 식품으로 체계적으로.',
        category: '🥗 다이어트',
        region: '서울',
        website: 'https://slimplan.kr',
        products: [
            { name: '다이어트 프로틴 쉐이크', description: '1팩 150kcal, 단백질 25g. 식사 대용 쉐이크.', price: 38000, category: '🥗 다이어트', selling_points: '- 150kcal/팩\n- 단백질 25g\n- 초코/바닐라/딸기' },
            { name: '저칼로리 시리얼바 12개입', description: '1개 80kcal 간식용 시리얼바. 식이섬유 풍부.', price: 18000, category: '🥗 다이어트', selling_points: '- 80kcal/개\n- 식이섬유 5g\n- 4가지 맛' },
        ],
    },
]

async function main() {
    const isDelete = process.argv.includes('--delete')

    if (isDelete) {
        console.log('🗑️  20개 브랜드 mock 삭제 중...')

        // Find all brand mocks
        for (const brand of BRANDS) {
            const email = `mock_brand_${brand.slug}@mock.creadypick.com`
            const { data: profile } = await supabase
                .from('profiles')
                .select('id')
                .eq('email', email)
                .maybeSingle()

            if (profile) {
                await supabase.from('brand_products').delete().eq('brand_id', profile.id)
                await supabase.auth.admin.deleteUser(profile.id)
                console.log(`  ✅ ${brand.name} 삭제`)
            }
        }

        // Also delete the original demo brand
        const { data: origBrand } = await supabase.from('profiles').select('id').eq('email', 'mock_brand_demo@mock.creadypick.com').maybeSingle()
        if (origBrand) {
            await supabase.from('brand_products').delete().eq('brand_id', origBrand.id)
            await supabase.auth.admin.deleteUser(origBrand.id)
            console.log('  ✅ 기존 데모 브랜드 삭제')
        }

        console.log('🎉 브랜드 삭제 완료!')
        return
    }

    console.log(`🚀 ${BRANDS.length}개 브랜드 생성 시작...`)
    let brandCount = 0
    let productCount = 0

    for (const brand of BRANDS) {
        const email = `mock_brand_${brand.slug}@mock.creadypick.com`

        // 1. Create auth user
        const { data: authData, error: authErr } = await supabase.auth.admin.createUser({
            email,
            password: DEMO_PASSWORD,
            email_confirm: true,
            user_metadata: { display_name: brand.name, role: 'brand' },
        })

        if (authErr || !authData.user) {
            if (authErr?.message?.includes('already been registered')) {
                console.log(`  ⏭️  ${brand.name} (이미 존재)`)
            } else {
                console.error(`  ❌ ${brand.name} auth 실패:`, authErr?.message)
            }
            continue
        }

        const userId = authData.user.id

        // 2. Update profile
        const { error: profileErr } = await supabase.from('profiles').update({
            display_name: brand.name,
            description: brand.description,
            role: 'brand',
            is_mock: true,
            onboarding_completed: true,
            website: brand.website,
            primary_region: brand.region,
        }).eq('id', userId)

        if (profileErr) {
            console.error(`  ❌ ${brand.name} 프로필 실패:`, profileErr.message)
            continue
        }

        // 3. Create products
        const products = brand.products.map(p => ({
            brand_id: userId,
            name: p.name,
            description: p.description,
            price: p.price,
            category: p.category,
            selling_points: p.selling_points,
            is_mock: true,
        }))

        const { error: prodErr } = await supabase.from('brand_products').insert(products)
        if (prodErr) {
            console.error(`  ❌ ${brand.name} 제품 실패:`, prodErr.message)
        } else {
            productCount += products.length
        }

        brandCount++
        console.log(`  ✅ ${brand.name} (${brand.category}) — 제품 ${products.length}개`)
    }

    console.log('\n' + '═'.repeat(50))
    console.log(`🎉 완료! 브랜드 ${brandCount}개, 제품 ${productCount}개 생성`)
    console.log('═'.repeat(50))
}

main().catch(console.error)
