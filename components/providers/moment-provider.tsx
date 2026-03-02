"use client"

import { eventMutations, usePublicMoments, useUserMoments } from "@/lib/hooks/use-moments-swr"
import { SWR_KEYS } from '@/lib/swr-config'
import type { CreatorMoment } from "@/lib/types"
import React, { createContext, useContext, useEffect } from "react"
import { mutate } from 'swr'
import { useAuth } from "./auth-provider"

interface EventContextType {
    moments: CreatorMoment[]
    allMoments: CreatorMoment[]
    isLoading: boolean
    addMoment: (event: Omit<CreatorMoment, "id" | "influencer" | "creator" | "handle" | "avatar" | "verified" | "followers">) => Promise<boolean>
    updateMoment: (id: string, updates: Partial<CreatorMoment>) => Promise<boolean>
    deleteMoment: (id: string) => Promise<boolean>
    refreshMoments: (userId?: string) => Promise<void>
    fetchAllMoments: () => Promise<void>
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
    // - isProxyMode === true: MCN Proxy acting as Creator -> 'user' mode (fetch by creator_id)
    // - userType === 'creator': Direct Creator login -> 'user' mode (fetch by creator_id)
    // - Otherwise (MCN Manager, Brand): 'team' mode (fetch by team_id)
    // This ensures parity: Creators see their own data whether logged in directly or via MCN proxy
    const fetchMode = (isProxyMode || userType === 'creator') ? 'user' : 'team'

    // Use SWR hooks for data fetching (Team-based or User-based)
    const { moments: userEvents, isLoading: isUserLoading, revalidate: revalidateUser } = useUserMoments(teamId, userId, fetchMode)
    const { moments: publicEvents, isLoading: isPublicLoading, revalidate: revalidatePublic } = usePublicMoments(publicEventsEnabled)

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
            supabase.removeChannel(channel)
        }
    }, [teamId, userId])

    // Wrapper functions to maintain API compatibility
    const addMoment = async (newEvent: Omit<CreatorMoment, "id" | "influencer" | "creator" | "handle" | "avatar" | "verified" | "followers">): Promise<boolean> => {
        if (!teamId && !userId) {
            console.error('[EventProvider] Team ID or User ID required to create event')
            return false
        }
        // If teamId is missing, allow creating with just userId (team_id will be null)
        // If teamId is 'ALL' (MCN View), do not save 'ALL' to DB. Save as null (or let RLS handle it).
        // Ideally, we should fetch the creator's team_id, but for now, null is safer than invalid UUID.
        const effectiveTeamId = teamId === 'ALL' ? undefined : teamId

        return eventMutations.addMoment(effectiveTeamId, userId!, newEvent)
    }

    const updateMoment = async (id: string, updates: Partial<CreatorMoment>): Promise<boolean> => {
        if (!teamId && !userId) {
            console.error('[EventProvider] Team ID or User ID required to update event')
            return false
        }
        const effectiveTeamId = teamId === 'ALL' ? undefined : teamId
        return eventMutations.updateMoment(effectiveTeamId, userId, id, updates)
    }

    const deleteMoment = async (id: string): Promise<boolean> => {
        if (!teamId && !userId) {
            console.error('[EventProvider] Team ID or User ID required to delete event')
            return false
        }
        const effectiveTeamId = teamId === 'ALL' ? undefined : teamId
        try {
            return await eventMutations.deleteMoment(effectiveTeamId, userId, id)
        } catch (error: any) {
            console.error('[EventProvider] Delete failed:', error)
            // Error will propagate to caller for toast display
            throw error
        }
    }

    const refreshMoments = async (targetUserId?: string) => {
        if (teamId || userId) {
            await revalidateUser()
        }
    }

    const fetchAllMoments = async () => {
        await revalidatePublic()
    }

    return (
        <EventContext.Provider value={{
            moments: userEvents,
            allMoments: publicEvents,
            isLoading,
            addMoment,
            updateMoment,
            deleteMoment,
            refreshMoments,
            fetchAllMoments
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
