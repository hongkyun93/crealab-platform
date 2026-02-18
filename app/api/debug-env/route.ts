import { NextResponse } from 'next/server'

export async function GET() {
    // Debug endpoint - only available in development
    if (process.env.NODE_ENV !== 'development') {
        return NextResponse.json({ error: 'Not available' }, { status: 404 })
    }
    return NextResponse.json({
        NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'set' : 'missing',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'set' : 'missing',
    })
}
