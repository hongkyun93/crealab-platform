import { updateSession } from '@/lib/supabase/middleware'
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    // 세션 갱신 (Supabase SSR 필수)
    const response = await updateSession(request)

    // /login, /signup: 캐시 방지만 적용 (쿠키 삭제는 logout()에서 처리)
    if (pathname === '/login' || pathname === '/signup') {
        response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate')
        response.headers.set('Pragma', 'no-cache')
        return response
    }

    // /debug-*: 프로덕션에서는 접근 차단 (JWT 토큰·세션 정보 노출 방지)
    if (pathname.startsWith('/debug-') && process.env.NODE_ENV === 'production') {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    // /design-lab: 프로덕션에서는 차단 (프로토타입 페이지 41개)
    if (pathname.startsWith('/design-lab') && process.env.NODE_ENV === 'production') {
        return NextResponse.redirect(new URL('/', request.url))
    }

    // /login_test: 프로덕션에서는 차단 (테스트 페이지)
    if (pathname.startsWith('/login_test') && process.env.NODE_ENV === 'production') {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    // /brand, /creator, /admin, /mcn 경로 보호
    const isProtected =
        pathname.startsWith('/brand') ||
        pathname.startsWith('/creator') ||
        pathname.startsWith('/admin') ||
        pathname.startsWith('/mcn')

    if (isProtected) {
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

        // 2. SAFE FALLBACK: RPC
        if (!role) {
            console.log('[Middleware] Role missing in metadata, checking RPC...')
            const { data: userData } = await supabase.rpc('get_current_user_info')
            if (userData) {
                role = (userData as any).role
            }
        }

        // 3. LEGACY FALLBACK: Profiles table
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

        // /admin: admin role만 허용
        if (pathname.startsWith('/admin')) {
            if (role !== 'admin') {
                // role별 홈으로 리다이렉트
                const home = role === 'brand' || role === 'agency' ? '/brand'
                    : role === 'mcn' ? '/mcn'
                        : '/creator'
                return NextResponse.redirect(new URL(home, request.url))
            }
            return response
        }

        // /mcn: mcn role만 허용
        if (pathname.startsWith('/mcn')) {
            if (role !== 'mcn') {
                const home = role === 'admin' ? '/admin'
                    : role === 'brand' || role === 'agency' ? '/brand'
                        : '/creator'
                return NextResponse.redirect(new URL(home, request.url))
            }
            return response
        }

        // admin은 /brand, /creator 모두 허용
        if (role === 'admin') return response

        // /brand: brand 또는 agency만 허용
        if (pathname.startsWith('/brand')) {
            if (role !== 'brand' && role !== 'agency') {
                return NextResponse.redirect(new URL(role === 'mcn' ? '/mcn' : '/creator', request.url))
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
         * - /onboarding, /terms, /privacy (public routes)
         * - /forgot-password, /reset-password (auth recovery routes)
         * - /api (API routes)
         * NOTE: /login and /signup ARE included — middleware clears stale cookies
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|onboarding|terms|privacy|forgot-password|reset-password|api).*)',
    ],
}
