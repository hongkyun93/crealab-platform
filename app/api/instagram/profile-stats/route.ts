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
    const [mediaRes, audienceRes] = await Promise.all([
        fetch(
            `https://graph.facebook.com/v19.0/${ig_user_id}/media` +
            `?fields=id,media_type,like_count,comments_count,timestamp` +
            `&limit=12` +
            `&access_token=${ig_access_token}`
        ),
        fetch(
            `https://graph.facebook.com/v19.0/${ig_user_id}/insights` +
            `?metric=audience_gender_age,audience_country,audience_city` +
            `&period=lifetime` +
            `&access_token=${ig_access_token}`
        )
    ])

    const [mediaData, audienceData] = await Promise.all([
        mediaRes.json(),
        audienceRes.json()
    ])

    if (mediaData.error) {
        console.error('[profile-stats] Media fetch error:', mediaData.error)
        return NextResponse.json({ error: mediaData.error.message }, { status: 400 })
    }

    const posts: any[] = mediaData.data || []

    // 3. 오디언스 데이터 파싱
    let audienceFemaleRatio: number | null = null
    let audienceAge2534Ratio: number | null = null
    let audienceDomesticRatio: number | null = null

    if (!audienceData.error && audienceData.data) {
        for (const metric of audienceData.data) {
            if (metric.name === 'audience_gender_age' && metric.values?.[0]?.value) {
                const genderAge: Record<string, number> = metric.values[0].value
                const total = Object.values(genderAge).reduce((s: number, v: unknown) => s + (typeof v === 'number' ? v : 0), 0)
                if (total > 0) {
                    // 여성 비율
                    const femaleTotal = Object.entries(genderAge)
                        .filter(([k]) => k.startsWith('F.'))
                        .reduce((s, [, v]) => s + (v as number), 0)
                    audienceFemaleRatio = parseFloat(((femaleTotal / total) * 100).toFixed(1))

                    // 25~34세 비율 (F.25-34 + M.25-34)
                    const age2534 = (genderAge['F.25-34'] || 0) + (genderAge['M.25-34'] || 0)
                    audienceAge2534Ratio = parseFloat(((age2534 / total) * 100).toFixed(1))
                }
            }
            if (metric.name === 'audience_country' && metric.values?.[0]?.value) {
                const countries: Record<string, number> = metric.values[0].value
                const total = Object.values(countries).reduce((s: number, v: unknown) => s + (typeof v === 'number' ? v : 0), 0)
                if (total > 0) {
                    const kr = countries['KR'] || 0
                    audienceDomesticRatio = parseFloat(((kr / total) * 100).toFixed(1))
                }
            }
        }
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
            const baseMetrics = 'reach,saved'
            const extraMetric = (mediaType === 'VIDEO' || mediaType === 'REELS') ? ',video_views' : ''
            const metricsParam = `${baseMetrics}${extraMetric}`

            const res = await fetch(
                `https://graph.facebook.com/v19.0/${post.id}/insights` +
                `?metric=${metricsParam}` +
                `&access_token=${ig_access_token}`
            )
            const data = await res.json()

            const metricsMap: Record<string, number> = {}
            if (!data.error) {
                for (const m of (data.data || [])) {
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

    // ER = (좋아요 + 댓글 + 저장) / reach × 100
    const avgEngagement = avgLikes + avgComments + avgSaves
    const er = avgReach > 0 ? parseFloat(((avgEngagement / avgReach) * 100).toFixed(2)) : null

    // 저장률 = saves / reach (구매 의향 지표)
    const saveRate = avgReach > 0 ? parseFloat(((avgSaves / avgReach) * 100).toFixed(2)) : null

    // 도달률 = reach / followers (팔로워 품질 지표)
    const reachRate = (followers_count || 0) > 0
        ? parseFloat(((avgReach / followers_count) * 100).toFixed(1))
        : null

    return NextResponse.json({
        er,
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
