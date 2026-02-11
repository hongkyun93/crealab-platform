// Central Type Exports
// This file re-exports all types for easy importing

// User & Auth
export type { User, UserType, AuthState } from './user'

// Campaign
export type { Campaign, CampaignFormData } from './campaign'

// Event (Moment)
export type { InfluencerEvent, EventSchedule, EventFormData } from './event'

// Product
export type { Product, ProductFormData } from './product'

// Proposal & Contract
export type {
    Proposal,
    BrandProposal,
    ProposalType,
    DealType,
    ProposalStatus,
    ContractStatus,
    ContentSubmissionStatus
} from './proposal'

// Message & Notification
export type {
    Message,
    Notification,
    SubmissionFeedback
} from './message'

// Favorite
export type {
    Favorite,
    FavoriteTargetType
} from './favorite'
