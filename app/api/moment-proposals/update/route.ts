import { createClient as createAdminClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// Service role key 사용 → RLS 우회 (인증 통과 후에만 사용)
const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// workspaces 테이블에도 동기화해야 하는 컬럼 목록
// (00_master_schema_v6.sql의 workspaces 테이블에 실제 존재하는 컬럼만)
const WORKSPACE_SYNC_COLUMNS = [
    'status',
    'contract_status', 'contract_content',
    'brand_signature', 'creator_signature',
    'brand_signed_at', 'creator_signed_at',
    'payment_confirmed_at',
    'delivery_status', 'tracking_number',
    'shipping_name', 'shipping_phone', 'shipping_address',
    'content_submission_status', 'content_submission_url', 'content_submission_file_url',
    'content_submission_date', 'content_submission_version',
    'content_final_url', 'content_clean_url',
    'content_final_approved_at', 'content_revision_requested_at',
    'price_offer', 'product_type', 'secondary_usage_fee', 'video_guide',
    'condition_product_receipt_date', 'condition_plan_sharing_date',
    'condition_draft_submission_date', 'condition_final_submission_date',
    'condition_upload_date', 'condition_maintenance_period',
    'condition_secondary_usage_period',
    'brand_condition_confirmed', 'creator_condition_confirmed',
    'has_incentive', 'incentive_detail', 'special_terms', 'product_url', 'product_name',
    'channel_name', 'channel_subtype', // 진행 채널 (workspaces 컬럼 추가 후 동기화)
]



export async function PATCH(req: NextRequest) {
    try {
        // 인증 체크: 로그인된 유저만 허용
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        console.log('[API moment-proposals origin]', req.url);
        const { id, updates, conditionUpdates, workspaceId: reqWorkspaceId } = await req.json()
        console.log('[API moment-proposals req JSON parsed]', id);

        if (!id || (!updates && !conditionUpdates)) {
            return NextResponse.json({ error: 'id and updates required' }, { status: 400 })
        }

        // moment_proposals top-level columns
        const TOP_LEVEL_COLUMNS = [
            'id', 'created_at', 'updated_at', 'brand_id', 'creator_id',
            'moment_id', 'product_id', 'message', 'status', 'workspace_id'
        ]

        const dbUpdates: any = {}
        const newConditions: any = { ...conditionUpdates }

        // Route fields to top-level or conditions JSONB
        if (updates) {
            for (const [key, value] of Object.entries(updates)) {
                if (TOP_LEVEL_COLUMNS.includes(key)) {
                    dbUpdates[key] = value
                } else {
                    newConditions[key] = value
                }
            }
        }

        // 기존 conditions + workspace_id 한 번에 조회
        const { data: existing } = await supabaseAdmin
            .from('moment_proposals')
            .select('conditions, workspace_id')
            .eq('id', id)
            .single()

        if (Object.keys(newConditions).length > 0) {
            dbUpdates.conditions = { ...(existing?.conditions || {}), ...newConditions }
        }

        console.log('[API] moment-proposals updating DB:', dbUpdates);
        const { error } = await supabaseAdmin
            .from('moment_proposals')
            .update(dbUpdates)
            .eq('id', id)

        if (error) {
            console.error('[API] moment-proposals update error:', error)
            return NextResponse.json({ error: error.message || 'Update failed' }, { status: 500 })
        }

        // ── workspaces 동기화 ──
        const workspaceId = existing?.workspace_id || reqWorkspaceId || updates?.workspace_id
        if (workspaceId) {
            const workspaceUpdates: any = {}
            const allUpdates = { ...newConditions, ...(updates || {}) }

            // 일반 필드 동기화 (변경된 것만)
            for (const col of WORKSPACE_SYNC_COLUMNS) {
                if (allUpdates[col] !== undefined) {
                    workspaceUpdates[col] = allUpdates[col]
                }
            }

            // ── accepted 시점: conditions 전체를 workspaces로 초기 복사 ──
            // status가 accepted로 바뀌는 순간, 기존 conditions 데이터 전체를 workspaces에 씀
            const isAccepting = dbUpdates.status === 'accepted' || updates?.status === 'accepted'
            if (isAccepting && existing?.conditions) {
                const cond = existing.conditions as Record<string, any>
                for (const col of WORKSPACE_SYNC_COLUMNS) {
                    // 이미 workspaceUpdates에 값이 있으면 유지, 없으면 conditions에서 채움
                    if (workspaceUpdates[col] === undefined && cond[col] !== undefined) {
                        workspaceUpdates[col] = cond[col]
                    }
                }
            }

            if (Object.keys(workspaceUpdates).length > 0) {
                console.log('[API] workspaces update attempt:', { workspaceId, columns: Object.keys(workspaceUpdates) })
                const { error: wsErr } = await supabaseAdmin
                    .from('workspaces')
                    .update(workspaceUpdates)
                    .eq('id', workspaceId)
                if (wsErr) {
                    console.error('[API] workspaces sync FAILED:', wsErr.message, wsErr)
                    return NextResponse.json({ error: `workspaces sync failed: ${wsErr.message}` }, { status: 500 })
                }
                console.log('[API] workspaces sync success')
            } else {
                console.log('[API] workspaceUpdates empty — nothing to sync to workspaces')
            }
        }


        return NextResponse.json({ success: true })
    } catch (e: any) {
        console.error('[API] moment-proposals update exception:', e)
        return NextResponse.json({ error: e.message || 'Server error' }, { status: 500 })
    }
}
