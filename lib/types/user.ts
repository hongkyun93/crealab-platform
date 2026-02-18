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
    website?: string // DEPRECATED: Will be removed in Phase 6 (Social Channels)
    handle?: string // DEPRECATED: Moved to social_channels table
    followers?: number // DEPRECATED: Moved to social_channels table
    tags?: string[]
    phone?: string
    address?: string
    isMock?: boolean
    teamId?: string
    onboardingCompleted?: boolean // Track if user completed initial onboarding

    // NEW: Primary Region
    primaryRegion?: string // 주요 활동 지역 (서울, 부산, 전국, etc.)

    // Rate Card Fields (for influencers) - EXTENDED
    priceVideo?: number // 숏폼 영상 (Reels/Shorts)
    priceFeed?: number // 피드 게시물 (Photo/Carousel)
    priceStory?: number // 스토리 게시 (NEW)
    priceUsageRights?: number // 2차 활용권 (NEW)
    priceAutoDm?: number // 자동 DM 발송 (NEW)
    secondaryRights?: boolean // Fixed type to boolean based on usage
    usageRightsMonth?: number
    usageRightsPrice?: number
    autoDmMonth?: number
    autoDmPrice?: number

    // Bank Info
    bankName?: string
    accountNumber?: string
    accountHolder?: string
}

// Social Channel Types
export type SocialPlatform = 'instagram' | 'youtube' | 'blog' | 'tiktok' | 'other'

export interface SocialChannel {
    id: string
    userId: string
    platform: SocialPlatform
    handle: string // @username or URL
    followersCount: number
    isPrimary: boolean // Only one channel can be primary per user
    isPublic: boolean // Visible to brands
    createdAt?: string
    updatedAt?: string
}

