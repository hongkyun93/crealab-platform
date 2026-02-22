// Message and Notification Types
export interface Message {
    id: string
    senderId: string
    receiverId: string
    proposalId?: string
    brandProposalId?: string
    workspaceId?: string // [Workspaces] Unified workspace UUID for message isolation
    content: string
    timestamp: string
    read: boolean
    senderName?: string
    senderAvatar?: string
    receiverName?: string
    receiverAvatar?: string
    influencer_avatar?: string
    isMock?: boolean
    // File attachment fields
    fileUrl?: string
    fileName?: string
    fileSize?: number
    fileType?: string
}

export interface Notification {
    id: string
    recipient_id: string
    sender_id?: string
    type: string
    content: string
    reference_id?: string
    is_read: boolean
    created_at: string
}

export interface SubmissionFeedback {
    id: string
    proposal_id?: string
    brand_proposal_id?: string
    sender_id: string
    content: string
    created_at: string
    sender_name?: string
    sender_avatar?: string
    video_timestamp_seconds?: number | null // bookmark: null = plain text, number = pinned to video timestamp
}
