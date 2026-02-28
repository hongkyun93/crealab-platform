import { createClient } from '@/lib/supabase/client'
import { SWR_KEYS } from '@/lib/swr-config'
import type { Campaign } from '@/lib/types'
import useSWR, { mutate } from 'swr'

/**
 * Maps a raw DB row to the Campaign type used by the rest of the app.
 */
function mapCampaign(c: any): Campaign {
    return {
        id: c.id,
        brandId: c.brand_id,
        brand: c.profiles?.display_name || 'Brand',
        brandAvatar: c.profiles?.avatar_url,
        product: c.product_name,
        category: c.category,
        budget: c.budget?.toString() || '0',
        target: c.target || '',
        description: c.description || '',
        image: c.image || c.image_url,
        date: new Date(c.created_at).toISOString().split('T')[0],
        eventDate: c.event_date,
        postingDate: c.posting_date,
        targetProduct: c.target_product,
        status: c.status || 'active',
        tags: c.tags || [],
        isMock: false,
        title: c.title,
        recruitment_count: c.recruitment_count,
        recruitment_deadline: c.recruitment_deadline,
        channels: c.channels || [],
        reference_link: c.reference_link,
        hashtags: c.hashtags || [],
        selection_announcement_date: c.selection_announcement_date,
        min_followers: c.min_followers,
        max_followers: c.max_followers,
        product_type: c.product_type || 'gift',
    }
}

/**
 * SWR fetcher for campaigns.
 * teamId === 'ALL' means no team filter (RLS handles visibility).
 */
async function fetchCampaigns(teamId?: string, userId?: string): Promise<Campaign[]> {
    const supabase = createClient()

    let query = supabase
        .from('campaigns')
        .select(`*, profiles(display_name, avatar_url)`)
        .order('created_at', { ascending: false })
        .limit(100)

    // Team-based filter — RLS handles creator visibility automatically
    if (teamId && teamId !== 'ALL') {
        query = query.eq('team_id', teamId)
    }

    const { data, error } = await query

    if (error) {
        if (
            error.name === 'AbortError' ||
            error.message?.includes('AbortError') ||
            error.message === 'Failed to fetch' ||
            error.message === 'Load failed'
        ) {
            return []
        }
        console.error('[useCampaignsSWR] Fetch error:', error)
        throw error
    }

    return (data ?? []).map(mapCampaign)
}

/**
 * useCampaignsSWR — SWR hook for campaign data.
 * Replaces the manual useState + fetchCampaigns pattern in CampaignProvider.
 */
export function useCampaignsSWR(userId?: string, teamId?: string) {
    const swrKey = userId || teamId
        ? [SWR_KEYS.CAMPAIGNS_USER(userId || teamId || ''), teamId, userId]
        : null

    const { data, error, isLoading } = useSWR(
        swrKey,
        () => fetchCampaigns(teamId, userId),
        {
            revalidateOnFocus: false,   // campaigns change rarely; avoid noisy re-fetches
            dedupingInterval: 10000,
        }
    )

    return {
        campaigns: data ?? [],
        isLoading,
        error,
    }
}

/**
 * Invalidate (refresh) the campaigns SWR cache for the given user/team.
 * Call this after create/update/delete mutations.
 */
export async function invalidateCampaignsCache(userId?: string, teamId?: string) {
    const key = [SWR_KEYS.CAMPAIGNS_USER(userId || teamId || ''), teamId, userId]
    await mutate(key)
}
