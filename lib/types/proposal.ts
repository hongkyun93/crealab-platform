// Proposal and Contract Types
export type ProposalType = 'brand_invite' | 'brand_offer' | 'creator_apply'
export type DealType = 'ad' | 'gonggu'
export type ProposalStatus = 'applied' | 'accepted' | 'rejected' | 'negotiating' | 'pending' | 'hold' | 'offered'
export type ContractStatus = 'draft' | 'sent' | 'signed' | 'negotiating' | 'rejected'
export type ContentSubmissionStatus = 'pending' | 'submitted' | 'approved' | 'rejected'

export interface Proposal {
    id: number | string
    type: ProposalType
    dealType: DealType

    // Brand Invite Specific
    eventId?: number | string
    momentId?: string // Alias for eventId in new schema
    productId?: string
    requestDetails?: string

    // Creator Apply Specific
    campaignId?: string
    campaignName?: string
    productName?: string
    influencerId?: string
    influencerName?: string
    influencerAvatar?: string
    brandId?: string
    brandName?: string
    brandAvatar?: string

    cost?: number
    commission?: number
    message?: string

    // Status
    status: ProposalStatus

    // Negotiation
    negotiationBase?: number
    negotiationIncentive?: string
    priceOffer?: number // camelCase alias for MomentProposal compatibility

    fromId?: string
    toId?: string
    date: string
    created_at?: string
    completed_at?: string

    // Application fields
    motivation?: string
    content_plan?: string
    contentPlan?: string // camelCase alias
    portfolioLinks?: string[]
    instagramHandle?: string
    insightScreenshot?: string

    // Contract
    contract_content?: string
    contract_status?: ContractStatus
    brand_signature?: string
    influencer_signature?: string
    brand_signed_at?: string
    influencer_signed_at?: string

    // Delivery
    shipping_name?: string
    tracking_number?: string
    delivery_status?: string
    payout_status?: string
    brand_condition_confirmed?: boolean
    influencer_condition_confirmed?: boolean

    // Content Submission
    content_submission_url?: string
    content_submission_file_url?: string
    content_submission_status?: ContentSubmissionStatus
    content_submission_date?: string
    content_submission_version?: number

    content_submission_url_2?: string
    content_submission_file_url_2?: string
    content_submission_status_2?: ContentSubmissionStatus
    content_submission_date_2?: string
    content_submission_version_2?: number

    // Condition Fields
    condition_product_receipt_date?: string
    condition_plan_sharing_date?: string
    condition_draft_submission_date?: string
    condition_final_submission_date?: string
    condition_upload_date?: string
    condition_maintenance_period?: string
    condition_secondary_usage_period?: string

    // Creator Details (for brand view)
    tags?: string[]
    followers?: number
    campaign?: any // Related campaign data
}

export interface BrandProposal {
    id: string
    brand_id: string
    brandId?: string // camelCase alias
    influencer_id: string
    influencerId?: string // camelCase alias
    event_id?: string
    product_id?: string
    productId?: string // camelCase alias
    campaign_id?: string
    campaignId?: string // camelCase alias

    // Product/Campaign Info
    product_name?: string
    product_type?: string
    compensation_amount?: string
    has_incentive?: boolean
    incentive_detail?: string
    content_type?: string

    status: string
    message?: string
    cost?: number
    created_at: string
    updated_at: string

    // Names and Avatars (from joins)
    brand_name?: string
    brandName?: string // camelCase alias
    influencer_name?: string
    influencerAvatar?: string
    influencer_avatar?: string // snake_case duplicate for consistency
    brandAvatar?: string
    brand_avatar?: string // snake_case for consistency with MomentProposal

    type?: string

    // Contract
    contract_content?: string
    contract_status?: ContractStatus
    brand_signature?: string
    influencer_signature?: string
    brand_signed_at?: string
    influencer_signed_at?: string

    // Application Fields (New)
    motivation?: string
    content_plan?: string
    contentPlan?: string // camelCase alias
    portfolio_links?: string[]
    instagram_handle?: string
    insight_screenshot?: string

    // Delivery
    payout_status?: string
    delivery_status?: string
    brand_condition_confirmed?: boolean
    influencer_condition_confirmed?: boolean

    // Condition Fields
    condition_product_receipt_date?: string
    condition_plan_sharing_date?: string
    condition_draft_submission_date?: string
    condition_final_submission_date?: string
    condition_upload_date?: string
    condition_maintenance_period?: string
    condition_secondary_usage_period?: string

    // Content Submission
    content_submission_url?: string
    content_submission_file_url?: string
    content_submission_status?: ContentSubmissionStatus
    content_submission_date?: string
    content_submission_version?: number

    content_submission_url_2?: string
    content_submission_file_url_2?: string
    content_submission_status_2?: ContentSubmissionStatus
    content_submission_date_2?: string
    content_submission_version_2?: number

    completed_at?: string

    // Product Card
    product_url?: string
    product?: any
}

export interface MomentProposal {
    id: string
    brand_id: string
    influencer_id: string
    moment_id: string

    // Status
    status: ProposalStatus
    price_offer?: number
    message?: string

    // Timestamps
    created_at: string
    updated_at: string

    // Joins
    brand_name?: string
    brand_avatar?: string
    influencer_name?: string
    influencer_avatar?: string
    moment_title?: string

    // Conditions
    conditions?: any

    // Compatibility Fields (for UI merged views)
    event_id?: string
    // brand_avatar is already defined above in "Joins"
    product?: any
    product_name?: string
    completed_at?: string
}
