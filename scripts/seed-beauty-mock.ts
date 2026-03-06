/**
 * 뷰티 전문 가라 데이터 시드 — 브랜드 제품 20개 + 모먼트 20개
 * 실행: npx tsx scripts/seed-beauty-mock.ts
 * 삭제: npx tsx scripts/seed-beauty-mock.ts --delete
 */

import { supabase } from './seed-ir-data'

// ============================================================
// 5개 뷰티 브랜드 계정 (이메일/비밀번호)
// ============================================================
const BEAUTY_BRANDS = [
    {
        email: 'mock_laneige_beauty@mock.creadypick.com',
        name: '라네즈 코리아',
        description: '더마 코스메틱 전문 브랜드. 민감성부터 건성·지성 피부까지 맞춤형 스킨케어 솔루션을 제공합니다.',
        website: 'https://www.laneige.com',
        products: [
            {
                name: '워터 슬리핑 마스크 EX 80ml',
                description: '자는 동안 집중 수분 보충. 프로비타민B5와 미네랄 워터 성분이 수분 장벽을 회복시켜 아침에 탱탱한 피부로 깨어납니다.',
                price: 32000,
                selling_points: '- 8시간 수면 동안 집중 보습\n- 프로비타민B5 + 슬리핑 EX 콤플렉스\n- 끈적임 없는 젤 텍스처\n- 아침 세안 후 바로 촉촉한 피부',
            },
            {
                name: '립 슬리핑 마스크 베리 20g',
                description: '자는 동안 입술에 집중 영양 공급. 베리 향이 은은하고 발색 없이 촉촉하게 입술 각질을 제거합니다.',
                price: 18000,
                selling_points: '- 입술 각질 & 잔주름 케어\n- 달콤한 베리 향\n- 오버나이트 집중 보습\n- 발색 없이 자연스럽게',
            },
            {
                name: '네오쿠션 에어리 N23 쿠션',
                description: '22년 연속 베스트셀러. 가볍고 자연스러운 밀착력으로 하루 종일 촉촉하게 유지됩니다.',
                price: 42000,
                selling_points: '- 밀착력 24시간 지속\n- SPF50+/PA++++\n- 12가지 쉐이드 선택 가능\n- 한 번 펴 바름으로 커버력 완성',
            },
            {
                name: '선크린 에어 피트 SPF50+ 50ml',
                description: '얼굴·몸 모두 사용 가능한 무기자차 선크림. 백탁 없이 투명하게 발리며 끈적임이 없습니다.',
                price: 27000,
                selling_points: '- 무기자차 SPF50+/PA++++\n- 백탁·끈적임 없음\n- 얼굴·몸 겸용\n- 물놀이 후에도 뭉침 없음',
            },
        ],
    },
    {
        email: 'mock_innisfree_beauty@mock.creadypick.com',
        name: '이니스프리 공식',
        description: '제주 자연에서 얻은 신선한 성분으로 만드는 자연주의 뷰티. 클린 뷰티와 지속가능한 패키징을 지향합니다.',
        website: 'https://www.innisfree.com',
        products: [
            {
                name: '그린티 세럼 80ml',
                description: '6,000그루 제주 유기농 녹차밭에서 자란 생그린티 70%로 만든 수분 세럼. 빠른 흡수와 촉촉한 마무리.',
                price: 24000,
                selling_points: '- 생그린티 70% 함유\n- 7초 흡수 경량 텍스처\n- 24시간 수분 유지\n- 하이드라콤플렉스 특허 성분',
            },
            {
                name: '제주 수분 크림 50ml',
                description: '제주 용암수와 히알루론산 5종이 피부 깊숙이 수분을 전달. 건조하고 민감한 피부에 적합.',
                price: 22000,
                selling_points: '- 제주 용암수 성분\n- 히알루론산 5종 복합\n- 피부 장벽 강화\n- 무향/무파라벤 클린 포뮬라',
            },
            {
                name: '화이트 파우더 SPF35 8g',
                description: '피지를 먹고 피부 톤을 화사하게 정리해주는 피니싱 파우더. 촉촉한 쿠션의 마무리 단계에 필수.',
                price: 12000,
                selling_points: '- 피지 흡착 마이크로 파우더\n- 피부 톤 균일하게 보정\n- 컴팩트한 휴대 케이스\n- 리필 가능한 친환경 설계',
            },
            {
                name: '수퍼 화이티닝 크림 50ml',
                description: '나이아신아마이드와 비타민C가 피부 속 멜라닌 생성을 억제. 4주 만에 눈에 띄는 톤 개선.',
                price: 35000,
                selling_points: '- 나이아신아마이드 5% 함유\n- 비타민C 유도체 안정화\n- 4주 사용 시 톤 개선 임상\n- 민감성 피부 피부과 테스트 완료',
            },
        ],
    },
    {
        email: 'mock_sulwhasoo_beauty@mock.creadypick.com',
        name: '설화수 공식',
        description: '한방 성분의 과학적 배합으로 탄생한 프리미엄 한방 뷰티 브랜드. 동양의 미와 현대 기술의 만남.',
        website: 'https://www.sulwhasoo.com',
        products: [
            {
                name: '자음생 에센스 60ml',
                description: '설화수 대표 에센스. 자음생 공법으로 추출한 인삼 성분이 피부 활력을 되살립니다. 탄력·윤기·수분 동시 케어.',
                price: 98000,
                selling_points: '- 인삼 추출 자음생 복합체\n- 피부 탄력 + 수분 + 윤기 동시케어\n- 15년 설화수 베스트셀러\n- 7일 집중 케어 후 피부결 개선',
            },
            {
                name: '설린 크림 75ml',
                description: '밤새 피부를 탄탄하게 리페어하는 야간 크림. 봉독 성분이 피부 재생을 촉진하고 주름을 완화.',
                price: 125000,
                selling_points: '- 봉독 추출물 피부 재생 성분\n- 수면 중 집중 탄력 케어\n- 팔로우업 세럼과 레이어링 추천\n- 피부과 임상 탄력 개선 확인',
            },
            {
                name: '퍼펙팅 쿠션 SPF50+ 15g×2',
                description: '한방 성분이 담긴 커버력 쿠션. 흔들림 없이 하루 종일 자연스러운 피부 표현.',
                price: 72000,
                selling_points: '- SPF50+/PA++++\n- 자음백화 성분으로 피부 균일 케어\n- 리필 쿠션 포함\n- 21N, 23N, 25C 3가지 쉐이드',
            },
            {
                name: '예약 마스크 120ml',
                description: '자음생 성분이 농축된 슬리핑 마스크. 건조하고 탄력 없는 피부에 하룻밤 집중 수분·영양 공급.',
                price: 52000,
                selling_points: '- 자음생 복합체 고농도 함유\n- 광채·탄력·수분 트리플 기능\n- 씻어내지 않는 슬리핑 타입\n- 8시간 지속 수분막 형성',
            },
        ],
    },
    {
        email: 'mock_hera_beauty@mock.creadypick.com',
        name: '헤라 공식',
        description: '도시적이고 세련된 여성을 위한 컨템포러리 뷰티 브랜드. 시그니처 블랙 컬러의 프리미엄 메이크업 라인.',
        website: 'https://www.hera.com',
        products: [
            {
                name: '블랙 쿠션 SPF34 15g×2',
                description: '헤라 베스트셀러 쿠션. 블랙 케이스의 럭셔리한 디자인과 함께 15시간 지속되는 밀착 커버력.',
                price: 58000,
                selling_points: '- 15시간 밀착 지속\n- SPF34/PA+++\n- 카본 블랙 필터 UV 차단\n- 23가지 컬러 라인업',
            },
            {
                name: '센슈얼 누드 발름 3.5g',
                description: '립 케어와 컬러를 동시에. 투명한 누드 빛 글로스로 촉촉하고 풍성한 입술을 연출합니다.',
                price: 26000,
                selling_points: '- 모이스쳐 유리 성분\n- 11가지 누드 컬러 라인업\n- 하루 종일 촉촉한 텍스처\n- 무향 저자극 포뮬라',
            },
            {
                name: '블랙 파운데이션 N25 40ml',
                description: '피부 위에 얇고 균일하게 밀착되는 새틴 파운데이션. 모공과 잡티를 자연스럽게 커버.',
                price: 48000,
                selling_points: '- 세미 매트 새틴 피니시\n- 모공·잡티 커버력\n- SPF30/PA++\n- 20가지 쉐이드',
            },
            {
                name: '아이레이저 아이라이너',
                description: '떨지 않아도 선명하게 그어지는 정밀 아이라이너. 물·피지에 강한 워터프루프 포뮬라.',
                price: 22000,
                selling_points: '- 0.01mm 초미세 붓팁\n- 워터프루프·피지프루프\n- 24시간 번짐 없음\n- 블랙·브라운 2가지 컬러',
            },
        ],
    },
    {
        email: 'mock_mediheal_beauty@mock.creadypick.com',
        name: '메디힐 공식',
        description: '피부과 전문 의약품 개발 기술로 만든 더마 코스메틱. 민감하고 예민한 피부를 위한 과학적 솔루션.',
        website: 'https://www.mediheal.com',
        products: [
            {
                name: 'N.M.F 아쿠아링 앰플 마스크 10매입',
                description: '천연보습인자(NMF) 성분이 피부 수분 장벽을 집중 케어. 피부과적으로 테스트된 저자극 마스크.',
                price: 18000,
                selling_points: '- N.M.F 수분 앰플 25ml 인텐시브\n- 피부과 임상 저자극 완료\n- 피부결 정돈 + 수분 충전\n- 매일 사용 가능 데일리 시트마스크',
            },
            {
                name: 'W.H.P 화이트닝 하이드로겔 마스크 5매입',
                description: '하이드로겔 소재로 영양 성분 밀착력을 극대화. 미백·보습을 동시에 해결하는 피부과 추천 마스크.',
                price: 22000,
                selling_points: '- 하이드로겔 500% 밀착력\n- 나이아신아마이드 미백 성분\n- 냉장 보관 쿨링 효과\n- 2매 분리로 눈가 집중 케어',
            },
            {
                name: 'T.E.N 세포 리페어링 앰플 30ml',
                description: '손상된 피부 장벽 복구에 특화된 고농도 앰플. 자극받은 피부를 빠르게 진정·회복.',
                price: 42000,
                selling_points: '- 피부 세포 재생 촉진 성분\n- 트리플 세라마이드 코어\n- 민감성 피부 피부과 테스트\n- 1주 사용 후 피부 장벽 개선 확인',
            },
            {
                name: '더마레이아 SPF50+ 선세럼 50ml',
                description: '가벼운 세럼 텍스처의 차세대 자외선 차단제. 스킨케어+선케어를 하나의 단계로 간소화.',
                price: 36000,
                selling_points: '- 세럼 질감의 맑은 선케어\n- SPF50+/PA++++\n- 항산화 비타민 복합 성분\n- 메이크업 베이스로도 활용 가능',
            },
        ],
    },
]

// ============================================================
// 10명의 뷰티 크리에이터 + 각 2개의 모먼트 = 20개
// ============================================================
const BEAUTY_CREATORS = [
    {
        displayName: '하은뷰티',
        handle: 'haeun_beauty',
        description: '27세 뷰티 크리에이터. 스킨케어 덕후로 성분 분석과 민감성 피부 케어를 전문으로 다룹니다. 성분충들의 성지 🧪',
        region: '서울',
        followers: 87000,
        priceVideo: 250000,
        moments: [
            {
                title: '민감성 피부가 직접 써본 수분크림 5종 솔직 후기',
                product: '수분크림',
                date: '2026-04',
                compensation: '협찬·리뷰',
            },
            {
                title: '성분 분석 입문 — 스킨케어 성분표 읽는 법',
                product: '스킨케어 성분 가이드',
                date: '2026-05',
                compensation: '콘텐츠 제작',
            },
        ],
    },
    {
        displayName: '서연메이크업',
        handle: 'seoyeon_makeup',
        description: '前 아이돌 출신 뷰티 크리에이터. 포토 보정 없는 실제 메이크업 클로즈업 콘텐츠로 신뢰 얻는 중 💄',
        region: '서울',
        followers: 215000,
        priceVideo: 580000,
        moments: [
            {
                title: '아이돌 무대 메이크업 셀프 재현하기 (쉬운 버전)',
                product: '메이크업 세트',
                date: '2026-04',
                compensation: '협찬·제품',
            },
            {
                title: '쿠션 파운데이션 10종 착용감 비교 (극건성 피부)',
                product: '쿠션 파운데이션',
                date: '2026-06',
                compensation: '협찬·광고비',
            },
        ],
    },
    {
        displayName: '지민스킨',
        handle: 'jimin_skin',
        description: '피부과 근무 경력 2년 뷰티 크리에이터. 성분 기반 스킨케어 루틴과 피부 트러블 솔루션 콘텐츠 제작.',
        region: '부산',
        followers: 42000,
        priceVideo: 120000,
        moments: [
            {
                title: '공중파 광고에 나온 세럼 성분 분석 — 진짜 효과 있을까?',
                product: '세럼/에센스',
                date: '2026-05',
                compensation: '협찬 제品',
            },
            {
                title: '사계절 피부 장벽 지키는 4단계 루틴',
                product: '스킨케어 루틴',
                date: '2026-07',
                compensation: '콘텐츠 제작비',
            },
        ],
    },
    {
        displayName: '수빈뷰티로그',
        handle: 'subin_beautylog',
        description: '1일 1뷰티로 하루를 여는 뷰티 크리에이터. 영상 하나에 GRWM+메이크업 과정+리뷰 올인원으로 담아냅니다.',
        region: '서울',
        followers: 128000,
        priceVideo: 380000,
        moments: [
            {
                title: '봄 GRWM — 출근하면서 찍은 15분 메이크업 브이로그',
                product: '메이크업 브러시 세트',
                date: '2026-03',
                compensation: '협찬·제품',
            },
            {
                title: '편의점 뷰티템만으로 완성하는 내추럴 메이크업',
                product: '저가 뷰티 제품',
                date: '2026-05',
                compensation: '콘텐츠 제작',
            },
        ],
    },
    {
        displayName: '다현더매트',
        handle: 'dahyun_themat',
        description: '매트 메이크업 전도사. 번들거림 없이 맑고 선명한 피부 표현을 위한 세팅 기법을 전문으로 공유합니다.',
        region: '인천',
        followers: 63000,
        priceVideo: 185000,
        moments: [
            {
                title: '지성 피부를 위한 20도 유지 세팅 루틴 (무너짐 없음)',
                product: '세팅 파우더·픽서',
                date: '2026-04',
                compensation: '협찬·광고',
            },
            {
                title: '여름 수영장에서도 살아남는 워터프루프 메이크업',
                product: '워터프루프 메이크업',
                date: '2026-06',
                compensation: '협찬 제품+광고비',
            },
        ],
    },
    {
        displayName: '소율이방',
        handle: 'soyul_room',
        description: '스킨케어 루틴을 ASMR처럼 담아내는 감성 뷰티 크리에이터. 제품 리뷰보다 경험과 감성을 전달합니다.',
        region: '서울',
        followers: 175000,
        priceVideo: 460000,
        moments: [
            {
                title: '자정에 혼자 하는 스킨케어 ASMR 루틴 🌙',
                product: '스킨케어 세트',
                date: '2026-03',
                compensation: '협찬·제품',
            },
            {
                title: '무드등 켜고 마스크팩 하는 30분 릴랙싱 브이로그',
                product: '마스크팩',
                date: '2026-05',
                compensation: '협찬·광고비',
            },
        ],
    },
    {
        displayName: '채원뷰티덕',
        handle: 'chaewon_beautydeok',
        description: '오타쿠식 뷰티 덕질 콘텐츠. 한정판 컬렉션부터 신상 발매일까지 놓치지 않는 뷰티 헌터 🎯',
        region: '서울',
        followers: 94000,
        priceVideo: 280000,
        moments: [
            {
                title: '올해 뷰티 한정판 TOP 7 — 이미 단종된 것들',
                product: '한정판 뷰티',
                date: '2026-04',
                compensation: '협찬·제품',
            },
            {
                title: '백화점 뷰티 할인 기간 공략법 — 실제로 얼마나 쌀까?',
                product: '뷰티 쇼핑 가이드',
                date: '2026-06',
                compensation: '콘텐츠 제작비',
            },
        ],
    },
    {
        displayName: '민서클린뷰티',
        handle: 'minseo_cleanbeauty',
        description: '클린 뷰티·비건 뷰티 전문 크리에이터. 성분표를 꼼꼼히 읽고 환경에 좋은 뷰티를 실천합니다 🌱',
        region: '제주',
        followers: 38000,
        priceVideo: 110000,
        moments: [
            {
                title: '내가 쓰는 비건 선크림 TOP 3 (성분표 투명 공개)',
                product: '비건 선크림',
                date: '2026-05',
                compensation: '협찬·제품',
            },
            {
                title: '제로 웨이스트 뷰티 루틴 — 제주에서 실천하는 방법',
                product: '친환경 뷰티',
                date: '2026-07',
                compensation: '콘텐츠 협력',
            },
        ],
    },
    {
        displayName: '도현맨뷰티',
        handle: 'dohyun_manbeauty',
        description: '남자 뷰티 크리에이터. 메이크업 처음 시작하는 남성을 위한 베이직 뷰티 루틴과 스킨케어를 쉽게 알려드립니다.',
        region: '서울',
        followers: 56000,
        priceVideo: 160000,
        moments: [
            {
                title: '남자도 쓰는 BB크림 추천 — 튀지 않는 자연스러운 피부 표현',
                product: 'BB크림',
                date: '2026-04',
                compensation: '협찬·광고비',
            },
            {
                title: '5분 안에 끝내는 남자 데일리 스킨케어 루틴',
                product: '남성 스킨케어',
                date: '2026-06',
                compensation: '협찬·제품',
            },
        ],
    },
    {
        displayName: '지훈피부과학',
        handle: 'jihoon_skinscience',
        description: '화학공학 전공자의 성분 기반 스킨케어 채널. 광고 없이 성분표만 보고 제품 평가하는 것으로 구독자 신뢰를 쌓았습니다.',
        region: '대전',
        followers: 145000,
        priceVideo: 420000,
        moments: [
            {
                title: '레티놀 농도별 효과 차이 — 0.1% vs 0.3% vs 1% 임상 비교',
                product: '레티놀 크림',
                date: '2026-05',
                compensation: '협찬·제품',
            },
            {
                title: 'AHA·BHA·PHA 차이점 완벽 정리 (2026년 업데이트)',
                product: '각질 케어 제품',
                date: '2026-07',
                compensation: '콘텐츠 제작비',
            },
        ],
    },
]

const PASSWORD = 'MockUser2026!'
const BEAUTY_CATEGORY = '💄 뷰티'

async function main() {
    const isDelete = process.argv.includes('--delete')

    if (isDelete) {
        console.log('🗑️  뷰티 mock 데이터 삭제 모드...')

        // Delete moments
        const { error: momentErr } = await supabase.from('life_moments').delete().eq('is_mock', true).eq('tags', ['💄 뷰티'])
        if (momentErr) console.warn('life_moments 삭제 경고:', momentErr.message)
        else console.log('✅ 뷰티 모먼트 삭제 완료')

        // Delete products and brand profiles
        for (const brand of BEAUTY_BRANDS) {
            const { data: profile } = await supabase.from('profiles').select('id').eq('email_confirmed_at', brand.email).maybeSingle()
            // Find by listing auth users with this email
        }

        // Find and delete all mock brand profiles (by is_mock + role)
        const { data: brandProfiles } = await supabase.from('profiles').select('id, email').eq('is_mock', true).eq('role', 'brand')
        const beautyEmails = BEAUTY_BRANDS.map(b => b.email)
        const toDelete = (brandProfiles || []).filter((p: any) => beautyEmails.includes(p.email))

        for (const p of toDelete) {
            await supabase.from('brand_products').delete().eq('brand_id', p.id)
            await supabase.auth.admin.deleteUser(p.id)
            console.log(`✅ 브랜드 삭제: ${p.id}`)
        }

        // Creator profiles
        const handleList = BEAUTY_CREATORS.map(c => c.handle)
        const { data: creatorProfiles } = await supabase.from('profiles')
            .select('id').eq('is_mock', true).eq('role', 'creator').in('instagram_handle', handleList)

        for (const p of (creatorProfiles || [])) {
            await supabase.from('life_moments').delete().eq('influencer_id', p.id)
            await supabase.auth.admin.deleteUser(p.id)
            console.log(`✅ 크리에이터 삭제: ${p.id}`)
        }

        console.log('🎉 삭제 완료!')
        return
    }

    console.log('🚀 뷰티 mock 데이터 시드 시작...\n')

    // ── 1. 브랜드 계정 + 제품 생성 ──
    console.log(`📦 브랜드 ${BEAUTY_BRANDS.length}개 생성 중...`)
    for (const brand of BEAUTY_BRANDS) {
        const { data: auth, error: authErr } = await supabase.auth.admin.createUser({
            email: brand.email,
            password: PASSWORD,
            email_confirm: true,
            user_metadata: { display_name: brand.name, role: 'brand' },
        })

        if (authErr) {
            if (authErr.message.includes('already')) {
                console.warn(`  ⚠️ 이미 존재: ${brand.name}`)
                continue
            }
            console.error(`  ❌ 브랜드 auth 실패 [${brand.name}]:`, authErr.message)
            continue
        }

        const brandId = auth.user!.id

        await supabase.from('profiles').update({
            display_name: brand.name,
            description: brand.description,
            role: 'brand',
            is_mock: true,
            onboarding_completed: true,
            website: brand.website,
            primary_region: '서울',
        }).eq('id', brandId)

        const products = brand.products.map(p => ({
            brand_id: brandId,
            name: p.name,
            description: p.description,
            price: p.price,
            category: BEAUTY_CATEGORY,
            is_mock: true,
            selling_points: p.selling_points,
        }))

        const { error: productErr } = await supabase.from('brand_products').insert(products)
        if (productErr) {
            console.error(`  ❌ 제품 생성 실패 [${brand.name}]:`, productErr.message)
        } else {
            console.log(`  ✅ ${brand.name} — 제품 ${products.length}개 생성`)
        }
    }

    // ── 2. 크리에이터 계정 + 모먼트 생성 ──
    console.log(`\n👩 크리에이터 ${BEAUTY_CREATORS.length}명 생성 중...`)
    let totalMoments = 0
    for (const creator of BEAUTY_CREATORS) {
        const email = `mock_${creator.handle}@mock.creadypick.com`
        const { data: auth, error: authErr } = await supabase.auth.admin.createUser({
            email,
            password: PASSWORD,
            email_confirm: true,
            user_metadata: { display_name: creator.displayName, role: 'creator' },
        })

        if (authErr) {
            if (authErr.message.includes('already')) {
                console.warn(`  ⚠️ 이미 존재: ${creator.displayName}`)
                continue
            }
            console.error(`  ❌ 크리에이터 auth 실패 [${creator.displayName}]:`, authErr.message)
            continue
        }

        const userId = auth.user!.id

        await supabase.from('profiles').update({
            display_name: creator.displayName,
            instagram_handle: creator.handle,
            description: creator.description,
            primary_region: creator.region,
            tags: [BEAUTY_CATEGORY],
            followers_count: creator.followers,
            price_video: creator.priceVideo,
            price_feed: Math.round(creator.priceVideo * 0.6),
            price_story: Math.round(creator.priceVideo * 0.3),
            role: 'creator',
            is_mock: true,
            tier: creator.followers >= 100000 ? 'Micro' : creator.followers >= 50000 ? 'Nano' : 'Nano',
            onboarding_completed: true,
        }).eq('id', userId)

        for (const moment of creator.moments) {
            const { error: mErr } = await supabase.from('life_moments').insert({
                influencer_id: userId,
                title: moment.title,
                target_product: moment.product,
                event_date: moment.date,
                tags: [BEAUTY_CATEGORY],
                status: 'recruiting',
                is_mock: true,
                is_private: false,
                compensation_note: moment.compensation,
            })
            if (mErr) {
                // compensation_note might not exist — retry without it
                await supabase.from('life_moments').insert({
                    influencer_id: userId,
                    title: moment.title,
                    target_product: moment.product,
                    event_date: moment.date,
                    tags: [BEAUTY_CATEGORY],
                    status: 'recruiting',
                    is_mock: true,
                    is_private: false,
                })
                totalMoments++
            } else {
                totalMoments++
            }
        }
        console.log(`  ✅ ${creator.displayName} (@${creator.handle}) — 모먼트 ${creator.moments.length}개`)
    }

    console.log(`\n${'═'.repeat(50)}`)
    console.log(`🎉 뷰티 Mock 데이터 생성 완료!`)
    console.log(`   📦 브랜드: ${BEAUTY_BRANDS.length}개`)
    console.log(`   💄 제품: ${BEAUTY_BRANDS.reduce((sum, b) => sum + b.products.length, 0)}개`)
    console.log(`   👩 크리에이터: ${BEAUTY_CREATORS.length}명`)
    console.log(`   ✨ 모먼트: ${totalMoments}개`)
    console.log(`${'═'.repeat(50)}`)
    console.log(`\n삭제: npx tsx scripts/seed-beauty-mock.ts --delete`)
}

main().catch(console.error)
