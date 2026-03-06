import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(__dirname, '..', '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

const CREADYPICK_TEAM_ID = '8c998fdd-1f3b-47e0-8711-79a760460089'

const PERSONAS = [
    { displayName: '나래플러스', handle: 'narae.plus_size', file: 'creator_narae_fashion_1772726049064.png', tags: ['👗 패션'], region: '서울 강남구', fol: 48500, bio: '사이즈 걱정 없는 당당한 데일리룩 🦋\n#플러스사이즈 #하객룩 #출근룩', pb: { v: 550000, f: 300000, s: 100000, uM: 1, uP: 200000, dM: 1, dP: 150000 }, biz: { is: true, no: '123-45-67891', name: '김나래', birth: '1993' }, shp: { name: '김나래', phone: '010-1234-5551', addr: '서울 강남구 언주로 12 101호' }, bnk: { n: '신한은행', acc: '110-123-456781', h: '김나래' } },
    { displayName: '도윤맨즈', handle: 'doyun.mens', file: 'creator_doyun_mens_1772726069559.png', tags: ['👗 패션'], region: '서울 성동구', fol: 32100, bio: '실패 없는 놈코어 남친룩의 정석 🧥\n#남성패션 #미니멀룩 #데이트룩', pb: { v: 400000, f: 250000, s: 80000, uM: 1, uP: 150000, dM: 0, dP: 0 }, biz: { is: false, no: null, name: '이도윤', birth: '1996' }, shp: { name: '이도윤', phone: '010-2345-6662', addr: '서울 성동구 연무장길 4 202호' }, bnk: { n: '국민은행', acc: '220-234-567892', h: '이도윤' } },
    { displayName: '수빈OOTD', handle: 'subin_ootd.kr', file: 'creator_subin_ootd_1772726227322.png', tags: ['👗 패션'], region: '경기 수원시', fol: 18900, bio: '스트릿부터 캐주얼까지 힙하게 🖤\n#스트릿패션 #카페투어 #OOTD', pb: { v: 250000, f: 150000, s: 50000, uM: 1, uP: 100000, dM: 1, dP: 80000 }, biz: { is: false, no: null, name: '최수빈', birth: '1998' }, shp: { name: '최수빈', phone: '010-3456-7773', addr: '경기 수원시 권선구 권광로 303호' }, bnk: { n: '우리은행', acc: '330-345-678903', h: '최수빈' } },
    { displayName: '태희의옷장', handle: 'taehee.closet', file: 'creator_taehee_minimal_1772726416620.png', tags: ['👗 패션'], region: '서울 마포구', fol: 61000, bio: '오래 입는 타임리스 & 클래식 무드 🤍\n#미니멀 #오피스룩 #직장인룩', pb: { v: 700000, f: 400000, s: 150000, uM: 1, uP: 300000, dM: 1, dP: 250000 }, biz: { is: true, no: '234-56-78902', name: '김태희', birth: '1990' }, shp: { name: '김태희', phone: '010-4567-8884', addr: '서울 마포구 동교로 22 404호' }, bnk: { n: '하나은행', acc: '440-456-789014', h: '김태희' } },
    { displayName: '하늘니트', handle: 'haneul.knit', file: 'creator_haneul_knit_1772726434948.png', tags: ['👗 패션'], region: '인천 연수구', fol: 13500, bio: '부드러운 파스텔톤 페미닌룩 코디 🌸\n#페미닌 #데일리룩 #데이트코디', pb: { v: 150000, f: 100000, s: 30000, uM: 1, uP: 50000, dM: 1, dP: 50000 }, biz: { is: false, no: null, name: '임하늘', birth: '2000' }, shp: { name: '임하늘', phone: '010-5678-9995', addr: '인천 연수구 송도과학로 505호' }, bnk: { n: '농협은행', acc: '550-567-890125', h: '임하늘' } },
    { displayName: '하린빈티지', handle: 'harin.vntg', file: 'creator_harin_vintage_1772726449956.png', tags: ['👗 패션'], region: '서울 용산구', fol: 27800, bio: '유니크한 Y2K & 빈티지 믹스매치 📼\n#Y2K #빈티지 #레이어드룩', pb: { v: 350000, f: 200000, s: 70000, uM: 1, uP: 150000, dM: 1, dP: 100000 }, biz: { is: true, no: '345-67-89013', name: '강하린', birth: '1995' }, shp: { name: '강하린', phone: '010-6789-0006', addr: '서울 용산구 한남대로 8 606호' }, bnk: { n: '기업은행', acc: '660-678-901236', h: '강하린' } },
    { displayName: '서연스킨', handle: 'seoyeon.skin', file: 'creator_seoyeon_skin_1772726120992.png', tags: ['💄 뷰티'], region: '경기 성남시', fol: 36200, bio: '민감성 수부지를 위한 순한 스킨케어 💧\n#스킨케어 #수부지 #기초템', pb: { v: 450000, f: 250000, s: 80000, uM: 1, uP: 200000, dM: 1, dP: 150000 }, biz: { is: false, no: null, name: '김서연', birth: '1994' }, shp: { name: '김서연', phone: '010-7890-1111', addr: '경기 성남시 분당구 판교로 707호' }, bnk: { n: '카카오뱅크', acc: '770-789-012347', h: '김서연' } },
    { displayName: '서현향수일기', handle: 'seohyun.parfum', file: 'creator_seohyun_perfume_1772726135050.png', tags: ['💄 뷰티'], region: '서울 용산구', fol: 45100, bio: '분위기를 입는 향기, 니치 향수 리뷰어 🕰️\n#향수 #니치퍼퓸 #무드', pb: { v: 500000, f: 300000, s: 100000, uM: 1, uP: 250000, dM: 1, dP: 200000 }, biz: { is: true, no: '456-78-90124', name: '황서현', birth: '1992' }, shp: { name: '황서현', phone: '010-8901-2222', addr: '서울 용산구 이태원로 12 808호' }, bnk: { n: '토스뱅크', acc: '880-890-123458', h: '황서현' } },
    { displayName: '소미스킨랩', handle: 'somi.skinlab', file: 'creator_somi_skinlab_1772726152623.png', tags: ['💉 시술/병원'], region: '서울 강남구', fol: 112000, bio: '꼼꼼한 성분 분석 뷰티 연구소 🧪\n#성분분석 #기능성화장품 #안티에이징', pb: { v: 1200000, f: 800000, s: 300000, uM: 1, uP: 500000, dM: 1, dP: 400000 }, biz: { is: true, no: '567-89-01235', name: '안소미', birth: '1988' }, shp: { name: '안소미', phone: '010-9012-3333', addr: '서울 강남구 테헤란로 111 909호' }, bnk: { n: '신한은행', acc: '110-901-234569', h: '주식회사 랩소미' } },
    { displayName: '수아코스메틱', handle: 'sua.cosmetics', file: 'creator_sua_cosmetic_1772726397384.png', tags: ['💄 뷰티'], region: '대전 서구', fol: 23400, bio: '퍼스널컬러 착붙 신상 색조 발색 💋\n#메이크업 #색조 #퍼스널컬러', pb: { v: 300000, f: 150000, s: 60000, uM: 1, uP: 150000, dM: 1, dP: 100000 }, biz: { is: false, no: null, name: '배수아', birth: '1999' }, shp: { name: '배수아', phone: '010-0123-4444', addr: '대전 서구 둔산로 55 1010호' }, bnk: { n: '국민은행', acc: '220-012-345670', h: '배수아' } },
    { displayName: '유나메이크업', handle: 'yuna.makeup_art', file: 'creator_yuna_makeup_1772726739684.png', tags: ['💄 뷰티'], region: '서울 영등포구', fol: 75300, bio: '트렌디한 걸크러쉬 메이크업 튜토리얼 🖤\n#메이크업튜토리얼 #스모키', pb: { v: 800000, f: 500000, s: 150000, uM: 1, uP: 400000, dM: 0, dP: 0 }, biz: { is: true, no: '678-90-12346', name: '정유나', birth: '1995' }, shp: { name: '정유나', phone: '010-1234-5555', addr: '서울 영등포구 국제금융로 1111호' }, bnk: { n: '우리은행', acc: '330-123-456781', h: '정유나' } },
    { displayName: '정아클리닉', handle: 'jeonga.clinic', file: 'creator_jeonga_clinic_1772726754251.png', tags: ['💉 시술/병원'], region: '서울 서초구', fol: 89500, bio: '홈케어의 정석 & 더마코스메틱 리뷰 🩺\n#메디컬뷰티 #더마 #홈케어', pb: { v: 950000, f: 600000, s: 200000, uM: 1, uP: 450000, dM: 1, dP: 300000 }, biz: { is: true, no: '789-01-23457', name: '문정아', birth: '1989' }, shp: { name: '문정아', phone: '010-2345-6666', addr: '서울 서초구 서초대로 33 1212호' }, bnk: { n: '하나은행', acc: '440-234-567892', h: '문정아' } },
    { displayName: '채린글로우', handle: 'chaerin.glow', file: 'creator_chaerin_glow_1772726724177.png', tags: ['💄 뷰티'], region: '부산 해운대구', fol: 62800, bio: '깐달걀 피부결, 베이스 메이크업 장인 ✨\n#물광 #베이스메이크업 #촉촉립', pb: { v: 650000, f: 350000, s: 120000, uM: 1, uP: 300000, dM: 1, dP: 200000 }, biz: { is: false, no: null, name: '윤채린', birth: '1996' }, shp: { name: '윤채린', phone: '010-3456-7777', addr: '부산 해운대구 센텀중앙로 1313호' }, bnk: { n: '농협은행', acc: '550-345-678903', h: '윤채린' } },
    { displayName: '하은뷰티', handle: 'haeun.beauty.log', file: 'creator_haeun_beauty_1772726504050.png', tags: ['💄 뷰티'], region: '서울 종로구', fol: 154000, bio: '호텔 스파 베이스, 럭셔리 라인 스킨케어 🦢\n#럭셔리뷰티 #스파 #에스테틱', pb: { v: 1500000, f: 900000, s: 400000, uM: 1, uP: 700000, dM: 1, dP: 500000 }, biz: { is: true, no: '890-12-34568', name: '이하은', birth: '1991' }, shp: { name: '이하은', phone: '010-4567-8888', addr: '서울 종로구 세종대로 8 1414호' }, bnk: { n: '기업은행', acc: '660-456-789014', h: '주식회사 글로우셀' } },
    { displayName: '소율다이어트', handle: 'soyul.diet', file: 'creator_soyul_diet_1772726194313.png', tags: ['🥗 다이어트'], region: '경기 고양시', fol: 56000, bio: '맛있게 먹고 예쁘게 빼는 직장인 다이어터 🥗\n#다이어트식단 #홈트 #식단', pb: { v: 600000, f: 350000, s: 120000, uM: 1, uP: 300000, dM: 1, dP: 250000 }, biz: { is: true, no: '901-23-45679', name: '한소율', birth: '1997' }, shp: { name: '한소율', phone: '010-5678-9999', addr: '경기 고양시 일산동구 1515호' }, bnk: { n: 'SC제일은행', acc: '123-56-789012', h: '한소율' } },
    { displayName: '승아스포츠', handle: 'seunga.sporty', file: 'creator_seunga_sports_1772726543539.png', tags: ['🏋️ 헬스/운동'], region: '서울 송파구', fol: 78200, bio: '러닝, 헬스, 필라테스🔥 오운완 라이프\n#바디프로필 #오운완 #애슬레저', pb: { v: 800000, f: 500000, s: 150000, uM: 1, uP: 400000, dM: 0, dP: 0 }, biz: { is: true, no: '012-34-56780', name: '오승아', birth: '1995' }, shp: { name: '오승아', phone: '010-6789-0000', addr: '서울 송파구 올림픽로 1616호' }, bnk: { n: '신한은행', acc: '110-678-901234', h: '오승아' } },
    { displayName: '채은디톡스', handle: 'chaeun.detox', file: 'creator_chaeun_detox_1772726522675.png', tags: ['💊 건강'], region: '대구 수성구', fol: 21500, bio: '속부터 맑아지는 이너뷰티 큐레이터 🌿\n#이너뷰티 #클렌즈 #영양제', pb: { v: 250000, f: 150000, s: 60000, uM: 1, uP: 100000, dM: 1, dP: 80000 }, biz: { is: false, no: null, name: '박채은', birth: '1998' }, shp: { name: '박채은', phone: '010-7890-1112', addr: '대구 수성구 달구벌대로 1717호' }, bnk: { n: '국민은행', acc: '220-789-012345', h: '박채은' } },
    { displayName: '민경헤어', handle: 'minkyung.hair', file: 'creator_minkyung_hair_1772726084375.png', tags: ['💄 뷰티'], region: '서울 강남구', fol: 43200, bio: '셀프 고데기 여신머리 장인 💇‍♀️ (현직 원장)\n#헤어스타일링 #셀프헤어 #두피케어', pb: { v: 500000, f: 300000, s: 100000, uM: 1, uP: 300000, dM: 1, dP: 200000 }, biz: { is: true, no: '123-11-22334', name: '조민경', birth: '1990' }, shp: { name: '조민경', phone: '010-8901-2223', addr: '서울 강남구 압구정로 1818호' }, bnk: { n: '우리은행', acc: '330-890-123456', h: '조민경' } },
    { displayName: '소이한복', handle: 'soi.hanbok', file: 'creator_soi_hanbok_1772726210942.png', tags: ['✈️ 여행'], region: '전북 전주시', fol: 29800, bio: '우리 옷을 일상으로, 생활한복 여행기 🌸\n#생활한복 #전통 #국내여행', pb: { v: 350000, f: 200000, s: 70000, uM: 1, uP: 150000, dM: 1, dP: 150000 }, biz: { is: false, no: null, name: '전소이', birth: '1997' }, shp: { name: '전소이', phone: '010-9012-3334', addr: '전북 전주시 완산구 한지길 1919호' }, bnk: { n: '하나은행', acc: '440-901-234567', h: '전소이' } },
    { displayName: '예림오가닉', handle: 'yerim.organic', file: 'creator_yerim_organic_1772726559802.png', tags: ['🏡 리빙/인테리어'], region: '제주 제주시', fol: 15400, bio: '지구와 나를 위한 제로웨이스트 슬로우 라이프 🪴\n#친환경 #제로웨이스트 #에코', pb: { v: 200000, f: 150000, s: 50000, uM: 1, uP: 100000, dM: 0, dP: 0 }, biz: { is: false, no: null, name: '노예림', birth: '1999' }, shp: { name: '노예림', phone: '010-0123-4445', addr: '제주 제주시 구좌읍 2020호' }, bnk: { n: '농협은행', acc: '550-012-345678', h: '노예림' } },
    { displayName: '예진네일즈', handle: 'yejin.nails_', file: 'creator_yejin_nails_1772726622048.png', tags: ['💄 뷰티'], region: '인천 부평구', fol: 38100, bio: '이달의 트렌드 아트 & 셀프 네일 꿀팁 발사 💅\n#네일아트 #셀프네일 #뷰티', pb: { v: 400000, f: 250000, s: 80000, uM: 1, uP: 200000, dM: 1, dP: 150000 }, biz: { is: true, no: '234-22-33445', name: '한예진', birth: '1994' }, shp: { name: '한예진', phone: '010-1234-5556', addr: '인천 부평구 부평문화로 2121호' }, bnk: { n: '기업은행', acc: '660-123-456789', h: '한예진' } },
    { displayName: '지민스타일', handle: 'jimin.homecafe', file: 'creator_jimin_style_1772726636799.png', tags: ['🏡 리빙/인테리어'], region: '경기 용인시', fol: 64500, bio: '아늑한 홈카페와 내 방 꾸미기 감성기록 ☕\n#홈카페 #자취방 #인테리어', pb: { v: 750000, f: 450000, s: 150000, uM: 1, uP: 350000, dM: 1, dP: 200000 }, biz: { is: true, no: '345-33-44556', name: '박지민', birth: '1996' }, shp: { name: '박지민', phone: '010-2345-6667', addr: '경기 용인시 수지구 성복로 2222호' }, bnk: { n: '카카오뱅크', acc: '770-234-567890', h: '박지민' } },
    { displayName: '지아럭셔리', handle: 'jia.luxury_life', file: 'creator_jia_luxury_1772726652088.png', tags: ['🎬 영화/문화'], region: '서울 용산구', fol: 215000, bio: '하이엔드 오마카세와 명품 언박싱 💎\n#언박싱 #파인다이닝 #호캉스', pb: { v: 2500000, f: 1500000, s: 600000, uM: 1, uP: 1000000, dM: 0, dP: 0 }, biz: { is: true, no: '456-44-55667', name: '유지아', birth: '1989' }, shp: { name: '유지아', phone: '010-3456-7778', addr: '서울 용산구 독서당로 2323호' }, bnk: { n: '신한은행', acc: '110-345-678901', h: '주식회사 지아라이프' } }
]

async function seed() {
    const { data: mockProfiles, error: pErr } = await supabase.from('profiles').select('id').eq('is_mock', true)
    if (pErr) throw pErr

    console.log(`Found ${mockProfiles.length} mock profiles. Deleting their auth accounts...`)
    for (const p of mockProfiles) {
        await supabase.auth.admin.deleteUser(p.id)
    }

    // Also clear any dangling mock auth accounts
    let hasMore = true
    let page = 1
    while (hasMore) {
        const { data: usersData, error: lErr } = await supabase.auth.admin.listUsers({ page, perPage: 1000 })
        if (lErr) break
        const mockUsers = usersData.users.filter(u => u.email && u.email.endsWith('@mock.creadypick.com'))
        for (const u of mockUsers) {
            await supabase.auth.admin.deleteUser(u.id)
        }
        hasMore = usersData.users.length === 1000
        page++
    }
    console.log('Old mock users deleted. Now generating new 23 MCN creators...')

    // We already uploaded images to Supabase storage, so they exist at mcn-detailed-avatars/[file]
    // Get public URL prefix
    const avatarPrefix = `${supabaseUrl}/storage/v1/object/public/avatars/mcn-detailed-avatars/`

    let successCount = 0

    for (const c of PERSONAS) {
        const email = `mock_${c.handle.replace(/[^a-zA-Z0-9]/g, '')}@mock.creadypick.com`

        // 1) Create auth user
        const { data: authData, error: authErr } = await supabase.auth.admin.createUser({
            email,
            password: 'password123',
            email_confirm: true,
            user_metadata: { role: 'creator', display_name: c.displayName }
        })

        if (authErr) {
            console.error(`Auth creation failed for ${c.displayName}:`, authErr.message)
            continue
        }

        const userId = authData.user.id

        // 2) Insert Profile
        const profilePayload = {
            id: userId,
            email: email,
            role: 'creator',
            is_mock: true,
            display_name: c.displayName,
            instagram_handle: c.handle,
            avatar_url: avatarPrefix + c.file,

            // New V2 fields
            tags: c.tags,
            primary_region: c.region,
            followers_count: c.fol,
            description: c.bio,

            price_video: c.pb.v,
            price_feed: c.pb.f,
            price_story: c.pb.s,
            usage_rights_month: c.pb.uM,
            usage_rights_price: c.pb.uP,
            auto_dm_month: c.pb.dM,
            auto_dm_price: c.pb.dP,

            is_business_registered: c.biz.is,
            creator_business_number: c.biz.no,
            legal_name: c.biz.name,
            birth_date: c.biz.birth,

            shipping_name: c.shp.name,
            shipping_phone: c.shp.phone,
            shipping_address: c.shp.addr,

            bank_name: c.bnk.n,
            account_number: c.bnk.acc,
            account_holder: c.bnk.h,

            // Reusing these for basic compat
            phone: c.shp.phone,
            address: c.shp.addr
        }

        const { error: profErr } = await supabase.from('profiles').insert(profilePayload)

        if (profErr) {
            if (profErr.code === '23505') {
                const { error: updErr } = await supabase.from('profiles').update(profilePayload).eq('id', userId)
                if (updErr) console.error('Profile update failed:', updErr.message)
            } else {
                console.error(`Profile insert failed for ${c.displayName}:`, profErr.message)
            }
        }

        // 3) Create social channel (Instagram)
        await supabase.from('social_channels').insert({
            user_id: userId,
            platform: 'instagram',
            handle: c.handle,
            followers_count: c.fol,
            is_primary: true,
            is_public: true
        })

        // 4) Add to team
        await supabase.from('team_members').insert({
            team_id: CREADYPICK_TEAM_ID,
            user_id: userId,
            role: 'member'
        })

        console.log(`✅ ${c.displayName} 생성 완료`)
        successCount++
    }

    console.log(`\n🎉 완료: 총 ${successCount}명 크리에이터 DB 등록 및 MCN 소속 배정 완료!`)
}

seed().catch(console.error)
