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
        console.log('[Auth Callback] Exchanging code for session...')

        const { error, data } = await supabase.auth.exchangeCodeForSession(code)

        if (!error && data?.user) {
            console.log('[Auth Callback] Session exchange successful for user:', data.user.id)

            try {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', data.user.id)
                    .single()

                // Detect if it's a new user (signup) - 1 minute threshold
                const isNewUser = (new Date().getTime() - new Date(data.user.created_at).getTime()) < 60 * 1000
                let userRole = profile?.role

                console.log(`[Auth Callback] DB role: ${userRole}, Pref role: ${roleType}, isNew: ${isNewUser}`)

                // Priority: Use DB role if exists, otherwise use roleType hint or default to influencer
                if (!userRole) {
                    userRole = (roleType as any) || 'influencer'
                    console.log(`[Auth Callback] Assigning role: ${userRole}`)
                    await supabase.from('profiles').update({ role: userRole }).eq('id', data.user.id)
                }

                // Sync auth metadata to DB role
                if (data.user.user_metadata?.role !== userRole) {
                    await supabase.auth.updateUser({ data: { role: userRole } })
                }

                if (userRole === 'brand') {
                    next = isNewUser ? '/brand/settings' : '/brand'
                } else if (userRole === 'influencer') {
                    next = isNewUser ? '/creator?view=settings' : '/creator'
                } else if (userRole === 'admin') {
                    next = '/admin'
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
            return NextResponse.redirect(`${origin}/auth/debug?error=${encodeURIComponent(JSON.stringify(error))}&message=${encodeURIComponent(error.message)}`)
        }
    }

    // return the user to an error page with instructions
    return NextResponse.redirect(`${origin}/auth/auth-code-error?error=No code provided`)
}
