// Helper hook to get effective user ID for data fetching
// Use this in components to fetch data for the correct user (self or proxy)

import { useUnifiedProvider } from '@/components/providers/unified-provider'
import { useTeam } from '@/components/providers/team-provider'
import { useMemo } from 'react'

export function useEffectiveUser() {
    const { user } = useUnifiedProvider()
    const { selectedMember, isProxyMode } = useTeam()

    // Map TeamMember to User-like object if selected
    const proxyUser = useMemo(() => {
        if (!selectedMember) return null
        return {
            id: selectedMember.user_id,
            email: selectedMember.profile?.email,
            name: selectedMember.profile?.display_name,
            avatar: selectedMember.profile?.avatar_url,
            type: 'creator', // Proxy targets are usually creators
            role: 'creator'
        }
    }, [selectedMember])

    // If in proxy mode, use selected member, otherwise use current user
    const effectiveUserId = isProxyMode ? selectedMember?.user_id : user?.id
    const effectiveUser = isProxyMode ? proxyUser : user

    return {
        effectiveUserId,
        effectiveUser,
        isProxyMode,
        actualUser: user, // Original logged-in user (MCN)
    }
}
