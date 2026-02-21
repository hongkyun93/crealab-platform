/**
 * IR 샘플 데이터 Part 2: 모먼트 템플릿 + 실행 로직
 * 실행: npx tsx scripts/seed-ir-moments.ts
 * 삭제: npx tsx scripts/seed-ir-moments.ts --delete
 */
import { CREATORS, supabase } from './seed-ir-data'
import { randomUUID } from 'crypto'
import { readFileSync } from 'fs'
import { resolve, basename } from 'path'

// Avatar image pool (generated images)
const AVATAR_DIR = resolve(process.env.HOME || '', '.gemini/antigravity/brain/b3953136-6f46-45c8-8f9c-20011580bd6d')
const AVATAR_FILES = [
    'avatar_01_haeun_1771640175935.png', 'avatar_02_seoyeon_1771640196875.png',
    'avatar_03_jimin_1771640215388.png', 'avatar_04_subin_1771640233455.png',
    'avatar_05_dahyun_1771640258613.png', 'avatar_06_soyul_1771640305200.png',
    'avatar_11_chaewon_1771641327134.png', 'avatar_12_minseo_1771641350293.png',
    'avatar_13_dohyun_1771641366004.png', 'avatar_14_jihoon_1771641394271.png',
    'avatar_15_eunchae_1771641410633.png', 'avatar_16_haneul_1771641426832.png',
    'avatar_17_eunseo_1771641472234.png', 'avatar_18_seojun_1771641496976.png',
    'avatar_19_jiyun_1771641516959.png', 'avatar_20_hajin_1771641556114.png',
    'avatar_21_taeyang_1771641574234.png', 'avatar_22_donggun_1771641594526.png',
    'avatar_23_jeonga_1771641619978.png', 'avatar_24_nari_1771641640960.png',
    'avatar_25_siwoo_1771641660411.png',
]

async function uploadAvatar(filename: string): Promise<string | null> {
    try {
        const filePath = resolve(AVATAR_DIR, filename)
        const fileBuffer = readFileSync(filePath)
        const storagePath = `mock-avatars/${filename}`

        const { error } = await supabase.storage
            .from('avatars')
            .upload(storagePath, fileBuffer, { contentType: 'image/png', upsert: true })

        if (error) {
            console.warn(`  ⚠️ Avatar upload failed (${filename}):`, error.message)
            return null
        }

        const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(storagePath)
        return publicUrl
    } catch (e: any) {
        console.warn(`  ⚠️ Avatar read failed (${filename}):`, e.message)
        return null
    }
}

// ============================================================
// 카테고리별 모먼트 템플릿 (제목, 대상제품, 태그)
// ============================================================
const MOMENT_TEMPLATES: Record<string, { title: string; product: string; tags: string[] }[]> = {
    "💄 뷰티": [
        { title: "여름 톤업 선크림 TOP 5 비교", product: "선크림", tags: ["💄 뷰티"] },
        { title: "수분크림 2주 사용 리얼 후기", product: "수분크림", tags: ["💄 뷰티"] },
        { title: "올리브영 신상 파데 컬러 매칭", product: "파운데이션", tags: ["💄 뷰티"] },
        { title: "가을 데일리 메이크업 루틴 🍂", product: "메이크업 세트", tags: ["💄 뷰티"] },
        { title: "민감성 피부 진정팩 솔직 후기", product: "마스크팩", tags: ["💄 뷰티", "💊 건강"] },
        { title: "성분 분석 세럼 TOP 3", product: "세럼/에센스", tags: ["💄 뷰티"] },
        { title: "여름 노메이크업 스킨케어 루틴", product: "스킨케어 세트", tags: ["💄 뷰티"] },
        { title: "하반기 클렌징 신상 리뷰", product: "클렌징", tags: ["💄 뷰티"] },
        { title: "입생로랑 vs 샤넬 립 비교", product: "립스틱", tags: ["💄 뷰티"] },
        { title: "향수 블라인드 테스트 릴스", product: "향수", tags: ["💄 뷰티"] },
        { title: "네일아트 셀프 vs 전문샵 비교", product: "네일 용품", tags: ["💄 뷰티", "🎨 취미/DIY"] },
        { title: "탈모 샴푸 3개월 사용 리뷰", product: "헤어케어", tags: ["💄 뷰티", "💊 건강"] },
    ],
    "👗 패션": [
        { title: "S/S 원마일웨어 코디 10가지", product: "캐주얼웨어", tags: ["👗 패션"] },
        { title: "직장인 출근룩 7DAYS 릴스", product: "오피스룩", tags: ["👗 패션"] },
        { title: "여름 린넨 셋업 스타일링", product: "린넨 셋업", tags: ["👗 패션"] },
        { title: "가을 트렌치코트 브랜드 비교", product: "아우터", tags: ["👗 패션"] },
        { title: "키 작은 체형 커버 룩북", product: "쇼핑몰 의류", tags: ["👗 패션"] },
        { title: "가성비 슬랙스 5종 비교", product: "슬랙스", tags: ["👗 패션"] },
        { title: "데이트룩 vs 카페룩 GRWM", product: "원피스", tags: ["👗 패션"] },
        { title: "바다 휴양지 코디 모음", product: "리조트웨어", tags: ["👗 패션", "✈️ 여행"] },
        { title: "미니멀 캡슐 워드로브 구성법", product: "기본 아이템", tags: ["👗 패션"] },
        { title: "겨울 패딩 브랜드 TOP 5", product: "패딩/다운", tags: ["👗 패션"] },
    ],
    "🍽️ 맛집": [
        { title: "성수동 신상 카페 5곳 투어 ☕", product: "카페/디저트", tags: ["🍽️ 맛집"] },
        { title: "한남동 이태리안 코스 솔직 후기", product: "레스토랑", tags: ["🍽️ 맛집"] },
        { title: "편의점 신상 먹방 릴스", product: "편의점 간식", tags: ["🍽️ 맛집"] },
        { title: "제주도 로컬 맛집 TOP 7", product: "제주 맛집", tags: ["🍽️ 맛집", "✈️ 여행"] },
        { title: "집에서 만드는 밀키트 리뷰", product: "밀키트", tags: ["🍽️ 맛집"] },
        { title: "비건 디저트 카페 탐방 🌱", product: "비건 디저트", tags: ["🍽️ 맛집", "💊 건강"] },
        { title: "가을 제철 음식 레시피 4가지", product: "식재료", tags: ["🍽️ 맛집"] },
        { title: "홈베이킹 마카롱 튜토리얼", product: "베이킹 키트", tags: ["🍽️ 맛집", "🎨 취미/DIY"] },
        { title: "파인다이닝 코스 비교 리뷰", product: "파인다이닝", tags: ["🍽️ 맛집"] },
        { title: "야시장 먹방 브이로그", product: "길거리 음식", tags: ["🍽️ 맛집", "✈️ 여행"] },
    ],
    "✈️ 여행": [
        { title: "후쿠오카 2박3일 가성비 여행 ✈️", product: "여행용품/캐리어", tags: ["✈️ 여행"] },
        { title: "강원도 글램핑 브이로그", product: "글램핑/숙소", tags: ["✈️ 여행"] },
        { title: "방콕 카오산로드 먹방 투어", product: "해외여행", tags: ["✈️ 여행", "🍽️ 맛집"] },
        { title: "겨울 온천 료칸 추천 TOP 5", product: "온천/숙소", tags: ["✈️ 여행"] },
        { title: "서울 근교 당일치기 드라이브", product: "차량용품", tags: ["✈️ 여행"] },
        { title: "제주 한 달 살기 워케이션", product: "제주 숙소", tags: ["✈️ 여행"] },
        { title: "부산 감천문화마을 포토스팟", product: "카메라/짐벌", tags: ["✈️ 여행"] },
        { title: "가을 단풍 명소 전국 투어 🍁", product: "아웃도어 장비", tags: ["✈️ 여행"] },
        { title: "호캉스 5성급 호텔 비교", product: "호텔/리조트", tags: ["✈️ 여행"] },
        { title: "캠핑 장비 초보 가이드 ⛺", product: "캠핑 장비", tags: ["✈️ 여행"] },
    ],
    "🏋️ 헬스/운동": [
        { title: "홈트 루틴 30일 챌린지 🔥", product: "운동 매트/밴드", tags: ["🏋️ 헬스/운동"] },
        { title: "여성 프로틴 3종 맛 비교", product: "프로틴 파우더", tags: ["🏋️ 헬스/운동", "🥗 다이어트"] },
        { title: "필라테스 웨어 브랜드 리뷰", product: "운동복", tags: ["🏋️ 헬스/운동", "👗 패션"] },
        { title: "러닝 입문자 장비 가이드", product: "러닝화/장비", tags: ["🏋️ 헬스/운동"] },
        { title: "바디프로필 D-30 식단 공개", product: "보충제", tags: ["🏋️ 헬스/운동"] },
    ],
    "🥗 다이어트": [
        { title: "간헐적 단식 2주 결과", product: "다이어트 보조제", tags: ["🥗 다이어트", "💊 건강"] },
        { title: "저칼로리 도시락 일주일 식단", product: "다이어트 도시락", tags: ["🥗 다이어트"] },
        { title: "곤약면 레시피 5가지 릴스", product: "곤약 제품", tags: ["🥗 다이어트", "🍽️ 맛집"] },
        { title: "아침 대용 쉐이크 비교", product: "식사대용 쉐이크", tags: ["🥗 다이어트", "💊 건강"] },
    ],
    "💊 건강": [
        { title: "직장인 피로 회복 영양제 비교", product: "영양제", tags: ["💊 건강"] },
        { title: "아침 공복 유산균 3개월 후기", product: "유산균", tags: ["💊 건강"] },
        { title: "눈 건강 루테인 vs 블루라이트 안경", product: "건강보조제", tags: ["💊 건강"] },
        { title: "겨울 면역력 부스터 가이드", product: "비타민/홍삼", tags: ["💊 건강"] },
    ],
    "💉 시술/병원": [
        { title: "울쎄라 vs 써마지 솔직 비교", product: "리프팅 시술", tags: ["💉 시술/병원", "💄 뷰티"] },
        { title: "여름 제모 시술 종류별 비교", product: "제모 서비스", tags: ["💉 시술/병원"] },
        { title: "스킨부스터 주사 1개월 경과", product: "피부과 시술", tags: ["💉 시술/병원"] },
        { title: "필러 시술 전후 리얼 후기", product: "필러 시술", tags: ["💉 시술/병원"] },
    ],
    "🏡 리빙/인테리어": [
        { title: "10평 원룸 수납 꿀팁 릴스", product: "수납용품", tags: ["🏡 리빙/인테리어"] },
        { title: "여름 침구 교체! 쿨링 이불 비교", product: "침구류", tags: ["🏡 리빙/인테리어"] },
        { title: "셀프 인테리어 페인팅 브이로그", product: "페인트/인테리어", tags: ["🏡 리빙/인테리어"] },
        { title: "가을 감성 홈카페 꾸미기 ☕", product: "홈카페 용품", tags: ["🏡 리빙/인테리어"] },
        { title: "IKEA vs 한샘 가성비 비교", product: "가구/선반", tags: ["🏡 리빙/인테리어"] },
    ],
    "💍 웨딩/결혼": [
        { title: "웨딩 촬영 D-100 준비 브이로그", product: "웨딩 촬영", tags: ["💍 웨딩/결혼"] },
        { title: "예물 반지 브랜드 비교 후기", product: "예물", tags: ["💍 웨딩/결혼"] },
        { title: "신혼여행 발리 5박 후기", product: "신혼여행", tags: ["💍 웨딩/결혼", "✈️ 여행"] },
        { title: "스드메 비용 투명 공개 💍", product: "스드메", tags: ["💍 웨딩/결혼"] },
    ],
    "👶 육아": [
        { title: "12개월 이유식 식단표 공유", product: "이유식/유아식", tags: ["👶 육아"] },
        { title: "여름 아기 외출템 필수 리스트", product: "유모차/외출용품", tags: ["👶 육아"] },
        { title: "유아 선크림 vs 성인 선크림 비교", product: "유아 선크림", tags: ["👶 육아", "💄 뷰티"] },
        { title: "첫 돌잔치 준비 A to Z", product: "돌잔치 용품", tags: ["👶 육아"] },
        { title: "아기랑 키즈카페 투어", product: "키즈카페", tags: ["👶 육아"] },
        { title: "유아 영어 교재 3개월 사용기", product: "유아 교재", tags: ["👶 육아", "🎓 교육/강의"] },
    ],
    "💻 테크/IT": [
        { title: "갤럭시 Z 시리즈 실사용 후기", product: "스마트폰", tags: ["💻 테크/IT"] },
        { title: "유튜브 촬영 장비 세팅 가이드", product: "카메라/마이크", tags: ["💻 테크/IT"] },
        { title: "재택근무 데스크 셋업 투어", product: "모니터/키보드", tags: ["💻 테크/IT"] },
        { title: "AI 생산성 앱 TOP 5 비교", product: "소프트웨어/앱", tags: ["💻 테크/IT"] },
        { title: "노이즈캔슬링 이어폰 TOP 3", product: "이어폰", tags: ["💻 테크/IT"] },
    ],
    "🎮 게임": [
        { title: "PS5 vs Xbox 신작 비교", product: "게임 콘솔", tags: ["🎮 게임", "💻 테크/IT"] },
        { title: "가성비 게이밍 의자 TOP 3", product: "게이밍 의자", tags: ["🎮 게임"] },
        { title: "인디 게임 추천 릴스", product: "게임", tags: ["🎮 게임"] },
        { title: "게이밍 모니터 주사율 비교", product: "모니터", tags: ["🎮 게임", "💻 테크/IT"] },
    ],
    "🐶 반려동물": [
        { title: "강아지 수제간식 만들기", product: "반려동물 간식", tags: ["🐶 반려동물"] },
        { title: "여름 산책 필수템 추천", product: "반려동물 용품", tags: ["🐶 반려동물"] },
        { title: "펫 호텔 vs 펫시터 비교 후기", product: "펫 서비스", tags: ["🐶 반려동물"] },
        { title: "강아지 사료 원재료 체크", product: "사료", tags: ["🐶 반려동물"] },
        { title: "반려견 동반 카페 탐방", product: "펫프렌들리 카페", tags: ["🐶 반려동물", "🍽️ 맛집"] },
    ],
    "📚 도서/자기계발": [
        { title: "이달의 추천 도서 5권 📖", product: "도서", tags: ["📚 도서/자기계발"] },
        { title: "독서 루틴 30일 챌린지", product: "독서 용품", tags: ["📚 도서/자기계발"] },
        { title: "사회 초년생 필독서 TOP 7", product: "도서", tags: ["📚 도서/자기계발", "💰 재테크"] },
        { title: "전자책 리더기 3종 비교", product: "전자책 리더기", tags: ["📚 도서/자기계발", "💻 테크/IT"] },
    ],
    "🎨 취미/DIY": [
        { title: "레진 아트 키링 만들기", product: "레진 공예 키트", tags: ["🎨 취미/DIY"] },
        { title: "캘리그라피 입문 키트 비교", product: "캘리그라피 용품", tags: ["🎨 취미/DIY"] },
        { title: "도자기 원데이클래스 후기", product: "도자기 클래스", tags: ["🎨 취미/DIY"] },
        { title: "드라이플라워 인테리어 DIY 🌸", product: "드라이플라워 키트", tags: ["🎨 취미/DIY", "🏡 리빙/인테리어"] },
    ],
    "🎬 영화/문화": [
        { title: "여름 기대작 영화 프리뷰", product: "영화/OTT", tags: ["🎬 영화/문화"] },
        { title: "넷플릭스 한국 드라마 TOP 5", product: "OTT 서비스", tags: ["🎬 영화/문화"] },
        { title: "전시 투어: 현대미술관 특별전", product: "전시/아트", tags: ["🎬 영화/문화"] },
        { title: "인디 음악 페스티벌 브이로그 🎵", product: "페스티벌", tags: ["🎬 영화/문화", "✈️ 여행"] },
    ],
    "💰 재테크": [
        { title: "사회 초년생 적금 vs ETF 비교", product: "금융 서비스", tags: ["💰 재테크"] },
        { title: "부동산 청약 초보 가이드", product: "부동산 앱", tags: ["💰 재테크"] },
        { title: "카드 혜택 극대화 꿀팁 릴스", product: "신용카드", tags: ["💰 재테크"] },
        { title: "연말정산 절세 전략 A to Z", product: "세무 서비스", tags: ["💰 재테크"] },
    ],
    "🎓 교육/강의": [
        { title: "온라인 강의 플랫폼 비교", product: "교육 플랫폼", tags: ["🎓 교육/강의"] },
        { title: "자격증 독학 합격 후기", product: "교재/강의", tags: ["🎓 교육/강의"] },
        { title: "영어 회화 앱 3개월 후기", product: "어학 앱", tags: ["🎓 교육/강의"] },
    ],
    "📌 기타": [
        { title: "일상 브이로그: 나의 하루", product: "라이프스타일", tags: ["📌 기타"] },
    ],
}

// ============================================================
// 모먼트 생성 로직
// ============================================================
function generateMoments(creatorIndex: number, tags: string[]): { title: string; product: string; tags: string[]; date: string }[] {
    const primaryTag = tags[0]
    const templates = MOMENT_TEMPLATES[primaryTag] || MOMENT_TEMPLATES["📌 기타"]
    const months = ["2026-06", "2026-07", "2026-08", "2026-09", "2026-10", "2026-11", "2026-12"]
    const count = 2 // 각 크리에이터당 2개 모먼트 = 100 × 2 = 200
    const result: { title: string; product: string; tags: string[]; date: string }[] = []

    for (let i = 0; i < count; i++) {
        const t = templates[(creatorIndex + i) % templates.length]
        result.push({
            title: t.title,
            product: t.product,
            tags: t.tags,
            date: months[(creatorIndex + i) % months.length],
        })
    }
    return result
}

// ============================================================
// 메인 실행
// ============================================================
async function main() {
    const isDelete = process.argv.includes('--delete')

    if (isDelete) {
        console.log('🗑️  삭제 모드: is_mock=true 데이터 전부 삭제...')
        const { error: e1 } = await supabase.from('life_moments').delete().eq('is_mock', true)
        if (e1) console.error('life_moments 삭제 실패:', e1.message)
        else console.log('✅ life_moments 삭제 완료')

        const { data: mockProfiles } = await supabase.from('profiles').select('id').eq('is_mock', true)
        if (mockProfiles?.length) {
            const ids = mockProfiles.map(p => p.id)
            const { error: e2 } = await supabase.from('social_channels').delete().in('user_id', ids)
            if (e2) console.error('social_channels 삭제 실패:', e2.message)
            else console.log('✅ social_channels 삭제 완료')
        }

        // Also clean up auth users
        if (mockProfiles?.length) {
            for (const p of mockProfiles) {
                await supabase.auth.admin.deleteUser(p.id)
            }
            console.log(`✅ auth.users ${mockProfiles.length}명 삭제 완료`)
        }

        const { error: e3 } = await supabase.from('profiles').delete().eq('is_mock', true)
        if (e3) console.error('profiles 삭제 실패:', e3.message)
        else console.log('✅ profiles 삭제 완료')

        console.log('🎉 전체 삭제 완료!')
        return
    }

    console.log(`🚀 시드 시작: ${CREATORS.length}명 크리에이터 + 모먼트`)

    // Upload avatars first
    console.log(`📸 아바타 ${AVATAR_FILES.length}개 업로드 중...`)
    const avatarUrls: string[] = []
    for (const file of AVATAR_FILES) {
        const url = await uploadAvatar(file)
        if (url) avatarUrls.push(url)
    }
    console.log(`✅ 아바타 ${avatarUrls.length}개 업로드 완료`)

    let momentCount = 0

    for (let idx = 0; idx < CREATORS.length; idx++) {
        const c = CREATORS[idx]
        const profileId = randomUUID()
        const avatarUrl = avatarUrls.length > 0 ? avatarUrls[idx % avatarUrls.length] : null

        // 1. Create auth user first (profiles has FK to auth.users)
        const email = `mock_${c.instagram_handle.replace(/[^a-z0-9]/g, '')}@mock.creadypick.com`
        const { data: authData, error: authErr } = await supabase.auth.admin.createUser({
            email,
            password: 'MockUser2026!',
            email_confirm: true,
            user_metadata: { display_name: c.display_name, role: 'creator' },
        })

        if (authErr || !authData.user) {
            console.error(`❌ Auth 생성 실패 [${c.display_name}]:`, authErr?.message)
            continue
        }

        const userId = authData.user.id

        // 2. Update the auto-generated profile row
        const { error: profileErr } = await supabase.from('profiles').update({
            display_name: c.display_name,
            instagram_handle: c.instagram_handle,
            description: c.description,
            avatar_url: avatarUrl,
            primary_region: c.primary_region,
            tags: c.tags,
            followers_count: c.followers_count,
            price_video: c.price_video,
            price_feed: c.price_feed,
            price_story: c.price_story,
            role: 'creator',
            is_mock: true,
            tier: c.followers_count >= 100000 ? 'Mega' : c.followers_count >= 10000 ? 'Micro' : 'Nano',
            onboarding_completed: true,
        }).eq('id', userId)

        if (profileErr) {
            console.error(`❌ 프로필 생성 실패 [${c.display_name}]:`, profileErr.message)
            continue
        }

        // 2. 소셜 채널 생성
        for (const ch of c.channels) {
            await supabase.from('social_channels').insert({
                user_id: userId,
                platform: ch.platform,
                handle: ch.handle,
                followers_count: ch.followers_count,
                is_primary: ch.is_primary,
                is_public: true,
            })
        }

        // 3. 모먼트 생성
        const moments = generateMoments(idx, c.tags)
        for (const m of moments) {
            const { error: momentErr } = await supabase.from('life_moments').insert({
                influencer_id: userId,
                title: m.title,
                target_product: m.product,
                event_date: m.date,
                tags: m.tags,
                status: 'recruiting',
                is_mock: true,
                is_private: false,
            })
            if (momentErr) console.error(`  ❌ 모먼트 실패: ${momentErr.message}`)
            else momentCount++
        }

        console.log(`  ✅ [${idx + 1}/${CREATORS.length}] ${c.display_name} (${c.channels.length}채널, ${moments.length}모먼트)`)
    }

    console.log(`\n🎉 시드 완료! 크리에이터 ${CREATORS.length}명, 모먼트 ${momentCount}개`)
    console.log(`\n삭제하려면: npx tsx scripts/seed-ir-moments.ts --delete`)
}

main().catch(console.error)
