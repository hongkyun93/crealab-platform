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
    id: number
    influencer: string
    handle: string
    avatar: string
    category: string
    event: string
    date: string
    description: string
    tags: string[]
    verified: boolean
    followers: number // Added follower count
    targetProduct: string // 희망하는 광고 제품
    eventDate: string // 이벤트 날짜
    postingDate: string // 콘텐츠 업로드 시기
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

// --- Initial Mock Data ---
import { MOCK_EVENTS, MOCK_PRODUCTS } from "@/lib/mock-data"
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

const INITIAL_EVENTS: InfluencerEvent[] = MOCK_EVENTS

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
    addEvent: (event: Omit<InfluencerEvent, "id" | "influencer" | "handle" | "avatar" | "verified" | "followers">) => void
    updateEvent: (id: number, data: Partial<InfluencerEvent>) => void
    deleteEvent: (id: number) => void

    products: Product[]
    addProduct: (product: Omit<Product, "id" | "brandId" | "brandName">) => void
    proposals: Proposal[]
    addProposal: (proposal: Omit<Proposal, "id" | "date">) => void
    updateProposal: (id: number, data: Partial<Proposal>) => void

    notifications: Notification[]
    sendNotification: (toUserId: string, message: string) => void
    messages: Message[]
    sendMessage: (toUserId: string, content: string) => void
    isLoading: boolean
    resetData: () => void
}



const PlatformContext = createContext<PlatformContextType | undefined>(undefined)

export function PlatformProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [campaigns, setCampaigns] = useState<Campaign[]>(INITIAL_CAMPAIGNS)
    const [events, setEvents] = useState<InfluencerEvent[]>(INITIAL_EVENTS)
    const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS)
    const [proposals, setProposals] = useState<Proposal[]>([])
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [messages, setMessages] = useState<Message[]>([])
    const [isInitialized, setIsInitialized] = useState(false)
    const [isAuthChecked, setIsAuthChecked] = useState(false) // Wait for Supabase check

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
                // Check if it matches mock credentials for testing fallback
                if ((id === "brand1" && pw === "1234") || (id === "creator1" && pw === "1234") || (id === "admin" && pw === "admin")) {
                    // Fallthrough to mock logic below
                } else {
                    throw error
                }
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

        // Mock Login Logic (Fallback)
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (id === "brand1" && pw === "1234") {
                    const user: User = {
                        id: "brand1",
                        name: "SAMSUNG",
                        type: "brand",
                        avatar: "S",
                        bio: "세계 최고의 기술 기업 삼성전자입니다.",
                        website: "https://samsung.com"
                    }
                    setUser(user)
                    resolve(user)
                } else if (id === "creator1" && pw === "1234") {
                    const user: User = {
                        id: "creator1",
                        name: "김세라",
                        type: "influencer",
                        avatar: "김",
                        handle: "@sarah_life",
                        bio: "매일 반복되는 일상을 특별하게 기록합니다. 📸",
                        tags: ["라이프스타일", "인테리어", "카페"],
                        followers: 45000,
                    }
                    setUser(user)
                    resolve(user)
                } else if (id === "admin" && pw === "admin") {
                    const user: User = { id: "admin", name: "관리자", type: "admin" }
                    setUser(user)
                    resolve(user)
                } else {
                    reject(new Error("아이디 또는 비밀번호가 일치하지 않습니다."))
                }
            }, 500)
        })
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
        // ... (initAuth logic same as before)
        const initAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            if (session?.user && mounted) {
                const fetchedUser = await fetchUserProfile(session.user)
                if (fetchedUser) {
                    setUser(fetchedUser)
                }
            }
            if (mounted) setIsAuthChecked(true)
        }
        initAuth()

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (session?.user && mounted) {
                const fetchedUser = await fetchUserProfile(session.user)
                if (fetchedUser) {
                    setUser(fetchedUser)
                }
            } else if (!session && mounted) {
                if (event === 'SIGNED_OUT') {
                    setUser(null)
                }
            }
            if (mounted) setIsAuthChecked(true)
        })

        return () => {
            mounted = false
            subscription.unsubscribe()
        }
    }, [supabase])

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
        await supabase.auth.signOut()
        setUser(null)
    }

    const updateUser = async (data: Partial<User>) => {
        if (!user) return

        // 1. Update Local State immediately for UI responsiveness
        const updatedUser = { ...user, ...data }
        setUser(updatedUser)

        try {
            // 2. Prepare data for 'profiles' table
            const profileUpdates: any = {
                id: user.id,
                updated_at: new Date().toISOString(),
            }
            if (data.name !== undefined) profileUpdates.display_name = data.name
            if (data.bio !== undefined) profileUpdates.bio = data.bio
            if (data.avatar !== undefined) profileUpdates.avatar_url = data.avatar

            // 3. Update 'profiles'
            const { error: profileError } = await supabase
                .from('profiles')
                .upsert(profileUpdates)

            if (profileError) throw profileError

            // 4. If Influencer, update 'influencer_details'
            // We assume role is in user.type or check profile.role
            if (user.type === 'influencer' || updatedUser.type === 'influencer') { // simplified check
                const detailsUpdates: any = {
                    id: user.id, // Foreign key matches profile id
                    updated_at: new Date().toISOString(),
                }
                if (data.tags !== undefined) detailsUpdates.tags = data.tags
                if (data.handle !== undefined) detailsUpdates.instagram_handle = data.handle
                if (data.followers !== undefined) detailsUpdates.followers_count = data.followers

                if (Object.keys(detailsUpdates).length > 2) { // id + date + at least one field
                    const { error: detailsError } = await supabase
                        .from('influencer_details')
                        .upsert(detailsUpdates)

                    if (detailsError) throw detailsError
                }
            }

            console.log("User profile updated successfully in user DB")
        } catch (error) {
            console.error("Error updating user profile:", error)
            // Optionally revert local state or show toast
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

    const addEvent = (newEvent: Omit<InfluencerEvent, "id" | "influencer" | "handle" | "avatar" | "verified" | "followers">) => {
        const event: InfluencerEvent = {
            ...newEvent,
            id: events.length + 1,
            influencer: user?.name || "나 (Me)",
            handle: user?.handle || "@my_handle",
            avatar: user?.avatar || "나",
            verified: true,
            followers: user?.followers || 0,
        }
        setEvents([event, ...events])
    }

    const updateEvent = (id: number, data: Partial<InfluencerEvent>) => {
        setEvents(prev => prev.map(event => event.id === id ? { ...event, ...data } : event))
    }

    const deleteEvent = (id: number) => {
        setEvents(prev => prev.filter(event => event.id !== id))
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
        setEvents(INITIAL_EVENTS)
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

        alert("데이터가 초기화되었습니다. 새로운 데모 데이터가 로드됩니다.")
    }

    return (
        <PlatformContext.Provider value={{
            user, login, logout, updateUser,
            campaigns, addCampaign, deleteCampaign,
            events, addEvent, deleteEvent, updateEvent,
            products, addProduct,
            proposals, addProposal, updateProposal,
            notifications, sendNotification,
            messages, sendMessage,
            isLoading: !isInitialized || !isAuthChecked,
            resetData
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
