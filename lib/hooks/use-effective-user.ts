// Helper hook to get effective user ID for data fetching
// Use this in components to fetch data for the correct user (self or proxy)

import { useTeam } from '@/components/providers/team-provider'
import { useUnifiedProvider } from '@/components/providers/unified-provider'
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
            bio: (selectedMember.profile as any)?.description,
            primaryRegion: (selectedMember.profile as any)?.primary_region,
            address: (selectedMember.profile as any)?.shipping_address, // Legacy alias
            shippingName: (selectedMember.profile as any)?.shipping_name,
            shippingPhone: (selectedMember.profile as any)?.shipping_phone,
            shippingAddress: (selectedMember.profile as any)?.shipping_address,
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
            priceStory: (selectedMember.profile as any)?.price_story,
            secondaryRights: selectedMember.profile?.secondary_rights,
            usageRightsMonth: selectedMember.profile?.usage_rights_month,
            usageRightsPrice: selectedMember.profile?.usage_rights_price,
            autoDmMonth: selectedMember.profile?.auto_dm_month,
            autoDmPrice: selectedMember.profile?.auto_dm_price,
            // Creator Legal/Tax fields
            legalName: (selectedMember.profile as any)?.legal_name,
            birthDate: (selectedMember.profile as any)?.birth_date,
            legalAddress: (selectedMember.profile as any)?.legal_address,
            isBusinessRegistered: (selectedMember.profile as any)?.is_business_registered,
            creatorBusinessNumber: (selectedMember.profile as any)?.creator_business_number,
        }
    }, [selectedMember])

    // If in proxy mode AND a member is actually found, use it. Otherwise safely fallback to current user.
    // [FIX] Prevents `undefined` user ID when `selectedMemberId` is set but `teamMembers` hasn't loaded.
    const activelyProxying = isProxyMode && !!selectedMember
    const effectiveUserId = activelyProxying ? selectedMember.user_id : user?.id
    const effectiveUser = activelyProxying ? proxyUser : user

    return {
        effectiveUserId,
        effectiveUser,
        isProxyMode: activelyProxying, // Override to only report proxy mode when truly proxying
        actualUser: user, // Original logged-in user (MCN)
    }
}
