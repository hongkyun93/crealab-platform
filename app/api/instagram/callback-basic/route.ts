import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// GET /api/instagram/callback-basic?code=...&state={userId}
// Instagram Basic Display OAuth 콜백 → 토큰 획득 → 프로필 조회
export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    const userId = searchParams.get('state')
    const error = searchParams.get('error')

    const canonicalUrl = process.env.NEXT_PUBLIC_APP_URL || origin
    const settingsUrl = `${canonicalUrl}/creator?tab=settings`

    if (error || !code || !userId) {
        return NextResponse.redirect(`${settingsUrl}&ig_error_basic=cancelled`)
    }

    try {
        const appId = process.env.INSTAGRAM_APP_ID!
        const appSecret = process.env.INSTAGRAM_APP_SECRET!
        const redirectUri = `${origin}/api/instagram/callback-basic`

        // 1. 단기 액세스 토큰 교환
        const tokenFormData = new FormData();
        tokenFormData.append('client_id', appId);
        tokenFormData.append('client_secret', appSecret);
        tokenFormData.append('grant_type', 'authorization_code');
        tokenFormData.append('redirect_uri', redirectUri);
        // 여기서 넘어오는 code의 마지막 '#_' 제거 이슈 (인스타그램 종특)
        // code 파라미터 끝에 '#_'가 붙어오는 경우가 많아서 제거
        const cleanCode = code.replace(/#_$/, '');
        tokenFormData.append('code', cleanCode);

        const tokenRes = await fetch('https://api.instagram.com/oauth/access_token', {
            method: 'POST',
            body: tokenFormData,
        })
        const tokenData = await tokenRes.json()

        if (tokenData.error_message || !tokenData.access_token) {
            console.error('[Instagram Basic API] token error:', tokenData);
            throw new Error(tokenData.error_message || 'Token exchange failed')
        }

        const shortToken = tokenData.access_token
        const igUserId = tokenData.user_id?.toString()

        // 2. 장기 토큰 교환 (선택 사항이나 보통 필수로 진행 - 60일 유효)
        const longTokenRes = await fetch(
            `https://graph.instagram.com/access_token` +
            `?grant_type=ig_exchange_token&client_secret=${appSecret}&access_token=${shortToken}`
        )
        const longTokenData = await longTokenRes.json()
        const accessToken = longTokenData.access_token || shortToken

        // 3. Instagram 사용자 기본 정보 가져오기 
        const meRes = await fetch(
            `https://graph.instagram.com/me` +
            `?fields=id,username,account_type,media_count` +
            `&access_token=${accessToken}`
        )
        const meData = await meRes.json()

        if (meData.error) throw new Error(meData.error.message)

        // Basic Display API는 followers_count를 직접 주지 않는 경우가 대부분임 
        // -> followers_count는 0으로 저장하고 사용자에게 채워넣으라고 하거나 로직 무시 처리

        // 4. Supabase에 저장 (RLS 우회)
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )

        const { error: rpcError } = await supabase.rpc('save_instagram_connection_basic', {
            p_user_id: userId,
            p_handle: meData.username || '',
            p_ig_user_id: meData.id || igUserId,
            p_ig_access_token: accessToken,
        })

        if (rpcError) {
            console.error('[Instagram Basic API] db save error:', rpcError);
            throw new Error(rpcError.message)
        }

        return NextResponse.redirect(`${settingsUrl}&ig_connected_basic=true`)
    } catch (err: any) {
        console.error('[Instagram Basic API] callback error:', err)
        const msg = encodeURIComponent(err?.message || String(err) || 'unknown')
        return NextResponse.redirect(`${settingsUrl}&ig_error_basic=${msg}`)
    }
}
