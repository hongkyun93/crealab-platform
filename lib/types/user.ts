// User and Authentication Types
export type UserType = "brand" | "influencer" | "admin"

export interface User {
    id: string
    name: string
    type: UserType
    avatar?: string
    bio?: string
    tags?: string[]
    website?: string
    handle?: string
    followers?: number
    phone?: string
    address?: string
    isMock?: boolean

    // Rate Card Fields (for influencers)
    priceVideo?: number
    priceFeed?: number
    secondaryRights?: number
    usageRightsMonth?: number
    usageRightsPrice?: number
    autoDmMonth?: number
    autoDmPrice?: number
}

export interface AuthState {
    user: User | null
    isAuthenticated: boolean
    isLoading: boolean
}
