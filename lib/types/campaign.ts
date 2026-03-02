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
    product_image_url?: string // Legacy/Fallback image field
    matchScore?: number
    date: string
    momentDate?: string
    postingDate?: string
    targetProduct?: string
    status?: 'active' | 'completed' | 'paused' | 'closed'
    isMock?: boolean
    tags?: string[]
    // New Fields (snake_case as returned by Supabase for now)
    title?: string // New title field
    recruitment_count?: number
    recruitment_deadline?: string
    channels?: string[]
    reference_link?: string
    hashtags?: string[]
    selection_announcement_date?: string
    min_followers?: number
    max_followers?: number
    posting_date?: string  // snake_case DB column alias for postingDate
    product_type?: 'gift' | 'loan'  // 제품 제공 방식
    created_at?: string
}

export interface CampaignFormData {
    title: string // New title field
    product: string
    category: string
    budget: string
    target: string
    description: string
    momentDate: string
    postingDate: string
    tags: string
    image?: string
}
