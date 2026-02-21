/**
 * 브랜드 프로필 이미지(아바타) 설정
 * 
 * DiceBear API를 사용하여 브랜드명에 맞는 깔끔한 아바타를 생성
 * 각 브랜드 카테고리에 맞는 색상 팔레트 적용
 * 
 * 실행: npx tsx scripts/seed-ir-brand-avatars.ts
 */

import { supabase } from './seed-ir-data'

// 브랜드별 색상 매핑 (카테고리 기반)
const BRAND_COLORS: Record<string, { bg: string; fg: string }> = {
    // 뷰티 - 핑크/로즈 계열
    '글로우랩': { bg: '4CAF50', fg: 'ffffff' },      // Green (botanical)
    '루미에르코스메틱': { bg: 'E91E63', fg: 'ffffff' }, // Pink (cosmetic)
    '헤어리츄얼': { bg: '795548', fg: 'ffffff' },      // Brown (hair)
    '센트메모리': { bg: '9C27B0', fg: 'ffffff' },      // Purple (perfume)
    '더마이너스': { bg: '00BCD4', fg: 'ffffff' },      // Cyan (clean/minimal)
    '네일팝': { bg: 'FF5722', fg: 'ffffff' },          // Deep orange (fun/pop)
    '선데이스킨': { bg: 'FF9800', fg: 'ffffff' },      // Orange (sun)
    '아이블랑': { bg: '607D8B', fg: 'ffffff' },        // Blue grey (elegant)
    // 패션 - 블루/네이비 계열
    '뮤즈클로젯': { bg: 'F48FB1', fg: 'ffffff' },      // Soft pink (feminine)
    '멘트리': { bg: '37474F', fg: 'ffffff' },          // Dark grey (masculine)
    '플렉서블': { bg: '00C853', fg: 'ffffff' },        // Bright green (active)
    '소울주얼리': { bg: 'FFD700', fg: '333333' },      // Gold (jewelry)
    '어반백': { bg: '263238', fg: 'ffffff' },          // Almost black (urban)
    '프롬서울': { bg: '1565C0', fg: 'ffffff' },        // Blue (Seoul)
    // 다이어트/건강 - 그린 계열
    '핏밀': { bg: '8BC34A', fg: 'ffffff' },            // Light green (diet)
    '프로틴랩': { bg: '3F51B5', fg: 'ffffff' },        // Indigo (lab)
    '그린디톡스': { bg: '2E7D32', fg: 'ffffff' },      // Dark green (detox)
    '뉴트리코어': { bg: '0097A7', fg: 'ffffff' },      // Teal (health)
    '홈트레이너': { bg: 'F44336', fg: 'ffffff' },      // Red (energy)
    '슬림플랜': { bg: '66BB6A', fg: 'ffffff' },        // Green (slim)
}

async function main() {
    console.log('🖼️  브랜드 프로필 이미지 설정 중...\n')

    // Get all mock brand profiles
    const { data: brands } = await supabase
        .from('profiles')
        .select('id, display_name, email')
        .eq('is_mock', true)
        .eq('role', 'brand')
        .order('display_name')

    if (!brands?.length) {
        console.error('❌ mock 브랜드가 없습니다')
        return
    }

    let count = 0
    for (const brand of brands) {
        const name = brand.display_name || 'Brand'
        const colors = BRAND_COLORS[name] || { bg: '6366f1', fg: 'ffffff' }

        // DiceBear shapes API — generates unique geometric patterns per seed
        const avatarUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=${colors.bg}&textColor=${colors.fg}&fontSize=36&chars=2`

        const { error } = await supabase
            .from('profiles')
            .update({ avatar_url: avatarUrl })
            .eq('id', brand.id)

        if (error) {
            console.error(`  ❌ ${name}:`, error.message)
        } else {
            count++
            console.log(`  ✅ ${name} → ${colors.bg}`)
        }
    }

    console.log(`\n🎉 브랜드 ${count}개 아바타 설정 완료!`)
}

main().catch(console.error)
