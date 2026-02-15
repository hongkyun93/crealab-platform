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
    // Joined data from profiles
    profile?: {
        display_name?: string
        avatar_url?: string
        email?: string
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
}

export type TeamRole = 'owner' | 'manager' | 'employee' | 'creator' | 'member'
