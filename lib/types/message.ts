// Message and Notification Types
export interface Message {
    id: string
    senderId: string
    receiverId: string
    proposalId?: string
    brandProposalId?: string
    content: string
    timestamp: string
    read: boolean
    senderName?: string
    senderAvatar?: string
    receiverName?: string
    receiverAvatar?: string
    influencer_avatar?: string
    isMock?: boolean
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
}
