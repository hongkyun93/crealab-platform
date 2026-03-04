"use client"

import React from "react"
import { AuthProvider, useAuth } from "./auth-provider"
import { CampaignProvider, useCampaigns } from "./campaign-provider"
import { EventProvider, useEvents } from "./moment-provider"
import { FavoriteProvider, useFavorites } from "./favorite-provider"
import { MessageProvider, useMessages } from "./message-provider"
import { ProductProvider, useProducts } from "./product-provider"
import { ProposalProvider, useProposals } from "./proposal-provider"
import { SocialChannelsProvider, useSocialChannels } from "./social-channels-provider"
import { TeamProvider, useTeam } from "./team-provider"

// Context for triggering public events load (lazy)
const PublicMomentsContext = React.createContext<() => void>(() => { })
export const useEnablePublicMoments = () => React.useContext(PublicMomentsContext)

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

    // Public events lazy loading: 처음에는 비활성화, discover 탭 진입 시 enablePublicMoments() 호출
    const [publicEventsEnabled, setPublicEventsEnabled] = React.useState(false)
    const enablePublicMoments = React.useCallback(() => {
        setPublicEventsEnabled(true)
    }, [])

    // [PERFORMANCE OPTIMIZATION] Use useMemo to prevent cascade re-renders
    // This enables parallel provider loading instead of waterfall
    const effectiveUserId = React.useMemo(() =>
        isProxyMode ? selectedMember?.user_id : user?.id,
        [isProxyMode, selectedMember?.user_id, user?.id]  // Primitive dependencies
    )

    const activeTeamId = React.useMemo(() =>
        ((user?.role === 'mcn' || user?.role === 'agency') && !isProxyMode)
            ? 'ALL'
            : (currentTeam?.id || user?.teamId),
        [user?.role, user?.teamId, isProxyMode, currentTeam?.id]  // Primitive dependencies
    )

    const campaignTeamId = React.useMemo(() =>
        (user?.role === 'creator' || isProxyMode) ? undefined : activeTeamId,
        [user?.role, isProxyMode, activeTeamId]
    )

    return (
        <CampaignProvider userId={effectiveUserId} userType={user?.role} teamId={campaignTeamId}>
            <EventProvider
                userId={effectiveUserId}
                teamId={activeTeamId}
                isProxyMode={isProxyMode}
                userType={user?.role}
                publicEventsEnabled={publicEventsEnabled}
            >
                <ProductProvider userId={effectiveUserId} teamId={activeTeamId}>
                    <ProposalProvider userId={effectiveUserId} userType={user?.role}>
                        <MessageProvider userId={effectiveUserId}>
                            <FavoriteProvider userId={effectiveUserId}>
                                <SocialChannelsProvider>
                                    <PublicMomentsContext.Provider value={enablePublicMoments}>
                                        {children}
                                    </PublicMomentsContext.Provider>
                                </SocialChannelsProvider>
                            </FavoriteProvider>
                        </MessageProvider>
                    </ProposalProvider>
                </ProductProvider>
            </EventProvider>
        </CampaignProvider>
    )
}

// Re-export all hooks for convenience
export { useAuth, useCampaigns, useEvents, useProducts, useProposals, useMessages, useFavorites, useSocialChannels }

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
    const enablePublicMoments = useEnablePublicMoments()  // Hook을 useMemo 밖에서 호출 (React rules)

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
        moments: events.moments,
        allMoments: events.allMoments,
        addMoment: events.addMoment,
        updateMoment: events.updateMoment,
        deleteMoment: events.deleteMoment,
        fetchAllMoments: events.fetchAllMoments,
        refreshMoments: events.refreshMoments,
        enablePublicMoments,  // Discover 탭 진입 시 호출 → public events 쿼리 활성화


        // Products
        products: products.products,
        addProduct: products.addProduct,
        updateProduct: products.updateProduct,
        deleteProduct: products.deleteProduct,

        // Proposals
        campaignProposals: proposals.campaignProposals,
        productApplications: proposals.productApplications,
        contestApplications: proposals.contestApplications,
        addMomentProposal: proposals.addMomentProposal,
        addProposal: proposals.addProposal,
        createProductApplication: proposals.createProductApplication,
        createMomentProposal: proposals.createMomentProposal,
        updateProposal: proposals.updateProposal,
        updateProductApplication: proposals.updateProductApplication,
        updateMomentProposal: proposals.updateMomentProposal,
        updateContestApplication: proposals.updateContestApplication,
        deleteProductApplication: proposals.deleteProductApplication,
        deleteMomentProposal: proposals.deleteMomentProposal,
        refreshProposals: proposals.refreshProposals,

        // Messages
        messages: messages.messages,
        notifications: messages.notifications,
        submissionFeedback: messages.submissionFeedback,
        adminId: messages.adminId, // NEW
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

        // isCoreLoading: auth + critical data only (campaigns + proposals)
        // events/products/messages/favorites load in background without blocking UI
        isCoreLoading: [
            !auth.isAuthChecked,
            campaigns.isLoading,
            proposals.isLoading,
        ].some(Boolean),

        // isLoading: same as isCoreLoading — do NOT block on messages/products/favorites
        isLoading: [
            !auth.isAuthChecked,
            campaigns.isLoading,
            proposals.isLoading,
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
                events.refreshMoments(),
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
        events.moments, events.isLoading,
        products.products, products.isLoading,
        proposals.campaignProposals, proposals.productApplications, proposals.momentProposals, proposals.contestApplications, proposals.isLoading,
        messages.messages, messages.notifications, messages.isLoading,
        favorites.favorites, favorites.isLoading,
        team.teams, team.currentTeam
    ])
}
