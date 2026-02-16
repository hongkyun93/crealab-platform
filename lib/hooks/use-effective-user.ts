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
            type: 'creator',
            role: 'creator',
            // Map DB fields to User interface fields
            // bio: description column doesn't exist in DB yet
            handle: selectedMember.profile?.instagram_handle,  // instagram_handle → handle
            followers: selectedMember.profile?.followers_count,  // followers_count → followers
            tags: selectedMember.profile?.tags,
            phone: selectedMember.profile?.phone,
            bankName: selectedMember.profile?.bank_name,  // bank_name → bankName
            accountNumber: selectedMember.profile?.account_number,  // account_number → accountNumber
            accountHolder: selectedMember.profile?.account_holder,  // account_holder → accountHolder
            priceVideo: selectedMember.profile?.price_video,  // price_video → priceVideo
            priceFeed: selectedMember.profile?.price_feed,  // price_feed → priceFeed
            secondaryRights: selectedMember.profile?.secondary_rights,  // secondary_rights → secondaryRights
            usageRightsMonth: selectedMember.profile?.usage_rights_month,  // usage_rights_month → usageRightsMonth
            usageRightsPrice: selectedMember.profile?.usage_rights_price,  // usage_rights_price → usageRightsPrice
            autoDmMonth: selectedMember.profile?.auto_dm_month,  // auto_dm_month → autoDmMonth
            autoDmPrice: selectedMember.profile?.auto_dm_price  // auto_dm_price → autoDmPrice
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
