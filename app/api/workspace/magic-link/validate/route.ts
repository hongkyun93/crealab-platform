import { createClient as createAdminClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { token } = body

        if (!token) {
            return NextResponse.json({ error: '유효하지 않은 링크입니다.' }, { status: 400 })
        }

        // 1. Verify Authentication
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
        }

        // 2. Fetch User Profile
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        let userRole = profile?.role

        // 3. Prevent non-brands from joining
        if (userRole && userRole !== 'brand' && userRole !== 'agency') {
            return NextResponse.json({ error: '이 초대 링크는 브랜드/마케터 전용 링크입니다. 일반 크리에이터 계정이 아닌 다른 계정(혹은 이메일)으로 로그인해 주세요.' }, { status: 403 })
        }

        // Optional: Get User Team
        const { data: teamMember } = await supabase
            .from('team_members')
            .select('team_id')
            .eq('user_id', user.id)
            .single()

        const brandTeamId = teamMember?.team_id || null

        // 4. Find valid Proposal (RLS bypass)
        const { data: proposal, error: fetchError } = await supabaseAdmin
            .from('moment_proposals')
            .select('id, direct_invite_expires_at, brand_id, influencer_id, message')
            .eq('direct_invite_token', token)
            .single()

        if (fetchError || !proposal) {
            return NextResponse.json({ error: '존재하지 않거나 이미 사용된 초대 링크입니다.' }, { status: 404 })
        }

        // Check expiration
        if (new Date(proposal.direct_invite_expires_at) < new Date()) {
            return NextResponse.json({ error: '만료된 초대 링크입니다.' }, { status: 400 })
        }

        // Check if already mapped
        if (proposal.brand_id) {
            return NextResponse.json({ error: '이미 다른 담당자가 참여를 완료한 워크스페이스입니다.' }, { status: 400 })
        }

        // 5. Update Proposal (Atomic)
        const { error: updateError, data: updatedProposal } = await supabaseAdmin
            .from('moment_proposals')
            .update({
                brand_id: user.id,
                brand_team_id: brandTeamId,
                direct_invite_token: null, // one-time use
                // we keep is_magic_link_invited = true for tracking
            })
            .eq('id', proposal.id)
            .is('brand_id', null) // Race condition lock
            .select()
            .single()

        if (updateError || !updatedProposal) {
            return NextResponse.json({ error: '참여 처리 중 오류가 발생했거나, 다른 담당자가 간발의 차이로 먼저 수락했습니다.' }, { status: 409 })
        }

        // 6. Send Notification to Influencer/MCN
        const brandName = user.user_metadata?.display_name || user.email?.split('@')[0] || "브랜드 마케터"
        await supabaseAdmin
            .from('notifications')
            .insert({
                recipient_id: proposal.influencer_id,
                sender_id: user.id,
                content: `${brandName}님이 매직 링크 초대를 수락하고 워크스페이스에 참여했습니다.`,
                type: 'proposal_accepted',
                reference_id: proposal.id,
                is_read: false
            })

        // 7. Success!
        return NextResponse.json({
            success: true,
            proposalId: proposal.id
        })

    } catch (e: any) {
        console.error('[API] Magic Link Validate Exception:', e)
        return NextResponse.json({ error: e.message || 'Server error' }, { status: 500 })
    }
}
