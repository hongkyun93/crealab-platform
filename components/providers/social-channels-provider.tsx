"use client"

import { type SocialChannel } from "@/lib/types/user"
import { createContext, ReactNode, useCallback, useContext, useState } from "react"
import { toast } from "sonner"
import { useAuth } from "./auth-provider"

interface SocialChannelsContextType {
    channels: SocialChannel[]
    isLoading: boolean
    fetchChannels: (userId?: string) => Promise<void>
    createChannel: (channel: Omit<SocialChannel, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
    updateChannel: (id: string, data: Partial<SocialChannel>) => Promise<void>
    deleteChannel: (id: string) => Promise<void>
    setPrimaryChannel: (id: string) => Promise<void>
}

const SocialChannelsContext = createContext<SocialChannelsContextType | undefined>(undefined)

export function SocialChannelsProvider({ children }: { children: ReactNode }) {
    const [channels, setChannels] = useState<SocialChannel[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const { supabase } = useAuth()

    // Fetch social channels for a user
    // useCallback ensures a stable function reference so callers' useEffect deps don't fire infinitely
    const fetchChannels = useCallback(async (userId?: string) => {
        setIsLoading(true)
        try {
            let query = supabase
                .from('social_channels')
                .select('*')
                .order('is_primary', { ascending: false })
                .order('created_at', { ascending: true })

            if (userId) {
                query = query.eq('user_id', userId)
            }

            const { data, error } = await query

            if (error) {
                // Silently ignore AbortError (React StrictMode double-mount or component unmount)
                const isAbortError = Object.keys(error).length === 0 ||
                    error.message?.includes('AbortError') ||
                    error.message?.includes('aborted') ||
                    error.message === 'Failed to fetch' ||
                    error.message === 'Load failed'

                if (isAbortError) {
                    return
                }

                console.error('[SocialChannelsProvider] Fetch error:', JSON.stringify(error, null, 2), 'UserID:', userId)
                throw error
            }

            // Convert snake_case to camelCase
            const formattedChannels = (data || []).map(ch => ({
                id: ch.id,
                userId: ch.user_id,
                platform: ch.platform,
                handle: ch.handle,
                followersCount: ch.followers_count || 0,
                isPrimary: ch.is_primary || false,
                isPublic: ch.is_public !== false, // Default true
                createdAt: ch.created_at,
                updatedAt: ch.updated_at
            }))

            setChannels(formattedChannels)
        } catch (error: any) {
            // Silently ignore AbortError
            const isAbortError = error?.name === 'AbortError' ||
                error?.message?.includes('AbortError') ||
                error?.message?.includes('aborted') ||
                error?.message === 'Failed to fetch' ||
                error?.message === 'Load failed'

            if (isAbortError) {
                return
            }

            console.error('[SocialChannelsProvider] Failed to fetch channels:', error)
            toast.error('소셜 채널을 불러오는데 실패했습니다')
        } finally {
            setIsLoading(false)
        }
    }, [supabase])

    // Create new channel
    const createChannel = async (channel: Omit<SocialChannel, 'id' | 'createdAt' | 'updatedAt'>) => {
        try {
            const { data, error } = await supabase
                .from('social_channels')
                .insert({
                    user_id: channel.userId,
                    platform: channel.platform,
                    handle: channel.handle,
                    followers_count: channel.followersCount || 0,
                    is_primary: channel.isPrimary || false,
                    is_public: channel.isPublic !== false // Default true
                })
                .select()
                .single()

            if (error) {
                console.error('[SocialChannelsProvider] Create error:', error)
                throw error
            }

            toast.success('소셜 채널이 추가되었습니다')

            // Refresh channels
            await fetchChannels(channel.userId)
        } catch (error: any) {
            console.error('[SocialChannelsProvider] Failed to create channel:', error)

            // Check for duplicate constraint
            if (error?.code === '23505') {
                toast.error('이미 등록된 채널입니다')
            } else {
                toast.error('채널 추가에 실패했습니다')
            }
        }
    }

    // Update existing channel
    const updateChannel = async (id: string, data: Partial<SocialChannel>) => {
        // Optimistic Update
        setChannels(prev => prev.map(ch =>
            ch.id === id ? { ...ch, ...data } : ch
        ))

        try {
            const updates: any = {}

            if (data.platform !== undefined) updates.platform = data.platform
            if (data.handle !== undefined) updates.handle = data.handle
            if (data.followersCount !== undefined) updates.followers_count = data.followersCount
            if (data.isPrimary !== undefined) updates.is_primary = data.isPrimary
            if (data.isPublic !== undefined) updates.is_public = data.isPublic

            const { error } = await supabase
                .from('social_channels')
                .update(updates)
                .eq('id', id)

            if (error) {
                console.error('[SocialChannelsProvider] Update error:', error)
                throw error
            }

            toast.success('채널 정보가 수정되었습니다')

            // Refresh channels to ensure consistency (background)
            const currentChannel = channels.find(ch => ch.id === id)
            if (currentChannel) {
                await fetchChannels(currentChannel.userId)
            }
        } catch (error) {
            console.error('[SocialChannelsProvider] Failed to update channel:', error)
            toast.error('채널 수정에 실패했습니다')
            // Revert on error would be ideal, but for now we rely on next fetch or user retry
            // Ideally we should snapshot previous state
        }
    }

    // Delete channel
    const deleteChannel = async (id: string) => {
        // Optimistic Update
        const previousChannels = [...channels]
        setChannels(prev => prev.filter(ch => ch.id !== id))

        try {
            const { error } = await supabase
                .from('social_channels')
                .delete()
                .eq('id', id)

            if (error) {
                console.error('[SocialChannelsProvider] Delete error:', error)
                throw error
            }

            toast.success('채널이 삭제되었습니다')
        } catch (error) {
            console.error('[SocialChannelsProvider] Failed to delete channel:', error)
            toast.error('채널 삭제에 실패했습니다')
            setChannels(previousChannels) // Revert
        }
    }

    // Set primary channel (automatically unsets others)
    const setPrimaryChannel = async (id: string) => {
        // Optimistic Update: Set target to primary, others to non-primary
        setChannels(prev => prev.map(ch => ({
            ...ch,
            isPrimary: ch.id === id
        })))

        const channel = channels.find(ch => ch.id === id)

        try {
            if (!channel) {
                throw new Error('Channel not found')
            }

            // The database trigger will handle unsetting other primary channels
            // But we explicitly update the target one
            await updateChannel(id, { isPrimary: true })

            // We don't need to manually update others in DB because of the trigger, 
            // but we might want to fetch to doubly ensure DB state matches UI
        } catch (error) {
            console.error('[SocialChannelsProvider] Failed to set primary channel:', error)
            toast.error('메인 채널 설정에 실패했습니다')
            // Revert logic could be complex here, usually fetchChannels handles it on error/next load
            if (channel?.userId) await fetchChannels(channel.userId)
        }
    }

    return (
        <SocialChannelsContext.Provider
            value={{
                channels,
                isLoading,
                fetchChannels,
                createChannel,
                updateChannel,
                deleteChannel,
                setPrimaryChannel
            }}
        >
            {children}
        </SocialChannelsContext.Provider>
    )
}

export function useSocialChannels() {
    const context = useContext(SocialChannelsContext)
    if (context === undefined) {
        throw new Error('useSocialChannels must be used within a SocialChannelsProvider')
    }
    return context
}
