// User and Authentication Types
export type UserRole = 'brand' | 'creator' | 'admin' | 'agency' | 'mcn'

export interface User {
    id: string
    name: string
    email?: string
    // type: UserType  <-- DEPRECATED & REMOVED
    role: UserRole // <-- Now the primary source of truth
    avatar?: string
    bio?: string
    website?: string
    handle?: string
    followers?: number
    tags?: string[]
    phone?: string
    address?: string
    isMock?: boolean
    teamId?: string
    onboardingCompleted?: boolean // Track if user completed initial onboarding

    // Rate Card Fields (for influencers)
    priceVideo?: number
    priceFeed?: number
    secondaryRights?: boolean // Fixed type to boolean based on usage
    usageRightsMonth?: number
    usageRightsPrice?: number
    autoDmMonth?: number
    autoDmPrice?: number

    // Bank Info [NEW]
    bankName?: string
    accountNumber?: string
    accountHolder?: string
}
