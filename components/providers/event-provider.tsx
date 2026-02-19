"use client"

import React, { createContext, useContext, useEffect } from "react"
import { useUserEvents, usePublicEvents, eventMutations } from "@/lib/hooks/use-events-swr"
import { useAuth } from "./auth-provider"
import { mutate } from 'swr'
import { SWR_KEYS } from '@/lib/swr-config'
import type { InfluencerEvent } from "@/lib/types"

interface EventContextType {
    events: InfluencerEvent[]
    allEvents: InfluencerEvent[]
    isLoading: boolean
    addEvent: (event: Omit<InfluencerEvent, "id" | "influencer" | "creator" | "handle" | "avatar" | "verified" | "followers">) => Promise<boolean>
    updateEvent: (id: string, updates: Partial<InfluencerEvent>) => Promise<boolean>
    deleteEvent: (id: string) => Promise<boolean>
    refreshEvents: (userId?: string) => Promise<void>
    fetchAllEvents: () => Promise<void>
}

const EventContext = createContext<EventContextType | undefined>(undefined)

export function EventProvider({ children, userId, teamId, isProxyMode = false, userType, publicEventsEnabled = false }: {
    children: React.ReactNode,
    userId?: string,
    teamId?: string,
    isProxyMode?: boolean,
    userType?: string,
    publicEventsEnabled?: boolean  // true일 때만 public events 쿼리 실행
}) {
    const { supabase } = useAuth()

    // Determine fetch mode:
    // - isProxyMode === true: MCN Proxy acting as Creator -> 'user' mode (fetch by influencer_id)
    // - userType === 'influencer': Direct Creator login -> 'user' mode (fetch by influencer_id)
    // - Otherwise (MCN Manager, Brand): 'team' mode (fetch by team_id)
    // This ensures parity: Creators see their own data whether logged in directly or via MCN proxy
    const fetchMode = (isProxyMode || userType === 'influencer') ? 'user' : 'team'

    // Use SWR hooks for data fetching (Team-based or User-based)
    const { events: userEvents, isLoading: isUserLoading, revalidate: revalidateUser } = useUserEvents(teamId, userId, fetchMode)
    const { events: publicEvents, isLoading: isPublicLoading, revalidate: revalidatePublic } = usePublicEvents(publicEventsEnabled)

    const isLoading = isUserLoading || isPublicLoading

    // Log Event Loading
    useEffect(() => {
        if (isLoading) {
            window.dispatchEvent(new CustomEvent('app-log', { detail: { msg: '이벤트 데이터 불러오는 중...', type: 'loading' } }))
        } else if (userEvents || publicEvents) {
            window.dispatchEvent(new CustomEvent('app-log', { detail: { msg: `이벤트 로드 완료 (${userEvents?.length || 0}건)`, type: 'success' } }))
        }
    }, [isLoading])

    // Setup Realtime subscription for live updates
    useEffect(() => {

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
                    if (teamId) {
                        mutate(SWR_KEYS.EVENTS_USER(teamId))
                    } else if (userId) {
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
    }, [teamId, userId])

    // Wrapper functions to maintain API compatibility
    const addEvent = async (newEvent: Omit<InfluencerEvent, "id" | "influencer" | "creator" | "handle" | "avatar" | "verified" | "followers">): Promise<boolean> => {
        if (!teamId && !userId) {
            console.error('[EventProvider] Team ID or User ID required to create event')
            return false
        }
        // If teamId is missing, allow creating with just userId (team_id will be null)
        // If teamId is 'ALL' (MCN View), do not save 'ALL' to DB. Save as null (or let RLS handle it).
        // Ideally, we should fetch the creator's team_id, but for now, null is safer than invalid UUID.
        const effectiveTeamId = teamId === 'ALL' ? undefined : teamId

        return eventMutations.addEvent(effectiveTeamId, userId!, newEvent)
    }

    const updateEvent = async (id: string, updates: Partial<InfluencerEvent>): Promise<boolean> => {
        if (!teamId && !userId) {
            console.error('[EventProvider] Team ID or User ID required to update event')
            return false
        }
        const effectiveTeamId = teamId === 'ALL' ? undefined : teamId
        return eventMutations.updateEvent(effectiveTeamId, userId, id, updates)
    }

    const deleteEvent = async (id: string): Promise<boolean> => {
        if (!teamId && !userId) {
            console.error('[EventProvider] Team ID or User ID required to delete event')
            return false
        }
        const effectiveTeamId = teamId === 'ALL' ? undefined : teamId
        return eventMutations.deleteEvent(effectiveTeamId, userId, id)
    }

    const refreshEvents = async (targetUserId?: string) => {
        if (teamId || userId) {
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
