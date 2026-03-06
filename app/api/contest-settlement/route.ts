import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// This route is called when a contest challenger uploads their final/clean video.
// It creates a Pending settlement entry so the payout is held until the brand completes
// the engagement tracking period (반응 추이 테스트).
//
// Called by: workspace/common/info-panel.tsx when content_submission_status changes to 'approved'
//            and the workspace type is 'contest'.

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { workspaceId, creatorId, brandId, amount, description } = body

        if (!workspaceId || !creatorId) {
            return NextResponse.json({ error: 'workspaceId and creatorId are required' }, { status: 400 })
        }

        // 1. 이미 pending 정산이 있는지 확인 (중복 방지)
        const { data: existing } = await supabase
            .from('settlements')
            .select('id')
            .eq('workspace_id', workspaceId)
            .eq('settlement_type', 'contest_base')
            .eq('status', 'pending')
            .maybeSingle()

        if (existing) {
            return NextResponse.json({ message: 'Pending settlement already exists', id: existing.id })
        }

        // 2. 워크스페이스 정보 가져오기 (상금 정보)
        const { data: workspace, error: wsErr } = await supabase
            .from('workspaces')
            .select('id, project_title, base_reward, brand_id, creator_id')
            .eq('id', workspaceId)
            .single()

        if (wsErr || !workspace) {
            return NextResponse.json({ error: 'Workspace not found' }, { status: 404 })
        }

        const settlementAmount = amount || workspace.base_reward || 0
        const settlementDescription = description || `[${workspace.project_title || '콘테스트'}] 영상 제출 완료 — 반응 추이 테스트 완료 후 지급 예정`

        // 3. Pending 정산 생성
        const { data: settlement, error: settleErr } = await supabase
            .from('settlements')
            .insert({
                workspace_id: workspaceId,
                creator_id: workspace.creator_id || creatorId,
                brand_id: workspace.brand_id || brandId,
                amount: settlementAmount,
                status: 'pending',
                settlement_type: 'contest_base',
                description: settlementDescription,
                created_at: new Date().toISOString(),
            })
            .select()
            .single()

        if (settleErr) {
            console.error('[contest-settlement] Insert error:', settleErr)
            return NextResponse.json({ error: settleErr.message }, { status: 500 })
        }

        // 4. 크리에이터에게 알림 전송
        try {
            await supabase.from('notifications').insert({
                recipient_id: workspace.creator_id || creatorId,
                sender_id: workspace.brand_id || brandId,
                type: 'settlement_pending',
                content: `${settlementDescription}`,
                reference_id: settlement.id,
                is_read: false,
            })
        } catch (notifErr) {
            console.warn('[contest-settlement] Notification failed (ignored):', notifErr)
        }

        return NextResponse.json({ success: true, settlement })
    } catch (err: any) {
        console.error('[contest-settlement] Unexpected error:', err)
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}
