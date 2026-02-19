import useSWR, { mutate } from 'swr'
import { createClient } from '@/lib/supabase/client'
import { SWR_KEYS } from '@/lib/swr-config'
import type { InfluencerEvent } from '@/lib/types'

const supabase = createClient()

/**
 * Helper to map DB result to InfluencerEvent
 */
const mapEvents = (data: any[]): InfluencerEvent[] => {
    return data.map((e: any) => {
        const profile = e.profiles || {}

        return {
            id: e.id,
            influencer: profile.display_name || 'Creator',
            influencerId: e.influencer_id,
            handle: profile.instagram_handle || profile.handle || '@creator',
            avatar: profile.avatar_url || '',
            priceVideo: profile.price_video || 0,
            event: e.title,
            date: e.event_date || new Date(e.created_at).toISOString().split('T')[0],
            description: e.description || '',
            tags: e.tags || [],
            verified: profile.role === 'creator',
            followers: profile.followers_count || 0,
            category: e.category || '',
            targetProduct: e.target_product || '',
            eventDate: e.event_date || '',
            postingDate: e.posting_date,
            guide: e.guide,
            status: e.status || 'active',
            isPrivate: e.is_private || false,
            dateFlexible: e.date_flexible || false,
            schedule: e.schedule,
            isMock: false,
            createdAt: e.created_at
        }
    })
}

/**
 * Fetcher for user-specific events (Team-based or User-based)
 */
/**
 * Fetcher for user-specific events (Team-based or User-based)
 */
async function fetchUserEvents(teamId?: string, userId?: string, fetchMode: 'team' | 'user' = 'team'): Promise<InfluencerEvent[]> {
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
        query = query.eq('influencer_id', userId)
    }
    // [Team Support] Filter by Team ID if present (Default MCN View)
    else if (teamId) {
        query = query.eq('team_id', teamId)
    }
    // [Fallback] Filter by User ID
    else if (userId) {
        query = query.eq('influencer_id', userId)
    }
    else {
        // No context provided, return empty
        return []
    }

    const { data, error } = await query

    if (error) {
        // Ignore AbortError (Request Cancelled)
        if (
            error.name === 'AbortError' ||
            error.message?.includes('AbortError') ||
            error.code === '20' ||
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

    const mapped = mapEvents(data || [])
    console.log('[useEvents] Loaded user events:', mapped.length)
    return mapped
}

/**
 * Fetcher for all public events
 */
async function fetchPublicEvents(): Promise<InfluencerEvent[]> {
    console.log('[useEvents] Fetching ALL public events...')

    const { data, error } = await supabase
        .from('life_moments')
        .select(`
      *,
      profiles(*)
    `)
        .eq('is_private', false)
        .order('created_at', { ascending: false })

    if (error) {
        // Ignore AbortError (Request Cancelled)
        if (
            error.name === 'AbortError' ||
            error.message?.includes('AbortError') ||
            error.code === '20' ||
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

    const mapped = mapEvents(data || [])
    console.log('[useEvents] Loaded ALL public events:', mapped.length)
    return mapped
}

/**
 * Custom hook for user-specific events with SWR (Team-based or User-based)
 */
export function useUserEvents(teamId?: string, userId?: string, fetchMode: 'team' | 'user' = 'team') {
    // Determine key based on context (Team > User) AND Mode
    const keyId = teamId || userId
    // Include fetchMode in SWR key to separate cache
    const swrKey = keyId ? [SWR_KEYS.EVENTS_USER(keyId), fetchMode] : null

    const { data, error, isLoading, mutate: revalidate } = useSWR(
        swrKey,
        () => fetchUserEvents(teamId, userId, fetchMode),
        {
            revalidateOnFocus: true,
            revalidateOnReconnect: true,
            dedupingInterval: 2000,
        }
    )

    return {
        events: data || [],
        error,
        isLoading,
        revalidate,
    }
}

/**
 * Custom hook for all public events with SWR
 */
export function usePublicEvents() {
    const { data, error, isLoading, mutate: revalidate } = useSWR(
        SWR_KEYS.EVENTS_PUBLIC,
        fetchPublicEvents,
        {
            revalidateOnFocus: true,
            revalidateOnReconnect: true,
            dedupingInterval: 5000, // Longer dedup for public data
        }
    )

    return {
        events: data || [],
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
    async addEvent(
        teamId: string | undefined, // Team can be undefined now
        userId: string,             // User ID is mandatory for ownership (default)
        newEvent: Omit<InfluencerEvent, "id" | "influencer" | "creator" | "handle" | "avatar" | "verified" | "followers">
    ): Promise<boolean> {
        try {
            console.log('[eventMutations] Creating event. Team:', teamId, 'User:', userId, 'Target:', newEvent.influencerId)

            if (!teamId && !userId) {
                console.error('[eventMutations] Cannot create event: No context (Team or User) provided')
                return false
            }

            const { data, error } = await supabase
                .from('life_moments')
                .insert({
                    team_id: teamId || null,        // Allow null team_id
                    influencer_id: newEvent.influencerId || userId,          // Allow override with specific influencerId
                    title: newEvent.event,
                    description: newEvent.description,
                    tags: newEvent.tags,
                    target_product: newEvent.targetProduct,
                    event_date: newEvent.eventDate,
                    posting_date: newEvent.postingDate,
                    category: newEvent.category,
                    guide: newEvent.guide,
                    date_flexible: newEvent.dateFlexible || false,
                    status: newEvent.status || 'recruiting',
                    is_private: newEvent.isPrivate || false,
                    schedule: newEvent.schedule,
                    channels: newEvent.channels || []
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
    async updateEvent(
        teamId: string | undefined,
        userId: string | undefined, // Needed for cache invalidation fallback
        id: string,
        updates: Partial<InfluencerEvent>
    ): Promise<boolean> {
        try {
            console.log('[eventMutations] Updating event:', id, updates)

            const dbUpdates: any = {}
            if (updates.event) dbUpdates.title = updates.event
            if (updates.description !== undefined) dbUpdates.description = updates.description
            if (updates.tags) dbUpdates.tags = updates.tags
            if (updates.targetProduct !== undefined) dbUpdates.target_product = updates.targetProduct
            if (updates.eventDate !== undefined) dbUpdates.event_date = updates.eventDate
            if (updates.postingDate !== undefined) dbUpdates.posting_date = updates.postingDate
            if (updates.dateFlexible !== undefined) dbUpdates.date_flexible = updates.dateFlexible
            if (updates.guide !== undefined) dbUpdates.guide = updates.guide
            if (updates.category !== undefined) dbUpdates.category = updates.category
            if (updates.status) dbUpdates.status = updates.status
            if (updates.isPrivate !== undefined) dbUpdates.is_private = updates.isPrivate
            if (updates.schedule) dbUpdates.schedule = updates.schedule
            if (updates.channels !== undefined) dbUpdates.channels = updates.channels

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
    async deleteEvent(
        teamId: string | undefined,
        userId: string | undefined,
        id: string
    ): Promise<boolean> {
        try {
            console.log('[eventMutations] Deleting event:', id)

            // [FIX] Manually cascade delete moment_proposals
            // life_moments has foreign keys from moment_proposals without ON DELETE CASCADE
            const { error: proposalError } = await supabase
                .from('moment_proposals')
                .delete()
                .eq('moment_id', id)

            if (proposalError) {
                console.error('[eventMutations] Failed to delete associated proposals:', proposalError)
                return false
            }

            const { error } = await supabase
                .from('life_moments')
                .delete()
                .eq('id', id)

            if (error) {
                console.error('[eventMutations] Delete error:', error)
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
            console.error('[eventMutations] Delete error:', error)
            return false
        }
    },
}
