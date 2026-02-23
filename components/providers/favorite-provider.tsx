"use client"

import type { Favorite, FavoriteTargetType } from "@/lib/types"
import React, { createContext, useContext, useEffect, useRef, useState } from "react"
import { useAuth } from "./auth-provider"

interface FavoriteContextType {
    favorites: Favorite[]
    isLoading: boolean
    toggleFavorite: (targetId: string, targetType: FavoriteTargetType) => Promise<void>
    isFavorited: (targetId: string, targetType: FavoriteTargetType) => boolean
    refreshFavorites: (userId?: string) => Promise<void>
}

const FavoriteContext = createContext<FavoriteContextType | undefined>(undefined)

export function FavoriteProvider({ children, userId }: { children: React.ReactNode, userId?: string }) {
    const { supabase } = useAuth()
    const [favorites, setFavorites] = useState<Favorite[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const isFetching = useRef(false)

    // Fetch favorites
    const fetchFavorites = async (targetUserId?: string, signal?: AbortSignal) => {
        const id = targetUserId || userId
        if (!id || isFetching.current) return

        isFetching.current = true
        setIsLoading(true)

        try {
            // console.log('[FavoriteProvider] Fetching favorites...') // Reduced noise

            const { data, error } = await supabase
                .from('favorites')
                .select('*')
                .eq('user_id', id)
                .order('created_at', { ascending: false })
                .abortSignal(signal || null as any)

            if (error) {
                // Ignore known benign errors and cancellations
                if (
                    error.code === 'PGRST116' || // Result contains 0 rows
                    error.message?.includes('AbortError') ||
                    error.message?.includes('aborted') ||
                    error.message === 'Failed to fetch' ||
                    error.code === '20' // Abort code
                ) {
                    return
                }

                // Warn about missing table (42P01) silently-ish
                if (error.code === '42P01') {
                    console.warn('[FavoriteProvider] Favorites table missing (Migration required)')
                    return
                }

                console.error('[FavoriteProvider] Fetch error:', error)
                return
            }

            if (data) {
                setFavorites(data)
                // console.log('[FavoriteProvider] Loaded favorites:', data.length)
            }
        } catch (err: any) {
            // Handle thrown AbortError from abortSignal
            if (
                err.name === 'AbortError' ||
                err.message?.includes('AbortError') ||
                err.message?.includes('aborted')
            ) {
                // Expected cancellation
                return
            }
            console.error('[FavoriteProvider] Exception:', err)
        } finally {
            isFetching.current = false
            setIsLoading(false)
            window.dispatchEvent(new CustomEvent('app-log', { detail: { msg: '즐겨찾기 데이터 로드 완료', type: 'success' } }))
        }
    }

    // Log Favorite Loading
    useEffect(() => {
        if (isLoading) {
            window.dispatchEvent(new CustomEvent('app-log', { detail: { msg: '즐겨찾기 불러오는 중...', type: 'loading' } }))
        }
    }, [isLoading])

    // Fetch on mount
    useEffect(() => {
        const controller = new AbortController()
        const signal = controller.signal

        if (userId) {
            fetchFavorites(userId, signal)
        } else {
            setFavorites([])
        }

        return () => {
            controller.abort()
        }
    }, [userId])

    // Check if item is favorited
    const isFavorited = (targetId: string, targetType: FavoriteTargetType): boolean => {
        return favorites.some(f => f.target_id === targetId && f.target_type === targetType)
    }

    // Toggle favorite
    const toggleFavorite = async (targetId: string, targetType: FavoriteTargetType) => {
        if (!userId) {
            throw new Error('User ID required')
        }

        try {
            const existing = favorites.find(f => f.target_id === targetId && f.target_type === targetType)

            if (existing) {
                // Remove favorite
                console.log('[FavoriteProvider] Removing favorite:', targetId)

                const { error } = await supabase
                    .from('favorites')
                    .delete()
                    .eq('id', existing.id)

                if (error) {
                    console.error('[FavoriteProvider] Delete error:', error)
                    throw error
                }

                setFavorites(prev => prev.filter(f => f.id !== existing.id))
                console.log('[FavoriteProvider] Favorite removed')
            } else {
                // Add favorite
                console.log('[FavoriteProvider] Adding favorite:', targetId, targetType)

                const { data, error } = await supabase
                    .from('favorites')
                    .insert({
                        user_id: userId,
                        target_id: targetId,
                        target_type: targetType
                    })
                    .select()
                    .single()

                if (error) {
                    console.error('[FavoriteProvider] Add error:', error)
                    throw error
                }

                if (data) {
                    setFavorites(prev => [data, ...prev])
                    console.log('[FavoriteProvider] Favorite added')
                }
            }
        } catch (error: any) {
            console.error('[FavoriteProvider] Toggle error:', error)
            throw error
        }
    }

    return (
        <FavoriteContext.Provider value={{
            favorites,
            isLoading,
            toggleFavorite,
            isFavorited,
            refreshFavorites: fetchFavorites
        }}>
            {children}
        </FavoriteContext.Provider>
    )
}

export function useFavorites() {
    const context = useContext(FavoriteContext)
    if (!context) {
        throw new Error('useFavorites must be used within FavoriteProvider')
    }
    return context
}
