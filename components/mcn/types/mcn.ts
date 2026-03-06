// ─── Creator Status & Summary ──────────────────────────────────────────────────
export type CreatorStatus = 'urgent' | 'active' | 'idle' | 'normal'

export function getCreatorStatus(c: CreatorSummary): CreatorStatus {
    const totalPending = c.pending_product_applications + c.pending_moment_proposals
    const totalActive = c.active_product_applications + c.active_moment_proposals + c.active_campaign_applications
    const hasAnyActivity = c.total_moments > 0 || c.total_product_applications > 0 ||
        c.total_moment_proposals > 0 || c.total_campaign_applications > 0
    if (totalPending > 0) return 'urgent'
    if (totalActive > 0) return 'active'
    if (!hasAnyActivity) return 'idle'
    return 'normal'
}

export interface AggregateStats {
    totalMembers: number
    pendingProposals: number
    activeCollabs: number
    totalRevenue: number
}

export interface CreatorSummary {
    user_id: string
    display_name: string
    avatar_url: string | null
    instagram_handle: string | null
    followers_count: number
    tier: string | null
    tags: string[] | null
    price_video: number
    price_feed: number
    total_moments: number
    active_moments: number
    total_product_applications: number
    pending_product_applications: number
    active_product_applications: number
    product_revenue: number
    total_moment_proposals: number
    pending_moment_proposals: number
    active_moment_proposals: number
    moment_revenue: number
    total_campaign_applications: number
    pending_campaign_applications: number
    active_campaign_applications: number
}

export type FilterStatus = 'all' | 'urgent' | 'active' | 'idle'
export type SortOrder = 'urgent' | 'revenue' | 'followers' | 'moments' | 'name'
export type ViewMode = 'grid' | 'table'
export type PriceRange = 'all' | 'under30' | '30to100' | 'over100'

export const PRICE_RANGE_LABELS: Record<PriceRange, string> = {
    all: '단가 전체',
    under30: '30만 미만',
    '30to100': '30~100만',
    over100: '100만 이상',
}

export const FILTER_CHIPS: { value: FilterStatus; label: string; color: string }[] = [
    { value: 'all', label: '전체', color: 'default' },
    { value: 'urgent', label: '🔴 긴급', color: 'urgent' },
    { value: 'active', label: '🟢 협업 중', color: 'active' },
    { value: 'idle', label: '⚪ 비활성', color: 'idle' },
]

export const STATUS_CHIPS: { value: FilterStatus; label: string }[] = [
    { value: 'all', label: '전체' },
    { value: 'urgent', label: '🔴 긴급' },
    { value: 'active', label: '🟢 협업중' },
    { value: 'idle', label: '⚪ 비활성' },
]

// ─── Team Proposal ─────────────────────────────────────────────────────────────
export interface TeamProposal {
    id: string
    proposal_type: 'product_application' | 'moment_proposal' | 'campaign_application'
    status: string
    product_name: string
    price_offer: number | null
    message: string | null
    created_at: string
    creator_id: string
    creator_name: string
    creator_avatar: string | null
    brand_name: string
    brand_avatar: string | null
    content_type?: string | null
    brand_condition_confirmed?: boolean | null
    creator_condition_confirmed?: boolean | null
    contract_status?: string | null
    delivery_status?: string | null
}
