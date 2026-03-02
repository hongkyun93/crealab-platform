// Legacy Platform Hook - Backward Compatibility Layer
// This file provides a compatibility layer for existing code using usePlatform
// It maps to the new modular providers

import { useUnifiedProvider } from "./unified-provider"

// Re-export the unified hook as usePlatform for backward compatibility
export const usePlatform = useUnifiedProvider

// Re-export types that were previously exported from platform-provider
export type {
    Campaign, Favorite, CreatorMoment, Message,
    Notification, Product, ProductApplication, Proposal, SubmissionFeedback, User
} from "@/lib/types"

// Mock users for development (if needed)
export const MOCK_CREATOR_USER = {
    id: "guest_creator",
    name: "게스트 크리에이터",
    type: "creator" as const,
    avatar: "👤",
    isMock: true
}

export const MOCK_BRAND_USER = {
    id: "guest_brand",
    name: "게스트 브랜드",
    type: "brand" as const,
    avatar: "🏢",
    isMock: true
}
