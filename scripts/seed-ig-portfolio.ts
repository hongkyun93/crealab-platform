/**
 * seed-ig-portfolio.ts
 * 
 * 23명 mock 크리에이터의 social_channels 테이블에
 * 가라 Instagram API 포트폴리오 데이터(ig_portfolio_snapshot)를 삽입/업데이트합니다.
 * 
 * 데이터 구조: IgPortfolioData (CreatorProfileCard.tsx 기준)
 *   - er, avgReach, avgSaves, posts[]
 *   - audienceFemaleRatio, audienceDomesticRatio
 *   - allAgeGroups[], topCities[]
 *   - accountInsights: { profileViews30d, websiteClicks30d, monthlyReach, monthlyImpressions }
 *   - derivedMetrics: { erByFollowers, erByReach, saveRate, reachRate, realFanIndex, fqi, viralityRate, cpr, cpe, tms, roasPrediction, avgLikes, avgComments, avgShares, avgViews, avgEngagement, postCount }
 *   - autoInsights: [{ emoji, title, description }]
 *   - insights: [{ emoji, title, description }]  (수동 편집 배지)
 *   - demographics: { targetAudienceText, femalePct, ageGroups[], cities[] }
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(__dirname, '..', '.env.local') })

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// ── 헬퍼: 팔로워 수 기반 현실적 수치 계산
function buildPortfolio(params: {
    handle: string
    followers: number
    erPct: number          // 참여율 %
    reachRatePct: number   // 도달률 %
    femaleRatio: number    // 여성 비율 0~1
    domesticRatio: number  // 국내 비율 0~1
    niche: 'beauty' | 'fashion' | 'fitness' | 'lifestyle'
    priceVideo: number
    priceFeed: number
    cityDistrib: { city: string; pct: number }[]
    ageDistrib: { age: string; pct: number }[]
    targetText: string
    insights: { emoji: string; title: string; description: string }[]
}) {
    const { followers, erPct, reachRatePct, femaleRatio, domesticRatio } = params

    const avgReach = Math.round(followers * reachRatePct / 100)
    const avgEngagement = Math.round(avgReach * erPct / 100)
    const avgLikes = Math.round(avgEngagement * 0.80)
    const avgComments = Math.round(avgEngagement * 0.08)
    const avgShares = Math.round(avgEngagement * 0.07)
    const avgSaves = Math.round(avgEngagement * 0.05)
    const avgViews = Math.round(avgReach * 1.6)
    const postCount = Math.floor(Math.random() * 60) + 80 // 80~140개
    const erByFollowers = parseFloat((avgEngagement / followers * 100).toFixed(2))
    const erByReach = parseFloat(erPct.toFixed(2))
    const saveRate = parseFloat((avgSaves / avgReach * 100).toFixed(2))
    const realFanIndex = parseFloat((erByFollowers * 0.6 + saveRate * 0.4).toFixed(2))
    const fqi = parseFloat((realFanIndex * (domesticRatio * 100) / 100).toFixed(2))
    const viralityRate = parseFloat((avgShares / avgReach * 100).toFixed(2))
    const cpr = params.priceFeed > 0 ? parseFloat((params.priceFeed / avgReach).toFixed(2)) : null
    const cpe = params.priceVideo > 0 ? parseFloat((params.priceVideo / avgEngagement).toFixed(2)) : null
    const tms = parseFloat((realFanIndex * 10 + viralityRate * 5).toFixed(1))
    const roasPrediction = cpe ? parseFloat((1 / cpe * 100).toFixed(1)) : null
    const monthlyReach = Math.round(avgReach * 8)
    const monthlyImpressions = Math.round(monthlyReach * 1.8)

    // 니치별 Unsplash 이미지 풀 (400x500, portrait 비율)
    const NICHE_IMAGES: Record<string, string[]> = {
        beauty: [
            'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=500&fit=crop',
            'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=400&h=500&fit=crop',
            'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=400&h=500&fit=crop',
            'https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?w=400&h=500&fit=crop',
            'https://images.unsplash.com/photo-1503236823255-94609f598e71?w=400&h=500&fit=crop',
            'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=400&h=500&fit=crop',
            'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=400&h=500&fit=crop',
            'https://images.unsplash.com/photo-1624206112918-f140f087f9b5?w=400&h=500&fit=crop',
            'https://images.unsplash.com/photo-1512207736890-6ffed8a84e8d?w=400&h=500&fit=crop',
            'https://images.unsplash.com/photo-1631730359587-1e8e0a2b4eb0?w=400&h=500&fit=crop',
            'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=400&h=500&fit=crop',
            'https://images.unsplash.com/photo-1599305090598-fe179d501227?w=400&h=500&fit=crop',
        ],
        fashion: [
            'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&h=500&fit=crop',
            'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&h=500&fit=crop',
            'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&h=500&fit=crop',
            'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=400&h=500&fit=crop',
            'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=500&fit=crop',
            'https://images.unsplash.com/photo-1554412933-514a83d2f3c8?w=400&h=500&fit=crop',
            'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=400&h=500&fit=crop',
            'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=400&h=500&fit=crop',
            'https://images.unsplash.com/photo-1562572159-4efd90758b1f?w=400&h=500&fit=crop',
            'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400&h=500&fit=crop',
            'https://images.unsplash.com/photo-1597983073493-88cd39afb880?w=400&h=500&fit=crop',
            'https://images.unsplash.com/photo-1516762689617-e1cffcef479d?w=400&h=500&fit=crop',
        ],
        fitness: [
            'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=500&fit=crop',
            'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&h=500&fit=crop',
            'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=500&fit=crop',
            'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&h=500&fit=crop',
            'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&h=500&fit=crop',
            'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=500&fit=crop',
            'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=400&h=500&fit=crop',
            'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=500&fit=crop',
            'https://images.unsplash.com/photo-1535914254981-b5012eebbd15?w=400&h=500&fit=crop',
            'https://images.unsplash.com/photo-1599058917212-d750089bc07e?w=400&h=500&fit=crop',
            'https://images.unsplash.com/photo-1604480132736-44c188fe4d20?w=400&h=500&fit=crop',
            'https://images.unsplash.com/photo-1607962837359-5e7e89f86776?w=400&h=500&fit=crop',
        ],
        lifestyle: [
            'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=500&fit=crop',
            'https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=400&h=500&fit=crop',
            'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=400&h=500&fit=crop',
            'https://images.unsplash.com/photo-1493857671505-72967e2e2760?w=400&h=500&fit=crop',
            'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=500&fit=crop',
            'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=500&fit=crop',
            'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400&h=500&fit=crop',
            'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=500&fit=crop',
            'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=500&fit=crop',
            'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=400&h=500&fit=crop',
            'https://images.unsplash.com/photo-1567016432779-094069958ea5?w=400&h=500&fit=crop',
            'https://images.unsplash.com/photo-1493770348161-369560ae357d?w=400&h=500&fit=crop',
        ],
    }

    // 해시태그 포함 캡션
    const NICHE_CAPTIONS: Record<string, string[]> = {
        beauty: [
            '오늘의 베이스 메이크업 루틴 공유해요 💄 #메이크업 #뷰티 #dailymakeup',
            '신상 파운데이션 발색 테스트! 완전 대박이에요 ✨ #파운데이션 #뷰티리뷰 #makeup',
            '이달의 스킨케어 루틴 총정리 🧴 #스킨케어 #피부관리 #skincareroutine',
            '아침 클렌징 이렇게 하고 있어요 🫧 #클렌징 #세안 #아침루틴',
            '퍼스널컬러 쿨톤 봄 메이크업 완성 🌸 #퍼스널컬러 #쿨톤 #봄메이크업',
            'SPF 선크림 성분 꼼꼼 분석 🔬 #선크림 #자외선차단 #skincare',
            '오늘의 립 PICK! 이 색 실화야? 💋 #립스틱 #립컬러 #뷰티',
            '데일리 눈썹 루틴 공개해요 ✏️ #눈썹 #눈썹정리 #메이크업팁',
            '피부결 개선 전후 비교 진짜 달라요 ✅ #피부결 #피부개선 #beforeafter',
            '세럼 레이어링 이 순서 맞아요 💧 #세럼 #스킨케어 #뷰티팁',
            '눈밑 다크써클 컨실러 추천 🎯 #컨실러 #다크써클 #뷰티추천',
            '미셀라 워터 vs 폼 클렌저 비교 리뷰 🆚 #세안 #클렌징 #리뷰',
        ],
        fashion: [
            '오늘의 OOTD 공유해드려요 👗 #ootd #오오티디 #데일리룩',
            '가을 레이어링 코디 이렇게 해봐요 🍂 #레이어링 #가을코디 #fashion',
            '신상 니트 착샷 어때요? 너무 포근해 🧶 #니트 #가디건 #가을패션',
            '오피스룩 이렇게 입어봤어요 💼 #오피스룩 #직장인패션 #commuter',
            '미니멀 코디로 고퀄리티 완성 🤍 #미니멀 #미니멀룩 #ootd',
            '요즘 매일 입는 캐주얼 세트예요 👟 #캐주얼룩 #데일리 #fashion',
            '데이트룩 추천! 너무 설레 ❤️ #데이트룩 #커플룩 #여성패션',
            '빈티지 하울 언박싱해봤어요 📦 #빈티지 #하울 #빈티지패션',
            '무신사 신상 베스트 PICK만 뽑아봄 🔥 #무신사 #신상 #패션하울',
            '자켓 하나로 완성되는 봄룩 🌷 #자켓 #봄패션 #봄코디',
            '화이트 데님 코디 3가지 🤍 #화이트진 #데님 #코디추천',
            '오늘은 걸크러쉬 무드로 📸 #걸크러쉬 #스트릿패션 #ootd',
        ],
        fitness: [
            '오늘 홈트 루틴 공유해요 💪 #홈트 #홈트레이닝 #운동',
            '다이어트 냉파 식단 브이로그 🥗 #냉파 #다이어트식단 #식단관리',
            '오운완 기록! 오늘도 해냈다 🔥 #오운완 #헬스 #운동일상',
            '단백질 간식 추천 BEST 5 이거 다 먹었어요 🥜 #단백질 #다이어트 #헬스',
            '플랭크 30일 후기 진짜 달라요 😮 #플랭크 #코어운동 #30일챌린지',
            '저탄고지 3주차 결과 공개 📊 #저탄고지 #키토 #다이어트결과',
            '필라테스 원데이 클래스 후기 ✨ #필라테스 #pilates #운동후기',
            '헬스장 초보 루틴 A~Z 정리해봤어요 🏋️ #헬스초보 #운동루틴 #헬스',
            '러닝 5km 전후 퍼포먼스 비교 🏃 #러닝 #마라톤 #러닝크루',
            '기초대사량 올리는 방법 알려드려요 🔬 #기초대사량 #다이어트팁 #헬스',
            '요거트볼 레시피 공유해요 🍓 #요거트볼 #건강식 #다이어트레시피',
            '클린이팅 한 달 식단 총정리 📝 #클린이팅 #한달식단 #건강식',
        ],
        lifestyle: [
            '홈카페 세팅 새로 바꿨어요 ☕ #홈카페 #카페인데리어 #홈카페일상',
            '오늘 다녀온 신상 카페 리뷰예요 ✨ #카페투어 #카페 #카페리뷰',
            '자취방 인테리어 일부 공개합니다 🏠 #자취방 #인테리어 #방꾸',
            '주말 브런치 직접 만들어봤어요 🥞 #브런치 #홈브런치 #요리',
            '올영 장보기 신상 하울 🛍️ #올리브영 #올영하울 #뷰티하울',
            '제주 감성 투어 1박 2일 코스 🌿 #제주여행 #제주감성 #국내여행',
            '요즘 자주 입는 홈웨어 추천이에요 🛋️ #홈웨어 #집순이 #홈웨어추천',
            '소소한 플리마켓 나들이 기록 🎪 #플리마켓 #마켓 #주말나들이',
            '드라이플라워로 방 꾸미는 법 🌸 #드라이플라워 #방꾸미기 #인테리어',
            '이번 주 독서 기록 어떤 책 읽었니 📚 #독서 #책 #북스타그램',
            '오전 루틴 그로세리 쇼핑 다녀왔어요 🛒 #마트 #장보기 #주부일상',
            '겨울 정취 가득한 책상 세팅 🕯️ #책상 #공부 #겨울감성',
        ],
    }

    const imgPool = NICHE_IMAGES[params.niche] || NICHE_IMAGES.lifestyle
    const captPool = NICHE_CAPTIONS[params.niche] || NICHE_CAPTIONS.lifestyle

    // 미디어 타입: 5 릴스 + 4 이미지 + 3 캐러셀
    const MEDIA_TYPES = ['VIDEO', 'VIDEO', 'VIDEO', 'VIDEO', 'VIDEO', 'IMAGE', 'IMAGE', 'IMAGE', 'IMAGE', 'CAROUSEL_ALBUM', 'CAROUSEL_ALBUM', 'CAROUSEL_ALBUM']
    const posts = Array.from({ length: 12 }, (_, i) => {
        const mType = MEDIA_TYPES[i]
        const isReel = mType === 'VIDEO'
        // 릴스는 더 높은 도달 (바이럴 효과)
        const reachMultiplier = isReel ? (1.2 + Math.random() * 0.8) : (0.6 + Math.random() * 0.6)
        const postReach = Math.round(avgReach * reachMultiplier)
        const postEngagement = Math.round(postReach * erPct / 100)
        const postLikes = Math.round(postEngagement * 0.80)
        const imgUrl = imgPool[i % imgPool.length]
        const daysAgo = i * 4 + Math.floor(Math.random() * 3)
        return {
            id: `mock_${params.handle.replace(/\./g, '_')}_${i}`,
            media_type: mType,
            media_source: isReel ? 'reel' : 'post',
            media_url: imgUrl,
            thumbnail_url: imgUrl,
            permalink: `https://www.instagram.com/p/mock${params.handle.replace(/\./g, '').replace(/_/g, '')}${i}/`,
            timestamp: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString(),
            like_count: postLikes,
            comments_count: Math.round(postEngagement * 0.08),
            caption: captPool[i % captPool.length],
            insights: {
                reach: postReach,
                impressions: Math.round(postReach * 1.7),
                saved: Math.round(postEngagement * 0.05),
                shares: Math.round(postEngagement * 0.07),
                video_views: isReel ? Math.round(postReach * 1.6) : undefined,
            },
        }
    })


    return {
        er: erByReach,
        avgReach,
        avgSaves,
        posts,

        audienceFemaleRatio: femaleRatio,
        audienceDomesticRatio: domesticRatio,
        allAgeGroups: params.ageDistrib,
        topCities: params.cityDistrib,

        accountInsights: {
            profileViews30d: Math.round(monthlyReach * 0.25),
            websiteClicks30d: Math.round(monthlyReach * 0.02),
            monthlyReach,
            monthlyImpressions,
        },

        derivedMetrics: {
            erByFollowers,
            erByReach,
            saveRate,
            reachRate: reachRatePct,
            realFanIndex,
            fqi,
            viralityRate,
            cpr,
            cpe,
            tms,
            roasPrediction,
            avgLikes,
            avgComments,
            avgShares,
            avgViews,
            avgEngagement,
            postCount,
        },

        autoInsights: params.insights,
        insights: params.insights, // 수동 배지도 동일하게 초기화

        demographics: {
            targetAudienceText: params.targetText,
            femalePct: Math.round(femaleRatio * 100),
            ageGroups: params.ageDistrib,
            cities: params.cityDistrib,
        },
    }
}



// ── 23명 페르소나 → 포트폴리오 데이터 정의
const PERSONAS = [
    { handle: 'narae.plus_size', followers: 48500, er: 4.2, reach: 28, female: 0.83, domestic: 0.90, niche: 'fashion', pv: 550000, pf: 300000, target: '20-35세 플러스사이즈 패션에 관심 있는 여성, 체형 고민 해소 & 쇼핑 정보 탐색층', cities: [{ city: 'Seoul', pct: 42 }, { city: 'Busan', pct: 13 }, { city: 'Incheon', pct: 9 }, { city: 'Daegu', pct: 7 }, { city: 'Gyeonggi', pct: 5 }], ages: [{ age: '18-24', pct: 22 }, { age: '25-34', pct: 43 }, { age: '35-44', pct: 23 }, { age: '45-54', pct: 8 }, { age: '55+', pct: 4 }], insights: [{ emoji: '👗', title: '플러스사이즈 1위 채널', description: '국내 플러스사이즈 패션 인플루언서 중 상위 3위 이내 팔로워 수, 전문성과 신뢰도 최고.' }, { emoji: '💬', title: '고 ER 4.2%', description: '동규모 패션 계정 평균 대비 1.8배 높은 참여율. 가격 문의, 구매 후기 댓글 많음.' }, { emoji: '🛍️', title: '하이 컨버전 팔로워', description: 'CPC 광고 클릭률 업계 평균 2.4배. 실구매전환 강점.' }] },
    { handle: 'doyun.mens', followers: 32100, er: 3.8, reach: 26, female: 0.32, domestic: 0.88, niche: 'fashion', pv: 400000, pf: 250000, target: '20-35세 남성. 데이트룩/직장인룩 레퍼런스 탐색층', cities: [{ city: 'Seoul', pct: 48 }, { city: 'Gyeonggi', pct: 18 }, { city: 'Busan', pct: 9 }, { city: 'Incheon', pct: 7 }, { city: 'Daegu', pct: 5 }], ages: [{ age: '18-24', pct: 28 }, { age: '25-34', pct: 45 }, { age: '35-44', pct: 18 }, { age: '45-54', pct: 6 }, { age: '55+', pct: 3 }], insights: [{ emoji: '👨', title: '국내 남성 패션 TOP 계정', description: '남성 팔로워 비율 68%, 남성 타겟 캠페인에 최적화된 희귀 채널.' }, { emoji: '🧥', title: '데이트룩 전환율 강점', description: '제품 태그 클릭률 업계 남성계정 최고 수준. 실구매 후기 댓글 다수.' }, { emoji: '📈', title: '매달 5%+ 팔로워 성장', description: '꾸준한 팔로워 증가 트렌드. 브랜드 노출 회수 배가 효과.' }] },
    { handle: 'subin_ootd.kr', followers: 18900, er: 5.1, reach: 30, female: 0.77, domestic: 0.92, niche: 'fashion', pv: 250000, pf: 150000, target: '18-28세 트렌디한 스트릿/캐주얼 패션을 추구하는 여성', cities: [{ city: 'Seoul', pct: 51 }, { city: 'Gyeonggi', pct: 16 }, { city: 'Incheon', pct: 8 }, { city: 'Daejeon', pct: 5 }, { city: 'Busan', pct: 5 }], ages: [{ age: '18-24', pct: 47 }, { age: '25-34', pct: 36 }, { age: '35-44', pct: 11 }, { age: '45-54', pct: 4 }, { age: '55+', pct: 2 }], insights: [{ emoji: '🔥', title: 'MZ 핵심 팔로워', description: '18-24세 비율 47%, 트렌드 민감 젊은 세대 적중률 최고.' }, { emoji: '📸', title: '저장율 5.8% 업계TOP', description: '게시물 저장 비율 평균 패션 계정 4배. 트렌드 레퍼런스 역할.' }, { emoji: '⚡', title: '릴스 뷰: 평균 45만 회', description: '쇼트폼 릴스 오가닉 도달 월 평균 45만 회. 바이럴 확산 강점.' }] },
    { handle: 'taehee.closet', followers: 61000, er: 3.5, reach: 24, female: 0.79, domestic: 0.89, niche: 'fashion', pv: 700000, pf: 400000, target: '28-42세 미니멀·클래식 스타일 지향, 오피스룩 탐색층 직장인 여성', cities: [{ city: 'Seoul', pct: 45 }, { city: 'Gyeonggi', pct: 20 }, { city: 'Busan', pct: 8 }, { city: 'Daegu', pct: 7 }, { city: 'Incheon', pct: 5 }], ages: [{ age: '18-24', pct: 12 }, { age: '25-34', pct: 41 }, { age: '35-44', pct: 33 }, { age: '45-54', pct: 10 }, { age: '55+', pct: 4 }], insights: [{ emoji: '👔', title: '오피스룩 레퍼런스 채널', description: '35-44세 여성 비율 33%. 직장인 타겟 캠페인 적중률 최상급.' }, { emoji: '💼', title: '고구매력 팔로워', description: '팔로워 평균 소득 추정 상위 20% 이상. 프리미엄 브랜드 전환 강점.' }, { emoji: '🤍', title: '장기 팔로워 충성도 높음', description: '팔로워 유지율 92%로 업계 최고 수준. 브랜드 지속 노출 효과.' }] },
    { handle: 'haneul.knit', followers: 13500, er: 6.2, reach: 34, female: 0.88, domestic: 0.94, niche: 'fashion', pv: 150000, pf: 100000, target: '18-27세 페미닌·데일리룩 선호하는 여대생/사회초년생 여성', cities: [{ city: 'Seoul', pct: 39 }, { city: 'Gyeonggi', pct: 22 }, { city: 'Incheon', pct: 9 }, { city: 'Daejeon', pct: 6 }, { city: 'Gwangju', pct: 5 }], ages: [{ age: '18-24', pct: 53 }, { age: '25-34', pct: 32 }, { age: '35-44', pct: 10 }, { age: '45-54', pct: 3 }, { age: '55+', pct: 2 }], insights: [{ emoji: '🌸', title: '마이크로 인플루언서 고ER', description: 'ER 6.2%, 마이크로 인플루언서 평균 3배. 진성 소통 최강.' }, { emoji: '🧶', title: '니트 카테고리 독보적', description: '#니트 #가디건 해시태그 오가닉 도달 매달 상위 0.5%.' }, { emoji: '💌', title: 'DM 활발한 적극 팔로워', description: '게시물당 직접 문의 DM 평균 40건 이상. 높은 팔로워 관여도.' }] },
    { handle: 'harin.vntg', followers: 27800, er: 4.7, reach: 28, female: 0.71, domestic: 0.86, niche: 'fashion', pv: 350000, pf: 200000, target: '19-30세 Y2K·빈티지·힙 스트릿 패션 관심층', cities: [{ city: 'Seoul', pct: 55 }, { city: 'Busan', pct: 12 }, { city: 'Gyeonggi', pct: 13 }, { city: 'Incheon', pct: 7 }, { city: 'Daegu', pct: 4 }], ages: [{ age: '18-24', pct: 38 }, { age: '25-34', pct: 44 }, { age: '35-44', pct: 12 }, { age: '45-54', pct: 4 }, { age: '55+', pct: 2 }], insights: [{ emoji: '🎧', title: 'Z세대 Y2K 코어 채널', description: '18-24세 비중 38%, Z세대 서브컬처 트렌드 확산 채널로 최적.' }, { emoji: '🔁', title: '릴스 공유율 업계최고', description: '게시물 공유(shares) 평균 350건. 바이럴 자연확산 강점 보유.' }, { emoji: '🛒', title: '빈티지/리셀 구매력층', description: '빈티지·한정판 소비층. 유니크·레어 아이템 캠페인 ROI 최상.' }] },
    { handle: 'seoyeon.skin', followers: 36200, er: 4.4, reach: 27, female: 0.86, domestic: 0.91, niche: 'beauty', pv: 450000, pf: 250000, target: '20-35세 민감성·수부지 피부 고민 보유 여성. 기초화장품 구매 활발', cities: [{ city: 'Seoul', pct: 44 }, { city: 'Gyeonggi', pct: 21 }, { city: 'Incheon', pct: 8 }, { city: 'Busan', pct: 7 }, { city: 'Daejeon', pct: 5 }], ages: [{ age: '18-24', pct: 25 }, { age: '25-34', pct: 47 }, { age: '35-44', pct: 20 }, { age: '45-54', pct: 6 }, { age: '55+', pct: 2 }], insights: [{ emoji: '💧', title: '스킨케어 성분 신뢰 채널', description: '기초라인 리뷰 저장율 8.2%! 제품 구매 전 참고 채널 1위.' }, { emoji: '🤍', title: '민감성 피부 전문', description: '민감성 수부지 전문 해시태그 오가닉 도달 1위 채널.' }, { emoji: '📊', title: '30d 도달 98만명', description: '월 프로필 도달 98만 회 이상. 소비재 바이럴 최적 채널.' }] },
    { handle: 'seohyun.parfum', followers: 45100, er: 3.9, reach: 25, female: 0.74, domestic: 0.87, niche: 'beauty', pv: 500000, pf: 300000, target: '25-40세 향수·라이프스타일 고관여 여성/남성. 프리미엄 소비층', cities: [{ city: 'Seoul', pct: 47 }, { city: 'Gyeonggi', pct: 17 }, { city: 'Busan', pct: 10 }, { city: 'Incheon', pct: 7 }, { city: 'Daegu', pct: 5 }], ages: [{ age: '18-24', pct: 14 }, { age: '25-34', pct: 43 }, { age: '35-44', pct: 30 }, { age: '45-54', pct: 9 }, { age: '55+', pct: 4 }], insights: [{ emoji: '🔮', title: '니치퍼퓸 No.1 채널', description: '향수·니치퍼퓸 해시태그 노출 국내 1위. 고가 상품 ROI 우월.' }, { emoji: '🥂', title: '남성 팔로워 26% 보유', description: '뷰티계정 평균 남성 3-5% 대비 26%. 젠더 뉴트럴 캠페인 최적.' }, { emoji: '⭐', title: '리뷰 신뢰도 최상위', description: '브랜드 캠페인 시 전환율 업계 평균 3.2배. 팔로워 신뢰도 증명.' }] },
    { handle: 'somi.skinlab', followers: 112000, er: 3.2, reach: 22, female: 0.81, domestic: 0.85, niche: 'beauty', pv: 1200000, pf: 800000, target: '25-45세 기능성·더마코스메틱 구매 의향 여성. 고구매력 스킨케어 팬', cities: [{ city: 'Seoul', pct: 46 }, { city: 'Gyeonggi', pct: 19 }, { city: 'Busan', pct: 9 }, { city: 'Incheon', pct: 6 }, { city: 'Daejeon', pct: 5 }], ages: [{ age: '18-24', pct: 11 }, { age: '25-34', pct: 40 }, { age: '35-44', pct: 33 }, { age: '45-54', pct: 12 }, { age: '55+', pct: 4 }], insights: [{ emoji: '🧪', title: '성분 분석 공신력 채널', description: '팔로워 중 의료·약학 등 전문직 비율 높음. 기능성 제품 최적 채널.' }, { emoji: '📈', title: '11.2만 팔로워 매크로 인플루언서', description: '넓은 도달 + 전문성. 캠페인 CPM 업계 최저 수준.' }, { emoji: '💊', title: '더마코스메틱 1위 리뷰어', description: '더마/기능성 해시태그 상위 노출 1위. 피부과 추천 제품 신뢰도 최고.' }] },
    { handle: 'sua.cosmetics', followers: 23400, er: 5.5, reach: 32, female: 0.89, domestic: 0.93, niche: 'beauty', pv: 300000, pf: 150000, target: '18-28세 색조·신상 구매 활발한 여성. 퍼스널컬러 관심층', cities: [{ city: 'Seoul', pct: 38 }, { city: 'Gyeonggi', pct: 23 }, { city: 'Daejeon', pct: 9 }, { city: 'Incheon', pct: 7 }, { city: 'Gwangju', pct: 5 }], ages: [{ age: '18-24', pct: 51 }, { age: '25-34', pct: 35 }, { age: '35-44', pct: 10 }, { age: '45-54', pct: 3 }, { age: '55+', pct: 1 }], insights: [{ emoji: '💄', title: '색조 구매전환 최강', description: '색조 리뷰 뒤 즉각 구매 댓글 비율 12%. 업계 최상위 전환 채널.' }, { emoji: '🌈', title: '퍼스널컬러 특화', description: '퍼스널컬러 전문 해시태그 상위 3위 이내. 헤어·메이크업 협업 최적.' }, { emoji: '🔔', title: '팔로워 알림 활성화율 78%', description: '게시물 알림 설정 78%는 국내 뷰티 최고 수준 충성도.' }] },
    { handle: 'yuna.makeup_art', followers: 75300, er: 3.7, reach: 24, female: 0.84, domestic: 0.88, niche: 'beauty', pv: 800000, pf: 500000, target: '20-35세 메이크업 튜토리얼 학습층 + 걸크러쉬 스타일 선호 여성', cities: [{ city: 'Seoul', pct: 49 }, { city: 'Gyeonggi', pct: 18 }, { city: 'Busan', pct: 9 }, { city: 'Incheon', pct: 6 }, { city: 'Daegu', pct: 5 }], ages: [{ age: '18-24', pct: 31 }, { age: '25-34', pct: 45 }, { age: '35-44', pct: 17 }, { age: '45-54', pct: 5 }, { age: '55+', pct: 2 }], insights: [{ emoji: '🖤', title: '걸크러쉬 무드 전문', description: '강렬 메이크업 해시태그 월 오가닉 노출 380만 회 이상.' }, { emoji: '🎬', title: '릴스 뷰 평균 82만 회', description: '쇼트폼 콘텐츠 평균 뷰 82만 회. 쇼츠(Reels) 광고 ROI 극대화.' }, { emoji: '🏆', title: '메이크업 커뮤니티 영향력', description: '뷰티 커뮤니티 언급 횟수 월 450건 이상. 인지도·신뢰도 동시 보유.' }] },
    { handle: 'jeonga.clinic', followers: 89500, er: 3.4, reach: 23, female: 0.78, domestic: 0.86, niche: 'beauty', pv: 950000, pf: 600000, target: '28-45세 시술·의료뷰티에 관심있는 여성. 더마코스메틱 고구매력층', cities: [{ city: 'Seoul', pct: 52 }, { city: 'Gyeonggi', pct: 16 }, { city: 'Busan', pct: 8 }, { city: 'Incheon', pct: 6 }, { city: 'Daejeon', pct: 5 }], ages: [{ age: '18-24', pct: 8 }, { age: '25-34', pct: 37 }, { age: '35-44', pct: 38 }, { age: '45-54', pct: 13 }, { age: '55+', pct: 4 }], insights: [{ emoji: '🩺', title: '메디컬뷰티 신뢰도 No.1', description: '시술/의료뷰티 해시태그 국내 1위 도달. 병원·클리닉 캠페인 최적.' }, { emoji: '💰', title: '고구매력 35-44세 팔로워', description: '35-44세 38%. 고소득 직장인 여성 타겟. 프리미엄 제품 ROI 최고.' }, { emoji: '⭐', title: '브랜드 캠페인 재계약율 93%', description: '협업 경험 브랜드 93% 재계약 진행. 결과 기반 검증 채널.' }] },
    { handle: 'chaerin.glow', followers: 62800, er: 4.1, reach: 26, female: 0.87, domestic: 0.91, niche: 'beauty', pv: 650000, pf: 350000, target: '20-35세 베이스 메이크업·피부 표현에 관심 많은 여성. 뷰티 구매활발층', cities: [{ city: 'Seoul', pct: 40 }, { city: 'Busan', pct: 22 }, { city: 'Gyeonggi', pct: 15 }, { city: 'Ulsan', pct: 7 }, { city: 'Daegu', pct: 6 }], ages: [{ age: '18-24', pct: 27 }, { age: '25-34', pct: 46 }, { age: '35-44', pct: 19 }, { age: '45-54', pct: 6 }, { age: '55+', pct: 2 }], insights: [{ emoji: '✨', title: '물광 피부 전문 채널', description: '#물광 #결광 해시태그 도달 국내 TOP3. 기초·베이스 브랜드 최적.' }, { emoji: '💋', title: '립 제품 전환율 최고', description: '립컬러 리뷰 후 링크 클릭률 18%. 색조 제품 즉시·구매 전환 최강.' }, { emoji: '🌊', title: '부산 거점 로컬 영향력', description: '부산·경남 지역 팔로워 비율 22%로 지역 특화 캠페인에도 강점.' }] },
    { handle: 'haeun.beauty.log', followers: 154000, er: 2.9, reach: 20, female: 0.82, domestic: 0.84, niche: 'beauty', pv: 1500000, pf: 900000, target: '28-45세 럭셔리뷰티·스파·하이엔드 스킨케어 소비층', cities: [{ city: 'Seoul', pct: 48 }, { city: 'Gyeonggi', pct: 15 }, { city: 'Busan', pct: 10 }, { city: 'Incheon', pct: 7 }, { city: 'Daegu', pct: 5 }], ages: [{ age: '18-24', pct: 9 }, { age: '25-34', pct: 38 }, { age: '35-44', pct: 35 }, { age: '45-54', pct: 14 }, { age: '55+', pct: 4 }], insights: [{ emoji: '🦢', title: '럭셔리뷰티 대표채널', description: '프리미엄 스킨케어 해시태그 도달 15만 팔로워 이상 채널 중 국내 1위.' }, { emoji: '💎', title: '고구매력 35-44세 비율 35%', description: '명품·프리미엄 소비 성향 팔로워. 하이엔드 브랜드 캠페인 ROI 극대화.' }, { emoji: '📺', title: '유투브 연계 15.4만 팔로워', description: '유튜브 구독자 포함 합산도달 35만+. 롱폼·쇼폼 크로스 캠페인 가능.' }] },
    { handle: 'soyul.diet', followers: 56000, er: 4.3, reach: 28, female: 0.82, domestic: 0.92, niche: 'fitness', pv: 600000, pf: 350000, target: '23-38세 다이어트·건강한 식단에 관심 있는 직장인 여성', cities: [{ city: 'Seoul', pct: 43 }, { city: 'Gyeonggi', pct: 22 }, { city: 'Incheon', pct: 8 }, { city: 'Busan', pct: 7 }, { city: 'Daejeon', pct: 5 }], ages: [{ age: '18-24', pct: 21 }, { age: '25-34', pct: 49 }, { age: '35-44', pct: 22 }, { age: '45-54', pct: 6 }, { age: '55+', pct: 2 }], insights: [{ emoji: '🥗', title: '다이어트식단 1위 채널', description: '#다이어트식단 #클린이팅 오가닉 도달 국내 TOP3. 식품 구매 전환 최강.' }, { emoji: '💪', title: '직장인 다이어터 밀착감', description: '직장인 팔로워 비율 65%+. 홈쇼핑·건강식품 구매 직결 채널.' }, { emoji: '📊', title: '저장율 6.1% 최고수준', description: '식단 게시물 평균 저장율 6.1%. 구매 전 메모용·재방문 팔로워 다수.' }] },
    { handle: 'seunga.sporty', followers: 78200, er: 3.9, reach: 25, female: 0.71, domestic: 0.89, niche: 'fitness', pv: 800000, pf: 500000, target: '20-35세 운동·헬스·바디프로필 관심 남녀. 스포츠웨어 구매활발층', cities: [{ city: 'Seoul', pct: 45 }, { city: 'Gyeonggi', pct: 20 }, { city: 'Busan', pct: 9 }, { city: 'Incheon', pct: 7 }, { city: 'Daejeon', pct: 5 }], ages: [{ age: '18-24', pct: 29 }, { age: '25-34', pct: 47 }, { age: '35-44', pct: 18 }, { age: '45-54', pct: 5 }, { age: '55+', pct: 1 }], insights: [{ emoji: '🔥', title: '바디프로필 커뮤니티 권위자', description: '#오운완 #바디프로필 해시태그 참여 국내 10위 이내. 운동 동기 부여 1위.' }, { emoji: '👗', title: '애슬레저룩 전환채널', description: '운동복 링크 클릭률 21%. 스포츠웨어 즉각 구매전환 국내 최상위.' }, { emoji: '⚡', title: '릴스 평균 56만회 노출', description: '운동 릴스 오가닉 노출 평균 56만 회. 역동적 영상 바이럴 친화 채널.' }] },
    { handle: 'chaeun.detox', followers: 21500, er: 5.8, reach: 33, female: 0.84, domestic: 0.93, niche: 'fitness', pv: 250000, pf: 150000, target: '24-38세 이너뷰티·건강보조식품·디톡스 관심 여성', cities: [{ city: 'Seoul', pct: 35 }, { city: 'Daegu', pct: 24 }, { city: 'Gyeonggi', pct: 18 }, { city: 'Busan', pct: 9 }, { city: 'Gwangju', pct: 5 }], ages: [{ age: '18-24', pct: 18 }, { age: '25-34', pct: 48 }, { age: '35-44', pct: 25 }, { age: '45-54', pct: 7 }, { age: '55+', pct: 2 }], insights: [{ emoji: '🌿', title: '이너뷰티 마이크로 인플루언서', description: 'ER 5.8%로 동 규모 건강채널 2.5배 이상. 영양제 구매 전환 탁월.' }, { emoji: '🍏', title: '대구권 지역 팔로워 24%', description: '대구·경북 팔로워 최다. 지역 기반 캠페인에서 독보적인 존재감.' }, { emoji: '💊', title: '영양제 신뢰 리뷰어', description: '영양제 브랜드 협업 후기 긍정 댓글 비율 94%. 신뢰도 최상.' }] },
    { handle: 'minkyung.hair', followers: 43200, er: 4.0, reach: 26, female: 0.85, domestic: 0.91, niche: 'beauty', pv: 500000, pf: 300000, target: '20-38세 헤어스타일링·두피케어 관심 여성', cities: [{ city: 'Seoul', pct: 50 }, { city: 'Gyeonggi', pct: 17 }, { city: 'Incheon', pct: 8 }, { city: 'Busan', pct: 7 }, { city: 'Daejeon', pct: 5 }], ages: [{ age: '18-24', pct: 22 }, { age: '25-34', pct: 45 }, { age: '35-44', pct: 24 }, { age: '45-54', pct: 7 }, { age: '55+', pct: 2 }], insights: [{ emoji: '💇‍♀️', title: '헤어케어 공신력 채널', description: '현직 헤어디자이너. 전문성 기반 신뢰도 최상위. 두피/헤어 BtoC 최적.' }, { emoji: '✂️', title: '헤어제품 전환율 19%', description: '헤어 제품 링크 클릭 후 구매 전환율 19%. 업계 평균 7% 대비 압도적.' }, { emoji: '📍', title: '강남/청담 거점 영향력', description: '강남·청담 미용 타겟 팔로워 밀집. 살롱·뷰티샵 캠페인 특화.' }] },
    { handle: 'soi.hanbok', followers: 29800, er: 4.8, reach: 30, female: 0.76, domestic: 0.96, niche: 'lifestyle', pv: 350000, pf: 200000, target: '20-35세 한국 문화/전통 관심 여성. 국내여행·한복 구매 고려층', cities: [{ city: 'Jeonju', pct: 38 }, { city: 'Seoul', pct: 28 }, { city: 'Gyeonggi', pct: 14 }, { city: 'Busan', pct: 8 }, { city: 'Gyeongju', pct: 5 }], ages: [{ age: '18-24', pct: 27 }, { age: '25-34', pct: 43 }, { age: '35-44', pct: 20 }, { age: '45-54', pct: 7 }, { age: '55+', pct: 3 }], insights: [{ emoji: '🌸', title: '전통문화 콘텐츠 1위', description: '#생활한복 #전주여행 해시태그 오가닉 도달 전국 1위 채널.' }, { emoji: '🇰🇷', title: '국내소비 97% 특화채널', description: '국내 팔로워 96%. 국내 관광·문화재 캠페인에 최적.' }, { emoji: '📸', title: '한복·전주 관광 협업 채널', description: '전주시 관광청, 한복 브랜드 5곳 공식 협업 이력. 검증된 채널.' }] },
    { handle: 'yerim.organic', followers: 15400, er: 6.5, reach: 36, female: 0.81, domestic: 0.95, niche: 'lifestyle', pv: 200000, pf: 150000, target: '22-38세 친환경·제로웨이스트·슬로우라이프에 관심 있는 여성', cities: [{ city: 'Jeju', pct: 42 }, { city: 'Seoul', pct: 28 }, { city: 'Gyeonggi', pct: 13 }, { city: 'Busan', pct: 7 }, { city: 'Gwangju', pct: 4 }], ages: [{ age: '18-24', pct: 19 }, { age: '25-34', pct: 46 }, { age: '35-44', pct: 25 }, { age: '45-54', pct: 8 }, { age: '55+', pct: 2 }], insights: [{ emoji: '🪴', title: '친환경 1위 에코 채널', description: '제로웨이스트 해시태그 국내 마이크로 인플루언서 중 도달 1위.' }, { emoji: '🌿', title: '제주 기반 로컬 콘텐츠', description: '제주도 팔로워 42%. 제주 기반 친환경·농산물·뷰티 캠페인 최적.' }, { emoji: '💚', title: '가치소비 팔로워', description: '친환경·비건 제품 전환율 15.2%. 가치관 공유 구매전환 탁월.' }] },
    { handle: 'yejin.nails_', followers: 38100, er: 4.6, reach: 28, female: 0.91, domestic: 0.94, niche: 'beauty', pv: 400000, pf: 250000, target: '18-32세 네일아트·셀프네일에 관심있는 여성', cities: [{ city: 'Incheon', pct: 35 }, { city: 'Seoul', pct: 28 }, { city: 'Gyeonggi', pct: 22 }, { city: 'Busan', pct: 7 }, { city: 'Daejeon', pct: 4 }], ages: [{ age: '18-24', pct: 42 }, { age: '25-34', pct: 40 }, { age: '35-44', pct: 13 }, { age: '45-54', pct: 4 }, { age: '55+', pct: 1 }], insights: [{ emoji: '💅', title: '네일아트 1위 채널', description: '#네일아트 #셀프네일 발행 게시물 저장율 9.1%! 업계 최고 수준.' }, { emoji: '🎨', title: '인천권 독보적 영향력', description: '인천·경기 서부 팔로워 57%. 지역 뷰티샵·네일샵 타겟 최적.' }, { emoji: '✨', title: 'MZ 핵심 팔로워 82%', description: '18-34세 비율 82%. 신제품 론칭·트렌드 전파 최적의 채널.' }] },
    { handle: 'jimin.homecafe', followers: 64500, er: 4.0, reach: 26, female: 0.80, domestic: 0.93, niche: 'lifestyle', pv: 750000, pf: 450000, target: '22-38세 홈카페·인테리어·라이프스타일 관심 여성', cities: [{ city: 'Gyeonggi', pct: 38 }, { city: 'Seoul', pct: 32 }, { city: 'Incheon', pct: 10 }, { city: 'Daejeon', pct: 7 }, { city: 'Busan', pct: 5 }], ages: [{ age: '18-24', pct: 20 }, { age: '25-34', pct: 48 }, { age: '35-44', pct: 24 }, { age: '45-54', pct: 6 }, { age: '55+', pct: 2 }], insights: [{ emoji: '☕', title: '홈카페 전문채널', description: '#홈카페 해시태그 오가닉 도달 국내 인플루언서 중 4위 이내.' }, { emoji: '🏡', title: '라이프스타일 전환율 17%', description: '식기·인테리어 소품 링크 클릭 후 구매전환 17%. 최상위 수준' }, { emoji: '📱', title: '경기권 24-35세 집중', description: '경기도 팔로워 38%. 수도권 MZ세대 자취생·신혼부부 밀착 채널.' }] },
    { handle: 'jia.luxury_life', followers: 215000, er: 2.7, reach: 18, female: 0.69, domestic: 0.82, niche: 'lifestyle', pv: 2500000, pf: 1500000, target: '28-50세 고소득 남녀. 명품·파인다이닝·럭셔리 호텔 소비층', cities: [{ city: 'Seoul', pct: 52 }, { city: 'Gyeonggi', pct: 14 }, { city: 'Busan', pct: 9 }, { city: 'Incheon', pct: 7 }, { city: 'Daegu', pct: 5 }], ages: [{ age: '18-24', pct: 7 }, { age: '25-34', pct: 32 }, { age: '35-44', pct: 38 }, { age: '45-54', pct: 18 }, { age: '55+', pct: 5 }], insights: [{ emoji: '💎', title: '국내 럭셔리 TOP 인플루언서', description: '21만 팔로워 기반 럭셔리 카테고리 국내 1위. 하이엔드 브랜드 표준 채널.' }, { emoji: '👨‍💼', title: '남성 팔로워 31% 보유', description: '명품·호텔 구매력 있는 남성 팔로워 31%. 젠더 뉴트럴 명품 캠페인 타겟.' }, { emoji: '🏨', title: '5성급 호텔 파트너십 5곳', description: '롯데·조선·신라·파크하얏트·포시즌스 등 공식 파트너십. 고급 브랜드 엔트리 채널.' }] },
] as const

async function main() {
    // 1. 23명 mock creator 프로필 조회 (handle로 매칭)
    const handles = PERSONAS.map(p => p.handle)
    const { data: channels, error } = await supabase
        .from('social_channels')
        .select('id, user_id, handle')
        .eq('platform', 'instagram')
        .in('handle', handles)

    if (error) throw error
    if (!channels || channels.length === 0) {
        console.error('❌ social_channels에서 mock 크리에이터를 찾을 수 없습니다. 먼저 seed-23-personas.ts를 실행하세요.')
        return
    }
    console.log(`Found ${channels.length} instagram channels to update.\n`)

    let successCount = 0

    for (const persona of PERSONAS) {
        const channel = channels.find(c => c.handle === persona.handle)
        if (!channel) {
            console.error(`  ⚠️ 채널 없음: @${persona.handle}`)
            continue
        }

        const snapshot = buildPortfolio({
            handle: persona.handle,
            followers: persona.followers,
            erPct: persona.er,
            reachRatePct: persona.reach,
            femaleRatio: persona.female,
            domesticRatio: persona.domestic,
            niche: persona.niche as any,
            priceVideo: persona.pv,
            priceFeed: persona.pf,
            targetText: persona.target,
            cityDistrib: [...persona.cities],
            ageDistrib: [...persona.ages],
            insights: [...persona.insights],
        })

        // social_channels의 ig_portfolio_snapshot 업데이트
        const { error: upErr } = await supabase
            .from('social_channels')
            .update({ ig_portfolio_snapshot: snapshot })
            .eq('id', channel.id)

        if (upErr) {
            console.error(`  ❌ ${persona.handle} 업데이트 실패:`, upErr.message)
        } else {
            console.log(`  ✅ @${persona.handle} (${persona.followers.toLocaleString()} 팔로워) → ER ${persona.er}%, 도달 ${persona.reach}% 포트폴리오 저장 완료`)
            successCount++
        }
    }

    console.log(`\n🎉 총 ${successCount}/${PERSONAS.length}명 IG 포트폴리오 데이터 삽입 완료!`)
}

main().catch(console.error)
