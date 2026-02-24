import { NextResponse } from 'next/server'

// GET /api/instagram/connect?userId={supabase_user_id}
// → Facebook OAuth 페이지로 리다이렉트
export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
        return NextResponse.json({ error: 'userId required' }, { status: 400 })
    }

    const appId = process.env.INSTAGRAM_APP_ID
    const redirectUri = `${origin}/api/instagram/callback`
    const scope = 'instagram_basic,instagram_manage_insights,pages_show_list,pages_read_engagement,business_management'

    const authUrl =
        `https://www.facebook.com/dialog/oauth` +
        `?client_id=${appId}` +
        `&redirect_uri=${encodeURIComponent(redirectUri)}` +
        `&scope=${scope}` +
        `&response_type=code` +
        `&auth_type=rerequest` +
        `&state=${userId}`

    return NextResponse.redirect(authUrl)
}
