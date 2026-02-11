"use client"

import React, { createContext, useContext, useState, useEffect, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import type { InfluencerEvent } from "@/lib/types"

interface EventContextType {
    events: InfluencerEvent[]
    isLoading: boolean
    addEvent: (event: Omit<InfluencerEvent, "id" | "influencer" | "handle" | "avatar" | "verified" | "followers">) => Promise<void>
    updateEvent: (id: string, updates: Partial<InfluencerEvent>) => Promise<void>
    deleteEvent: (id: string) => Promise<void>
    refreshEvents: (userId?: string) => Promise<void>
}

const EventContext = createContext<EventContextType | undefined>(undefined)

export function EventProvider({ children, userId }: { children: React.ReactNode, userId?: string }) {
    const [supabase] = useState(() => createClient())
    const [events, setEvents] = useState<InfluencerEvent[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const isFetching = useRef(false)

    // Fetch events from database
    const fetchEvents = async (targetUserId?: string) => {
        if (isFetching.current) return
        if (!targetUserId && !userId) return

        isFetching.current = true
        setIsLoading(true)

        try {
            const id = targetUserId || userId
            console.log('[EventProvider] Fetching events for user:', id)

            const { data, error } = await supabase
                .from('moments')
                .select(`
                    *,
                    profiles(display_name, avatar_url, role),
                    influencer_details(instagram_handle, followers_count)
                `)
                .eq('influencer_id', id)
                .order('created_at', { ascending: false })

            if (error) {
                console.error('[EventProvider] Fetch error:', error)
                return
            }

            if (data) {
                const mapped: InfluencerEvent[] = data.map((e: any) => {
                    const details = Array.isArray(e.influencer_details)
                        ? e.influencer_details[0]
                        : e.influencer_details

                    return {
                        id: e.id,
                        influencer: e.profiles?.display_name || 'Creator',
                        influencerId: e.influencer_id,
                        handle: details?.instagram_handle || '@creator',
                        avatar: e.profiles?.avatar_url || '',
                        priceVideo: e.price_video,
                        category: e.category,
                        event: e.title,
                        date: new Date(e.created_at).toISOString().split('T')[0],
                        description: e.description || '',
                        tags: e.tags || [],
                        verified: e.profiles?.role === 'influencer',
                        followers: details?.followers_count || 0,
                        targetProduct: e.target_product || '',
                        eventDate: e.event_date || '',
                        postingDate: e.posting_date,
                        guide: e.guide,
                        status: e.status || 'active',
                        isPrivate: e.is_private || false,
                        dateFlexible: e.date_flexible || false,
                        schedule: e.schedule,
                        isMock: false
                    }
                })

                setEvents(mapped)
                console.log('[EventProvider] Loaded events:', mapped.length)
            }
        } catch (err) {
            console.error('[EventProvider] Exception:', err)
        } finally {
            isFetching.current = false
            setIsLoading(false)
        }
    }

    // Fetch on mount and when userId changes
    useEffect(() => {
        if (userId) {
            fetchEvents(userId)
        }
    }, [userId])

    // Add event
    const addEvent = async (newEvent: Omit<InfluencerEvent, "id" | "influencer" | "handle" | "avatar" | "verified" | "followers">) => {
        if (!userId) {
            throw new Error('User ID required to create event')
        }

        try {
            console.log('[EventProvider] Creating event:', newEvent)

            const { data, error } = await supabase
                .from('moments')
                .insert({
                    influencer_id: userId,
                    category: newEvent.category,
                    title: newEvent.event,
                    description: newEvent.description,
                    tags: newEvent.tags,
                    target_product: newEvent.targetProduct,
                    event_date: newEvent.eventDate,
                    posting_date: newEvent.postingDate,
                    guide: newEvent.guide,
                    status: newEvent.status || 'recruiting',
                    is_private: newEvent.isPrivate || false,
                    date_flexible: newEvent.dateFlexible || false,
                    schedule: newEvent.schedule
                })
                .select()
                .single()

            if (error) {
                console.error('[EventProvider] Create error:', error)
                throw error
            }

            await fetchEvents(userId)
            console.log('[EventProvider] Event created successfully')
        } catch (error: any) {
            console.error('[EventProvider] Add error:', error)
            throw error
        }
    }

    // Update event
    const updateEvent = async (id: string, updates: Partial<InfluencerEvent>) => {
        try {
            console.log('[EventProvider] Updating event:', id, updates)

            const dbUpdates: any = {}
            if (updates.category) dbUpdates.category = updates.category
            if (updates.event) dbUpdates.title = updates.event
            if (updates.description) dbUpdates.description = updates.description
            if (updates.tags) dbUpdates.tags = updates.tags
            if (updates.targetProduct) dbUpdates.target_product = updates.targetProduct
            if (updates.eventDate) dbUpdates.event_date = updates.eventDate
            if (updates.postingDate) dbUpdates.posting_date = updates.postingDate
            if (updates.guide !== undefined) dbUpdates.guide = updates.guide
            if (updates.status) dbUpdates.status = updates.status
            if (updates.isPrivate !== undefined) dbUpdates.is_private = updates.isPrivate
            if (updates.dateFlexible !== undefined) dbUpdates.date_flexible = updates.dateFlexible
            if (updates.schedule) dbUpdates.schedule = updates.schedule

            const { error } = await supabase
                .from('moments')
                .update(dbUpdates)
                .eq('id', id)

            if (error) {
                console.error('[EventProvider] Update error:', error)
                throw error
            }

            // Update local state
            setEvents(prev => prev.map(e =>
                e.id === id ? { ...e, ...updates } : e
            ))
            console.log('[EventProvider] Event updated')
        } catch (error: any) {
            console.error('[EventProvider] Update error:', error)
            throw error
        }
    }

    // Delete event
    const deleteEvent = async (id: string) => {
        try {
            console.log('[EventProvider] Deleting event:', id)

            const { error } = await supabase
                .from('moments')
                .delete()
                .eq('id', id)

            if (error) {
                console.error('[EventProvider] Delete error:', error)
                throw error
            }

            // Remove from local state
            setEvents(prev => prev.filter(e => e.id !== id))
            console.log('[EventProvider] Event deleted')
        } catch (error: any) {
            console.error('[EventProvider] Delete error:', error)
            throw error
        }
    }

    return (
        <EventContext.Provider value={{
            events,
            isLoading,
            addEvent,
            updateEvent,
            deleteEvent,
            refreshEvents: fetchEvents
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
