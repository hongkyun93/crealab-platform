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

    // Brand Business Info
    representativeName?: string   // 대표자명
    businessNumber?: string       // 사업자 등록번호
    companyAddress?: string       // 회사 주소
    companyPhone?: string         // 회사 전화번호
    taxEmail?: string             // 세금계산서 이메일
    businessCategory?: string     // 업태/업종
    businessType?: string         // 사업자 유형 (법인/개인)
    contactPersonName?: string    // 담당자명
    contactPersonPhone?: string   // 담당자 연락처
    contactPersonEmail?: string   // 담당자 이메일
    settlementBank?: string       // 정산 계좌 정보

    // Creator Legal/Tax Info
    legalName?: string            // 실명 (법적 이름)
    birthDate?: string            // 생년월일
    legalAddress?: string         // 법적 주소
    isBusinessRegistered?: boolean // 사업자 등록 여부
    creatorBusinessNumber?: string // 크리에이터 사업자번호
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

