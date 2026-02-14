"use client"

import React, { createContext, useContext, useState, useEffect, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Message, Notification, SubmissionFeedback } from "@/lib/types"

interface MessageContextType {
    messages: Message[]
    notifications: Notification[]
    submissionFeedback: SubmissionFeedback[]
    isLoading: boolean
    sendMessage: (receiverId: string, content: string, proposalId?: string, brandProposalId?: string) => Promise<void>
    sendNotification: (recipientId: string, type: string, content: string, referenceId?: string) => Promise<void>
    sendSubmissionFeedback: (proposalId: string | undefined, brandProposalId: string | undefined, content: string) => Promise<void>
    fetchSubmissionFeedback: (proposalId?: string, brandProposalId?: string) => Promise<SubmissionFeedback[]>
    markAsRead: (notificationId: string) => Promise<void>
    refreshMessages: (userId?: string) => Promise<void>
    refreshNotifications: (userId?: string) => Promise<void>
}

const MessageContext = createContext<MessageContextType | undefined>(undefined)

export function MessageProvider({ children, userId }: { children: React.ReactNode, userId?: string }) {
    const [supabase] = useState(() => createClient())
    const [messages, setMessages] = useState<Message[]>([])
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [submissionFeedback, setSubmissionFeedback] = useState<SubmissionFeedback[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const isFetchingMessages = useRef(false)
    const isFetchingNotifications = useRef(false)

    // Fetch messages
    const fetchMessages = async (targetUserId?: string) => {
        const id = targetUserId || userId
        if (!id || isFetchingMessages.current) return

        isFetchingMessages.current = true

        try {
            console.log('[MessageProvider] Fetching messages...')

            const { data, error } = await supabase
                .from('messages')
                .select(`
                    *,
                    sender:profiles!sender_id(id, display_name, avatar_url),
                    receiver:profiles!receiver_id(id, display_name, avatar_url)
                `)
                .or(`sender_id.eq.${id},receiver_id.eq.${id}`)
                .order('created_at', { ascending: true })

            if (error) {
                // Ignore AbortError (happens when component unmounts during fetch)
                if (error.name === 'AbortError' || error.message?.includes('aborted')) {
                    return
                }

                // Handle network errors gracefully
                if (error.message === 'Failed to fetch' || error.message === 'Load failed') {
                    // console.warn('[MessageProvider] Network error fetching messages (likely transient)')
                    return
                }

                console.error('[MessageProvider] Fetch error:', error.message)

                // Handle known error codes gracefully
                if (error.code === '42P01') {
                    console.warn('[MessageProvider] The "messages" table is missing')
                    return
                }
                if (error.code === '42501') {
                    console.warn('[MessageProvider] Permission denied for messages')
                    return
                }

                // For unexpected errors, log details
                console.error('[MessageProvider] Unexpected error:', { code: error.code, details: error.details })
                return
            }

            if (data) {
                const formatted: Message[] = data.map((msg: any) => ({
                    id: msg.id.toString(),
                    senderId: msg.sender_id,
                    receiverId: msg.receiver_id,
                    proposalId: msg.proposal_id,
                    brandProposalId: msg.brand_proposal_id,
                    content: msg.content,
                    timestamp: msg.created_at,
                    read: msg.is_read || false,
                    senderName: msg.sender?.display_name || 'User',
                    senderAvatar: msg.sender?.avatar_url,
                    receiverName: msg.receiver?.display_name || 'User',
                    receiverAvatar: msg.receiver?.avatar_url
                }))

                setMessages(formatted)
                console.log('[MessageProvider] Loaded messages:', formatted.length)
            }
        } catch (err) {
            console.error('[MessageProvider] Exception:', err)
        } finally {
            isFetchingMessages.current = false
        }
    }

    // Fetch notifications
    const fetchNotifications = async (targetUserId?: string) => {
        const id = targetUserId || userId
        if (!id || isFetchingNotifications.current) return

        isFetchingNotifications.current = true

        try {
            console.log('[MessageProvider] Fetching notifications...')

            const { data, error } = await supabase
                .from('notifications')
                .select('*')
                .eq('recipient_id', id)
                .order('created_at', { ascending: false })
                .limit(50)

            if (error) {
                // Ignore AbortError (happens when component unmounts during fetch)
                if (error.name === 'AbortError' || error.message?.includes('aborted')) {
                    return
                }

                // Handle network errors gracefully
                if (error.message === 'Failed to fetch' || error.message === 'Load failed') {
                    // console.warn('[MessageProvider] Network error fetching notifications (likely transient)')
                    return
                }

                console.error('[MessageProvider] Notifications error:', error.message)

                // Handle known error codes gracefully
                if (error.code === '42P01') {
                    console.warn('[MessageProvider] The "notifications" table is missing')
                    return
                }
                if (error.code === '42501') {
                    console.warn('[MessageProvider] Permission denied for notifications')
                    return
                }

                // For unexpected errors, log details
                console.error('[MessageProvider] Unexpected error:', { code: error.code, details: error.details })
                return
            }

            if (data) {
                setNotifications(data)
                console.log('[MessageProvider] Loaded notifications:', data.length)
            }
        } catch (err) {
            console.error('[MessageProvider] Exception:', err)
        } finally {
            isFetchingNotifications.current = false
        }
    }

    // Polling for new messages
    useEffect(() => {
        if (!userId) {
            setMessages([])
            setNotifications([])
            setSubmissionFeedback([])
            return
        }

        fetchMessages(userId)
        fetchNotifications(userId)

        const interval = setInterval(() => {
            fetchMessages(userId)
            fetchNotifications(userId)
        }, 10000) // Every 10 seconds

        return () => clearInterval(interval)
    }, [userId])

    // Send message
    const sendMessage = async (receiverId: string, content: string, proposalId?: string, brandProposalId?: string) => {
        if (!userId) {
            throw new Error('User ID required')
        }

        try {
            console.log('[MessageProvider] Sending message:', { receiverId, proposalId, brandProposalId })

            const { error } = await supabase
                .from('messages')
                .insert({
                    sender_id: userId,
                    receiver_id: receiverId,
                    proposal_id: proposalId,
                    brand_proposal_id: brandProposalId,
                    content,
                    is_read: false
                })

            if (error) {
                console.error('[MessageProvider] Send error:', error)
                throw error
            }

            await fetchMessages(userId)
            console.log('[MessageProvider] Message sent')
        } catch (error: any) {
            console.error('[MessageProvider] Send error:', error)
            throw error
        }
    }

    // Send notification
    const sendNotification = async (recipientId: string, type: string, content: string, referenceId?: string) => {
        try {
            console.log('[MessageProvider] Sending notification:', { recipientId, type, content })

            const { error } = await supabase
                .from('notifications')
                .insert({
                    recipient_id: recipientId,
                    sender_id: userId,
                    type,
                    content,
                    reference_id: referenceId,
                    is_read: false
                })

            if (error) {
                console.error('[MessageProvider] Notification error:', error)
                throw error
            }

            console.log('[MessageProvider] Notification sent')
        } catch (error: any) {
            console.error('[MessageProvider] Notification error:', error)
            throw error
        }
    }

    // Send submission feedback
    const sendSubmissionFeedback = async (proposalId: string | undefined, brandProposalId: string | undefined, content: string) => {
        if (!userId) {
            throw new Error('User ID required')
        }

        try {
            console.log('[MessageProvider] Sending feedback:', { proposalId, brandProposalId })

            const { error } = await supabase
                .from('submission_feedback')
                .insert({
                    proposal_id: proposalId,
                    brand_proposal_id: brandProposalId,
                    sender_id: userId,
                    content
                })

            if (error) {
                console.error('[MessageProvider] Feedback error:', error)
                throw error
            }

            console.log('[MessageProvider] Feedback sent')
        } catch (error: any) {
            console.error('[MessageProvider] Feedback error:', error)
            throw error
        }
    }

    // Fetch submission feedback
    const fetchSubmissionFeedback = async (proposalId?: string, brandProposalId?: string): Promise<SubmissionFeedback[]> => {
        try {
            console.log('[MessageProvider] Fetching feedback:', { proposalId, brandProposalId })

            let query = supabase
                .from('submission_feedback')
                .select(`
                    *,
                    sender:profiles!sender_id(display_name, avatar_url)
                `)
                .order('created_at', { ascending: true })

            if (!proposalId && !brandProposalId) {
                console.warn('[MessageProvider] Missing both proposalId and brandProposalId for feedback fetch')
                return []
            }

            if (proposalId) {
                query = query.eq('proposal_id', proposalId)
            } else if (brandProposalId) {
                query = query.eq('brand_proposal_id', brandProposalId)
            }

            const { data, error } = await query

            if (error) {
                // Ignore AbortError or network failure during unmount/reload
                if (error.code === undefined && (error.message === 'Failed to fetch' || error.message === 'Load failed')) {
                    console.warn('[MessageProvider] Network error fetching feedback (likely transient)')
                    return []
                }

                // Ignore empty error objects (often happens with aborted requests or specific Supabase edge cases)
                if (Object.keys(error).length === 0) {
                    return []
                }

                console.error('[MessageProvider] Feedback fetch error:', error)
                return []
            }

            if (data) {
                const feedback: SubmissionFeedback[] = data.map((f: any) => ({
                    id: f.id,
                    proposal_id: f.proposal_id,
                    brand_proposal_id: f.brand_proposal_id,
                    sender_id: f.sender_id,
                    content: f.content,
                    created_at: f.created_at,
                    sender_name: f.sender?.display_name,
                    sender_avatar: f.sender?.avatar_url
                }))

                setSubmissionFeedback(feedback)
                return feedback
            }

            return []
        } catch (err) {
            console.error('[MessageProvider] Exception:', err)
            return []
        }
    }

    // Mark notification as read
    const markAsRead = async (notificationId: string) => {
        try {
            const { error } = await supabase
                .from('notifications')
                .update({ is_read: true })
                .eq('id', notificationId)

            if (error) {
                console.error('[MessageProvider] Mark read error:', error)
                return
            }

            setNotifications(prev => prev.map(n =>
                n.id === notificationId ? { ...n, is_read: true } : n
            ))
        } catch (error: any) {
            console.error('[MessageProvider] Mark read error:', error)
        }
    }

    return (
        <MessageContext.Provider value={{
            messages,
            notifications,
            submissionFeedback,
            isLoading,
            sendMessage,
            sendNotification,
            sendSubmissionFeedback,
            fetchSubmissionFeedback,
            markAsRead,
            refreshMessages: fetchMessages,
            refreshNotifications: fetchNotifications
        }}>
            {children}
        </MessageContext.Provider>
    )
}

export function useMessages() {
    const context = useContext(MessageContext)
    if (!context) {
        throw new Error('useMessages must be used within MessageProvider')
    }
    return context
}
