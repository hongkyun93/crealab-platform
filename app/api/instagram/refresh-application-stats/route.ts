import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

/**
 * POST /api/instagram/refresh-application-stats
 * applicationId를 받아 해당 지원서의 최종 제출 영상 성과를 갱신합니다.
 */
export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { applicationId } = body

        if (!applicationId) {
            return NextResponse.json({ error: 'applicationId required' }, { status: 400 })
        }

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        )

        // 1. 지원서 정보 조회
        const { data: app, error: appError } = await supabase
            .from('ad_contest_applications')
            .select('final_video_link, creator_id')
            .eq('id', applicationId)
            .single()

        if (appError || !app) {
            return NextResponse.json({ error: 'Application not found' }, { status: 404 })
        }

        if (!app.final_video_link) {
            return NextResponse.json({ error: '제출된 영상 링크가 없습니다.' }, { status: 400 })
        }

        // 2. 크리에이터의 IG 자격증명 조회
        const { data: channel } = await supabase
            .from('social_channels')
            .select('ig_user_id, ig_access_token')
            .eq('user_id', app.creator_id)
            .eq('platform', 'instagram')
            .not('ig_user_id', 'is', null)
            .maybeSingle()

        if (!channel?.ig_access_token || !channel?.ig_user_id) {
            return NextResponse.json({ error: '크리에이터의 Instagram 계정이 연결되어 있지 않습니다.' }, { status: 404 })
        }

        const { ig_user_id, ig_access_token } = channel

        // 3. 최근 미디어 목록을 뒤져서 링크와 매칭되는 미디어 ID 찾기
        // (참고: permalink는 쿼리 파라미터 유무에 따라 다를 수 있으므로 정규화가 필요함)
        const normalizeLink = (url: string) => url.split('?')[0].replace(/\/$/, '')
        const targetLink = normalizeLink(app.final_video_link)

        const mediaRes = await fetch(
            `https://graph.facebook.com/v19.0/${ig_user_id}/media?fields=id,permalink,media_type&limit=50&access_token=${ig_access_token}`
        )
        const mediaData = await mediaRes.json()

        if (mediaData.error) {
            throw new Error(mediaData.error.message)
        }

        const posts: any[] = mediaData.data || []
        const matchedPost = posts.find(p => normalizeLink(p.permalink) === targetLink)

        if (!matchedPost) {
            return NextResponse.json({ error: '지원된 링크에 해당하는 게시물을 인스타그램에서 찾을 수 없습니다.' }, { status: 404 })
        }

        // 4. 상세 인사이트 조회
        // reach, saved, shares 등 (REELS의 경우 metric이 다를 수 있음)
        const isReel = matchedPost.media_type === 'REELS' || matchedPost.media_type === 'VIDEO'
        const metrics = isReel ? 'reach,saved,shares,comments_count,like_count' : 'reach,saved,comments_count,like_count'

        // 주의: v19.0에서는 like/comment가 root 필드로도 제공되지만 insights로도 가져올 수 있음
        const insightRes = await fetch(
            `https://graph.facebook.com/v19.0/${matchedPost.id}/insights?metric=${metrics}&access_token=${ig_access_token}`
        )
        const insightData = await insightRes.json()

        // 5. 결과 파싱 및 DB 업데이트
        const stats: any = {
            likes: 0,
            comments: 0,
            reach: 0,
            saved: 0,
            shares: 0,
            updated_at: new Date().toISOString()
        }

        if (insightData.data) {
            for (const m of insightData.data) {
                const val = m.values?.[0]?.value ?? 0
                if (m.name === 'reach') stats.reach = val
                if (m.name === 'saved') stats.saved = val
                if (m.name === 'shares') stats.shares = val
            }
        }

        // Like/Comment는 insights 에러가 날 수 있으므로 별도 미디어 루트에서도 확인
        const detailRes = await fetch(
            `https://graph.facebook.com/v19.0/${matchedPost.id}?fields=like_count,comments_count&access_token=${ig_access_token}`
        )
        const detailData = await detailRes.json()
        if (!detailData.error) {
            stats.likes = detailData.like_count || 0
            stats.comments = detailData.comments_count || 0
        }

        const { error: updateError } = await supabase
            .from('ad_contest_applications')
            .update({ performance_metrics: stats })
            .eq('id', applicationId)

        if (updateError) throw updateError

        return NextResponse.json({ success: true, stats })

    } catch (err: any) {
        console.error('[refresh-application-stats] Error:', err)
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}
