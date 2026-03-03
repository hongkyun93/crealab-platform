import { createClient } from '@/lib/supabase/client'
import { SWR_KEYS } from '@/lib/swr-config'
import type { CreatorMoment } from '@/lib/types'
import useSWR, { mutate } from 'swr'

/**
 * Helper to map DB result to CreatorMoment
 */
const mapMoments = (data: any[]): CreatorMoment[] => {
    return data.map((e: any) => {
        const profile = e.profiles || {}
        const socialChannels: any[] = profile.social_channels || []
        const primaryChannel = socialChannels.find((c: any) => c.is_primary) || socialChannels[0] || null

        return {
            id: e.id,
            influencer: profile.display_name || 'Creator',
            creatorId: e.creator_id,
            handle: profile.instagram_handle || profile.handle || '@creator',
            avatar: profile.avatar_url || '',
            priceVideo: profile.price_video || undefined,
            priceFeed: profile.price_feed || undefined,
            usageRightsPrice: profile.usage_rights_price || undefined,
            usageRightsMonth: profile.usage_rights_month || undefined,
            autoDmPrice: profile.auto_dm_price || undefined,
            autoDmMonth: profile.auto_dm_month || undefined,
            title: e.title,
            date: e.moment_start_date || new Date(e.created_at).toISOString().split('T')[0],
            description: e.description || '',
            tags: e.tags || [],
            verified: socialChannels.some((c: any) => (c.channel_type || c.platform) === 'instagram'),
            followers: primaryChannel?.followers_count ?? profile.followers_count ?? 0,
            category: e.category || '',
            targetProduct: e.target_product || '',
            momentDate: e.moment_start_date || '',
            postingDate: e.posting_date_exact || '',
            guide: e.video_guide,
            status: e.status || 'active',
            isPrivate: e.is_private || false,
            dateFlexible: e.date_flexible || false,
            schedule: e.schedule,
            channels: e.channels || [],
            socialChannels: socialChannels.map((c: any) => ({
                platform: c.channel_type || c.platform || '',
                handle: c.handle || '',
                followersCount: c.followers_count || 0,
            })),
            isMock: false,
            createdAt: e.created_at,
            primaryChannel: primaryChannel ? {
                platform: primaryChannel.channel_type || primaryChannel.platform || '',
                followersCount: primaryChannel.followers_count || 0,
                handle: primaryChannel.handle || ''
            } : null,
            // Exact dates (private — creator/MCN only)
            momentStartDate: e.moment_start_date || null,
            momentEndDate: e.moment_end_date || null,
            postingDateExact: e.condition_upload_date || null,
        }
    })
}

/**
 * Fetcher for user-specific events (Team-based or User-based)
 */
/**
 * Fetcher for user-specific events (Team-based or User-based)
 */
async function fetchUserMoments(teamId?: string, userId?: string, fetchMode: 'team' | 'user' = 'team'): Promise<CreatorMoment[]> {
    const supabase = createClient()
    console.log('[useEvents] Fetching events. Team:', teamId, 'User:', userId, 'Mode:', fetchMode)

    let query = supabase
        .from('life_moments')
        .select(`
      *,
      profiles(*)
    `)
        .order('created_at', { ascending: false })

    // [MCN Support] If teamId is 'ALL', fetch all accessible events (RLS handles security)
    if (teamId === 'ALL') {
        // No filter, rely on RLS
    }
    // [Creator/Proxy Support] If mode is 'user', Strictly filter by User ID (Own Data)
    // This allows creators/proxies to see "My Moments" regardless of which team "owns" them (or if team_id is null)
    else if (fetchMode === 'user' && userId) {
        query = query.eq('creator_id', userId)
    }
    // [Team Support] Filter by Team ID if present (Default MCN View)
    else if (teamId) {
        query = query.eq('team_id', teamId)
    }
    // [Fallback] Filter by User ID
    else if (userId) {
        query = query.eq('creator_id', userId)
    }
    else {
        // No context provided, return empty
        return []
    }

    const { data, error } = await query

    if (error) {
        // Ignore transient network/abort errors (not actionable)
        if (
            error.name === 'AbortError' ||
            error.message?.includes('AbortError') ||
            error.code === '20' ||
            error.message?.includes('Failed to fetch') ||
            error.message?.includes('NetworkError') ||
            error.message?.includes('Load failed') ||
            // Ignore empty error objects (often cancellation artifacts)
            (Object.keys(error).length === 0 && !error.message)
        ) {
            return []
        }

        console.error('[useEvents] Fetch error:', error.message || error)

        // Handle known error codes gracefully
        if (error.code === '42P01') {
            console.warn('[useEvents] The "life_moments" table is missing - returning empty array')
            return []
        }
        if (error.code === '42501') {
            console.warn('[useEvents] Permission denied - returning empty array')
            return []
        }

        // For unexpected errors, still return empty but log full details
        console.error('[useEvents] Unexpected error:', { code: error.code, details: error.details, raw: error })
        return []
    }

    const mapped = mapMoments(data || [])
    console.log('[useEvents] Loaded user events:', mapped.length)
    return mapped
}

/**
 * Fetcher for all public events
 */
async function fetchPublicMoments(): Promise<CreatorMoment[]> {
    const supabase = createClient()
    console.log('[useEvents] Fetching ALL public events...')

    const { data, error } = await supabase
        .from('life_moments')
        .select(`
      *,
      profiles(
        *,
        social_channels(*)
      )
    `)
        .eq('is_private', false)
        .order('created_at', { ascending: false })
        .limit(100)

    if (error) {
        // Ignore transient network/abort errors (not actionable)
        if (
            error.name === 'AbortError' ||
            error.message?.includes('AbortError') ||
            error.code === '20' ||
            error.message?.includes('Failed to fetch') ||
            error.message?.includes('NetworkError') ||
            error.message?.includes('Load failed') ||
            // Ignore empty error objects (often cancellation artifacts)
            (Object.keys(error).length === 0 && !error.message)
        ) {
            return []
        }

        console.error('[useEvents] Fetch All error:', error.message || error)

        // Handle known error codes gracefully
        if (error.code === '42P01') {
            console.warn('[useEvents] The "life_moments" table is missing - returning empty array')
            return []
        }
        if (error.code === '42501') {
            console.warn('[useEvents] Permission denied - returning empty array')
            return []
        }

        // For unexpected errors, still return empty but log full details
        console.error('[useEvents] Unexpected error:', { code: error.code, details: error.details, raw: error })
        return []
    }

    const mapped = mapMoments(data || [])
    console.log('[useEvents] Loaded ALL public events:', mapped.length)
    return mapped
}

/**
 * Custom hook for user-specific events with SWR (Team-based or User-based)
 */
export function useUserMoments(teamId?: string, userId?: string, fetchMode: 'team' | 'user' = 'team') {
    // Determine key based on context (Team > User) AND Mode
    const keyId = teamId || userId
    // Include fetchMode in SWR key to separate cache
    const swrKey = keyId ? [SWR_KEYS.EVENTS_USER(keyId), fetchMode] : null

    const { data, error, isLoading, mutate: revalidate } = useSWR(
        swrKey,
        () => fetchUserMoments(teamId, userId, fetchMode),
        {
            revalidateOnFocus: true,
            revalidateOnReconnect: true,
            dedupingInterval: 2000,
        }
    )

    return {
        moments: data || [],
        error,
        isLoading,
        revalidate,
    }
}

/**
 * Custom hook for all public events with SWR
 * enabled=false일 때 fetch를 완전히 비활성화 (SWR conditional fetching)
 */
export function usePublicMoments(enabled: boolean = false) {
    const { data, error, isLoading, mutate: revalidate } = useSWR(
        enabled ? SWR_KEYS.EVENTS_PUBLIC : null,  // null key = no fetch
        fetchPublicMoments,
        {
            revalidateOnFocus: false,  // public 데이터는 focus 시 재조회 불필요
            revalidateOnReconnect: true,
            dedupingInterval: 30000, // 30초 dedup (public 데이터는 자주 변하지 않음)
        }
    )

    return {
        moments: data || [],
        error,
        isLoading,
        revalidate,
    }
}


/**
 * Mutation functions for events
 */
export const eventMutations = {
    /**
     * Add a new event (Team-based or User-based)
     */
    async addMoment(
        teamId: string | undefined, // Team can be undefined now
        userId: string,             // User ID is mandatory for ownership (default)
        newEvent: Omit<CreatorMoment, "id" | "influencer" | "creator" | "handle" | "avatar" | "verified" | "followers" | "date" | "momentDate" | "postingDate">
    ): Promise<boolean> {
        try {
            const supabase = createClient()
            console.log('[eventMutations] Creating event. Team:', teamId, 'User:', userId, 'Target:', newEvent.creatorId)

            if (!teamId && !userId) {
                console.error('[eventMutations] Cannot create event: No context (Team or User) provided')
                return false
            }

            const { data, error } = await supabase
                .from('life_moments')
                .insert({
                    team_id: teamId || null,        // Allow null team_id
                    creator_id: newEvent.creatorId || userId,          // Allow override with specific creatorId
                    title: newEvent.title,
                    description: newEvent.description,
                    tags: newEvent.tags,
                    target_product: newEvent.targetProduct,
                    category: newEvent.category,
                    guide: newEvent.guide,
                    date_flexible: newEvent.dateFlexible || false,
                    status: newEvent.status || 'recruiting',
                    is_private: newEvent.isPrivate || false,
                    schedule: newEvent.schedule,
                    channels: newEvent.channels || [],
                    // [UNIFIED] Renamed columns: posting_date_exact→condition_upload_date, guide→video_guide
                    moment_start_date: newEvent.momentStartDate || null,
                    moment_end_date: newEvent.momentEndDate || null,
                    condition_upload_date: newEvent.postingDateExact || null,
                    video_guide: newEvent.guide || null,
                })
                .select()
                .single()

            if (error) {
                console.error('[eventMutations] Create error raw:', error)
                console.error('[eventMutations] Create error json:', JSON.stringify(error))
                console.error('[eventMutations] Input data:', { teamId, userId, newEvent })
                return false
            }

            // Revalidate caches
            const cacheKeyId = teamId || userId
            if (cacheKeyId) {
                await mutate(SWR_KEYS.EVENTS_USER(cacheKeyId))
            }
            await mutate(SWR_KEYS.EVENTS_PUBLIC)

            console.log('[eventMutations] Event created successfully')
            return true
        } catch (error: any) {
            console.error('[eventMutations] Add error:', error)
            return false
        }
    },

    /**
     * Update an existing event (Team-based or User-based)
     */
    async updateMoment(
        teamId: string | undefined,
        userId: string | undefined, // Needed for cache invalidation fallback
        id: string,
        updates: Partial<Omit<CreatorMoment, "id" | "influencer" | "creator" | "handle" | "avatar" | "verified" | "followers" | "date" | "momentDate" | "postingDate">>
    ): Promise<boolean> {
        try {
            const supabase = createClient()
            console.log('[eventMutations] Updating event:', id)

            const dbUpdates: any = {}
            if (updates.title) dbUpdates.title = updates.title
            if (updates.description !== undefined) dbUpdates.description = updates.description
            if (updates.tags) dbUpdates.tags = updates.tags
            if (updates.targetProduct !== undefined) dbUpdates.target_product = updates.targetProduct
            if (updates.dateFlexible !== undefined) dbUpdates.date_flexible = updates.dateFlexible
            if (updates.guide !== undefined) dbUpdates.video_guide = updates.guide
            if (updates.category !== undefined) dbUpdates.category = updates.category
            if (updates.status) dbUpdates.status = updates.status
            if (updates.isPrivate !== undefined) dbUpdates.is_private = updates.isPrivate
            if (updates.schedule) dbUpdates.schedule = updates.schedule
            if (updates.channels !== undefined) dbUpdates.channels = updates.channels
            // [UNIFIED] Renamed columns
            if (updates.momentStartDate !== undefined) dbUpdates.moment_start_date = updates.momentStartDate || null
            if (updates.momentEndDate !== undefined) dbUpdates.moment_end_date = updates.momentEndDate || null
            if (updates.postingDateExact !== undefined) dbUpdates.condition_upload_date = updates.postingDateExact || null

            const { error } = await supabase
                .from('life_moments')
                .update(dbUpdates)
                .eq('id', id)

            if (error) {
                console.error('[eventMutations] Update error:', error)
                return false
            }

            // Revalidate caches
            const cacheKeyId = teamId || userId
            if (cacheKeyId) {
                await mutate(SWR_KEYS.EVENTS_USER(cacheKeyId))
            }
            await mutate(SWR_KEYS.EVENTS_PUBLIC)

            return true
        } catch (error: any) {
            console.error('[eventMutations] Update error:', error)
            return false
        }
    },

    /**
     * Delete an event (Team-based or User-based)
     */
    async deleteMoment(
        teamId: string | undefined,
        userId: string | undefined,
        id: string
    ): Promise<boolean> {
        try {
            const supabase = createClient()
            console.log('[eventMutations] Deleting event:', id)

            // [FIX] Manually cascade delete moment_proposals
            // This may fail due to RLS (proposals made by brands, not the creator)
            // We make this non-blocking — the DB FK constraint or ON DELETE CASCADE should handle it
            const { error: proposalError } = await supabase
                .from('moment_proposals')
                .delete()
                .eq('moment_id', id)

            if (proposalError) {
                // Non-fatal: log warning but continue with moment deletion
                console.warn('[eventMutations] Warning: could not pre-delete proposals (RLS may restrict this):', proposalError.message)
            }

            const { error, data: deletedRows } = await supabase
                .from('life_moments')
                .delete()
                .eq('id', id)
                .select('id')

            if (error) {
                console.error('[eventMutations] Delete error:', error)
                throw new Error(error.message || '삭제에 실패했습니다.')
            }

            // If RLS silently blocks (0 rows deleted), also treat as failure
            if (!deletedRows || deletedRows.length === 0) {
                console.warn('[eventMutations] Delete returned 0 rows affected — likely RLS restriction')
                throw new Error('삭제 권한이 없거나, 이미 삭제된 모먼트입니다.')
            }

            // Revalidate caches
            const cacheKeyId = teamId || userId
            if (cacheKeyId) {
                await mutate(SWR_KEYS.EVENTS_USER(cacheKeyId))
            }
            await mutate(SWR_KEYS.EVENTS_PUBLIC)

            return true
        } catch (error: any) {
            console.error('[eventMutations] Delete error:', error)
            throw error  // Re-throw so callers can show toast
        }
    },
}
