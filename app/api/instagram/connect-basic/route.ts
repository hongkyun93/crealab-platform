import { NextResponse } from 'next/server'

// GET /api/instagram/connect-basic?userId={supabase_user_id}
// → Instagram Basic Display OAuth 페이지로 리다이렉트 (페이스북 없이 인스타그램 직접 로그인)
export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
        return NextResponse.json({ error: 'userId required' }, { status: 400 })
    }

    // Instagram Basic Display API 용 앱 ID가 필요함. 
    // 기존 INSTAGRAM_APP_ID를 그대로 공용으로 쓸지 (Facebook Login for Instagram),
    // 별도 앱을 만들지 환경에 따라 다르나, 보통 Facebook Login용 앱에도 Instagram Login 플러그인이 있음.
    // 여기서는 기본적으로 같은 앱ID를 사용한다고 가정.
    const appId = process.env.INSTAGRAM_APP_ID || process.env.INSTAGRAM_BASIC_APP_ID
    const redirectUri = `${origin}/api/instagram/callback-basic`
    
    // scope: user_profile, user_media
    const scope = 'user_profile,user_media'

    const authUrl =
        `https://api.instagram.com/oauth/authorize` +
        `?client_id=${appId}` +
        `&redirect_uri=${encodeURIComponent(redirectUri)}` +
        `&scope=${scope}` +
        `&response_type=code` +
        `&state=${userId}` // 응답에 포함될 사용자 식별자

    return NextResponse.redirect(authUrl)
}
