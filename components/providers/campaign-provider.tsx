"use client"

import React, { createContext, useContext, useState, useEffect, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Campaign } from "@/lib/types"
import { createCampaign as createCampaignAction, updateCampaignStatus, deleteCampaign as deleteCampaignAction } from "@/app/actions/campaign"

interface CampaignContextType {
    campaigns: Campaign[]
    isLoading: boolean
    addCampaign: (campaign: Omit<Campaign, "id" | "date" | "matchScore">) => Promise<void>
    updateCampaign: (id: string | number, status: string) => Promise<void>
    deleteCampaign: (id: string | number) => Promise<void>
    refreshCampaigns: (userId?: string) => Promise<void>
}

const CampaignContext = createContext<CampaignContextType | undefined>(undefined)

export function CampaignProvider({ children, userId, userType }: { children: React.ReactNode, userId?: string, userType?: string }) {
    const [supabase] = useState(() => createClient())
    const [campaigns, setCampaigns] = useState<Campaign[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const isFetching = useRef(false)

    // Fetch campaigns from database
    const fetchCampaigns = async (targetUserId?: string) => {
        if (isFetching.current) return
        // If influencer, we don't strictly need a userId to fetch *all* campaigns, but we usually have one.
        // If brand, we need userId.
        if (!targetUserId && !userId && userType === 'brand') return

        isFetching.current = true
        setIsLoading(true)

        try {
            const id = targetUserId || userId
            console.log(`[CampaignProvider] Fetching campaigns. User: ${id}, Type: ${userType}`)

            let query = supabase
                .from('campaigns')
                .select(`
                    *,
                    profiles(display_name, avatar_url)
                `)
                .order('created_at', { ascending: false })

            // Only filter by brand_id if the user is a Brand
            // Influencers and Admins see all campaigns
            if (userType === 'brand') {
                query = query.eq('brand_id', id)
            } else {
                // For influencers/others, maybe filter out 'closed' ones if desired, 
                // but the UI does some filtering too. Let's fetch all for now and let UI filter.
                // Or maybe explicitly fetch only active? 
                // The prompt implies "Discover", so usually active. 
                // However, the existing UI filters by `c.status !== 'closed'`.
                // We'll fetch all matching the base query.
            }

            const { data, error } = await query

            if (error) {
                console.error('[CampaignProvider] Fetch error:', error)
                return
            }

            if (data) {
                const mapped: Campaign[] = data.map((c: any) => ({
                    id: c.id,
                    brandId: c.brand_id,
                    brand: c.profiles?.display_name || 'Brand',
                    brandAvatar: c.profiles?.avatar_url,
                    product: c.product_name,
                    category: c.category,
                    budget: c.budget?.toString() || '0',
                    target: c.target_audience || '',
                    description: c.description || '',
                    image: c.image || c.image_url,
                    date: new Date(c.created_at).toISOString().split('T')[0],
                    eventDate: c.event_date,
                    postingDate: c.posting_date,
                    targetProduct: c.target_product,
                    status: c.status || 'active',
                    tags: c.tags || [],
                    isMock: false,
                    // New Fields
                    title: c.title,
                    recruitment_count: c.recruitment_count,
                    recruitment_deadline: c.recruitment_deadline,
                    channels: c.channels || [],
                    reference_link: c.reference_link,
                    hashtags: c.hashtags || [],
                    selection_announcement_date: c.selection_announcement_date,
                    min_followers: c.min_followers,
                    max_followers: c.max_followers
                }))

                setCampaigns(mapped)
                console.log('[CampaignProvider] Loaded campaigns:', mapped.length)
            }
        } catch (err) {
            console.error('[CampaignProvider] Exception:', err)
        } finally {
            isFetching.current = false
            setIsLoading(false)
        }
    }

    // Fetch on mount and when userId changes
    useEffect(() => {
        if (userId) {
            fetchCampaigns(userId)
        } else {
            // Clear data if no user (logout)
            setCampaigns([])
        }
    }, [userId])

    // Add campaign
    const addCampaign = async (newCampaign: Omit<Campaign, "id" | "date" | "matchScore">) => {
        if (!userId) {
            throw new Error('User ID required to create campaign')
        }

        try {
            console.log('[CampaignProvider] Creating campaign:', newCampaign)

            const formData = new FormData()
            formData.append('product', newCampaign.product)
            formData.append('category', newCampaign.category)
            formData.append('budget', newCampaign.budget)
            formData.append('target', newCampaign.target)
            formData.append('description', newCampaign.description)
            if (newCampaign.image) formData.append('image', newCampaign.image)
            if (newCampaign.eventDate) formData.append('eventDate', newCampaign.eventDate)
            if (newCampaign.postingDate) formData.append('postingDate', newCampaign.postingDate)
            if (newCampaign.targetProduct) formData.append('targetProduct', newCampaign.targetProduct)
            if (newCampaign.status) formData.append('status', newCampaign.status)
            if (newCampaign.tags) formData.append('tags', newCampaign.tags.join(','))

            // New Fields
            if (newCampaign.recruitment_count) formData.append('recruitmentCount', newCampaign.recruitment_count.toString())
            if (newCampaign.recruitment_deadline) formData.append('recruitmentDeadline', newCampaign.recruitment_deadline)
            if (newCampaign.channels) formData.append('channels', newCampaign.channels.join(','))
            if (newCampaign.reference_link) formData.append('referenceLink', newCampaign.reference_link)
            if (newCampaign.hashtags) formData.append('hashtags', newCampaign.hashtags.join(','))
            if (newCampaign.selection_announcement_date) formData.append('selectionDate', newCampaign.selection_announcement_date)
            if (newCampaign.min_followers) formData.append('minFollowers', newCampaign.min_followers.toString())
            if (newCampaign.max_followers) formData.append('maxFollowers', newCampaign.max_followers.toString())

            const result = await createCampaignAction(formData)

            if (result.success) {
                await fetchCampaigns(userId)
                console.log('[CampaignProvider] Campaign created successfully')
            } else {
                throw new Error(result.error || 'Failed to create campaign')
            }
        } catch (error: any) {
            console.error('[CampaignProvider] Add error:', error)
            throw error
        }
    }

    // Update campaign status
    const updateCampaign = async (id: string | number, status: string) => {
        try {
            console.log('[CampaignProvider] Updating campaign:', id, status)

            const result = await updateCampaignStatus(id.toString(), status as 'active' | 'closed')

            if (result.success) {
                // Update local state
                setCampaigns(prev => prev.map(c =>
                    c.id === id ? { ...c, status: status as any } : c
                ))
                console.log('[CampaignProvider] Campaign updated')
            } else {
                throw new Error(result.error || 'Failed to update campaign')
            }
        } catch (error: any) {
            console.error('[CampaignProvider] Update error:', error)
            throw error
        }
    }

    // Delete campaign
    const deleteCampaign = async (id: string | number) => {
        try {
            console.log('[CampaignProvider] Deleting campaign:', id)

            const result = await deleteCampaignAction(id.toString())

            if (result.success) {
                // Remove from local state
                setCampaigns(prev => prev.filter(c => c.id !== id))
                console.log('[CampaignProvider] Campaign deleted')
            } else {
                throw new Error(result.error || 'Failed to delete campaign')
            }
        } catch (error: any) {
            console.error('[CampaignProvider] Delete error:', error)
            throw error
        }
    }

    return (
        <CampaignContext.Provider value={{
            campaigns,
            isLoading,
            addCampaign,
            updateCampaign,
            deleteCampaign,
            refreshCampaigns: fetchCampaigns
        }}>
            {children}
        </CampaignContext.Provider>
    )
}

export function useCampaigns() {
    const context = useContext(CampaignContext)
    if (!context) {
        throw new Error('useCampaigns must be used within CampaignProvider')
    }
    return context
}
