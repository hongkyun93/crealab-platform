"use client"

import React from "react"
import { AuthProvider } from "./auth-provider"
import { CampaignProvider } from "./campaign-provider"
import { EventProvider } from "./event-provider"
import { ProductProvider } from "./product-provider"
import { ProposalProvider } from "./proposal-provider"
import { MessageProvider } from "./message-provider"
import { FavoriteProvider } from "./favorite-provider"
import { useAuth } from "./auth-provider"

// Unified Provider that combines all domain providers
export function UnifiedProvider({ children }: { children: React.ReactNode }) {
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
        <CampaignProvider userId={user?.id}>
            <EventProvider userId={user?.id}>
                <ProductProvider userId={user?.id}>
                    <ProposalProvider userId={user?.id}>
                        <MessageProvider userId={user?.id}>
                            <FavoriteProvider userId={user?.id}>
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
export { useAuth } from "./auth-provider"
export { useCampaigns } from "./campaign-provider"
export { useEvents } from "./event-provider"
export { useProducts } from "./product-provider"
export { useProposals } from "./proposal-provider"
export { useMessages } from "./message-provider"
export { useFavorites } from "./favorite-provider"

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

    return {
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
        addEvent: events.addEvent,
        updateEvent: events.updateEvent,
        deleteEvent: events.deleteEvent,

        // Products
        products: products.products,
        addProduct: products.addProduct,
        updateProduct: products.updateProduct,
        deleteProduct: products.deleteProduct,

        // Proposals
        proposals: proposals.proposals,
        brandProposals: proposals.brandProposals,
        addProposal: proposals.addProposal,
        updateProposal: proposals.updateProposal,
        updateBrandProposal: proposals.updateBrandProposal,
        deleteBrandProposal: proposals.deleteBrandProposal,

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

        // Loading states
        isLoading: campaigns.isLoading || events.isLoading || products.isLoading ||
            proposals.isLoading || messages.isLoading || favorites.isLoading,

        // Refresh functions
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

        resetData: () => {
            // For now, this is a no-op as each provider manages its own state
            // In the future, we might want to add reset methods to each provider
            console.log('[UnifiedProvider] resetData called')
        }
    }
}
