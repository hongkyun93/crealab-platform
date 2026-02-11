// Favorite Types
export type FavoriteTargetType = 'product' | 'campaign' | 'profile' | 'event'

export interface Favorite {
    id: string
    user_id: string
    target_id: string
    target_type: FavoriteTargetType
    created_at: string
}
