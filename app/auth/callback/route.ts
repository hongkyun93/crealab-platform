import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    let next = searchParams.get('next') ?? '/'

    // Check if we passed a role_type preference in the URL
    const roleType = searchParams.get('role_type')

    if (code) {
        const supabase = await createClient()

        const { error, data } = await supabase.auth.exchangeCodeForSession(code)

        if (!error && data?.user) {

            try {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', data.user.id)
                    .single()

                // Detect if it's a new user (signup) - 1 minute threshold
                const isNewUser = (new Date().getTime() - new Date(data.user.created_at).getTime()) < 60 * 1000
                let userRole = profile?.role


                // Priority: Use DB role if exists, otherwise use roleType hint
                if (!userRole && roleType) {
                    userRole = roleType as any
                    await supabase.from('profiles').update({ role: userRole }).eq('id', data.user.id)
                }

                // Sync auth metadata to DB role
                if (userRole && data.user.user_metadata?.role !== userRole) {
                    await supabase.auth.updateUser({ data: { role: userRole } })
                }

                if (userRole === 'brand') {
                    next = isNewUser ? '/brand/settings' : '/brand'
                } else if (userRole === 'creator') {
                    next = isNewUser ? '/creator?view=settings' : '/creator'
                } else if (userRole === 'mcn') {
                    next = '/mcn'
                } else if (userRole === 'admin') {
                    next = '/admin'
                } else {
                    // role 없는 신규 유저 → 온보딩에서 역할 선택
                    next = '/onboarding'
                }
            } catch (e) {
                console.error('Profile fetch error', e)
            }

            const isLocalEnv = process.env.NODE_ENV === 'development'

            if (isLocalEnv) {
                return NextResponse.redirect(`${origin}${next}`)
            } else {
                const forwardedHost = request.headers.get('x-forwarded-host')
                if (forwardedHost) {
                    return NextResponse.redirect(`https://${forwardedHost}${next}`)
                }
                return NextResponse.redirect(`${origin}${next}`)
            }
        } else if (error) {
            console.error('[Auth Callback] Exchange error:', error)
            // ⚠️ error 객체 전체를 URL에 노출하지 않음 (민감 정보 포함 가능)
            // 전체 JSON 대신 'status' 코드만 전달
            const safeCode = (error as any).status ?? 'unknown'
            return NextResponse.redirect(`${origin}/auth/auth-code-error?error=${encodeURIComponent(safeCode)}&message=${encodeURIComponent(error.message)}`)
        }
    }

    // return the user to an error page with instructions
    return NextResponse.redirect(`${origin}/auth/auth-code-error?error=No code provided`)
}
