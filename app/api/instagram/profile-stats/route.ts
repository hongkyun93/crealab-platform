import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/instagram/profile-stats?userId={userId}&priceVideo={priceVideo}&priceFeed={priceFeed}
// 최근 12개 게시물 평균 + 계정 레벨 인사이트 + 10개 파생 지표 반환
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')
    const priceVideo = Number(searchParams.get('priceVideo') || 0)
    const priceFeed = Number(searchParams.get('priceFeed') || 0)

    if (!userId) {
        return NextResponse.json({ error: 'userId required' }, { status: 400 })
    }

    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // 0. Mock 크리에이터 fallback: is_mock=true이면 DB에 저장된 ig_portfolio_snapshot을 바로 반환
    const { data: mockProfile } = await supabase
        .from('profiles')
        .select('is_mock')
        .eq('id', userId)
        .maybeSingle()

    if (mockProfile?.is_mock) {
        const { data: mockChannel } = await supabase
            .from('social_channels')
            .select('ig_portfolio_snapshot, followers_count, handle')
            .eq('user_id', userId)
            .eq('platform', 'instagram')
            .maybeSingle()

        if (mockChannel?.ig_portfolio_snapshot) {
            const snap = mockChannel.ig_portfolio_snapshot as any
            const dm = snap.derivedMetrics ?? {}
            return NextResponse.json({
                postCount: dm.postCount ?? snap.posts?.length ?? 12,
                avgReach: snap.avgReach,
                avgLikes: dm.avgLikes,
                avgComments: dm.avgComments,
                avgSaves: snap.avgSaves,
                avgViews: dm.avgViews,
                avgShares: dm.avgShares,
                avgEngagement: dm.avgEngagement,
                erByFollowers: dm.erByFollowers,
                erByReach: dm.erByReach,
                saveRate: dm.saveRate,
                reachRate: dm.reachRate,
                realFanIndex: dm.realFanIndex,
                fqi: dm.fqi,
                viralityRate: dm.viralityRate,
                cpr: dm.cpr,
                cpe: dm.cpe,
                tms: dm.tms,
                roasPrediction: dm.roasPrediction,
                autoInsights: snap.autoInsights ?? [],
                audienceFemaleRatio: snap.audienceFemaleRatio != null ? snap.audienceFemaleRatio * 100 : null,
                audienceAge2534Ratio: null,
                audienceDomesticRatio: snap.audienceDomesticRatio != null ? snap.audienceDomesticRatio * 100 : null,
                allAgeGroups: snap.allAgeGroups ?? [],
                topCities: snap.topCities ?? [],
                profileViews30d: snap.accountInsights?.profileViews30d ?? null,
                websiteClicks30d: snap.accountInsights?.websiteClicks30d ?? null,
                monthlyReach: snap.accountInsights?.monthlyReach ?? null,
                monthlyImpressions: snap.accountInsights?.monthlyImpressions ?? null,
                er: dm.erByFollowers,
                source: 'mock_snapshot',
            })
        }
        return NextResponse.json({ error: 'Mock 포트폴리오 데이터가 없습니다. 관리자에게 문의하세요.' }, { status: 404 })
    }

    // 1. IG 자격증명 조회
    const { data: channel } = await supabase
        .from('social_channels')
        .select('ig_user_id, ig_access_token, followers_count')
        .eq('user_id', userId)
        .eq('platform', 'instagram')
        .not('ig_user_id', 'is', null)
        .maybeSingle()

    if (!channel?.ig_access_token || !channel?.ig_user_id) {
        return NextResponse.json({ error: 'Instagram 계정이 연결되지 않았습니다.' }, { status: 404 })
    }

    const { ig_user_id, ig_access_token, followers_count } = channel


    // 2. 병렬 조회: 게시물 목록 + 팔로워 인구통계(성별/나이, 국가, 도시)
    const [mediaRes, audienceGenderAgeRes, audienceCountryRes, audienceCityRes] = await Promise.all([
        fetch(
            `https://graph.facebook.com/v19.0/${ig_user_id}/media` +
            `?fields=id,media_type,like_count,comments_count,timestamp` +
            `&limit=12` +
            `&access_token=${ig_access_token}`
        ),
        fetch(
            `https://graph.facebook.com/v19.0/${ig_user_id}/insights` +
            `?metric=follower_demographics` +
            `&metric_type=total_value` +
            `&period=lifetime` +
            `&breakdown=age,gender` +
            `&access_token=${ig_access_token}`
        ),
        fetch(
            `https://graph.facebook.com/v19.0/${ig_user_id}/insights` +
            `?metric=follower_demographics` +
            `&metric_type=total_value` +
            `&period=lifetime` +
            `&breakdown=country` +
            `&access_token=${ig_access_token}`
        ),
        fetch(
            `https://graph.facebook.com/v19.0/${ig_user_id}/insights` +
            `?metric=follower_demographics` +
            `&metric_type=total_value` +
            `&period=lifetime` +
            `&breakdown=city` +
            `&access_token=${ig_access_token}`
        ),
    ])

    const [mediaData, audienceGenderAgeData, audienceCountryData, audienceCityData] = await Promise.all([
        mediaRes.json(),
        audienceGenderAgeRes.json(),
        audienceCountryRes.json(),
        audienceCityRes.json(),
    ])

    if (mediaData.error) {
        return NextResponse.json({ error: mediaData.error.message }, { status: 400 })
    }

    const posts: any[] = mediaData.data || []

    // 3. 팔로워 인구통계 파싱 헬퍼
    const parseBreakdown = (data: any, breakdownKey: string) => {
        if (data.error || !data.data) return null
        const metric = data.data[0]
        const breakdown = metric?.total_value?.breakdowns?.[0]
        if (!breakdown) return null
        const dimKeys: string[] = breakdown.dimension_keys || []
        const results: Array<{ dimension_values: string[]; value: number }> = breakdown.results || []
        const keyIdx = dimKeys.indexOf(breakdownKey)
        const total = results.reduce((s: number, r) => s + r.value, 0)
        if (total === 0 || keyIdx === -1) return null
        // 상위 5개 집계
        const aggregated: Record<string, number> = {}
        for (const r of results) {
            const key = r.dimension_values[keyIdx]
            aggregated[key] = (aggregated[key] || 0) + r.value
        }
        return { aggregated, total }
    }

    // 성별/나이 파싱
    let audienceFemaleRatio: number | null = null
    let audienceAge2534Ratio: number | null = null
    let allAgeGroups: Array<{ age: string; pct: number }> = []

    const genderAgeBreakdown = parseBreakdown(audienceGenderAgeData, 'gender')
    const ageBreakdown = parseBreakdown(audienceGenderAgeData, 'age')

    if (genderAgeBreakdown) {
        const femaleTotal = Object.entries(genderAgeBreakdown.aggregated)
            .filter(([k]) => k === 'F')
            .reduce((s, [, v]) => s + v, 0)
        audienceFemaleRatio = parseFloat(((femaleTotal / genderAgeBreakdown.total) * 100).toFixed(1))
    }

    if (ageBreakdown) {
        const age2534 = ageBreakdown.aggregated['25-34'] || 0
        audienceAge2534Ratio = parseFloat(((age2534 / ageBreakdown.total) * 100).toFixed(1))
        // 전체 연령대 분포
        const ORDER = ['13-17', '18-24', '25-34', '35-44', '45-54', '55-64', '65+']
        allAgeGroups = ORDER
            .filter(age => (ageBreakdown.aggregated[age] || 0) > 0)
            .map(age => ({
                age,
                pct: parseFloat(((((ageBreakdown.aggregated[age] || 0) / ageBreakdown.total) * 100).toFixed(1)) as string)
            }))
    }

    // 국가 파싱
    let audienceDomesticRatio: number | null = null
    const countryBreakdown = parseBreakdown(audienceCountryData, 'country')
    if (countryBreakdown) {
        const krTotal = countryBreakdown.aggregated['KR'] || 0
        audienceDomesticRatio = parseFloat(((krTotal / countryBreakdown.total) * 100).toFixed(1))
    }

    // 도시 파싱 (상위 5개)
    let topCities: Array<{ city: string; pct: number }> = []
    const cityBreakdown = parseBreakdown(audienceCityData, 'city')
    if (cityBreakdown) {
        topCities = Object.entries(cityBreakdown.aggregated)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([city, cnt]) => ({
                city,
                pct: parseFloat(((cnt / cityBreakdown.total) * 100).toFixed(1))
            }))
    }


    // 5. 게시물별 인사이트 병렬 조회 (reach, saved, shares, video_views)
    if (posts.length === 0) {
        return NextResponse.json({
            er: null, avgReach: null, avgSaves: null, postCount: 0,
            audienceFemaleRatio, audienceAge2534Ratio, audienceDomesticRatio, allAgeGroups, topCities,
        })
    }

    const insightResults = await Promise.allSettled(
        posts.map(async (post) => {
            const mediaType: string = post.media_type || 'IMAGE'
            const isReel = mediaType === 'REELS'

            // reach, saved, shares, video_views (릴스만)
            const metricParam = isReel ? 'reach,saved,shares,video_views' : 'reach,saved,shares'

            const insightRes = await fetch(
                `https://graph.facebook.com/v19.0/${post.id}/insights` +
                `?metric=${metricParam}` +
                `&access_token=${ig_access_token}`
            )
            const insightData = await insightRes.json()

            const metricsMap: Record<string, number> = {}

            if (insightData.error) {
                // 에러 시 reach만 재시도
                try {
                    const retryRes = await fetch(
                        `https://graph.facebook.com/v19.0/${post.id}/insights` +
                        `?metric=reach` +
                        `&access_token=${ig_access_token}`
                    )
                    const retryData = await retryRes.json()
                    if (!retryData.error) {
                        for (const m of (retryData.data || [])) {
                            const val = Array.isArray(m.values) ? (m.values[0]?.value ?? 0) : (m.value ?? 0)
                            if (typeof val === 'number') metricsMap[m.name] = val
                        }
                    }
                } catch { /* 무시 */ }
            } else {
                for (const m of (insightData.data || [])) {
                    const val = Array.isArray(m.values)
                        ? (m.values[0]?.value ?? 0)
                        : (m.value ?? 0)
                    if (typeof val === 'number') metricsMap[m.name] = val
                }
            }

            return {
                id: post.id,
                likes: post.like_count || 0,
                comments: post.comments_count || 0,
                saves: metricsMap['saved'] || 0,
                reach: metricsMap['reach'] || 0,
                views: metricsMap['video_views'] || 0,
                shares: metricsMap['shares'] || 0,
            }
        })
    )

    // 6. 유효한 결과 집계 (reach > 0인 것만)
    const validPosts = insightResults
        .filter((r): r is PromiseFulfilledResult<any> => r.status === 'fulfilled')
        .map(r => r.value)
        .filter(p => p.reach > 0)

    // 팔로워만 있는 폴백 (reach 데이터 없을 때)
    if (validPosts.length === 0) {
        const totalEngagement = posts.reduce((s, p) => s + (p.like_count || 0) + (p.comments_count || 0), 0)
        const avgEngagement = totalEngagement / posts.length
        const er = (followers_count || 0) > 0
            ? parseFloat(((avgEngagement / followers_count) * 100).toFixed(2))
            : null
        return NextResponse.json({
            er, avgReach: null, avgSaves: null, avgLikes: Math.round(avgEngagement),
            postCount: posts.length, saveRate: null, reachRate: null,
            audienceFemaleRatio, audienceAge2534Ratio, audienceDomesticRatio, allAgeGroups, topCities,
            source: 'followers_fallback',
        })
    }

    // ── 최근 12개 게시물 평균 계산 ──────────────────────────────────────
    const N = validPosts.length
    const avgReach = Math.round(validPosts.reduce((s, p) => s + p.reach, 0) / N)
    const avgLikes = Math.round(validPosts.reduce((s, p) => s + p.likes, 0) / N)
    const avgComments = Math.round(validPosts.reduce((s, p) => s + p.comments, 0) / N)
    const avgSaves = Math.round(validPosts.reduce((s, p) => s + p.saves, 0) / N)
    const avgViews = Math.round(validPosts.reduce((s, p) => s + p.views, 0) / N)
    const avgShares = Math.round(validPosts.reduce((s, p) => s + p.shares, 0) / N)
    const avgEngagement = avgLikes + avgComments + avgSaves

    // ── 10개 파생 지표 계산 ─────────────────────────────────────────────

    // 1. ER by Followers (업계 표준): (좋아요+댓글+저장) / 팔로워 × 100
    const erByFollowers = (followers_count || 0) > 0
        ? parseFloat(((avgEngagement / followers_count) * 100).toFixed(2))
        : null

    // 2. ER by Reach (광고 효율 기준): (좋아요+댓글+저장) / 도달수 × 100
    const erByReach = avgReach > 0
        ? parseFloat(((avgEngagement / avgReach) * 100).toFixed(2))
        : null

    // 3. 저장률 (Save Rate / 구매 의향 지표): 저장수 / 도달수 × 100
    const saveRate = avgReach > 0
        ? parseFloat(((avgSaves / avgReach) * 100).toFixed(2))
        : null

    // 4. 도달률 (Organic Reach Rate / 팔로워 품질): 도달수 / 팔로워수 × 100
    const reachRate = (followers_count || 0) > 0
        ? parseFloat(((avgReach / followers_count) * 100).toFixed(1))
        : null

    // 5. 진성 팬덤 지수 (Real Fan Index): 댓글수 / 좋아요수 × 100
    const realFanIndex = avgLikes > 0
        ? parseFloat(((avgComments / avgLikes) * 100).toFixed(2))
        : null

    // 6. 팔로워 품질 지수 (FQI): 도달률 × (저장수 / 좋아요수)
    const fqi = reachRate !== null && avgLikes > 0
        ? parseFloat((reachRate * (avgSaves / avgLikes)).toFixed(3))
        : null

    // 7. 바이럴 잠재력 (Virality Rate): 공유수 / 도달수 × 100
    const viralityRate = avgReach > 0
        ? parseFloat(((avgShares / avgReach) * 100).toFixed(2))
        : null

    // 8. CPR (도달당 단가): 대표 단가 / 평균 도달수
    const repPrice = priceVideo || priceFeed || 0
    const cpr = avgReach > 0 && repPrice > 0
        ? parseFloat((repPrice / avgReach).toFixed(2))
        : null

    // 9. CPE (참여당 단가): 단가 / (좋아요+댓글+저장)
    const cpe = avgEngagement > 0 && repPrice > 0
        ? parseFloat((repPrice / avgEngagement).toFixed(2))
        : null

    // 10. 타겟 매칭 점수 (TMS, 기본값 기준): 성별(40%) + 연령(40%) + 지역(20%)
    //     → 포트폴리오에서 MCN이 브랜드 타겟을 설정하면 정식 계산, 기본은 여성/2534/국내 기준
    const tms = (audienceFemaleRatio !== null && audienceAge2534Ratio !== null && audienceDomesticRatio !== null)
        ? parseFloat((
            (audienceFemaleRatio * 0.4) +
            (audienceAge2534Ratio * 0.4) +
            (audienceDomesticRatio * 0.2)
        ).toFixed(1))
        : null

    // ── BONUS: ROAS 예측 지수 (saveRate × tms / 100) ───────────────────
    const roasPrediction = saveRate !== null && tms !== null
        ? parseFloat(((saveRate * tms) / 100).toFixed(3))
        : null

    // ── AUTO INSIGHTS: 파생 지표 기반 배지 자동 생성 ────────────────────
    const candidateInsights: Array<{ emoji: string; title: string; description: string; score: number }> = []

    if (erByFollowers != null) {
        if (erByFollowers >= 10) {
            candidateInsights.push({ emoji: '🔥', title: `초고참여 크리에이터 (ER ${erByFollowers.toFixed(1)}%)`, description: `팔로워 기준 참여율 ${erByFollowers.toFixed(2)}%로, 업계 평균(1~3%)의 ${Math.round(erByFollowers / 2)}배 수준의 압도적 참여를 기록하고 있습니다.`, score: 3 })
        } else if (erByFollowers >= 5) {
            candidateInsights.push({ emoji: '🔥', title: `높은 참여율 (ER ${erByFollowers.toFixed(1)}%)`, description: `팔로워 기준 참여율 ${erByFollowers.toFixed(2)}%로, 업계 평균(1~3%)보다 높은 수준의 팔로워 반응을 확보하고 있습니다.`, score: 2 })
        } else if (erByFollowers >= 2) {
            candidateInsights.push({ emoji: '📊', title: `안정적 참여율 (ER ${erByFollowers.toFixed(1)}%)`, description: `팔로워 기준 참여율 ${erByFollowers.toFixed(2)}%로, 건강한 팔로워 반응을 꾸준히 유지하고 있습니다.`, score: 1 })
        }
    }

    if (saveRate != null && saveRate >= 0.5) {
        if (saveRate >= 3) {
            candidateInsights.push({ emoji: '💾', title: `구매 전환력 최상위 (저장률 ${saveRate.toFixed(1)}%)`, description: `게시물 저장률 ${saveRate.toFixed(2)}%로, 팔로워가 콘텐츠를 저장·재방문하는 구매 의향 신호가 매우 강합니다.`, score: 3 })
        } else if (saveRate >= 1) {
            candidateInsights.push({ emoji: '💾', title: `높은 저장률 (구매 의향 ${saveRate.toFixed(1)}%)`, description: `게시물 저장률 ${saveRate.toFixed(2)}%로, 팔로워의 구매 전환 가능성이 업계 평균 이상입니다.`, score: 2 })
        } else {
            candidateInsights.push({ emoji: '📌', title: `콘텐츠 저장률 ${saveRate.toFixed(1)}%`, description: `팔로워가 게시물을 저장하는 비율로 구매 의향을 가늠할 수 있는 지표입니다.`, score: 1 })
        }
    }

    if (reachRate != null && reachRate >= 10) {
        if (reachRate >= 50) {
            candidateInsights.push({ emoji: '📡', title: `알고리즘 최상위 도달 (도달률 ${reachRate.toFixed(0)}%)`, description: `평균 도달수가 팔로워의 ${reachRate.toFixed(1)}%로, 인스타그램 알고리즘이 콘텐츠를 매우 적극적으로 확산시키고 있습니다.`, score: 3 })
        } else if (reachRate >= 25) {
            candidateInsights.push({ emoji: '📡', title: `높은 도달률 (팔로워 품질 ${reachRate.toFixed(0)}%)`, description: `평균 도달수가 팔로워의 ${reachRate.toFixed(1)}%로, 유령 팔로워 없이 실제 팔로워 반응이 높습니다.`, score: 2 })
        } else {
            candidateInsights.push({ emoji: '📶', title: `도달률 ${reachRate.toFixed(0)}%`, description: `평균 도달수가 팔로워 수의 ${reachRate.toFixed(1)}%로, 팔로워 품질을 가늠하는 지표입니다.`, score: 1 })
        }
    }

    if (realFanIndex != null && realFanIndex >= 3) {
        if (realFanIndex >= 10) {
            candidateInsights.push({ emoji: '💬', title: `진성 팬덤 최상위 (댓글 지수 ${realFanIndex.toFixed(1)}%)`, description: `좋아요 대비 댓글 비율이 ${realFanIndex.toFixed(2)}%로, 팔로워가 적극적으로 소통하는 진성 팬이 많습니다.`, score: 3 })
        } else {
            candidateInsights.push({ emoji: '💬', title: `높은 진성 팬덤 지수 (${realFanIndex.toFixed(1)}%)`, description: `좋아요 대비 댓글 비율이 ${realFanIndex.toFixed(2)}%로, 일방적 소비가 아닌 양방향 소통이 활발합니다.`, score: 2 })
        }
    }

    if (viralityRate != null && viralityRate >= 0.5) {
        if (viralityRate >= 2) {
            candidateInsights.push({ emoji: '🚀', title: `바이럴 잠재력 최상위 (공유율 ${viralityRate.toFixed(1)}%)`, description: `도달 대비 공유율 ${viralityRate.toFixed(2)}%로, 콘텐츠가 외부 확산될 가능성이 매우 높습니다.`, score: 3 })
        } else {
            candidateInsights.push({ emoji: '🌐', title: `바이럴 확산력 (공유율 ${viralityRate.toFixed(1)}%)`, description: `도달 대비 공유율 ${viralityRate.toFixed(2)}%로, 콘텐츠의 자연 확산 가능성이 있습니다.`, score: 1 })
        }
    }

    // score 높은 순 정렬 후 상위 3개 선택
    const autoInsights = candidateInsights
        .sort((a, b) => b.score - a.score)
        .slice(0, 3)
        .map(({ emoji, title, description }) => ({ emoji, title, description }))

    return NextResponse.json({
        // 기본 평균값 (최근 12개 게시물)
        postCount: N,
        avgReach,
        avgLikes,
        avgComments,
        avgSaves,
        avgViews,
        avgShares,
        avgEngagement,

        // 10개 파생 지표
        erByFollowers,         // 1. ER by Followers
        erByReach,             // 2. ER by Reach
        saveRate,              // 3. 저장률
        reachRate,             // 4. 도달률
        realFanIndex,          // 5. 진성 팬덤 지수
        fqi,                   // 6. 팔로워 품질 지수
        viralityRate,          // 7. 바이럴 잠재력
        cpr,                   // 8. CPR
        cpe,                   // 9. CPE
        tms,                   // 10. 타겟 매칭 점수
        roasPrediction,        // BONUS: ROAS 예측

        // 자동 생성 배지 (파생 지표 기반 상위 3개)
        autoInsights,

        // 인구통계
        audienceFemaleRatio,   // 여성 팔로워 비율 %
        audienceAge2534Ratio,  // 25-34세 비율 %
        audienceDomesticRatio, // 국내(KR) 비율 %
        allAgeGroups,          // 전체 연령대 분포 [{age, pct}]
        topCities,             // 상위 5개 도시 [{city, pct}]

        // 레거시 (호환성)
        er: erByFollowers,
        source: 'instagram_api',
    })
}
