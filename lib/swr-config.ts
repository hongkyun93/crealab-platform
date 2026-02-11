import { SWRConfiguration } from 'swr'

/**
 * Global SWR Configuration
 * 
 * Optimizes data fetching with:
 * - Automatic caching and deduplication
 * - Background revalidation
 * - Focus/reconnect revalidation
 * - Error retry with exponential backoff
 */
export const swrConfig: SWRConfiguration = {
    // Revalidation settings
    revalidateOnFocus: true,           // Refresh when user returns to tab
    revalidateOnReconnect: true,       // Refresh when network reconnects
    revalidateIfStale: true,           // Refresh if data is stale
    dedupingInterval: 2000,            // Dedupe requests within 2s

    // Cache settings
    focusThrottleInterval: 5000,       // Throttle focus revalidation to 5s

    // Error handling
    errorRetryInterval: 5000,          // Retry failed requests after 5s
    errorRetryCount: 3,                // Retry up to 3 times
    shouldRetryOnError: true,          // Enable automatic retry

    // Performance
    loadingTimeout: 3000,              // Timeout for slow requests

    // Suspense (disabled for now, can enable later)
    suspense: false,

    // Keep previous data while revalidating
    keepPreviousData: true,
}

/**
 * SWR Keys for different data types
 * Centralized key management prevents typos and ensures consistency
 */
export const SWR_KEYS = {
    // Events
    EVENTS_ALL: 'events-all',
    EVENTS_PUBLIC: 'events-public',
    EVENTS_USER: (userId: string) => `events-user-${userId}`,

    // Products
    PRODUCTS_ALL: 'products-all',
    PRODUCTS_USER: (userId: string) => `products-user-${userId}`,

    // Proposals
    PROPOSALS_BRAND: (brandId: string) => `proposals-brand-${brandId}`,
    PROPOSALS_INFLUENCER: (influencerId: string) => `proposals-influencer-${influencerId}`,

    // Campaigns
    CAMPAIGNS_ALL: 'campaigns-all',
    CAMPAIGNS_USER: (userId: string) => `campaigns-user-${userId}`,

    // Messages
    MESSAGES_USER: (userId: string) => `messages-user-${userId}`,

    // Notifications
    NOTIFICATIONS_USER: (userId: string) => `notifications-user-${userId}`,
} as const
