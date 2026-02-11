"use client"

import React, { createContext, useContext, useState, useEffect, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import type { InfluencerEvent } from "@/lib/types"

interface EventContextType {
    events: InfluencerEvent[]
    allEvents: InfluencerEvent[] // New: Store all public events
    isLoading: boolean
    addEvent: (event: Omit<InfluencerEvent, "id" | "influencer" | "handle" | "avatar" | "verified" | "followers">) => Promise<boolean>
    updateEvent: (id: string, updates: Partial<InfluencerEvent>) => Promise<boolean>
    deleteEvent: (id: string) => Promise<boolean>
    refreshEvents: (userId?: string) => Promise<void>
    fetchAllEvents: () => Promise<void> // New: Fetch all public events
}

const EventContext = createContext<EventContextType | undefined>(undefined)

export function EventProvider({ children, userId }: { children: React.ReactNode, userId?: string }) {
    const [supabase] = useState(() => createClient())
    const [events, setEvents] = useState<InfluencerEvent[]>([])
    const [allEvents, setAllEvents] = useState<InfluencerEvent[]>([])
    const [isUserEventsLoading, setIsUserEventsLoading] = useState(false) // Split state
    const [isAllEventsLoading, setIsAllEventsLoading] = useState(false) // Split state
    const isFetching = useRef(false)
    const isFetchingAll = useRef(false)

    const isLoading = isUserEventsLoading || isAllEventsLoading

    // Helper to map DB result to InfluencerEvent (Moved up for safety)
    const mapEvents = (data: any[]): InfluencerEvent[] => {
        return data.map((e: any) => ({
            id: e.id,
            influencer: e.profiles?.display_name || 'Creator',
            influencerId: e.influencer_id,
            handle: '@creator',
            avatar: e.profiles?.avatar_url || '',
            priceVideo: e.price_video,
            event: e.title,
            date: new Date(e.created_at).toISOString().split('T')[0],
            description: e.description || '',
            tags: e.tags || [],
            verified: e.profiles?.role === 'influencer',
            followers: 0,
            targetProduct: e.target_product || '',
            eventDate: e.event_date || '',
            postingDate: e.posting_date,
            guide: e.guide,
            status: e.status || 'active',
            isPrivate: e.is_private || false,
            schedule: e.schedule,
            isMock: false
        }))
    }

    // Fetch events from database (User specific)
    const fetchEvents = async (targetUserId?: string) => {
        if (isFetching.current) return
        // If no user, we can't fetch user-specific events
        if (!targetUserId && !userId) return

        isFetching.current = true
        setIsUserEventsLoading(true)

        try {
            const id = targetUserId || userId
            console.log('[EventProvider] Fetching events for user:', id)

            const { data, error } = await supabase
                .from('life_moments')
                .select(`
                    *,
                    profiles(display_name, avatar_url, role)
                `)
                .eq('influencer_id', id)
                .order('created_at', { ascending: false })

            if (error) {
                console.error('[EventProvider] Fetch error:', error)
                return
            }

            if (data) {
                const mapped = mapEvents(data)
                setEvents(mapped)
                console.log('[EventProvider] Loaded user events:', mapped.length)
            }
        } catch (err) {
            console.error('[EventProvider] Exception:', err)
        } finally {
            isFetching.current = false
            setIsUserEventsLoading(false)
        }
    }

    // New: Fetch ALL public events for discovery
    const fetchAllEvents = async () => {
        if (isFetchingAll.current) return
        isFetchingAll.current = true
        setIsAllEventsLoading(true)

        try {
            console.log('[EventProvider] Fetching ALL public events...')

            const { data, error } = await supabase
                .from('life_moments')
                .select(`
                    *,
                    profiles(display_name, avatar_url, role)
                `)
                .eq('is_private', false) // Only public moments
                .order('created_at', { ascending: false })

            if (error) {
                console.error('[EventProvider] Fetch All error:', error)
                return
            }

            if (data) {
                const mapped = mapEvents(data)
                setAllEvents(mapped)
                console.log('[EventProvider] Loaded ALL public events:', mapped.length)
            }
        } catch (err) {
            console.error('[EventProvider] Fetch All Exception:', err)
        } finally {
            isFetchingAll.current = false
            setIsAllEventsLoading(false)
        }
    }

    // Fetch on mount and when userId changes
    useEffect(() => {
        if (userId) {
            fetchEvents(userId)
        }
    }, [userId])

    // Add event
    const addEvent = async (newEvent: Omit<InfluencerEvent, "id" | "influencer" | "handle" | "avatar" | "verified" | "followers">): Promise<boolean> => {
        if (!userId) {
            console.error('[EventProvider] User ID required to create event')
            return false
        }

        try {
            console.log('[EventProvider] Creating event:', newEvent)

            const { data, error } = await supabase
                .from('life_moments')
                .insert({
                    influencer_id: userId,
                    title: newEvent.event,
                    description: newEvent.description,
                    tags: newEvent.tags,
                    target_product: newEvent.targetProduct,
                    posting_date: newEvent.postingDate,
                    status: newEvent.status || 'recruiting',
                    is_private: newEvent.isPrivate || false,
                    schedule: newEvent.schedule
                })
                .select()
                .single()

            if (error) {
                console.error('[EventProvider] Create error:', error)
                return false
            }

            // Parallel refresh
            await Promise.all([fetchEvents(userId), fetchAllEvents()])

            console.log('[EventProvider] Event created successfully')
            return true
        } catch (error: any) {
            console.error('[EventProvider] Add error:', error)
            return false
        }
    }

    // Update event
    const updateEvent = async (id: string, updates: Partial<InfluencerEvent>): Promise<boolean> => {
        try {
            console.log('[EventProvider] Updating event:', id, updates)

            const dbUpdates: any = {}
            if (updates.event) dbUpdates.title = updates.event
            if (updates.description !== undefined) dbUpdates.description = updates.description
            if (updates.tags) dbUpdates.tags = updates.tags
            if (updates.targetProduct !== undefined) dbUpdates.target_product = updates.targetProduct
            if (updates.postingDate !== undefined) dbUpdates.posting_date = updates.postingDate
            if (updates.status) dbUpdates.status = updates.status
            if (updates.isPrivate !== undefined) dbUpdates.is_private = updates.isPrivate
            if (updates.schedule) dbUpdates.schedule = updates.schedule

            const { error } = await supabase
                .from('life_moments')
                .update(dbUpdates)
                .eq('id', id)

            if (error) {
                console.error('[EventProvider] Update error:', error)
                return false
            }

            await fetchEvents(userId)
            await fetchAllEvents() // Refresh public list
            return true
        } catch (error: any) {
            console.error('[EventProvider] Update error:', error)
            return false
        }
    }

    // Delete event
    const deleteEvent = async (id: string): Promise<boolean> => {
        try {
            console.log('[EventProvider] Deleting event:', id)

            const { error } = await supabase
                .from('life_moments')
                .delete()
                .eq('id', id)

            if (error) {
                console.error('[EventProvider] Delete error:', error)
                return false
            }

            await fetchEvents(userId)
            await fetchAllEvents() // Refresh public list
            return true
        } catch (error: any) {
            console.error('[EventProvider] Delete error:', error)
            return false
        }
    }

    return (
        <EventContext.Provider value={{
            events,
            allEvents, // Export new state
            isLoading,
            addEvent,
            updateEvent,
            deleteEvent,
            refreshEvents: fetchEvents,
            fetchAllEvents // Export new function
        }}>
            {children}
        </EventContext.Provider>
    )
}

export function useEvents() {
    const context = useContext(EventContext)
    if (!context) {
        throw new Error('useEvents must be used within EventProvider')
    }
    return context
}
