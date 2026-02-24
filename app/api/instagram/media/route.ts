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

    // 최근 게시물 목록 조회 (thumbnail_url은 VIDEO 타입에서만 존재)
    const mediaRes = await fetch(
        `https://graph.facebook.com/v19.0/${channel.ig_user_id}/media` +
        `?fields=id,caption,media_type,thumbnail_url,media_url,permalink,timestamp,like_count,comments_count` +
        `&limit=12` +
        `&access_token=${channel.ig_access_token}`
    )
    const mediaData = await mediaRes.json()

    if (mediaData.error) {
        return NextResponse.json({ error: mediaData.error.message }, { status: 400 })
    }

    return NextResponse.json(mediaData)
}
