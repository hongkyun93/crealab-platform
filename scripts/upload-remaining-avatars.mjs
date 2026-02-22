/**
 * upload-remaining-avatars.mjs
 * 나머지 44개 mock 크리에이터 프로필 이미지를 Supabase Storage에 업로드하고
 * profiles 테이블의 avatar_url 업데이트
 * 
 * 실행: node scripts/upload-remaining-avatars.mjs
 */

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

const SUPABASE_URL = 'https://wbeyxjoqcwjbcuwvjrsa.supabase.co'
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndiZXl4am9xY3dqYmN1d3ZqcnNhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDEyMTY2NiwiZXhwIjoyMDg1Njk3NjY2fQ.cEPlYDDi-sxR5BBYstPD_oPQ7h-5oXABhf3ER4WD610'

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
const ARTIFACTS_DIR = '/Users/kimhongkyun/.gemini/antigravity/brain/2dab4fa5-2ab1-49c5-affa-a7168457d5c8'
const BUCKET = 'avatars'
const FOLDER = 'mock-creators'

// 파일명 prefix → email 매핑
const MAPPINGS = [
    { prefix: 'profile_seojunfilm_', email: 'mock_seojunfilm@mock.creadypick.com' },
    { prefix: 'profile_sungmindev_', email: 'mock_sungmindev@mock.creadypick.com' },
    { prefix: 'profile_suhyuncrypto_', email: 'mock_suhyuncrypto@mock.creadypick.com' },
    { prefix: 'profile_siwoocats_', email: 'mock_siwoocats@mock.creadypick.com' },
    { prefix: 'profile_wsgourmet_', email: 'mock_wsgourmet@mock.creadypick.com' },
    { prefix: 'profile_woojaeaudio_', email: 'mock_woojaeaudio@mock.creadypick.com' },
    { prefix: 'profile_jaemindrive_', email: 'mock_jaemindrive@mock.creadypick.com' },
    { prefix: 'profile_junhyukinvest_', email: 'mock_junhyukinvest@mock.creadypick.com' },
    { prefix: 'profile_junhocamping_', email: 'mock_junhocamping@mock.creadypick.com' },
    { prefix: 'profile_jiwootraveler_', email: 'mock_jiwootraveler@mock.creadypick.com' },
    { prefix: 'profile_jihoramen_', email: 'mock_jihoramen@mock.creadypick.com' },
    { prefix: 'profile_jihoongame_', email: 'mock_jihoongame@mock.creadypick.com' },
    { prefix: 'profile_taeminvet_', email: 'mock_taeminvet@mock.creadypick.com' },
    { prefix: 'profile_taeyangdad_', email: 'mock_taeyangdad@mock.creadypick.com' },
    { prefix: 'profile_taeyoungstreet_', email: 'mock_taeyoungstreet@mock.creadypick.com' },
    { prefix: 'profile_hyunwoophoto_', email: 'mock_hyunwoophoto@mock.creadypick.com' },
    { prefix: 'profile_hojinchef_', email: 'mock_hojinchef@mock.creadypick.com' },
    { prefix: 'profile_sodambaking_', email: 'mock_sodambaking@mock.creadypick.com' },
    { prefix: 'profile_soraculture_', email: 'mock_soraculture@mock.creadypick.com' },
    { prefix: 'profile_sujinvegan_', email: 'mock_sujinvegan@mock.creadypick.com' },
    { prefix: 'profile_sieunyoga_', email: 'mock_sieunyoga@mock.creadypick.com' },
    { prefix: 'profile_soribirdlife_', email: 'mock_soribirdlife@mock.creadypick.com' },
    { prefix: 'profile_arinpetfood_', email: 'mock_arinpetfood@mock.creadypick.com' },
    { prefix: 'profile_yenatwins_', email: 'mock_yenatwins@mock.creadypick.com' },
    { prefix: 'profile_yerinfood_', email: 'mock_yerinfood@mock.creadypick.com' },
    { prefix: 'profile_yeeunmom_', email: 'mock_yeeunmom@mock.creadypick.com' },
    { prefix: 'profile_yujinisland_', email: 'mock_yujinisland@mock.creadypick.com' },
    { prefix: 'profile_yunahealth_', email: 'mock_yunahealth@mock.creadypick.com' },
    { prefix: 'profile_eunbyulclean_', email: 'mock_eunbyulclean@mock.creadypick.com' },
    { prefix: 'profile_eunseobook_', email: 'mock_eunseobook@mock.creadypick.com' },
    { prefix: 'profile_eunjihomecook_', email: 'mock_eunjihomecook@mock.creadypick.com' },
    { prefix: 'profile_eunchaepet_', email: 'mock_eunchaepet@mock.creadypick.com' },
    { prefix: 'profile_jiyunmoney_', email: 'mock_jiyunmoney@mock.creadypick.com' },
    { prefix: 'profile_jihyunderm_', email: 'mock_jihyunderm@mock.creadypick.com' },
    { prefix: 'profile_chaewonhome_', email: 'mock_chaewonhome@mock.creadypick.com' },
    { prefix: 'profile_haneulwedding_', email: 'mock_haneulwedding@mock.creadypick.com' },
    { prefix: 'profile_hayoungtrip_', email: 'mock_hayoungtrip@mock.creadypick.com' },
    { prefix: 'profile_yulaweddingprep_', email: 'mock_yulaweddingprep@mock.creadypick.com' },
    { prefix: 'profile_hayulpregmom_', email: 'mock_hayulpregmom@mock.creadypick.com' },
    { prefix: 'profile_haeuncalligraphy_', email: 'mock_haeuncalligraphy@mock.creadypick.com' },
    { prefix: 'profile_haeumretro_', email: 'mock_haeumretro@mock.creadypick.com' },
    { prefix: 'profile_hajincraft_', email: 'mock_hajincraft@mock.creadypick.com' },
    { prefix: 'profile_haewongarden_', email: 'mock_haewongarden@mock.creadypick.com' },
]

async function findFile(prefix) {
    const files = fs.readdirSync(ARTIFACTS_DIR)
    const found = files.find(f => f.startsWith(prefix) && f.endsWith('.png'))
    return found ? path.join(ARTIFACTS_DIR, found) : null
}

async function main() {
    console.log(`🚀 나머지 44개 아바타 업로드 시작...\n`)
    let success = 0, failed = 0

    for (const { prefix, email } of MAPPINGS) {
        const filePath = await findFile(prefix)
        if (!filePath) {
            console.error(`❌ 파일 없음: ${prefix}*`)
            failed++
            continue
        }

        const fileName = path.basename(filePath)
        const storagePath = `${FOLDER}/${fileName}`
        const fileBuffer = fs.readFileSync(filePath)

        const { error: uploadError } = await supabase.storage
            .from(BUCKET)
            .upload(storagePath, fileBuffer, { contentType: 'image/png', upsert: true })

        if (uploadError) {
            console.error(`❌ 업로드 실패 ${fileName}: ${uploadError.message}`)
            failed++
            continue
        }

        const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(storagePath)

        const { error: updateError } = await supabase
            .from('profiles')
            .update({ avatar_url: publicUrl })
            .eq('email', email)

        if (updateError) {
            console.error(`❌ DB 업데이트 실패 ${email}: ${updateError.message}`)
            failed++
        } else {
            console.log(`✅ ${email.split('@')[0]} → ${fileName}`)
            success++
        }
    }

    console.log(`\n🎉 완료! 성공: ${success}개, 실패: ${failed}개`)
}

main().catch(console.error)
