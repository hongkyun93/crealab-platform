import { createClient as createAdminClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// Service role key 사용 → RLS 우회 (인증 통과 후에만 사용)
const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function PATCH(req: NextRequest) {
    try {
        // 인증 체크: 로그인된 유저만 허용
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id, updates } = await req.json()

        if (!id || !updates) {
            return NextResponse.json({ error: 'id and updates required' }, { status: 400 })
        }

        const { error } = await supabaseAdmin
            .from('moment_proposals')
            .update(updates)
            .eq('id', id)

        if (error) {
            console.error('[API] moment-proposals update error:', error)
            return NextResponse.json({ error: error.message || 'Update failed' }, { status: 500 })
        }

        return NextResponse.json({ success: true })
    } catch (e: any) {
        console.error('[API] moment-proposals update exception:', e)
        return NextResponse.json({ error: e.message || 'Server error' }, { status: 500 })
    }
}
