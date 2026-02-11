// Component type definitions for better type safety

export interface Proposal {
    id: number | string
    status: 'pending' | 'accepted' | 'rejected' | 'hold' | 'viewed' | 'applied'
    influencerName: string
    influencerAvatar?: string
    date: string
    message: string
    cost?: number
    campaignId?: string
    type?: 'creator_apply' | 'brand_offer'
}

export interface Campaign {
    id: number | string
    product: string
    brand: string
    category: string
    budget?: string
    status: 'active' | 'closed'
    description?: string
    target?: string
    date: string
}

export interface Product {
    id: number | string
    name: string
    category: string
    price?: number
    image?: string
    description?: string
    points?: string
    shots?: string
    tags?: string[]
    contentGuide?: string
    formatGuide?: string
    accountTag?: string
}
