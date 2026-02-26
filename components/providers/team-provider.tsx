"use client"

import { Team, TeamInvitation, TeamMember, TeamRole } from "@/lib/types/team"
import { useRouter } from "next/navigation"
import { createContext, useContext, useEffect, useMemo, useState } from "react"
import { useAuth } from "./auth-provider"

interface TeamContextType {
    teams: Team[]
    currentTeam: Team | null
    isLoading: boolean
    switchTeam: (teamId: string) => void
    createTeam: (name: string, slug: string) => Promise<Team | null>
    // Member management
    fetchTeamMembers: (teamId: string) => Promise<TeamMember[]>
    updateMemberRole: (memberId: string, role: TeamRole) => Promise<boolean>
    removeMember: (memberId: string) => Promise<boolean>
    // Invitation management
    inviteMember: (teamId: string, email: string, role: TeamRole) => Promise<boolean>
    fetchInvitations: (teamId: string) => Promise<TeamInvitation[]>
    cancelInvitation: (invitationId: string) => Promise<boolean>
    // [MCN Proxy Support]
    teamMembers: TeamMember[]
    selectedMember: TeamMember | null
    switchToMember: (memberId: string | null) => void
    isProxyMode: boolean
}

const TeamContext = createContext<TeamContextType | undefined>(undefined)

export function TeamProvider({ children }: { children: React.ReactNode }) {
    const [teams, setTeams] = useState<Team[]>([])
    const [currentTeam, setCurrentTeam] = useState<Team | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const { user, supabase } = useAuth()
    const router = useRouter()

    // [MCN Proxy Support] State for proxy mode
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
    const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null)

    // 1. Fetch Teams on Mount or User Change
    useEffect(() => {
        const controller = new AbortController()
        const signal = controller.signal

        if (!user) {
            setTeams([])
            setCurrentTeam(null)
            setIsLoading(false)
            return
        }

        const fetchTeams = async () => {
            setIsLoading(true)
            try {
                // Fetch teams where user is a member, including the role
                const { data, error } = await supabase
                    .from('team_members')
                    .select(`
                        role,
                        team:teams (*)
                    `)
                    .eq('user_id', user.id)
                    .abortSignal(signal)

                if (error) {
                    const isEmptyError = Object.keys(error).length === 0
                    const isAbortError = error.message?.includes('AbortError') ||
                        error.message?.includes('aborted') ||
                        error.message === 'Failed to fetch' ||
                        error.message === 'Load failed'

                    if (isEmptyError || isAbortError) {
                        return
                    }

                    console.error('Error fetching teams:', error)
                    return
                }

                if (data) {
                    // Map the response to Team[] with my_role
                    const teamsWithRole = data.map((item: any) => ({
                        ...item.team,
                        my_role: item.role
                    }))

                    setTeams(teamsWithRole)

                    // Auto-select first team logic
                    if (teamsWithRole.length > 0 && !currentTeam) {
                        const savedId = localStorage.getItem('creadypick_team_id')
                        const savedTeam = teamsWithRole.find((t: any) => t.id === savedId)

                        if (savedTeam) {
                            setCurrentTeam(savedTeam)
                        } else {
                            setCurrentTeam(teamsWithRole[0])
                        }
                    }
                }
            } catch (err) {
                if (err instanceof Error && err.name !== 'AbortError') {
                    console.error('Failed to fetch teams', err)
                }
            } finally {
                if (!signal.aborted) {
                    setIsLoading(false)
                }
            }
        }

        fetchTeams()

        return () => {
            controller.abort()
        }
    }, [user])

    // [MCN Proxy Support] Fetch members when team changes (for Switcher)
    useEffect(() => {
        if (!currentTeam || user?.role !== 'mcn') {
            setTeamMembers([])
            return
        }

        const loadMembers = async () => {
            const members = await fetchTeamMembers(currentTeam.id)
            // Filter out self (MCN admin) from the list if desired, or keep all
            // Usually we want to switch to CREATORS.
            // The MCN admin is usually an 'owner'. 
            // We might want to filter only 'creator' role? 
            // team_members.role CHECK: ('owner', 'admin', 'member') — 'creator' does NOT exist in DB
            // Show all non-owner members (MCN admin is 'owner', soloists are 'member')
            setTeamMembers(members.filter(m => m.user_id !== user.id && m.role !== 'owner'))
        }

        loadMembers()
    }, [currentTeam, user])

    // 2. Switch Team Logic
    const switchTeam = (teamId: string) => {
        const target = teams.find(t => t.id === teamId)
        if (target) {
            setCurrentTeam(target)
            localStorage.setItem('creadypick_team_id', teamId)
            // Reset selected member when switching teams
            setSelectedMemberId(null)
        }
    }

    // [MCN Proxy Support] Switch Member Logic
    const switchToMember = (memberId: string | null) => {
        setSelectedMemberId(memberId)
    }

    // 3. Create Team Logic
    const createTeam = async (name: string, slug: string): Promise<Team | null> => {
        if (!user) return null

        try {
            // 1. Create Team
            const { data: newTeam, error: teamError } = await supabase
                .from('teams')
                .insert({ name, slug, logo_url: user.avatar })
                .select()
                .single()

            if (teamError || !newTeam) throw teamError

            return newTeam
        } catch (e) {
            console.error(e)
            return null
        }
    }

    // 4. Fetch Team Members
    const fetchTeamMembers = async (teamId: string): Promise<TeamMember[]> => {
        try {
            const { data, error } = await supabase
                .from('team_members')
                .select(`
                    *,
                    profile:profiles(
                        display_name,
                        avatar_url,
                        email,
                        description,
                        instagram_handle,
                        followers_count,
                        tags,
                        phone,
                        shipping_name,
                        shipping_phone,
                        shipping_address,
                        primary_region,
                        bank_name,
                        account_number,
                        account_holder,
                        price_video,
                        price_feed,
                        price_story,
                        secondary_rights,
                        usage_rights_month,
                        usage_rights_price,
                        auto_dm_month,
                        auto_dm_price,
                        legal_name,
                        birth_date,
                        legal_address,
                        is_business_registered,
                        creator_business_number
                    )
                `)
                .eq('team_id', teamId)

            if (error) {
                console.error('[DEBUG] Supabase error details:', JSON.stringify(error, null, 2))
                throw error
            }
            return data || []
        } catch (e) {
            console.error('Failed to fetch team members:', e)
            console.error('[DEBUG] Full error object:', JSON.stringify(e, null, 2))
            return []
        }
    }

    // 5. Update Member Role
    const updateMemberRole = async (memberId: string, role: TeamRole): Promise<boolean> => {
        try {
            console.log('[DEBUG] Updating role - RAW VALUES:', JSON.stringify({ memberId, role, currentTeamId: currentTeam?.id }))

            const { data, error } = await supabase
                .from('team_members')
                .update({ role })
                .eq('id', memberId)  // UI passes member.id which is the team_members.id
                .select()

            console.log('[DEBUG] Update result:', JSON.stringify({ data, error, rowsAffected: data?.length }))

            if (error) throw error

            if (!data || data.length === 0) {
                console.error('[DEBUG] Update affected 0 rows - no matching member found')
                return false
            }

            return true
        } catch (e) {
            console.error('Failed to update member role:', e)
            return false
        }
    }

    // 6. Remove Member
    const removeMember = async (memberId: string): Promise<boolean> => {
        try {
            const { error, count } = await supabase
                .from('team_members')
                .delete({ count: 'exact' })
                .eq('id', memberId)

            if (error) throw error

            // Check if any row was actually deleted
            if (count === 0) {
                console.warn('No member deleted (permission denied or not found)')
                return false
            }

            return true
        } catch (e) {
            console.error('Failed to remove member:', e)
            return false
        }
    }

    // 7. Invite Member
    const inviteMember = async (teamId: string, email: string, role: TeamRole): Promise<boolean> => {
        try {
            // Use RPC for secure invitation (bypasses RLS recursion issues)
            const { data, error } = await supabase.rpc('invite_team_member', {
                target_team_id: teamId,
                target_email: email,
                target_role: role
            })

            if (error) throw error

            const result = data as any
            if (!result.success) {
                console.error('Invite failed:', result.message)
                // Optional: bubble up message? For now just return false/true as per interface
                // Ideally interface should return {success: boolean, message?: string}
                // But to minimize changes, we just log and return false.
                return false
            }

            return true
        } catch (e) {
            console.error('Failed to invite member:', e)
            return false
        }
    }

    // 8. Fetch Invitations
    const fetchInvitations = async (teamId: string): Promise<TeamInvitation[]> => {
        try {
            const { data, error } = await supabase
                .from('team_invitations')
                .select('*')
                .eq('team_id', teamId)
                .eq('status', 'pending')

            if (error) throw error
            return data || []
        } catch (e) {
            console.error('Failed to fetch invitations:', e)
            return []
        }
    }

    // 9. Cancel Invitation
    const cancelInvitation = async (invitationId: string): Promise<boolean> => {
        try {
            const { error } = await supabase
                .from('team_invitations')
                .delete()
                .eq('id', invitationId)

            if (error) throw error
            return true
        } catch (e) {
            console.error('Failed to cancel invitation:', e)
            return false
        }
    }

    const selectedMember = teamMembers.find(m => m.user_id === selectedMemberId) || null
    const isProxyMode = !!selectedMemberId

    const contextValue = useMemo(() => ({
        teams,
        currentTeam,
        isLoading,
        switchTeam,
        createTeam,
        fetchTeamMembers,
        updateMemberRole,
        removeMember,
        inviteMember,
        fetchInvitations,
        cancelInvitation,
        // [MCN Proxy Support]
        teamMembers,        // Exposed for Switcher
        selectedMember,     // Exposed for UnifiedProvider
        switchToMember,     // Exposed for Switcher
        isProxyMode         // Exposed for UI
    }), [teams, currentTeam, isLoading, teamMembers, selectedMember, isProxyMode])

    return (
        <TeamContext.Provider value={contextValue}>
            {children}
        </TeamContext.Provider>
    )
}

export function useTeam() {
    const context = useContext(TeamContext)
    if (context === undefined) {
        throw new Error("useTeam must be used within a TeamProvider")
    }
    return context
}
