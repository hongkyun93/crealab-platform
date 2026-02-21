/**
 * upload-mock-avatars.mjs
 * 생성된 크리에이터 프로필 이미지를 Supabase Storage에 업로드하고
 * profiles 테이블의 avatar_url을 업데이트합니다.
 *
 * 실행: node scripts/upload-mock-avatars.mjs
 */

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

const SUPABASE_URL = 'https://wbeyxjoqcwjbcuwvjrsa.supabase.co'
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndiZXl4am9xY3dqYmN1d3ZqcnNhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDEyMTY2NiwiZXhwIjoyMDg1Njk3NjY2fQ.cEPlYDDi-sxR5BBYstPD_oPQ7h-5oXABhf3ER4WD610'

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

const ARTIFACTS_DIR = '/Users/kimhongkyun/.gemini/antigravity/brain/2dab4fa5-2ab1-49c5-affa-a7168457d5c8'
const BUCKET = 'avatars'

// 생성 완료된 이미지 → 이메일 매핑
const AVATAR_MAP = [
    { file: 'profile_gayoungcafe_1771696247037.png', email: 'mock_gayoungcafe@mock.creadypick.com' },
    { file: 'profile_gaeunapple_1771696264008.png', email: 'mock_gaeunapple@mock.creadypick.com' },
    { file: 'profile_naramontessori_1771696283704.png', email: 'mock_naramontessori@mock.creadypick.com' },
    { file: 'profile_narienglish_1771696316065.png', email: 'mock_narienglish@mock.creadypick.com' },
    { file: 'profile_nayeonpuppy_1771696335069.png', email: 'mock_nayeonpuppy@mock.creadypick.com' },
    { file: 'profile_nayuntrip_1771696356149.png', email: 'mock_nayunluxurytrip@mock.creadypick.com' },
    { file: 'profile_daingadget_1771696389559.png', email: 'mock_daingadget@mock.creadypick.com' },
    { file: 'profile_dahyunfit_1771696407045.png', email: 'mock_dahyunfit@mock.creadypick.com' },
    { file: 'profile_dogyeongplant_1771696426599.png', email: 'mock_dogyeongplant@mock.creadypick.com' },
    { file: 'profile_dohapiano_1771696468126.png', email: 'mock_dohapiano@mock.creadypick.com' },
    { file: 'profile_dohyuntech_1771696491635.png', email: 'mock_dohyuntech@mock.creadypick.com' },
    { file: 'profile_donggunmuscle_1771696513562.png', email: 'mock_donggunmuscle@mock.creadypick.com' },
    { file: 'profile_raonnewlywed_1771696547403.png', email: 'mock_raonnewlywed@mock.creadypick.com' },
    { file: 'profile_mingyuesport_1771696569982.png', email: 'mock_mingyuesport@mock.creadypick.com' },
    { file: 'profile_minseobaby_1771696586666.png', email: 'mock_minseobaby@mock.creadypick.com' },
    { file: 'profile_minjieats_1771696629052.png', email: 'mock_minjieats@mock.creadypick.com' },
    { file: 'profile_seoaliving_1771696646565.png', email: 'mock_seoaliving@mock.creadypick.com' },
    { file: 'profile_seoyoungstudy_1771696664775.png', email: 'mock_seoyoungstudy@mock.creadypick.com' },
    { file: 'profile_seoyulsolo_1771696698936.png', email: 'mock_seoyulsolo@mock.creadypick.com' },
    { file: 'profile_seojinkitchen_1771696719882.png', email: 'mock_seojinkitchen@mock.creadypick.com' },
]

async function ensureBucket() {
    const { data: buckets } = await supabase.storage.listBuckets()
    const exists = buckets?.some(b => b.name === BUCKET)
    if (!exists) {
        await supabase.storage.createBucket(BUCKET, { public: true })
        console.log(`✅ Bucket "${BUCKET}" created`)
    }
}

async function uploadAndUpdate({ file, email }) {
    const filePath = path.join(ARTIFACTS_DIR, file)
    if (!fs.existsSync(filePath)) {
        console.warn(`⚠️  File not found: ${file}`)
        return
    }

    const fileBuffer = fs.readFileSync(filePath)
    const storagePath = `mock-creators/${file}`

    // 1. Upload to Storage
    const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(storagePath, fileBuffer, {
            contentType: 'image/png',
            upsert: true,
        })

    if (uploadError) {
        console.error(`❌ Upload failed for ${email}:`, uploadError.message)
        return
    }

    // 2. Get public URL
    const { data: { publicUrl } } = supabase.storage
        .from(BUCKET)
        .getPublicUrl(storagePath)

    // 3. Update profiles table
    const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('email', email)

    if (updateError) {
        console.error(`❌ Profile update failed for ${email}:`, updateError.message)
        return
    }

    console.log(`✅ ${email} → ${publicUrl}`)
}

async function main() {
    console.log('🚀 Starting mock avatar upload...\n')
    await ensureBucket()

    for (const entry of AVATAR_MAP) {
        await uploadAndUpdate(entry)
    }

    console.log('\n🎉 Done! All avatars uploaded and profiles updated.')
}

main().catch(console.error)
