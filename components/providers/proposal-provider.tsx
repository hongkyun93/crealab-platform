"use client"

import { useWorkspaceStore } from "@/components/workspace/hooks/use-workspace-store"
import type { MomentProposal, ProductApplication, Proposal } from "@/lib/types"
import React, { createContext, useContext, useEffect, useRef, useState } from "react"
import { useAuth } from "./auth-provider"

interface ProposalContextType {
    campaignProposals: Proposal[]
    productApplications: ProductApplication[]
    momentProposals: MomentProposal[] // [NEW]
    addMomentProposal: (proposal: MomentProposal) => void // [NEW] Optimistic Add
    isLoading: boolean
    addProposal: (proposal: Partial<Proposal>) => Promise<void>
    updateProposal: (id: string | number, updates: Partial<Proposal>) => Promise<boolean>
    updateProductApplication: (id: string | number, updates: Partial<ProductApplication>) => Promise<boolean>
    updateMomentProposal: (id: string | number, updates: Partial<MomentProposal>) => Promise<boolean> // [NEW]
    deleteProductApplication: (id: string | number) => Promise<void>
    deleteMomentProposal: (id: string | number) => Promise<void> // [NEW]
    createProductApplication: (proposal: any) => Promise<any> // [NEW]
    createMomentProposal: (proposal: any) => Promise<any> // [NEW]
    refreshProposals: (userId?: string) => Promise<void>
}

const ProposalContext = createContext<ProposalContextType | undefined>(undefined)

const isIgnorableError = (error: any) => {
    return (
        error.name === 'AbortError' || (
            (error.code === undefined || error.code === '') && (
                error.message?.includes('AbortError') ||
                error.message?.includes('aborted') ||
                error.message === 'Failed to fetch' ||
                error.message === 'Load failed' ||
                error.details?.includes('AbortError')
            )
        )
    )
}

export function ProposalProvider({ children, userId, userType }: { children: React.ReactNode, userId?: string, userType?: string }) {
    const { supabase } = useAuth()
    const [campaignProposals, setCampaignProposals] = useState<Proposal[]>([])
    const [productApplications, setProductApplications] = useState<ProductApplication[]>([])
    const [momentProposals, setMomentProposals] = useState<MomentProposal[]>([]) // [NEW] // FIXED
    const [isLoading, setIsLoading] = useState(false)
    const isFetching = useRef(false)

    // Log Proposal Loading
    useEffect(() => {
        if (isLoading) {
            window.dispatchEvent(new CustomEvent('app-log', { detail: { msg: '제안서 데이터 불러오는 중...', type: 'loading' } }))
        } else {
            window.dispatchEvent(new CustomEvent('app-log', { detail: { msg: '제안서 로드 완료', type: 'success' } }))
        }
    }, [isLoading])

    // [NEW] Optimistic Add
    const addMomentProposal = (proposal: MomentProposal) => {
        setMomentProposals(prev => [proposal, ...prev])
    }

    // Fetch creator proposals (applications to campaigns)
    // For Influencers: My applications
    // For Brands: Applications to My Campaigns
    const fetchCampaignProposals = async (targetUserId?: string, signal?: AbortSignal) => {
        const id = targetUserId || userId
        if (!id) return

        try {
            console.log(`[ProposalProvider] Fetching campaign proposals. User: ${id}, Type: ${userType}`)
            window.dispatchEvent(new CustomEvent('app-log', { detail: { msg: '캠페인 제안 데이터 불러오는 중...', type: 'loading' } }))

            // 1. Query for Influencer (My applications)
            const influencerQuery = supabase
                .from('campaign_applications')
                .select(`
                    *,
                    campaigns(id, title, product_name, category, budget, brand_id, profiles(display_name, avatar_url)),
                    profiles!influencer_id(display_name, avatar_url)
                `)
                .eq('influencer_id', id)
                .order('created_at', { ascending: false })
                .abortSignal(signal || null as any)

            // 2. Query for Brand (Applications to My Campaigns)
            const brandQuery = supabase
                .from('campaign_applications')
                .select(`
                    *,
                    campaigns!inner(id, title, product_name, category, budget, brand_id, profiles(display_name, avatar_url)),
                    profiles!influencer_id(display_name, avatar_url)
                `)
                .eq('campaigns.brand_id', id)
                .order('created_at', { ascending: false })
                .abortSignal(signal || null as any)

            const [influencerRes, brandRes] = await Promise.all([influencerQuery, brandQuery])

            // Handle errors
            if (influencerRes.error && !isIgnorableError(influencerRes.error)) {
                console.error('[ProposalProvider] Influencer campaign query error:', influencerRes.error)
            }
            if (brandRes.error && !isIgnorableError(brandRes.error)) {
                console.error('[ProposalProvider] Brand campaign query error:', brandRes.error)
            }

            const influencerData = influencerRes.data || []
            const brandData = brandRes.data || []

            // Deduplicate by ID
            const allDataMap = new Map()
            influencerData.forEach((p: any) => allDataMap.set(p.id, p))
            brandData.forEach((p: any) => allDataMap.set(p.id, p))
            const mergedData = Array.from(allDataMap.values()).sort((a: any, b: any) =>
                new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            )

            if (mergedData.length > 0) {
                window.dispatchEvent(new CustomEvent('app-log', { detail: { msg: `캠페인 제안 ${mergedData.length}건 로드 완료`, type: 'success' } }))
                const mapped: Proposal[] = mergedData.map((p: any) => {
                    return {
                        id: p.id,
                        type: 'creator_apply' as const,
                        dealType: 'ad',
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
                        // [FIX] Condition fields were missing from campaign_applications mapping
                        price_offer: p.price_offer,
                        special_terms: p.special_terms,
                        brand_condition_confirmed: p.brand_condition_confirmed,
                        influencer_condition_confirmed: p.influencer_condition_confirmed,
                        condition_product_receipt_date: p.condition_product_receipt_date,
                        condition_draft_submission_date: p.condition_draft_submission_date,
                        condition_final_submission_date: p.condition_final_submission_date,
                        condition_upload_date: p.condition_upload_date,
                        condition_secondary_usage_period: p.condition_secondary_usage_period,
                        secondary_usage_fee: p.secondary_usage_fee,
                        has_incentive: p.has_incentive,
                        incentive_detail: p.incentive_detail,

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
                        channel_name: p.channel_name,         // [FIX] 누락됐던 채널명
                        channel_subtype: p.channel_subtype,   // [NEW] 서브타입 (instagram_reels 등)
                        contract_content: p.contract_content,
                        contract_status: p.contract_status,
                        brand_signature: p.brand_signature,
                        influencer_signature: p.influencer_signature,
                        brand_signed_at: p.brand_signed_at,           // [FIX] Bug 4
                        influencer_signed_at: p.influencer_signed_at, // [FIX] Bug 4
                        receiver_name: p.receiver_name,
                        shipping_phone: p.shipping_phone,
                        shipping_address: p.shipping_address,
                        tracking_number: p.tracking_number,
                        delivery_status: p.delivery_status,

                        content_submission_url: p.content_submission_url,
                        content_submission_file_url: p.content_submission_file_url,
                        content_submission_status: p.content_submission_status,
                        content_submission_version: p.content_submission_version,
                        content_submission_date: p.content_submission_date,
                        content_final_url: p.content_final_url,
                        content_clean_url: p.content_clean_url,
                        content_final_approved_at: p.content_final_approved_at,
                        content_revision_requested_at: p.content_revision_requested_at,
                        workspace_id: p.workspace_id, // [Workspaces]
                        payment_confirmed_at: p.payment_confirmed_at, // [입금 확인 게이트]
                        campaign: p.campaigns
                    }
                })

                setCampaignProposals(mapped)
                console.log('[ProposalProvider] Loaded campaign proposals:', mapped.length)
            } else {
                setCampaignProposals([])
            }
        } catch (err) {
            console.error('[ProposalProvider] Exception:', err)
        }
    }

    // Fetch brand proposals (offers to influencers)
    const fetchProductApplications = async (targetUserId?: string, signal?: AbortSignal) => {
        const id = targetUserId || userId
        if (!id) return

        try {
            console.log('[ProposalProvider] Fetching brand & moment proposals...')

            const [brandRes, momentRes] = await Promise.all([
                supabase
                    .from('product_applications')
                    .select(`
                        *,
                        brand:profiles!brand_id(display_name, avatar_url),
                        influencer:profiles!influencer_id(display_name, avatar_url),
                        products:brand_products(name, image_url)
                    `)
                    .or(`brand_id.eq.${id},influencer_id.eq.${id}`)
                    .order('created_at', { ascending: false })
                    .abortSignal(signal || null as any),
                supabase
                    .from('moment_proposals')
                    .select(`
                        *,
                        brand:profiles!brand_id(display_name, avatar_url),
                        influencer:profiles!influencer_id(display_name, avatar_url),
                        moment:life_moments(title, event_date, channels)
                    `)
                    .or(`brand_id.eq.${id},influencer_id.eq.${id}`)
                    .order('created_at', { ascending: false })
                    .abortSignal(signal || null as any)
            ])

            const brandData = brandRes.data || []
            const momentData = momentRes.data || []

            if (brandRes.error) {
                const error = brandRes.error
                const isIgnorable = error.name === 'AbortError' || ((error.code === undefined || error.code === '') && (
                    error.message?.includes('AbortError') ||
                    error.message?.includes('aborted') ||
                    error.message === 'Failed to fetch' ||
                    error.details?.includes('AbortError')
                ))
                if (!isIgnorable) console.error('[ProposalProvider] Brand proposals error:', error)
            }

            if (momentRes.error) {
                const error = momentRes.error
                const isIgnorable = error.name === 'AbortError' || ((error.code === undefined || error.code === '') && (
                    error.message?.includes('AbortError') ||
                    error.message?.includes('aborted') ||
                    error.message === 'Failed to fetch' ||
                    error.details?.includes('AbortError')
                ))
                if (!isIgnorable) console.error('[ProposalProvider] Moment proposals error:', error)
            }

            const mappedBrand: ProductApplication[] = brandData.map((p: any) => ({
                id: p.id,
                type: 'brand_offer',
                brand_id: p.brand_id,
                influencer_id: p.influencer_id,
                event_id: p.event_id,
                product_id: p.product_id,
                product_name: p.product_name || p.products?.name,
                product_type: p.product_type,
                compensation_amount: p.compensation_amount,
                has_incentive: p.has_incentive,
                incentive_detail: p.incentive_detail,

                status: p.status,
                message: p.message,
                motivation: p.motivation,
                content_plan: p.content_plan,
                portfolio_links: p.portfolio_links,
                instagram_handle: p.instagram_handle,
                insight_screenshot: p.insight_screenshot,
                channel_name: p.channel_name,         // [FIX] 채널명
                channel_subtype: p.channel_subtype,   // [NEW] 서브타입
                created_at: p.created_at,
                updated_at: p.updated_at,
                brand_name: p.brand?.display_name,
                brandAvatar: p.brand?.avatar_url,
                influencer_name: p.influencer?.display_name,
                influencerName: p.influencer?.display_name,
                influencer_avatar: p.influencer?.avatar_url,
                influencerAvatar: p.influencer?.avatar_url,
                contract_content: p.contract_content,
                contract_status: p.contract_status,
                brand_signature: p.brand_signature,
                influencer_signature: p.influencer_signature,

                delivery_status: p.delivery_status,
                brand_condition_confirmed: p.brand_condition_confirmed,
                influencer_condition_confirmed: p.influencer_condition_confirmed,
                // [FIX] Condition fields were missing from mappedBrand
                price_offer: p.price_offer,
                special_terms: p.special_terms,
                condition_product_receipt_date: p.condition_product_receipt_date,
                condition_draft_submission_date: p.condition_draft_submission_date,
                condition_final_submission_date: p.condition_final_submission_date,
                condition_upload_date: p.condition_upload_date,
                condition_secondary_usage_period: p.condition_secondary_usage_period,
                secondary_usage_fee: p.secondary_usage_fee,
                content_submission_url: p.content_submission_url,
                content_submission_file_url: p.content_submission_file_url,
                content_submission_status: p.content_submission_status,
                content_submission_version: p.content_submission_version,
                content_submission_date: p.content_submission_date,
                content_final_url: p.content_final_url,
                content_clean_url: p.content_clean_url,
                content_final_approved_at: p.content_final_approved_at,
                content_revision_requested_at: p.content_revision_requested_at,
                product_url: p.products?.image_url,
                product: p.products,
                workspace_id: p.workspace_id, // [Workspaces]
                payment_confirmed_at: p.payment_confirmed_at // [입금 확인 게이트]
            }))

            const mappedMoment: ProductApplication[] = momentData.map((p: any) => ({
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

                status: p.status,
                message: p.message,

                // Map Conditions
                desired_date: p.desired_date || p.conditions?.desired_date,
                date_flexible: p.date_flexible || p.conditions?.date_flexible,
                video_guide: p.video_guide || p.conditions?.video_guide,
                // [FIX] price_offer and condition fields were missing from mappedMoment
                price_offer: p.price_offer,
                special_terms: p.special_terms || p.conditions?.special_terms,
                condition_product_receipt_date: p.condition_product_receipt_date || p.conditions?.condition_product_receipt_date,
                condition_draft_submission_date: p.condition_draft_submission_date || p.conditions?.condition_draft_submission_date,
                condition_final_submission_date: p.condition_final_submission_date || p.conditions?.condition_final_submission_date,
                condition_upload_date: p.condition_upload_date || p.conditions?.condition_upload_date,
                condition_secondary_usage_period: p.condition_secondary_usage_period || p.conditions?.condition_secondary_usage_period,
                secondary_usage_fee: p.secondary_usage_fee || p.conditions?.secondary_usage_fee,
                brand_condition_confirmed: p.brand_condition_confirmed,
                influencer_condition_confirmed: p.influencer_condition_confirmed,
                // Contract
                contract_content: p.contract_content,
                contract_status: p.contract_status,
                brand_signature: p.brand_signature,
                influencer_signature: p.influencer_signature,
                delivery_status: p.delivery_status,
                content_submission_url: p.content_submission_url,
                content_submission_file_url: p.content_submission_file_url,
                content_submission_status: p.content_submission_status,
                content_submission_version: p.content_submission_version,
                content_submission_date: p.content_submission_date,
                content_final_url: p.content_final_url,
                content_clean_url: p.content_clean_url,
                content_final_approved_at: p.content_final_approved_at,
                content_revision_requested_at: p.content_revision_requested_at,

                created_at: p.created_at,
                updated_at: p.updated_at,
                brand_name: p.brand?.display_name,
                brandAvatar: p.brand?.avatar_url,
                influencer_name: p.influencer?.display_name,
                influencerName: p.influencer?.display_name,
                influencer_avatar: p.influencer?.avatar_url,
                influencerAvatar: p.influencer?.avatar_url,

                // Moment Specific Context
                product_url: p.moment?.title ? `모먼트: ${p.moment.title}` : undefined,
                // [NEW] 모먼트의 채널 정보를 서브타입으로 매핑 (여러 채널 모두 포함)
                channel_subtype: (p.moment?.channels && p.moment.channels.length > 0)
                    ? p.moment.channels.join(',')   // e.g. "instagram_reels,youtube_shorts"
                    : null,
                channel_name: p.moment?.channels?.[0]?.split('_')[0] || null,
                workspace_id: p.workspace_id, // [Workspaces]
                payment_confirmed_at: p.payment_confirmed_at // [입금 확인 게이트]
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
                conditions: p.conditions,
                content_submission_url: p.content_submission_url,
                content_submission_file_url: p.content_submission_file_url,
                content_submission_status: p.content_submission_status,
                content_submission_version: p.content_submission_version,
                content_submission_date: p.content_submission_date,
                content_final_url: p.content_final_url,
                content_clean_url: p.content_clean_url,
                content_final_approved_at: p.content_final_approved_at,
                content_revision_requested_at: p.content_revision_requested_at,
                workspace_id: p.workspace_id, // [Workspaces]
                payment_confirmed_at: p.payment_confirmed_at, // [입금 확인 게이트]
                // [FIX] 배송/물류 필드 — 없으면 brand sync useEffect에서 undefined로 덮어씌워짐
                receiver_name: p.receiver_name,
                shipping_phone: p.shipping_phone,
                shipping_address: p.shipping_address,
                tracking_number: p.tracking_number,
                delivery_status: p.delivery_status,
            }))

            setMomentProposals(rawMomentProposals)
            console.log('[ProposalProvider] Loaded raw moment proposals:', rawMomentProposals.length)

            const finalBrand = [...mappedBrand, ...mappedMoment].sort((a, b) =>
                new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            )

            setProductApplications(finalBrand)
            console.log('[ProposalProvider] Loaded proposals:', {
                brand: mappedBrand.length,
                moment: mappedMoment.length
            })

        } catch (err) {
            console.error('[ProposalProvider] Exception:', err)
        }
    }

    // Fetch on mount
    useEffect(() => {
        const controller = new AbortController()
        const signal = controller.signal

        if (userId) {
            setIsLoading(true)
            Promise.all([
                fetchCampaignProposals(userId, signal),
                fetchProductApplications(userId, signal)
            ]).finally(() => {
                if (!signal.aborted) {
                    setIsLoading(false)
                }
            })
        } else {
            setCampaignProposals([])
            setProductApplications([])
            setMomentProposals([])
            setIsLoading(false)
        }

        return () => {
            controller.abort()
        }
    }, [userId]) // Primitive value enables parallel loading with other providers

    // [NEW] Realtime subscription for brand_proposals and moment_proposals
    // This ensures that when a brand updates conditions, the creator sees the changes immediately
    useEffect(() => {
        if (!userId) return

        const channel = supabase
            .channel(`proposal-updates-${userId}`)
            .on(
                'postgres_changes' as any,
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'product_applications',
                    filter: `influencer_id=eq.${userId}`
                },
                (payload: any) => {
                    console.log('[ProposalProvider] Realtime brand_proposal update:', payload.new.id)
                    // Update productApplications local state
                    setProductApplications(prev => prev.map(p =>
                        p.id === payload.new.id ? { ...p, ...payload.new } : p
                    ))
                    // Also update workspace store if this proposal is currently open
                    const currentProposal = useWorkspaceStore.getState().proposal
                    if (currentProposal && currentProposal.id === payload.new.id) {
                        useWorkspaceStore.getState().updateProposal(payload.new)
                    }
                }
            )
            .on(
                'postgres_changes' as any,
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'moment_proposals',
                    filter: `influencer_id=eq.${userId}`
                },
                (payload: any) => {
                    console.log('[ProposalProvider] Realtime moment_proposal update:', payload.new.id)
                    // Update momentProposals local state only (no longer merged into productApplications)
                    setMomentProposals(prev => prev.map(p =>
                        p.id === payload.new.id ? { ...p, ...payload.new } : p
                    ))
                    // Also update workspace store if this proposal is currently open
                    const currentProposal = useWorkspaceStore.getState().proposal
                    if (currentProposal && currentProposal.id === payload.new.id) {
                        useWorkspaceStore.getState().updateProposal(payload.new)
                    }
                }
            )
            .on(
                'postgres_changes' as any,
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'campaign_applications',
                    filter: `influencer_id=eq.${userId}`
                },
                (payload: any) => {
                    console.log('[ProposalProvider] Realtime campaign_application update:', payload.new.id)
                    // Update campaignProposals local state
                    setCampaignProposals(prev => prev.map(p =>
                        p.id === payload.new.id ? { ...p, ...payload.new } : p
                    ))
                    // Also update workspace store if this proposal is currently open
                    const currentProposal = useWorkspaceStore.getState().proposal
                    if (currentProposal && currentProposal.id === payload.new.id) {
                        useWorkspaceStore.getState().updateProposal(payload.new)
                    }
                }
            )
            .subscribe((status) => {
                console.log('[ProposalProvider] Realtime subscription status:', status)
            })

        return () => {
            supabase.removeChannel(channel)
        }
    }, [userId])

    // [NEW] Realtime subscription for brand-side: when creator updates influencer_condition_confirmed etc.
    // The existing subscription uses influencer_id=eq.userId (creator's perspective).
    // This subscription uses brand_id=eq.userId so brands see creator updates in real-time.
    useEffect(() => {
        if (!userId) return

        const channel = supabase
            .channel(`brand-side-updates-${userId}`)
            .on(
                'postgres_changes' as any,
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'product_applications',
                    filter: `brand_id=eq.${userId}`
                },
                (payload: any) => {
                    console.log('[ProposalProvider] Brand-side brand_proposal update:', payload.new.id)
                    setProductApplications(prev => prev.map(p =>
                        p.id === payload.new.id ? { ...p, ...payload.new } : p
                    ))
                    const currentProposal = useWorkspaceStore.getState().proposal
                    if (currentProposal && currentProposal.id === payload.new.id) {
                        useWorkspaceStore.getState().updateProposal(payload.new)
                    }
                }
            )
            .on(
                'postgres_changes' as any,
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'moment_proposals',
                    filter: `brand_id=eq.${userId}`
                },
                (payload: any) => {
                    console.log('[ProposalProvider] Brand-side moment_proposal update:', payload.new.id)
                    // Update momentProposals only (no longer merged into productApplications)
                    setMomentProposals(prev => prev.map(p =>
                        p.id === payload.new.id ? { ...p, ...payload.new } : p
                    ))
                    const currentProposal = useWorkspaceStore.getState().proposal
                    if (currentProposal && currentProposal.id === payload.new.id) {
                        useWorkspaceStore.getState().updateProposal(payload.new)
                    }
                }
            )
            .on(
                'postgres_changes' as any,
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'campaign_applications',
                    // campaign_applications에는 brand_id 컬럼이 없음
                    // 필터 없이 구독하되 campaignProposals 목록에 있는 ID만 처리
                },
                (payload: any) => {
                    console.log('[ProposalProvider] Brand-side campaign_application update:', payload.new.id)
                    // campaignProposals에 이 ID가 있는지 확인 (브랜드 소유 proposal인지 검증)
                    setCampaignProposals(prev => {
                        const isOurs = prev.some(p => p.id === payload.new.id)
                        if (!isOurs) return prev // 브랜드 소유가 아니면 무시
                        return prev.map(p =>
                            p.id === payload.new.id ? { ...p, ...payload.new } : p
                        )
                    })
                    const currentProposal = useWorkspaceStore.getState().proposal
                    if (currentProposal && currentProposal.id === payload.new.id) {
                        useWorkspaceStore.getState().updateProposal(payload.new)
                    }
                }
            )
            .subscribe((status) => {
                console.log('[ProposalProvider] Brand-side realtime status:', status)
            })

        return () => {
            supabase.removeChannel(channel)
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
                fetchProductApplications(id)
            ])
        } finally {
            setIsLoading(false)
        }
    }

    // Add proposal
    const addProposal = async (proposal: Partial<Proposal> & { influencerId?: string }) => {
        if (!userId) {
            throw new Error('User ID required')
        }

        try {
            console.log('[ProposalProvider] Creating proposal:', proposal)
            const targetInfluencerId = proposal.influencerId || userId

            // [AUDIT FIX] Fetch team_id for relevant user to ensure visibility
            const { data: teamMember } = await supabase
                .from('team_members')
                .select('team_id')
                .eq('user_id', userId)
                .single()
            const myTeamId = teamMember?.team_id

            // Distinguish between Campaign Application and Product Proposal
            if (proposal.campaignId) {
                // Campaign Proposal
                const { data, error } = await supabase
                    .from('campaign_applications')
                    .insert({
                        campaign_id: proposal.campaignId,
                        influencer_id: targetInfluencerId,
                        influencer_team_id: myTeamId,
                        price_offer: (proposal as any).priceOffer ?? proposal.cost,
                        message: proposal.message,
                        status: 'applied',
                        motivation: proposal.motivation,
                        content_plan: proposal.content_plan,
                        portfolio_links: proposal.portfolioLinks,
                        channel_name: proposal.channel_name,
                        channel_subtype: (proposal as any).channel_subtype,
                        instagram_handle: proposal.instagramHandle || (proposal.channel_name === 'instagram' ? proposal.channel_url : undefined),
                        insight_screenshot: proposal.insightScreenshot,
                        receiver_name: proposal.receiver_name,
                        shipping_address: proposal.shipping_address,
                        shipping_phone: proposal.shipping_phone
                    })
                    .select()
                    .single()

                if (error) throw error

                // 🔔 캠페인 브랜드에게 지원 알림
                try {
                    const { data: campaign } = await supabase
                        .from('campaigns')
                        .select('brand_id')
                        .eq('id', proposal.campaignId!)
                        .single()
                    if (campaign?.brand_id && data?.id) {
                        await supabase.from('notifications').insert({
                            recipient_id: campaign.brand_id,
                            sender_id: userId,
                            type: 'application_received',
                            content: `캠페인에 새로운 크리에이터가 지원했습니다. 확인해보세요!`,
                            reference_id: data.id.toString(),
                            is_read: false
                        })
                    }
                } catch (notifErr) {
                    console.warn('알림 발송 실패 (무시):', notifErr)
                }

                // [Workspaces] workspace row 생성 (campaign_applications에는 brand_id 없으므로 campaigns join 필요)
                try {
                    if (data?.id) {
                        const { data: campaign } = await supabase
                            .from('campaigns')
                            .select('brand_id')
                            .eq('id', proposal.campaignId!)
                            .single()
                        if (campaign?.brand_id) {
                            const { data: ws } = await supabase
                                .from('workspaces')
                                .insert({
                                    brand_id: campaign.brand_id,
                                    influencer_id: targetInfluencerId,
                                    proposal_type: 'campaign_application',
                                    proposal_id: data.id.toString()
                                })
                                .select('id')
                                .single()
                            if (ws?.id) {
                                await supabase
                                    .from('campaign_applications')
                                    .update({ workspace_id: ws.id })
                                    .eq('id', data.id)
                            }
                        }
                    }
                } catch (wsErr) {
                    console.warn('[ProposalProvider] workspace 생성 실패 (무시):', wsErr)
                }

            } else if (proposal.momentId) {
                // Moment Proposal
                console.log('[ProposalProvider] Submitting Moment Proposal:', proposal)
                const { data, error } = await supabase
                    .from('moment_proposals')
                    .insert({
                        brand_id: userId,
                        brand_team_id: myTeamId,
                        influencer_id: proposal.toId || proposal.influencerId,
                        influencer_team_id: null,
                        moment_id: proposal.momentId,
                        message: proposal.message,
                        price_offer: proposal.cost,
                        status: 'offered',
                        conditions: {
                            group: 'moment_proposal',
                            product_name: proposal.productName,
                            product_type: "gift",
                            has_incentive: false,
                            incentive_detail: null,

                            desired_date: proposal.date,
                            date_flexible: false,
                            condition_draft_submission_date: proposal.condition_draft_submission_date,
                            condition_final_submission_date: proposal.condition_final_submission_date,
                            condition_upload_date: proposal.condition_upload_date,
                            condition_secondary_usage_period: proposal.condition_secondary_usage_period,
                            secondary_usage_fee: proposal.secondary_usage_fee || 0,
                        }
                    })
                    .select()
                    .single()

                if (error) throw error

                // 🔔 크리에이터에게 모먼트 제안 알림
                try {
                    const recipientId = proposal.toId || proposal.influencerId
                    if (recipientId && data?.id) {
                        await supabase.from('notifications').insert({
                            recipient_id: recipientId,
                            sender_id: userId,
                            type: 'proposal_received',
                            content: `브랜드에서 새 협업 제안이 도착했습니다. 확인해보세요!`,
                            reference_id: data.id.toString(),
                            is_read: false
                        })
                    }
                } catch (notifErr) {
                    console.warn('알림 발송 실패 (무시):', notifErr)
                }

                // [Workspaces] workspace row 생성
                try {
                    const recipientId = proposal.toId || proposal.influencerId
                    if (data?.id && recipientId) {
                        const { data: ws } = await supabase
                            .from('workspaces')
                            .insert({
                                brand_id: userId,
                                influencer_id: recipientId,
                                proposal_type: 'moment_proposal',
                                proposal_id: data.id.toString()
                            })
                            .select('id')
                            .single()
                        if (ws?.id) {
                            await supabase
                                .from('moment_proposals')
                                .update({ workspace_id: ws.id })
                                .eq('id', data.id)
                        }
                    }
                } catch (wsErr) {
                    console.warn('[ProposalProvider] workspace 생성 실패 (무시):', wsErr)
                }

            } else if (proposal.productId) {
                // Brand Product Proposal
                if (!proposal.toId) {
                    throw new Error('brand_id(toId) is required for brand product proposal')
                }
                const { data, error } = await supabase
                    .from('product_applications')
                    .insert({
                        influencer_id: userId,
                        influencer_team_id: myTeamId,
                        brand_id: proposal.toId,
                        product_id: proposal.productId,
                        product_name: (proposal as any).productName || "Brand Product",
                        message: proposal.message || (proposal as any).requestDetails,
                        status: 'applied',
                        instagram_handle: proposal.instagramHandle || (proposal.channel_name === 'instagram' ? proposal.channel_url : undefined),
                        channel_name: proposal.channel_name,
                        channel_subtype: (proposal as any).channel_subtype,
                        insight_screenshot: proposal.insightScreenshot,
                        product_type: 'ad',
                        price_offer: proposal.cost ?? 0,
                        compensation_amount: proposal.cost?.toString(),
                        motivation: proposal.motivation,
                        content_plan: proposal.content_plan,
                        portfolio_links: proposal.portfolioLinks,
                        receiver_name: proposal.receiver_name,
                        shipping_address: proposal.shipping_address,
                        shipping_phone: proposal.shipping_phone
                    })
                    .select()
                    .single()

                if (error) throw error

                // 🔔 브랜드에게 제품 지원 알림
                try {
                    if (proposal.toId && data?.id) {
                        await supabase.from('notifications').insert({
                            recipient_id: proposal.toId,
                            sender_id: userId,
                            type: 'application_received',
                            content: `브랜드 제품에 새로운 크리에이터가 지원했습니다.`,
                            reference_id: data.id.toString(),
                            is_read: false
                        })
                    }
                } catch (notifErr) {
                    console.warn('알림 발송 실패 (무시):', notifErr)
                }

                // [Workspaces] workspace row 생성
                try {
                    if (data?.id && proposal.toId) {
                        const { data: ws } = await supabase
                            .from('workspaces')
                            .insert({
                                brand_id: proposal.toId,
                                influencer_id: userId,
                                proposal_type: 'product_application',
                                proposal_id: data.id.toString()
                            })
                            .select('id')
                            .single()
                        if (ws?.id) {
                            await supabase
                                .from('product_applications')
                                .update({ workspace_id: ws.id })
                                .eq('id', data.id)
                        }
                    }
                } catch (wsErr) {
                    console.warn('[ProposalProvider] workspace 생성 실패 (무시):', wsErr)
                }
            } // end else if (proposal.productId)

            await fetchCampaignProposals(userId)
            await fetchProductApplications(userId)
        } catch (error: any) {
            console.error('[ProposalProvider] Add error (full):', JSON.stringify(error, null, 2))
            console.error('[ProposalProvider] Add error message:', error?.message)
            console.error('[ProposalProvider] Add error code:', error?.code)
            console.error('[ProposalProvider] Add error details:', error?.details)
            console.error('[ProposalProvider] Add error hint:', error?.hint)
            throw error
        }
    }

    // Update creator proposal (campaign_applications)
    const updateProposal = async (id: string | number, updates: Partial<Proposal>): Promise<boolean> => {
        try {
            console.log('[ProposalProvider] Updating campaign proposal:', id, updates)

            const dbUpdates: any = {}
            if (updates.status) dbUpdates.status = updates.status
            if (updates.delivery_status) dbUpdates.delivery_status = updates.delivery_status
            if (updates.receiver_name) dbUpdates.receiver_name = updates.receiver_name
            if (updates.tracking_number) dbUpdates.tracking_number = updates.tracking_number
            if (updates.shipping_phone) dbUpdates.shipping_phone = updates.shipping_phone
            if (updates.shipping_address) dbUpdates.shipping_address = updates.shipping_address
            if (updates.content_submission_url) dbUpdates.content_submission_url = updates.content_submission_url
            if (updates.content_submission_file_url) dbUpdates.content_submission_file_url = updates.content_submission_file_url
            if (updates.content_submission_status) dbUpdates.content_submission_status = updates.content_submission_status
            if (updates.content_submission_version) dbUpdates.content_submission_version = updates.content_submission_version
            if (updates.content_submission_date) dbUpdates.content_submission_date = updates.content_submission_date
            if (updates.content_final_url) dbUpdates.content_final_url = updates.content_final_url
            if (updates.content_clean_url) dbUpdates.content_clean_url = updates.content_clean_url
            // Video review fields — !== undefined를 써서 null도 저장 가능
            if ((updates as any).content_final_approved_at !== undefined) dbUpdates.content_final_approved_at = (updates as any).content_final_approved_at
            if ((updates as any).content_revision_requested_at !== undefined) dbUpdates.content_revision_requested_at = (updates as any).content_revision_requested_at

            // Contract & Signatures — use !== undefined to allow null (undo)
            if ((updates as any).contract_status !== undefined) dbUpdates.contract_status = (updates as any).contract_status
            if ((updates as any).contract_content !== undefined) dbUpdates.contract_content = (updates as any).contract_content
            if ((updates as any).brand_signature !== undefined) dbUpdates.brand_signature = (updates as any).brand_signature
            if ((updates as any).influencer_signature !== undefined) dbUpdates.influencer_signature = (updates as any).influencer_signature
            if ((updates as any).brand_signed_at !== undefined) dbUpdates.brand_signed_at = (updates as any).brand_signed_at
            if ((updates as any).influencer_signed_at !== undefined) dbUpdates.influencer_signed_at = (updates as any).influencer_signed_at

            // Condition fields
            if (updates.price_offer !== undefined) dbUpdates.price_offer = updates.price_offer
            if ((updates as any).special_terms !== undefined) dbUpdates.special_terms = (updates as any).special_terms
            if ((updates as any).condition_product_receipt_date) dbUpdates.condition_product_receipt_date = (updates as any).condition_product_receipt_date
            if ((updates as any).condition_draft_submission_date) dbUpdates.condition_draft_submission_date = (updates as any).condition_draft_submission_date
            if ((updates as any).condition_final_submission_date) dbUpdates.condition_final_submission_date = (updates as any).condition_final_submission_date
            if ((updates as any).condition_upload_date) dbUpdates.condition_upload_date = (updates as any).condition_upload_date
            if ((updates as any).condition_secondary_usage_period) dbUpdates.condition_secondary_usage_period = (updates as any).condition_secondary_usage_period
            if ((updates as any).secondary_usage_fee !== undefined) dbUpdates.secondary_usage_fee = (updates as any).secondary_usage_fee
            if ((updates as any).channel_name) dbUpdates.channel_name = (updates as any).channel_name
            if ((updates as any).channel_subtype !== undefined) dbUpdates.channel_subtype = (updates as any).channel_subtype
            if ((updates as any).brand_condition_confirmed !== undefined) dbUpdates.brand_condition_confirmed = (updates as any).brand_condition_confirmed
            if ((updates as any).influencer_condition_confirmed !== undefined) dbUpdates.influencer_condition_confirmed = (updates as any).influencer_condition_confirmed

            const { error } = await supabase
                .from('campaign_applications')
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
    const updateProductApplication = async (id: string | number, updates: Partial<ProductApplication>): Promise<boolean> => {
        try {
            console.log('[ProposalProvider] Updating brand proposal:', id, updates)

            const dbUpdates: any = {}
            // Status & Logistics
            if (updates.status) dbUpdates.status = updates.status
            if (updates.delivery_status) dbUpdates.delivery_status = updates.delivery_status
            if (updates.receiver_name) dbUpdates.receiver_name = updates.receiver_name
            if (updates.shipping_phone) dbUpdates.shipping_phone = updates.shipping_phone
            if (updates.shipping_address) dbUpdates.shipping_address = updates.shipping_address
            if (updates.tracking_number) dbUpdates.tracking_number = updates.tracking_number
            if (updates.content_submission_url) dbUpdates.content_submission_url = updates.content_submission_url
            if (updates.content_submission_file_url) dbUpdates.content_submission_file_url = updates.content_submission_file_url
            if (updates.content_submission_status) dbUpdates.content_submission_status = updates.content_submission_status
            if (updates.content_submission_version) dbUpdates.content_submission_version = updates.content_submission_version
            if (updates.content_submission_date) dbUpdates.content_submission_date = updates.content_submission_date
            if (updates.content_final_url) dbUpdates.content_final_url = updates.content_final_url
            if (updates.content_clean_url) dbUpdates.content_clean_url = updates.content_clean_url
            // Video review fields — !== undefined를 써서 null도 저장 가능 (content_revision_requested_at = null 취소 때)
            if ((updates as any).content_final_approved_at !== undefined) dbUpdates.content_final_approved_at = (updates as any).content_final_approved_at
            if ((updates as any).content_revision_requested_at !== undefined) dbUpdates.content_revision_requested_at = (updates as any).content_revision_requested_at

            // Contract & Signatures — use !== undefined to allow null (undo)
            if ((updates as any).contract_status !== undefined) dbUpdates.contract_status = (updates as any).contract_status
            if ((updates as any).contract_content !== undefined) dbUpdates.contract_content = (updates as any).contract_content
            if ((updates as any).brand_signature !== undefined) dbUpdates.brand_signature = (updates as any).brand_signature
            if ((updates as any).influencer_signature !== undefined) dbUpdates.influencer_signature = (updates as any).influencer_signature
            if ((updates as any).brand_signed_at !== undefined) dbUpdates.brand_signed_at = (updates as any).brand_signed_at
            if ((updates as any).influencer_signed_at !== undefined) dbUpdates.influencer_signed_at = (updates as any).influencer_signed_at

            // Confirmations
            if (updates.brand_condition_confirmed !== undefined) dbUpdates.brand_condition_confirmed = updates.brand_condition_confirmed
            if (updates.influencer_condition_confirmed !== undefined) dbUpdates.influencer_condition_confirmed = updates.influencer_condition_confirmed

            // Conditions
            if (updates.price_offer !== undefined) dbUpdates.price_offer = updates.price_offer
            if (updates.compensation_amount !== undefined) dbUpdates.compensation_amount = updates.compensation_amount
            if (updates.product_name) dbUpdates.product_name = updates.product_name
            if ((updates as any).product_type) dbUpdates.product_type = (updates as any).product_type
            if (updates.special_terms !== undefined) dbUpdates.special_terms = updates.special_terms
            if (updates.has_incentive !== undefined) dbUpdates.has_incentive = updates.has_incentive
            if (updates.incentive_detail !== undefined) dbUpdates.incentive_detail = updates.incentive_detail
            if ((updates as any).channel_name) dbUpdates.channel_name = (updates as any).channel_name
            if ((updates as any).channel_subtype !== undefined) dbUpdates.channel_subtype = (updates as any).channel_subtype
            // Dates
            if (updates.condition_product_receipt_date) dbUpdates.condition_product_receipt_date = updates.condition_product_receipt_date
            if (updates.condition_draft_submission_date) dbUpdates.condition_draft_submission_date = updates.condition_draft_submission_date
            if (updates.condition_final_submission_date) dbUpdates.condition_final_submission_date = updates.condition_final_submission_date
            if (updates.condition_upload_date) dbUpdates.condition_upload_date = updates.condition_upload_date
            if (updates.condition_secondary_usage_period) dbUpdates.condition_secondary_usage_period = updates.condition_secondary_usage_period
            if (updates.secondary_usage_fee !== undefined) dbUpdates.secondary_usage_fee = updates.secondary_usage_fee

            const { error } = await supabase
                .from('product_applications')
                .update(dbUpdates)
                .eq('id', id)

            if (error) {
                console.error('[ProposalProvider] Update error:', error)
                return false
            }

            // Update local state
            setProductApplications(prev => prev.map(p =>
                p.id === id ? { ...p, ...updates } : p
            ))

            return true
        } catch (error: any) {
            console.error('[ProposalProvider] Update error:', error)
            return false
        }
    }

    // [NEW] Update Moment Proposal
    const updateMomentProposal = async (id: string | number, updates: Partial<MomentProposal>): Promise<boolean> => {
        try {
            console.log('[ProposalProvider] Updating moment proposal:', id, updates)

            const dbUpdates: any = {}
            // Status & Logistics
            if (updates.status) dbUpdates.status = updates.status
            if (updates.delivery_status) dbUpdates.delivery_status = updates.delivery_status
            if (updates.receiver_name) dbUpdates.receiver_name = updates.receiver_name
            if (updates.tracking_number) dbUpdates.tracking_number = updates.tracking_number
            if (updates.shipping_address) dbUpdates.shipping_address = updates.shipping_address
            if (updates.shipping_phone) dbUpdates.shipping_phone = updates.shipping_phone

            // Contract & Signatures — use !== undefined to allow null (undo)
            if ((updates as any).contract_status !== undefined) dbUpdates.contract_status = (updates as any).contract_status
            if ((updates as any).contract_content !== undefined) dbUpdates.contract_content = (updates as any).contract_content
            if ((updates as any).brand_signature !== undefined) dbUpdates.brand_signature = (updates as any).brand_signature
            if ((updates as any).influencer_signature !== undefined) dbUpdates.influencer_signature = (updates as any).influencer_signature
            if ((updates as any).brand_signed_at !== undefined) dbUpdates.brand_signed_at = (updates as any).brand_signed_at
            if ((updates as any).influencer_signed_at !== undefined) dbUpdates.influencer_signed_at = (updates as any).influencer_signed_at

            // Conditions
            if (updates.price_offer !== undefined) dbUpdates.price_offer = updates.price_offer
            if (updates.compensation_amount !== undefined) dbUpdates.compensation_amount = updates.compensation_amount
            if (updates.product_name) dbUpdates.product_name = updates.product_name
            if (updates.product_type) dbUpdates.product_type = updates.product_type
            if (updates.has_incentive !== undefined) dbUpdates.has_incentive = updates.has_incentive
            if (updates.incentive_detail !== undefined) dbUpdates.incentive_detail = updates.incentive_detail
            if ((updates as any).channel_name) dbUpdates.channel_name = (updates as any).channel_name
            if ((updates as any).channel_subtype !== undefined) dbUpdates.channel_subtype = (updates as any).channel_subtype
            if (updates.message) dbUpdates.message = updates.message
            if (updates.special_terms !== undefined) dbUpdates.special_terms = updates.special_terms

            // Dates
            if (updates.condition_product_receipt_date) dbUpdates.condition_product_receipt_date = updates.condition_product_receipt_date
            if (updates.condition_draft_submission_date) dbUpdates.condition_draft_submission_date = updates.condition_draft_submission_date
            if (updates.condition_final_submission_date) dbUpdates.condition_final_submission_date = updates.condition_final_submission_date
            if (updates.condition_upload_date) dbUpdates.condition_upload_date = updates.condition_upload_date
            if (updates.condition_secondary_usage_period) dbUpdates.condition_secondary_usage_period = updates.condition_secondary_usage_period
            if (updates.secondary_usage_fee !== undefined) dbUpdates.secondary_usage_fee = updates.secondary_usage_fee
            if (updates.condition_maintenance_period) dbUpdates.condition_maintenance_period = updates.condition_maintenance_period

            // Confirmations
            if (updates.brand_condition_confirmed !== undefined) dbUpdates.brand_condition_confirmed = updates.brand_condition_confirmed
            if (updates.influencer_condition_confirmed !== undefined) dbUpdates.influencer_condition_confirmed = updates.influencer_condition_confirmed

            // Submissions
            if (updates.content_submission_url) dbUpdates.content_submission_url = updates.content_submission_url
            if ((updates as any).content_submission_file_url) dbUpdates.content_submission_file_url = (updates as any).content_submission_file_url
            if (updates.content_submission_status) dbUpdates.content_submission_status = updates.content_submission_status
            if ((updates as any).content_submission_version) dbUpdates.content_submission_version = (updates as any).content_submission_version
            if ((updates as any).content_submission_date) dbUpdates.content_submission_date = (updates as any).content_submission_date
            if ((updates as any).content_final_url) dbUpdates.content_final_url = (updates as any).content_final_url
            if ((updates as any).content_clean_url) dbUpdates.content_clean_url = (updates as any).content_clean_url
            // Video review fields
            if ((updates as any).content_final_approved_at !== undefined) dbUpdates.content_final_approved_at = (updates as any).content_final_approved_at
            if ((updates as any).content_revision_requested_at !== undefined) dbUpdates.content_revision_requested_at = (updates as any).content_revision_requested_at

            // 클라이언트 RLS 우회: 서버 API로 업데이트
            const res = await fetch('/api/moment-proposals/update', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, updates: dbUpdates }),
            })
            const json = await res.json()

            if (!res.ok || json.error) {
                console.error('[Moment] API update error:', json.error)
                return false
            }

            // Update local state
            setMomentProposals(prev => prev.map(p =>
                p.id === id ? { ...p, ...updates } : p
            ))

            return true
        } catch (error: any) {
            console.error('[ProposalProvider] Update Moment error:', error)
            return false
        }
    }

    // Delete brand proposal
    const deleteProductApplication = async (id: string | number) => {
        try {
            console.log('[ProposalProvider] Deleting brand proposal:', id)

            const { error } = await supabase
                .from('product_applications')
                .delete()
                .eq('id', id)

            if (error) {
                console.error('[ProposalProvider] Delete error:', error)
                throw error
            }

            setProductApplications(prev => prev.filter(p => p.id !== id))
            console.log('[ProposalProvider] Brand proposal deleted')
        } catch (error: any) {
            console.error('[ProposalProvider] Delete error:', error)
            throw error
        }
    }

    // Delete moment proposal
    const deleteMomentProposal = async (id: string | number) => {
        try {
            console.log('[ProposalProvider] Deleting moment proposal:', id)

            const { error } = await supabase
                .from('moment_proposals')
                .delete()
                .eq('id', id)

            if (error) {
                console.error('[ProposalProvider] Delete Moment error:', error)
                throw error
            }

            setMomentProposals(prev => prev.filter(p => p.id !== id))
            console.log('[ProposalProvider] Moment proposal deleted')
        } catch (error: any) {
            console.error('[ProposalProvider] Delete Moment error:', error)
            throw error
        }
    }

    // [NEW] Create Brand Proposal (Snake case wrapper)
    const createProductApplication = async (proposal: any) => {
        // Map to camelCase for addProposal if possible, or just insert directly
        // The previous implementation utilized direct insert to 'product_applications'
        // We will try to rely on direct insert here for maximum compatibility with legacy code
        try {
            // [AUDIT FIX] Fetch team_id
            const { data: teamMember } = await supabase
                .from('team_members')
                .select('team_id')
                .eq('user_id', userId)
                .single()
            const myTeamId = teamMember?.team_id

            const payload = { ...proposal }

            // Inject team_id based on role
            if (userId && payload.brand_id === userId) {
                payload.brand_team_id = myTeamId
            } else if (userId && payload.influencer_id === userId) {
                payload.influencer_team_id = myTeamId
            }

            const { data, error } = await supabase
                .from('product_applications')
                .insert(payload)
                .select()
                .single()

            if (error) throw error

            // [Workspaces] workspace row 생성
            try {
                if (data?.id) {
                    const brandId = payload.brand_id
                    const influencerId = payload.influencer_id
                    if (brandId && influencerId) {
                        const { data: ws } = await supabase
                            .from('workspaces')
                            .insert({
                                brand_id: brandId,
                                influencer_id: influencerId,
                                proposal_type: 'product_application',
                                proposal_id: data.id.toString()
                            })
                            .select('id')
                            .single()
                        if (ws?.id) {
                            await supabase
                                .from('product_applications')
                                .update({ workspace_id: ws.id })
                                .eq('id', data.id)
                            data.workspace_id = ws.id // reflect in returned data
                        }
                    }
                }
            } catch (wsErr) {
                console.warn('[ProposalProvider] workspace 생성 실패 (무시):', wsErr)
            }

            setProductApplications(prev => [data, ...prev])
            return data
        } catch (error) {
            console.error('[ProposalProvider] createProductApplication error:', error)
            throw error
        }
    }

    // [NEW] Create Moment Proposal (Snake case wrapper)
    const createMomentProposal = async (proposal: any) => {
        try {
            // [AUDIT FIX] Fetch team_id
            const { data: teamMember } = await supabase
                .from('team_members')
                .select('team_id')
                .eq('user_id', userId)
                .single()
            const myTeamId = teamMember?.team_id

            const payload = { ...proposal }

            // Inject team_id based on role
            if (userId && payload.brand_id === userId) {
                payload.brand_team_id = myTeamId
            } else if (userId && payload.influencer_id === userId) {
                payload.influencer_team_id = myTeamId
            }

            const { data, error } = await supabase
                .from('moment_proposals')
                .insert(payload)
                .select()
                .single()

            if (error) throw error

            // [Workspaces] workspace row 생성
            try {
                if (data?.id) {
                    const brandId = payload.brand_id
                    const influencerId = payload.influencer_id
                    if (brandId && influencerId) {
                        const { data: ws } = await supabase
                            .from('workspaces')
                            .insert({
                                brand_id: brandId,
                                influencer_id: influencerId,
                                proposal_type: 'moment_proposal',
                                proposal_id: data.id.toString()
                            })
                            .select('id')
                            .single()
                        if (ws?.id) {
                            await supabase
                                .from('moment_proposals')
                                .update({ workspace_id: ws.id })
                                .eq('id', data.id)
                            data.workspace_id = ws.id // reflect in returned data
                        }
                    }
                }
            } catch (wsErr) {
                console.warn('[ProposalProvider] workspace 생성 실패 (무시):', wsErr)
            }

            setMomentProposals(prev => [data, ...prev])
            return data
        } catch (error) {
            console.error('[ProposalProvider] createMomentProposal error:', error)
            throw error
        }
    }

    return (
        <ProposalContext.Provider value={{
            campaignProposals,
            productApplications,
            momentProposals, // [NEW]
            addMomentProposal, // [NEW]
            isLoading,
            addProposal,
            updateProposal,
            updateProductApplication,
            updateMomentProposal, // [NEW]
            deleteProductApplication,
            deleteMomentProposal, // [NEW]
            createProductApplication, // [NEW]
            createMomentProposal, // [NEW]
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
