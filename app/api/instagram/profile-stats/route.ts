import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/instagram/profile-stats?userId={userId}
// 최근 게시물 인사이트 + 오디언스 데모그래픽 기반 실제 ER, 저장률, 도달률, 오디언스 분석 반환
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')

    if (!userId) {
        return NextResponse.json({ error: 'userId required' }, { status: 400 })
    }

    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

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

    // 2. 최근 12개 게시물 목록 + 오디언스 데모그래픽 병렬 조회
    // follower_demographics: 성별/나이/국가 분포 (신규 API, audience_gender_age 대체)
    const [mediaRes, audienceGenderAgeRes, audienceCountryRes] = await Promise.all([
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
        )
    ])

    const [mediaData, audienceGenderAgeData, audienceCountryData] = await Promise.all([
        mediaRes.json(),
        audienceGenderAgeRes.json(),
        audienceCountryRes.json()
    ])

    if (mediaData.error) {
        console.error('[profile-stats] Media fetch error:', mediaData.error)
        return NextResponse.json({ error: mediaData.error.message }, { status: 400 })
    }

    const posts: any[] = mediaData.data || []

    // 3. 오디언스 데이터 파싱 (신규 follower_demographics API)
    // 응답 구조: { data: [{ name, total_value: { breakdowns: [{ dimension_keys, results: [{ dimension_values, value }] }] } }] }
    let audienceFemaleRatio: number | null = null
    let audienceAge2534Ratio: number | null = null
    let audienceDomesticRatio: number | null = null

    // 성별/나이 파싱
    if (!audienceGenderAgeData.error && audienceGenderAgeData.data) {
        const metric = audienceGenderAgeData.data[0]
        const breakdown = metric?.total_value?.breakdowns?.[0]
        if (breakdown) {
            const dimKeys: string[] = breakdown.dimension_keys || []
            const results: Array<{ dimension_values: string[]; value: number }> = breakdown.results || []
            const genderIdx = dimKeys.indexOf('gender')
            const ageIdx = dimKeys.indexOf('age')
            const total = results.reduce((s: number, r) => s + r.value, 0)
            if (total > 0) {
                if (genderIdx !== -1) {
                    const femaleTotal = results.filter(r => r.dimension_values[genderIdx] === 'F').reduce((s, r) => s + r.value, 0)
                    audienceFemaleRatio = parseFloat(((femaleTotal / total) * 100).toFixed(1))
                }
                if (ageIdx !== -1) {
                    const age2534Total = results.filter(r => r.dimension_values[ageIdx] === '25-34').reduce((s, r) => s + r.value, 0)
                    audienceAge2534Ratio = parseFloat(((age2534Total / total) * 100).toFixed(1))
                }
            }
        }
    } else if (audienceGenderAgeData.error) {
        console.warn('[profile-stats] gender/age error:', audienceGenderAgeData.error.message)
    }

    // 국가 파싱
    if (!audienceCountryData.error && audienceCountryData.data) {
        const metric = audienceCountryData.data[0]
        const breakdown = metric?.total_value?.breakdowns?.[0]
        if (breakdown) {
            const dimKeys: string[] = breakdown.dimension_keys || []
            const results: Array<{ dimension_values: string[]; value: number }> = breakdown.results || []
            const countryIdx = dimKeys.indexOf('country')
            const total = results.reduce((s: number, r) => s + r.value, 0)
            if (total > 0 && countryIdx !== -1) {
                const krTotal = results.filter(r => r.dimension_values[countryIdx] === 'KR').reduce((s, r) => s + r.value, 0)
                audienceDomesticRatio = parseFloat(((krTotal / total) * 100).toFixed(1))
            }
        }
    } else if (audienceCountryData.error) {
        console.warn('[profile-stats] country error:', audienceCountryData.error.message)
    }

    // 4. 각 게시물 인사이트 병렬 조회 (reach, saved)
    if (posts.length === 0) {
        return NextResponse.json({
            er: null, avgReach: null, avgSaves: null, postCount: 0,
            audienceFemaleRatio, audienceAge2534Ratio, audienceDomesticRatio,
        })
    }

    const insightResults = await Promise.allSettled(
        posts.map(async (post) => {
            const mediaType: string = post.media_type || 'IMAGE'
            // Instagram API는 릴스를 VIDEO 또는 REELS로 반환함
            const isReel = mediaType === 'REELS'
            const isVideo = mediaType === 'VIDEO'

            // saves, reach, video_views 모두 insights API로 통합 요청
            // video_views는 REELS 전용
            const metricParam = isReel ? 'reach,saved,video_views' : 'reach,saved'

            const insightRes = await fetch(
                `https://graph.facebook.com/v19.0/${post.id}/insights` +
                `?metric=${metricParam}` +
                `&access_token=${ig_access_token}`
            )
            const insightData = await insightRes.json()

            const metricsMap: Record<string, number> = {}

            if (insightData.error) {
                console.warn(`[profile-stats] insight error for ${post.id} (${mediaType}):`, insightData.error.message)
                // 에러 시 reach만 재시도 (saved, video_views 제외)
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
            }
        })
    )

    // 5. 유효한 결과 집계
    const validPosts = insightResults
        .filter((r): r is PromiseFulfilledResult<any> => r.status === 'fulfilled')
        .map(r => r.value)
        .filter(p => p.reach > 0)

    if (validPosts.length === 0) {
        const totalEngagement = posts.reduce((s, p) => s + (p.like_count || 0) + (p.comments_count || 0), 0)
        const avgEngagement = totalEngagement / posts.length
        const er = (followers_count || 0) > 0 ? parseFloat(((avgEngagement / followers_count) * 100).toFixed(2)) : null
        return NextResponse.json({
            er, avgReach: null, avgSaves: null, avgLikes: Math.round(avgEngagement), postCount: posts.length,
            saveRate: null, reachRate: null,
            audienceFemaleRatio, audienceAge2534Ratio, audienceDomesticRatio,
            source: 'followers_fallback',
        })
    }

    const avgReach = Math.round(validPosts.reduce((s, p) => s + p.reach, 0) / validPosts.length)
    const avgLikes = Math.round(validPosts.reduce((s, p) => s + p.likes, 0) / validPosts.length)
    const avgComments = Math.round(validPosts.reduce((s, p) => s + p.comments, 0) / validPosts.length)
    const avgSaves = Math.round(validPosts.reduce((s, p) => s + p.saves, 0) / validPosts.length)
    const avgViews = Math.round(validPosts.reduce((s, p) => s + p.views, 0) / validPosts.length)

    const avgEngagement = avgLikes + avgComments + avgSaves
    // ER by Reach: (좋아요+댓글+저장) / 도달수 × 100 (광고 효율 지표)
    const erByReach = avgReach > 0 ? parseFloat(((avgEngagement / avgReach) * 100).toFixed(2)) : null
    // ER by Followers: (좋아요+댓글+저장) / 팔로워수 × 100 (업계 표준)
    const erByFollowers = (followers_count || 0) > 0 ? parseFloat(((avgEngagement / followers_count) * 100).toFixed(2)) : null
    // 단가 계산에는 팔로워 기준 ER 사용 (업계 표준)
    const er = erByFollowers

    // 저장률 = saves / reach (구매 의향 지표)
    const saveRate = avgReach > 0 ? parseFloat(((avgSaves / avgReach) * 100).toFixed(2)) : null

    // 도달률 = reach / followers (팔로워 품질 지표)
    const reachRate = (followers_count || 0) > 0
        ? parseFloat(((avgReach / followers_count) * 100).toFixed(1))
        : null

    return NextResponse.json({
        er,
        erByReach,
        erByFollowers,
        avgReach,
        avgLikes,
        avgComments,
        avgSaves,
        avgViews,
        saveRate,
        reachRate,
        audienceFemaleRatio,
        audienceAge2534Ratio,
        audienceDomesticRatio,
        postCount: validPosts.length,
        source: 'instagram_api',
    })
}
