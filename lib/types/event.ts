// Event (Moment) Types
export interface InfluencerEvent {
    id: string
    influencer: string
    influencerId?: string
    handle: string
    avatar: string
    priceVideo?: number
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
}
