"use client"

import React, { createContext, useContext, useState, useEffect, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Favorite, FavoriteTargetType } from "@/lib/types"

interface FavoriteContextType {
    favorites: Favorite[]
    isLoading: boolean
    toggleFavorite: (targetId: string, targetType: FavoriteTargetType) => Promise<void>
    isFavorited: (targetId: string, targetType: FavoriteTargetType) => boolean
    refreshFavorites: (userId?: string) => Promise<void>
}

const FavoriteContext = createContext<FavoriteContextType | undefined>(undefined)

export function FavoriteProvider({ children, userId }: { children: React.ReactNode, userId?: string }) {
    const [supabase] = useState(() => createClient())
    const [favorites, setFavorites] = useState<Favorite[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const isFetching = useRef(false)

    // Fetch favorites
    const fetchFavorites = async (targetUserId?: string) => {
        const id = targetUserId || userId
        if (!id || isFetching.current) return

        isFetching.current = true
        setIsLoading(true)

        try {
            console.log('[FavoriteProvider] Fetching favorites...')

            const { data, error } = await supabase
                .from('favorites')
                .select('*')
                .eq('user_id', id)
                .order('created_at', { ascending: false })

            if (error) {
                console.error('[FavoriteProvider] Fetch error:', error)
                return
            }

            if (data) {
                setFavorites(data)
                console.log('[FavoriteProvider] Loaded favorites:', data.length)
            }
        } catch (err) {
            console.error('[FavoriteProvider] Exception:', err)
        } finally {
            isFetching.current = false
            setIsLoading(false)
        }
    }

    // Fetch on mount
    useEffect(() => {
        if (userId) {
            fetchFavorites(userId)
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
