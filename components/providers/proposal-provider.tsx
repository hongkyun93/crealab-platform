"use client"

import React, { createContext, useContext, useState, useEffect, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Proposal, BrandProposal } from "@/lib/types"

interface ProposalContextType {
    proposals: Proposal[]
    brandProposals: BrandProposal[]
    isLoading: boolean
    addProposal: (proposal: Partial<Proposal>) => Promise<void>
    updateProposal: (id: string | number, updates: Partial<Proposal>) => Promise<boolean>
    updateBrandProposal: (id: string | number, updates: Partial<BrandProposal>) => Promise<boolean>
    deleteBrandProposal: (id: string | number) => Promise<void>
    refreshProposals: (userId?: string) => Promise<void>
}

const ProposalContext = createContext<ProposalContextType | undefined>(undefined)

export function ProposalProvider({ children, userId }: { children: React.ReactNode, userId?: string }) {
    const [supabase] = useState(() => createClient())
    const [proposals, setProposals] = useState<Proposal[]>([])
    const [brandProposals, setBrandProposals] = useState<BrandProposal[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const isFetching = useRef(false)

    // Fetch creator proposals (applications to campaigns)
    const fetchCreatorProposals = async (targetUserId?: string) => {
        const id = targetUserId || userId
        if (!id) return

        try {
            console.log('[ProposalProvider] Fetching creator proposals...')

            const { data, error } = await supabase
                .from('proposals')
                .select(`
                    *,
                    campaigns(id, product_name, category, budget, brand_id, profiles(display_name, avatar_url)),
                    profiles!influencer_id(display_name, avatar_url)
                `)
                .eq('influencer_id', id)
                .order('created_at', { ascending: false })

            if (error) {
                console.error('[ProposalProvider] Creator proposals error:', error)
                return
            }

            if (data) {
                const mapped: Proposal[] = data.map((p: any) => {
                    return {
                        id: p.id,
                        type: 'creator_apply' as const,
                        dealType: p.deal_type || 'ad',
                        campaignId: p.campaign_id,
                        campaignName: p.campaigns?.product_name,
                        productName: p.campaigns?.product_name,
                        influencerId: p.influencer_id,
                        brandId: p.campaigns?.brand_id,
                        brandName: p.campaigns?.profiles?.display_name,
                        brandAvatar: p.campaigns?.profiles?.avatar_url,
                        cost: p.price_offer,
                        message: p.message,
                        status: p.status,
                        date: new Date(p.created_at).toISOString().split('T')[0],
                        created_at: p.created_at,
                        motivation: p.motivation,
                        content_plan: p.content_plan,
                        portfolioLinks: p.portfolio_links,
                        followers: 0,
                        tags: [],
                        instagramHandle: p.instagram_handle,
                        insightScreenshot: p.insight_screenshot,
                        contract_content: p.contract_content,
                        contract_status: p.contract_status,
                        brand_signature: p.brand_signature,
                        influencer_signature: p.influencer_signature,
                        shipping_name: p.shipping_name,
                        tracking_number: p.tracking_number,
                        delivery_status: p.delivery_status,
                        payout_status: p.payout_status,
                        content_submission_url: p.content_submission_url,
                        content_submission_status: p.content_submission_status,
                        campaign: p.campaigns
                    }
                })

                setProposals(mapped)
                console.log('[ProposalProvider] Loaded creator proposals:', mapped.length)
            }
        } catch (err) {
            console.error('[ProposalProvider] Exception:', err)
        }
    }

    // Fetch brand proposals (offers to influencers)
    const fetchBrandProposals = async (targetUserId?: string) => {
        const id = targetUserId || userId
        if (!id) return

        try {
            console.log('[ProposalProvider] Fetching brand proposals...')

            const { data, error } = await supabase
                .from('brand_proposals')
                .select(`
                    *,
                    brand:profiles!brand_id(display_name, avatar_url),
                    influencer:profiles!influencer_id(display_name, avatar_url),
                    products:brand_products(name, image_url)
                `)
                .or(`brand_id.eq.${id},influencer_id.eq.${id}`)
                .order('created_at', { ascending: false })

            if (error) {
                console.error('[ProposalProvider] Brand proposals error:', error)
                return
            }

            if (data) {
                const mapped: BrandProposal[] = data.map((p: any) => ({
                    id: p.id,
                    brand_id: p.brand_id,
                    influencer_id: p.influencer_id,
                    event_id: p.event_id,
                    product_id: p.product_id,
                    campaign_id: p.campaign_id,
                    product_name: p.product_name || p.products?.name,
                    product_type: p.product_type,
                    compensation_amount: p.compensation_amount,
                    has_incentive: p.has_incentive,
                    incentive_detail: p.incentive_detail,
                    content_type: p.content_type,
                    status: p.status,
                    message: p.message,
                    cost: p.cost,
                    created_at: p.created_at,
                    updated_at: p.updated_at,
                    brand_name: p.brand?.display_name,
                    brandAvatar: p.brand?.avatar_url,
                    influencer_name: p.influencer?.display_name,
                    influencer_avatar: p.influencer?.avatar_url,
                    contract_content: p.contract_content,
                    contract_status: p.contract_status,
                    brand_signature: p.brand_signature,
                    influencer_signature: p.influencer_signature,
                    payout_status: p.payout_status,
                    delivery_status: p.delivery_status,
                    brand_condition_confirmed: p.brand_condition_confirmed,
                    influencer_condition_confirmed: p.influencer_condition_confirmed,
                    condition_product_receipt_date: p.condition_product_receipt_date,
                    content_submission_url: p.content_submission_url,
                    content_submission_status: p.content_submission_status,
                    product_url: p.products?.image_url,
                    product: p.products
                }))

                setBrandProposals(mapped)
                console.log('[ProposalProvider] Loaded brand proposals:', mapped.length)
            }
        } catch (err) {
            console.error('[ProposalProvider] Exception:', err)
        }
    }

    // Fetch on mount
    useEffect(() => {
        if (userId) {
            Promise.all([
                fetchCreatorProposals(userId),
                fetchBrandProposals(userId)
            ])
        } else {
            setProposals([])
            setBrandProposals([])
        }
    }, [userId])

    // Refresh all proposals
    const refreshProposals = async (targetUserId?: string) => {
        const id = targetUserId || userId
        if (!id) return

        setIsLoading(true)
        try {
            await Promise.all([
                fetchCreatorProposals(id),
                fetchBrandProposals(id)
            ])
        } finally {
            setIsLoading(false)
        }
    }

    // Add proposal (creator apply to campaign)
    const addProposal = async (proposal: Partial<Proposal>) => {
        if (!userId) {
            throw new Error('User ID required')
        }

        try {
            console.log('[ProposalProvider] Creating proposal:', proposal)

            const { data, error } = await supabase
                .from('proposals')
                .insert({
                    influencer_id: userId,
                    campaign_id: proposal.campaignId,
                    deal_type: proposal.dealType || 'ad',
                    price_offer: proposal.cost,
                    message: proposal.message,
                    status: 'applied',
                    motivation: proposal.motivation,
                    content_plan: proposal.content_plan,
                    portfolio_links: proposal.portfolioLinks,
                    instagram_handle: proposal.instagramHandle,
                    insight_screenshot: proposal.insightScreenshot
                })
                .select()
                .single()

            if (error) {
                console.error('[ProposalProvider] Create error:', error)
                throw error
            }

            await fetchCreatorProposals(userId)
            console.log('[ProposalProvider] Proposal created')
        } catch (error: any) {
            console.error('[ProposalProvider] Add error:', error)
            throw error
        }
    }

    // Update creator proposal
    const updateProposal = async (id: string | number, updates: Partial<Proposal>): Promise<boolean> => {
        try {
            console.log('[ProposalProvider] Updating proposal:', id, updates)

            const dbUpdates: any = {}
            if (updates.status) dbUpdates.status = updates.status
            if (updates.contract_status) dbUpdates.contract_status = updates.contract_status
            if (updates.contract_content) dbUpdates.contract_content = updates.contract_content
            if (updates.influencer_signature) dbUpdates.influencer_signature = updates.influencer_signature
            if (updates.brand_signature) dbUpdates.brand_signature = updates.brand_signature
            if (updates.delivery_status) dbUpdates.delivery_status = updates.delivery_status
            if (updates.shipping_name) dbUpdates.shipping_name = updates.shipping_name
            if (updates.tracking_number) dbUpdates.tracking_number = updates.tracking_number
            if (updates.content_submission_url) dbUpdates.content_submission_url = updates.content_submission_url
            if (updates.content_submission_status) dbUpdates.content_submission_status = updates.content_submission_status

            const { error } = await supabase
                .from('proposals')
                .update(dbUpdates)
                .eq('id', id)

            if (error) {
                console.error('[ProposalProvider] Update error:', error)
                return false
            }

            // Update local state
            setProposals(prev => prev.map(p =>
                p.id === id ? { ...p, ...updates } : p
            ))

            return true
        } catch (error: any) {
            console.error('[ProposalProvider] Update error:', error)
            return false
        }
    }

    // Update brand proposal
    const updateBrandProposal = async (id: string | number, updates: Partial<BrandProposal>): Promise<boolean> => {
        try {
            console.log('[ProposalProvider] Updating brand proposal:', id, updates)

            const dbUpdates: any = {}
            if (updates.status) dbUpdates.status = updates.status
            if (updates.contract_status) dbUpdates.contract_status = updates.contract_status
            if (updates.contract_content) dbUpdates.contract_content = updates.contract_content
            if (updates.influencer_signature) dbUpdates.influencer_signature = updates.influencer_signature
            if (updates.brand_signature) dbUpdates.brand_signature = updates.brand_signature
            if (updates.delivery_status) dbUpdates.delivery_status = updates.delivery_status
            if (updates.brand_condition_confirmed !== undefined) dbUpdates.brand_condition_confirmed = updates.brand_condition_confirmed
            if (updates.influencer_condition_confirmed !== undefined) dbUpdates.influencer_condition_confirmed = updates.influencer_condition_confirmed
            if (updates.content_submission_url) dbUpdates.content_submission_url = updates.content_submission_url
            if (updates.content_submission_status) dbUpdates.content_submission_status = updates.content_submission_status

            const { error } = await supabase
                .from('brand_proposals')
                .update(dbUpdates)
                .eq('id', id)

            if (error) {
                console.error('[ProposalProvider] Update error:', error)
                return false
            }

            // Update local state
            setBrandProposals(prev => prev.map(p =>
                p.id === id ? { ...p, ...updates } : p
            ))

            return true
        } catch (error: any) {
            console.error('[ProposalProvider] Update error:', error)
            return false
        }
    }

    // Delete brand proposal
    const deleteBrandProposal = async (id: string | number) => {
        try {
            console.log('[ProposalProvider] Deleting brand proposal:', id)

            const { error } = await supabase
                .from('brand_proposals')
                .delete()
                .eq('id', id)

            if (error) {
                console.error('[ProposalProvider] Delete error:', error)
                throw error
            }

            setBrandProposals(prev => prev.filter(p => p.id !== id))
            console.log('[ProposalProvider] Brand proposal deleted')
        } catch (error: any) {
            console.error('[ProposalProvider] Delete error:', error)
            throw error
        }
    }

    return (
        <ProposalContext.Provider value={{
            proposals,
            brandProposals,
            isLoading,
            addProposal,
            updateProposal,
            updateBrandProposal,
            deleteBrandProposal,
            refreshProposals
        }}>
            {children}
        </ProposalContext.Provider>
    )
}

export function useProposals() {
    const context = useContext(ProposalContext)
    if (!context) {
        throw new Error('useProposals must be used within ProposalProvider')
    }
    return context
}
