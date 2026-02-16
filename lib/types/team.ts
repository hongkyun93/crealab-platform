export interface Team {
    id: string
    name: string
    slug: string
    logo_url?: string
    created_at: string
    my_role?: TeamRole
}

export interface TeamMember {
    id: string
    team_id: string
    user_id: string
    role: TeamRole
    joined_at: string
    // Joined data from profiles (using actual DB column names)
    profile?: {
        display_name?: string
        avatar_url?: string
        email?: string
        instagram_handle?: string  // DB: instagram_handle (maps to handle in UI)
        followers_count?: number  // DB: followers_count (maps to followers in UI)
        tags?: string[]
        phone?: string
        bank_name?: string
        account_number?: string
        account_holder?: string
        price_video?: number
        price_feed?: number
        secondary_rights?: boolean
        usage_rights_month?: number
        usage_rights_price?: number
        auto_dm_month?: number
        auto_dm_price?: number
    }
}

export interface TeamInvitation {
    id: string
    team_id: string
    email: string
    role: TeamRole
    invited_by: string
    status: 'pending' | 'accepted' | 'rejected'
    created_at: string
    expires_at: string
    invite_code?: string
}

export type TeamRole = 'owner' | 'manager' | 'employee' | 'creator' | 'member'
