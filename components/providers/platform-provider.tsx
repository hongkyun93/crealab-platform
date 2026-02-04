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
}

export type Notification = {
    id: number
    toUserId: string
    message: string
    date: string
    read: boolean
}

export type Campaign = {
    id: number
    brand: string // For now, we'll hardcode or randomise this
    product: string
    category: string
    budget: string
    target: string
    description: string
    matchScore?: number // Mock score
    date: string // Created date
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
    postingDate: string // 콘텐츠 업로드 시기 (e.g. 2026년 4월)
}

export type Product = {
    id: number
    brandId: string
    brandName: string
    name: string
    price: number
    image: string
    link: string
    points: string // 소구 포인트
    shots: string // 필수 촬영 컷
    category: string
}

export type Proposal = {
    id: number
    type: 'brand_invite' | 'creator_apply' // 누가 먼저 제안했는지
    dealType: 'ad' | 'gonggu' // 광고 vs 공구

    // Brand Invite Specific
    eventId?: number
    productId?: number
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
}



// --- Initial Mock Data ---
import { MOCK_PRODUCTS } from "@/lib/mock-data"
import { createClient } from "@/lib/supabase/client"

const INITIAL_PRODUCTS: Product[] = MOCK_PRODUCTS
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
    },
]



// --- Context    // --- Message Logic ---
export type Message = {
    id: string
    senderId: string
    receiverId: string
    content: string
    timestamp: string
    read: boolean
}

interface PlatformContextType {
    user: User | null
    login: (id: string, pw: string) => Promise<User>
    logout: () => void
    updateUser: (data: Partial<User>) => void
    campaigns: Campaign[]
    addCampaign: (campaign: Omit<Campaign, "id" | "date" | "matchScore">) => void
    deleteCampaign: (id: number) => void
    events: InfluencerEvent[]
    addEvent: (event: Omit<InfluencerEvent, "id" | "influencer" | "influencerId" | "handle" | "avatar" | "verified" | "followers">) => Promise<void>
    updateEvent: (id: string, data: Partial<InfluencerEvent>) => Promise<void>
    deleteEvent: (id: string) => Promise<void>

    products: Product[]
    addProduct: (product: Omit<Product, "id" | "brandId" | "brandName">) => void
    proposals: Proposal[]
    brandProposals: BrandProposal[] // New direct proposals
    addProposal: (proposal: Omit<Proposal, "id" | "date">) => void
    updateProposal: (id: number, data: Partial<Proposal>) => void

    notifications: Notification[]
    sendNotification: (toUserId: string, message: string) => void
    messages: Message[]
    sendMessage: (toUserId: string, content: string) => void
    isLoading: boolean
    resetData: () => void
    supabase: any
}



const PlatformContext = createContext<PlatformContextType | undefined>(undefined)

import { Session } from "@supabase/supabase-js"

export function PlatformProvider({ children, initialSession }: { children: React.ReactNode, initialSession?: Session | null }) {
    const [user, setUser] = useState<User | null>(null)
    const [campaigns, setCampaigns] = useState<Campaign[]>(INITIAL_CAMPAIGNS)
    const [events, setEvents] = useState<InfluencerEvent[]>([])
    const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS)
    const [proposals, setProposals] = useState<Proposal[]>([])
    const [brandProposals, setBrandProposals] = useState<BrandProposal[]>([])
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [messages, setMessages] = useState<Message[]>([])
    const [isInitialized, setIsInitialized] = useState(false)
    const [isAuthChecked, setIsAuthChecked] = useState(false) // Wait for Supabase check

    // Initialize state with Server Session if available
    useEffect(() => {
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
    const [supabase] = useState(() => createClient())

    const fetchUserProfile = async (sessionUser: any): Promise<User | null> => {
        try {
            // Verify if we have a profile and fetch details
            const { data: profile } = await supabase
                .from('profiles')
                .select('*, influencer_details(*)')
                .eq('id', sessionUser.id)
                .single()

            if (profile) {
                return {
                    id: sessionUser.id,
                    name: profile.display_name || profile.name || sessionUser.email?.split('@')[0] || "User",
                    type: (profile.role as "brand" | "influencer" | "admin") || "influencer",
                    avatar: profile.avatar_url || sessionUser.user_metadata?.avatar_url,
                    bio: profile.bio,
                    website: profile.website,
                    handle: profile.influencer_details?.[0]?.instagram_handle || profile.username || undefined,
                    followers: profile.influencer_details?.[0]?.followers_count || profile.followers,
                    tags: profile.influencer_details?.[0]?.tags || []
                }
            } else {
                // If no profile, we use session data
                return {
                    id: sessionUser.id,
                    name: sessionUser.user_metadata?.name || sessionUser.email?.split('@')[0] || "User",
                    type: (sessionUser.user_metadata?.role as "brand" | "influencer" | "admin") || "influencer",
                    avatar: sessionUser.user_metadata?.avatar_url,
                    tags: []
                }
            }
        } catch (e) {
            console.error("Error fetching profile:", e)
            return null
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
            if (session?.user && mounted) {
                const fetchedUser = await fetchUserProfile(session.user)
                if (fetchedUser) {
                    setUser(fetchedUser)
                    console.log('[Auth] User logged in, fetching events for:', session.user.id)
                    fetchEvents(session.user.id)
                }
            } else if (!session && mounted) {
                setUser(null)
                setEvents([])
            }
            if (mounted) setIsAuthChecked(true)
        })

        return () => {
            mounted = false
            subscription.unsubscribe()
        }
    }, [supabase])

    const fetchEvents = async (userId?: string) => {
        try {
            console.log('[fetchEvents] Starting fetch for userId:', userId)


            // 1. Fetch Events
            const { data, error } = await supabase
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

            if (error) {
                console.error('[fetchEvents] Error fetching events:', error)
            }

            if (data) {
                console.log('[fetchEvents] Fetched events from DB:', data.length, 'events')
                const mappedEvents: InfluencerEvent[] = data.map((e: any) => ({
                    id: e.id,
                    influencer: e.profiles?.display_name || "Unknown",
                    influencerId: e.influencer_id,
                    handle: e.profiles?.influencer_details?.[0]?.instagram_handle || "",
                    avatar: e.profiles?.avatar_url || "",
                    category: e.category,
                    event: e.title,
                    date: new Date(e.created_at).toISOString().split('T')[0],
                    description: e.description,
                    tags: e.tags || [],
                    verified: e.is_verified || false,
                    followers: e.profiles?.influencer_details?.[0]?.followers_count || 0,
                    targetProduct: e.target_product || "",
                    eventDate: e.event_date || "",
                    postingDate: e.posting_date || ""
                }))
                setEvents(mappedEvents)
                console.log('[fetchEvents] Set events state with', mappedEvents.length, 'events')
            }

            // 2. Fetch Brand Proposals (if user is influencer)
            if (userId) { // Fetch all relevant to this user
                const { data: bpData } = await supabase
                    .from('brand_proposals')
                    .select('*, profiles!brand_id(display_name)')
                    .eq('influencer_id', userId)
                    .order('created_at', { ascending: false })

                if (bpData) {
                    console.log('[fetchEvents] Fetched brand proposals:', bpData.length)
                    const mappedBP: BrandProposal[] = bpData.map((b: any) => ({
                        ...b,
                        brand_name: b.profiles?.display_name || 'Brand'
                    }))
                    setBrandProposals(mappedBP)
                }
            }

        } catch (err) {
            console.error('[fetchEvents] Fetch exception:', err)
        }
    }

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

    const updateUser = async (data: Partial<User>) => {
        // 0. Check Supabase Session First
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
            console.error('[updateUser] No active session found')
            throw new Error('로그인 세션이 만료되었습니다. 다시 로그인해주세요.')
        }

        if (!user) return

        // 1. Update Local State immediately for UI responsiveness
        const updatedUser = { ...user, ...data }
        setUser(updatedUser)

        try {
            // 2. Prepare Profile Update (MUST run first to ensure row exists)
            const profileUpdates: any = {
                id: user.id,
                updated_at: new Date().toISOString(),
            }
            if (data.name !== undefined) profileUpdates.display_name = data.name
            if (data.bio !== undefined) profileUpdates.bio = data.bio
            if (data.avatar !== undefined) profileUpdates.avatar_url = data.avatar

            // Execute Profile Update FIRST (creates row if missing)
            console.log('[updateUser] Updating profiles table...', profileUpdates)
            const profileResult = await supabase.from('profiles').upsert(profileUpdates)
            if (profileResult.error) {
                console.error('[updateUser] Profile update error:', JSON.stringify(profileResult.error, null, 2))
                console.error('[updateUser] Full error object:', profileResult.error)
                throw profileResult.error
            }

            // 3. Influencer Details Update (AFTER profile exists)
            if (user.type === 'influencer' || updatedUser.type === 'influencer') {
                const detailsUpdates: any = {
                    id: user.id,
                    updated_at: new Date().toISOString(),
                }
                if (data.tags !== undefined) detailsUpdates.tags = data.tags
                if (data.handle !== undefined) detailsUpdates.instagram_handle = data.handle
                if (data.followers !== undefined) {
                    detailsUpdates.followers_count = data.followers

                    // Validate and ensure non-negative logic or just simple mapping
                    const count = typeof data.followers === 'string' ? parseInt(data.followers) : data.followers
                    let tier = 'Nano'
                    if (count >= 1000000) tier = 'Mega'
                    else if (count >= 100000) tier = 'Macro'
                    else if (count >= 10000) tier = 'Micro'

                    detailsUpdates.tier = tier
                }

                if (Object.keys(detailsUpdates).length > 2) {
                    console.log('[updateUser] Updating influencer_details table...', detailsUpdates)
                    const detailsResult = await supabase.from('influencer_details').upsert(detailsUpdates)
                    if (detailsResult.error) {
                        console.error('[updateUser] Influencer details error:', detailsResult.error)
                        throw detailsResult.error
                    }
                }
            }

            console.log("User profile updated successfully in user DB")
        } catch (error: any) {
            // Comprehensive error logging
            console.error("=== ERROR DETAILS START ===")
            console.error("Error type:", typeof error)
            console.error("Error constructor:", error?.constructor?.name)
            console.error("Error as string:", String(error))
            console.error("Error message:", error?.message)
            console.error("Error code:", error?.code)
            console.error("Error details:", error?.details)
            console.error("Error hint:", error?.hint)
            console.error("Error status:", error?.status)
            console.error("Error statusCode:", error?.statusCode)
            console.error("All error keys:", Object.keys(error || {}))
            console.error("All error entries:", Object.entries(error || {}))
            console.error("Direct error object:", error)
            console.error("=== ERROR DETAILS END ===")
            throw error // Propagate error to UI
        }
    }

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

    const deleteCampaign = (id: number) => {
        setCampaigns(prev => prev.filter(campaign => campaign.id !== id))
    }

    const addEvent = async (newEvent: Omit<InfluencerEvent, "id" | "influencer" | "influencerId" | "handle" | "avatar" | "verified" | "followers">) => {
        if (!user) return

        // 1. Optimistic Update (Optional, but let's wait for DB for ID)

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
                    tags: newEvent.tags,
                    status: 'recruiting'
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
                    date: new Date().toISOString().split('T')[0]
                }
                setEvents([event, ...events])
            }
        } catch (e) {
            console.error("Failed to add event:", e)
            alert("이벤트 등록에 실패했습니다.")
        }
    }

    const updateEvent = async (id: string, data: Partial<InfluencerEvent>) => {
        // Optimistic
        setEvents(prev => prev.map(event => event.id === id ? { ...event, ...data } : event))

        // DB Update (Not fully implemented mapping in this snip, assuming valid fields)
        // This is a placeholder for actual DB update logic
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
        }
    }

    const addProduct = (newProduct: Omit<Product, "id" | "brandId" | "brandName">) => {
        const product: Product = {
            ...newProduct,
            id: products.length + 1,
            brandId: user?.id || "unknown",
            brandName: user?.name || "Unknown Brand"
        }
        setProducts(prev => [product, ...prev])
    }

    const addProposal = (newProposal: Omit<Proposal, "id" | "date">) => {
        const proposal: Proposal = {
            ...newProposal,
            id: Date.now(),
            date: new Date().toISOString().split('T')[0]
        }
        setProposals(prev => [proposal, ...prev])
    }

    const updateProposal = (id: number, data: Partial<Proposal>) => {
        setProposals(prev => prev.map(p => p.id === id ? { ...p, ...data } : p))
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

    const sendMessage = (toUserId: string, content: string) => {
        if (!user) return
        const newMessage: Message = {
            id: Date.now().toString(),
            senderId: user.id,
            receiverId: toUserId,
            content,
            timestamp: new Date().toISOString(),
            read: false
        }
        setMessages(prev => [...prev, newMessage])
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
            products, addProduct,
            proposals, addProposal, updateProposal, brandProposals,
            notifications, sendNotification,
            messages, sendMessage,
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
