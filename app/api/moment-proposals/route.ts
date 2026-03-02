import { createClient as createAdminClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// Service role key 사용 → RLS 우회 (인증 통과 후에만 사용)
const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
    try {
        // 인증 체크: 로그인된 유저만 허용
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const proposalData = await req.json()

        if (!proposalData.moment_id || !proposalData.creator_id) {
            return NextResponse.json({ error: 'moment_id and creator_id are required' }, { status: 400 })
        }

        // brand_id가 없으면 현재 유저 ID로 채움
        if (!proposalData.brand_id) {
            proposalData.brand_id = user.id
        }

        const { data, error } = await supabaseAdmin
            .from('moment_proposals')
            .insert(proposalData)
            .select()
            .single()

        if (error) {
            console.error('[API] moment-proposals insert error:', error)
            return NextResponse.json({ error: error.message || 'Insert failed' }, { status: 500 })
        }

        return NextResponse.json({ data })
    } catch (e: any) {
        console.error('[API] moment-proposals insert exception:', e)
        return NextResponse.json({ error: e.message || 'Server error' }, { status: 500 })
    }
}
