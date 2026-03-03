// Event (Moment) Types
export interface CreatorMoment {
    id: string
    influencer: string
    creatorId?: string
    handle: string
    avatar: string
    priceVideo?: number      // 숏폼 영상 (Reels) 단가
    priceFeed?: number       // 이미지 피드 단가
    usageRightsPrice?: number // 2차 활용 권한 단가
    usageRightsMonth?: number // 2차 활용 권한 기간 (개월)
    autoDmPrice?: number     // 자동 DM 단가
    autoDmMonth?: number     // 자동 DM 기간 (개월)
    title: string
    date: string
    description: string
    tags: string[]
    verified: boolean
    followers: number
    category?: string
    targetProduct: string
    momentDate?: string
    postingDate?: string
    guide?: string        // [LEGACY] kept for backward compat; new saves use video_guide
    video_guide?: string  // [UNIFIED] DB column name after rename
    status?: 'recruiting' | 'active' | 'completed'
    isMock?: boolean
    isPrivate?: boolean
    dateFlexible?: boolean
    schedule?: MomentSchedule
    createdAt?: string
    channels?: string[]
    socialChannels?: { platform: string; handle: string; followersCount: number }[]
    // Exact dates (private — shown only to creator + MCN)
    momentStartDate?: string  // ISO "YYYY-MM-DD"
    momentEndDate?: string    // ISO "YYYY-MM-DD" (multi-day moments, optional)
    postingDateExact?: string // ISO "YYYY-MM-DD"
}

export interface MomentSchedule {
    product_delivery?: string
    draft_submission?: string
    shooting?: string
    feedback?: string
    upload?: string
}

export interface MomentFormData {
    title: string
    description: string
    targetProduct: string
    momentDate?: string
    postingDate?: string
    tags: string[]
    guide?: string
    isPrivate?: boolean
    dateFlexible?: boolean
    schedule?: MomentSchedule
    // Exact dates (private)
    momentStartDate?: string
    momentEndDate?: string
    postingDateExact?: string
}
