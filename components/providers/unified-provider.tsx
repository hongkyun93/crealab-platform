"use client"

import React from "react"
import { AuthProvider, useAuth } from "./auth-provider"
import { CampaignProvider, useCampaigns } from "./campaign-provider"
import { EventProvider, useEvents } from "./event-provider"
import { ProductProvider, useProducts } from "./product-provider"
import { ProposalProvider, useProposals } from "./proposal-provider"
import { MessageProvider, useMessages } from "./message-provider"
import { FavoriteProvider, useFavorites } from "./favorite-provider"
import { TeamProvider, useTeam } from "./team-provider"
import { createClient } from "@/lib/supabase/client"

// Unified Provider that combines all domain providers
export function UnifiedProvider({ children }: { children: React.ReactNode }) {
    // Global Event Listener for Runtime Logs
    React.useEffect(() => {
        const handleLog = (e: any) => {
            // This will be caught by RuntimeMonitor
            window.dispatchEvent(new CustomEvent('runtime-log', { detail: e.detail }))
        }
        window.addEventListener('app-log', handleLog)
        return () => window.removeEventListener('app-log', handleLog)
    }, [])

    return (
        <AuthProvider>
            <UnifiedProviderInner>
                {children}
            </UnifiedProviderInner>
        </AuthProvider>
    )
}

// Inner component that has access to auth context
function UnifiedProviderInner({ children }: { children: React.ReactNode }) {
    const { user } = useAuth()

    return (
        <TeamProvider>
            <TeamProviderConsumer>
                {children}
            </TeamProviderConsumer>
        </TeamProvider>
    )
}

// Consumer component that has access to team context
function TeamProviderConsumer({ children }: { children: React.ReactNode }) {
    const { user } = useAuth()
    const { currentTeam, selectedMember, isProxyMode } = useTeam()

    // [MCN Proxy Support] 
    // If in proxy mode, we act as the selected creator.
    // Otherwise, we are the MCN admin.
    const effectiveUserId = isProxyMode ? selectedMember?.user_id : user?.id

    // Fallback to user's default team if currentTeam is not yet selected
    // [MCN Support] MCN/Agency users see ALL events from ALL teams they belong to (Unified View)
    // BUT if in proxy mode, we should see that creator's specific data content (which might be scoped to team?)
    // Actually, normally we want to see the creator's data in the context of the current team.

    // FIX: If 'ALL' is passed as teamId to mutations (like addEvent), it causes invalid UUID error.
    // When in Proxy Mode (isProxyMode=true), we must use a specific team ID (currentTeam.id).
    // Only use 'ALL' when in MCN Manager Mode (isProxyMode=false) for aggregation.
    const activeTeamId = ((user?.role === 'mcn' || user?.role === 'agency') && !isProxyMode)
        ? 'ALL'
        : (currentTeam?.id || user?.teamId)

    // [FIX] Campaign Visibility Logic
    // Brands/MCN: See campaigns belonging to their active team.
    // Creators (Influencers): See ALL public campaigns (Explore mode) regardless of their team affiliation.
    // Proxy Mode: If MCN is proxying a Creator, they should see what the Creator sees (Public Campaigns).
    // Therefore, do NOT pass teamId filter to CampaignProvider for creators OR when in proxy mode.
    const campaignTeamId = (user?.role === 'creator' || isProxyMode)
        ? undefined
        : activeTeamId

    return (
        <CampaignProvider userId={effectiveUserId} userType={user?.role} teamId={campaignTeamId}>
            <EventProvider userId={effectiveUserId} teamId={activeTeamId} isProxyMode={isProxyMode} userType={user?.role}>
                <ProductProvider userId={effectiveUserId} teamId={activeTeamId}>
                    <ProposalProvider userId={effectiveUserId} userType={user?.role}>
                        <MessageProvider userId={effectiveUserId}>
                            <FavoriteProvider userId={effectiveUserId}>
                                {children}
                            </FavoriteProvider>
                        </MessageProvider>
                    </ProposalProvider>
                </ProductProvider>
            </EventProvider>
        </CampaignProvider>
    )
}

// Re-export all hooks for convenience
export { useAuth, useCampaigns, useEvents, useProducts, useProposals, useMessages, useFavorites }

// Legacy compatibility: Export a hook that provides all providers at once
// This helps with gradual migration from old usePlatform hook
export function useUnifiedProvider() {
    const auth = useAuth()
    const campaigns = useCampaigns()
    const events = useEvents()
    const products = useProducts()
    const proposals = useProposals()
    const messages = useMessages()
    const favorites = useFavorites()
    const team = useTeam()
    const supabase = auth.supabase

    return React.useMemo(() => ({
        // Team (New)
        teams: team.teams,
        currentTeam: team.currentTeam,
        createTeam: team.createTeam,
        switchTeam: team.switchTeam,

        // Auth
        user: auth.user,
        isAuthChecked: auth.isAuthChecked,
        isInitialized: auth.isInitialized,
        login: auth.login,
        logout: auth.logout,
        updateUser: auth.updateUser,
        switchRole: auth.switchRole,

        // Campaigns
        campaigns: campaigns.campaigns,
        addCampaign: campaigns.addCampaign,
        updateCampaignStatus: campaigns.updateCampaign,
        deleteCampaign: campaigns.deleteCampaign,

        // Events
        events: events.events,
        allEvents: events.allEvents,
        addEvent: events.addEvent,
        updateEvent: events.updateEvent,
        deleteEvent: events.deleteEvent,
        fetchAllEvents: events.fetchAllEvents,

        // Products
        products: products.products,
        addProduct: products.addProduct,
        updateProduct: products.updateProduct,
        deleteProduct: products.deleteProduct,

        // Proposals
        campaignProposals: proposals.campaignProposals,
        brandProposals: proposals.brandProposals,
        momentProposals: proposals.momentProposals,
        addMomentProposal: proposals.addMomentProposal,
        addProposal: proposals.addProposal,
        createBrandProposal: proposals.createBrandProposal,
        createMomentProposal: proposals.createMomentProposal,
        updateProposal: proposals.updateProposal,
        updateBrandProposal: proposals.updateBrandProposal,
        updateMomentProposal: proposals.updateMomentProposal,
        deleteBrandProposal: proposals.deleteBrandProposal,
        deleteMomentProposal: proposals.deleteMomentProposal,
        refreshProposals: proposals.refreshProposals,

        // Messages
        messages: messages.messages,
        notifications: messages.notifications,
        submissionFeedback: messages.submissionFeedback,
        sendMessage: messages.sendMessage,
        sendNotification: messages.sendNotification,
        sendSubmissionFeedback: messages.sendSubmissionFeedback,
        fetchSubmissionFeedback: messages.fetchSubmissionFeedback,
        markAsRead: messages.markAsRead,

        // Favorites
        favorites: favorites.favorites,
        toggleFavorite: favorites.toggleFavorite,
        isFavorited: favorites.isFavorited,

        supabase,

        // Loading states
        isAuthLoading: !auth.isAuthChecked,

        isCoreLoading: [
            campaigns.isLoading,
            events.isLoading,
            proposals.isLoading,
        ].some(Boolean),

        isLoading: [
            !auth.isAuthChecked,
            campaigns.isLoading,
            events.isLoading,
            products.isLoading,
            proposals.isLoading,
            messages.isLoading,
            favorites.isLoading
        ].some(Boolean),

        loadingStates: [
            { name: '인증 시스템', isLoading: !auth.isAuthChecked },
            { name: '캠페인 데이터', isLoading: campaigns.isLoading },
            { name: '이벤트 데이터', isLoading: events.isLoading },
            { name: '제품 데이터', isLoading: products.isLoading },
            { name: '제안서 데이터', isLoading: proposals.isLoading },
            { name: '메시지 시스템', isLoading: messages.isLoading },
            { name: '즐겨찾기', isLoading: favorites.isLoading },
        ],

        refreshData: async () => {
            await Promise.all([
                campaigns.refreshCampaigns(),
                events.refreshEvents(),
                products.refreshProducts(),
                proposals.refreshProposals(),
                messages.refreshMessages(),
                messages.refreshNotifications(),
                favorites.refreshFavorites()
            ])
        },
    }), [
        auth.user, auth.isAuthChecked, auth.isInitialized,
        campaigns.campaigns, campaigns.isLoading,
        events.events, events.isLoading,
        products.products, products.isLoading,
        proposals.campaignProposals, proposals.brandProposals, proposals.momentProposals, proposals.isLoading,
        messages.messages, messages.notifications, messages.isLoading,
        favorites.favorites, favorites.isLoading,
        team.teams, team.currentTeam
    ])
}
