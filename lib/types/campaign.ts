// Campaign Types
export interface Campaign {
    id: number | string
    brandId?: string
    brand: string
    brandAvatar?: string
    product: string
    category: string
    budget: string
    target: string
    description: string
    image?: string
    matchScore?: number
    date: string
    eventDate?: string
    postingDate?: string
    targetProduct?: string
    status?: 'active' | 'completed' | 'paused' | 'closed'
    isMock?: boolean
    tags?: string[]
}

export interface CampaignFormData {
    product: string
    category: string
    budget: string
    target: string
    description: string
    eventDate: string
    postingDate: string
    tags: string
    image?: string
}
