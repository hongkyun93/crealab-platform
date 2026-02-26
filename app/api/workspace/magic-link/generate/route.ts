import { createClient as createAdminClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

// Service role key is required to insert proposals with brand_id = null
// bypassing standard RLS policies that might restrict such inserts.
const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
    try {
        // 1. Verify Authentication & Role
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        if (profile?.role !== 'mcn' && profile?.role !== 'admin') {
            return NextResponse.json({ error: 'MCN 매니저 또는 관리자만 생성할 수 있습니다.' }, { status: 403 })
        }

        // 2. Parse Request Body
        const body = await req.json()
        const { influencerId, brandName, priceOffer, message } = body

        if (!influencerId) {
            return NextResponse.json({ error: '크리에이터 ID가 필요합니다.' }, { status: 400 })
        }

        // 3. Get MCN Team ID (MCN 매니저의 팀 ID)
        const { data: teamMember } = await supabase
            .from('team_members')
            .select('team_id')
            .eq('user_id', user.id)
            .single()

        const influencerTeamId = teamMember?.team_id || null

        // 4. Generate Token & Expiration (+7 days)
        const token = crypto.randomUUID()
        const expiresAt = new Date()
        expiresAt.setDate(expiresAt.getDate() + 7)

        // 5. Insert Blank Proposal (Growth Hack MVP)
        // Insert into moment_proposals with brand_id = null
        const insertData = {
            influencer_id: influencerId,
            influencer_team_id: influencerTeamId,
            status: 'accepted', // Auto-accepted since MCN initiated it
            is_magic_link_invited: true,
            direct_invite_token: token,
            direct_invite_expires_at: expiresAt.toISOString(),
            price_offer: priceOffer ? parseInt(priceOffer.toString().replace(/[^0-9]/g, '')) : 0,
            message: message || `[MCN 사전 개설] ${brandName || '협업 브랜드'}님과의 워크스페이스입니다.`,
            conditions: {
                group: 'magic_link_proposal',
                brand_name_temp: brandName || '', // Store temporary brand name
            }
        }

        const { data: result, error } = await supabaseAdmin
            .from('moment_proposals')
            .insert(insertData)
            .select('id, direct_invite_token')
            .single()

        if (error) {
            console.error('[API] Magic Link Generate Error:', error)
            return NextResponse.json({ error: `매직 링크 생성 실패: ${error.message}` }, { status: 500 })
        }

        // 6. Return Magic Link URL
        // We use the origin from the request to construct the full URL
        const origin = new URL(req.url).origin
        const magicLink = `${origin}/w/join/${result.direct_invite_token}`

        return NextResponse.json({
            success: true,
            magicLink,
            proposalId: result.id,
            expiresAt: expiresAt.toISOString()
        })

    } catch (e: any) {
        console.error('[API] Magic Link Generate Exception:', e)
        return NextResponse.json({ error: e.message || 'Server error' }, { status: 500 })
    }
}
