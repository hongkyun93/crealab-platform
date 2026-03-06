/**
 * Upload 23 MCN creator headshots to Supabase Storage
 * and apply to each creator's profile.
 */
import { supabase } from './seed-ir-data'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const ARTIFACT_DIR = resolve(process.env.HOME || '', '.gemini/antigravity/brain/96a89f5c-b643-4e86-856f-365500286ffc')

// Map: display_name (DB nickname) → detailed persona & generated image filename
interface CreatorPersona {
    name: string
    file: string
    bio: string
    tags: string[]
}

const CREATOR_AVATARS: CreatorPersona[] = [
    // 👗 패션 (6명)
    { name: '나래플러스', file: 'creator_narae_fashion_1772726049064.png', bio: '모든 체형이 아름다울 수 있도록 ✨ #플러스사이즈 #빅사이즈 데일리룩 코디네이터 나래입니다! 당당하고 스타일리시한 플러스사이즈 패션을 소개해요.', tags: ['👗 플러스사이즈', '☀️ 데일리룩', '🛍️ 하울'] },
    { name: '도윤맨즈', file: 'creator_doyun_mens_1772726069559.png', bio: '실패 없는 남친룩의 정석 🧥 깔끔하고 미니멀한 남성 패션과 데이트 코디를 제안합니다. 키작남/평범남도 쉽게 따라할 수 있는 핏을 연구해요.', tags: ['👕 남성패션', '☕ 미니멀룩', '📸 데이트룩'] },
    { name: '수빈OOTD', file: 'creator_subin_ootd_1772726227322.png', bio: '스트릿부터 오피스룩까지 나만의 무드로 힙하게 🖤 매일매일 입고 싶은 트렌디 OOTD! 힙한 성수동 카페투어와 함께하는 캐주얼룩을 기록합니다.', tags: ['🧢 스트릿/캐주얼', '✨ OOTD', '📸 카페투어'] },
    { name: '태희의옷장', file: 'creator_taehee_minimal_1772726416620.png', bio: '비워내는 아름다움 🤍 오래 입을 수 있는 미니멀하고 클래식한 타임리스(Timeless) 패션을 공유합니다. #모노톤성애자', tags: ['🤍 미니멀룩', '👜 무채색', '👔 오피스룩'] },
    { name: '하늘니트', file: 'creator_haneul_knit_1772726434948.png', bio: '포근함이 가득한 일상 🧶 부드러운 파스텔톤과 니트 아이템을 사랑하는 하늘입니다. 사랑스럽고 데일리한 페미닌 룩을 좋아해요!', tags: ['🌸 페미닌', '☀️ 데일리룩', '🧶 니트/가디건'] },
    { name: '하린빈티지', file: 'creator_harin_vintage_1772726449956.png', bio: 'Y2K 그리고 빈티지 무드 📼 남들과 똑같은 옷은 재미없잖아요? 유니크한 레이어링과 빈티지샵 믹스매치 룩북.', tags: ['🎧 Y2K', '📼 빈티지', '🕶️ 스트릿'] },

    // 💄 뷰티 (8명)
    { name: '서연스킨', file: 'creator_seoyeon_skin_1772726120992.png', bio: '맑고 투명한 유리알 피부의 비밀 💧 스킨케어에 진심인 서연입니다. 민감성 수부지를 위한 순한 기초템 리뷰와 스킨케어 루틴을 소개해요.', tags: ['💧 스킨케어', '✨ 유리알피부', '🤍 수부지'] },
    { name: '서현향수일기', file: 'creator_seohyun_perfume_1772726135050.png', bio: '당신의 기억은 어떤 향기인가요? 🕰️ 숨겨진 니치 퍼퓸부터 고혹적인 브랜드 향수까지, 분위기를 입는 향수 리뷰어 서현입니다.', tags: ['🔮 향수/퍼퓸', '🌙 무드/분위기', '🤍 럭셔리'] },
    { name: '소미스킨랩', file: 'creator_somi_skinlab_1772726152623.png', bio: '성분부터 분석하는 깐깐한 뷰티 연구소 🧪 피부톤, 피부결, 노화 방지에 효과적인 기능성 화장품들을 꼼꼼하게 테스트하고 추천합니다!', tags: ['🧪 뷰티연구소', '🔬 성분분석', '💧 안티에이징'] },
    { name: '수아코스메틱', file: 'creator_sua_cosmetic_1772726397384.png', bio: '쿨톤/웜톤 착붙 메이크업 꿀팁 대방출 💋 신상 색조 화장품 발색뷰터 데일리 메이크업 튜토리얼까지 뷰티의 모든 것!', tags: ['💄 색조/메이크업', '💖 신상리뷰', '👄 퍼스널컬러'] },
    { name: '유나메이크업', file: 'creator_yuna_makeup_1772726739684.png', bio: '조금은 엣지있고 유니크하게 🖤 스모키부터 트렌디한 걸크러쉬 메이크업까지. 평범함을 거부하는 프로 메이크업 아티스트 유나입니다.', tags: ['🖤 걸크러쉬/엣지', '💄 메이크업튜토리얼', '🕶️ 셀럽커버'] },
    { name: '정아클리닉', file: 'creator_jeonga_clinic_1772726754251.png', bio: '피부과 언니가 알려주는 홈케어의 정석 🩺 시술만큼 중요한 전문적인 메디컬 스킨케어 정보와 더마코스메틱 제품을 정직하게 리뷰합니다.', tags: ['🩺 메디컬뷰티', '💊 더마코스메틱', '💧 홈케어'] },
    { name: '채린글로우', file: 'creator_chaerin_glow_1772726724177.png', bio: '속에서 우러나오는 진짜 물광 피부 ✨ 베이스 메이크업의 장인! 피부가 좋아보이는 결광 메이크업과 촉촉한 립 제품들을 소개해요.', tags: ['✨ 결광/물광', '😍 베이스메이크업', '💋 촉촉립'] },
    { name: '하은뷰티', file: 'creator_haeun_beauty_1772726504050.png', bio: '고급스러운 우아함을 담아 🦢 호텔 스파에서 관리받은 듯한 럭셔리 뷰티 템들과 피부 본연의 힘을 길러주는 데일리 루틴을 기록합니다.', tags: ['🦢 럭셔리뷰티', '🤍 힐링/스파', '💧 스킨케어루틴'] },

    // 🥗 피트니스/다이어트 (3명)
    { name: '소율다이어트', file: 'creator_soyul_diet_1772726194313.png', bio: '굶지 않고 예쁘게 빼요 🥗 직장인 다이어터 소율의 건강한 식단과 홈트 일지. 맛있는 다이어트 레시피와 다이어트 간식을 공유합니다!', tags: ['🥗 다이어트식단', '🧘‍♀️ 홈트레이닝', '💪 건강한습관'] },
    { name: '승아스포츠', file: 'creator_seunga_sports_1772726543539.png', bio: '에너지 넘치는 오운완 라이프 🔥 헬스, 러닝, 필라테스 등 운동을 사랑하는 체육인 승아! 운동복 코디와 바디프로필 꿀팁 대방출.', tags: ['🔥 바디프로필', '🏃‍♀️ 러닝/헬스', '👗 애슬레저룩'] },
    { name: '채은디톡스', file: 'creator_chaeun_detox_1772726522675.png', bio: '이너뷰티부터 채우는 진짜 건강 🌿 클렌즈 주스, 디톡스 식단, 영양제 정보까지! 속이 편해야 피부도 맑아지는 이너뷰티 큐레이터입니다.', tags: ['🌿 이너뷰티', '🍏 디톡스/클렌즈', '💊 영양제후기'] },

    // 🏡 라이프/기타 (6명)
    { name: '민경헤어', file: 'creator_minkyung_hair_1772726084375.png', bio: '당신의 두상과 얼굴형에 딱 맞는 인생 헤어 💇‍♀️ 청담동 현직 디자이너가 알려주는 셀프 스타일링 비법, 고데기 추천, 여신머리 튜토리얼.', tags: ['💇‍♀️ 헤어스타일링', '🎀 셀프헤어', '💧 두피케어'] },
    { name: '소이한복', file: 'creator_soi_hanbok_1772726210942.png', bio: '우리 옷 한복, 일상에 스며들다 🌸 생활한복 데일리룩과 한복 입고 가기 좋은 서울 명소 코스 공유! 전통의 현대적인 재해석을 보여드립니다.', tags: ['🌸 생활한복', '🇰🇷 전통/문창', '📸 여행/장소'] },
    { name: '예림오가닉', file: 'creator_yerim_organic_1772726559802.png', bio: '나와 지구를 위한 작은 실천 🪴 제로웨이스트와 친환경 리빙 아이템, 그리고 자연에 가까운 슬로우 라이프를 실천하는 에코 크리에이터입니다.', tags: ['🪴 친환경/에코', '🌎 제로웨이스트', '🏡 슬로우라이프'] },
    { name: '예진네일즈', file: 'creator_yejin_nails_1772726622048.png', bio: '손끝에 피어나는 예술 💅 계절에 맞는 트렌디한 네일 아트 디자인과 기분 전환되는 이달의 아트를 추천해요. 셀프 네일 꿀팁은 덤!', tags: ['💅 네일아트', '✨ 셀프네일', '🌸 트렌드/디자인'] },
    { name: '지민스타일', file: 'creator_jimin_style_1772726636799.png', bio: '감성 가득한 일상의 순간들 ☕ 따뜻한 홈카페, 아늑한 내방 꾸미기, 그리고 분위기 있는 신상 카페 투어. 소소하지만 확실한 행복을 기록해요.', tags: ['☕ 홈카페', '🏡 자취방/인테리어', '📸 카페투어'] },
    { name: '지아럭셔리', file: 'creator_jia_luxury_1772726652088.png', bio: '오직 명품과 파인다이닝만을 고집하는 프리미엄 라이프스타일 💎 신상 백 언박싱 피드와 프라이빗한 호텔 투어 멤버십 정보를 공유합니다.', tags: ['💎 명품/언박싱', '🥂 파인다이닝', '🏨 럭셔리호텔'] },
]

async function uploadAndApply() {
    console.log('🚀 MCN 크리에이터 아바타 업로드 시작...')

    for (const { name, file, bio, tags } of CREATOR_AVATARS) {
        const filePath = resolve(ARTIFACT_DIR, file)
        let fileBuffer: Buffer
        try {
            fileBuffer = readFileSync(filePath)
        } catch (e: any) {
            console.error(`  ❌ 파일 없음: ${file}`)
            continue
        }

        const storagePath = `mcn-detailed-avatars/${file}`

        // Upload to Supabase Storage
        const { error: uploadErr } = await supabase.storage
            .from('avatars')
            .upload(storagePath, fileBuffer, { contentType: 'image/png', upsert: true })

        if (uploadErr) {
            console.error(`  ❌ 업로드 실패 [${name}]:`, uploadErr.message)
            continue
        }

        const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(storagePath)

        // Update profile by display_name (mock creator)
        const { error: updateErr } = await supabase
            .from('profiles')
            .update({
                avatar_url: publicUrl,
                bio: bio,
                tags: tags
            })
            .eq('is_mock', true)
            .eq('role', 'creator')
            .eq('display_name', name)

        if (updateErr) {
            console.error(`  ❌ 프로필 업데이트 실패 [${name}]:`, updateErr.message)
        } else {
            console.log(`  ✅ [${name}] 적용 완료`)
        }
    }

    console.log('\n🎉 전체 완료!')
}

uploadAndApply().catch(console.error)
