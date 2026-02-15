"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'
import { User } from '@/lib/types/user'
import { usePlatform } from '@/components/providers/legacy-platform-hook'

interface TeamMember {
    id: string
    user: User
    role: 'owner' | 'admin' | 'member'
}

interface TeamContextType {
    selectedMember: User | null
    teamMembers: TeamMember[]
    switchToMember: (userId: string | null) => void
    isProxyMode: boolean
    isLoading: boolean
    effectiveUser: User | null // Returns selectedMember if in proxy mode, otherwise null (use actual user)
}

const TeamContext = createContext<TeamContextType | undefined>(undefined)

export function TeamProvider({ children }: { children: React.ReactNode }) {
    const { user, supabase } = usePlatform()
    const [selectedMember, setSelectedMember] = useState<User | null>(null)
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
    const [isLoading, setIsLoading] = useState(false)

    // Fetch team members when user is MCN
    useEffect(() => {
        if (!user || user.type !== 'mcn' || !user.teamId) {
            setTeamMembers([])
            setSelectedMember(null)
            return
        }

        const fetchTeamMembers = async () => {
            setIsLoading(true)
            try {
                const { data: members, error } = await supabase
                    .from('team_members')
                    .select(`
            id,
            role,
            user_id,
            profiles (
              id,
              display_name,
              email,
              role,
              avatar_url,
              phone,
              instagram_handle
            )
          `)
                    .eq('team_id', user.teamId)
                    .neq('user_id', user.id) // Exclude self

                if (error) {
                    console.error('[TeamContext] Error fetching members:', JSON.stringify(error, null, 2))
                    return
                }

                if (members) {
                    const formattedMembers: TeamMember[] = members.map((m: any) => ({
                        id: m.id,
                        role: m.role,
                        user: {
                            id: m.profiles.id,
                            name: m.profiles.display_name || 'Unknown',
                            email: m.profiles.email,
                            type: m.profiles.role || m.profiles.user_type || 'creator',
                            role: m.profiles.role,
                            avatar: m.profiles.avatar_url,
                            phone: m.profiles.phone,
                            handle: m.profiles.instagram_handle,
                        }
                    }))

                    setTeamMembers(formattedMembers)
                    console.log('[TeamContext] Loaded team members:', formattedMembers.length)
                }
            } catch (err) {
                console.error('[TeamContext] Exception:', err)
            } finally {
                setIsLoading(false)
            }
        }

        fetchTeamMembers()
    }, [user, supabase])

    const switchToMember = (userId: string | null) => {
        if (!userId) {
            setSelectedMember(null)
            console.log('[TeamContext] Switched to self (MCN account)')
            return
        }

        const member = teamMembers.find(m => m.user.id === userId)
        if (member) {
            setSelectedMember(member.user)
            console.log('[TeamContext] Switched to member:', member.user.name)
        }
    }

    const isProxyMode = selectedMember !== null
    const effectiveUser = isProxyMode ? selectedMember : null

    return (
        <TeamContext.Provider
            value={{
                selectedMember,
                teamMembers,
                switchToMember,
                isProxyMode,
                isLoading,
                effectiveUser,
            }}
        >
            {children}
        </TeamContext.Provider>
    )
}

export function useTeam() {
    const context = useContext(TeamContext)
    if (context === undefined) {
        throw new Error('useTeam must be used within a TeamProvider')
    }
    return context
}
