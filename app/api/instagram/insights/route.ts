import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
    const body = await req.json()
    const { mediaId, userId, proposalType, proposalId, brandId, priceOffer } = body

    if (!mediaId || !userId) {
        return NextResponse.json({ error: '필수 파라미터 누락 (mediaId, userId)' }, { status: 400 })
    }

    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // IG 자격증명 조회
    const { data: channel } = await supabase
        .from('social_channels')
        .select('ig_user_id, ig_access_token')
        .eq('user_id', userId)
        .eq('platform', 'instagram')
        .not('ig_user_id', 'is', null)
        .maybeSingle()

    if (!channel?.ig_access_token) {
        return NextResponse.json({ error: 'Instagram 계정이 연결되지 않았습니다.' }, { status: 404 })
    }

    // 미디어 타입 확인 + 기본 수치 조회
    const mediaRes = await fetch(
        `https://graph.facebook.com/v19.0/${mediaId}` +
        `?fields=like_count,comments_count,media_type` +
        `&access_token=${channel.ig_access_token}`
    )
    const mediaData = await mediaRes.json()

    if (mediaData.error) {
        return NextResponse.json({ error: mediaData.error.message }, { status: 400 })
    }

    const mediaType: string = mediaData.media_type || 'IMAGE'

    // 미디어 타입에 따라 사용가능한 인사이트 메트릭 결정
    // IMAGE / CAROUSEL_ALBUM: reach, impressions, saved, engagement
    // VIDEO / REELS: reach, impressions, saved, video_views
    const baseMetrics = 'reach,impressions,saved'
    const extraMetric = mediaType === 'VIDEO' || mediaType === 'REEL' ? ',video_views' : ''
    const metricsParam = `${baseMetrics}${extraMetric}`

    const insightsRes = await fetch(
        `https://graph.facebook.com/v19.0/${mediaId}/insights` +
        `?metric=${metricsParam}` +
        `&access_token=${channel.ig_access_token}`
    )
    const insightsData = await insightsRes.json()

    // 인사이트 파싱 (에러 시 기본수치만 사용)
    const metricsMap: Record<string, number> = {}
    if (!insightsData.error) {
        for (const m of (insightsData.data || [])) {
            // values 배열 형식 또는 단순 value 형식 모두 처리
            const val = Array.isArray(m.values)
                ? (m.values[0]?.value ?? 0)
                : (m.value ?? 0)
            // value가 객체인 경우(demographic 등) 숫자로 변환 불가 → 스킵
            if (typeof val === 'number') {
                metricsMap[m.name] = val
            }
        }
    }

    const reach = metricsMap['reach'] || 0
    const likes = mediaData.like_count || 0
    const comments = mediaData.comments_count || 0
    const saves = metricsMap['saved'] || 0
    const views = metricsMap['video_views'] || 0
    const totalEngagement = likes + comments + saves

    const engagementRate = reach > 0
        ? parseFloat(((totalEngagement / reach) * 100).toFixed(2))
        : 0

    const price = Number(priceOffer) || 0
    const cpe = totalEngagement > 0 ? parseFloat((price / totalEngagement).toFixed(2)) : null
    const cpr = reach > 0 ? parseFloat((price / reach).toFixed(2)) : null

    const metrics = { reach, likes, comments, saves, views, engagementRate, cpe, cpr }

    // proposalId 있으면 campaign_performance upsert
    if (proposalId && proposalType && brandId) {
        const { data, error } = await supabase
            .from('campaign_performance')
            .upsert({
                proposal_type: proposalType,
                proposal_id: proposalId,
                creator_id: userId,
                brand_id: brandId,
                views: views || null,
                likes: likes || null,
                comments: comments || null,
                saves: saves || null,
                reach: reach || null,
                engagement_rate: engagementRate,
                cpe,
                cpr,
                submitted_by: userId,
                submitted_at: new Date().toISOString(),
            }, { onConflict: 'proposal_type,proposal_id' })
            .select()
            .single()

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }
        return NextResponse.json({ success: true, data, metrics })
    }

    return NextResponse.json({ success: true, metrics })
}
