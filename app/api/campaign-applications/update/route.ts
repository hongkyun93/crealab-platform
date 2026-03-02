import { createClient as createAdminClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// campaign_applications 테이블에 존재하는 컬럼 (workspaces와 동기화 가능한 것들)
const CA_VALID_COLUMNS = [
    'status',
    'message', 'price_offer', 'motivation',
    'content_plan', 'portfolio_links', 'instagram_handle',
    'insight_screenshot', 'compensation_amount',
    'has_incentive', 'incentive_detail', 'content_type',
    'product_name', 'product_type', 'channel_name', 'channel_subtype',
    'secondary_usage_fee'
]

// workspaces 테이블 동기화 컬럼
const WORKSPACE_SYNC_COLUMNS = [
    'status',
    'contract_status', 'contract_content',
    'brand_signature', 'creator_signature', 'brand_signed_at', 'creator_signed_at',
    'payment_confirmed_at',
    'delivery_status', 'tracking_number',
    'shipping_name', 'shipping_phone', 'shipping_address',
    'content_submission_status', 'content_submission_url', 'content_submission_file_url',
    'content_submission_date', 'content_submission_version',
    'content_final_url', 'content_clean_url',
    'content_final_approved_at', 'content_revision_requested_at',
    'price_offer', 'product_type', 'secondary_usage_fee',
    'condition_product_receipt_date', 'condition_draft_submission_date',
    'condition_final_submission_date', 'condition_upload_date',
    'condition_secondary_usage_period',
    'brand_condition_confirmed', 'creator_condition_confirmed',
    'channel_name', 'channel_subtype',
]

export async function PATCH(req: NextRequest) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id, updates } = await req.json()
        if (!id || !updates) {
            return NextResponse.json({ error: 'id and updates required' }, { status: 400 })
        }

        // workspace_id 조회
        const { data: appData } = await supabaseAdmin
            .from('campaign_applications')
            .select('workspace_id')
            .eq('id', id)
            .single()

        // campaign_applications 업데이트
        const caUpdates: any = {}
        for (const col of CA_VALID_COLUMNS) {
            if (updates[col] !== undefined) {
                caUpdates[col] = updates[col]
            }
        }

        if (Object.keys(caUpdates).length > 0) {
            const { error } = await supabaseAdmin
                .from('campaign_applications')
                .update(caUpdates)
                .eq('id', id)

            if (error) {
                console.warn('[API] campaign-applications update error:', error.message)
                return NextResponse.json({ error: error.message }, { status: 500 })
            }
        }

        // workspaces 동기화
        if (appData?.workspace_id) {
            const workspaceUpdates: any = {}
            for (const col of WORKSPACE_SYNC_COLUMNS) {
                if (updates[col] !== undefined) {
                    workspaceUpdates[col] = updates[col]
                }
            }
            // receiver_name → shipping_name 매핑
            if (updates.receiver_name !== undefined) {
                workspaceUpdates.shipping_name = updates.receiver_name
            }
            if (Object.keys(workspaceUpdates).length > 0) {
                const { error: wsErr } = await supabaseAdmin
                    .from('workspaces')
                    .update(workspaceUpdates)
                    .eq('id', appData.workspace_id)
                if (wsErr) console.warn('[API] workspaces sync error:', wsErr.message)
            }
        }

        return NextResponse.json({ success: true })
    } catch (e: any) {
        console.error('[API] campaign-applications update exception:', e)
        return NextResponse.json({ error: e.message || 'Server error' }, { status: 500 })
    }
}
