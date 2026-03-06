import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
    const userId = req.nextUrl.searchParams.get('userId')
    if (!userId) {
        return NextResponse.json({ error: 'userId required' }, { status: 400 })
    }

    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // 0. Mock 크리에이터 fallback
    const { data: mockProfile } = await supabase
        .from('profiles')
        .select('is_mock')
        .eq('id', userId)
        .maybeSingle()

    if (mockProfile?.is_mock) {
        const { data: mockChannel } = await supabase
            .from('social_channels')
            .select('ig_portfolio_snapshot')
            .eq('user_id', userId)
            .eq('platform', 'instagram')
            .maybeSingle()

        const posts = (mockChannel?.ig_portfolio_snapshot as any)?.posts ?? []
        return NextResponse.json({ data: posts })
    }

    // social_channels에서 IG 자격증명 조회
    const { data: channel, error: channelError } = await supabase
        .from('social_channels')
        .select('ig_user_id, ig_access_token')
        .eq('user_id', userId)
        .eq('platform', 'instagram')
        .not('ig_user_id', 'is', null)
        .maybeSingle()

    if (channelError || !channel?.ig_user_id || !channel?.ig_access_token) {
        return NextResponse.json(
            { error: 'Instagram 계정이 연결되지 않았습니다.' },
            { status: 404 }
        )
    }

    const baseFields = `id,caption,media_type,thumbnail_url,media_url,permalink,timestamp,like_count,comments_count`
    const token = channel.ig_access_token
    const igUserId = channel.ig_user_id

    // 게시물 + 릴스 병렬 조회
    const [mediaRes, reelsRes] = await Promise.all([
        fetch(`https://graph.facebook.com/v19.0/${igUserId}/media?fields=${baseFields}&limit=12&access_token=${token}`),
        fetch(`https://graph.facebook.com/v19.0/${igUserId}/reels?fields=${baseFields}&limit=12&access_token=${token}`),
    ])

    const [mediaData, reelsData] = await Promise.all([
        mediaRes.json(),
        reelsRes.json(),
    ])

    if (mediaData.error && reelsData.error) {
        return NextResponse.json({ error: mediaData.error.message }, { status: 400 })
    }

    // 합치고 중복 제거 후 시간 내림차순 정렬
    const posts = (mediaData.data || []).map((p: any) => ({ ...p, media_source: 'post' }))
    const reels = (reelsData.data || []).map((r: any) => ({ ...r, media_source: 'reel' }))
    const combined = [...posts, ...reels]
    const deduped = Array.from(new Map(combined.map((m: any) => [m.id, m])).values())
    deduped.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    return NextResponse.json({ data: deduped })
}
