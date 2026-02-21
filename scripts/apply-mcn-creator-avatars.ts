/**
 * Upload 23 MCN creator headshots to Supabase Storage
 * and apply to each creator's profile.
 */
import { supabase } from './seed-ir-data'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const ARTIFACT_DIR = resolve(process.env.HOME || '', '.gemini/antigravity/brain/2dab4fa5-2ab1-49c5-affa-a7168457d5c8')

// Map: display_name (DB nickname) → generated image filename
const CREATOR_AVATARS: { name: string; file: string }[] = [
    { name: '나래플러스', file: 'creator_narae_fashion_1771685937863.png' },
    { name: '도윤맨즈', file: 'creator_doyun_mens_1771685975554.png' },
    { name: '민경헤어', file: 'creator_minkyung_hair_1771686012767.png' },
    { name: '서연스킨', file: 'creator_seoyeon_skin_1771686220662.png' },
    { name: '서현향수일기', file: 'creator_seohyun_perfume_1771686255982.png' },
    { name: '소미스킨랩', file: 'creator_somi_skinlab_1771686291396.png' },
    { name: '소율다이어트', file: 'creator_soyul_diet_1771686325518.png' },
    { name: '소이한복', file: 'creator_soi_hanbok_1771686356936.png' },
    { name: '수빈OOTD', file: 'creator_subin_ootd_1771686397394.png' },
    { name: '수아코스메틱', file: 'creator_sua_cosmetic_1771686424494.png' },
    { name: '승아스포츠', file: 'creator_seunga_sports_1771686473869.png' },
    { name: '예림오가닉', file: 'creator_yerim_organic_1771686511799.png' },
    { name: '예진네일즈', file: 'creator_yejin_nails_1771686539806.png' },
    { name: '유나메이크업', file: 'creator_yuna_makeup_1771686584030.png' },
    { name: '정아클리닉', file: 'creator_jeonga_clinic_1771686612217.png' },
    { name: '지민스타일', file: 'creator_jimin_style_1771686659888.png' },
    { name: '지아럭셔리', file: 'creator_jia_luxury_1771686715276.png' },
    { name: '채린글로우', file: 'creator_chaerin_glow_1771686750658.png' },
    { name: '채은디톡스', file: 'creator_chaeun_detox_1771686785774.png' },
    { name: '태희의옷장', file: 'creator_taehee_minimal_1771686826168.png' },
    { name: '하늘니트', file: 'creator_haneul_knit_1771686892619.png' },
    { name: '하린빈티지', file: 'creator_harin_vintage_1771686943368.png' },
    { name: '하은뷰티', file: 'creator_haeun_beauty_1771686980361.png' },
]

async function uploadAndApply() {
    console.log('🚀 MCN 크리에이터 아바타 업로드 시작...')

    for (const { name, file } of CREATOR_AVATARS) {
        const filePath = resolve(ARTIFACT_DIR, file)
        let fileBuffer: Buffer
        try {
            fileBuffer = readFileSync(filePath)
        } catch (e: any) {
            console.error(`  ❌ 파일 없음: ${file}`)
            continue
        }

        const storagePath = `mcn-creator-avatars/${file}`

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
            .update({ avatar_url: publicUrl })
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
