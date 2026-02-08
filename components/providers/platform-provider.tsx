"use client"

import React, { createContext, useContext, useEffect, useState } from "react"

// --- Types ---
// --- Types ---
export type User = {
    id: string
    name: string
    type: "brand" | "influencer" | "admin"
    avatar?: string
    bio?: string
    tags?: string[]
    website?: string
    handle?: string
    followers?: number
    phone?: string
    address?: string
    isMock?: boolean

    // Rate Card
    priceVideo?: number
    priceFeed?: number
    secondaryRights?: number
    usageRightsMonth?: number
    usageRightsPrice?: number
    autoDmMonth?: number
    autoDmPrice?: number
}

export type Notification = {
    id: string
    recipient_id: string
    sender_id?: string
    type: string
    content: string
    reference_id?: string
    is_read: boolean
    created_at: string
}

export type Campaign = {
    id: number | string
    brandId?: string
    brand: string // For now, we'll hardcode or randomise this
    product: string
    category: string
    budget: string
    target: string
    description: string
    matchScore?: number // Mock score
    date: string // Created date
    eventDate?: string
    postingDate?: string
    targetProduct?: string
    status?: string // 'active' | 'completed' | 'paused'
    isMock?: boolean
}

export type Favorite = {
    id: string
    user_id: string
    target_id: string
    target_type: 'product' | 'campaign' | 'profile' | 'event'
    created_at: string
}

export type InfluencerEvent = {
    id: string
    influencer: string // In DB this is joined from profiles, locally it's string name
    influencerId?: string // Link to actual user ID
    handle: string
    avatar: string
    priceVideo?: number
    category: string
    event: string // Mapped to 'title' in DB
    date: string // Created date (or event date? logic specific)
    description: string
    tags: string[]
    verified: boolean
    followers: number
    targetProduct: string // 희망하는 광고 제품
    eventDate: string // 이벤트 날짜 (e.g. 2026년 3월)
    postingDate?: string // 콘텐츠 업로드 시기 (e.g. 2026년 4월)
    guide?: string
    status?: string // 'active' | 'completed' - 모먼트 상태
    isMock?: boolean
    isPrivate?: boolean
    schedule?: {
        product_delivery?: string
        draft_submission?: string
        shooting?: string
        feedback?: string
        upload?: string
    }
}

export type Product = {
    id: string
    brandId: string
    brandName?: string
    name: string
    price: number
    image: string // image_url
    link: string // website_url
    points: string // selling_points
    shots: string // required_shots
    category: string
    description?: string // description
    contentGuide?: string // content_guide (NEW)
    formatGuide?: string // format_guide (NEW)
    tags?: string[] // tags (NEW)
    accountTag?: string // account_tag (NEW)
    createdAt?: string
    isMock?: boolean
}

export type Proposal = {
    id: number | string
    type: 'brand_invite' | 'creator_apply' // 누가 먼저 제안했는지
    dealType: 'ad' | 'gonggu' // 광고 vs 공구

    // Brand Invite Specific
    eventId?: number | string
    productId?: string
    requestDetails?: string

    // Creator Apply Specific
    campaignId?: string
    campaignName?: string
    productName?: string
    influencerId?: string
    influencerName?: string
    influencerAvatar?: string
    brandId?: string
    brandName?: string

    cost?: number // 희망 광고비
    commission?: number // 희망 수수료 (%)
    message?: string

    // Status Flow
    status: 'applied' | 'accepted' | 'rejected' | 'negotiating' | 'pending' | 'hold'

    // Negotiation
    negotiationBase?: number
    negotiationIncentive?: string

    fromId?: string
    toId?: string
    date: string
    created_at?: string
    completed_at?: string

    content_submission_version?: number

    // Content Submission 2
    content_submission_url_2?: string
    content_submission_file_url_2?: string
    content_submission_status_2?: string
    content_submission_date_2?: string
    content_submission_version_2?: number

    // Condition Fields
    condition_product_receipt_date?: string
    condition_plan_sharing_date?: string
    condition_draft_submission_date?: string
    condition_final_submission_date?: string
    condition_upload_date?: string
    condition_maintenance_period?: string
    condition_secondary_usage_period?: string
}



export type BrandProposal = {
    id: string
    brand_id: string
    influencer_id: string

    // Restoring fields that might be used
    product_name?: string
    product_type?: string
    compensation_amount?: string
    has_incentive?: boolean
    incentive_detail?: string
    content_type?: string

    product_id?: string
    campaign_id?: string
    status: string
    message?: string
    cost?: number
    created_at: string
    updated_at: string
    brand_name?: string
    influencer_name?: string
    influencer_avatar?: string

    payout_status?: string
    contract_status?: string
    delivery_status?: string
    brand_condition_confirmed?: boolean
    influencer_condition_confirmed?: boolean

    // Condition Fields
    condition_product_receipt_date?: string
    condition_plan_sharing_date?: string
    condition_draft_submission_date?: string
    condition_final_submission_date?: string
    condition_upload_date?: string
    condition_maintenance_period?: string
    condition_secondary_usage_period?: string

    content_submission_file_url?: string
    content_submission_url?: string
    content_submission_status?: string
    content_submission_date?: string
    content_submission_version?: number

    completed_at?: string

    // Content Submission 2
    content_submission_url_2?: string
    content_submission_file_url_2?: string
    content_submission_status_2?: 'pending' | 'submitted' | 'approved' | 'rejected'
    content_submission_date_2?: string
    content_submission_version_2?: number

    // Product Card
    product_url?: string
    product?: any
}



// --- Initial Mock Data ---
import { MOCK_PRODUCTS, MOCK_EVENTS, MOCK_BRAND_PROPOSALS, MOCK_MESSAGES } from "@/lib/mock-data"
import { createClient } from "@/lib/supabase/client"

export const MOCK_INFLUENCER_USER: User = {
    id: "guest_influencer",
    // ... (lines 187-670 skipped for brevity in replacement, but I need to position correctly)
    // I will use multiple chunks or a larger chunk.
    // Actually I'll split into two replacements.
    // First: Type definition.
    // Then: Fetch query.

    name: "김수민",
    type: "influencer",
    handle: "@im_breath_ing",
    followers: 5851,
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop",
    bio: "안녕하세요! 일상을 기록하는 크리에이터 김수민입니다.",
    tags: ["💄 뷰티", "✈️ 여행", "🥗 다이어트", "💍 웨딩/결혼"],
    phone: "010-0000-0000",
    address: "서울특별시 강남구 테헤란로 123",
    isMock: true
}

export const MOCK_BRAND_USER: User = {
    id: "guest_brand",
    name: "CreadyPick",
    type: "brand",
    handle: "@creadypick",
    website: "https://www.creadypick.co.kr",
    avatar: "https://images.unsplash.com/photo-1614680376593-902f74cf0d41?w=400&h=400&fit=crop",
    bio: "완벽한 광고를 위해 준비된 크리에이터를 완벽한 광고를 원하는 브랜드와 연결시켜 줍니다.\n데이터 기반의 매칭으로 최적의 파트너를 찾아드려요.\n누구나 쉽고 빠르게 시작하는 인플루언서 마케팅 플랫폼.",
    phone: "02-1234-5678",
    address: "서울특별시 강남구 역삼동 789-1",
    isMock: true
}

const INITIAL_PRODUCTS: Product[] = []
const INITIAL_EVENTS: InfluencerEvent[] = []
const INITIAL_PROPOSALS: BrandProposal[] = []
const INITIAL_MESSAGES: Message[] = []
const INITIAL_CAMPAIGNS: Campaign[] = []



// --- Context    // --- Message Logic ---
export type Message = {
    id: string
    senderId: string
    receiverId: string
    proposalId?: string // Optional link to a specific proposal
    brandProposalId?: string // Optional link to a specific brand proposal
    content: string
    timestamp: string
    read: boolean
    senderName?: string
    senderAvatar?: string
    receiverName?: string
    receiverAvatar?: string
    influencer_avatar?: string
    isMock?: boolean
}

export interface SubmissionFeedback {
    id: string
    proposal_id?: string
    brand_proposal_id?: string
    sender_id: string
    content: string
    created_at: string
    // Optional sender info for UI
    sender_name?: string
    sender_avatar?: string
}

interface PlatformContextType {
    user: User | null
    login: (id: string, pw: string) => Promise<User>
    logout: () => void
    updateUser: (data: Partial<User>) => Promise<void>
    campaigns: Campaign[]
    addCampaign: (campaign: Omit<Campaign, "id" | "date" | "matchScore">) => void
    deleteCampaign: (id: string | number) => void
    events: InfluencerEvent[]
    addEvent: (event: Omit<InfluencerEvent, "id" | "influencer" | "influencerId" | "handle" | "avatar" | "verified" | "followers">) => Promise<boolean>
    updateEvent: (id: string, data: Partial<InfluencerEvent>) => Promise<void>
    deleteEvent: (id: string) => Promise<void>

    products: Product[]
    addProduct: (product: Omit<Product, "id" | "brandId" | "brandName">) => void
    updateProduct: (id: string, updates: Partial<Product>) => Promise<any>
    deleteProduct: (id: string) => Promise<void>
    proposals: Proposal[]
    deleteProposal: (id: string) => Promise<void>
    brandProposals: BrandProposal[] // New direct proposals
    addProposal: (proposal: Omit<Proposal, "id" | "date">) => Promise<void>
    createBrandProposal: (proposal: any) => Promise<any>
    updateProposal: (id: string | number, data: Partial<Proposal> | object) => Promise<boolean>
    deleteBrandProposal: (id: string) => Promise<void>

    notifications: Notification[]
    sendNotification: (toUserId: string, message: string, type?: string, referenceId?: string) => Promise<void>
    markAsRead: (id: string) => Promise<void>

    // Messages
    messages: Message[]
    sendMessage: (toUserId: string, content: string, proposalId?: string, brandProposalId?: string) => Promise<void>

    // Feedback
    submissionFeedback: SubmissionFeedback[]
    fetchSubmissionFeedback: (proposalId: string, isBrandProposal: boolean) => Promise<SubmissionFeedback[]>
    sendSubmissionFeedback: (proposalId: string, isBrandProposal: boolean, senderId: string, content: string) => Promise<boolean>

    updateBrandProposal: (id: string, updates: string | object) => Promise<boolean>
    switchRole: (newRole: 'brand' | 'influencer') => Promise<void>
    isLoading: boolean
    resetData: () => void
    refreshData: () => Promise<void>
    updateCampaignStatus: (id: string, status: 'active' | 'closed') => Promise<void>

    // Favorites
    favorites: Favorite[]
    toggleFavorite: (targetId: string, targetType: 'product' | 'campaign' | 'profile' | 'event') => Promise<void>



    supabase: any
}



const PlatformContext = createContext<PlatformContextType | undefined>(undefined)

import { Session } from "@supabase/supabase-js"

export function PlatformProvider({ children, initialSession }: { children: React.ReactNode, initialSession?: Session | null }) {
    const [supabase] = useState(() => createClient())
    const [user, setUser] = useState<User | null>(null)
    const [campaigns, setCampaigns] = useState<Campaign[]>(INITIAL_CAMPAIGNS)
    const [events, setEvents] = useState<InfluencerEvent[]>(INITIAL_EVENTS)
    const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS)
    const [proposals, setProposals] = React.useState<Proposal[]>([])
    const [brandProposals, setBrandProposals] = React.useState<BrandProposal[]>([])
    const [messages, setMessages] = React.useState<Message[]>([])
    const [submissionFeedback, setSubmissionFeedback] = React.useState<SubmissionFeedback[]>([])
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [favorites, setFavorites] = useState<Favorite[]>([])
    const [isInitialized, setIsInitialized] = useState(false)
    const [isAuthChecked, setIsAuthChecked] = useState(false)

    // Refs must be at the top level
    const isFetchingEvents = React.useRef(false)
    const isFetchingMessages = React.useRef(false)
    const lastUserId = React.useRef<string | null>(null)

    useEffect(() => {
        console.log('[PlatformProvider] COMPONENT MOUNTED')
        // Safety: Force Auth Check completion after 5s
        const timer = setTimeout(() => {
            if (!isAuthChecked) {
                console.warn("[PlatformProvider] Auth check timed out, forcing render.")
                setIsAuthChecked(true)
            }
        }, 5000)

        return () => {
            console.log('[PlatformProvider] COMPONENT UNMOUNTED')
            clearTimeout(timer)
        }
    }, [isAuthChecked])

    // Initialize state with Server Session if available
    useEffect(() => {
        console.log('[PlatformProvider] initialSession prop:', initialSession?.user?.id || 'none')
        if (initialSession?.user) {
            // Need to fetch profile even if we have session, but we can optimistically set basic user
            const initUserFromSession = async () => {
                // Reuse fetchUserProfile logic or extract it?
                // For now, let's just let the existing effect handle the "full" load
                // But we can set isAuthChecked to true faster if we know we have a session?
                // Actually, if we have initialSession, we can rely on onAuthStateChange to fire immediately?
                // No, better to explicitly set it.

                // We will define fetchUserProfile fully before using it here usually, but it's defined below.
                // Let's rely on the existing effect for profile fetching to avoid duplication,
                // BUT we can use initialSession to prevent the "Login" flash.
            }
        }
    }, [initialSession])


    // Load from localStorage on client mount
    useEffect(() => {
        const storedUser = localStorage.getItem("creadypick_user")
        const storedCampaigns = localStorage.getItem("creadypick_campaigns")
        const storedEvents = localStorage.getItem("creadypick_events")
        const storedProducts = localStorage.getItem("creadypick_products")
        const storedProposals = localStorage.getItem("creadypick_proposals")
        const storedNotifs = localStorage.getItem("creadypick_notifications")
        const storedMessages = localStorage.getItem("creadypick_messages")

        if (storedUser) { try { setUser(JSON.parse(storedUser)) } catch (e) { } }
        if (storedCampaigns) { try { setCampaigns(JSON.parse(storedCampaigns)) } catch (e) { } }
        if (storedEvents) { try { setEvents(JSON.parse(storedEvents)) } catch (e) { } }
        if (storedProducts) { try { setProducts(JSON.parse(storedProducts)) } catch (e) { } }
        if (storedProposals) { try { setProposals(JSON.parse(storedProposals)) } catch (e) { } }
        if (storedNotifs) { try { setNotifications(JSON.parse(storedNotifs)) } catch (e) { } }
        if (storedMessages) { try { setMessages(JSON.parse(storedMessages)) } catch (e) { } }

        setIsInitialized(true)
    }, [])

    // Save changes to localStorage
    useEffect(() => {
        if (!isInitialized) return
        if (user) {
            localStorage.setItem("creadypick_user", JSON.stringify(user))
        } else {
            localStorage.removeItem("creadypick_user")
        }
    }, [user, isInitialized])

    useEffect(() => {
        localStorage.setItem("creadypick_campaigns", JSON.stringify(campaigns))
    }, [campaigns])

    useEffect(() => {
        localStorage.setItem("creadypick_events", JSON.stringify(events))
    }, [events])

    useEffect(() => {
        localStorage.setItem("creadypick_products", JSON.stringify(products))
    }, [products])

    useEffect(() => {
        localStorage.setItem("creadypick_proposals", JSON.stringify(proposals))
    }, [proposals])

    useEffect(() => {
        localStorage.setItem("creadypick_notifications", JSON.stringify(notifications))
    }, [notifications])

    useEffect(() => {
        localStorage.setItem("creadypick_messages", JSON.stringify(messages))
    }, [messages, isInitialized])

    const login = async (id: string, pw: string): Promise<User> => {
        // Try real Supabase Login First
        // We assume 'id' is email for Supabase (or we can handle username -> email lookup if needed, but for now let's assume email input)
        // If the input doesn't look like an email, we might fall back to mock or fail

        try {
            // 1. Attempt Supabase Login
            const { data, error } = await supabase.auth.signInWithPassword({
                email: id,
                password: pw
            })

            if (error) {
                throw error
            } else {
                // Success! onAuthStateChange will handle setting the user
                // But we can return the user object derived from session here for immediate UI feedback
                // Wait a tiny bit for user state update or construct it manually
                // For now, allow the subscription to handle it, but we need to return a Promise<User>.
                // We'll mock the return or wait.

                // Better: construct partial user and return, actual state updates via event
                if (data.session?.user) {
                    return {
                        id: data.session.user.id,
                        name: data.session.user.user_metadata?.name || id.split('@')[0],
                        type: (data.session.user.user_metadata?.role as "brand" | "influencer" | "admin") || "influencer"
                    }
                }
            }
        } catch (e) {
            // If not an email or auth failed, try Mock credentials
            // (Keep existing mock logic for demo purposes if desired, or remove)
        }

        // Mock logic removed - only real DB authentication allowed.
        throw new Error("아이디 또는 비밀번호가 일치하지 않습니다.")
    }

    // --- Supabase Auth Integration ---

    const fetchUserProfile = async (sessionUser: any): Promise<User> => {
        try {
            // Verify if we have a profile and fetch details
            const { data: profile, error } = await supabase
                .from('profiles')
                .select('*, influencer_details(*)')
                .eq('id', sessionUser.id)
                .single()

            if (profile) {
                // Supabase might return influencer_details as an array or a single object depending on the query/schema
                let details = null;
                if (Array.isArray(profile.influencer_details)) {
                    details = profile.influencer_details.length > 0 ? profile.influencer_details[0] : null;
                } else {
                    details = profile.influencer_details;
                }

                console.log('[fetchUserProfile] Extracted details:', {
                    hasDetails: !!details,
                    tags: details?.tags,
                    prices: {
                        v: details?.price_video,
                        f: details?.price_feed,
                        ur_m: details?.usage_rights_month
                    }
                });

                return {
                    id: sessionUser.id,
                    name: profile.display_name || profile.name || sessionUser.email?.split('@')[0] || "User",
                    type: (profile.role as "brand" | "influencer" | "admin") || "influencer",
                    avatar: profile.avatar_url,
                    bio: profile.bio,
                    website: profile.website,
                    handle: details?.instagram_handle || undefined,
                    followers: details?.followers_count || 0,
                    tags: details?.tags || [],
                    phone: profile.phone,
                    address: profile.address,

                    // Map Rate Card Fields
                    priceVideo: details?.price_video || 0,
                    priceFeed: details?.price_feed || 0,
                    secondaryRights: details?.secondary_rights || 0,
                    usageRightsMonth: details?.usage_rights_month || 0,
                    usageRightsPrice: details?.usage_rights_price || 0,
                    autoDmMonth: details?.auto_dm_month || 0,
                    autoDmPrice: details?.auto_dm_price || 0
                }
            }

            if (error) {
                console.warn('[fetchUserProfile] Profile fetch issue (possibly RLS):', error.message)
            }
        } catch (e) {
            console.error("[fetchUserProfile] Exception:", e)
        }

        // Fallback: Use session data if profile/details fetch fails
        return {
            id: sessionUser.id,
            name: sessionUser.user_metadata?.name || sessionUser.email?.split('@')[0] || "User",
            type: (sessionUser.user_metadata?.role as "brand" | "influencer" | "admin") || "influencer",
            avatar: sessionUser.user_metadata?.avatar_url,
            tags: []
        }
    }

    // ... (useEffect for onAuthStateChange remains similar, just ensure it uses updated fetchUserProfile) ...

    useEffect(() => {
        let mounted = true

        const initAuth = async () => {
            console.log('[PlatformProvider] Initializing Auth Check...')
            const { data: { session }, error } = await supabase.auth.getSession()
            console.log('[PlatformProvider] getSession result:', session ? 'Session found' : 'No session', error || '')

            if (session?.user && mounted) {
                console.log('[PlatformProvider] User found in session:', session.user.id)
                const fetchedUser = await fetchUserProfile(session.user)
                if (fetchedUser) {
                    setUser(fetchedUser)
                    // Await initial data fetch to prevent blank screen
                    await Promise.all([
                        fetchEvents(session.user.id),
                        fetchMessages(session.user.id),
                        fetchEvents(session.user.id),
                        fetchMessages(session.user.id),
                        fetchNotifications(session.user.id),
                        fetchFavorites(session.user.id)
                    ])
                }
            } else if (mounted) {
                // IMPORTANT: If no session, clear local user state to prevent "ghost login"
                console.log('[PlatformProvider] No session found, clearing user state')
                setUser(null)
            }
            if (mounted) setIsAuthChecked(true)
        }

        initAuth()

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log(`[Auth] onAuthStateChange event: ${event}`, session?.user?.id)

            if (session?.user) {
                if (lastUserId.current === session.user.id && event !== 'SIGNED_IN') {
                    console.log('[Auth] Skip redundant fetch for same user')
                    return
                }

                lastUserId.current = session.user.id
                if (mounted) {
                    const fetchedUser = await fetchUserProfile(session.user)
                    setUser(fetchedUser)
                    console.log('[Auth] User session valid, fetching data...')
                    // Await data fetch here as well
                    await Promise.all([
                        fetchEvents(session.user.id),
                        fetchMessages(session.user.id),
                        fetchMessages(session.user.id),
                        fetchNotifications(session.user.id),
                        fetchFavorites(session.user.id)
                    ])
                }
            } else if (mounted) {
                lastUserId.current = null
                setUser(null)
                if (events.length > 0 && !events[0].isMock) {
                    setEvents(INITIAL_EVENTS)
                    setProducts(INITIAL_PRODUCTS)
                    setBrandProposals(INITIAL_PROPOSALS)
                    setMessages(INITIAL_MESSAGES)
                }
            }
            if (mounted) setIsAuthChecked(true)
        })

        return () => {
            mounted = false
            subscription.unsubscribe()
        }
    }, [supabase])

    const fetchEvents = React.useCallback(async (userId?: string) => {
        const targetId = userId || user?.id
        if (!targetId || isFetchingEvents.current) return

        isFetchingEvents.current = true
        try {
            console.log('[PlatformProvider] Fetching events & data for:', targetId)
            // 1. Fetch Events
            const { data: eventsData, error: eventsError } = await supabase
                .from('influencer_events')
                .select('*, profiles(*, influencer_details(*))')
                .order('created_at', { ascending: false })

            if (eventsError) {
                // @ts-ignore
                if (eventsError.message?.includes('AbortError') || eventsError.name === 'AbortError' || eventsError.code === '20') {
                    console.log('[fetchEvents] Request aborted (harmless)')
                    return
                }
                console.error('[fetchEvents] Error fetching events:', JSON.stringify(eventsError, null, 2))
                console.error('Error Object:', eventsError)
            }

            if (eventsData) {
                console.log('[fetchEvents] Fetched events from DB:', eventsData.length, 'events')
                const mappedEvents: InfluencerEvent[] = eventsData.map((e: any) => {
                    const profile = e.profiles;
                    // Supabase returns array for 1:M or if configured, but here it's likely single object or array
                    const details = profile?.influencer_details ? (Array.isArray(profile.influencer_details) ? profile.influencer_details[0] : profile.influencer_details) : null;

                    return {
                        id: e.id,
                        influencer: profile?.display_name || "Unknown",
                        influencerId: e.influencer_id,
                        handle: details?.instagram_handle || "",
                        avatar: profile?.avatar_url || "",
                        category: e.category,
                        event: e.title,
                        date: new Date(e.created_at).toISOString().split('T')[0],
                        description: e.description,
                        tags: e.tags || [],
                        verified: e.is_verified || false,
                        followers: details?.followers_count || 0,
                        priceVideo: details?.price_video || 0, // Mapped new field
                        targetProduct: e.target_product || "",
                        eventDate: e.event_date || "",
                        postingDate: e.posting_date || "",
                        guide: e.guide || "",
                        status: e.status || ((e.event_date && new Date(e.event_date) < new Date()) ? 'completed' : 'recruiting')
                    }
                })
                // 로그인 한 유저(targetId 존재)는 실제 DB 데이터만 표시
                if (targetId) {
                    setEvents(mappedEvents)
                } else {
                    // 게스트는 Mock 데이터와 병합해서 보여줌 (또는 취향에 따라 제거 가능)
                    setEvents([...mappedEvents, ...MOCK_EVENTS])
                }
                console.log('[fetchEvents] Set events state with', mappedEvents.length, 'events')
            }

            // 1.5. Fetch All Active Campaigns
            try {
                const { data: campaignData, error: campaignError } = await supabase
                    .from('campaigns')
                    .select(`
                        *,
                        profiles(display_name)
                    `)
                    .order('created_at', { ascending: false })

                if (campaignData) {
                    const mappedCampaigns: Campaign[] = campaignData.map((c: any) => {
                        // Helper to parse legacy blob data
                        const extractField = (text: string, tag: string) => {
                            const match = text?.match(new RegExp(`\\[${tag}\\]\\s*(.*?)(?:\\[|$)`, 's'))
                            return match ? match[1].trim() : null
                        }

                        const legacyCategory = extractField(c.description, '카테고리')
                        const legacyBudget = extractField(c.description, '제공 혜택')
                        const legacyTarget = extractField(c.description, '원하는 크리에이터')
                        const legacyDescription = c.description?.split('[상세 내용]')?.[1]?.trim() || c.description

                        // Use new columns if available (assuming 'category' presence indicates new format), otherwise fallback
                        const isNewFormat = !!c.category

                        return {
                            id: c.id,
                            brandId: c.brand_id,
                            brand: c.profiles?.display_name || "Unknown Brand",
                            product: c.product_name || "",
                            category: c.category || legacyCategory || c.title.match(/\[(.*?)\]/)?.[1] || "기타",
                            budget: c.budget || legacyBudget || "협의",
                            target: c.target || legacyTarget || "전체",
                            description: isNewFormat ? c.description : legacyDescription,
                            matchScore: Math.floor(Math.random() * 20) + 80,
                            date: new Date(c.created_at).toISOString().split('T')[0],
                            postingDate: c.posting_date,
                            eventDate: c.event_date
                        }
                    })
                    setCampaigns(mappedCampaigns)
                }
            } catch (campEx) {
                console.error('[fetchEvents] Exception fetching campaigns:', campEx)
            }

            // 2. Fetch Brand Proposals (Both sent and received, or all if admin)
            if (userId) {
                try {
                    let query = supabase
                        .from('brand_proposals')
                        .select('*, brand_profile:profiles!brand_proposals_brand_id_fkey(display_name), influencer_profile:profiles!brand_proposals_influencer_id_fkey(display_name), product:brand_products(*)')

                    // Fetch user role to check admin status (Use local state if available to avoid race conditions)
                    let currentRole = user?.id === userId ? user?.type : null;

                    if (!currentRole) {
                        const { data: profile } = await supabase.from('profiles').select('role').eq('id', userId).single()
                        currentRole = profile?.role || 'influencer';
                    }

                    /*
                    // RLS handles visibility now. Removing redundant filter which might cause issues.
                    if (currentRole !== 'admin') {
                        query = query.or(`brand_id.eq.${userId},influencer_id.eq.${userId}`)
                    }
                    */

                    const { data: bpData, error: bpError } = await query.order('created_at', { ascending: false })

                    if (bpError) {
                        console.error('[fetchEvents] Brand proposals fetch error:', JSON.stringify(bpError, null, 2))
                    }

                    if (bpData) {
                        console.log('[fetchEvents] Fetched proposals:', bpData.length)
                        const mappedBP: BrandProposal[] = bpData.map((b: any) => ({
                            ...(b as any),
                            type: 'brand_offer',
                            brand_name: b.brand_profile?.display_name || 'Brand',
                            influencer_name: b.influencer_profile?.display_name || 'Creator'
                        })) as any
                        setBrandProposals(mappedBP)
                    }
                    // B. Campaign Applications (proposals table)
                    // B. Campaign Applications (proposals table)
                    const isBrand = currentRole === 'brand';

                    let campQuery = supabase
                        .from('proposals')
                        .select(`
                        *,
                        campaign:campaigns${isBrand ? '!inner' : ''}(
                            *,
                            brand:profiles(display_name, avatar_url)
                        ),
                        influencer_profile:profiles(display_name, avatar_url)
                    `)

                    if (currentRole !== 'admin') {
                        if (isBrand) {
                            // For Brands: fetch proposals where the CAMPAIGN belongs to them
                            campQuery = campQuery.eq('campaign.brand_id', userId)
                        } else {
                            // For Influencers: fetch their own proposals
                            campQuery = campQuery.eq('influencer_id', userId)
                        }
                    }

                    const { data: pData, error: pError } = await campQuery.order('created_at', { ascending: false })

                    if (pError) {
                        console.error('[fetchEvents] Campaign proposals fetch error:', JSON.stringify(pError, null, 2))
                    }

                    if (pData) {
                        console.log('[fetchEvents] Fetched campaign proposals:', pData.length)
                        const mappedApps: Proposal[] = pData.map((p: any) => ({
                            ...p,
                            type: 'creator_apply',
                            brand_name: p.campaign?.brand?.display_name || 'Brand', // Access nested brand
                            influencer_name: p.influencer_profile?.display_name || 'Creator',
                            influencer_avatar: p.influencer_profile?.avatar_url,
                            // influencer_handle: p.influencer_profile?.handle, // Removed to prevent error if column missing
                            product_name: p.campaign?.product_name || p.campaign?.title || 'Campaign', // Use campaign product name
                            product_image: p.campaign?.product_image_url, // Use campaign product image
                            campaign_name: p.campaign?.title
                        })) as any

                        console.log('[fetchEvents] Fetched applications:', mappedApps.length)
                        setProposals(mappedApps)
                    }
                } catch (bpEx) {
                    console.error('[fetchEvents] Exception fetching brand proposals:', bpEx)
                }
            }

            // 4. Fetch Brand Products
            try {
                const { data: productData, error: productError } = await supabase
                    .from('brand_products')
                    .select(`
                    *,
                    profiles(display_name, avatar_url, bio)
                `)
                    .order('created_at', { ascending: false })

                if (productData) {
                    console.log('[fetchEvents] Fetched products SUCCESS:', productData.length, 'items')
                    const mappedProducts: Product[] = productData.map((p: any) => ({
                        id: p.id,
                        brandId: p.brand_id,
                        brandName: p.profiles?.display_name || 'Brand',
                        name: p.name,
                        price: p.price || 0,
                        image: p.image_url || '',
                        link: p.website_url || '',
                        points: p.selling_points || '',
                        shots: p.required_shots || '',
                        category: p.category || '기타',
                        contentGuide: p.content_guide || '',
                        formatGuide: p.format_guide || '',
                        tags: p.tags || [],
                        accountTag: p.account_tag || '',
                        description: p.description,
                        createdAt: p.created_at,
                        isMock: p.is_mock || false,
                        brandAvatar: p.profiles?.avatar_url,
                        brandHandle: p.profiles?.handle, // Might be undefined if not fetched
                        brandBio: p.profiles?.bio
                    }))
                    setProducts(mappedProducts)
                } else if (productError) {
                    console.error('[fetchEvents] Error fetching products:', JSON.stringify(productError, null, 2))

                    if (productError.code === '42P01') {
                        console.warn('The "brand_products" table is missing. Please run "documents/brand_products_schema.sql" in Supabase SQL editor.')
                    }
                }
            } catch (prodEx) {
                console.error('[fetchEvents] Exception fetching products:', prodEx)
            }
        } catch (err: any) {
            if (err?.name === 'AbortError' || err?.message?.includes('aborted')) {
                // Silent catch for benign cancellations
            } else {
                console.error('[fetchEvents] Fetch exception:', err)
            }
        } finally {
            isFetchingEvents.current = false
        }
    }, [user, supabase])

    const fetchMessages = React.useCallback(async (userId: string) => {
        if (isFetchingMessages.current) return
        isFetchingMessages.current = true

        try {
            console.log('[fetchMessages] Fetching messages for user:', userId)
            const { data, error } = await supabase
                .from('messages')
                .select(`
                    *,
                    sender:profiles!sender_id(id, display_name, avatar_url),
                    receiver:profiles!receiver_id(id, display_name, avatar_url)
                `)
                .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
                .order('created_at', { ascending: true })

            if (error) {
                // Ignore AbortErrors (browser cancellations) as they are common in dev and during navigation
                if (error.message?.includes('AbortError') || error.code === 'ABORTED') {
                    console.log('[fetchMessages] Fetch aborted')
                    return
                }

                console.error('[fetchMessages] Error fetching messages:', error)

                // Silently skip if table doesn't exist or FK error
                if (error.code === '42P01' || error.code === '42703' || error.message?.includes('foreign key')) {
                    console.warn('[fetchMessages] Skipping message fetch due to schema issue')
                    return
                }
                return
            }

            if (data) {
                const formattedMessages: Message[] = data.map((msg: any) => ({
                    id: msg.id.toString(),
                    senderId: msg.sender_id,
                    receiverId: msg.receiver_id,
                    proposalId: msg.proposal_id,
                    brandProposalId: msg.brand_proposal_id,
                    content: msg.content,
                    timestamp: msg.created_at,
                    read: msg.is_read || false, // Corrected mapping from is_read
                    senderName: msg.sender?.display_name || 'User',
                    senderAvatar: msg.sender?.avatar_url,
                    receiverName: msg.receiver?.display_name || 'User',
                    receiverAvatar: msg.receiver?.avatar_url
                }))
                setMessages(formattedMessages)
                console.log('[fetchMessages] Loaded', formattedMessages.length, 'messages')
            }
        } catch (err: any) {
            if (err?.name === 'AbortError' || err?.message?.includes('aborted')) {
                // Silent
            } else {
                // @ts-ignore
                if (err?.message?.includes('AbortError') || err?.name === 'AbortError' || err?.code === '20') {
                    console.log('[fetchMessages] Request aborted (harmless)')
                } else {
                    console.error('[fetchMessages] Fetch exception:', {
                        message: err?.message,
                        stack: err?.stack
                    })
                }
            }
        } finally {
            isFetchingMessages.current = false
        }
    }, [supabase])

    const fetchSingleMessage = async (messageId: string) => {
        try {
            const { data, error } = await supabase
                .from('messages')
                .select(`
                    *,
                    sender:profiles!sender_id(id, display_name, avatar_url),
                    receiver:profiles!receiver_id(id, display_name, avatar_url)
                `)
                .eq('id', messageId)
                .single()

            if (error || !data) return null

            const formatted: Message = {
                id: data.id.toString(),
                senderId: data.sender_id,
                receiverId: data.receiver_id,
                proposalId: data.proposal_id,
                brandProposalId: data.brand_proposal_id,
                content: data.content,
                timestamp: data.created_at,
                read: data.is_read || false,
                senderName: data.sender?.display_name || 'User',
                senderAvatar: data.sender?.avatar_url,
                receiverName: data.receiver?.display_name || 'User',
                receiverAvatar: data.receiver?.avatar_url
            }
            return formatted
        } catch (e) {
            console.error('[fetchSingleMessage] Error:', e)
            return null
        }
    }

    // Polling for new messages every 5 seconds
    useEffect(() => {
        if (!user) return

        const interval = setInterval(() => {
            fetchMessages(user.id)
        }, 30000)

        return () => clearInterval(interval)
    }, [user?.id])

    // ... (Failsafe useEffect remains same) ...
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsAuthChecked(prev => {
                if (!prev) return true
                return prev
            })
        }, 3000)
        return () => clearTimeout(timer)
    }, [])



    const logout = async () => {
        try {
            console.log('[Logout] Attempting to sign out...')
            const { error } = await supabase.auth.signOut()
            if (error) {
                console.error('[Logout Error]', error)
                throw error
            }
            console.log('[Logout] Successfully signed out')

            // Clear all user data
            setUser(null)

            // Clear localStorage to prevent stale data on next login
            localStorage.removeItem("creadypick_user")
            localStorage.removeItem("creadypick_events")
            localStorage.removeItem("creadypick_campaigns")
            localStorage.removeItem("creadypick_products")
            localStorage.removeItem("creadypick_proposals")
            localStorage.removeItem("creadypick_notifications")
            localStorage.removeItem("creadypick_messages")

        } catch (error: any) {
            if (error?.name === 'AbortError' || error?.message?.includes('aborted')) {
                console.log('[Logout] Request aborted (benign)')
            } else {
                console.error('[Logout] Failed to sign out:', error)
            }
            // Still clear local user state even if signOut fails
            setUser(null)

            // Clear localStorage even on error
            localStorage.removeItem("creadypick_user")
            localStorage.removeItem("creadypick_events")
            localStorage.removeItem("creadypick_campaigns")
            localStorage.removeItem("creadypick_products")
            localStorage.removeItem("creadypick_proposals")
            localStorage.removeItem("creadypick_notifications")
            localStorage.removeItem("creadypick_messages")
        }
    }

    const updateUser = React.useCallback(async (data: Partial<User>) => {
        console.log('[updateUser] Start update process matching user.id:', user?.id)
        console.log('[updateUser] Values to update:', data)

        if (!user) {
            console.error('[updateUser] No user in state, cannot update')
            return
        }

        try {
            // 1. Prepare Profile Update
            const profileUpdates: any = {
                updated_at: new Date().toISOString(),
            }
            if (data.name !== undefined) profileUpdates.display_name = data.name
            if (data.bio !== undefined) profileUpdates.bio = data.bio
            if (data.avatar !== undefined) profileUpdates.avatar_url = data.avatar
            if (data.website !== undefined) profileUpdates.website = data.website
            if (data.phone !== undefined) profileUpdates.phone = data.phone
            if (data.address !== undefined) profileUpdates.address = data.address

            console.log('[updateUser] Sending profile update to Supabase...', profileUpdates)

            // CRITICAL FIX: Use update instead of upsert for existing profiles to avoid RLS/Conflict issues
            const { error: profileError } = await supabase
                .from('profiles')
                .update(profileUpdates)
                .eq('id', user.id)

            if (profileError) {
                console.error('[updateUser] Profile update DB error:', profileError)
                alert(`저장 실패 (Profile): ${profileError.message}`)
                throw profileError
            }
            console.log('[updateUser] Profile table update success')

            // 2. Influencer Details Update
            if (user.type === 'influencer') {
                const detailsUpdates: any = {
                    id: user.id, // Primary key for upsert
                    updated_at: new Date().toISOString(),
                }

                let hasDetailsFields = false
                if (data.tags !== undefined) { detailsUpdates.tags = data.tags; hasDetailsFields = true; }
                if (data.handle !== undefined) { detailsUpdates.instagram_handle = data.handle; hasDetailsFields = true; }
                if (data.followers !== undefined) {
                    const count = typeof data.followers === 'string' ? parseInt(data.followers) : data.followers
                    detailsUpdates.followers_count = isNaN(count) ? 0 : count

                    let tier = 'Nano'
                    if (count >= 1000000) tier = 'Mega'
                    else if (count >= 100000) tier = 'Macro'
                    else if (count >= 10000) tier = 'Micro'
                    detailsUpdates.tier = tier
                    hasDetailsFields = true
                }

                // Add Rate Card Mapping
                if (data.priceVideo !== undefined) { detailsUpdates.price_video = data.priceVideo; hasDetailsFields = true; }
                if (data.priceFeed !== undefined) { detailsUpdates.price_feed = data.priceFeed; hasDetailsFields = true; }
                if (data.secondaryRights !== undefined) { detailsUpdates.secondary_rights = !!data.secondaryRights; hasDetailsFields = true; }
                if (data.usageRightsMonth !== undefined) { detailsUpdates.usage_rights_month = data.usageRightsMonth; hasDetailsFields = true; }
                if (data.usageRightsPrice !== undefined) { detailsUpdates.usage_rights_price = data.usageRightsPrice; hasDetailsFields = true; }
                if (data.autoDmMonth !== undefined) { detailsUpdates.auto_dm_month = data.autoDmMonth; hasDetailsFields = true; }
                if (data.autoDmPrice !== undefined) { detailsUpdates.auto_dm_price = data.autoDmPrice; hasDetailsFields = true; }

                console.log('[updateUser] Upserting influencer_details...', detailsUpdates)

                // Keep upsert for details as it might be the first time creation
                const { data: _, error: detailsError } = await supabase
                    .from('influencer_details')
                    .upsert(detailsUpdates, { onConflict: 'id' })

                if (detailsError) {
                    console.warn('[updateUser] Influencer details error (non-fatal):', detailsError)
                } else {
                    console.log('[updateUser] Influencer details update success')
                }
            }

            // 3. Update Local State AFTER successful DB update for consistency
            const updatedUser = { ...user, ...data }
            setUser(updatedUser)
            console.log("[updateUser] Finished - Context state updated")

        } catch (error: any) {
            console.error('[updateUser] Critical Error:', error)
            throw error
        }
    }, [user, supabase])

    const switchRole = React.useCallback(async (newRole: 'brand' | 'influencer') => {
        if (!user) {
            alert("로그인 세션이 확인되지 않습니다.")
            return
        }

        try {
            console.log(`[switchRole] Attempting switch to: ${newRole} for user: ${user.id}`)

            // 1. Update profiles table - this is the source of truth for UI
            const { error: profileError } = await supabase
                .from('profiles')
                .upsert({
                    id: user.id,
                    role: newRole,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'id' })

            if (profileError) {
                console.error('[switchRole] Profile DB error:', profileError)
                throw new Error(`DB 업데이트 실패: ${profileError.message}`)
            }

            // 2. If switching to influencer, ensure influencer_details exists
            if (newRole === 'influencer') {
                console.log('[switchRole] Initializing/verifying influencer_details...')
                const { error: detailsError } = await supabase
                    .from('influencer_details')
                    .update({
                        instagram_handle: user.handle, // Assuming user.handle is available
                        tags: user.tags, // Assuming user.tags is available
                        price_video: user.priceVideo,
                        price_feed: user.priceFeed,
                        secondary_rights: user.secondaryRights,
                        usage_rights_month: user.usageRightsMonth,
                        usage_rights_price: user.usageRightsPrice,
                        auto_dm_month: user.autoDmMonth,
                        auto_dm_price: user.autoDmPrice,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', user.id)

                if (detailsError) {
                    console.warn('[switchRole] influencer_details upsert error (non-fatal):', detailsError)
                }
            }

            // 3. Update Auth metadata - this is used by middleware/trigger
            const { error: authError } = await supabase.auth.updateUser({
                data: { role: newRole }
            })

            if (authError) {
                console.error('[switchRole] Auth metadata error:', authError)
                // We continue even if this fails as DB is more important, but it's a warning
            }

            console.log('[switchRole] Switching local state and reloading...')

            // 4. Update local state
            setUser(prev => prev ? { ...prev, type: newRole } : null)

            alert("계정 유형이 성공적으로 변경되었습니다. 새로운 대시보드로 이동합니다.")

            // 4. Force hard reload to the new dashboard to ensure everything (middleware, context) is fresh
            window.location.href = newRole === 'brand' ? '/brand' : '/creator'

        } catch (error: any) {
            console.error('[switchRole] Critical switch error:', error)
            alert(`전환 실패: ${error.message || "알 수 없는 오류"}`)
            throw error
        }
    }, [user, supabase])

    const addCampaign = (newCampaign: Omit<Campaign, "id" | "date" | "matchScore">) => {
        const campaign: Campaign = {
            ...newCampaign,
            id: campaigns.length + 1,
            date: new Date().toISOString().split("T")[0],
            matchScore: Math.floor(Math.random() * 20) + 80, // Random score 80-100
            brand: user?.name || "My Brand", // Use logged in brand name
        }
        setCampaigns([campaign, ...campaigns])
    }

    const deleteCampaign = async (id: number | string) => {
        const prevCampaigns = [...campaigns]
        setCampaigns(prev => prev.filter(c => String(c.id) !== String(id)))

        try {
            const { error } = await supabase
                .from('campaigns')
                .delete()
                .eq('id', id)

            if (error) throw error
        } catch (e) {
            console.error("Failed to delete campaign:", e)
            setCampaigns(prevCampaigns)
            throw e
        }
    }

    const addEvent = async (newEvent: Omit<InfluencerEvent, "id" | "influencer" | "influencerId" | "handle" | "avatar" | "verified" | "followers">): Promise<boolean> => {
        if (!user) return false

        try {
            // 2. Insert into DB
            const { data, error } = await supabase
                .from('influencer_events')
                .insert({
                    influencer_id: user.id,
                    title: newEvent.event,
                    description: newEvent.description,
                    target_product: newEvent.targetProduct,
                    event_date: newEvent.eventDate,
                    posting_date: newEvent.postingDate,
                    category: newEvent.category,
                    guide: newEvent.guide,
                    tags: newEvent.tags,
                    status: 'recruiting',
                    is_private: newEvent.isPrivate || false,
                    schedule: newEvent.schedule || {},
                    is_mock: user.isMock || false
                })
                .select()
                .single()

            if (error) throw error

            // 3. Update Local Handler
            if (data) {
                const event: InfluencerEvent = {
                    ...newEvent,
                    id: data.id,
                    influencer: user.name, // Local user name
                    influencerId: user.id,
                    handle: user.handle || "",
                    avatar: user.avatar || "",
                    verified: false,
                    followers: user.followers || 0,
                    guide: newEvent.guide,
                    date: new Date().toISOString().split('T')[0],
                    isPrivate: newEvent.isPrivate || false,
                    schedule: newEvent.schedule || {},
                    isMock: user.isMock || false
                }
                setEvents([event, ...events])
                return true
            }
        } catch (e) {
            console.error("Failed to add event:", e)
            alert("이벤트 등록에 실패했습니다.")
            return false
        }
        return false
    }

    const updateEvent = async (id: string, updatedData: Partial<InfluencerEvent>) => {
        const prevEvents = [...events]
        // Optimistic Update
        setEvents(prev => prev.map(event => event.id === id ? { ...event, ...updatedData } : event))

        try {
            console.log('[updateEvent] Updating event:', id, updatedData)

            // Map common fields to DB columns
            const dbUpdates: any = {
                updated_at: new Date().toISOString()
            }

            // check for undefined specifically to allow clearing fields (e.g. empty string) if needed
            // although most fields have validation
            if (updatedData.event !== undefined) dbUpdates.title = updatedData.event
            if (updatedData.description !== undefined) dbUpdates.description = updatedData.description
            if (updatedData.guide !== undefined) dbUpdates.guide = updatedData.guide
            if (updatedData.category !== undefined) dbUpdates.category = updatedData.category
            if (updatedData.tags !== undefined) dbUpdates.tags = updatedData.tags
            if (updatedData.targetProduct !== undefined) dbUpdates.target_product = updatedData.targetProduct
            if (updatedData.eventDate !== undefined) dbUpdates.event_date = updatedData.eventDate
            if (updatedData.postingDate !== undefined) dbUpdates.posting_date = updatedData.postingDate
            if (updatedData.status !== undefined) dbUpdates.status = updatedData.status

            const { data, error } = await supabase
                .from('influencer_events')
                .update(dbUpdates)
                .eq('id', id)
                .select()

            if (error) {
                console.error('[updateEvent] DB Error:', error)
                throw error
            }

            console.log('[updateEvent] Update success:', data)

            // Force refresh to ensure sync, especially for derived fields
            if (user?.id) fetchEvents(user.id)

        } catch (e) {
            console.error("Failed to update event:", e)
            setEvents(prevEvents) // Revert
            alert("이벤트 수정에 실패했습니다.")
        }
    }

    const deleteEvent = async (id: string) => {
        const prevEvents = [...events]
        setEvents(prev => prev.filter(event => event.id !== id))

        try {
            const { error } = await supabase
                .from('influencer_events')
                .delete()
                .eq('id', id)

            if (error) throw error
        } catch (e) {
            console.error("Failed to delete event:", e)
            setEvents(prevEvents) // Revert
            throw e
        }
    }

    const deleteProduct = async (id: string) => {
        const prevProducts = [...products]
        setProducts(prev => prev.filter(p => p.id !== id))

        try {
            const { error } = await supabase
                .from('brand_products')
                .delete()
                .eq('id', id)

            if (error) throw error
        } catch (e) {
            console.error("Failed to delete product:", e)
            setProducts(prevProducts)
            throw e
        }
    }

    const deleteBrandProposal = async (id: string) => {
        const prev = [...brandProposals]
        setBrandProposals(prev => prev.filter(p => p.id !== id))
        try {
            const { error } = await supabase.from('brand_proposals').delete().eq('id', id)
            if (error) throw error
        } catch (e) {
            console.error("Failed to delete brand proposal:", e)
            setBrandProposals(prev)
            throw e
        }
    }

    const deleteProposal = async (id: string) => {
        try {
            const { error } = await supabase.from('proposals').delete().eq('id', id)
            if (error) throw error
        } catch (e) {
            console.error("Failed to delete proposal:", e)
            throw e
        }
    }



    const addProduct = async (newProduct: Omit<Product, "id" | "brandId" | "brandName">) => {
        if (!user) {
            console.error('[addProduct] No user session found')
            return
        }

        console.log('[addProduct] Starting product insert for user:', user.id)
        try {
            const productData = {
                brand_id: user.id,
                name: newProduct.name,
                description: newProduct.description,
                image_url: newProduct.image,
                price: newProduct.price,
                category: newProduct.category,
                selling_points: newProduct.points,
                required_shots: newProduct.shots,
                website_url: newProduct.link,
                content_guide: newProduct.contentGuide,
                format_guide: newProduct.formatGuide,
                tags: newProduct.tags,
                account_tag: newProduct.accountTag,
                is_mock: user.isMock || false
            }

            console.log('[addProduct] Payload:', productData)

            // Simple insert call without complex retry logic
            const { data, error } = await supabase
                .from('brand_products')
                .insert([productData])
                .select()
                .single()

            if (error) {
                console.error('[addProduct] DB Error:', error)
                throw error
            }

            if (data) {
                console.log('[addProduct] Insert successful, ID:', data.id)
                const product: Product = {
                    id: data.id,
                    brandId: user.id,
                    brandName: user.name,
                    name: data.name,
                    price: data.price,
                    image: data.image_url || "📦",
                    category: data.category,
                    description: data.description,
                    points: data.selling_points,
                    shots: data.required_shots,
                    link: data.website_url,
                    contentGuide: data.content_guide,
                    formatGuide: data.format_guide,
                    tags: data.tags,
                    accountTag: data.account_tag,
                    createdAt: data.created_at,
                    isMock: user.isMock || false
                }
                setProducts(prev => [product, ...prev])
                return product
            }
        } catch (e: any) {
            console.error("[addProduct] Exception:", e)
            alert(`제품 등록 실패: ${e.message || "알 수 없는 오류"}`)
            throw e
        }
    }

    const updateProduct = async (id: string, updates: Partial<Product>) => {
        if (!user) {
            console.error('[updateProduct] No user session')
            return
        }

        try {
            console.log('[updateProduct] Starting update for:', id, updates)
            const productData: any = {}
            if (updates.name !== undefined) productData.name = updates.name
            if (updates.description !== undefined) productData.description = updates.description
            if (updates.image !== undefined) productData.image_url = updates.image
            if (updates.price !== undefined) productData.price = updates.price
            if (updates.category !== undefined) productData.category = updates.category
            if (updates.points !== undefined) productData.selling_points = updates.points
            if (updates.shots !== undefined) productData.required_shots = updates.shots
            if (updates.link !== undefined) productData.website_url = updates.link
            if (updates.contentGuide !== undefined) productData.content_guide = updates.contentGuide
            if (updates.formatGuide !== undefined) productData.format_guide = updates.formatGuide
            if (updates.tags !== undefined) productData.tags = updates.tags
            if (updates.accountTag !== undefined) productData.account_tag = updates.accountTag


            // Direct update call without artificial timeout
            const { error } = await supabase
                .from('brand_products')
                .update(productData)
                .eq('id', id)

            if (error) {
                console.error('[updateProduct] DB Error:', error)
                throw error
            }

            console.log('[updateProduct] Update successful for ID:', id)
            // Manually update local state since we're not fetching the updated row
            setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p))
            return { ...updates, id } as Product // Return constructed object
        } catch (e: any) {
            console.error("[updateProduct] Exception:", e)
            // alert(`제품 수정 실패: ${e.message || "알 수 없는 오류"}`) // Removed to avoid double alert (handled in component)
            throw e
        }
    }

    const addProposal = async (newProposal: Omit<Proposal, "id" | "date">) => {
        try {
            // Check if user is logged in
            if (!user) {
                alert("로그인이 필요합니다.")
                return
            }

            // Find product name and image if productId is provided
            let productName = "새로운 제안"
            if (newProposal.productId) {
                const product = products.find(p => String(p.id) === String(newProposal.productId))
                if (product) productName = product.name
            }

            // Map Proposal to brand_proposals table
            const { data, error } = await supabase
                .from('brand_proposals')
                .insert({
                    brand_id: newProposal.toId,
                    influencer_id: newProposal.fromId,
                    product_id: newProposal.productId, // Added product_id linkage
                    product_name: productName,
                    product_type: newProposal.dealType === 'ad' ? 'gift' : 'loan', // Simple mapping
                    compensation_amount: newProposal.cost ? `${newProposal.cost.toLocaleString()}원` : "협의",
                    has_incentive: !!newProposal.commission,
                    incentive_detail: newProposal.commission ? `${newProposal.commission}% 수수료` : null,
                    message: newProposal.requestDetails,
                    status: 'applied', // status for creator-initiated
                })
                .select()
                .single()

            if (error) throw error

            if (data) {
                console.log('Proposal submitted successfully:', data)
                // Update local state for immediate feedback
                setBrandProposals(prev => [{ ...data, brand_name: 'Brand' }, ...prev])
                alert("협업 제안이 성공적으로 전달되었습니다!")

                // Also send a message if needed
                if (newProposal.toId) {
                    await sendMessage(newProposal.toId, `[협업 제안] ${productName} 제품에 대한 제안이 도착했습니다.`, undefined, data.id)
                }
            }
        } catch (e: any) {
            console.error("Failed to add proposal:", e)
            if (e.code === '42501') {
                alert("권한 오류: 제안서를 보낼 권한이 없습니다.\n관리자에게 'fix_proposal_permissions.sql' 실행을 요청하세요.")
            } else {
                alert(`제안 전송에 실패했습니다: ${e.message}`)
            }
        }
    }

    const updateProposal = async (id: string | number, data: Partial<Proposal> | object): Promise<boolean> => {
        try {
            // Determine payload
            const payload = data

            const { error } = await supabase
                .from('proposals')
                .update(payload)
                .eq('id', id)

            if (error) throw error

            setProposals(prev => prev.map(p => p.id === id ? { ...p, ...data } : p))
            return true
        } catch (e: any) {
            console.error("Failed to update proposal:", e)
            if (e.code === '42703') { // undefined_column
                alert("DB 업데이트가 필요합니다. 관리자에게 'add_contract_fields.sql' 실행을 요청해주세요.")
            } else {
                alert("제안서 수정에 실패했습니다: " + (e.message || "알 수 없는 오류"))
            }
            return false
        }
    }

    const updateBrandProposal = async (id: string, updates: string | object): Promise<boolean> => {
        try {
            const payload = typeof updates === 'string' ? { status: updates } : updates

            const { error } = await supabase
                .from('brand_proposals')
                .update(payload)
                .eq('id', id)

            if (error) throw error

            // Update local state
            setBrandProposals(prev => prev.map(p => p.id === id ? { ...p, ...payload } : p))
            return true
        } catch (e: any) {
            console.error("Failed to update proposal:", e)
            // Handle specifically column not found error (if SQL wasn't run)
            if (e.code === '42703') { // undefined_column
                alert("DB 업데이트가 필요합니다. 관리자에게 'add_contract_fields.sql' 실행을 요청해주세요.")
            } else {
                alert("수정에 실패했습니다: " + (e.message || "알 수 없는 오류"))
            }
            return false
        }
    }

    // Helper to check if a string is a valid UUID
    const isUUID = (str: string) => {
        if (!str || typeof str !== 'string') return false
        // More permissive UUID regex to handle various versions/variants
        const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
        return regex.test(str)
    }

    const fetchSubmissionFeedback = async (proposalId: string, isBrandProposal: boolean): Promise<SubmissionFeedback[]> => {
        // Skip mock IDs to avoid Supabase errors (400/403)
        if (!isUUID(proposalId)) {
            console.log('[fetchSubmissionFeedback] Skipping fetch for mock ID:', proposalId)
            return []
        }

        try {
            const query = supabase
                .from('submission_feedback')
                .select(`
                    *,
                    sender:profiles(id, display_name, avatar_url)
                `)
                .order('created_at', { ascending: true })

            if (isBrandProposal) {
                query.eq('brand_proposal_id', proposalId)
            } else {
                query.eq('proposal_id', proposalId)
            }

            const { data, error } = await query

            if (data) {
                const feedback = data.map((item: any) => ({
                    ...item,
                    sender_name: item.sender?.display_name,
                    sender_avatar: item.sender?.avatar_url
                }))

                setSubmissionFeedback(feedback)
                return feedback
            }
            return []
        } catch (e) {
            console.error("Failed to fetch feedback:", e)
            return []
        }
    }

    const sendSubmissionFeedback = async (proposalId: string, isBrandProposal: boolean, senderId: string, content: string): Promise<boolean> => {
        // Skip mock IDs to avoid Supabase errors (403/UUID failure)
        if (!isUUID(proposalId) || !isUUID(senderId)) {
            console.warn('[sendSubmissionFeedback] Cannot send feedback for mock data:', { proposalId, senderId })
            return false
        }

        try {
            const payload: any = {
                sender_id: senderId,
                content
            }

            if (isBrandProposal) {
                payload.brand_proposal_id = proposalId
            } else {
                payload.proposal_id = proposalId
            }

            const { error } = await supabase
                .from('submission_feedback')
                .insert(payload)

            if (error) throw error
            return true
        } catch (e: any) {
            console.error("Failed to send feedback details:", {
                error: e,
                message: e?.message,
                details: e?.details,
                hint: e?.hint,
                code: e?.code
            })
            return false
        }
    }

    const fetchNotifications = React.useCallback(async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('notifications')
                .select('*')
                .eq('recipient_id', userId)
                .order('created_at', { ascending: false })

            if (error) throw error
            setNotifications(data || [])
        } catch (e: any) {
            console.error(`Failed to fetch notifications for user ${userId}:`, JSON.stringify(e, null, 2))
            console.error("Full Error Object:", e)
        }
    }, [supabase])

    const sendNotification = async (toUserId: string, message: string, type: string = 'system', referenceId?: string) => {
        try {
            const { error } = await supabase
                .from('notifications')
                .insert({
                    recipient_id: toUserId,
                    sender_id: user?.id, // Optional, can be null for system messages
                    content: message,
                    type: type,
                    reference_id: referenceId,
                    is_read: false
                })

            if (error) throw error
        } catch (e) {
            console.error("Failed to send notification:", e)
        }
    }

    const markAsRead = async (id: string) => {
        try {
            const { error } = await supabase
                .from('notifications')
                .update({ is_read: true })
                .eq('id', id)

            if (error) throw error

            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
        } catch (e) {
            console.error("Failed to mark notification as read:", e)
        }
    }

    const createBrandProposal = async (proposalData: any) => {
        if (!user) return

        try {
            console.log("Creating proposal with:", proposalData)
            const { data, error } = await supabase
                .from('brand_proposals')
                .insert({
                    ...proposalData,
                    status: 'offered',
                    is_mock: user.isMock || false
                })
                .select()
                .single()

            if (error) throw error

            setBrandProposals(prev => [data, ...prev])
            return data
        } catch (e: any) {
            console.error("Failed to create brand proposal:", e)
            throw e
        }
    }

    const sendMessage = async (toUserId: string, content: string, proposalId?: string, brandProposalId?: string) => {
        if (!user) return

        try {
            const { data, error } = await supabase
                .from('messages')
                .insert({
                    proposal_id: proposalId || null, // Ensure explicit null if undefined
                    brand_proposal_id: brandProposalId || null,
                    sender_id: user.id,
                    receiver_id: toUserId,
                    content
                })
                .select()
                .single()

            if (error) throw error

            const newMessage: Message = {
                id: data.id,
                senderId: user.id,
                receiverId: toUserId,
                proposalId: proposalId,
                brandProposalId: brandProposalId,
                content,
                timestamp: data.created_at,
                read: false,
                senderName: user.name,
                senderAvatar: user.avatar,
                isMock: false
            }
            setMessages(prev => [...prev, newMessage])
        } catch (e: any) {
            console.error("Failed to send message:", e)
            console.error("Error Code:", e?.code)

            // 42P01: undefined_table
            if (e?.code === '42P01') {
                alert("데이터베이스 오류: 'messages' 테이블이 존재하지 않습니다.\n스키마 업데이트가 필요합니다.")
            } else {
                alert(`메시지 전송 실패: ${e?.message || "알 수 없는 오류"}`)
            }
        }
    }

    const fetchFavorites = async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('favorites')
                .select('*')
                .eq('user_id', userId)

            if (error) {
                // If table doesn't exist yet, just ignore (migration pending)
                if (error.code === '42P01') {
                    // Table doesn't exist yet (Postgres error)
                    console.log('[fetchFavorites] Favorites table pending migration.')
                    return
                }
                // Check for PostgREST Schema Cache error (often 404 or specific message)
                if (error.code === 'PGRST200' || error.message?.includes('schema cache')) {
                    console.warn('[fetchFavorites] Schema Cache Stale: Please reload schema cache in Supabase Dashboard.')
                    return
                }
                console.error('[fetchFavorites] Error fetching favorites:', JSON.stringify(error, null, 2))
            }

            if (data) {
                setFavorites(data as Favorite[])
            }
        } catch (e) {
            console.error('[fetchFavorites] Exception:', e)
        }
    }

    const toggleFavorite = async (targetId: string, targetType: 'product' | 'campaign' | 'profile' | 'event') => {
        if (!user) {
            alert("로그인이 필요합니다.")
            return
        }

        // Optimistic Update
        const existing = favorites.find(f => f.target_id === targetId && f.target_type === targetType)
        if (existing) {
            setFavorites(prev => prev.filter(f => f.id !== existing.id))
        } else {
            const newFav: Favorite = {
                id: `temp-${Date.now()}`,
                user_id: user.id,
                target_id: targetId,
                target_type: targetType,
                created_at: new Date().toISOString()
            }
            setFavorites(prev => [...prev, newFav])
        }

        try {
            if (existing) {
                // Remove
                const { error } = await supabase
                    .from('favorites')
                    .delete()
                    .eq('user_id', user.id)
                    .eq('target_id', targetId)
                    .eq('target_type', targetType)

                if (error) throw error
            } else {
                // Add
                const { data, error } = await supabase
                    .from('favorites')
                    .insert({
                        user_id: user.id,
                        target_id: targetId,
                        target_type: targetType
                    })
                    .select()
                    .single()

                if (error) throw error

                // Update temp ID with real ID
                if (data) {
                    setFavorites(prev => prev.map(f => (f.created_at === data.created_at && f.target_id === targetId) ? (data as Favorite) : f))
                }
            }
        } catch (e: any) {
            console.error('[toggleFavorite] Error:', JSON.stringify(e, null, 2))
            if (e.message?.includes('schema cache') || e.code === 'PGRST200') {
                alert("시스템 업데이트가 필요합니다. 관리자에게 'Schema Cache Reload'를 요청하세요.")
            } else {
                alert("즐겨찾기 변경 실패: " + (e.message || "알 수 없는 오류"))
            }
            // Revert
            if (existing) {
                setFavorites(prev => [...prev, existing])
            } else {
                setFavorites(prev => prev.filter(f => f.target_id !== targetId))
            }
        }
    }

    const resetData = () => {
        setCampaigns(INITIAL_CAMPAIGNS)
        setEvents([]) // Clear events, let them re-fetch or stay empty
        setProducts(INITIAL_PRODUCTS)
        setProposals([])
        setNotifications([])
        setMessages([])

        // Clear LocalStorage (except user to keep login)
        // localStorage.removeItem("creadypick_user")
        localStorage.removeItem("creadypick_campaigns")
        localStorage.removeItem("creadypick_events")
        localStorage.removeItem("creadypick_products")
        localStorage.removeItem("creadypick_proposals")
        localStorage.removeItem("creadypick_notifications")
        localStorage.removeItem("creadypick_messages")

        alert("데이터가 초기화되었습니다.")
        fetchEvents(user?.id) // Attempt refetch
    }

    const refreshData = React.useCallback(async () => {
        if (user?.id) {
            console.log("Refreshing data...")
            isFetchingEvents.current = false
            isFetchingMessages.current = false
            await Promise.all([
                fetchEvents(user.id),
                fetchMessages(user.id),
                fetchNotifications(user.id)
            ])
        }
    }, [user, supabase, fetchEvents, fetchMessages, fetchNotifications])

    const updateCampaignStatus = async (id: string, status: 'active' | 'closed') => {
        try {
            const { updateCampaignStatus: serverUpdate } = await import('@/app/actions/campaign')
            const result = await serverUpdate(id, status)
            if (result.error) throw new Error(result.error)

            // Optimistic Update
            setCampaigns(prev => prev.map(c => c.id === id ? { ...c, status: status } : c))
            alert(`캠페인이 ${status === 'active' ? '진행' : '마감'} 상태로 변경되었습니다.`)
        } catch (e: any) {
            console.error("Failed to update campaign status:", e)
            alert(e.message)
        }
    }

    // --- Real-time Subscriptions at the bottom to ensure hoisting ---
    useEffect(() => {
        if (!user) return

        console.log('[Realtime] Setting up subscriptions for user:', user.id)
        const channel = supabase
            .channel(`realtime-data-${user.id}`)
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'influencer_events' },
                () => { console.log('[Realtime] Event change detected'); refreshData(); }
            )
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'campaigns' },
                () => { console.log('[Realtime] Campaign change detected'); refreshData(); }
            )
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'proposals' },
                () => { console.log('[Realtime] Proposal change detected'); refreshData(); }
            )
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'brand_proposals' },
                () => { console.log('[Realtime] Brand Proposal change detected'); refreshData(); }
            )
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'brand_products' },
                () => { console.log('[Realtime] Product change detected'); refreshData(); }
            )
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'notifications', filter: `recipient_id=eq.${user.id}` },
                () => { console.log('[Realtime] Notification change detected'); fetchNotifications(user.id); }
            )
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'messages' },
                async (payload) => {
                    console.log('[Realtime] New Message INSERT detected');
                    const newId = payload.new.id.toString();

                    // Avoid double-append for the sender (who already added it optimistically)
                    setMessages(prev => {
                        if (prev.some(m => m.id === newId)) return prev;
                        // If not found, fetch it with joints and append
                        fetchSingleMessage(newId).then(msg => {
                            if (msg) setMessages(current => {
                                if (current.some(m => m.id === newId)) return current;
                                return [...current, msg];
                            });
                        });
                        return prev;
                    });
                }
            )
            .on(
                'postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'messages' },
                () => { console.log('[Realtime] Message UPDATE detected'); refreshData(); }
            )
            .on(
                'postgres_changes',
                { event: 'DELETE', schema: 'public', table: 'messages' },
                () => { console.log('[Realtime] Message DELETE detected'); refreshData(); }
            )
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'submission_feedback' },
                async (payload) => {
                    console.log('[Realtime] Submission Feedback INSERT detected');
                    const newFeedback = payload.new;

                    // Fetch sender info and append
                    const { data: senderData } = await supabase
                        .from('profiles')
                        .select('id, display_name, avatar_url')
                        .eq('id', newFeedback.sender_id)
                        .single();

                    const feedbackWithSender: SubmissionFeedback = {
                        id: newFeedback.id,
                        proposal_id: newFeedback.proposal_id,
                        brand_proposal_id: newFeedback.brand_proposal_id,
                        sender_id: newFeedback.sender_id,
                        content: newFeedback.content,
                        created_at: newFeedback.created_at,
                        sender_name: senderData?.display_name,
                        sender_avatar: senderData?.avatar_url
                    };

                    setSubmissionFeedback(prev => {
                        if (prev.some(f => f.id === feedbackWithSender.id)) return prev;
                        return [...prev, feedbackWithSender];
                    });
                }
            )
            .subscribe()

        return () => {
            console.log('[Realtime] Cleanup subscriptions')
            supabase.removeChannel(channel)
        }
    }, [user, supabase]) // Depends on user to re-subscribe if user changes

    const contextValue = React.useMemo(() => ({
        user, login, logout, updateUser,
        campaigns, addCampaign, deleteCampaign,
        events, addEvent, deleteEvent, updateEvent,
        products, addProduct, updateProduct, deleteProduct,
        proposals, addProposal, updateProposal, deleteProposal, createBrandProposal,
        brandProposals, updateBrandProposal, deleteBrandProposal,
        notifications, sendNotification, markAsRead,
        messages, sendMessage,
        submissionFeedback, fetchSubmissionFeedback, sendSubmissionFeedback,
        switchRole,
        isLoading: !isInitialized || !isAuthChecked,
        resetData,
        refreshData,
        updateCampaignStatus,
        favorites,
        toggleFavorite,
        supabase
    }), [
        user, campaigns, events, products, proposals, brandProposals,
        notifications, messages, submissionFeedback, isInitialized, isAuthChecked,
        login, logout, updateUser, addCampaign, deleteCampaign, addEvent, deleteEvent,
        updateEvent, addProduct, updateProduct, deleteProduct, addProposal, updateProposal,
        deleteProposal, createBrandProposal, updateBrandProposal, deleteBrandProposal,
        sendNotification, markAsRead, sendMessage, fetchSubmissionFeedback,
        sendSubmissionFeedback, switchRole, resetData, refreshData, updateCampaignStatus,
        supabase
    ])

    return (
        <PlatformContext.Provider value={contextValue}>
            {children}
        </PlatformContext.Provider>
    )
}

export function usePlatform() {
    const context = useContext(PlatformContext)
    if (context === undefined) {
        throw new Error("usePlatform must be used within a PlatformProvider")
    }
    return context
}
