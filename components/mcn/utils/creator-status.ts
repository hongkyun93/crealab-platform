import type {
    CreatorSummary, CreatorStatus,
    FilterStatus, SortOrder, PriceRange,
} from "../types/mcn"

// ─── Status 판단 ───────────────────────────────────────────────────────────────
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

// ─── Filter + Sort Pipeline ────────────────────────────────────────────────────
export interface FilterOptions {
    searchQuery: string
    filterStatus: FilterStatus
    priceRange: PriceRange
    tagFilter: string
    sortOrder: SortOrder
}

export function filterAndSortCreators(
    summaryData: CreatorSummary[],
    options: FilterOptions
): (CreatorSummary & { _status: CreatorStatus })[] {
    const { searchQuery, filterStatus, priceRange, tagFilter, sortOrder } = options
    let list = summaryData.map(c => ({ ...c, _status: getCreatorStatus(c) }))

    if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        list = list.filter(c =>
            c.display_name?.toLowerCase().includes(q) ||
            c.instagram_handle?.toLowerCase().includes(q) ||
            c.tags?.some(t => t.toLowerCase().includes(q))
        )
    }

    if (filterStatus !== 'all') {
        list = list.filter(c => c._status === filterStatus)
    }

    if (priceRange !== 'all') {
        list = list.filter(c => {
            const p = c.price_video
            if (priceRange === 'under30') return p < 300000
            if (priceRange === '30to100') return p >= 300000 && p < 1000000
            if (priceRange === 'over100') return p >= 1000000
            return true
        })
    }

    if (tagFilter !== 'all') {
        list = list.filter(c => c.tags?.includes(tagFilter))
    }

    const statusOrder: Record<CreatorStatus, number> = { urgent: 0, active: 1, normal: 2, idle: 3 }

    list.sort((a, b) => {
        if (sortOrder === 'urgent') {
            const diff = statusOrder[a._status] - statusOrder[b._status]
            if (diff !== 0) return diff
            const aPending = a.pending_product_applications + a.pending_moment_proposals
            const bPending = b.pending_product_applications + b.pending_moment_proposals
            return bPending - aPending
        }
        if (sortOrder === 'revenue') return (b.product_revenue + b.moment_revenue) - (a.product_revenue + a.moment_revenue)
        if (sortOrder === 'followers') return b.followers_count - a.followers_count
        if (sortOrder === 'moments') return b.total_moments - a.total_moments
        if (sortOrder === 'name') return (a.display_name || '').localeCompare(b.display_name || '', 'ko')
        return 0
    })

    return list
}
