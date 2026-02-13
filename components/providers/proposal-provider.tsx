"use client"

import React, { createContext, useContext, useState, useEffect, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Proposal, BrandProposal, MomentProposal } from "@/lib/types"

interface ProposalContextType {
    campaignProposals: Proposal[]
    brandProposals: BrandProposal[]
    momentProposals: MomentProposal[] // [NEW]
    isLoading: boolean
    addProposal: (proposal: Partial<Proposal>) => Promise<void>
    updateProposal: (id: string | number, updates: Partial<Proposal>) => Promise<boolean>
    updateBrandProposal: (id: string | number, updates: Partial<BrandProposal>) => Promise<boolean>
    deleteBrandProposal: (id: string | number) => Promise<void>
    refreshProposals: (userId?: string) => Promise<void>
}

const ProposalContext = createContext<ProposalContextType | undefined>(undefined)

export function ProposalProvider({ children, userId, userType }: { children: React.ReactNode, userId?: string, userType?: string }) {
    const [supabase] = useState(() => createClient())
    const [campaignProposals, setCampaignProposals] = useState<Proposal[]>([])
    const [brandProposals, setBrandProposals] = useState<BrandProposal[]>([])
    const [momentProposals, setMomentProposals] = useState<MomentProposal[]>([]) // [NEW]
    const [isLoading, setIsLoading] = useState(false)
    const isFetching = useRef(false)

    // Fetch creator proposals (applications to campaigns)
    // For Influencers: My applications
    // For Brands: Applications to My Campaigns
    const fetchCampaignProposals = async (targetUserId?: string) => {
        const id = targetUserId || userId
        if (!id) return

        try {
            console.log(`[ProposalProvider] Fetching campaign proposals. User: ${id}, Type: ${userType}`)

            let query = supabase
                .from('campaign_proposals')
                .select(`
                    *,
                    campaigns(id, title, product_name, category, budget, brand_id, profiles(display_name, avatar_url)),
                    profiles!influencer_id(display_name, avatar_url)
                `)
                .order('created_at', { ascending: false })

            if (userType === 'brand') {
                // If Brand, join on campaigns and filter by brand_id
                query = supabase
                    .from('campaign_proposals')
                    .select(`
                        *,
                        campaigns!inner(id, title, product_name, category, budget, brand_id, profiles(display_name, avatar_url)),
                        profiles!influencer_id(display_name, avatar_url)
                    `)
                    .eq('campaigns.brand_id', id)
                    .order('created_at', { ascending: false })
            } else {
                // If Influencer (or undefined/other), filter by influencer_id
                query = query.eq('influencer_id', id)
            }

            const { data, error } = await query

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
                        campaignName: p.campaigns?.title || p.campaigns?.product_name,
                        productName: p.campaigns?.product_name,
                        influencerId: p.influencer_id,
                        // If I am brand, influencer info is in p.profiles
                        influencerName: p.profiles?.display_name,
                        influencerAvatar: p.profiles?.avatar_url,
                        brandId: p.campaigns?.brand_id,
                        brandName: p.campaigns?.profiles?.display_name,
                        brandAvatar: p.campaigns?.profiles?.avatar_url,
                        // Compatibility with UI components
                        brand_name: p.campaigns?.profiles?.display_name,
                        product_name: p.campaigns?.product_name,
                        brand_avatar: p.campaigns?.profiles?.avatar_url,
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

                setCampaignProposals(mapped)
                console.log('[ProposalProvider] Loaded campaign proposals:', mapped.length)
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
            console.log('[ProposalProvider] Fetching brand & moment proposals...')

            const [brandRes, momentRes] = await Promise.all([
                supabase
                    .from('brand_proposals')
                    .select(`
                        *,
                        brand:profiles!brand_id(display_name, avatar_url),
                        influencer:profiles!influencer_id(display_name, avatar_url),
                        products:brand_products(name, image_url)
                    `)
                    .or(`brand_id.eq.${id},influencer_id.eq.${id}`)
                    .order('created_at', { ascending: false }),
                supabase
                    .from('moment_proposals')
                    .select(`
                        *,
                        brand:profiles!brand_id(display_name, avatar_url),
                        influencer:profiles!influencer_id(display_name, avatar_url),
                        moment:life_moments(title, event_date)
                    `)
                    .or(`brand_id.eq.${id},influencer_id.eq.${id}`)
                    .order('created_at', { ascending: false })
            ])

            const brandData = brandRes.data || []
            const momentData = momentRes.data || []

            if (brandRes.error) console.error('[ProposalProvider] Brand proposals error:', brandRes.error)
            if (momentRes.error) console.error('[ProposalProvider] Moment proposals error:', momentRes.error)

            const mappedBrand: BrandProposal[] = brandData.map((p: any) => ({
                id: p.id,
                type: 'brand_offer',
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
                motivation: p.motivation,
                content_plan: p.content_plan,
                portfolio_links: p.portfolio_links,
                instagram_handle: p.instagram_handle,
                insight_screenshot: p.insight_screenshot,
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

            const mappedMoment: BrandProposal[] = momentData.map((p: any) => ({
                id: p.id,
                type: 'brand_offer', // Treated same as brand offer for now
                brand_id: p.brand_id,
                influencer_id: p.influencer_id,
                moment_id: p.moment_id, // Specific to moment
                event_id: p.moment_id, // [FIX] Map moment_id to event_id for UI compatibility
                product_id: p.product_id,
                // Map Moment Columns (Priority to direct columns, fallback to conditions if exists)
                product_name: p.product_name || p.conditions?.product_name || "협업 제안",
                product_type: p.product_type || p.conditions?.product_type,
                compensation_amount: p.compensation_amount || (p.price_offer ? String(p.price_offer) : undefined),
                has_incentive: p.has_incentive || p.conditions?.has_incentive,
                incentive_detail: p.incentive_detail || p.conditions?.incentive_detail,
                content_type: p.content_type || p.conditions?.content_type,
                status: p.status,
                message: p.message,

                // Map Conditions
                desired_date: p.desired_date || p.conditions?.desired_date,
                date_flexible: p.date_flexible || p.conditions?.date_flexible,
                video_guide: p.video_guide || p.conditions?.video_guide,
                condition_draft_submission_date: p.condition_draft_submission_date || p.conditions?.condition_draft_submission_date,
                condition_final_submission_date: p.condition_final_submission_date || p.conditions?.condition_final_submission_date,
                condition_upload_date: p.condition_upload_date || p.conditions?.condition_upload_date,
                condition_secondary_usage_period: p.condition_secondary_usage_period || p.conditions?.condition_secondary_usage_period,

                created_at: p.created_at,
                updated_at: p.updated_at,
                brand_name: p.brand?.display_name,
                brandAvatar: p.brand?.avatar_url,
                influencer_name: p.influencer?.display_name,
                influencer_avatar: p.influencer?.avatar_url,

                // Moment Specific Context
                product_url: p.moment?.title ? `모먼트: ${p.moment.title}` : undefined
            }))

            // [NEW] Separate Moment Proposals State Population
            const rawMomentProposals: MomentProposal[] = momentData.map((p: any) => ({
                id: p.id,
                brand_id: p.brand_id,
                influencer_id: p.influencer_id,
                moment_id: p.moment_id,
                status: p.status,
                price_offer: p.price_offer,
                message: p.message,
                created_at: p.created_at,
                updated_at: p.updated_at,
                brand_name: p.brand?.display_name,
                brand_avatar: p.brand?.avatar_url,
                influencer_name: p.influencer?.display_name,
                influencer_avatar: p.influencer?.avatar_url,
                moment_title: p.moment?.title,
                conditions: p.conditions
            }))

            setMomentProposals(rawMomentProposals)
            console.log('[ProposalProvider] Loaded raw moment proposals:', rawMomentProposals.length)

            const final = [...mappedBrand, ...mappedMoment].sort((a, b) =>
                new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            )

            setBrandProposals(final)
            console.log('[ProposalProvider] Loaded proposals:', {
                brand: mappedBrand.length,
                moment: mappedMoment.length,
                total: final.length
            })

        } catch (err) {
            console.error('[ProposalProvider] Exception:', err)
        }
    }

    // Fetch on mount
    useEffect(() => {
        if (userId) {
            setIsLoading(true)
            Promise.all([
                fetchCampaignProposals(userId),
                fetchBrandProposals(userId)
            ]).finally(() => {
                setIsLoading(false)
            })
        } else {
            setCampaignProposals([])
            setBrandProposals([])
            setIsLoading(false)
        }
    }, [userId])

    // Refresh all proposals
    const refreshProposals = async (targetUserId?: string) => {
        const id = targetUserId || userId
        if (!id) return

        setIsLoading(true)
        try {
            await Promise.all([
                fetchCampaignProposals(id),
                fetchBrandProposals(id)
            ])
        } finally {
            setIsLoading(false)
        }
    }

    // Add proposal
    const addProposal = async (proposal: Partial<Proposal>) => {
        if (!userId) {
            throw new Error('User ID required')
        }

        try {
            console.log('[ProposalProvider] Creating proposal:', proposal)

            // Distinguish between Campaign Application and Product Proposal
            if (proposal.campaignId) {
                // Campaign Proposal (Insert into campaign_proposals)
                const { data, error } = await supabase
                    .from('campaign_proposals')
                    .insert({
                        influencer_id: userId,
                        campaign_id: proposal.campaignId,
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

                if (error) throw error
            } else if (proposal.momentId) {
                // Moment Proposal (Insert into moment_proposals)
                console.log('[ProposalProvider] Submitting Moment Proposal:', proposal)
                const { data, error } = await supabase
                    .from('moment_proposals')
                    .insert({
                        brand_id: userId,
                        influencer_id: proposal.toId, // Creator ID
                        moment_id: proposal.momentId,
                        message: proposal.message,
                        price_offer: proposal.cost,
                        status: 'offered',
                        conditions: {
                            group: 'moment_proposal',
                            product_name: proposal.productName,
                            product_type: "gift", // Default or map from proposal
                            has_incentive: false, // Default or map from proposal
                            incentive_detail: null,
                            content_type: proposal.content_plan, // Mapping content plan to content type? Or just generic
                            desired_date: proposal.date,
                            date_flexible: false,
                            condition_draft_submission_date: proposal.condition_draft_submission_date,
                            condition_final_submission_date: proposal.condition_final_submission_date,
                            condition_upload_date: proposal.condition_upload_date,
                            condition_secondary_usage_period: proposal.condition_secondary_usage_period
                        }
                    })
                    .select()
                    .single()

                if (error) throw error
            } else if (proposal.productId) {
                // Brand Product Proposal (Insert into brand_proposals)
                const { data, error } = await supabase
                    .from('brand_proposals')
                    .insert({
                        influencer_id: userId,
                        brand_id: proposal.toId,
                        product_id: proposal.productId,
                        product_name: "Brand Product",
                        message: proposal.message || proposal.requestDetails,
                        status: 'offered', // Default applied status for direct proposal is 'offered' or 'applied'? logic says 'applied'.
                        // But wait, if creator proposes to brand product, it's 'applied' from creator side.
                        // Ideally we should use 'applied' if creator initiates.
                        // Let's stick to 'applied' for now as per logic.

                        // New Fields
                        motivation: proposal.motivation,
                        content_plan: proposal.content_plan,
                        portfolio_links: proposal.portfolioLinks,
                        instagram_handle: proposal.instagramHandle,
                        insight_screenshot: proposal.insightScreenshot,

                        // Default fields for brand_proposal
                        product_type: 'ad',
                        compensation_amount: proposal.cost?.toString(),
                    })
                    .select()
                    .single()

                if (error) throw error
            }

            await fetchCampaignProposals(userId)
            await fetchBrandProposals(userId)
        } catch (error: any) {
            console.error('[ProposalProvider] Add error:', error)
            throw error
        }
    }

    // Update creator proposal (campaign_proposals)
    const updateProposal = async (id: string | number, updates: Partial<Proposal>): Promise<boolean> => {
        try {
            console.log('[ProposalProvider] Updating campaign proposal:', id, updates)

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
                .from('campaign_proposals')
                .update(dbUpdates)
                .eq('id', id)

            if (error) {
                console.error('[ProposalProvider] Update error:', error)
                return false
            }

            // Update local state
            setCampaignProposals(prev => prev.map(p =>
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
            campaignProposals,
            brandProposals,
            momentProposals, // [NEW]
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
