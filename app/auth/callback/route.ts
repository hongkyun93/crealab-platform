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
            // Determine where to redirect based on user role
            // First check if specific next was provided, otherwise try to deduce
            if (next === '/') {
                // Fetch user profile or metadata to determine role
                // We preferred the metadata way in our trigger using role_type

                // If we know the intent from the URL (role_type), we can hint the redirect
                // But safer is to check the actual profile in case they are already signed up

                try {
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('role')
                        .eq('id', data.user.id)
                        .single()

                    if (profile?.role === 'brand') {
                        next = '/brand'
                    } else if (profile?.role === 'influencer') {
                        next = '/influencer'
                    } else if (profile?.role === 'admin') {
                        next = '/admin'
                    } else if (roleType === 'brand') {
                        // Fallback if profile creation is lagging (though trigger is sync)
                        next = '/brand'
                    } else if (roleType === 'influencer') {
                        next = '/influencer'
                    }
                } catch (e) {
                    console.error('Profile fetch error', e)
                }
            }

            const isLocalEnv = process.env.NODE_ENV === 'development'

            if (isLocalEnv) {
                return NextResponse.redirect(`${origin}${next}`)
            } else {
                // In generic environment, prefer using request origin but ensure protocol is https if forwarded host implies it
                // Actually, Vercel sets request.url correctly. 
                // However, standard safety pattern:
                const forwardedHost = request.headers.get('x-forwarded-host')
                if (forwardedHost) {
                    return NextResponse.redirect(`https://${forwardedHost}${next}`)
                }
                return NextResponse.redirect(`${origin}${next}`)
            }
        } else if (error) {
            return NextResponse.redirect(`${origin}/auth/auth-code-error?error=${error.message}`)
        }
    }

    // return the user to an error page with instructions
    return NextResponse.redirect(`${origin}/auth/auth-code-error?error=No code provided`)
}
