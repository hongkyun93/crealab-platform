import useSWR, { mutate } from 'swr'
import { createClient } from '@/lib/supabase/client'
import { SWR_KEYS } from '@/lib/swr-config'
import type { InfluencerEvent } from '@/lib/types'

const supabase = createClient()

/**
 * Helper to map DB result to InfluencerEvent
 */
const mapEvents = (data: any[], detailsMap?: Map<string, any>): InfluencerEvent[] => {
    return data.map((e: any) => {
        const details = detailsMap?.get(e.influencer_id)

        return {
            id: e.id,
            influencer: e.profiles?.display_name || 'Creator',
            influencerId: e.influencer_id,
            handle: details?.instagram_handle || '@creator',
            avatar: e.profiles?.avatar_url || '',
            priceVideo: e.price_video,
            event: e.title,
            date: e.event_date || new Date(e.created_at).toISOString().split('T')[0],
            description: e.description || '',
            tags: e.tags || [],
            verified: e.profiles?.role === 'influencer',
            followers: details?.followers_count || 0,
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
 * Fetcher for user-specific events
 */
async function fetchUserEvents(userId: string): Promise<InfluencerEvent[]> {
    console.log('[useEvents] Fetching events for user:', userId)

    const { data, error } = await supabase
        .from('life_moments')
        .select(`
      *,
      profiles(display_name, avatar_url, role)
    `)
        .eq('influencer_id', userId)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('[useEvents] Fetch error:', error)
        console.error('[useEvents] Fetch error details:', {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code
        })
        throw error
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
      profiles(display_name, avatar_url, role)
    `)
        .eq('is_private', false)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('[useEvents] Fetch All error:', error)
        console.error('[useEvents] Fetch All error details:', {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code
        })
        throw error
    }

    // Fetch influencer_details separately
    const influencerIds = [...new Set(data.map((e: any) => e.influencer_id).filter(Boolean))]
    console.log('[useEvents] Fetching details for', influencerIds.length, 'influencers')

    const { data: detailsData, error: detailsError } = await supabase
        .from('influencer_details')
        .select('*')
        .in('id', influencerIds)

    if (detailsError) {
        console.error('[useEvents] Error fetching influencer_details:', detailsError)
    }

    // Create details map
    const detailsMap = new Map()
    if (detailsData) {
        detailsData.forEach((detail: any) => {
            detailsMap.set(detail.id, detail)
        })
        console.log('[useEvents] Loaded details for', detailsMap.size, 'influencers')
    }

    const mapped = mapEvents(data || [], detailsMap)
    console.log('[useEvents] Loaded ALL public events:', mapped.length)
    return mapped
}

/**
 * Custom hook for user-specific events with SWR
 */
export function useUserEvents(userId?: string) {
    const { data, error, isLoading, mutate: revalidate } = useSWR(
        userId ? SWR_KEYS.EVENTS_USER(userId) : null,
        () => fetchUserEvents(userId!),
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
     * Add a new event
     */
    async addEvent(
        userId: string,
        newEvent: Omit<InfluencerEvent, "id" | "influencer" | "handle" | "avatar" | "verified" | "followers">
    ): Promise<boolean> {
        try {
            console.log('[eventMutations] Creating event:', newEvent)

            const { data, error } = await supabase
                .from('life_moments')
                .insert({
                    influencer_id: userId,
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
                    schedule: newEvent.schedule
                })
                .select()
                .single()

            if (error) {
                console.error('[eventMutations] Create error:', error)
                return false
            }

            // Revalidate both user events and public events
            await Promise.all([
                mutate(SWR_KEYS.EVENTS_USER(userId)),
                mutate(SWR_KEYS.EVENTS_PUBLIC),
            ])

            console.log('[eventMutations] Event created successfully')
            return true
        } catch (error: any) {
            console.error('[eventMutations] Add error:', error)
            return false
        }
    },

    /**
     * Update an existing event
     */
    async updateEvent(
        userId: string,
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

            const { error } = await supabase
                .from('life_moments')
                .update(dbUpdates)
                .eq('id', id)

            if (error) {
                console.error('[eventMutations] Update error:', error)
                return false
            }

            // Revalidate caches
            await Promise.all([
                mutate(SWR_KEYS.EVENTS_USER(userId)),
                mutate(SWR_KEYS.EVENTS_PUBLIC),
            ])

            return true
        } catch (error: any) {
            console.error('[eventMutations] Update error:', error)
            return false
        }
    },

    /**
     * Delete an event
     */
    async deleteEvent(userId: string, id: string): Promise<boolean> {
        try {
            console.log('[eventMutations] Deleting event:', id)

            const { error } = await supabase
                .from('life_moments')
                .delete()
                .eq('id', id)

            if (error) {
                console.error('[eventMutations] Delete error:', error)
                return false
            }

            // Revalidate caches
            await Promise.all([
                mutate(SWR_KEYS.EVENTS_USER(userId)),
                mutate(SWR_KEYS.EVENTS_PUBLIC),
            ])

            return true
        } catch (error: any) {
            console.error('[eventMutations] Delete error:', error)
            return false
        }
    },
}
