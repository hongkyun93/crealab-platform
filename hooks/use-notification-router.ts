import { useRouter } from "next/navigation"
import { useUnifiedProvider } from "@/components/providers/unified-provider"

export const NOTIFICATION_GROUPS = {
    // 1. Pre-Collaboration (제안 및 지원) -> 뷰어 모달이나 Inbound 탭으로
    INBOUND_PROPOSALS: ['proposal_received', 'moment_proposal', 'brand_offer'],
    INBOUND_APPLICATIONS: ['application_received', 'application_updated', 'campaign_application', 'product_application'],

    // 2. Rejected (거절 및 취소) -> Outbound 탭으로
    REJECTED: ['proposal_rejected', 'contract_rejected'],

    // 3. Active Workspace (진행 중) -> Active 탭으로
    ACTIVE_WORKSPACE: [
        'proposal_accepted', 'contract_signed',
        'condition_confirmed', 'contract_negotiating', 'proposal_update',
        'new_message', 'feedback_received',
        'shipping_address_saved', 'shipping_started', 'delivery_confirmed',
        'content_submission', 'content_revision', 'content_approved', 'content_final_uploaded', 'content_clean_uploaded',
        'performance_submitted'
    ],

    // 4. Financial (정산 및 결제) -> 수익금/예치금 탭으로
    FINANCIAL_CREATOR: ['collaboration_complete', 'collaboration_final_complete', 'settlement_paid'],
    FINANCIAL_BRAND: ['payment_pending', 'deposit_confirmed', 'payment_confirmed']
}

export function useNotificationRouter() {
    const router = useRouter()
    const { markAsRead, supabase, user } = useUnifiedProvider() as any

    const routeNotification = async (n: any) => {
        // 1. 읽음 처리 비동기 실행 (라우팅 블로킹 안 함)
        if (!n.is_read) {
            markAsRead(n.id).catch((e: any) => console.warn('markAsRead 실패 (무시):', e))
        }

        console.log('[useNotificationRouter] 알림 클릭:', { type: n.type, reference_id: n.reference_id, user_role: user?.role, action_url: n.action_url })

        // 2. 명시적 액션 URL이 있으면 최우선 이동 (가장 최신 방식)
        if (n.action_url) {
            router.push(n.action_url)
            return
        }

        const type = n.type
        const ref = n.reference_id
        const role = user?.role || 'creator' // fallback
        const rolePrefix = `/${role}?view=`

        // team_invite는 수락 버튼으로만 처리 — 라우팅하지 않음
        if (type === 'team_invite') return

        // --- 그룹별 분기 처리 ---

        // 1️⃣ [브랜드 수신] 크리에이터 지원서 (캠페인/제품) -> 캠페인/제품 관리 페이지
        if (NOTIFICATION_GROUPS.INBOUND_APPLICATIONS.includes(type) && role === 'brand') {
            if (ref) {
                // 과거 알림 지원: DB에서 역순으로 캠페인/제품 정보 조회
                try {
                    // 캠페인 지원서인지 먼저 확인
                    const { data: campData } = await supabase.from('campaign_applications').select('campaign_id').eq('id', ref).maybeSingle()
                    if (campData?.campaign_id) {
                        router.push(`/brand?view=my-campaigns&campaignId=${campData.campaign_id}`)
                        return
                    }
                } catch (e) { console.warn(e) }
            }
            // 폴백: 들어온 제안 일반 탭
            router.push(`/brand?view=proposals&workspaceTab=inbound${ref ? '&proposalId=' + ref : ''}`)
            return
        }

        // 2️⃣ [공통 수신] 1:1 선제안 수신 -> 받은 제안(Inbound)으로 이동 (상세 뷰어 모달 오픈 목적)
        if (NOTIFICATION_GROUPS.INBOUND_PROPOSALS.includes(type)) {
            router.push(`${rolePrefix}proposals&workspaceTab=inbound${ref ? '&proposalId=' + ref : ''}`)
            return
        }

        // 3️⃣ [공통 수신] 제안 거절 -> 보낸 제안(Outbound) 기록으로 이동
        if (NOTIFICATION_GROUPS.REJECTED.includes(type)) {
            // 거절 당한 주체 기준이므로, 크리에이터면 보낸제안, 브랜드면 브랜드 인바운드로(선제안 거절시)
            const tab = role === 'creator' ? 'outbound' : 'inbound'
            router.push(`${rolePrefix}proposals&workspaceTab=${tab}${ref ? '&proposalId=' + ref : ''}`)
            return
        }

        // 4️⃣ [공통 수신] 협업 진행 중 (Active Workspace)
        if (NOTIFICATION_GROUPS.ACTIVE_WORKSPACE.includes(type)) {
            router.push(`${rolePrefix}proposals&workspaceTab=active${ref ? '&proposalId=' + ref : ''}`)
            return
        }

        // 5️⃣ [역할별 수신] 금전/정산 관련 알림
        if (NOTIFICATION_GROUPS.FINANCIAL_CREATOR.includes(type) && role === 'creator') {
            router.push(`/creator?view=earnings${ref ? '&proposalId=' + ref : ''}`)
            return
        }
        if (NOTIFICATION_GROUPS.FINANCIAL_BRAND.includes(type) && role === 'brand') {
            router.push('/brand?view=deposit')
            return
        }

        // 6️⃣ 그 외 모든 알림 -> 기본 제안 워크스페이스
        router.push(`${rolePrefix}proposals`)
    }

    return { routeNotification }
}
