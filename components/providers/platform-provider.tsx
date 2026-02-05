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
    isMock?: boolean
}

export type Notification = {
    id: number
    toUserId: string
    message: string
    date: string
    read: boolean
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
    isMock?: boolean
}

export type InfluencerEvent = {
    id: string
    influencer: string // In DB this is joined from profiles, locally it's string name
    influencerId?: string // Link to actual user ID
    handle: string
    avatar: string
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
    description?: string
    createdAt?: string
    isMock?: boolean
}

export type Proposal = {
    id: number
    type: 'brand_invite' | 'creator_apply' // 누가 먼저 제안했는지
    dealType: 'ad' | 'gonggu' // 광고 vs 공구

    // Brand Invite Specific
    eventId?: number
    productId?: string
    requestDetails?: string

    // Creator Apply Specific
    cost?: number // 희망 광고비
    commission?: number // 희망 수수료 (%)

    // Status Flow
    status: 'applied' | 'accepted' | 'rejected' | 'negotiating'

    // Negotiation
    negotiationBase?: number
    negotiationIncentive?: string

    fromId: string
    toId: string
    date: string
}

export type BrandProposal = {
    id: string
    brand_id: string
    influencer_id: string
    product_name: string
    product_type: string
    compensation_amount: string
    has_incentive: boolean
    incentive_detail: string
    content_type: string
    message: string
    status: string
    created_at: string
    brand_name?: string
    influencer_name?: string
    event_id?: string
    isMock?: boolean
}



// --- Initial Mock Data ---
import { MOCK_PRODUCTS, MOCK_EVENTS, MOCK_BRAND_PROPOSALS, MOCK_MESSAGES } from "@/lib/mock-data"
import { createClient } from "@/lib/supabase/client"

export const MOCK_INFLUENCER_USER: User = {
    id: "guest_influencer",
    name: "김수민",
    type: "influencer",
    handle: "@im_breath_ing",
    followers: 5851,
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop",
    bio: "안녕하세요! 일상을 기록하는 크리에이터 김수민입니다.",
    tags: ["💄 뷰티", "✈️ 여행", "🥗 다이어트", "💍 웨딩/결혼"],
    isMock: true
}

export const MOCK_BRAND_USER: User = {
    id: "guest_brand",
    name: "삼성전자",
    type: "brand",
    handle: "@samsung_korea",
    avatar: "https://images.unsplash.com/photo-1614680376593-902f74cf0d41?w=400&h=400&fit=crop",
    bio: "기술로 세상을 더 나쁘게... 아니, 더 좋게 만듭니다.",
    isMock: true
}

const INITIAL_PRODUCTS: Product[] = MOCK_PRODUCTS
const INITIAL_EVENTS: InfluencerEvent[] = MOCK_EVENTS
const INITIAL_PROPOSALS: BrandProposal[] = MOCK_BRAND_PROPOSALS
const INITIAL_MESSAGES: Message[] = MOCK_MESSAGES
const INITIAL_CAMPAIGNS: Campaign[] = [
    {
        id: 1,
        brand: "SAMSUNG",
        product: "Galaxy Watch 6",
        category: "테크 / 건강",
        budget: "100만원 + 제품 제공",
        target: "운동을 즐기는 2030 직장인",
        description: "새로운 수면 측정 기능을 강조해주세요.",
        matchScore: 98,
        date: "2024-03-01",
        isMock: true
    },
    {
        id: 2,
        brand: "Nike",
        product: "러닝화 Pegasus 40",
        category: "스포츠",
        budget: "50만원 + 제품 제공",
        target: "러닝 크루 활동을 하는 분",
        description: "편안한 착화감과 데일리 런닝에 적합함을 어필.",
        matchScore: 85,
        date: "2024-02-28",
        isMock: true
    },
]



// --- Context    // --- Message Logic ---
export type Message = {
    id: string
    senderId: string
    receiverId: string
    proposalId?: string // Optional link to a specific proposal
    content: string
    timestamp: string
    read: boolean
    senderName?: string
    senderAvatar?: string
    receiverName?: string
    receiverAvatar?: string
    isMock?: boolean
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
    updateProposal: (id: number, data: Partial<Proposal>) => void
    deleteBrandProposal: (id: string) => Promise<void>

    notifications: Notification[]
    sendNotification: (toUserId: string, message: string) => void
    messages: Message[]
    updateBrandProposal: (id: string, status: string) => Promise<void>
    sendMessage: (toUserId: string, content: string, proposalId?: string) => Promise<void>
    switchRole: (newRole: 'brand' | 'influencer') => Promise<void>
    isLoading: boolean
    resetData: () => void
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
    const [proposals, setProposals] = useState<Proposal[]>([])
    const [brandProposals, setBrandProposals] = useState<BrandProposal[]>(INITIAL_PROPOSALS)
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [messages, setMessages] = useState<Message[]>([])
    const [isInitialized, setIsInitialized] = useState(false)
    const [isAuthChecked, setIsAuthChecked] = useState(false)

    useEffect(() => {
        console.log('[PlatformProvider] COMPONENT MOUNTED')
        return () => {
            console.log('[PlatformProvider] COMPONENT UNMOUNTED')
        }
    }, [])

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
        const storedUser = localStorage.getItem("crealab_user")
        const storedCampaigns = localStorage.getItem("crealab_campaigns")
        const storedEvents = localStorage.getItem("crealab_events")
        const storedProducts = localStorage.getItem("crealab_products")
        const storedProposals = localStorage.getItem("crealab_proposals")
        const storedNotifs = localStorage.getItem("crealab_notifications")
        const storedMessages = localStorage.getItem("crealab_messages")

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
            localStorage.setItem("crealab_user", JSON.stringify(user))
        } else {
            localStorage.removeItem("crealab_user")
        }
    }, [user, isInitialized])

    useEffect(() => {
        if (!isInitialized) return
        localStorage.setItem("crealab_campaigns", JSON.stringify(campaigns))
    }, [campaigns, isInitialized])

    useEffect(() => {
        if (!isInitialized) return
        localStorage.setItem("crealab_events", JSON.stringify(events))
    }, [events, isInitialized])

    useEffect(() => {
        if (!isInitialized) return
        localStorage.setItem("crealab_products", JSON.stringify(products))
    }, [products, isInitialized])

    useEffect(() => {
        if (!isInitialized) return
        localStorage.setItem("crealab_proposals", JSON.stringify(proposals))
    }, [proposals, isInitialized])

    useEffect(() => {
        if (!isInitialized) return
        localStorage.setItem("crealab_notifications", JSON.stringify(notifications))
    }, [notifications, isInitialized])

    useEffect(() => {
        if (!isInitialized) return
        localStorage.setItem("crealab_messages", JSON.stringify(messages))
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
                    tags: details?.tags
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
                    tags: details?.tags || []
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
                    fetchEvents(session.user.id)
                }
            } else if (mounted) {
                // IMPORTANT: If no session, clear local user state to prevent "ghost login"
                console.log('[PlatformProvider] No session found, clearing user state')
                setUser(null)
            }
            if (mounted) setIsAuthChecked(true)
        }

        initAuth()

        // Fetch events function - scoped here or outside? 
        // Better to define it outside if we want to reuse, but here is fine for now if we pass user ID.
        // Actually, let's define it inside the effect or as a helper.
        // To keep it simple, I'll inline the fetch logic in a separate async checks or just calling it.

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log(`[Auth] onAuthStateChange event: ${event}`, session?.user?.id)
            if (session?.user && mounted) {
                const fetchedUser = await fetchUserProfile(session.user)
                setUser(fetchedUser)
                console.log('[Auth] User logged in, fetching data for:', session.user.id)
                fetchEvents(session.user.id)
                fetchMessages(session.user.id)
            } else if (!session && mounted) {
                // Not logged in -> Show Mock Data for guest browsing
                setUser(null)
                setEvents(INITIAL_EVENTS)
                setProducts(INITIAL_PRODUCTS)
                setBrandProposals(INITIAL_PROPOSALS)
                setMessages(INITIAL_MESSAGES)
            }
            if (mounted) setIsAuthChecked(true)
        })

        return () => {
            mounted = false
            subscription.unsubscribe()
        }
    }, [supabase])

    const isFetchingEvents = React.useRef(false)
    const fetchEvents = React.useCallback(async (userId?: string) => {
        const targetId = userId || user?.id
        if (!targetId || isFetchingEvents.current) return

        isFetchingEvents.current = true
        try {
            console.log('[PlatformProvider] Fetching events & data for:', targetId)
            // 1. Fetch Events
            const { data: eventsData, error: eventsError } = await supabase
                .from('influencer_events')
                .select(`
                    *,
                    profiles!influencer_id(
                        display_name,
                        avatar_url,
                        role,
                        influencer_details(instagram_handle, followers_count)
                    )
                `)
                .order('created_at', { ascending: false })

            if (eventsError) {
                console.error('[fetchEvents] Error fetching events:', eventsError)
            }

            if (eventsData) {
                console.log('[fetchEvents] Fetched events from DB:', eventsData.length, 'events')
                const mappedEvents: InfluencerEvent[] = eventsData.map((e: any) => {
                    const details = Array.isArray(e.profiles?.influencer_details)
                        ? e.profiles?.influencer_details[0]
                        : e.profiles?.influencer_details;

                    return {
                        id: e.id,
                        influencer: e.profiles?.display_name || "Unknown",
                        influencerId: e.influencer_id,
                        handle: details?.instagram_handle || "",
                        avatar: e.profiles?.avatar_url || "",
                        category: e.category,
                        event: e.title,
                        date: new Date(e.created_at).toISOString().split('T')[0],
                        description: e.description,
                        tags: e.tags || [],
                        verified: e.is_verified || false,
                        followers: details?.followers_count || 0,
                        targetProduct: e.target_product || "",
                        eventDate: e.event_date || "",
                        postingDate: e.posting_date || "",
                        guide: e.guide || "",
                        status: (e.event_date && new Date(e.event_date) < new Date()) ? 'completed' : 'active'
                    }
                })
                // Mock 데이터와 병합 (실제 서비스에서는 제거하거나 구분 필요)
                // 중복 방지를 위해 DB에 있는 ID는 제외할 수도 있지만, 현재는 데모 목적이므로 병합
                setEvents([...mappedEvents, ...MOCK_EVENTS])
                console.log('[fetchEvents] Set events state with', mappedEvents.length, 'events')
            }

            // 1.5. Fetch All Active Campaigns
            const { data: campaignData, error: campaignError } = await supabase
                .from('campaigns')
                .select(`
                    *,
                    profiles!brand_id(display_name)
                `)
                .eq('status', 'active')
                .order('created_at', { ascending: false })

            if (campaignData) {
                const mappedCampaigns: Campaign[] = campaignData.map((c: any) => ({
                    id: c.id,
                    brandId: c.brand_id,
                    brand: c.profiles?.display_name || "Unknown Brand",
                    product: c.product_name || "",
                    category: c.title.match(/\[(.*?)\]/)?.[1] || "기타",
                    budget: "제공 내역 상세 참고",
                    target: "스타일에 맞는 크리에이터",
                    description: c.description || "",
                    matchScore: Math.floor(Math.random() * 20) + 80,
                    date: new Date(c.created_at).toISOString().split('T')[0]
                }))
                setCampaigns(mappedCampaigns)
            }

            // 2. Fetch Brand Proposals (Both sent and received, or all if admin)
            if (userId) {
                let query = supabase
                    .from('brand_proposals')
                    .select('*, brand_profile:profiles!brand_id(display_name), influencer_profile:profiles!influencer_id(display_name)')

                // Fetch user role to check admin status
                const { data: profile } = await supabase.from('profiles').select('role').eq('id', userId).single()

                if (profile?.role !== 'admin') {
                    query = query.or(`brand_id.eq.${userId},influencer_id.eq.${userId}`)
                }

                const { data: bpData } = await query.order('created_at', { ascending: false })

                if (bpData) {
                    console.log('[fetchEvents] Fetched proposals:', bpData.length)
                    const mappedBP: BrandProposal[] = bpData.map((b: any) => ({
                        ...b,
                        brand_name: b.brand_profile?.display_name || 'Brand',
                        influencer_name: b.influencer_profile?.display_name || 'Creator'
                    }))
                    setBrandProposals(mappedBP)
                }
            }

            // 4. Fetch Brand Products
            const { data: productData, error: productError } = await supabase
                .from('brand_products')
                .select(`
                    *,
                    profiles!brand_id(display_name)
                `)
                .order('created_at', { ascending: false })

            if (productData) {
                console.log('[fetchEvents] Fetched products:', productData.length)
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
                    description: p.description,
                    createdAt: p.created_at
                }))
                setProducts(mappedProducts)
            } else if (productError) {
                console.error('[fetchEvents] Error fetching products:', {
                    code: productError.code,
                    message: productError.message,
                    details: productError.details,
                    hint: productError.hint
                })

                if (productError.code === '42P01') {
                    console.warn('The "brand_products" table is missing. Please run "documents/brand_products_schema.sql" in Supabase SQL editor.')
                }
            }
        } catch (err) {
            console.error('[fetchEvents] Fetch exception:', err)
        } finally {
            isFetchingEvents.current = false
        }
    }, [user, supabase])

    const isFetchingMessages = React.useRef(false)
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
                    id: msg.id,
                    senderId: msg.sender_id,
                    receiverId: msg.receiver_id,
                    proposalId: msg.proposal_id,
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
                console.error('[fetchMessages] Fetch exception:', {
                    message: err?.message,
                    stack: err?.stack
                })
            }
        } finally {
            isFetchingMessages.current = false
        }
    }, [supabase])

    // Polling for new messages every 5 seconds
    useEffect(() => {
        if (!user) return

        const interval = setInterval(() => {
            fetchMessages(user.id)
        }, 5000)

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
            localStorage.removeItem("crealab_user")
            localStorage.removeItem("crealab_events")
            localStorage.removeItem("crealab_campaigns")
            localStorage.removeItem("crealab_products")
            localStorage.removeItem("crealab_proposals")
            localStorage.removeItem("crealab_notifications")
            localStorage.removeItem("crealab_messages")

        } catch (error) {
            console.error('[Logout] Failed to sign out:', error)
            // Still clear local user state even if signOut fails
            setUser(null)

            // Clear localStorage even on error
            localStorage.removeItem("crealab_user")
            localStorage.removeItem("crealab_events")
            localStorage.removeItem("crealab_campaigns")
            localStorage.removeItem("crealab_products")
            localStorage.removeItem("crealab_proposals")
            localStorage.removeItem("crealab_notifications")
            localStorage.removeItem("crealab_messages")
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

            console.log('[updateUser] Sending profile update to Supabase...', profileUpdates)

            // Use upsert to handle cases where the profile row might be missing (e.g. after a DB reset)
            const { error: profileError } = await supabase
                .from('profiles')
                .upsert({
                    id: user.id,
                    role: user.type, // Ensure role is preserved/set
                    ...profileUpdates
                }, { onConflict: 'id' })

            if (profileError) {
                console.error('[updateUser] Profile update DB error:', profileError)
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

                console.log('[updateUser] Upserting influencer_details...', detailsUpdates)

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
                    .upsert({
                        id: user.id,
                        updated_at: new Date().toISOString()
                    }, { onConflict: 'id' })

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

            // Simple update call without waiting for return data (avoids RLS/Single issues)
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
            alert(`제품 수정 실패: ${e.message || "알 수 없는 오류"}`)
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
                await sendMessage(newProposal.toId, `[협업 제안] ${productName} 제품에 대한 제안이 도착했습니다.`, data.id)
            }
        } catch (e: any) {
            console.error("Failed to add proposal:", e)
            alert(`제안 전송에 실패했습니다: ${e.message}`)
        }
    }

    const updateProposal = (id: number, data: Partial<Proposal>) => {
        setProposals(prev => prev.map(p => p.id === id ? { ...p, ...data } : p))
    }

    const updateBrandProposal = async (id: string, status: string) => {
        try {
            const { error } = await supabase
                .from('brand_proposals')
                .update({ status })
                .eq('id', id)

            if (error) throw error

            // Update local state
            setBrandProposals(prev => prev.map(p => p.id === id ? { ...p, status } : p))
        } catch (e) {
            console.error("Failed to update proposal status:", e)
            alert("상태 수정에 실패했습니다.")
        }
    }

    const sendNotification = (toUserId: string, message: string) => {
        const newNotif: Notification = {
            id: Date.now(),
            toUserId,
            message,
            date: new Date().toISOString().split("T")[0],
            read: false
        }
        setNotifications(prev => [newNotif, ...prev])
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

    const sendMessage = async (toUserId: string, content: string, proposalId?: string) => {
        if (!user) return

        try {
            const { data, error } = await supabase
                .from('messages')
                .insert({
                    proposal_id: proposalId,
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

    const resetData = () => {
        setCampaigns(INITIAL_CAMPAIGNS)
        setEvents([]) // Clear events, let them re-fetch or stay empty
        setProducts(INITIAL_PRODUCTS)
        setProposals([])
        setNotifications([])
        setMessages([])

        // Clear LocalStorage (except user to keep login)
        // localStorage.removeItem("crealab_user")
        localStorage.removeItem("crealab_campaigns")
        localStorage.removeItem("crealab_events")
        localStorage.removeItem("crealab_products")
        localStorage.removeItem("crealab_proposals")
        localStorage.removeItem("crealab_notifications")
        localStorage.removeItem("crealab_messages")

        alert("데이터가 초기화되었습니다.")
        fetchEvents(user?.id) // Attempt refetch
    }

    return (
        <PlatformContext.Provider value={{
            user, login, logout, updateUser,
            campaigns, addCampaign, deleteCampaign,
            events, addEvent, deleteEvent, updateEvent,
            products, addProduct, updateProduct, deleteProduct,
            proposals, addProposal, updateProposal, deleteProposal, createBrandProposal,
            brandProposals, updateBrandProposal, deleteBrandProposal,
            notifications, sendNotification,
            messages, sendMessage,
            switchRole,
            isLoading: !isInitialized || !isAuthChecked,
            resetData,
            supabase
        }}>
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
