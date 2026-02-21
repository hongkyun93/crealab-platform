import { supabase, CREATORS } from './seed-ir-data'

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

async function getAvatarUrls() {
    const urls: string[] = []
    for (const file of AVATAR_FILES) {
        const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(`mock-avatars/${file}`)
        urls.push(publicUrl)
    }
    return urls
}

async function main() {
    console.log('크리에이터 아바타 복구 중...');
    const avatarUrls = await getAvatarUrls();

    for (let idx = 0; idx < CREATORS.length; idx++) {
        const c = CREATORS[idx]
        const avatarUrl = avatarUrls.length > 0 ? avatarUrls[idx % avatarUrls.length] : null

        const { error } = await supabase.from('profiles').update({
            avatar_url: avatarUrl
        }).eq('is_mock', true).eq('role', 'creator').eq('display_name', c.display_name)

        if (error) console.error(`❌ 실패 [${c.display_name}]:`, error.message)
    }
    console.log('✅ 복구 완료!');
}

main().catch(console.error)
