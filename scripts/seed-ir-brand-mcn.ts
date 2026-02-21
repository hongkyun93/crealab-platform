/**
 * IR 데모용 브랜드 + MCN Mock 계정 생성 스크립트
 * 
 * 실행: npx tsx scripts/seed-ir-brand-mcn.ts
 * 삭제: npx tsx scripts/seed-ir-brand-mcn.ts --delete
 * 
 * 생성되는 계정:
 *   1. 브랜드: mock_brand_demo@mock.creadypick.com / MockUser2026!
 *   2. MCN:    mock_mcn_demo@mock.creadypick.com / MockUser2026!
 *      - 뷰티, 패션, 다이어트 태그의 기존 mock 크리에이터를 팀원으로 소속
 */

import { supabase } from './seed-ir-data'

const BRAND_EMAIL = 'mock_brand_demo@mock.creadypick.com'
const MCN_EMAIL = 'mock_mcn_demo@mock.creadypick.com'
const DEMO_PASSWORD = 'MockUser2026!'

// MCN 팀에 소속시킬 태그 (뷰티, 패션, 다이어트)
const MCN_TARGET_TAGS = ['💄 뷰티', '👗 패션', '🥗 다이어트']

async function main() {
    const isDelete = process.argv.includes('--delete')

    if (isDelete) {
        console.log('🗑️  브랜드/MCN mock 계정 삭제 모드...')

        // 1. Find and delete brand mock
        const { data: brandProfile } = await supabase
            .from('profiles')
            .select('id')
            .eq('email', BRAND_EMAIL)
            .maybeSingle()

        if (brandProfile) {
            // Delete products
            await supabase.from('brand_products').delete().eq('brand_id', brandProfile.id)
            console.log('✅ brand_products 삭제')

            // Delete auth user (cascades to profile)
            await supabase.auth.admin.deleteUser(brandProfile.id)
            console.log('✅ 브랜드 auth user 삭제')
        }

        // 2. Find and delete MCN mock
        const { data: mcnProfile } = await supabase
            .from('profiles')
            .select('id')
            .eq('email', MCN_EMAIL)
            .maybeSingle()

        if (mcnProfile) {
            // Find team
            const { data: teamMembership } = await supabase
                .from('team_members')
                .select('team_id')
                .eq('user_id', mcnProfile.id)
                .eq('role', 'owner')
                .maybeSingle()

            if (teamMembership) {
                // Delete all team members
                await supabase.from('team_members').delete().eq('team_id', teamMembership.team_id)
                console.log('✅ team_members 삭제')

                // Delete team
                await supabase.from('teams').delete().eq('id', teamMembership.team_id)
                console.log('✅ team 삭제')
            }

            // Delete auth user (cascades to profile)
            await supabase.auth.admin.deleteUser(mcnProfile.id)
            console.log('✅ MCN auth user 삭제')
        }

        console.log('🎉 브랜드/MCN mock 삭제 완료!')
        return
    }

    // ============================================================
    // CREATE MODE
    // ============================================================
    console.log('🚀 브랜드/MCN mock 계정 생성 시작...')

    // ── 1. Brand Account ──
    console.log('\n📦 [1/2] 브랜드 계정 생성...')
    const { data: brandAuth, error: brandAuthErr } = await supabase.auth.admin.createUser({
        email: BRAND_EMAIL,
        password: DEMO_PASSWORD,
        email_confirm: true,
        user_metadata: { display_name: '크레디픽 데모 브랜드', role: 'brand' },
    })

    if (brandAuthErr || !brandAuth.user) {
        console.error('❌ 브랜드 auth 생성 실패:', brandAuthErr?.message)
        // Try to continue with MCN if brand already exists
        if (!brandAuthErr?.message?.includes('already been registered')) {
            return
        }
    }

    const brandUserId = brandAuth?.user?.id
    if (brandUserId) {
        // Update profile
        const { error: brandProfileErr } = await supabase.from('profiles').update({
            display_name: '크레디픽 데모 브랜드',
            description: 'CreadyPick IR 데모용 브랜드 계정입니다. 뷰티/패션/라이프스타일 제품을 다루며, 크리에이터와의 협업 프로세스를 보여드립니다.',
            role: 'brand',
            is_mock: true,
            onboarding_completed: true,
            website: 'https://www.creadypick.com',
            primary_region: '서울',
        }).eq('id', brandUserId)

        if (brandProfileErr) {
            console.error('❌ 브랜드 프로필 업데이트 실패:', brandProfileErr.message)
        } else {
            console.log(`✅ 브랜드 프로필 생성: ${BRAND_EMAIL}`)
        }

        // Create sample products
        const products = [
            {
                brand_id: brandUserId,
                name: '글로우 톤업 선크림 SPF50+',
                description: '자연스러운 톤업과 자외선 차단을 동시에. 촉촉한 수분 선크림.',
                price: 28000,
                category: '💄 뷰티',
                is_mock: true,
                selling_points: '- SPF50+/PA++++ 자외선 완벽 차단\n- 톤업 효과로 맨얼굴에도 깨끗\n- 수분감 가득, 백탁 현상 없음',
            },
            {
                brand_id: brandUserId,
                name: 'S/S 린넨 블렌디드 셋업',
                description: '여름에도 시원한 린넨 혼방 셋업. 오피스룩에도, 데일리에도 활용 가능.',
                price: 89000,
                category: '👗 패션',
                is_mock: true,
                selling_points: '- 린넨 55% + 폴리 45% 구김 최소\n- 오버핏 자켓 + 와이드 팬츠 세트\n- 아이보리, 차콜, 베이지 3컬러',
            },
            {
                brand_id: brandUserId,
                name: '저분자 콜라겐 프로바이오틱스',
                description: '피부 탄력 + 장 건강 동시 케어. 하루 1포로 간편하게.',
                price: 45000,
                category: '💊 건강',
                is_mock: true,
                selling_points: '- 저분자 피쉬 콜라겐 1,000mg\n- 프로바이오틱스 100억 CFU\n- 유산균 생존율 95%',
            },
            {
                brand_id: brandUserId,
                name: '슬림핏 프로틴 쉐이크',
                description: '다이어트 중에도 맛있게! 고단백 저칼로리 쉐이크.',
                price: 38000,
                category: '🥗 다이어트',
                is_mock: true,
                selling_points: '- 1팩 150kcal, 단백질 25g\n- 인공감미료 무첨가\n- 초코, 바닐라, 딸기 3가지 맛',
            },
        ]

        const { error: productErr } = await supabase.from('brand_products').insert(products)
        if (productErr) {
            console.error('❌ 제품 생성 실패:', productErr.message)
        } else {
            console.log(`✅ 브랜드 제품 ${products.length}개 생성`)
        }
    }

    // ── 2. MCN Account + Team ──
    console.log('\n🏢 [2/2] MCN 계정 + 팀 생성...')
    const { data: mcnAuth, error: mcnAuthErr } = await supabase.auth.admin.createUser({
        email: MCN_EMAIL,
        password: DEMO_PASSWORD,
        email_confirm: true,
        user_metadata: { display_name: '크레디픽 데모 MCN', role: 'mcn' },
    })

    if (mcnAuthErr || !mcnAuth.user) {
        console.error('❌ MCN auth 생성 실패:', mcnAuthErr?.message)
        return
    }

    const mcnUserId = mcnAuth.user.id

    // Update MCN profile
    const { error: mcnProfileErr } = await supabase.from('profiles').update({
        display_name: '크레디픽 데모 MCN',
        description: 'CreadyPick IR 데모용 MCN 계정입니다. 뷰티/패션/다이어트 분야 크리에이터를 관리합니다.',
        role: 'mcn',
        is_mock: true,
        onboarding_completed: true,
        primary_region: '서울',
    }).eq('id', mcnUserId)

    if (mcnProfileErr) {
        console.error('❌ MCN 프로필 생성 실패:', mcnProfileErr.message)
        return
    }
    console.log(`✅ MCN 프로필 생성: ${MCN_EMAIL}`)

    // Create Team (manually, since service role doesn't have auth.uid())
    const teamSlug = `mock-mcn-demo-${Date.now()}`
    const { data: teamData, error: teamErr } = await supabase.from('teams').insert({
        name: '크레디픽 데모 MCN',
        slug: teamSlug,
        created_by: mcnUserId,
    }).select('id').single()

    if (teamErr || !teamData) {
        console.error('❌ 팀 생성 실패:', teamErr?.message)
        return
    }
    console.log(`✅ 팀 생성: ${teamData.id} (slug: ${teamSlug})`)

    // Add MCN as team owner
    const { error: ownerErr } = await supabase.from('team_members').insert({
        team_id: teamData.id,
        user_id: mcnUserId,
        role: 'owner',
    })
    if (ownerErr) {
        console.error('❌ 팀 오너 추가 실패:', ownerErr?.message)
    } else {
        console.log('✅ MCN → 팀 오너 등록')
    }

    // Find mock creators with matching tags (뷰티, 패션, 다이어트)
    const { data: mockCreators, error: creatorQueryErr } = await supabase
        .from('profiles')
        .select('id, display_name, tags')
        .eq('is_mock', true)
        .eq('role', 'creator')
        .order('display_name')

    if (creatorQueryErr) {
        console.error('❌ mock 크리에이터 조회 실패:', creatorQueryErr.message)
        return
    }

    // Filter by target tags
    const targetCreators = (mockCreators || []).filter(c => {
        const tags = c.tags || []
        return tags.some((t: string) => MCN_TARGET_TAGS.includes(t))
    })

    console.log(`📋 매칭 크리에이터: ${targetCreators.length}명 (뷰티/패션/다이어트)`)

    // Add as team members
    let addedCount = 0
    for (const creator of targetCreators) {
        const { error: memberErr } = await supabase.from('team_members').insert({
            team_id: teamData.id,
            user_id: creator.id,
            role: 'member',
        })

        if (memberErr) {
            // Skip duplicates
            if (!memberErr.message.includes('duplicate')) {
                console.warn(`  ⚠️ ${creator.display_name} 추가 실패:`, memberErr.message)
            }
        } else {
            addedCount++
        }
    }
    console.log(`✅ 팀원 ${addedCount}명 소속 완료`)

    // Update team_id on creators' profiles for association
    const creatorIds = targetCreators.map((c: any) => c.id)
    // Also update life_moments to associate with team
    const { error: momentTeamErr } = await supabase
        .from('life_moments')
        .update({ team_id: teamData.id })
        .in('influencer_id', creatorIds)
        .eq('is_mock', true)

    if (momentTeamErr) {
        console.warn('⚠️ 모먼트 팀 연결 실패:', momentTeamErr.message)
    } else {
        console.log('✅ 해당 크리에이터 모먼트 → 팀 연결 완료')
    }

    // ── Summary ──
    console.log('\n' + '═'.repeat(50))
    console.log('🎉 브랜드/MCN Mock 계정 생성 완료!')
    console.log('═'.repeat(50))
    console.log('')
    console.log('📦 브랜드 계정:')
    console.log(`   이메일: ${BRAND_EMAIL}`)
    console.log(`   비밀번호: ${DEMO_PASSWORD}`)
    console.log(`   역할: brand`)
    console.log('')
    console.log('🏢 MCN 계정:')
    console.log(`   이메일: ${MCN_EMAIL}`)
    console.log(`   비밀번호: ${DEMO_PASSWORD}`)
    console.log(`   역할: mcn`)
    console.log(`   팀원: ${addedCount}명 (뷰티/패션/다이어트)`)
    console.log('')
    console.log('🌐 데모 URL:')
    console.log('   /brand-services  →  /brand?demo=true')
    console.log('   /mcn-services    →  /mcn?demo=true')
}

main().catch(console.error)
