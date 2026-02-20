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
            role: 'creator' as const,
            bio: undefined as string | undefined,
            primaryRegion: undefined as string | undefined,
            address: undefined as string | undefined,
            // Map DB fields to User interface fields
            handle: selectedMember.profile?.instagram_handle,
            followers: selectedMember.profile?.followers_count,
            tags: selectedMember.profile?.tags,
            phone: selectedMember.profile?.phone,
            bankName: selectedMember.profile?.bank_name,
            accountNumber: selectedMember.profile?.account_number,
            accountHolder: selectedMember.profile?.account_holder,
            priceVideo: selectedMember.profile?.price_video,
            priceFeed: selectedMember.profile?.price_feed,
            priceStory: undefined as number | undefined,
            secondaryRights: selectedMember.profile?.secondary_rights,
            usageRightsMonth: selectedMember.profile?.usage_rights_month,
            usageRightsPrice: selectedMember.profile?.usage_rights_price,
            autoDmMonth: selectedMember.profile?.auto_dm_month,
            autoDmPrice: selectedMember.profile?.auto_dm_price,
            // Creator Legal/Tax fields (cast: profile type doesn't include new cols yet)
            legalName: (selectedMember.profile as any)?.legal_name,
            birthDate: (selectedMember.profile as any)?.birth_date,
            legalAddress: (selectedMember.profile as any)?.legal_address,
            isBusinessRegistered: (selectedMember.profile as any)?.is_business_registered,
            creatorBusinessNumber: (selectedMember.profile as any)?.creator_business_number,
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
