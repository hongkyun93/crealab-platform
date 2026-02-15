// User and Authentication Types
export type UserType = 'brand' | 'creator' | 'admin' | 'agency' | 'mcn'

export interface User {
    id: string
    name: string
    email?: string
    type: UserType
    role?: string
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
    secondaryRights?: number
    usageRightsMonth?: number
    usageRightsPrice?: number
    autoDmMonth?: number
    autoDmPrice?: number
}
