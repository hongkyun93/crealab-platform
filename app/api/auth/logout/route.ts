import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    try {
        const cookieStore = await cookies()

        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    async getAll() {
                        const cookieStore = await cookies()
                        return cookieStore.getAll()
                    },
                    async setAll(cookiesToSet) {
                        const cookieStore = await cookies()
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        )
                    },
                },
            }
        )

        // Supabase 서버 세션 파기
        await supabase.auth.signOut()

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('[Logout Route] Error:', error)
        return NextResponse.json({ error: 'Failed to logout' }, { status: 500 })
    }
}
