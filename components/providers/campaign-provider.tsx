"use client"

import { createCampaign as createCampaignAction, deleteCampaign as deleteCampaignAction, updateCampaignStatus } from "@/app/actions/campaign"
import { invalidateCampaignsCache, useCampaignsSWR } from "@/lib/hooks/use-campaigns-swr"
import type { Campaign } from "@/lib/types"
import React, { createContext, useContext } from "react"

interface CampaignContextType {
    campaigns: Campaign[]
    isLoading: boolean
    addCampaign: (campaign: Omit<Campaign, "id" | "date" | "matchScore">) => Promise<void>
    updateCampaign: (id: string | number, status: string) => Promise<void>
    deleteCampaign: (id: string | number) => Promise<void>
    refreshCampaigns: (userId?: string) => Promise<void>
}

const CampaignContext = createContext<CampaignContextType | undefined>(undefined)

export function CampaignProvider({ children, userId, userType, teamId }: {
    children: React.ReactNode,
    userId?: string,
    userType?: string,
    teamId?: string
}) {
    // [PERF] Replaced manual useState + fetch with SWR for automatic caching & deduplication
    const { campaigns, isLoading } = useCampaignsSWR(userId, teamId)

    // Refresh campaigns by invalidating SWR cache (triggers background re-fetch)
    const refreshCampaigns = async (_userId?: string) => {
        await invalidateCampaignsCache(userId, teamId)
    }

    // Add campaign via Server Action, then invalidate SWR cache
    const addCampaign = async (newCampaign: Omit<Campaign, "id" | "date" | "matchScore">) => {
        if (!userId) {
            throw new Error('User ID required to create campaign')
        }

        const formData = new FormData()
        formData.append('product', newCampaign.product)
        formData.append('category', newCampaign.category)
        formData.append('budget', newCampaign.budget)
        formData.append('target', newCampaign.target)
        formData.append('description', newCampaign.description)
        if (newCampaign.image) formData.append('image', newCampaign.image)
        if (newCampaign.momentDate) formData.append('momentDate', newCampaign.momentDate)
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

        // [MCN Support] Pass Team ID
        if (teamId) formData.append('teamId', teamId)

        const result = await createCampaignAction(formData)

        if (result.success) {
            await invalidateCampaignsCache(userId, teamId)
        } else {
            throw new Error(result.error || 'Failed to create campaign')
        }
    }

    // Update campaign status via Server Action, then invalidate SWR cache
    const updateCampaign = async (id: string | number, status: string) => {
        const result = await updateCampaignStatus(id.toString(), status as 'active' | 'closed')

        if (result.success) {
            await invalidateCampaignsCache(userId, teamId)
        } else {
            throw new Error(result.error || 'Failed to update campaign')
        }
    }

    // Delete campaign via Server Action, then invalidate SWR cache
    const deleteCampaign = async (id: string | number) => {
        const result = await deleteCampaignAction(id.toString())

        if (result.success) {
            await invalidateCampaignsCache(userId, teamId)
        } else {
            throw new Error(result.error || 'Failed to delete campaign')
        }
    }

    return (
        <CampaignContext.Provider value={{
            campaigns,
            isLoading,
            addCampaign,
            updateCampaign,
            deleteCampaign,
            refreshCampaigns,
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
