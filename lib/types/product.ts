// Product Types
export interface Product {
    id: string
    brandId: string
    brandName?: string
    brandAvatar?: string
    brandHandle?: string
    brandBio?: string
    name: string
    price: number
    image: string // image_url
    link: string // website_url
    points: string // selling_points
    shots: string // required_shots
    category: string
    description?: string
    contentGuide?: string
    formatGuide?: string
    tags?: string[]
    accountTag?: string
    createdAt?: string
    isMock?: boolean
}

export interface ProductFormData {
    name: string
    price: number | string
    image: string
    link: string
    points: string
    shots: string
    category: string
    description?: string
    contentGuide?: string
    formatGuide?: string
    tags?: string[]
    accountTag?: string
}
