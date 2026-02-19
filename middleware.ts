import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    // 세션 갱신 (Supabase SSR 필수)
    const response = await updateSession(request)

    // /brand 또는 /creator 경로 보호
    if (pathname.startsWith('/brand') || pathname.startsWith('/creator')) {
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() {
                        return request.cookies.getAll()
                    },
                    setAll(cookiesToSet) {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            response.cookies.set(name, value, options)
                        )
                    },
                },
            }
        )

        const { data: { user } } = await supabase.auth.getUser()

        // 로그인 안 된 경우 → 로그인 페이지로
        if (!user) {
            return NextResponse.redirect(new URL('/login', request.url))
        }

        // 1. FAST CHECK: Metadata (JWT)
        let role = user.user_metadata?.role

        // 2. SAFE FALLBACK: RPC (if metadata missing)
        // We use RPC because direct table query hits RLS recursion (Creator Hang)
        if (!role) {
            console.log('[Middleware] Role missing in metadata, checking RPC...')
            const { data: userData } = await supabase.rpc('get_current_user_info')
            if (userData) {
                role = (userData as any).role
            }
        }

        // 3. LEGACY FALLBACK: Profiles table (Only if RPC failed/missing)
        if (!role) {
            const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single()
            role = profile?.role
        }

        // role이 없으면(온보딩 미완) → 온보딩으로
        if (!role) {
            return NextResponse.redirect(new URL('/onboarding', request.url))
        }

        // /brand: brand 또는 agency만 허용
        if (pathname.startsWith('/brand')) {
            if (role !== 'brand' && role !== 'agency') {
                return NextResponse.redirect(new URL('/creator', request.url))
            }
        }

        // /creator: creator 또는 mcn만 허용
        if (pathname.startsWith('/creator')) {
            if (role !== 'creator' && role !== 'mcn') {
                return NextResponse.redirect(new URL('/brand', request.url))
            }
        }
    }

    return response
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static, _next/image, favicon.ico, static assets
         * - /login, /signup, /onboarding, /terms, /privacy (public routes)
         * - /api (API routes)
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|login|signup|onboarding|terms|privacy|api).*)',
    ],
}
