"use client"

import React, { createContext, useContext, useEffect } from "react"
import { useUserEvents, usePublicEvents, eventMutations } from "@/lib/hooks/use-events-swr"
import { createClient } from "@/lib/supabase/client"
import { mutate } from 'swr'
import { SWR_KEYS } from '@/lib/swr-config'
import type { InfluencerEvent } from "@/lib/types"

interface EventContextType {
    events: InfluencerEvent[]
    allEvents: InfluencerEvent[]
    isLoading: boolean
    addEvent: (event: Omit<InfluencerEvent, "id" | "influencer" | "handle" | "avatar" | "verified" | "followers">) => Promise<boolean>
    updateEvent: (id: string, updates: Partial<InfluencerEvent>) => Promise<boolean>
    deleteEvent: (id: string) => Promise<boolean>
    refreshEvents: (userId?: string) => Promise<void>
    fetchAllEvents: () => Promise<void>
}

const EventContext = createContext<EventContextType | undefined>(undefined)

export function EventProvider({ children, userId }: { children: React.ReactNode, userId?: string }) {
    // Use SWR hooks for data fetching
    const { events: userEvents, isLoading: isUserLoading, revalidate: revalidateUser } = useUserEvents(userId)
    const { events: publicEvents, isLoading: isPublicLoading, revalidate: revalidatePublic } = usePublicEvents()

    const isLoading = isUserLoading || isPublicLoading

    // Setup Realtime subscription for live updates
    useEffect(() => {
        const supabase = createClient()

        console.log('[EventProvider] Setting up Realtime subscription')

        const channel = supabase
            .channel('life_moments_changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'life_moments'
                },
                (payload) => {
                    console.log('[EventProvider] Realtime update:', payload)

                    // Revalidate all event caches
                    if (userId) {
                        mutate(SWR_KEYS.EVENTS_USER(userId))
                    }
                    mutate(SWR_KEYS.EVENTS_PUBLIC)
                }
            )
            .subscribe()

        return () => {
            console.log('[EventProvider] Cleaning up Realtime subscription')
            supabase.removeChannel(channel)
        }
    }, [userId])

    // Wrapper functions to maintain API compatibility
    const addEvent = async (newEvent: Omit<InfluencerEvent, "id" | "influencer" | "handle" | "avatar" | "verified" | "followers">): Promise<boolean> => {
        if (!userId) {
            console.error('[EventProvider] User ID required to create event')
            return false
        }
        return eventMutations.addEvent(userId, newEvent)
    }

    const updateEvent = async (id: string, updates: Partial<InfluencerEvent>): Promise<boolean> => {
        if (!userId) {
            console.error('[EventProvider] User ID required to update event')
            return false
        }
        return eventMutations.updateEvent(userId, id, updates)
    }

    const deleteEvent = async (id: string): Promise<boolean> => {
        if (!userId) {
            console.error('[EventProvider] User ID required to delete event')
            return false
        }
        return eventMutations.deleteEvent(userId, id)
    }

    const refreshEvents = async (targetUserId?: string) => {
        const id = targetUserId || userId
        if (id) {
            await revalidateUser()
        }
    }

    const fetchAllEvents = async () => {
        await revalidatePublic()
    }

    return (
        <EventContext.Provider value={{
            events: userEvents,
            allEvents: publicEvents,
            isLoading,
            addEvent,
            updateEvent,
            deleteEvent,
            refreshEvents,
            fetchAllEvents
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
