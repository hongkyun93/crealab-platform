import { createClient as createAdminClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// product_applications 테이블에 실제로 존재하는 컬럼만
// (price_offer, condition_*, contract_*, delivery_*, content_* 등은 없음)
const PA_VALID_COLUMNS = [
    'status', 'message', 'motivation', 'content_plan',
    'portfolio_links', 'insight_screenshot',
]

// workspaces 동기화 컬럼
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
    'price_offer', 'product_name', 'product_type',
    'condition_product_receipt_date', 'condition_draft_submission_date',
    'condition_final_submission_date', 'condition_upload_date',
    'condition_secondary_usage_period', 'secondary_usage_fee',
    'brand_condition_confirmed', 'creator_condition_confirmed',
    'channel_name', 'channel_subtype', 'video_guide',
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

        // workspace_id 먼저 조회
        const { data: appData } = await supabaseAdmin
            .from('product_applications')
            .select('workspace_id')
            .eq('id', id)
            .single()

        // product_applications 업데이트: 실제 존재하는 컬럼만 필터링
        const paUpdates: any = {}
        for (const col of PA_VALID_COLUMNS) {
            if (updates[col] !== undefined) {
                paUpdates[col] = updates[col]
            }
        }

        if (Object.keys(paUpdates).length > 0) {
            const { error } = await supabaseAdmin
                .from('product_applications')
                .update(paUpdates)
                .eq('id', id)

            if (error) {
                // PA 컬럼 미존재 에러는 non-fatal — workspaces 동기화는 계속 진행
                console.warn('[API] product-applications update error (non-fatal):', error.message)
            }
        }

        // workspaces 동기화 — PA 컬럼 유무와 무관하게 항상 실행
        if (appData?.workspace_id) {
            const workspaceUpdates: any = {}
            for (const col of WORKSPACE_SYNC_COLUMNS) {
                if (updates[col] !== undefined) {
                    workspaceUpdates[col] = updates[col]
                }
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
        console.error('[API] product-applications update exception:', e)
        return NextResponse.json({ error: e.message || 'Server error' }, { status: 500 })
    }
}
