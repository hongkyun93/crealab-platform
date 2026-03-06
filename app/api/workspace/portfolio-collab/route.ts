import { createClient as createAdminClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

// Service role key is required to insert proposals with brand_id = null
const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { portfolioId, creatorId } = body

        if (!portfolioId || !creatorId) {
            return NextResponse.json({ error: '필수 파라미터가 누락되었습니다.' }, { status: 400 })
        }

        const supabase = await createClient()

        // 1. Fetch Portfolio
        const { data: portfolio, error: portfolioError } = await supabase
            .from('mcn_portfolio_links')
            .select('*')
            .eq('id', portfolioId)
            .single()

        if (portfolioError || !portfolio) {
            return NextResponse.json({ error: '유효하지 않은 포트폴리오 링크입니다.' }, { status: 404 })
        }

        if (portfolio.expires_at && new Date(portfolio.expires_at) < new Date()) {
            return NextResponse.json({ error: '만료된 포트폴리오 링크입니다.' }, { status: 403 })
        }

        if (!portfolio.creator_ids.includes(creatorId)) {
            return NextResponse.json({ error: '해당 크리에이터는 이 포트폴리오에 포함되어 있지 않습니다.' }, { status: 403 })
        }

        // 2. Generate Token
        const token = crypto.randomUUID()
        const expiresAt = new Date()
        expiresAt.setDate(expiresAt.getDate() + 7)

        // 3. Create Proposal with brand_id = null
        const insertData = {
            creator_id: creatorId,
            creator_team_id: portfolio.team_id,
            status: 'accepted', // Auto-accepted since it's from an MCN portfolio
            is_magic_link_invited: true,
            direct_invite_token: token,
            direct_invite_expires_at: expiresAt.toISOString(),
            price_offer: 0, // Need negotiation
            message: portfolio.message || `[${portfolio.brand_name || '브랜드'} 포트폴리오 제안] 안녕하세요.`,
            conditions: {
                group: 'portfolio_collab',
                brand_name_temp: portfolio.brand_name || '협업 제안 브랜드',
            }
        }

        const { data: result, error: insertError } = await supabaseAdmin
            .from('moment_proposals')
            .insert(insertData)
            .select('id, direct_invite_token')
            .single()

        if (insertError) {
            console.error('[API] Portfolio Collab Error:', insertError)
            return NextResponse.json({ error: `협업 방 생성 실패: ${insertError.message}` }, { status: 500 })
        }

        // 4. Return Magic Link
        const origin = new URL(req.url).origin
        const magicLink = `${origin}/w/join/${result.direct_invite_token}`

        return NextResponse.json({
            success: true,
            magicLink,
            proposalId: result.id
        })

    } catch (e: any) {
        console.error('[API] Portfolio Collab Exception:', e)
        return NextResponse.json({ error: e.message || 'Server error' }, { status: 500 })
    }
}
