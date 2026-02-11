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

export function CampaignProvider({ children, userId }: { children: React.ReactNode, userId?: string }) {
    const [supabase] = useState(() => createClient())
    const [campaigns, setCampaigns] = useState<Campaign[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const isFetching = useRef(false)

    // Fetch campaigns from database
    const fetchCampaigns = async (targetUserId?: string) => {
        if (isFetching.current) return
        if (!targetUserId && !userId) return

        isFetching.current = true
        setIsLoading(true)

        try {
            const id = targetUserId || userId
            console.log('[CampaignProvider] Fetching campaigns for user:', id)

            const { data, error } = await supabase
                .from('campaigns')
                .select(`
                    *,
                    profiles(display_name, avatar_url)
                `)
                .eq('brand_id', id)
                .order('created_at', { ascending: false })

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
                    image: c.image_url,
                    date: new Date(c.created_at).toISOString().split('T')[0],
                    eventDate: c.event_date,
                    postingDate: c.posting_date,
                    targetProduct: c.target_product,
                    status: c.status || 'active',
                    tags: c.tags || [],
                    isMock: false
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
        }
    }, [userId])

    // Add campaign
    const addCampaign = async (newCampaign: Omit<Campaign, "id" | "date" | "matchScore">) => {
        if (!userId) {
            throw new Error('User ID required to create campaign')
        }

        try {
            console.log('[CampaignProvider] Creating campaign:', newCampaign)

            const result = await createCampaignAction({
                brand_id: userId,
                product_name: newCampaign.product,
                category: newCampaign.category,
                budget: parseInt(newCampaign.budget) || 0,
                target_audience: newCampaign.target,
                description: newCampaign.description,
                image_url: newCampaign.image,
                event_date: newCampaign.eventDate,
                posting_date: newCampaign.postingDate,
                target_product: newCampaign.targetProduct,
                status: newCampaign.status || 'active',
                tags: newCampaign.tags || []
            })

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

            const result = await updateCampaignStatus(id.toString(), status)

            if (result.success) {
                // Update local state
                setCampaigns(prev => prev.map(c =>
                    c.id === id ? { ...c, status } : c
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
