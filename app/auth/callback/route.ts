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

                // Detect if it's a new user (signup)
                // If created_at is very close to last_sign_in_at, it's likely a new user.
                // However, last_sign_in_at is updated on login.
                // A safer bet for "first time" is often checking if profile is fully set up, but relying on timestamps is a common heuristic.
                // Let's assume if created_at and last_sign_in_at are within a few seconds, it's a signup.
                const createdAt = new Date(data.user.created_at)
                // last_sign_in_at might not be updated yet in the session object returned by exchangeCodeForSession?
                // Actually, let's treat it as: if we can't find specific profile info, it's new.
                // But the user asked for "If signup -> settings".

                // Let's check if the user is "new" by checking if the creation time is very recent (e.g. within 1 minute of now)
                // This is a robust enough check for the immediate callback after signup.
                const isNewUser = (new Date().getTime() - createdAt.getTime()) < 60 * 1000 // 1 minute
                let userRole = profile?.role

                // If it's a new user and we have a preferred role from the URL, force update it
                // This handles cases where the DB trigger might have defaulted to 'influencer' (e.g. Social Login)
                if (isNewUser && roleType && roleType !== userRole) {
                    console.log(`[Auth Callback] New user detected, forcing role to: ${roleType}`)
                    await supabase
                        .from('profiles')
                        .update({ role: roleType })
                        .eq('id', data.user.id)
                    userRole = roleType as any
                }

                if (userRole === 'brand') {
                    next = isNewUser ? '/brand/settings' : '/brand'
                } else if (userRole === 'influencer') {
                    next = isNewUser ? '/creator?view=settings' : '/creator'
                } else if (userRole === 'admin') {
                    next = '/admin'
                } else if (roleType === 'brand') {
                    next = isNewUser ? '/brand/settings' : '/brand'
                } else if (roleType === 'influencer') {
                    next = isNewUser ? '/creator?view=settings' : '/creator'
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
