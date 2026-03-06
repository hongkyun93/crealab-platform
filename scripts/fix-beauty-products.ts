/**
 * 뷰티 브랜드 제품 보수 스크립트 — FK 에러 이후 재시도
 * 실행: npx tsx scripts/fix-beauty-products.ts
 */
import { supabase } from './seed-ir-data'

const BRANDS_DATA = [
    {
        email: 'mock_laneige_beauty@mock.creadypick.com', products: [
            { name: '워터 슬리핑 마스크 EX 80ml', description: '자는 동안 집중 수분 보충. 프로비타민B5와 미네랄 워터 성분이 수분 장벽을 회복시켜 아침에 탱탱한 피부로 깨어납니다.', price: 32000, selling_points: '- 8시간 수면 동안 집중 보습\n- 프로비타민B5 + 슬리핑 EX 콤플렉스\n- 끈적임 없는 젤 텍스처' },
            { name: '립 슬리핑 마스크 베리 20g', description: '자는 동안 입술에 집중 영양 공급. 베리 향이 은은하고 발색 없이 촉촉하게 입술 각질을 제거합니다.', price: 18000, selling_points: '- 입술 각질 & 잔주름 케어\n- 달콤한 베리 향\n- 오버나이트 집중 보습' },
            { name: '네오쿠션 에어리 N23', description: '22년 연속 베스트셀러. 가볍고 자연스러운 밀착력으로 하루 종일 촉촉하게 유지됩니다.', price: 42000, selling_points: '- 밀착력 24시간 지속\n- SPF50+/PA++++\n- 12가지 쉐이드 선택' },
            { name: '선크린 에어 피트 SPF50+ 50ml', description: '무기자차 선크림. 백탁 없이 투명하게 발리며 끈적임이 없습니다.', price: 27000, selling_points: '- 무기자차 SPF50+/PA++++\n- 백탁·끈적임 없음\n- 얼굴·몸 겸용' },
        ]
    },
    {
        email: 'mock_innisfree_beauty@mock.creadypick.com', products: [
            { name: '그린티 세럼 80ml', description: '제주 유기농 녹차 생그린티 70%로 만든 수분 세럼.', price: 24000, selling_points: '- 생그린티 70% 함유\n- 7초 흡수 경량 텍스처\n- 24시간 수분 유지' },
            { name: '제주 수분 크림 50ml', description: '제주 용암수와 히알루론산 5종이 피부 깊숙이 수분을 전달.', price: 22000, selling_points: '- 제주 용암수\n- 히알루론산 5종 복합\n- 무향/무파라벤' },
            { name: '화이트 파우더 SPF35 8g', description: '피지를 먹고 피부 톤을 화사하게 정리해주는 피니싱 파우더.', price: 12000, selling_points: '- 피지 흡착 파우더\n- 피부 톤 균일 보정\n- 리필 가능 친환경' },
            { name: '수퍼 화이티닝 크림 50ml', description: '나이아신아마이드와 비타민C로 4주 만에 톤 개선.', price: 35000, selling_points: '- 나이아신아마이드 5%\n- 비타민C 유도체\n- 피부과 테스트 완료' },
        ]
    },
    {
        email: 'mock_sulwhasoo_beauty@mock.creadypick.com', products: [
            { name: '자음생 에센스 60ml', description: '설화수 대표 에센스. 인삼 성분이 피부 활력을 되살립니다.', price: 98000, selling_points: '- 인삼 추출 자음생 복합체\n- 탄력+수분+윤기 동시케어\n- 15년 설화수 대표' },
            { name: '설린 크림 75ml', description: '봉독 성분이 피부 재생을 촉진하는 야간 크림.', price: 125000, selling_points: '- 봉독 추출물 피부 재생\n- 수면 중 집중 탄력케어\n- 피부과 임상 확인' },
            { name: '퍼펙팅 쿠션 SPF50+ 15g×2', description: '한방 성분이 담긴 커버력 쿠션.', price: 72000, selling_points: '- SPF50+/PA++++\n- 자음백화 성분\n- 리필 쿠션 포함' },
            { name: '예약 마스크 120ml', description: '자음생 성분 농축 슬리핑 마스크. 하룻밤 수분·영양 공급.', price: 52000, selling_points: '- 자음생 복합체 고농도\n- 광채·탄력·수분 트리플\n- 씻어내지 않는 타입' },
        ]
    },
    {
        email: 'mock_hera_beauty@mock.creadypick.com', products: [
            { name: '블랙 쿠션 SPF34 15g×2', description: '헤라 베스트셀러. 블랙 케이스와 15시간 지속 커버력.', price: 58000, selling_points: '- 15시간 밀착 지속\n- SPF34/PA+++\n- 23가지 컬러' },
            { name: '센슈얼 누드 발름 3.5g', description: '립 케어와 컬러를 동시에. 촉촉한 누드 글로스.', price: 26000, selling_points: '- 모이스쳐 유리 성분\n- 11가지 누드 컬러\n- 무향 저자극' },
            { name: '블랙 파운데이션 N25 40ml', description: '얇고 균일하게 밀착되는 새틴 파운데이션.', price: 48000, selling_points: '- 세미 매트 새틴 피니시\n- 모공·잡티 커버\n- SPF30/PA++' },
            { name: '아이레이저 아이라이너', description: '정밀 아이라이너. 워터프루프 포뮬라.', price: 22000, selling_points: '- 0.01mm 초미세 붓팁\n- 워터프루프·피지프루프\n- 24시간 번짐 없음' },
        ]
    },
    {
        email: 'mock_mediheal_beauty@mock.creadypick.com', products: [
            { name: 'N.M.F 아쿠아링 앰플 마스크 10매입', description: '천연보습인자(NMF) 성분 피부 수분 장벽 집중 케어.', price: 18000, selling_points: '- N.M.F 수분 앰플\n- 피부과 임상 저자극\n- 매일 사용 가능' },
            { name: 'W.H.P 화이트닝 하이드로겔 마스크 5매입', description: '하이드로겔 소재. 미백·보습 동시에.', price: 22000, selling_points: '- 하이드로겔 500% 밀착\n- 나이아신아마이드 미백\n- 냉장 보관 쿨링 효과' },
            { name: 'T.E.N 세포 리페어링 앰플 30ml', description: '피부 장벽 복구 고농도 앰플.', price: 42000, selling_points: '- 피부 세포 재생 촉진\n- 트리플 세라마이드\n- 1주 후 피부 장벽 개선' },
            { name: '더마레이아 SPF50+ 선세럼 50ml', description: '세럼 텍스처의 자외선 차단제. 스킨케어+선케어 한 단계로.', price: 36000, selling_points: '- 세럼 질감 선케어\n- SPF50+/PA++++\n- 메이크업 베이스 활용 가능' },
        ]
    },
];

async function run() {
    console.log('🔧 브랜드 제품 재시도...\n');
    let total = 0;

    const { data: users } = await supabase.auth.admin.listUsers({ perPage: 1000 });

    for (const brand of BRANDS_DATA) {
        const authUser = users?.users.find(u => u.email === brand.email);
        if (!authUser) {
            console.error(`  ❌ 유저 없음: ${brand.email}`);
            continue;
        }

        // Check if profile exists
        const { data: profile } = await supabase.from('profiles').select('id').eq('id', authUser.id).maybeSingle();
        if (!profile) {
            // Manually insert profile row
            await supabase.from('profiles').insert({
                id: authUser.id,
                role: 'brand',
                is_mock: true,
                onboarding_completed: true,
                display_name: brand.email.split('@')[0].replace('mock_', '').replace('_beauty', ''),
            });
            console.log(`  📝 프로필 수동 생성 완료: ${authUser.id}`);
        }

        const products = brand.products.map(p => ({
            brand_id: authUser.id,
            name: p.name,
            description: p.description,
            price: p.price,
            category: '💄 뷰티',
            is_mock: true,
            selling_points: p.selling_points,
        }));

        // Delete existing mock products first to avoid duplicates
        await supabase.from('brand_products').delete().eq('brand_id', authUser.id).eq('is_mock', true);

        const { error } = await supabase.from('brand_products').insert(products);
        if (error) {
            console.error(`  ❌ 제품 실패 [${brand.email}]:`, error.message);
        } else {
            console.log(`  ✅ ${brand.email.replace('@mock.creadypick.com', '')} — 제품 ${products.length}개`);
            total += products.length;
        }
    }

    console.log(`\n🎉 브랜드 제품 총 ${total}개 생성 완료!`);
}
run().catch(console.error);
