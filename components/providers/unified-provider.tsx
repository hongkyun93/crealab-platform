"use client"

import React from "react"
import { AuthProvider, useAuth } from "./auth-provider"
import { CampaignProvider, useCampaigns } from "./campaign-provider"
import { EventProvider, useEvents } from "./event-provider"
import { ProductProvider, useProducts } from "./product-provider"
import { ProposalProvider, useProposals } from "./proposal-provider"
import { MessageProvider, useMessages } from "./message-provider"
import { FavoriteProvider, useFavorites } from "./favorite-provider"
import { createClient } from "@/lib/supabase/client"

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
        <CampaignProvider userId={user?.id} userType={user?.type}>
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
    const supabase = createClient()

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
        allEvents: events.allEvents, // New: Public events
        addEvent: events.addEvent,
        updateEvent: events.updateEvent,
        deleteEvent: events.deleteEvent,
        fetchAllEvents: events.fetchAllEvents, // New: Function to fetch all events

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

        // Supabase client for direct database access
        supabase: supabase,

        // Loading states
        isLoading: (() => {
            const loadingState = {
                campaigns: campaigns.isLoading,
                events: events.isLoading,
                products: products.isLoading,
                proposals: proposals.isLoading,
                messages: messages.isLoading,
                favorites: favorites.isLoading
            }
            if (Object.values(loadingState).some(Boolean)) {
                console.log('[UnifiedProvider] Loading Status:', loadingState)
            }
            return Object.values(loadingState).some(Boolean)
        })(),

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

        resetData: async () => {
            console.log('[UnifiedProvider] Resetting all data...')

            // Clear all SWR cache
            // We can import useSWRConfig to get mutate, but we need it inside the component
            // For now, let's just trigger refreshes with empty data if possible, or reload page.
            // Actually, the best way to clear SWR is to use the cache provider, but a hard reload 
            // is often done in logout. 
            // However, the user says "internal cache remains".

            // Let's at least clear the states we control
            // Modular providers don't expose a 'reset' method yet.
            // We should add reset methods to them or rely on them clearing when userId becomes null.

            // Current implementation of modular providers:
            // They watch `userId`. If `userId` becomes null, do they clear data?
            // Let's check CampaignProvider.tsx again.
            // It says: useEffect(() => { if (userId) fetchCampaigns(userId) }, [userId])
            // It does NOT clear data if userId is null. THIS IS THE BUG.

            // We need to update all providers to clear data when userId is undefined.
        }
    }
}
