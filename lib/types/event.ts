// Event (Moment) Types
export interface InfluencerEvent {
    id: string
    influencer: string
    influencerId?: string
    handle: string
    avatar: string
    priceVideo?: number      // 숏폼 영상 (Reels) 단가
    priceFeed?: number       // 이미지 피드 단가
    usageRightsPrice?: number // 2차 활용 권한 단가
    usageRightsMonth?: number // 2차 활용 권한 기간 (개월)
    autoDmPrice?: number     // 자동 DM 단가
    autoDmMonth?: number     // 자동 DM 기간 (개월)
    event: string // Title in DB
    title?: string // Alias for event
    date: string
    description: string
    tags: string[]
    verified: boolean
    followers: number
    category?: string
    targetProduct: string
    eventDate: string
    postingDate?: string
    guide?: string
    status?: 'recruiting' | 'active' | 'completed'
    isMock?: boolean
    isPrivate?: boolean
    dateFlexible?: boolean
    schedule?: EventSchedule
    createdAt?: string
    channels?: string[]
    socialChannels?: { platform: string; handle: string; followersCount: number }[]
    // Exact dates (private — shown only to creator + MCN)
    eventStartDate?: string   // ISO "YYYY-MM-DD"
    eventEndDate?: string     // ISO "YYYY-MM-DD" (multi-day events, optional)
    postingDateExact?: string // ISO "YYYY-MM-DD"
}

export interface EventSchedule {
    product_delivery?: string
    draft_submission?: string
    shooting?: string
    feedback?: string
    upload?: string
}

export interface EventFormData {
    event: string
    description: string
    targetProduct: string
    eventDate: string
    postingDate?: string
    tags: string[]
    guide?: string
    isPrivate?: boolean
    dateFlexible?: boolean
    schedule?: EventSchedule
    // Exact dates (private)
    eventStartDate?: string
    eventEndDate?: string
    postingDateExact?: string
}
